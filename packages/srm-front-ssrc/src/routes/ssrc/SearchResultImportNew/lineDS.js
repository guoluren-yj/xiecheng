/**
 * 阶梯报价DS配置
 * @date: 2020-09-03
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();
const promptCode = 'ssrc.searchResultImport';

const ladderQuotationDS = () => ({
  primaryKey: 'priceLibLadderId',
  selection: false,

  // table表单显示的字段
  fields: [
    {
      name: 'ladderLineNum',
      type: 'string',
      label: intl.get(`${promptCode}.model.searchResultImport.ladderLineNum`).d('行号'),
    },
    {
      name: 'ladderFrom',
      type: 'string',
      label: intl.get(`${promptCode}.model.searchResultImport.numRanger`).d('数量范围'),
    },
    {
      name: 'ladderPrice',
      type: 'number',
      label: intl.get(`${promptCode}.model.searchResultImport.taxIncludedPrice`).d('单价(含税)'),
    },
    {
      name: 'ladderNetPrice',
      type: 'number',
      label: intl.get(`${promptCode}.model.searchResultImport.netPrice`).d('单价(不含税)'),
    },
    {
      name: 'cumulativeFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`${promptCode}.model.searchResultImport.cumulative`).d('是否累计阶梯'),
    },
    {
      name: 'ladderPriceRemark',
      type: 'string',
      label: intl.get(`${promptCode}.model.searchResultImport.remark`).d('备注'),
    },
  ],

  transport: {
    read: ({ data }) => {
      const url =
        data.viewCode && data.viewCode !== 'ALL_VIEW'
          ? `${SRM_SPC}/v1/${organizationId}/price-lib-view-ladders`
          : `${SRM_SPC}/v1/${organizationId}/price-lib-ladders`;
      return {
        url,
        method: 'GET',
        data,
      };
    },
  },
});

export { ladderQuotationDS };
