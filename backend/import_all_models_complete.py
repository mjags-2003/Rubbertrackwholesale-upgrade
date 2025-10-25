"""
Complete import of ALL machine models from unitedskidtracks.com
Includes Track Loaders AND Mini Excavators
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# Complete machine models data - Track Loaders
track_loaders = {
    'ASV': ['2810', '4810', 'HD4520', 'MD70', 'MD70 Turbo', 'PT50', 'PT60', 'PT70', 'PT80', 'PT100', 'PT100 Forestry', 'RC30', 'RC50', 'RC60', 'RC85', 'RC100', 'RT25', 'RT30', 'RT40', 'RT50', 'RT60', 'RT65', 'RT65 MAX', 'RT75', 'RT75 MAX', 'RT75HD MAX', 'RT120', 'RT120 Forestry', 'RT135', 'RT135 Forestry', 'SR70', 'SR80', 'VT70', 'VT70 HO', 'VT70 HO MAX'],
    'Barreto': ['1324TK', '1624TK', '1824TK', '1836TK', '2024TK', '20RTK', '2324TK', '23RTK', '23TKD', '825TKL'],
    'Baumalight': ['TRL620D', 'TRL620Y'],
    'Bobcat': ['864', 'MT52', 'MT55', 'MT85', 'MT100', 'T62', 'T64', 'T66', 'T76', 'T86', 'T110', 'T140', 'T180', 'T190', 'T200', 'T250', 'T300', 'T320', 'T450', 'T550', 'T590', 'T595', 'T630', 'T650', 'T740', 'T750', 'T770', 'T870'],
    'Boxer': ['118', '320', '322', '322D', '375D', '385D', '400', '420', '600HD', '700HDX', 'TD327'],
    'Case': ['420CT', '440CT', '445CT', '450CT', 'TL1000', 'TR270', 'TR270B', 'TR310', 'TR310B', 'TR320', 'TR340', 'TR340B', 'TV370', 'TV370B', 'TV380', 'TV450', 'TV450B', 'TV620B'],
    'Caterpillar': ['239D', '239D3', '247', '247B', '247B2', '247B3', '249B', '249D', '249D3', '255', '257', '257B', '257B2', '257B3', '257D', '259B', '259B3', '259D', '259D3', '265', '267', '267B', '267B2', '277', '277B', '277C', '277D', '279D', '287', '287B', '287C', '287D', '289C', '289D', '297C', '297D', '297D XHP', '297D2', '297D2 XHP', '299C', '299D', '299D XHP', '299D2', '299D2 XHP', '299D3', '299D3 XE', '299D3 XHP'],
    'Dingo': ['220', '223', '320', '323', '323D', '323E', '427', '525', '527', '528', '530', 'TX-525', 'TX-1000'],
    'Ditch Witch': ['SK300', 'SK350', 'SK500', 'SK650', 'SK752', 'SK755', 'SK800', 'SK850', 'SK1050', 'SK1550', 'SK1750'],
    'Doosan': ['DL200', 'DL250', 'DL420', 'DL450'],
    'GEHL': ['4640', '4840', '5240', '5640', '6640', 'RT175', 'RT210', 'RT250', 'RT260'],
    'Hitachi': ['CG35', 'CG40', 'CG45', 'CG50', 'CG55', 'CG60', 'CG65', 'CG70'],
    'Hyundai': ['HSL650-7', 'HSL800T', 'HSL850-7'],
    'IHI': ['35N', '45N', '50N', '55N', '65N', '75N'],
    'JCB': ['135', '150', '160', '190', '205', '215', '225', '260', '300', '330'],
    'John Deere': ['315', '317', '318D', '318E', '319D', '319E', '320', '320D', '320E', '323D', '323E', '325', '326D', '326E', '328', '329D', '329E', '331D', '331E', '332D', '332E', '333D', '333E'],
    'Kobelco': ['SK025', 'SK030', 'SK035', 'SK045', 'SK050', 'SK055'],
    'Komatsu': ['CK20', 'CK25', 'CK30', 'CK35'],
    'Kubota': ['SVL65', 'SVL65-2', 'SVL75', 'SVL90-2', 'SVL95-2', 'SVL97-2'],
    'Marooka': ['MST300VD', 'MST600VD', 'MST800VD', 'MST1000VD', 'MST1500VD', 'MST2000VD'],
    'Mustang': ['1750RT', '2050RT', '2054RT', '2056RT', '2086RT', '3700RT'],
    'New Holland': ['C185', 'C190', 'C227', 'C232', 'C238', 'L218', 'L220', 'L223', 'L225', 'L230'],
    'SANY': ['SY16C', 'SY26U', 'SY50U', 'SY55U', 'SY60U', 'SY75U'],
    'Takeuchi': ['TL6R', 'TL8', 'TL10', 'TL12', 'TL12R2', 'TL230', 'TL240'],
    'Terex': ['PT-30', 'PT-50', 'PT-60', 'PT-70', 'PT-80', 'PT-100', 'PT-110'],
    'Terramac': ['RT6', 'RT9', 'RT14'],
    'Toro': ['TX420', 'TX425', 'TX427', 'TX525', 'TX1000', 'DINGO220', 'DINGO320', 'DINGO427', 'DINGO525', 'DINGO TX525'],
    'Vermeer': ['S450TX', 'S550TX', 'S650TX', 'S750TX', 'S800TX', 'S925TX'],
    'Volvo': ['MCT85C', 'MCT110C', 'MCT125C', 'MCT135C', 'MCT145C'],
    'Wacker Neuson': ['701s', '803', '1404', '1501', '1701', '2503', 'ST31'],
}

# Mini Excavators - extracted from unitedskidtracks.com
mini_excavators = {
    'Bobcat': ['320', '322G', '323', '324', '325', '325G', '331', '331D', '331E', '331G', '334', '334D', '334G', '335', '337', '337G', '341', '418', '430', '442', 'E10', 'E10E', 'E10Z', 'E17', 'E19', 'E20', 'E20Z', 'E26', 'E26R', 'E32', 'E32i', 'E35', 'E35i', 'E35R2', 'E42', 'E42R2', 'E45', 'E50', 'E50R2', 'E55', 'E60', 'E60R2', 'E63', 'E80', 'E85', 'X331'],
    'Case': ['CX14', 'CX17B', 'CX17C', 'CX25', 'CX27B', 'CX30C', 'CX31B', 'CX36B', 'CX50', 'CX55B', 'CX57C', 'CX60C', 'CX75CSR', 'CX80C'],
    'Caterpillar': ['301.4C', '301.5', '301.6', '301.7CR', '301.7D', '301.8', '301.8C', '302.5', '302.5CR', '302.7D', '302.7DCR', '303.5CCR', '303.5DCR', '303.5E2CR', '303.5ECR', '303CCR', '303CR', '303ECR', '304CCR', '304CR', '304DCR', '304E2CR', '304ECR', '305', '305.5DCR', '305.5E', '305.5E2', '305.5E2CR', '305.5ECR', '305CCR', '305D CR', '305E2', '305E2CR', '305ECR', '306', '308E2CR'],
    'Doosan': ['DX19', 'DX27', 'DX27Z', 'DX30', 'DX30Z', 'DX35', 'DX35Z', 'DX55', 'DX60', 'DX60R', 'DX62R', 'DX63R', 'DX80', 'DX80R', 'DX85R'],
    'GEHL': ['503Z', 'Z35'],
    'John Deere': ['17D', '17G', '26G', '27CZTS', '27D', '30G', '35C', '35D', '35G', '35ZTS', '50D', '50G', '60D', '60G'],
    'Kubota': ['KX018-4', 'KX033', 'KX033-4', 'KX040', 'KX040-4', 'KX057-4', 'KX057-5', 'KX080-3', 'KX080-4', 'KX080-5', 'KX121-2', 'KX121-3', 'KX161-3', 'KX21', 'KX41-2', 'KX41-2V', 'KX61-2', 'KX71-3', 'KX91', 'KX91-2', 'KX91-3', 'U15', 'U17', 'U25-3', 'U35-4', 'U35S', 'U45', 'U45-3', 'U55', 'U55-4'],
    'New Holland': ['EC15', 'EC35'],
    'SANY': ['SY35U', 'SY50', 'SY60C', 'SY75C', 'SY80U'],
    'Takeuchi': ['TB008', 'TB015', 'TB016', 'TB025', 'TB035', 'TB080', 'TB125', 'TB135', 'TB138FR', 'TB145', 'TB153FR', 'TB175', 'TB180FR', 'TB230', 'TB235', 'TB240', 'TB250A', 'TB260', 'TB280FR', 'TB285', 'TB370', 'TB53FR'],
    'Volvo': ['EC15B', 'EC20', 'EC25', 'EC35', 'EC45', 'EC55', 'EC55B', 'EC55C', 'ECR25D', 'ECR38', 'ECR40D', 'ECR48C', 'ECR58', 'ECR88'],
    'Wacker Neuson': ['28Z3', '3503', '38Z3'],
}

async def import_all_models():
    """Import ALL machine models - Track Loaders + Mini Excavators"""
    
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    print(f"🔗 Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    machine_models_collection = db.machine_models
    
    # Clear existing models
    print(f"🗑️  Clearing existing models...")
    await machine_models_collection.delete_many({})
    
    imported = 0
    
    print(f"\n{'='*70}")
    print(f"🚀 IMPORTING TRACK LOADERS")
    print(f"{'='*70}\n")
    
    for brand, models in track_loaders.items():
        print(f"📦 {brand}: {len(models)} track loader models")
        
        for model_name in models:
            model_doc = {
                "brand": brand,
                "model_name": model_name,
                "full_name": f"{brand} {model_name}",
                "equipment_type": "Track Loader",
                "description": "",
                "product_image": "",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await machine_models_collection.insert_one(model_doc)
            imported += 1
    
    print(f"\n{'='*70}")
    print(f"🚀 IMPORTING MINI EXCAVATORS")
    print(f"{'='*70}\n")
    
    for brand, models in mini_excavators.items():
        print(f"🏗️  {brand}: {len(models)} mini excavator models")
        
        for model_name in models:
            model_doc = {
                "brand": brand,
                "model_name": model_name,
                "full_name": f"{brand} {model_name}",
                "equipment_type": "Mini Excavator",
                "description": "",
                "product_image": "",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await machine_models_collection.insert_one(model_doc)
            imported += 1
    
    final_count = await machine_models_collection.count_documents({})
    track_loader_count = await machine_models_collection.count_documents({"equipment_type": "Track Loader"})
    mini_ex_count = await machine_models_collection.count_documents({"equipment_type": "Mini Excavator"})
    
    print(f"\n{'='*70}")
    print(f"✅ IMPORT COMPLETE!")
    print(f"{'='*70}")
    print(f"📊 Statistics:")
    print(f"   • Track Loaders: {track_loader_count}")
    print(f"   • Mini Excavators: {mini_ex_count}")
    print(f"   • Total Models: {final_count}")
    print(f"   • Brands Covered: {len(set(list(track_loaders.keys()) + list(mini_excavators.keys())))}")
    print(f"{'='*70}\n")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(import_all_models())
