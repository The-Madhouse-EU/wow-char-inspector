import {
  BaseAction,
  BaseCache,
  CoreCryptoClient,
  IBaseKernelModule,
} from '@grandlinex/e-kernel';

export default class InitLoginAction extends BaseAction {
  constructor(module: IBaseKernelModule<any, any, any>) {
    super('init-login', module);
    this.handler = this.handler.bind(this);
  }

  async handler(
    event: Electron.IpcMainInvokeEvent,
    args: { password: string },
  ): Promise<any> {
    const kernel = this.getEKernel();
    const db = kernel.getDb();

    const result = {
      error: false,
      offline: false,
      message: 'User Created',
    };
    if (db === null) {
      result.message = 'NO DB';
      return result;
    }
    const hasHash = await db.configExist('hash');
    if (!hasHash) {
      result.error = true;
      result.message = 'User not exist';
      return result;
    }
    const hash = await db.getConfig('hash');

    if (!args.password && args.password === '') {
      result.error = true;
      result.message = 'No Password';
      return result;
    }

    const tempCryptoClient = new CoreCryptoClient(
      kernel,
      CoreCryptoClient.fromPW(args.password),
    );
    const seed = (await db.getConfig('seed'))?.c_value;
    if (
      !seed ||
      (seed && tempCryptoClient.getHash(seed, args.password) !== hash?.c_value)
    ) {
      result.error = true;
      result.message = 'Wrong Password';
      return result;
    }
    const cache = this.getModule().getCache() as BaseCache;
    if (await cache.exist('login')) {
      await cache.set('login', '1');
      result.offline = kernel.getOffline();
      return result;
    }
    kernel.setCryptoClient(tempCryptoClient);

    await cache.set('login', '1');
    kernel.getMainWindow()?.maximize();

    result.offline = kernel.getOffline();

    return result;
  }
}
