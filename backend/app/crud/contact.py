from app.db.database import db
from app.schemas.contact import ContactCreateInput
import re

async def get_contacts(name: str = None):
    query = {}
    if name:
        query["contact_name"] = re.compile(name, re.IGNORECASE)
    return await db.contacts.find(query).to_list(10)

async def create_contact(contact: ContactCreateInput):
    contact_dict = {
        "contact_name": contact.contact_name,
        "account_number": contact.account_number,
        "first_name": contact.first_name,
        "last_name": contact.last_name,
        "email": contact.email,
        "phone_number": contact.phone_number,
        "userId": contact.userId,
    }
    result = await db.contacts.insert_one(contact_dict)
    new_contact = await db.contacts.find_one({"_id": result.inserted_id})
    return new_contact
