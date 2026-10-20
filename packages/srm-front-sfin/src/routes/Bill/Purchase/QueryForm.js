/**
 * QueryForm - 我的采购账单 - 查询表单
 * @date: 2018-12-05
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, Select, DatePicker } from 'hzero-ui';
import { isNil } from 'lodash';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import LovMulti from '@/routes/components/MultipleLov';
/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
const { Option } = Select;

/**
 * 表单布局属性
 */
const formItemProps = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
  style: { width: '100%' },
};

/**
 * 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@withCustomize({
  unitCode: ['SFIN.BILL_PURCHASE_LIST.MORE_FILTER'],
})
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sfin/purchase-bill-noConsignment' })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      moreFieldsVisible: false, // 更多
    };
  }

  /**
   * 查询数据
   */
  @Bind()
  queryData() {
    const { onQueryNoConsignment } = this.props;
    if (onQueryNoConsignment) {
      onQueryNoConsignment();
    }
  }

  @Bind()
  handleFormReset() {
    const { onHandleFormReset, form } = this.props;
    if (onHandleFormReset) {
      onHandleFormReset();
    }
    form.resetFields();
  }

  /**
   * 更多条件查询滑窗显示
   *
   */
  @Bind()
  handleMoreFields() {
    const { moreFieldsVisible } = this.state;
    this.setState({ moreFieldsVisible: !moreFieldsVisible });
  }

  /**
   * 渲染查询结构
   * @returns
   */
  render() {
    const { form, codes, customizeFilterForm } = this.props;
    const { moreFieldsVisible } = this.state;

    const organizationId = getCurrentOrganizationId();

    const { getFieldDecorator, getFieldValue, setFieldsValue, registerField } = form;

    return customizeFilterForm(
      {
        code: 'SFIN.BILL_PURCHASE_LIST.MORE_FILTER',
        form,
        expand: moreFieldsVisible,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemProps}
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.billNum').d('开票单号')}
                >
                  {getFieldDecorator('displayBillNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemProps}
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.billNum').d('开票单号')}
                >
                  {getFieldDecorator('displayBillNumRightMatch')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemProps}
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.displayTrxNum').d('事务编号')}
                >
                  {getFieldDecorator('displayTrxNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemProps}
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.displayTrxNum').d('事务编号')}
                >
                  {getFieldDecorator('displayTrxNumRightMatch')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemProps}
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.displayPoNum').d('订单号')}
                >
                  {getFieldDecorator('displayPoNum')(
                    <Input inputChinese={false} style={{ width: '100%' }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: moreFieldsVisible ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...formItemProps}
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.material').d('物料')}
                >
                  {getFieldDecorator('itemId')(
                    <Lov
                      style={{ width: '100%' }}
                      code="SMDM.CUSTOMER_ITEM"
                      queryParams={{ organizationId }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemProps}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.supplierCompanyId')
                    .d('供应商')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      style={{ width: '100%' }}
                      code="SFIN.USER_AUTH.EXT_SUPPLIER"
                      textField="displaySupplierName"
                      queryParams={{ tenantId: organizationId }}
                      onChange={(_, record) => {
                        const { supplierId } = record;
                        registerField('supplierId');
                        setFieldsValue({
                          supplierId,
                        });
                      }}
                      onOk={(record) => {
                        const { supplierCompanyId } = record;
                        setFieldsValue({
                          supplierCompanyId: isNil(supplierCompanyId) ? '' : supplierCompanyId,
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemProps} label={intl.get('entity.company.tag').d('公司')}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      style={{ width: '100%' }}
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      queryParams={{ organizationId }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemProps} label={intl.get('hzero.common.status').d('状态')}>
                  {getFieldDecorator('billStatus')(
                    <Select allowClear>
                      {codes.length > 0 &&
                        codes
                          .filter((item) => item.value.indexOf('INFORM_') === -1)
                          .map((code) => (
                            <Option key={code.value} value={code.value}>
                              {code.meaning}
                            </Option>
                          ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemProps}
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.purAgentName').d('采购员')}
                >
                  {getFieldDecorator('purchaseAgentIds')(
                    <LovMulti
                      style={{ width: '100%' }}
                      code="SPUC.PURCHASE_AGENT_NOUSER"
                      queryParams={{ tenantId: organizationId }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemProps}
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.ouName').d('业务实体')}
                >
                  {getFieldDecorator('ouId')(
                    <Lov style={{ width: '100%' }} code="SPFM.USER_AUTH.OU" />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemProps}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.submitDateFrom')
                    .d('提交日期从')}
                >
                  {getFieldDecorator('submittedDateFrom')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('submittedDateTo') &&
                        moment(getFieldValue('submittedDateTo')).isBefore(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                      format={getDateFormat()}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemProps}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.submitDateTo')
                    .d('提交日期至')}
                >
                  {getFieldDecorator('submittedDateTo')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('submittedDateFrom') &&
                        moment(getFieldValue('submittedDateFrom')).isAfter(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                      format={getDateFormat()}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemProps}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.purchaseOrgName')
                    .d('采购组织')}
                >
                  {getFieldDecorator('purOrganizationIds')(
                    <LovMulti
                      style={{ width: '100%' }}
                      code="HPFM.PURCHASE_ORGANIZATION"
                      queryParams={{ tenantId: organizationId }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemProps}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.approvedDateFrom')
                    .d('审核日期从')}
                >
                  {getFieldDecorator('approvedDateFrom')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('approvedDateTo') &&
                        moment(getFieldValue('approvedDateTo')).isBefore(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                      format={getDateFormat()}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemProps}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.approvedDateTo')
                    .d('审核日期至')}
                >
                  {getFieldDecorator('approvedDateTo')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('approvedDateFrom') &&
                        moment(getFieldValue('approvedDateFrom')).isAfter(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                      format={getDateFormat()}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemProps}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.isSupplierCreateFlag')
                    .d('是否供应商创建')}
                >
                  {getFieldDecorator('supplierCreateFlag', {
                    // initialValue: 1,
                  })(
                    <Select allowClear>
                      <Option key={1} value={1}>
                        {intl.get('hzero.common.status.yes').d('是')}
                      </Option>
                      <Option key={0} value={0}>
                        {intl.get('hzero.common.status.no').d('否')}
                      </Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemProps}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.invoiceCompleteFlag')
                    .d('是否已完全开票')}
                >
                  {getFieldDecorator('invoiceCompleteFlag')(
                    <Select allowClear>
                      <Option key={1} value={1}>
                        {intl.get('hzero.common.status.yes').d('是')}
                      </Option>
                      <Option key={0} value={0}>
                        {intl.get('hzero.common.status.no').d('否')}
                      </Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemProps}
                  label={intl.get(`sfin.invoiceBill.model.invoiceBill.businessType`).d('业务类别')}
                >
                  {getFieldDecorator('businessType')(
                    <ValueList lovCode="SFIN.BUSINESS_TYPE" lazyLoad={false} allowClear />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemProps}
                  label={intl
                    .get(`sfin.invoiceBill.model.invoiceBill.taxInvoiceNumber`)
                    .d('税务发票号')}
                >
                  {getFieldDecorator('taxInvoiceNums')(<Input trim inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemProps}
                  label={intl
                    .get(`sfin.invoiceBill.model.invoiceBill.erpInvoiceNum`)
                    .d('ERP发票号')}
                >
                  {getFieldDecorator('erpInvoiceNums')(<Input trim inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemProps}
                  label={intl
                    .get(`sfin.invoiceBill.model.invoiceBill.filter.specifications`)
                    .d('规格')}
                >
                  {getFieldDecorator('specifications')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemProps}
                  label={intl.get(`sfin.invoiceBill.model.invoiceBill.filter.model`).d('型号')}
                >
                  {getFieldDecorator('model')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemProps}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.preciseSelectFlag')
                    .d('是否启用精准查询')}
                >
                  {getFieldDecorator('preciseSelectFlag')(
                    <ValueList lovCode="HPFM.FLAG" lazyLoad={false} allowClear />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.handleMoreFields}>
                {!moreFieldsVisible
                  ? intl.get(`hzero.common.button.viewMore`).d('更多查询')
                  : intl.get(`hzero.common.button.collected`).d('收起查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button data-code="search" type="primary" htmlType="submit" onClick={this.queryData}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
