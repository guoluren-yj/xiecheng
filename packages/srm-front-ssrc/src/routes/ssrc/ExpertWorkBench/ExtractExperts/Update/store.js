import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const ruleDS = ({ sourceFrom, sourceFromId, expertReplyFlag, expertRequirementsRule }) => ({
  dataToJSON: 'all',
  primaryKey: 'extractRuleId',
  autoQuery: true,
  paging: false,
  fields: [
    {
      name: 'expectQuantity',
      label: intl.get('ssrc.expertExtract.model.expert.expectQuantity').d('需求数量'),
      min: 1,
      max: 20,
      precision: 0,
      required: expertRequirementsRule === 'NONE',
    },
    {
      name: 'expectBusinessQuantity',
      label: intl
        .get('ssrc.expertExtract.model.expert.expectBusinessQuantity')
        .d('商务专家需求数量'),
      min: 0,
      max: 20,
      precision: 0,
      required: expertRequirementsRule === 'DIFF',
    },
    {
      name: 'expectTechnologyQuantity',
      label: intl
        .get('ssrc.expertExtract.model.expert.expectTechnologyQuantity')
        .d('技术专家需求数量'),
      min: 0,
      max: 20,
      precision: 0,
      required: expertRequirementsRule === 'DIFF',
    },
    {
      name: 'replyDuration',
      label: intl.get(`ssrc.expertExtract.model.expert.replyDuration`).d('回复时长(h)'),
      min: expertReplyFlag ? 1 : null,
      max: expertReplyFlag ? 240 : null, // 10天
      required: !!expertReplyFlag,
      disabled: !expertReplyFlag,
      // help: intl.get(`ssrc.expertExtract.view.help.replyDuration`).d('回复时长以小时为单位'),
    },
    {
      name: 'expertLevel',
      label: intl.get(`ssrc.expertExtract.model.expert.expertLevel`).d('专家级别'),
      lookupCode: 'SSRC.EXPERT_LEVEL',
    },
    {
      name: 'expertType',
      label: intl.get('ssrc.expertExtract.model.expert.expertType').d('专家类型'),
      lookupCode: 'SSRC.EXPERT_TYPE',
    },
    {
      name: 'countryId',
      label: intl.get('ssrc.expertExtract.model.expert.country').d('国家'),
      lovCode: 'HPFM.COUNTRY',
      type: 'object',
      textField: 'countryName',
      valueField: 'countryId',
      transformRequest: (value = {}) => {
        return value?.countryId || null;
      },
      transformResponse: (value, data) => {
        return value
          ? {
              countryId: value,
              countryName: data?.countryName,
              countryCode: data?.countryCode,
            }
          : null;
      },
    },
    {
      name: 'countryCode',
      bind: 'countryId.countryCode',
    },
    {
      name: 'provinceIds',
      label: intl.get('ssrc.expertExtract.model.expert.province').d('省'),
      lookupCode: 'SSLM.PROVINCE_DETAILS',
      multiple: ',',
      dynamicProps: {
        disabled: ({ record }) => record.get('countryCode') !== 'CN',
        lovPara: ({ record }) => ({
          countryId: record?.get?.('countryId')?.countryId,
        }),
      },
    },
    {
      name: 'cityIds',
      label: intl.get('ssrc.expertExtract.model.expert.city').d('市'),
      lookupCode: 'SSRC.CITY_DETAILS',
      multiple: ',',
      dynamicProps: {
        disabled: ({ record }) => record.get('countryCode') !== 'CN',
        lovPara: ({ record }) => ({
          countryId: record?.get?.('countryId')?.countryId,
          size: 1000,
        }),
      },
    },
    {
      label: intl.get('ssrc.expertExtract.model.expert.itemCategories').d('品类'),
      name: 'itemCategoryList',
      type: 'object',
      lovCode: 'SSRC.CATEGORY_MIN_LEVEL_PTH',
      textField: 'categoryName',
      valueField: 'categoryId',
      multiple: true,
    },
  ],
  events: {
    update: ({ name, record }) => {
      if (name === 'countryId') {
        const countryCode = record.get('countryCode');
        if (countryCode && countryCode !== 'CN') {
          record.set({
            provinceIds: null,
            cityIds: null,
          });
        } else {
          // 清除操作
          record.set({
            provinceIds: null,
            cityIds: null,
          });
        }
      }
    },
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/expert-extract-rules/latest-rule`,
        method: 'GET',
        data: {
          sourceFrom,
          sourceFromId,
          customizeUnitCode: `SSRC.INQUIRY_HALL_RANDOM_EXTRACT.RULES_EDIT`,
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
      name: 'expertCategory',
      label: intl.get('ssrc.expertExtract.model.expert.expertCategory').d('专家类别'),
      lookupCode: 'SSRC.EXPERT_CATEGORY',
    },
    {
      name: 'expertLevel',
      label: intl.get(`ssrc.expertExtract.model.expert.expertLevel`).d('专家级别'),
      lookupCode: 'SSRC.EXPERT_LEVEL',
    },
    {
      name: 'expertType',
      label: intl.get(`ssrc.expertExtract.model.expert.expertType`).d('专家类型'),
      lookupCode: 'SSRC.EXPERT_TYPE',
    },
    {
      name: 'replyStatus',
      label: intl.get('ssrc.expertExtract.model.expert.replyStatus').d('专家回复结果'),
      lookupCode: 'SSRC.EXPERT_EXTRACT_REPLY_STATUS',
    },
    {
      name: 'replyContent',
      label: intl.get('ssrc.expertExtract.model.expert.replyContent').d('专家回复内容'),
    },
    {
      name: 'realStatus',
      label: intl.get('ssrc.expertExtract.model.expert.realStatus').d('专家实际出席情况'),
      lookupCode: 'SSRC.EXPERT_EXTRACT_REPLY_STATUS',
      required: true,
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
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        // 非最新轮次的抽取结果不允许删除
        if (record?.data?.latestRoundNumber !== record?.data?.roundNumber) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/expert-extract-results`,
        method: 'GET',
        data: {
          sourceFrom,
          sourceFromId,
          customizeUnitCode: `SSRC.INQUIRY_HALL_RANDOM_EXTRACT.EXPERTS_EDIT`,
        },
      };
    },
    destroy: () => ({
      url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/expert-extract-results`,
      method: 'DELETE',
    }),
  },
});

export { ruleDS, tableDS };
