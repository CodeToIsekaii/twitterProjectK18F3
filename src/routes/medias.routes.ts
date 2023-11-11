import { Router } from 'express'
// import { uploadSingleImageController } from '~/controllers/medias.controllers'
import { wrapAsync } from '~/utils/handlers'
import { uploadImageController } from '~/controllers/medias.controllers'
import { access } from 'fs'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { verifyToken } from '~/utils/jwt'
const mediasRouter = Router()

mediasRouter.post('/upload-image', accessTokenValidator, verifiedUserValidator, wrapAsync(uploadImageController)) //uploadSingleImageController chưa làm

export default mediasRouter
