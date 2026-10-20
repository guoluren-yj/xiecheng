import React, { createContext, useMemo, useCallback, useEffect } from 'react';
import { ModalProvider, DataSet } from 'choerodon-ui/pro';
import { runInAction } from 'mobx';
import { flow } from 'lodash';
import { observer } from 'mobx-react';

import withRemote from 'utils/remote';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import permissionDS from '../../../../utils/permissionDS';
import { listDS } from './listDS';
import { fetchBankFlowTotal } from '../../utils/api';
import { ActiveKey, ListTabsCustCode, GridCustCodeMap, ListBtnsCustCode, SearchCustCodeMap, RefundFlowListCode, MatchExpendFlowListCode, MatchFlowSearchCode, MatchFlowListCode, PermissionCode } from '../../utils/type';

interface ContextValueType {
  dsMap: Record<ActiveKey, DataSet>,
  history: any,
  remote: any,
  cacheState: Map<string, any>,
  customizeTable: Function,
  customizeTabPane: Function,
  customizeBtnGroup: Function,
  defaultActiveKey: ActiveKey,
  fetchTabKeysCount: (tabKeys: ActiveKey[]) => void,
  permissionMap: any,
};

export const Store = createContext<ContextValueType>({} as ContextValueType);

const StoreProvider = flow(
  observer,
  withRemote({
    code: 'SBSM.BANK_FLOW_POOL_LIST_CUX',
    name: 'remote',
  }),
  withCustomize({
    unitCode: [
      ListTabsCustCode,
      ListBtnsCustCode,
      RefundFlowListCode,
      MatchExpendFlowListCode,
      MatchFlowSearchCode,
      MatchFlowListCode,
      ...Object.values(GridCustCodeMap),
      ...Object.values(SearchCustCodeMap),
    ],
  }),
  withProps(
    (() => {
      const cacheState = new Map(); // 缓存tab页编码
      const dsMap: Record<ActiveKey, DataSet> = {
        [ActiveKey.All]: new DataSet(listDS(ActiveKey.All)),
        [ActiveKey.Success]: new DataSet(listDS(ActiveKey.Success)),
        [ActiveKey.Refund]: new DataSet(listDS(ActiveKey.Refund)),
        [ActiveKey.Refundable]: new DataSet(listDS(ActiveKey.Refundable)),
        [ActiveKey.Abnormal]: new DataSet(listDS(ActiveKey.Abnormal)),
      };
      return {
        dsMap,
        cacheState,
      };
    }) as any,
    { cacheState: true },
  ) as any,
  formatterCollections({ code: ['sbsm.common', 'sbsm.paymentPool', 'sbsm.bankFlow'] }),
)((props) => {

  const {
    dsMap = {},
    remote,
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
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(PermissionCode)), []);
  const permissionMap = permissionDs.current;


  // 查询所有总数目
  const fetchTabKeysCount = useCallback(async (tabKeys: ActiveKey[] = []) => {
    const resMap = getResponse(await fetchBankFlowTotal(tabKeys));
    if (resMap) {
      runInAction(() => {
        resMap.forEach((res) => {
          const { count, tab } = res || {};
          dsMap[tab.toLowerCase()].setState('totalCount', count);
        });
      });
    }
  }, [dsMap]);

  useEffect(() => {
    fetchTabKeysCount([]);
  }, [fetchTabKeysCount]);

  const value = useMemo(() => ({
    dsMap,
    remote,
    history,
    cacheState,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    defaultActiveKey,
    fetchTabKeysCount,
    permissionMap,
  }), [
    dsMap,
    remote,
    history,
    cacheState,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    defaultActiveKey,
    fetchTabKeysCount,
    permissionMap,
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
