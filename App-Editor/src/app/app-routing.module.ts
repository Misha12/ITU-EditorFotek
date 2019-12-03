import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CropToolsComponent } from './crop-tools/crop-tools.component';
import { ColorToolsComponent } from './color-tools/color-tools.component';
import { RotateToolsComponent } from './rotate-tools/rotate-tools.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'free-crop',
    pathMatch: 'full'
  },
  {
    path: 'crop',
    component: CropToolsComponent
  },
  {
    path: 'color',
    component: ColorToolsComponent
  },
  {
    path: 'rotate',
    component: RotateToolsComponent
  },
  {
    path: 'free-crop',
    component: CropToolsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
