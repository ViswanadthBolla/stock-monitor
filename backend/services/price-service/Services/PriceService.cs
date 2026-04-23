using price_service.Models;

namespace price_service.Services;

public class PriceService : IPriceService
{
    private static readonly Dictionary<string, decimal> _prices = new();
    private static readonly Random _random = new();

    public Task<PriceResponse?> GetPriceAsync(string symbol)
    {
        symbol = symbol.ToUpper();

        if (!_prices.ContainsKey(symbol))
        {
            _prices[symbol] = _random.Next(100, 1000);
        }

        var change = (decimal)(_random.NextDouble() * 4 - 2);

        _prices[symbol] += change;

        return Task.FromResult<PriceResponse?>(new PriceResponse
        {
            Symbol = symbol,
            Price = Math.Round(_prices[symbol], 2)
        });
    }
}
