import { stringify } from 'querystring';
import type { ReactElement } from 'react';
import React, { createContext, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { ModalProvider, DataSet, Modal } from 'choerodon-ui/pro';
import { flow, isArray } from 'lodash';
import { observer } from 'mobx-react';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import remote from 'utils/remote';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import type { DocType } from '../../utils/type';
import SyncRecord from '../../components/SyncRecord';
import { splitTabGroupKeys } from '../../utils/utils';
import { querySourcingCostList } from '../../utils/api';
import permissionDS from '../../../../stores/permissionDS';
import { tenderTableDS, depositTableDS, serviceTableDS } from './storeDS';
import {
  ActiveKey,
  ListTabsCustCode,
  ListBtnsCustCode,
  TenderListGridCustCode,
  DepositListGridCustCode,
  ServiceListGridCustCode,
} from '../../utils/type';
import commonStyles from '../../../common.less';

export const Store = createContext<any>({});

export interface StoreValueType {
  dsMap: Record<ActiveKey, DataSet>,
  remote: any,
  search: string,
  history: any,
  pathname: string,
  activeKey: ActiveKey,
  tenderKeys: ActiveKey[],
  depositKeys: ActiveKey[],
  serviceKeys: ActiveKey[],
  permissionMap: DSRecord | undefined,
  handleReQuery: () => void,
  getTotalCount: (keys: ActiveKey[]) => void,
  handleTabChange: (key: any) => void,
  handleRecordInit: (key: ActiveKey) => void,
  handleToDetail: (headerId: string | number, docType: DocType) => void,
  customizeTable: Function,
  customizeTabPane: Function,
  customizeBtnGroup: Function,
  handleViewSyncRecord: (feeRecord: DSRecord | null | undefined, docType: DocType) => void,
};

const buttonPermPrefix = 'srm.settle-account.supplier-sourcing-cost.button';

export const permissionCodeMap = {
  tenderPayConfirm: `${buttonPermPrefix}.tender-pay-confirm`,
  depositPayConfirm: `${buttonPermPrefix}.deposit-pay-confirm`,
  depositReturnSupplier: `${buttonPermPrefix}.deposit-return-supplier`,
  depositPrint: `${buttonPermPrefix}.deposit-print`,
};

const splitKeysData = splitTabGroupKeys<ActiveKey>(Object.values(ActiveKey));
const { tenderKeys, depositKeys, serviceKeys } = splitKeysData;

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      ListTabsCustCode,
      ...Object.values(ListBtnsCustCode),
      ...Object.values(TenderListGridCustCode),
      ...Object.values(DepositListGridCustCode),
      ...Object.values(ServiceListGridCustCode),
    ],
  }),
  remote({
    code: 'SSTA.SOURCING_COST_SUP_CUX',
    name: 'remote',
  },{
    events: {
      depositPayModalOpen: () => {},
      beforeReturnSupplier: () => true,
    },
  }),
  withProps(
    (() => {
      const cacheState = new Map(); // 缓存tab页编码
      const initDsMap: Record<ActiveKey, DataSet> = {
        [ActiveKey.TenderAll]: new DataSet(tenderTableDS(ActiveKey.TenderAll)),
        [ActiveKey.TenderInv]: new DataSet(tenderTableDS(ActiveKey.TenderInv)),
        [ActiveKey.TenderPay]: new DataSet(tenderTableDS(ActiveKey.TenderPay)),
        [ActiveKey.TenderDownload]: new DataSet(tenderTableDS(ActiveKey.TenderDownload)),
        [ActiveKey.DepositAll]: new DataSet(depositTableDS(ActiveKey.DepositAll)),
        [ActiveKey.DepositPay]: new DataSet(depositTableDS(ActiveKey.DepositPay)),
        [ActiveKey.DepositReturn]: new DataSet(depositTableDS(ActiveKey.DepositReturn)),
        [ActiveKey.ServiceAll]: new DataSet(serviceTableDS(ActiveKey.ServiceAll)),
        // [ActiveKey.ServicePay]: new DataSet(serviceTableDS(ActiveKey.ServicePay)),
        // [ActiveKey.ServiceInv]: new DataSet(serviceTableDS(ActiveKey.ServiceInv)),
      };
      return {
        initDsMap,
        cacheState,
      };
    }) as any,
    { cacheState: true },
  ) as any,
  formatterCollections({ code: ['ssta.sourcingCost', 'ssta.common'] }),
)((props) => {

  const {
    initDsMap = {},
    remote,
    history,
    children,
    location,
    cacheState = new Map(),
    custConfig,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
  } = props;
  // 初始化过的activeKey对象
  const initRecords = useRef<Record<string, boolean>>({});
  const { fields = [] } = custConfig?.[ListTabsCustCode] || {};
  const { pathname, search } = location;
  const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);
  const permissionMap = permissionDs.current;
  const otherProps = {
    depositTableDS,
    ActiveKey,
  };
  const dsMap = remote ? remote.process('SSTA.SOURCING_COST_SUP_CUX.DS_MAP', initDsMap, otherProps) : initDsMap;
  // 默认激活Tab页的顺序为：1、url指定；2、详情页返回缓存；3、个性化配置；4、代码原有逻辑
  const [activeKey, setActiveKey] = useState(
    cacheState?.get('activeKey') || fieldCode || ActiveKey.TenderAll
  );

  const getTabKeysCount = useCallback(async (tabKeys: ActiveKey[]) => {
    if (!isArray(tabKeys)) return;
    const queryCountParams = { page: 0, size: 1, onlyCountFlag: 'Y' };
    const resMap = await Promise.all(
      tabKeys.map((item) => querySourcingCostList(item, queryCountParams))
    );
    resMap.forEach((res, index) => {
      if (getResponse(res)) {
        const { totalElements = 0 } = res;
        dsMap[tabKeys[index]].setState('totalCount', totalElements);
      }
    });
  }, [dsMap]);

  const getTotalCount = useCallback(async (keys: ActiveKey[] = [activeKey]) => {
    getTabKeysCount(keys);
  }, [activeKey, getTabKeysCount]);

  // 切换Tab页回调
  const handleTabChange = useCallback((key: ActiveKey) => {
    setActiveKey(key);
    cacheState.set('activeKey', key);
    const currentDs = dsMap[key];
    if (initRecords.current[key]) currentDs.query(currentDs.currentPage);
    getTotalCount([key]);
  },
    [setActiveKey, dsMap, cacheState, getTotalCount]
  );

  // 表格初始化回调
  const handleRecordInit = useCallback(key => {
    initRecords.current[key] = true;
  }, []);

  // 跳转至详情页
  const handleToDetail = useCallback((headerId, docType) => {
    const pathnameMap = {
      tender: `/ssta/supplier-sourcing-cost/tender/${headerId}`,
      deposit: `/ssta/supplier-sourcing-cost/deposit/${headerId}`,
      service: `/ssta/supplier-sourcing-cost/service/${headerId}`,
    };
    if (!headerId) return;
    history.push({
      pathname: pathnameMap[docType],
      search: stringify({ type: 'all', source: 'list' }),
    });
  }, [history]);

  const handleReQuery = useCallback(() => {
    dsMap[activeKey].query(dsMap[activeKey].currentPage);
    getTotalCount();
  }, [dsMap, activeKey, getTotalCount]);

  // 查看外部系统同步记录
  const handleViewSyncRecord = useCallback((feeRecord: DSRecord | null | undefined, docType: DocType) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('ssta.sourcingCost.view.button.syncRecord').d('同步记录'),
      className: commonStyles['ssta-large-modal'],
      children: <SyncRecord feeRecord={feeRecord} docType={docType} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, []);

  useEffect(() => {
    getTabKeysCount(Object.keys(dsMap) as ActiveKey[]);
  }, [getTabKeysCount, dsMap]);

  const value = useMemo<StoreValueType>(() => ({
    dsMap,
    remote,
    search,
    history,
    pathname,
    activeKey,
    tenderKeys,
    depositKeys,
    serviceKeys,
    permissionMap,
    handleReQuery,
    getTotalCount,
    handleTabChange,
    handleRecordInit,
    handleToDetail,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    handleViewSyncRecord,
  }), [
    dsMap,
    remote,
    search,
    history,
    pathname,
    activeKey,
    permissionMap,
    getTotalCount,
    handleReQuery,
    handleTabChange,
    handleRecordInit,
    handleToDetail,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    handleViewSyncRecord,
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