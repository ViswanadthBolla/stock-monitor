namespace price_service.Models;

public class PriceResponse
{
    public required string  Symbol { get; set; }
    public decimal Price { get; set; }
}