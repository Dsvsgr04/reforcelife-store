const { Review, Product } = require('../models');
const { ContactMessage } = require('../models/Review');
const { sendContactNotification } = require('../utils/email');

// ─── Reviews ─────────────────────────────────
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { ProductId: req.params.productId, approved: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment, reviewerName } = req.body;
    const productId = req.params.productId;

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const review = await Review.create({
      ProductId: productId,
      UserId: req.user?.id || null,
      reviewerName: reviewerName || (req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Anonymous'),
      rating, comment,
      verified: !!req.user,
      approved: true
    });

    // Recalculate rating
    const all = await Review.findAll({ where: { ProductId: productId, approved: true } });
    const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
    await product.update({ averageRating: avg.toFixed(1), totalReviews: all.length });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await Review.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Contact ─────────────────────────────────
exports.submitContact = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;
    if (!firstName || !email || !message)
      return res.status(400).json({ message: 'Name, email, and message are required' });

    const msg = await ContactMessage.create({ firstName, lastName, email, subject, message });
    sendContactNotification(firstName + ' ' + lastName, email, subject, message).catch(console.error);
    res.status(201).json({ message: 'Message sent successfully', id: msg.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin
exports.getAllMessages = async (req, res) => {
  try {
    const msgs = await ContactMessage.findAll({ order: [['createdAt', 'DESC']] });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await ContactMessage.update({ read: true }, { where: { id: req.params.id } });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
