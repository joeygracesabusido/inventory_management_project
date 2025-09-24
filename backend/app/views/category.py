# app/views/category.py
import strawberry
from strawberry.types import Info

from app.crud.category import create_category
from app.schemas.category import CategoryCreate, CategoryType
from app.utils.context import extract_user_id, get_user_from_info

class IsAuthenticated(strawberry.permission.BasePermission):
    message = "Not authenticated"
    def has_permission(self, source, info: Info, **kwargs) -> bool:
        return bool(get_user_from_info(info))
    


@strawberry.type
class Mutation:
    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def add_category(self, info: Info, name: str) -> CategoryType:
        user = get_user_from_info(info)
        # print(user['email'])
        if not user:
            raise Exception("Not authenticated")

       

        category_data = CategoryCreate(name=name, user=user['email'])
        new_category = await create_category(category_data)

        if new_category is None:

            raise Exception("Category with this name already exists.")
        

        return CategoryType(
            id=str(new_category["_id"]),
            name=new_category["name"],
            user=new_category["user"],
        )

        
