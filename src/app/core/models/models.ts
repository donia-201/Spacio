// =========================
// Shared types. These mirror the Express + Mongoose models exactly, so a
// field rename on the backend shows up as a compile error here instead of
// silently rendering `undefined`.
// =========================

export type UserRole = 'user' | 'technician' | 'admin';

export type LocationPermission = 'pending' | 'granted' | 'denied';

export type MembershipRole =
  | 'resident'
  | 'employee'
  | 'manager'
  | 'building_admin'
  | 'doctor'
  | 'teacher'
  | 'member';

export type MembershipStatus = 'pending' | 'approved' | 'rejected';

export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export type ResourceStatus = 'available' | 'booked' | 'maintenance';

export type OrganizationType =
  | 'hospital'
  | 'workspace'
  | 'building'
  | 'government'
  | 'company'
  | 'university'
  | 'school'
  | 'library'
  | 'bank'
  | 'other';

export type ResourceType =
  | 'consultation_room'
  | 'ward'
  | 'operation_room'
  | 'lab'
  | 'pharmacy'
  | 'imaging_room'
  | 'emergency'
  | 'meeting_room'
  | 'conference_room'
  | 'training_room'
  | 'workspace'
  | 'desk'
  | 'phone_booth'
  | 'parking'
  | 'lecture_hall'
  | 'classroom'
  | 'library_hall'
  | 'study_room'
  | 'reading_room'
  | 'media_room'
  | 'sports_hall'
  | 'service_desk'
  | 'hall'
  | 'lobby'
  | 'teller'
  | 'lounge'
  | 'server_room';

/** GeoJSON. The backend always stores [longitude, latitude]. */
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  profileImage?: { secure_url: string; public_id: string } | null;
  locationPermission: LocationPermission;
  location: GeoPoint | null;
  governorate?: string;
  city?: string;
  searchRadius?: number;
  isVerified?: boolean;
  isActive?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description: string;
  type: OrganizationType;
  typeLabel?: string;
  address: string;
  governorate: string;
  city?: string;
  location: GeoPoint;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  source?: string;
  isActive: boolean;
  createdBy?: unknown;
  createdAt?: string;
  updatedAt?: string;
  /** Only on the detail endpoint. */
  options?: OptionDetail[];
  resourceCount?: number;
  availableCount?: number;
  /** Present on every geo-sorted response. */
  distanceMeters?: number;
}

export interface OrganizationRef {
  _id: string;
  name: string;
  type?: OrganizationType;
  slug?: string;
}

export interface Resource {
  _id: string;
  name: string;
  description: string;
  type: ResourceType;
  typeLabel?: string;
  organization: OrganizationRef | string | null;
  address?: string;
  governorate: string;
  city?: string;
  location: GeoPoint;
  capacity: number;
  amenities: string[];
  requiresApproval: boolean;
  status: ResourceStatus;
  statusNote?: string;
  isActive?: boolean;
  image?: string;
  phone?: string;
  workingHours?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  distanceMeters?: number;
}

export interface Booking {
  _id: string;
  user: string | (Pick<User, '_id' | 'firstName' | 'lastName' | 'email'> & { email?: string });
  resource: Pick<Resource, '_id' | 'name' | 'type'> & {
    typeLabel?: string;
    status?: ResourceStatus;
  };
  organization: OrganizationRef;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  approvedBy?: string;
  decisionNote?: string;
  notes?: string;
  createdAt?: string;
}

export interface Membership {
  _id: string;
  user: string | Pick<User, '_id' | 'firstName' | 'lastName' | 'email'>;
  organization: Organization | OrganizationRef;
  role: MembershipRole;
  status: MembershipStatus;
  decisionNote?: string;
  joinedAt?: string;
  createdAt?: string;
}

export interface OptionDetail {
  key: ResourceType;
  label: string;
}

/**
 * One entry of GET /organizations/meta/types. Static, no DB: the raw
 * `options` are the resource-type keys, `optionDetails` the same list already
 * labelled for display.
 */
export interface OrganizationTypeMeta {
  key: OrganizationType;
  singular: string;
  plural: string;
  icon: string;
  description: string;
  options: ResourceType[];
  optionDetails: OptionDetail[];
}

export interface Category {
  key: OrganizationType;
  singular: string;
  plural: string;
  icon: string;
  description: string;
  options: OptionDetail[];
  total: number;
  nearbyCount: number | null;
  nearestMeters: number | null;
}

export type NotificationType =
  | 'location_permission'
  | 'welcome'
  | 'membership_request'
  | 'membership_approved'
  | 'membership_rejected'
  | 'booking_created'
  | 'booking_approved'
  | 'booking_rejected'
  | 'booking_cancelled'
  | 'resource_assigned'
  | 'resource_status_changed'
  | 'system';

export interface AppNotification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    action?: string;
    route?: string;
    [key: string]: unknown;
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// =========================
// Response envelopes
// =========================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PagedResponse<T> extends Omit<ApiResponse<T>, 'data'> {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  data: T[];
  unreadCount?: number;
}

// =========================
// Dashboard payloads
// =========================

export interface AdminDashboard {
  users: {
    total: number;
    byRole: Record<string, number>;
    newThisMonth: number;
    withLocation: number;
  };
  organizations: {
    total: number;
    byType: Record<string, number>;
    deactivated: number;
  };
  resources: {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
  };
  bookings: {
    total: number;
    byStatus: Record<string, number>;
    thisMonth: number;
  };
  memberships: { pending: number };
  topOrganizations: Array<{
    _id: string;
    name: string;
    type: OrganizationType;
    slug: string;
    governorate: string;
    bookings: number;
  }>;
  bookingTrend: Array<{ _id: string; count: number }>;
  recentBookings: Booking[];
  recentUsers: Array<
    Pick<User, '_id' | 'firstName' | 'lastName' | 'email' | 'role' | 'locationPermission'> & {
      createdAt: string;
    }
  >;
}

export interface TechnicianDashboard {
  scope: 'all' | { organizations: string[]; organizationCount: number };
  resources: {
    total: number;
    byStatus: Record<string, number>;
    inMaintenance: number;
    needsAttention: Resource[];
  };
  bookings: {
    total: number;
    byStatus: Record<string, number>;
    pending: number;
    queue: Booking[];
    upcoming: Booking[];
  };
  organizationsManaged: number;
}

export interface UserDashboard {
  bookings: {
    total: number;
    byStatus: Record<string, number>;
    upcoming: Booking[];
  };
  organizations: Membership[];
  unreadNotifications: number;
  locationPermission: LocationPermission;
}
