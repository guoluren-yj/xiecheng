/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext } from 'react';
import { useLocalStore } from 'mobx-react-lite';
import { runInAction } from 'mobx';

import { queryImportCreatePermission } from '@/services/businessObjectServices';

const sourceStore = createContext({});

export interface ISourceManagerStore {
  permissionFlag: boolean | null;
  setPermissionFlag: (flag: boolean) => void;
  queryPermission: () => void;
}

function SourceManagerProvider(props) {
  const { children } = props;

  const store = useLocalStore(
    (): ISourceManagerStore => ({
      permissionFlag: null,
      queryPermission() {
        queryImportCreatePermission().then(res => {
          runInAction(() => {
            this.setPermissionFlag(res === true);
          });
        });
      },
      setPermissionFlag(flag) {
        // FIXME: 严格模式下,异步数据操作需要用runInAction包裹
        this.permissionFlag = flag;
      },
    })
  );

  return (
    <sourceStore.Provider
      value={{
        store,
      }}
    >
      {children}
    </sourceStore.Provider>
  );
}

export default sourceStore;
export { SourceManagerProvider };
