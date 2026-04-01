require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize, User, Product } = require('../models');

const products = [
  {
    name: 'Trinity Rejuvenation Complex',
    shortDescription: 'Three-in-one cellular renewal, energy, and immunity.',
    description: 'ReforceLife\'s flagship formula — the Trinity Rejuvenation Complex — combines three core pillars of human wellness: cellular renewal, sustained energy, and immune defense. Built on the CORE Human Wellness System, this premium blend supports your body at the mitochondrial level.',
    price: 64.99, salePrice: null,
    category: 'GENERAL_WELLNESS', stockQuantity: 150, featured: true,
    imageUrl: '/uploads/trinity.jpg',
    keyBenefits: ['Cellular renewal & longevity support','Sustained all-day energy without stimulants','Comprehensive immune system reinforcement','Mitochondrial optimization'],
    servingSize: '2 capsules', servingsPerContainer: '60',
    ingredients: 'NAD+ Precursor (NMN), CoQ10, Astragalus Root Extract, Quercetin, Resveratrol, Zinc, Selenium, Vitamin C, Vitamin D3, Bioperine',
    sku: 'RL-001', weight: 2.5
  },
  {
    name: 'Metabolic Energy Complex',
    shortDescription: 'Ignite your metabolism. Sustain clean energy all day.',
    description: 'ReforceLife\'s Metabolic Energy Complex is precision-formulated to support healthy metabolism, enhance cellular energy production, and maintain optimal thyroid function — without the crash of stimulant-based products.',
    price: 54.99,
    category: 'METABOLISM', stockQuantity: 120, featured: true,
    imageUrl: '/uploads/metabolic.jpg',
    keyBenefits: ['Boosts metabolic rate naturally','Supports thyroid hormone balance','Enhances mitochondrial ATP production','Reduces fatigue and brain fog'],
    servingSize: '2 capsules', servingsPerContainer: '60',
    ingredients: 'L-Carnitine, Alpha Lipoic Acid, B-Complex (B1,B2,B3,B5,B6,B12), Iodine, Selenium, Green Tea Extract (EGCG), Ashwagandha, Chromium Picolinate',
    sku: 'RL-002', weight: 2.4
  },
  {
    name: 'Glucose Balance Formula',
    shortDescription: 'Precision blood sugar support for metabolic health.',
    description: 'Support healthy blood glucose levels, insulin sensitivity, and carbohydrate metabolism with our science-backed Glucose Balance Formula. Ideal for those managing diet, weight, or energy fluctuations throughout the day.',
    price: 49.99,
    category: 'METABOLISM', stockQuantity: 100, featured: false,
    imageUrl: '/uploads/glucose.jpg',
    keyBenefits: ['Supports healthy blood sugar levels','Improves insulin sensitivity','Reduces post-meal glucose spikes','Supports pancreatic beta-cell health'],
    servingSize: '1 capsule', servingsPerContainer: '90',
    ingredients: 'Berberine HCL, Chromium Picolinate, Cinnamon Bark Extract, Gymnema Sylvestre, Alpha Lipoic Acid, Bitter Melon Extract, Vanadium',
    sku: 'RL-003', weight: 2.1
  },
  {
    name: 'Anti-Inflammatory Blend',
    shortDescription: 'Botanical defense against chronic inflammation.',
    description: 'Chronic inflammation is at the root of most modern disease. Our Anti-Inflammatory Blend delivers the most clinically supported botanical anti-inflammatory compounds in therapeutic doses — supporting joints, gut, and cardiovascular health.',
    price: 52.99,
    category: 'ANTI_INFLAMMATORY', stockQuantity: 90, featured: true,
    imageUrl: '/uploads/anti-inflammatory.jpg',
    keyBenefits: ['Reduces systemic inflammatory markers','Supports joint mobility and comfort','Protects cardiovascular lining','Gut inflammation relief'],
    servingSize: '2 capsules', servingsPerContainer: '60',
    ingredients: 'Curcumin (95% extract) with Bioperine, Boswellia Serrata, Omega-3 (EPA/DHA), Ginger Root Extract, Bromelain, Resveratrol, Quercetin',
    sku: 'RL-004', weight: 2.6
  },
  {
    name: 'Fat Absorption Support',
    shortDescription: 'Optimize digestion. Support metabolism. Feel lighter.',
    description: 'ReforceLife\'s Fat Absorption Support is designed to help your body manage dietary fats more efficiently — so you can feel your best without the bloat. Whether you\'re on a weight management journey or just want smoother digestion, this formula supports healthy fat metabolism and nutrient utilization.',
    price: 47.99,
    category: 'WEIGHT_MANAGEMENT', stockQuantity: 110, featured: false,
    imageUrl: '/uploads/fat-support.jpg',
    keyBenefits: ['Enhances fat breakdown & absorption','Promotes fat-soluble vitamin uptake (A, D, E, K)','Reduces post-meal bloating','Supports metabolic balance'],
    servingSize: '1 capsule with meals', servingsPerContainer: '90',
    ingredients: 'Lipase Enzyme Complex, Bile Salts, Betaine HCL, Artichoke Leaf Extract, Dandelion Root, Phosphatidylcholine, Ginger Root',
    sku: 'RL-005', weight: 2.0
  },
  {
    name: 'Immune Defense System',
    shortDescription: 'Comprehensive 365-day immune protection formula.',
    description: 'The ReforceLife Immune Defense System is a comprehensive, multi-layered immune formula that activates innate and adaptive immunity. Formulated for year-round protection — not just cold and flu season.',
    price: 44.99,
    category: 'IMMUNITY', stockQuantity: 200, featured: true,
    imageUrl: '/uploads/immune.jpg',
    keyBenefits: ['Activates natural killer (NK) cells','Supports T-cell and B-cell function','Antiviral and antibacterial botanical support','Reduces recovery time from illness'],
    servingSize: '2 capsules', servingsPerContainer: '60',
    ingredients: 'Vitamin C (1000mg), Vitamin D3 (5000IU), Zinc (30mg), Elderberry Extract, Beta-Glucan, Echinacea, Andrographis, Astragalus, Selenium',
    sku: 'RL-006', weight: 2.3
  },
  {
    name: 'Digestive Harmony',
    shortDescription: 'Complete probiotic, prebiotic & enzyme gut formula.',
    description: 'A healthy gut is the foundation of all health. Digestive Harmony combines probiotics, prebiotics, and digestive enzymes into one complete formula — restoring microbial balance, improving nutrient absorption, and eliminating digestive discomfort.',
    price: 49.99,
    category: 'DIGESTION', stockQuantity: 130, featured: false,
    imageUrl: '/uploads/digestive.jpg',
    keyBenefits: ['50 Billion CFU multi-strain probiotic blend','Prebiotic fiber for microbiome growth','Full-spectrum digestive enzymes','Relieves bloating, gas, and IBS symptoms'],
    servingSize: '1 capsule', servingsPerContainer: '60',
    ingredients: 'Probiotic Blend (Lactobacillus, Bifidobacterium - 50B CFU), Prebiotic FOS & Inulin, Amylase, Protease, Lipase, Lactase, Bromelain, Papain',
    sku: 'RL-007', weight: 2.2
  },
  {
    name: 'Detox & Cellular Cleanse',
    shortDescription: 'Deep cellular detoxification and liver support.',
    description: 'Our Detox & Cellular Cleanse formula supports all three phases of liver detoxification while binding and eliminating environmental toxins, heavy metals, and metabolic waste — leaving you feeling lighter, clearer, and more energetic.',
    price: 51.99,
    category: 'DETOX', stockQuantity: 80, featured: false,
    imageUrl: '/uploads/detox.jpg',
    keyBenefits: ['Supports Phase I, II & III liver detox','Heavy metal binding and elimination','Antioxidant protection during cleanse','Gut toxin removal'],
    servingSize: '2 capsules morning', servingsPerContainer: '30',
    ingredients: 'Milk Thistle (Silymarin 80%), NAC (N-Acetyl Cysteine), Activated Charcoal, Chlorella, Spirulina, Alpha Lipoic Acid, Glucoraphanin (Broccoli Sprout), Dandelion Root',
    sku: 'RL-008', weight: 2.4
  },
  {
    name: 'Cardiovascular Support Formula',
    shortDescription: 'Comprehensive heart health and circulation support.',
    description: 'Heart disease remains the leading cause of death globally. Our Cardiovascular Support Formula addresses multiple pathways — cholesterol balance, arterial flexibility, blood pressure, and cardiac muscle function — in a single comprehensive formula.',
    price: 57.99,
    category: 'HEART_HEALTH', stockQuantity: 95, featured: false,
    imageUrl: '/uploads/cardiovascular.jpg',
    keyBenefits: ['Supports healthy LDL/HDL cholesterol ratio','Improves arterial elasticity','Maintains healthy blood pressure','Strengthens cardiac muscle function'],
    servingSize: '2 capsules', servingsPerContainer: '60',
    ingredients: 'CoQ10 (200mg), Omega-3 EPA/DHA, Red Yeast Rice, Bergamot Extract, Hawthorn Berry, Aged Garlic Extract, Magnesium, Vitamin K2, Nattokinase',
    sku: 'RL-009', weight: 2.7
  },
  {
    name: 'Cognitive Focus & Brain Health',
    shortDescription: 'Sharpen focus. Enhance memory. Protect your brain.',
    description: 'The ReforceLife Cognitive Focus formula is a precision nootropic stack designed to enhance working memory, mental clarity, and sustained focus — while protecting long-term neurological health through neuroprotective and neurogenesis-supporting compounds.',
    price: 59.99,
    category: 'BRAIN_HEALTH', stockQuantity: 75, featured: true,
    imageUrl: '/uploads/cognitive.jpg',
    keyBenefits: ['Enhances working memory and recall','Increases mental clarity and focus','Supports neurogenesis (new brain cell growth)','Protects against cognitive decline'],
    servingSize: '2 capsules', servingsPerContainer: '60',
    ingredients: 'Lion\'s Mane Mushroom (500mg), Bacopa Monnieri, Alpha GPC (300mg), Phosphatidylserine, L-Theanine, Rhodiola Rosea, Ginkgo Biloba, Huperzine A, Vitamin B12',
    sku: 'RL-010', weight: 2.5
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    await sequelize.sync({ alter: true });
    console.log('✅ Tables synced');

    // Create admin user
    const adminExists = await User.findOne({ where: { email: 'admin@reforcelife.com' } });
    if (!adminExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'ReforceLife',
        email: 'admin@reforcelife.com',
        password: 'Admin@2026!',
        role: 'admin'
      });
      console.log('✅ Admin user created → admin@reforcelife.com / Admin@2026!');
    }

    // Seed products
    let created = 0;
    for (const p of products) {
      const exists = await Product.findOne({ where: { sku: p.sku } });
      if (!exists) { await Product.create(p); created++; }
    }
    console.log(`✅ ${created} products seeded (${products.length - created} already existed)`);

    console.log('\n🌿 ReforceLife database ready!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
