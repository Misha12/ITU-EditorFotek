import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ComponentBase } from '../component.base';

export enum ModeType {
  crop,
  color,
  rotate,
  freecrop
}

@Component({
  selector: 'app-bottom',
  templateUrl: './bottom.component.html',
  styleUrls: ['./bottom.component.scss']
})
export class BottomComponent extends ComponentBase implements OnInit {
  mode = ModeType.crop;

  constructor(
    router: Router,
    deviceDetection: DeviceDetectorService
  ) {
    super(deviceDetection);

    router.events
      .pipe(filter(ev => ev instanceof NavigationEnd))
      .subscribe((x: NavigationEnd) => {
        switch (x.url.toLowerCase()) {
          case '/rotate':
            this.mode = ModeType.rotate;
            break;
          case '/color':
            this.mode = ModeType.color;
            break;
          case '/free-crop':
                this.mode = ModeType.freecrop;
                break;
          default:
            this.mode = ModeType.crop;
            break;
        }
      });
  }

  ngOnInit() {
  }

}
