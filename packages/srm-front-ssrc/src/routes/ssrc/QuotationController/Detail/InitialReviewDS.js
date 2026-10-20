/**
 * 初步评审DS配置 - 符合性检查
 * @date: 2020-12-24
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';

const InitialReviewDS = () => ({
  primaryKey: 'evaluateIndicId',
  dataToJSON: 'all',
  paging: false,
  fields: [
    {
      label: intl.get(`ssrc.quoController.model.quoController.indicateCode`).d('要素编码'),
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
      label: intl.get(`ssrc.quoController.model.quoController.indicateName`).d('要素名称'),
      name: 'indicateName',
      type: 'string',
      required: true,
      bind: 'indicateLov.indicateName',
    },
    {
      label: intl.get(`ssrc.quoController.model.quoController.indicateType`).d('要素类型'),
      name: 'indicateType',
      type: 'string',
      required: true,
      disabled: true,
      lookupCode: 'SSRC.INDICATE_TYPE',
      defaultValue: 'PASS',
    },
    {
      label: intl.get(`ssrc.quoController.model.quoController.requirePass`).d('必须通过'),
      name: 'passFlag',
      type: 'boolean',
      required: true,
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      label: intl.get(`ssrc.quoController.model.quoController.expertAllocation`).d('专家分配'),
      name: 'expertDistribute',
      type: 'string',
    },
  ],
  transport: {
    destroy: ({ dataSet, data }) => {
      const {
        queryParameter: { commonProps = {} },
      } = dataSet;
      const { organizationId } = commonProps;
      const ids = data.map((item) => item.evaluateIndicId).filter(Boolean);

      return {
        url: `${Prefix}/${organizationId}/evaluate-indics`,
        method: 'DELETE',
        data: ids,
      };
    },
  },
});

const ExpertModalDS = () => {
  return {
    primaryKey: 'evaluateExpertId',
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertSubAccount`).d('专家子账户'),
        name: 'loginName',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertName`).d('专家姓名'),
        name: 'expertName',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherAssign`).d('是否分配'),
        name: 'assignFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId } = commonProps || {};

        return {
          url: `${Prefix}/${organizationId}/evaluate-indic-assigns`,
          method: 'GET',
          data: { ...commonProps },
        };
      },
    },
  };
};

// 初步评审 - 参考模板
const ReviewReferenceTemplateDS = () => {
  return {
    primaryKey: 'templateId',
    fields: [
      {
        name: 'reviewTemplateLov',
        type: 'object',
        lovCode: 'SSRC.SCORE_TEMPL',
        lovPara: {
          enabledFlag: 1,
          templatePurpose: 'INITIAL_REVIEW',
        },
      },
    ],
  };
};

export { InitialReviewDS, ExpertModalDS, ReviewReferenceTemplateDS };
