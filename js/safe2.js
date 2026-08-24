    function refreshAdjustSizes(preferredSize) {
      const pid = parseInt(document.getElementById("adjProduct").value, 10);
      const p = getAllProducts().find(x => x.id === pid);
      const sizeSel = document.getElementById("adjSize");
      const sizes = p?.sizes?.length ? p.sizes : Object.keys(p?.stock || {});
      sizeSel.innerHTML = (sizes.length ? sizes : ["M"]).map(s =>
        `<option value="${s}" ${preferredSize === s ? "selected" : ""}>${s}</option>`
      ).join("");
      updateAdjustCurrent();
    }

    function updateAdjustCurrent() {
      const pid = parseInt(document.getElementById("adjProduct").value, 10);
      const size = document.getElementById("adjSize").value;
      const p = getAllProducts().find(x => x.id === pid);
      const qty = p?.stock?.[size] ?? 0;
      document.getElementById("adjCurrent").value = qty + " units";
    }

    window.quickAdjust = function(productId, size) {
      if (!requirePermission("inventory.adjust")) return;
      populateAdjustProducts(productId, size);
      document.getElementById("adjType").value = "receive";
      document.getElementById("adjQty").value = "1";
      document.getElementById("adjReason").value = "";
      document.getElementById("adjustModal").classList.add("open");
    };

    document.getElementById("openAdjustBtn").onclick = () => {
      if (!requirePermission("inventory.adjust")) return;
      populateAdjustProducts();
      document.getElementById("adjType").value = "receive";
      document.getElementById("adjQty").value = "1";
      document.getElementById("adjReason").value = "";
      document.getElementById("adjustModal").classList.add("open");
    };
    document.getElementById("closeAdjustModal").onclick =
    document.getElementById("cancelAdjustModal").onclick = () => {
      document.getElementById("adjustModal").classList.remove("open");
    };
    document.getElementById("adjProduct").onchange = () => refreshAdjustSizes();
    document.getElementById("adjSize").onchange = updateAdjustCurrent;

    document.getElementById("adjustForm").onsubmit = e => {
      e.preventDefault();
      if (!requirePermission("inventory.adjust")) return;
      const productId = parseInt(document.getElementById("adjProduct").value, 10);
      const size = document.getElementById("adjSize").value;
      const type = document.getElementById("adjType").value;
      const qty = parseInt(document.getElementById("adjQty").value, 10);
      const reason = document.getElementById("adjReason").value.trim();
      if (isNaN(qty) || qty < 0) { showToast("Enter a valid quantity"); return; }
      if (type !== "set" && qty < 1) { showToast("Quantity must be at least 1"); return; }

      const result = adjustStock(productId, size, type, qty, reason || undefined);
      if (!result.ok) { showToast(result.error || "Adjustment failed"); return; }

      logAudit("inventory.adjust", "product",
        `Stock ${type}: ${result.product.name} ${size} ${result.from}→${result.to}`,
        { productId, size, type, from: result.from, to: result.to }
      );
      showToast(`Stock updated: ${result.from} → ${result.to}`);
      document.getElementById("adjustModal").classList.remove("open");
      renderInventory();
      renderOverview();
    };

    document.getElementById("inventoryFilter").onchange = () => renderInventory();
    document.getElementById("inventorySearch").oninput = () => renderInventory();
    document.getElementById("clearMovementsBtn").onclick = () => {
      if (!requirePermission("inventory.adjust")) return;
      if (!confirm("Clear stock movement history?")) return;
      saveMovements([]);
      logAudit("inventory.clear_log", "product", "Cleared inventory movement log");
      renderInventory();
      showToast("Movement log cleared");
    };
    document.getElementById("runReorderScanBtn").onclick = () => {
      if (!requirePermission("inventory.adjust")) return;
      const added = scanAllReorderPoints();
      logAudit("inventory.reorder_scan", "product", `Reorder scan complete · ${added} new queue item(s)`, { added });
      showToast(added ? `Queued ${added} item(s) for reorder` : "Scan complete — queue is up to date");
      renderInventory();
    };
    document.getElementById("exportReorderBtn").onclick = () => {
      const queue = getReorderQueue().filter(x => x.status !== "completed");
      if (!queue.length) { showToast("Queue is empty"); return; }
      const headers = ["product", "barcode", "size", "on_hand", "reorder_point", "suggest_qty", "status"];
      const lines = [headers.join(",")].concat(queue.map(i =>
        [`"${(i.productName || "").replace(/"/g, '""')}"`, i.barcode || "", i.size, i.onHand, i.reorderPoint, i.suggestQty, i.status].join(",")
      ));
      const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bitc-reorder-list-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      logAudit("inventory.reorder_export", "product", `Exported ${queue.length} reorder line(s)`);
      showToast("Reorder list exported");
    };
    document.getElementById("clearReorderQueueBtn").onclick = () => {
      if (!requirePermission("inventory.adjust")) return;
      const before = getReorderQueue().length;
      const kept = getReorderQueue().filter(x => x.status !== "completed");
      saveReorderQueue(kept);
      const removed = before - kept.length;
      logAudit("inventory.reorder_clear", "product", `Cleared ${removed} completed reorder item(s)`);
      showToast(removed ? `Removed ${removed} completed item(s)` : "No completed items to clear");
      renderInventory();
    };

    function restoreOrderStock(order) {
      if (!order?.items?.length || order._stockRestored) return;
      order.items.forEach(item => {
        if (item.id != null && item.size) {
          adjustStock(item.id, item.size, "cancel", item.qty || 1, "Order cancelled — stock restored", {
            orderId: order.id
          });
        }
      });
      order._stockRestored = true;
    }

    const viewTitles = {
      overview: "Overview",
      orders: "Orders",
      products: "Products",
      inventory: "Inventory",
      customers: "Customers",
      audit: "Audit Log",
      settings: "Settings"
    };

    const VIEW_PERMS = {
      overview: "overview",
      orders: "orders.view",
      products: "products.view",
      inventory: "inventory.view",
      customers: "customers.view",
      audit: "audit.view",
      settings: "settings.view"
    };

    function switchView(name) {
      const needed = VIEW_PERMS[name];
      if (needed && !hasPermission(needed)) {
        showToast("You don’t have access to this section");
        logAudit("auth.denied", "auth", `Denied access to view "${name}"`, { view: name });
        return;
      }
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      document.querySelectorAll(".admin-nav a").forEach(a => a.classList.remove("active"));
      const view = document.getElementById("view-" + name);
      if (view) view.classList.add("active");
      const link = document.querySelector(`.admin-nav a[data-view="${name}"]`);
      if (link) link.classList.add("active");
      document.getElementById("pageTitle").textContent = viewTitles[name] || name;
      closeSidebar();
      if (name === "overview") renderOverview();
      if (name === "orders") renderOrders();
      if (name === "products") renderProducts();
      if (name === "inventory") renderInventory();
      if (name === "customers") renderCustomers();
      if (name === "audit") renderAuditLog();
      applyPermissions();
    }

    document.querySelectorAll(".admin-nav a[data-view]").forEach(a => {
      a.onclick = e => { e.preventDefault(); switchView(a.dataset.view); };
    });
    document.querySelectorAll("[data-goto]").forEach(btn => {
      btn.onclick = () => switchView(btn.dataset.goto);
    });

    function openSidebar() {
      document.getElementById("adminSidebar").classList.add("open");
      document.getElementById("sidebarOverlay").classList.add("open");
    }
    function closeSidebar() {
      document.getElementById("adminSidebar").classList.remove("open");
      document.getElementById("sidebarOverlay").classList.remove("open");
    }
    document.getElementById("openSidebar").onclick = openSidebar;
    document.getElementById("sidebarOverlay").onclick = closeSidebar;

    function renderOverview() {
      const orders = getOrders();
      const products = getAllProducts();
      const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
      const processing = orders.filter(o => o.status === "Processing").length;
      const customers = new Set(orders.map(o => o.customer?.email).filter(Boolean)).size;

      document.getElementById("statsGrid").innerHTML = `
        <div class="stat-card accent">
          <div class="label">Revenue</div>
          <div class="value">${formatPrice(revenue)}</div>
          <div class="sub">${orders.length} order${orders.length !== 1 ? "s" : ""}</div>
        </div>
        <div class="stat-card">
          <div class="label">Orders</div>
          <div class="value">${orders.length}</div>
          <div class="sub">${processing} processing</div>
        </div>
        <div class="stat-card">
          <div class="label">Products</div>
          <div class="value">${products.length}</div>
          <div class="sub">${products.filter(p => p.isNew).length} new</div>
        </div>
        <div class="stat-card">
          <div class="label">Customers</div>
          <div class="value">${customers}</div>
          <div class="sub">unique emails</div>
        </div>
      `;

      const recent = orders.slice(0, 5);
      const recentBody = document.getElementById("recentOrdersBody");
      if (recent.length === 0) {
        recentBody.innerHTML = `<tr><td colspan="5" class="empty-admin">No orders yet</td></tr>`;
      } else {
        recentBody.innerHTML = recent.map(o => `
          <tr>
            <td style="font-weight:500">${o.id}</td>
            <td>${o.customer?.name || "—"}</td>
            <td>${new Date(o.date).toLocaleDateString("en-NG", { dateStyle: "medium" })}</td>
            <td style="font-weight:600;color:var(--blush-600)">${formatPrice(o.total)}</td>
            <td><span class="status-pill status-${o.status}">${o.status}</span></td>
          </tr>
        `).join("");
      }

      const top = products.filter(p => p.isBestseller || p.isNew).slice(0, 5);
      document.getElementById("topProductsBody").innerHTML = top.map(p => {
        const stock = p.stock ? Object.values(p.stock).reduce((a, b) => a + b, 0) : "—";
        return `
          <tr>
            <td style="font-weight:500">${p.name}</td>
            <td style="text-transform:capitalize">${p.category}</td>
            <td>${formatPrice(p.price)}</td>
            <td>${stock}</td>
            <td>
              ${p.isNew ? '<span class="badge badge-new" style="margin-right:0.25rem">New</span>' : ""}
              ${p.isBestseller ? '<span class="badge badge-soft">Bestseller</span>' : ""}
            </td>
          </tr>
        `;
      }).join("") || `<tr><td colspan="5" class="empty-admin">No products</td></tr>`;

      const badge = document.getElementById("ordersBadge");
      if (processing > 0) {
        badge.textContent = processing;
        badge.style.display = "";
      } else badge.style.display = "none";
    }

    let selectedOrderIds = new Set();

    function updateBulkBar() {
      const bar = document.getElementById("bulkBar");
      const count = selectedOrderIds.size;
      if (count > 0) {
        bar.style.display = "flex";
        document.getElementById("bulkCount").textContent =
          count + " selected";
      } else {
        bar.style.display = "none";
        document.getElementById("bulkStatusSelect").value = "";
      }
      const checkboxes = document.querySelectorAll(".order-check");
      const selectAll = document.getElementById("selectAllOrders");
      if (selectAll && checkboxes.length) {
        const checkedCount = document.querySelectorAll(".order-check:checked").length;
        selectAll.checked = checkedCount === checkboxes.length && checkboxes.length > 0;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
      }
    }

    function renderOrders() {
      const filter = document.getElementById("orderStatusFilter").value;
      let orders = getOrders();
      if (filter) orders = orders.filter(o => o.status === filter);

      const body = document.getElementById("ordersBody");
      const empty = document.getElementById("ordersEmpty");

      const visibleIds = new Set(orders.map(o => o.id));
      selectedOrderIds.forEach(id => {
        if (!visibleIds.has(id)) selectedOrderIds.delete(id);
      });

      if (orders.length === 0) {
        body.innerHTML = "";
        empty.classList.remove("hidden");
        document.getElementById("selectAllOrders").checked = false;
        document.getElementById("selectAllOrders").indeterminate = false;
        updateBulkBar();
        return;
      }
      empty.classList.add("hidden");

      body.innerHTML = orders.map(o => `
        <tr class="${selectedOrderIds.has(o.id) ? "selected-row" : ""}">
          <td>
            <input type="checkbox" class="order-check" data-order-id="${o.id}"
              ${selectedOrderIds.has(o.id) ? "checked" : ""}
              style="accent-color:var(--blush-500);cursor:pointer" />
          </td>
          <td style="font-weight:500;white-space:nowrap">${o.id}</td>
          <td>
            <div style="font-weight:500">${o.customer?.name || "—"}</div>
            <div style="font-size:0.7rem;color:#9CA3AF">${o.customer?.phone || ""}</div>
          </td>
          <td style="max-width:10rem">
            <div style="font-size:0.75rem;color:#4B5563">${(o.items || []).map(i => `${i.name} ×${i.qty}`).join(", ").slice(0, 60)}${(o.items || []).length > 2 ? "…" : ""}</div>
          </td>
          <td style="font-size:0.75rem">${o.delivery?.state || "—"}<br/><span style="color:#9CA3AF">${o.delivery?.city || ""}</span></td>
          <td style="font-weight:600;color:var(--blush-600);white-space:nowrap">${formatPrice(o.total)}</td>
          <td>
            <select class="sort-select status-select" data-order-id="${o.id}" style="font-size:0.75rem;padding:0.25rem 0.4rem">
              ${["Processing","Shipped","Delivered","Cancelled"].map(s =>
                `<option value="${s}" ${o.status === s ? "selected" : ""}>${s}</option>`
              ).join("")}
            </select>
          </td>
          <td>
            <div class="action-btns">
              <button class="btn-icon" onclick="viewOrder('${o.id}')">View</button>
            </div>
          </td>
        </tr>
      `).join("");

      document.querySelectorAll(".status-select").forEach(sel => {
        sel.disabled = !hasPermission("orders.edit");
        sel.onchange = () => {
          if (!requirePermission("orders.edit")) {
            renderOrders();
            return;
          }
          updateOrderStatus(sel.dataset.orderId, sel.value);
          showToast("Order status updated");
          renderOrders();
          renderOverview();
        };
      });

      document.querySelectorAll(".order-check").forEach(cb => {
        cb.onchange = () => {
          const id = cb.dataset.orderId;
          if (cb.checked) selectedOrderIds.add(id);
          else selectedOrderIds.delete(id);
          updateBulkBar();
          cb.closest("tr").classList.toggle("selected-row", cb.checked);
        };
      });

      updateBulkBar();
    }
