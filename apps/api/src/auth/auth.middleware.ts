import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly dataSource: DataSource) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const raw = req.cookies?.['better-auth.session_token'];
    const token = raw?.split('.')[0];
    if (token) {
      const rows = await this.dataSource.query(
        'SELECT "userId" FROM session WHERE token = $1 AND "expiresAt" > NOW()',
        [token],
      );
      if (rows.length > 0) {
        (req as any).user = { id: rows[0].userId };
      }
    }
    next();
  }
}
