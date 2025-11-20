import api from "./client";

export async function listAlerts() {
  const res = await api.get("/alerts");
  return res.data;
}

export async function createAlert(payload) {
  const res = await api.post("/alerts", payload);
  return res.data;
}

export async function evaluateAlerts() {
  const res = await api.post("/alerts/evaluate");
  return res.data;
}

export async function getAlertsStatus() {
  const res = await api.get("/alerts/status");
  return res.data;
}

export async function deleteAlert(id) {
  const res = await api.delete(`/alerts/${id}`);
}
