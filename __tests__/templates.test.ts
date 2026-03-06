// Mock the storage module
jest.mock("../lib/storage", () => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn(async (key: string) => store[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => { store[key] = value; }),
    deleteItem: jest.fn(async (key: string) => { delete store[key]; }),
    _clear: () => Object.keys(store).forEach((k) => delete store[k]),
  };
});

let getTemplates: any;
let saveTemplate: any;
let deleteTemplate: any;
let updateTemplate: any;

beforeEach(() => {
  jest.resetModules();
  // Re-apply mock after resetModules
  jest.mock("../lib/storage", () => {
    const store: Record<string, string> = {};
    return {
      getItem: jest.fn(async (key: string) => store[key] ?? null),
      setItem: jest.fn(async (key: string, value: string) => { store[key] = value; }),
      deleteItem: jest.fn(async (key: string) => { delete store[key]; }),
    };
  });
  const mod = require("../lib/templates");
  getTemplates = mod.getTemplates;
  saveTemplate = mod.saveTemplate;
  deleteTemplate = mod.deleteTemplate;
  updateTemplate = mod.updateTemplate;
});

describe("templates", () => {
  it("returns empty array when no templates", async () => {
    const result = await getTemplates();
    expect(result).toEqual([]);
  });

  it("saves and retrieves a template", async () => {
    const template = await saveTemplate({
      name: "Corte de pelo",
      amount: 3000,
      currency: "ARS",
      icon: "💇",
    });

    expect(template.id).toBeDefined();
    expect(template.name).toBe("Corte de pelo");
    expect(template.amount).toBe(3000);
    expect(template.createdAt).toBeDefined();

    const all = await getTemplates();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("Corte de pelo");
  });

  it("saves multiple templates", async () => {
    await saveTemplate({ name: "A", amount: 100, currency: "ARS" });
    await saveTemplate({ name: "B", amount: 200, currency: "BRL" });
    await saveTemplate({ name: "C", amount: 300, currency: "MXN" });

    const all = await getTemplates();
    expect(all).toHaveLength(3);
  });

  it("deletes a template by id", async () => {
    const t1 = await saveTemplate({ name: "Keep", amount: 100, currency: "ARS" });
    const t2 = await saveTemplate({ name: "Delete", amount: 200, currency: "ARS" });

    await deleteTemplate(t2.id);

    const all = await getTemplates();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("Keep");
  });

  it("updates a template", async () => {
    const t = await saveTemplate({ name: "Old", amount: 100, currency: "ARS" });

    await updateTemplate(t.id, { name: "New", amount: 500 });

    const all = await getTemplates();
    expect(all[0].name).toBe("New");
    expect(all[0].amount).toBe(500);
  });

  it("handles description and icon", async () => {
    const t = await saveTemplate({
      name: "Yoga",
      amount: 5000,
      currency: "ARS",
      description: "Clase grupal",
      icon: "🧘",
    });

    expect(t.description).toBe("Clase grupal");
    expect(t.icon).toBe("🧘");
  });
});
