import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';

const PrequalScoreElementDS = () => {
  return {
    autoQuery: false,
    primaryKey: 'prequalScoreAssignId',
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateCode`).d('要素编码'),
        name: 'indicateCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateName`).d('要素名称'),
        name: 'indicateName',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateType`).d('要素类型'),
        name: 'indicateType',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minScoreFrom`).d('分值从'),
        name: 'minScore',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.maxScoreTo`).d('分值至'),
        name: 'maxScore',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.mustApprovedFlag`).d('必须通过/合格'),
        name: 'mustApprovedFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qualifiedScore`).d('合格分值'),
        name: 'qualifiedScore',
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
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {}, headers = {} },
        } = dataSet;
        const { organizationId, rfxHeaderId, isPubPage } = commonProps || {};
        const { prequalHeaderId = null } = headers || {};
        if (!rfxHeaderId || rfxHeaderId === 'null' || !prequalHeaderId) {
          return;
        }
        let url;
        if (isPubPage) {
          url = `${Prefix}/${organizationId}/prequal/hists/${prequalHeaderId}/score-indic`;
        } else {
          url = `${Prefix}/${organizationId}/prequal/${prequalHeaderId}/score-indic`;
        }
        return {
          url,
          method: 'GET',
          data: {},
        };
      },
    },
  };
};

export default PrequalScoreElementDS;
