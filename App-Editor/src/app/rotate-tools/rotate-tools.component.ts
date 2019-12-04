import { Component, OnInit } from '@angular/core';
import { ComponentBase } from '../component.base';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-rotate-tools',
  templateUrl: './rotate-tools.component.html',
  styleUrls: ['./rotate-tools.component.scss']
})
export class RotateToolsComponent extends ComponentBase implements OnInit {

  constructor(
    protected deviceDetection: DeviceDetectorService
  ) { super(deviceDetection); }

  ngOnInit() {
  }

}
