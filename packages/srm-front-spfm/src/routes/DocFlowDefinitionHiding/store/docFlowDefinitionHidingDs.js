/**
 * docFlowDefinitionCodingDs.js
 * 节点详情定义 Dataset
 * @date: 2021-08-30
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import intl from 'utils/intl';
import { SRM_DATA_PROCESS } from '_utils/config';

function getNodeHidden() {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'id',
        type: 'number',
      },
      {
        name: 'currNodeDefinitionCode',
        type: 'string',
        lookupCode: 'DOC_FOLW_NODE_DEFINITION_CODE',
        label: intl
          .get('sdps.docFlowDefinitionHiding.model.docFlowDefinitionHiding.currNodeDefinitionCode')
          .d('当前节点'),
        required: true,
        ignore: 'always',
      },
      {
        name: 'hideNodeCode',
        type: 'string',
        lookupCode: 'DOC_FOLW_NODE_DEFINITION_CODE',
        label: intl
          .get('sdps.docFlowDefinitionHiding.model.docFlowDefinitionHiding.hideNodeCode')
          .d('隐藏节点'),
        multiple: true,
        required: true,
      },
      {
        name: 'operation',
        label: intl.get('hzero.common.view.sstaHandle').d('操作'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/node-hide-definitions`,
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/node-hide-definitions`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
}

export { getNodeHidden };
