import WebEmitter from '@/tools/WebEmitter';

export default class ElectronEmitter extends WebEmitter {
  constructor(...string: string[]) {
    super();
    window.eBus = this;
    string.forEach((el) => {
      window.glxApi.on(el, (event, data) => {
        this.emit(el, data);
      });
    });
  }
}
