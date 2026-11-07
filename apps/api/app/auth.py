import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from .config import settings

_bearer = HTTPBearer(auto_error=False)
_jwks: PyJWKClient | None = None


def _get_jwks() -> PyJWKClient:
    global _jwks
    if _jwks is None:
        if not settings.clerk_jwks_url:
            raise HTTPException(503, "Clerk JWKS non configurée")
        _jwks = PyJWKClient(settings.clerk_jwks_url)
    return _jwks


async def get_claims(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    """Vérifie le JWT de session Clerk et retourne les claims."""
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token manquant")
    try:
        signing_key = _get_jwks().get_signing_key_from_jwt(creds.credentials)
        claims = jwt.decode(
            creds.credentials,
            signing_key.key,
            algorithms=["RS256"],
            issuer=settings.clerk_issuer or None,
            options={"verify_iss": bool(settings.clerk_issuer)},
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Token invalide : {exc}")

    azp = claims.get("azp")
    if azp and settings.authorized_parties and azp not in settings.authorized_parties:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Partie non autorisée")
    return claims
