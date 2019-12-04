import { Component, OnInit } from '@angular/core';
import { ComponentBase } from '../component.base';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-crop-description-bottom-panel',
  templateUrl: './crop-description-bottom-panel.component.html',
  styleUrls: ['./crop-description-bottom-panel.component.scss']
})
export class CropDescriptionBottomPanelComponent extends ComponentBase implements OnInit {

  constructor(
    protected deviceDetection: DeviceDetectorService
  ) { super(deviceDetection); }

  ngOnInit() {
  }

}
