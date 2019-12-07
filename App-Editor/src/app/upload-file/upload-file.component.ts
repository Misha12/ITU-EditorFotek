import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  files: any = [];

  uploadFile(event) {
    const element = event;
    this.files.push(element.name);
  }

}
