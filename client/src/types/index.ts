export type UserRole = 'POLICYHOLDER' | 'ADJUSTER' | 'SUPERVISOR' | 'ADMIN';

export type ClaimStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'IN_REVIEW' 
  | 'INFO_REQUESTED' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'PAID' 
  | 'CLOSED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  createdAt: string;
}

export interface Policy {
  id: string;
  policyNumber: string;
  holderId: string;
  product: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface ClaimItem {
  id: string;
  claimId: string;
  category: string;
  description: string;
  estimatedCost: number;
}

export interface Attachment {
  id: string;
  claimId: string;
  s3Key: string;
  fileName: string;
  mimeType: string;
  size: number;
  checksum: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Note {
  id: string;
  claimId: string;
  authorId: string;
  author?: User;
  body: string;
  visibility: 'PUBLIC' | 'INTERNAL';
  createdAt: string;
}

export interface Assignment {
  id: string;
  claimId: string;
  adjusterId: string;
  adjuster?: User;
  assignedAt: string;
  dueAt: string;
  priority: Priority;
}

export interface AuditEvent {
  id: string;
  claimId: string;
  actorId: string;
  actor?: User;
  eventType: string;
  payloadJson: Record<string, any>;
  createdAt: string;
}

export interface Claim {
  id: string;
  policyId: string;
  policy?: Policy;
  claimantId: string;
  claimant?: User;
  incidentDate: string;
  incidentType: string;
  status: ClaimStatus;
  amountClaimed?: number;
  amountApproved?: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items?: ClaimItem[];
  attachments?: Attachment[];
  notes?: Note[];
  assignment?: Assignment;
  events?: AuditEvent[];
}

export interface ClaimFormData {
  policyId: string;
  incidentDate: string;
  incidentType: string;
  description: string;
  items: Omit<ClaimItem, 'id' | 'claimId'>[];
  attachments: File[];
}

export interface StatusChangeRequest {
  targetStatus: ClaimStatus;
  reason?: string;
}

export interface PresignedUploadResponse {
  url: string;
  fields: Record<string, string>;
  s3Key: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClaimFilters {
  status?: ClaimStatus[];
  product?: string[];
  priority?: Priority[];
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface SLAReport {
  totalClaims: number;
  onTime: number;
  overdue: number;
  averageCycleTime: number;
  breachesByProduct: Record<string, number>;
}

export interface DashboardStats {
  totalClaims: number;
  pendingReview: number;
  approvedToday: number;
  overdueAssignments: number;
  averageProcessingTime: number;
}
