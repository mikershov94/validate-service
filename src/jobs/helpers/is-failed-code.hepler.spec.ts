import { HttpStatus } from '@nestjs/common';
import { isFailedCode } from './is-failed-code.helper';

describe('isFailedCode', () => {
    it('функция возвращает true при 4**-5** кодах', () => {
        expect(isFailedCode(HttpStatus.NOT_FOUND)).toBeTruthy();
        expect(isFailedCode(HttpStatus.BAD_GATEWAY)).toBeTruthy();
    });

    it('функция возвращает false в остальных случаях', () => {
        expect(isFailedCode(HttpStatus.OK)).toBeFalsy();
        expect(isFailedCode(HttpStatus.TEMPORARY_REDIRECT)).toBeFalsy();
    });
});
