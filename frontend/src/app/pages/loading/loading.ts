import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './loading.scss',
  templateUrl: './loading.html',
})
export class LoadingComponent implements OnInit, OnDestroy {
  showToast = true;
  toastClosing = false;

  private redirectTimer?: ReturnType<typeof setTimeout>;
  private toastCloseTimer?: ReturnType<typeof setTimeout>;
  private toastRemoveTimer?: ReturnType<typeof setTimeout>;

  constructor(private router: Router) { }

  ngOnInit() {
    this.redirectTimer = setTimeout(() => this.router.navigate(['/app/home']), 1800);

    // inicia o fade-out em 2700ms
    this.toastCloseTimer = setTimeout(() => (this.toastClosing = true), 2700);
    // remove do DOM em 3000ms (depois da transição terminar)
    this.toastRemoveTimer = setTimeout(() => (this.showToast = false), 3000);
  }

  closeToast() {
    this.toastClosing = true;
    setTimeout(() => (this.showToast = false), 300);
  }

  ngOnDestroy() {
    clearTimeout(this.redirectTimer);
    clearTimeout(this.toastCloseTimer);
    clearTimeout(this.toastRemoveTimer);
  }
}
