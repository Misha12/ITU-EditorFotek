import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
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

  constructor(
    protected deviceDetector: DeviceDetectorService,
    public canvasService: CanvasService
  ) { super(deviceDetector); }

  get haveImage() {
    return this.canvasService.currentImg != null;
  }

  ngOnInit(): void {
    this.canvasService.context = this.canvas.nativeElement.getContext('2d');
    this.canvasService.canvas = this.canvas;
    this.canvasService.init();
  }

  @HostListener('window:resize', ['$event'])
  onResize(_: any) {
    this.canvasService.init(true);
  }

  fileUploaded(file: File) {
    this.canvasService.loadImage(file);
  }

}
