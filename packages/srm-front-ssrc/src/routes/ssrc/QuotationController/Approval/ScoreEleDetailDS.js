import React from 'react';

import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';

const ScoreEleDetailDS = () => {
  return {
    primaryKey: 'indicateAdjustId',
    selection: false,
    fields: [
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.indicateDetailCode`)
          .d('评分要素细项编码'),
        name: 'indicateCode',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.indicateDetailName`)
          .d('评分要素细项名称'),
        name: 'indicateName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.elements.remark`).d('评分细则'),
        name: 'remark',
      },
      {
        label: <span>{intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重')}%</span>,
        name: 'weight',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minScore`).d('最低分'),
        name: 'minScore',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.maxScore`).d('最高分'),
        name: 'maxScore',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.defaultScore`).d('缺省分'),
        name: 'defaultScore',
      },
      { name: 'addFlag' },
      { name: 'updateFlag' },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, currentMode = null } = commonProps || {};

        const url =
          !currentMode || currentMode === 'current'
            ? `${Prefix}/${organizationId}/evaluate-indic-adjusts/two/after-query`
            : `${Prefix}/${organizationId}/evaluate-indic-adjusts/two/before-query`;

        return {
          url,
          method: 'GET',
          data: { ...commonProps },
        };
      },
    },
  };
};

export { ScoreEleDetailDS };
