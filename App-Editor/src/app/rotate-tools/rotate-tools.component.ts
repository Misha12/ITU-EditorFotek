import { Component, OnInit } from '@angular/core';
import { ComponentBase } from '../component.base';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CanvasService } from '../CanvasService';
import { FlipType } from '../services';

@Component({
  selector: 'app-rotate-tools',
  templateUrl: './rotate-tools.component.html',
  styleUrls: ['./rotate-tools.component.scss']
})
export class RotateToolsComponent extends ComponentBase implements OnInit {
  currentRotate = 0;

  constructor(
    protected deviceDetection: DeviceDetectorService,
    private canvasService: CanvasService
  ) { super(deviceDetection); }

  ngOnInit() { }
  onRotateChange(angle: number) { this.currentRotate = this.canvasService.rotateImage(angle); }
  rotate(angle: number) { this.currentRotate = this.canvasService.fixedRotate(angle); }
  flip(axis: FlipType) { this.canvasService.setFlip(axis); }
}
