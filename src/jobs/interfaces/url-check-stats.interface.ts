import { HttpStatus } from '@nestjs/common';

export interface UrlCheckStats {
    httpCode?: HttpStatus;
    endedAt: Date;
    duration: number;
}
