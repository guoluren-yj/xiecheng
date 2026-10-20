import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { amountFormatterOptions } from '../../../utils/utils';


const organizationId = getCurrentOrganizationId();

const invoiceRecordDS = (): DataSetProps => {
  return {
    pageSize: 10,
    selection: false,
    autoQuery: false,
    fields: [
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.settleNum`)
          .d('结算事务编号'),
        type: FieldType.string,
        name: 'settleNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.recordStatuss`)
          .d('开票状态'),
        type: FieldType.string,
        name: 'recordStatusMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.documentNumAndLines`)
          .d('结算单编号|行号'),
        type: FieldType.string,
        name: 'documentNumAndLine',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.quantitys`)
          .d('开票数量'),
        type: FieldType.number,
        name: 'quantity',
      },
      {
        label: intl
          .get(`ssta.common.model.common.company`)
          .d('公司'),
        type: FieldType.string,
        name: 'companyName',
      },
      {
        label: intl
          .get(`ssta.common.model.common.company`)
          .d('供应商'),
        type: FieldType.string,
        name: 'supplierCompanyName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.netPrices`)
          .d('开票单价(不含税)'),
        type: FieldType.number,
        name: 'netPrice',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxIncludedPrices`)
          .d('开票单价(含税)'),
        type: FieldType.number,
        name: 'taxIncludedPrice',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxRates`).d('开票税率'),
        type: FieldType.number,
        name: 'taxRate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.taxAmounts`)
          .d('开票税额'),
        type: FieldType.number,
        name: 'taxAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.recordDates`)
          .d('开票日期'),
        type: FieldType.date,
        name: 'recordDate',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.recordSources`)
          .d('开票来源'),
        type: FieldType.string,
        name: 'recordSource',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.camp_range`)
          .d('创建方阵营'),
        type: FieldType.string,
        name: 'campMeaning',
      },
      {
        label: intl.get(`ssta.common.model.common.processUser`).d('操作人'),
        type: FieldType.string,
        name: 'createdUserName',
      },
      {
        label: intl.get(`ssta.common.model.common.processTime`).d('操作时间'),
        type: FieldType.date,
        name: 'creationDate',
      },
      {
        name: 'operation',
        type: FieldType.string,
        label: intl.get('ssta.purchaseSettlePool.model.purchaseSettlePool.operation').d('操作'),
      },


    ],
    transport: {
      read: () => {
        const url = `/ssta/v1/${organizationId}/settle-records/bill-invoce-record`;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};

export { invoiceRecordDS };
