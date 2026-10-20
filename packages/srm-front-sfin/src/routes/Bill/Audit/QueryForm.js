/**
 * QueryForm - 开票申请单审核 - 查询表单
 * @date: 2018-12-04
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Row, Col, Input, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isNil } from 'lodash';
import moment from 'moment';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import LovMulti from '@/routes/components/MultipleLov';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

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
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SFIN.BILL_AUDIT_LIST.FILTER'],
})
@cacheComponent({ cacheKey: '/sfin/audit-noConsignment' })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: false,
      companyId: '',
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

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    const { onHandleFormReset, form } = this.props;
    if (onHandleFormReset) {
      onHandleFormReset();
    }
    form.resetFields();
  }

  /**
   * 展开/收起方法
   */
  @Bind()
  toggle() {
    this.setState({
      expand: !this.state.expand,
    });
  }

  /**
   * 选择公司lov,将componyId传递给业务实体LOV
   * @param {*String} text 当前值
   * @param {*Object} record 行记录
   */
  @Bind()
  changeCompanyName(text, record) {
    const { form } = this.props;
    if (isUndefined(text)) {
      form.resetFields(['ouId']);
    }
    this.setState({
      companyId: record.companyId,
    });
  }

  /**
   * 渲染查询结构
   * @returns
   */
  render() {
    const { customizeFilterForm, form } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue, registerField } = form;
    const { expand } = this.state;
    const organizationId = getCurrentOrganizationId();
    return customizeFilterForm(
      {
        code: 'SFIN.BILL_AUDIT_LIST.FILTER',
        form,
        expand,
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
                  {getFieldDecorator('displayBillNum')(
                    <Input inputChinese={false} style={{ width: '100%' }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
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
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemProps} label={intl.get('entity.company.tag').d('公司')}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      style={{ width: '100%' }}
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      queryParams={{ organizationId }}
                      textField="companyName"
                      onChange={(text, record) => {
                        this.changeCompanyName(text, record);
                      }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'none' : 'block' }}>
              <Col span={8}>
                <FormItem
                  {...formItemProps}
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.itemCode').d('物料编码')}
                >
                  {getFieldDecorator('itemId')(
                    <Lov
                      style={{ width: '100%' }}
                      code="SMDM.CUSTOMER_ITEM"
                      queryParams={{ organizationId }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemProps}
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.purAgentName').d('采购员')}
                >
                  {getFieldDecorator('purchaseAgentIds')(
                    <LovMulti
                      code="SPUC.PURCHASE_AGENT_NOUSER"
                      queryParams={{ tenantId: organizationId }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemProps}
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.ouName').d('业务实体')}
                >
                  {getFieldDecorator('ouId')(
                    <Lov
                      style={{ width: '100%' }}
                      disabled={!getFieldValue('companyId')}
                      code="HPFM.OU"
                      textField="ouName"
                      queryParams={{
                        organizationId,
                        companyId: this.state.companyId,
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
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
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
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
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemProps}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.purchaseOrgName')
                    .d('采购组织')}
                >
                  {getFieldDecorator('purOrganizationIds')(
                    <LovMulti
                      code="HPFM.PURCHASE_ORGANIZATION"
                      queryParams={{ tenantId: organizationId }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemProps}
                  label={intl.get(`sfin.invoiceBill.model.invoiceBill.businessType`).d('业务类别')}
                >
                  {getFieldDecorator('businessType')(
                    <ValueList lovCode="SFIN.BUSINESS_TYPE" lazyLoad={false} allowClear />
                  )}
                </FormItem>
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
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggle}>
                {!expand
                  ? intl.get(`hzero.common.button.viewMore`).d('更多查询')
                  : intl.get(`hzero.common.button.collected`).d('收起查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" onClick={() => this.queryData()} htmlType="submit">
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
