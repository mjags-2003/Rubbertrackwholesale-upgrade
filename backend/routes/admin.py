from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBasicCredentials, HTTPBasic
from typing import List, Optional
from datetime import datetime, timedelta
from models import (
    Product, Brand, Category, Order, Customer, 
    AdminUser, ContactMessage
)
from database import (
    products_collection, brands_collection, categories_collection,
    orders_collection, customers_collection, admin_users_collection,
    contact_messages_collection
)
from auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, Token
)
from bson import ObjectId
from pydantic import BaseModel
import re

router = APIRouter()
security = HTTPBasic()


def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


def create_slug(text: str) -> str:
    """Create URL-friendly slug from text"""
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')


# Login Models
class LoginRequest(BaseModel):
    username: str
    password: str


# Admin Authentication
@router.post("/login", response_model=Token)
async def admin_login(credentials: LoginRequest):
    """Admin login endpoint"""
    user = await admin_users_collection.find_one({"username": credentials.username})
    
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    
    access_token_expires = timedelta(minutes=1440)  # 24 hours
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


# Products Management
@router.get("/products")
async def get_all_products(current_user = Depends(get_current_user)):
    """Get all products for admin"""
    products = await products_collection.find().sort("created_at", -1).to_list(1000)
    return [serialize_doc(p) for p in products]


@router.post("/products")
async def create_product(product: Product, current_user = Depends(get_current_user)):
    """Create new product"""
    # Check if SKU already exists
    existing = await products_collection.find_one({"sku": product.sku})
    if existing:
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")
    
    # Generate SEO fields if not provided
    if not product.seo_title:
        product.seo_title = f"{product.title} | Rubber Track Wholesale"
    
    if not product.seo_description:
        product.seo_description = product.description[:155]
    
    # Generate schema markup
    product.schema_markup = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.title,
        "image": product.images,
        "description": product.description,
        "sku": product.sku,
        "brand": {
            "@type": "Brand",
            "name": product.brand
        },
        "offers": {
            "@type": "Offer",
            "url": f"https://rubbertrackwholesale.com/product/{product.sku}",
            "priceCurrency": "USD",
            "price": str(product.price),
            "availability": "https://schema.org/InStock" if product.in_stock else "https://schema.org/OutOfStock"
        }
    }
    
    product_dict = product.dict(by_alias=True, exclude={"id"})
    result = await products_collection.insert_one(product_dict)
    
    return {"success": True, "id": str(result.inserted_id), "message": "Product created successfully"}


@router.put("/products/{product_id}")
async def update_product(product_id: str, product: Product, current_user = Depends(get_current_user)):
    """Update product"""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    product.updated_at = datetime.utcnow()
    
    # Update schema markup
    product.schema_markup = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.title,
        "image": product.images,
        "description": product.description,
        "sku": product.sku,
        "brand": {
            "@type": "Brand",
            "name": product.brand
        },
        "offers": {
            "@type": "Offer",
            "url": f"https://rubbertrackwholesale.com/product/{product_id}",
            "priceCurrency": "USD",
            "price": str(product.price),
            "availability": "https://schema.org/InStock" if product.in_stock else "https://schema.org/OutOfStock"
        }
    }
    
    product_dict = product.dict(by_alias=True, exclude={"id"})
    result = await products_collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": product_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"success": True, "message": "Product updated successfully"}


