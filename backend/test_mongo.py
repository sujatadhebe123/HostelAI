import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

mongo_url = os.getenv("MONGODB_URL")

if not mongo_url:
    print("❌ MONGODB_URL not found in .env")
    exit()

try:
    client = MongoClient(
        mongo_url,
        serverSelectionTimeoutMS=5000
    )

    client.admin.command("ping")

    print("✅ MongoDB Atlas connected successfully!")

except Exception as e:
    print("❌ MongoDB connection failed:")
    print(e)