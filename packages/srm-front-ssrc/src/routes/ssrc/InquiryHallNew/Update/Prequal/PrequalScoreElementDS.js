import { isNil } from 'lodash';

import intl from 'utils/intl';

import { Prefix } from '@/utils/globalVariable';
import { commonValidationRules } from '../utils/dsUtils';

const PrequalScoreElementDS = (config = {}) => {
  return {
    autoQuery: false,
    primaryKey: 'prequalScoreAssignId',
    dataToJSON: 'all',
    validationRules: commonValidationRules('minLength')(),
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateCode`).d('要素编码'),
        name: 'ElementLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.SCORE_INDIC_PASS',
        textField: 'indicateCode',
        valueField: 'indicateId',
      },
      {
        name: 'indicateId',
        bind: 'ElementLov.indicateId',
      },
      {
        name: 'indicateCode',
        bind: 'ElementLov.indicateCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateName`).d('要素名称'),
        name: 'indicateName',
        type: 'string',
        required: true,
      },
      {
        name: 'indicateTypeMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateType`).d('要素类型'),
        name: 'indicateType',
        type: 'string',
        disabled: true,
        lookupCode: 'SSRC.INDICATE_TYPE',
        defaultValue: 'PASS',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minScoreFrom`).d('分值从'),
        name: 'minScore',
        type: 'number',
        min: 0,
        step: 1,
        dynamicProps: {
          disabled({ record }) {
            return record.get('indicateType') === 'PASS';
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.maxScoreTo`).d('分值至'),
        name: 'maxScore',
        type: 'number',
        min: 0,
        step: 1,
        dynamicProps: {
          disabled({ record }) {
            return record.get('indicateType') === 'PASS';
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.mustApprovedFlag`).d('必须通过/合格'),
        name: 'mustApprovedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qualifiedScore`).d('合格分值'),
        name: 'qualifiedScore',
        type: 'number',
        min: 0,
        step: 1,
        dynamicProps: {
          required({ record }) {
            const indicateType = record.get('indicateType');
            const mustApprovedFlag = record.get('mustApprovedFlag');
            return indicateType === 'SCORE' && mustApprovedFlag;
          },
          disabled({ record }) {
            const indicateType = record.get('indicateType');
            const mustApprovedFlag = record.get('mustApprovedFlag');
            return indicateType === 'PASS' || (!mustApprovedFlag && indicateType === 'SCORE');
          },
        },
      },
      {
        name: 'objectVersionNumber',
        type: 'number',
      },
      {
        name: 'prequalHeaderId',
      },
      {
        name: 'prequalScoreAssignId',
      },
    ],
    events: {
      update: ({ name, record, value }) => {
        if (name === 'ElementLov') {
          const {
            indicateName,
            indicateCode,
            indicateType = null,
            indicateTypeMeaning,
            minScore,
            maxScore,
          } = value || {};
          record.set('indicateName', indicateName);
          record.set('indicateCode', indicateCode);
          record.set('indicateType', indicateType || 'PASS');
          record.set('indicateTypeMeaning', indicateTypeMeaning);
          record.set('minScore', minScore);
          record.set('maxScore', maxScore);
        }
        if (name === 'mustApprovedFlag') {
          if (!value && record.get('indicateType') === 'SCORE') {
            record.set('qualifiedScore', null);
          }
        }
      },
    },
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {}, headers = {} },
        } = dataSet;
        const { organizationId, rfxHeaderId } = commonProps || {};
        const { prequalHeaderId = null } = headers || {};
        const { mergeType, prequalGroupHeaderId } = config;
        if (!rfxHeaderId || rfxHeaderId === 'null' || (!prequalHeaderId && !prequalGroupHeaderId)) {
          return;
        }
        const url = !isNil(mergeType)
          ? `${Prefix}/${organizationId}/prequal-group-score-assigns/${prequalGroupHeaderId}` // 分标段
          : `${Prefix}/${organizationId}/prequal/${prequalHeaderId}/score-indic`;
        return {
          url,
          method: 'GET',
          data: {},
        };
      },
      submit: ({ dataSet, data }) => {
        const {
          queryParameter: { commonProps = {}, headers = {} },
        } = dataSet;
        const { organizationId, rfxHeaderId, operationType = '' } = commonProps || {};
        const { prequalHeaderId = null } = headers || {};
        const { mergeType, prequalGroupHeaderId } = config;
        if (!rfxHeaderId || rfxHeaderId === 'null' || (!prequalHeaderId && !prequalGroupHeaderId)) {
          return;
        }
        const tableData = data.map((item) => {
          return {
            ...item,
            scoreIndicId: item.indicateId,
            tenantId: organizationId,
            sourceFrom: 'RFX',
            sourceHeaderId: rfxHeaderId,
          };
        });
        const url = !isNil(mergeType)
          ? `${Prefix}/${organizationId}/prequal-group-score-assigns/${prequalGroupHeaderId}/save?operationType=${operationType}` // 分标段
          : `${Prefix}/${organizationId}/prequal/${prequalHeaderId}/score-indic?operationType=${operationType}`;
        return {
          url,
          method: 'POST',
          data: tableData,
        };
      },
      destroy: ({ dataSet, data }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, operationType = '' } = commonProps;
        const { mergeType } = config;
        const url = !isNil(mergeType)
          ? `${Prefix}/${organizationId}/prequal-group-score-assigns?operationType=${operationType}` // 分标段
          : `${Prefix}/${organizationId}/prequal/score-indic?operationType=${operationType}`;
        return {
          url,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

export default PrequalScoreElementDS;
