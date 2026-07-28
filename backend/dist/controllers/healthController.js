export class HealthController {
    health = (_request, response) => {
        response.json({ success: true, data: { status: 'ok' } });
    };
}
