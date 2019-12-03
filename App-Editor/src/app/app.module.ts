import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HeaderComponent } from './header/header.component';
import { BodyComponent } from './body/body.component';
import { BottomComponent } from './bottom/bottom.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { TemplateItemComponent } from './template-item/template-item.component';
import { FreeCropPanelComponent } from './free-crop-panel/free-crop-panel.component';
import { CropDescriptionBottomPanelComponent } from './crop-description-bottom-panel/crop-description-bottom-panel.component';
import { ColorToolsComponent } from './color-tools/color-tools.component';
import { RotateToolsComponent } from './rotate-tools/rotate-tools.component';
import { CropToolsComponent } from './crop-tools/crop-tools.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    BodyComponent,
    BottomComponent,
    ToolBarComponent,
    TemplateItemComponent,
    FreeCropPanelComponent,
    CropDescriptionBottomPanelComponent,
    ColorToolsComponent,
    RotateToolsComponent,
    CropToolsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js')
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
