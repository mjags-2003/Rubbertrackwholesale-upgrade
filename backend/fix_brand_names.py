"""
Fix brand name capitalization to match unitedskidtracks.com exactly
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


async def fix_brand_names():
    """Fix brand name capitalization"""
    
    # Fix "Case" → "CASE" (Track Loaders)
    result1 = await db.machine_models.update_many(
        {"brand": "Case", "equipment_type": "Track Loader"},
        {"$set": {"brand": "CASE"}}
    )
    print(f"✅ Updated {result1.modified_count} Case → CASE (Track Loaders)")
    
    # Fix "GEHL" → "Gehl" (Track Loaders)
    result2 = await db.machine_models.update_many(
        {"brand": "GEHL", "equipment_type": "Track Loader"},
        {"$set": {"brand": "Gehl"}}
    )
    print(f"✅ Updated {result2.modified_count} GEHL → Gehl (Track Loaders)")
    
    # Fix "GEHL" → "Gehl" (Mini Excavators - if any)
    result3 = await db.machine_models.update_many(
        {"brand": "GEHL", "equipment_type": "Mini Excavator"},
        {"$set": {"brand": "Gehl"}}
    )
    print(f"✅ Updated {result3.modified_count} GEHL → Gehl (Mini Excavators)")
    
    # Get final brand count
    brands = await db.machine_models.distinct("brand")
    print(f"\n📊 Total unique brands: {len(brands)}")
    print("Brands:", sorted(brands))


async def main():
    """Main function"""
    print("\n🔧 Fixing brand name capitalization...\n")
    
    try:
        await fix_brand_names()
        print("\n✅ Brand names fixed!\n")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
