from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

from bson import ObjectId
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from pymongo import MongoClient


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def is_valid_object_id(value: str) -> bool:
    try:
        ObjectId(value)
        return True
    except Exception:
        return False


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def validate_contact_payload(payload: Dict[str, Any], *, partial: bool) -> Tuple[bool, Dict[str, str], Dict[str, Any]]:
    """
    Returns (ok, errors, cleaned_data).

    - partial=False is used for CREATE (name required)
    - partial=True is used for UPDATE (all fields optional)
    """
    allowed_fields = ("name", "phone", "email", "address", "notes")
    errors: Dict[str, str] = {}
    cleaned: Dict[str, Any] = {}

    for field in allowed_fields:
        if field in payload:
            cleaned[field] = clean_text(payload.get(field))

    if not partial:
        if not cleaned.get("name"):
            errors["name"] = "Name is required."

    # Minimal, friendly validation (keep it simple)
    email = cleaned.get("email", "")
    if email and ("@" not in email or "." not in email):
        errors["email"] = "Email looks invalid."

    phone = cleaned.get("phone", "")
    if phone and len(phone) < 5:
        errors["phone"] = "Phone number looks too short."

    return (len(errors) == 0), errors, cleaned


def serialize_contact(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "phone": doc.get("phone", ""),
        "email": doc.get("email", ""),
        "address": doc.get("address", ""),
        "notes": doc.get("notes", ""),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


load_dotenv()

app = Flask(__name__)

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
db_name = os.getenv("MONGO_DB", "contact_book")
collection_name = os.getenv("MONGO_COLLECTION", "contacts")

mongo_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
db = mongo_client[db_name]
contacts = db[collection_name]

def mongo_ready() -> bool:
    try:
        mongo_client.admin.command("ping")
        return True
    except Exception:
        return False


# Helpful indexes for basic searching/sorting (safe even if MongoDB is offline)
try:
    if mongo_ready():
        contacts.create_index("name")
        contacts.create_index("created_at")
except Exception:
    pass


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "time": utc_now_iso(), "mongo": mongo_ready()})


@app.get("/api/contacts")
def list_contacts():
    if not mongo_ready():
        return jsonify({"error": "MongoDB is not reachable. Start MongoDB and retry."}), 503

    search = clean_text(request.args.get("search"))

    query: Dict[str, Any] = {}
    if search:
        # Simple, case-insensitive search on a few fields.
        query = {
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"phone": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
            ]
        }

    docs = list(contacts.find(query).sort("created_at", -1).limit(500))
    return jsonify({"items": [serialize_contact(d) for d in docs]})


@app.post("/api/contacts")
def create_contact():
    if not mongo_ready():
        return jsonify({"error": "MongoDB is not reachable. Start MongoDB and retry."}), 503

    payload = request.get_json(silent=True) or {}
    ok, errors, cleaned = validate_contact_payload(payload, partial=False)
    if not ok:
        return jsonify({"error": "Validation failed.", "fields": errors}), 400

    now = utc_now_iso()
    doc = {
        "name": cleaned.get("name", ""),
        "phone": cleaned.get("phone", ""),
        "email": cleaned.get("email", ""),
        "address": cleaned.get("address", ""),
        "notes": cleaned.get("notes", ""),
        "created_at": now,
        "updated_at": now,
    }
    result = contacts.insert_one(doc)
    saved = contacts.find_one({"_id": result.inserted_id})
    return jsonify({"item": serialize_contact(saved)}), 201


@app.get("/api/contacts/<contact_id>")
def get_contact(contact_id: str):
    if not mongo_ready():
        return jsonify({"error": "MongoDB is not reachable. Start MongoDB and retry."}), 503

    if not is_valid_object_id(contact_id):
        return jsonify({"error": "Invalid contact id."}), 400

    doc = contacts.find_one({"_id": ObjectId(contact_id)})
    if not doc:
        return jsonify({"error": "Contact not found."}), 404

    return jsonify({"item": serialize_contact(doc)})


@app.put("/api/contacts/<contact_id>")
def update_contact(contact_id: str):
    if not mongo_ready():
        return jsonify({"error": "MongoDB is not reachable. Start MongoDB and retry."}), 503

    if not is_valid_object_id(contact_id):
        return jsonify({"error": "Invalid contact id."}), 400

    payload = request.get_json(silent=True) or {}
    ok, errors, cleaned = validate_contact_payload(payload, partial=True)
    if not ok:
        return jsonify({"error": "Validation failed.", "fields": errors}), 400

    if not cleaned:
        return jsonify({"error": "No fields to update."}), 400

    cleaned["updated_at"] = utc_now_iso()

    result = contacts.update_one({"_id": ObjectId(contact_id)}, {"$set": cleaned})
    if result.matched_count == 0:
        return jsonify({"error": "Contact not found."}), 404

    doc = contacts.find_one({"_id": ObjectId(contact_id)})
    return jsonify({"item": serialize_contact(doc)})


@app.delete("/api/contacts/<contact_id>")
def delete_contact(contact_id: str):
    if not mongo_ready():
        return jsonify({"error": "MongoDB is not reachable. Start MongoDB and retry."}), 503

    if not is_valid_object_id(contact_id):
        return jsonify({"error": "Invalid contact id."}), 400

    result = contacts.delete_one({"_id": ObjectId(contact_id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Contact not found."}), 404

    return jsonify({"ok": True})


if __name__ == "__main__":
    # Run with: python app.py
    # Or (recommended): flask --app app run --debug
    app.run(host="127.0.0.1", port=5000, debug=True)
