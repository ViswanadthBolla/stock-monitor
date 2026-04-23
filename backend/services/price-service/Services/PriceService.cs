using System.Text.Json;
using price_service.Models;

namespace price_service.Services;

public class PriceService : IPriceService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public PriceService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["AlphaVantage:ApiKey"] ?? string.Empty;
    }

    public async Task<PriceResponse?> GetPriceAsync(string symbol)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
                return null;

            var url = $"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={_apiKey}";

            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
                return null;

            var content = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(content);

            var globalQuote = doc.RootElement.GetProperty("Global Quote");

            if (!globalQuote.TryGetProperty("05. price", out var priceElement))
                return null;

            var price = decimal.Parse(priceElement.GetString()!);

            return new PriceResponse
            {
                Symbol = symbol,
                Price = price
            };
        }
        catch
        {
            return null;
        }
    }
}
