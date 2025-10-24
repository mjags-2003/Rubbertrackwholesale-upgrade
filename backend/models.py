from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any, Annotated
from datetime import datetime
from bson import ObjectId

# Simplified ObjectId handling for Pydantic v2
PyObjectId = Annotated[str, Field(description="MongoDB ObjectId as string")]


# Brand Model
class Brand(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    logo: Optional[str] = None
    description: Optional[str] = None
    slug: str
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[List[str]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Category Model
class Category(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    slug: str
    description: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[List[str]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Product Model
class Product(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    sku: str
    title: str
    description: str
    price: float
    brand: str
    category: str
    size: Optional[str] = None
    part_number: str
    images: List[str] = []
    in_stock: bool = True
    stock_quantity: int = 0
    specifications: Dict[str, Any] = {}
    machine_models: Optional[List[str]] = []  # e.g., ["T750", "T770", "T870"]
    
    # SEO Fields
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[List[str]] = []
    meta_tags: Optional[Dict[str, str]] = {}
    schema_markup: Optional[Dict[str, Any]] = {}
    alt_tags: Optional[List[str]] = []
    canonical_url: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Customer Model
class Customer(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[Dict[str, str]] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}



# Page Model (CMS for managing site content)
class Page(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    slug: str  # URL slug like 'home', 'about', 'contact'
    title: str
    content: str  # Rich text HTML content
    page_type: str  # 'home', 'about', 'contact', 'custom'
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = []
    sections: Optional[List[Dict[str, Any]]] = []  # For structured page sections
    is_published: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Order Model
class OrderItem(BaseModel):
    product_id: str
    product_title: str
    sku: str
    quantity: int
    price: float
    total: float


class Order(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    order_number: str
    customer_id: str
    customer_name: str
    customer_email: EmailStr
    items: List[OrderItem]
    subtotal: float
    shipping_cost: float = 0.0
    tax: float = 0.0
    total: float
    status: str = "pending"  # pending, processing, shipped, delivered, cancelled
    shipping_address: Dict[str, str]
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Admin User Model
class AdminUser(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    username: str
    email: EmailStr
    hashed_password: str
    full_name: str
    is_active: bool = True
    is_superuser: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Contact Message Model
class ContactMessage(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    email: EmailStr
    phone: Optional[str] = None
    machine_model: Optional[str] = None
    message: str
    status: str = "new"  # new, read, replied
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
