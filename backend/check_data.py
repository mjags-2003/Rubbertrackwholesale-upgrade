"""Check if CAT 277B and track sizes exist in database"""
from database import db
import asyncio

async def check_data():
    # Check for CAT 277B
    cat_277b = await db.compatibility.find_one({'make': 'CAT', 'model': '277B'})
    print(f"CAT 277B found: {cat_277b is not None}")
    if cat_277b:
        print(f"CAT 277B data: {cat_277b}")
    
    # Check for track size 18x4x56
    track_18_4_56 = await db.track_sizes.find_one({'size': '18x4x56'})
    print(f"\nTrack size 18x4x56 found: {track_18_4_56 is not None}")
    if track_18_4_56:
        print(f"Track size data: {track_18_4_56}")
    
    # Count total compatibilities and track sizes
    compat_count = await db.compatibility.count_documents({})
    track_count = await db.track_sizes.count_documents({})
    print(f"\nTotal compatibilities: {compat_count}")
    print(f"Total track sizes: {track_count}")
    
    # Check for any CAT models with '277' in name
    cat_277_models = await db.compatibility.find({'make': 'CAT', 'model': {'$regex': '277', '$options': 'i'}}).to_list(length=None)
    print(f"\nCAT models containing '277': {len(cat_277_models)}")
    for model in cat_277_models:
        print(f"  - {model['model']}: {model.get('track_sizes', [])}")

if __name__ == "__main__":
    asyncio.run(check_data())
