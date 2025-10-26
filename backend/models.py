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



# Machine Model (for brand-specific models like Bobcat T190, John Deere 317G, etc.)
class MachineModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    brand: str  # Brand name (e.g., "Bobcat", "John Deere")
    model_name: str  # Model name (e.g., "T190", "317G")
    full_name: Optional[str] = None  # Full name (e.g., "Bobcat T190")
    equipment_type: Optional[str] = "Track Loader"  # "Track Loader" or "Mini Excavator"
    description: Optional[str] = None
    product_image: Optional[str] = None  # URL to model image
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Track Size Model (for rubber track dimensions)
class TrackSize(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    size: str  # Track size (e.g., "300x55x82", "180x60x37")
    width: Optional[float] = None  # Width in mm
    pitch: Optional[float] = None  # Pitch in mm
    links: Optional[int] = None  # Number of links
    price: Optional[float] = None  # Selling price in USD
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Compatibility Model (machine to track size mapping)
class Compatibility(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    make: str  # Brand/Make (e.g., "Bobcat", "Kubota")
    model: str  # Machine model (e.g., "T190", "SVL75")
    track_sizes: List[str] = []  # List of compatible track sizes (e.g., ["300x55x82", "300x52.5x84"])
    is_active: bool = True
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



# Redirect Model (301 Management)
class Redirect(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    from_url: str  # Old URL
    to_url: str    # New URL
    redirect_type: int = 301  # 301 permanent, 302 temporary
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Review Model
class Review(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    product_id: str
    customer_name: str
    customer_email: Optional[EmailStr] = None
    rating: int = Field(ge=1, le=5)  # 1-5 stars
    title: str
    comment: str
    is_verified: bool = False
    is_approved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# FAQ Model
class FAQ(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    question: str
    answer: str
    category: Optional[str] = "General"
    product_id: Optional[str] = None  # Link to specific product
    order: int = 0  # Display order
    is_published: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Blog Category Model
class BlogCategory(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    slug: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Blog Model
class Blog(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    title: str
    slug: str
    content: str  # Rich text HTML
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    category_id: Optional[str] = None
    author: str = "Admin"
    tags: Optional[List[str]] = []
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = []
    is_published: bool = False
    published_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Section Model (for managing homepage/page sections dynamically)
class Section(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    section_type: str  # 'hero', 'features', 'cta', 'testimonials', 'content'
    page: str = "home"  # 'home', 'about', 'contact', etc.
    title: Optional[str] = None
    heading1: Optional[str] = None  # H1 tag
    heading2: Optional[str] = None  # H2 tag
    content: Optional[str] = None  # Rich text HTML content
    button_text: Optional[str] = None
    button_link: Optional[str] = None
    background_image: Optional[str] = None
    images: Optional[List[str]] = []
    order: int = 0  # Display order on page
    is_published: bool = True
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    custom_css: Optional[str] = None
    custom_data: Optional[Dict[str, Any]] = {}  # For additional custom fields
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
