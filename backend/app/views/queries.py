import strawberry
from typing import List, Optional
from app.schemas.category import CategoryType
from app.crud.category import get_categories
from app.schemas.contact import ContactType
from app.crud.contact import get_contacts

@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello, world!"

    @strawberry.field
    async def categories(self, name: Optional[str] = None) -> List[CategoryType]:
        categories = await get_categories(name)
        return [CategoryType(id=str(c["_id"]), name=c["name"]) for c in categories]

    @strawberry.field
    async def contacts(self, name: Optional[str] = None) -> List[ContactType]:
        contacts = await get_contacts(name)
        return [ContactType(id=str(c["_id"]), contact_name=c["contact_name"]) for c in contacts]
