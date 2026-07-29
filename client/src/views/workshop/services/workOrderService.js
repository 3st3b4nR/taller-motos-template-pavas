import api from "./api";

export const workOrderService = {
  list: (params) => api.get("/work-orders", params).then((response) => response.data),
  get: (id) => api.get(`/work-orders/${id}`).then((response) => response.data),
  create: (payload) => api.post("/work-orders", payload).then((response) => response.data),
  updateStatus: (id, status, note) =>
    api.patch(`/work-orders/${id}/status`, { status, note }).then((response) => response.data),
  addItem: (id, payload) =>
    api.post(`/work-orders/${id}/items`, payload).then((response) => response.data),
  deleteItem: (itemId) =>
    api.delete(`/work-orders/items/${itemId}`).then((response) => response.data),
  getHistory: (id, params) =>
    api.get(`/work-orders/${id}/history`, params).then((response) => response.data)
};
