import { BaseKernelModule, IKernel, InMemCache } from '@grandlinex/e-kernel';
import InitLoginAction from './action/login/InitLoginAction';
import InitNewAction from './action/login/InitNewAction';
import LockAction from './action/login/LockAction';
import GetLogonAction from './action/login/GetLogonAction';

export default class MainModule extends BaseKernelModule<
  null,
  null,
  InMemCache
> {
  constructor(kernel: IKernel) {
    super('main', kernel);

    this.addAction(
      new GetLogonAction(this),
      new InitLoginAction(this),
      new InitNewAction(this),
      new LockAction(this),
    );
  }

  async initModule(): Promise<void> {
    this.setCache(new InMemCache(this));
  }
}
