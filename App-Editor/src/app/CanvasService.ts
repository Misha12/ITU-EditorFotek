import { Injectable, ElementRef } from '@angular/core';
import { CropSetting } from './crop-tools/crop-tools.component';
import { HistoryService, ZoomInfo, RotateOperation, CutOperation, ZoomChange, FlipChange, FilterChange, ColorChange,
  FlipType } from './services/history.service';
import { Defaults } from './services';

export interface Size { width: number; height: number; }
interface Rectangle extends Size { x: number; y: number; }

type ZoomType = 'up' | 'down' | 'custom';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  context: CanvasRenderingContext2D;
  canvas: ElementRef<HTMLCanvasElement>;
  margin = 50;

  constructor(public historyService: HistoryService) { }

  imageFile: File;
  currentImg: HTMLImageElement;
  currentAngle = 0;
  flipHorizontal = false;
  flipVertical = false;
  canMove = false;
  selectedCropSetting: CropSetting;

  actualZoom: ZoomInfo = Defaults.zoomInfo;
  brightness = Defaults.brightness;
  brightness2 = Defaults.brightness;
  contrast = Defaults.contrast;
  contrast2 = Defaults.contrast;
  saturate = Defaults.saturate;
  saturate2 = Defaults.saturate;
  background = Defaults.background;
  background2 = Defaults.background;
  grayscale = Defaults.grayscale;
  grayscale2 = Defaults.grayscale;

  lastMousePosition: { x: number, y: number };

  get currentSize(): Size {
    if (!this.currentImg) { return null; }
    return { width: this.currentImg.width, height: this.currentImg.height };
  }

  init(resize: boolean = false) {
    const css = window.getComputedStyle(this.canvas.nativeElement);

    this.canvas.nativeElement.width = parseFloat(css.width.replace('px', ''));
    this.canvas.nativeElement.height = parseFloat(css.height.replace('px', ''));

    this.canvas.nativeElement.onmousemove = (ev) => {
      if (this.canMove) {
        this.lastMousePosition = { x: ev.x, y: ev.y };
        this.drawCurrentImage();
      }
    };

    this.canvas.nativeElement.onmouseup = (_) => this.canMove = false;
    this.canvas.nativeElement.onmousedown = (_) => this.canMove = true;

    this.canvas.nativeElement.addEventListener('mousewheel', (e: WheelEvent) => {
      e.preventDefault();

      const increment = Defaults.zoomIncrement;
      const max = Defaults.zoomMax;
      const min = Defaults.zoomMin;
      let val = this.actualZoom.value * 100;

      if (isNaN(val)) {
        val = 0;
      }

      if (e.deltaY < 0) {
        if (val + increment <= max) {
          this.setZoom('custom', (val + increment) / 100);
        }
      } else {
        if (val - increment >= min) {
          this.setZoom('custom', (val - increment) / 100);
        }
      }
    });

    if (resize && this.currentImg) {
      this.drawCurrentImage();
    } else {
      this.selectedCropSetting = null;
    }
  }

  loadImage(file: File) {
    this.imageFile = file;

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        this.currentImg = img;
        this.resetHistory(false);
        this.drawCurrentImage();
      };

      img.src = (e.target as any).result.toString();
    };

    reader.readAsDataURL(file);
  }

  private computeResolution(img: HTMLImageElement): Rectangle {
    const maxWidth = this.canvas.nativeElement.width - this.margin;
    const maxHeight = this.canvas.nativeElement.height - this.margin;
    let ratio = 0;
    const rect: Rectangle = { x: 0, y: 0, width: img.width, height: img.height };

    if (img.width > maxWidth) {
      ratio = maxWidth / img.width;
      rect.width = maxWidth;
      rect.height = img.height * ratio;
    }

    if (img.height > maxHeight) {
      ratio = maxHeight / img.height;

      rect.height = maxHeight;
      rect.width = img.width * ratio;
    }

    return rect;
  }

  drawCurrentImage() {
    const resolution = this.computeResolution(this.currentImg);

    let scaleH = this.flipHorizontal ? -1 : 1;
    let scaleV = this.flipVertical ? -1 : 1;

    scaleH *= this.actualZoom.value;
    scaleV *= this.actualZoom.value;

    const mousePos: { x: number, y: number } = { x: 0, y: 0 };
    if (this.lastMousePosition) {
      mousePos.x = this.lastMousePosition.x;
      mousePos.y = this.lastMousePosition.y;
    } else {
      mousePos.x = this.canvas.nativeElement.width / 2.0;
      mousePos.y = this.canvas.nativeElement.height / 2.0;
    }

    this.clear();
    this.context.fillStyle = this.background;
    this.context.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.context.save();
    this.context.translate(mousePos.x, mousePos.y);
    this.context.scale(scaleH, scaleV);
    this.context.rotate(this.degreeToRad(this.currentAngle));
    this.context.filter = `brightness(${(this.brightness2)}%) contrast(${this.contrast2}%) saturate(${this.saturate2}%) grayscale(${this.grayscale2}%)`;

    this.context.drawImage(this.currentImg, -resolution.width / 2.0, -resolution.height / 2.0, resolution.width, resolution.height);
    this.context.restore();

    if (this.selectedCropSetting) {
      const cropResolution = this.calculateCropResolution();

      const rectX = (this.canvas.nativeElement.width / 2.0) - (cropResolution.width / 2);
      const rectY = (this.canvas.nativeElement.height / 2.0) - (cropResolution.height / 2);

      const darkRects = this.getDarkRectangles({ height: cropResolution.height, width: cropResolution.width, x: rectX, y: rectY });

      this.context.strokeStyle = 'white';
      this.context.lineWidth = 3;
      this.context.strokeRect(rectX, rectY, cropResolution.width, cropResolution.height);

      this.context.strokeStyle = this.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
      for (const rect of darkRects) {
        this.context.fillRect(rect.x, rect.y, rect.width, rect.height);
      }
    }
  }

  degreeToRad(degree: number) { return degree * Math.PI / 180.0; }
  clear() { this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height); }
  fixedRotate(angle: number) { return this.rotateImage(this.currentAngle + angle); }

  rotateImage(angle: number) {
    let ang = angle % 360;

    if (ang > 180) {
      ang = -180 + (ang - 180);
    }

    const logItem: RotateOperation = {
      newAngle: ang,
      oldAngle: this.currentAngle
    };

    this.historyService.pushItem('rotate', logItem);
    this.currentAngle = ang;
    this.drawCurrentImage();
    return this.currentAngle;
  }

  setFlip(mode: FlipType) {
    if (mode === 'horizontal') {
      this.historyService.pushItem('flip', { flipType: mode, oldFlipValue: this.flipHorizontal, newFlipValue: !this.flipHorizontal });
      this.flipHorizontal = !this.flipHorizontal;
    } else if (mode === 'vertical') {
      this.historyService.pushItem('flip', { flipType: mode, oldFlipValue: this.flipVertical, newFlipValue: !this.flipVertical });
      this.flipVertical = !this.flipVertical;
    }

    this.drawCurrentImage();
  }

  renderCropArray(setting: CropSetting) {
    if (!this.currentImg) { return; }
    this.historyService.pushItem('crop', { oldSetting: this.selectedCropSetting, newSetting: setting });
    this.selectedCropSetting = setting;
    this.drawCurrentImage();
  }

  calculateCropResolution(): Size {
    const cropSize: Size = { height: 0, width: 0 };

    if (this.selectedCropSetting.custom) {
      cropSize.height = this.selectedCropSetting.height;
      cropSize.width = this.selectedCropSetting.width;

      return cropSize;
    }

    const imageResolution = this.computeResolution(this.currentImg);

    const imageAspectRatio = imageResolution.width / imageResolution.height;
    const cutAspectRatio = this.selectedCropSetting.ratioY / this.selectedCropSetting.ratioX;

    if (imageAspectRatio > cutAspectRatio) {
      cropSize.height = imageResolution.height;
      cropSize.width = imageResolution.height / cutAspectRatio;
    } else {
      cropSize.width = imageResolution.width;
      cropSize.height = imageResolution.width / cutAspectRatio;
    }

    return cropSize;
  }

  getDarkRectangles(excludedRect: Rectangle): Rectangle[] {
    return [
      this.getRect(0, 0, this.canvas.nativeElement.width, excludedRect.y),
      this.getRect(0, excludedRect.y, excludedRect.x, excludedRect.y + excludedRect.height),
      this.getRect(excludedRect.x, excludedRect.y + excludedRect.height, excludedRect.width, this.canvas.nativeElement.height),
      this.getRect(excludedRect.x + excludedRect.width, excludedRect.y, this.canvas.nativeElement.height, this.canvas.nativeElement.width)
    ];
  }

  getRect(x: number, y: number, width: number, height: number): Rectangle { return { x, y, width, height }; }

  resetHistory(redraw: boolean = true) {
    this.currentAngle = 0;
    this.flipHorizontal = false;
    this.flipVertical = false;
    this.selectedCropSetting = null;
    this.brightness = this.brightness2 = Defaults.brightness;
    this.contrast = this.contrast2 = Defaults.contrast;
    this.saturate = this.saturate2 = Defaults.saturate;
    this.background = this.background2 = Defaults.background;
    this.grayscale = this.grayscale2 = Defaults.grayscale;
    this.actualZoom = Defaults.zoomInfo;
    this.historyService.reset();

    if (redraw) {
      this.drawCurrentImage();
    }
  }

  goBack() {
    if (!this.historyService.canPrev) { return; }
    const operation = this.historyService.getPrevItem();

    switch (operation.type) {
      case 'rotate':
        this.currentAngle = (operation.operation as RotateOperation).oldAngle;
        break;
      case 'crop':
        this.selectedCropSetting = (operation.operation as CutOperation).oldSetting;
        break;
      case 'zoom':
        this.actualZoom = (operation.operation as ZoomChange).oldZoom;
        break;
      case 'flip':
        const op = operation.operation as FlipChange;
        if (op.flipType === 'horizontal') {
          this.flipHorizontal = op.oldFlipValue;
        } else if (op.flipType === 'vertical') {
          this.flipVertical = op.oldFlipValue;
        }
        break;
      case 'brightness':
        this.brightness = this.brightness2 = (operation.operation as FilterChange).oldValue;
        break;
      case 'contrast':
        this.contrast = this.contrast2 = (operation.operation as FilterChange).oldValue;
        break;
      case 'saturate':
        this.saturate = this.saturate2 = (operation.operation as FilterChange).oldValue;
        break;
      case 'color':
        this.background = this.background2 = (operation.operation as ColorChange).oldColor;
        break;
      case 'grayscale':
        this.grayscale = this.grayscale2 = (operation.operation as FilterChange).oldValue;
        break;
    }

    this.drawCurrentImage();
  }

  goThere() {
    if (!this.historyService.canNext) { return; }
    const operation = this.historyService.getNextItem();

    switch (operation.type) {
      case 'rotate':
        this.currentAngle = (operation.operation as RotateOperation).newAngle;
        break;
      case 'crop':
        this.selectedCropSetting = (operation.operation as CutOperation).newSetting;
        break;
      case 'zoom':
        this.actualZoom = (operation.operation as ZoomChange).newZoom;
        break;
      case 'flip':
        const op = operation.operation as FlipChange;
        if (op.flipType === 'horizontal') {
          this.flipHorizontal = op.newFlipValue;
        } else if (op.flipType === 'vertical') {
          this.flipVertical = op.newFlipValue;
        }
        break;
      case 'brightness':
        this.brightness = this.brightness2 = (operation.operation as FilterChange).newValue;
        break;
      case 'contrast':
        this.contrast = this.contrast2 = (operation.operation as FilterChange).newValue;
        break;
      case 'saturate':
        this.saturate = this.saturate2 = (operation.operation as FilterChange).newValue;
        break;
      case 'color':
        this.background = this.background2 = (operation.operation as ColorChange).newColor;
        break;
      case 'grayscale':
        this.grayscale = this.grayscale2 = (operation.operation as FilterChange).newValue;
        break;
    }

    this.drawCurrentImage();
  }

  setZoom(mode: ZoomType, value?: number) {
    switch (mode) {
      case 'up':
        const newValue = this.actualZoom.value + 0.1;
        const newZoomData: ZoomInfo = { text: parseInt((newValue * 100).toString(), 10).toString(), value: newValue };
        this.historyService.pushItem('zoom', { oldZoom: this.actualZoom, newZoom: newZoomData } as ZoomChange);
        this.actualZoom = newZoomData;
        break;
      case 'down':
        const newValueDown = this.actualZoom.value - 0.1;
        const newDownZoomData: ZoomInfo = { text: parseInt((newValueDown * 100).toString(), 10).toString(), value: newValueDown };
        this.historyService.pushItem('zoom', { oldZoom: this.actualZoom, newZoom: newDownZoomData } as ZoomChange);
        this.actualZoom = newDownZoomData;
        break;
      case 'custom':
        const customZoomData: ZoomInfo = { text: parseInt((value * 100).toString(), 10).toString(), value };
        this.historyService.pushItem('zoom', { oldZoom: this.actualZoom, newZoom: customZoomData } as ZoomChange);
        this.actualZoom = customZoomData;
        break;
    }

    this.drawCurrentImage();
  }

  get currentZoom() { return this.actualZoom; }
  get currentZoomText() { return this.currentZoom.text; }
  set currentZoomText(_: string) { }

  setBrightness(value: number) {
    if (value !== this.brightness2) {
      this.historyService.pushItem('brightness', { newValue: value, oldValue: this.brightness2 } as FilterChange);
      this.brightness2 = value;
      this.drawCurrentImage();
    }
  }

  setContrast(value: number) {
    if (value !== this.contrast2) {
      this.historyService.pushItem('contrast', { newValue: value, oldValue: this.contrast2 } as FilterChange);
      this.contrast2 = value;
      this.drawCurrentImage();
    }
  }

  setSaturate(value: number) {
    if (value !== this.saturate2) {
      this.historyService.pushItem('saturate', { oldValue: this.saturate2, newValue: value } as FilterChange);
      this.saturate2 = value;
      this.drawCurrentImage();
    }
  }

  setBackground(color: string) {
    if (this.background2 !== color) {
      this.historyService.pushItem('color', { newColor: color, oldColor: this.background2 } as ColorChange);
      this.background2 = color;
      this.drawCurrentImage();
    }
  }

  setGrayscale(value: number) {
    if (this.grayscale2 !== value) {
      this.historyService.pushItem('grayscale', { newValue: value, oldValue: this.grayscale2 } as FilterChange);
      this.grayscale2 = value;
      this.drawCurrentImage();
    }
  }

  get bitmapImage() {
    return this.canvas.nativeElement.toDataURL('image/png', 1.0);
  }
}
