export class HealthService {
    getHealthStatus() {
        return {
            success: true,
            message: "Zussgo Backend is healthy",
        };
    }
}