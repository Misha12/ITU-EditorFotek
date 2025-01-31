import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ComponentBase } from '../component.base';
import { CanvasService } from '../CanvasService';

export interface CropSetting {
  id: string;
  name: string;
  ratioX?: number;
  ratioY?: number;
  isActive: boolean;
  desc: string;
  custom: boolean;
  width?: number;
  height?: number;
}

@Component({
  selector: 'app-crop-tools',
  templateUrl: './crop-tools.component.html',
  styleUrls: ['./crop-tools.component.scss']
})
export class CropToolsComponent extends ComponentBase implements OnInit {
  isCustomSelected = false;

  settings: CropSetting[] = [
    { id: 'facebook_profile', name: 'Facebook - Profilová', desc: 'Profilová fotografie na Facebook', ratioX: 1, ratioY: 1, isActive: false, custom: false },
    { id: 'facebook_header', name: 'Facebook - Záhlaví', desc: 'Záhlaví na Facebook', ratioX: 1, ratioY: 2.7, isActive: false, custom: false },
    { id: 'isic', name: 'ISIC', desc: 'Průkazové fotografie - ISIC', ratioX: 5, ratioY: 6, isActive: false, custom: false },
    { id: 'usa-passport', name: 'USA - Vízum', desc: null, ratioX: 1, ratioY: 1, isActive: false, custom: false },
    { id: 'zbrojni-prukaz', name: 'Zbrojní průkaz', desc: null, ratioX: 7, ratioY: 9, height: 0, width: 0, isActive: false, custom: false },
    { id: 'ig-story', name: 'Instagram - Stories', desc: 'Instagramové příběhy', ratioX: 9, ratioY: 16, isActive: false, custom: false },
    { id: 'ig-landscape', name: 'Instagram - Profilová', desc: 'Profilová fotografie na Instagram', ratioX: 1, ratioY: 1, isActive: false, custom: false }
  ];

  private selectedSetting: string;

  get customSelected() {
    return this.isCustomSelected;
  }

  constructor(
    private router: Router,
    protected deviceDetection: DeviceDetectorService,
    private canvasService: CanvasService
  ) {
    super(deviceDetection);
  }

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
      const notExists = jsonData.filter(o => !this.settings.some(x => x.id === o.id));

      for (const item of notExists) { this.settings.push(item); }
    }
  }

  selectFreeCrop() {
    this.isCustomSelected = true;
    if (this.selectedSetting) {
      this.settings.find(o => o.id === this.selectedSetting).isActive = false;
    }

    this.router.navigate(['/free-crop']);
  }

  selectCrop(id: string) {
    const setting = this.settings.find(o => o.id === id);
    this.isCustomSelected = false;
    setting.isActive = true;

    this.canvasService.renderCropArray(setting);

    if (this.selectedSetting) {
      this.settings.find(o => o.id === this.selectedSetting).isActive = false;
      this.selectedSetting = null;
    }

    this.selectedSetting = id;
    this.router.navigate(['/crop']);
  }

  cancelCrop() {
    this.canvasService.renderCropArray(null);
    this.isCustomSelected = false;
    if (this.selectedSetting) {
      this.settings.find(o => o.id === this.selectedSetting).isActive = false;
      this.selectedSetting = null;
    }
  }
}
