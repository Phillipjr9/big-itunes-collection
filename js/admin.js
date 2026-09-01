/* Admin dashboard — login, orders, products/inventory, settings */
(function () {
  const SESSION_KEY = "bitc_admin_session";
  const LOW_STOCK_KEY = "bitc_low_stock_threshold";

  const DEMO_USERS = [
    { email: "admin@bigitunescollection.com", password: "admin123", name: "Store Admin", role: "admin" },
    { email: "manager@bigitunescollection.com", password: "manager123", name: "Fashion Manager", role: "manager" },
    { email: "staff@bigitunescollection.com", password: "staff123", name: "Support Staff", role: "viewer" }
  ];

  const ROLE_LABEL = { admin: "Admin", manager: "Manager", viewer: "Viewer" };
  // viewer role can look but not edit orders/settings
  function canEdit(role) { return role === "admin" || role === "manager"; }

  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); }
    catch { return null; }
  }
  function setSession(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, name: user.name, role: user.role }));
  }
  function clearSession() { sessionStorage.removeItem(SESSION_KEY); }

  function getLowStockThreshold() {
    const v = parseInt(localStorage.getItem(LOW_STOCK_KEY) || "5", 10);
    return isNaN(v) || v < 0 ? 5 : v;
  }
  function setLowStockThreshold(n) {
    localStorage.setItem(LOW_STOCK_KEY, String(Math.max(0, parseInt(n, 10) || 5)));
  }

  function totalStock(p) {
    if (!p || !p.stock) return 0;
    return Object.values(p.stock).reduce((a, b) => a + (Number(b) || 0), 0);
  }

  function showDashboard() {
    const user = getSession();
    if (!user) return;
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    document.getElementById("adminNameLabel").textContent = user.name;
    document.getElementById("adminRoleBadge").textContent = ROLE_LABEL[user.role] || user.role;
    document.querySelectorAll("[data-edit-only]").forEach(el => {
      el.style.display = canEdit(user.role) ? "" : "none";
    });
    renderOverview();
    renderOrders();
    renderProducts();
    renderSettings();
  }

  function logout() {
    clearSession();
    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("loginScreen").classList.remove("hidden");
    document.getElementById("loginForm").reset();
  }

  function renderOverview() {
    const orders = getOrders();
    const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const processing = orders.filter(o => o.status === "Processing").length;
    const lowStockCount = PRODUCTS.filter(p => totalStock(p) <= getLowStockThreshold()).length;

    document.getElementById("statsGrid").innerHTML = `
      <div class="stat-card accent">
        <div class="label">Total Orders</div>
        <div class="value">${orders.length}</div>
      </div>
      <div class="stat-card">
        <div class="label">Revenue</div>
        <div class="value">${formatPrice(revenue)}</div>
      </div>
      <div class="stat-card">
        <div class="label">Processing</div>
        <div class="value">${processing}</div>
      </div>
      <div class="stat-card">
        <div class="label">Low / Out of Stock</div>
        <div class="value" style="color:#B45309">${lowStockCount}</div>
      </div>
    `;
  }

  function renderOrders() {
    const filter = document.getElementById("orderStatusFilter").value;
    let orders = getOrders();
    if (filter) orders = orders.filter(o => o.status === filter);

    const body = document.getElementById("ordersBody");
    const empty = document.getElementById("ordersEmpty");
    if (!orders.length) {
      body.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");
    const editable = canEdit(getSession()?.role);

    body.innerHTML = orders.map(o => `
      <tr>
        <td style="font-weight:600">${o.id}</td>
        <td style="font-size:0.8rem;color:#6B7280">${new Date(o.date).toLocaleDateString("en-NG", { dateStyle: "medium" })}</td>
        <td style="font-size:0.8rem">${o.customer?.name || "—"}</td>
        <td style="font-weight:600;color:var(--blush-600)">${formatPrice(o.total)}</td>
        <td>
          <select class="form-select status-select" data-order="${o.id}" ${editable ? "" : "disabled"} style="padding:0.35rem 0.5rem;font-size:0.8rem">
            ${["Processing", "Shipped", "Delivered", "Cancelled"].map(s => `<option value="${s}" ${o.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </td>
      </tr>
    `).join("");

    body.querySelectorAll(".status-select").forEach(sel => {
      sel.onchange = () => {
        const orders = getOrders();
        const order = orders.find(x => x.id === sel.dataset.order);
        if (!order) return;
        order.status = sel.value;
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({ status: sel.value, at: new Date().toISOString(), by: getSession()?.name || "Admin" });
        saveOrders(orders);
        showToast(`Order ${order.id} marked ${sel.value}`);
        renderOverview();
      };
    });
  }

  function renderProducts() {
    const q = (document.getElementById("productSearch").value || "").toLowerCase().trim();
    let list = PRODUCTS.slice();
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));

    const body = document.getElementById("productsBody");
    const empty = document.getElementById("productsEmpty");
    if (!list.length) {
      body.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");
    const thr = getLowStockThreshold();

    body.innerHTML = list.map(p => {
      const stock = totalStock(p);
      const status = stock <= 0 ? "Out of stock" : stock <= thr ? "Low stock" : "In stock";
      const pillClass = stock <= 0 ? "status-Cancelled" : stock <= thr ? "status-Processing" : "status-Delivered";
      return `
        <tr>
          <td style="font-weight:500">${p.name}<div style="font-size:0.7rem;color:#9CA3AF">${p.category}</div></td>
          <td>${formatPrice(p.price)}</td>
          <td style="font-weight:600">${stock}</td>
          <td><span class="status-pill ${pillClass}">${status}</span></td>
        </tr>
      `;
    }).join("");
  }

  function renderSettings() {
    document.getElementById("settingLowStock").value = getLowStockThreshold();
    const editable = canEdit(getSession()?.role);
    document.getElementById("settingLowStock").disabled = !editable;
    document.getElementById("saveSettingsBtn").style.display = editable ? "" : "none";
  }

  function switchView(name) {
    document.querySelectorAll(".admin-view").forEach(v => v.classList.add("hidden"));
    document.getElementById("view-" + name).classList.remove("hidden");
    document.querySelectorAll(".admin-nav a").forEach(a => a.classList.toggle("active", a.dataset.view === name));
    document.getElementById("pageTitle").textContent = ({
      overview: "Overview", orders: "Orders", products: "Products & Inventory", settings: "Settings"
    })[name] || name;
    closeSidebar();
  }

  function openSidebar() {
    document.getElementById("adminSidebar").classList.add("open");
    document.getElementById("sidebarOverlay").classList.add("open");
  }
  function closeSidebar() {
    document.getElementById("adminSidebar").classList.remove("open");
    document.getElementById("sidebarOverlay").classList.remove("open");
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginForm").onsubmit = e => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim().toLowerCase();
      const pass = document.getElementById("loginPassword").value;
      const user = DEMO_USERS.find(u => u.email === email && u.password === pass);
      if (!user) {
        showToast("Invalid credentials");
        return;
      }
      setSession(user);
      showDashboard();
    };

    document.getElementById("logoutBtn").onclick = logout;
    document.querySelectorAll(".admin-nav a[data-view]").forEach(a => {
      a.onclick = e => { e.preventDefault(); switchView(a.dataset.view); };
    });
    document.getElementById("openSidebarBtn").onclick = openSidebar;
    document.getElementById("sidebarOverlay").onclick = closeSidebar;

    document.getElementById("orderStatusFilter").onchange = renderOrders;
    document.getElementById("productSearch").oninput = renderProducts;

    document.getElementById("saveSettingsBtn").onclick = () => {
      setLowStockThreshold(document.getElementById("settingLowStock").value);
      renderOverview();
      renderProducts();
      showToast("Settings saved");
    };

    if (getSession()) showDashboard();
  });
})();
