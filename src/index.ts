import express, { NextFunction, Response, Request } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
const app = express()
//app này đang đại diện cho ứng dụng của em mà 1 ứng dụng thì có rất nhiều api rất nhiều route
//nếu viết 100 cái route ở đây cũng đc nhưng bị rối , thường chia từng cái route ra vd những cái route liên quan user
//để riêng,route tweeter để riêng hay route refesh token để riêng
app.use(express.json())
const PORT = 3000
databaseService.connect()
//localhost:3000/
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/users', usersRouter)
//localhost:3000/users/register

app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`)
})
