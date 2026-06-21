import { UrlCheckErrorMessage } from '../consts/url-check-errors.const';
import { UrlCheckerService } from './url-checker.service';

describe('UrlCheckerService', () => {
    let service: UrlCheckerService;
    let fetchMock: jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
        service = new UrlCheckerService();

        fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
        global.fetch = fetchMock;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('должен быть определен', () => {
        expect(service).toBeDefined();
    });

    it('check должен отправлять HEAD-запрос', async () => {
        fetchMock.mockResolvedValue({
            status: 200,
        } as Response);

        await service.check('https://example.com');

        expect(fetch).toHaveBeenCalledWith('https://example.com', {
            method: 'HEAD',
        });
    });

    it('check должен возвращать код ответа', async () => {
        fetchMock.mockResolvedValue({
            status: 200,
        } as Response);

        let status = await service.check('https://example.com');
        expect(status).toBe(200);

        fetchMock.mockResolvedValue({
            status: 404,
        } as Response);

        status = await service.check('https://example.com');
        expect(status).toBe(404);
    });

    it('check должен выбрасывать ошибку сети', async () => {
        fetchMock.mockRejectedValue(new Error(UrlCheckErrorMessage.DEFAULT));

        await expect(service.check('https://example.com')).rejects.toThrow(
            UrlCheckErrorMessage.DEFAULT,
        );
    });
});
