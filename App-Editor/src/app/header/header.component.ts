import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { ComponentBase } from '../component.base';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CanvasService } from '../CanvasService';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends ComponentBase implements OnInit {

  constructor(
    protected deviceDetection: DeviceDetectorService,
    public canvasService: CanvasService
  ) { super(deviceDetection); }

  ngOnInit() {
  }

  newFile() {
    if (confirm('rly?')) {
      const file = document.createElement('input');
      file.type = 'file';

      file.onchange = _ => {
        if (file.files && file.files.length > 0 && file.files[0]) {
          this.canvasService.resetHistory(false);
          this.canvasService.loadImage(file.files[0]);
        }
      };

      file.click();
    }
  }
}
