import React from 'react';

import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import { Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();

const scoreDetailDS = (team) => ({
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
      label: intl.get(`ssrc.common.model.common.scoringInterval`).d('评分区间'),
      name: 'scoringInterval',
    },
    {
      name: 'indicScore',
      label: intl.get(`ssrc.common.model.common.indicScore`).d('得分'),
    },
    {
      label: <>{intl.get(`ssrc.common.model.common.weight`).d('权重')}%</>,
      name: 'weight',
    },
  ],
  transport: {
 /** ********* 万国二开单据明细评分查询-勿动!!! *********** */
    read: ({data})=>{
      return {
        url: `${Prefix}/${organizationId}/evaluate-summary/${data?.evaluateScoreId}/expert-detail`,
      method: 'POST',
      params: {
        team,
      },
      };
    },
  },
});

const scoringInfoDS = ({
  sourceKey,
  evaluateScoreIds,
  supplierCompanyId,
  sourceFrom,
  quotationHeaderId,
}) => ({
  paging: false,
  fields: [
    {
      label: intl.get(`ssrc.expertScoring.model.expertScoring.Invalid`).d('是否无效'),
      name: 'suggestInvalidFlag',
    },
    {
      label: intl.get(`ssrc.expertScoring.model.expertScoring.expertSuggestion`).d('评审意见'),
      name: 'expertSuggestion',
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get(`ssrc.expertScoring.model.expertScoring.expertAttachment`).d('评审附件'),
    },
  ],
  transport: {
    read: () => ({
      url: `${Prefix}/${organizationId}/evaluate-scores/${quotationHeaderId}/${sourceFrom}/header`,
      method: 'GET',
      params: {
        evaluateScoreIds,
        supplierId: supplierCompanyId,
        customizeUnitCode: `SSRC.INQUIRY_${
          sourceKey === 'INQUIRY' ? 'HALL' : 'BID'
        }_DETAIL.HEADER_RFX`,
      },
    }),
  },
});

export { scoreDetailDS, scoringInfoDS };
