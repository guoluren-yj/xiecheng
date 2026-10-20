/**
 * 初步评审DS配置
 * @date: 2020-12-24
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';

import { Prefix } from '@/utils/globalVariable';
import { commonValidationRules } from './utils/dsUtils';

const InitialReviewDS = () => ({
  primaryKey: 'evaluateIndicId',
  dataToJSON: 'all',
  paging: false,
  validationRules: commonValidationRules('minLength')(),
  fields: [
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateCode`).d('要素编码'),
      name: 'indicateLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SSRC.SCORE_INDIC',
      textField: 'indicateCode',
      valueField: 'indicateId',
      lovPara: {
        indicateType: 'PASS',
      },
    },
    {
      name: 'indicateId',
      bind: 'indicateLov.indicateId',
    },
    {
      name: 'indicateCode',
      bind: 'indicateLov.indicateCode',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateName`).d('要素名称'),
      name: 'indicateName',
      type: 'string',
      required: true,
      bind: 'indicateLov.indicateName',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateType`).d('要素类型'),
      name: 'indicateType',
      type: 'string',
      required: true,
      disabled: true,
      lookupCode: 'SSRC.INDICATE_TYPE',
      defaultValue: 'PASS',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.requirePass`).d('必须通过'),
      name: 'passFlag',
      type: 'boolean',
      required: true,
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreRemark`).d('评分细则'),
      name: 'indicateRemark',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertAllocation`).d('专家分配'),
      name: 'expertDistribute',
      type: 'string',
    },
  ],
  events: {
    update: ({ name, value, record }) => {
      if (name === 'indicateLov') {
        const { remark = null } = value || {};
        record.set({
          indicateRemark: remark,
        });
      }
    },
  },
  transport: {
    destroy: ({ dataSet, data }) => {
      const {
        queryParameter: { commonProps = {} },
      } = dataSet;
      const { organizationId, operationType = undefined } = commonProps;
      const ids = data.map((item) => item.evaluateIndicId).filter(Boolean);

      return {
        url: `${Prefix}/${organizationId}/evaluate-indics?operationType=${operationType}`,
        method: 'DELETE',
        data: ids,
      };
    },
  },
});

export { InitialReviewDS };
