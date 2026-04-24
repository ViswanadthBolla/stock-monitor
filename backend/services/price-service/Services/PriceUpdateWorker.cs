using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.SignalR;

namespace price_service.Services;

public class PriceUpdateWorker : BackgroundService
{
    private readonly IWatchlistService _watchlist;
    private readonly PriceService _priceService;
    private readonly IHubContext<PriceHub> _hub;

    public PriceUpdateWorker(
        IWatchlistService watchlist,
        PriceService priceService,
        IHubContext<PriceHub> hub)
    {
        _watchlist = watchlist;
        _priceService = priceService;
        _hub = hub;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var symbols = _watchlist.GetAll();

            _priceService.UpdatePrices(symbols);

            foreach (var symbol in symbols)
            {
                var price = await _priceService.GetPriceAsync(symbol);
                await _hub.Clients.All.SendAsync("priceUpdate", price);
            }

            await Task.Delay(3000, stoppingToken);
        }
    }
}
