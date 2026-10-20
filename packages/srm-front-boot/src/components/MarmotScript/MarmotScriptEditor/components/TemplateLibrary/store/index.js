import intl from 'utils/intl';
import { SRM_ADAPTOR } from '@/utils/config';

function getTemplateLibraryDs(type) {
  return {
    autoQuery: false,
    selection: false,
    pageSize: 10,
    fields: [
      {
        name: 'id',
        type: 'string',
        label: 'id',
      },
      {
        name: 'code',
        type: 'string',
        label: intl.get('spfm.adaptorTaskDetail.templateLibrary.store.code').d('唯一编码'),
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.adaptorTaskDetail.templateLibrary.store.description').d('案例名'),
        required: true,
      },
      {
        name: 'contributor',
        type: 'string',
        label: intl.get('spfm.adaptorTaskDetail.templateLibrary.store.contributor').d('贡献者'),
      },
      {
        name: 'type',
        type: 'string',
        lookupCode: 'SADA_MARMOT_TEMPLATE_TYPE',
        required: true,
        label: intl.get('spfm.adaptorTaskDetail.templateLibrary.store.type').d('类型'),
      },
      {
        name: 'star',
        type: 'string',
        label: intl.get('spfm.adaptorTaskDetail.templateLibrary.store.star').d('收藏数'),
      },
      {
        name: 'content',
        type: 'string',
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
      },
    ],
    transport: {
      read({ data, params: { page, pagesize } }) {
        return {
          url: `${SRM_ADAPTOR}/v1/script-templates/query`,
          method: 'get',
          data: { ...data, page, pagesize, isPrivate: type === 'personal' },
        };
      },
    },
  };
}

function getQueryFormDs() {
  return {
    autoCreate: false,
    fields: [
      {
        name: 'code',
        type: 'string',
      },
    ],
  };
}

export { getTemplateLibraryDs, getQueryFormDs };
