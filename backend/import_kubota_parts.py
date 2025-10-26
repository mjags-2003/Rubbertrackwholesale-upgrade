"""
Import Kubota part numbers from Rubbertrax data
"""
import asyncio
import uuid
import re
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

# Kubota parts data extracted from Rubbertrax
KUBOTA_PARTS = [
    # Rollers (Bottom and Top/Upper Carrier)
    {"part_number": "68493-21700", "part_type": "roller", "part_subtype": "bottom", "product_name": "Kubota KH151 KH191 KX151 Roller", "compatible_models": ["KH151", "KH191", "KX151"]},
    {"part_number": "68658-21750", "part_type": "roller", "part_subtype": "bottom", "product_name": "Kubota KH 90 KX101 Bottom Roller", "compatible_models": ["KH 90", "KX101"]},
    {"part_number": "69371-21800", "part_type": "roller", "part_subtype": "bottom", "product_name": "Kubota RG30 Roller", "compatible_models": ["RG30"]},
    {"part_number": "8LM8-11010CG", "part_type": "roller", "part_subtype": "bottom", "product_name": "Case CX60c CX57c Bottom Roller (Compatible with Kubota)", "compatible_models": ["CX60c", "CX57c"]},
    {"part_number": "RA221-21700", "part_type": "roller", "part_subtype": "bottom", "product_name": "Kubota KX 41-3 U15 Bottom Track Roller", "compatible_models": ["KX 41-3", "U15"]},
    {"part_number": "RB511-21702", "part_type": "roller", "part_subtype": "bottom", "product_name": "Kubota KX91-3 KX71-3 U35-3 Lower Roller", "compatible_models": ["KX91-3", "KX71-3", "U35-3"]},
    {"part_number": "RC101-21803", "part_type": "roller", "part_subtype": "bottom", "product_name": "Kubota KX 121-2 Bottom Track Roller", "compatible_models": ["KX 121-2"]},
    {"part_number": "RC208-21904", "part_type": "roller", "part_subtype": "top", "product_name": "Kubota KX91-2 KX121-2 KX 101 Upper Roller", "compatible_models": ["KX91-2", "KX121-2", "KX 101"]},
    {"part_number": "RC767-21900", "part_type": "roller", "part_subtype": "top", "product_name": "Kubota U25 U35 Top Roller", "compatible_models": ["U25", "U35"]},
    {"part_number": "RC788-21700", "part_type": "roller", "part_subtype": "bottom", "product_name": "Kubota U35-4 Bottom Track Roller", "compatible_models": ["U35-4"]},
    {"part_number": "RC101-21803", "part_type": "roller", "part_subtype": "bottom", "product_name": "Kubota KX 121-2 Lower Roller", "compatible_models": ["KX 121-2"]},
    {"part_number": "RD118-21700", "part_type": "roller", "part_subtype": "bottom", "product_name": "Kubota KX121-3 KX040-4 Lower Track Roller", "compatible_models": ["KX121-3", "KX040-4"]},
    {"part_number": "RD208-21904", "part_type": "roller", "part_subtype": "top", "product_name": "Kubota KX 161-2 Upper Carrier Roller", "compatible_models": ["KX 161-2"]},
    {"part_number": "RC101-21803", "part_type": "roller", "part_subtype": "bottom", "product_name": "Kubota KX 71-2 91-2 Bottom Roller", "compatible_models": ["KX 71-2", "KX 91-2"]},
    {"part_number": "RD411-21700", "part_type": "roller", "part_subtype": "bottom", "product_name": "Kubota KX 161-3 U-45-3 Lower Roller", "compatible_models": ["KX 161-3", "U-45-3"]},
    {"part_number": "RD547-22900", "part_type": "roller", "part_subtype": "top", "product_name": "Kubota U45-3 U55-4 Upper Roller", "compatible_models": ["U45-3", "U55-4"]},
    {"part_number": "RD809-21900", "part_type": "roller", "part_subtype": "top", "product_name": "Kubota KX 080-3 Carrier Top Roller", "compatible_models": ["KX 080-3"]},
    {"part_number": "RD829-21900", "part_type": "roller", "part_subtype": "top", "product_name": "Kubota KX 080-4 Top Carrier Roller", "compatible_models": ["KX 080-4"]},
    {"part_number": "RG158-21700", "part_type": "roller", "part_subtype": "bottom", "product_name": "Kubota KX018-4 KX019-4 Bottom Rollers", "compatible_models": ["KX018-4", "KX019-4"]},
    
    # Sprockets
    {"part_number": "68621-14430", "part_type": "sprocket", "part_subtype": None, "product_name": "Kubota KX 91-2 Sprocket", "compatible_models": ["KX 91-2"]},
    {"part_number": "68658-14430", "part_type": "sprocket", "part_subtype": None, "product_name": "Kubota KX 121-2 and KX-101 Sprocket", "compatible_models": ["KX 121-2", "KX-101"]},
    {"part_number": "68678-14430", "part_type": "sprocket", "part_subtype": None, "product_name": "Kubota KX 161-2 KX151 Sprocket", "compatible_models": ["KX 161-2", "KX151"]},
    {"part_number": "RA111-14430", "part_type": "sprocket", "part_subtype": None, "product_name": "Kubota K008-3 U10-5 Sprocket", "compatible_models": ["K008-3", "U10-5"]},
    {"part_number": "RB511-14432", "part_type": "sprocket", "part_subtype": None, "product_name": "Kubota U25 Sprockets", "compatible_models": ["U25"]},
    {"part_number": "RC788-14430", "part_type": "sprocket", "part_subtype": None, "product_name": "Kubota U-35-4 Sprockets", "compatible_models": ["U-35-4"]},
    {"part_number": "RD118-14433", "part_type": "sprocket", "part_subtype": None, "product_name": "Kubota KX 121-3 Drive Sprocket", "compatible_models": ["KX 121-3"]},
    {"part_number": "68678-14430", "part_type": "sprocket", "part_subtype": None, "product_name": "Kubota KX 161-2 Sprocket", "compatible_models": ["KX 161-2"]},
    {"part_number": "RD411-14432", "part_type": "sprocket", "part_subtype": None, "product_name": "Kubota U45-3 U55-4 Sprocket", "compatible_models": ["U45-3", "U55-4"]},
    
    # Idlers
    {"part_number": "68678-94300", "part_type": "idler", "part_subtype": "front", "product_name": "Kubota KX 161 151 Case CK 50 Idler", "compatible_models": ["KX 161", "KX 151", "Case CK 50"]},
    {"part_number": "69191-21300", "part_type": "idler", "part_subtype": "front", "product_name": "Kubota K008-3 U10-3 Tension Idler", "compatible_models": ["K008-3", "U10-3"]},
    {"part_number": "RC348-21302", "part_type": "idler", "part_subtype": "front", "product_name": "Kubota KX 71-3 and U25 Aftermarket Idler", "compatible_models": ["KX 71-3", "U25"]},
    {"part_number": "RC411-21306", "part_type": "idler", "part_subtype": "front", "product_name": "Kubota KX 91-3 and U 35-3 Idler Assembly", "compatible_models": ["KX 91-3", "U 35-3"]},
    {"part_number": "RD101-21300", "part_type": "idler", "part_subtype": "front", "product_name": "Kubota KX 121-2 121-2SS Tension Idler", "compatible_models": ["KX 121-2", "KX 121-2SS"]},
    {"part_number": "RD118-21300", "part_type": "idler", "part_subtype": "front", "product_name": "Kubota 121-3 Replacement Tension Idler", "compatible_models": ["KX 121-3"]},
    {"part_number": "RD208-21300", "part_type": "idler", "part_subtype": "front", "product_name": "Kubota 161-2 Front Idler - Low Serials", "compatible_models": ["KX 161-2"]},
    {"part_number": "RD411-22303", "part_type": "idler", "part_subtype": "front", "product_name": "Kubota KX 161-3 Tension Idler Assembly", "compatible_models": ["KX 161-3"]},
    {"part_number": "RD809-21300", "part_type": "idler", "part_subtype": "front", "product_name": "Kubota U55-4 Tension Idler Assembly", "compatible_models": ["U55-4"]},
]


