import { HttpStatus } from '@nestjs/common';
import { UrlCheckErrorMessage } from '../consts/url-check-errors.const';

export interface UrlCheckError {
    httpCode?: HttpStatus;
    message: UrlCheckErrorMessage;
}
