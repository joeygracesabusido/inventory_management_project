import strawberry
from app.schemas.category import CategoryType, CategoryCreate
from app.crud.category import create_category

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def add_category(self, name: str) -> CategoryType:
        category_data = CategoryCreate(name=name)
        new_category = await create_category(category_data)
        if new_category is None:
            raise Exception("Category with this name already exists.")
        return CategoryType(
            id=str(new_category["_id"]),
            name=new_category["name"],
        )
