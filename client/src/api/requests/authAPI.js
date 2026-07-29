import httpCliente from "../services/httpCliente";

export const loginAPI = (credentials) => httpCliente.post("/auth/login", credentials);
export const logoutAPI = () => httpCliente.post("/auth/logout");
export const verifyTokenAPI = () => httpCliente.get("/auth/me");
export const registerAPI = (payload) => httpCliente.post("/auth/register", payload);
export const listUsersAPI = () => httpCliente.get("/auth/users");
export const updateUserAPI = (id, payload) => httpCliente.patch(`/auth/users/${id}`, payload);
