import { Component, OnInit } from '@angular/core';
import { ComponentBase } from '../component.base';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CanvasService } from '../CanvasService';

@Component({
  selector: 'app-color-tools',
  templateUrl: './color-tools.component.html',
  styleUrls: ['./color-tools.component.scss']
})
export class ColorToolsComponent extends ComponentBase implements OnInit {
  brightness = 100;
  contrast = 100;
  saturate = 100;
  backgroundColor = '#585858';

  constructor(
    protected deviceDetection: DeviceDetectorService,
    private canvasService: CanvasService
  ) { super(deviceDetection); }

  ngOnInit() {
  }

  setBrightness(value: number) {
    this.brightness = value;
    this.canvasService.setBrightness(value);
  }

  setContrast(value: number) {
    this.contrast = value;
    this.canvasService.setContrast(value);
  }

  setSaturate(value: number) {
    this.saturate = value;
    this.canvasService.setSaturate(value);
  }

  setBackground(value: string) {
    this.backgroundColor = value;
    this.canvasService.setBackground(value);
  }
}
