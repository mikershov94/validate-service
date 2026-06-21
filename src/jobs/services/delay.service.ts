import { Injectable } from '@nestjs/common';

@Injectable()
export class DelayService {
    public async wait(minDelayMs = 0, maxDelayMs = 10000): Promise<void> {
        const delayMs = Math.floor(Math.random() * (maxDelayMs - minDelayMs + 1)) + minDelayMs;

        await new Promise<void>((resolve) => {
            setTimeout(resolve, delayMs);
        });
    }
}
