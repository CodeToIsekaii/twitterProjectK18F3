import express, { NextFunction, Response, Request } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv' //vì xài process nên nhớ import cái này
import { UPLOAD_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
config()

const app = express()
//app này đang đại diện cho ứng dụng của em mà 1 ứng dụng thì có rất nhiều api rất nhiều route
//nếu viết 100 cái route ở đây cũng đc nhưng bị rối , thường chia từng cái route ra vd những cái route liên quan user
//để riêng,route tweeter để riêng hay route refesh token để riêng
const PORT = process.env.PORT || 4000 //server chay trên post 4000// server là nơi giao tiếp với database, xử lý các tính năng
app.use(express.json())
initFolder()
databaseService.connect()
//localhost:4000/
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/users', usersRouter) //localhost:4000/users/register
app.use('/medias', mediasRouter) //route handler
// app.use('/static', express.static(UPLOAD_DIR)) //nếu muốn thêm tiền tố, ta sẽ làm thế này
app.use('/static', staticRouter)

app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`)
})
