const { Product } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

exports.getAll = async (req, res) => {
  try {
    const { category, featured, search, page = 1, limit = 20 } = req.query;
    const where = { active: true };
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;
    if (search) where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Product.findAndCountAll({
      where, limit: parseInt(limit), offset,
      order: [['featured', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({ products: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id, active: true } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    if (data.keyBenefits && typeof data.keyBenefits === 'string') data.keyBenefits = JSON.parse(data.keyBenefits);
    if (data.additionalImages && typeof data.additionalImages === 'string') data.additionalImages = JSON.parse(data.additionalImages);
    if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;
    data.inStock = (parseInt(data.stockQuantity) || 0) > 0;

    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const data = req.body;
    if (data.keyBenefits && typeof data.keyBenefits === 'string') data.keyBenefits = JSON.parse(data.keyBenefits);
    if (data.additionalImages && typeof data.additionalImages === 'string') data.additionalImages = JSON.parse(data.additionalImages);

    if (req.file) {
      // Delete old image
      if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
        const oldPath = path.join(process.cwd(), product.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.imageUrl = `/uploads/${req.file.filename}`;
    }

    if (data.stockQuantity !== undefined) data.inStock = parseInt(data.stockQuantity) > 0;
    await product.update(data);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.update({ active: false }); // soft delete
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const qty = parseInt(req.body.stockQuantity);
    await product.update({ stockQuantity: qty, inStock: qty > 0 });
    res.json({ message: 'Stock updated', stockQuantity: qty });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
