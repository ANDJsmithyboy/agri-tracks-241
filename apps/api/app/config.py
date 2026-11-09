from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = ""
    auto_init_db: bool = True
    clerk_issuer: str = "https://internal-oyster-8361.clerk.accounts.dev"
    clerk_jwks_url: str = "https://internal-oyster-8361.clerk.accounts.dev/.well-known/jwks.json"
    clerk_authorized_parties: str = "http://localhost:3000,http://127.0.0.1:3000,https://agri-tracks-241.vercel.app,com.poufa.app,com.poufa.app.debug"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,https://agri-tracks-241.vercel.app,https://poufa.smartandjai.com"
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-flash"

    @property
    def authorized_parties(self) -> list[str]:
        return [p.strip() for p in self.clerk_authorized_parties.split(",") if p.strip()]

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
