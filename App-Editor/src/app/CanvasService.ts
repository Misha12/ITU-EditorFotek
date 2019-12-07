import { Injectable, ElementRef } from '@angular/core';

export interface Size {
  width: number;
  height: number;
}

interface Rectangle extends Size {
  x: number;
  y: number;
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

  get currentSize(): Size {
    if (!this.currentImg) { return null; }
    return { width: this.currentImg.width, height: this.currentImg.height };
  }

  init() {
    const css = window.getComputedStyle(this.canvas.nativeElement);

    this.canvas.nativeElement.width = parseFloat(css.width.replace('px', ''));
    this.canvas.nativeElement.height = parseFloat(css.height.replace('px', ''));
  }

  loadImage(file: File) {
    this.imageFile = file;

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        this.currentImg = img;
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

  drawCurrentImage() {
    const resolution = this.computeResolution(this.currentImg);

    const scaleH = this.flipHorizontal ? -1 : 1;
    const scaleV = this.flipVertical ? -1 : 1;

    this.clear();
    this.context.save();
    this.context.translate(this.canvas.nativeElement.width / 2.0, this.canvas.nativeElement.height / 2.0);
    this.context.scale(scaleH, scaleV);
    this.context.rotate(this.degreeToRad(this.currentAngle));

    this.context.drawImage(this.currentImg, -resolution.width / 2.0, -resolution.height / 2.0, resolution.width, resolution.height);
    this.context.restore();
  }

  degreeToRad(degree: number) { return degree * Math.PI / 180.0; }
  clear() { this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height); }
  fixedRotate(angle: number) { return this.rotateImage(this.currentAngle + angle); }

  rotateImage(angle: number) {
    let ang = angle % 360;

    if (ang > 180) {
      ang = -180 + (ang - 180);
    }

    this.currentAngle = ang;
    this.drawCurrentImage();
    return this.currentAngle;
  }

  setFlip(mode: 'horizontal' | 'vertical') {
    if (mode === 'horizontal') {
      this.flipHorizontal = !this.flipHorizontal;
    } else if (mode === 'vertical') {
      this.flipVertical = !this.flipVertical;
    }

    this.drawCurrentImage();
  }
}
