export const AUTH_TOKEN_CONFIG = 'AUTH_TOKEN_CONFIG';
export const ACCESS_TOKEN_JWT = 'ACCESS_TOKEN_JWT';
export const REFRESH_TOKEN_JWT = 'REFRESH_TOKEN_JWT';
export const RELAY_TOKEN_JWT = 'RELAY_TOKEN_JWT';

export interface TokenSettings {
  secret: string;
  expiresIn: string;
}

export interface AuthTokenConfig {
  access: TokenSettings;
  refresh: TokenSettings;
  relay: TokenSettings;
}
