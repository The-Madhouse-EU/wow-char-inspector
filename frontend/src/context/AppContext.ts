import React, { useContext } from 'react';
import { CMap } from '@grandlinex/react-components';
import { DataType } from '@/lib';

export type AppContextData = {
  data: DataType;
  classMap: CMap<string, string>;
};
const DefaultContextData: AppContextData = {
  data: {
    chars: [],
    missing: [],
    global: {},
    raceOverview: [],
    classOverview: [],
  },
  classMap: new CMap<string, string>(),
};
const AppContext = React.createContext(DefaultContextData);

const useAppContext = () => {
  return useContext(AppContext);
};

export default AppContext;

export { useAppContext, DefaultContextData };
