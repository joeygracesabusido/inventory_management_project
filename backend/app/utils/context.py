from typing import Any, Optional

from jose import JWTError, jwt
from strawberry.types import Info

from app.core.config import settings


def _store_user_on_context(context: Any, user: Any) -> None:
    """Attempt to cache the user on the context object for subsequent lookups."""
    try:
        setattr(context, "user", user)
        return
    except Exception:
        pass

    try:
        context["user"] = user
    except Exception:
        pass


def _extract_request(context: Any) -> Optional[Any]:
    request = getattr(context, "request", None)
    if request is not None:
        return request

    if isinstance(context, dict):
        return context.get("request")

    get_method = getattr(context, "get", None)
    if callable(get_method):
        return get_method("request")

    return None


def get_user_from_info(info: Info) -> Optional[Any]:
    """Return the authenticated user, decoding the JWT if needed."""
    context = getattr(info, "context", None)
    if context is None:
        return None

    user = getattr(context, "user", None)
    if user is not None:
        return user

    if isinstance(context, dict) and context.get("user") is not None:
        return context.get("user")

    get_method = getattr(context, "get", None)
    if callable(get_method):
        existing_user = get_method("user")
        if existing_user is not None:
            return existing_user

    request = _extract_request(context)
    if request is None:
        return None

    authorization: str = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        return None

    token = authorization.replace("Bearer ", "", 1).strip()
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError:
        return None

    email = payload.get("sub")
    user_id = payload.get("userId")
    if not email and not user_id:
        return None

    decoded_user: dict[str, Any] = {}
    if email:
        decoded_user["email"] = email
    if user_id:
        decoded_user["_id"] = user_id
        decoded_user["id"] = user_id
        decoded_user["userId"] = user_id

    if decoded_user:
        _store_user_on_context(context, decoded_user)
        return decoded_user

    return None


def extract_user_id(user: Any) -> Optional[str]:
    """Return a stringified user identifier from various user shapes."""
    if user is None:
        return None

    if isinstance(user, dict):
        for key in ("_id", "userId", "id"):
            value = user.get(key)  # type: ignore[arg-type]
            if value:
                return str(value)
        return None

    for attr in ("_id", "userId", "id"):
        if hasattr(user, attr):
            value = getattr(user, attr)
            if value:
                return str(value)

    get_method = getattr(user, "get", None)
    if callable(get_method):
        for key in ("_id", "userId", "id"):
            value = get_method(key)  # type: ignore[call-arg]
            if value:
                return str(value)

    return None
