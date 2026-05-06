// src/app/core/models/employee.model.ts

export interface WorkPosition { id: number; name: string; }

export interface RoleInfo { id: number; name: string; }

export interface EmployeeRequestDTO {
    firstName: string; 
    lastName: string;
    employeeCode: string; 
    position: string;
    biometricHash: string;
    username: string; 
    password?: string;
    email:string;
    phoneNumber:string;
    roleName: string;
}

export interface EmployeeResponseDTO {
  id: number;
  dni: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  position: { id: number; name: string };
  email: string;
  phoneNumber: string;
  biometricHash: string;
  username: string;
  roleName: string;
}

// Interfaz para la tabla de listado (plana)
export interface EmployeeListDTO {
    id: number; employeeCode: string; fullName: string; position: string;
    userId: number; username: string; roleName: string;
}

// Interfaz para la vista detallada del perfil (incluye nómina)
export interface EmployeeProfileDTO {
    id: number; 
    employeeCode: string;
    firstName: string;
    lastName: string;
    position: string;
    phoneNumber:string;
    address:string;
    email:string;
    dni:string;
    username: string;
    fixedSalary: number;
    totalOvertimeDuration: string;
    hireDate: string; // Fecha de ingreso a la empresa
    loyaltyPoints: number; // Puntos de lealtad acumulados
}
