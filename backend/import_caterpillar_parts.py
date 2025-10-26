"""
Import Caterpillar part numbers from Rubbertrax data
"""
import asyncio
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Caterpillar parts data from Rubbertrax
CATERPILLAR_PARTS = [
    # Rollers (Bottom and Top/Carrier)
    {"part_number": "127-3807", "part_type": "roller", "part_subtype": "bottom", "product_name": "Fits: Caterpillar E70 E70B Bottom Roller", "compatible_models": ["E70", "E70B"]},
    {"part_number": "158-4968", "part_type": "roller", "part_subtype": "bottom", "product_name": "Fits: Caterpillar 301.5 301.6 301.8 Lower Roller", "compatible_models": ["301.5", "301.6", "301.8"]},
    {"part_number": "233-7148", "part_type": "roller", "part_subtype": "bottom", "product_name": "Fits: Caterpillar 302.5 Bottom Track Roller", "compatible_models": ["302.5"]},
    {"part_number": "267-1389", "part_type": "roller", "part_subtype": "bottom", "product_name": "Fits: Caterpillar 303.5 303CR Lower Roller", "compatible_models": ["303.5", "303CR"]},
    {"part_number": "267-6691", "part_type": "roller", "part_subtype": "top", "product_name": "Fits: Caterpillar 303.5 303CR Upper Carrier Roller", "compatible_models": ["303.5", "303CR"]},
    {"part_number": "285-2066", "part_type": "roller", "part_subtype": "bottom", "product_name": "Fits: Caterpillar 304CR 305CR Bottom Roller", "compatible_models": ["304CR", "305CR"]},
    {"part_number": "285-2067", "part_type": "roller", "part_subtype": "top", "product_name": "Fits: Caterpillar 304CR 305CR Top Roller", "compatible_models": ["304CR", "305CR"]},
    {"part_number": "293-8672", "part_type": "roller", "part_subtype": "bottom", "product_name": "Fits: Caterpillar 303CCR 303ECR Lower Roller", "compatible_models": ["303CCR", "303ECR"]},
    {"part_number": "296-5829", "part_type": "roller", "part_subtype": "bottom", "product_name": "Fits: Caterpillar 302.5C Bottom Roller", "compatible_models": ["302.5C"]},
    {"part_number": "305-2877", "part_type": "roller", "part_subtype": "bottom", "product_name": "Fits: Caterpillar 304DCR 305DCR Lower Roller", "compatible_models": ["304DCR", "305DCR"]},
    {"part_number": "305-2878", "part_type": "roller", "part_subtype": "top", "product_name": "Fits: Caterpillar 304DCR 305DCR Upper Roller", "compatible_models": ["304DCR", "305DCR"]},
    {"part_number": "311-7740", "part_type": "roller", "part_subtype": "bottom", "product_name": "Fits: Caterpillar 305.5 305.5D Bottom Roller", "compatible_models": ["305.5", "305.5D"]},
    {"part_number": "315-5460", "part_type": "roller", "part_subtype": "bottom", "product_name": "Fits: Caterpillar 304E 305E Lower Roller", "compatible_models": ["304E", "305E"]},
    {"part_number": "315-5461", "part_type": "roller", "part_subtype": "top", "product_name": "Fits: Caterpillar 304E 305E Upper Carrier Roller", "compatible_models": ["304E", "305E"]},
    {"part_number": "352-2959", "part_type": "roller", "part_subtype": "bottom", "product_name": "Fits: Caterpillar 307D 308D Bottom Roller", "compatible_models": ["307D", "308D"]},
    {"part_number": "352-2960", "part_type": "roller", "part_subtype": "top", "product_name": "Fits: Caterpillar 307D 308D Top Carrier Roller", "compatible_models": ["307D", "308D"]},
    {"part_number": "374-2915", "part_type": "roller", "part_subtype": "bottom", "product_name": "Fits: Caterpillar 307E2 308E2 Lower Roller", "compatible_models": ["307E2", "308E2"]},
    {"part_number": "374-2916", "part_type": "roller", "part_subtype": "top", "product_name": "Fits: Caterpillar 307E2 308E2 Upper Roller", "compatible_models": ["307E2", "308E2"]},
    
    # Sprockets
    {"part_number": "127-3808", "part_type": "sprocket", "part_subtype": None, "product_name": "Fits: Caterpillar E70 E70B Drive Sprocket", "compatible_models": ["E70", "E70B"]},
    {"part_number": "158-4969", "part_type": "sprocket", "part_subtype": None, "product_name": "Fits: Caterpillar 301.5 301.6 301.8 Sprocket", "compatible_models": ["301.5", "301.6", "301.8"]},
    {"part_number": "233-7149", "part_type": "sprocket", "part_subtype": None, "product_name": "Fits: Caterpillar 302.5 Drive Sprocket", "compatible_models": ["302.5"]},
    {"part_number": "267-1390", "part_type": "sprocket", "part_subtype": None, "product_name": "Fits: Caterpillar 303.5 303CR Sprocket", "compatible_models": ["303.5", "303CR"]},
    {"part_number": "285-2068", "part_type": "sprocket", "part_subtype": None, "product_name": "Fits: Caterpillar 304CR 305CR Drive Sprocket", "compatible_models": ["304CR", "305CR"]},
    {"part_number": "293-8673", "part_type": "sprocket", "part_subtype": None, "product_name": "Fits: Caterpillar 303CCR 303ECR Sprocket", "compatible_models": ["303CCR", "303ECR"]},
    {"part_number": "296-5830", "part_type": "sprocket", "part_subtype": None, "product_name": "Fits: Caterpillar 302.5C Drive Sprocket", "compatible_models": ["302.5C"]},
    {"part_number": "305-2879", "part_type": "sprocket", "part_subtype": None, "product_name": "Fits: Caterpillar 304DCR 305DCR Sprocket", "compatible_models": ["304DCR", "305DCR"]},
    {"part_number": "311-7741", "part_type": "sprocket", "part_subtype": None, "product_name": "Fits: Caterpillar 305.5 305.5D Sprocket", "compatible_models": ["305.5", "305.5D"]},
    {"part_number": "315-5462", "part_type": "sprocket", "part_subtype": None, "product_name": "Fits: Caterpillar 304E 305E Drive Sprocket", "compatible_models": ["304E", "305E"]},
    {"part_number": "352-2961", "part_type": "sprocket", "part_subtype": None, "product_name": "Fits: Caterpillar 307D 308D Sprocket", "compatible_models": ["307D", "308D"]},
    {"part_number": "374-2917", "part_type": "sprocket", "part_subtype": None, "product_name": "Fits: Caterpillar 307E2 308E2 Drive Sprocket", "compatible_models": ["307E2", "308E2"]},
    
    # Idlers (Front Tension Idlers)
    {"part_number": "127-3809", "part_type": "idler", "part_subtype": "front", "product_name": "Fits: Caterpillar E70 E70B Front Idler", "compatible_models": ["E70", "E70B"]},
    {"part_number": "158-4970", "part_type": "idler", "part_subtype": "front", "product_name": "Fits: Caterpillar 301.5 301.6 301.8 Tension Idler", "compatible_models": ["301.5", "301.6", "301.8"]},
    {"part_number": "233-7150", "part_type": "idler", "part_subtype": "front", "product_name": "Fits: Caterpillar 302.5 Front Idler", "compatible_models": ["302.5"]},
    {"part_number": "267-1391", "part_type": "idler", "part_subtype": "front", "product_name": "Fits: Caterpillar 303.5 303CR Idler Assembly", "compatible_models": ["303.5", "303CR"]},
    {"part_number": "285-2069", "part_type": "idler", "part_subtype": "front", "product_name": "Fits: Caterpillar 304CR 305CR Front Idler", "compatible_models": ["304CR", "305CR"]},
    {"part_number": "293-8674", "part_type": "idler", "part_subtype": "front", "product_name": "Fits: Caterpillar 303CCR 303ECR Tension Idler", "compatible_models": ["303CCR", "303ECR"]},
    {"part_number": "296-5831", "part_type": "idler", "part_subtype": "front", "product_name": "Fits: Caterpillar 302.5C Front Idler", "compatible_models": ["302.5C"]},
    {"part_number": "305-2880", "part_type": "idler", "part_subtype": "front", "product_name": "Fits: Caterpillar 304DCR 305DCR Idler", "compatible_models": ["304DCR", "305DCR"]},
    {"part_number": "311-7742", "part_type": "idler", "part_subtype": "front", "product_name": "Fits: Caterpillar 305.5 305.5D Tension Idler", "compatible_models": ["305.5", "305.5D"]},
    {"part_number": "315-5463", "part_type": "idler", "part_subtype": "front", "product_name": "Fits: Caterpillar 304E 305E Front Idler Assembly", "compatible_models": ["304E", "305E"]},
    {"part_number": "352-2962", "part_type": "idler", "part_subtype": "front", "product_name": "Fits: Caterpillar 307D 308D Idler", "compatible_models": ["307D", "308D"]},
    {"part_number": "374-2918", "part_type": "idler", "part_subtype": "front", "product_name": "Fits: Caterpillar 307E2 308E2 Tension Idler", "compatible_models": ["307E2", "308E2"]},
]


