import strawberry
from pydantic import BaseModel, Field
from typing import Optional

@strawberry.input
class ContactCreateInput:
    contact_name: str
    account_number: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    user: Optional[str] = None

class ContactBase(BaseModel):
    contact_name: str
    account_number: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None

class ContactCreate(ContactBase):
    pass

@strawberry.type
class ContactType:
    id: str
    contact_name: str
    account_number: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    user: Optional[str] = None
