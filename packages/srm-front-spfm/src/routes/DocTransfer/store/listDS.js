/**
 * listDS.js
 * 单据转交定义
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { HZERO_IAM, HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

export const docListDSConfig = () => {
  return {
    pageSize: 20,
    fields: [
      {
        name: 'loginName',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.loginName').d('账户'),
      },
      {
        name: 'realName',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.realName').d('名称'),
      },
      {
        name: 'email',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.email').d('邮箱'),
      },
      {
        name: 'phone',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.phone').d('手机号'),
      },
      {
        name: 'enabled',
        type: 'boolean',
        label: intl.get('spfm.docTransfer.model.view.enabled').d('冻结'),
      },
      {
        name: 'locked',
        type: 'boolean',
        label: intl.get('spfm.docTransfer.model.view.locked').d('锁定'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.action').d('操作'),
      },
      {
        name: 'id',
      },
    ],
    queryFields: [
      {
        name: 'loginName',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.loginName').d('账户'),
        display: true,
      },
      {
        name: 'realName',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.realName').d('名称'),
        display: true,
      },
      {
        name: 'email',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.email').d('邮箱'),
        display: true,
      },
      {
        name: 'phone',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.phone').d('手机号'),
        display: true,
      },
      {
        name: 'enabled',
        label: intl.get('spfm.docTransfer.model.view.enabled').d('冻结'),
        lookupCode: 'HPFM.FLAG',
        display: true,
      },
      {
        name: 'locked',
        label: intl.get('spfm.docTransfer.model.view.locked').d('锁定'),
        lookupCode: 'HPFM.FLAG',
        display: true,
      },
    ],
    selection: false,
    transport: {
      read: {
        url: `${HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/users/paging`,
        method: 'GET',
      },
    },
    queryParameter: {
      userType: 'P',
    },
  };
};

export const docAgentListDSConfig = () => {
  return {
    pageSize: 20,
    fields: [
      {
        name: 'purchaseAgentCode',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.purchaseAgentCode').d('采购员编码'),
      },
      {
        name: 'purchaseAgentName',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.purchaseAgentName').d('采购员名称'),
      },
      {
        name: 'sourceCode',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.sourceCode').d('数据来源'),
      },
      {
        name: 'externalSystemCode',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.externalSystemCode').d('来源系统'),
      },
      {
        name: 'enabledFlag',
        type: 'number',
        label: intl.get('spfm.docTransfer.model.view.enabledFlag').d('状态'),
      },
    ],
    queryFields: [
      {
        name: 'purchaseAgentCode',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.purchaseAgentCode').d('采购员编码'),
        display: true,
      },
      {
        name: 'purchaseAgentName',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.view.purchaseAgentName').d('采购员名称'),
        display: true,
      },
      {
        name: 'enabledFlag',
        label: intl.get('spfm.docTransfer.model.view.enabledFlag').d('是否启用'),
        lookupCode: 'HPFM.FLAG',
        display: true,
      },
    ],
    selection: false,
    transport: {
      read: {
        url: `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/purchases/agents`,
        method: 'GET',
      },
    },
  };
};
