import { HttpStatus } from '@nestjs/common';

export const isFailedCode = (code: HttpStatus): boolean =>
    code >= HttpStatus.BAD_REQUEST && code <= HttpStatus.LOOP_DETECTED;
