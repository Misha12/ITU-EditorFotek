import { Component, OnInit } from '@angular/core';
import { ComponentBase } from '../component.base';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends ComponentBase implements OnInit {

  constructor(
    protected deviceDetection: DeviceDetectorService
  ) { super(deviceDetection); }

  ngOnInit() {
  }

}
