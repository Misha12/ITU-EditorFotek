import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ComponentBase } from '../component.base';
import { CanvasService } from '../CanvasService';

export interface CropSetting {
  id: string;
  name: string;
  ratioX: number;
  ratioY: number;
  isActive: boolean;
  desc: string;
  custom: boolean;
  width: number;
  height: number;
}

@Component({
  selector: 'app-crop-tools',
  templateUrl: './crop-tools.component.html',
  styleUrls: ['./crop-tools.component.scss']
})
export class CropToolsComponent extends ComponentBase implements OnInit {
  settings: CropSetting[] = [
    // tslint:disable-next-line: max-line-length
    { id: 'facebook_profile', name: 'Facebook - Profilová', desc: 'Profilová fotografie na Facebook', ratioX: 1, ratioY: 1, width: 0, height: 0, isActive: false, custom: false },
    // tslint:disable-next-line: max-line-length
    { id: 'facebook_header', name: 'Facebook - Záhlaví', desc: 'Záhlaví na facebook', ratioX: 205, ratioY: 78, height: 0, width: 0, isActive: false, custom: false }
  ];

  private selectedSetting: string;

  constructor(
    private router: Router,
    protected deviceDetection: DeviceDetectorService,
    private canvasService: CanvasService
  ) { super(deviceDetection); }

  ngOnInit() {
    this.loadSettings();
    setInterval(() => this.loadSettings(), 500);
  }

  loadSettings() {
    const data = localStorage.getItem('crop_settings');

    if (!data) {
      const json = JSON.stringify(this.settings);
      localStorage.setItem('crop_settings', json);
    } else {
      const jsonData = JSON.parse(data) as CropSetting[];
      this.settings = jsonData;
    }
  }

  selectFreeCrop() {
    this.router.navigate(['/free-crop']);
  }

  selectCrop(id: string) {
    const setting = this.settings.find(o => o.id === id);
    this.canvasService.renderCropArray(setting);

    if (this.selectedSetting) {
      this.settings.find(o => o.id === this.selectedSetting).isActive = false;
    }

    setting.isActive = true;
    this.selectedSetting = id;

    this.router.navigate(['/crop']);
  }

}
