import intl from 'utils/intl';
import DataSet from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSetSelection, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { SRM_SWBH } from '../../components/utils/config';
import { PublishStatus } from '../../components/utils/common';

const organizationId = getCurrentOrganizationId();

const tableDS = (flag) => ({
  autoCreate: flag,
  autoQuery: false,
  // selection: false,
  paging: true,
  pageSize: 10,
  fields: [
    {
      name: 'docObjectId',
      type: FieldType.string,
    },
    {
      name: 'combineId',
      type: FieldType.string,
    },
    {
      name: 'combineName',
      type: 'object',
      ignore: 'always',
      label: intl.get('swbh.roManagement.view.message.header.roleCombineName').d('单据对象名称'),
      required: true,
      lovCode: 'SWBH_DOC_OBJECT_DEFINITION',
      // lovCode: isTenantRoleLevel() ? 'HMDE.BUSINESS_OBJECT' : 'HMDE.BUSINESS_OBJECT.SITE',
    },
    {
      label: intl.get('swbh.roManagement.view.message.header.combineName').d('单据对象编码'),
      name: 'combineCode',
      type: FieldType.string,
    },
    {
      name: 'roleCombineCode',
      type: FieldType.string,
      required: true,
      bind: 'combineName.combineCode',
    },
    {
      name: 'roleCombineId',
      type: FieldType.string,
      required: true,
      bind: 'combineName.combineId',
    },
    {
      name: 'masterObjectName',
      label: intl.get('swbh.roManagement.view.message.header.masterObjectName').d('主对象名称'),
      type: FieldType.string,
    },
    {
      name: 'masterObjectCode',
      label: intl.get('swbh.roManagement.view.message.header.masterObjectCode').d('主对象编码'),
      type: FieldType.string,
    },
    {
      label: intl.get('swbh.roManagement.view.message.header.publishStatus').d('发布状态'),
      name: 'publishStatus',
      type: FieldType.string,
    },
    {
      label: intl.get('swbh.common.view.message.header.operation').d('操作'),
      name: 'operation',
      type: FieldType.string,
    },
  ],
  queryFields: [
    {
      label: intl.get('swbh.roManagement.view.message.header.roleCombineName').d('单据对象名称'),
      name: 'combineName',
      type: FieldType.string,
      labelWidth: '120',
    },
    {
      label: intl.get('swbh.roManagement.view.message.header.combineCode').d('单据对象编码'),
      name: 'combineCode',
      type: FieldType.string,
      labelWidth: '120',
    },
    {
      name: 'masterObjectName',
      label: intl.get('swbh.roManagement.view.message.header.masterObjectName').d('主对象名称'),
      type: FieldType.string,
      labelWidth: '120',
    },
    {
      name: 'masterObjectCode',
      label: intl.get('swbh.roManagement.view.message.header.masterObjectCode').d('主对象编码'),
      type: FieldType.string,
      labelWidth: '120',
    },
    {
      label: intl.get('swbh.roManagement.view.message.header.publishStatus').d('发布状态'),
      name: 'publishStatus',
      type: FieldType.string,
      textField: 'text',
      valueField: 'value',
      options: new DataSet({
        selection: DataSetSelection.single,
        data: [
          {
            text: intl.get('swbh.common.status.unpublished').d('未发布'),
            value: PublishStatus.UNPUBLISHED,
          },
          {
            text: intl.get('swbh.common.status.published').d('已发布'),
            value: PublishStatus.PUBLISHED,
          },
          {
            text: intl.get('swbh.common.status.pending').d('待发布'),
            value: PublishStatus.PENDING,
          },
        ],
      }),
    },
  ],
  transport: {
    read: () => {
      const url = isTenantRoleLevel()
        ? `${SRM_SWBH}/v1/${organizationId}/doc-object-definitions?tenantId=${organizationId}`
        : `${SRM_SWBH}/v1/doc-object-definitions`;
      return {
        url,
        method: 'GET',
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      for (const i of dataSet.records) {
        const { publishStatus } = i.get(['publishStatus']);

        if (i.selectable) {
          i.selectable = ['UNPUBLISHED', 'PUBLISHED'].includes(publishStatus);
        }
      }
    },
  },
});
// 模板管理
const templateDS = (flag) => ({
  autoQuery: false,
  autoCreate: flag,
  selection: false,
  pageSize: 10,
  queryFields: [
    {
      name: 'relBusinessObjectName',
      type: 'string',
      label: intl.get('swbh.roManagement.relBusinessObjectName').d('关联对象'),
    },
    {
      name: 'relBusinessObjectCode',
      type: 'string',
      label: intl.get('swbh.roManagement.relBusinessObjectCode').d('对象编码'),
    },
  ],
  fields: [
    {
      name: 'docObjectRelId',
      type: 'string',
    },
    {
      name: 'relBusinessObjectName',
      type: 'string',
      label: intl.get('swbh.common.relBusinessObjectName').d('关联对象'),
    },
    {
      name: 'relBusinessObjectCode',
      type: 'string',
      required: true,
      label: intl.get('swbh.common.relBusinessObjectCode').d('对象编码'),
    },
    {
      label: intl.get('swbh.common.tableCode').d('表名'),
      name: 'tableCode',
      type: 'string',
      bind: 'relBusinessObjectCode.tableCode',
    },
    {
      name: 'mainTableFlag',
      type: 'boolean',
      label: intl.get('swbh.common.mainTableFlag').d('主对象'),
      trueValue: 1,
      falseValue: 0,
    },
  ],
  transport: {
    read: () => {
      const url = isTenantRoleLevel()
        ? `${SRM_SWBH}/v1/${organizationId}/doc-object-rels?tenantId=${organizationId}`
        : `${SRM_SWBH}/v1/doc-object-rels`;
      return {
        url,
        method: 'GET',
      };
    },
  },
});

export { tableDS, templateDS };
