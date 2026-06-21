import { HttpStatus } from '@nestjs/common';
import { UrlCheckStatus } from '../consts/url-check-status.const';

export class GetUrlChecksInfoDto {
    url!: string;
    status!: UrlCheckStatus;
    httpCode?: HttpStatus;
    errorMessage?: string;
    startedAt?: Date;
    endedAt?: Date;
    duration?: number;
}
