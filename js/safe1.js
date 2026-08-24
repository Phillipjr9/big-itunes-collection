    function scanAllReorderPoints() {
      const products = getAllProducts();
      let added = 0;
      products.forEach(p => {
        const sizes = p.sizes?.length ? p.sizes : Object.keys(p.stock || {});
        sizes.forEach(size => {
          const qty = Number(p.stock?.[size] || 0);
          if (ensureReorderQueueItem(p, size, qty)) added++;
          else resolveReorderIfRecovered(p, size, qty);
        });
      });
      return added;
    }
    function getMovements() {
      try { return JSON.parse(localStorage.getItem(INVENTORY_KEY) || "[]"); }
      catch { return []; }
    }
    function saveMovements(list) {
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(list.slice(0, 500)));
    }
    function logMovement(entry) {
      const list = getMovements();
      list.unshift({
        id: "MOV-" + Date.now().toString(36).toUpperCase(),
        at: new Date().toISOString(),
        ...entry
      });
      saveMovements(list);
    }

    function totalStock(p) {
      if (!p?.stock) return 0;
      return Object.values(p.stock).reduce((a, b) => a + (Number(b) || 0), 0);
    }

    function stockStatus(qty) {
      const thr = getLowStockThreshold();
      if (qty <= 0) return "out";
      if (qty <= thr) return "low";
      return "ok";
    }

    function adjustStock(productId, size, type, qty, reason, meta = {}) {
      const products = getAllProducts();
      const p = products.find(x => x.id === productId);
      if (!p) return { ok: false, error: "Product not found" };
      if (!p.stock) p.stock = {};
      if (!p.sizes) p.sizes = [];
      if (!p.sizes.includes(size)) p.sizes.push(size);

      const current = Number(p.stock[size] || 0);
      let next = current;
      const n = Math.abs(Number(qty) || 0);

      if (type === "receive" || type === "cancel") next = current + n;
      else if (type === "remove" || type === "sale") next = Math.max(0, current - n);
      else if (type === "set") next = n;
      else return { ok: false, error: "Invalid type" };

      const delta = next - current;
      p.stock[size] = next;
      saveCustomProduct(p);

      ensureReorderQueueItem(p, size, next);
      resolveReorderIfRecovered(p, size, next);

      const user = currentUser();
      logMovement({
        productId: p.id,
        productName: p.name,
        size,
        from: current,
        to: next,
        delta,
        type,
        reason: reason || type,
        by: user ? user.email : "system",
        byName: user ? user.name : "System",
        role: user ? user.role : null,
        meta
      });

      return { ok: true, from: current, to: next, delta, product: p };
    }

    function renderInventory() {
      scanAllReorderPoints();

      const thr = getLowStockThreshold();
      const products = getAllProducts();
      const rows = [];
      products.forEach(p => {
        const sizes = p.sizes?.length ? p.sizes : Object.keys(p.stock || {});
        sizes.forEach(size => {
          const qty = Number(p.stock?.[size] || 0);
          const rp = getReorderPoint(p, size);
          const suggest = getReorderQty(p, size);
          const needsReorder = qty <= rp;
          rows.push({
            product: p, size, qty, status: stockStatus(qty),
            reorderPoint: rp, suggestQty: suggest, needsReorder
          });
        });
      });

      const outCount = rows.filter(r => r.status === "out").length;
      const lowCount = rows.filter(r => r.status === "low").length;
      const okCount = rows.filter(r => r.status === "ok").length;
      const reorderCount = rows.filter(r => r.needsReorder).length;
      const units = rows.reduce((s, r) => s + r.qty, 0);
      const pendingReorder = getReorderQueue().filter(x => x.status === "pending" || x.status === "ordered").length;

      document.getElementById("inventoryStats").innerHTML = `
        <div class="stat-card accent">
          <div class="label">Units on hand</div>
          <div class="value">${units}</div>
          <div class="sub">${rows.length} size variants</div>
        </div>
        <div class="stat-card">
          <div class="label">Needs reorder</div>
          <div class="value" style="color:#B45309">${reorderCount}</div>
          <div class="sub">${pendingReorder} in queue</div>
        </div>
        <div class="stat-card">
          <div class="label">Low stock</div>
          <div class="value" style="color:#B45309">${lowCount}</div>
          <div class="sub">≤ ${thr} units</div>
        </div>
        <div class="stat-card">
          <div class="label">Out of stock</div>
          <div class="value" style="color:#B91C1C">${outCount}</div>
          <div class="sub">${okCount} healthy sizes</div>
        </div>
      `;

      const badge = document.getElementById("lowStockBadge");
      const alertCount = Math.max(lowCount + outCount, pendingReorder);
      if (alertCount > 0) {
        badge.textContent = alertCount;
        badge.style.display = "";
      } else badge.style.display = "none";

      const filter = document.getElementById("inventoryFilter").value;
      const q = (document.getElementById("inventorySearch").value || "").toLowerCase().trim();
      let filtered = rows;
      if (filter === "reorder") filtered = filtered.filter(r => r.needsReorder);
      else if (filter) filtered = filtered.filter(r => r.status === filter);
      if (q) {
        filtered = filtered.filter(r =>
          r.product.name.toLowerCase().includes(q) ||
          r.size.toLowerCase().includes(q) ||
          (r.product.barcode || "").toLowerCase().includes(q)
        );
      }

      const body = document.getElementById("inventoryBody");
      const empty = document.getElementById("inventoryEmpty");
      if (!filtered.length) {
        body.innerHTML = "";
        empty.classList.remove("hidden");
      } else {
        empty.classList.add("hidden");
        body.innerHTML = filtered.map(r => {
          let statusLabel = r.status === "out" ? "Out of stock" : r.status === "low" ? "Low stock" : "In stock";
          let pillClass = r.status === "out" ? "status-Cancelled" : r.status === "low" ? "status-Processing" : "status-Delivered";
          if (r.needsReorder) {
            statusLabel = r.status === "out" ? "Out · reorder" : "Reorder";
            pillClass = "status-Processing";
          }
          return `
            <tr>
              <td style="font-weight:500">${r.product.name}
                ${r.product.barcode ? `<div style="font-size:0.7rem;color:#9CA3AF;font-weight:400">${r.product.barcode}</div>` : ""}
              </td>
              <td>${r.size}</td>
              <td style="font-weight:600">${r.qty}</td>
              <td>${r.reorderPoint}</td>
              <td>${r.suggestQty}</td>
              <td><span class="status-pill ${pillClass}">${statusLabel}</span></td>
              <td>
                <div class="action-btns">
                  ${hasPermission("inventory.adjust")
                    ? `<button class="btn-icon" onclick="quickAdjust(${r.product.id}, '${r.size}')">Adjust</button>`
                    : ""}
                  ${hasPermission("inventory.adjust") && r.needsReorder
                    ? `<button class="btn-icon" onclick="addToReorderQueue(${r.product.id}, '${r.size}')">Queue</button>`
                    : ""}
                  ${!hasPermission("inventory.adjust")
                    ? `<span style="font-size:0.7rem;color:#9CA3AF">View only</span>` : ""}
                </div>
              </td>
            </tr>
          `;
        }).join("");
      }

      const queue = getReorderQueue().filter(x => x.status !== "completed");
      document.getElementById("reorderQueueCount").textContent = `(${queue.length})`;
      const qBody = document.getElementById("reorderQueueBody");
      const qEmpty = document.getElementById("reorderQueueEmpty");
      if (!queue.length) {
        qBody.innerHTML = "";
        qEmpty.classList.remove("hidden");
      } else {
        qEmpty.classList.add("hidden");
        qBody.innerHTML = queue.map(item => {
          const statusPill = item.status === "ordered"
            ? '<span class="status-pill status-Shipped">Ordered</span>'
            : '<span class="status-pill status-Processing">Pending</span>';
          return `
            <tr>
              <td style="font-weight:500">${item.productName}
                ${item.barcode ? `<div style="font-size:0.7rem;color:#9CA3AF">${item.barcode}</div>` : ""}
              </td>
              <td>${item.size}</td>
              <td style="font-weight:600">${item.onHand}</td>
              <td>${item.reorderPoint}</td>
              <td style="font-weight:600;color:var(--blush-600)">${item.suggestQty}</td>
              <td>${statusPill}</td>
              <td>
                <div class="action-btns">
                  ${hasPermission("inventory.adjust") && item.status === "pending"
                    ? `<button class="btn-icon" onclick="markReorderOrdered('${item.key}')">Mark ordered</button>` : ""}
                  ${hasPermission("inventory.adjust")
                    ? `<button class="btn-icon" onclick="markReorderDone('${item.key}')">Done</button>` : ""}
                  ${hasPermission("inventory.adjust")
                    ? `<button class="btn-icon danger" onclick="dismissReorder('${item.key}')">Dismiss</button>` : ""}
                </div>
              </td>
            </tr>
          `;
        }).join("");
      }

      const moves = getMovements().slice(0, 50);
      const mBody = document.getElementById("movementsBody");
      const mEmpty = document.getElementById("movementsEmpty");
      if (!moves.length) {
        mBody.innerHTML = "";
        mEmpty.classList.remove("hidden");
      } else {
        mEmpty.classList.add("hidden");
        mBody.innerHTML = moves.map(m => `
          <tr>
            <td style="font-size:0.75rem;color:#6B7280;white-space:nowrap">${new Date(m.at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</td>
            <td style="font-weight:500">${m.productName || "—"}</td>
            <td>${m.size || "—"}</td>
            <td style="font-weight:600;color:${m.delta >= 0 ? "#065F46" : "#B91C1C"}">${m.delta >= 0 ? "+" : ""}${m.delta} <span style="font-weight:400;color:#9CA3AF;font-size:0.7rem">(${m.from}→${m.to})</span></td>
            <td style="font-size:0.8rem">${m.reason || m.type}</td>
            <td style="font-size:0.75rem">${m.byName || m.by || "—"}</td>
          </tr>
        `).join("");
      }

      const canAdj = hasPermission("inventory.adjust");
      const adjBtn = document.getElementById("openAdjustBtn");
      if (adjBtn) adjBtn.style.display = canAdj ? "" : "none";
      const clearMov = document.getElementById("clearMovementsBtn");
      if (clearMov) clearMov.style.display = canAdj ? "" : "none";
      const scanBtn = document.getElementById("runReorderScanBtn");
      if (scanBtn) scanBtn.style.display = canAdj ? "" : "none";
    }

    window.addToReorderQueue = function(productId, size) {
      if (!requirePermission("inventory.adjust")) return;
      const p = getAllProducts().find(x => x.id === productId);
      if (!p) return;
      const qty = Number(p.stock?.[size] || 0);
      ensureReorderQueueItem(p, size, qty);
      const list = getReorderQueue();
      const key = queueKey(productId, size);
      if (!list.find(x => x.key === key && x.status !== "completed")) {
        list.unshift({
          key, productId, productName: p.name, barcode: p.barcode || "", size,
          onHand: qty, reorderPoint: getReorderPoint(p, size),
          suggestQty: getReorderQty(p, size), status: "pending",
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        });
        saveReorderQueue(list);
      }
      logAudit("inventory.reorder_queue", "product", `Queued reorder: ${p.name} ${size}`, { productId, size });
      showToast("Added to reorder queue");
      renderInventory();
    };

    window.markReorderOrdered = function(key) {
      if (!requirePermission("inventory.adjust")) return;
      const list = getReorderQueue();
      const item = list.find(x => x.key === key);
      if (!item) return;
      item.status = "ordered";
      item.updatedAt = new Date().toISOString();
      saveReorderQueue(list);
      logAudit("inventory.reorder_ordered", "product", `Marked ordered: ${item.productName} ${item.size}`, { key });
      showToast("Marked as ordered from supplier");
      renderInventory();
    };

    window.markReorderDone = function(key) {
      if (!requirePermission("inventory.adjust")) return;
      const list = getReorderQueue();
      const item = list.find(x => x.key === key);
      if (!item) return;
      if (confirm(`Mark ${item.productName} (${item.size}) complete?\nOptionally receive ${item.suggestQty} units into stock.`)) {
        const receive = confirm(`Receive ${item.suggestQty} units into stock now?`);
        if (receive) {
          adjustStock(item.productId, item.size, "receive", item.suggestQty, "Supplier reorder received", { reorderKey: key });
        }
        item.status = "completed";
        item.updatedAt = new Date().toISOString();
        saveReorderQueue(list);
        logAudit("inventory.reorder_done", "product", `Completed reorder: ${item.productName} ${item.size}`, { key, received: receive });
        showToast("Reorder completed");
        renderInventory();
      }
    };

    window.dismissReorder = function(key) {
      if (!requirePermission("inventory.adjust")) return;
      const list = getReorderQueue().filter(x => x.key !== key);
      saveReorderQueue(list);
      logAudit("inventory.reorder_dismiss", "product", `Dismissed reorder item ${key}`, { key });
      showToast("Removed from queue");
      renderInventory();
    };

    function populateAdjustProducts(selectedId, selectedSize) {
      const sel = document.getElementById("adjProduct");
      const products = getAllProducts();
      sel.innerHTML = products.map(p =>
        `<option value="${p.id}" ${selectedId === p.id ? "selected" : ""}>${p.name}</option>`
      ).join("");
      refreshAdjustSizes(selectedSize);
    }
