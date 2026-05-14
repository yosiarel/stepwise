import { JwtAccessPayload } from './auth.ts';

declare global {
  namespace Express {
    interface Request {
      user?: JwtAccessPayload;
    }
  }
}
