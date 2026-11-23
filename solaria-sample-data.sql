-- OPTIONAL: 6 sample perfumes so the shop isn't empty while you add your real ones.
-- Delete them later from the Admin page (Hide or Delete). Names, notes and prices are placeholders.
with p as (
  insert into public.products (sku,name,inspired_by,family,shop_for,concentration,top_notes,heart_notes,base_notes,description,is_featured,is_new) values
  ('SOL-001','Aurum','Dior Sauvage','Fresh & Spicy','Men','Eau de Parfum','Bergamot, pepper','Lavender, geranium','Ambroxan, cedar','A bright, confident scent with a warm amber finish. Made for every day.',true,false),
  ('SOL-002','Solstice','Bleu de Chanel','Woody','Men','Eau de Parfum','Citrus, mint','Ginger, jasmine','Incense, sandalwood, cedar','Clean, deep and effortless. A refined woody signature.',true,true),
  ('SOL-003','Nocturne','Black Opium','Sweet & Gourmand','Women','Eau de Parfum','Pear, pink pepper','Coffee, jasmine','Vanilla, patchouli','Dark coffee and soft vanilla for evenings out.',true,false),
  ('SOL-004','Ember','Baccarat Rouge 540','Amber & Floral','Unisex','Eau de Parfum','Saffron, jasmine','Amberwood, ambergris','Fir resin, cedar','Luminous, airy and unmistakable. A true skin scent.',true,true),
  ('SOL-005','Zenith','Creed Aventus','Fruity & Woody','Men','Eau de Parfum','Pineapple, bergamot','Birch, jasmine','Musk, oakmoss, vanilla','Smoky fruit and fresh woods with serious staying power.',false,false),
  ('SOL-006','Lumiere','Libre (YSL)','Floral','Women','Eau de Parfum','Lavender, mandarin','Orange blossom, jasmine','Vanilla, musk, cedar','Sun-warmed florals with a soft, modern edge.',false,true)
  returning id, sku
)
insert into public.product_variants (product_id, ml, price, stock)
select p.id, s.ml, s.price, 25
from p cross join (values (30, 499), (50, 799), (100, 1299)) as s(ml, price);
