import intl from 'srm-front-boot/lib/utils/intl';
// import { DataSet } from 'choerodon-ui/pro';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

const TemplateColDS = (flag, id?) =>
  ({
    autoQuery: false,
    autoCreate: false,
    selection: 'multiple',
    paging: flag,
    fields: [
      {
        name: 'objectVersionNumber',
        type: 'string',
      },
      {
        name: 'businessObjectImportTemplateSheetId',
        type: 'string',
      },
      // {
      //   name: 'businessObjectFieldCode',
      //   type: 'string',
      // },
      {
        name: 'businessObjectFieldCode',
        type: 'string',
        label: intl.get('hmde.common.businessObjectFieldCode').d('字段编码'),
      },
      {
        name: 'businessObjectCode',
        type: 'string',
      },
      {
        name: 'businessObjectImportTemplateId',
        type: 'string',
      },
      {
        name: 'orderSeq',
        type: 'number',
        label: intl.get('hmde.common.view.message.orderSeq').d('排序'),
        min: 1,
        required: true,
      },
      {
        name: 'columnName',
        type: 'string',
      },
      {
        name: 'aliasName',
        type: 'string',
        label: intl.get('hmde.bo.importTemplate.view.message.aliasName').d('字段编码别名'),
        pattern: /^[_a-z][0-9a-zA-Z]{0,}[0-9a-zA-Z_]$/,
      },
      {
        name: 'displayName',
        type: 'intl',
        label: intl.get('hmde.bo.importTemplate.view.message.displayName').d('列字段别名'),
      },
      {
        name: 'fieldName',
        type: 'string',
        label: intl.get('hzero.common.title.individuation.row').d('字段列'),
      },
      {
        name: 'businessObject',
        type: 'string',
      },
      {
        name: 'businessObjectFieldName',
        type: 'string',
        label: intl.get('hmde.bo.field.name').d('字段名称'),
      },
      {
        name: 'businessObjectName',
        type: 'string',
        label: intl.get('hmde.bo.tab.title').d('业务对象'),
      },
      {
        name: 'sampleData',
        type: 'string',
        label: intl.get('hmde.common.view.message.example.data').d('示例数据'),
      },
      {
        name: 'remark',
        type: 'intl',
        label: intl.get('hmde.common.label.remark').d('描述'),
      },
      {
        name: 'requiredFlag',
        type: 'boolean',
        label: intl.get('hzero.common.title.individuation.required').d('是否必输'),
      },
      {
        name: 'translatableFlag',
        type: 'boolean',
        label: intl.get('hmde.bo.importTemplate.view.message.translatableFlag').d('值集转换'),
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status.enableFlag').d('是否启用'),
      },
      {
        name: 'validatableFlag',
        type: 'boolean',
        label: intl.get('hmde.common.status.validate').d('是否校验'),
      },
      {
        name: 'tenantId',
        type: 'number',
      },
      {
        name: 'importableFlag',
        type: 'boolean',
        label: intl.get('hmde.common.view.message.disabledImport').d('不可导入'),
        help: intl.get('hmde.common.view.message.disabledImport.help').d('勾选开启该配置后，导入时，当前字段不支持导入；同时，对于预定义字段，该属性在平台层调整后，可能会导致租户层调整不生效，请谨慎调整预定义字段属性'),
        transformRequest: value => !value,
        transformResponse: value => !value,
      },
    ],
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-object-import-template-columns/${id}/list`,
        method: 'get',
      },
    },
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach(i => {
          if (i?.get('tenantId') !== getCurrentOrganizationId()) {
            Object.assign(i, { selectable: false });
          }
        });
      },
    },
  } as DataSetProps);

export { TemplateColDS };
