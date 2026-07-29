import api from "./api";

export const bikeService = {
  list: (plate) => api.get("/bikes", { plate }).then((response) => response.data),
  get: (id) => api.get(`/bikes/${id}`).then((response) => response.data),
  create: (payload) => api.post("/bikes", payload).then((response) => response.data)
};
