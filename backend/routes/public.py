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
        # Search in title, sku, part_number, size
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"sku": {"$regex": search, "$options": "i"}},
            {"part_number": {"$regex": search, "$options": "i"}},
            {"size": {"$regex": search, "$options": "i"}}
        ]
    
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
    """Advanced search by size, part number, or any field"""
    search_query = {
        "$or": [
            {"title": {"$regex": query, "$options": "i"}},
            {"sku": {"$regex": query, "$options": "i"}},
            {"part_number": {"$regex": query, "$options": "i"}},
            {"size": {"$regex": query, "$options": "i"}},
            {"brand": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}}
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
