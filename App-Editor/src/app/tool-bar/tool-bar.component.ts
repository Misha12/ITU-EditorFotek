import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ComponentBase } from '../component.base';
import { CanvasService } from '../CanvasService';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss']
})
export class ToolBarComponent extends ComponentBase implements OnInit {
  @ViewChild('currentZoomInput', { static: true } as any) currentZoomInput: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    protected deviceDetection: DeviceDetectorService,
    public canvasService: CanvasService
  ) { super(deviceDetection); }

  ngOnInit() {
    this.selectCrop();
    this.currentZoomInput.nativeElement.addEventListener('mousewheel', (e: WheelEvent) => {
      e.preventDefault();

      const increment = parseInt(this.currentZoomInput.nativeElement.step, 10);
      const max = parseInt(this.currentZoomInput.nativeElement.max, 10);
      const min = parseInt(this.currentZoomInput.nativeElement.min, 10);
      let val = parseInt(this.currentZoomInput.nativeElement.value, 10);

      if (isNaN(val)) {
        val = 0;
      }

      if (e.deltaY < 0) {
        if (val + increment <= max) {
          this.currentZoomInput.nativeElement.value = (val + increment).toString();
          this.canvasService.setZoom('custom', (val + increment) / 100);
        }
      } else {
        if (val - increment >= min) {
          this.currentZoomInput.nativeElement.value = (val - increment).toString();
          this.canvasService.setZoom('custom', (val - increment) / 100);
        }
      }
    });
  }

  selectCrop() {
    this.router.navigate(['/crop']);
  }

  selectColor() {
    this.router.navigate(['/color']);
  }

  selectRotate() {
    this.router.navigate(['/rotate']);
  }

}
