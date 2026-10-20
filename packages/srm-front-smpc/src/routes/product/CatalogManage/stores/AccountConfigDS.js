/**
 * 财务规则配置 - dataSet
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2021-03-29
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { code } from '@/utils/codeConfig';

const { subjectClassification } = code.product;

/**
 * 会员积分列表 DS
 * @returns
 */
const AccountConfigDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'id',
  selection: 'multiple',
  fields: [
    {
      label: intl.get(`smpc.product.view.model.priceFrom`).d('价格从（>）'),
      name: 'priceFrom',
      type: 'number',
      min: 0,
      step: 0.01,
      required: true,
    },
    {
      label: intl.get(`smpc.product.view.model.priceTo`).d('价格至（<=）'),
      name: 'priceTo',
      type: 'number',
      min: 0,
      step: 0.01,
      required: true,
    },
    {
      label: intl.get(`smpc.product.view.model.subjectClassification`).d('科目分类'),
      name: 'subjectsCategoryCode',
      required: true,
      lookupCode: subjectClassification,
    },
    {
      label: intl.get(`smpc.product.view.model.subjects`).d('科目'),
      name: 'subjectsCode',
      required: true,
      type: 'string',
      validator: (value) => {
        const pattern = /^[A-Za-z0-9][A-Za-z0-9-_.]*$/;
        if (!pattern.test(value)) {
          return intl
            .get('halt.alertAdvanced.validation.message.groupBy.warning')
            .d('请输入字母及数字，只能以字母或数字开头，可包含“-”、“_”、“.”');
        }
      },
    },
    {
      name: 'tenantId',
      defaultValue: getCurrentOrganizationId(),
    },
  ],
  queryFields: [],
  events: {},
});

export { AccountConfigDS };
