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
type DocType = 'tender' | 'deposit' | 'service';

export interface StoreValueType {
  dsMap: Record<ActiveKey, DataSet>,
  remote: any,
  activeKey: ActiveKey,
  tenderKeys: ActiveKey[],
  depositKeys: ActiveKey[],
  serviceKeys: ActiveKey[],
  permissionMap: DSRecord | undefined,
  handleReQuery: () => void,
  getTotalCount: (tabKeys: ActiveKey[]) => void,
  handleTabChange: (key: any) => void,
  handleRecordInit: (key: ActiveKey) => void,
  searchBarRefMap?: any,
  handleSearchBarRef: (elem: any, key: ActiveKey) => any,
  handleToDetail: (headerId: string | number, docType: DocType) => void,
  customizeTable: Function,
  customizeTabPane: Function,
  customizeBtnGroup: Function,
  handleViewSyncRecord: (feeRecord: DSRecord | null | undefined, docType: DocType) => void,
  history: any,
};

const buttonPermPrefix = 'srm.settle-account.purchaser-sourcing-cost.button';

export const permissionCodeMap = {
  tenderInvoicing: `${buttonPermPrefix}.tender-invoicing`,
  depositPay: `${buttonPermPrefix}.deposit-pay`,
  depositReturn: `${buttonPermPrefix}.deposit-return`,
  tenderProgressCtrl: `${buttonPermPrefix}.tender-progress-ctrl`,
  depositProgressCtrl: `${buttonPermPrefix}.deposit-progress-ctrl`,
  serviceAmountExchange: `${buttonPermPrefix}.service-amount-exchange`,
  depositPrint: `${buttonPermPrefix}.deposit-print`,
};

