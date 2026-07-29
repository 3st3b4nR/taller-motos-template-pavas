import {
  registerAPI, listUsersAPI, updateUserAPI
} from "api/requests/authAPI";

export const authService = {
  register: (payload) => registerAPI(payload).then((response) => response.data),
  listUsers: () => listUsersAPI().then((response) => response.data),
  updateUser: (id, payload) => updateUserAPI(id, payload).then((response) => response.data)
};
