# Peanut Burger Delight - Static Shop

A simple, responsive landing + mini-shop built with HTML/CSS/JS. Customers can add to cart and place orders via WhatsApp. No backend required.

## Quick start

- Open `index.html` in your browser (double-click) to preview locally.
- Host on any static hosting: GitHub Pages, Netlify, Vercel, Firebase Hosting, Cloudflare Pages.

## Customize

Open `script.js` and edit the config at the top:

```js
const config = {
  businessName: 'Peanut Burger Delight',
  businessWhatsAppNumber: '2348012345678', // include country code, digits only
  currency: 'NGN',
  currencySymbol: '₦',
  deliveryFees: { standard: 1200, express: 2500 },
  products: [
    { id: 'small-pack', title: 'Small Pack', emoji: '🥜', size: '150g', price: 800, description: 'Perfect pocket snack' },
    { id: 'medium-pack', title: 'Medium Pack', emoji: '🥜', size: '300g', price: 1500, description: 'Great for sharing' },
    { id: 'large-jar', title: 'Large Jar', emoji: '🥜', size: '750g', price: 3500, description: 'Party and family size' }
  ]
};
```

- Replace `businessWhatsAppNumber` with your real number (country code + number, no `+`, no spaces), e.g. `2348012345678`.
- Adjust `currency`, `currencySymbol`, `deliveryFees`, and `products` as needed.
- Update `index.html` hero text and sections to match your brand.

## WhatsApp ordering
- Checkout composes an order summary and opens WhatsApp chat with your number.
- Customer details and cart items are included in the message.

## Online payments (placeholder)
- The "Pay Online" button is disabled. You can integrate a gateway later (Paystack, Flutterwave, Stripe, etc.).
- Suggested approach: on click, redirect to gateway checkout with the total and metadata, then confirm via WhatsApp or email.

## Assets
- Product images currently use emoji. Replace with images by editing product rendering in `renderProducts()` and the cart item markup in `updateCartUI()`.

## License
MIT 