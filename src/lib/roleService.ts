import { supabase } from "@/integrations/supabase/client";

export type AppRole = 'admin' | 'car-owner' | 'user';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

/**
 * Fetch all roles for a specific user
 */
export const getUserRoles = async (userId: string): Promise<AppRole[]> => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) throw error;
    return data?.map(r => r.role as AppRole) || [];
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return [];
  }
};

/**
 * Check if user has a specific role
 */
export const hasRole = async (userId: string, role: AppRole): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", role)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
};

/**
 * Get the primary role for a user (highest priority)
 * Priority: admin > car-owner > user
 */
export const getPrimaryRole = async (userId: string): Promise<AppRole> => {
  const roles = await getUserRoles(userId);
  
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('car-owner')) return 'car-owner';
  return 'user';
};

/**
 * Add a role to a user (admin only operation via RLS)
 */
export const addUserRole = async (userId: string, role: AppRole): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error adding user role:", error);
    return false;
  }
};

/**
 * Remove a role from a user (admin only operation via RLS)
 */
export const removeUserRole = async (userId: string, role: AppRole): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing user role:", error);
    return false;
  }
};

/**
 * Get human-readable role name
 */
export const getUserTypeName = (role: AppRole): string => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'car-owner':
      return 'Car Owner';
    default:
      return 'Customer';
  }
};
