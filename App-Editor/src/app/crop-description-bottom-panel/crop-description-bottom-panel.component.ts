import { Component, OnInit } from '@angular/core';
import { ComponentBase } from '../component.base';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CanvasService } from '../CanvasService';

@Component({
  selector: 'app-crop-description-bottom-panel',
  templateUrl: './crop-description-bottom-panel.component.html',
  styleUrls: ['./crop-description-bottom-panel.component.scss']
})
export class CropDescriptionBottomPanelComponent extends ComponentBase implements OnInit {

  constructor(
    protected deviceDetection: DeviceDetectorService,
    protected canvasService: CanvasService
  ) { super(deviceDetection); }

  get haveCrop() { return this.canvasService.selectedCropSetting != null; }

  get description() {
    const name = this.canvasService.selectedCropSetting.name;
    const desc = this.canvasService.selectedCropSetting.desc;
    return !desc ? name : desc;
  }

  get isCustom() { return this.canvasService.selectedCropSetting.custom; }
  get ratio() { return `${this.canvasService.selectedCropSetting.ratioX}:${this.canvasService.selectedCropSetting.ratioY}`; }
  get resolution() { return `${this.canvasService.selectedCropSetting.width}x${this.canvasService.selectedCropSetting.height}`; }

  ngOnInit() {
  }

}
