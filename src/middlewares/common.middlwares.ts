import { Response, Request, NextFunction } from 'express'
import { pick } from 'lodash'
import { accessTokenValidator, updateMeValidator, verifiedUserValidator } from './users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.request'
import usersRouter from '~/routes/users.routes'
import { updateMeController } from '~/controllers/users.controllers'
import { wrapAsync } from '~/utils/handlers'
//ta đang dùng generic để khi dùng hàm filterMiddleware nó sẽ nhắc ta nên bỏ property nào vào mảng
//FilterKeys là mảng các key của object T nào đó
type FilterKeys<T> = Array<keyof T>

export const filterMiddleware =
  <T>(
    filterKey: FilterKeys<T> //T là kiểu dữ liệu chưa biết giống any
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKey)
    next()
  }
