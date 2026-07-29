import * as service from "./clients.service.js";

export const create = async (req, res, next) => {
  try { res.status(201).json(await service.create(req.body)); } catch (error) { next(error); }
};
export const list = async (req, res, next) => {
  try { res.json(await service.list(req.query.search)); } catch (error) { next(error); }
};
export const getById = async (req, res, next) => {
  try { res.json(await service.getById(req.params.id)); } catch (error) { next(error); }
};
