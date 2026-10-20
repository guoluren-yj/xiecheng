

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';


const organizationId = getCurrentOrganizationId();

const nodeCreateDS = (workFlag, tabType): DataSetProps => ({
    paging: false,
    autoCreate: true,
    forceValidate: true,
    fields: fieldsList(workFlag, tabType),
    events: {},
});

const fieldsList = (workFlag, tabType): any => {
  const node = [
    {
      name: 'nodeOrderType',
      type: FieldType.string,
      label: intl.get('sinv.receiptManage.model.receipt.nodeOrderType').d('单据类型'),
      required: !workFlag,
      lookupCode: 'SINV.RCV_NODE_ORDER_TYPE',
      dynamicProps: () => {
        return {
          defaultValue: !workFlag ? 'RCV' : null,
        };
      },
    },
    {
      name: 'nodeConfigCode',
      type: FieldType.number,
      required: true,
      label: intl.get('sinv.receiptManage.model.receipt.lineSeq').d('节点顺序'),
    },
    {
      name: 'nodeConfigName',
      type: FieldType.intl,
      label: intl.get('sinv.receiptManage.model.receipt.nodeConfigName').d('业务流程节点'),
      required: true,
    },
    {
      name: 'nodeCodeRuleLov',
      type: FieldType.object,
      lovCode: 'SPUC.SINV.CODE.RULE',
      ignore: FieldIgnore.always,
      label: intl.get('sinv.receiptManage.model.receipt.nodeCodeRule').d('单号编码规则'),
      lovPara: {
        tenantId: organizationId,
      },
      dynamicProps: ({ record }) => {
        return {
          disabled: record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN',
        };
      },
    },
    {
      name: 'nodeCodeRule',
      type: FieldType.string,
      bind: 'nodeCodeRuleLov.ruleCode',
    },
    {
      name: 'nodeCodeRuleMeaning',
      type: FieldType.string,
      bind: 'nodeCodeRuleLov.ruleName',
    },
    {
      name: 'refRcvTypeCodeLov',
      type: FieldType.object,
      ignore: FieldIgnore.always,
      label: intl
        .get('sinv.receiptManage.model.receipt.receiptRcvTrxTypCode')
        .d('平台收货类型编码'),
      lovCode: 'SINV.RECEIVE_TRX_TYPE_NEW',
      lovPara: {
        tenantId: organizationId,
      },
      dynamicProps: ({ record }) => {
        const flag =
          record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN';
        return {
          disabled: flag,
          required: !flag,
        };
      },
    },
    {
      name: 'refRcvTypeCode',
      type: FieldType.string,
      bind: 'refRcvTypeCodeLov.rcvTrxTypeCode',
    },
    {
      name: 'refRcvTypeId',
      type: FieldType.string,
      bind: 'refRcvTypeCodeLov.rcvTrxTypeId',
    },
    {
      name: 'rcvTypeName',
      type: FieldType.string,
      label: intl.get('sinv.receiptManage.model.receipt.receiptRcvName').d('平台收货类型描述'),
      bind: 'refRcvTypeCodeLov.rcvTrxTypeName',
      disabled: true,
    },
    {
      name: 'nodeConfigIndexAbc',
      type: FieldType.string,
      lovCode: 'SINV.ECV_NODE_ABC',
      label: intl.get('sinv.receiptManage.model.receipt.nodeConfigIndexAbc').d('关联个性化单元'),
      dynamicProps: ({ record }) => {
        const flag = workFlag ? true: record.get('nodeOrderType') === 'RCV';
        return {
          required: flag,
        };
      },
    },
  ];
  const strategy = [
    {
      name: 'strategyCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.strategyCode').d('策略编号'),
      required: true,
    },
    {
      name: 'strategyName',
      type: 'intl',
      label: intl.get('sinv.receiptManage.model.receipt.strategyName').d('策略名称'),
      required: true,
    },
    {
      name: 'sourceOrderType',
      type: 'string',
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
    {
      name: 'scheduledDeliveryFlag',
      type: FieldType.string,
      label: intl.get('sinv.receiptManage.model.receipt.scheduledDeliveryesOrNo').d('是否按计划排程送货'),
      lookupCode: 'HPFM.FLAG',
      defaultValue: '0',
      disabled: true,
    },
    {
      name: 'enabledFlag',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.yesOrNoenabledFlag').d('是否启用'),
      lookupCode: 'HPFM.FLAG',
      required: true,
    },
  ];
  if (tabType === 'node') return node;
  if (tabType === 'strategy') return strategy;
};

export { nodeCreateDS };