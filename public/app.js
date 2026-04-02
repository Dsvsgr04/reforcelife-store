// ═══════════════════════════════════════════════════════════
//  ReforceLife — Frontend App  (app.js)
//  Handles: Cart, Auth, Checkout, Product Detail, Admin
// ═══════════════════════════════════════════════════════════

const API = 'https://reforcelife-store.onrender.com/api';


// ── State ───────────────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem('rl_cart') || '[]');
let user = JSON.parse(localStorage.getItem('rl_user') || 'null');
let token = localStorage.getItem('rl_token') || null;

// ── Helpers ─────────────────────────────────────────────────
function saveCart() { localStorage.setItem('rl_cart', JSON.stringify(cart)); }
function apiHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}
async function api(method, path, body) {
  const res = await fetch(API + path, { method, headers: apiHeaders(), body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}
function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `rl-toast rl-toast--${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3000);
}
function formatPrice(p) { return '$' + parseFloat(p).toFixed(2); }

// ── Cart ────────────────────────────────────────────────────
function addToCart(id, name, price, image) {
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, name, price: parseFloat(price), image, qty: 1 });
  saveCart(); updateCartUI(); toast(`${name} added to cart! 🌿`);
}
function removeFromCart(id) { cart = cart.filter(i => i.id !== id); saveCart(); updateCartUI(); renderCartDrawer(); }
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { saveCart(); updateCartUI(); renderCartDrawer(); }
}
function cartTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
function cartCount() { return cart.reduce((s, i) => s + i.qty, 0); }

function updateCartUI() {
  document.querySelectorAll('#cartCount, .cart-count-badge').forEach(el => {
    const c = cartCount();
    el.textContent = c;
    el.style.display = c > 0 ? 'flex' : 'none';
  });
}

function renderCartDrawer() {
  const body = document.getElementById('cartBody');
  if (!body) return;
  if (!cart.length) {
    body.innerHTML = '<div class="cart-empty"><span>🛒</span><p>Your cart is empty</p><a href="#products" onclick="closeCart()">Shop Products</a></div>';
    document.getElementById('cartFooter').style.display = 'none';
    return;
  }
  body.innerHTML = cart.map(i => `
    <div class="cart-item">
      <img src="${i.image || '/uploads/placeholder.jpg'}" alt="${i.name}" onerror="this.src='/uploads/placeholder.jpg'">
      <div class="cart-item-info">
        <p class="cart-item-name">${i.name}</p>
        <p class="cart-item-price">${formatPrice(i.price)}</p>
        <div class="cart-qty">
          <button onclick="changeQty(${i.id}, -1)">−</button>
          <span>${i.qty}</span>
          <button onclick="changeQty(${i.id}, 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${i.id})">✕</button>
    </div>`).join('');
  const tax = cartTotal() * 0.08;
  const shipping = cartTotal() >= 50 ? 0 : 5.99;
  document.getElementById('cartFooter').style.display = 'block';
  document.getElementById('cartSubtotal').textContent = formatPrice(cartTotal());
  document.getElementById('cartShipping').textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
  document.getElementById('cartTax').textContent = formatPrice(tax);
  document.getElementById('cartTotal').textContent = formatPrice(cartTotal() + tax + shipping);
}

function openCart() { document.getElementById('cartDrawer').classList.add('open'); document.getElementById('cartOverlay').classList.add('open'); renderCartDrawer(); }
function closeCart() { document.getElementById('cartDrawer').classList.remove('open'); document.getElementById('cartOverlay').classList.remove('open'); }

// ── Auth Modal ───────────────────────────────────────────────
function openAuth(tab = 'login') {
  document.getElementById('authModal').classList.add('open');
  switchAuthTab(tab);
}
function closeAuth() { document.getElementById('authModal').classList.remove('open'); }
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

async function doLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  try {
    const data = await api('POST', '/auth/login', { email, password });
    token = data.token; user = data.user;
    localStorage.setItem('rl_token', token);
    localStorage.setItem('rl_user', JSON.stringify(user));
    closeAuth(); updateAuthUI(); toast(`Welcome back, ${user.firstName}! 🌿`);
  } catch (err) { toast(err.message, 'error'); }
}

async function doRegister(e) {
  e.preventDefault();
  const firstName = document.getElementById('regFirst').value;
  const lastName = document.getElementById('regLast').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const phone = document.getElementById('regPhone').value;
  try {
    const data = await api('POST', '/auth/register', { firstName, lastName, email, password, phone });
    token = data.token; user = data.user;
    localStorage.setItem('rl_token', token);
    localStorage.setItem('rl_user', JSON.stringify(user));
    closeAuth(); updateAuthUI(); toast(`Welcome to ReforceLife, ${user.firstName}! 🌿`);
  } catch (err) { toast(err.message, 'error'); }
}

function doLogout() {
  token = null; user = null;
  localStorage.removeItem('rl_token'); localStorage.removeItem('rl_user');
  updateAuthUI(); toast('Signed out successfully');
}

function updateAuthUI() {
  const loggedIn = !!user;
  document.querySelectorAll('.auth-login-btn').forEach(el => el.style.display = loggedIn ? 'none' : 'inline-flex');
  document.querySelectorAll('.auth-user-menu').forEach(el => el.style.display = loggedIn ? 'flex' : 'none');
  document.querySelectorAll('.auth-username').forEach(el => el.textContent = user ? user.firstName : '');
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = (user?.role === 'admin') ? 'block' : 'none');
}

// ── Products ─────────────────────────────────────────────────
async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  try {
    grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading products...</p></div>';
    const data = await api('GET', '/products?limit=12');
    const products = data.products || data;
    if (!products.length) { grid.innerHTML = '<p style="text-align:center;color:#666;">No products found.</p>'; return; }
    grid.innerHTML = products.map(p => productCard(p)).join('');
  } catch (err) {
    grid.innerHTML = `<p style="text-align:center;color:#c00;">Could not load products. Make sure the server is running.<br><small>${err.message}</small></p>`;
  }
}

function productCard(p) {
  const price = p.salePrice ? `<span class="original-price">${formatPrice(p.price)}</span> ${formatPrice(p.salePrice)}` : formatPrice(p.price);
  const stars = '★'.repeat(Math.round(p.averageRating || 0)) + '☆'.repeat(5 - Math.round(p.averageRating || 0));
  return `
  <div class="product-card" onclick="openProductModal(${p.id})" style="cursor:pointer;">
    ${p.featured ? '<span class="product-badge">Featured</span>' : ''}
    ${p.salePrice ? '<span class="product-badge sale-badge">Sale</span>' : ''}
    <div class="product-card-img">
      <img src="${p.imageUrl || 'https://via.placeholder.com/300x300/1a3a1a/ffffff?text=' + encodeURIComponent(p.name)}"
           alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x300/1a3a1a/ffffff?text=ReforceLife'">
    </div>
    <p class="product-card-tag">${(p.category || '').replace(/_/g,' ')}</p>
    <h3 class="product-card-name">${p.name}</h3>
    <p class="product-card-desc">${p.shortDescription || ''}</p>
    <div class="product-stars">${stars} <span>(${p.totalReviews || 0})</span></div>
    <div class="product-card-footer">
      <span class="product-card-price">${price}</span>
      <button class="product-card-btn" onclick="event.stopPropagation(); addToCart(${p.id}, '${p.name.replace(/'/g,"\\'")}', ${p.salePrice || p.price}, '${p.imageUrl || ''}')">
        Add to Cart
      </button>
    </div>
    ${!p.inStock ? '<div class="out-of-stock">Out of Stock</div>' : ''}
  </div>`;
}

// ── Product Detail Modal ──────────────────────────────────────
async function openProductModal(id) {
  const modal = document.getElementById('productModal');
  const body = document.getElementById('productModalBody');
  modal.classList.add('open');
  body.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  try {
    const p = await api('GET', `/products/${id}`);
    const reviews = await api('GET', `/products/${id}/reviews`);
    const price = p.salePrice ? `<span class="original-price">${formatPrice(p.price)}</span> ${formatPrice(p.salePrice)}` : formatPrice(p.price);
    const stars = Array.from({length:5},(_,i)=>`<span style="color:${i<Math.round(p.averageRating||0)?'#f0c040':'#ccc'}">★</span>`).join('');
    const benefits = (p.keyBenefits||[]).map(b=>`<li>✅ ${b}</li>`).join('');
    const reviewsHtml = reviews.length ? reviews.map(r=>`
      <div class="review-item">
        <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
        <p class="review-text">"${r.comment}"</p>
        <p class="review-author">— ${r.reviewerName || 'Anonymous'} ${r.verified?'<span class="verified">✓ Verified</span>':''}</p>
      </div>`).join('') : '<p style="color:#999;">No reviews yet. Be the first!</p>';

    body.innerHTML = `
      <div class="product-detail">
        <div class="product-detail-img">
          <img src="${p.imageUrl || 'https://via.placeholder.com/400x400/1a3a1a/ffffff?text=' + encodeURIComponent(p.name)}"
               alt="${p.name}" onerror="this.src='https://via.placeholder.com/400x400/1a3a1a/ffffff?text=ReforceLife'">
        </div>
        <div class="product-detail-info">
          <span class="product-detail-category">${(p.category||'').replace(/_/g,' ')}</span>
          <h2>${p.name}</h2>
          <div class="product-detail-stars">${stars} <span>${p.averageRating||0} (${p.totalReviews||0} reviews)</span></div>
          <div class="product-detail-price">${price}</div>
          <p class="product-detail-desc">${p.description || ''}</p>
          ${benefits ? `<h4>Key Benefits</h4><ul class="benefits-list">${benefits}</ul>` : ''}
          ${p.servingSize ? `<p class="product-detail-meta">Serving: ${p.servingSize} | ${p.servingsPerContainer} servings</p>` : ''}
          ${p.inStock ? `
          <div class="product-detail-actions">
            <div class="qty-selector">
              <button onclick="this.nextElementSibling.value=Math.max(1,+this.nextElementSibling.value-1)">−</button>
              <input type="number" value="1" min="1" max="99" id="pdQty">
              <button onclick="this.previousElementSibling.value=Math.min(99,+this.previousElementSibling.value+1)">+</button>
            </div>
            <button class="btn-primary" onclick="addCartFromDetail(${p.id},'${p.name.replace(/'/g,"\\'")}',${p.salePrice||p.price},'${p.imageUrl||''}')">
              Add to Cart
            </button>
          </div>` : '<div class="out-of-stock-label">Out of Stock</div>'}
          <div class="product-detail-share">SKU: ${p.sku||'—'} | Weight: ${p.weight||'—'} oz</div>
        </div>
      </div>
      ${p.ingredients ? `<div class="product-ingredients"><h4>Ingredients</h4><p>${p.ingredients}</p></div>` : ''}
      <div class="product-reviews-section">
        <h3>Customer Reviews</h3>
        <div class="reviews-list">${reviewsHtml}</div>
        <div class="add-review">
          <h4>Write a Review</h4>
          <div class="star-select" id="starSelect">
            ${[1,2,3,4,5].map(n=>`<span onclick="selectStar(${n},${p.id})" data-val="${n}">★</span>`).join('')}
          </div>
          <input type="hidden" id="reviewRating" value="0">
          <textarea id="reviewComment" placeholder="Share your experience..." rows="3"></textarea>
          <input type="text" id="reviewName" placeholder="Your name (optional)">
          <button class="btn-primary" onclick="submitReview(${p.id})">Submit Review</button>
        </div>
      </div>`;
  } catch (err) { body.innerHTML = `<p style="color:#c00;">Error: ${err.message}</p>`; }
}

function addCartFromDetail(id, name, price, image) {
  const qty = parseInt(document.getElementById('pdQty')?.value || 1);
  for (let i = 0; i < qty; i++) addToCart(id, name, price, image);
  closeProductModal();
  openCart();
}

function closeProductModal() { document.getElementById('productModal').classList.remove('open'); }

function selectStar(val, productId) {
  document.getElementById('reviewRating').value = val;
  document.querySelectorAll('#starSelect span').forEach((s,i) => {
    s.style.color = i < val ? '#f0c040' : '#ccc';
  });
}

async function submitReview(productId) {
  const rating = parseInt(document.getElementById('reviewRating').value);
  const comment = document.getElementById('reviewComment').value.trim();
  const reviewerName = document.getElementById('reviewName').value.trim();
  if (!rating) return toast('Please select a star rating', 'error');
  if (!comment) return toast('Please write a comment', 'error');
  try {
    await api('POST', `/products/${productId}/reviews`, { rating, comment, reviewerName });
    toast('Review submitted! Thank you 🌿');
    openProductModal(productId);
  } catch (err) { toast(err.message, 'error'); }
}

// ── Checkout Modal ────────────────────────────────────────────
function openCheckout() {
  if (!cart.length) return toast('Your cart is empty', 'error');
  closeCart();
  const modal = document.getElementById('checkoutModal');
  modal.classList.add('open');
  renderCheckoutSummary();
  if (user) prefillShipping();
}
function closeCheckout() { document.getElementById('checkoutModal').classList.remove('open'); }

function renderCheckoutSummary() {
  const el = document.getElementById('checkoutItems');
  if (!el) return;
  const tax = cartTotal() * 0.08;
  const shipping = cartTotal() >= 50 ? 0 : 5.99;
  el.innerHTML = cart.map(i => `
    <div class="checkout-item">
      <span>${i.name} × ${i.qty}</span>
      <span>${formatPrice(i.price * i.qty)}</span>
    </div>`).join('') + `
    <hr>
    <div class="checkout-item"><span>Subtotal</span><span>${formatPrice(cartTotal())}</span></div>
    <div class="checkout-item"><span>Shipping</span><span>${shipping===0?'FREE':formatPrice(shipping)}</span></div>
    <div class="checkout-item"><span>Tax (8%)</span><span>${formatPrice(tax)}</span></div>
    <div class="checkout-item total"><span>Total</span><span>${formatPrice(cartTotal()+tax+shipping)}</span></div>`;
}

function prefillShipping() {
  if (!user) return;
  const f = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
  f('ckFirstName', user.firstName);
  f('ckLastName', user.lastName);
  f('ckEmail', user.email);
  f('ckPhone', user.phone);
}

async function placeOrder() {
  const get = id => document.getElementById(id)?.value?.trim();
  const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || 'PAYPAL';

  if (!get('ckFirstName') || !get('ckAddress') || !get('ckCity') || !get('ckZip')) {
    return toast('Please fill in all required shipping fields', 'error');
  }

  const btn = document.getElementById('placeOrderBtn');
  btn.disabled = true; btn.textContent = 'Processing...';

  try {
    const body = {
      shippingFirstName: get('ckFirstName'),
      shippingLastName: get('ckLastName'),
      shippingAddress1: get('ckAddress'),
      shippingCity: get('ckCity'),
      shippingState: get('ckState'),
      shippingZip: get('ckZip'),
      shippingCountry: get('ckCountry') || 'US',
      shippingPhone: get('ckPhone'),
      guestEmail: user ? null : get('ckEmail'),
      guestName: user ? null : `${get('ckFirstName')} ${get('ckLastName')}`,
      paymentMethod: payMethod,
      items: cart.map(i => ({ productId: i.id, quantity: i.qty })),
      notes: get('ckNotes')
    };

    const order = await api('POST', '/orders/checkout', body);

    // PayPal flow
    if (payMethod === 'PAYPAL') {
      showPayPalButton(order.id);
      return;
    }

    // Square flow
    if (payMethod === 'SQUARE') {
      showSquareForm(order.id);
      return;
    }

    orderSuccess(order);
  } catch (err) {
    toast(err.message, 'error');
    btn.disabled = false; btn.textContent = 'Place Order';
  }
}

function showPayPalButton(orderId) {
  document.getElementById('paypalContainer').style.display = 'block';
  document.getElementById('placeOrderBtn').style.display = 'none';
  // PayPal SDK renders here — initialized in initPayPal()
  window._pendingOrderId = orderId;
  if (window.paypal) initPayPalButtons(orderId);
}

function initPayPalButtons(orderId) {
  const container = document.getElementById('paypal-button-container');
  if (!container) return;
  container.innerHTML = '';
  paypal.Buttons({
    createOrder: (data, actions) => actions.order.create({
      purchase_units: [{ amount: { value: cartTotal().toFixed(2) } }]
    }),
    onApprove: async (data, actions) => {
      const details = await actions.order.capture();
      await api('POST', '/orders/confirm-payment', {
        orderId, transactionId: details.id, status: 'COMPLETED'
      });
      orderSuccess({ orderNumber: 'RL-' + orderId, totalAmount: cartTotal() });
    },
    onError: (err) => toast('PayPal error: ' + err, 'error')
  }).render('#paypal-button-container');
}

function showSquareForm(orderId) {
  document.getElementById('squareContainer').style.display = 'block';
  document.getElementById('placeOrderBtn').style.display = 'none';
  window._pendingOrderId = orderId;
  document.getElementById('squarePayBtn').onclick = async () => {
    try {
      await api('POST', '/orders/confirm-payment', { orderId, transactionId: 'sq_' + Date.now(), status: 'COMPLETED' });
      orderSuccess({ orderNumber: 'RL-' + orderId, totalAmount: cartTotal() });
    } catch (err) { toast(err.message, 'error'); }
  };
}

function orderSuccess(order) {
  cart = []; saveCart(); updateCartUI();
  closeCheckout();
  document.getElementById('orderSuccessModal').classList.add('open');
  document.getElementById('successOrderNum').textContent = order.orderNumber || 'Confirmed';
  document.getElementById('successTotal').textContent = formatPrice(order.totalAmount || 0);
}
function closeOrderSuccess() { document.getElementById('orderSuccessModal').classList.remove('open'); }

// ── My Orders ─────────────────────────────────────────────────
async function openMyOrders() {
  if (!user) return openAuth('login');
  document.getElementById('myOrdersModal').classList.add('open');
  const body = document.getElementById('myOrdersBody');
  body.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  try {
    const orders = await api('GET', '/orders/my');
    if (!orders.length) { body.innerHTML = '<p style="text-align:center;padding:2rem;color:#666;">No orders yet.</p>'; return; }
    body.innerHTML = orders.map(o => `
      <div class="order-card">
        <div class="order-card-header">
          <span class="order-num">#${o.orderNumber}</span>
          <span class="order-status status-${o.status.toLowerCase()}">${o.status}</span>
          <span class="order-date">${new Date(o.createdAt).toLocaleDateString()}</span>
          <span class="order-total">${formatPrice(o.totalAmount)}</span>
        </div>
        <div class="order-items-mini">${(o.items||[]).map(i=>`<span>${i.productName} ×${i.quantity}</span>`).join(' · ')}</div>
      </div>`).join('');
  } catch (err) { body.innerHTML = `<p style="color:#c00;">${err.message}</p>`; }
}
function closeMyOrders() { document.getElementById('myOrdersModal').classList.remove('open'); }

// ── Admin Dashboard ───────────────────────────────────────────
async function openAdmin() {
  if (!user || user.role !== 'admin') return toast('Admin access required', 'error');
  document.getElementById('adminModal').classList.add('open');
  loadAdminProducts();
}
function closeAdmin() { document.getElementById('adminModal').classList.remove('open'); }

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = c.id === `admin-${tab}` ? 'block' : 'none');
  if (tab === 'products') loadAdminProducts();
  if (tab === 'orders') loadAdminOrders();
  if (tab === 'messages') loadAdminMessages();
}

async function loadAdminProducts() {
  const el = document.getElementById('adminProductsList');
  if (!el) return;
  el.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  const data = await api('GET', '/products?limit=50');
  const products = data.products || data;
  el.innerHTML = `
    <button class="btn-primary" onclick="openAddProduct()" style="margin-bottom:1rem;">+ Add Product</button>
    <table class="admin-table">
      <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Category</th><th>Actions</th></tr></thead>
      <tbody>${products.map(p=>`
        <tr>
          <td>${p.name}</td>
          <td>${formatPrice(p.price)}</td>
          <td><input type="number" value="${p.stockQuantity}" onchange="updateStock(${p.id},this.value)" style="width:60px;border:1px solid #ccc;border-radius:4px;padding:2px 4px;"></td>
          <td>${(p.category||'').replace(/_/g,' ')}</td>
          <td>
            <button class="admin-btn" onclick="editProduct(${p.id})">Edit</button>
            <button class="admin-btn danger" onclick="deleteProduct(${p.id})">Delete</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

async function updateStock(id, qty) {
  try { await api('PATCH', `/admin/products/${id}/stock`, { stockQuantity: parseInt(qty) }); toast('Stock updated'); }
  catch (err) { toast(err.message, 'error'); }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try { await api('DELETE', `/admin/products/${id}`); toast('Product deleted'); loadAdminProducts(); }
  catch (err) { toast(err.message, 'error'); }
}

function openAddProduct() {
  document.getElementById('productFormModal').classList.add('open');
  document.getElementById('productFormTitle').textContent = 'Add Product';
  document.getElementById('productForm').reset();
  document.getElementById('productFormId').value = '';
}

async function editProduct(id) {
  const p = await api('GET', `/products/${id}`);
  document.getElementById('productFormModal').classList.add('open');
  document.getElementById('productFormTitle').textContent = 'Edit Product';
  document.getElementById('productFormId').value = p.id;
  document.getElementById('pfName').value = p.name;
  document.getElementById('pfPrice').value = p.price;
  document.getElementById('pfSalePrice').value = p.salePrice || '';
  document.getElementById('pfCategory').value = p.category || '';
  document.getElementById('pfStock').value = p.stockQuantity;
  document.getElementById('pfShortDesc').value = p.shortDescription || '';
  document.getElementById('pfDesc').value = p.description || '';
  document.getElementById('pfBenefits').value = (p.keyBenefits||[]).join('\n');
  document.getElementById('pfIngredients').value = p.ingredients || '';
  document.getElementById('pfSku').value = p.sku || '';
  document.getElementById('pfFeatured').checked = p.featured;
}

async function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('productFormId').value;
  const formData = new FormData();
  const fields = { name:'pfName', price:'pfPrice', salePrice:'pfSalePrice', category:'pfCategory',
    stockQuantity:'pfStock', shortDescription:'pfShortDesc', description:'pfDesc',
    ingredients:'pfIngredients', sku:'pfSku' };
  Object.entries(fields).forEach(([k,v]) => { const val=document.getElementById(v)?.value; if(val) formData.append(k,val); });
  formData.append('featured', document.getElementById('pfFeatured').checked);
  const benefits = document.getElementById('pfBenefits').value.split('\n').filter(Boolean);
  formData.append('keyBenefits', JSON.stringify(benefits));
  const img = document.getElementById('pfImage').files[0];
  if (img) formData.append('image', img);

  try {
    const method = id ? 'PUT' : 'POST';
    const path = id ? `/admin/products/${id}` : '/admin/products';
    const res = await fetch(API + path, { method, headers: { Authorization: `Bearer ${token}` }, body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    toast(id ? 'Product updated!' : 'Product created!');
    closeProductForm();
    loadAdminProducts();
  } catch (err) { toast(err.message, 'error'); }
}

function closeProductForm() { document.getElementById('productFormModal').classList.remove('open'); }

async function loadAdminOrders() {
  const el = document.getElementById('adminOrdersList');
  if (!el) return;
  el.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  const orders = await api('GET', '/admin/orders');
  el.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Update</th></tr></thead>
      <tbody>${orders.map(o=>`
        <tr>
          <td>${o.orderNumber}</td>
          <td>${o.user?o.user.firstName+' '+o.user.lastName:o.guestName||o.guestEmail||'Guest'}</td>
          <td>${formatPrice(o.totalAmount)}</td>
          <td><span class="order-status status-${(o.status||'').toLowerCase()}">${o.status}</span></td>
          <td>${new Date(o.createdAt).toLocaleDateString()}</td>
          <td>
            <select onchange="updateOrderStatus(${o.id},this.value)" style="border:1px solid #ccc;border-radius:4px;padding:2px;">
              ${['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}
            </select>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

async function updateOrderStatus(id, status) {
  try { await api('PATCH', `/admin/orders/${id}/status`, { status }); toast('Order updated'); }
  catch (err) { toast(err.message, 'error'); }
}

async function loadAdminMessages() {
  const el = document.getElementById('adminMessagesList');
  if (!el) return;
  el.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  const msgs = await api('GET', '/admin/messages');
  if (!msgs.length) { el.innerHTML = '<p style="padding:1rem;color:#666;">No messages yet.</p>'; return; }
  el.innerHTML = msgs.map(m=>`
    <div class="message-card ${m.read?'':'unread'}">
      <div class="message-card-header">
        <strong>${m.firstName} ${m.lastName}</strong>
        <span>${m.email}</span>
        <span>${new Date(m.createdAt).toLocaleDateString()}</span>
        ${!m.read?`<button class="admin-btn" onclick="markRead(${m.id},this)">Mark Read</button>`:''}
      </div>
      <p><strong>${m.subject}</strong></p>
      <p>${m.message}</p>
    </div>`).join('');
}

async function markRead(id, btn) {
  try { await api('PATCH', `/admin/messages/${id}/read`); btn.closest('.message-card').classList.remove('unread'); btn.remove(); }
  catch (err) { toast(err.message, 'error'); }
}

// ── Contact Form ──────────────────────────────────────────────
async function submitContactForm() {
  const get = id => document.getElementById(id)?.value?.trim();
  const firstName = get('contactFirst') || get('contactFirstName');
  const lastName = get('contactLast') || get('contactLastName');
  const email = get('contactEmail');
  const subject = get('contactSubject') || 'General Inquiry';
  const message = get('contactMessage');
  if (!firstName || !email || !message) return toast('Please fill required fields', 'error');
  try {
    await api('POST', '/contact', { firstName, lastName, email, subject, message });
    toast('Message sent! We\'ll reply within 24 hours 🌿');
    document.querySelectorAll('#contactForm input, #contactForm textarea, #contactForm select').forEach(el => el.value = '');
    const success = document.getElementById('formSuccess');
    if (success) success.style.display = 'block';
  } catch (err) { toast(err.message, 'error'); }
}

// ── Video Section ─────────────────────────────────────────────
function initVideos() {
  const videos = [
    { id: 'Ha90h8_gyoQ', title: 'ReforceLife — Our Story' },
    { id: 'QQHPg5R9VQs', title: 'The Science Behind ReforceLife' },
    { id: '0h04M_emoMg', title: 'How Our Formulas Work' }
  ];
  const container = document.getElementById('videosGrid');
  if (!container) return;
  container.innerHTML = videos.map(v => `
    <div class="video-card">
      <div class="video-thumb" onclick="playVideo('${v.id}', this)">
        <img src="https://img.youtube.com/vi/${v.id}/hqdefault.jpg" alt="${v.title}">
        <div class="video-play-btn">▶</div>
      </div>
      <p class="video-title">${v.title}</p>
    </div>`).join('');
}

function playVideo(videoId, el) {
  el.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?autoplay=1"
    frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  updateAuthUI();
  loadProducts();
  initVideos();

  // Wire contact form submit button
  const cfBtn = document.querySelector('.form-submit');
  if (cfBtn) cfBtn.onclick = submitContactForm;

  // Close modals on overlay click
  document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) {
      document.querySelectorAll('.modal.open, .cart-drawer.open').forEach(m => m.classList.remove('open'));
      document.querySelectorAll('.cart-overlay.open').forEach(m => m.classList.remove('open'));
    }
  });

  // Load PayPal SDK
  const ppScript = document.createElement('script');
  ppScript.src = `https://www.paypal.com/sdk/js?client-id=${window.PAYPAL_CLIENT_ID||'test'}&currency=USD`;
  ppScript.onload = () => { if (window._pendingOrderId) initPayPalButtons(window._pendingOrderId); };
  document.head.appendChild(ppScript);
});
