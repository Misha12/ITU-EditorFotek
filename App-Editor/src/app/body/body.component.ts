import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ComponentBase } from '../component.base';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CanvasService } from '../CanvasService';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss']
})
export class BodyComponent extends ComponentBase implements OnInit {
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;

  @ViewChild('file') file: ElementRef<HTMLInputElement>;

  constructor(
    protected deviceDetector: DeviceDetectorService,
    public canvasService: CanvasService
  ) { super(deviceDetector); }

  ngOnInit(): void {
    this.canvasService.context = this.canvas.nativeElement.getContext('2d');
    this.canvasService.canvas = this.canvas;
    this.canvasService.init();

    this.file.nativeElement.onchange = () => {
      if (this.file.nativeElement.files && this.file.nativeElement.files.length > 0 && this.file.nativeElement.files[0]) {
        this.canvasService.loadImage(this.file.nativeElement.files[0]);
      }
    };
  }

}
