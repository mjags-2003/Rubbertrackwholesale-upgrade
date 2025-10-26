"""
Crawl unitedskidtracks.com to import comprehensive track compatibility data
Focuses on track loaders to fill data gaps from Camso spreadsheet
"""

import requests
from bs4 import BeautifulSoup
import re
import time
import logging
from database import track_sizes_collection, compatibilities_collection
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Base URL
BASE_URL = "https://unitedskidtracks.com"

# Brand mapping to normalize brand names
BRAND_MAPPING = {
    "Caterpillar": "CAT",
    "CASE": "CASE",
    "Bobcat": "Bobcat",
    "John Deere": "John Deere",
    "Kubota": "Kubota",
    "ASV": "ASV",
    "Gehl": "Gehl",
    "Terex": "Terex",
    "New Holland": "New Holland",
    "Takeuchi": "Takeuchi",
    "Volvo": "Volvo",
    "Mustang": "Mustang",
    "Wacker Neuson": "Wacker Neuson",
    "Yanmar": "Yanmar",
    "IHI": "IHI",
    "Boxer": "Boxer",
    "Barreto": "Barreto",
    "Baumalight": "Baumalight",
    "Ditch Witch": "Ditch-Witch",
    "Hitachi": "Hitachi",
    "Kobelco": "Kobelco",
    "Komatsu": "Komatsu",
    "SANY": "SANY",
    "Sumitomo": "Sumitomo",
    "JCB": "JCB",
}


def normalize_brand_name(brand):
    """Normalize brand name using mapping"""
    for key, value in BRAND_MAPPING.items():
        if brand.lower() == key.lower():
            return value
    return brand


def parse_track_size(size_text):
    """
    Parse track size from various formats like:
    - "18x4x56"
    - "450x86x60"
    - "18 inch x 4 inch x 56 links"
    Returns dict with width, pitch, links
    """
    # Remove common noise words
    size_text = size_text.replace("inch", "").replace("mm", "").replace("links", "").strip()
    
    # Try to match pattern like 18x4x56 or 450x86x60
    match = re.search(r'(\d+)[\s]*x[\s]*(\d+)[\s]*x[\s]*(\d+)', size_text)
    if match:
        width, pitch, links = match.groups()
        return {
            'width': int(width),
            'pitch': int(pitch),
            'links': int(links)
        }
    return None


