import User from './models/schemas/User.schema'
import { Request } from 'express'
//file này dùng để dĩnh nghĩa lại những thuộc tính những cái có sẵn
declare module 'express' {
  interface Request {
    user?: User
  }
}
