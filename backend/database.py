from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Collections
brands_collection = db.brands
machine_models_collection = db.machine_models
categories_collection = db.categories
products_collection = db.products
customers_collection = db.customers
orders_collection = db.orders
admin_users_collection = db.admin_users
contact_messages_collection = db.contact_messages
pages_collection = db.pages
sections_collection = db.sections
redirects_collection = db.redirects
reviews_collection = db.reviews
faqs_collection = db.faqs
blog_categories_collection = db.blog_categories
blogs_collection = db.blogs


async def init_db():
    """Initialize database with indexes"""
    # Create indexes for better performance
    await products_collection.create_index("sku", unique=True)
    await products_collection.create_index("part_number")
    await products_collection.create_index("brand")
    await products_collection.create_index("category")
    
    await brands_collection.create_index("slug", unique=True)
    await categories_collection.create_index("slug", unique=True)
    
    await customers_collection.create_index("email", unique=True)
    await orders_collection.create_index("order_number", unique=True)
    
    await admin_users_collection.create_index("username", unique=True)
    await admin_users_collection.create_index("email", unique=True)
    
    await pages_collection.create_index("slug", unique=True)
    await sections_collection.create_index([("page", 1), ("order", 1)])
    await redirects_collection.create_index("from_url", unique=True)
    await reviews_collection.create_index("product_id")
    await faqs_collection.create_index("category")
    await blog_categories_collection.create_index("slug", unique=True)
    await blogs_collection.create_index("slug", unique=True)
    await blogs_collection.create_index("category_id")
    
    print("✅ Database indexes created successfully")
