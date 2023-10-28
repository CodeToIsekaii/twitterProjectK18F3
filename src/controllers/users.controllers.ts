import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import { RegisterReqBody } from '~/models/requests/User.request'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { error } from 'console'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/message'
export const loginController = async (req: Request, res: Response) => {
  //nếu nó vào đc đây, tức là nó đã đăng nhập thành công
  const user = req.user as User
  const user_id = user._id as ObjectId //ObjectId
  //server phải tạo ra access_token và refresh_token để đưa cho client
  const result = await usersService.login(user_id.toString()) //
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)

  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}
// res.status(400).json({
//   message: 'Register failed',
//   error
// })
