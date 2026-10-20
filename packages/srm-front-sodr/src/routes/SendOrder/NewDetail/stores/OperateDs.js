import { SRM_SPUC } from '_utils/config';
import intl from 'hzero-front/lib/utils/intl';

const modelPrompt = 'sodr.sendOrder.model.common';

export default ({ organizationId, poHeaderId }) => {
  return {
    autoQuery: true,
    transport: {
      read: ({ data, params }) => {
        const { page, size } = params;
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/po-process-actions/${poHeaderId}`,
          method: 'get',
          params: {
            tenantId: organizationId,
            ...data,
            page,
            size,
          },
        };
      },
    },
    queryFields: [
      {
        name: 'versionNum',
        type: 'number',
        min: 1,
        max: '999999999',
        label: intl.get(`${modelPrompt}.versionNum`).d('版本号'),
      },
      { name: 'processedDateStart', type: 'dateTime', bind: 'processedDate.start' },
      { name: 'processedDateEnd', type: 'dateTime', bind: 'processedDate.end' },
      {
        name: 'processedDate',
        type: 'dateTime',
        range: ['start', 'end'],
        ignore: 'always',
        label: intl.get(`${modelPrompt}.operationTime`).d('操作时间'),
      },
    ],
    fields: [
      {
        name: 'processUserName',
        label: intl.get(`sodr.common.model.common.operatedByName`).d('操作人'),
      },
      {
        name: 'processedDate',
        type: 'dateTime',
        label: intl.get(`${modelPrompt}.operationTime`).d('操作时间'),
      },
      {
        name: 'processTypeMeaning',
        label: intl.get(`${modelPrompt}.action`).d('动作'),
      },
      {
        name: 'processRemark',
        label: intl.get(`sodr.common.model.common.operationReason`).d('说明'),
      },
      {
        name: 'versionNum',
        label: intl.get(`${modelPrompt}.versionNum`).d('版本号'),
      },
      {
        name: 'changeTypeMeaning',
        label: intl.get(`${modelPrompt}.changeAction`).d('变更动作'),
      },
      {
        name: 'displayLineNum',
        label: intl.get(`${modelPrompt}.lineNum`).d('行号'),
      },
      {
        name: 'displayLineLocationNum',
        label: intl.get(`${modelPrompt}.shipmentNum`).d('发运号'),
      },
      {
        name: 'changeFieldNameMeaning',
        label: intl.get(`${modelPrompt}.changeContent`).d('修改内容'),
      },
      {
        name: 'oldValue',
        label: intl.get(`${modelPrompt}.beforeModification`).d('修改前'),
        // dynamicProps: {
        //   type({ record }) {
        //     if (
        //       [
        //         'unit_price',
        //         'entered_tax_included_price',
        //         'unit_price_batch',
        //         'line_amount',
        //         'tax_included_line_amount',
        //       ].includes(record.get('changeFieldName'))
        //     ) {
        //       return 'currency';
        //     }
        //     return 'auto';
        //   },
        // },
      },
      {
        name: 'newValue',
        label: intl.get(`${modelPrompt}.afterModification`).d('修改后'),
        // dynamicProps: {
        //   type({ record }) {
        //     if (
        //       [
        //         'unit_price',
        //         'entered_tax_included_price',
        //         'unit_price_batch',
        //         'line_amount',
        //         'tax_included_line_amount',
        //       ].includes(record.get('changeFieldName'))
        //     ) {
        //       return 'currency';
        //     }
        //     return 'auto';
        //   },
        // },
      },
    ],
  };
};
