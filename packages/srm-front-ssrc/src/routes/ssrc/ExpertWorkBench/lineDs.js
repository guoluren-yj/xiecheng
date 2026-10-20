import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';

const toBeRepliedDS = () => {
  return {
    autoQuery: true,
    primaryKey: 'extractResultId',
    pageSize: 20,
    cacheSelection: true,
    fields: [
      {
        name: 'sourceFromNum',
        label: intl.get('ssrc.expertWorkBench.model.expert.sourceNum').d('寻源单号'),
      },
      {
        name: 'sourceFromTitle',
        label: intl.get('ssrc.expertWorkBench.model.expert.sourceTitle').d('寻源标题'),
      },
      {
        name: 'companyName',
        label: intl.get('ssrc.expertWorkBench.model.expert.companyName').d('公司'),
      },
      {
        name: 'secondarySourceCategoryMeaning',
        label: intl.get('ssrc.expertWorkBench.model.expert.sourceCategory').d('寻源类别'),
      },
      {
        name: 'sourceMethodMeaning',
        label: intl.get('ssrc.expertWorkBench.model.expert.sourceMethod').d('寻源方式'),
      },
      {
        name: 'purName',
        label: intl.get('ssrc.expertWorkBench.model.expert.purName').d('采购联系人'),
      },
      {
        name: 'purPhone',
        label: intl.get('ssrc.expertWorkBench.model.expert.purPhone').d('联系人电话'),
      },
      {
        name: 'purEmail',
        label: intl.get('ssrc.expertWorkBench.model.expert.purEmail').d('联系人邮箱'),
      },
      {
        name: 'replyStartTime',
        label: intl.get('ssrc.expertWorkBench.model.expert.replyStartTime').d('选中时间'),
        type: 'dateTime',
      },
      {
        name: 'replyEndTime',
        label: intl.get('ssrc.expertWorkBench.model.expert.replyEndTime').d('确认截止时间'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/expert-extract-results/workbenches/replying`,
          method: 'GET',
          data: {
            ...(data || {}),
            customizeUnitCode:
              'SSRC.EXPERT_REPLY.LIST.TO_BE_REPLIED,SSRC.EXPERT_REPLY.LIST.TO_BE_REPLIED_FILTER',
          },
        };
      },
    },
  };
};
const repliedDS = () => {
  return {
    autoQuery: true,
    primaryKey: 'extractResultId',
    pageSize: 20,
    cacheSelection: true,
    fields: [
      {
        name: 'sourceFromNum',
        label: intl.get('ssrc.expertWorkBench.model.expert.sourceNum').d('寻源单号'),
      },
      {
        name: 'sourceFromTitle',
        label: intl.get('ssrc.expertWorkBench.model.expert.sourceTitle').d('寻源标题'),
      },
      {
        name: 'companyName',
        label: intl.get('ssrc.expertWorkBench.model.expert.companyName').d('公司'),
      },
      {
        name: 'secondarySourceCategoryMeaning',
        label: intl.get('ssrc.expertWorkBench.model.expert.sourceCategory').d('寻源类别'),
      },
      {
        name: 'sourceMethodMeaning',
        label: intl.get('ssrc.expertWorkBench.model.expert.sourceMethod').d('寻源方式'),
      },
      {
        name: 'purName',
        label: intl.get('ssrc.expertWorkBench.model.expert.purName').d('采购联系人'),
      },
      {
        name: 'purPhone',
        label: intl.get('ssrc.expertWorkBench.model.expert.purPhone').d('联系人电话'),
      },
      {
        name: 'purEmail',
        label: intl.get('ssrc.expertWorkBench.model.expert.purEmail').d('联系人邮箱'),
      },
      {
        name: 'replyStartTime',
        label: intl.get('ssrc.expertWorkBench.model.expert.replyStartTime').d('选中时间'),
        type: 'dateTime',
      },
      {
        name: 'replyEndTime',
        label: intl.get('ssrc.expertWorkBench.model.expert.replyEndTime').d('确认截止时间'),
      },
      {
        name: 'replyStatusMeaning',
        label: intl.get('ssrc.expertWorkBench.model.expert.replyStatus').d('是否出席'),
      },
      {
        name: 'replyContent',
        label: intl.get('ssrc.expertWorkBench.model.expert.replyContent').d('原因'),
      },
      {
        name: 'realStatusMeaning',
        label: intl.get('ssrc.expertWorkBench.model.expert.realStatus').d('实际出席状态'),
      },
      {
        name: 'replyTime',
        label: intl.get('ssrc.expertWorkBench.model.expert.replyTime').d('回复时间'),
      },
      {
        name: 'replyTypeMeaning',
        label: intl.get('ssrc.expertWorkBench.model.expert.replyType').d('回复类型'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/expert-extract-results/workbenches/replied`,
          method: 'GET',
          data: {
            ...(data || {}),
            customizeUnitCode:
              'SSRC.EXPERT_REPLY.LIST.REPLIED,SSRC.EXPERT_REPLY.LIST.REPLIED_FILTER',
          },
        };
      },
    },
  };
};
const allDS = () => {
  return {
    autoQuery: true,
    primaryKey: 'extractResultId',
    pageSize: 20,
    cacheSelection: true,
    fields: [
      {
        name: 'sourceFromNum',
        label: intl.get('ssrc.expertWorkBench.model.expert.sourceNum').d('寻源单号'),
      },
      {
        name: 'sourceFromTitle',
        label: intl.get('ssrc.expertWorkBench.model.expert.sourceTitle').d('寻源标题'),
      },
      {
        name: 'companyName',
        label: intl.get('ssrc.expertWorkBench.model.expert.companyName').d('公司'),
      },
      {
        name: 'secondarySourceCategoryMeaning',
        label: intl.get('ssrc.expertWorkBench.model.expert.sourceCategory').d('寻源类别'),
      },
      {
        name: 'sourceMethodMeaning',
        label: intl.get('ssrc.expertWorkBench.model.expert.sourceMethod').d('寻源方式'),
      },
      {
        name: 'purName',
        label: intl.get('ssrc.expertWorkBench.model.expert.purName').d('采购联系人'),
      },
      {
        name: 'purPhone',
        label: intl.get('ssrc.expertWorkBench.model.expert.purPhone').d('联系人电话'),
      },
      {
        name: 'purEmail',
        label: intl.get('ssrc.expertWorkBench.model.expert.purEmail').d('联系人邮箱'),
      },
      {
        name: 'replyStartTime',
        label: intl.get('ssrc.expertWorkBench.model.expert.replyStartTime').d('选中时间'),
        type: 'dateTime',
      },
      {
        name: 'replyEndTime',
        label: intl.get('ssrc.expertWorkBench.model.expert.replyEndTime').d('确认截止时间'),
      },
      {
        name: 'replyStatusMeaning',
        label: intl.get('ssrc.expertWorkBench.model.expert.replyStatus').d('是否出席'),
      },
      {
        name: 'replyContent',
        label: intl.get('ssrc.expertWorkBench.model.expert.replyContent').d('原因'),
      },
      {
        name: 'realStatusMeaning',
        label: intl.get('ssrc.expertWorkBench.model.expert.realStatus').d('实际出席状态'),
      },
      {
        name: 'replyTime',
        label: intl.get('ssrc.expertWorkBench.model.expert.replyTime').d('回复时间'),
      },
      {
        name: 'replyTypeMeaning',
        label: intl.get('ssrc.expertWorkBench.model.expert.replyType').d('回复类型'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/expert-extract-results/workbenches/all`,
          method: 'GET',
          data: {
            ...(data || {}),
            customizeUnitCode: 'SSRC.EXPERT_REPLY.LIST.ALL,SSRC.EXPERT_REPLY.LIST.ALL_FILTER',
          },
        };
      },
    },
  };
};

const replyFormDS = () => {
  return {
    selection: false,
    dataToJSON: 'all',
    fields: [
      {
        name: 'replyStatus',
        label: intl.get('ssrc.expertWorkBench.model.expert.replyFlag').d('是否出席'),
        lookupCode: 'SSRC.EXPERT_EXTRACT_REAL_STATUS',
        required: true,
      },
      {
        name: 'replyContent',
        label: intl.get('ssrc.expertWorkBench.model.expert.replyContent').d('原因'),
        dynamicProps: {
          required: ({ record }) => record.get('replyStatus') === 'ABSENT',
        },
      },
    ],
    events: {
      update: ({ name, record }) => {
        if (name === 'replyStatus') {
          record.set({ replyContent: null });
        }
      },
    },
    transport: {
      submit: ({ data }) => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/expert-extract-results/reply`,
          data: (data || [])?.[0] || {},
          method: 'PUT',
        };
      },
    },
  };
};

export { toBeRepliedDS, repliedDS, allDS, replyFormDS };
