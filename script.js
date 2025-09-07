'use strict';

// ====== CONFIG ======
const config = {
	businessName: 'Peanut Burger Delight',
	// Include country code, digits only. Example: Nigeria +234, Ghana +233
	businessWhatsAppNumber: '2348012345678',
	currency: 'NGN',
	currencySymbol: '₦',
	deliveryFees: {
		standard: 1200,
		express: 2500
	},
	products: [
		{ id: 'small-pack', title: 'Small Pack', emoji: '🥜', size: '150g', price: 800, description: 'Perfect pocket snack' },
		{ id: 'medium-pack', title: 'Medium Pack', emoji: '🥜', size: '300g', price: 1500, description: 'Great for sharing' },
		{ id: 'large-jar', title: 'Large Jar', emoji: '🥜', size: '750g', price: 3500, description: 'Party and family size' },
	]
};

// ====== UTILITIES ======
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const formatMoney = (value) => `${config.currencySymbol}${value.toLocaleString('en-NG')}`;
const clamp = (num, min, max) => Math.max(min, Math.min(num, max));

function showToast(message) {
	const toast = qs('#toast');
	toast.textContent = message;
	toast.classList.add('show');
	clearTimeout(showToast._t);
	showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
}

function storageGet(key, fallback) {
	try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function storageSet(key, value) {
	try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ====== STATE ======
const state = {
	cart: storageGet('cart', {}), // { productId: quantity }
	get itemsCount() { return Object.values(this.cart).reduce((a, b) => a + b, 0); },
	get subtotal() {
		return Object.entries(this.cart).reduce((sum, [id, qty]) => {
			const product = config.products.find(p => p.id === id);
			return sum + (product ? product.price * qty : 0);
		}, 0);
	}
};

// ====== RENDER PRODUCTS ======
function renderProducts() {
	const grid = qs('#productGrid');
	grid.innerHTML = '';
	for (const product of config.products) {
		const card = document.createElement('div');
		card.className = 'product-card';
		card.innerHTML = `
			<div class="product-media">${product.emoji}</div>
			<div>
				<div class="product-title">${product.title} • ${product.size}</div>
				<div class="product-meta">${product.description}</div>
			</div>
			<div class="price-row">
				<strong>${formatMoney(product.price)}</strong>
				<div class="qty" data-id="${product.id}">
					<button type="button" class="qty-dec" aria-label="Decrease">−</button>
					<input class="qty-input" type="number" min="1" max="99" value="1" inputmode="numeric" />
					<button type="button" class="qty-inc" aria-label="Increase">+</button>
				</div>
			</div>
			<button class="btn btn-primary add-to-cart" data-id="${product.id}">Add to cart</button>
		`;
		grid.appendChild(card);
	}

	grid.addEventListener('click', (e) => {
		const button = e.target.closest('.add-to-cart');
		if (!button) return;
		const id = button.getAttribute('data-id');
		const qtyInput = button.parentElement.querySelector('.qty-input');
		const qty = clamp(parseInt(qtyInput.value || '1', 10), 1, 99);
		addToCart(id, qty);
	});

	grid.addEventListener('click', (e) => {
		const dec = e.target.closest('.qty-dec');
		const inc = e.target.closest('.qty-inc');
		if (dec || inc) {
			const wrap = e.target.closest('.qty');
			const input = wrap.querySelector('.qty-input');
			let v = parseInt(input.value || '1', 10);
			v = clamp(v + (inc ? 1 : -1), 1, 99);
			input.value = String(v);
		}
	});
}

// ====== CART LOGIC ======
function addToCart(productId, quantity = 1) {
	state.cart[productId] = (state.cart[productId] || 0) + quantity;
	storageSet('cart', state.cart);
	updateCartUI();
	showToast('Added to cart');
}
function removeFromCart(productId) {
	delete state.cart[productId];
	storageSet('cart', state.cart);
	updateCartUI();
}
function setCartQuantity(productId, quantity) {
	if (quantity <= 0) { removeFromCart(productId); return; }
	state.cart[productId] = clamp(quantity, 1, 99);
	storageSet('cart', state.cart);
	updateCartUI();
}

function updateCartUI() {
	qs('#cartCount').textContent = state.itemsCount;
	const itemsWrap = qs('#cartItems');
	itemsWrap.innerHTML = '';

	for (const [id, qty] of Object.entries(state.cart)) {
		const product = config.products.find(p => p.id === id);
		if (!product) continue;
		const lineTotal = product.price * qty;
		const el = document.createElement('div');
		el.className = 'cart-item';
		el.innerHTML = `
			<div class="cart-item-media">${product.emoji}</div>
			<div>
				<div class="cart-item-title">${product.title}</div>
				<div class="cart-item-meta">${product.size} • ${formatMoney(product.price)} × <input class="ci-qty" type="number" min="1" max="99" value="${qty}" /> = <strong>${formatMoney(lineTotal)}</strong></div>
			</div>
			<button class="icon-btn ci-remove" aria-label="Remove">✕</button>
		`;
		el.querySelector('.ci-remove').addEventListener('click', () => removeFromCart(id));
		el.querySelector('.ci-qty').addEventListener('change', (ev) => setCartQuantity(id, parseInt(ev.target.value || '1', 10)));
		itemsWrap.appendChild(el);
	}

	const subtotal = state.subtotal;
	qs('#cartSubtotal').textContent = formatMoney(subtotal);
	const deliveryMethod = qs('#deliveryMethod')?.value || 'standard';
	const deliveryFee = config.deliveryFees[deliveryMethod] || 0;
	qs('#cartDelivery').textContent = formatMoney(deliveryFee);
	qs('#cartTotal').textContent = formatMoney(subtotal + deliveryFee);

	updateSummary();
}

function updateSummary() {
	qs('#summaryItems').textContent = `${state.itemsCount} item(s)`;
	qs('#summarySubtotal').textContent = formatMoney(state.subtotal);
	const deliveryMethod = qs('#deliveryMethod')?.value || 'standard';
	const deliveryFee = config.deliveryFees[deliveryMethod] || 0;
	qs('#summaryDelivery').textContent = formatMoney(deliveryFee);
	qs('#summaryTotal').textContent = formatMoney(state.subtotal + deliveryFee);
}

// ====== CHECKOUT ======
function setupCheckout() {
	const form = qs('#checkoutForm');
	if (!form) return;

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		if (state.itemsCount === 0) { showToast('Your cart is empty'); return; }
		const data = new FormData(form);
		const customerName = String(data.get('customerName') || '').trim();
		const customerPhone = String(data.get('customerPhone') || '').trim();
		const customerAddress = String(data.get('customerAddress') || '').trim();
		const deliveryMethod = String(data.get('deliveryMethod') || 'standard');
		const deliveryNotes = String(data.get('deliveryNotes') || '').trim();

		if (!customerName || !customerPhone || !customerAddress) {
			showToast('Please fill in all required fields');
			return;
		}

		const orderLines = Object.entries(state.cart).map(([id, qty]) => {
			const p = config.products.find(pp => pp.id === id);
			return p ? `• ${p.title} (${p.size}) x${qty} = ${formatMoney(p.price * qty)}` : '';
		}).filter(Boolean).join('\n');
		const deliveryFee = config.deliveryFees[deliveryMethod] || 0;
		const total = state.subtotal + deliveryFee;

		const message = `Hello %2A${encodeURIComponent(config.businessName)}%2A!%0A%0A` +
			`I would like to place an order:%0A` +
			`${encodeURIComponent(orderLines)}%0A%0A` +
			`Subtotal: ${encodeURIComponent(formatMoney(state.subtotal))}%0A` +
			`Delivery (${deliveryMethod}): ${encodeURIComponent(formatMoney(deliveryFee))}%0A` +
			`Total: ${encodeURIComponent(formatMoney(total))}%0A%0A` +
			`Name: ${encodeURIComponent(customerName)}%0A` +
			`Phone: ${encodeURIComponent(customerPhone)}%0A` +
			`Address: ${encodeURIComponent(customerAddress)}%0A` +
			(deliveryNotes ? `Notes: ${encodeURIComponent(deliveryNotes)}%0A` : '');

		const waUrl = `https://wa.me/${config.businessWhatsAppNumber}?text=${message}`;
		window.open(waUrl, '_blank', 'noopener');
		showToast('Opening WhatsApp…');
	});

	qs('#deliveryMethod').addEventListener('change', () => updateCartUI());
}

