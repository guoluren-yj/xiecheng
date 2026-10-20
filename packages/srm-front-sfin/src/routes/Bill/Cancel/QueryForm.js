/**
 * QueryForm - 取消开票申请明细 - 非寄销 - 查询表单
 * @date: 2018-12-05
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Row, Col, Input, DatePicker, InputNumber, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isNil, isEmpty } from 'lodash';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import LovMulti from '@/routes/components/MultipleLov';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
const { Option } = Select;
const promptCode = 'sfin.invoiceBill';
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
@cacheComponent({ cacheKey: '/sfin/cancel-bill-noConsignment' })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: false, // 查询框显示/隐藏标记
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
   * 设置时间控件不可编辑起始时间日期
   * @param {Date} startValue 截止日期
   */
  @Bind()
  disabledStartDate(startValue) {
    const { endValue } = this.state;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  /**
   * 设置时间控件不可编辑起始结束日期
   * @param {Date} endValue 截止日期
   */
  @Bind()
  disabledEndDate(endValue) {
    const { startValue } = this.state;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  /**
   * 日期组件改变事件
   */
  @Bind()
  onChange(field, value) {
    this.setState({
      [field]: value,
    });
  }

  /**
   * 起始日期组件变化事件
   * @param {Date} value 日期数据
   */
  @Bind()
  onStartChange(value) {
    this.onChange('startValue', value);
  }

  /**
   * 结束日期组件变化事件
   * @param {Date} value 日期数据
   */
  @Bind()
  onEndChange(value) {
    this.onChange('endValue', value);
  }

  /**
   * 对账事务日期范围控制日期
   */
  @Bind()
  handleDateRangeChange(e, item) {
    const {
      form: { setFieldsValue },
    } = this.props;
    let trxDate;
    switch (e) {
      case 'ALL TIME':
        trxDate = { trxDateFrom: undefined, trxDateTo: undefined };
        break;
      case 'LAST MONTH':
        trxDate = { trxDateFrom: moment().subtract(1, 'month'), trxDateTo: moment() };
        break;
      case 'LAST THREE MONTHS':
        trxDate = { trxDateFrom: moment().subtract(3, 'month'), trxDateTo: moment() };
        break;
      case 'RECENT HALF YEAR':
        trxDate = { trxDateFrom: moment().subtract(6, 'month'), trxDateTo: moment() };
        break;
      case 'IN RECENT YAER':
        trxDate = { trxDateFrom: moment().subtract(12, 'month'), trxDateTo: moment() };
        break;
      case 'LAST MONTH AND BEFORE':
        trxDate = {
          trxDateFrom: undefined,
          trxDateTo: moment().subtract(1, 'month').endOf('month'),
        };
        break;
      default:
        trxDate = { trxDateFrom: moment().subtract(3, 'month'), trxDateTo: moment() };
        break;
    }
    // 兼容个性化控制
    if (item) {
      return item === 'trxDateFrom' ? trxDate.trxDateFrom : trxDate.trxDateTo;
    }
    setFieldsValue(trxDate);
  }

  /**
   * 渲染查询结构
   * @returns
   */
  render() {
    const { customizeFilterForm, dateRange = [], cuszDateRangeDefault, initLoadData } = this.props;
    const {
      getFieldDecorator,
      getFieldValue,
      setFieldsValue,
      registerField,
      form,
    } = this.props.form;
    const { expand } = this.state;
    const organizationId = getCurrentOrganizationId();
    const defaultDateRange = initLoadData ? cuszDateRangeDefault : getFieldValue('dateRange');
    return (
      <div className="table-list-search">
        {customizeFilterForm(
          {
            code: 'SFIN.CANCEL_BILL.FILTER',
            form,
            expand,
          },
          <Form layout="inline" className="more-fields-form">
            <Row gutter={24}>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl.get('sfin.invoiceBill.model.invoiceBill.billNum').d('开票单号')}
                    >
                      {getFieldDecorator('displayBillNum')(
                        <Input inputChinese={false} style={{ width: '100%' }} maxLength={40} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl.get('sfin.invoiceBill.model.invoiceBill.billNum').d('开票单号')}
                    >
                      {getFieldDecorator('displayBillNumRightMatch')(
                        <Input inputChinese={false} style={{ width: '100%' }} maxLength={40} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl.get('sfin.invoiceBill.model.invoiceBill.lineNo').d('行号')}
                    >
                      {getFieldDecorator('billLineNum')(
                        <InputNumber
                          style={{ width: '100%' }}
                          step="1"
                          precision={0}
                          max={1999999999}
                          min={0}
                        />
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
                            setFieldsValue({ ouId: undefined });
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
                </Row>
                <Row style={{ display: expand ? 'none' : 'block' }}>
                  <Col span={8}>
                    <FormItem {...formItemProps} label={intl.get('entity.company.tag').d('公司')}>
                      {getFieldDecorator('companyId')(
                        <Lov
                          style={{ width: '100%' }}
                          code="SPFM.USER_AUTHORITY_COMPANY"
                          queryParams={{ organizationId }}
                        />
                      )}
                    </FormItem>
                  </Col>
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
                      label={intl
                        .get('sfin.invoiceBill.model.invoiceBill.purAgentName')
                        .d('采购员')}
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
                        <Lov style={{ width: '100%' }} code="SPFM.USER_AUTH.OU" />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
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
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
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
                      label={intl.get(`sodr.common.model.common.inventoryName`).d('收货库房')}
                    >
                      {getFieldDecorator('inventoryId')(
                        <Lov
                          code="SODR.INVENTORY"
                          queryParams={{ tenantId: organizationId, enabledFlag: 1 }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl
                        .get(`sfin.invoiceBill.model.invoiceBill.businessType`)
                        .d('业务类别')}
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
                        .get(`${promptCode}.model.invoiceBill.transactionDateRange`)
                        .d('对账事务日期范围')}
                    >
                      {getFieldDecorator('dateRange', {
                        initialValue: isEmpty(dateRange) ? undefined : 'LAST THREE MONTHS', // 显示优化
                      })(
                        <Select allowClear onChange={(value) => this.handleDateRangeChange(value)}>
                          {dateRange.map((item) => (
                            <Option value={item.value} key={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.trxDateFrom`)
                        .d('事务日期从')}
                    >
                      {getFieldDecorator('trxDateFrom', {
                        initialValue: this.handleDateRangeChange(defaultDateRange, 'trxDateFrom'),
                      })(
                        <DatePicker
                          placeholder=""
                          format={getDateFormat()}
                          disabled={![undefined, 'ALL TIME'].includes(defaultDateRange)}
                          disabledDate={(currentDate) =>
                            getFieldValue('trxDateTo') &&
                            moment(getFieldValue('trxDateTo')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl.get(`${promptCode}.model.invoiceBill.toTrxDate`).d('事务日期至')}
                    >
                      {getFieldDecorator('trxDateTo', {
                        initialValue: this.handleDateRangeChange(defaultDateRange, 'trxDateTo'),
                      })(
                        <DatePicker
                          placeholder=""
                          format={getDateFormat()}
                          disabled={![undefined, 'ALL TIME'].includes(defaultDateRange)}
                          disabledDate={(currentDate) =>
                            getFieldValue('trxDateFrom') &&
                            moment(getFieldValue('trxDateFrom')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.filter.specifications`)
                        .d('规格')}
                    >
                      {getFieldDecorator('specifications')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl.get(`${promptCode}.model.invoiceBill.filter.model`).d('型号')}
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
        )}
      </div>
    );
  }
}
