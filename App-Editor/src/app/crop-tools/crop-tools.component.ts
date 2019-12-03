import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crop-tools',
  templateUrl: './crop-tools.component.html',
  styleUrls: ['./crop-tools.component.scss']
})
export class CropToolsComponent implements OnInit {
  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  selectFreeCrop() {
    this.router.navigate(['/free-crop']);
  }

  selectCrop() {
    this.router.navigate(['/crop']);
  }

}
