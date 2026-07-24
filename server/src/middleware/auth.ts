import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

export interface AuthRequest extends Request {
  user?: { username: string }
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  const token = authHeader.split(' ')[1]
  const secret = process.env.JWT_SECRET || 'default-secret'

  try {
    const decoded = jwt.verify(token, secret) as { username: string }
    req.user = { username: decoded.username }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
