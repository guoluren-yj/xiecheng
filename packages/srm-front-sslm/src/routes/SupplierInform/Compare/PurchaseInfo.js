/**
 * PurchaseInfo - 采购／财务信息
 * @date: 2021-04-01
 * @author: xiaomei.lv <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import { sum, isNumber, head } from 'lodash';
import React, { Component, Fragment } from 'react';
import { Row, Col, Table, Form } from 'hzero-ui';

import intl from 'utils/intl';
import { formatYesOrNo } from '@/routes/components/utils';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class PurchaseInfo extends Component {
  render() {
    const {
      formData,
      dataSource,
      customizeForm = () => {},
      customizeTable = () => {},
      form: { getFieldDecorator },
    } = this.props;
    const headerInfo = head(formData) || {};
    const columns = [
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.organizationCode').d('采购组织'),
        dataIndex: 'organizationCode',
        width: 100,
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.purchaseOrgIdStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {val}
            </div>
          );
        },
      },
      {
        title: intl
          .get('sslm.supplierInform.model.supplierInform.organizationName')
          .d('采购组织名称'),
        width: 150,
        dataIndex: 'organizationName',
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.purchaseOrgIdStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {val}
            </div>
          );
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.termName').d('付款条件'),
        dataIndex: 'termName',
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.termIdStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {val}
            </div>
          );
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.payMethod').d('付款方式'),
        width: 160,
        dataIndex: 'typeName',
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.typeCodeStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {val}
            </div>
          );
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.internationalCondition').d('国贸条件'),
        width: 160,
        dataIndex: 'tradeTermsMeaning',
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.tradeTermsStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {val}
            </div>
          );
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.internationalSite').d('国贸地点'),
        width: 160,
        dataIndex: 'tradeTermsSite',
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.tradeTermsSiteStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {val}
            </div>
          );
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.currencyCode').d('订单货币'),
        dataIndex: 'currencyName',
        width: 150,
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.currencyCodeStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {val}
            </div>
          );
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.controlAccount').d('统驭科目'),
        width: 150,
        dataIndex: 'reconciliationAccount',
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.sortNumber').d('排序码'),
        dataIndex: 'sortNumber',
        width: 100,
      },
      {
        title: intl.get('sslm.supplierInform.model.purchase.frozenFlag').d('采购冻结'),
        dataIndex: 'frozenFlag',
        width: 100,
        render: (val, record) => {
          return (
            <div
              style={{
                color:
                  (['update', 'insert', 'delete'].includes(record.frozenFlagStateFlag) ||
                    ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                  'red',
              }}
            >
              {formatYesOrNo(val)}
            </div>
          );
        },
      },
    ].map(n => ({
      render: (val, record) => {
        return (
          <div
            style={{
              color:
                (['update', 'insert', 'delete'].includes(record[`${n.dataIndex}StateFlag`]) ||
                  ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                'red',
            }}
          >
            {val}
          </div>
        );
      },
      ...n,
    }));
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    return (
      <Fragment>
        {customizeForm(
          {
            code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.PURCHASE_HEAD',
            form: this.props.form,
            dataSource: headerInfo,
            readOnly: true,
          },
          <Form className="ued-edit-form">
            <Row gutter={48} className="read-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.importErp.model.importErp.planGroups').d('计划组')}
                >
                  {getFieldDecorator('programmeGroups', {
                    initialValue: headerInfo.programmeGroups,
                  })(
                    <span
                      style={{
                        color:
                          ['update', 'insert', 'delete'].includes(
                            headerInfo.programmeGroupsStateFlag
                          ) && 'red',
                      }}
                    >
                      {headerInfo.programmeGroupsMeaning}
                    </span>
                  )}
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
                    initialValue: headerInfo.schemeGroup,
                  })(
                    <span
                      style={{
                        color:
                          ['update', 'insert', 'delete'].includes(
                            headerInfo.schemeGroupStateFlag
                          ) && 'red',
                      }}
                    >
                      {headerInfo.schemeGroup}
                    </span>
                  )}
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
                    initialValue: headerInfo.accountGroup,
                  })(
                    <span
                      style={{
                        color:
                          ['update', 'insert', 'delete'].includes(
                            headerInfo.accountGroupStateFlag
                          ) && 'red',
                      }}
                    >
                      {headerInfo.accountGroupMeaning}
                    </span>
                  )}
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
                    initialValue: headerInfo.reconciliationAccount,
                  })(
                    <span
                      style={{
                        color:
                          ['update', 'insert', 'delete'].includes(
                            headerInfo.reconciliationAccountStateFlag
                          ) && 'red',
                      }}
                    >
                      {headerInfo.reconciliationAccountMeaning}
                    </span>
                  )}
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
                    initialValue: headerInfo.ouId,
                  })(
                    <span
                      style={{
                        color:
                          ['update', 'insert', 'delete'].includes(headerInfo.ouIdStateFlag) &&
                          'red',
                      }}
                    >
                      {headerInfo.ouCode}
                    </span>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.importErp.model.importErp.termName').d('付款条件')}
                >
                  {getFieldDecorator('termId', {
                    initialValue: headerInfo.termId,
                  })(
                    <span
                      style={{
                        color:
                          ['update', 'insert', 'delete'].includes(headerInfo.termIdStateFlag) &&
                          'red',
                      }}
                    >
                      {headerInfo.termName}
                    </span>
                  )}
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
                    initialValue: headerInfo.frozenFlag,
                  })(
                    <span
                      style={{
                        color:
                          ['update', 'insert', 'delete'].includes(headerInfo.frozenFlagStateFlag) &&
                          'red',
                      }}
                    >
                      {formatYesOrNo(headerInfo.frozenFlag)}
                    </span>
                  )}
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
                    initialValue: headerInfo.paymentFrozen,
                  })(
                    <span
                      style={{
                        color:
                          ['update', 'insert', 'delete'].includes(
                            headerInfo.paymentFrozenStateFlag
                          ) && 'red',
                      }}
                    >
                      {headerInfo.paymentFrozenMeaning}
                    </span>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
        {customizeTable(
          {
            code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.PURCHASE_INFO',
          },
          <Table
            bordered
            rowKey="prLineId"
            pagination={false}
            dataSource={dataSource}
            columns={columns}
            scroll={{ x: scrollX }}
          />
        )}
      </Fragment>
    );
  }
}
