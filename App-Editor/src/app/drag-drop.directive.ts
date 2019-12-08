import { Directive, Output, Input, EventEmitter, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appDragDrop]'
})
export class DragDropDirective {
  @Output() fileDropped = new EventEmitter<any>();
  @HostBinding('style.background-color') private background = '#2F2F2F';

  @HostListener('dragover', ['$event'])
  onDragOver(evt: any) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#3A3A3A';
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(evt: any) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#2F2F2F';
  }

  @HostListener('drop', ['$event'])
  ondrop(evt: any) {
    evt.preventDefault();
    evt.stopPropagation();

    const files = evt.dataTransfer.files;
    if (files.length > 0 && files[0]) {
        this.fileDropped.emit(files);
    }
  }

}
