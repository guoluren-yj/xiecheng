/**
 * 初步评审DS配置
 * @date: 2020-12-24
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';

const InitialReviewDS = () => ({
  primaryKey: 'evaluateIndicId',
  dataToJSON: 'all',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateCode`).d('要素编码'),
      name: 'indicateCode',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateName`).d('要素名称'),
      name: 'indicateName',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateType`).d('要素类型'),
      name: 'indicateTypeMeaning',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.requirePass`).d('必须通过'),
      name: 'passFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreRemark`).d('评分细则'),
      name: 'indicateRemark',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertAllocation`).d('专家分配'),
      name: 'expertDistribute',
    },
  ],
});

export { InitialReviewDS };
