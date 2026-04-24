using price_service.Models;

namespace price_service.Services;

public class PriceService : IPriceService
{
    private static readonly Dictionary<string, PriceResponse> _cache = new();
    private static readonly Dictionary<string, List<PriceHistoryPoint>> _history = new();
    private static readonly Random _random = new();

    public Task<PriceResponse?> GetPriceAsync(string symbol)
    {
        symbol = symbol.ToUpper();

        if (!_cache.ContainsKey(symbol))
        {
            var basePrice = _random.Next(100, 1000);

            _cache[symbol] = new PriceResponse
            {
                Symbol = symbol,
                Price = basePrice
            };
        }

        return Task.FromResult<PriceResponse?>(_cache[symbol]);
    }

    public void UpdatePrices(IEnumerable<string> symbols)
    {
        foreach (var symbol in symbols)
        {
            if (!_cache.ContainsKey(symbol)) continue;

            var current = _cache[symbol];

            var change = (decimal)(_random.NextDouble() * 4 - 2);

            current.Price = Math.Round(current.Price + change, 2);

            _cache[symbol] = current;

            if (!_history.ContainsKey(symbol))
            {
                _history[symbol] = new List<PriceHistoryPoint>();
            }

            _history[symbol].Add(new PriceHistoryPoint
            {
                Time = DateTime.UtcNow,
                Price = current.Price
            });

            if (_history[symbol].Count > 50)
            {
                _history[symbol].RemoveAt(0);
            }
        }
    }

    public IEnumerable<PriceHistoryPoint> GetHistory(string symbol)
    {
        symbol = symbol.ToUpper();

        if (!_history.ContainsKey(symbol))
            return new List<PriceHistoryPoint>();

        return _history[symbol];
    }
}
