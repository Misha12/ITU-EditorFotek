import { Component } from '@angular/core';
import { ComponentBase } from './component.base';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends ComponentBase {
  constructor(
    protected deviceDetection: DeviceDetectorService
  ) {
    super(deviceDetection);
  }

  title = 'App-Editor';
}
