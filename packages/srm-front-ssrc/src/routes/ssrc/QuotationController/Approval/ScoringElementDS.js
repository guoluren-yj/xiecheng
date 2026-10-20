// 评分要素表格 ScoringElementDS
import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';

const ScoringElementDS = ({ team }) => {
  return {
    primaryKey: 'evaluateIndicAdjustId',
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
        width: 120,
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
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertAllocation`).d('专家分配'),
        name: 'expertDistribute',
        type: 'string',
      },
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
      {
        name: 'adjustFields',
        type: 'object',
        defaultValue: [],
      },
      {
        name: 'addFlag',
        type: 'number',
      },
      { name: 'addFlag' },
      { name: 'updateFlag' },
      { name: 'evaluateIndicId' },
    ],
    transport: {},
  };
};

const ExpertModalDS = () => {
  return {
    primaryKey: 'evaluateExpertId',
    paging: false,
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
        disabled: true,
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
            ? `${Prefix}/${organizationId}/evaluate-indic-adjusts/assigns/after-query`
            : `${Prefix}/${organizationId}/evaluate-indic-adjusts/assigns/before-query`;

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
