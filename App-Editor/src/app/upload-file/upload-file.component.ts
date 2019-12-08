import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {
  @Output() fileUploaded = new EventEmitter<File>();

  constructor() { }

  ngOnInit() {
  }

  uploadFile(event: any) {
    if (event instanceof FileList) {
      const list = event as FileList;
      if (list.length > 0 && list[0]) {
        this.fileUploaded.emit(list[0] as File);
      }
    }
  }

}
