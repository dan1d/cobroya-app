const store: Record<string, string> = {};

export const getItem = jest.fn(async (key: string) => store[key] ?? null);
export const setItem = jest.fn(async (key: string, value: string) => {
  store[key] = value;
});
export const deleteItem = jest.fn(async (key: string) => {
  delete store[key];
});
export const clearStore = () => {
  Object.keys(store).forEach((key) => delete store[key]);
  getItem.mockClear();
  setItem.mockClear();
  deleteItem.mockClear();
};
