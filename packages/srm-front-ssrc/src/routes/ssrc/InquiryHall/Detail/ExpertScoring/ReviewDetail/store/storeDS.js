import intl from 'utils/intl';

import { Prefix } from '@/utils/globalVariable';

const scoreDetailDS = () => {
  return {
    primaryKey: 'evaluateIndicId',
    idField: 'evaluateIndicId',
    parentField: 'parentIndicateId',
    expandField: 'expand',
    paging: false,
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.common.model.common.indicateName`).d('要素细项'),
        name: 'indicateName',
      },
      {
        name: 'passStatus',
        label: intl.get(`ssrc.expertScoring.model.expertScoring.passStatus`).d('是否通过'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { commonProps = {} } = data || {};
        const { organizationId, customizeUnitCode, ...resetData } = commonProps || {};
        const newParams = {
          ...(params || {}),
          customizeUnitCode,
        };

        return {
          url: `${Prefix}/${organizationId}/evaluate-summary/review/score/detail`,
          method: 'POST',
          params: newParams,
          data: resetData,
          transformResponse: (res) => {
          const dealData = JSON.parse(res);
          const { evaluateScoreLines, ...rest } = dealData || {};

          return {
            ...rest,
            content: evaluateScoreLines,
          };
        },
        };
      },
    },
  };
};

const scoringInfoDS = () => {
  return {
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.expertScoring.model.expertScoring.expertSuggestion`).d('评审意见'),
        name: 'reviewExpertSuggestion',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { commonProps = {} } = data || {};
        const { organizationId, customizeUnitCode, ...resetData } = commonProps || {};
        const newParams = {
          ...(params || {}),
          customizeUnitCode,
        };

        return {
          url: `${Prefix}/${organizationId}/evaluate-summary/review/score/header`,
          method: 'POST',
          params: newParams,
          data: resetData,
        };
      },
    },
  };
};

export { scoreDetailDS, scoringInfoDS };
