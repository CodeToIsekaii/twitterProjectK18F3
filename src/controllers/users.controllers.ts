import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { ErrorWithStatus } from '~/models/Errors'
import { ObjectId } from 'mongodb'
import {
  ChangePasswordReqBody,
  FollowReqBody,
  GetProfileReqParams,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  TokenPayload,
  UnfollowReqParams,
  UpdateMeReqBody,
  resetPasswordReqBody
} from '~/models/requests/User.request'
import { USERS_MESSAGES } from '~/constants/message'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { result } from 'lodash'
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  //nếu nó vào đc đây, tức là nó đã đăng nhập thành công
  const user = req.user as User
  const user_id = user._id as ObjectId
  //server phải tạo ra access_token và refresh_token để đưa cho client
  const result = await usersService.login({
    user_id: user_id.toString(),
    verify: user.verify
  }) //login
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

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  // lấy refresh_token từ req.body
  const { refresh_token } = req.body
  //logout: vào database xóa refresh_token này
  const result = await usersService.logout(refresh_token)
  res.json(result)
}

export const emailVerifyController = async (req: Request, res: Response) => {
  //kiểm tra user này đã verify hay chưa
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = req.user as User
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  //NẾU MÀ XUỐNG ĐC ĐÂY NGHĨ LÀ USER NÀY CHƯA VERIFY, CHƯA BỊ BANNED, VÀ KHỚP MÃ
  //MÌNH TIẾN HÀNH UPDATE:verify:1,xóa email_verify_token, update_at
  const result = await usersService.verifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  //nếu code vào đc đây nghĩa là đã đi qua đc tầng accessTokenValidator
  //trong req đã có decoded_authorization
  const { user_id } = req.decoded_authorization as TokenPayload
  //lấy user từ database
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  //nếu cố kiể tra xem thằng này bị banned chưa
  if (user.verify === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USDER_BANNED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }
  //user đã có verify chưa?
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  //nếu chưa verify thì tiến hành update cho user mã mới
  const result = await usersService.resendEmailVerify(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  //lấy user_id từ req.user
  const { _id, verify } = req.user as User
  //tiến hành update lại forgot_password_token
  const result = await usersService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })
  return res.json(result)
}

export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, resetPasswordReqBody>,
  res: Response
) => {
  //muốn cập nhật mật khẩu mới thì cần user_id và password mới
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  //khi nào đề cập đến body thì mới định nghĩa
  const { password } = req.body
  //cập nhật password mói cho user có user_id này
  const result = await usersService.resetPassword({ user_id, password })
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  //muốn lấy thông tin của user thì cần user_id
  const { user_id } = req.decoded_authorization as TokenPayload
  //tiến hành vào database tìm và lấy thông tin user
  const user = await usersService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result: user
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  //muốn update thoongtin của 1 user thì cần user_id, và những thông tin người ta muốn update
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  //giờ mình sẽ update user thông qua user_id này với body đc cho
  const result = await usersService.updateMe(user_id, body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result
  })
}

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response) => {
  //muốn lấy thoogn tin của user thì cần username
  const { username } = req.params
  //tiến hành vào database tìm và lấy thông tin user
  const user = await usersService.getProfile(username)
  return res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    result: user
  })
}
//usersService.getPorfile(username) nhận vào username tìm và return ra ngoài, hàm này chưa viết giờ ta sẽ viết

export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>, //đầu tiên định nghĩa lại FollowReqBody vì trong này lấy ra user_id và followed_user_id và thứ 2 phải tạo table follow
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload //lấy user_id từ decoded_authorization của access_token
  const { followed_user_id } = req.body //lấy followed_user_id từ req.body
  const result = await usersService.follow(user_id, followed_user_id) //nhận 2 giá trị tạo document trong table follower //chưa có method này
  return res.json(result)
}

export const unfollowController = async (req: Request<UnfollowReqParams>, res: Response, next: NextFunction) => {
  //anh là ai và muốn unfollow ai, lấy ra user_id người mún thực hiện hành động unfolloư
  const { user_id } = req.decoded_authorization as TokenPayload //lấy user_id từ decoded_authorization của access_token(người unfollow)
  // lấy ra người mình muốn unfollow        //vì đã sử dụng params nên cần định nghĩa lại cái params đó
  const { user_id: followed_user_id } = req.params //lấy user_id từ req.params là user_id của người mà ngta muốn unfollow(người bị unfollow)
  //gọi hàm unfollow
  const result = await usersService.unfollow(user_id, followed_user_id) //unfollow chưa làm
  return res.json(result)
}

//muốn đổi mật khẩu cần user_id người mình muốn đổi và password mới mà mình muốn đổi
export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>, //nằm thứ ba vì để chuột vô trong Request ,ReqBody nằm thứ ba
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload //lấy user_id từ decoded_authorization của access_token
  const { password } = req.body //lấy old_password và password từ req.body  //lỡ xài body ròi thì lát nhớ đĩnh nghĩa lại Request
  const result = await usersService.changePassword(user_id, password) //chưa code changePassword
  return res.json(result)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>, //body nên ở vị tí thứ 3
  res: Response,
  next: NextFunction
) => {
  // khi qua middleware refreshTokenValidator thì ta đã có decoded_refresh_token
  //chứa user_id và token_type
  //ta sẽ lấy user_id để tạo ra access_token và refresh_token mới
  const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload //lấy refresh_token từ req.body //tạo ra token mới, mã của người cấp token mới và trạng thái của account đó
  const { refresh_token } = req.body //lát nhớ đĩnh nghĩa body //giúp tìm document và xóa
  const result = await usersService.refreshToken({ user_id, refresh_token, verify, exp }) //refreshToken chưa code //{}này do user.services tạo object
  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS, //message.ts thêm  REFRESH_TOKEN_SUCCESS: 'Refresh token success',
    result
  })
}

export const oAuthController = async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.query // lấy code từ query params
  //tạo đường dẫn truyền thông tin result để sau khi họ chọn tại khoản, ta check (tạo | login) xong thì điều hướng về lại client kèm thông tin at và rf
  const { access_token, refresh_token, new_user } = await usersService.oAuth(code as string)
  //truyền ngược đường dẫn này cho client, mình gửi cho nó access refress và trạng thái để nó lưu lại
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${access_token}&refresh_token=${refresh_token}&new_user=${new_user}`
  return res.redirect(urlRedirect)
}
