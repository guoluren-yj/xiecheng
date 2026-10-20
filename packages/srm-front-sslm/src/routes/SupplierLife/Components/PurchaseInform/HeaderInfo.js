import React, { Component } from 'react';
import { Form, Row, Col, Select, Input } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import { getCurrentOrganizationId } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';

const FormItem = Form.Item;
const { Option } = Select;
const tenantId = getCurrentOrganizationId();
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class HeaderInfo extends Component {
  componentDidMount() {
    const { onRef, form } = this.props;
    onRef(form);
  }

  render() {
    const {
      isEdit,
      planGroups,
      custLoading,
      dimensionCode,
      customizeForm,
      purchaseHeadInfo = {},
      paymentFrozenList,
      form: { getFieldDecorator },
    } = this.props;
    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_HEADER',
        form: this.props.form,
        dataSource: purchaseHeadInfo,
      },
      <Form className="ued-edit-form" custLoading={custLoading} style={{ marginLeft: 16 }}>
        <Row gutter={24} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('spfm.importErp.model.importErp.planGroups').d('计划组')}
            >
              {getFieldDecorator('programmeGroups', {
                initialValue: purchaseHeadInfo.programmeGroups,
              })(
                isEdit ? (
                  <Select allowClear style={{ width: '100%' }}>
                    {planGroups.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                  </Select>
                ) : (
                  <span>{purchaseHeadInfo.programmeGroupsMeaning}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierInform.model.supplierInform.schemeGroup').d('方案组')}
            >
              {getFieldDecorator('schemeGroup', {
                initialValue: purchaseHeadInfo.schemeGroup,
              })(isEdit ? <Input /> : <span>{purchaseHeadInfo.schemeGroup}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierInform.model.supplierInform.accountGroup').d('账户组')}
            >
              {getFieldDecorator('accountGroup', {
                initialValue: purchaseHeadInfo.accountGroup,
              })(
                isEdit ? (
                  <Lov
                    code="SSLM.SYNC_ACCOUNT_GROUP"
                    queryParams={{ tenantId }}
                    lovOptions={{
                      displayField: 'meaning',
                      valueField: 'value',
                    }}
                    textValue={purchaseHeadInfo.accountGroupMeaning}
                  />
                ) : (
                  <span>{purchaseHeadInfo.accountGroupMeaning}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.supplierInform.model.supplierInform.controlAccount')
                .d('统驭科目')}
            >
              {getFieldDecorator('reconciliationAccount', {
                initialValue: purchaseHeadInfo.reconciliationAccount,
              })(
                isEdit ? (
                  <Lov
                    code="SSLM.RECONCILIATION_ACCOUNT"
                    queryParams={{ tenantId }}
                    lovOptions={{
                      displayField: 'meaning',
                      valueField: 'value',
                    }}
                    textValue={purchaseHeadInfo.reconciliationAccountMeaning}
                  />
                ) : (
                  <span>{purchaseHeadInfo.reconciliationAccountMeaning}</span>
                )
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
                initialValue: purchaseHeadInfo.ouId,
              })(
                isEdit ? (
                  <Lov
                    code="SPFM.USER_AUTH.OU_CODE"
                    lovOptions={{
                      displayField: 'ouCode',
                      valueField: 'ouId',
                    }}
                    textValue={purchaseHeadInfo.ouCode}
                  />
                ) : (
                  <span>{purchaseHeadInfo.ouCode}</span>
                )
              )}
              {dimensionCode === 'GROUP' && isEdit && (
                <div style={{ fontSize: '12px', color: '#999', marginLeft: '-60%' }}>
                  {intl
                    .get('sslm.supplierInform.model.supplierInform.interMessage')
                    .d('变更后此ERP公司代码将更新至集团下所有公司。')}
                </div>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('spfm.importErp.model.importErp.termName').d('付款条款')}
            >
              {getFieldDecorator('termId', {
                initialValue: purchaseHeadInfo.termId,
              })(
                isEdit ? (
                  <Lov
                    code="SMDM.PAYMENT.TERM"
                    queryParams={{ tenantId }}
                    lovOptions={{
                      displayField: 'termName',
                      valueField: 'termId',
                    }}
                    textValue={purchaseHeadInfo.termName}
                  />
                ) : (
                  <span>{purchaseHeadInfo.termName}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierInform.model.supplierInform.accountFlag').d('记账冻结')}
            >
              {getFieldDecorator('frozenFlag', {
                initialValue: purchaseHeadInfo.frozenFlag || 0,
              })(isEdit ? <Checkbox /> : yesOrNoRender(purchaseHeadInfo.frozenFlag))}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('spfm.importErp.model.importErp.paymentFreezeCode').d('付款冻结代码')}
            >
              {getFieldDecorator('paymentFrozen', {
                initialValue: purchaseHeadInfo.paymentFrozen,
              })(
                isEdit ? (
                  <Select allowClear style={{ width: '100%' }}>
                    {paymentFrozenList.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                  </Select>
                ) : (
                  <span>{purchaseHeadInfo.paymentFrozenMeaning}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
