/* Big ITunes Collection — Shared Data & Utilities */

const PRODUCTS = [
  {
    id: 1,
    name: "Rose Silk Midi Dress",
    slug: "rose-silk-midi-dress",
    price: 28500,
    original: 35000,
    category: "dresses",
    subcategory: "Midi Dresses",
    colors: [
      { name: "Blush", hex: "#E8B4B8" },
      { name: "Black", hex: "#1a1a1a" },
      { name: "Champagne", hex: "#F5E6D3" }
    ],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80"
    ],
    description: "A fluid silk midi dress in soft rose tones. Designed for the woman who moves with quiet confidence — perfect for dinner dates, celebrations, or elevated everyday moments.",
    fabric: "Premium silk-blend",
    care: "Dry clean or gentle hand wash",
    isNew: true,
    isBestseller: true,
    stock: { S: 4, M: 8, L: 6, XL: 3 }
  },
  {
    id: 2,
    name: "Blush Soft Blouse",
    slug: "blush-soft-blouse",
    price: 16500,
    original: null,
    category: "tops",
    subcategory: "Blouses",
    colors: [
      { name: "Soft Pink", hex: "#FCE7F3" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Rose", hex: "#F9A8D4" }
    ],
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80",
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80"
    ],
    description: "Lightweight and feminine. This soft blouse drapes beautifully and pairs effortlessly with trousers, skirts, or jeans.",
    fabric: "Soft cotton-voile",
    care: "Machine wash cold",
    isNew: true,
    isBestseller: false,
    stock: { XS: 5, S: 10, M: 12, L: 7 }
  },
  {
    id: 3,
    name: "Wide-Leg Tailored Trousers",
    slug: "wide-leg-tailored-trousers",
    price: 22000,
    original: 28000,
    category: "bottoms",
    subcategory: "Trousers",
    colors: [
      { name: "Black", hex: "#1a1a1a" },
      { name: "Chocolate", hex: "#4A3728" },
      { name: "Sand", hex: "#E8D5C4" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&q=80",
      "https://images.unsplash.com/photo-1506629082955-511b1aa942af?w=800&q=80"
    ],
    description: "High-waisted wide-leg trousers with a clean tailored finish. Made for the Boss Woman who wants comfort without compromising polish.",
    fabric: "Structured crepe",
    care: "Dry clean recommended",
    isNew: false,
    isBestseller: true,
    stock: { S: 6, M: 9, L: 8, XL: 5, XXL: 3 }
  },
  {
    id: 4,
    name: "Matching Co-ord Set",
    slug: "matching-coord-set",
    price: 32000,
    original: null,
    category: "sets",
    subcategory: "Two-Piece Sets",
    colors: [
      { name: "Magenta", hex: "#EC4899" },
      { name: "Blush", hex: "#FCE7F3" },
      { name: "Black", hex: "#1a1a1a" }
    ],
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&q=80"
    ],
    description: "The soft power set. Coordinated top and bottom that take you from brunch to evening with zero effort.",
    fabric: "Soft knit blend",
    care: "Gentle machine wash",
    isNew: true,
    isBestseller: true,
    stock: { S: 7, M: 11, L: 6 }
  },
  {
    id: 5,
    name: "Elegant Wide-Leg Jumpsuit",
    slug: "elegant-wide-leg-jumpsuit",
    price: 29500,
    original: 36000,
    category: "jumpsuits",
    subcategory: "Elegant Jumpsuits",
    colors: [
      { name: "Black", hex: "#1a1a1a" },
      { name: "Deep Rose", hex: "#831843" },
      { name: "Champagne", hex: "#F5E6D3" }
    ],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80"
    ],
    description: "One-and-done elegance. A flattering wide-leg jumpsuit with a refined neckline — ideal for events, dinners, and special moments.",
    fabric: "Flowing crepe",
    care: "Dry clean",
    isNew: false,
    isBestseller: false,
    stock: { S: 4, M: 7, L: 5, XL: 2 }
  },
  {
    id: 6,
    name: "Pleated Midi Skirt",
    slug: "pleated-midi-skirt",
    price: 18500,
    original: null,
    category: "bottoms",
    subcategory: "Skirts",
    colors: [
      { name: "Blush", hex: "#FCE7F3" },
      { name: "Black", hex: "#1a1a1a" },
      { name: "Gold", hex: "#D4AF37" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80"
    ],
    description: "Softly structured pleats that move with you. Pair with a tucked blouse or crop top for an effortlessly feminine silhouette.",
    fabric: "Pleated georgette",
    care: "Hand wash cold",
    isNew: true,
    isBestseller: false,
    stock: { XS: 3, S: 8, M: 10, L: 6, XL: 4 }
  },
  {
    id: 7,
    name: "Party Sequin Mini Dress",
    slug: "party-sequin-mini-dress",
    price: 26500,
    original: 32000,
    category: "dresses",
    subcategory: "Party Dresses",
    colors: [
      { name: "Hot Pink", hex: "#EC4899" },
      { name: "Black", hex: "#1a1a1a" },
      { name: "Gold", hex: "#D4AF37" }
    ],
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80"
    ],
    description: "Statement sequins for the nights you want to shine. Fully lined, comfortable stretch, and made to turn heads.",
    fabric: "Sequin mesh with lining",
    care: "Dry clean only",
    isNew: false,
    isBestseller: true,
    stock: { S: 5, M: 6, L: 4 }
  },
  {
    id: 8,
    name: "Crop Top & Skirt Set",
    slug: "crop-top-skirt-set",
    price: 24800,
    original: null,
    category: "sets",
    subcategory: "Matching Sets",
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Blush", hex: "#FCE7F3" },
      { name: "Rose", hex: "#F9A8D4" }
    ],
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&q=80",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80"
    ],
    description: "Playful yet polished. A coordinated crop and skirt set designed for warm days, weekends, and vacation energy.",
    fabric: "Breathable cotton blend",
    care: "Machine wash cold",
    isNew: true,
    isBestseller: false,
    stock: { XS: 4, S: 9, M: 8, L: 5 }
  },
  {
    id: 9,
    name: "Office Sheath Dress",
    slug: "office-sheath-dress",
    price: 27500,
    original: null,
    category: "dresses",
    subcategory: "Evening Dresses",
    colors: [
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Black", hex: "#1a1a1a" },
      { name: "Burgundy", hex: "#6B1D3A" }
    ],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80"
    ],
    description: "Clean lines, refined structure. The Boss Woman essential that transitions from boardroom to after-work plans.",
    fabric: "Premium stretch crepe",
    care: "Dry clean",
    isNew: false,
    isBestseller: true,
    stock: { S: 6, M: 10, L: 7, XL: 4 }
  },
  {
    id: 10,
    name: "Casual Linen Shirt",
    slug: "casual-linen-shirt",
    price: 14500,
    original: 18000,
    category: "tops",
    subcategory: "Shirts",
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Sand", hex: "#E8D5C4" },
      { name: "Soft Pink", hex: "#FCE7F3" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80",
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80"
    ],
    description: "Breathable linen for everyday ease. Tuck it, knot it, or leave it open — a versatile staple.",
    fabric: "100% linen",
    care: "Machine wash cold, line dry",
    isNew: true,
    isBestseller: false,
    stock: { XS: 5, S: 11, M: 14, L: 8, XL: 4 }
  },
  {
    id: 11,
    name: "Flared Denim Jeans",
    slug: "flared-denim-jeans",
    price: 19800,
    original: null,
    category: "bottoms",
    subcategory: "Jeans",
    colors: [
      { name: "Light Wash", hex: "#A8C5D4" },
      { name: "Dark Wash", hex: "#2C3E50" },
      { name: "Black", hex: "#1a1a1a" }
    ],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
      "https://images.unsplash.com/photo-1582418702059-c6a6a4a1d5a0?w=800&q=80"
    ],
    description: "Flattering high-rise flare with just the right amount of stretch. Weekend Mood approved.",
    fabric: "Stretch denim",
    care: "Machine wash cold, inside out",
    isNew: false,
    isBestseller: true,
    stock: { S: 8, M: 12, L: 9, XL: 5 }
  },
  {
    id: 12,
    name: "Vacation Maxi Dress",
    slug: "vacation-maxi-dress",
    price: 25500,
    original: 30000,
    category: "dresses",
    subcategory: "Maxi Dresses",
    colors: [
      { name: "Tropical Print", hex: "#E8B4B8" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Sky", hex: "#7EB6D9" }
    ],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80"
    ],
    description: "Floaty maxi for getaways and golden-hour walks. Lightweight, breathable, and made for movement.",
    fabric: "Lightweight rayon",
    care: "Hand wash cold",
    isNew: true,
    isBestseller: false,
    stock: { S: 5, M: 8, L: 6, XL: 3 }
  }
];

