import { app, BrowserWindow } from 'electron';
import { IKernel, isDev, KernelWindowName } from '@grandlinex/e-kernel';

export default async function createWindow(kernel: IKernel) {
  const window = kernel
    .getWindowManager()
    .create(KernelWindowName.MAIN, (w) => {
      const mainWindow = new BrowserWindow({
        ...w,
        backgroundColor: '#2e2c29',
        frame: false,
        webPreferences: {
          ...w.webPreferences,
          additionalArguments: [isDev() ? '1' : '0', app.getVersion()],
        },
      });
      mainWindow.setMenu(null);
      return mainWindow;
    });

  try {
    if (kernel.getDevMode()) {
      await window.loadURL('http://localhost:9000');
    } else {
      await window.loadFile(kernel.getAppRoot());
    }
  } catch (e) {
    kernel.error(e);
  }
}
