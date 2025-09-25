export interface JwtPayload {
  sub: string; // id de usuario
  tv?: number; // tokenVersion (opcional)
}