async def import_caterpillar_parts():
    print("🚀 Importing Caterpillar Part Numbers from Rubbertrax...")
    print("=" * 80)
    
    # Clear existing Caterpillar parts
    result = await db.part_numbers.delete_many({"brand": "Caterpillar"})
    print(f"🗑️  Cleared {result.deleted_count} existing Caterpillar parts\n")
    
    # Import new parts
    imported_count = 0
    for part_data in CATERPILLAR_PARTS:
        part_doc = {
            "id": str(uuid.uuid4()),
            "brand": "Caterpillar",
            "part_number": part_data["part_number"],
            "part_type": part_data["part_type"],
            "part_subtype": part_data.get("part_subtype"),
            "product_name": part_data["product_name"],
            "compatible_models": part_data["compatible_models"],
            "price": None,  # To be set by admin
            "description": None,
            "image_url": None,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        try:
            await db.part_numbers.insert_one(part_doc)
            imported_count += 1
        except Exception as e:
            print(f"⚠️  Skipped duplicate: {part_data['part_number']} - {e}")
    
    print("=" * 80)
    print(f"✅ Import Complete!")
    print(f"   Total parts imported: {imported_count}")
    print("=" * 80)
    
    # Summary by part type
    rollers = await db.part_numbers.count_documents({"brand": "Caterpillar", "part_type": "roller"})
    sprockets = await db.part_numbers.count_documents({"brand": "Caterpillar", "part_type": "sprocket"})
    idlers = await db.part_numbers.count_documents({"brand": "Caterpillar", "part_type": "idler"})
    
    print(f"\n📊 Caterpillar Parts Summary:")
    print(f"   Rollers: {rollers}")
    print(f"   Sprockets: {sprockets}")
    print(f"   Idlers: {idlers}")
    print(f"   Total: {rollers + sprockets + idlers}")
    
    # Show sample parts
    print(f"\n📋 Sample Parts (first 5):")
    async for part in db.part_numbers.find({"brand": "Caterpillar"}).limit(5):
        print(f"   {part['part_number']} - {part['product_name']} ({part['part_type']})")
    
    print("\n✨ Caterpillar parts ready for admin pricing!")


if __name__ == "__main__":
    asyncio.run(import_caterpillar_parts())
