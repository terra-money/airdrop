import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export const errorHandler: ErrorRequestHandler = (
  error: any,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  if (error) {
    res.status(500);
    res.json({
      message: "Something unexpected occurred",
    });
    return;
  }
  next(error);
};
