"""
Import track sizes and compatibility data from Camso spreadsheet
"""
import asyncio
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]


def parse_track_size(size_str):
    """Parse track size string like '300x52.5x84' into components"""
    if not size_str or pd.isna(size_str) or str(size_str).strip() in ['No Info', 'N/A', '']:
        return None
    
    try:
        size_str = str(size_str).strip()
        parts = size_str.split('x')
        if len(parts) == 3:
            width = float(parts[0])
            pitch = float(parts[1])
            links = int(parts[2])
            return {
                'size': size_str,
                'width': width,
                'pitch': pitch,
                'links': links
            }
    except (ValueError, IndexError):
        pass
    
    return None


async def import_data():
    print("🚀 Starting Camso Data Import...")
    print("=" * 80)
    
    # Load Excel file
    excel_file = pd.ExcelFile('camso_size_chart.xlsx')
    
    # Track unique sizes and compatibility mappings
    track_sizes_dict = {}  # key: size string, value: size details
    compatibility_list = []  # List of {make, model, track_sizes: []}
    
    # Process each sheet
    total_machines = 0
    total_sizes = 0
    
    for sheet_name in excel_file.sheet_names:
        print(f"\n📄 Processing sheet: {sheet_name}")
        df = pd.read_excel(excel_file, sheet_name=sheet_name)
        
        # Clean column names (remove trailing spaces)
        df.columns = df.columns.str.strip()
        
        for idx, row in df.iterrows():
            make = str(row.get('Make', '')).strip()
            model = str(row.get('Model', '')).strip()
            
            if not make or make == 'nan' or not model or model == 'nan':
                continue
            
            # Collect track sizes for this machine
            compatible_sizes = []
            
            # Check Size 1
            size1 = row.get('Size 1')
            parsed_size1 = parse_track_size(size1)
            if parsed_size1:
                size_key = parsed_size1['size']
                if size_key not in track_sizes_dict:
                    track_sizes_dict[size_key] = parsed_size1
                compatible_sizes.append(size_key)
            
            # Check Size 2
            size2 = row.get('Size 2')
            parsed_size2 = parse_track_size(size2)
            if parsed_size2:
                size_key = parsed_size2['size']
                if size_key not in track_sizes_dict:
                    track_sizes_dict[size_key] = parsed_size2
                # Only add if different from Size 1
                if size_key not in compatible_sizes:
                    compatible_sizes.append(size_key)
            
            # Add compatibility entry if we have valid sizes
            if compatible_sizes:
                compatibility_list.append({
                    'make': make,
                    'model': model,
                    'track_sizes': compatible_sizes
                })
                total_machines += 1
    
    total_sizes = len(track_sizes_dict)
    
    print("\n" + "=" * 80)
    print(f"📊 Extraction Summary:")
    print(f"   Total unique track sizes: {total_sizes}")
    print(f"   Total machine entries: {total_machines}")
    print("=" * 80)
    
    # Clear existing data
    print("\n🗑️  Clearing existing track sizes and compatibility data...")
    await db.track_sizes.delete_many({})
    await db.compatibilities.delete_many({})
    
    # Import Track Sizes
    print("\n📦 Importing Track Sizes...")
    track_size_docs = []
    for size_str, size_details in track_sizes_dict.items():
        doc = {
            'id': str(uuid.uuid4()),
            'size': size_str,
            'width': size_details['width'],
            'pitch': size_details['pitch'],
            'links': size_details['links'],
            'price': None,  # To be set by admin
            'is_active': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        track_size_docs.append(doc)
    
    if track_size_docs:
        await db.track_sizes.insert_many(track_size_docs)
        print(f"   ✅ Imported {len(track_size_docs)} track sizes")
    
    # Import Compatibility Data
    print("\n📦 Importing Compatibility Mappings...")
    compat_docs = []
    for entry in compatibility_list:
        doc = {
            'id': str(uuid.uuid4()),
            'make': entry['make'],
            'model': entry['model'],
            'track_sizes': entry['track_sizes'],
            'is_active': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        compat_docs.append(doc)
    
    if compat_docs:
        await db.compatibilities.insert_many(compat_docs)
        print(f"   ✅ Imported {len(compat_docs)} compatibility entries")
    
    print("\n" + "=" * 80)
    print("✅ Camso Data Import Complete!")
    print(f"   📊 Track Sizes: {len(track_size_docs)}")
    print(f"   📊 Compatibility Entries: {len(compat_docs)}")
    print("=" * 80)
    
    # Show sample track sizes
    print("\n📋 Sample Track Sizes (first 10):")
    sample_sizes = list(track_sizes_dict.keys())[:10]
    for i, size in enumerate(sample_sizes, 1):
        details = track_sizes_dict[size]
        print(f"   {i}. {size} (Width: {details['width']}mm, Pitch: {details['pitch']}mm, Links: {details['links']})")
    
    # Show sample compatibility
    print("\n📋 Sample Compatibility Entries (first 10):")
    for i, entry in enumerate(compatibility_list[:10], 1):
        print(f"   {i}. {entry['make']} {entry['model']} -> {', '.join(entry['track_sizes'][:2])}")
    
    print("\n✨ Ready to use!")


if __name__ == "__main__":
    asyncio.run(import_data())
