import React, { useMemo } from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { returnDS } from './store/lineDS';

const organizationId = getCurrentOrganizationId();

/**
 * 头信息- function
 * @nodeCreateFormParams {*} 编辑
 * @nodereadOnlyFormParams {*} 只读
 * return arr
 */
const formColumns = ({ readOnly = false }) => {
  const nodeCreateFormParams = [
    {
      type: 'intl',
      compType: readOnly ? 'Output' : 'IntlField',
      name: 'nodeConfigName',
      label: intl.get('sinv.receiptManage.model.receipt.nodeConfigName').d('业务流程节点'),
      dynamicProps: ({ record }) => {
        return {
          disabled: record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN',
          required: !(
            record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN'
          ),
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
          disabled: record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN',
          required: !(
            record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN'
          ),
        };
      },
    },
    {
      name: 'nodeCodeRule',
      type: 'string',
      bind: 'nodeCodeRuleLov.ruleCode',
      customParam: true, // 自定义判断是否为bind 绑定参数
    },
    {
      name: 'nodeCodeRuleMeaning',
      type: 'string',
      bind: 'nodeCodeRuleLov.ruleName',
      customParam: true, // 自定义判断是否为bind 绑定参数
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
          disabled: record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN',
          required: !(
            record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN'
          ),
        };
      },
    },
    {
      name: 'refRcvTypeCode',
      type: 'string',
      bind: 'refRcvTypeCodeLov.rcvTrxTypeCode',
      customParam: true, // 自定义判断是否为bind 绑定参数
    },
    {
      name: 'refRcvTypeId',
      type: 'string',
      bind: 'refRcvTypeCodeLov.rcvTrxTypeId',
      customParam: true, // 自定义判断是否为bind 绑定参数
    },
    {
      type: 'string',
      compType: 'Select',
      name: 'nodeOrderType',
      lookupCode: 'SINV.RCV_NODE_ORDER_TYPE',
      label: intl.get('sinv.receiptManage.model.receipt.nodeOrderType').d('单据类型'),
      dynamicProps: ({ record }) => {
        return {
          disabled: record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN',
          required: !(
            record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN'
          ),
        };
      },
    },
    {
      type: 'number',
      name: 'nodeConfigCode',
      compType: 'NumberField',
      label: intl.get('sinv.receiptManage.model.receipt.lineSeq').d('节点顺序'),
      dynamicProps: ({ record }) => {
        return {
          disabled: record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN',
          required: !(
            record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN'
          ),
        };
      },
    },
  ];
  const nodereadOnlyFormParams = [
    {
      type: 'intl',
      compType: 'Output',
      name: 'nodeConfigName',
      label: intl.get('sinv.receiptManage.model.receipt.nodeConfigName').d('业务流程节点'),
      dynamicProps: ({ record }) => {
        return {
          disabled: record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN',
          required: !(
            record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN'
          ),
        };
      },
    },
    {
      type: 'string',
      compType: 'Output',
      name: 'nodeCodeRuleMeaning',
      label: intl.get('sinv.receiptManage.model.receipt.nodeCodeRule').d('单号编码规则'),
    },
    {
      type: 'string',
      compType: 'Output',
      name: 'refRcvTypeCodeLov',
      label: intl
        .get('sinv.receiptManage.model.receipt.receiptRcvTrxTypCode')
        .d('平台收货类型编码'),
    },
    {
      type: 'string',
      compType: 'Output',
      name: 'nodeOrderType',
      label: intl.get('sinv.receiptManage.model.receipt.nodeOrderType').d('单据类型'),
    },
    {
      type: 'number',
      name: 'nodeConfigCode',
      compType: 'Output',
      label: intl.get('sinv.receiptManage.model.receipt.lineSeq').d('节点顺序'),
    },
  ];
  if (readOnly) return nodereadOnlyFormParams;
  if (!readOnly) return nodeCreateFormParams;
};

/**
 * 行信息 - function
 * @delivery {*} params
 * return arr
 */
const lineColumns = (type = 'node') => {
  const delivery = [
    {
      name: 'externalSystemCode',
      width: 260,
      editor: (record) => !(record.get('trxLineCount') > 0),
    },
    {
      name: 'rcvTypeCode',
      width: 260,
      editor: (record) => !(record.get('trxLineCount') > 0),
    },
    {
      name: 'rcvTypeName',
      editor: true,
      width: 260,
    },
    {
      name: 'attachmentUuid',
      editor: false,
    },
  ];
  const returned = [
    {
      name: 'reverseNodeConfigLov',
      width: 260,
      editor: true,
    },
    {
      name: 'refRcvTypeCodeLov',
      width: 260,
      help: intl
        .get('sinv.receiptManage.model.receipt.receipReturnTypCodeHelp')
        .d(
          '单据不显示此类型，仅用于系统判断是否需将退货数据匹配到订单/送货单；请在【租户退货类型】中维护明细用于单据展示或者体现业务数据分类'
        ),
      editor: true,
    },
    {
      name: 'rcvTypeName',
      width: 260,
    },
    {
      name: 'associateExternalSystemCode',
      // width: 200,
      help: intl
        .get('sinv.receiptManage.model.receipt.receipReturnTypeHelp')
        .d(
          '支持维护不同系统来源的退货类型编码及描述，如果没有退货，则无需维护，如有，则至少维护一个退货类型'
        ),
      renderer: ({ record }) =>
        record.get('reverseConfigId') ? (
          <a onClick={() => openSysCodeModal(record, false)}>
            {intl.get('sinv.receiptManage.model.receipt.maintain').d('维护')}
          </a>
        ) : null,
    },
  ];
  if (type === 'node') return delivery;
  if (type === 'return') return returned;
};

/**
 * 行 类型俄维护弹框- function
 * @delivery {*} params
 * return
 */
const openSysCodeModal = () => {
  const columns = [
    {
      name: 'externalSystemCode',
      width: 160,
      editor: (record) => !(record.get('trxLineCount') > 0),
    },
    {
      name: 'rcvTypeCode',
      width: 160,
      editor: (record) => !(record.get('trxLineCount') > 0),
    },
    {
      name: 'rcvTypeName',
      editor: true,
    },
    {
      name: 'attachmentUuid',
      editor: false,
      // renderer: ({ record }) => {
      //   const uploadModalProps = {
      //     showFilesNumber: false,
      //     icon: false,
      //     attachmentUUID: record.get('attachmentUuid'),
      //     bucketName: 'private-bucket',
      //     bucketDirectory: 'sodr-order',
      //     afterOpenUploadModal: (attUuid) => {
      //       record.set('attachmentUuid', attUuid);
      //     },
      //   };
      //   return <UploadModal {...uploadModalProps} />;
      // },
    },
  ];
  const ds = useMemo(() => new DataSet(returnDS()), []);
  Modal.open({
    mask: true,
    drawer: true,
    closable: true,
    style: { width: '852px' },
    children: <Table columns={columns} dataSet={ds} />,
    title: intl.get('sinv.receiptManage.model.receipt.returnTypeFix').d('退货类型维护'),
    okText: intl.get(`hzero.common.model.sure`).d('确定'),
    cancelText: intl.get('hzero.common.button.cancel').d('取消'),
    onOk: () => {},
  });
};

export { formColumns, lineColumns };
