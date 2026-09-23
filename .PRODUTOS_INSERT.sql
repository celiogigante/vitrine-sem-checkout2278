-- Script para inserir produtos de exemplo no Supabase
-- Cole no SQL Editor do seu Supabase

INSERT INTO products (name, brand, price, original_price, description, condition, images, specs, featured, promotion, views)
VALUES
-- iPhone 14 Pro Max
(
  'iPhone 14 Pro Max 256GB',
  'Apple',
  4499,
  5299,
  'iPhone 14 Pro Max em excelente estado de conservação. Bateria com 92% de saúde. Acompanha carregador e caixa original.',
  'excelente',
  '["https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&h=600&fit=crop"]'::jsonb,
  '{"Tela": "6.7\" Super Retina XDR", "Chip": "A16 Bionic", "Câmera": "48MP + 12MP + 12MP", "Bateria": "4323 mAh", "Armazenamento": "256GB", "RAM": "6GB"}'::jsonb,
  true,
  true,
  245
),
-- Samsung Galaxy S23 Ultra
(
  'Samsung Galaxy S23 Ultra 256GB',
  'Samsung',
  3999,
  4799,
  'Galaxy S23 Ultra seminovo com S Pen inclusa. Tela impecável, sem riscos. Todos os acessórios originais.',
  'seminovo',
  '["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop"]'::jsonb,
  '{"Tela": "6.8\" Dynamic AMOLED 2X", "Chip": "Snapdragon 8 Gen 2", "Câmera": "200MP + 12MP + 10MP + 10MP", "Bateria": "5000 mAh", "Armazenamento": "256GB", "RAM": "12GB"}'::jsonb,
  true,
  false,
  189
),
-- iPhone 13
(
  'iPhone 13 128GB',
  'Apple',
  2899,
  null,
  'iPhone 13 em bom estado. Pequenos sinais de uso na carcaça, tela perfeita. Bateria 87%.',
  'bom',
  '["https://images.unsplash.com/photo-1632633173522-47456de71b68?w=600&h=600&fit=crop"]'::jsonb,
  '{"Tela": "6.1\" Super Retina XDR", "Chip": "A15 Bionic", "Câmera": "12MP + 12MP", "Bateria": "3227 mAh", "Armazenamento": "128GB", "RAM": "4GB"}'::jsonb,
  true,
  false,
  312
),
-- Motorola Edge 40 Pro
(
  'Motorola Edge 40 Pro 256GB',
  'Motorola',
  2199,
  2799,
  'Motorola Edge 40 Pro praticamente novo, com apenas 2 meses de uso. Na caixa com todos os acessórios.',
  'excelente',
  '["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop"]'::jsonb,
  '{"Tela": "6.67\" pOLED 165Hz", "Chip": "Snapdragon 8 Gen 2", "Câmera": "50MP + 50MP + 12MP", "Bateria": "4600 mAh", "Armazenamento": "256GB", "RAM": "12GB"}'::jsonb,
  false,
  true,
  98
),
-- Xiaomi Redmi Note 12 Pro
(
  'Xiaomi Redmi Note 12 Pro 128GB',
  'Xiaomi',
  1299,
  null,
  'Redmi Note 12 Pro seminovo em ótimo estado. Excelente custo-benefício.',
  'seminovo',
  '["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop"]'::jsonb,
  '{"Tela": "6.67\" AMOLED 120Hz", "Chip": "MediaTek Dimensity 1080", "Câmera": "50MP + 8MP + 2MP", "Bateria": "5000 mAh", "Armazenamento": "128GB", "RAM": "8GB"}'::jsonb,
  true,
  false,
  156
),
-- Samsung Galaxy A54
(
  'Samsung Galaxy A54 128GB',
  'Samsung',
  1599,
  null,
  'Galaxy A54 novo, lacrado na caixa. Garantia de 1 ano do fabricante.',
  'novo',
  '["https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop"]'::jsonb,
  '{"Tela": "6.4\" Super AMOLED 120Hz", "Chip": "Exynos 1380", "Câmera": "50MP + 12MP + 5MP", "Bateria": "5000 mAh", "Armazenamento": "128GB", "RAM": "8GB"}'::jsonb,
  false,
  false,
  210
);
