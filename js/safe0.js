const ADMIN_KEY = "bitc_admin_session";
    const CUSTOM_PRODUCTS_KEY = "bitc_custom_products";
    const AUDIT_KEY = "bitc_audit_log";
    const AUDIT_MAX = 500;

    // ---------- Roles & permissions ----------
    const PERMISSIONS = {
      overview: "View overview",
      "orders.view": "View orders",
      "orders.edit": "Update order status",
      "orders.bulk": "Bulk update orders",
      "orders.clear": "Clear all orders",
      "products.view": "View products",
      "products.edit": "Create / edit products",
      "products.delete": "Delete products",
      "inventory.view": "View inventory",
      "inventory.adjust": "Adjust stock",
      "customers.view": "View customers",
      "audit.view": "View audit log",
      "audit.manage": "Export / clear audit log",
      "settings.view": "View settings",
      "settings.edit": "Edit settings"
    };

    const ROLE_PERMISSIONS = {
      admin: Object.keys(PERMISSIONS),
      manager: [
        "overview", "orders.view", "orders.edit", "orders.bulk",
        "products.view", "products.edit", "products.delete",
        "inventory.view", "inventory.adjust",
        "customers.view", "audit.view", "settings.view"
      ],
      staff: [
        "overview", "orders.view", "orders.edit",
        "products.view", "products.edit",
        "inventory.view", "inventory.adjust",
        "customers.view"
      ],
      viewer: [
        "overview", "orders.view", "products.view", "inventory.view", "customers.view"
      ]
    };

    const DEMO_USERS = [
      { email: "admin@bigitunescollection.com", password: "admin123", name: "Store Admin", role: "admin" },
      { email: "manager@bigitunescollection.com", password: "manager123", name: "Fashion Manager", role: "manager" },
      { email: "staff@bigitunescollection.com", password: "staff123", name: "Support Staff", role: "staff" },
      { email: "viewer@bigitunescollection.com", password: "viewer123", name: "Read-only Viewer", role: "viewer" }
    ];

    function roleLabel(role) {
      return ({ admin: "Admin", manager: "Manager", staff: "Staff", viewer: "Viewer" })[role] || role;
    }

    function getSession() {
      try { return JSON.parse(sessionStorage.getItem(ADMIN_KEY) || "null"); }
      catch { return null; }
    }
    function setSession(user) {
      sessionStorage.setItem(ADMIN_KEY, JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role
      }));
    }
    function clearSession() {
      sessionStorage.removeItem(ADMIN_KEY);
    }
    function currentUser() {
      return getSession();
    }
    function hasPermission(perm) {
      const user = currentUser();
      if (!user) return false;
      const perms = ROLE_PERMISSIONS[user.role] || [];
      return perms.includes(perm);
    }
    function requirePermission(perm) {
      if (!hasPermission(perm)) {
        showToast("You don’t have permission for this action");
        logAudit("auth.denied", "auth", `Denied action requiring "${perm}"`, { permission: perm });
        return false;
      }
      return true;
    }

    // ---------- Audit log ----------
    function getAuditLog() {
      try { return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]"); }
      catch { return []; }
    }
    function saveAuditLog(list) {
      localStorage.setItem(AUDIT_KEY, JSON.stringify(list.slice(0, AUDIT_MAX)));
    }
    function logAudit(action, category, details, meta = {}) {
      const user = currentUser();
      const entry = {
        id: "AUD-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(),
        at: new Date().toISOString(),
        action,
        category,
        actor: user ? user.email : "anonymous",
        actorName: user ? user.name : null,
        role: user ? user.role : null,
        details,
        meta
      };
      const list = getAuditLog();
      list.unshift(entry);
      saveAuditLog(list);
      return entry;
    }

    // ---------- Auth ----------
    function isLoggedIn() {
      return !!getSession();
    }
    function login(user) {
      setSession(user);
      logAudit("login", "auth", `${user.name} (${roleLabel(user.role)}) signed in`);
      showDashboard();
    }
    function logout() {
      logAudit("logout", "auth", "User signed out");
      clearSession();
      document.getElementById("dashboard").style.display = "none";
      document.getElementById("loginScreen").style.display = "flex";
    }

    document.getElementById("loginForm").onsubmit = e => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim().toLowerCase();
      const pass = document.getElementById("loginPassword").value;
      const user = DEMO_USERS.find(u => u.email === email && u.password === pass);
      if (user) {
        login(user);
      } else {
        const entry = {
          id: "AUD-" + Date.now().toString(36).toUpperCase(),
          at: new Date().toISOString(),
          action: "login.failed",
          category: "auth",
          actor: email || "unknown",
          role: null,
          details: "Failed login attempt for " + email,
          meta: {}
        };
        const list = getAuditLog();
        list.unshift(entry);
        saveAuditLog(list);
        showToast("Invalid credentials");
      }
    };
    document.getElementById("logoutBtn").onclick = logout;

    function applyPermissions() {
      const user = currentUser();
      if (!user) return;

      document.getElementById("adminEmailLabel").textContent = user.email;
      const badge = document.getElementById("adminRoleBadge");
      badge.textContent = roleLabel(user.role);
      badge.style.display = "";

      document.querySelectorAll(".admin-nav a[data-perm]").forEach(a => {
        const perm = a.dataset.perm;
        a.style.display = hasPermission(perm) ? "" : "none";
      });

      const canEditOrders = hasPermission("orders.edit");
      const canBulk = hasPermission("orders.bulk");
      document.querySelectorAll(".status-select").forEach(el => {
        el.disabled = !canEditOrders;
      });
      const bulkApply = document.getElementById("bulkApplyBtn");
      const bulkStatus = document.getElementById("bulkStatusSelect");
      if (bulkApply) bulkApply.style.display = canBulk ? "" : "none";
      if (bulkStatus) bulkStatus.style.display = canBulk ? "" : "none";
      const selectAll = document.getElementById("selectAllOrders");
      if (selectAll) selectAll.style.visibility = canBulk ? "visible" : "hidden";
      document.querySelectorAll(".order-check").forEach(cb => {
        cb.style.visibility = canBulk ? "visible" : "hidden";
      });

      const addBtn = document.getElementById("addProductBtn");
      const bulkBtn = document.getElementById("bulkUploadBtn");
      const tplBtn = document.getElementById("downloadTemplateBtn");
      const canEditProducts = hasPermission("products.edit");
      if (addBtn) addBtn.style.display = canEditProducts ? "" : "none";
      if (bulkBtn) bulkBtn.style.display = canEditProducts ? "" : "none";
      if (tplBtn) tplBtn.style.display = canEditProducts ? "" : "none";

      const saveSettings = document.getElementById("saveSettingsBtn");
      const clearOrders = document.getElementById("clearOrdersBtn");
      if (saveSettings) saveSettings.style.display = hasPermission("settings.edit") ? "" : "none";
      if (clearOrders) clearOrders.style.display = hasPermission("orders.clear") ? "" : "none";

      const exportAudit = document.getElementById("exportAuditBtn");
      const clearAudit = document.getElementById("clearAuditBtn");
      if (exportAudit) exportAudit.style.display = hasPermission("audit.manage") ? "" : "none";
      if (clearAudit) clearAudit.style.display = hasPermission("audit.manage") ? "" : "none";

      ["settingStoreName", "settingEmail", "settingFreeShip", "settingLowStock", "settingReorderPoint", "settingReorderQty"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = !hasPermission("settings.edit");
      });
      const lowEl = document.getElementById("settingLowStock");
      if (lowEl) lowEl.value = getLowStockThreshold();
      const rpEl = document.getElementById("settingReorderPoint");
      if (rpEl) rpEl.value = getDefaultReorderPoint();
      const rqEl = document.getElementById("settingReorderQty");
      if (rqEl) rqEl.value = getDefaultReorderQty();
    }

    // ---------- Product store (seed + custom) ----------
    function getAllProducts() {
      let custom = [];
      try { custom = JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY) || "[]"); } catch {}
      const map = new Map();
      PRODUCTS.forEach(p => map.set(p.id, { ...p }));
      custom.forEach(p => map.set(p.id, p));
      return Array.from(map.values()).filter(p => !p._deleted);
    }

    function saveCustomProduct(product) {
      let custom = [];
      try { custom = JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY) || "[]"); } catch {}
      const idx = custom.findIndex(p => p.id === product.id);
      if (idx > -1) custom[idx] = product;
      else custom.push(product);
      localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(custom));
      try {
        const all = getAllProducts();
        localStorage.setItem("bitc_catalog_v2", JSON.stringify(all));
      } catch (e) {
        console.warn("Catalog mirror failed", e);
      }
    }

    function deleteProduct(id) {
      const all = getAllProducts();
      const p = all.find(x => x.id === id);
      if (!p) return;
      const deleted = { ...p, _deleted: true };
      saveCustomProduct(deleted);
    }

    // ---------- Inventory tracking ----------
    const INVENTORY_KEY = "bitc_inventory_movements";
    const LOW_STOCK_KEY = "bitc_low_stock_threshold";
    const REORDER_POINT_KEY = "bitc_reorder_point";
    const REORDER_QTY_KEY = "bitc_reorder_qty";
    const REORDER_QUEUE_KEY = "bitc_reorder_queue";

    function getLowStockThreshold() {
      const v = parseInt(localStorage.getItem(LOW_STOCK_KEY) || "5", 10);
      return isNaN(v) || v < 0 ? 5 : v;
    }
    function setLowStockThreshold(n) {
      localStorage.setItem(LOW_STOCK_KEY, String(Math.max(0, parseInt(n, 10) || 5)));
    }
    function getDefaultReorderPoint() {
      const v = parseInt(localStorage.getItem(REORDER_POINT_KEY) || "5", 10);
      return isNaN(v) || v < 0 ? 5 : v;
    }
    function setDefaultReorderPoint(n) {
      localStorage.setItem(REORDER_POINT_KEY, String(Math.max(0, parseInt(n, 10) || 5)));
    }
    function getDefaultReorderQty() {
      const v = parseInt(localStorage.getItem(REORDER_QTY_KEY) || "20", 10);
      return isNaN(v) || v < 1 ? 20 : v;
    }
    function setDefaultReorderQty(n) {
      localStorage.setItem(REORDER_QTY_KEY, String(Math.max(1, parseInt(n, 10) || 20)));
    }
    function getReorderQueue() {
      try { return JSON.parse(localStorage.getItem(REORDER_QUEUE_KEY) || "[]"); }
      catch { return []; }
    }
    function saveReorderQueue(list) {
      localStorage.setItem(REORDER_QUEUE_KEY, JSON.stringify(list));
    }

    function getReorderPoint(product, size) {
      if (product?.reorderPoints && product.reorderPoints[size] != null)
        return Number(product.reorderPoints[size]);
      if (product?.reorderPoint != null && product.reorderPoint !== "")
        return Number(product.reorderPoint);
      return getDefaultReorderPoint();
    }
    function getReorderQty(product, size) {
      if (product?.reorderQtys && product.reorderQtys[size] != null)
        return Number(product.reorderQtys[size]);
      if (product?.reorderQty != null && product.reorderQty !== "")
        return Number(product.reorderQty);
      return getDefaultReorderQty();
    }

    function queueKey(productId, size) {
      return productId + "::" + size;
    }

    function ensureReorderQueueItem(product, size, qty) {
      const rp = getReorderPoint(product, size);
      if (qty > rp) return false;
      const list = getReorderQueue();
      const key = queueKey(product.id, size);
      const existing = list.find(x => x.key === key && x.status !== "completed");
      const suggest = getReorderQty(product, size);
      if (existing) {
        existing.onHand = qty;
        existing.reorderPoint = rp;
        existing.suggestQty = suggest;
        existing.updatedAt = new Date().toISOString();
        saveReorderQueue(list);
        return false;
      }
      list.unshift({
        key,
        productId: product.id,
        productName: product.name,
        barcode: product.barcode || "",
        size,
        onHand: qty,
        reorderPoint: rp,
        suggestQty: suggest,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      saveReorderQueue(list);
      return true;
    }

    function resolveReorderIfRecovered(product, size, qty) {
      const rp = getReorderPoint(product, size);
      if (qty > rp) {
        const list = getReorderQueue();
        let changed = false;
        list.forEach(item => {
          if (item.key === queueKey(product.id, size) && item.status !== "completed") {
            item.status = "completed";
            item.onHand = qty;
            item.updatedAt = new Date().toISOString();
            item.note = "Stock recovered above reorder point";
            changed = true;
          }
        });
        if (changed) saveReorderQueue(list);
      }
    }
