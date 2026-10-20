// import { stringify } from 'querystring';
import type { ReactElement } from 'react';
import React, { createContext, useMemo, useCallback, useState } from 'react';
import { ModalProvider, DataSet } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';

import withRemote from 'utils/remote';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { fetchASourceTotal, fetchStageTotal } from '../../utils/api';
import { sourceTableDS, stageTableDS, lovOptionDS } from './indexDS';
import { getTabKeys } from '../../utils/utils';
import permissionDS from '../../../../utils/permissionDS';
// import type { Operate } from '../../utils/type';
import { ActiveKey, ActionType, ListTableBtnCode, ListTabsCustCode, SourceListCode, SourceSearchCode, StageListCode, StageSearchCode, PermissionCode } from '../../utils/type';

export const Store = createContext<any>({});


const { sourceKeys, stageKeys } = getTabKeys<ActiveKey>(Object.values(ActiveKey));

export interface StoreValueType {
  dsMap: Record<ActiveKey, DataSet>,
  remote: any,
  getTotalCount: (key: string) => void,
  customizeTable: Function,
  customizeTabPane: Function,
  customizeBtnGroup: Function,
  customizeForm: Function,
  defaultActiveKey: string,
  cacheState: any,
  isOpenClearCashed: boolean,
  setIsOpenClearCashed: (flag: boolean) => void,
  location: any,
  sourceTypeOptionDs: DataSet,
  history: any,
  permissionMap: any,
};
const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      ListTabsCustCode,
      ListTableBtnCode,
      ...Object.values({ ...SourceSearchCode, ...StageSearchCode }),
      ...Object.values({ ...SourceListCode, ...StageListCode }),
    ],
  }),
  withRemote({
    code: 'SBSM.FUND_PLAN_PREFABRICATION_LIST_CUX',
    name: 'remote',
  }),
  withProps(
    (() => {
      const cacheState = new Map(); // 缓存tab页编码
      const dsMap = {
        [ActiveKey.SourceAll]: new DataSet(sourceTableDS(ActiveKey.SourceAll)),
        [ActiveKey.SourceCompile]: new DataSet(sourceTableDS(ActiveKey.SourceCompile)),
        [ActiveKey.SourceSummary]: new DataSet(sourceTableDS(ActiveKey.SourceSummary)),
        [ActiveKey.SourceError]: new DataSet(sourceTableDS(ActiveKey.SourceError)),
        [ActiveKey.SourceLines]: new DataSet(sourceTableDS(ActiveKey.SourceLines)),
        [ActiveKey.StageAll]: new DataSet(stageTableDS(ActiveKey.StageAll)),
        [ActiveKey.StageCompile]: new DataSet(stageTableDS(ActiveKey.StageCompile)),
        [ActiveKey.StageSummary]: new DataSet(stageTableDS(ActiveKey.StageSummary)),
      };
      return {
        dsMap,
        cacheState,
      };
    }) as any,
    { cacheState: true },
  ) as any,
  formatterCollections({ code: ['sbsm.common', 'sbsm.fundPlan', 'sbsm.payTermsCtrl', 'sbsm.fundPlanForecast'] }),
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
    customizeForm,
  } = props;

  const { fields = [] } = custConfig?.[ListTabsCustCode] || {};
  const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
  const defaultActiveKey = cacheState?.get('activeKey') || fieldCode || ActiveKey.StageAll;
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(PermissionCode)), []);
  const permissionMap = permissionDs.current;

  const sourceTypeOptionDs = useMemo(() => new DataSet(lovOptionDS()), []);

  //  记录是否开启清理缓存记录标识
  const [isOpenClearCashed, setIsOpenClearCashed] = useState(true);
  const { location = {} } = history;
  // const { state = {} } = location;

  // 查询所有总数目
  const getTotalCount = useCallback(async (key: string) => {
    const flag = key.startsWith('stage') ? 1 : 2;
    const tabKeysAll = flag === 1 ? stageKeys : sourceKeys;
    const valFlag = tabKeysAll.some((v) => {
      const val = dsMap[v].getState('totalCount');
      return val === undefined || val === null;
    });
    let tabKeys = tabKeysAll;
    if (!valFlag) {
      tabKeys = tabKeysAll.filter((v) => v === key);
    }
    const requestFunc = flag === 1 ? fetchStageTotal :fetchASourceTotal;
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

  const value: StoreValueType = useMemo(() => ({
    dsMap,
    remote,
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
    sourceTypeOptionDs,
    history,
    permissionMap,
  }), [
    dsMap,
    remote,
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
    sourceTypeOptionDs,
    history,
    permissionMap,
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
