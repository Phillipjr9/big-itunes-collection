/* Shared header, footer, mobile menu */

function renderHeader(active = "") {
  return `
  <div class="announce">
    <span style="font-weight:500">Free Nationwide Delivery</span> on orders over ₦45,000 · New Arrivals just dropped ✨
  </div>
  <header class="site-header" id="siteHeader">
    <div class="container">
      <div class="nav-inner">
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open menu">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>

        <a href="index.html" class="logo">
          <div class="logo-mark">
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none"><path d="M20 6C14 6 10 12 10 18C10 26 20 34 20 34C20 34 30 26 30 18C30 12 26 6 20 6Z" fill="white" fill-opacity="0.95"/><path d="M20 10C17 10 15 13.5 15 17C15 21 20 26 20 26C20 26 25 21 25 17C25 13.5 23 10 20 10Z" fill="#FCE7F3" fill-opacity="0.5"/></svg>
          </div>
          <div class="logo-text">
            <span class="logo-name">BIG ITunes</span>
            <span class="logo-sub">Collection</span>
          </div>
        </a>

        <nav class="nav-links">
          <a href="index.html" class="${active === "home" ? "active" : ""}">Home</a>
          <div class="nav-dropdown">
            <a href="shop.html" class="${active === "shop" ? "active" : ""}">Shop ▾</a>
            <div class="nav-dropdown-menu">
              <a href="shop.html">All Clothing</a>
              <a href="shop.html?category=dresses">Dresses</a>
              <a href="shop.html?category=tops">Tops</a>
              <a href="shop.html?category=bottoms">Skirts & Trousers</a>
              <a href="shop.html?category=sets">Two-Piece Sets</a>
              <a href="shop.html?category=jumpsuits">Jumpsuits</a>
              <a href="shop.html?sale=1" style="color:var(--rose-500);font-weight:500">Sale</a>
            </div>
          </div>
          <a href="shop.html?new=1" class="${active === "new" ? "active" : ""}">New Arrivals</a>
          <a href="index.html#collections">Collections</a>
          <a href="index.html#about">About</a>
        </nav>

        <div class="nav-icons">
          <a href="shop.html" class="nav-icon" aria-label="Search" title="Search">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </a>
          <a href="wishlist.html" class="nav-icon" aria-label="Wishlist">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            <span class="nav-badge hidden" data-wish-count>0</span>
          </a>
          <a href="account.html" class="nav-icon" aria-label="Account" style="display:none" id="accountIconDesktop">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </a>
          <a href="cart.html" class="nav-icon" aria-label="Cart">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            <span class="nav-badge hidden" data-cart-count>0</span>
          </a>
        </div>
      </div>
    </div>
  </header>

  <!-- Mobile drawer -->
  <div class="mobile-drawer" id="mobileDrawer">
    <div class="mobile-overlay" id="mobileOverlay"></div>
    <div class="mobile-panel">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:1.25rem;border-bottom:1px solid var(--border)">
        <span class="font-display" style="font-size:1.25rem;font-weight:600;color:var(--blush-800)">Menu</span>
        <button id="closeMobileMenu" aria-label="Close" style="padding:0.5rem;color:#6B7280">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <nav style="flex:1;overflow-y:auto;padding:1rem 1.25rem">
        <a href="index.html" style="display:block;padding:0.75rem 0;border-bottom:1px solid var(--border);font-weight:500">Home</a>
        <a href="shop.html" style="display:block;padding:0.75rem 0;border-bottom:1px solid var(--border);font-weight:500">Shop All</a>
        <a href="shop.html?category=dresses" style="display:block;padding:0.75rem 0;border-bottom:1px solid var(--border)">Dresses</a>
        <a href="shop.html?category=tops" style="display:block;padding:0.75rem 0;border-bottom:1px solid var(--border)">Tops</a>
        <a href="shop.html?category=bottoms" style="display:block;padding:0.75rem 0;border-bottom:1px solid var(--border)">Skirts & Trousers</a>
        <a href="shop.html?category=sets" style="display:block;padding:0.75rem 0;border-bottom:1px solid var(--border)">Two-Piece Sets</a>
        <a href="shop.html?category=jumpsuits" style="display:block;padding:0.75rem 0;border-bottom:1px solid var(--border)">Jumpsuits</a>
        <a href="shop.html?sale=1" style="display:block;padding:0.75rem 0;border-bottom:1px solid var(--border);color:var(--rose-500);font-weight:500">Sale</a>
        <a href="shop.html?new=1" style="display:block;padding:0.75rem 0;border-bottom:1px solid var(--border);font-weight:500">New Arrivals</a>
        <a href="wishlist.html" style="display:block;padding:0.75rem 0;border-bottom:1px solid var(--border)">Wishlist</a>
        <a href="account.html" style="display:block;padding:0.75rem 0;border-bottom:1px solid var(--border)">Account</a>
        <a href="index.html#about" style="display:block;padding:0.75rem 0">About</a>
      </nav>
      <div style="padding:1.25rem;border-top:1px solid var(--border)">
        <a href="account.html" class="btn btn-primary btn-block">My Account</a>
        <p style="text-align:center;font-size:0.75rem;color:#9CA3AF;margin-top:0.75rem">Delivering across Nigeria 🇳🇬</p>
      </div>
    </div>
  </div>
  `;
}

