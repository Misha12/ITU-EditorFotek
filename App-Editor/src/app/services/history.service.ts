import { Injectable } from '@angular/core';
import { CropSetting } from '../crop-tools/crop-tools.component';

export type OperationType = CutOperation | RotateOperation | ColorChange | ZoomChange | FlipChange | FilterChange | CropChange;
export type OperationTypeName = 'cut' | 'rotate' | 'color' | 'zoom' | 'flip' | 'filter' | 'crop' | 'brightness' | 'saturate' | 'contrast' | 'grayscale';
export type FlipType = 'horizontal' | 'vertical';

export interface HistoryItem {
  type: OperationTypeName;
  operation: OperationType;
}

export interface CutOperation { oldSetting: CropSetting; newSetting: CropSetting; }
export interface RotateOperation { oldAngle: number; newAngle: number; }
export interface ColorChange { oldColor: string; newColor: string; }
export interface ZoomInfo { text: string; value: number; }
export interface ZoomChange { oldZoom: ZoomInfo; newZoom: ZoomInfo; }
export interface FlipChange { flipType: FlipType; oldFlipValue: boolean; newFlipValue: boolean; }
export interface FilterChange { oldValue: number; newValue: number; }
export interface CropChange { oldCrop: CropSetting; newCrop: CropSetting; }

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private data: HistoryItem[] = [];

  private actualPos = 0; // Actual position of history.

  constructor() { }

  get size() {
    return this.data.length;
  }

  get canNext() {
    return this.actualPos < this.size;
  }

  get canPrev() {
    return this.actualPos > 0;
  }

  pushItem(operationName: OperationTypeName, operation: OperationType) {
    this.data.push({ type: operationName, operation });
    this.actualPos = this.size;
  }

  getPrevItem(): HistoryItem {
    this.actualPos--;
    return this.data[this.actualPos];
  }

  getNextItem(): HistoryItem {
    this.actualPos++;
    return this.data[this.actualPos - 1];
  }

  reset() {
    this.data = [];
    this.actualPos = 0;
  }
}
