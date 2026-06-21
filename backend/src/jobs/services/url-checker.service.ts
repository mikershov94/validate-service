import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class UrlCheckerService {
    public async check(url: string): Promise<HttpStatus> {
        const response = await fetch(url, { method: 'HEAD' });

        return response.status;
    }
}
