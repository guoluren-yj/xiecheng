/*
 * @Description: 供应商开票商品信息-context
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2023-03-22 09:56:26
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import type { ReactElement } from 'react';
import type { Record as DsRecord } from 'choerodon-ui/dataset';
import React, { createContext, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { ModalProvider, DataSet, Modal } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { infoTableDS, mappingTableDS, permissionDS } from './listDS';
import { ActiveKey, GridCustCode, ListTabsCustCode, ListBtnsCustCode } from '../../utils/type';
import GoodsInfoOperation from '../../../Components/GoodsInfoOperation';
import { queryPurGoodsInfo, queryPurGoodsMapping } from '../../../../services/goodsInfoService';
import commonStyles from '../../../common.less';

const permBtnCodePrefix = 'srm.settle-account.basic-config.sup-invoiced-goods.button';

const permissionCodeMap = {
  tabInfo: `${permBtnCodePrefix}.tab-info`,
  tabMapping: `${permBtnCodePrefix}.tab-mapping`,
};

export const Store = createContext<any>({});
export interface StoreValueType
{
  activeKey: ActiveKey,
  infoTableDs: DataSet,
  infoSearchRef: any,
  permissionMap: DsRecord | undefined,
  currentTableDs: DataSet,
  mappingTableDs: DataSet,
  getTotalCount: () => void,
  customizeTable: Function,
  handleTabChange: (key: any) => void,
  handleRecordInit: (key: ActiveKey) => void,
  customizeTabPane: Function,
  handleViewOperation: (queryParams: Record<string, any>, type: 'info' | 'mapping') => void,
  customizeBtnGroup: Function,
};

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      ListTabsCustCode,
      ListBtnsCustCode,
      ...Object.values(GridCustCode),
    ],
  }),
  formatterCollections({ code: ['ssta.goodsInfo', 'ssta.common'] }),
)((props) =>
{

  const {
    children,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
  } = props;
  // 初始化过的activeKey对象
  const infoSearchRef = useRef({});
  const initRecords = useRef<Record<string, boolean>>({});
  const [activeKey, setActiveKey] = useState(ActiveKey.Info);

  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);
  const infoTableDs = useMemo<DataSet>(() => new DataSet(infoTableDS()), []);
  const mappingTableDs = useMemo<DataSet>(() => new DataSet(mappingTableDS()), []);
  const listDsMap = useMemo<Record<ActiveKey, DataSet>>(() => ({
    [ActiveKey.Info]: infoTableDs,
    [ActiveKey.Mapping]: mappingTableDs,
  }), [infoTableDs, mappingTableDs]);
  const currentTableDs = listDsMap[activeKey];
  const permissionMap = permissionDs.current;

  // 查询所有总数目
  const getTotalCount = useCallback(async () =>
  {
    const queryCountParams = { page: 0, size: 1, onlyCountFlag: 'Y' };
    const resMap = await Promise.all([
      queryPurGoodsInfo(queryCountParams),
      queryPurGoodsMapping(queryCountParams),
    ]);
    if (resMap.some((res) => !getResponse(res))) return;
    const [{ totalElements: infoCount = 0 }, { totalElements: mappingCount = 0 }] = resMap;
    infoTableDs.setState('totalCount', infoCount);
    mappingTableDs.setState('totalCount', mappingCount);
  }, [infoTableDs, mappingTableDs]);

  // 切换Tab页回调
  const handleTabChange = useCallback((key: ActiveKey) =>
  {
    setActiveKey(key);
    if (initRecords.current[key]) currentTableDs.query();
  },
    [currentTableDs, setActiveKey]
  );

  // 表格初始化回调
  const handleRecordInit = useCallback((key: ActiveKey) =>
  {
    initRecords.current[key] = true;
  }, []);

  // 查看操作记录
  const handleViewOperation = useCallback((queryParams, type) =>
  {
    Modal.open({
      drawer: true,
      title: intl.get('hzero.common.button.operation').d('操作记录'),
      closable: true,
      key: Modal.key(),
      className: commonStyles['ssta-medium-modal'],
      children: <GoodsInfoOperation type={type} queryParams={queryParams} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, []);

  const value = useMemo<StoreValueType>(() => ({
    activeKey,
    infoTableDs,
    infoSearchRef,
    permissionMap,
    currentTableDs,
    mappingTableDs,
    getTotalCount,
    customizeTable,
    handleTabChange,
    handleRecordInit,
    customizeTabPane,
    handleViewOperation,
    customizeBtnGroup,
  }), [
    activeKey,
    infoTableDs,
    permissionMap,
    currentTableDs,
    mappingTableDs,
    getTotalCount,
    customizeTable,
    handleTabChange,
    handleRecordInit,
    customizeTabPane,
    handleViewOperation,
    customizeBtnGroup,
  ]);

  useEffect(() =>
  {
    getTotalCount();
  }, [getTotalCount]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </Store.Provider>
  );
}) as (props: any) => ReactElement;

export default StoreProvider;

