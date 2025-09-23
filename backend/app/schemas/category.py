import strawberry

@strawberry.type
class CategoryType:
    id: str
    name: str
    userId: str

@strawberry.input
class CategoryCreate:
    name: str
    userId: str