// Nigerian delivery fees by state (demo rates in ₦)
const DELIVERY_FEES = {
  "Lagos": 2500,
  "Abuja (FCT)": 3500,
  "Port Harcourt (Rivers)": 4000,
  "Ibadan (Oyo)": 3500,
  "Enugu": 4000,
  "Kano": 4500,
  "Benin City (Edo)": 3800,
  "Other (Nationwide)": 5000
};

const FREE_SHIPPING_THRESHOLD = 45000;

// Merge admin-created/edited products (localStorage) into the live catalog
(function mergeCustomProducts() {
  try {
    const custom = JSON.parse(localStorage.getItem("bitc_custom_products") || "[]");
    if (!Array.isArray(custom) || !custom.length) return;
    const map = new Map(PRODUCTS.map(p => [p.id, p]));
    custom.forEach(p => {
      if (p && p._deleted) {
        map.delete(p.id);
      } else if (p && p.id != null) {
        map.set(p.id, p);
      }
    });
    PRODUCTS.length = 0;
    map.forEach(p => PRODUCTS.push(p));
  } catch (e) {
    console.warn("Could not merge custom products", e);
  }
})();

const CATEGORIES = [
  { id: "dresses", name: "Dresses", count: 0 },
  { id: "tops", name: "Tops", count: 0 },
  { id: "bottoms", name: "Bottoms", count: 0 },
  { id: "sets", name: "Two-Piece Sets", count: 0 },
  { id: "jumpsuits", name: "Jumpsuits", count: 0 }
];

