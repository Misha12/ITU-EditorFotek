import { Component, OnInit, ElementRef } from '@angular/core';
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
    if (confirm('rly?')) { // TODO Dialog.
      const fileElement = document.getElementById('file') as HTMLInputElement;
      this.canvasService.resetHistory(false);
      fileElement.click();
    }
  }
}
