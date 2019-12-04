import { Component, OnInit, Input } from '@angular/core';
import { ComponentBase } from '../component.base';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-template-item',
  templateUrl: './template-item.component.html',
  styleUrls: ['./template-item.component.scss']
})
export class TemplateItemComponent extends ComponentBase implements OnInit {

  @Input() name: string;

  constructor(
    protected deviceDetection: DeviceDetectorService
  ) { super(deviceDetection); }

  ngOnInit() {
  }

}
