import * as authService from "./auth.service.js";

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.cookie("tokenTaller", result.accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const logout = (_req, res) => {
  res.clearCookie("tokenTaller");
  res.status(204).end();
};

export const me = (req, res) => res.json(authService.toPublicUser(req.user));

export const register = async (req, res, next) => {
  try { res.status(201).json(await authService.register(req.body)); } catch (error) { next(error); }
};
export const listUsers = async (_req, res, next) => {
  try { res.json(await authService.listUsers()); } catch (error) { next(error); }
};
export const updateUser = async (req, res, next) => {
  try { res.json(await authService.updateUser(req.params.id, req.body)); } catch (error) { next(error); }
};