// Update category counts
CATEGORIES.forEach(c => {
  c.count = PRODUCTS.filter(p => p.category === c.id).length;
});

// ---------- Storage helpers ----------
const STORAGE = {
  cart: "bitc_cart_v2",
  wishlist: "bitc_wishlist_v2",
  orders: "bitc_orders_v2",
  user: "bitc_user_v2"
};

function getCart() {
  try { return JSON.parse(localStorage.getItem(STORAGE.cart) || "[]"); }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(STORAGE.cart, JSON.stringify(cart));
  updateNavBadges();
}
function getWishlist() {
  try { return JSON.parse(localStorage.getItem(STORAGE.wishlist) || "[]"); }
  catch { return []; }
}
function saveWishlist(list) {
  localStorage.setItem(STORAGE.wishlist, JSON.stringify(list));
  updateNavBadges();
}
function getOrders() {
  try { return JSON.parse(localStorage.getItem(STORAGE.orders) || "[]"); }
  catch { return []; }
}
function saveOrders(orders) {
  localStorage.setItem(STORAGE.orders, JSON.stringify(orders));
}
function getUser() {
  try { return JSON.parse(localStorage.getItem(STORAGE.user) || "null"); }
  catch { return null; }
}
function saveUser(user) {
  localStorage.setItem(STORAGE.user, JSON.stringify(user));
}

// ---------- Formatters ----------
function formatPrice(n) {
  return "₦" + Number(n).toLocaleString("en-NG");
}

function getDiscount(p) {
  if (!p.original || p.original <= p.price) return 0;
  return Math.round((1 - p.price / p.original) * 100);
}

// ---------- Cart operations ----------
function getStockForSize(productId, size) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p || !p.stock || size == null) return null;
  const n = Number(p.stock[size]);
  return Number.isFinite(n) ? n : null;
}

function addToCart(productId, size, colorHex, qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const requestedQty = Math.max(1, Number(qty) || 1);
  const stockForSize = getStockForSize(productId, size);
  const cart = getCart();
  const colorObj = product.colors.find(c => c.hex === colorHex) || product.colors[0];
  const existing = cart.find(i => i.id === productId && i.size === size && i.colorHex === colorObj.hex);
  const existingQty = existing ? Number(existing.qty) || 0 : 0;

  if (stockForSize != null && stockForSize <= existingQty) {
    showToast("Selected size is out of stock");
    return cart;
  }

  let qtyToAdd = requestedQty;
  if (stockForSize != null) {
    qtyToAdd = Math.min(requestedQty, Math.max(0, stockForSize - existingQty));
    if (qtyToAdd < requestedQty) {
      showToast(`Only ${Math.max(0, stockForSize - existingQty)} left for size ${size}`);
    }
    if (qtyToAdd <= 0) return cart;
  }

  if (existing) {
    existing.qty += qtyToAdd;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size,
      colorHex: colorObj.hex,
      colorName: colorObj.name,
      qty: qtyToAdd,
      slug: product.slug
    });
  }
  saveCart(cart);
  showToast("Added to cart 💕");
  return cart;
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function updateCartQty(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;
  const item = cart[index];
  const nextQty = item.qty + delta;
  if (delta > 0) {
    const stockForSize = getStockForSize(item.id, item.size);
    if (stockForSize != null && nextQty > stockForSize) {
      showToast(`Only ${stockForSize} left for size ${item.size}`);
      return;
    }
  }
  item.qty = nextQty;
  if (cart[index].qty < 1) cart.splice(index, 1);
  saveCart(cart);
}

function getCartSubtotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

/** Deduct stock when an order is placed; logs inventory movement. */
function deductStockForOrder(items, orderId) {
  try {
    const customKey = "bitc_custom_products";
    let custom = [];
    try { custom = JSON.parse(localStorage.getItem(customKey) || "[]"); } catch {}
    const map = new Map();
    PRODUCTS.forEach(p => map.set(p.id, { ...p, stock: { ...(p.stock || {}) } }));
    custom.forEach(p => {
      if (p && p._deleted) map.delete(p.id);
      else if (p) map.set(p.id, { ...p, stock: { ...(p.stock || {}) } });
    });

    let movements = [];
    try { movements = JSON.parse(localStorage.getItem("bitc_inventory_movements") || "[]"); } catch {}

    (items || []).forEach(item => {
      const p = map.get(item.id);
      if (!p || !item.size) return;
      if (!p.stock) p.stock = {};
      const from = Number(p.stock[item.size] || 0);
      const qty = Number(item.qty) || 1;
      const to = Math.max(0, from - qty);
      p.stock[item.size] = to;
      map.set(p.id, p);
      movements.unshift({
        id: "MOV-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5),
        at: new Date().toISOString(),
        productId: p.id,
        productName: p.name,
        size: item.size,
        from,
        to,
        delta: to - from,
        type: "sale",
        reason: "Order placed",
        by: "system",
        byName: "Storefront",
        role: null,
        meta: { orderId }
      });

      // Auto-queue reorder when stock hits reorder point
      try {
        const defaultRp = parseInt(localStorage.getItem("bitc_reorder_point") || "5", 10);
        const defaultRq = parseInt(localStorage.getItem("bitc_reorder_qty") || "20", 10);
        const rp = p.reorderPoint != null && p.reorderPoint !== "" ? Number(p.reorderPoint) : (isNaN(defaultRp) ? 5 : defaultRp);
        const rq = p.reorderQty != null && p.reorderQty !== "" ? Number(p.reorderQty) : (isNaN(defaultRq) ? 20 : defaultRq);
        if (to <= rp) {
          let queue = [];
          try { queue = JSON.parse(localStorage.getItem("bitc_reorder_queue") || "[]"); } catch {}
          const key = p.id + "::" + item.size;
          const existing = queue.find(x => x.key === key && x.status !== "completed");
          if (existing) {
            existing.onHand = to;
            existing.reorderPoint = rp;
            existing.suggestQty = rq;
            existing.updatedAt = new Date().toISOString();
          } else {
            queue.unshift({
              key,
              productId: p.id,
              productName: p.name,
              barcode: p.barcode || "",
              size: item.size,
              onHand: to,
              reorderPoint: rp,
              suggestQty: rq,
              status: "pending",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
          localStorage.setItem("bitc_reorder_queue", JSON.stringify(queue));
        }
      } catch (_) {}
    });

    const toSave = [];
    map.forEach(p => {
      const seed = PRODUCTS.find(s => s.id === p.id);
      const inCustom = custom.some(c => c && c.id === p.id && !c._deleted);
      const stockChanged = !seed || JSON.stringify(seed.stock || {}) !== JSON.stringify(p.stock || {});
      if (inCustom || stockChanged) toSave.push(p);
    });
    custom.filter(c => c && c._deleted).forEach(c => toSave.push(c));
    localStorage.setItem(customKey, JSON.stringify(toSave));
    localStorage.setItem("bitc_inventory_movements", JSON.stringify(movements.slice(0, 500)));

    map.forEach(p => {
      const live = PRODUCTS.find(x => x.id === p.id);
      if (live) live.stock = { ...p.stock };
    });
  } catch (e) {
    console.warn("Stock deduction failed", e);
  }
}

function getDeliveryFee(state) {
  if (!state) return 0;
  const sub = getCartSubtotal();
  if (sub >= FREE_SHIPPING_THRESHOLD) return 0;
  return DELIVERY_FEES[state] ?? DELIVERY_FEES["Other (Nationwide)"];
}

// ---------- Wishlist ----------
function toggleWishlist(productId) {
  let list = getWishlist();
  const idx = list.indexOf(productId);
  if (idx > -1) {
    list.splice(idx, 1);
    showToast("Removed from wishlist");
  } else {
    list.push(productId);
    showToast("Added to wishlist ❤️");
  }
  saveWishlist(list);
  return list;
}

function isInWishlist(productId) {
  return getWishlist().includes(productId);
}

// ---------- UI helpers ----------
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2500);
}

function updateNavBadges() {
  const cart = getCart();
  const wish = getWishlist();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    if (cartCount > 0) {
      el.textContent = cartCount;
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  });
  document.querySelectorAll("[data-wish-count]").forEach(el => {
    if (wish.length > 0) {
      el.textContent = wish.length;
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  });
  // Notify any site-level listener (mobile CTA) about cart count
  try { if (window.__site && typeof window.__site.updateCartCount === 'function') window.__site.updateCartCount(cartCount); } catch(_) {}
}

function productCardHTML(p) {
  const discount = getDiscount(p);
  const inWish = isInWishlist(p.id);
  return `
    <article class="product-card" data-id="${p.id}">
      <div class="product-card-img">
        <a href="product.html?id=${p.id}">
          <img src="${p.images[0]}" alt="${p.name}" loading="lazy" />
        </a>
        ${p.isNew ? '<span class="badge badge-new" style="position:absolute;top:0.65rem;left:0.65rem;z-index:2">New</span>' : ""}
        ${discount ? `<span class="badge badge-sale" style="position:absolute;top:0.65rem;${p.isNew ? "left:3.5rem" : "left:0.65rem"};z-index:2">-${discount}%</span>` : ""}
        <button class="heart-btn ${inWish ? "active" : ""}" data-wish="${p.id}" aria-label="Wishlist" onclick="event.preventDefault(); event.stopPropagation(); window.bitcToggleWish(${p.id})">
          <svg fill="${inWish ? "currentColor" : "none"}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
        </button>
        <div class="card-actions">
          <a href="product.html?id=${p.id}" class="btn btn-outline btn-sm">View</a>
          <button class="btn btn-primary btn-sm" onclick="event.preventDefault(); window.bitcQuickAdd(${p.id})">Add</button>
        </div>
      </div>
      <div class="product-card-body">
        <a href="product.html?id=${p.id}">
          <h3 class="product-card-title">${p.name}</h3>
        </a>
        <div class="product-price">
          <span class="price-current">${formatPrice(p.price)}</span>
          ${p.original ? `<span class="price-original">${formatPrice(p.original)}</span>` : ""}
        </div>
        <div class="product-colors">
          ${p.colors.map(c => `<span class="color-dot" style="background:${c.hex}" title="${c.name}"></span>`).join("")}
        </div>
        <div class="product-sizes">
          ${p.sizes.map(s => `<span class="size-tag">${s}</span>`).join("")}
        </div>
      </div>
    </article>
  `;
}

// Global helpers used by inline handlers
window.bitcToggleWish = function(id) {
  toggleWishlist(id);
  document.querySelectorAll(`.heart-btn[data-wish="${id}"]`).forEach(btn => {
    const active = isInWishlist(id);
    btn.classList.toggle("active", active);
    const svg = btn.querySelector("svg");
    if (svg) svg.setAttribute("fill", active ? "currentColor" : "none");
    // brief pop feedback on toggle
    btn.classList.remove("pop");
    void btn.offsetWidth;
    btn.classList.add("pop");
  });
  updateNavBadges();
};

window.bitcQuickAdd = function(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  addToCart(id, p.sizes[0], p.colors[0].hex, 1);
};

function logoSVG(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6C14 6 10 12 10 18C10 26 20 34 20 34C20 34 30 26 30 18C30 12 26 6 20 6Z" fill="white" fill-opacity="0.95"/>
    <path d="M20 10C17 10 15 13.5 15 17C15 21 20 26 20 26C20 26 25 21 25 17C25 13.5 23 10 20 10Z" fill="url(#g)" fill-opacity="0.4"/>
    <defs><linearGradient id="g" x1="15" y1="10" x2="25" y2="26"><stop stop-color="#FCE7F3"/><stop offset="1" stop-color="#F472B6"/></linearGradient></defs>
  </svg>`;
}

document.addEventListener("DOMContentLoaded", updateNavBadges);
