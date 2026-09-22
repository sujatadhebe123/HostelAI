import os
import json
from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel
from pymongo import MongoClient


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="HostelAI API",
    description="AI-Powered Hostel Complaint Management System",
    version="2.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# MONGODB
# =========================================================

if not MONGODB_URL:
    raise RuntimeError(
        "MONGODB_URL is missing from the .env file."
    )

mongo_client = MongoClient(MONGODB_URL)

db = mongo_client["hostelai"]

complaints_collection = db["complaints"]


# =========================================================
# GROQ
# =========================================================

groq_client = None

if GROQ_API_KEY:
    groq_client = Groq(
        api_key=GROQ_API_KEY
    )


# =========================================================
# PYDANTIC MODELS
# =========================================================

class ComplaintRequest(BaseModel):
    name: str
    room: str
    complaint: str


class AIAnalysis(BaseModel):
    category: Literal[
        "Electrical",
        "Plumbing",
        "Internet",
        "Cleanliness",
        "Food",
        "Security",
        "Maintenance",
        "Medical",
        "General",
    ]

    priority: Literal[
        "Low",
        "Medium",
        "High",
        "Critical",
    ]

    summary: str

    suggested_action: str

    reason: str


# =========================================================
# LOCAL FALLBACK ANALYZER
# =========================================================

def local_analysis(text: str) -> AIAnalysis:

    complaint = text.lower()

    # -----------------------------------------------------
    # ELECTRICAL / FIRE EMERGENCY
    # -----------------------------------------------------

    electrical_emergency = [
        "spark",
        "sparks",
        "smoke",
        "burning",
        "fire",
        "electric shock",
        "shock",
        "short circuit",
        "short-circuit",
    ]

    if any(
        word in complaint
        for word in electrical_emergency
    ):
        return AIAnalysis(
            category="Electrical",
            priority="Critical",
            summary=(
                "Potential electrical safety issue reported."
            ),
            suggested_action=(
                "Immediately inspect the affected electrical "
                "equipment and isolate the power supply if necessary."
            ),
            reason=(
                "The complaint indicates a possible electrical "
                "or fire safety hazard requiring immediate attention."
            ),
        )

    # -----------------------------------------------------
    # SECURITY
    # -----------------------------------------------------

    security_words = [
        "theft",
        "stolen",
        "steal",
        "intruder",
        "attack",
        "unsafe",
        "threat",
        "security",
        "someone entered",
        "without permission",
    ]

    if any(
        word in complaint
        for word in security_words
    ):
        return AIAnalysis(
            category="Security",
            priority="Critical",
            summary=(
                "A potential hostel security issue has been reported."
            ),
            suggested_action=(
                "Notify hostel security or the warden immediately "
                "and verify the incident."
            ),
            reason=(
                "Security incidents may involve immediate risk "
                "to students or hostel property."
            ),
        )

    # -----------------------------------------------------
    # MEDICAL
    # -----------------------------------------------------

    medical_words = [
        "medical",
        "injured",
        "injury",
        "unconscious",
        "fainted",
        "faint",
        "bleeding",
        "emergency",
    ]

    if any(
        word in complaint
        for word in medical_words
    ):
        return AIAnalysis(
            category="Medical",
            priority="Critical",
            summary=(
                "A possible medical emergency has been reported."
            ),
            suggested_action=(
                "Contact hostel staff and medical assistance immediately."
            ),
            reason=(
                "Medical incidents may require immediate "
                "professional attention."
            ),
        )

    # -----------------------------------------------------
    # PLUMBING
    # -----------------------------------------------------

    plumbing_words = [
        "water",
        "leak",
        "leaking",
        "pipe",
        "tap",
        "bathroom",
        "toilet",
        "drain",
    ]

    if any(
        word in complaint
        for word in plumbing_words
    ):
        return AIAnalysis(
            category="Plumbing",
            priority="High",
            summary=(
                "A plumbing or water-related problem has been reported."
            ),
            suggested_action=(
                "Assign maintenance staff to inspect the affected "
                "water or plumbing system."
            ),
            reason=(
                "Water leakage or plumbing failures can cause "
                "property damage and disrupt hostel facilities."
            ),
        )

    # -----------------------------------------------------
    # INTERNET
    # -----------------------------------------------------

    internet_words = [
        "wifi",
        "wi-fi",
        "internet",
        "network",
        "router",
        "connection",
    ]

    if any(
        word in complaint
        for word in internet_words
    ):
        return AIAnalysis(
            category="Internet",
            priority="Medium",
            summary=(
                "An internet connectivity problem has been reported."
            ),
            suggested_action=(
                "Check the hostel network, router, and connectivity "
                "for the affected room or area."
            ),
            reason=(
                "Internet problems affect student productivity "
                "but usually do not present an immediate safety risk."
            ),
        )

    # -----------------------------------------------------
    # FOOD
    # -----------------------------------------------------

    food_words = [
        "food",
        "mess",
        "meal",
        "breakfast",
        "lunch",
        "dinner",
        "canteen",
    ]

    if any(
        word in complaint
        for word in food_words
    ):
        return AIAnalysis(
            category="Food",
            priority="Medium",
            summary=(
                "A hostel food or mess-related issue has been reported."
            ),
            suggested_action=(
                "Ask mess management to review the reported food issue."
            ),
            reason=(
                "Food quality and service issues affect student "
                "well-being and should be reviewed promptly."
            ),
        )

    # -----------------------------------------------------
    # CLEANLINESS
    # -----------------------------------------------------

    cleanliness_words = [
        "dirty",
        "garbage",
        "clean",
        "cleaning",
        "waste",
        "dust",
        "unclean",
    ]

    if any(
        word in complaint
        for word in cleanliness_words
    ):
        return AIAnalysis(
            category="Cleanliness",
            priority="Medium",
            summary=(
                "A cleanliness or sanitation issue has been reported."
            ),
            suggested_action=(
                "Assign housekeeping staff to inspect and clean "
                "the reported area."
            ),
            reason=(
                "Poor cleanliness can affect hygiene and hostel "
                "living conditions."
            ),
        )

    # -----------------------------------------------------
    # MAINTENANCE
    # -----------------------------------------------------

    maintenance_words = [
        "fan",
        "light",
        "door",
        "window",
        "bed",
        "chair",
        "table",
        "broken",
        "repair",
        "maintenance",
    ]

    if any(
        word in complaint
        for word in maintenance_words
    ):
        return AIAnalysis(
            category="Maintenance",
            priority="Medium",
            summary=(
                "A hostel maintenance issue has been reported."
            ),
            suggested_action=(
                "Assign maintenance staff to inspect and repair "
                "the reported facility."
            ),
            reason=(
                "The issue requires maintenance but does not appear "
                "to represent an immediate emergency."
            ),
        )

    # -----------------------------------------------------
    # GENERAL
    # -----------------------------------------------------

    return AIAnalysis(
        category="General",
        priority="Low",
        summary=(
            "A general hostel-related complaint has been submitted."
        ),
        suggested_action=(
            "Review the complaint and assign it to the "
            "appropriate hostel staff."
        ),
        reason=(
            "No immediate safety or high-priority condition "
            "was identified."
        ),
    )