@router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user = Depends(get_current_user)):
    """Delete product"""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    result = await products_collection.delete_one({"_id": ObjectId(product_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"success": True, "message": "Product deleted successfully"}


# Brands Management
@router.get("/brands")
async def get_all_brands(current_user = Depends(get_current_user)):
    """Get all brands"""
    brands = await brands_collection.find().sort("name", 1).to_list(1000)
    return [serialize_doc(b) for b in brands]


@router.post("/brands")
async def create_brand(brand: Brand, current_user = Depends(get_current_user)):
    """Create new brand"""
    brand.slug = create_slug(brand.name)
    
    # Check if slug already exists
    existing = await brands_collection.find_one({"slug": brand.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Brand with this name already exists")
    
    if not brand.seo_title:
        brand.seo_title = f"{brand.name} Rubber Tracks & Parts | Rubber Track Wholesale"
    
    brand_dict = brand.dict(by_alias=True, exclude={"id"})
    result = await brands_collection.insert_one(brand_dict)
    
    return {"success": True, "id": str(result.inserted_id), "message": "Brand created successfully"}


@router.put("/brands/{brand_id}")
async def update_brand(brand_id: str, brand: Brand, current_user = Depends(get_current_user)):
    """Update brand"""
    if not ObjectId.is_valid(brand_id):
        raise HTTPException(status_code=400, detail="Invalid brand ID")
    
    brand.updated_at = datetime.utcnow()
    brand.slug = create_slug(brand.name)
    
    brand_dict = brand.dict(by_alias=True, exclude={"id"})
    result = await brands_collection.update_one(
        {"_id": ObjectId(brand_id)},
        {"$set": brand_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    return {"success": True, "message": "Brand updated successfully"}


@router.delete("/brands/{brand_id}")
async def delete_brand(brand_id: str, current_user = Depends(get_current_user)):
    """Delete brand"""
    if not ObjectId.is_valid(brand_id):
        raise HTTPException(status_code=400, detail="Invalid brand ID")
    
    result = await brands_collection.delete_one({"_id": ObjectId(brand_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    return {"success": True, "message": "Brand deleted successfully"}


# Categories Management
@router.get("/categories")
async def get_all_categories(current_user = Depends(get_current_user)):
    """Get all categories"""
    categories = await categories_collection.find().sort("name", 1).to_list(1000)
    return [serialize_doc(c) for c in categories]


@router.post("/categories")
async def create_category(category: Category, current_user = Depends(get_current_user)):
    """Create new category"""
    category.slug = create_slug(category.name)
    
    # Check if slug already exists
    existing = await categories_collection.find_one({"slug": category.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    
    if not category.seo_title:
        category.seo_title = f"{category.name} | Rubber Track Wholesale"
    
    category_dict = category.dict(by_alias=True, exclude={"id"})
    result = await categories_collection.insert_one(category_dict)
    
    return {"success": True, "id": str(result.inserted_id), "message": "Category created successfully"}


@router.put("/categories/{category_id}")
async def update_category(category_id: str, category: Category, current_user = Depends(get_current_user)):
    """Update category"""
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    
    category.updated_at = datetime.utcnow()
    category.slug = create_slug(category.name)
    
    category_dict = category.dict(by_alias=True, exclude={"id"})
    result = await categories_collection.update_one(
        {"_id": ObjectId(category_id)},
        {"$set": category_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"success": True, "message": "Category updated successfully"}


@router.delete("/categories/{category_id}")
async def delete_category(category_id: str, current_user = Depends(get_current_user)):
    """Delete category"""
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    
    result = await categories_collection.delete_one({"_id": ObjectId(category_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"success": True, "message": "Category deleted successfully"}


# Orders Management
@router.get("/orders")
async def get_all_orders(current_user = Depends(get_current_user)):
    """Get all orders"""
    orders = await orders_collection.find().sort("created_at", -1).to_list(1000)
    return [serialize_doc(o) for o in orders]


class OrderStatusUpdate(BaseModel):
    status: str


@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status_update: OrderStatusUpdate, current_user = Depends(get_current_user)):
    """Update order status"""
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    
    valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    result = await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": status_update.status, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"success": True, "message": "Order status updated successfully"}


# Customers Management
@router.get("/customers")
async def get_all_customers(current_user = Depends(get_current_user)):
    """Get all customers"""
    customers = await customers_collection.find().sort("created_at", -1).to_list(1000)
    return [serialize_doc(c) for c in customers]


@router.get("/customers/{customer_id}")
async def get_customer(customer_id: str, current_user = Depends(get_current_user)):
    """Get customer details"""
    if not ObjectId.is_valid(customer_id):
        raise HTTPException(status_code=400, detail="Invalid customer ID")
    
    customer = await customers_collection.find_one({"_id": ObjectId(customer_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get customer orders
    orders = await orders_collection.find({"customer_id": customer_id}).to_list(100)
    
    result = serialize_doc(customer)
    result["orders"] = [serialize_doc(o) for o in orders]
    
    return result


# Messages Management
@router.get("/messages")
async def get_all_messages(current_user = Depends(get_current_user)):
    """Get all contact messages"""
    messages = await contact_messages_collection.find().sort("created_at", -1).to_list(1000)
    return [serialize_doc(m) for m in messages]


class MessageStatusUpdate(BaseModel):
    status: str


@router.put("/messages/{message_id}/status")
async def update_message_status(message_id: str, status_update: MessageStatusUpdate, current_user = Depends(get_current_user)):
    """Update message status"""
    if not ObjectId.is_valid(message_id):
        raise HTTPException(status_code=400, detail="Invalid message ID")
    
    valid_statuses = ["new", "read", "replied"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    result = await contact_messages_collection.update_one(
        {"_id": ObjectId(message_id)},
        {"$set": {"status": status_update.status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {"success": True, "message": "Message status updated successfully"}


# Dashboard Stats
@router.get("/stats")
async def get_dashboard_stats(current_user = Depends(get_current_user)):
    """Get dashboard statistics"""
    total_products = await products_collection.count_documents({})
    total_orders = await orders_collection.count_documents({})
    total_customers = await customers_collection.count_documents({})
    unread_messages = await contact_messages_collection.count_documents({"status": "new"})
    
    # Recent orders
    recent_orders = await orders_collection.find().sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_customers": total_customers,
        "unread_messages": unread_messages,
        "recent_orders": [serialize_doc(o) for o in recent_orders]
    }
