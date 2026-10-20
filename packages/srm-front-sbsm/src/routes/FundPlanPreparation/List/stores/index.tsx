// import { stringify } from 'querystring';
import type { ReactElement } from 'react';
import React, { createContext, useMemo, useState, useCallback, useEffect } from 'react';
import { ModalProvider, DataSet } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import withProps from 'utils/withProps';
import { getResponse, filterNullValueObject } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { stringify } from 'querystring';

import { fetchWholeTotal, fetchDetailTotal } from '../../utils/api';
import { wholeTableDS, detailTableDS } from './indexDS';
import { getTabKeys } from '../../utils/utils';
import type { Operate} from '../../utils/type';
import { ActiveKey, ActionType, PermissionCode, ListTableBtnCode, ListTabsCustCode, WholeListCode, WholeSearchCode, DetailListCode, DetailSearchCode, DetailListLineCode } from '../../utils/type';
import WorkflowCaller from '../../../../components/WorkflowCaller';
import permissionDS from '../../../../utils/permissionDS';

export const Store = createContext<any>({});


const { wholeKeys, detailKeys } = getTabKeys<ActiveKey>(Object.values(ActiveKey));


export interface StoreValueType {
  dsMap: Record<ActiveKey, DataSet>,
  getTotalCount: (key: ActiveKey) => void,
  customizeTable: Function,
  customizeTabPane: Function,
  customizeBtnGroup: Function,
  customizeForm: Function,
  defaultActiveKey: string,
  cacheState: any,
  isOpenClearCashed: boolean,
  setIsOpenClearCashed: (flag: boolean) => void,
  location: any,
  permissionMap: DSRecord | undefined,
  handleToDetail: (id: any, operate?: Operate) => void,
  history: any,
};
const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      ListTabsCustCode,
      ListTableBtnCode,
      DetailListLineCode,
      ...Object.values({ ...WholeListCode, ...DetailListCode }),
      ...Object.values({ ...WholeSearchCode, ...DetailSearchCode }),
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
  formatterCollections({ code: ['sbsm.common', 'sbsm.fundPlan', 'sbsm.fundPlanForecast'] }),
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

  //  记录是否开启清理缓存记录标识
  const [isOpenClearCashed, setIsOpenClearCashed] = useState(true);
  const { location = {} } = history;
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(PermissionCode)), []);
  const permissionMap = permissionDs.current;

  // 查询所有总数目
  const getTotalCount = useCallback(async (key: string) => {
    const flag = key.startsWith('whole') ? 1 : 2;
    const tabKeysAll = flag === 2 ? detailKeys : wholeKeys;
    const valFlag = tabKeysAll.some((v) => {
      const val = dsMap[v].getState('totalCount');
      return val === undefined || val === null;
    });
    let tabKeys = tabKeysAll;
    if (!valFlag) {
      tabKeys = tabKeysAll.filter((v) => v === key);
    }
    const requestFunc = flag === 2 ? fetchDetailTotal : fetchWholeTotal;
    const resMap = await Promise.all(
      tabKeys.map((item) => requestFunc({ action: ActionType[item] }))
    );
    if (resMap.some((res) => !getResponse(res))) return;
    runInAction(() => {
      resMap.forEach(({ totalElements = 0 }, index) => {
        dsMap[tabKeys[index]].setState('totalCount', totalElements);
      });
    });
  },
    [dsMap]
  );

  const handleToDetail = useCallback((id: any, operateType: Operate) => {
    if (id) {
      history.push({
        pathname: `/sbsm/fund-plan-preparation/detail/${id}`,
        search: stringify(filterNullValueObject({ operate: operateType, source: 'list' })),
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

  const value: StoreValueType = useMemo(() => ({
    dsMap,
    getTotalCount,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    customizeForm,
    defaultActiveKey,
    cacheState,
    isOpenClearCashed,
    setIsOpenClearCashed,
    location,
    permissionMap,
    handleToDetail,
    history,
  }), [
    dsMap,
    getTotalCount,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    customizeForm,
    defaultActiveKey,
    cacheState,
    isOpenClearCashed,
    setIsOpenClearCashed,
    location,
    permissionMap,
    handleToDetail,
    history,
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
