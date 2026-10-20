/**
 * 符合性检查DS配置
 */

import intl from 'utils/intl';
import { isObject } from 'lodash';

import { Prefix } from '@/utils/globalVariable';
import { commonValidationRules } from '@/routes/ssrc/InquiryHallNew/Update/utils/dsUtils';

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
    /**
     * 字段更新方法
     * @protected （屈臣氏二开）禁止修改、删除此方法名
     * indicateLov里面最小最大值屈臣氏固定返回0-5
     */
    update: ({ dataSet = {}, record = {}, name, value = null }) => {
      const updateFields = (fields = []) => {
        if (record.status === 'add') {
          return;
        }

        const oldFields = record.get('evaluateIndicAdjustFields') || '';
        let newFields = oldFields.split(',').filter(Boolean);

        fields.forEach((field) => {
          const currentIndex = oldFields.indexOf(field);
          const currentValue = isObject(value) ? value[name] : value;
          const pristineValue = (record.get('sourceEvaluateIndic') || {})[name];
          // eslint-disable-next-line eqeqeq
          if (currentIndex > -1 && currentValue == pristineValue) {
            newFields.splice(currentIndex, 1);
          } else if (!newFields.includes(field)) {
            newFields.push(field);
          }
        });

        newFields = newFields.join(',');
        record.set('evaluateIndicAdjustFields', newFields);
      };

      if (name === 'indicateLov') {
        const {
          queryParameter: { commonData = {} },
        } = dataSet;
        const { header = {}, organizationId } = commonData || {};
        const { rfxHeaderId } = header || {};

        const { indicateName, indicateId, indicateCode, indicateType = '', remark = null } =
          value || {};
        record.set('indicateName', indicateName);
        record.set('indicateId', indicateId);
        record.set('indicateCode', indicateCode);
        if (indicateType) {
          record.set('indicateType', indicateType);
        } else {
          record.set('indicateType', 'PASS');
        }
        record.set('sourceFrom', 'RFX');
        record.set('tenantId', organizationId);
        record.set('indicStatus', 'SUBMITTED');
        record.set('sourceHeaderId', rfxHeaderId);
        record.set({
          indicateRemark: remark,
        });
        updateFields([
          'indicateName',
          'indicateId',
          'indicateCode',
          'indicateType',
          'indicateRemark',
        ]);
      } else if (name === 'indicateName') {
        record.set('indicateName', value);
        updateFields(['indicateName']);
      } else if (name === 'passFlag') {
        record.set('passFlag', value);
        updateFields(['passFlag']);
      }
    },
  },
  transport: {
    destroy: ({ dataSet, data }) => {
      const {
        queryParameter: { commonData = {} },
      } = dataSet;
      const { organizationId } = commonData;
      const ids = data.map((item) => item.evaluateIndicAdjustId).filter(Boolean);

      return {
        url: `${Prefix}/${organizationId}/evaluate-indic-adjusts`,
        method: 'DELETE',
        data: ids,
      };
    },
  },
});

export { InitialReviewDS };
