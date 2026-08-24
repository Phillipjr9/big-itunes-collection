    // ---------- Audit Log UI ----------
    function renderAuditLog() {
      const filter = document.getElementById("auditActionFilter").value;
      let list = getAuditLog();
      if (filter) list = list.filter(e => e.category === filter);

      document.getElementById("auditCount").textContent = `(${list.length})`;
      const body = document.getElementById("auditBody");
      const empty = document.getElementById("auditEmpty");

      if (list.length === 0) {
        body.innerHTML = "";
        empty.classList.remove("hidden");
        return;
      }
      empty.classList.add("hidden");

      const actionLabel = {
        "login": "Login",
        "logout": "Logout",
        "login.failed": "Login failed",
        "order.status": "Order status",
        "order.bulk_status": "Bulk status",
        "order.clear_all": "Clear orders",
        "product.create": "Product created",
        "product.update": "Product updated",
        "product.delete": "Product deleted",
        "settings.update": "Settings updated",
        "audit.clear": "Audit cleared"
      };

      body.innerHTML = list.map(e => `
        <tr>
          <td style="white-space:nowrap;font-size:0.75rem;color:#6B7280">
            ${new Date(e.at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
          </td>
          <td>
            <span class="badge badge-soft" style="text-transform:none;letter-spacing:0;font-weight:500">
              ${actionLabel[e.action] || e.action}
            </span>
          </td>
          <td style="font-size:0.8rem">
            ${e.actor || "—"}
            ${e.role ? `<br><span style="font-size:0.7rem;color:#9CA3AF">${roleLabel(e.role)}</span>` : ""}
          </td>
          <td style="font-size:0.8rem;max-width:22rem">${e.details || "—"}</td>
        </tr>
      `).join("");
    }

    document.getElementById("auditActionFilter").onchange = renderAuditLog;

    document.getElementById("exportAuditBtn").onclick = () => {
      if (!requirePermission("audit.manage")) return;
      const data = getAuditLog();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bitc-audit-log-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      logAudit("audit.export", "settings", `Exported ${data.length} audit entries`);
      showToast("Audit log exported");
    };

    document.getElementById("clearAuditBtn").onclick = () => {
      if (!requirePermission("audit.manage")) return;
      if (!confirm("Clear the entire audit log? This cannot be undone.")) return;
      const count = getAuditLog().length;
      saveAuditLog([]);
      logAudit("audit.clear", "settings", `Cleared audit log (${count} entries removed)`, { count });
      renderAuditLog();
      showToast("Audit log cleared");
    };

    // ---------- Init ----------
    function showDashboard() {
      document.getElementById("loginScreen").style.display = "none";
      document.getElementById("dashboard").style.display = "grid";
      applyPermissions();
      // Land on first allowed view
      const first = ["overview", "orders", "products", "inventory", "customers", "audit", "settings"]
        .find(v => hasPermission(VIEW_PERMS[v]));
      if (first) switchView(first);
      else renderOverview();
      // Refresh low-stock badge
      try { renderInventory(); } catch (_) {}
    }

    if (isLoggedIn()) showDashboard();
