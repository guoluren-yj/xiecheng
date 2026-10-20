import { stringify } from 'querystring';
import type { ReactElement } from 'react';
import React, { createContext, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { ModalProvider, DataSet } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';

import withProps from 'utils/withProps';
import remote from 'hzero-front/lib/utils/remote';
import { getResponse, filterNullValueObject } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { fetchProjectTotal, fetchDocumentTotal, fetchStageTotal, changeProjectBefore } from '../../utils/api';
import { projectTableDS, documentTableDS, stageTableDS } from './indexDS';
import { getTabKeys } from '../../../PPAPTemplate/utils/utils';
import type { Operate } from '../../utils/type';
import { ActiveKey, ActionType, ListTableBtnCode, ListTabsCustCode, ProjectListCode, ProjectSearchCode, DocumentListCode, DocumentSearchCode, StageListCode, StageSearchCode, CreateListCustomizeCode } from '../../utils/type';

export const Store = createContext<any>({});


const { projectKeys, documentKeys, stageKeys } = getTabKeys<ActiveKey>(Object.values(ActiveKey));


export interface StoreValueType {
  dsMap: Record<ActiveKey, DataSet>,
  activeKey: ActiveKey,
  getTotalCount: (key: ActiveKey) => void,
  handleTabChange: (key: any) => void,
  handleRecordInit: (key: ActiveKey) => void,
  handleToDetail: (projectHeaderId: string | number, operate: Operate, type?: any, num?: any, projectType?: any) => void,
  customizeTable: Function,
  customizeTabPane: Function,
  customizeBtnGroup: Function,
  remoteProps: any;
  customizeForm: Function,
};
const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      ListTabsCustCode,
      ListTableBtnCode,
      ...Object.values({ ...ProjectListCode, ...DocumentListCode, ...StageListCode }),
      ...Object.values({ ...ProjectSearchCode, ...DocumentSearchCode, ...StageSearchCode, ...CreateListCustomizeCode }),
    ],
  }),
  withProps(
    ((params) => {
      const { remote: remoteProps } = params || {};
      const cacheState = new Map(); // 缓存tab页编码
      const dsMap = {
        [ActiveKey.ProjectAll]: new DataSet(projectTableDS(ActiveKey.ProjectAll)),
        [ActiveKey.ProjectProgress]: new DataSet(projectTableDS(ActiveKey.ProjectProgress)),
        [ActiveKey.ProjectMaintain]: new DataSet(projectTableDS(ActiveKey.ProjectMaintain)),
        [ActiveKey.ProjectApproval]: new DataSet(projectTableDS(ActiveKey.ProjectApproval)),
        [ActiveKey.DocumentAll]: new DataSet(documentTableDS(ActiveKey.DocumentAll, remoteProps)),
        [ActiveKey.DocumentPending]: new DataSet(documentTableDS(ActiveKey.DocumentPending, remoteProps)),
        [ActiveKey.DocumentCheck]: new DataSet(documentTableDS(ActiveKey.DocumentCheck, remoteProps)),
        [ActiveKey.StageAll]: new DataSet(stageTableDS(ActiveKey.StageAll)),
        [ActiveKey.StageCheck]: new DataSet(stageTableDS(ActiveKey.StageCheck)),
      };
      return {
        dsMap,
        cacheState,
      };
    }) as any,
    { cacheState: true },
  ) as any,
  remote({
    code: 'SQAM_PPAPWORKBENCH_LIST_CUX',
    name: 'remote',
  }),
  formatterCollections({ code: ['sqam.ppap', 'sqam.common'] }),
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
    remote: remoteProps,
    customizeForm,
  } = props;
  const initRecords = useRef<Record<string, boolean>>({});
  const { fields = [] } = custConfig?.[ListTabsCustCode] || {};
  const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
  const [activeKey, setActiveKey] = useState(
    cacheState?.get('activeKey') || fieldCode || ActiveKey.ProjectAll
  );
  //  记录是否开启清理缓存记录标识
  const [isOpenClearCashed, setIsOpenClearCashed] = useState(true);
  const { location = {} } = history;
  const { state = {} } = location;

  // 查询所有总数目
  const getTotalCount = useCallback(async (key: ActiveKey = activeKey) => {
    const flag = key.startsWith('stage') ? 3 : (key.startsWith('document') ? 2 : 1);
    const tabKeysAll = flag === 3 ? stageKeys : (flag === 2 ? documentKeys : projectKeys);
    // 先判断dsMap里是否有对应tab的值，如果没有则没查过则查所有tab，如果有则只查切换的tab 的计数  目前工作台列表上的按钮操作没有改变数据状态的，如果有需要根据实际调整查询计数逻辑
    const valFlag = tabKeysAll.some((v) => {
      const val = dsMap[v].getState('totalCount');
      return val === undefined || val === null;
    });
    let tabKeys = tabKeysAll;
    if (!valFlag) {
      tabKeys = tabKeysAll.filter((v) => v === key);
    }
    const requestFunc = flag === 3 ? fetchStageTotal : (flag === 2 ? fetchDocumentTotal : fetchProjectTotal);
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
    [dsMap, activeKey]
  );

  // 切换Tab页回调
  const handleTabChange = useCallback((key) => {
    setActiveKey(key);
    cacheState.set('activeKey', key);
    if (initRecords.current[key]) dsMap[key].query(dsMap[key].currentPage);
  },
    [setActiveKey, dsMap, cacheState]
  );

  // 表格初始化回调
  const handleRecordInit = useCallback((key: ActiveKey) => {
    initRecords.current[key] = true;
  }, []);

  // 跳转至详情页
  const handleToDetail = useCallback(async(projectHeaderId: string | number, operate: Operate, type?: string, num?: string | undefined, projectType?: string | undefined) => {
    if (!projectHeaderId) return;
    if (operate === 'change') {
      const res = getResponse(await changeProjectBefore(projectHeaderId));
      if (!res) return;
    }
    history.push({
      pathname: `/sqam/PPAPWorkbench/detail/${projectHeaderId}`,
      search: stringify(filterNullValueObject({ operate, type, num, projectType })),
    });
  }, [history]);

  useEffect(() => {
    getTotalCount();
  }, [getTotalCount]);

  // 如果是在详情操作后返回的列表页需要情况缓存的勾选
  useEffect(() => {
    const ds = dsMap[activeKey];
    if (ds && isOpenClearCashed && state?._back !== -1) {
      const { selected } = ds;
      ds.batchUnSelect(selected);
      setIsOpenClearCashed(false);
    }
  }, [activeKey, dsMap, isOpenClearCashed, state]);


  const value: StoreValueType = useMemo(() => ({
    dsMap,
    activeKey,
    getTotalCount,
    handleTabChange,
    handleRecordInit,
    handleToDetail,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    remoteProps,
    customizeForm,
  }), [
    dsMap,
    activeKey,
    getTotalCount,
    handleTabChange,
    handleRecordInit,
    handleToDetail,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    remoteProps,
    customizeForm,
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
