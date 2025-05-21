import { app, dialog, shell } from 'electron';
import { BaseKernelModule, IKernel, InMemCache } from '@grandlinex/e-kernel';
import axios from 'axios';
import InitLoginAction from './action/login/InitLoginAction';
import InitNewAction from './action/login/InitNewAction';
import LockAction from './action/login/LockAction';
import GetLogonAction from './action/login/GetLogonAction';
import VersionMatcher from '../../util/VersionMatcher';

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

    if (!this.getKernel().getDevMode()) {
      try {
        const version = app.getVersion();

        const release = await axios.get<{
          html_url: string;
          tag_name: string;
        }>(
          'https://api.github.com/repos/The-Madhouse-EU/wow-char-inspector/releases/latest',
        );

        if (
          release.data &&
          VersionMatcher(version || '', release.data.tag_name)
        ) {
          const result = await dialog.showMessageBox({
            title: 'Madhouse Benachrichtigung',
            message: `Aktuelle Version: ${version}\nNeue Version ${release.data.tag_name} ist Verfügbar.`,
            type: 'info',
            buttons: ['Jetzt Aktualisieren', 'Überspringen'],
          });

          if (result.response === 0) {
            await shell.openExternal(release.data.html_url);
            process.exit(0);
          }
        }
      } catch (e) {
        this.error(e);
      }
    }
  }
}
