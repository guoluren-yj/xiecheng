import { stringify } from 'querystring';
import type { ReactElement } from 'react';
import React, { createContext, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { ModalProvider, DataSet } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';

import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import type { Operate } from '../../utils/type';
import { DetailGridCustCode, WholeGridCustCode } from '../../utils/type';
import { detailTableDS, wholeTableDS } from './listDS';
import { splitWholeAndDetailTabKeys } from '../../utils/utils';
import { fetchPlanHeadTotal, fetchPlanLineTotal } from '../../utils/api';
import { ActiveKey, ActionType, ListTabsCustCode } from '../../utils/type';

export const Store = createContext<any>({});

export interface StoreValueType {
  dsMap: Record<ActiveKey, DataSet>,
  history: any,
  activeKey: ActiveKey,
  getTotalCount: (key: ActiveKey) => void,
  handleTabChange: (key: any) => void,
  handleRecordInit: (key: ActiveKey) => void,
  handleToDetail: (planHeaderId: string | number, operate: Operate) => void,
  customizeTable: Function,
  customizeTabPane: Function,
};

const permBtnCodePrefix = 'srm.settle-account.jsd.jsd.payment-plan.button';
export const permissionCodeMap = {
  change: `${permBtnCodePrefix}.change`,
};

const { wholeKeys, detailKeys } = splitWholeAndDetailTabKeys<ActiveKey>(Object.values(ActiveKey));

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      ListTabsCustCode,
      ...Object.values(WholeGridCustCode),
      ...Object.values(DetailGridCustCode),
    ],
  }),
  withProps(
    (() => {
      const cacheState = new Map(); // 缓存tab页编码
      const dsMap = {
        [ActiveKey.WholeAll]: new DataSet(wholeTableDS(ActiveKey.WholeAll)),
        [ActiveKey.WholeProgress]: new DataSet(wholeTableDS(ActiveKey.WholeProgress)),
        [ActiveKey.WholeNotStart]: new DataSet(wholeTableDS(ActiveKey.WholeNotStart)),
        [ActiveKey.DetailAll]: new DataSet(detailTableDS(ActiveKey.DetailAll)),
        [ActiveKey.DetailProgress]: new DataSet(detailTableDS(ActiveKey.DetailProgress)),
        [ActiveKey.DetailNotStart]: new DataSet(detailTableDS(ActiveKey.DetailNotStart)),
      };
      return {
        dsMap,
        cacheState,
      };
    }) as any,
    { cacheState: true },
  ) as any,
  formatterCollections({ code: ['ssta.paymentPlan', 'ssta.common'] }),
)((props) => {

  const {
    dsMap = {},
    history,
    children,
    cacheState = new Map(),
    custConfig,
    customizeTable,
    customizeTabPane,
  } = props;
  // 初始化过的activeKey对象
  const initRecords = useRef<Record<string, boolean>>({});
  const { fields = [] } = custConfig?.[ListTabsCustCode] || {};
  const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
  // 默认激活Tab页的顺序为：1、url指定；2、详情页返回缓存；3、个性化配置；4、代码原有逻辑
  const [activeKey, setActiveKey] = useState(
    cacheState?.get('activeKey') || fieldCode || ActiveKey.WholeAll
  );

  // 查询所有总数目
  const getTotalCount = useCallback(async (key: ActiveKey = activeKey) => {
    const detailFlag = key.startsWith('detail');
    const tabKeys = detailFlag ? detailKeys : wholeKeys;
    const requestFunc = detailFlag ? fetchPlanLineTotal : fetchPlanHeadTotal;
    const resMap = await Promise.all(
      tabKeys.map((item) => requestFunc({ actionType: ActionType[item] }))
    );
    if (resMap.some((res) => !getResponse(res))) return;
    runInAction(() => {
      resMap.forEach(({ totalElements = 0 }, index) => {
        dsMap[tabKeys[index]].setState('totalCount', totalElements);
      });
    });
  },
    [dsMap, activeKey]
  );

  // 切换Tab页回调
  const handleTabChange = useCallback((key) => {
    setActiveKey(key);
    cacheState.set('activeKey', key);
    if (initRecords.current[key]) dsMap[key].query();
  },
    [setActiveKey, dsMap, cacheState]
  );

  // 表格初始化回调
  const handleRecordInit = useCallback((key: ActiveKey) => {
    initRecords.current[key] = true;
  }, []);

  // 跳转至详情页
  const handleToDetail = useCallback((planHeaderId: string | number, operate: Operate) => {
    if (!planHeaderId) return;
    history.push({
      pathname: `/ssta/payment-plan/detail/${planHeaderId}`,
      search: stringify({ operate }),
    });
  }, [history]);

  useEffect(() => {
    getTotalCount();
  }, [getTotalCount]);

  const value: StoreValueType = useMemo(() => ({
    dsMap,
    history,
    activeKey,
    getTotalCount,
    handleTabChange,
    handleRecordInit,
    handleToDetail,
    customizeTable,
    customizeTabPane,
  }), [
    dsMap,
    history,
    activeKey,
    getTotalCount,
    handleTabChange,
    handleRecordInit,
    handleToDetail,
    customizeTable,
    customizeTabPane,
  ]);
  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </Store.Provider>
  );
}) as (props: any) => ReactElement;

export default StoreProvider;