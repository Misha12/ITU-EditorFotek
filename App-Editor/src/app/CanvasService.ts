import { Injectable, ElementRef } from '@angular/core';
import { CropSetting } from './crop-tools/crop-tools.component';

export interface Size { width: number; height: number; }
interface Rectangle extends Size { x: number; y: number; }

interface HistoryItem { type: string; operation: any; }
interface CutOperation { oldSetting: CropSetting; newSetting: CropSetting; }
interface RotateOperation { oldAngle: number; newAngle: number; }
interface ColorChange { oldColor: string; newColor: string; }
interface ZoomInfo { text: string; value: number; }
interface ZoomChange { oldZoom: ZoomInfo; newZoom: ZoomInfo; }
interface FlipChange { flipType: 'horizontal' | 'vertical'; oldFlipValue: boolean; newFlipValue: boolean; }
interface FilterChange { oldValue: number; newValue: number; }

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  context: CanvasRenderingContext2D;
  canvas: ElementRef<HTMLCanvasElement>;
  margin = 50;

  actualZoom: ZoomInfo = { text: '100', value: 1 };

  imageFile: File;
  currentImg: HTMLImageElement;
  currentAngle = 0;
  flipHorizontal = false;
  flipVertical = false;
  canMove = false;
  selectedCropSetting: CropSetting;

  history: HistoryItem[] = [];
  thereHistory: HistoryItem[] = [];
  brightness = 100;
  brightness2 = 100;
  contrast = 100;
  contrast2 = 100;
  saturate = 100;
  saturate2 = 100;
  background = '#585858';
  background2 = '#585858';
  grayscale = 0;
  grayscale2 = 0;

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
        this.drawCurrentImage(ev);
      }
    };

    this.canvas.nativeElement.onmouseup = (_) => {
      this.canMove = false;
    };

    this.canvas.nativeElement.onmousedown = (_) => {
      this.canMove = true;
    };

    if (resize && this.currentImg) {
      this.drawCurrentImage(null);
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
        this.selectedCropSetting = null;
        this.drawCurrentImage(null);
      };

      img.src = (e.target as any).result.toString();
    };

    reader.readAsDataURL(file);
  }

  private computeResolution(img: HTMLImageElement): Rectangle {
    const maxWidth = this.canvas.nativeElement.width - this.margin;
    const maxHeight = this.canvas.nativeElement.height - this.margin;
    let ratio = 0;
    const rect: Rectangle = { x: 0, y: 0, width: 300, height: 300 };

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

  drawCurrentImage(mouseEvent: MouseEvent) {
    const resolution = this.computeResolution(this.currentImg);

    let scaleH = this.flipHorizontal ? -1 : 1;
    let scaleV = this.flipVertical ? -1 : 1;

    scaleH *= this.actualZoom.value;
    scaleV *= this.actualZoom.value;

    const canvasX = mouseEvent ? mouseEvent.x : this.canvas.nativeElement.width / 2.0;
    const canvasY = mouseEvent ? mouseEvent.y : this.canvas.nativeElement.height / 2.0;

    this.clear();
    this.context.fillStyle = this.background;
    this.context.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.context.save();
    this.context.translate(canvasX, canvasY);
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

    this.pushHistory('rotate', logItem);
    this.currentAngle = ang;
    this.drawCurrentImage(null);
    return this.currentAngle;
  }

  setFlip(mode: 'horizontal' | 'vertical') {
    if (mode === 'horizontal') {
      this.pushHistory('flip', { flipType: mode, oldFlipValue: this.flipHorizontal, newFlipValue: !this.flipHorizontal });
      this.flipHorizontal = !this.flipHorizontal;
    } else if (mode === 'vertical') {
      this.pushHistory('flip', { flipType: mode, oldFlipValue: this.flipVertical, newFlipValue: !this.flipVertical });
      this.flipVertical = !this.flipVertical;
    }

    this.drawCurrentImage(null);
  }

  renderCropArray(setting: CropSetting) {
    if (!this.currentImg) { return; }
    this.pushHistory('crop', { oldSetting: this.selectedCropSetting, newSetting: setting });
    this.selectedCropSetting = setting;
    this.drawCurrentImage(null);
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
    const cutAspectRatio = this.selectedCropSetting.ratioX / this.selectedCropSetting.ratioY;

    if (imageAspectRatio > cutAspectRatio) {
      cropSize.height = imageResolution.height;
      cropSize.width = imageResolution.height / cutAspectRatio;
    } else {
      cropSize.width = imageResolution.width;
      cropSize.height = imageResolution.width / cutAspectRatio;
    }

    return cropSize;
  }

  getDarkRectangles(excludedRectangle: Rectangle): Rectangle[] {
    const rectangles: Rectangle[] = [];

    rectangles.push({ x: 0, y: 0, width: this.canvas.nativeElement.width, height: excludedRectangle.y });
    rectangles.push({ x: 0, y: excludedRectangle.y, width: excludedRectangle.x, height: excludedRectangle.y + excludedRectangle.height });
    // tslint:disable-next-line: max-line-length
    rectangles.push({ x: excludedRectangle.x, y: excludedRectangle.y + excludedRectangle.height, width: excludedRectangle.width, height: this.canvas.nativeElement.height });
    // tslint:disable-next-line: max-line-length
    rectangles.push({ x: excludedRectangle.x + excludedRectangle.width, y: excludedRectangle.y, height: this.canvas.nativeElement.height, width: this.canvas.nativeElement.width });

    return rectangles;
  }

  resetHistory(redraw: boolean = true) {
    this.currentAngle = 0;
    this.flipHorizontal = false;
    this.flipVertical = false;
    this.selectedCropSetting = undefined;
    this.history = [];
    this.thereHistory = [];
    this.brightness = this.brightness2 = 100;
    this.contrast = this.contrast2 = 100;
    this.saturate = this.saturate2 = 100;
    this.background = this.background2 = '#585858';
    this.grayscale = this.grayscale2 = 0;
    this.actualZoom = { text: '100', value: 1 };

    if (redraw) {
      this.drawCurrentImage(undefined);
    }
  }

  pushHistory(operationType: string, operation: any) {
    this.thereHistory = [];
    this.history.push({ type: operationType, operation });
    console.log(this.history);
  }

  goBack() {
    if (!this.canBack()) { return; }
    const operation = this.history.pop();

    switch (operation.type) {
      case 'rotate':
        this.currentAngle = (operation.operation as RotateOperation).oldAngle;
        this.drawCurrentImage(null);
        break;
      case 'crop':
        this.selectedCropSetting = (operation.operation as CutOperation).oldSetting;
        this.drawCurrentImage(null);
        break;
      case 'zoom':
        this.actualZoom = (operation.operation as ZoomChange).oldZoom;
        this.drawCurrentImage(null);
        break;
      case 'flip':
        const op = operation.operation as FlipChange;
        if (op.flipType === 'horizontal') {
          this.flipHorizontal = op.oldFlipValue;
        } else if (op.flipType === 'vertical') {
          this.flipVertical = op.oldFlipValue;
        }
        this.drawCurrentImage(null);
        break;
      case 'brightness':
        this.brightness = this.brightness2 = (operation.operation as FilterChange).oldValue;
        this.drawCurrentImage(null);
        break;
      case 'contrast':
        this.contrast = this.contrast2 = (operation.operation as FilterChange).oldValue;
        this.drawCurrentImage(null);
        break;
      case 'saturate':
        this.saturate = this.saturate2 = (operation.operation as FilterChange).oldValue;
        this.drawCurrentImage(null);
        break;
      case 'color':
        this.background = this.background2 = (operation.operation as ColorChange).oldColor;
        this.drawCurrentImage(null);
        break;
      case 'grayscale':
        this.grayscale = this.grayscale2 = (operation.operation as FilterChange).oldValue;
        this.drawCurrentImage(null);
        break;
    }

    this.thereHistory.push(operation);
  }

  canBack() { return this.history.length > 0; }
  canThere() { return this.thereHistory.length > 0; }

  goThere() {
    if (!this.canThere()) { return; }
    const operation = this.thereHistory.pop();

    switch (operation.type) {
      case 'rotate':
        this.currentAngle = (operation.operation as RotateOperation).newAngle;
        this.drawCurrentImage(null);
        break;
      case 'crop':
        this.selectedCropSetting = (operation.operation as CutOperation).newSetting;
        this.drawCurrentImage(null);
        break;
      case 'zoom':
        this.actualZoom = (operation.operation as ZoomChange).newZoom;
        this.drawCurrentImage(null);
        break;
      case 'flip':
        const op = operation.operation as FlipChange;
        if (op.flipType === 'horizontal') {
          this.flipHorizontal = op.newFlipValue;
        } else if (op.flipType === 'vertical') {
          this.flipVertical = op.newFlipValue;
        }
        this.drawCurrentImage(null);
        break;
      case 'brightness':
        this.brightness = this.brightness2 = (operation.operation as FilterChange).newValue;
        this.drawCurrentImage(null);
        break;
      case 'contrast':
        this.contrast = this.contrast2 = (operation.operation as FilterChange).newValue;
        this.drawCurrentImage(null);
        break;
      case 'saturate':
        this.saturate = this.saturate2 = (operation.operation as FilterChange).newValue;
        this.drawCurrentImage(null);
        break;
      case 'color':
        this.background = this.background2 = (operation.operation as ColorChange).newColor;
        this.drawCurrentImage(null);
        break;
      case 'grayscale':
        this.grayscale = this.grayscale2 = (operation.operation as FilterChange).newValue;
        this.drawCurrentImage(null);
        break;
    }

    this.history.push(operation);
  }

  setZoom(mode: 'up' | 'down' | 'custom', value?: number) {
    switch (mode) {
      case 'up':
        const newValue = this.actualZoom.value + 0.1;
        const newZoomData: ZoomInfo = { text: parseInt((newValue * 100).toString(), 10).toString(), value: newValue };
        this.pushHistory('zoom', { oldZoom: this.actualZoom, newZoom: newZoomData });
        this.actualZoom = newZoomData;
        this.drawCurrentImage(null);
        break;
      case 'down':
        const newValueDown = this.actualZoom.value - 0.1;
        const newDownZoomData: ZoomInfo = { text: parseInt((newValueDown * 100).toString(), 10).toString(), value: newValueDown };
        this.pushHistory('zoom', { oldZoom: this.actualZoom, newZoom: newDownZoomData });
        this.actualZoom = newDownZoomData;
        this.drawCurrentImage(null);
        break;
      case 'custom':
        const customZoomData: ZoomInfo = { text: parseInt((value * 100).toString(), 10).toString(), value };
        this.pushHistory('zoom', { oldZoom: this.actualZoom, newZoom: customZoomData });
        this.actualZoom = customZoomData;
        this.drawCurrentImage(null);
        break;
    }
  }

  get currentZoom() {
    return this.actualZoom;
  }

  get currentZoomText() { return this.actualZoom.text; }

  setBrightness(value: number) {
    if (value !== this.brightness2) {
      this.pushHistory('brightness', { newValue: value, oldValue: this.brightness2 } as FilterChange);
      this.brightness2 = value;
      this.drawCurrentImage(null);
    }
  }

  setContrast(value: number) {
    if (value !== this.contrast2) {
      this.pushHistory('contrast', { newValue: value, oldValue: this.contrast2 } as FilterChange);
      this.contrast2 = value;
      this.drawCurrentImage(null);
    }
  }

  setSaturate(value: number) {
    if (value !== this.saturate2) {
      this.pushHistory('saturate', { oldValue: this.saturate2, newValue: value } as FilterChange);
      this.saturate2 = value;
      this.drawCurrentImage(null);
    }
  }

  setBackground(color: string) {
    if (this.background2 !== color) {
      this.pushHistory('color', { newColor: color, oldColor: this.background2 } as ColorChange);
      this.background2 = color;
      this.drawCurrentImage(null);
    }
  }

  setGrayscale(value: number) {
    if (this.grayscale2 !== value) {
      this.pushHistory('grayscale', { newValue: value, oldValue: this.grayscale2 } as FilterChange);
      this.grayscale2 = value;
      this.drawCurrentImage(null);
    }
  }
}
