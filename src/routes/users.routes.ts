import { Router } from 'express'
import { access } from 'fs'
import { register } from 'module'
import {
  emailVerifyController,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyForgotpasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'
const usersRouter = Router() //lưu những route liên quan đến user //khai báo Router
usersRouter.get('/login', loginValidator, wrapAsync(loginController))
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
