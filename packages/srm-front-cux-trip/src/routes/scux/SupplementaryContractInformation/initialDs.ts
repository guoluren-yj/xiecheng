import intl from 'hzero-front/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/Field';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';

const intlPrompt = 'scux.supplementaryContractInformation'; // 多语言前缀

const columnField = (attributeVarchar28): FieldProps[] => {
  const arr = [
    {
      name: 'costCenterLov',
      type: FieldType.object,
      label: intl.get(`${intlPrompt}.item.costCenterLov`).d('费用中心'),
      lovCode: 'SPRM.COST_CENTER',
      required: attributeVarchar28 === 'BAT001',
      ignore: FieldIgnore.always,
    },
    {
      name: 'costcenter',
      bind: 'costCenterLov.costCode',
    },
    {
      name: 'costName',
      bind: 'costCenterLov.costName',
    },
    {
      name: 'budgetLov',
      type: FieldType.object,
      label: intl.get(`${intlPrompt}.item.budgetLov`).d('预算分类'),
      lovCode: 'SPRM.ACCOUNT_SUBJECT_NO_COMPANY_ID',
      required: attributeVarchar28 === 'BAT002',
      ignore: FieldIgnore.always,
    },
    {
      name: 'budgetCategory',
      bind: 'budgetLov.accountSubjectId',
    },
    {
      name: 'accountSubjectName',
      bind: 'budgetLov.accountSubjectName',
    },
    {
      name: 'currencyLov',
      type: FieldType.object,
      label: intl.get(`${intlPrompt}.table.payType`).d('币种'),
      lovCode: 'SMDM.CURRENCY_CODE',
      defaultValue: { currencyCode: 'CNY', currencyName: '人民币' },
      ignore: FieldIgnore.always,
      required: true,
    },
    {
      name: 'currencyName',
      bind: 'currencyLov.currencyName',
    },
    {
      name: 'currency',
      bind: 'currencyLov.currencyCode',
    },
    {
      name: 'currencyId',
      bind: 'currencyLov.currencyId',
    },
    {
      name: 'amount',
      type: FieldType.number,
      label: intl.get(`${intlPrompt}.table.amount`).d('金额'),
      precision: 2,
      min: 0,
      required: true,
    },
    {
      name: 'exchangeRate',
      label: intl.get(`${intlPrompt}.table.exchangeRate`).d('汇率'),
    },
    {
      name: 'purchaseCurrencyCode',
      label: intl.get(`${intlPrompt}.table.purchaseCurrencyCode`).d('本币币种'),
    },
    {
      name: 'purchaseAmount',
      label: intl.get(`${intlPrompt}.table.purchaseAmount`).d('本币金额'),
      type: FieldType.number,
    },
  ];
  return arr;
};
// 列表ds
const tableDataSet = (attributeVarchar28): DataSetProps => {
  return {
    forceValidate: true,
    primaryKey: 'id',
    fields: columnField(attributeVarchar28),
    paging: false,
  };
};

export { tableDataSet, intlPrompt };
