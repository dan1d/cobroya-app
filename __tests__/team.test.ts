import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock auth module
jest.mock("../lib/auth", () => ({
  getStoredToken: jest.fn().mockResolvedValue("APP_USR-test-token-12345"),
}));

let generateInviteCode: any;
let decodeInvite: any;
let decryptToken: any;
let getRole: any;
let setRole: any;
let getTeamMembers: any;
let addTeamMember: any;
let removeTeamMember: any;
let ROLE_PERMISSIONS: any;

beforeEach(() => {
  jest.resetModules();
  AsyncStorage.clear();

  // Re-mock after resetModules
  jest.mock("../lib/auth", () => ({
    getStoredToken: jest.fn().mockResolvedValue("APP_USR-test-token-12345"),
  }));

  const mod = require("../lib/team");
  generateInviteCode = mod.generateInviteCode;
  decodeInvite = mod.decodeInvite;
  decryptToken = mod.decryptToken;
  getRole = mod.getRole;
  setRole = mod.setRole;
  getTeamMembers = mod.getTeamMembers;
  addTeamMember = mod.addTeamMember;
  removeTeamMember = mod.removeTeamMember;
  ROLE_PERMISSIONS = mod.ROLE_PERMISSIONS;
});

describe("team invite flow", () => {
  it("generates and decodes invite code", async () => {
    const code = await generateInviteCode("cashier", "Mi Tienda", "1234");
    expect(typeof code).toBe("string");
    expect(code.length).toBeGreaterThan(10);

    const invite = decodeInvite(code);
    expect(invite.role).toBe("cashier");
    expect(invite.businessName).toBe("Mi Tienda");
    expect(invite.token).toBeDefined();
  });

  it("decrypts token with correct PIN", async () => {
    const code = await generateInviteCode("cashier", "Tienda", "5678");
    const invite = decodeInvite(code);
    const token = decryptToken(invite.token, "5678");
    expect(token).toBe("APP_USR-test-token-12345");
  });

  it("returns garbage with wrong PIN", async () => {
    const code = await generateInviteCode("cashier", "Tienda", "5678");
    const invite = decodeInvite(code);
    const token = decryptToken(invite.token, "0000");
    expect(token).not.toBe("APP_USR-test-token-12345");
  });

  it("throws on invalid invite code", () => {
    expect(() => decodeInvite("not-valid-base64!@#")).toThrow("invalido");
  });
});

describe("team roles", () => {
  it("defaults to owner", async () => {
    const role = await getRole();
    expect(role).toBe("owner");
  });

  it("saves and retrieves role", async () => {
    await setRole("cashier");
    const role = await getRole();
    expect(role).toBe("cashier");
  });
});

describe("team members", () => {
  it("returns empty array initially", async () => {
    const members = await getTeamMembers();
    expect(members).toEqual([]);
  });

  it("adds a member", async () => {
    const member = await addTeamMember("Juan", "cashier");
    expect(member.name).toBe("Juan");
    expect(member.role).toBe("cashier");
    expect(member.id).toBeDefined();

    const all = await getTeamMembers();
    expect(all).toHaveLength(1);
  });

  it("removes a member", async () => {
    const m1 = await addTeamMember("Juan", "cashier");
    await addTeamMember("Maria", "viewer");

    await removeTeamMember(m1.id);

    const all = await getTeamMembers();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("Maria");
  });
});

describe("ROLE_PERMISSIONS", () => {
  it("owner has all permissions", () => {
    expect(ROLE_PERMISSIONS.owner.canCharge).toBe(true);
    expect(ROLE_PERMISSIONS.owner.canRefund).toBe(true);
    expect(ROLE_PERMISSIONS.owner.canManageTeam).toBe(true);
  });

  it("cashier can charge but not refund or manage team", () => {
    expect(ROLE_PERMISSIONS.cashier.canCharge).toBe(true);
    expect(ROLE_PERMISSIONS.cashier.canViewPayments).toBe(true);
    expect(ROLE_PERMISSIONS.cashier.canRefund).toBe(false);
    expect(ROLE_PERMISSIONS.cashier.canManageTeam).toBe(false);
  });

  it("viewer can only view", () => {
    expect(ROLE_PERMISSIONS.viewer.canCharge).toBe(false);
    expect(ROLE_PERMISSIONS.viewer.canViewPayments).toBe(true);
    expect(ROLE_PERMISSIONS.viewer.canRefund).toBe(false);
    expect(ROLE_PERMISSIONS.viewer.canManageTeam).toBe(false);
    expect(ROLE_PERMISSIONS.viewer.canViewDashboard).toBe(true);
  });
});
