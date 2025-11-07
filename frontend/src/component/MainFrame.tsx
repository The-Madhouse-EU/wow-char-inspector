import {
  cnx,
  Grid,
  Icon,
  INames,
  IOArrowBack,
  IOMenu,
  Tooltip,
} from '@grandlinex/react-components';
import React, { FC, useMemo, useState } from 'react';

export type MainFrameProps = {
  className?: string;
  defaultFrame?: string;
  children: MainFrameItemTypes | MainFrameItemTypes[];
};

export type MainFrameItemProps = {
  children?: (React.ReactNode | null) | (React.ReactNode | null)[];
  frameKey: string;
  skip?: boolean;
  name: string;
  icon: INames;
};
export const MainFrameItem = (props: MainFrameItemProps) => {
  const { children } = props;
  return children as React.ReactNode;
};
export type MainFrameItemTypes = React.ReactComponentElement<
  FC<MainFrameItemProps>,
  MainFrameItemProps
>;

export function MainFrame({
  defaultFrame,
  children,
  className,
}: MainFrameProps) {
  const [open, setOpen] = useState(false);
  const cld = useMemo(() => {
    if (Array.isArray(children)) return children;
    return [children];
  }, [children]);

  const [cur, setCur] = useState(
    defaultFrame || cld[0]?.props.frameKey || 'default',
  );

  return (
    <Grid flex flexR gap={12} className={cnx('sx-main-frame', className)}>
      <Grid
        flex
        flexC
        gap={8}
        className={[
          'glx-p-8',
          'sidebar-wrapper',
          [open, 'sidebar-wrapper--open'],
        ]}
      >
        <Grid flex flexR fullWidth flexEnd>
          <Grid
            flex
            flexR
            vCenter
            key="colapser"
            onClick={() => setOpen(!open)}
            className="sidebar-element sidebar-element--toggle"
          >
            <span>{open ? <IOArrowBack /> : <IOMenu />}</span>
          </Grid>
        </Grid>
        {cld.map(({ props }) => {
          // eslint-disable-next-line react/prop-types
          const { frameKey, name, icon, skip } = props;
          if (skip) {
            return null;
          }
          return (
            <Tooltip
              text={!open ? name || frameKey : undefined}
              position="right"
            >
              <Grid
                flex
                flexR
                vCenter
                key={frameKey}
                onClick={() => {
                  setOpen(false);
                  setCur(frameKey);
                }}
                className={cnx('sidebar-element', [
                  cur === frameKey,
                  'sidebar-element--active',
                ])}
              >
                <span>
                  <Icon name={icon} />
                </span>
                <span className="sidebar--title">{name || frameKey}</span>
              </Grid>
            </Tooltip>
          );
        })}
      </Grid>
      <Grid
        flex
        flexC
        flexStart
        className="glx-p-8"
        style={{
          flexBasis: open ? 'calc(100% - 288px)' : 'calc(100% - 50px)',
          overflow: 'auto',
        }}
        gap={8}
      >
        {cld.map(({ props }) => {
          // eslint-disable-next-line react/prop-types
          const { frameKey, skip } = props;
          if (cur === frameKey && !skip) {
            return props.children;
          }
          return null;
        })}
      </Grid>
    </Grid>
  );
}
