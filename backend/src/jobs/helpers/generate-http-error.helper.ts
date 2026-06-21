import { HttpStatus } from '@nestjs/common';
import { UrlCheckErrorMessage } from '../consts/url-check-errors.const';

export const generateHttpError = (code: HttpStatus): UrlCheckErrorMessage | undefined => {
    if (code >= HttpStatus.BAD_REQUEST && code <= HttpStatus.UNRECOVERABLE_ERROR) {
        return UrlCheckErrorMessage.CLIENT_ERROR;
    }

    if (code >= HttpStatus.INTERNAL_SERVER_ERROR && code <= HttpStatus.LOOP_DETECTED) {
        return UrlCheckErrorMessage.SERVER_ERROR;
    }
};
