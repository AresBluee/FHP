export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface JwtResponse {
    token: string;
    type: string;
    id: number;
    username: string;
    role: string; // ADMIN, EMPLOYEE, RRHH (sin el prefijo ROLE_)
  }