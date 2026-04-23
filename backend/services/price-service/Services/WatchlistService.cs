using System.Collections.Generic;

namespace price_service.Services;

public class WatchlistService : IWatchlistService
{
    private readonly HashSet<string> _symbols = new();

    public IEnumerable<string> GetAll() => _symbols;

    public bool Add(string symbol)
    {
        symbol = symbol.ToUpper();
        return _symbols.Add(symbol);
    }

    public bool Remove(string symbol)
    {
        symbol = symbol.ToUpper();
        return _symbols.Remove(symbol);
    }
}
