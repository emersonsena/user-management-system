import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './splash.scss',
  templateUrl: './splash.html',
})
export class SplashComponent implements OnInit {
  step: 1 | 2 = 1;

  constructor(private router: Router) { }

  ngOnInit() {
    setTimeout(() => (this.step = 2), 1200);
    setTimeout(() => this.router.navigate(['/login']), 2700);
  }
}
