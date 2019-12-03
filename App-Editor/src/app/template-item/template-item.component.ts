import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-template-item',
  templateUrl: './template-item.component.html',
  styleUrls: ['./template-item.component.scss']
})
export class TemplateItemComponent implements OnInit {

  @Input() name: string;

  constructor() { }

  ngOnInit() {
  }

}
