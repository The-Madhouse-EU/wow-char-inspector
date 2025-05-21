import Path from 'path';
import ElectronKernel, {
  ElectronGlobals,
  isDev,
  LogLevel,
  OsRelease,
  StoreGlobal,
} from '@grandlinex/e-kernel';
import { app } from 'electron';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';
import ELogger from '@grandlinex/bundle-elogger';
import SQLCon from '@grandlinex/bundle-sqlight';
import MainModule from './modules/main/MainModule';

import InitTray from './Tray';
import createWindow from './window/createWindow';
import CharModule from './modules/character/CharModule';

/**
 * Define global resource path
 */

/**
 * Override the preload glx default
 * ```typescript
 * const preload = Path.join(app.getAppPath(), 'html' ,'preload.html');
 * ```
 */

const preload = Path.join(app.getAppPath(), 'res', 'preload.html');
const appRoot = Path.join(app.getAppPath(), 'res', 'ui', 'index.html');
const imgPath = Path.join(app.getAppPath(), 'res', 'img');
/**
 * Override config path in dev mode to current folder
 */
let config: string | undefined;
if (isDev()) {
  config = Path.join(app.getAppPath(), 'config');
} else {
  config = undefined;
}

const appName = 'WoWCharInspector';
const appCode = 'wow_char_inspector';

const gotTheLock = app.requestSingleInstanceLock();

export default class Kernel extends ElectronKernel {
  constructor() {
    super({
      appName,
      appCode,
      appRoot,
      pathOverride: config,
      preloadRoot: preload,
      logger: (kernel) => {
        return new ELogger(kernel);
      },
    });

    this.getModule().setDb(new SQLCon(this.getModule(), '0', true));
    const store = this.getConfigStore();
    store.set(ElectronGlobals.GLX_WINDOW_FRAME, 'false');
    store.set(ElectronGlobals.GLX_WINDOW_H, '700');
    store.set(ElectronGlobals.GLX_WINDOW_W, '1024');
    store.set(StoreGlobal.GLOBAL_LOG_LEVEL, LogLevel.VERBOSE);
    store.set(ElectronGlobals.GLX_IMG_ICON, Path.join(imgPath, 'icon.png'));
    store.set(ElectronGlobals.GLX_IMG_THUMP, Path.join(imgPath, 'icon.png'));

    this.addModule(new MainModule(this), new CharModule(this));
    InitTray(this);

    if (isDev()) {
      /**
       * Install the React dev tools browser extension if starting in DEV mode
       */
      this.log('Install React Dev Tools + Redux Dev Tools');

      this.setDevMode(true);
      app.whenReady().then(async () => {
        await installExtension(REACT_DEVELOPER_TOOLS);
      });
    }
    if (!gotTheLock && store.get(StoreGlobal.GLOBAL_OS) === OsRelease.WIN32) {
      // TODO: Handle Additional Query
      this.log('Second instance detected - shutting down');
      app.quit();
    } else {
      app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        this.log(event, commandLine, workingDirectory);
        try {
          this.getMainWindow()?.show();
        } catch (e) {
          this.error(e);
        }
      });
    }
  }

  // OVERRIDING DEFAULT WINDOW FUNCTION
  async openNewWindow(): Promise<void> {
    await createWindow(this);
  }
}
