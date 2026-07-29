import * as service from "./work-orders.service.js";

export const create = async (req, res, next) => {
  try { res.status(201).json(await service.create(req.body, req.user)); } catch (error) { next(error); }
};
export const list = async (req, res, next) => {
  try { res.json(await service.list(req.query)); } catch (error) { next(error); }
};
export const getById = async (req, res, next) => {
  try { res.json(await service.getById(req.params.id)); } catch (error) { next(error); }
};
export const updateStatus = async (req, res, next) => {
  try { res.json(await service.updateStatus(req.params.id, req.body, req.user)); } catch (error) { next(error); }
};
export const history = async (req, res, next) => {
  try { res.json(await service.history(req.params.id, req.query)); } catch (error) { next(error); }
};
export const addItem = async (req, res, next) => {
  try { res.status(201).json(await service.addItem(req.params.id, req.body)); } catch (error) { next(error); }
};
export const removeItem = async (req, res, next) => {
  try { res.json(await service.removeItem(req.params.itemId)); } catch (error) { next(error); }
};
