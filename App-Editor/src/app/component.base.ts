import { DeviceDetectorService } from 'ngx-device-detector';

export abstract class ComponentBase {
  constructor(
    protected deviceDetector: DeviceDetectorService
  ) { }

  get isMobile() {
    return this.deviceDetector.isMobile();
  }

  get isTablet() {
    return this.deviceDetector.isTablet();
  }

  get isDesktop() {
    return this.deviceDetector.isDesktop();
  }
}
