export interface JwtAccessPayload {
  sub: string;   
  email: string;
  iat?: number;
  exp?: number;
}
 
export interface JwtRefreshPayload {
  sub: string;   
  tokenId: string;
  iat?: number;
  exp?: number;
}
 
export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  category?: string;
}
 
export interface LoginBody {
  email: string;
  password: string;
}
 