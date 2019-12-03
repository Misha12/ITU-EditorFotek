import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators'

export enum ModeType {
  crop,
  color,
  rotate
}

@Component({
  selector: 'app-bottom',
  templateUrl: './bottom.component.html',
  styleUrls: ['./bottom.component.scss']
})
export class BottomComponent implements OnInit {
  mode = ModeType.crop;

  constructor(router: Router) {
    router.events
      .pipe(filter(ev => ev instanceof NavigationEnd))
      .subscribe((x: NavigationEnd) => {
        switch (x.url.toLowerCase()) {
          case '/rotate':
            this.mode = ModeType.rotate;
            break;
          case '/color':
            this.mode = ModeType.color;
            break;
          default:
            this.mode = ModeType.crop;
            break;
        }
      });
  }

  ngOnInit() {
  }

}