const splitKeysData = splitTabGroupKeys<ActiveKey>(Object.values(ActiveKey));
const { depositKeys, tenderKeys, serviceKeys } = splitKeysData;

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
  withProps(
    ((_props) => {
      const { remote } = _props || {}
      const cacheState = new Map(); // 缓存tab页编码
      const initDsMap: Record<ActiveKey, DataSet> = {
        [ActiveKey.TenderAll]: new DataSet(tenderTableDS(ActiveKey.TenderAll, remote)),
        [ActiveKey.TenderInv]: new DataSet(tenderTableDS(ActiveKey.TenderInv, remote)),
        [ActiveKey.TenderPay]: new DataSet(tenderTableDS(ActiveKey.TenderPay, remote)),
        [ActiveKey.DepositAll]: new DataSet(depositTableDS(ActiveKey.DepositAll, remote)),
        [ActiveKey.DepositPay]: new DataSet(depositTableDS(ActiveKey.DepositPay, remote)),
        [ActiveKey.DepositReturn]: new DataSet(depositTableDS(ActiveKey.DepositReturn, remote)),
        [ActiveKey.ServiceAll]: new DataSet(serviceTableDS(ActiveKey.ServiceAll, remote)),
        [ActiveKey.ServicePay]: new DataSet(serviceTableDS(ActiveKey.ServicePay, remote)),
        [ActiveKey.ServiceInv]: new DataSet(serviceTableDS(ActiveKey.ServiceInv, remote)),
      };
      return {
        initDsMap,
        cacheState,
      };
    }) as any,
    { cacheState: true },
  ) as any,
  remote({
    code: 'SSTA.SOURCING_COST_PUR_CUX',
    name: 'remote',
  }, {
    events: {
      tenderConfirmPay(eventProps) {
        const { openConfirmModal } = eventProps || {};
        if (openConfirmModal) {
          openConfirmModal();
        }
      },
      depositPayModalOpen: () => { },
      beforeReturnSupplier: () => true,
      beforeQuoteDepositPaySubmit: () => true,
    },
  }),
  formatterCollections({ code: ['ssta.sourcingCost', 'ssta.common'] }),
)((props) => {

  const {
    initDsMap = {},
    remote,
    history,
    children,
    cacheState = new Map(),
    custConfig,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
  } = props;
  // 初始化所有Tab的searchBar的ref
  const searchBarRefMap = useRef(new Map());
  // 初始化过的activeKey对象
  const initRecords = useRef<Record<string, boolean>>({});
  const { fields = [] } = custConfig?.[ListTabsCustCode] || {};
  const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
  // 默认激活Tab页的顺序为：1、url指定；2、详情页返回缓存；3、个性化配置；4、代码原有逻辑
  const [activeKey, setActiveKey] = useState<ActiveKey>(
    cacheState?.get('activeKey') || fieldCode || ActiveKey.TenderAll
  );
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);
  const permissionMap = permissionDs.current;
  const otherProps = {
    depositTableDS,
    ActiveKey,
    depositKeys,
  };
  const dsMap = remote ? remote.process('SSTA.SOURCING_COST_PUR_CUX.DS_MAP', initDsMap, otherProps) : initDsMap;

  const handleSearchBarRef = (ref, key) => {
    if (searchBarRefMap && searchBarRefMap.current) {
      searchBarRefMap.current.set(key, ref);
    }
  }

  const getTabKeysCount = useCallback(async (tabKeys: ActiveKey[]) => {
    if (!isArray(tabKeys)) return;
    const queryCountParams = { page: 0, size: 1, onlyCountFlag: 'Y' };

    const eventMap = tabKeys.map((item) => {
      let currentEvent = () => querySourcingCostList(item, queryCountParams);

      currentEvent = remote ? remote.process('SSTA.SOURCING_COST_PUR_CUX.EVENT_MAP', currentEvent, {
        item,
        queryCountParams,
      }) : currentEvent();
      return currentEvent();
    });

    const resMap = await Promise.all(eventMap);
    resMap.forEach((res, index) => {
      const result = getResponse(res);
      if (result) {
        const { totalElements = 0 } = result || {};
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
    if (remote && remote.event) {
      remote.event.fireEvent('beforeDsQuery', { key, currentDs, searchBarRefMap, dsMap, initFlag: initRecords.current[key] });
    }
    if (initRecords.current[key]) {
      currentDs.query(currentDs.currentPage);
    }
    getTotalCount([key]);
  },
    [setActiveKey, dsMap, cacheState, getTotalCount, searchBarRefMap?.current?.size]
  );

  // 表格初始化回调
  const handleRecordInit = useCallback(key => {
    initRecords.current[key] = true;
  }, []);

  // 跳转至详情页
  const handleToDetail = useCallback((headerId, docType) => {
    const pathnameMap = {
      tender: `/ssta/purchaser-sourcing-cost/tender/${headerId}`,
      deposit: `/ssta/purchaser-sourcing-cost/deposit/${headerId}`,
      service: `/ssta/purchaser-sourcing-cost/service/${headerId}`,
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
  const handleViewSyncRecord = useCallback((feeRecord: DSRecord | null | undefined, docType) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('ssta.sourcingCost.view.button.syncRecord').d('同步记录'),
      className: commonStyles['ssta-large-modal'],
      children: <SyncRecord feeRecord={feeRecord} docType={docType} okCallback={handleReQuery} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [handleReQuery]);

  useEffect(() => {
    getTabKeysCount(Object.keys(dsMap) as ActiveKey[]);
  }, [getTabKeysCount, dsMap]);

  const value = useMemo<StoreValueType>(() => ({
    dsMap,
    remote,
    activeKey,
    tenderKeys,
    depositKeys,
    serviceKeys,
    permissionMap,
    searchBarRefMap,
    handleSearchBarRef,
    getTotalCount,
    handleReQuery,
    handleTabChange,
    handleRecordInit,
    handleToDetail,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    handleViewSyncRecord,
    history,
  }), [
    dsMap,
    remote,
    activeKey,
    permissionMap,
    searchBarRefMap,
    handleSearchBarRef,
    getTotalCount,
    handleReQuery,
    handleTabChange,
    handleRecordInit,
    handleToDetail,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    handleViewSyncRecord,
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
