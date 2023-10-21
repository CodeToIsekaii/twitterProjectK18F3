import { Router } from 'express'
import { register } from 'module'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
const usersRouter = Router() //lưu những route liên quan đến user //khai báo Router
usersRouter.get('/login', loginValidator, loginController)
usersRouter.post('/register', registerValidator, registerController)
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
export default usersRouter
// vào trong file index.ts ta fix
