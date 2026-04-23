import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent {

  symbol = '';
  price: any;

  constructor(private http: HttpClient) {}

  fetchPrice() {
    this.http.get(`http://localhost:5062/price/${this.symbol}`)
      .subscribe(res => {
        this.price = res;
      });
  }
}