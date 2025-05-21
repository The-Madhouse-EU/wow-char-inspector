import { BaseKernelModule, IKernel, InMemCache } from '@grandlinex/e-kernel';
import CharDB from './db/CharDB';
import InfoAction from './action/InfoAction';
import CharClient from './client/CharClient';
import FolderSelectAction from './action/FolderSelectAction';
import PreloadAction from './action/PreloadAction';
import TestWTFActions from './action/TestWTFAction';

export default class CharModule extends BaseKernelModule<
  CharDB,
  CharClient,
  InMemCache
> {
  constructor(kernel: IKernel) {
    super('CharModule', kernel);
    this.addAction(
      new InfoAction(this),
      new PreloadAction(this),
      new FolderSelectAction(this),
      new TestWTFActions(this),
    );
  }

  async initModule(): Promise<void> {
    this.setCache(new InMemCache(this));
    this.setDb(new CharDB(this));
    this.setClient(new CharClient(this));
  }
}
