import { BaseAction, IBaseKernelModule } from '@grandlinex/e-kernel';
import path from 'node:path';
import fs from 'node:fs';
import CharDB from '../db/CharDB';
import CharClient from '../client/CharClient';

export default class TestWTFActions extends BaseAction<CharDB, CharClient> {
  constructor(moduele: IBaseKernelModule<any, any, any>) {
    super('test-wtf', moduele);
    this.handler = this.handler.bind(this);
  }

  async handler() {
    const folder = await this.getKernel()
      .getModule()
      .getDb()
      .getConfig('profile-folder');
    this.log('folder');
    this.log(folder);

    let siAddon = false;
    let mhAddon = false;

    if (folder) {
      const siPath = path.join(
        folder.c_value,
        'SavedVariables',
        'SavedInstances.lua',
      );
      siAddon = fs.existsSync(siPath);
      const mhPath = path.join(
        folder.c_value,
        'SavedVariables',
        'MadhousePack.lua',
      );
      mhAddon = fs.existsSync(mhPath);
    }

    return {
      siAddon,
      mhAddon,
    };
  }
}
