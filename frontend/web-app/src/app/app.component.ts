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
  private isRefreshing = false;

  symbol = '';
  watchlist: WatchlistItem[] = [];
  error = '';

  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.refreshPrices());
  }

  addStock() {
    const normalizedSymbol = this.symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      return;
    }

    const exists = this.watchlist.some(
      stock => stock.symbol === normalizedSymbol
    );

    if (exists) {
      this.error = 'Stock already in watchlist';
      return;
    }

    this.error = '';

    this.http.get<Pick<WatchlistItem, 'symbol' | 'price'>>(
      `${this.priceApiUrl}/${normalizedSymbol}`
    )
      .subscribe({
        next: (stock) => {
          this.watchlist = [...this.watchlist, {
            symbol: stock.symbol,
            price: stock.price,
            previousPrice: stock.price,
            loading: false
          }];
          this.symbol = '';
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = 'Failed to fetch price';
        }
      });
  }

  removeStock(index: number) {
    this.watchlist = this.watchlist.filter((_, currentIndex) => currentIndex !== index);
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
