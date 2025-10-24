"""
Initialize database with sample data and create admin user
Run this script once after deployment: python init_data.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from auth import get_password_hash
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]


async def init_admin_user():
    """Create default admin user"""
    admin_exists = await db.admin_users.find_one({"username": "admin"})
    
    if not admin_exists:
        admin_user = {
            "username": "admin",
            "email": "admin@rubbertrackwholesale.com",
            "hashed_password": get_password_hash("admin123"),  # Change this password!
            "full_name": "Admin User",
            "is_active": True,
            "is_superuser": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.admin_users.insert_one(admin_user)
        print("✅ Admin user created")
        print("   Username: admin")
        print("   Password: admin123")
        print("   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!")
    else:
        print("ℹ️  Admin user already exists")


async def init_brands():
    """Create initial brands - ALL brands from machineModels.js"""
    brands = [
        {"name": "ASV", "slug": "asv", "description": "High-performance rubber tracks for ASV equipment", "seo_title": "ASV Rubber Tracks & Parts | Rubber Track Wholesale", "seo_description": "ASV rubber tracks and undercarriage parts. Wholesale pricing, fast delivery.", "seo_keywords": ["asv rubber tracks", "asv mtl tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Barreto", "slug": "barreto", "description": "Quality rubber tracks for Barreto equipment", "seo_title": "Barreto Rubber Tracks | Rubber Track Wholesale", "seo_description": "Premium Barreto rubber tracks. Wholesale prices, fast shipping.", "seo_keywords": ["barreto rubber tracks", "barreto parts"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Baumalight", "slug": "baumalight", "description": "Rubber tracks for Baumalight machines", "seo_title": "Baumalight Rubber Tracks | Rubber Track Wholesale", "seo_description": "Quality Baumalight rubber tracks at wholesale prices.", "seo_keywords": ["baumalight rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Bobcat", "slug": "bobcat", "description": "Premium rubber tracks for Bobcat equipment", "seo_title": "Bobcat Rubber Tracks & Parts | Rubber Track Wholesale", "seo_description": "Shop high-quality Bobcat rubber tracks and undercarriage parts. Fast shipping, wholesale prices.", "seo_keywords": ["bobcat rubber tracks", "bobcat parts", "bobcat undercarriage"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Boxer", "slug": "boxer", "description": "Rubber tracks for Boxer compact track loaders", "seo_title": "Boxer Rubber Tracks | Rubber Track Wholesale", "seo_description": "Quality Boxer rubber tracks. Fast shipping available.", "seo_keywords": ["boxer rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Case", "slug": "case", "description": "Rubber tracks for Case construction equipment", "seo_title": "Case Rubber Tracks & Parts | Rubber Track Wholesale", "seo_description": "Quality Case rubber tracks at wholesale prices. Free shipping on orders over $500.", "seo_keywords": ["case rubber tracks", "case parts"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Caterpillar", "slug": "caterpillar", "description": "Durable rubber tracks for Caterpillar equipment", "seo_title": "Caterpillar Rubber Tracks & Parts | Rubber Track Wholesale", "seo_description": "Shop Caterpillar rubber tracks and undercarriage parts. Fast delivery nationwide.", "seo_keywords": ["caterpillar rubber tracks", "cat tracks", "cat parts"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Dingo", "slug": "dingo", "description": "Premium rubber tracks for Dingo mini loaders", "seo_title": "Dingo Rubber Tracks | Rubber Track Wholesale", "seo_description": "Quality Dingo rubber tracks. Wholesale pricing.", "seo_keywords": ["dingo rubber tracks", "dingo parts"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Ditch Witch", "slug": "ditch-witch", "description": "Rubber tracks for Ditch Witch equipment", "seo_title": "Ditch Witch Rubber Tracks | Rubber Track Wholesale", "seo_description": "Premium Ditch Witch rubber tracks at wholesale prices.", "seo_keywords": ["ditch witch rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Doosan", "slug": "doosan", "description": "Quality rubber tracks for Doosan equipment", "seo_title": "Doosan Rubber Tracks | Rubber Track Wholesale", "seo_description": "Premium Doosan rubber tracks. Fast shipping.", "seo_keywords": ["doosan rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "GEHL", "slug": "gehl", "description": "Aftermarket rubber tracks for Gehl machines", "seo_title": "Gehl Rubber Tracks & Parts | Rubber Track Wholesale", "seo_description": "Premium aftermarket Gehl rubber tracks. Same-day shipping available.", "seo_keywords": ["gehl rubber tracks", "gehl parts"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Hitachi", "slug": "hitachi", "description": "Rubber tracks for Hitachi excavators", "seo_title": "Hitachi Rubber Tracks | Rubber Track Wholesale", "seo_description": "Quality Hitachi rubber tracks at wholesale prices.", "seo_keywords": ["hitachi rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Hyundai", "slug": "hyundai", "description": "Premium rubber tracks for Hyundai equipment", "seo_title": "Hyundai Rubber Tracks | Rubber Track Wholesale", "seo_description": "Quality Hyundai rubber tracks. Wholesale pricing.", "seo_keywords": ["hyundai rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "IHI", "slug": "ihi", "description": "Rubber tracks for IHI excavators", "seo_title": "IHI Rubber Tracks | Rubber Track Wholesale", "seo_description": "Premium IHI rubber tracks at competitive prices.", "seo_keywords": ["ihi rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "JCB", "slug": "jcb", "description": "Quality rubber tracks for JCB machines", "seo_title": "JCB Rubber Tracks & Parts | Rubber Track Wholesale", "seo_description": "Premium JCB rubber tracks at competitive prices. Free shipping available.", "seo_keywords": ["jcb rubber tracks", "jcb parts"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "John Deere", "slug": "john-deere", "description": "Premium rubber tracks for John Deere equipment", "seo_title": "John Deere Rubber Tracks | Rubber Track Wholesale", "seo_description": "Shop John Deere rubber tracks at wholesale prices. Fast shipping nationwide.", "seo_keywords": ["john deere rubber tracks", "john deere parts"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Kobelco", "slug": "kobelco", "description": "Rubber tracks for Kobelco excavators", "seo_title": "Kobelco Rubber Tracks | Rubber Track Wholesale", "seo_description": "Quality Kobelco rubber tracks. Wholesale pricing.", "seo_keywords": ["kobelco rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Komatsu", "slug": "komatsu", "description": "Premium rubber tracks for Komatsu equipment", "seo_title": "Komatsu Rubber Tracks | Rubber Track Wholesale", "seo_description": "Quality Komatsu rubber tracks at competitive prices.", "seo_keywords": ["komatsu rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Kubota", "slug": "kubota", "description": "Quality rubber tracks for Kubota machines", "seo_title": "Kubota Rubber Tracks & Parts | Rubber Track Wholesale", "seo_description": "Premium Kubota rubber tracks and parts. OEM quality, wholesale pricing.", "seo_keywords": ["kubota rubber tracks", "kubota parts"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Marooka", "slug": "marooka", "description": "Rubber tracks for Marooka carriers", "seo_title": "Marooka Rubber Tracks | Rubber Track Wholesale", "seo_description": "Quality Marooka rubber tracks. Fast shipping.", "seo_keywords": ["marooka rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Mustang", "slug": "mustang", "description": "Premium rubber tracks for Mustang equipment", "seo_title": "Mustang Rubber Tracks | Rubber Track Wholesale", "seo_description": "Quality Mustang rubber tracks at wholesale prices.", "seo_keywords": ["mustang rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "New Holland", "slug": "new-holland", "description": "Quality rubber tracks for New Holland machines", "seo_title": "New Holland Rubber Tracks | Rubber Track Wholesale", "seo_description": "Premium New Holland rubber tracks. Wholesale pricing, fast delivery.", "seo_keywords": ["new holland rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "SANY", "slug": "sany", "description": "Rubber tracks for SANY equipment", "seo_title": "SANY Rubber Tracks | Rubber Track Wholesale", "seo_description": "Quality SANY rubber tracks at competitive prices.", "seo_keywords": ["sany rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Takeuchi", "slug": "takeuchi", "description": "Premium rubber tracks for Takeuchi equipment", "seo_title": "Takeuchi Rubber Tracks & Parts | Rubber Track Wholesale", "seo_description": "Shop Takeuchi rubber tracks and parts. Fast nationwide shipping.", "seo_keywords": ["takeuchi rubber tracks", "takeuchi parts"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Terex", "slug": "terex", "description": "Quality rubber tracks for Terex equipment", "seo_title": "Terex Rubber Tracks | Rubber Track Wholesale", "seo_description": "Premium Terex rubber tracks. Wholesale pricing.", "seo_keywords": ["terex rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Terramac", "slug": "terramac", "description": "Rubber tracks for Terramac carriers", "seo_title": "Terramac Rubber Tracks | Rubber Track Wholesale", "seo_description": "Quality Terramac rubber tracks at wholesale prices.", "seo_keywords": ["terramac rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Toro", "slug": "toro", "description": "Premium rubber tracks for Toro equipment", "seo_title": "Toro Rubber Tracks | Rubber Track Wholesale", "seo_description": "Quality Toro rubber tracks. Fast shipping available.", "seo_keywords": ["toro rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Vermeer", "slug": "vermeer", "description": "Rubber tracks for Vermeer equipment", "seo_title": "Vermeer Rubber Tracks | Rubber Track Wholesale", "seo_description": "Premium Vermeer rubber tracks at competitive prices.", "seo_keywords": ["vermeer rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Volvo", "slug": "volvo", "description": "Quality rubber tracks for Volvo equipment", "seo_title": "Volvo Rubber Tracks | Rubber Track Wholesale", "seo_description": "Premium Volvo rubber tracks. Wholesale pricing.", "seo_keywords": ["volvo rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Wacker Neuson", "slug": "wacker-neuson", "description": "Premium rubber tracks for Wacker Neuson machines", "seo_title": "Wacker Neuson Rubber Tracks | Rubber Track Wholesale", "seo_description": "Quality Wacker Neuson rubber tracks at wholesale prices.", "seo_keywords": ["wacker neuson rubber tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Yanmar", "slug": "yanmar", "description": "Rubber tracks for Yanmar excavators", "seo_title": "Yanmar Rubber Tracks & Parts | Rubber Track Wholesale", "seo_description": "Quality Yanmar rubber tracks. OEM specifications, wholesale prices.", "seo_keywords": ["yanmar rubber tracks", "yanmar parts"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
    ]
    
    # Insert brands if they don't exist (check by slug)
    added_count = 0
    for brand in brands:
        existing = await db.brands.find_one({"slug": brand["slug"]})
        if not existing:
            await db.brands.insert_one(brand)
            added_count += 1
    
    total_count = await db.brands.count_documents({})
    if added_count > 0:
        print(f"✅ {added_count} new brands created (Total: {total_count})")
    else:
        print(f"ℹ️  All brands already exist (Total: {total_count})")


async def init_categories():
    """Create initial categories"""
    categories = [
        {"name": "Rubber Tracks", "slug": "rubber-tracks", "description": "Premium quality rubber tracks for all major brands", "seo_title": "Rubber Tracks for Skid Steers & Excavators | Wholesale Pricing", "seo_description": "Shop premium rubber tracks for compact track loaders and mini excavators. OEM quality, wholesale prices, fast shipping.", "seo_keywords": ["rubber tracks", "skid steer tracks", "excavator tracks"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Undercarriage Parts", "slug": "undercarriage-parts", "description": "Complete undercarriage solutions", "seo_title": "Undercarriage Parts | Rollers, Sprockets, Idlers | Wholesale", "seo_description": "Quality undercarriage parts for construction equipment. Rollers, sprockets, idlers and more.", "seo_keywords": ["undercarriage parts", "track parts"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Rollers", "slug": "rollers", "description": "Top and bottom rollers", "seo_title": "Track Rollers | Top & Bottom Rollers | Rubber Track Wholesale", "seo_description": "Heavy-duty track rollers for skid steers and excavators. Top and bottom rollers in stock.", "seo_keywords": ["track rollers", "bottom rollers", "top rollers"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Sprockets", "slug": "sprockets", "description": "Drive sprockets and parts", "seo_title": "Drive Sprockets | Sprocket Wheels | Rubber Track Wholesale", "seo_description": "Precision-machined drive sprockets for construction equipment. Quality parts, competitive prices.", "seo_keywords": ["drive sprockets", "sprocket wheels"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
        {"name": "Idlers", "slug": "idlers", "description": "Front idlers and components", "seo_title": "Front Idlers | Idler Wheels | Rubber Track Wholesale", "seo_description": "Front idlers and idler wheels for skid steers and track loaders. Fast shipping available.", "seo_keywords": ["front idlers", "idler wheels"], "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
    ]
    
    count = await db.categories.count_documents({})
    if count == 0:
        await db.categories.insert_many(categories)
        print(f"✅ {len(categories)} categories created")
    else:
        print(f"ℹ️  {count} categories already exist")


async def init_sample_products():
    """Create sample products"""
    products = [
        {
            "sku": "RT-450-86-56",
            "title": "Bobcat T190 Rubber Track 450x86x56",
            "description": "Premium rubber track for Bobcat T190 compact track loader. Heavy-duty construction with reinforced steel cords for maximum durability. Fits Bobcat T190, T200, T550, T590, T630, T650, T750 and more.",
            "price": 1299.99,
            "brand": "Bobcat",
            "category": "Rubber Tracks",
            "size": "450x86x56",
            "part_number": "6813500",
            "images": ["https://images.unsplash.com/photo-1621574091584-4b4ea63b8f9a?w=800&h=600&fit=crop"],
            "in_stock": True,
            "stock_quantity": 25,
            "specifications": {"width": "450mm", "pitch": "86mm", "links": "56", "warranty": "1 Year"},
            "seo_title": "Bobcat T190 Rubber Track 450x86x56 | Premium Quality | Free Shipping",
            "seo_description": "Buy Bobcat T190 rubber tracks 450x86x56. OEM quality, 1-year warranty, free shipping. Fits T190, T200, T550 and more. In stock, ships same day.",
            "seo_keywords": ["bobcat t190 rubber tracks", "450x86x56 tracks", "bobcat tracks"],
            "alt_tags": ["Bobcat T190 rubber track", "450x86x56 rubber track"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "sku": "RT-400-72-74",
            "title": "Kubota SVL95 Rubber Track 400x72x74",
            "description": "High-performance rubber track designed for Kubota SVL95. Exceptional traction and durability in all conditions. OEM quality construction.",
            "price": 1580.00,
            "brand": "Kubota",
            "category": "Rubber Tracks",
            "size": "400x72x74",
            "part_number": "V0611-28111",
            "images": ["https://images.unsplash.com/photo-1621574091584-4b4ea63b8f9a?w=800&h=600&fit=crop"],
            "in_stock": True,
            "stock_quantity": 18,
            "specifications": {"width": "400mm", "pitch": "72mm", "links": "74", "warranty": "1 Year"},
            "seo_title": "Kubota SVL95 Rubber Track 400x72x74 | OEM Quality | Free Shipping",
            "seo_description": "Premium Kubota SVL95 rubber tracks 400x72x74. Heavy-duty construction, 1-year warranty. Fast shipping nationwide.",
            "seo_keywords": ["kubota svl95 tracks", "400x72x74 rubber tracks", "kubota tracks"],
            "alt_tags": ["Kubota SVL95 rubber track", "400x72x74 track"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "sku": "RT-320-86-52",
            "title": "Cat 247B MTL Rubber Track 320x86x52",
            "description": "OEM quality rubber track for Caterpillar 247B Multi Terrain Loader. Superior performance and longevity. Fits Cat 247, 257, 277 series.",
            "price": 1340.00,
            "brand": "Caterpillar",
            "category": "Rubber Tracks",
            "size": "320x86x52",
            "part_number": "420-9876",
            "images": ["https://images.unsplash.com/photo-1621574091584-4b4ea63b8f9a?w=800&h=600&fit=crop"],
            "in_stock": True,
            "stock_quantity": 15,
            "specifications": {"width": "320mm", "pitch": "86mm", "links": "52", "warranty": "1 Year"},
            "seo_title": "Cat 247B MTL Rubber Track 320x86x52 | Caterpillar Tracks | Wholesale",
            "seo_description": "Caterpillar 247B rubber tracks 320x86x52. OEM specifications, competitive pricing. Free shipping on orders over $500.",
            "seo_keywords": ["cat 247b tracks", "caterpillar mtl tracks", "320x86x52 tracks"],
            "alt_tags": ["Cat 247B rubber track", "Caterpillar MTL track"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    count = await db.products.count_documents({})
    if count == 0:
        await db.products.insert_many(products)
        print(f"✅ {len(products)} sample products created")
    else:
        print(f"ℹ️  {count} products already exist")


async def main():
    """Main initialization function"""
    print("\n🚀 Initializing Rubber Track Wholesale Database...\n")
    
    try:
        await init_admin_user()
        await init_brands()
        await init_categories()
        await init_sample_products()
        
        print("\n✅ Database initialization complete!")
        print("\n📝 Next steps:")
        print("   1. Login to admin panel at /admin")
        print("   2. Change the admin password")
        print("   3. Add more products via the admin panel")
        print("   4. Configure SEO settings for each product\n")
        
    except Exception as e:
        print(f"\n❌ Error during initialization: {str(e)}")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
