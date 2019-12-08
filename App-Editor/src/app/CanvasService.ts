import { Injectable, ElementRef } from '@angular/core';
import { CropSetting } from './crop-tools/crop-tools.component';

export interface Size { width: number; height: number; }
interface Rectangle extends Size { x: number; y: number; }

interface HistoryItem {
  type: string;
  operation: CutOperation | RotateOperation | ColorChange | ZoomChange | FlipChange;
}

interface CutOperation { oldSetting: CropSetting; newSetting: CropSetting; }
interface RotateOperation { oldAngle: number; newAngle: number; }

interface ColorChange {

}

interface ZoomInfo { text: string; value: number; }
interface ZoomChange { oldZoomIndex: number; newZoomIndex: number; }
interface FlipChange { flipType: 'horizontal' | 'vertical'; oldFlipValue: boolean; newFlipValue: boolean; }

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  context: CanvasRenderingContext2D;
  canvas: ElementRef<HTMLCanvasElement>;
  margin = 50;

  zoomValues: ZoomInfo[] = [
    { text: '10%', value: 0.1 },
    { text: '20%', value: 0.2 },
    { text: '30%', value: 0.3 },
    { text: '40%', value: 0.4 },
    { text: '50%', value: 0.5 },
    { text: '100%', value: 1.0 },
    { text: '200%', value: 2.0 },
    { text: '300%', value: 3.0 },
    { text: '400%', value: 4.0 },
    { text: '500%', value: 5.0 },
    { text: '1000%', value: 10.0 },
  ];

  private selectedZoomvalue = 5;

  imageFile: File;
  currentImg: HTMLImageElement;
  currentAngle = 0;
  flipHorizontal = false;
  flipVertical = false;
  canMove = false;
  selectedCropSetting: CropSetting;

  history: HistoryItem[] = [];
  thereHistory: HistoryItem[] = [];

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

    if (resize) {
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

    const zoomValue = this.zoomValues[this.selectedZoomvalue];

    scaleH *= zoomValue.value;
    scaleV *= zoomValue.value;

    const canvasX = mouseEvent ? mouseEvent.x : this.canvas.nativeElement.width / 2.0;
    const canvasY = mouseEvent ? mouseEvent.y : this.canvas.nativeElement.height / 2.0;

    this.clear();
    this.context.save();
    this.context.translate(canvasX, canvasY);
    this.context.scale(scaleH, scaleV);
    this.context.rotate(this.degreeToRad(this.currentAngle));

    this.context.drawImage(this.currentImg, -resolution.width / 2.0, -resolution.height / 2.0, resolution.width, resolution.height);
    this.context.restore();

    if (this.selectedCropSetting) {
      const cropResolution = this.calculateCropResolution();

      const rectX = (this.canvas.nativeElement.width / 2.0) - (cropResolution.width / 2);
      const rectY = (this.canvas.nativeElement.height / 2.0) - (cropResolution.height / 2);

      const darkRects = this.getDarkRectangles({ height: cropResolution.height, width: cropResolution.width, x: rectX, y: rectY });

      this.context.strokeStyle = this.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
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

    if (redraw) {
      this.drawCurrentImage(undefined);
    }
  }

  pushHistory(operationType: string, operation: RotateOperation | CutOperation | ColorChange | ZoomChange) {
    this.thereHistory = [];
    this.history.push({ type: operationType, operation });
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
        this.selectedZoomvalue = (operation.operation as ZoomChange).oldZoomIndex;
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
        this.selectedZoomvalue = (operation.operation as ZoomChange).newZoomIndex;
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
    }

    this.history.push(operation);
  }

  setZoom(mode: 'up' | 'down') {
    switch (mode) {
      case 'up':
        this.pushHistory('zoom', { oldZoomIndex: this.selectedZoomvalue, newZoomIndex: ++this.selectedZoomvalue });
        this.drawCurrentImage(null);
        break;
      case 'down':
        this.pushHistory('zoom', { oldZoomIndex: this.selectedZoomvalue, newZoomIndex: --this.selectedZoomvalue });
        this.drawCurrentImage(null);
        break;
    }
  }

  get currentZoom() {
    return this.zoomValues[this.selectedZoomvalue];
  }
}
