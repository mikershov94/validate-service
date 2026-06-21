import { HttpStatus } from '@nestjs/common';
import { generateHttpError } from './generate-http-error.helper';
import { UrlCheckErrorMessage } from '../consts/url-check-errors.const';

describe('generateHttpError', () => {
    it('функция возвращает ClientError при 4** кодах', () => {
        expect(generateHttpError(HttpStatus.NOT_FOUND)).toBe(UrlCheckErrorMessage.CLIENT_ERROR);
        expect(generateHttpError(HttpStatus.BAD_REQUEST)).toBe(UrlCheckErrorMessage.CLIENT_ERROR);
    });

    it('функция возвращает ServerError при 5** кодах', () => {
        expect(generateHttpError(HttpStatus.BAD_GATEWAY)).toBe(UrlCheckErrorMessage.SERVER_ERROR);
        expect(generateHttpError(HttpStatus.GATEWAY_TIMEOUT)).toBe(
            UrlCheckErrorMessage.SERVER_ERROR,
        );
    });

    it('функция возвращает undefined в остальных случаях', () => {
        expect(generateHttpError(HttpStatus.OK)).not.toBeDefined();
    });
});
