import { UserRole } from "../../types/types";
import { CanParams, CanReturnType, AccessControlProvider } from "@refinedev/core";
import { getSession } from "next-auth/react";

const rolesPermissions: Record<UserRole, Set<string>> = {
  [UserRole.ADMIN]: new Set(["*"]), 
  [UserRole.USER]: new Set([]),
  [UserRole.DELIVERY]: new Set(["orders"]),
};


let userPermissionsCache: Set<string> | null = null;
let permissionsPromise: Promise<Set<string>> | null = null;


const getUserPermissions = async (): Promise<Set<string>> => {
  if (userPermissionsCache) {
    return userPermissionsCache;
  }
  
  if (!permissionsPromise) {
    permissionsPromise = (async () => {
      const session = await getSession();
      const userRole = session?.user?.role
        ? (Number(session.user.role) as UserRole)
        : UserRole.USER;
      
      userPermissionsCache = rolesPermissions[userRole] || new Set();
      return userPermissionsCache;
    })();
  }
  
  return permissionsPromise;
};

const accessControlProvider: AccessControlProvider = {
  can: async ({ resource }: CanParams): Promise<CanReturnType> => {
    const permissions = await getUserPermissions();
    
    if (permissions.has("*")) {
      return { can: true };
    }
    
    const canAccess = resource ? permissions.has(resource) : false;
    
    return {
      can: canAccess,
      reason: canAccess ? undefined : "No tienes permisos para esta acción.",
    };
  }
};

export default accessControlProvider;