"""
Remove excluded brands from compatibility data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Brands to EXCLUDE (as requested by user)
EXCLUDED_BRANDS = [
    'iseki', 'awasi', 'aliva', 'atn', 'bonne esperance', 'brokk', 'boxer', 
    'chikusui/canycom', 'coltrax', 'commander', 'comet', 'compair holman', 
    'cormidi', 'durso', 'dlgz', 'eurotrac', 'eurotom', 'eurodig', 'eurocomach', 
    'eurocat', 'etec', 'erreppi', 'enteco', 'energreen', 'emci', 'electro joe', 
    'efco', 'ecomeca', 'ecofore', 'eckart', 'furukawa', 'fronteq', 'fraste', 
    'forti', 'fort', 'foredil', 'fiori', 'finmac', 'fermec', 'fercad', 
    'falcon spider', 'fai', 'geier', 'gelai & castegnaro', 'geoprobe', 'goman', 
    'green mech', 'green technik', 'grillo', 'grizzly', 'grundodrill', 
    'grundohit', 'guangxi', 'guidetti', 'iwafuji', 'italmec', 'jolly', 
    'libra compact', 'liugong', 'lifton', 'locust', 'luyu', 'libra'
]


async def remove_excluded_brands():
    print("🚀 Removing excluded brands from database...")
    print("=" * 80)
    
    # Get all distinct brands
    all_brands = await db.compatibilities.distinct('make')
    
    # Normalize excluded brands to lowercase for comparison
    excluded_lower = [b.lower() for b in EXCLUDED_BRANDS]
    
    # Find brands to remove
    brands_to_remove = []
    for brand in all_brands:
        if brand.lower() in excluded_lower:
            brands_to_remove.append(brand)
    
    print(f"Found {len(brands_to_remove)} brands to remove:")
    
    total_removed = 0
    for brand in sorted(brands_to_remove):
        count = await db.compatibilities.count_documents({'make': brand})
        result = await db.compatibilities.delete_many({'make': brand})
        total_removed += result.deleted_count
        print(f"  ✅ Removed {brand}: {result.deleted_count} machines")
    
    # Check remaining brands
    remaining_brands = await db.compatibilities.distinct('make')
    remaining_count = await db.compatibilities.count_documents({})
    
    print("\n" + "=" * 80)
    print(f"✅ Removal Complete!")
    print(f"   Total machines removed: {total_removed}")
    print(f"   Remaining brands: {len(remaining_brands)}")
    print(f"   Remaining machines: {remaining_count}")
    print("=" * 80)
    
    # Show some of the remaining brands
    print(f"\nSample of remaining brands (first 20):")
    for i, brand in enumerate(sorted(remaining_brands)[:20], 1):
        count = await db.compatibilities.count_documents({'make': brand})
        print(f"  {i}. {brand} ({count} machines)")
    
    if len(remaining_brands) > 20:
        print(f"  ... and {len(remaining_brands) - 20} more brands")


if __name__ == "__main__":
    asyncio.run(remove_excluded_brands())
