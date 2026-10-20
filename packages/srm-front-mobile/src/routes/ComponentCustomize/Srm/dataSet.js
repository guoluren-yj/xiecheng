import { SRM_SMBL } from '@/utils/config.js';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

function srmCustomizeDS(load) {
  return {
    autoQuery: true,
    selection: 'multiple',
    autoQueryAfterSubmit: true,
    paging: false,

    // table表单显示的字段
    fields: [
      {
        name: 'componet',
        type: 'object',
        label: intl
          .get('smbl.componentCustomize.model.ComponentCustomize.componetCode')
          .d('组件编码'),
        noCache: true,
        lovCode: 'SMBL.COMPONENT_CODE.VIEW',
        required: true,
        unique: true,
      },
      {
        name: 'componetCode',
        bind: 'componet.value',
        label: intl
          .get('smbl.componentCustomize.model.ComponentCustomize.componetCode')
          .d('组件编码'),
        required: true,
        unique: true,
      },
      {
        name: 'description',
        bind: 'componet.meaning',
        label: intl
          .get('smbl.componentCustomize.model.ComponentCustomize.description')
          .d('组件描述'),
      },
    ],
    // 事件
    events: {
      // 提交成功后在做一次查询，指定查第一页最新数据,一般如果后端没有在执行动作后没有返回数据给前端，需要在做一次查询
      submitSuccess: ({ dataSet }) => dataSet.query(),
      // 请求数据完成
      load,
      remove: load,
    },
    queryParameter: {
      type: 'REMOVE',
      applicationCode: 'SRM',
    },
    transport: {
      read: {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/component/customizes`,
        method: 'get',
      },
      create: ({ data }) => {
        return {
          data,
          url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/component/customizes`,
          method: 'post',
        };
      },
      update: ({ data }) => {
        return {
          data,
          url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/component/customizes`,
          method: 'post',
        };
      },
      destroy: ({ data }) => {
        return {
          data,
          url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/component/customizes`,
          method: 'delete',
        };
      },
    },
  };
}

export { srmCustomizeDS };
