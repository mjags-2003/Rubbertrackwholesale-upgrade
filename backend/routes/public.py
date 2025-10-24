from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import Product, Brand, Category, ContactMessage
from database import products_collection, brands_collection, categories_collection, contact_messages_collection
from bson import ObjectId
from datetime import datetime
import re

router = APIRouter()


def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


# Products Endpoints
@router.get("/products")
async def get_products(
    brand: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "featured",
    limit: int = Query(default=50, le=100),
    skip: int = 0
):
    """Get all products with filters"""
    query = {}
    
    if brand:
        query["brand"] = brand
    
    if category:
        query["category"] = category
    
    if search:
        # Normalize search term (remove spaces, convert to lowercase)
        search_normalized = search.replace(" ", "").lower()
        
        # Build comprehensive search query
        search_conditions = [
            {"title": {"$regex": search, "$options": "i"}},
            {"sku": {"$regex": search, "$options": "i"}},
            {"part_number": {"$regex": search, "$options": "i"}},
            {"size": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
        
        # Add normalized size search (handles formats like 400x86x52, 300x52.5x74)
        # This helps match sizes even with spacing variations
        search_conditions.append({"size": {"$regex": search_normalized, "$options": "i"}})
        
        # Search in machine model specifications
        search_conditions.append({"specifications.machine_model": {"$regex": search, "$options": "i"}})
        
        # Search in fits_models field (for undercarriage parts)
        search_conditions.append({"specifications.fits_models": {"$regex": search, "$options": "i"}})
        
        query["$or"] = search_conditions
    
    # Sorting
    sort_options = {
        "price-low": [("price", 1)],
        "price-high": [("price", -1)],
        "name": [("title", 1)],
        "featured": [("created_at", -1)]
    }
    sort_by = sort_options.get(sort, [("created_at", -1)])
    
    products = await products_collection.find(query).sort(sort_by).skip(skip).limit(limit).to_list(limit)
    return [serialize_doc(p) for p in products]


@router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Get single product by ID with SEO data"""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    product = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return serialize_doc(product)


@router.get("/products/search/advanced")
async def advanced_search(
    query: str,
    limit: int = Query(default=20, le=50)
):
    """Advanced search by size, part number, machine model, or any field"""
    # Normalize query (remove spaces, lowercase for size matching)
    query_normalized = query.replace(" ", "").lower()
    
    search_query = {
        "$or": [
            {"title": {"$regex": query, "$options": "i"}},
            {"sku": {"$regex": query, "$options": "i"}},
            {"part_number": {"$regex": query, "$options": "i"}},
            {"size": {"$regex": query, "$options": "i"}},
            {"brand": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            # Normalized size search for formats like 400x86x52, 300x52.5x74
            {"size": {"$regex": query_normalized, "$options": "i"}},
            # Machine model search in specifications
            {"specifications.machine_model": {"$regex": query, "$options": "i"}},
            # Compatible models search
            {"specifications.fits_models": {"$regex": query, "$options": "i"}},
            # Alternate part numbers
            {"specifications.alternate_parts": {"$regex": query, "$options": "i"}}
        ]
    }
    
    products = await products_collection.find(search_query).limit(limit).to_list(limit)
    return [serialize_doc(p) for p in products]


# Brands Endpoints
@router.get("/brands")
async def get_brands():
    """Get all brands"""
    brands = await brands_collection.find().sort("name", 1).to_list(100)
    return [serialize_doc(b) for b in brands]


@router.get("/brands/{slug}")
async def get_brand_by_slug(slug: str):
    """Get brand by slug with SEO data"""
    brand = await brands_collection.find_one({"slug": slug})
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    return serialize_doc(brand)


# Categories Endpoints
@router.get("/categories")
async def get_categories():
    """Get all categories"""
    categories = await categories_collection.find().sort("name", 1).to_list(100)
    return [serialize_doc(c) for c in categories]


@router.get("/categories/{slug}")
async def get_category_by_slug(slug: str):
    """Get category by slug with SEO data"""
    category = await categories_collection.find_one({"slug": slug})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return serialize_doc(category)


# Contact Endpoint
@router.post("/contact")
async def submit_contact(message: ContactMessage):
    """Submit contact form"""
    message_dict = message.dict(by_alias=True, exclude={"id"})
    result = await contact_messages_collection.insert_one(message_dict)
    
    return {
        "success": True,
        "message": "Thank you for contacting us. We'll get back to you within 24 hours.",
        "id": str(result.inserted_id)
    }


# Machine Model Endpoints
@router.get("/models/{brand}/{model}")
async def get_model_products(brand: str, model: str):
    """Get all products available for a specific machine model with full SEO data"""
    # Normalize brand and model for search
    brand_normalized = brand.replace("-", " ").title()
    model_normalized = model.upper()
    
    # Find products that match this brand and model
    query = {
        "brand": {"$regex": f"^{brand_normalized}$", "$options": "i"},
        "$or": [
            {"machine_models": {"$regex": f"^{model_normalized}$", "$options": "i"}},
            {"title": {"$regex": model_normalized, "$options": "i"}},
            {"part_number": {"$regex": model_normalized, "$options": "i"}}
        ]
    }
    
    products = await products_collection.find(query).to_list(100)
    
    # Group products by category
    products_by_category = {
        "rubber_tracks": [],
        "sprockets": [],
        "idlers": [],
        "rollers": []
    }
    
    for product in products:
        product_data = serialize_doc(product)
        category_lower = product.get("category", "").lower()
        
        if "track" in category_lower:
            products_by_category["rubber_tracks"].append(product_data)
        elif "sprocket" in category_lower:
            products_by_category["sprockets"].append(product_data)
        elif "idler" in category_lower:
            products_by_category["idlers"].append(product_data)
        elif "roller" in category_lower:
            products_by_category["rollers"].append(product_data)
    
    # Get brand info
    brand_doc = await brands_collection.find_one({"name": {"$regex": f"^{brand_normalized}$", "$options": "i"}})
    
    return {
        "brand": brand_normalized,
        "model": model_normalized,
        "brand_info": serialize_doc(brand_doc) if brand_doc else None,
        "products": products_by_category,
        "total_products": len(products),
        "seo": {
            "title": f"{brand_normalized} {model_normalized} Parts - Rubber Tracks, Sprockets, Idlers & Rollers",
            "description": f"Shop {brand_normalized} {model_normalized} rubber tracks, sprockets, idlers, and rollers. Premium quality undercarriage parts in stock with fast shipping.",
            "canonical": f"/models/{brand.lower()}/{model.lower()}",
            "keywords": [
                f"{brand_normalized} {model_normalized}",
                f"{brand_normalized} {model_normalized} tracks",
                f"{brand_normalized} {model_normalized} parts",
                "rubber tracks",
                "sprockets",
                "idlers",
                "rollers"
            ]
        }
    }


@router.get("/models/{brand}")
async def get_brand_models(brand: str):
    """Get all models available for a specific brand"""
    brand_normalized = brand.replace("-", " ").title()
    
    # Get all products for this brand
    products = await products_collection.find({
        "brand": {"$regex": f"^{brand_normalized}$", "$options": "i"}
    }).to_list(1000)
    
    # Extract unique models
    models = set()
    for product in products:
        if product.get("machine_models"):
            models.update(product["machine_models"])
    
    return {
        "brand": brand_normalized,
        "models": sorted(list(models)),
        "total_models": len(models)
    }

