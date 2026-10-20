/*
 * @Date: 2024-06-28 17:14:47
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getFormDs = () => ({
  paging: false,
  fields: [
    {
      name: 'remainOccupiedAmount',
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet?.current?.get('amountField') === 'TAX_INCLUDED_PRICE'
            ? intl.get('spcm.common.model.field.surplusAmountIncludedTax').d('含税剩余金额')
            : intl.get('spcm.common.model.field.surplusAmountExcludedTax').d('不含税剩余金额'),
      },
    },
    {
      name: 'totalAmount',
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet?.current?.get('amountField') === 'TAX_INCLUDED_PRICE'
            ? intl.get('spcm.common.model.field.totalAmountIncludedTax').d('含税总金额')
            : intl.get('spcm.common.model.field.totalAmountExcludedTax').d('不含税总金额'),
      },
    },
    {
      name: 'totalOccupiedAmount',
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet?.current?.get('amountField') === 'TAX_INCLUDED_PRICE'
            ? intl.get('spcm.common.model.field.occupyTotalAmountIncludedTax').d('含税总占用金额')
            : intl
                .get('spcm.common.model.field.occupyTotalAmountExcludedTax')
                .d('不含税总占用金额'),
      },
    },
  ],
  transport: {
    read: {
      url: `${SRM_SPCM}/v1/${organizationId}/pc-execute-amounts/detail`,
      method: 'GET',
    },
  },
});

export const getTableDs = () => ({
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'displayPoNumAndLineNum',
      label: intl.get('spcm.common.model.field.displayPoNumAndLineNUm').d('单号-行号'),
    },
    {
      name: 'executeTaxIncludedAmount',
      label: intl
        .get('spcm.common.model.field.downDocIncludedTaxLineAmount')
        .d('下游单据含税行金额'),
    },
    {
      name: 'executeAmount',
      label: intl
        .get('spcm.common.model.field.downDocExcludedTaxLineAmount')
        .d('下游单据不含税行金额'),
    },
    {
      name: 'executeCurrencyCode',
      label: intl.get('spcm.common.currencyCode').d('原币币种'),
    },
    {
      name: 'executeDate',
      label: intl.get('spcm.common.model.field.firstSubmitTime').d('首次提交时间'),
    },
    {
      name: 'calculateTaxIncludedAmount',
      label: intl.get('spcm.common.model.field.occupyAmountIncludedTax').d('含税占用金额'),
    },
    {
      name: 'calculateAmount',
      label: intl.get('spcm.common.model.field.occupyAmountExcludedTax').d('不含税占用金额'),
    },
    {
      name: 'lastUpdateDate',
      label: intl.get('spcm.common.model.field.occupationOrUpdateTime').d('占用/更新时间'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SPCM}/v1/${organizationId}/pc-execute-amounts/detail/page`,
      method: 'GET',
    },
  },
});
