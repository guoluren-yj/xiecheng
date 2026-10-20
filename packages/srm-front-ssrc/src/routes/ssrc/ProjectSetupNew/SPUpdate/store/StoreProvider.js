import React, { createContext, useMemo, useEffect } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { useLocalStore } from 'mobx-react-lite';
import { isArray, isNil } from 'lodash';
import querystring from 'querystring';
import { set, get, toJS } from 'mobx';

import { getCustomizeUnitCode } from '../utils';
import PurchaseRequestDS from '../../PurchaseRequestDS';

import {
  headerDS,
  itemLineDS,
  sectionOrPacketInfoDS,
  allotItemLineDS,
  supplierLineTableDS,
  planLineTableDS,
  supplierLovDS,
} from './storeDS';

const StoreContext = createContext({});

function StoreProvider(props = {}) {
  const {
    remote,
    match: { params } = {},
    children,
    doubleUnitFlag,
    location: { pathname, search },
  } = props;

  const routerParams = location ? querystring.parse(search.substr(1)) : {};
  const { sourceFrom = null } = routerParams || {};

  // 是否是新建页面
  const createFlag = useMemo(
    () => pathname.indexOf('/ssrc/new-project-setup/sp-update/create') > -1,
    [pathname]
  );

  const { sourceProjectId } = params || {};

  const organizationId = useMemo(() => getCurrentOrganizationId(), []);

  // 初始化ds
  const headerDs = useDataSet(
    () =>
      headerDS({
        remote,
        sourceProjectId,
        sourceFrom,
        createFlag,
        customizeUnitCode: getCustomizeUnitCode([
          'baseInfoForm',
          'purOrgDemandForm',
          'purOrgExecutorForm',
          'sourceDemandForm',
          'sourceMethodForm',
          'attachmentForm',
        ]),
      }),
    [sourceProjectId, sourceFrom, createFlag]
  );
  const itemLineDs = useDataSet(
    () =>
      itemLineDS({
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode('itemLineTable'),
        headerDs,
      }),
    [sourceProjectId]
  );
  const sectionOrPacketInfoDs = useDataSet(
    () =>
      sectionOrPacketInfoDS({
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode('secAndPacketTable'),
      }),
    [sourceProjectId]
  );
  const allotMaterialDs = useDataSet(
    () =>
      allotItemLineDS({
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode('allotItemLineTable'),
        type: 'allot',
      }),
    [sourceProjectId]
  );
  const addMaterialDs = useDataSet(
    () =>
      allotItemLineDS({
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode('allotItemLineTable'),
        type: 'add',
      }),
    [sourceProjectId]
  );
  const supplierLineTableDs = useDataSet(
    () =>
      supplierLineTableDS({
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode('supplierTable'),
        headerDs,
      }),
    [sourceProjectId]
  );
  const planLineTableDs = useDataSet(
    () =>
      planLineTableDS({
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode('projectPlanTable'),
      }),
    [sourceProjectId]
  );
  const purchaseRequestDs = useDataSet(() => PurchaseRequestDS(), []);
  const supplierLovDs = useDataSet(() => supplierLovDS({ sourceProjectId }), [sourceProjectId]);

  const handleHeaderDsUpdate = (dsProps) => {
    // 添加headerDs的update事件监听埋点
    if (remote && remote.event && remote.event.fireEvent) {
      remote.event.fireEvent('remoteHandleHeaderDsUpdate', dsProps);
    }
  };

  useEffect(() => {
    setDsState({
      ds: [itemLineDs, allotMaterialDs, addMaterialDs],
      name: 'doubleUnitFlag',
      value: doubleUnitFlag,
    });
    headerDs.addEventListener('update', handleHeaderDsUpdate);
  }, [doubleUnitFlag, headerDs]);

  // 设置ds参数
  const setDsState = ({ ds, name, value }) => {
    if (ds && isArray(ds)) {
      ds.forEach((_ds) => {
        _ds.setState(name, value);
      });
    } else if (ds) {
      ds.setState(name, value);
    }
  };

  // 动态设置的数据
  const reactionStoreData = useLocalStore(() => ({
    storeData: {},
    setStoreData(key, value) {
      set(this.storeData, key, value); // 针对动态添加属性 by mobx 4.*
    },
    getStoreData(key) {
      return isNil(key) ? toJS(this.storeData) : get(this.storeData, key); // 避免直接引用toJS 递归遍历所有属性, 触发不必要更新
    },
  }));

  // 公共数据存储
  const storeData = useMemo(
    () => ({
      commonDs: {
        headerDs,
        itemLineDs,
        sectionOrPacketInfoDs,
        supplierLineTableDs,
        planLineTableDs,
        allotMaterialDs,
        addMaterialDs,
        purchaseRequestDs,
        supplierLovDs,
      },
      organizationId,
      sourceProjectId,
      createFlag,
      getCustomizeUnitCode,
      ...reactionStoreData,
    }),
    [
      headerDs,
      itemLineDs,
      sectionOrPacketInfoDs,
      supplierLineTableDs,
      planLineTableDs,
      allotMaterialDs,
      addMaterialDs,
      purchaseRequestDs,
      supplierLovDs,
      organizationId,
      sourceProjectId,
      getCustomizeUnitCode,
      createFlag,
      reactionStoreData,
    ]
  );

  const value = {
    ...(props || {}),
    ...storeData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export default StoreProvider;

export { StoreContext };
