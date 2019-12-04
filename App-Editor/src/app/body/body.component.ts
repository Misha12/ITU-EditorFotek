import { Component, OnInit } from '@angular/core';
import { ComponentBase } from '../component.base';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss']
})
export class BodyComponent extends ComponentBase implements OnInit {
  constructor(
    protected deviceDetector: DeviceDetectorService
  ) { super(deviceDetector); }

  ngOnInit(): void {
  }

}
