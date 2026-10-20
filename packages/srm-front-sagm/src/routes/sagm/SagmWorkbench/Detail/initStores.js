// 初始化数据源
import { DataSet } from 'choerodon-ui/pro';
import getAgmHeaderDs from '../Stores/agmHeaderDs';
import getAgmLineDs from '../Stores/agmLineDs';
import getStrategyDs from '../Stores/strategyDs';
import { getInvoiceDs, getOrderLimitDs } from '../Stores/memberDs';
import { getReceiveLimitDs } from '../Stores/receiveDs';

export default function initStores({ agreementHeaderId, setAgmInfo }) {
  const orderLimitDs = new DataSet(getOrderLimitDs());
  const _baseInfoDs = new DataSet({ fields: getAgmHeaderDs().fields }); // 处理个性化的不同ds
  const baseInfoDs = new DataSet(
    getAgmHeaderDs(
      { queryParams: { agreementHeaderId } },
      { autoQuery: false },
      {
        setAgmInfo: info => {
          _baseInfoDs.loadData([info]);
          setAgmInfo(prev => ({ ...prev, ...info }));
        },
      },
      { orderLimitDs }
    )
  );
  const strategyDs = new DataSet(getStrategyDs());
  const invoiceDs = new DataSet(getInvoiceDs());
  const _invoiceDs = new DataSet(getInvoiceDs());
  const receiveLimitDs = new DataSet(getReceiveLimitDs());
  const receiveSaleLineDs = new DataSet(getAgmLineDs({}, { autoQuery: false, paging: false }));
  return {
    baseInfoDs,
    _baseInfoDs,
    strategyDs,
    invoiceDs,
    _invoiceDs,
    orderLimitDs,
    receiveLimitDs,
    receiveSaleLineDs,
  };
}
