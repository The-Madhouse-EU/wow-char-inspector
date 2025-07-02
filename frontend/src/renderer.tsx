import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { createRoot } from 'react-dom/client';
import './app.scss';
import {
  cnx,
  Grid,
  IOBrowsersOutline,
  IOClose,
  IOFolder,
  IOSyncCircleOutline,
  ISize,
  IXMinimize,
  Tooltip,
  useQData,
} from '@grandlinex/react-components';
import ElectronEmitter from '@/tools/ElectronEmitter';
import App, { AppRefType } from '@/App';
import { PreloadData } from '@/lib';
import Logo from '@/component/Logo';

const root = createRoot(document.getElementById('root')!);

declare global {
  interface Window {
    eBus: ElectronEmitter;
  }
}

const maxTimer = 300;
function Root() {
  const [preload, , reloadPreload] = useQData<PreloadData>(async () => {
    return window.glxApi.invoke('get-preload', { preload: true });
  });

  const ref = useRef<AppRefType>(null);
  const [timer, setTimer] = useState(maxTimer);
  useEffect(() => {
    const timeOut = setInterval(() => {
      setTimer((n) => {
        if (n > 0) {
          return n - 1;
        }
        ref.current?.update();
        return maxTimer;
      });
    }, 1000);
    return () => {
      clearInterval(timeOut);
    };
  }, [setTimer, ref]);
  return (
    <div id="mount" className={cnx('root', 'new-theme')}>
      <ToastContainer
        position="top-right"
        autoClose={6000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <header className="glx-flex glx-flex-r glx-flex-space-between">
        <Grid flex flexR gap={8} vCenter className="glx-pl-8">
          <Logo />
          <div>World of Warcraft - Character Explorer</div>
        </Grid>
        <Grid flex flexR gap={8} vCenter className="glx-pl-8 keys">
          <Tooltip text="Aktualisieren" position="bottom">
            <button
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px',
              }}
              type="button"
              onClick={() => {
                setTimer(maxTimer);
                ref.current?.update();
              }}
            >
              <IOSyncCircleOutline height={ISize.SM} width={ISize.SM} />
              <span style={{ fontSize: '24px' }}>{timer}</span>
            </button>
          </Tooltip>
          <Tooltip text="Öffne WoWHead" position="bottom">
            <button
              className="wowhead-img"
              type="button"
              onClick={() => {
                window.glxApi.coreFunctions.openExternal({
                  url: 'https://www.wowhead.com',
                  external: true,
                });
              }}
            />
          </Tooltip>
          <Tooltip text="Config Ordner öffnen" position="bottom">
            <button
              type="button"
              onClick={() => {
                window.glxApi.coreFunctions.openConfigFolder();
              }}
            >
              <IOFolder height={ISize.SM} width={ISize.SM} />
            </button>
          </Tooltip>
          <hr style={{ height: '70%' }} />
          <button
            type="button"
            onClick={() => {
              window.glxApi.windowFunctions.minimize();
            }}
          >
            <IXMinimize height={ISize.SM} width={ISize.SM} />
          </button>
          <button
            type="button"
            onClick={() => {
              window.glxApi.windowFunctions.maximize();
            }}
          >
            <IOBrowsersOutline size={ISize.SM} />
          </button>
          <button
            type="button"
            onClick={() => {
              window.glxApi.windowFunctions.close();
            }}
          >
            <IOClose size={ISize.SM} />
          </button>
        </Grid>
      </header>
      <div className="main-frame">
        {preload && (
          <App ref={ref} preload={preload} reloadPreload={reloadPreload} />
        )}
      </div>
    </div>
  );
}

root.render(<Root />);
