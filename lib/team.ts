import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStoredToken } from "./auth";

const TEAM_KEY = "cobroya_team";
const ROLE_KEY = "cobroya_role";

export type TeamRole = "owner" | "cashier" | "viewer";

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  addedAt: string;
}

export interface TeamInvite {
  token: string; // encrypted MP token
  role: TeamRole;
  businessName: string;
  pin: string;
}

// Simple XOR-based obfuscation with PIN (not military-grade, but prevents casual token exposure)
function xorEncrypt(text: string, pin: string): string {
  const result: number[] = [];
  for (let i = 0; i < text.length; i++) {
    result.push(text.charCodeAt(i) ^ pin.charCodeAt(i % pin.length));
  }
  // Convert to base64-safe string
  return btoa(String.fromCharCode(...result));
}

function xorDecrypt(encoded: string, pin: string): string {
  const decoded = atob(encoded);
  const result: number[] = [];
  for (let i = 0; i < decoded.length; i++) {
    result.push(decoded.charCodeAt(i) ^ pin.charCodeAt(i % pin.length));
  }
  return String.fromCharCode(...result);
}

export async function generateInviteCode(
  role: TeamRole,
  businessName: string,
  pin: string
): Promise<string> {
  const token = await getStoredToken();
  if (!token) throw new Error("No token found");

  const invite: TeamInvite = {
    token: xorEncrypt(token, pin),
    role,
    businessName,
    pin: "", // PIN is NOT included in the invite
  };

  return btoa(JSON.stringify(invite));
}

export function decodeInvite(code: string): Omit<TeamInvite, "pin"> {
  try {
    const decoded = JSON.parse(atob(code));
    return {
      token: decoded.token,
      role: decoded.role,
      businessName: decoded.businessName,
    };
  } catch {
    throw new Error("Codigo de invitacion invalido");
  }
}

export function decryptToken(encryptedToken: string, pin: string): string {
  return xorDecrypt(encryptedToken, pin);
}

export async function getRole(): Promise<TeamRole> {
  const role = await AsyncStorage.getItem(ROLE_KEY);
  return (role as TeamRole) || "owner";
}

export async function setRole(role: TeamRole): Promise<void> {
  await AsyncStorage.setItem(ROLE_KEY, role);
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const raw = await AsyncStorage.getItem(TEAM_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function addTeamMember(name: string, role: TeamRole): Promise<TeamMember> {
  const members = await getTeamMembers();
  const member: TeamMember = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    role,
    addedAt: new Date().toISOString(),
  };
  members.push(member);
  await AsyncStorage.setItem(TEAM_KEY, JSON.stringify(members));
  return member;
}

export async function removeTeamMember(id: string): Promise<void> {
  const members = await getTeamMembers();
  const filtered = members.filter((m) => m.id !== id);
  await AsyncStorage.setItem(TEAM_KEY, JSON.stringify(filtered));
}

export const ROLE_PERMISSIONS: Record<TeamRole, { canCharge: boolean; canViewPayments: boolean; canRefund: boolean; canManageTeam: boolean; canViewDashboard: boolean }> = {
  owner: { canCharge: true, canViewPayments: true, canRefund: true, canManageTeam: true, canViewDashboard: true },
  cashier: { canCharge: true, canViewPayments: true, canRefund: false, canManageTeam: false, canViewDashboard: false },
  viewer: { canCharge: false, canViewPayments: true, canRefund: false, canManageTeam: false, canViewDashboard: true },
};
