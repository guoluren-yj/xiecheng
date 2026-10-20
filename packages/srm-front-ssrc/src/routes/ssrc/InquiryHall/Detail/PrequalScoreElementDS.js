/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-07-09 17:34:01
 * @LastEditors: wangmiao
 * @LastEditTime: 2021-11-10 10:10:53
 */
import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';

const PrequalScoreElementDS = () => {
  return {
    autoQuery: false,
    primaryKey: 'prequalScoreAssignId',
    selection: false,
    paging: false,
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
        name: 'indicateTypeMeaning',
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
    events: {
      // update: ({ name, record, value }) => {
      //   if (name === 'ElementLov') {
      //     const { indicateName, indicateCode, indicateType, minScore, maxScore } = value || {};
      //     record.set('indicateName', indicateName);
      //     record.set('indicateCode', indicateCode);
      //     record.set('indicateType', indicateType);
      //     record.set('minScore', minScore);
      //     record.set('maxScore', maxScore);
      //   }
      //   if (name === 'mustApprovedFlag') {
      //     if (!value && record.get('indicateType') === 'SCORE') {
      //       record.set('qualifiedScore', null);
      //     }
      //   }
      // },
    },
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {}, headers = {} },
        } = dataSet;
        const { organizationId, rfxHeaderId, isPubPage, permissionFilterFlag = 0 } =
          commonProps || {};
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
          data: { permissionFilterFlag },
        };
      },
    },
  };
};

export default PrequalScoreElementDS;