async def import_kubota_parts():
    print("🚀 Importing Kubota Part Numbers from Rubbertrax...")
    print("=" * 80)
    
    # Clear existing Kubota parts
    result = await db.part_numbers.delete_many({"brand": "Kubota"})
    print(f"🗑️  Cleared {result.deleted_count} existing Kubota parts\n")
    
    # Import new parts
    imported_count = 0
    for part_data in KUBOTA_PARTS:
        part_doc = {
            "id": str(uuid.uuid4()),
            "brand": "Kubota",
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
    rollers = await db.part_numbers.count_documents({"brand": "Kubota", "part_type": "roller"})
    sprockets = await db.part_numbers.count_documents({"brand": "Kubota", "part_type": "sprocket"})
    idlers = await db.part_numbers.count_documents({"brand": "Kubota", "part_type": "idler"})
    
    print(f"\n📊 Kubota Parts Summary:")
    print(f"   Rollers: {rollers}")
    print(f"   Sprockets: {sprockets}")
    print(f"   Idlers: {idlers}")
    print(f"   Total: {rollers + sprockets + idlers}")
    
    # Show sample parts
    print(f"\n📋 Sample Parts (first 5):")
    async for part in db.part_numbers.find({"brand": "Kubota"}).limit(5):
        print(f"   {part['part_number']} - {part['product_name']} ({part['part_type']})")
    
    print("\n✨ Kubota parts ready for admin pricing!")


if __name__ == "__main__":
    asyncio.run(import_kubota_parts())
