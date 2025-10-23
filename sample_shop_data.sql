-- Sample data for BabyBloom E-commerce Shop
-- Run this after creating the main schema

-- Insert sample products
INSERT INTO products (
  name, 
  description, 
  short_description, 
  sku, 
  category_id, 
  brand, 
  price, 
  compare_at_price, 
  stock_quantity, 
  is_featured, 
  age_group, 
  tags
) VALUES 
-- Baby Clothing
(
  'Organic Cotton Onesies Set (5-pack)',
  'Soft, organic cotton onesies perfect for everyday wear. Made from 100% certified organic cotton that''s gentle on baby''s sensitive skin. Machine washable and pre-shrunk for lasting comfort.',
  'Soft organic cotton onesies for daily comfort and play',
  'BC-ONS-001',
  (SELECT id FROM product_categories WHERE name = 'Baby Clothing'),
  'BabyBloom',
  24.99,
  29.99,
  150,
  true,
  '0-6 months',
  ARRAY['organic', 'cotton', 'onesie', 'basics']
),
(
  'Adorable Sleep & Play Rompers (3-pack)',
  'Cozy rompers designed for sleep and play time. Features snap closures for easy diaper changes and fold-over mittens to prevent scratching.',
  'Comfortable rompers with easy-change snaps',
  'BC-ROM-002',
  (SELECT id FROM product_categories WHERE name = 'Baby Clothing'),
  'BabyBloom',
  19.99,
  NULL,
  120,
  false,
  '0-12 months',
  ARRAY['romper', 'sleepwear', 'comfort']
),
(
  'Winter Warm Knit Sweater',
  'Handknitted wool sweater to keep your little one warm during cold days. Features adorable animal patterns and soft yarn that won''t irritate skin.',
  'Handknitted wool sweater with cute animal patterns',
  'BC-SWE-003',
  (SELECT id FROM product_categories WHERE name = 'Baby Clothing'),
  'WarmNest',
  34.99,
  39.99,
  85,
  true,
  '6-24 months',
  ARRAY['sweater', 'winter', 'wool', 'handknit']
),

-- Feeding & Nursing
(
  'Anti-Colic Baby Bottles Set (6-pack)',
  'Advanced anti-colic baby bottles designed to reduce colic, gas, and fussiness. Features a unique venting system and natural-feel nipples.',
  'Anti-colic bottles that reduce gas and fussiness',
  'FN-BOT-001',
  (SELECT id FROM product_categories WHERE name = 'Feeding & Nursing'),
  'FeedWell',
  39.99,
  49.99,
  200,
  true,
  '0-12 months',
  ARRAY['bottle', 'anti-colic', 'feeding', 'BPA-free']
),
(
  'Silicone Baby Bibs Set (4-pack)',
  'Waterproof silicone bibs with deep pocket to catch spills. Easy to clean and dishwasher safe. Perfect for self-feeding toddlers.',
  'Waterproof silicone bibs with spill-catching pocket',
  'FN-BIB-002',
  (SELECT id FROM product_categories WHERE name = 'Feeding & Nursing'),
  'BabyBloom',
  16.99,
  NULL,
  180,
  false,
  '6-24 months',
  ARRAY['bib', 'silicone', 'waterproof', 'self-feeding']
),
(
  'Breast Pump & Storage Kit',
  'Complete breast pumping solution with double electric pump, storage bottles, and freezer bags. Quiet motor and comfortable suction.',
  'Complete electric breast pump with storage accessories',
  'FN-PMP-003',
  (SELECT id FROM product_categories WHERE name = 'Feeding & Nursing'),
  'MomCare',
  129.99,
  149.99,
  45,
  true,
  'adults',
  ARRAY['breast-pump', 'electric', 'storage', 'nursing']
),

-- Toys & Games
(
  'Wooden Stacking Rings Toy',
  'Classic wooden stacking toy that helps develop hand-eye coordination and problem-solving skills. Made from sustainably sourced wood.',
  'Classic wooden stacking toy for early development',
  'TG-STK-001',
  (SELECT id FROM product_categories WHERE name = 'Toys & Games'),
  'EcoToys',
  22.99,
  NULL,
  95,
  false,
  '6-18 months',
  ARRAY['wooden', 'stacking', 'educational', 'eco-friendly']
),
(
  'Interactive Learning Tablet',
  'Educational tablet with lights, sounds, and interactive games. Teaches letters, numbers, colors, and shapes through engaging activities.',
  'Interactive educational tablet with lights and sounds',
  'TG-TAB-002',
  (SELECT id FROM product_categories WHERE name = 'Toys & Games'),
  'SmartPlay',
  45.99,
  55.99,
  75,
  true,
  '12-36 months',
  ARRAY['educational', 'interactive', 'electronic', 'learning']
),
(
  'Soft Plush Activity Gym',
  'Colorful activity gym with hanging toys, mirrors, and textures. Encourages tummy time and sensory development.',
  'Colorful activity gym for tummy time and play',
  'TG-GYM-003',
  (SELECT id FROM product_categories WHERE name = 'Toys & Games'),
  'BabyBloom',
  59.99,
  69.99,
  60,
  true,
  '0-6 months',
  ARRAY['activity-gym', 'tummy-time', 'sensory', 'development']
),

