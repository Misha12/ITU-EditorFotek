import { ZoomInfo } from './history.service';

export class Defaults {
    public static brightness = 100;
    public static contrast = 100;
    public static saturate = 100;
    public static background = '#585858';
    public static grayscale = 0;

    public static zoomIncrement = 5;
    public static zoomMax = 100;
    public static zoomMin = 0;

    public static zoomInfo: ZoomInfo = { text: '100', value: 1 };
}
