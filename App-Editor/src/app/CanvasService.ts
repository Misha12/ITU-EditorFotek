import { Injectable, ElementRef } from '@angular/core';
import { CropSetting } from './crop-tools/crop-tools.component';

export interface Size {
  width: number;
  height: number;
}

interface Rectangle extends Size {
  x: number;
  y: number;
}

interface HistoryItem {
  type: string;
  operation: CutOperation | RotateOperation | ColorChange;
}

interface CutOperation {
  oldSetting: CropSetting;
  newSetting: CropSetting;
}

interface RotateOperation {
  oldAngle: number;
  newAngle: number;
}

interface ColorChange {

}

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  context: CanvasRenderingContext2D;
  canvas: ElementRef<HTMLCanvasElement>;
  margin = 50;

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

    const scaleH = this.flipHorizontal ? -1 : 1;
    const scaleV = this.flipVertical ? -1 : 1;

    const canvasX = mouseEvent ? mouseEvent.x : this.canvas.nativeElement.width / 2.0;
    const canvasY = mouseEvent ? mouseEvent.y : this.canvas.nativeElement.height / 2.0;

    this.clear();
    this.context.save();
    this.context.translate(canvasX, canvasY);
    this.context.scale(scaleH, scaleV);
    this.context.rotate(this.degreeToRad(this.currentAngle));

    this.context.drawImage(this.currentImg, -resolution.width / 2.0, -resolution.height / 2.0, resolution.width, resolution.height);
    this.context.restore();

    console.log(this.selectedCropSetting);
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
      this.flipHorizontal = !this.flipHorizontal;
    } else if (mode === 'vertical') {
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

    this.drawCurrentImage(undefined);
  }

  pushHistory(operationType: string, operation: RotateOperation | CutOperation | ColorChange) {
    this.thereHistory = [];
    this.history.push({ type: operationType, operation });
    console.log(this.history);
  }

  goBack() {
    if (!this.canBack()) { return; }
    const operation = this.history.pop();

    // TODO: Push to another for go there.
    switch (operation.type) {
      case 'rotate':
        this.currentAngle = (operation.operation as RotateOperation).oldAngle;
        this.drawCurrentImage(null);
        break;
      case 'crop':
        this.selectedCropSetting = (operation.operation as CutOperation).oldSetting;
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
    }

    this.history.push(operation);
  }
}
