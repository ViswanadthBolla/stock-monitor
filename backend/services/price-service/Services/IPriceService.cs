using price_service.Models;

namespace price_service.Services;

public interface IPriceService
{
    Task<PriceResponse?> GetPriceAsync(string symbol);
    IEnumerable<PriceHistoryPoint> GetHistory(string symbol);
}
