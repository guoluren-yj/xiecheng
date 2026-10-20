import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { HZERO_HMDE } from '../../../components/utils/config';
import { lowcodeOrganizationURL } from '../../../components/utils';

const tableDS = () => ({
  autoQuery: false,
  autoCreate: false,
  selection: 'multiple',
  pageSize: 10,
  transport: {
    read: ({ params }) => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/business-objects-export-template-columns/page`,
      method: 'GET',
      params,
    }),
    destroy: ({ data }) => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/business-objects-export-template-columns/batch`,
      method: 'DELETE',
      data,
    }),
    submit: ({ data, dataSet }) => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/business-objects-export-template-columns/batch`,
      method: 'POST',
      data,
      params: {
        businessObjectExportTemplateId: dataSet?.getQueryParameter('businessObjectExportTemplateId'),
      },
    }),
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((i) => {
        if (i?.get('tenantId') !== getCurrentOrganizationId()) {
          Object.assign(i, { selectable: false });
        }
      });
    },
  },
  fields: [
    {
      label: intl.get('hmde.bo.common.column.orderSeq').d('排序'),
      name: 'orderSeq',
      type: 'number',
    },
    {
      name: 'aliasName',
      type: 'string',
      label: intl.get('hmde.bo.common.column.aliasName').d('字段编码别名'),
      pattern: /^[_a-z][0-9a-zA-Z]{0,}[0-9a-zA-Z_]$/,
    },
    {
      name: 'displayName',
      type: 'string',
      label: intl.get('hmde.displayName').d('列字段别名'),
    },
    {
      label: intl.get('hmde.bo.export.template.columnField').d('列字段'),
      name: 'businessObjectFieldName',
      type: 'string',
    },
    {
      name: 'businessObjectFieldCode',
      type: 'string',
    },
    {
      name: 'originalBusinessObjectFieldCode',
      type: 'string',
      label: intl.get('hmde.businessObjectFieldCode').d('字段编码'),
    },
    {
      label: intl.get('hmde.businessObject').d('业务对象'),
      name: 'businessObjectName',
      type: 'string',
    },
    {
      label: intl.get('hmde.bo.export.template.remark').d('描述'),
      name: 'remark',
      type: 'string',
    },
    {
      label: intl.get('hmde.bo.export.template.defaultExportFlag').d('默认勾选'),
      name: 'defaultExportFlag',
      type: 'boolean',
    },
  ],
});

const FiledSelectDS = () => {
  return {
    autoQuery: false,
    autoCreate: false,
    selection: 'multiple',
    paging: false,
    fields: [
      {
        name: 'businessObjectFieldName',
        type: 'string',
        label: intl.get('hmde.businessObjectFieldName').d('字段名称'),
      },
      {
        name: 'businessObjectFieldId',
        type: 'string',
      },
      {
        name: 'businessObjectFieldCode',
        type: 'string',
      },
      {
        name: 'businessObjectImportTemplateColId',
        type: 'string',
      },
      {
        name: 'businessObjectImportTemplateSheetId',
        type: 'string',
      },
      {
        name: 'businessObjectCode',
        type: 'string',
        label: intl.get('hmde.businessObjectCode').d('对象编码'),
        required: true,
      },
      {
        name: 'businessObjectName',
        type: 'string',
        label: intl.get('hmde.businessObjectName').d('所属对象'),
      },
      {
        name: 'remark',
        type: 'string',
      },
    ],
  };
};

const selectedDS = () => {
  return {
    autoQuery: false,
    autoCreate: false,
    selection: 'multiple',
    parentField: 'parentId',
    idField: 'id',
    paging: false,
    fields: [
      { name: 'id', type: 'string' },
      { name: 'parentId', type: 'string', parentFieldName: 'id' },
      {
        name: 'businessObjectFieldName',
        type: 'string',
        label: intl.get('hmde.businessObjectFieldName').d('字段名称'),
      },
      {
        name: 'businessObjectExportTemplateColumnId',
        type: 'string',
      },
      {
        name: 'businessObjectExportTemplateId',
        type: 'string',
      },
      {
        name: 'businessObjectFieldId',
        type: 'string',
      },
      {
        label: intl.get('hmde.bo.common.column.orderSeq').d('排序'),
        name: 'orderSeq',
        type: 'number',
        step: 1,
        min: 1,
      },
      {
        name: 'defaultExportFlag',
        type: 'boolean',
        label: intl.get('hmde.defaultExportFlag').d('默认勾选'),
        defaultValue: false,
      },
    ],
  };
};

const treeDS = () => ({
  autoQuery: false,
  autoCreate: false,
  selection: 'multiple',
  paging: false,
  parentField: 'parentId',
  idField: 'id',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'parentId', type: 'string', parentFieldName: 'id' },
    {
      name: 'aliasName',
      type: 'string',
    },
    {
      name: 'businessObjectCode',
      type: 'string',
    },
    {
      name: 'businessObjectExportTemplateColumnId',
      type: 'string',
    },
    {
      name: 'businessObjectFieldCode',
      type: 'string',
    },
    {
      name: 'businessObjectFieldName',
      type: 'string',
      label: intl.get('hmde.businessObjectFieldName').d('字段名称'),
    },
    {
      name: 'businessObjectName',
      type: 'string',
      label: intl.get('hmde.businessObjectName').d('所属对象'),
    },
    {
      name: 'defaultExportFlag',
      type: 'boolean',
      label: intl.get('hmde.defaultExportFlag').d('默认勾选'),
    },
    {
      name: 'originalBusinessObjectFieldCode',
      type: 'string',
      label: intl.get('hmde.businessObjectFieldCode').d('字段编码'),
    },
  ],
});

const searchDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'businessObjectFieldName',
      type: 'string',
      label: intl.get('hiam.tenants.model.title.businessObjectFieldName').d('字段名称'),
    },
    {
      name: 'businessObjectFieldCode',
      type: 'string',
      label: intl.get('hiam.tenants.model.title.businessObjectFieldCode').d('字段编码'),
    },
    {
      name: 'originalBusinessObjectFieldCode',
      type: 'string',
      label: intl.get('hiam.tenants.model.title.originalBusinessObjectFieldCode').d('字段编码'),
    },
    {
      name: 'businessObjectName',
      type: 'string',
      label: intl.get('hiam.tenants.model.title.businessObjectName').d('所属对象'),
    },
  ],
});

export { tableDS, FiledSelectDS, selectedDS, treeDS, searchDS };
