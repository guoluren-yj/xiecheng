import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import intl from 'srm-front-boot/lib/utils/intl';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

const treeDS = () =>
  ({
    autoQuery: false,
    autoCreate: false,
    selection: 'multiple',
    paging: false,
    childrenField: 'childList',
    transport: {
      read: ({ params }) => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-object-import-templates/business-object-field/tree`,
        method: 'GET',
        params,
      }),
    },
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
      // {
      //   name: 'businessObjectFieldCode',
      //   type: 'string',
      // },
      {
        name: 'businessObjectFieldName',
        type: 'string',
        label: intl.get('hmde.boComposition.view.message.header.fieldName').d('字段名称'),
      },
      {
        name: 'businessObjectName',
        type: 'string',
        label: intl
          .get('hmde.boComposition.exportTemplateField.view.message.header.businessObjectName')
          .d('所属对象'),
      },
      {
        name: 'defaultExportFlag',
        type: 'boolean',
        label: intl
          .get('hmde.boComposition.exportTemplateField.view.message.header.defaultExportFlag')
          .d('默认勾选'),
      },
      {
        name: 'businessObjectFieldCode',
        type: 'string',
        label: intl.get('hmde.boComposition.view.message.header.fieldCode').d('字段编码'),
      },
    ],
    events: {
      load: ({ dataSet }) => {
        const fieldCodeList = dataSet.getState('fieldCodeList');
        if (fieldCodeList) {
          dataSet.forEach((record) => {
            if (
              record?.get?.('businessObjectImportTemplateColId') ||
              fieldCodeList.includes(record?.get('businessObjectFieldCode')) ||
              record?.get('childList')?.length
            ) {
              Object.assign(record, { selectable: false });
            }
            return record;
          });
        }
      },
    },
  } as DataSetProps);


const flatTreeDS = () =>
  ({
    autoQuery: false,
    autoCreate: false,
    selection: 'multiple',
    paging: false,
    idField: 'columnId',
    parentField: 'parentColumnId',
    dataKey: 'childList',
    transport: {
      read: ({ params }) => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-object-import-templates/business-object-field/tree`,
        method: 'GET',
        params: {
          ...(params || {}),
          platFlag: true,
        },
      }),
    },
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
      // {
      //   name: 'businessObjectFieldCode',
      //   type: 'string',
      // },
      {
        name: 'businessObjectFieldName',
        type: 'string',
        label: intl.get('hmde.boComposition.view.message.header.fieldName').d('字段名称'),
      },
      {
        name: 'businessObjectName',
        type: 'string',
        label: intl
          .get('hmde.boComposition.exportTemplateField.view.message.header.businessObjectName')
          .d('所属对象'),
      },
      {
        name: 'defaultExportFlag',
        type: 'boolean',
        label: intl
          .get('hmde.boComposition.exportTemplateField.view.message.header.defaultExportFlag')
          .d('默认勾选'),
      },
      {
        name: 'businessObjectFieldCode',
        type: 'string',
        label: intl.get('hmde.boComposition.view.message.header.fieldCode').d('字段编码'),
      },
    ],
    events: {
      load: ({ dataSet }) => {
        const fieldCodeList = dataSet.getState('fieldCodeList');
        if (fieldCodeList) {
          dataSet.forEach((record) => {
            if (
              record?.get?.('businessObjectImportTemplateColId') ||
              fieldCodeList.includes(record?.get('businessObjectFieldCode')) ||
              record?.get('childList')?.length
            ) {
              Object.assign(record, { selectable: false });
            }
            return record;
          });
        }
      },
    },
  } as DataSetProps);

export { treeDS, flatTreeDS };
