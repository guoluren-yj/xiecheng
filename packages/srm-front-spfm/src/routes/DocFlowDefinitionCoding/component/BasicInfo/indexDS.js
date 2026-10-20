/*
 * @Description:
 * @Date: 2021-07-06 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import intl from 'utils/intl';
import { SRM_DATA_PROCESS } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const tenantFlag = isTenantRoleLevel();
const requestUrlPre = tenantFlag
  ? `${SRM_DATA_PROCESS}/v1/${organizationId}`
  : `${SRM_DATA_PROCESS}/v1`;


const formTenantryDS = () => ({
    paging: false,
    autoCreate: true,
    autoQuery: false,
    forceValidate: true,
    fields: [
      {
        name: 'code',
        type: 'string',
        label: intl.get('spfm.progressDefinition.modal.node.code').d('节点code'),
      },
      {
        name: 'name',
        type: 'intl',
        label: intl.get('spfm.progressDefinition.model.view.name').d('节点描述'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { nodeId } = data;
        return {
          url: `${requestUrlPre}/node-definitions/${nodeId}`,
          method: 'GET',
        };
      },
      update: ({ data }) => {
        const { link, code, linkTitle } = data[0];
        return {
          url: `${requestUrlPre}/node-links`,
          method: 'POST',
          data: { link, linkTitle, nodeDefinitionCode: code },
        };
      },
    },
});

const formPlatformDS = () => ({
    paging: false,
    autoCreate: true,
    autoQuery: false,
    forceValidate: true,
    fields: [
        {
          name: 'code',
          type: 'string',
          label: intl.get('sdps.newNode.model.newNode.code').d('节点编码'),
          required: true,
        },
        {
          name: 'name',
          type: 'intl',
          label: intl.get('sdps.newNode.model.newNode.name').d('节点描述'),
          required: true,
        },
        {
          name: 'rootNodeFlag',
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
          defaultValue: false,
          label: intl.get('sdps.newNode.model.newNode.rootNodeFlag').d('根节点'),
        },
        {
          name: 'linkCheckFlag',
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
          defaultValue: 1,
          label: intl.get('spfm.statusPhaseMapping.modal.view.linkCheckFlag').d('是否校验权限'),
        },
        {
          name: 'icon',
          type: 'string',
          label: intl.get('sdps.newNode.model.newNode.icon').d('节点图标'),
          // required: true,
        },
        {
          name: 'nodeTableRelList',
          type: 'object',
          label: intl.get('sdps.newNode.model.newNode.nodeTableRelList').d('业务实体表'),
        },
        {
          name: 'fromSql',
          type: 'string',
          label: intl.get('sdps.newNode.model.newNode.fromSql').d('寻找上游节点SQL'),
          // required: true,
          dynamicProps: ({ record }) => {
            return {
              required: !record.get('rootNodeFlag'),
            };
          },
        },
        {
          name: 'belongNodeSql',
          type: 'string',
          label: intl.get('sdps.newNode.model.newNode.belongNodeSql').d('判断某笔单据节点类型SQL'),
        },
        {
          name: 'rootNodeSql',
          type: 'string',
          label: intl.get('sdps.newNode.model.newNode.rootNodeSql').d('判断根节点SQL'),
        },
      ],
      transport: {
        read: ({ data: { nodeId } }) => {
          return {
            url: `${SRM_DATA_PROCESS}/v1/node-definitions/${nodeId}`,
            method: 'GET',
          };
        },
        create: ({ data }) => {
          const { tenantId } = data[0];
          return {
            url: `${SRM_DATA_PROCESS}/v1/node-definitions/${tenantId}`,
            method: 'POST',
            data: data[0],
          };
        },
        update: ({ data }) => {
          const { tenantId } = data[0];
          return {
            url: `${SRM_DATA_PROCESS}/v1/node-definitions/${tenantId}`,
            method: 'POST',
            data: data[0],
          };
        },
      },
});

function getNodeTableRelListDs() {
  return {
    pageSize: 5,
    // autoCreate: true,
    dataToJSON: 'all',
    primaryKey: "id",
    autoQuery: false,
    modifiedCheck: false,
    cacheModified: true,
    cacheSelection: true,
    fields: [
      {
        name: 'NodeTable',
        type: 'object',
        TextField: 'tableName',
        valueField: 'tableCode',
        ignore: 'always',
        lovCode: 'DOC_FOLW_TBALE_CODE01',
        required: true,
        label: intl.get('sdps.newNode.model.newNode.tableName').d('表名'),
      },
      {
        name: 'tableName',
        type: 'string',
        bind: 'NodeTable.tableName',
        label: intl.get('sdps.newNode.model.newNode.tableName').d('表名'),
        required: true,
      },
      {
        name: 'tableCode',
        type: 'string',
        bind: 'NodeTable.tableCode',
        label: intl.get('sdps.newNode.model.newNode.tableCode').d('表编码'),
      },
      {
        name: 'mainTableFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: false,
        label: intl.get('sdps.newNode.model.newNode.mainTableFlag').d('是否是主体表'),
      },
      {
        name: 'action',
        label: intl.get('hzero.common.table.column.option').d('操作'),
      },
    ],
  };
}

const formDS = tenantFlag ? formTenantryDS : formPlatformDS;


export { formDS, getNodeTableRelListDs };