-- Maternity Wear
(
  'Comfortable Maternity Leggings',
  'Ultra-soft maternity leggings with full belly support panel. Made from breathable bamboo blend fabric that grows with you.',
  'Ultra-soft bamboo blend leggings with belly support',
  'MW-LEG-001',
  (SELECT id FROM product_categories WHERE name = 'Maternity Wear'),
  'MomStyle',
  29.99,
  NULL,
  100,
  false,
  'adults',
  ARRAY['leggings', 'maternity', 'bamboo', 'comfortable']
),
(
  'Nursing-Friendly Sleep Dress',
  'Soft modal sleep dress with hidden nursing access. Perfect for comfortable sleeping and easy nighttime feeding.',
  'Soft modal sleep dress with nursing access',
  'MW-DRS-002',
  (SELECT id FROM product_categories WHERE name = 'Maternity Wear'),
  'NightComfort',
  39.99,
  44.99,
  80,
  true,
  'adults',
  ARRAY['sleepwear', 'nursing', 'modal', 'comfortable']
),

-- Baby Care
(
  'Gentle Baby Wash & Shampoo',
  'Tear-free, hypoallergenic baby wash and shampoo made with natural ingredients. Perfect for daily use on sensitive skin.',
  'Gentle, tear-free baby wash with natural ingredients',
  'BC-WSH-001',
  (SELECT id FROM product_categories WHERE name = 'Baby Care'),
  'PureBaby',
  12.99,
  NULL,
  250,
  false,
  '0-24 months',
  ARRAY['baby-wash', 'gentle', 'natural', 'hypoallergenic']
),
(
  'Eco-Friendly Diapers (Size 1, 84-count)',
  'Chlorine-free, hypoallergenic diapers made with plant-based materials. Excellent absorption with 12-hour protection.',
  'Eco-friendly diapers with 12-hour protection',
  'BC-DIP-001',
  (SELECT id FROM product_categories WHERE name = 'Baby Care'),
  'EcoBaby',
  34.99,
  NULL,
  300,
  true,
  '0-6 months',
  ARRAY['diapers', 'eco-friendly', 'plant-based', 'hypoallergenic']
),

-- Nursery & Furniture
(
  'Convertible 4-in-1 Crib',
  'Beautiful convertible crib that grows with your child. Transforms from crib to toddler bed to full-size bed. Made from solid wood.',
  'Convertible crib that grows from baby to full-size bed',
  'NF-CRB-001',
  (SELECT id FROM product_categories WHERE name = 'Nursery & Furniture'),
  'DreamNest',
  299.99,
  349.99,
  25,
  true,
  '0-18 years',
  ARRAY['crib', 'convertible', 'solid-wood', 'nursery']
),
(
  'Rocking Chair with Ottoman',
  'Comfortable nursing chair with smooth rocking motion. Includes matching ottoman and removable cushions.',
  'Comfortable rocking chair perfect for nursing',
  'NF-CHR-002',
  (SELECT id FROM product_categories WHERE name = 'Nursery & Furniture'),
  'ComfortRock',
  199.99,
  249.99,
  35,
  false,
  'adults',
  ARRAY['rocking-chair', 'nursing', 'comfortable', 'ottoman']
);

