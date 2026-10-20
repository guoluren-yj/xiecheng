import React from 'react';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { AFBasic, AFExtra } from 'srm-front-boot/lib/components/AFCards';
import DataSet from 'choerodon-ui/dataset';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';

export default class App extends React.Component {
  ds = new DataSet({
    data: [
      {
        rfxTitle: 'xxx公司询价单',
        rfxNum: 'RFX2022092300009',
        rfxType: '邀请',
        quotationRound: 2,
        currencyType: 'RMB',
        quoDirection: '越来越低',
        purchaseAgentCode: {
          purchaseAgentCode: '0001',
          purchaseAgentId: 5895,
          purchaseAgentName: '0001/订单',
        },
        department: '产品部',
        payment: '支付宝',
        remark: '',
      },
    ],
    fields: [
      { name: 'quotationRound', label: '多轮报价' },
      {
        name: 'purchaseAgentCode',
        label: '采购员',
        type: FieldType.object,
        lovCode: 'SPFM.PURCHASE_AGENT_CODE',
      },
      { name: 'department', label: '部门' },
      { name: 'payment', label: '付款方式' },
      { name: 'remark', label: '核价备注' },
    ],
  });

  ds2 = new DataSet({
    data: [
      {
        checkPrice: 2000000,
        budgetPercent: 5,
        budgetAmount: 2200000,
        subjectMatterCount: 20,
        subjectNum: 8,
        quotationNum: 11,
        supplierNum: 12,
      },
    ],
    fields: [
      { name: 'checkPrice', label: '核价总金额' },
      { name: 'budgetPercent', label: '预算百分比', type: FieldType.number },
      { name: 'budgetAmount', label: '预算', type: FieldType.number },
      { name: 'subjectMatterCount', label: '标的数' },
      { name: 'subjectNum', label: '中标' },
      { name: 'quotationNum', label: '报价' },
      { name: 'supplierNum', label: '供应商' },
    ],
  });

  fieldsConfig = {
    quotationRound: {
      useLabel: true,
    },
    rfxNum: {
      useLabel: false,
    },
  };

  fieldsConfig2 = {
    checkPrice: {
      renderValue({ value, record }) {
        const percent = record && record.get('budgetPercent');
        return (
          <>
            <span style={{ marginRight: '8px' }}>{value}</span>
            {percent && <span style={{ fontSize: '10px' }}>↑{percent}%</span>}
          </>
        );
      },
    },
    fieldGroup1: {
      aggregation: true,
      aggregationFields: ['subjectNum', 'quotationNum', 'quotationNum', 'supplierNum'],
      aggregationTitleRender({ node }) {
        return <>{node}</>;
      },
    },
  };

  render() {
    return (
      <>
        <Header>aaa</Header>
        <AFBasic
          dataSet={this.ds}
          titleField="rfxTitle"
          normalFields={['rfxNum', 'purchaseAgentCode', 'department', 'payment', 'remark']}
          fieldsConfig={this.fieldsConfig}
          maxTagCount={3}
        />
        <AFExtra
          dataSet={this.ds2}
          fields={[
            'checkPrice',
            'budgetAmount',
            'budgetAmount',
            'subjectMatterCount',
            'fieldGroup1',
          ]}
          fieldsConfig={this.fieldsConfig2}
        />
        <Content>123</Content>
      </>
    );
  }
}
