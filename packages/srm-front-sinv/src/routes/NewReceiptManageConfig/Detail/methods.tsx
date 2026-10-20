/**
 * index.js 收货管理配置-新
 * @date: 2022-11-14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import intl from 'srm-front-boot/lib/utils/intl/index.js';
import { SRM_SPUC, PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config.js';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils/user';

import {salesReturn} from './salesReturn/index';

const organizationId = getCurrentOrganizationId();

/**
 * 头信息- function
 * @nodeCreateFormParams {*} 编辑
 * @nodereadOnlyFormParams {*} 只读
 * return arr
 */
function formColumns({ workFlag }): any{
    const nodeCreateFormParams = [
      {
        type: 'number',
        name: 'nodeConfigCode',
        compType: 'NumberField',
        label: intl.get('sinv.receiptManage.model.receipt.lineSeq').d('节点顺序'),
        dynamicProps: ({ record }) => {
          return {
            disabled: !(!(record.get('trxLineCount') > 0) && record.get('nodeOrderType') === 'RCV'),
            required: record.get('nodeOrderType') === 'RCV',
          };
        },
      },
      {
        type: 'string',
        compType: 'Select',
        name: 'nodeOrderType',
        lookupCode: 'SINV.RCV_NODE_ORDER_TYPE',
        label: intl.get('sinv.receiptManage.model.receipt.nodeOrderType').d('单据类型'),
        custHidden: workFlag, // 自定义隐藏标识 true 自动过滤当前字段
        dynamicProps: ({ record }) => {
          return {
            disabled: !(!(record.get('trxLineCount') > 0) && record.get('nodeOrderType') === 'RCV'),
            required: record.get('nodeOrderType') === 'RCV',
          };
        },
      },
      {
        type: 'intl',
        compType: 'IntlField',
        name: 'nodeConfigName',
        label: intl.get('sinv.receiptManage.model.receipt.nodeConfigName').d('业务流程节点'),
        dynamicProps: ({ record }) => {
          return {
            disabled: !(!(record.get('trxLineCount') > 0) && record.get('nodeOrderType') === 'RCV'),
            required: record.get('nodeOrderType') === 'RCV',
          };
        },
      },
      {
        type: 'object',
        compType: 'Lov',
        ignore: 'always',
        name: 'nodeCodeRuleLov',
        lovCode: 'SPUC.SINV.CODE.RULE',
        label: intl.get('sinv.receiptManage.model.receipt.nodeCodeRule').d('单号编码规则'),
        lovPara: {
          tenantId: organizationId,
        },
        dynamicProps: ({ record }) => {
          return {
            disabled: !(!(record.get('trxLineCount') > 0) && record.get('nodeOrderType') === 'RCV'),
            required: record.get('nodeOrderType') === 'RCV',
          };
        },
      },
      {
        name: 'nodeCodeRule',
        type: 'string',
        bind: 'nodeCodeRuleLov.ruleCode',
        custHidden: true, // 自定义隐藏标识 true 自动过滤当前字段
      },
      {
        name: 'nodeCodeRuleMeaning',
        type: 'string',
        bind: 'nodeCodeRuleLov.ruleName',
        custHidden: true, // 自定义隐藏标识 true 自动过滤当前字段
      },
      {
        type: 'object',
        compType: 'Lov',
        name: 'refRcvTypeCodeLov',
        lovCode: 'SINV.RECEIVE_TRX_TYPE_NEW',
        label: intl
          .get('sinv.receiptManage.model.receipt.receiptRcvTrxTypCode')
          .d('平台收货类型编码'),
        lovPara: {
          tenantId: organizationId,
        },
        dynamicProps: ({ record }) => {
          return {
            disabled: !(!(record.get('trxLineCount') > 0) && record.get('nodeOrderType') === 'RCV'),
            required: record.get('nodeOrderType') === 'RCV',
          };
        },
      },
      {
        name: 'refRcvTypeCode',
        type: 'string',
        bind: 'refRcvTypeCodeLov.rcvTrxTypeCode',
        custHidden: true, // 自定义隐藏标识 true 自动过滤当前字段
      },
      {
        name: 'refRcvTypeId',
        type: 'string',
        bind: 'refRcvTypeCodeLov.rcvTrxTypeId',
        custHidden: true, // 自定义隐藏标识 true 自动过滤当前字段
      },
      {
        name: 'rcvTypeName',
        type: 'string',
        compType: 'TextField',
        label: intl.get('sinv.receiptManage.model.receipt.receiptRcvName').d('平台收货类型描述'),
        bind: 'refRcvTypeCodeLov.rcvTrxTypeName',
        dynamicProps: ({ record }) => {
          return {
            disabled: !(!(record.get('trxLineCount') > 0) && record.get('nodeOrderType') === 'RCV'),
            required: record.get('nodeOrderType') === 'RCV',
          };
        },
      },
      {
        type: 'string',
        compType: 'Select',
        name: 'nodeConfigIndexAbc',
        lovCode: 'SINV.ECV_NODE_ABC',
        label: intl.get('sinv.receiptManage.model.receipt.nodeConfigIndexAbc').d('关联个性化单元'),
        dynamicProps: ({ record }) => {
          const flag = workFlag ? true : record.get('nodeOrderType') === 'RCV';
          return {
            required: flag,
          };
        },
        // transformRequest: (value) => value && value.value,
        // transformResponse: (value) =>
        // value
        //   ? {
        //       nodeConfigIndexAbc: value,
        //     }
        //   : null,
      },
    ];
   const reverseCreateFormParams = [
    {
      name: 'strategyCode',
      type: 'string',
      compType: 'TextField',
      label: intl.get('sinv.receiptManage.model.receipt.strategyCode').d('策略编号'),
      required: true,
    },
    {
      name: 'strategyName',
      type: 'intl',
      compType: 'IntlField',
      label: intl.get('sinv.receiptManage.model.receipt.strategyName').d('策略名称'),
      required: true,
    },
    {
      name: 'sourceOrderType', // sourceOrderTypeMeaning
      type: 'string',
      compType: 'Select',
      label: intl.get('sinv.receiptManage.model.receipt.sourceOrderType').d('单据来源'),
      dynamicProps: () => {
        return {
          required: true,
          lookupCode:
            workFlag
              ? 'SINV.RCV_SOURCE_ORDER_TYPE_SLOD'
              : 'SINV.RCV_SOURCE_ORDER_TYPE',
        };
      },
    },
    // {
    //   name: 'enabledFlag',
    //   type: 'string',
    //   compType: 'Select',
    //   label: intl.get('sinv.receiptManage.model.receipt.yesNoenabledFlag').d('启用'),
    //   lookupCode: 'HPFM.FLAG',
    //   required: true,
    // },
    {
      name: 'scheduledDeliveryFlag',
      type: 'string',
      compType: 'Select',
      label: intl.get('sinv.receiptManage.model.receipt.scheduledDeliveryes').d('按计划排程送货'),
      lookupCode: 'HPFM.FLAG',
      defaultValue: '0',
      custHidden: workFlag, // 自定义隐藏标识 true 自动过滤当前字段
      dynamicProps: ({ record }) => {
        return {
          disabled: !(record.get('scheduledDeliveryEditFlag') === 1),
        };
      },
    },
  ];
   return {nodeCreateFormParams, reverseCreateFormParams};
};

