import { Component, OnInit } from '@angular/core';
import { ComponentBase } from '../component.base';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-free-crop-panel',
  templateUrl: './free-crop-panel.component.html',
  styleUrls: ['./free-crop-panel.component.scss']
})
export class FreeCropPanelComponent extends ComponentBase implements OnInit {

  constructor(
    protected deviceDetection: DeviceDetectorService
  ) { super(deviceDetection); }

  ngOnInit() {
  }

}