def get_track_loaders_page():
    """Get the main track loaders page to extract brands and models"""
    try:
        logger.info("Fetching track loaders main page...")
        response = requests.get(f"{BASE_URL}/track-loaders/", timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        return soup
    except Exception as e:
        logger.error(f"Error fetching track loaders page: {e}")
        return None


def extract_brands_and_models(soup):
    """Extract brand and model URLs from the navigation"""
    brands_models = {}
    
    # Find all brand links in the navigation
    # The structure shows links like /track-loaders/{brand}/{model}/tracks/
    all_links = soup.find_all('a', href=re.compile(r'/track-loaders/.+/.+/tracks/?'))
    
    for link in all_links:
        href = link.get('href', '')
        # Extract brand and model from URL pattern /track-loaders/{brand}/{model}/tracks/
        match = re.search(r'/track-loaders/([^/]+)/([^/]+)/tracks/?', href)
        if match:
            brand_slug, model_slug = match.groups()
            # Convert slug to readable name
            brand = brand_slug.replace('-', ' ').title()
            model = model_slug.replace('-', ' ').upper()
            
            brand = normalize_brand_name(brand)
            
            if brand not in brands_models:
                brands_models[brand] = []
            
            brands_models[brand].append({
                'model': model,
                'url': f"{BASE_URL}{href}" if not href.startswith('http') else href
            })
    
    return brands_models


def fetch_track_sizes_for_model(url, brand, model):
    """Fetch track sizes available for a specific model"""
    try:
        logger.info(f"Fetching tracks for {brand} {model} from {url}")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        track_sizes = []
        
        # Look for product listings on the page
        # Products are typically in divs or cards with class containing "product"
        products = soup.find_all(['div', 'article'], class_=re.compile(r'product', re.I))
        
        for product in products:
            # Look for product title or name that might contain track size
            title_elem = product.find(['h3', 'h4', 'a'], class_=re.compile(r'(title|name|product)', re.I))
            if title_elem:
                title_text = title_elem.get_text(strip=True)
                logger.info(f"Found product: {title_text}")
                
                # Try to extract track size from title
                # Patterns like "Caterpillar 277B Track - Bar" or "18x4x56"
                size_match = re.search(r'(\d+[\s]*x[\s]*\d+[\s]*x[\s]*\d+)', title_text)
                if size_match:
                    size_text = size_match.group(1)
                    parsed_size = parse_track_size(size_text)
                    if parsed_size and parsed_size not in track_sizes:
                        track_sizes.append(parsed_size)
        
        # If no track sizes found in product listings, try to find in page text
        if not track_sizes:
            # Look for text patterns like "18x4x56" in the entire page content
            page_text = soup.get_text()
            size_matches = re.findall(r'(\d+[\s]*x[\s]*\d+[\s]*x[\s]*\d+)', page_text)
            for size_text in size_matches:
                parsed_size = parse_track_size(size_text)
                if parsed_size and parsed_size not in track_sizes:
                    track_sizes.append(parsed_size)
        
        return track_sizes
    except Exception as e:
        logger.error(f"Error fetching track sizes for {brand} {model}: {e}")
        return []


def ensure_track_size_exists(size_data):
    """Ensure track size exists in database, return size string"""
    width = size_data['width']
    pitch = size_data['pitch']
    links = size_data['links']
    size_str = f"{width}x{pitch}x{links}"
    
    # Check if track size already exists
    existing = track_sizes_collection.find_one({'size': size_str})
    if not existing:
        track_size_doc = {
            'id': str(uuid.uuid4()),
            'size': size_str,
            'width': width,
            'pitch': pitch,
            'links': links,
            'price': None,  # Price not available from crawl
            'is_in_stock': True  # Default to in stock
        }
        track_sizes_collection.insert_one(track_size_doc)
        logger.info(f"Created new track size: {size_str}")
    
    return size_str


def create_or_update_compatibility(brand, model, track_sizes):
    """Create or update compatibility entry for a machine"""
    if not track_sizes:
        return
    
    # Normalize brand and model
    brand = normalize_brand_name(brand)
    model = model.strip()
    
    # Check if compatibility already exists
    existing = compatibilities_collection.find_one({'make': brand, 'model': model})
    
    if existing:
        # Update existing - add new track sizes if not already present
        existing_sizes = set(existing.get('track_sizes', []))
        new_sizes = set(track_sizes)
        combined_sizes = list(existing_sizes | new_sizes)
        
        compatibilities_collection.update_one(
            {'make': brand, 'model': model},
            {'$set': {'track_sizes': combined_sizes}}
        )
        logger.info(f"Updated compatibility for {brand} {model}: {combined_sizes}")
    else:
        # Create new compatibility entry
        compatibility_doc = {
            'id': str(uuid.uuid4()),
            'make': brand,
            'model': model,
            'track_sizes': track_sizes
        }
        compatibilities_collection.insert_one(compatibility_doc)
        logger.info(f"Created compatibility for {brand} {model}: {track_sizes}")


def import_track_loaders_data(limit_brands=None, limit_per_brand=None):
    """
    Main function to import track loader data
    limit_brands: List of brands to import (e.g., ["CAT", "Bobcat"]), None for all
    limit_per_brand: Number of models to import per brand, None for all
    """
    # Get main page
    soup = get_track_loaders_page()
    if not soup:
        logger.error("Failed to fetch main page")
        return
    
    # Extract brands and models
    brands_models = extract_brands_and_models(soup)
    logger.info(f"Found {len(brands_models)} brands")
    
    total_models_processed = 0
    total_compatibilities_created = 0
    
    for brand, models in brands_models.items():
        # Skip if not in limit_brands
        if limit_brands and brand not in limit_brands:
            continue
        
        logger.info(f"\n{'='*60}")
        logger.info(f"Processing brand: {brand} ({len(models)} models)")
        logger.info(f"{'='*60}")
        
        models_to_process = models[:limit_per_brand] if limit_per_brand else models
        
        for model_info in models_to_process:
            model = model_info['model']
            url = model_info['url']
            
            # Fetch track sizes for this model
            track_size_data = fetch_track_sizes_for_model(url, brand, model)
            
            if track_size_data:
                # Ensure track sizes exist in database
                track_size_strings = []
                for size_data in track_size_data:
                    size_str = ensure_track_size_exists(size_data)
                    track_size_strings.append(size_str)
                
                # Create or update compatibility
                create_or_update_compatibility(brand, model, track_size_strings)
                total_compatibilities_created += 1
            else:
                logger.warning(f"No track sizes found for {brand} {model}")
            
            total_models_processed += 1
            
            # Be polite to the server
            time.sleep(1)
    
    logger.info(f"\n{'='*60}")
    logger.info(f"Import completed!")
    logger.info(f"Total models processed: {total_models_processed}")
    logger.info(f"Total compatibilities created/updated: {total_compatibilities_created}")
    logger.info(f"{'='*60}")


if __name__ == "__main__":
    # Start with CAT models only for testing
    # Then expand to all brands
    
    # Test with just CAT brand, limit to 5 models
    logger.info("Starting import with CAT brand (testing)...")
    import_track_loaders_data(limit_brands=["CAT"], limit_per_brand=5)
    
    # Uncomment below to import all brands
    # logger.info("Starting full import...")
    # import_track_loaders_data()
