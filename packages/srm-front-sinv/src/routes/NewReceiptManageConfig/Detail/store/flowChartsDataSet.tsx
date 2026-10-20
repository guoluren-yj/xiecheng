


import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';


const organizationId = getCurrentOrganizationId();

const flowChartsDS = (): DataSetProps => ({
    primaryKey: 'nodeConfigId',
    paging: false,
    fields: [
        {
          name: 'nodeOrderType',
          type: FieldType.string,
          label: intl.get('sinv.receiptManage.model.receipt.nodeOrderType').d('单据类型'),
          required: true,
          lookupCode: 'SINV.RCV_NODE_ORDER_TYPE',
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
          required: true,
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
      ],
});

export { flowChartsDS };