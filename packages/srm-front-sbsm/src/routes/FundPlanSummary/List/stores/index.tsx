import { stringify } from 'querystring';
import React, { createContext, useMemo, useCallback, useEffect } from 'react';
import { ModalProvider, DataSet } from 'choerodon-ui/pro';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { flow, isArray } from 'lodash';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import withProps from 'utils/withProps';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import type { Operate} from '../../utils/type';
import { fetchFundPlanSumTotal } from '../../utils/api';
import { wholeTableDS, detailTableDS } from './indexDS';
import WorkflowCaller from '../../../../components/WorkflowCaller';
import { ActiveKey, ListTableBtnCode, ListTabsCustCode, ListGridCode, PermissionCode } from '../../utils/type';
import permissionDS from '../../../../utils/permissionDS';

export const Store = createContext<StoreValueType>({} as StoreValueType);

export interface StoreValueType {
  dsMap: Record<ActiveKey, DataSet>,
  fetchTabKeysCount: (countTabKeys: ActiveKey[]) => void,
  customizeTable: Function,
  customizeTabPane: Function,
  customizeBtnGroup: Function,
  customizeForm: Function,
  defaultActiveKey: ActiveKey,
  cacheState: any,
  location: any,
  permissionMap: DSRecord | undefined,
  handleToDetail: (id: any, operate?: Operate) => void,
};
const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      ListTabsCustCode,
      ListTableBtnCode,
      ...Object.values(ListGridCode),
    ],
  }),
  withProps(
    (() => {
      const cacheState = new Map(); // 缓存tab页编码
      const dsMap = {
        [ActiveKey.WholeAll]: new DataSet(wholeTableDS(ActiveKey.WholeAll)),
        [ActiveKey.WholeApprove]: new DataSet(wholeTableDS(ActiveKey.WholeApprove)),
        [ActiveKey.WholePending]: new DataSet(wholeTableDS(ActiveKey.WholePending)),
        [ActiveKey.DetailAll]: new DataSet(detailTableDS(ActiveKey.DetailAll)),
      };
      return {
        dsMap,
        cacheState,
      };
    }) as any,
    { cacheState: true },
  ) as any,
  formatterCollections({ code: ['sbsm.common', 'sbsm.fundPlan'] }),
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
    customizeForm,
  } = props;

  const { fields = [] } = custConfig?.[ListTabsCustCode] || {};
  const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
  const defaultActiveKey = cacheState?.get('activeKey') || fieldCode || ActiveKey.WholeAll;

  const { location } = history;
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(PermissionCode)), []);
  const permissionMap = permissionDs.current;

  const fetchTabKeysCount = useCallback(async (countTabKeys) => {
    if (!isArray(countTabKeys)) return;
    const resMap = await Promise.all(
      countTabKeys.map((item) => fetchFundPlanSumTotal({ activeKey: item }))
    );
    runInAction(() => {
      resMap.forEach((res, index) => {
        const { totalElements = 0 } = getResponse(res) || {};
        dsMap[countTabKeys[index]].setState('totalCount', totalElements);
      });
    });
  }, [dsMap]);

  const handleToDetail = useCallback((id: any, operateType: Operate) => {
    if (id) {
      history.push({
        pathname: `/sbsm/fund-plan-summary/detail/${id}`,
        search: stringify(filterNullValueObject({ operate: operateType })),
      });
    }
  }, [history]);

  useEffect(() => {
    dsMap[ActiveKey.WholeAll].setState('workflowCaller', new WorkflowCaller(dsMap[ActiveKey.WholeAll]));
    dsMap[ActiveKey.WholeApprove].setState('workflowCaller', new WorkflowCaller(dsMap[ActiveKey.WholeApprove]));
    return () => {
      dsMap[ActiveKey.WholeAll].getState('workflowCaller').destroy();
      dsMap[ActiveKey.WholeApprove].getState('workflowCaller').destroy();
    };
  }, [dsMap]);

  useEffect(() => {
    fetchTabKeysCount(Object.keys(dsMap));
  }, [dsMap, fetchTabKeysCount]);

  const value = useMemo(() => ({
    dsMap,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    customizeForm,
    defaultActiveKey,
    cacheState,
    location,
    permissionMap,
    handleToDetail,
    fetchTabKeysCount,
  }), [
    dsMap,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    customizeForm,
    defaultActiveKey,
    cacheState,
    location,
    permissionMap,
    handleToDetail,
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
