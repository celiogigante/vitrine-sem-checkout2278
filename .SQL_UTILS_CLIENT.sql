-- ======================================================================
-- SQL UTILITIES - Use no console do Supabase (SQL Editor)
-- ======================================================================

-- 1. VERIFICAR PRODUTOS DUPLICADOS (mesmo nome e marca)
-- Execute isso para ver se há problemas de duplicação
SELECT name, brand, COUNT(*) as qtd_duplicadas, STRING_AGG(id, ', ') as ids
FROM products
GROUP BY name, brand
HAVING COUNT(*) > 1
ORDER BY qtd_duplicadas DESC;

-- 2. VER TODAS AS VARIAÇÕES DE UM PRODUTO ESPECÍFICO
-- Mude 'iPhone 15 Pro' pelo nome do produto que quer ver
SELECT 
  p.name,
  pv.sku,
  pv.color,
  pv.storage,
  pv.ram,
  pv.price,
  pv.stock_quantity,
  pv.status,
  pv.condition
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE p.name = 'iPhone 15 Pro'
ORDER BY pv.order_index;

-- 3. CONTAR QUANTOS PRODUTOS E VARIAÇÕES TEM NO SISTEMA
SELECT 
  'Produtos' as tipo,
  COUNT(*) as total
FROM products
UNION ALL
SELECT 
  'Variações',
  COUNT(*)
FROM product_variants;

-- 4. VER MODELOS SEM PRODUTOS ASSOCIADOS
SELECT m.id, m.name, m.brand
FROM models m
LEFT JOIN products p ON p.model_id = m.id
WHERE p.id IS NULL
ORDER BY m.brand, m.name;

-- 5. DELETAR PRODUTOS DUPLICADOS (CUIDADO! Mantém apenas o mais novo)
-- Descomente para usar, e mude 'iPhone 15 Pro' e 'Apple' pelo nome/marca
/*
DELETE FROM products 
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY name, brand ORDER BY created_at DESC) as rn
    FROM products
    WHERE name = 'iPhone 15 Pro' AND brand = 'Apple'
  ) t
  WHERE rn > 1
);
*/

-- 6. RESETAR VIEWS (visualizações) DE TODOS OS PRODUTOS
-- UPDATE products SET views = 0;
-- UPDATE models SET views = 0;

-- ======================================================================
-- RELATÓRIOS ÚTEIS
-- ======================================================================

-- A. TOP 10 PRODUTOS MAIS VISTOS
SELECT name, brand, views, status FROM products ORDER BY views DESC LIMIT 10;

-- B. DISTRIBUIÇÃO DE PRODUTOS POR MARCA
SELECT brand, COUNT(*) as total FROM products GROUP BY brand ORDER BY total DESC;

-- C. PRODUTOS VENDIDOS VS DISPONÍVEIS
SELECT 
  status, 
  COUNT(*) as total,
  ROUND(SUM(price)::NUMERIC, 2) as receita
FROM products 
GROUP BY status;

-- D. VARIAÇÕES COM ESTOQUE BAIXO (menos de 3 unidades)
SELECT 
  p.name,
  pv.sku,
  pv.color,
  pv.storage,
  pv.stock_quantity
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.stock_quantity < 3
ORDER BY pv.stock_quantity ASC;
