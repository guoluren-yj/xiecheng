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
  const { match: { params } = {}, children, doubleUnitFlag, location, remote } = props;

  const routerParams = location ? querystring.parse(location.search.substr(1)) : {};
  const { sourceFrom = null } = routerParams || {};

  const { sourceProjectId } = params || {};

  const organizationId = useMemo(() => getCurrentOrganizationId(), []);

  // 初始化ds
  const headerDs = useDataSet(
    () =>
      headerDS({
        sourceProjectId,
        sourceFrom,
        remote,
        customizeUnitCode: getCustomizeUnitCode([
          'baseInfoForm',
          'purOrgDemandForm',
          'purOrgExecutorForm',
          'sourceDemandForm',
          'sourceMethodForm',
          'attachmentForm',
        ]),
      }),
    []
  );
  const itemLineDs = useDataSet(
    () =>
      itemLineDS({
        remote,
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode('itemDetailTable'),
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
    []
  );
  const supplierLineTableDs = useDataSet(
    () =>
      supplierLineTableDS({
        remote,
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
    setDSQueryParameter({
      ds: [itemLineDs, allotMaterialDs, addMaterialDs],
      name: 'doubleUnitFlag',
      value: doubleUnitFlag,
    });
    headerDs.addEventListener('update', handleHeaderDsUpdate);
  }, [doubleUnitFlag, headerDs]);

  // 设置ds参数
  const setDSQueryParameter = ({ ds, name, value }) => {
    if (ds && isArray(ds)) {
      ds.forEach((_ds) => {
        _ds.setQueryParameter(name, value);
      });
    } else if (ds) {
      ds.setQueryParameter(name, value);
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
