import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const basicFormDS = ({ templateId, isCreate, useRFContent }) => ({
  autoQuery: !isCreate,
  paging: false,
  autoCreate: isCreate,
  dataToJSON: 'all',
  fields: [
    // 基本信息
    {
      name: 'templateName',
      label: intl.get('ssrc.rfTemplate.model.rfTemplate.templateName').d('模板名称'),
      type: 'intl',
      required: true,
    },
    {
      name: 'sourceCategory',
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.sourceCategory`).d('征询类型'),
      lookupCode: 'SSRC.RF_SOURCE_CATEGORY',
      required: true,
      defaultValue: useRFContent === 'ALL' ? 'RFP' : useRFContent === 'RFI' ? 'RFI' : 'RFP',
    },
    {
      name: 'templateStatus',
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.templateStatus`).d('状态'),
      lookupCode: 'SSRC.SOURCE_TEMPLATE_STATUS',
      disabled: true,
      defaultValue: 'PENDING',
    },
    {
      name: 'versionNumber',
      label: intl.get('ssrc.rfTemplate.model.rfTemplate.versionNumber').d('版本'),
      disabled: true,
      defaultValue: 1,
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf-templates/${templateId}`,
      method: 'GET',
      data: {
        customizeUnitCode: `SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.BASIC_INFO`,
      },
    }),
  },
});

const ruleFormDS = ({ templateId, isCreate }) => ({
  autoQuery: !isCreate,
  paging: false,
  autoCreate: isCreate,
  dataToJSON: 'all',
  fields: [
    {
      name: 'expertScoreType',
      lookupCode: 'SSRC.EXPERT_SCORE_TYPE',
      label: intl.get('ssrc.rfTemplate.model.rfTemplate.expertScoreType').d('专家评分'),
      defaultValue: 'NONE',
      help: intl
        .get('ssrc.rfTemplate.model.rfTemplate.score.chooseTip')
        .d(
          '选择了线上专家评分，该方案邀请书在供应商回复后会进入专家评分环节，评分后会将分数显示在确定入围名单环节。'
        ),
      required: true,
    },
    {
      name: 'progressNodes',
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.progressNodes`).d('寻源节点'),
      disabled: true,
      defaultValue: [
        {
          nodeStatus: 'CREATE',
          nodeStatusMeaning: intl.get('ssrc.rfTemplate.model.rfTemplate.create').d('发布准备'),
          nodeSeq: 10,
          finishedFlag: 0,
        },
        {
          nodeStatus: 'IN_QUOTATION',
          nodeStatusMeaning: intl.get('ssrc.rfTemplate.model.rfTemplate.inQuotation').d('征询中'),
          nodeSeq: 20,
          finishedFlag: 0,
        },
        {
          nodeStatus: 'CHECK_PENDING',
          nodeStatusMeaning: intl
            .get('ssrc.rfTemplate.model.rfTemplate.checkPending')
            .d('确定入围名单'),
          nodeSeq: 40,
          finishedFlag: 0,
        },
        {
          nodeStatus: 'FINISHED',
          nodeStatusMeaning: intl.get('ssrc.rfTemplate.model.rfTemplate.finished').d('完成'),
          nodeSeq: 50,
          finishedFlag: 0,
        },
      ],
    },
    {
      name: 'minInviteSupplier',
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.minInviteSupplier`).d('最少邀请供应商数'),
      type: 'number',
      defaultValue: 1,
      required: true,
      min: 1,
      step: 1,
    },
    {
      name: 'minQuotedSupplier',
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.minQuotedSupplier`).d('最少回复供应商数'),
      type: 'number',
      defaultValue: 1,
      required: true,
      min: 1,
      step: 1,
    },
    {
      name: 'sealedQuotationFlag',
      label: intl.get('ssrc.rfTemplate.model.rfTemplate.sealedQuotationFlag').d('密封征询'),
      type: 'number',
      defaultValue: 1,
    },
    {
      name: 'lineItemsFlag',
      label: intl.get('ssrc.rfTemplate.model.rfTemplate.lineItemsFlag').d('启用标的物'),
      type: 'number',
      defaultValue: 1,
    },
    {
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.bidRuleType`).d('标书规则'),
      lookupCode: 'SSRC.BID_RULE_TYPE',
      name: 'bidRuleType',
      defaultValue: 'NONE',
    },
    {
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.openBidOrder`).d('评标步制'),
      lookupCode: 'SSRC.OPEN_BID_ORDER',
      name: 'openBidOrder',
      defaultValue: 'SYNC',
    },
    {
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.scoreType`).d('评分方式'),
      lookupCode: 'SSRC.TEMPLATE_SCORE_TYPE',
      name: 'scoreType',
      defaultValue: 'SCORE',
    },
    {
      label: intl.get(`ssrc.rfTemplate.model.rfTemplate.replyMethod`).d('回复方式'),
      lookupCode: 'SSRC.RF_REPLY_TYPE',
      name: 'replyType',
      defaultValue: 'ONLINE',
      required: true,
    },
    {
      name: 'noticeEndNodeCode',
      lookupCode: 'SSRC.RF_NOTICE_END_NODE_CODE',
      label: intl.get('ssrc.rfTemplate.model.rfTemplate.noticeEndNodeCode').d('公告终止节点'),
      defaultValue: '90',
      help: intl
        .get('ssrc.rfTemplate.model.rfTemplate.noticeEndNodeCode.chooseTip')
        .d(
          '寻源的发布公告在公告天数到期前可以配置终止节点，如公告天数到期前寻源核价完成后可终止门户展示的发布公告信息。'
        ),
    },
  ],
  events: {
    update: ({ name, record, value }) => {
      // 前端处理寻源节点
      if (name === 'expertScoreType') {
        const progressNodes = record.get('progressNodes');
        if (value === 'NONE') {
          const newProgressNodes = progressNodes.filter((node) => node.nodeStatus !== 'SCORE');
          record.set('progressNodes', newProgressNodes);
        } else if (value === 'ONLINE') {
          progressNodes.splice(2, 0, {
            nodeStatus: 'SCORE',
            nodeStatusMeaning: intl.get('ssrc.rfTemplate.model.rfTemplate.score').d('评分中'),
            nodeSeq: 25,
            finishedFlag: 0,
          });
          record.set('progressNodes', progressNodes);
        }
      }
      if (name === 'bidRuleType') {
        record.set('openBidOrder', 'SYNC');
      }
    },
  },
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf-template-rules/${templateId}`,
      method: 'GET',
      data: {
        customizeUnitCode: `SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.PROCESS_NODE,SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.RF_STAGE,SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.RF_SCORE_STAGE,SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.BUSINESS_DEFAULT_SETTING`,
      },
    }),
  },
});

export { basicFormDS, ruleFormDS };
