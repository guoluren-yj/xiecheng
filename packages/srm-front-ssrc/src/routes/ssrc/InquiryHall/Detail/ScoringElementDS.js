// 评分要素表格 ScoringElementDS

// 评分明细表ds
import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';

const ScoringElementDS = ({ team }) => {
  return {
    primaryKey: 'evaluateIndicId',
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateTypeMeaning`).d('要素类型'),
        name: 'indicateTypeMeaning',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.calculateType`).d('计算方式'),
        name: 'calculateTypeMeaning',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreType`).d('评分类型'),
        name: 'scoreTypeMeaning',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.weightPercent`).d('权重(%)'),
        name: 'weight',
        align: 'right',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minScore`).d('最低分'),
        name: 'minScore',
        align: 'right',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.maxScore`).d('最高分'),
        name: 'maxScore',
        align: 'right',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.detailEnabledFlag`)
          .d('启用评分要素细项'),
        name: 'detailEnabledFlag',
        tooltip: 'overflow',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreRemark`).d('评分细则'),
        name: 'indicateRemark',
        type: 'string',
        tooltip: 'overflow',
      },
      // {
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertAllocation`).d('专家分配'),
      //   name: 'expertDistribute',
      //   type: 'string',
      // },
      {
        name: 'assignedEvaluateExperts',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.assignedExperts`).d('已分配专家'),
      },
      {
        name: 'sourceFrom',
        type: 'string',
        defaultValue: 'RFX',
      },
      {
        name: 'openBidOrder',
        type: 'string',
      },
      {
        name: 'organizationId',
        type: 'string',
      },
      {
        name: 'tenantId',
        type: 'string',
      },
      {
        name: 'expertCategory',
        type: 'string',
      },
      {
        name: 'indicStatus',
        type: 'string',
        defaultValue: 'SUBMITTED',
      },
      {
        name: 'sourceHeaderId',
        type: 'string',
      },
      {
        name: 'team',
        type: 'string',
        defaultValue: team,
      },
      {
        name: 'lovChangeFlag',
        defaultValue: 1,
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'technologyWeight',
        type: 'number',
      },
      {
        name: 'businessWeight',
        type: 'number',
      },
    ],
    transport: {},
  };
};

const ExpertModalDS = () => {
  return {
    primaryKey: 'evaluateExpertId',
    selection: false,
    paging: false,
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
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, isPubPage } = commonProps || {};
        let url;
        if (isPubPage) {
          url = `${Prefix}/${organizationId}/evaluate-indic-assigns/hist`;
        } else {
          url = `${Prefix}/${organizationId}/evaluate-indic-assigns`;
        }
        return {
          url,
          method: 'GET',
          data: { ...commonProps },
        };
      },
    },
  };
};

export { ScoringElementDS, ExpertModalDS };
