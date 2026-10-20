import React, { createContext } from 'react';
import { DataSet } from 'choerodon-ui/pro/lib';
import { useLocalStore } from 'mobx-react-lite';
import { toJS } from 'mobx';
import _ from 'lodash';

const Context = createContext({});

function localStore({ refs }) {
  return {
    state: {
      nodeConditions: new Map(), // 节点条件
      inputDataSet: new DataSet(), // 事务流-入参ds
      outputDataSet: new DataSet(), // 事务流-出参ds
      customDataSet: new DataSet(), // 自定义变量ds
      extraParams: {},
      expressionList: [], // 表达式列表
    } as LocalStoreState,
    refs,
    setState(key: keyof LocalStoreState, value: any) {
      _.set(this.state, key, value);
    },
    getState(key: keyof LocalStoreState) {
      if (this.state[key] instanceof DataSet) return this.state[key];
      return toJS(this.state[key]);
    },
    clearFlow() {
      this.state.inputDataSet = new DataSet();
      this.state.outputDataSet = new DataSet();
      this.state.customDataSet = new DataSet();
      this.state.extraParams = {};
    },
    addNodeConditions(key, _conditions) {
      this.state.nodeConditions.set(key, _conditions);
    },
    getNodeConditions(key) {
      return this.state.nodeConditions.get(key);
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
  inputDataSet: DataSet;
  outputDataSet: DataSet;
  customDataSet: DataSet;
  extraParams: object | null;
  expressionList: any[];
  nodeConditions: any;
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
