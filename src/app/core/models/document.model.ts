export interface DocumentDTO {
  id: number;
  fileName: string;
  documentType: string;
  uploadDate: string;
  uploaderUsername: string;
  employeeName?: string;
  employeeCode?: string;
  uploadedBy?: string;
}
