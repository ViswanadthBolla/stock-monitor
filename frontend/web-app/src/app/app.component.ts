import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { interval } from 'rxjs';
import Chart from 'chart.js/auto';

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
export class AppComponent implements AfterViewInit {
  @ViewChild('chartCanvas') chartRef!: ElementRef<HTMLCanvasElement>;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly http = inject(HttpClient);
  private readonly priceApiUrl = 'http://localhost:5062/price';
  private readonly watchlistApiUrl = 'http://localhost:5062/watchlist';
  private isRefreshing = false;
  private chart: any;
  private viewReady = false;

  currentChartSymbol: string | null = null;
  symbol = '';
  watchlist: WatchlistItem[] = [];
  error = '';

  constructor() {
    this.loadWatchlist();

    interval(5000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.refreshPrices());
  }

  ngAfterViewInit() {
    this.viewReady = true;

    if (this.currentChartSymbol) {
      this.loadChart(this.currentChartSymbol);
    } else if (this.watchlist.length > 0) {
      this.loadChart(this.watchlist[0].symbol);
    }
  }

  loadWatchlist(selectedSymbol?: string) {
    this.http.get<string[]>(this.watchlistApiUrl)
      .subscribe({
        next: (symbols) => {
          this.watchlist = symbols.map(symbol => ({
            symbol,
            price: 0,
            previousPrice: 0,
            loading: true
          }));

          const nextChartSymbol = selectedSymbol
            ?? (this.currentChartSymbol && symbols.includes(this.currentChartSymbol)
              ? this.currentChartSymbol
              : symbols[0] ?? '');

          if (!nextChartSymbol && this.chart) {
            this.chart.destroy();
            this.chart = null;
          }

          this.currentChartSymbol = nextChartSymbol || null;
          this.refreshPrices();

          if (this.viewReady && this.currentChartSymbol) {
            this.loadChart(this.currentChartSymbol);
          }

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
          this.currentChartSymbol = normalizedSymbol;
          this.loadWatchlist(normalizedSymbol);
          this.loadChart(normalizedSymbol);
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
        const nextSymbol = this.currentChartSymbol === symbol
          ? this.watchlist.find(stock => stock.symbol !== symbol)?.symbol
          : this.currentChartSymbol ?? undefined;

        this.loadWatchlist(nextSymbol);
      });
  }

  loadChart(symbol: string) {
    if (!this.viewReady) {
      this.currentChartSymbol = symbol;
      return;
    }

    this.currentChartSymbol = symbol;

    this.http.get<any[]>(`${this.priceApiUrl}/${symbol}/history`)
      .subscribe(data => {
        const labels = data.map(p => new Date(p.time).toLocaleTimeString());
        const prices = data.map(p => p.price);

        if (!this.chart) {
          this.chart = new Chart(this.chartRef.nativeElement, {
            type: 'line',
            data: {
              labels,
              datasets: [{
                label: symbol,
                data: prices,
                borderWidth: 2
              }]
            },
            options: {
              responsive: true,
              animation: false
            }
          });
        } else {
          this.chart.data.labels = labels;
          this.chart.data.datasets[0].label = symbol;
          this.chart.data.datasets[0].data = prices;
          this.chart.update();
        }

        this.cdr.markForCheck();
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

        if (this.currentChartSymbol) {
          this.loadChart(this.currentChartSymbol);
        }

        this.cdr.markForCheck();
      });
  }
}
