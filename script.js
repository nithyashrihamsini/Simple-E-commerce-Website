// --- Data ---
const PRODUCTS = [
  { id: 1, title: 'Aurora Lamp', price: 1499, rating: 4.5, tag: 'Home', image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop', desc: 'Soft ambient glow with a modern silhouette.' },
  { id: 2, title: 'Canvas Backpack', price: 1899, rating: 4.3, tag: 'Accessories', image: 'https://images.unsplash.com/photo-1503341458-a6635b2b4e28?q=80&w=1200&auto=format&fit=crop', desc: 'Durable everyday carry with minimal design.' },
  { id: 3, title: 'Ceramic Mug Set', price: 899, rating: 4.7, tag: 'Kitchen', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop', desc: 'Handcrafted mugs for your cozy mornings.' },
  { id: 4, title: 'Wireless Earbuds', price: 2499, rating: 4.2, tag: 'Electronics', image: 'https://images.unsplash.com/photo-1518443872303-6f66f3a17029?q=80&w=1200&auto=format&fit=crop', desc: 'Crisp sound, long battery, pocketable case.' },
  { id: 5, title: 'Desk Plant', price: 599, rating: 4.6, tag: 'Home', image: 'https://images.unsplash.com/photo-1469131792215-9c8aaff5870c?q=80&w=1200&auto=format&fit=crop', desc: 'Low-maintenance greenery for your workspace.' },
  { id: 6, title: 'Notebook Trio', price: 499, rating: 4.4, tag: 'Stationery', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop', desc: 'Set of three premium dot-grid notebooks.' },
];

const CATEGORIES = ['All', ...new Set(PRODUCTS.map(p => p.tag))];

// --- State ---
const state = {
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  category: 'All',
  sort: 'featured',
  search: ''
};
//Add to cart facility using AI
// --- DOM ---
const productsEl = document.getElementById('products');
const cartButton = document.getElementById('cartButton');
const cartCountEl = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const cartClose = document.getElementById('cartClose');
const cartItemsEl = document.getElementById('cartItems');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const cartShippingEl = document.getElementById('cartShipping');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutButton = document.getElementById('checkoutButton');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const categoryChips = document.getElementById('categoryChips');
const toast = document.getElementById('toast');
const yearEl = document.getElementById('year');
const themeToggle = document.getElementById('themeToggle');

// Modal refs
const productModal = document.getElementById('productModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
const modalRating = document.getElementById('modalRating');
const modalQty = document.getElementById('modalQty');
const incQty = document.getElementById('incQty');
const decQty = document.getElementById('decQty');
const modalAdd = document.getElementById('modalAdd');

let modalProduct = null;
let modalQtyValue = 1;

// --- Utils ---
const formatINR = (n) => `₹${n.toLocaleString('en-IN')}`;
const showToast = (msg) => {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3300);
};

const saveCart = () => localStorage.setItem('cart', JSON.stringify(state.cart));
const cartCount = () => state.cart.reduce((sum, i) => sum + i.qty, 0);
const calcSubtotal = () => state.cart.reduce((sum, i) => {
  const p = PRODUCTS.find(p => p.id === i.id);
  return sum + p.price * i.qty;
}, 0);

// --- Render ---
function renderCategoryChips() {
  categoryChips.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `chip ${state.category === cat ? 'active' : ''}`;
    btn.textContent = cat;
    btn.onclick = () => { state.category = cat; renderProducts(); };
    categoryChips.appendChild(btn);
  });
}

function getFilteredProducts() {
  let list = PRODUCTS.filter(p =>
    (state.category === 'All' || p.tag === state.category) &&
    p.title.toLowerCase().includes(state.search.toLowerCase())
  );
  if (state.sort === 'price-asc') list.sort((a,b) => a.price - b.price);
  else if (state.sort === 'price-desc') list.sort((a,b) => b.price - a.price);
  else if (state.sort === 'rating') list.sort((a,b) => b.rating - a.rating);
  return list;
}

function renderProducts() {
  const items = getFilteredProducts();
  productsEl.innerHTML = items.map((p, i) => `
    <article class="card" style="animation-delay:${i * 80}ms">
      <img src="${p.image}" alt="${p.title}" />
      <div class="card-body">
        <div class="card-title">${p.title}</div>
        <div class="tag">Category: ${p.tag}</div>
        <div class="price-row">
          <span class="price">${formatINR(p.price)}</span>
          <span class="rating">★ ${p.rating}</span>
        </div>
        <div class="actions-row">
          <button class="btn" onclick="openProduct(${p.id})">View</button>
          <button class="btn primary" onclick="addToCart(${p.id}, 1)">Add to cart</button>
        </div>
      </div>
    </article>
  `).join('');
}

function renderCart() {
  cartItemsEl.innerHTML = state.cart.map(item => {
    const p = PRODUCTS.find(pp => pp.id === item.id);
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.title}" />
        <div>
          <div class="cart-item-title">${p.title}</div>
          <div class="muted">${formatINR(p.price)} × ${item.qty} = ${formatINR(p.price * item.qty)}</div>
          <div class="cart-item-controls">
            <button class="btn qty" onclick="changeQty(${item.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button class="btn qty" onclick="changeQty(${item.id}, 1)">+</button>
            <span class="remove" onclick="removeItem(${item.id})">Remove</span>
          </div>
        </div>
        <div class="price">${formatINR(p.price * item.qty)}</div>
      </div>
    `;
  }).join('') || `<p class="muted">Your cart is empty.</p>`;

  const subtotal = calcSubtotal();
  const shipping = subtotal > 2500 ? 0 : (subtotal === 0 ? 0 : 99);
  const total = subtotal + shipping;

  cartSubtotalEl.textContent = formatINR(subtotal);
  cartShippingEl.textContent = formatINR(shipping);
  cartTotalEl.textContent = formatINR(total);
  cartCountEl.textContent = cartCount();
}

// --- Cart actions ---
function addToCart(id, qty = 1) {
  const existing = state.cart.find(i => i.id === id);
  if (existing) existing.qty += qty;
  else state.cart.push({ id, qty });
  saveCart(); renderCart();
  showToast('Added to cart');
}

function changeQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(i => i.id !== id);
  saveCart(); renderCart();
}

function removeItem(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart(); renderCart();
  showToast('Removed from cart');
}

// --- Modal ---
function openProduct(id) {
  const p = PRODUCTS.find(pp => pp.id === id);
  if (!p) return;
  modalProduct = p;
  modalQtyValue = 1;
  modalImage.src = p.image;
  modalImage.alt = p.title;
  modalTitle.textContent = p.title;
  modalDesc.textContent = p.desc;
  modalPrice.textContent = formatINR(p.price);
  modalRating.textContent = `★ ${p.rating}`;
  modalQty.textContent = modalQtyValue;
  productModal.classList.add('show');
}

function closeModal() { productModal.classList.remove('show'); }

// Expose for inline handlers used in render
window.openProduct = openProduct;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeItem = removeItem;

// Modal events
incQty.addEventListener('click', () => { modalQtyValue++; modalQty.textContent = modalQtyValue; });
decQty.addEventListener('click', () => { modalQtyValue = Math.max(1, modalQtyValue - 1); modalQty.textContent = modalQtyValue; });
modalAdd.addEventListener('click', () => { addToCart(modalProduct.id, modalQtyValue); closeModal(); });
modalBackdrop.addEventListener('click', closeModal);
modalClose.addEventListener('click', closeModal);

// --- Drawer events ---
cartButton.addEventListener('click', () => cartDrawer.classList.add('open'));
cartClose.addEventListener('click', () => cartDrawer.classList.remove('open'));

// --- Filters/search/sort ---
searchInput.addEventListener('input', (e) => { state.search = e.target.value; renderProducts(); });
sortSelect.addEventListener('change', (e) => { state.sort = e.target.value; renderProducts(); });

// Theme toggle and year
function setTheme(mode) {
  const root = document.documentElement;
  if (mode === 'light') { root.classList.add('light'); themeToggle.textContent = '🌞'; localStorage.setItem('theme', 'light'); }
  else { root.classList.remove('light'); themeToggle.textContent = '🌙'; localStorage.setItem('theme', 'dark'); }
}
const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
setTheme(savedTheme);
themeToggle.addEventListener('click', () => setTheme(document.documentElement.classList.contains('light') ? 'dark' : 'light'));
yearEl.textContent = new Date().getFullYear();

// Build category chips and initial render
renderCategoryChips();

renderProducts();

renderCart();

// --- Checkout ---
checkoutButton.addEventListener('click', () => {
  if (!state.cart.length) { showToast('Your cart is empty'); return; }
  showToast('Checkout complete (demo). Thanks for shopping!');
  state.cart = [];
  saveCart(); renderCart();
  cartDrawer.classList.remove('open');
});