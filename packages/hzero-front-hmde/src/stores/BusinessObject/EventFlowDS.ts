import intl from 'srm-front-boot/lib/utils/intl';
import { HZERO_HLOD } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

const eventFlowDs = ({ businessObjectCode, flowId = undefined, tenantId }) =>
  ({
    autoQuery: false,
    paging: !flowId,
    transport: {
      read: ({ params }) => ({
        url: `${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-event-flows/${
          flowId ?? 'page'
        }`,
        method: 'GET',
        params: {
          ...params,
          businessObjectCode: flowId ? undefined : businessObjectCode,
        },
      }),
      destroy: ({ data }) => ({
        url: `${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-event-flows`,
        method: 'DELETE',
        data: data[0],
      }),
      update: ({ data }) => ({
        url: `${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-event-flows`,
        method: 'PUT',
        data: data[0],
      }),
      create: ({ data }) => ({
        url: `${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-event-flows`,
        method: 'POST',
        data: { businessObjectCode, ...data[0], tenantId },
      }),
    },
    fields: [
      {
        label: intl.get('hmde.bo.eventFlow.model.flowName').d('事件流名称'),
        name: 'flowName',
        type: 'string',
        maxLength: 20,
        required: true,
      },
      {
        label: intl.get('hmde.bo.eventFlow.model.flowCode').d('事件流编码'),
        name: 'flowCode',
        type: 'string',
        pattern: /^\w+$/,
        maxLength: 32,
        required: true,
        defaultValue: `${businessObjectCode}_`,
        // transformResponse: (value) => {
        //   const reg = new RegExp(`^${businessObjectCode}_`);
        //   return value?.replace(reg, '');
        // },
        // transformRequest: (value) => `${businessObjectCode}_${value}`,
      },
      {
        label: intl.get('hmde.common.label.remark').d('描述'),
        name: 'remark',
        type: 'string',
        maxLength: 60,
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
    ],
    queryFields: [
      {
        label: intl.get('hmde.bo.eventFlow.model.flowName').d('事件流名称'),
        name: 'flowName',
        type: 'string',
        maxLength: 20,
      },
      {
        label: intl.get('hmde.bo.eventFlow.model.flowCode').d('事件流编码'),
        name: 'flowCode',
        type: 'string',
        pattern: /^\w+$/,
        maxLength: 32,
      },
      // {
      //   label: intl.get('hmde.bo.eventFlow.model.enabledFlag').d('启用状态'),
      //   name: 'enabledFlag',
      //   type: 'string',
      //   lookupCode: 'HPFM.ENABLED_FLAG',
      // },
    ],
  } as DataSetProps);

export { eventFlowDs };
