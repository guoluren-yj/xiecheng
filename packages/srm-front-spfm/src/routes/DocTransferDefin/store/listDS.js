/**
 * listDS.js
 * 单据转交定义
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { SRM_PLATFORM } from '_utils/config';
import intl from 'utils/intl';

export default function () {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'docCode',
        type: 'string',
        required: true,
        label: intl.get('spfm.docTransferDefin.model.view.docCode').d('单据编码'),
      },
      {
        name: 'docName',
        type: 'intl',
        required: true,
        label: intl.get('spfm.docTransferDefin.model.view.docName').d('单据名称'),
      },
      {
        name: 'docLevel',
        type: 'string',
        required: true,
        label: intl.get('spfm.docTransferDefin.model.view.docLevel').d('层级'),
        lookupCode: 'HIAM.DOC_TYPE_LEVEL_CODE',
      },
      {
        name: 'orderSeq',
        type: 'string',
        label: intl.get('spfm.docTransferDefin.model.view.orderSeq').d('排序号'),
      },
      {
        name: 'description',
        type: 'intl',
        label: intl.get('spfm.docTransferDefin.model.view.description').d('描述'),
      },
      {
        name: 'conditionalRuleFlag',
        label: intl
          .get('spfm.docTransferDefin.model.view.conditionalRuleFlag')
          .d('是否启用条件规则'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'deliverMaxCount',
        label: intl.get('spfm.docTransferDefin.model.view.deliverMaxCount').d('单次转交数量阈值'),
        type: 'number',
        min: 1,
        step: 1,
        precision: 0,
        defaultValue: 1000,
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        label: intl.get('spfm.docTransferDefin.model.view.enabledFlag').d('状态'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('spfm.docTransferDefin.model.view.action').d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'docCode',
        type: 'string',
        label: intl.get('spfm.docTransferDefin.model.view.docCode').d('单据编码'),
      },
      {
        name: 'docName',
        type: 'string',
        label: intl.get('spfm.docTransferDefin.model.view.docName').d('单据名称'),
      },
      {
        name: 'docLevel',
        type: 'string',
        label: intl.get('spfm.docTransferDefin.model.view.docLevel').d('层级'),
        lookupCode: 'HIAM.DOC_TYPE_LEVEL_CODE',
      },
      {
        name: 'enabledFlag',
        type: 'number',
        label: intl.get('spfm.docTransferDefin.model.view.enabledFlag').d('状态'),
        lookupCode: 'SPFM.ENABLED_FLAG',
      },
    ],
    selection: false,
    transport: {
      read: {
        url: `${SRM_PLATFORM}/v1/doc-deliver-headers/select`,
        method: 'GET',
      },
    },
  };
}
