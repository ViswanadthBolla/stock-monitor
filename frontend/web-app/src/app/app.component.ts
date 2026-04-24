import {
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
import * as signalR from '@microsoft/signalr';

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
  @ViewChild('chartCanvas') chartRef!: ElementRef<HTMLCanvasElement>;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly http = inject(HttpClient);
  private readonly historyApiUrl = 'http://localhost:5062/price';
  private readonly watchlistApiUrl = 'http://localhost:5062/watchlist';
  private hubConnection!: signalR.HubConnection;
  private isRefreshing = false;
  private chart: Chart | null = null;

  currentChartSymbol: string | null = null;
  symbol = '';
  watchlist: WatchlistItem[] = [];
  error = '';

  constructor() {
    this.loadWatchlist();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5062/priceHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start();

    this.hubConnection.on('priceUpdate', (data: any) => {

      this.watchlist = this.watchlist.map(stock =>
        stock.symbol === data.symbol
          ? {
              symbol: data.symbol,
              price: data.price,
              previousPrice: stock.price,
              loading: false
            }
          : stock
      );

      // update chart if selected
      if (this.currentChartSymbol === data.symbol && this.chart) {
        const time = new Date().toLocaleTimeString();

        const labels = this.chart.data.labels as string[];
        const chartData = this.chart.data.datasets[0].data as number[];

        labels.push(time);
        chartData.push(data.price);

        if (labels.length > 50) {
          labels.shift();
          chartData.shift();
        }

        this.chart.update();
      }

      this.cdr.markForCheck();
    });
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
              : null);

          if (!nextChartSymbol && this.chart) {
            this.chart.destroy();
            this.chart = null;
          }

          this.currentChartSymbol = nextChartSymbol;
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

  selectChart(symbol: string) {
    this.currentChartSymbol = symbol;
    this.loadChart(symbol);
  }

  loadChart(symbol: string) {
    this.currentChartSymbol = symbol;

    this.http.get<any[]>(`${this.historyApiUrl}/${symbol}/history`)
      .subscribe(history => {

        const labels = history.map(p => new Date(p.time).toLocaleTimeString());
        const prices = history.map(p => p.price);

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

  updateChartIncremental(symbol: string) {
    this.http.get<any[]>(`${this.historyApiUrl}/${symbol}/history`)
      .subscribe(history => {

        if (!history || history.length === 0 || !this.chart) return;

        const lastPoint = history[history.length - 1];

        const lastLabel = new Date(lastPoint.time).toLocaleTimeString();
        const lastPrice = lastPoint.price;

        const labels = this.chart.data.labels as string[];
        const data = this.chart.data.datasets[0].data as number[];

        // avoid duplicate push
        if (labels.length > 0 && labels[labels.length - 1] === lastLabel) {
          return;
        }

        labels.push(lastLabel);
        data.push(lastPrice);

        // keep max 50 points
        if (labels.length > 50) {
          labels.shift();
          data.shift();
        }

        this.chart.update();
      });
  }

  trackBySymbol(_: number, stock: WatchlistItem) {
    return stock.symbol;
  }

  refreshPrices() {
    if (this.isRefreshing || this.watchlist.length === 0) return;

    this.isRefreshing = true;

    const requests = this.watchlist.map(stock =>
      this.http.get<{ symbol: string; price: number }>(`${this.historyApiUrl}/${stock.symbol}`).toPromise()
    );

    Promise.all(requests)
      .then(results => {
        this.watchlist = this.watchlist.map((stock, index) => {
          const data = results[index];

          if (!data) {
            return { ...stock, loading: false };
          }

          return {
            symbol: stock.symbol,
            price: data.price,
            previousPrice: stock.price,
            loading: false
          };
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
