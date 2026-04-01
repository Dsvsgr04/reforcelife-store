const router = require('express').Router();
const authCtrl    = require('../controllers/authController');
const productCtrl = require('../controllers/productController');
const orderCtrl   = require('../controllers/orderController');
const reviewCtrl  = require('../controllers/reviewController');
const { auth, adminOnly, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ─── Auth ─────────────────────────────────────────────────
router.post('/auth/register',        authCtrl.register);
router.post('/auth/login',           authCtrl.login);
router.get('/auth/me',               auth, authCtrl.me);
router.put('/auth/me',               auth, authCtrl.updateProfile);
router.put('/auth/change-password',  auth, authCtrl.changePassword);

// ─── Products (public read) ───────────────────────────────
router.get('/products',              productCtrl.getAll);
router.get('/products/:id',          productCtrl.getById);

// ─── Reviews ─────────────────────────────────────────────
router.get('/products/:productId/reviews',          reviewCtrl.getProductReviews);
router.post('/products/:productId/reviews',         optionalAuth, reviewCtrl.addReview);

// ─── Orders ──────────────────────────────────────────────
router.post('/orders/checkout',      optionalAuth, orderCtrl.checkout);
router.post('/orders/confirm-payment', auth, orderCtrl.confirmPayment);
router.get('/orders/my',             auth, orderCtrl.myOrders);
router.get('/orders/:id',            auth, orderCtrl.getOrder);

// ─── Contact ─────────────────────────────────────────────
router.post('/contact',              reviewCtrl.submitContact);

// ─── Admin: Products ─────────────────────────────────────
router.post('/admin/products',        auth, adminOnly, upload.single('image'), productCtrl.create);
router.put('/admin/products/:id',     auth, adminOnly, upload.single('image'), productCtrl.update);
router.delete('/admin/products/:id',  auth, adminOnly, productCtrl.delete);
router.patch('/admin/products/:id/stock', auth, adminOnly, productCtrl.updateStock);

// ─── Admin: Orders ───────────────────────────────────────
router.get('/admin/orders',           auth, adminOnly, orderCtrl.getAllOrders);
router.patch('/admin/orders/:id/status', auth, adminOnly, orderCtrl.updateStatus);

// ─── Admin: Messages ─────────────────────────────────────
router.get('/admin/messages',         auth, adminOnly, reviewCtrl.getAllMessages);
router.patch('/admin/messages/:id/read', auth, adminOnly, reviewCtrl.markRead);
router.delete('/admin/reviews/:id',   auth, adminOnly, reviewCtrl.deleteReview);

// ─── Admin: Users ────────────────────────────────────────
router.get('/admin/users', auth, adminOnly, async (req, res) => {
  const { User } = require('../models');
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json(users);
});

module.exports = router;
