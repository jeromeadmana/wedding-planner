// For Android emulator use 10.0.2.2, for iOS simulator use localhost
export const API_BASE_URL = "http://localhost:3000/api";

export async function fetchGuests() {
  const res = await fetch(`${API_BASE_URL}/guests`);
  return res.json();
}

export async function fetchBudget() {
  const res = await fetch(`${API_BASE_URL}/budget`);
  return res.json();
}

export async function fetchVendors() {
  const res = await fetch(`${API_BASE_URL}/vendors`);
  return res.json();
}

export async function fetchTimeline() {
  const res = await fetch(`${API_BASE_URL}/timeline`);
  return res.json();
}
