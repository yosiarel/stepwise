import { JwtAccessPayload } from '../../types/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtAccessPayload;
    }
  }
}
