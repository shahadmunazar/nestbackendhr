import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetBox = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.box;
    },
);

export const GetBoxUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.box_user;
    },
);
