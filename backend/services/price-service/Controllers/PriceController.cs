using Microsoft.AspNetCore.Mvc;
using price_service.Services;

namespace price_service.Controllers;

[ApiController]
[Route("price")]
public class PriceController : ControllerBase
{
    private readonly IPriceService _priceService;

    public PriceController(IPriceService priceService)
    {
        _priceService = priceService;
    }

    [HttpGet("{symbol}")]
    public async Task<IActionResult> GetPrice(string symbol)
    {
        var result = await _priceService.GetPriceAsync(symbol);

        if (result == null)
            return NotFound("Invalid symbol or data unavailable");

        return Ok(result);
    }
}