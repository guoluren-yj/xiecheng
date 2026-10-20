/*
 * @Description:
 * @Date: 2022-03-28 12:27:19
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import intl from 'utils/intl';

import { SRM_SPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const basicFormDS = () => ({
  autoCreate: true,
  selection: false,
  primaryKey: 'expandId',

  // table表单显示的字段
  fields: [
    {
      name: 'expandCode',
      type: 'string',
      required: true,
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.priceLibCode').d('策略编码'),
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('expandCode'))) {
          return intl
            .get('ssrc.priceExpandStrategy.expandCode.validation.notChinese')
            .d('策略编码不能为中文');
        }
        return true;
      },
    },
    {
      name: 'expandName',
      type: 'string',
      required: true,
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.expandName').d('策略名称'),
    },
    {
      name: 'priorityLevel',
      type: 'number',
      min: 0,
      step: 1,
      required: true,
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.priorityLevel').d('优先级'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.remark').d('策略说明'),
    },
    {
      name: 'priceLibExpandByCodes',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.expandByCodes').d('调用规则'),
      lookupCode: 'SSRC.PRICE_LIB_SOURCE_FROM',
      multiple: ',',
      required: true,
    },
    {
      name: 'templateIds',
      type: 'object',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.templateIds').d('价格库模板'),
      lovCode: 'SSRC.PRICE_LIB_TEMPLATE',
      multiple: true,
      transformRequest: (val) => val && val.map((item) => item.templateId).toString(),
    },
    {
      name: 'realName',
      type: 'string',
      defaultValue: getCurrentUser().realName,
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.realName').d('创建人'),
      disabled: true,
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.creationDate').d('创建时间'),
      disabled: true,
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('hzero.common.status.enable').d('启用'),
    },
  ],

  transport: {
    submit: (val) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-expands`,
        data: val.data[0],
        method: 'POST',
      };
    },
  },
});

export { basicFormDS };
