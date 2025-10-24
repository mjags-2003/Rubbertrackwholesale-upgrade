from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBasicCredentials, HTTPBasic
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
import io
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


# Bulk Import Products
@router.post("/products/import")
async def import_products(file: UploadFile = File(...), current_user = Depends(get_current_user)):
    """Bulk import products from CSV or Excel file"""
    
    # Validate file type
    if not (file.filename.endswith('.csv') or file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
        raise HTTPException(status_code=400, detail="File must be CSV or Excel format")
    
    try:
        # Read file content
        contents = await file.read()
        
        # Parse based on file type
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        # Column mapping from spreadsheet format to our database format
        column_mapping = {
            'comp_name': 'brand',
            'machine_model': 'title',  # We'll combine with other fields
            'track_size': 'size',
            'Price': 'price',
            'eng_description': 'description',
            'title_h1': 'seo_title',
            'sub_title_h2': 'title',  # Use as main title
            'page_title': 'seo_title',
            'eng_metakeyword': 'seo_keywords',
            'eng_meta_desc': 'seo_description',
            'shown_main_listin': 'in_stock'
        }
        
        # Rename columns to match our format
        df = df.rename(columns=column_mapping)
        
        success_count = 0
        error_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Generate SKU if not provided
                sku = f"RT-{row.get('size', 'UNKNOWN').replace('x', '-')}-{index}"
                
                # Parse price (remove currency symbols if present)
                price_str = str(row.get('price', '0')).replace('$', '').replace(',', '').strip()
                try:
                    price = float(price_str)
                except:
                    price = 0.0
                
                # Parse in_stock field
                in_stock_val = str(row.get('in_stock', 'Yes')).strip().lower()
                in_stock = in_stock_val in ['yes', 'true', '1', 'y']
                
                # Parse keywords (comma-separated or convert to list)
                keywords_str = str(row.get('seo_keywords', '')).strip()
                seo_keywords = [k.strip() for k in keywords_str.split(',') if k.strip()] if keywords_str else []
                
                # Create product title
                brand = str(row.get('brand', 'Universal')).strip()
                machine_model = str(row.get('machine_model', '')).strip() if pd.notna(row.get('machine_model')) else ''
                size = str(row.get('size', '')).strip()
                
                if machine_model:
                    title = f"{brand} {machine_model} Rubber Track {size}"
                else:
                    title = str(row.get('title', f"{brand} Rubber Track {size}")).strip()
                
                # Check if brand exists, if not use "Universal"
                existing_brand = await brands_collection.find_one({"name": brand})
                if not existing_brand:
                    brand = "Universal"
                
                # Create product object
                product_data = {
                    "sku": sku,
                    "title": title,
                    "description": str(row.get('description', f'Premium rubber track for {brand}')).strip(),
                    "price": price,
                    "brand": brand,
                    "category": "Rubber Tracks",  # Default category
                    "size": size,
                    "part_number": str(row.get('part_number', sku)).strip() if 'part_number' in row else sku,
                    "images": [],  # Can be added later
                    "in_stock": in_stock,
                    "stock_quantity": 10 if in_stock else 0,
                    "specifications": {
                        "machine_model": machine_model,
                        "warranty": "1 Year"
                    },
                    "seo_title": str(row.get('seo_title', title + ' | Rubber Track Wholesale')).strip(),
                    "seo_description": str(row.get('seo_description', f'Buy {title} at wholesale prices. Free shipping available.')).strip(),
                    "seo_keywords": seo_keywords,
                    "alt_tags": [f"{title} - rubber track"],
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                # Generate schema markup
                product_data["schema_markup"] = {
                    "@context": "https://schema.org/",
                    "@type": "Product",
                    "name": title,
                    "description": product_data["description"],
                    "sku": sku,
                    "brand": {
                        "@type": "Brand",
                        "name": brand
                    },
                    "offers": {
                        "@type": "Offer",
                        "url": f"https://rubbertrackwholesale.com/product/{sku}",
                        "priceCurrency": "USD",
                        "price": str(price),
                        "availability": "https://schema.org/InStock" if in_stock else "https://schema.org/OutOfStock"
                    }
                }
                
                # Check if product with same SKU exists
                existing = await products_collection.find_one({"sku": sku})
                if existing:
                    # Update existing product
                    await products_collection.update_one(
                        {"sku": sku},
                        {"$set": product_data}
                    )
                else:
                    # Insert new product
                    await products_collection.insert_one(product_data)
                
                success_count += 1
                
            except Exception as e:
                error_count += 1
                errors.append(f"Row {index + 2}: {str(e)}")
        
        return {
            "success": True,
            "message": f"Import completed. {success_count} products imported/updated, {error_count} errors",
            "success_count": success_count,
            "error_count": error_count,
            "errors": errors[:10]  # Return first 10 errors only
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process file: {str(e)}")


# Download Import Template
@router.get("/products/import-template")
async def download_import_template(current_user = Depends(get_current_user)):
    """Download a CSV template for bulk import"""
    
    template_data = {
        'comp_name': ['Bobcat', 'Kubota', 'Caterpillar'],
        'machine_model': ['T190', 'SVL95', '247B MTL'],
        'track_size': ['450x86x56', '400x72x74', '320x86x52'],
        'Price': [1299.99, 1580.00, 1340.00],
        'eng_description': [
            'Premium rubber track for Bobcat T190 compact track loader',
            'High-performance rubber track designed for Kubota SVL95',
            'OEM quality rubber track for Caterpillar 247B Multi Terrain Loader'
        ],
        'title_h1': ['Bobcat T190 Rubber Track', 'Kubota SVL95 Rubber Track', 'Cat 247B MTL Rubber Track'],
        'sub_title_h2': ['Premium Quality', 'OEM Specifications', 'Superior Performance'],
        'page_title': ['Bobcat T190 Rubber Track | Wholesale', 'Kubota SVL95 Track | Best Price', 'Cat 247B Track | Free Shipping'],
        'eng_metakeyword': ['bobcat tracks, t190, rubber tracks', 'kubota tracks, svl95', 'caterpillar tracks, 247b'],
        'eng_meta_desc': ['Buy Bobcat T190 rubber tracks. Free shipping available.', 'Premium Kubota SVL95 tracks at wholesale prices.', 'Caterpillar 247B tracks in stock. Order now.'],
        'shown_main_listin': ['Yes', 'Yes', 'Yes']
    }
    
    df = pd.DataFrame(template_data)
    
    # Convert to CSV
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    
    return {
        "filename": "product_import_template.csv",
        "content": csv_buffer.getvalue()
    }

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