function renderFooter() {
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="logo" style="color:white">
            <div class="logo-mark" style="width:2rem;height:2rem">
              <svg width="16" height="16" viewBox="0 0 40 40" fill="none"><path d="M20 6C14 6 10 12 10 18C10 26 20 34 20 34C20 34 30 26 30 18C30 12 26 6 20 6Z" fill="white" fill-opacity="0.95"/></svg>
            </div>
            <div class="logo-text">
              <span class="logo-name" style="color:white;font-size:1.1rem">BIG ITunes</span>
              <span class="logo-sub">Collection</span>
            </div>
          </a>
          <p>Exclusive Nigerian women’s fashion. Style made for her.</p>
        </div>
        <div class="footer-col">
          <h4>Shop</h4>
          <a href="shop.html?new=1">New Arrivals</a>
          <a href="shop.html?category=dresses">Dresses</a>
          <a href="shop.html?category=tops">Tops</a>
          <a href="shop.html?category=bottoms">Skirts & Trousers</a>
          <a href="shop.html?category=sets">Two-Piece Sets</a>
          <a href="shop.html?category=jumpsuits">Jumpsuits</a>
          <a href="shop.html?sale=1">Sale</a>
        </div>
        <div class="footer-col">
          <h4>Customer Care</h4>
          <a href="account.html">Contact Us</a>
          <a href="account.html">Track Order</a>
          <a href="index.html#size-guide">Size Guide</a>
          <a href="#">Delivery Information</a>
          <a href="#">Returns & Exchanges</a>
          <a href="#">FAQs</a>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <a href="index.html#about">About Us</a>
          <a href="index.html#about">Our Story</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms & Conditions</a>
          <p style="margin-top:1rem;font-size:0.8rem;color:#9CA3AF">Lagos, Nigeria<br>hello@bigitunescollection.com</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 Big ITunes Collection. All rights reserved. Designed for women in Nigeria. · <a href="admin.html" style="color:#6B7280">Admin</a></p>
      </div>
    </div>
  </footer>
  `;
}

function initCommon() {
  // Show desktop account icon on larger screens
  const acc = document.getElementById("accountIconDesktop");
  if (acc && window.innerWidth >= 640) acc.style.display = "";

  // Mobile menu
  const drawer = document.getElementById("mobileDrawer");
  const openBtn = document.getElementById("mobileMenuBtn");
  const closeBtn = document.getElementById("closeMobileMenu");
  const overlay = document.getElementById("mobileOverlay");
  if (openBtn) openBtn.onclick = () => drawer.classList.add("open");
  if (closeBtn) closeBtn.onclick = () => drawer.classList.remove("open");
  if (overlay) overlay.onclick = () => drawer.classList.remove("open");

  // Header scroll
  const header = document.getElementById("siteHeader");
  if (header) {
    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 20);
    });
  }

  updateNavBadges();
}

// Inject header/footer if placeholders exist
document.addEventListener("DOMContentLoaded", () => {
  const headerSlot = document.getElementById("site-header");
  const footerSlot = document.getElementById("site-footer");
  if (headerSlot) {
    const active = headerSlot.dataset.active || "";
    headerSlot.outerHTML = renderHeader(active);
  }
  if (footerSlot) {
    footerSlot.outerHTML = renderFooter();
  }
  initCommon();
});
