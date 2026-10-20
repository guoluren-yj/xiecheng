import { SRM_SMBL } from '@/utils/config.js';
import intl from 'utils/intl';

function thirdPartyAccParamDS() {
  return {
    primaryKey: 'accParamId',
    autoQuery: true,
    selection: 'multiple',
    autoQueryAfterSubmit: true,
    pageSize: 10,

    // table表单显示的字段
    fields: [
      {
        name: 'paramKey',
        type: 'string',
        required: true,
        unique: true,
        label: intl.get('smbl.common.model.paramKey').d('参数字段'),
      },
      {
        name: 'paramValue',
        type: 'string',
        required: true,
        label: intl.get('smbl.common.model.paramValue').d('参数值'),
      },
      {
        name: 'paramDesc',
        type: 'string',
        label: intl.get('smbl.common.model.paramDesc').d('参数描述'),
        required: true,
      },
    ],

    // 事件
    events: {
      // 提交成功后在做一次查询，指定查第一页最新数据,一般如果后端没有在执行动作后没有返回数据给前端，需要在做一次查询
      submitSuccess: ({ dataSet }) => dataSet.query(1),
    },

    transport: {
      read: ({ data }) => {
        if (data.thirdPartyAccountId) {
          const { thirdPartyAccountId } = data;
          return {
            url: `${SRM_SMBL}/v1/third-party-acc-params/${thirdPartyAccountId}`,
            method: 'get',
          };
        } else {
          return null;
        }
      },
      destroy: {
        url: `${SRM_SMBL}/v1/third-party-acc-params/delete`,
        method: 'delete',
      },
      create: {
        url: `${SRM_SMBL}/v1/third-party-acc-params/`,
        method: 'post',
        autoQuery: true,
      },
      update: {
        url: `${SRM_SMBL}/v1/third-party-acc-params/`,
        method: 'post',
      },
    },
  };
}
export { thirdPartyAccParamDS };
