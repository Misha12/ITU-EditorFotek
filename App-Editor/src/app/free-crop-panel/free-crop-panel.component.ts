import { Component, OnInit } from '@angular/core';
import { ComponentBase } from '../component.base';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CanvasService } from '../CanvasService';
import { CropSetting } from '../crop-tools/crop-tools.component';

@Component({
  selector: 'app-free-crop-panel',
  templateUrl: './free-crop-panel.component.html',
  styleUrls: ['./free-crop-panel.component.scss']
})
export class FreeCropPanelComponent extends ComponentBase implements OnInit {
  width = '300';
  height = '300';
  name: string;

  constructor(
    protected deviceDetection: DeviceDetectorService,
    protected canvasService: CanvasService
  ) { super(deviceDetection); }

  ngOnInit() {
    this.setCrop();
  }

  setWidth(width: string) {
    this.width = width;
    this.setCrop();
  }

  setHeight(height: string) {
    this.height = height;
    this.setCrop();
  }

  setCrop() {
    const setting: CropSetting = {
      id: 'free-crop',
      isActive: false,
      custom: true,
      height: parseFloat(this.height),
      name: this.name,
      width: parseFloat(this.width),
      desc: null
    };

    this.canvasService.renderCropArray(setting);
  }

  saveCropTemplate() {
    const random = Math.random() * 10000000;

    const settingItem: CropSetting = {
      id: `custom-${random}`,
      custom: true,
      height: parseFloat(this.height),
      name: this.name,
      width: parseFloat(this.width),
      isActive: false,
      desc: null
    };

    const jsonData = JSON.parse(localStorage.getItem('crop_settings')) as CropSetting[];
    jsonData.push(settingItem);

    localStorage.setItem('crop_settings', JSON.stringify(jsonData));
  }
}