# =========================================================
# GROQ AI ANALYZER
# =========================================================

def analyze_with_groq(
    complaint: str,
    room: str,
) -> AIAnalysis:

    if groq_client is None:
        raise RuntimeError(
            "GROQ_API_KEY is missing."
        )

    system_prompt = """
You are HostelAI, an intelligent hostel complaint triage system.

Your job is to analyze student hostel complaints.

Choose exactly ONE category:

Electrical
Plumbing
Internet
Cleanliness
Food
Security
Maintenance
Medical
General

Choose exactly ONE priority:

Low
Medium
High
Critical

Priority rules:

Critical:
Immediate danger or serious safety risk such as fire,
sparks, electrical shock, smoke, security threats,
intruders, violence, or medical emergencies.

High:
Serious issues needing quick attention, such as major
water leakage, flooding, or significant facility failure.

Medium:
Important but non-emergency issues such as internet
problems, cleanliness, food quality, or routine maintenance.

Low:
General requests or minor issues without urgent impact.

You must analyze the meaning of the complaint, not just keywords.

Keep the summary short.

The suggested action must be practical for hostel administration.

The reason should briefly explain why the selected priority
was chosen.
"""

    user_prompt = f"""
Room Number: {room}

Student Complaint:
{complaint}

Analyze this hostel complaint.
"""

    response = groq_client.chat.completions.create(
        model="openai/gpt-oss-20b",

        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],

        temperature=0.1,

        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "hostel_complaint_analysis",
                "strict": True,
                "schema": {
                    "type": "object",

                    "properties": {
                        "category": {
                            "type": "string",
                            "enum": [
                                "Electrical",
                                "Plumbing",
                                "Internet",
                                "Cleanliness",
                                "Food",
                                "Security",
                                "Maintenance",
                                "Medical",
                                "General",
                            ],
                        },

                        "priority": {
                            "type": "string",
                            "enum": [
                                "Low",
                                "Medium",
                                "High",
                                "Critical",
                            ],
                        },

                        "summary": {
                            "type": "string",
                        },

                        "suggested_action": {
                            "type": "string",
                        },

                        "reason": {
                            "type": "string",
                        },
                    },

                    "required": [
                        "category",
                        "priority",
                        "summary",
                        "suggested_action",
                        "reason",
                    ],

                    "additionalProperties": False,
                },
            },
        },
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError(
            "Groq returned an empty response."
        )

    data = json.loads(content)

    return AIAnalysis(**data)


# =========================================================
# ANALYZER CONTROLLER
# =========================================================

