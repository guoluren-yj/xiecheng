import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const indexDS = () => ({
  primaryKey: 'closeMethod',
  //   cacheSelection: true, // 跨页勾选
  pageSize: 20,
  forceValidate: true,
  selection: false,
  fields: [
    {
      label: intl.get('slod.deliveryWorkbench.model.common.closeMethodAll').d('关闭方式'),
      name: 'closeMethod',
      type: 'string',
      lookupCode: 'SLOD.LAPSED_METHOD',
      valueField: 'value',
      textField: 'meaning',
      transformResponse: (value) => {
        return value && value.split(',');
      },
      transformRequest: (val) => val && val.join(','),
      lovPara: {
        tenantId: organizationId,
      },
      required: true,
      multiple: true,
      help: intl
        .get('slod.deliveryWorkbench.model.common.closeMethodTip')
        .d(
          '【自动】业务逻辑--同步收货的发货节点自动关闭指的是：单据行接收后自动关闭（部分或者全量）逻辑；不同步收货的发货节点的自动关闭指的是：此发货节点全量接收完成后执行的系统自动关闭逻辑'
        ),
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.canCloseStatusAll').d('可关闭状态'),
      name: 'canCloseStatus',
      type: 'string',
      lookupCode: 'SLOD.CAN_CLOSE_STATUS',
      lovPara: {
        tenantId: organizationId,
      },
      required: true,
      multiple: true,
      valueField: 'value',
      textField: 'meaning',
      transformResponse: (value) => {
        return value && value.split(',');
      },
      transformRequest: (val) => val && val.join(','),
      dynamicProps: {
        // disabled: ({ record }) => {
        //   return String(record.get('closeMethod')) === 'AUTO';
        // },
        defaultValue: ({ record }) => String(record.get('closeMethod')) === 'AUTO' && 'CONFIRMED',
      },
    },
    {
      label: intl
        .get('slod.deliveryWorkbench.model.common.forcedCloseTypeAll')
        .d('关联直系下游逻辑处理'),
      name: 'forcedCloseType',
      type: 'string',
      lookupCode: 'SLOD.FORCED_CLOSE_TYPE',
      lovPara: {
        tenantId: organizationId,
      },
      required: true,
      ignore: 'always',
      valueField: 'value',
      textField: 'meaning',
      help: intl
        .get('slod.deliveryWorkbench.model.common.forcedCloseTypeTip')
        .d(
          '此配置项用于控制当前节点单据关闭时是否需要受【直系】下游发货单据状态的限制，若需要，则直系下游中存在【受下游单据状态限制】中维护的状态时，当前节点的业务单据不可执行关闭操作'
        ),
    },
    {
      label: intl
        .get('slod.deliveryWorkbench.model.common.downstreamStatusAll')
        .d('下游单据控制不可关闭状态'),
      name: 'downstreamStatus',
      type: 'string',
      lookupCode: 'SLOD.DOWNSTREAM_STATUS',
      lovPara: {
        tenantId: organizationId,
      },
      multiple: true,
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('forcedCloseType') !== 'DOWN_STATUS';
        },
      },
      valueField: 'value',
      textField: 'meaning',
      transformResponse: (value) => {
        return value && value.split(',');
      },
      transformRequest: (val) => val && val.join(','),
      help: intl
        .get('slod.deliveryWorkbench.model.common.downstreamStatusTip')
        .d(
          '此配置项用于维护当前节点关闭时需要受到限制的直系下游发货节点单据状态，存在已维护的下游单据状态时，当前节点的业务单据不可执行关闭操作'
        ),
    },
    {
      label: intl
        .get('slod.deliveryWorkbench.model.common.quantityOccupiedTypeAll')
        .d('已关闭单据数量占用取值'),
      name: 'quantityOccupiedType',
      type: 'string',
      lookupCode: 'SLOD.QUANTITY_OCCUPIED_TYPE',
      lovPara: {
        tenantId: organizationId,
      },
      required: true,
      help: intl
        .get('slod.deliveryWorkbench.model.common.quantityOccupiedTypeTip')
        .d(
          '此配置项用于计算当前节点单据关闭成功后，已关闭的单据的占用数量取值，用于控制当前节点的业务单据可创建数量'
        ),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const { strategyLineId } = params || {};
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/strategy/strategy-close-control/${strategyLineId}`,
        method: 'GET',
        data: queryData,
      };
    },
  },
  events: {
    update: ({ record }) => {
      if (record.get('forcedCloseType') !== 'DOWN_STATUS') {
        record.set('downstreamStatus', '');
      }
    },
  },
});

export { indexDS };
