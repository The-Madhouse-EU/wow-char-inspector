import { app } from 'electron';
import Kernel from './Kernel';
// run this as early in the main process as possible
// eslint-disable-next-line global-require,import/no-extraneous-dependencies
if (require('electron-squirrel-startup')) app.quit();

const kernel = new Kernel();

kernel.start();
