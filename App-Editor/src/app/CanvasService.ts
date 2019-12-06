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
                const resolution = this.computeResolution(img);

                this.clear();
                this.context.drawImage(img, resolution.x, resolution.y, resolution.width, resolution.height);
            };

            img.src = (e.target as any).result.toString();
        };

        reader.readAsDataURL(file);
    }

    private computeResolution(img: HTMLImageElement): Rectangle {
        const canvasWidth = this.canvas.nativeElement.width - this.margin;
        const canvasHeight = this.canvas.nativeElement.height - this.margin;
        const rect: Rectangle = { x: 0, y: 0, width: 300, height: 300 };

        if (img.width > canvasWidth) {
            rect.x = this.margin / 2.0; // Obrázek přetíká na šířku
            rect.width = canvasWidth;
        } else {
            rect.x = (this.canvas.nativeElement.width / 2.0) - (img.width / 2.0);
            rect.width = img.width;
        }

        if (img.height > canvasHeight) {
            rect.y = this.margin / 2.0; // Obrázek přetíká na výšku.
            rect.height = canvasHeight;
        } else {
            rect.y = (this.canvas.nativeElement.height / 2.0) - (img.height / 2.0);
            rect.height = img.height;
        }

        return rect;
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    }
}
