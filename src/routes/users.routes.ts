import { Router } from 'express'
import { access } from 'fs'
import { register } from 'module'
import {
  changePasswordController,
  emailVerifyController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  oAuthController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlwares'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotpasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.request'
import { wrapAsync } from '~/utils/handlers'
const usersRouter = Router() //lưu những route liên quan đến user //khai báo Router
usersRouter.post('/login', loginValidator, wrapAsync(loginController)) //post nhận đc body ,get ko nhận đc body
usersRouter.post('/register', registerValidator, wrapAsync(registerController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

/*
  des: verify emal
  method: post
  path: /users/verify-email?
  body:{
    email_verify_token: string
  }
*/
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyController))

/*
  des: resend verify email
  method:post
  path:/users/resend-verify-email
  header:{Authorization:"Bear access_token"}
*/
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

/*
  des: forgot password
  method: post
  path: /users/forgot-password
  body:{
    email:string
  }
*/
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/*
  des: verify forgot password
  method:post
  path:/users/verify-forgot-password
  body:{
    forgot_password_token:string
  }
*/
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotpasswordTokenValidator,
  wrapAsync(verifyForgotPasswordTokenController)
)

/*
des: reset password
path: '/reset-password'
method: POST
Header: không cần, vì  ngta quên mật khẩu rồi, thì sao mà đăng nhập để có authen đc
body: {forgot_password_token: string, password: string, confirm_password: string}
*/
usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  verifyForgotpasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

/*
des: get profile của user
path: '/me'
method: get
Header: {Authorization: Bearer <access_token>}
body: {}
*/
usersRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))

usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'avatar',
    'username',
    'cover_photo'
  ]),
  updateMeValidator,
  wrapAsync(updateMeController)
)

/*
des: get profile của user khác bằng unsername
path: '/:username'
method: get
không cần header vì, chưa đăng nhập cũng có thể xem
*/
usersRouter.get('/:username', wrapAsync(getProfileController))
//chưa có controller getProfileController, nên bây giờ ta làm

/*
des: Follow someone
path: '/follow'
method: post
headers: {Authorization: Bearer <access_token>} //truyền lên access token(vì mún follow người khác 
thì hệ thống phải biết bạn là ai thì mới đc quyền follow ngườ khác)
body: {followed_user_id: string} //mã của người mà mình mún follow
*/
usersRouter.post('/follow', accessTokenValidator, verifiedUserValidator, followValidator, wrapAsync(followController))
//accessTokenValidator dùng dể kiểm tra xem ngta có đăng nhập hay chưa, và có đc user_id của người dùng từ req.decoded_authorization
//verifiedUserValidator dùng để kiễm tra xem ngta đã verify email hay chưa, rồi thì mới cho follow người khác
//trong req.body có followed_user_id  là mã của người mà ngta muốn follow
//followValidator: kiểm tra followed_user_id truyền lên có đúng định dạng objectId hay không
//  account đó có tồn tại hay không
//followController: tiến hành thao tác tạo document vào collection followers
/*
 user 34 654bb437724ba2ab1a2d62f7
 user 35 654bb55409e90703d8c740ed
*/

/*
    des: Unfollow someone
    path: '/unfollow/:user_id'  //vì method delete nên ko cho truyền qua body, phải truyền qua đường dẫn
    method: delete
    headers: {Authorization: Bearer <access_token>} vì phải biết nó là ai mới truyền lên
 */
usersRouter.delete(
  '/unfollow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator, //middlware để kiểm tra cái param
  wrapAsync(unfollowController)
)
//unfollowValidator: kiểm tra user_id truyền qua params có hợp lệ hay k?

/*
  des: change password
  path: '/change-password'
  method: PUT  //đổi mật khẩu là cập nhật thông tin thì có thể dùng put hoặc path
  headers: {Authorization: Bearer <access_token>} //đăng nhập thì mới cho đổi
  Body: {old_password: string, password: string, confirm_password: string}
g}
  */
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapAsync(changePasswordController)
)
//changePasswordValidator kiểm tra các giá trị truyền lên trên body có valid k ?

/*
  des: refreshtoken
  path: '/refresh-token'
  method: POST
  Body: {refresh_token: string}
g}
  */
usersRouter.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))
//khỏi kiểm tra accesstoken, tại nó hết hạn rồi thì mới thì mới xài chức năng này lấy accesstoken mới, hết hạn thì kt j nữa
//refreshTokenController chưa làm

//tạo route /oauth/google
usersRouter.get('/oauth/google', wrapAsync(oAuthController))

export default usersRouter

// vào trong file index.ts ta fix
// //middleware demo (nhạn 3 cái)
// usersRouter.use(
//   (req, res, next) => {
//     console.log('Time: ', Date.now())
//     next() //ok mày đc phép đi tiếp , ko có next thì ko đc xuống
//     // res.status(400).send('not allowed')
//     // console.log(12345) vẫn chạy
//   },
//   (req, res, next) => {
//     console.log('Time 2: ', Date.now())
//     next()
//   }
// )

//viết  1 route giúp get data /tweets
//controller ,router (nhận 2 cái)
// usersRouter.get('/login', loginValidator, (req, res) => {
//   res.json({ trả về đóng dữ liệu json cơ bản
//     data: [
//       { fname: 'Điệp', yob: 1999 },dữ liệu là object chứa data
//       { fname: 'Hùng', yob: 2003 },
//       { fname: 'Được', yob: 1994 }
//     ]
//   })
// }) cái này giống như 1 cái hàm zậy nên em viết zậy là chưa xài đc, mà ai là người xài cái hàm này thằng app là thằng xài bộ route này
