using System.Collections.Generic;

namespace price_service.Services;

public interface IWatchlistService
{
    IEnumerable<string> GetAll();
    bool Add(string symbol);
    bool Remove(string symbol);
}
