import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ComponentBase } from '../component.base';
import { CanvasService } from '../CanvasService';

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
    deviceDetection: DeviceDetectorService,
    private canvasService: CanvasService
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

  saveImage() {
    const element = document.createElement('a');
    element.download = 'Image.png';
    element.href = this.canvasService.bitmapImage;
    element.click();
  }

  printImage() {
    const win = window.open();
    win.document.write(`<img src="${this.canvasService.bitmapImage}" />`);
  }

}
