import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ComponentBase } from '../component.base';

@Component({
  selector: 'app-crop-tools',
  templateUrl: './crop-tools.component.html',
  styleUrls: ['./crop-tools.component.scss']
})
export class CropToolsComponent extends ComponentBase implements OnInit {
  constructor(
    private router: Router,
    protected deviceDetection: DeviceDetectorService
  ) { super(deviceDetection); }

  ngOnInit() {
  }

  selectFreeCrop() {
    this.router.navigate(['/free-crop']);
  }

  selectCrop() {
    this.router.navigate(['/crop']);
  }

}
