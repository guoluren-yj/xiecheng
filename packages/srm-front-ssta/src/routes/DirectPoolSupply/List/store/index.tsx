import type { ReactElement } from 'react';
import React, { createContext, useMemo, useCallback, useEffect } from 'react';
import { DataSet, ModalProvider } from 'choerodon-ui/pro';
import { flow, isArray } from 'lodash';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import { parse } from 'querystring';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { getCurrentOrganizationId } from 'utils/utils';

import { GridCustCodeMap, FilterCustCodeMap, ListTabsCustCode, ListBtnsCustCode, ActiveKey, PermissionCodeMap, ActionMapReserve } from '../utils/type';
import { wholeListDS, errorTableDS, invoiceListDS } from './listDS';
import permissionDS from './permissionDS';
import { fetchListAllTotal } from '../utils/api';
import { operationDS as operationDs } from '../../../pubDS/operationDS';


export const Store = createContext<any>({});


export interface StoreValueType {
  modal: any,
  remote: any,
  history: any,
  customizeTable: Function,
  customizeTabPane: Function,
  customizeBtnGroup: Function,
  custConfig: any,
  dsMap: any,
  cacheState: any,
  defaultActiveKey: ActiveKey,
  permissionMap: any,
  // operationDS: any,
};

const StoreProvider = flow(
  observer,
  // @ts-ignore
  withCustomize({
    unitCode: [
      ListTabsCustCode,
      ListBtnsCustCode,
      ...Object.values({ ...GridCustCodeMap, ...FilterCustCodeMap }),
    ],
  }),
  withProps(
    (() => {
      const cacheState = new Map(); // 缓存tab页编码
      const dsMap = {
        [ActiveKey.A]: new DataSet(wholeListDS(ActiveKey.A, 'ALL')),
        [ActiveKey.B]: new DataSet(wholeListDS(ActiveKey.B, 'INVOICE')),
        [ActiveKey.C]: new DataSet(wholeListDS(ActiveKey.C, 'INVOICED')),
        [ActiveKey.D]: new DataSet(errorTableDS()),
        [ActiveKey.InvoiceAll]: new DataSet(invoiceListDS(ActiveKey.InvoiceAll, 'ALL')),
        [ActiveKey.InvoicePending]: new DataSet(invoiceListDS(ActiveKey.InvoicePending, 'UPDATE')),
      };
      return {
        dsMap,
        cacheState,
      };
    }) as any,
    { cacheState: true },
  ) as any,
  formatterCollections({ code: ['hzero.common', 'ssta.common', 'ssta.directPoolSupply', 'ssta.costSheet'] }),
)((props) => {
  const {
    modal,
    remote,
    history,
    children,
    custConfig,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    dsMap,
    cacheState,
    location,
  } = props;
  const { type: urlType } = parse(location.search.substring(1));

  const { fields = [] } = custConfig?.[ListTabsCustCode] || {};
  const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
  const defaultActiveKey = urlType || cacheState?.get('activeKey') || fieldCode || ActiveKey.InvoiceAll;

  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(PermissionCodeMap)), []);
  const permissionMap = permissionDs.current;
  const operationDS = useMemo(
    () =>
      new DataSet(
        // @ts-ignore
        operationDs({
          url: `/ssta/v1/${getCurrentOrganizationId()}/direct-pool-actions/list`,
          pk: 'poolId',
        })
      ),
    []
  );

  // 查询所有总数目
  const fetchTabKeysCount = useCallback(async (tabKeys: ActiveKey[] = []) => {
    let resMap: any = [];
    if (!tabKeys.length) {
      resMap = await Promise.all([fetchListAllTotal('affair'), fetchListAllTotal('invoice')]);
    } else {
      const keyName = [ActiveKey.InvoiceAll, ActiveKey.InvoicePending].includes(tabKeys[0]) ? 'invoice' : 'affair';
      resMap = await Promise.all(
        tabKeys.map((item) => fetchListAllTotal(keyName, item))
      );
    }
    runInAction(() => {
      resMap.forEach((res) => {
        const { data, key } = res;
        if (isArray(data)) {
          data.forEach(({tab, count}) => {
            // eslint-disable-next-line no-unused-expressions
            dsMap[ActionMapReserve[key][tab]]?.setState('totalCount', count);
          });
        }
      });
    });
  }, [dsMap]);

  useEffect(() => {
    fetchTabKeysCount([]);
  }, [fetchTabKeysCount]);

  const value = useMemo<StoreValueType>(() => ({
    modal,
    remote,
    history,
    dsMap,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    custConfig,
    cacheState,
    permissionMap,
    location,
    defaultActiveKey,
    operationDS,
    fetchTabKeysCount,
  }), [
    modal,
    remote,
    history,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    custConfig,
    dsMap,
    permissionMap,
    cacheState,
    location,
    defaultActiveKey,
    operationDS,
    fetchTabKeysCount,
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
