import type { ReactElement } from 'react';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { DataSet, useModal, ModalProvider } from 'choerodon-ui/pro';
import { flow, isArray } from 'lodash';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { aiRecognizeRecordDS } from './storeDS';
import { AiRecognizeStatus, getAiRecognizeSearchCode } from '../utils/type';
import { fetchAiRecognizeRecordTotal } from '../utils/api';
import { useModalOpen } from '../../../../hooks';
import AiInvoiceRecognizeDetail from '../Detail';

export const Store = createContext<any>({});

export interface StoreValueType {
  dsMap: Record<AiRecognizeStatus, DataSet>;
  history: any;
  activeKey: AiRecognizeStatus;
  fetchTabKeysCount: (countTabKeys?: AiRecognizeStatus[]) => void;
  handleTabChange: (key: string) => void;
  handleToDetail: (record: any, operate: 'edit' | 'view') => void;
  handleToSettleDetail: (record: any) => void;
  isSupplier: boolean;
}

const tabKeys = [
  AiRecognizeStatus.Pending,
  AiRecognizeStatus.Success,
  AiRecognizeStatus.Fail,
];

const StoreProvider = flow(
  observer,
  withProps(
    (() => {
      const cacheState = new Map();
      const dsMap = {
        [AiRecognizeStatus.Pending]: new DataSet(aiRecognizeRecordDS(AiRecognizeStatus.Pending)),
        [AiRecognizeStatus.Success]: new DataSet(aiRecognizeRecordDS(AiRecognizeStatus.Success)),
        [AiRecognizeStatus.Fail]: new DataSet(aiRecognizeRecordDS(AiRecognizeStatus.Fail)),
      };
      return {
        cacheState,
        dsMap,
      };
    }) as any,
    { cacheState: true }
  ) as any,
  formatterCollections({ code: ['ssta.common', 'ssta.aiRecognizeRecord', 'hzero.common'] })
)((props) => {
  const {
    dsMap = {},
    history,
    children,
    cacheState = new Map(),
    isSupplier = false,
  } = props;
  const modalOpen = useModalOpen(useModal());
  const [activeKey, setActiveKey] = useState(
    cacheState?.get('activeKey') || AiRecognizeStatus.Pending
  );

  const fetchTabKeysCount = useCallback(async (countTabKeys: AiRecognizeStatus[] = tabKeys) => {
    if (!isArray(countTabKeys)) return;
    const resMap = await Promise.all(
      countTabKeys.map((key) => fetchAiRecognizeRecordTotal({ identifyStatus: key }))
    );
    if (resMap.some((res) => !getResponse(res))) return;
    runInAction(() => {
      resMap.forEach(({ totalElements = 0 }, index) => {
        dsMap[countTabKeys[index]].setState('totalCount', totalElements);
      });
    });
  }, [dsMap]);

  const handleTabChange = useCallback((key: string) => {
    const currentDs = dsMap[key as AiRecognizeStatus];
    setActiveKey(key);
    cacheState.set('activeKey', key);
    if (currentDs.getState('queryStatus') === 'ready') currentDs.query(currentDs.currentPage);
    fetchTabKeysCount([key as AiRecognizeStatus]);
  }, [cacheState, dsMap, fetchTabKeysCount]);

  const handleToDetail = useCallback((record, operate: 'edit' | 'view') => {
    modalOpen({
      size: 'large',
      editFlag: operate === 'edit',
      title: intl.get('ssta.aiRecognizeRecord.view.title.invoiceAiRecognizeDetail').d('发票AI识别详情'),
      children: <AiInvoiceRecognizeDetail aiBatchId={record.get('aiBatchId')} operate={operate} />,
    });
  }, [modalOpen]);

  const handleToSettleDetail = useCallback((record) => {
    const settleHeaderId = record.get('settleHeaderId');
    if (!settleHeaderId) return;
    const pathname = isSupplier
      ? `/ssta/new-supply-settle/invoice/${settleHeaderId}`
      : `/ssta/new-purchase-settle/invoice/${settleHeaderId}`;
    history.push({ pathname });
  }, [history, isSupplier]);

  useEffect(() => {
    const searchCodeMap = getAiRecognizeSearchCode(isSupplier);
    tabKeys.forEach((key) => {
      dsMap[key].setQueryParameter('customizeUnitCode', searchCodeMap[key]);
    });
    fetchTabKeysCount();
  }, [dsMap, isSupplier, fetchTabKeysCount]);

  const value: StoreValueType = useMemo(() => ({
    dsMap,
    history,
    activeKey,
    fetchTabKeysCount,
    handleTabChange,
    handleToDetail,
    handleToSettleDetail,
    isSupplier,
  }), [
    dsMap,
    history,
    activeKey,
    fetchTabKeysCount,
    handleTabChange,
    handleToDetail,
    handleToSettleDetail,
    isSupplier,
  ]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
}) as (props: any) => ReactElement;

export default StoreProvider;