import React, { createContext } from 'react';
import { useLocalStore } from 'mobx-react-lite';
import { toJS } from 'mobx';
import _ from 'lodash';
import { ScriptAbstractPageInfo, queryScriptDetailService } from 'services/scriptEventService';

const Context = createContext({});

function localStore({ refs }) {
  return {
    state: {
      querySearchValue: '',
      // currentPage: 'front',
      currentSelectedScriptAbstract: null,
      currentSelectedScriptDetail: null,
      scriptAbstractPageInfo: null,
      importParamsDirection: 'in',
      importParamsCodeEdition: '',
      importParamsProcessedData: [],
      inputReferenceFormattedObject: {},
      outputReferenceFormattedObject: {},
      signalQueryTableDS: false,
      signalSaveEdition: false,
      showInsertRefrenceFieldPopover: false,
      selectedReferenceField: '',
    } as LocalStoreState,
    refs,
    setState(key: keyof LocalStoreState, value: any) {
      setStateLogger(key, value, false);
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

function setStateLogger(key: string, value: any, on: boolean = true) {
  if (on) {
    console.groupCollapsed('%c setState', 'color: #03A9F4; font-weight: bold', key);
    console.log(value);
    console.groupEnd();
  }
}

// typings //
interface LocalStoreState {
  querySearchValue: string;
  // currentPage: 'front' | 'edit';
  currentSelectedScriptAbstract: null | ScriptAbstractPageInfo['content'][number];
  currentSelectedScriptDetail: null | typeof queryScriptDetailService.response;
  scriptAbstractPageInfo: null | ScriptAbstractPageInfo;
  importParamsDirection: 'in' | 'out';
  importParamsCodeEdition: string;
  importParamsProcessedData: any[];
  inputReferenceFormattedObject: any;
  outputReferenceFormattedObject: any;
  signalQueryTableDS: boolean;
  signalSaveEdition: boolean;
  showInsertRefrenceFieldPopover: boolean;
  selectedReferenceField: string;
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
