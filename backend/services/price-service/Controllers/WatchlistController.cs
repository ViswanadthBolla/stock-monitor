using Microsoft.AspNetCore.Mvc;
using price_service.Services;

namespace price_service.Controllers;

[ApiController]
[Route("watchlist")]
public class WatchlistController : ControllerBase
{
    private readonly IWatchlistService _watchlist;

    public WatchlistController(IWatchlistService watchlist)
    {
        _watchlist = watchlist;
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(_watchlist.GetAll());
    }

    [HttpPost("{symbol}")]
    public IActionResult Add(string symbol)
    {
        var added = _watchlist.Add(symbol);

        if (!added)
            return BadRequest("Already exists");

        return Ok();
    }

    [HttpDelete("{symbol}")]
    public IActionResult Remove(string symbol)
    {
        var removed = _watchlist.Remove(symbol);

        if (!removed)
            return NotFound();

        return Ok();
    }
}
