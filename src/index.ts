import express, { Request, Response, NextFunction } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
const app = express()
app.use(express.json())
// const usersRouter = express.Router() //lưu những route liên quan đến user //khai báo Router
const port = 3000
databaseService.connect()
//localhost:3000/
app.get('/', (req, res) => {
  res.send('hello world')
})
//app này đang đại diện cho ứng dụng của em mà 1 ứng dụng thì có rất nhiều api rất nhiều route
//nếu viết 100 cái route ở đây cũng đc nhưng bị rối , thường chia từng cái route ra vd những cái route liên quan user
//để riêng,route tweeter để riêng hay route refesh token để riêng

app.use('/users', usersRouter)
//localhost:3000/users/tweets

//error handler
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Project twitter này đang chạy trên post ${port}`)
})
