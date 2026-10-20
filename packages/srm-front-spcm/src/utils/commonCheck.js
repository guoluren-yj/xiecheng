import intl from 'utils/intl';
import notification from 'utils/notification';

// 校验订单签署的合同
export const checkOrderSignContract = (record = {}) => {
  const { orderSignFlag } = record || {};
  if (Number(orderSignFlag) === 1) {
    notification.error({
      description: intl
        .get('spcm.common.view.message.orderSignGenerate')
        .d('该合同由订单签署自动生成，不支持该操作，请在对应订单中完成操作。'),
    });
    return true;
  }
  return false;
};

// 批量校验订单签署的合同
export const batchCheckOrderSignContract = (records = []) => {
  const flag = (records || []).some((i) => {
    return Number(i.orderSignFlag) === 1;
  });
  if (flag) {
    notification.error({
      description: intl
        .get('spcm.common.view.message.selectedOrderSignGenerate')
        .d('所选单据包含由订单签署自动生成的合同，不支持该操作，请在对应订单中完成操作。'),
    });
    return true;
  }
  return false;
};
