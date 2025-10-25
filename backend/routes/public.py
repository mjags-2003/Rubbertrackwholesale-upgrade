from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import Product, Brand, Category, ContactMessage, Review, FAQ, Blog, BlogCategory, Section, MachineModel
from database import products_collection, brands_collection, categories_collection, contact_messages_collection, sections_collection, machine_models_collection
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


# Pages Endpoints (CMS)
@router.get("/pages/slug/{slug}")
async def get_page_by_slug(slug: str):
    """Get page content by slug (public endpoint)"""
    from database import pages_collection
    page = await pages_collection.find_one({"slug": slug, "is_published": True})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")


# Reviews Endpoints (Public)
@router.get("/products/{product_id}/reviews")
async def get_product_reviews(product_id: str):
    """Get approved reviews for a product"""
    from database import reviews_collection
    reviews = await reviews_collection.find({
        "product_id": product_id,
        "is_approved": True
    }).sort("created_at", -1).to_list(100)
    
    return [serialize_doc(r) for r in reviews]


@router.post("/products/{product_id}/reviews")
async def submit_review(product_id: str, review: Review):
    """Submit a product review (public)"""
    from database import reviews_collection
    review_dict = review.dict(by_alias=True, exclude={"id"})
    review_dict["product_id"] = product_id
    review_dict["is_approved"] = False  # Needs admin approval
    
    result = await reviews_collection.insert_one(review_dict)
    
    return {
        "success": True,
        "message": "Review submitted successfully. It will appear after admin approval.",
        "id": str(result.inserted_id)
    }


# FAQs Endpoints (Public)
@router.get("/faqs")
async def get_published_faqs(category: Optional[str] = None):
    """Get published FAQs"""
    from database import faqs_collection
    query = {"is_published": True}
    if category:
        query["category"] = category
    
    faqs = await faqs_collection.find(query).sort("order", 1).to_list(100)
    return [serialize_doc(f) for f in faqs]


# Blog Endpoints (Public)
@router.get("/blogs")
async def get_published_blogs(category_id: Optional[str] = None, limit: int = 10, skip: int = 0):
    """Get published blogs"""
    from database import blogs_collection
    query = {"is_published": True}
    if category_id:
        query["category_id"] = category_id
    
    blogs = await blogs_collection.find(query).sort("published_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await blogs_collection.count_documents(query)
    
    return {
        "blogs": [serialize_doc(b) for b in blogs],
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }


@router.get("/blogs/slug/{slug}")
async def get_blog_by_slug(slug: str):
    """Get blog by slug"""
    from database import blogs_collection
    blog = await blogs_collection.find_one({"slug": slug, "is_published": True})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    return serialize_doc(blog)


@router.get("/blog-categories")
async def get_blog_categories():
    """Get all blog categories"""
    from database import blog_categories_collection
    categories = await blog_categories_collection.find().sort("name", 1).to_list(100)
    return [serialize_doc(c) for c in categories]


# XML Sitemap (Dynamic)
@router.get("/sitemap.xml")
async def generate_sitemap():
    """Generate dynamic XML sitemap"""
    from database import products_collection, blogs_collection, pages_collection, brands_collection
    from fastapi.responses import Response
    
    # Base URL - get from environment or use default
    base_url = "https://rubbertracks.preview.emergentagent.com"
    
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    # Homepage
    xml_content += f'''  <url>
    <loc>{base_url}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>\n'''
    
    # Static pages
    static_pages = [
        ("/about", "monthly", "0.8"),
        ("/contact", "monthly", "0.8"),
        ("/products", "daily", "0.9"),
        ("/brands", "weekly", "0.7"),
    ]
    
    for url, freq, priority in static_pages:
        xml_content += f'''  <url>
    <loc>{base_url}{url}</loc>
    <changefreq>{freq}</changefreq>
    <priority>{priority}</priority>
  </url>\n'''
    
    # Products
    products = await products_collection.find({"in_stock": True}).to_list(1000)
    for product in products:
        product_id = str(product["_id"])
        xml_content += f'''  <url>
    <loc>{base_url}/product/{product_id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n'''
    
    # Brands
    brands = await brands_collection.find().to_list(100)
    for brand in brands:
        brand_name = brand["name"].lower().replace(" ", "-")
        xml_content += f'''  <url>
    <loc>{base_url}/brands/{brand_name}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n'''
    
    # Blogs
    blogs = await blogs_collection.find({"is_published": True}).to_list(200)
    for blog in blogs:
        xml_content += f'''  <url>
    <loc>{base_url}/blog/{blog["slug"]}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n'''
    
    # CMS Pages
    cms_pages = await pages_collection.find({"is_published": True}).to_list(100)
    for page in cms_pages:
        if page["slug"] not in ["home"]:  # Skip home as it's already added
            xml_content += f'''  <url>
    <loc>{base_url}/{page["slug"]}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n'''
    
    xml_content += '</urlset>'
    
    return Response(content=xml_content, media_type="application/xml")


# Robots.txt
@router.get("/robots.txt")
async def get_robots():
    """Generate robots.txt"""
    from fastapi.responses import Response
    
    base_url = "https://rubbertracks.preview.emergentagent.com"
    
    robots_content = f"""User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/admin/

# Disallow search parameters to prevent duplicate content
Disallow: /*?*sort=
Disallow: /*?*filter=

# Sitemap
Sitemap: {base_url}/api/sitemap.xml
"""
    
    return Response(content=robots_content, media_type="text/plain")

    
    return serialize_doc(page)




# ============= SECTION ROUTES =============

@router.get("/sections")
async def get_public_sections(page: Optional[str] = "home"):
    """Get published sections for a page"""
    sections = await sections_collection.find({
        "page": page,
        "is_published": True
    }).sort("order", 1).to_list(length=None)
    
    def serialize_doc(doc):
        if doc and "_id" in doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
        return doc
    
    return [serialize_doc(section) for section in sections]



# ============= MACHINE MODEL ROUTES (PUBLIC) =============

@router.get("/machine-models")
async def get_all_machine_models(
    brand: Optional[str] = None,
    equipment_type: Optional[str] = None
):
    """Get all machine models (public endpoint) - optionally filtered by brand or equipment_type"""
    query = {}
    if brand:
        query["brand"] = brand
    if equipment_type:
        query["equipment_type"] = equipment_type
    
    models = await machine_models_collection.find(query).sort("brand", 1).sort("model_name", 1).to_list(length=None)
    return [serialize_doc(model) for model in models]


@router.get("/machine-models/brands")
async def get_machine_model_brands():
    """Get all unique brands that have machine models"""
    brands = await machine_models_collection.distinct("brand")
    return sorted(brands)


@router.get("/machine-models/equipment-types")
async def get_equipment_types():
    """Get all unique equipment types"""
    types = await machine_models_collection.distinct("equipment_type")
    return sorted(types)

