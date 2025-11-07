import { BaseAction, BaseCache, IBaseKernelModule } from '@grandlinex/e-kernel';

export default class LockAction extends BaseAction {
  constructor(module: IBaseKernelModule<any, any, any>) {
    super('lock-account', module);
    this.handler = this.handler.bind(this);
  }

  async handler() {
    const cache = this.getModule().getCache() as BaseCache;
    await cache.set('login', '0');
    this.log(cache);
  }
}
