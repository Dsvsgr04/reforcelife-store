const { Order, OrderItem, Product, User } = require('../models');
const { sendOrderConfirmation } = require('../utils/email');

let orderSeq = 1;
const generateOrderNumber = () => {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `RL-${date}-${String(orderSeq++).padStart(4,'0')}`;
};

const TAX_RATE = 0.08;
const SHIPPING_COST = 5.99;
const FREE_SHIPPING_MIN = 50;

exports.checkout = async (req, res) => {
  const t = await Order.sequelize.transaction();
  try {
    const {
      shippingFirstName, shippingLastName, shippingAddress1, shippingAddress2,
      shippingCity, shippingState, shippingZip, shippingCountry,
      shippingPhone, guestEmail, guestName, paymentMethod, items, notes
    } = req.body;

    if (!items || !items.length) return res.status(400).json({ message: 'Cart is empty' });

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findOne({ where: { id: item.productId, active: true }, transaction: t });
      if (!product) { await t.rollback(); return res.status(404).json({ message: `Product ${item.productId} not found` }); }
      if (!product.inStock || product.stockQuantity < item.quantity) {
        await t.rollback();
        return res.status(400).json({ message: `Insufficient stock: ${product.name}` });
      }
      const price = parseFloat(product.salePrice || product.price);
      const lineTotal = price * item.quantity;
      subtotal += lineTotal;
      orderItems.push({ product, quantity: item.quantity, unitPrice: price, totalPrice: lineTotal });
    }

    const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST;
    const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const total = parseFloat((subtotal + shipping + tax).toFixed(2));

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      UserId: req.user?.id || null,
      guestEmail, guestName,
      shippingFirstName, shippingLastName, shippingAddress1, shippingAddress2,
      shippingCity, shippingState, shippingZip, shippingCountry: shippingCountry || 'US',
      shippingPhone,
      subtotal: subtotal.toFixed(2),
      shippingCost: shipping.toFixed(2),
      taxAmount: tax,
      discountAmount: 0,
      totalAmount: total,
      paymentMethod: paymentMethod || 'PAYPAL',
      paymentStatus: 'PENDING',
      status: 'PENDING',
      notes
    }, { transaction: t });

    for (const oi of orderItems) {
      await OrderItem.create({
        OrderId: order.id,
        ProductId: oi.product.id,
        quantity: oi.quantity,
        unitPrice: oi.unitPrice,
        totalPrice: oi.totalPrice,
        productName: oi.product.name,
        productImageUrl: oi.product.imageUrl
      }, { transaction: t });

      await oi.product.update({
        stockQuantity: oi.product.stockQuantity - oi.quantity,
        inStock: (oi.product.stockQuantity - oi.quantity) > 0
      }, { transaction: t });
    }

    await t.commit();

    // Email confirmation
    const emailTo = req.user?.email || guestEmail;
    if (emailTo) {
      const fullOrder = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: 'items' }] });
      sendOrderConfirmation(emailTo, fullOrder).catch(console.error);
    }

    const result = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
    });
    res.status(201).json(result);

  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { orderId, transactionId, status } = req.body;
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await order.update({
      paymentTransactionId: transactionId,
      paymentStatus: status,
      status: status === 'COMPLETED' ? 'CONFIRMED' : order.status
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.myOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { UserId: req.user.id },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role !== 'admin' && order.UserId !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: OrderItem, as: 'items' }, { model: User, as: 'user', attributes: ['id','firstName','lastName','email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await order.update({ status: req.body.status, trackingNumber: req.body.trackingNumber });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
