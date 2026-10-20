import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const ruleDS = ({ sourceFrom, sourceFromId }) => ({
  dataToJSON: 'all',
  primaryKey: 'extractRuleId',
  autoQuery: true,
  paging: false,
  fields: [
    {
      name: 'expectQuantity',
      label: intl.get('ssrc.expertExtract.model.expert.expectQuantity').d('需求数量'),
    },
    {
      name: 'replyDuration',
      label: intl.get(`ssrc.expertExtract.model.expert.replyDuration`).d('回复时长(h)'),
      // help: intl.get(`ssrc.expertExtract.view.help.replyDuration`).d('回复时长以小时为单位'),
    },
    {
      name: 'expertLevelMeaning',
      label: intl.get(`ssrc.expertExtract.model.expert.expertLevel`).d('专家级别'),
    },
    {
      name: 'expertTypeMeaning',
      label: intl.get('ssrc.expertExtract.model.expert.expertType').d('专家类型'),
    },
    {
      name: 'countryName',
      label: intl.get('ssrc.expertExtract.model.expert.country').d('国家'),
    },
    {
      name: 'provinceIdsMeaning',
      label: intl.get('ssrc.expertExtract.model.expert.province').d('省'),
      multiple: ',',
    },
    {
      name: 'cityIdsMeaning',
      label: intl.get('ssrc.expertExtract.model.expert.city').d('市'),
      multiple: ',',
    },
    {
      name: 'itemCategoriesMeaning',
      label: intl.get('ssrc.expertExtract.model.expert.itemCategories').d('品类'),
      multiple: ',',
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/expert-extract-rules/latest-rule`,
        method: 'GET',
        data: {
          sourceFrom,
          sourceFromId,
          customizeUnitCode: `SSRC.INQUIRY_HALL_RANDOM_EXTRACT.RULES_DETAIL`,
        },
      };
    },
  },
});

const tableDS = ({ sourceFrom, sourceFromId }) => ({
  autoQuery: true,
  dataToJSON: 'all',
  primaryKey: 'extractResultId',
  paging: false,
  selection: false,
  fields: [
    {
      name: 'expertSubAccount',
      label: intl.get('ssrc.expertExtract.model.expert.expectSubAccount').d('专家子账户'),
    },
    {
      name: 'expertName',
      label: intl.get(`ssrc.expertExtract.model.expert.expertName`).d('专家姓名'),
    },
    {
      name: 'expertCategoryMeaning',
      label: intl.get('ssrc.expertExtract.model.expert.expertCategory').d('专家类别'),
    },
    {
      name: 'expertLevelMeaning',
      label: intl.get(`ssrc.expertExtract.model.expert.expertLevel`).d('专家级别'),
    },
    {
      name: 'expertTypeMeaning',
      label: intl.get(`ssrc.expertExtract.model.expert.expertType`).d('专家类型'),
    },
    {
      name: 'replyStatusMeaning',
      label: intl.get('ssrc.expertExtract.model.expert.replyStatus').d('专家回复结果'),
    },
    {
      name: 'replyContent',
      label: intl.get('ssrc.expertExtract.model.expert.replyContent').d('专家回复内容'),
    },
    {
      name: 'realStatusMeaning',
      label: intl.get('ssrc.expertExtract.model.expert.realStatus').d('专家实际出席情况'),
    },
    {
      name: 'roundNumber',
      label: intl.get('ssrc.expertExtract.model.expert.roundNumber').d('抽取轮次'),
    },
    {
      name: 'replyStartTime',
      label: intl.get('ssrc.expertExtract.model.expert.replyStartTime').d('发送抽取信息时间'),
    },
    {
      name: 'replyEndTime',
      label: intl.get('ssrc.expertExtract.model.expert.replyEndTime').d('专家回复截止时间'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/expert-extract-results`,
        method: 'GET',
        data: {
          sourceFrom,
          sourceFromId,
          customizeUnitCode: `SSRC.INQUIRY_HALL_RANDOM_EXTRACT.EXPERTS_DETAIL`,
        },
      };
    },
  },
});

export { ruleDS, tableDS };
