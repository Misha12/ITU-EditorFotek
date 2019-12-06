import { Component, OnInit } from '@angular/core';
import { ComponentBase } from '../component.base';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CanvasService } from '../CanvasService';

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
  flip(axis: 'horizontal' | 'vertical') { this.canvasService.setFlip(axis); }

  getInt(val: string) {
    if (val === '-') { val = '-0'; }
    return parseInt(val, 10);
  }
}
