import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;

    const now = Date.now();

    console.log(`[Request] ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const status = res.statusCode;

        console.log(
          `[Response] ${method} ${url} ${status} - ${Date.now() - now}ms`,
        );
      }),
    );
  }
}