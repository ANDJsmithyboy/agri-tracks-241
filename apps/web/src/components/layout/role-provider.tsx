"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_ROLE, ROLES, type Role } from "@/lib/roles";

const STORAGE_KEY = "poufa-role";

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  /** true tant que le rôle effectif n'est pas confirmé (preview dev). */
  isPreview: boolean;
};

const RoleContext = createContext<RoleContextValue | null>(null);

function isRole(value: string | null): value is Role {
  return value !== null && (ROLES as readonly string[]).includes(value);
}

/**
 * Sélecteur de rôle temporaire — en attendant Clerk.
 * La vraie autorisation sera imposée par le backend ; ce contexte ne fait
 * que prévisualiser la navigation par rôle pendant le design/dev.
 */
export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(DEFAULT_ROLE);
  const [isPreview, setIsPreview] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isRole(stored)) setRoleState(stored);
  }, []);

  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    setIsPreview(true);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole, isPreview }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole doit être utilisé dans <RoleProvider>");
  return ctx;
}
