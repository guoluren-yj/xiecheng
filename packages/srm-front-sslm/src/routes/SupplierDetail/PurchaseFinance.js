/*
 * PurchaseFinance - 采购财务信息
 * @Date: 2022-07-04 12:46:23
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Table } from 'hzero-ui';
import { sum, isNumber } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

export default class PurchaseFinance extends Component {
  render() {
    const {
      form,
      customizeForm,
      customizeTable,
      form: { getFieldDecorator },
      purchaseFormList,
      purchaseList = [],
      purchaseListPagination = {},
      queryPurchaseList = () => {},
    } = this.props;

    const purchaseColumns = [
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.organizationCode').d('采购组织'),
        dataIndex: 'organizationCode',
        width: 120,
      },
      {
        title: intl
          .get('sslm.supplierInform.model.supplierInform.organizationName')
          .d('采购组织名称'),
        width: 150,
        dataIndex: 'organizationName',
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.purchaseAgent').d('采购员'),
        width: 150,
        dataIndex: 'purchaseAgentName',
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.termName').d('付款条款'),
        dataIndex: 'termName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.payMethod').d('付款方式'),
        width: 160,
        dataIndex: 'typeName',
      },
      {
        title: intl.get('spfm.importErp.model.importErp.internationalCondition').d('国贸条件'),
        width: 160,
        dataIndex: 'tradeTermsMeaning',
      },
      {
        title: intl.get('spfm.importErp.model.importErp.internationalSite').d('国贸地点'),
        width: 160,
        dataIndex: 'tradeTermsSite',
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.currencyCode').d('订单货币'),
        dataIndex: 'currencyName',
        width: 100,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.controlAccount').d('统驭科目'),
        dataIndex: 'reconciliationAccountMeaning',
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.sortNumber').d('排序码'),
        dataIndex: 'sortNumber',
        width: 100,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.frozenFlag').d('采购冻结'),
        dataIndex: 'frozenFlag',
        width: 120,
        render: val => {
          return yesOrNoRender(val);
        },
      },
    ];
    const purchaseScrollX = sum(purchaseColumns.map(n => (isNumber(n.width) ? n.width : 0)));
    return (
      <div id="purchaseList">
        {customizeForm(
          {
            code: 'SSLM.SUPPLIER_LIFE_CYCLE.PURCHASE_HEADER',
            form,
            dataSource: purchaseFormList,
          },
          <Form className="ued-edit-form">
            <Row gutter={48} className="read-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.importErp.model.importErp.planGroups').d('计划组')}
                >
                  {getFieldDecorator('programmeGroups', {
                    initialValue: purchaseFormList.programmeGroups,
                  })(<span>{purchaseFormList.programmeGroupsMeaning}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierInform.model.supplierInform.schemeGroup')
                    .d('方案组')}
                >
                  {getFieldDecorator('schemeGroup', {
                    initialValue: purchaseFormList.schemeGroup,
                  })(<span>{purchaseFormList.schemeGroup}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierInform.model.supplierInform.accountGroup')
                    .d('账户组')}
                >
                  {getFieldDecorator('accountGroup', {
                    initialValue: purchaseFormList.accountGroup,
                  })(<span>{purchaseFormList.accountGroupMeaning}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="read-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierInform.model.supplierInform.controlAccount')
                    .d('统驭科目')}
                >
                  {getFieldDecorator('reconciliationAccount', {
                    initialValue: purchaseFormList.reconciliationAccount,
                  })(<span>{purchaseFormList.reconciliationAccountMeaning}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierInform.model.supplierInform.erpCompanyCode')
                    .d('erp公司代码')}
                >
                  {getFieldDecorator('ouId', {
                    initialValue: purchaseFormList.ouId,
                  })(<span>{purchaseFormList.ouCode}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.importErp.model.importErp.termName').d('付款条款')}
                >
                  {getFieldDecorator('termId', {
                    initialValue: purchaseFormList.termId,
                  })(<span>{purchaseFormList.termName}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="read-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierInform.model.supplierInform.bookingFrozen')
                    .d('记账冻结')}
                >
                  {getFieldDecorator('frozenFlag', {
                    initialValue: purchaseFormList.frozenFlag,
                  })(<span>{yesOrNoRender(purchaseFormList.frozenFlag)}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('spfm.importErp.model.importErp.paymentFreezeCode')
                    .d('付款冻结代码')}
                >
                  {getFieldDecorator('paymentFrozen', {
                    initialValue: purchaseFormList.paymentFrozen,
                  })(<span>{purchaseFormList.paymentFrozenMeaning}</span>)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
        {customizeTable(
          {
            code: 'SSLM.SUPPLIER_LIFE_CYCLE.PURCHASE_INFO',
          },
          <Table
            rowKey="id"
            dataSource={purchaseList}
            columns={purchaseColumns}
            scroll={{ x: purchaseScrollX }}
            pagination={purchaseListPagination}
            onChange={page => queryPurchaseList(page)}
            bordered
          />
        )}
      </div>
    );
  }
}
