# app/api/graphql_router.py
from typing import Any, Dict, Union
from jose import JWTError, jwt
from starlette.requests import Request
from starlette.websockets import WebSocket
from strawberry.fastapi import BaseContext, GraphQLRouter

from app.core.config import settings
from app.crud.user import get_user_by_email

RequestLike = Union[Request, WebSocket]

class CustomGraphQLRouter(GraphQLRouter):
    async def get_context(self, request: RequestLike, response) -> Any:
        context = await super().get_context(request, response)

        authorization = request.headers.get("Authorization", "")
        print(f"Authorization header: {authorization}")
        if not authorization.startswith("Bearer "):
            return context

        token = authorization.replace("Bearer ", "", 1).strip()
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM],
            )
            email = payload.get("sub")
            user_id = payload.get("userId")
            print(email)
            context_user: Dict[str, Any] = {}
            if email:
                context_user["email"] = email
            if user_id:
                context_user["_id"] = user_id
                context_user["id"] = user_id
                context_user["userId"] = user_id

            if email:
                user = await get_user_by_email(email)  # DB lookup
                if user is None:
                    print(f"User not found for email: {email}")
                else:
                    context_user = user

            if context_user:
                if isinstance(context, BaseContext):
                    setattr(context, "user", context_user)
                else:
                    try:
                        context["user"] = context_user
                    except TypeError:
                        setattr(context, "user", context_user)
        except JWTError as e:
            print(f"JWT Error: {e}")  # invalid/expired token
        return context
