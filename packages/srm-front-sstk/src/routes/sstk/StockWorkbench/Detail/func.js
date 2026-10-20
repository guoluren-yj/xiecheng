import { useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';

import { getResponse, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';

import { orderHeaderDS, orderLineDS, allocationOrderHeaderDS } from './store/orderDetail';
import { fetchSaveOrder, fetchSubmitOrder, fetchDeliveryOrder, fetchStorageOrder, fetchTransferOver } from '../api';

function useInitStore({inOutHeaderId, readOnly, operateType, remote}) {
  const baseInfoDs = useMemo(() =>
    new DataSet(operateType === 'TRANSFER' ? allocationOrderHeaderDS(inOutHeaderId) : orderHeaderDS(inOutHeaderId))
    , [operateType, inOutHeaderId]);
  const orderLineDs = useMemo(() => new DataSet(orderLineDS(readOnly, operateType, remote)), [readOnly, operateType]);
  return {
    baseInfoDs,
    orderLineDs,
  };
}

async function handleOrderOperate({ baseInfoDs, orderLineDs, operateType }, type = '', callback) {
  const apiMap = {
    save: fetchSaveOrder,
    submit: fetchSubmitOrder,
  };
  const baseFlag = await baseInfoDs.validate();
  const lineFlag = await orderLineDs.validate();
  if (baseFlag && lineFlag) {
    const baseData = baseInfoDs.current.toJSONData();
    const lineData = orderLineDs.toJSONData();
    const res = getResponse(await apiMap[type](filterNullValueObject({
      ...baseData,
      operateType,
      inOutOrderLineList: lineData.map(m => ({ ...m, inOutHeaderId: baseData.inOutHeaderId })),
    })));
    if (res) {
      notification.success();
      callback(res);
    }
  }
}

async function handleInOrOutStock(type = 'in', inOutHeaderId, callback) {
  const api = type === 'in'
    ? fetchStorageOrder
    : type === 'out'
    ? fetchDeliveryOrder
    : fetchTransferOver;
  const res = getResponse(await api({
    inOutHeaderId,
  }));
  if (res) {
    notification.success();
    callback();
  }
}

export {
  useInitStore,
  handleOrderOperate,
  handleInOrOutStock,
};