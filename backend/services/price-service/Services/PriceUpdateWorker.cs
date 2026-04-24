using Microsoft.Extensions.Hosting;

namespace price_service.Services;

public class PriceUpdateWorker : BackgroundService
{
    private readonly IWatchlistService _watchlist;
    private readonly PriceService _priceService;

    public PriceUpdateWorker(IWatchlistService watchlist, PriceService priceService)
    {
        _watchlist = watchlist;
        _priceService = priceService;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var symbols = _watchlist.GetAll();

            _priceService.UpdatePrices(symbols);

            await Task.Delay(3000, stoppingToken);
        }
    }
}
