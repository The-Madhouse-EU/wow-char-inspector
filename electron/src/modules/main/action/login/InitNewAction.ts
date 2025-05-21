import {
  BaseAction,
  BaseCache,
  CoreCryptoClient,
  IBaseKernelModule,
} from '@grandlinex/e-kernel';

export default class InitNewAction extends BaseAction {
  constructor(module: IBaseKernelModule<any, any, any>) {
    super('init-new', module);
    this.handler = this.handler.bind(this);
  }

  async handler(
    event: Electron.IpcMainInvokeEvent,
    args: { password: string },
  ): Promise<any> {
    const db = this.getKernel().getDb();

    const result = {
      error: false,
      message: 'User Created',
      offline: false,
    };
    if (db === null) {
      result.message = 'NO DB';
      return result;
    }
    const newUser = await db.configExist('hash');
    if (newUser) {
      result.error = true;
      result.message = 'User exist';
      return result;
    }
    if (!args.password && args.password === '') {
      result.error = true;
      result.message = 'No Password';
      return result;
    }

    const cryptoClient = new CoreCryptoClient(
      this.getKernel(),
      CoreCryptoClient.fromPW(args.password),
    );
    const seed = await cryptoClient.generateSecureToken(4);
    await db.setConfig('seed', seed);
    await db.setConfig('hash', cryptoClient.getHash(seed, args.password));
    this.getKernel().setCryptoClient(cryptoClient);
    const cache = this.getModule().getCache() as BaseCache;
    await cache.set('login', '1');
    return result;
  }
}
