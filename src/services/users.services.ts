import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken'
import { USERS_MESSAGES } from '~/constants/message'

class UsersService {
  //viết hàm nhận vào user_id để bỏ vào payload tạo access token
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
    })
  }
  //ký access và refresh token
  //anh ko cần async await vì hàm async bản chất nó dùng return ra 1 cái promise mà bây h cũng return Promise
  //nên ko cần async await
  private signAccessTokenAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }
  //viết hàm nhận vào user_id để bỏ vào payload tạo refesh token
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }
  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    //lấy user_id từ user mới tạo
    const user_id = result.insertedId.toString()
    const [access_token, refesh_token] = await this.signAccessTokenAndRefreshToken(user_id)
    //lưu refresh token vào database
    await databaseService.refreshToken.insertOne(
      new RefreshToken({
        token: refesh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return { access_token, refesh_token }
  }
  async login(user_id: string) {
    //dùng user_id tạo access và refresh token
    const [access_token, refesh_token] = await this.signAccessTokenAndRefreshToken(user_id)
    //lưu refresh token vào database
    await databaseService.refreshToken.insertOne(
      new RefreshToken({
        token: refesh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return { access_token, refesh_token }
  }
  async logout(refresh_token: string) {
    await databaseService.refreshToken.deleteOne({ token: refresh_token })
    return { message: USERS_MESSAGES.LOGOUT_SUCCESS }
  }
}

const usersService = new UsersService()
export default usersService
