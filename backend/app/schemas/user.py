import strawberry

@strawberry.type
class UserType:
    id: int
    email: str
    first_name: str
    last_name: str

@strawberry.type
class AuthTokenResponse:
    access_token: str
    token_type: str
