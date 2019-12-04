import { Component, OnInit } from '@angular/core';
import { ComponentBase } from '../component.base';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-color-tools',
  templateUrl: './color-tools.component.html',
  styleUrls: ['./color-tools.component.scss']
})
export class ColorToolsComponent extends ComponentBase implements OnInit {

  constructor(
    protected deviceDetection: DeviceDetectorService
  ) { super(deviceDetection); }

  ngOnInit() {
  }

}
