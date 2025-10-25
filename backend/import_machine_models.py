"""
Script to import all machine models from machineModels.js into MongoDB
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# Machine models data extracted from machineModels.js
machine_models_data = {
    'ASV': ['RT-25', 'RT-30', 'RT-40', 'RT-50', 'RT-60', 'RT-75', 'RT-120', 'VT-70'],
    'Barreto': ['1320TK', '30SGK', 'E1318', 'E16TK', 'E18TK', 'E26TK'],
    'Baumalight': ['S450', 'S550', 'S650', 'S750'],
    'Bobcat': ['T140', 'T180', 'T190', 'T200', 'T250', 'T300', 'T320', 'T450', 'T550', 'T590', 'T595', 'T630', 'T650', 'T740', 'T750', 'T770', 'T870'],
    'Boxer': ['320', '425D', '427D', '525DX', '527DX', '532DX'],
    'Case': ['420CT', '440CT', '445CT', '450CT', 'TV380', 'TV450'],
    'Caterpillar': ['247', '247B', '257', '257B', '259D', '267', '267B', '277', '277B', '279D', '287', '287B', '289D', '297D', '299D', '299D XHP'],
    'Dingo': ['220', '323', '427', '525', 'TX-525', 'TX-1000'],
    'Ditch Witch': ['SK650', 'SK752', 'SK755', 'SK800', 'SK850', 'SK1050'],
    'Doosan': ['DL200', 'DL250', 'DL420', 'DL450'],
    'GEHL': ['4640', '4840', '5240', '5640', '6640', 'RT175', 'RT210', 'RT250', 'RT260'],
    'Hitachi': ['CG35', 'CG40', 'CG45', 'CG50', 'CG55', 'CG60', 'CG65', 'CG70'],
    'Hyundai': ['HSL650-7', 'HSL800T', 'HSL850-7'],
    'IHI': ['35N', '45N', '50N', '55N', '65N', '75N'],
    'JCB': ['135', '150', '160', '190', '205', '215', '225', '260', '300', '330'],
    'John Deere': ['315', '317', '318D', '318E', '319D', '319E', '320', '320D', '320E', '323D', '323E', '325', '326D', '326E', '328', '329D', '329E', '331D', '331E', '332D', '332E', '333D', '333E'],
    'Kobelco': ['SK025', 'SK030', 'SK035', 'SK045', 'SK050', 'SK055'],
    'Komatsu': ['CK20', 'CK25', 'CK30', 'CK35'],
    'Kubota': ['SVL65', 'SVL75', 'SVL90-2', 'SVL95-2', 'SVL97-2'],
    'Marooka': ['MST300VD', 'MST600VD', 'MST800VD', 'MST1000VD', 'MST1500VD', 'MST2000VD'],
    'Mustang': ['1750RT', '2050RT', '2054RT', '2056RT', '2086RT', '3700RT'],
    'New Holland': ['C185', 'C190', 'C227', 'C232', 'C238', 'L218', 'L220', 'L223', 'L225', 'L230'],
    'SANY': ['SY16C', 'SY26U', 'SY35U', 'SY50U', 'SY55U', 'SY60U', 'SY75U'],
    'Takeuchi': ['TL6R', 'TL8', 'TL10', 'TL12', 'TL12R2', 'TL230', 'TL240'],
    'Terex': ['PT-30', 'PT-50', 'PT-60', 'PT-70', 'PT-80', 'PT-100', 'PT-110'],
    'Terramac': ['RT6', 'RT9', 'RT14'],
    'Toro': ['TX420', 'TX425', 'TX427', 'TX525', 'TX1000', 'DINGO220', 'DINGO320', 'DINGO427', 'DINGO525', 'DINGO TX525'],
    'Vermeer': ['S450TX', 'S550TX', 'S650TX', 'S750TX', 'S800TX', 'S925TX'],
    'Volvo': ['MCT85C', 'MCT110C', 'MCT125C', 'MCT135C', 'MCT145C'],
    'Wacker Neuson': ['701s', '803', '1404', '1501', '1701', '2503', 'ST31'],
}

async def import_models():
    """Import all machine models into MongoDB"""
    
    # Get database connection details from environment
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    print(f"🔗 Connecting to MongoDB at {mongo_url}")
    print(f"📊 Database: {db_name}")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    machine_models_collection = db.machine_models
    
    # Check if models already exist
    existing_count = await machine_models_collection.count_documents({})
    if existing_count > 0:
        print(f"ℹ️  Found {existing_count} existing models")
        confirm = input("Do you want to continue and add missing models? (y/n): ")
        if confirm.lower() != 'y':
            print("❌ Import cancelled")
            return
    
    imported = 0
    skipped = 0
    total = sum(len(models) for models in machine_models_data.values())
    
    print(f"\n🚀 Starting import of {total} machine models...")
    
    for brand, models in machine_models_data.items():
        print(f"\n📦 Processing {brand} ({len(models)} models)...")
        
        for model_name in models:
            # Check if model already exists
            existing = await machine_models_collection.find_one({
                "brand": brand,
                "model_name": model_name
            })
            
            if existing:
                skipped += 1
                print(f"  ⏭️  Skipped: {brand} {model_name} (already exists)")
            else:
                # Create new model
                model_doc = {
                    "brand": brand,
                    "model_name": model_name,
                    "full_name": f"{brand} {model_name}",
                    "description": "",
                    "product_image": "",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                await machine_models_collection.insert_one(model_doc)
                imported += 1
                print(f"  ✅ Imported: {brand} {model_name}")
    
    # Final count
    final_count = await machine_models_collection.count_documents({})
    
    print(f"\n{'='*60}")
    print(f"✅ Import Complete!")
    print(f"{'='*60}")
    print(f"📊 Statistics:")
    print(f"   • Total models in file: {total}")
    print(f"   • Newly imported: {imported}")
    print(f"   • Already existed: {skipped}")
    print(f"   • Total in database: {final_count}")
    print(f"{'='*60}\n")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(import_models())
