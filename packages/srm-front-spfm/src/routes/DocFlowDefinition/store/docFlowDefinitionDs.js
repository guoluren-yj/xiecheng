/**
 * docFlowDefinitionDs.js
 * 单据流节点定义
 * @date: 2021-08-23
 * @author: yukbiu <yubiao.qiu@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import intl from 'utils/intl';
import { SRM_DATA_PROCESS } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
const requestUrlPre = tenantFlag
  ? `${SRM_DATA_PROCESS}/v1/${organizationId}`
  : `${SRM_DATA_PROCESS}/v1`;

export default function getTableDs() {
  return {
    autoQuery: false,
    selection: false,
    pageSize: 20,
    // queryFields: [
    //   {
    //     name: 'code',
    //     type: 'string',
    //     label: intl.get('sdps.docFlowDefinition.model.view.nodeId').d('节点编码'),
    //   },
    //   {
    //     name: 'name',
    //     type: 'string',
    //     label: intl.get('sdps.docFlowDefinition.model.view.name').d('节点描述'),
    //   },
    // ],
    fields: [
      {
        name: 'nodeId',
        type: 'string',
      },
      {
        name: 'code',
        type: 'string',
        required: true,
        label: intl.get('sdps.docFlowDefinition.model.view.nodeId').d('节点编码'),
      },
      {
        name: 'name',
        type: 'intl',
        required: true,
        label: intl.get('sdps.docFlowDefinition.model.view.name').d('节点名称'),
      },
      {
        name: 'icon',
        type: 'string',
        // required: true,
        label: intl.get('sdps.docFlowDefinition.model.view.icon').d('节点图标'),
      },
      {
        name: 'link',
        type: 'string',
        // required: true,
        label: intl.get('sdps.docFlowDefinition.model.view.link').d('节点明细链接'),
      },
      {
        name: 'linkCheckFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
        label: intl.get('spfm.statusPhaseMapping.modal.view.linkCheckFlag').d('是否校验权限'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${requestUrlPre}/node-definitions`,
          method: 'GET',
        };
      },
      update: ({ data }) => {
        return {
          url: `${requestUrlPre}/node-definitions`,
          method: 'POST',
          data: data[0],
        };
      },
    },
  };
}
