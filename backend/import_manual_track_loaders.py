"""
Manual import of critical track loader compatibility data
This adds key models like CAT 277B that are missing from the Camso data
Based on information from unitedskidtracks.com
"""

from database import db
import uuid
import logging
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get collections
track_sizes_collection = db.track_sizes
compatibility_collection = db.compatibility

# Known track loader compatibility data from unitedskidtracks.com
# Format: (brand, model, track_sizes_list)
TRACK_LOADER_DATA = [
    # CAT Track Loaders
    ("CAT", "277B", ["18x4x56"]),
    ("CAT", "277C", ["18x4x56"]),
    ("CAT", "277C2", ["18x4x56"]),
    ("CAT", "277D", ["18x4x56"]),
    ("CAT", "279C", ["18x4x50"]),
    ("CAT", "279C2", ["18x4x50"]),
    ("CAT", "279D", ["18x4x50"]),
    ("CAT", "279D3", ["18x4x50"]),
    ("CAT", "287", ["18x4x56"]),
    ("CAT", "287B", ["18x4x56"]),
    ("CAT", "287C", ["18x4x56"]),
    ("CAT", "287C2", ["18x4x56"]),
    ("CAT", "287D", ["18x4x56"]),
    ("CAT", "289C", ["18x4x51"]),
    ("CAT", "289C2", ["18x4x51"]),
    ("CAT", "289D", ["18x4x51"]),
    ("CAT", "289D3", ["18x4x51"]),
    ("CAT", "297C", ["18x4x56"]),
    ("CAT", "297D2XHP", ["18x4x56"]),
    ("CAT", "299C", ["18x4x51"]),
    ("CAT", "299D", ["18x4x51"]),
    ("CAT", "299D2", ["18x4x51"]),
    ("CAT", "299D2XHP", ["18x4x51"]),
    ("CAT", "299D3", ["18x4x51"]),
    ("CAT", "299D3XE", ["18x4x51"]),
    ("CAT", "257", ["13x4x56"]),
    ("CAT", "257B", ["13x4x56"]),
    ("CAT", "257B2", ["13x4x56"]),
    ("CAT", "257B3", ["13x4x56"]),
    ("CAT", "257D", ["13x4x56"]),
    ("CAT", "259B", ["13x4x56"]),
    ("CAT", "259B3", ["13x4x56"]),
    ("CAT", "259D", ["13x4x56"]),
    ("CAT", "259D3", ["13x4x56"]),
    ("CAT", "267", ["15x4x56"]),
    ("CAT", "267B", ["15x4x56"]),
    ("CAT", "267B2", ["15x4x56"]),
    ("CAT", "269C", ["15x4x56"]),
    ("CAT", "269D", ["15x4x56"]),
    ("CAT", "269D3", ["15x4x56"]),
    
    # Bobcat Track Loaders
    ("Bobcat", "T190", ["13x4x56"]),
    ("Bobcat", "T200", ["13x4x56"]),
    ("Bobcat", "T250", ["18x4x56"]),
    ("Bobcat", "T300", ["18x4x56"]),
    ("Bobcat", "T320", ["18x4x51"]),
    ("Bobcat", "T550", ["18x4x56"]),
    ("Bobcat", "T590", ["18x4x56"]),
    ("Bobcat", "T595", ["18x4x56"]),
    ("Bobcat", "T630", ["18x4x56"]),
    ("Bobcat", "T650", ["18x4x56"]),
    ("Bobcat", "T740", ["18x4x56"]),
    ("Bobcat", "T750", ["18x4x56"]),
    ("Bobcat", "T770", ["18x4x56"]),
    ("Bobcat", "T870", ["18x4x56"]),
]


async def ensure_track_size_exists(size_str):
    """Ensure track size exists in database"""
    # Parse size string like "18x4x56"
    parts = size_str.split('x')
    if len(parts) != 3:
        logger.error(f"Invalid track size format: {size_str}")
        return None
    
    width, pitch, links = [int(p) for p in parts]
    
    # Check if track size already exists
    existing = await track_sizes_collection.find_one({'size': size_str})
    if not existing:
        track_size_doc = {
            'id': str(uuid.uuid4()),
            'size': size_str,
            'width': width,
            'pitch': pitch,
            'links': links,
            'price': None,  # Price not available
            'is_in_stock': True,  # Default to in stock
            'is_active': True  # Required for public API
        }
        await track_sizes_collection.insert_one(track_size_doc)
        logger.info(f"Created track size: {size_str}")
    else:
        # Update existing to ensure it has is_active field
        await track_sizes_collection.update_one(
            {'size': size_str},
            {'$set': {'is_active': True}}
        )
        logger.info(f"Updated track size: {size_str}")
    
    return size_str


async def create_or_update_compatibility(brand, model, track_sizes):
    """Create or update compatibility entry"""
    if not track_sizes:
        return
    
    # Check if compatibility already exists
    existing = await compatibility_collection.find_one({'make': brand, 'model': model})
    
    if existing:
        # Update existing - add new track sizes if not already present
        existing_sizes = set(existing.get('track_sizes', []))
        new_sizes = set(track_sizes)
        combined_sizes = list(existing_sizes | new_sizes)
        
        await compatibility_collection.update_one(
            {'make': brand, 'model': model},
            {'$set': {'track_sizes': combined_sizes, 'is_active': True}}
        )
        logger.info(f"Updated compatibility for {brand} {model}: {combined_sizes}")
    else:
        # Create new compatibility entry
        compatibility_doc = {
            'id': str(uuid.uuid4()),
            'make': brand,
            'model': model,
            'track_sizes': track_sizes,
            'is_active': True  # Required for public API
        }
        await compatibility_collection.insert_one(compatibility_doc)
        logger.info(f"Created compatibility for {brand} {model}: {track_sizes}")


async def import_manual_data():
    """Import the manually curated track loader data"""
    logger.info("Starting manual import of track loader compatibility data...")
    
    total_created = 0
    total_track_sizes = set()
    
    for brand, model, track_sizes in TRACK_LOADER_DATA:
        # Ensure all track sizes exist
        valid_sizes = []
        for size_str in track_sizes:
            size = await ensure_track_size_exists(size_str)
            if size:
                valid_sizes.append(size)
                total_track_sizes.add(size)
        
        # Create or update compatibility
        if valid_sizes:
            await create_or_update_compatibility(brand, model, valid_sizes)
            total_created += 1
    
    logger.info(f"\n{'='*60}")
    logger.info(f"Manual import completed!")
    logger.info(f"Total models imported: {total_created}")
    logger.info(f"Unique track sizes: {len(total_track_sizes)}")
    logger.info(f"Track sizes: {sorted(total_track_sizes)}")
    logger.info(f"{'='*60}")


if __name__ == "__main__":
    asyncio.run(import_manual_data())
