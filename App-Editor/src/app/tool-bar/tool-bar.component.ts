import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ComponentBase } from '../component.base';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss']
})
export class ToolBarComponent extends ComponentBase implements OnInit {
  constructor(
    private router: Router,
    protected deviceDetection: DeviceDetectorService
  ) { super(deviceDetection); }

  ngOnInit() {
  }

  selectCrop() {
    this.router.navigate(['/crop']);
  }

  selectColor() {
    this.router.navigate(['/color']);
  }

  selectRotate() {
    this.router.navigate(['/rotate']);
  }

}
