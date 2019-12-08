import { Component } from '@angular/core';
import { ComponentBase } from './component.base';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends ComponentBase {
  constructor(
    protected deviceDetection: DeviceDetectorService,
    private router: Router
  ) {
    super(deviceDetection);

    const loc = ((url) => {
      const a = document.createElement('a');
      a.href = url;
      return a.pathname;
    })(location.href);

    if (loc !== '/') {
      location.href = '/';
    }
  }

  title = 'App-Editor';
}
