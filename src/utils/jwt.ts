import { rejects } from 'assert'
import jwt from 'jsonwebtoken'
import { resolve } from 'path'
import { config } from 'dotenv'
import { error } from 'console'
import { decode } from 'punycode'
import { TokenPayload } from '~/models/requests/User.request'
export const signToken = ({
  payload,
  privateKey,
  options = { algorithm: 'HS256' }
}: {
  payload: string | object | Buffer
  privateKey: string
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) reject(err)
      resolve(token as string)
    })
  })
}

export const verifyToken = ({ token, secretOrPublicKey }: { token: string; secretOrPublicKey: string }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (err, decode) => {
      if (err) throw reject(err)
      resolve(decode as TokenPayload)
    })
  })
}
