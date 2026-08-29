import { supabase } from './services/supabase.js';
import { PRODUCTS } from '../src/data/products.js';
import { CATEGORIES } from '../src/data/categories.js';

async function seedDatabase() {
  console.log('Seeding Supabase with products and categories...');

  // 1. Categories
  for (const cat of CATEGORIES) {
    const { error } = await supabase.from('categories').upsert({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      item_count: cat.itemCount,
      image_url: cat.image,
      description: cat.description,
      color: cat.color,
      subcategories: cat.subcategories || [],
      display_order: 1
    });
    if (error) console.error(`Error category ${cat.name}:`, error.message);
  }
  console.log('✅ Categories seeded to Supabase!');

  // 2. Products
  for (const prod of PRODUCTS) {
    const { error } = await supabase.from('products').upsert({
      id: prod.id,
      name: prod.name,
      brand: prod.brand,
      category: prod.category,
      category_name: prod.categoryName,
      price: prod.price,
      original_price: prod.originalPrice || null,
      discount: prod.discount || 0,
      rating: prod.rating || 5.0,
      review_count: prod.reviewsCount || 0,
      stock_count: prod.stockCount || 10,
      in_stock: prod.inStock !== false,
      badge: prod.badge || '',
      description: prod.description || '',
      images: prod.images || [],
      is_featured: !!prod.isFeatured,
      is_trending: !!prod.isTrending,
      is_new_arrival: !!prod.isNewArrival,
      is_special_offer: !!prod.isSpecialOffer,
    });
    if (error) console.error(`Error product ${prod.name}:`, error.message);
  }
  console.log(`✅ ${PRODUCTS.length} Products seeded to Supabase public.products!`);

  // 3. Coupons
  const coupons = [
    { code: 'WELCOME10', discount_percent: 10, min_order: 999, description: '10% Welcome Discount for New Patrons', is_active: true },
    { code: 'ASGOLD20', discount_percent: 20, min_order: 4999, description: '20% Extra off on Luxury Horology', is_active: true },
    { code: 'LUXURY50', discount_percent: 50, min_order: 9999, description: 'Exclusive VIP Season Finale 50% Off', is_active: true }
  ];
  for (const c of coupons) {
    await supabase.from('coupons').upsert(c);
  }
  console.log('✅ Coupons seeded to Supabase!');

  process.exit(0);
}

seedDatabase();