// ====== CART PANEL ======
function setupCartPanel() {
	const panel = qs('#cartPanel');
	const openBtn = qs('#openCartBtn');
	const closeBtn = qs('#closeCartBtn');
	openBtn.addEventListener('click', () => { panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false'); });
	closeBtn.addEventListener('click', () => { panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); });
}

// ====== FAQ TOGGLE ======
function setupFAQ() {
	qsa('.faq-item').forEach(item => {
		const q = item.querySelector('.faq-q');
		const a = item.querySelector('.faq-a');
		q.addEventListener('click', () => {
			const open = q.getAttribute('aria-expanded') === 'true';
			q.setAttribute('aria-expanded', String(!open));
			a.style.display = open ? 'none' : 'block';
		});
	});
}

// ====== CONTACT LINKS ======
function setupContactLinks() {
	const wa = qs('#contactWhatsApp');
	wa.href = `https://wa.me/${config.businessWhatsAppNumber}`;
	const email = qs('#contactEmail');
	email.href = 'mailto:orders@example.com';
}

// ====== INIT ======
window.addEventListener('DOMContentLoaded', () => {
	qs('#year').textContent = new Date().getFullYear();
	renderProducts();
	setupCartPanel();
	setupFAQ();
	setupCheckout();
	setupContactLinks();
	updateCartUI();

	// Smooth scroll for nav links
	qsa('a[href^="#"]').forEach(a => {
		a.addEventListener('click', (e) => {
			const href = a.getAttribute('href');
			if (!href || href === '#') return;
			const el = qs(href);
			if (!el) return;
			e.preventDefault();
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	});
}); 