-- Insert product images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES
-- Organic Cotton Onesies Set
((SELECT id FROM products WHERE sku = 'BC-ONS-001'), 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400', 'Organic cotton onesies set', true, 1),
((SELECT id FROM products WHERE sku = 'BC-ONS-001'), 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=400', 'Onesies detail view', false, 2),

-- Sleep & Play Rompers
((SELECT id FROM products WHERE sku = 'BC-ROM-002'), 'https://images.unsplash.com/photo-1566479179817-c59e9f41a0c4?w=400', 'Sleep and play rompers', true, 1),

-- Winter Knit Sweater
((SELECT id FROM products WHERE sku = 'BC-SWE-003'), 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400', 'Knit baby sweater', true, 1),

-- Anti-Colic Bottles
((SELECT id FROM products WHERE sku = 'FN-BOT-001'), 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 'Anti-colic baby bottles', true, 1),

-- Silicone Bibs
((SELECT id FROM products WHERE sku = 'FN-BIB-002'), 'https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?w=400', 'Silicone baby bibs', true, 1),

-- Breast Pump Kit
((SELECT id FROM products WHERE sku = 'FN-PMP-003'), 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=400', 'Breast pump and storage kit', true, 1),

-- Wooden Stacking Rings
((SELECT id FROM products WHERE sku = 'TG-STK-001'), 'https://images.unsplash.com/photo-1596438459065-68e8d69cd7e8?w=400', 'Wooden stacking rings toy', true, 1),

-- Interactive Learning Tablet
((SELECT id FROM products WHERE sku = 'TG-TAB-002'), 'https://images.unsplash.com/photo-1558054043-4d0e045efb88?w=400', 'Interactive learning tablet', true, 1),

-- Activity Gym
((SELECT id FROM products WHERE sku = 'TG-GYM-003'), 'https://images.unsplash.com/photo-1586022813860-b2d2afdf8bb7?w=400', 'Soft plush activity gym', true, 1),

-- Maternity Leggings
((SELECT id FROM products WHERE sku = 'MW-LEG-001'), 'https://images.unsplash.com/photo-1594735797693-7b4b3ecc8cc3?w=400', 'Comfortable maternity leggings', true, 1),

-- Nursing Sleep Dress
((SELECT id FROM products WHERE sku = 'MW-DRS-002'), 'https://images.unsplash.com/photo-1586022813860-b2d2afdf8bb7?w=400', 'Nursing-friendly sleep dress', true, 1),

-- Baby Wash
((SELECT id FROM products WHERE sku = 'BC-WSH-001'), 'https://images.unsplash.com/photo-1522778121455-52c080b00c90?w=400', 'Gentle baby wash and shampoo', true, 1),

-- Eco Diapers
((SELECT id FROM products WHERE sku = 'BC-DIP-001'), 'https://images.unsplash.com/photo-1621273962893-4e09b6f1879d?w=400', 'Eco-friendly baby diapers', true, 1),

-- Convertible Crib
((SELECT id FROM products WHERE sku = 'NF-CRB-001'), 'https://images.unsplash.com/photo-1586717799252-bd134ad00b2b?w=400', 'Convertible 4-in-1 crib', true, 1),

-- Rocking Chair
((SELECT id FROM products WHERE sku = 'NF-CHR-002'), 'https://images.unsplash.com/photo-1586022813860-b2d2afdf8bb7?w=400', 'Nursing rocking chair with ottoman', true, 1);

-- Add some product variants (sizes/colors)
INSERT INTO product_variants (product_id, name, sku, stock_quantity, variant_options) VALUES
-- Onesies sizes
((SELECT id FROM products WHERE sku = 'BC-ONS-001'), 'Newborn - White', 'BC-ONS-001-NB-W', 50, '{"size": "Newborn", "color": "White"}'),
((SELECT id FROM products WHERE sku = 'BC-ONS-001'), '0-3M - White', 'BC-ONS-001-03M-W', 50, '{"size": "0-3M", "color": "White"}'),
((SELECT id FROM products WHERE sku = 'BC-ONS-001'), '3-6M - White', 'BC-ONS-001-36M-W', 50, '{"size": "3-6M", "color": "White"}'),

-- Sweater sizes and colors
((SELECT id FROM products WHERE sku = 'BC-SWE-003'), '6-12M - Pink', 'BC-SWE-003-612M-P', 25, '{"size": "6-12M", "color": "Pink"}'),
((SELECT id FROM products WHERE sku = 'BC-SWE-003'), '12-18M - Pink', 'BC-SWE-003-1218M-P', 30, '{"size": "12-18M", "color": "Pink"}'),
((SELECT id FROM products WHERE sku = 'BC-SWE-003'), '6-12M - Blue', 'BC-SWE-003-612M-B', 30, '{"size": "6-12M", "color": "Blue"}');

-- Insert some sample discount codes
INSERT INTO discount_codes (code, name, description, type, value, minimum_order_amount, usage_limit, expires_at) VALUES
('WELCOME10', 'Welcome Discount', 'Get 10% off your first order', 'percentage', 10, 25, 100, '2024-12-31T23:59:59Z'),
('SAVE5', 'Save $5', 'Save $5 on orders over $50', 'fixed_amount', 5, 50, NULL, '2024-12-31T23:59:59Z'),
('NEWMOM15', 'New Mom Special', 'Special 15% discount for new moms', 'percentage', 15, 40, 200, '2024-12-31T23:59:59Z');

-- Update category images with better stock photo URLs
UPDATE product_categories SET image_url = 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=300' WHERE name = 'Baby Clothing';
UPDATE product_categories SET image_url = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300' WHERE name = 'Feeding & Nursing';
UPDATE product_categories SET image_url = 'https://images.unsplash.com/photo-1596438459065-68e8d69cd7e8?w=300' WHERE name = 'Toys & Games';
UPDATE product_categories SET image_url = 'https://images.unsplash.com/photo-1594735797693-7b4b3ecc8cc3?w=300' WHERE name = 'Maternity Wear';
UPDATE product_categories SET image_url = 'https://images.unsplash.com/photo-1522778121455-52c080b00c90?w=300' WHERE name = 'Baby Care';
UPDATE product_categories SET image_url = 'https://images.unsplash.com/photo-1586717799252-bd134ad00b2b?w=300' WHERE name = 'Nursery & Furniture';