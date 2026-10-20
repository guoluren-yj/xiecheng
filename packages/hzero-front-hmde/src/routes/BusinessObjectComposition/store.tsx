/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext } from 'react';
import { useLocalStore } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import type { Graph } from '@antv/x6';
import { DataUri } from '@antv/x6';

import { queryImportCreatePermission } from '@/services/businessObjectServices';

const sourceStore = createContext({});

export interface ISourceManagerStore {
  permissionFlag: boolean | null;
  setPermissionFlag: (flag: boolean) => void;
  queryPermission: () => void;
  erExport: () => void;
  graph?: Graph;
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
      erExport() {
        const { graph } = this;
        if (graph) {
          return new Promise((resolve) => {
            graph.toPNG((dataUri) => {
              DataUri.downloadDataUri(dataUri, 'er.png');
              resolve(dataUri);
            }, {
              padding: 20,
              beforeSerialize(this, svg) {
                const bbox = this.getAllCellsBBox();
                if (bbox) {
                  const tip = svg.querySelector<SVGGElement>('[data-cell-id="tip"]');
                  if (tip) {
                    tip.setAttribute('transform', `translate(${bbox.width - 76},20)`);
                  }
                }
              },
            });
          });
        }
      },
    }),
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
