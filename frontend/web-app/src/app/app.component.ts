import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { interval } from 'rxjs';

interface WatchlistItem {
  symbol: string;
  price: number;
  previousPrice: number;
  loading: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly http = inject(HttpClient);
  private readonly priceApiUrl = 'http://localhost:5062/price';
  private readonly watchlistApiUrl = 'http://localhost:5062/watchlist';
  private isRefreshing = false;

  symbol = '';
  watchlist: WatchlistItem[] = [];
  error = '';

  constructor() {
    this.loadWatchlist();

    interval(5000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.refreshPrices());
  }

  loadWatchlist() {
    this.http.get<string[]>(this.watchlistApiUrl)
      .subscribe({
        next: (symbols) => {
          this.watchlist = symbols.map(symbol => ({
            symbol,
            price: 0,
            previousPrice: 0,
            loading: true
          }));

          this.refreshPrices();
          this.cdr.markForCheck();
        }
      });
  }

  addStock() {
    const normalizedSymbol = this.symbol.trim().toUpperCase();

    if (!normalizedSymbol) return;

    this.http.post(`${this.watchlistApiUrl}/${normalizedSymbol}`, {})
      .subscribe({
        next: () => {
          this.symbol = '';
          this.error = '';
          this.loadWatchlist();
        },
        error: () => {
          this.error = 'Stock already exists';
          this.cdr.markForCheck();
        }
      });
  }

  removeStock(index: number) {
    const symbol = this.watchlist[index].symbol;

    this.http.delete(`${this.watchlistApiUrl}/${symbol}`)
      .subscribe(() => {
        this.loadWatchlist();
      });
  }

  trackBySymbol(_: number, stock: WatchlistItem) {
    return stock.symbol;
  }

  refreshPrices() {
    if (this.isRefreshing || this.watchlist.length === 0) return;

    this.isRefreshing = true;

    this.watchlist = this.watchlist.map(stock => ({
      ...stock,
      loading: true
    }));

    const requests = this.watchlist.map(stock =>
      this.http.get<{ symbol: string; price: number }>(
        `${this.priceApiUrl}/${stock.symbol}`
      ).toPromise()
    );

    Promise.all(requests)
      .then(results => {
        this.watchlist = this.watchlist.map(stock => {
          const updated = results.find(r => r?.symbol === stock.symbol);

          return updated
            ? {
                symbol: updated.symbol,
                price: updated.price,
                previousPrice: stock.price,
                loading: false
              }
            : { ...stock, loading: false };
        });
      })
      .catch(() => {
        this.watchlist = this.watchlist.map(stock => ({
          ...stock,
          loading: false
        }));
      })
      .finally(() => {
        this.isRefreshing = false;
        this.cdr.markForCheck();
      });
  }
}
