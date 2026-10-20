/**
 * riskAssessment -风险评估报告 查询页
 * @date: 2019-12-3
 * @author guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Row, Col, Input, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isNil } from 'lodash';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const commonPrompt = 'hzero.common';
const promptCode = 'sfin.paymentRecord';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  state = {
    display: false,
  };

  componentDidMount() {
    const { bindForm, form } = this.props;
    bindForm(form);
  }

  /**
   * 收起打开
   */
  @Bind()
  toggleForm() {
    this.setState((prevState) => ({
      display: !prevState.display,
    }));
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { handleSearch, form, customizeFilterForm } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue, registerField } = form;
    const { display } = this.state;
    const dateFormat = getDateFormat();
    return customizeFilterForm(
      {
        form,
        code: 'SFIN.COLLECTION_RECORD.LIST_FILTER_FORM',
        expand: display,
      },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`${promptCode}.view.message.model.erpReceivedPayNum`)
                    .d('ERP收款单号')}
                >
                  {getFieldDecorator('erpPaymentNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SFIN.USER_AUTH.COMPANY_FOR_SUPPLIER"
                      textField="displayValue"
                      // queryParams={{ tenantId }}
                      // lovOptions={{
                      //   valueField: 'supplierCompanyId',
                      //   displayField: 'supplierCompanyName',
                      // }}
                      onChange={(_, record) => {
                        const { supplierId } = record;
                        registerField('supplierId');
                        setFieldsValue({
                          supplierId,
                        });
                      }}
                      onOk={(record) => {
                        const { companyId } = record;
                        setFieldsValue({
                          supplierCompanyId: isNil(companyId) ? '' : companyId,
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`sfin.invoiceBill.model.invoiceBill.customer`).d('客户')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPCM.USER_AUTH.CUSTOMER"
                      queryParams={{ organizationId }}
                      lovOptions={{
                        valueField: 'companyId',
                        displayField: 'companyName',
                      }}
                      style={{ width: '100%' }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12} style={{ display: display ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`sfin.invoiceBill.model.invoiceBill.erpInvoiceNum`)
                    .d('ERP发票号')}
                >
                  {getFieldDecorator('erpInvoiceNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`sfin.payment.invoiceNum`).d('SRM发票号')}
                >
                  {getFieldDecorator('srmInvoiceNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`sfin.payment.paymentNumSupplier`).d('SRM收款申请号')}
                >
                  {getFieldDecorator('paymentNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12} style={{ display: display ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`sfin.payment.common.receiveDateFrom`).d('收款日期从')}
                >
                  {getFieldDecorator('paymentDateFrom')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('paymentDateTo') &&
                        moment(getFieldValue('paymentDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`sfin.payment.common.receiveDateTo`).d('收款日期至')}
                >
                  {getFieldDecorator('paymentDateTo')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('paymentDateFrom') &&
                        moment(getFieldValue('paymentDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {display
                  ? intl.get(`${commonPrompt}.button.collected`).d('收起查询')
                  : intl.get(`${commonPrompt}.button.viewMore`).d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get(`${commonPrompt}.button.reset`).d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={() => handleSearch(form)}>
                {intl.get(`${commonPrompt}.button.search`).d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
