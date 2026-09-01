import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash.html',
  styleUrls: ['./splash.scss']
})
export class SplashComponent implements OnInit, OnDestroy {
  progress = 0;
  showToast = true;
  private intervalId: any;

  constructor(private router: Router) { }

  ngOnInit(): void {

    this.intervalId = setInterval(() => {
      this.progress += 2;

      if (this.progress >= 100) {
        clearInterval(this.intervalId);
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 300);
      }
    }, 30);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  closeToast(): void {
    this.showToast = false;
  }
}
