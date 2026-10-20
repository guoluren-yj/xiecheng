import React, { createContext } from 'react';
import { useLocalStore } from 'mobx-react-lite';
import { toJS } from 'mobx';
import _ from 'lodash';

const Context = createContext({});

function localStore({ refs }) {
  return {
    state: {
      currentPage: 'front',
      mainPage: 'detail',
      scriptUtilityInfo: {},
      selectedServicePoint: {},
      signalQueryTableDS: false,
      signalSaveEdition: false,
      currentServiceName: '',
    } as LocalStoreState,
    refs,
    setState(key: keyof LocalStoreState, value: any) {
      _.set(this.state, key, value);
    },
    getState(key: keyof LocalStoreState) {
      return toJS(this.state[key]);
    },
    queryTableDS() {
      this.state.signalQueryTableDS = !this.state.signalQueryTableDS;
    },
    saveEdition() {
      this.state.signalSaveEdition = !this.state.signalSaveEdition;
    },
  } as const;
}

export function StoreProvider(props) {
  const refs = {};
  const store = useLocalStore(localStore, { refs });
  return <Context.Provider value={{ ...props, store }}>{props.children}</Context.Provider>;
}

// typings //
interface LocalStoreState {
  currentPage: 'front' | 'add';
  mainPage: 'detail' | 'edit';
  scriptUtilityInfo: object;
  selectedServicePoint: object;
  signalQueryTableDS: boolean;
  signalSaveEdition: boolean;
  currentServiceName: string;
}

export type IStore = Omit<ReturnType<typeof localStore>, 'setState'> & {
  setState: {
    <K extends keyof LocalStoreState>(
      ...args: [
        K,
        {
          [Key in keyof LocalStoreState]: K extends keyof LocalStoreState
            ? LocalStoreState[K]
            : never;
        }[keyof LocalStoreState]
      ]
    ): void;
  };
};

export default Context;
