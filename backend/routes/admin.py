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
        
        # Detect format type based on columns
        columns = set(df.columns.str.lower().str.strip())
        
        # Rubber Tracks format
        if 'comp_name' in columns or 'track_size' in columns:
            column_mapping = {
                'comp_name': 'brand',
                'machine_model': 'title_suffix',
                'track_size': 'size',
                'Price': 'price',
                'eng_description': 'description',
                'title_h1': 'seo_title',
                'sub_title_h2': 'title',
                'page_title': 'seo_title',
                'eng_metakeyword': 'seo_keywords',
                'eng_meta_desc': 'seo_description',
                'shown_main_listin': 'in_stock'
            }
            category = "Rubber Tracks"
        
        # Rollers, Sprockets, Idlers format (unified handling)
        elif 'part number' in columns or 'part_number' in columns:
            # Determine category based on file content or column names
            if 'roller' in columns or any('roller' in str(col).lower() for col in df.columns):
                if 'idler' in columns or any('idler' in str(col).lower() for col in df.columns):
                    category = "Idlers"
                else:
                    category = "Rollers"
            elif 'sprocket' in columns or any('sprocket' in str(col).lower() for col in df.columns):
                category = "Sprockets"
            else:
                category = "Undercarriage Parts"
            
            # Column mapping for undercarriage parts
            column_mapping = {
                'Machine Model': 'machine_model',
                'machine_model': 'machine_model',
                'Roller': 'item_type',
                'ITEM': 'item_type',
                'item': 'item_type',
                'Bottom / Front': 'position',
                'Front / Rear Idler': 'position',
                'Part Number': 'part_number',
                'part_number': 'part_number',
                'Alternate Part numbers': 'alternate_parts',
                'alternate_part_numbers': 'alternate_parts',
                'SKU': 'sku',
                'sku': 'sku',
                'Fits following machine models': 'fits_models',
                'fits_following_machine_models': 'fits_models',
                'Description': 'description',
                'description': 'description'
            }
        else:
            raise HTTPException(status_code=400, detail="Unrecognized file format. Please use the provided templates.")
        
        # Rename columns (case-insensitive matching)
        df_cols_lower = {col: col.lower().strip() for col in df.columns}
        reverse_mapping = {v.lower(): k for k, v in column_mapping.items() if k.lower() in df_cols_lower.values()}
        
        # Actual renaming
        rename_dict = {}
        for col in df.columns:
            col_lower = col.lower().strip()
            for template_col, target_col in column_mapping.items():
                if template_col.lower() == col_lower:
                    rename_dict[col] = target_col
                    break
        
        df = df.rename(columns=rename_dict)
        
        success_count = 0
        error_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Check if this is rubber tracks format or undercarriage parts format
                if category == "Rubber Tracks":
                    # Rubber tracks format processing
                    sku = f"RT-{row.get('size', 'UNKNOWN').replace('x', '-')}-{index}"
                    price_str = str(row.get('price', '0')).replace('$', '').replace(',', '').strip()
                    try:
                        price = float(price_str)
                    except:
                        price = 0.0
                    
                    in_stock_val = str(row.get('in_stock', 'Yes')).strip().lower()
                    in_stock = in_stock_val in ['yes', 'true', '1', 'y']
                    
                    keywords_str = str(row.get('seo_keywords', '')).strip()
                    seo_keywords = [k.strip() for k in keywords_str.split(',') if k.strip()] if keywords_str else []
                    
                    brand = str(row.get('brand', 'Universal')).strip()
                    machine_model = str(row.get('title_suffix', '')).strip() if pd.notna(row.get('title_suffix')) else ''
                    size = str(row.get('size', '')).strip()
                    
                    if machine_model:
                        title = f"{brand} {machine_model} Rubber Track {size}"
                    else:
                        title = str(row.get('title', f"{brand} Rubber Track {size}")).strip()
                    
                    part_number = sku
                    
                else:
                    # Undercarriage parts format processing
                    sku = str(row.get('sku', f"{category[:3].upper()}-{index}")).strip()
                    part_number = str(row.get('part_number', sku)).strip()
                    
                    # Extract machine model and brand
                    machine_model_full = str(row.get('machine_model', '')).strip()
                    if machine_model_full:
                        # Try to extract brand from machine model
                        parts = machine_model_full.split()
                        brand = parts[0] if parts else "Universal"
                        machine_model = ' '.join(parts[1:]) if len(parts) > 1 else machine_model_full
                    else:
                        brand = "Universal"
                        machine_model = ""
                    
                    # Get item type and position
                    item_type = str(row.get('item_type', category)).strip()
                    position = str(row.get('position', '')).strip()
                    
                    # Create title
                    if position:
                        title = f"{brand} {machine_model} {position} {item_type}".strip()
                    else:
                        title = f"{brand} {machine_model} {item_type}".strip()
                    
                    # Get price (default to reasonable price for undercarriage parts)
                    price = 189.99 if category == "Rollers" else (429.99 if category == "Sprockets" else 349.99)
                    
                    # Other fields
                    size = "N/A"
                    description = str(row.get('description', f'Premium {item_type} for {brand} {machine_model}')).strip()
                    
                    # SEO fields
                    seo_keywords = [f"{brand.lower()} {item_type.lower()}", part_number.lower(), category.lower()]
                    in_stock = True
                
                # Check if brand exists, if not use "Universal"
                existing_brand = await brands_collection.find_one({"name": brand})
                if not existing_brand:
                    brand = "Universal"
                
                # Create product object (common for both formats)
                product_data = {
                    "sku": sku,
                    "title": title,
                    "description": description if 'description' in locals() else str(row.get('description', f'Premium {category} for {brand}')).strip(),
                    "price": price,
                    "brand": brand,
                    "category": category,
                    "size": size if 'size' in locals() else "N/A",
                    "part_number": part_number,
                    "images": [],
                    "in_stock": in_stock,
                    "stock_quantity": 10 if in_stock else 0,
                    "specifications": {
                        "machine_model": machine_model if 'machine_model' in locals() else "",
                        "warranty": "1 Year" if category == "Rubber Tracks" else "6 Months"
                    },
                    "seo_title": str(row.get('seo_title', title + ' | Rubber Track Wholesale')).strip() if 'seo_title' in row else title + ' | Rubber Track Wholesale',
                    "seo_description": str(row.get('seo_description', f'Buy {title} at wholesale prices. Free shipping available.')).strip() if 'seo_description' in row else f'Buy {title} at wholesale prices. Free shipping available.',
                    "seo_keywords": seo_keywords,
                    "alt_tags": [f"{title}"],
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                # Add alternate part numbers if present
                if 'alternate_parts' in row and pd.notna(row.get('alternate_parts')):
                    product_data["specifications"]["alternate_parts"] = str(row['alternate_parts']).strip()
                
                # Add fits models if present
                if 'fits_models' in row and pd.notna(row.get('fits_models')):
                    product_data["specifications"]["fits_models"] = str(row['fits_models']).strip()
                
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
@router.get("/products/import-template/{template_type}")
async def download_import_template(template_type: str, current_user = Depends(get_current_user)):
    """Download a CSV template for bulk import - supports different product types"""
    
    if template_type == "rubber-tracks":
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
        filename = "rubber_tracks_import_template.csv"
    
    elif template_type == "bottom-rollers":
        template_data = {
            'Machine Model': ['Bobcat T190', 'Kubota SVL95', 'Caterpillar 247B'],
            'Roller': ['Bottom Roller', 'Bottom Roller', 'Bottom Roller'],
            'Bottom / Front': ['Bottom', 'Bottom', 'Bottom'],
            'Part Number': ['6813501', 'V0515-25112', '248-6275'],
            'Alternate Part numbers': ['6813501-ALT', 'V0515-ALT', '248-6275-ALT'],
            'SKU': ['BR-BOB-T190', 'BR-KUB-SVL95', 'BR-CAT-247B'],
            'Fits following machine models': ['Bobcat T190, T200, T550', 'Kubota SVL95, SVL97', 'Cat 247B, 257B, 267B'],
            'Description': [
                'Heavy-duty bottom roller for Bobcat T190. Single flange design with sealed bearings.',
                'Premium bottom roller for Kubota SVL95. Double flange, maintenance-free sealed bearings.',
                'OEM quality bottom roller for Caterpillar 247B MTL. Heavy-duty construction.'
            ]
        }
        filename = "bottom_rollers_import_template.csv"
    
    elif template_type == "sprockets":
        template_data = {
            'Machine Model': ['Bobcat T190', 'Kubota SVL95', 'Caterpillar 247B'],
            'ITEM': ['Drive Sprocket', 'Drive Sprocket', 'Drive Sprocket'],
            'Part Number': ['6813502', 'V0515-25113', '248-6276'],
            'Alternate Part numbers': ['6813502-ALT', 'V0515-ALT', '248-6276-ALT'],
            'SKU': ['SPR-BOB-T190', 'SPR-KUB-SVL95', 'SPR-CAT-247B'],
            'Fits following machine models': ['Bobcat T190, T200, T550', 'Kubota SVL95, SVL97', 'Cat 247B, 257B, 267B'],
            'Description': [
                'Precision-machined drive sprocket for Bobcat T190. 15 teeth, hardened steel.',
                'Heavy-duty drive sprocket for Kubota SVL95. Heat-treated for durability.',
                'OEM specification drive sprocket for Caterpillar 247B MTL. 17 teeth.'
            ]
        }
        filename = "sprockets_import_template.csv"
    
    elif template_type == "idlers":
        template_data = {
            'Machine Model': ['Bobcat T190', 'Kubota SVL95', 'Caterpillar 247B'],
            'Roller': ['Front Idler', 'Front Idler', 'Front Idler'],
            'Front / Rear Idler': ['Front', 'Front', 'Front'],
            'Part Number': ['6813503', 'V0515-25114', '248-6277'],
            'Alternate Part numbers': ['6813503-ALT', 'V0515-ALT', '248-6277-ALT'],
            'SKU': ['IDL-BOB-T190', 'IDL-KUB-SVL95', 'IDL-CAT-247B'],
            'Fits following machine models': ['Bobcat T190, T200, T550', 'Kubota SVL95, SVL97', 'Cat 247B, 257B, 267B'],
            'Description': [
                'Front idler wheel for Bobcat T190. Heavy-duty bearings and sealed construction.',
                'Premium front idler for Kubota SVL95. Greaseable design with double sealed bearings.',
                'OEM quality front idler for Caterpillar 247B MTL. Maintenance-free sealed.'
            ]
        }
        filename = "idlers_import_template.csv"
    
    else:
        raise HTTPException(status_code=400, detail="Invalid template type. Options: rubber-tracks, bottom-rollers, sprockets, idlers")
    
    df = pd.DataFrame(template_data)
    
    # Convert to CSV
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    
    return {
        "filename": filename,
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


# Pages Management (CMS)
@router.get("/pages")
async def get_all_pages(current_user = Depends(get_current_user)):
    """Get all pages"""
    from database import pages_collection
    pages = await pages_collection.find().sort("created_at", -1).to_list(100)
    return [serialize_doc(p) for p in pages]


@router.get("/pages/{page_id}")
async def get_page(page_id: str, current_user = Depends(get_current_user)):
    """Get page by ID"""
    from database import pages_collection
    if not ObjectId.is_valid(page_id):
        raise HTTPException(status_code=400, detail="Invalid page ID")
    
    page = await pages_collection.find_one({"_id": ObjectId(page_id)})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    return serialize_doc(page)


@router.post("/pages")
async def create_page(page: Page, current_user = Depends(get_current_user)):
    """Create new page"""
    from database import pages_collection
    page_dict = page.dict(by_alias=True, exclude={"id"})
    
    # Check if slug already exists
    existing = await pages_collection.find_one({"slug": page_dict["slug"]})
    if existing:
        raise HTTPException(status_code=400, detail="Page with this slug already exists")
    
    result = await pages_collection.insert_one(page_dict)
    created_page = await pages_collection.find_one({"_id": result.inserted_id})
    
    return serialize_doc(created_page)


@router.put("/pages/{page_id}")
async def update_page(page_id: str, page: Page, current_user = Depends(get_current_user)):
    """Update page"""
    from database import pages_collection
    if not ObjectId.is_valid(page_id):
        raise HTTPException(status_code=400, detail="Invalid page ID")
    
    page_dict = page.dict(by_alias=True, exclude={"id"})
    page_dict["updated_at"] = datetime.utcnow()
    
    result = await pages_collection.update_one(
        {"_id": ObjectId(page_id)},
        {"$set": page_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    
    updated_page = await pages_collection.find_one({"_id": ObjectId(page_id)})
    return serialize_doc(updated_page)


@router.delete("/pages/{page_id}")
async def delete_page(page_id: str, current_user = Depends(get_current_user)):
    """Delete page"""
    from database import pages_collection
    if not ObjectId.is_valid(page_id):
        raise HTTPException(status_code=400, detail="Invalid page ID")
    
    result = await pages_collection.delete_one({"_id": ObjectId(page_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    
    return {"success": True, "message": "Page deleted successfully"}

