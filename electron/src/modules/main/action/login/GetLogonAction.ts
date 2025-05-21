import {
  BaseAction,
  IBaseKernelModule,
  InMemCache,
} from '@grandlinex/e-kernel';

export default class GetLogonAction extends BaseAction {
  constructor(moduele: IBaseKernelModule<any, any, any>) {
    super('logon-env', moduele);
    this.handler = this.handler.bind(this);
  }

  async handler(event: Electron.IpcMainInvokeEvent): Promise<any> {
    const kernel = this.getEKernel();
    const kdb = kernel.getDb();
    const cc = kernel.hasCryptoClient();

    const existingUser = await kdb.configExist('hash');

    const cache = this.getModule().getCache() as InMemCache;
    const loginC = await cache.get('login');

    const login = cc && loginC === '1';
    const isNew = !existingUser;

    const view = 0;
    const title = 'Home';

    return {
      darkMode: true,
      init: true,
      isNew,
      login,
      title,
      userName: 'User',
      connected: false,
      view,
      token: null,
    };
  }
}
