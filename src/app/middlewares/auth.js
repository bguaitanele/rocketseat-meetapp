import jwt from 'jsonwebtoken';
import authConfig from '../../config/auth';
import { promisify } from 'util';

export default async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: 'Not Authorized' });
  }

  try {
    const [, token] = authorization.split(' ');
    const { id } = await promisify(jwt.verify)(token, authConfig.secret);
    req.userId = id;
    console.info(`User ${id} connected`);
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Not Authorized' });
  }
};
