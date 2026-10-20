// 请求
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  updateSaleLine,
  deleteAgreement,
  expireAgreement,
  effectAgreement,
  saveAgreement,
  validateSubmitAgr,
  submitAgr,
} from './api';

// 销售协议行生效失效
export async function handleUpdateSaleLine(args) {
  const { dataSet, record } = args;
  dataSet.status = 'submit';
  const line = record.toJSONData();
  const params = { saleLines: [line], suffix: line.effectiveFlag ? 'expired' : 'effected' };
  const res = getResponse(await updateSaleLine(params));
  dataSet.status = 'ready';
  if (res) {
    notification.success();
    dataSet.query(dataSet.currentPage);
  }
}

// 删除销售协议
export async function handleDeleteSagm(dataSet, callback = e => e) {
  const params = dataSet.current.toJSONData();
  const res = getResponse(await deleteAgreement(params));
  if (res) {
    notification.success();
    callback();
  }
}

const getValidateSaveData = async ({
  baseInfoDs,
  strategyDs,
  invoiceDs,
  orderLimitDs,
  receiveLimitDs,
  receiveSaleLineDs,
}) => {
  const flag = await baseInfoDs.validate();
  const baseInfo = baseInfoDs.current.toJSONData();
  const isMember = baseInfo.agreementHeaderType === 'MEMBER';
  const isReceive = baseInfo.agreementHeaderType === 'RECEIVE';
  const isCashPay = baseInfo.paymentType === 'CASH_PAYMENT'; // 现金支付
  if (isReceive) {
    receiveSaleLineDs.setState('saveLoading', true);
  }
  const invoiceFlag = isMember ? await invoiceDs.validate() : true;
  const orderFlag = isMember && !isCashPay ? await orderLimitDs.validate() : true;
  const receiveFlag = isReceive ? await receiveLimitDs.validate() : true;
  if (!receiveFlag) {
    // 领用限制校验不通过导致领用协议行 保存 一直loading
    receiveSaleLineDs.setState('saveLoading', false);
  }
  const receiveSaleLineFlag = isReceive ? await receiveSaleLineDs.validate() : true;
  if (flag && invoiceFlag && orderFlag && receiveFlag && receiveSaleLineFlag) {
    if (isMember) {
      baseInfo.saleInvoicingRulesList = invoiceDs.toJSONData();
      baseInfo.salePointsLimits = isCashPay ? [] : orderLimitDs.toData();
      const { salePointsDetails = [] } = baseInfo;
      baseInfo.salePointsDetails = salePointsDetails.map(m => ({ pointsTypeId: m.pointsTypeId }));
    }
    if (isReceive) {
      baseInfo.saleAgreementReceiveLimits = receiveLimitDs.toJSONData();
      baseInfo.saleAgreementLines = receiveSaleLineDs.toJSONData();
    } else {
      baseInfo.salePriceStrategyLines = strategyDs.toData();
    }
    return baseInfo;
  }
};

// 发布
export async function handlePublish(dataSetMap, callback = e => e) {
  const saveData = await getValidateSaveData(dataSetMap);
  if (saveData) {
    const isReceive = saveData.agreementHeaderType === 'RECEIVE';
    const authInfo = res => {
      notification.info({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: res.message,
      });
    };
    const validateRes = getResponse(await validateSubmitAgr(saveData), isReceive ? null : authInfo);
    if (validateRes || !isReceive) {
      const res = getResponse(await effectAgreement(saveData));
      dataSetMap.receiveSaleLineDs.setState('saveLoading', false);
      if (res) {
        callback(res);
        notification.success();
      }
    }
  }
}

// 取消发布
export async function handleCancelPublish(dataSet) {
  const params = dataSet.current.toJSONData();
  const res = getResponse(await expireAgreement(params));
  if (res) {
    notification.success();
    dataSet.query();
  }
}

// 保存
export async function handleSave(dataSetMap, callback = e => e) {
  const saveData = await getValidateSaveData(dataSetMap);
  if (saveData) {
    const params = {
      ...saveData,
      statusCode: 'NEW',
    };
    const result = getResponse(await saveAgreement(params));
    dataSetMap.receiveSaleLineDs.setState('saveLoading', false);
    if (result) {
      notification.success();
      callback(result);
    }
  }
}

// 提交
export async function handleSubmit(dataSetMap, callback = e => e) {
  const saveData = await getValidateSaveData(dataSetMap);
  if (saveData) {
    const isReceive = saveData.agreementHeaderType === 'RECEIVE';
    const validateRes = getResponse(await validateSubmitAgr(saveData));
    if (validateRes || !isReceive) {
      const res = getResponse(await submitAgr(saveData));
      dataSetMap.receiveSaleLineDs.setState('saveLoading', false);
      if (res) {
        notification.success();
        callback(res);
      }
    }
  }
}
