import { stringify } from 'querystring';
import React, { createContext, useMemo, useCallback, useEffect } from 'react';
import { ModalProvider, DataSet } from 'choerodon-ui/pro';
import { runInAction } from 'mobx';
import { flow, isNil } from 'lodash';
import { observer } from 'mobx-react';

import withProps from 'utils/withProps';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { filterNullValueObject, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { listDS } from './listDS';
import type { Operate} from '../../utils/type';
import { fetchBillPoolTotal } from '../../utils/api';
import permissionDS from '../../../../utils/permissionDS';
import { ActiveKey, ListTabsCustCode, GridCustCodeMap, ListBtnsCustCode, PermissionCodeMap } from '../../utils/type';

interface ContextValueType {
  dsMap: Record<ActiveKey, DataSet>,
  history: any,
  cacheState: Map<string, any>,
  permissionMap: any,
  customizeTable: Function,
  customizeTabPane: Function,
  customizeBtnGroup: Function,
  handleToDetail: (id: string | number, operate?: Operate) => void,
  defaultActiveKey: ActiveKey,
  fetchTabKeysCount: (tabKeys: ActiveKey[]) => void,
};

export const Store = createContext<ContextValueType>({} as ContextValueType);

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      ListTabsCustCode,
      ListBtnsCustCode,
      ...Object.values(GridCustCodeMap),
    ],
  }),
  withProps(
    (() => {
      const cacheState = new Map(); // 缓存tab页编码
      const dsMap: Record<ActiveKey, DataSet> = {
        [ActiveKey.All]: new DataSet(listDS(ActiveKey.All)),
        [ActiveKey.Usable]: new DataSet(listDS(ActiveKey.Usable)),
        [ActiveKey.Occupy]: new DataSet(listDS(ActiveKey.Occupy)),
        [ActiveKey.Without]: new DataSet(listDS(ActiveKey.Without)),
      };
      return {
        dsMap,
        cacheState,
      };
    }) as any,
    { cacheState: true },
  ) as any,
  formatterCollections({ code: ['sbsm.common', 'sbsm.bankBillPool'] }),
)((props) => {

  const {
    dsMap = {},
    history,
    children,
    cacheState = new Map(),
    custConfig,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
  } = props;
  const { fields = [] } = custConfig?.[ListTabsCustCode] || {};
  const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
  // 默认激活Tab页的顺序为：1、url指定；2、详情页返回缓存；3、个性化配置；4、代码原有逻辑
  const defaultActiveKey = fieldCode || cacheState?.get('activeKey') || ActiveKey.All;
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(PermissionCodeMap)), []);
  const permissionMap = permissionDs.current;

  const handleToDetail = useCallback((id, operate) => {
    if (isNil(id)) return;
    history.push({
      pathname: `/sbsm/bank-bill-pool/detail/${id}`,
      search: stringify(filterNullValueObject({ operate })),
    });
  }, [history]);

  // 查询所有总数目
  const fetchTabKeysCount = useCallback(async (tabKeys: ActiveKey[] = []) => {
    const resMap = await Promise.all(
      tabKeys.map((item) => fetchBillPoolTotal(item))
    );
    runInAction(() => {
      resMap.forEach((res, index) => {
        const { totalElements = 0 } = getResponse(res) || {};
        dsMap[tabKeys[index]].setState('totalCount', totalElements);
      });
    });
  }, [dsMap]);

  useEffect(() => {
    fetchTabKeysCount(Object.values(ActiveKey));
  }, [fetchTabKeysCount]);

  const value = useMemo(() => ({
    dsMap,
    history,
    cacheState,
    permissionMap,
    handleToDetail,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    defaultActiveKey,
    fetchTabKeysCount,
  }), [
    dsMap,
    history,
    cacheState,
    permissionMap,
    handleToDetail,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    defaultActiveKey,
    fetchTabKeysCount,
  ]);
  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </Store.Provider>
  );
}) as React.FC;

export default StoreProvider;