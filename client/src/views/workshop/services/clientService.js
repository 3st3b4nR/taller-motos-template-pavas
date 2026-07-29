import api from "./api";

export const clientService = {
  list: (search) => api.get("/clients", { search }).then((response) => response.data),
  get: (id) => api.get(`/clients/${id}`).then((response) => response.data),
  create: (payload) => api.post("/clients", payload).then((response) => response.data)
};
