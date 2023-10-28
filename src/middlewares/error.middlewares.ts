import { error } from 'console'
import { NextFunction, Response, Request } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  //đây là nơi tất cả lỗi trên toàn bộ hệ thống sẽ dồn về đây
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ['status']))
  }
  //nếu ko lọt vào if ở trên thì tức là error này là lỗi mặc định
  //name,message, stack mà 3 thẰNG NÀY CÓ ENUMERABLE là false nên chạy for ko duyệt đc nó
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfor: omit(err, ['stack'])
  })
}