def analyze_complaint(
    complaint: str,
    room: str,
):

    if groq_client:

        try:

            print("Trying Groq AI analysis...")

            result = analyze_with_groq(
                complaint,
                room,
            )

            print("Groq AI analysis successful.")

            return result, "Groq AI"

        except Exception as error:

            print("Groq AI unavailable:")
            print(error)

            print("Using local fallback analyzer.")

    else:

        print(
            "GROQ_API_KEY not found. "
            "Using local fallback analyzer."
        )

    result = local_analysis(complaint)

    return result, "Local Fallback"



# =========================================================
# DUPLICATE COMPLAINT DETECTION
# =========================================================

def detect_duplicate(new_complaint: str, category: str):
    recent_complaints = list(
        complaints_collection.find(
            {"status": "Pending", "category": category}
        ).sort("created_at", -1).limit(10)
    )

    if not recent_complaints or groq_client is None:
        return False, None, None

    existing_text = "\n".join(
        f"ID: {item['_id']}\nRoom: {item.get('room', '')}\nComplaint: {item.get('complaint', '')}"
        for item in recent_complaints
    )

    prompt = f"""
You are HostelAI's duplicate complaint detector.

NEW COMPLAINT:
{new_complaint}

EXISTING PENDING COMPLAINTS:
{existing_text}

Decide whether the new complaint describes the SAME underlying incident/problem
as one existing complaint. Same category alone is not enough. Consider issue,
location/room/floor, timing, and whether administrators could handle both
reports as the same underlying incident.

Return valid JSON only:
{{
  "is_duplicate": true or false,
  "duplicate_id": "matching MongoDB ID or empty string",
  "similarity_reason": "short explanation"
}}
"""

    try:
        print("Checking for duplicate complaint...")
        response = groq_client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": "Detect duplicate hostel complaints. Return valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        if not content:
            return False, None, None

        data = json.loads(content)
        is_duplicate = bool(data.get("is_duplicate", False))
        duplicate_id = data.get("duplicate_id", "")
        similarity_reason = data.get("similarity_reason", "")
        valid_ids = {str(item["_id"]) for item in recent_complaints}

        if is_duplicate and duplicate_id in valid_ids:
            print("Duplicate complaint detected.")
            return True, duplicate_id, similarity_reason

        print("No duplicate complaint detected.")
        return False, None, None

    except Exception as error:
        print("Duplicate detection failed:")
        print(error)
        return False, None, None


# =========================================================
# SERIALIZE MONGODB DOCUMENT
# =========================================================

def serialize_complaint(document):

    document["id"] = str(
        document["_id"]
    )

    del document["_id"]

    return document


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message": "HostelAI API is running",
        "database": "MongoDB connected",
        "ai_provider": (
            "Groq"
            if groq_client
            else "Local Fallback"
        ),
        "model": (
            "openai/gpt-oss-20b"
            if groq_client
            else None
        ),
    }


# =========================================================
# CREATE COMPLAINT
# =========================================================

@app.post("/complaints")
def create_complaint(
    request: ComplaintRequest,
):

    analysis, analyzer = analyze_complaint(
        request.complaint,
        request.room,
    )

    (
        is_duplicate,
        duplicate_of,
        similarity_reason,
    ) = detect_duplicate(
        request.complaint,
        analysis.category,
    )

    document = {
        "name": request.name,
        "room": request.room,
        "complaint": request.complaint,

        "category":
            analysis.category,

        "priority":
            analysis.priority,

        "summary":
            analysis.summary,

        "suggested_action":
            analysis.suggested_action,

        "reason":
            analysis.reason,

        "status":
            "Pending",

        "analyzer":
            analyzer,

        "is_duplicate":
            is_duplicate,

        "duplicate_of":
            duplicate_of,

        "similarity_reason":
            similarity_reason,

        "created_at":
            datetime.now(
                timezone.utc
            ),
    }

    result = complaints_collection.insert_one(
        document
    )

    document["_id"] = result.inserted_id

    return serialize_complaint(
        document
    )


# =========================================================
# GET ALL COMPLAINTS
# =========================================================

@app.get("/complaints")
def get_complaints():

    complaints = list(
        complaints_collection
        .find()
        .sort(
            "created_at",
            -1,
        )
    )

    return [
        serialize_complaint(item)
        for item in complaints
    ]


# =========================================================
# RESOLVE COMPLAINT
# =========================================================

@app.patch(
    "/complaints/{complaint_id}/resolve"
)
def resolve_complaint(
    complaint_id: str,
):

    if not ObjectId.is_valid(
        complaint_id
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid complaint ID",
        )

    result = complaints_collection.update_one(
        {
            "_id":
                ObjectId(
                    complaint_id
                )
        },
        {
            "$set": {
                "status":
                    "Resolved",

                "resolved_at":
                    datetime.now(
                        timezone.utc
                    ),
            }
        },
    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Complaint not found",
        )

    updated = complaints_collection.find_one(
        {
            "_id":
                ObjectId(
                    complaint_id
                )
        }
    )

    return serialize_complaint(
        updated
    )