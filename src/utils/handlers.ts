import { NextFunction, RequestHandler, Request, Response } from 'express'
//<P>viết tắt từ param nghĩa là tao sẽ định nghĩa m có kiểu dữ liệu tên là P còn P là gì đừng quan tâm
export const wrapAsync = <P>(func: RequestHandler<P>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
