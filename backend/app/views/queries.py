import strawberry
from typing import List, Optional
from app.schemas.category import CategoryType
from app.crud.category import get_categories

@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello, world!"

    @strawberry.field
    async def categories(self, name: Optional[str] = None) -> List[CategoryType]:
        categories = await get_categories(name)
        return [CategoryType(id=str(c["_id"]), name=c["name"]) for c in categories]
