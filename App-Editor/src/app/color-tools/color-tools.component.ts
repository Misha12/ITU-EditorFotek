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
  constructor(
    protected deviceDetection: DeviceDetectorService,
    private canvasService: CanvasService
  ) { super(deviceDetection); }

  ngOnInit() {
  }
}