/**
 * 行信息 - function
 * @delivery {*} params
 * return arr
 */
 function lineColumns(retRef, workFlag):any {
    const delivery = [
      {
        width: 230,
        type: 'string',
        name: 'externalSystemCode',
        label: intl.get('sinv.receiptManage.model.receipt.receiptSystemCode').d('来源系统代码'),
        defaultValue: 'SRM',
        editor: (record) => !(record.get('trxLineCount') > 0),
        help: intl
          .get('sinv.receiptManage.model.receipt.receiptSystemCodeHelp')
          .d(
            '默认SRM系统，若为外部系统，请按照接口给出的外部系统编码进行修改维护（SRM收货只可选到代码为“SRM”的数据）'
          ),
      },
      {
        width: 230,
        type: 'string',
        name: 'rcvTypeCode',
        label: intl.get('sinv.receiptManage.model.receipt.receiptRcvTypeCode').d('收货类型编码'),
        required: true,
        editor: (record) => !(record.get('trxLineCount') > 0),
      },
      {
        type: 'intl',
        name: 'rcvTypeName',
        label: intl.get('sinv.receiptManage.model.receipt.receiptRcvTypeName').d('收货类型描述'),
        required: true,
        editor: true,
      },
      {
        width: 230,
        type: 'attachment',
        name: 'attachmentUuid',
        help: intl
          .get('sinv.receiptManage.model.receipt.attachmentUuidCodehelp')
          .d('收货单选择对应收货类型后可进行模板附件下载'),
        label: intl.get('sinv.receiptManage.model.receipt.attachmentUuidCode').d('附件模板'),
        editor: true,
        bucketName: PRIVATE_BUCKET,
      },
    ];
    const returned = [
      {
        editor: true,
        type: 'object',
        name: 'reverseNodeConfigLov',
        label: intl.get('sinv.receiptManage.model.receipt.reversalNodes').d('退货节点'),
        required: true,
        ignore: 'always',
        lovCode: 'SINV.NODE_CONFIG_PRE',
        lovPara: {
          tenantId: organizationId,
        },
      },
      {
        name: 'reverseNodeConfigId',
        type: 'string',
        bind: 'reverseNodeConfigLov.nodeConfigId',
        custHidden: true, // 自定义隐藏标识 true 自动过滤当前字段
      },
      {
        name: 'reverseNodeConfigName',
        type: 'string',
        bind: 'reverseNodeConfigLov.nodeConfigName',
        custHidden: true, // 自定义隐藏标识 true 自动过滤当前字段
      },
      {
        editor: true,
        required: true,
        type: 'object',
        ignore: 'always',
        name: 'refRcvTypeCodeLov',
        label: intl
          .get('sinv.receiptManage.model.receipt.receipReturnTypCodes')
          .d('平台退货类型编码'),
        lovCode: 'SINV.RECEIVE_TRX_TYPE_NEW',
        lovPara: {
          tenantId: organizationId,
        },
        help: intl
          .get('sinv.receiptManage.model.receipt.receipReturnTypCodeHelp')
          .d(
            '单据不显示此类型，仅用于系统判断是否需将退货数据匹配到订单/送货单；请在【租户退货类型】中维护明细用于单据展示或者体现业务数据分类'
          ),
      },
      {
        name: 'rcvTypeCode',
        type: 'string',
        bind: 'refRcvTypeCodeLov.rcvTrxTypeCode',
        custHidden: true, // 自定义隐藏标识 true 自动过滤当前字段
      },
      {
        name: 'refRcvTypeId',
        type: 'string',
        bind: 'refRcvTypeCodeLov.rcvTrxTypeId',
        custHidden: true, // 自定义隐藏标识 true 自动过滤当前字段
      },
      {
        type: 'string',
        name: 'rcvTypeName',
        label: intl.get('sinv.receiptManage.model.receipt.receiptRcvNames').d('平台退货类型描述'),
        bind: 'refRcvTypeCodeLov.rcvTrxTypeName',
        // custHidden: true, // 自定义隐藏标识 true 自动过滤当前字段
      },
      {
        type: 'string',
        name: 'associateExternalSystemCode',
        label: intl.get('sinv.receiptManage.model.receipt.assReturnTypes').d('退货类型'),
        help: intl
          .get('sinv.receiptManage.model.receipt.receipReturnTypeHelp')
          .d(
            '支持维护不同系统来源的退货类型编码及描述，如果没有退货，则无需维护，如有，则至少维护一个退货类型'
        ),
        renderer: ({ record }) => {
          const _obj = record.get(['reverseConfigId', 'nodeConfigId']);
          if (_obj.reverseConfigId) {
            return (
              <a onClick={() => salesReturn({..._obj, retRef, workFlag})}>
                {intl.get('sinv.receiptManage.model.receipt.ReturnTypesMaintain').d('退货类型维护')}
              </a>
            );
          } else {
            return '-';
          }
        },
      },
    ];


   // 收货查询
   const nodeFetchList = (data) => {
    const { params = {} } = data;
    const { nodeConfigId, ...other } = params;
    return {
      url: `${SRM_SPUC}/v1/${organizationId}/rcv-ext-mappings/${nodeConfigId}`,
      method: 'GET',
      data: other,
    };
   };

   // 收货events
   const nodeLoad = (dataSet) => {
     dataSet.forEach((record) => {
       if (record.get('trxLineCount') > 0) {
         Object.assign(record, { selectable: false });
       }
     });
   };

   // 退货查询
   const returnFetchList = (data) => {
    const { params = {} } = data;
      const { nodeConfigId, ...other } = params;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/rcv-reverse-configs/${nodeConfigId}`,
        method: 'GET',
        data: other,
      };
   };
   return { delivery, returned, nodeLoad, nodeFetchList, returnFetchList };
  };

export { formColumns, lineColumns };