/**
 * Search - 送货单创建 - 送货单创建查询页面 - 查询form
 * @date: 2018-12-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col, DatePicker, Select } from 'hzero-ui';
import { isEmpty } from 'lodash';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import moment from 'moment';
import intl from 'utils/intl';
import { SEARCH_FORM_ROW_LAYOUT, DATETIME_MIN } from 'utils/constants';
import { getUserOrganizationId, getCurrentOrganizationId } from 'utils/utils';

// FormItem组件初始化
const FormItem = Form.Item;
// Option组件初始化
const { Option } = Select;

// 初始化通用布局
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

/**
 * Search - 业务组件 - 送货单创建
 * @extends {Component} - React.Component
 * @reactProps {!Object} [form={}] - form对象
 * @reactProps {Array } [flagCode=[]] - 是否值集
 * @reactProps {function} [fetchList= (e => e)] - 查询数据
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sinv/delivery-creation/list' })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isRowCollapsed: this.props.isRowCollapsedCache, // formItem行是否展开
      organizationId: getUserOrganizationId(),
      tenantId: getCurrentOrganizationId(),
    };
    // 方法注册
    ['toggleForm', 'onClick', 'onReset'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * toggleForm - 查询条件展开/收起
   */
  toggleForm() {
    const {
      form: { setFieldsValue = (e) => e, getFieldsValue = (e) => e },
    } = this.props;
    const { isRowCollapsed } = this.state;
    const { needByDateStart } = getFieldsValue();
    this.setState(
      {
        isRowCollapsed: !isRowCollapsed,
      },
      () => {
        setFieldsValue({
          needByDateStart,
        });
      }
    );
  }

  /**
   * onClick - 查询按钮事件
   */
  onClick() {
    const { isRowCollapsed } = this.state;
    const {
      fetchList = (e) => e,
      form: { getFieldsValue = (e) => e, validateFieldsAndScroll = (e) => e },
      setQueryParamsCache = (e) => e,
    } = this.props;
    const params = getFieldsValue();
    const {
      needByDateStart,
      needByDateEnd,
      promiseDeliveryDateStart,
      promiseDeliveryDateEnd,
    } = params;
    setQueryParamsCache(params);
    validateFieldsAndScroll((err) => {
      if (!err) {
        fetchList({
          ...params,
          needByDateStart: needByDateStart
            ? moment(needByDateStart).format(DATETIME_MIN)
            : undefined,
          needByDateEnd: needByDateEnd ? moment(needByDateEnd).format(DATETIME_MIN) : undefined,
          promiseDeliveryDateStart: promiseDeliveryDateStart
            ? moment(promiseDeliveryDateStart).format(DATETIME_MIN)
            : undefined,
          promiseDeliveryDateEnd: promiseDeliveryDateEnd
            ? moment(promiseDeliveryDateEnd).format(DATETIME_MIN)
            : undefined,
        });
      } else if (!isRowCollapsed) {
        this.toggleForm();
      }
    });
  }

  /**
   * onReset - 重置按钮事件
   */
  onReset() {
    const {
      form: { resetFields = (e) => e, setFieldsValue = (e) => e },
      clearQueryParamsCache = (e) => e,
    } = this.props;
    setFieldsValue({ needByDateStart: undefined });
    resetFields();
    clearQueryParamsCache();
  }

  render() {
    const {
      // settings = {},
      // ruleData = {},  // TODO
      form,
      flagCode = [],
      orderSource = [],
      searchListParams = {},
      planList = {}, // TODO
      customizeFilterForm,
    } = this.props;
    const { isChinoeFlage = false } = searchListParams; // 埋点
    const { ruleData = {} } = planList; // TODO
    const { getFieldDecorator = (e) => e, getFieldValue = (e) => e } = form;
    const { rcvFlag, planDataFlag, planFlag } = ruleData;
    const { isRowCollapsed, organizationId, tenantId } = this.state;
    return customizeFilterForm(
      {
        form,
        expand: isRowCollapsed,
        code: 'SINV.DELIVERY_CREATION.FILTER',
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.sourcePlatform`).d('订单来源')}
                >
                  {getFieldDecorator('poSourcePlatform')(
                    <Select allowClear>
                      {orderSource.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.orderTypeName`).d('订单类型')}
                >
                  {getFieldDecorator('poTypeId')(
                    <Lov code="SODR.ORDER_TYPE" queryParams={{ tenantId }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.displayPoNum`).d('订单号')}
                >
                  {getFieldDecorator('displayPoNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: isRowCollapsed ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号')}
                >
                  {getFieldDecorator('displayLineNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.item.tag`).d('物料')}>
                  {getFieldDecorator('itemName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号')}
                >
                  {getFieldDecorator('displayLineLocationNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sinv.common.model.supplierReceiptRecord.needByDateFrom`)
                    .d('需求日期从')}
                >
                  {getFieldDecorator('needByDateStart')(
                    <DatePicker
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('needByDateEnd') &&
                        moment(getFieldValue('needByDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sinv.common.model.supplierReceiptRecord.needByDateTo`)
                    .d('需求日期至')}
                >
                  {getFieldDecorator('needByDateEnd')(
                    <DatePicker
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('needByDateStart') &&
                        moment(getFieldValue('needByDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员')}
                >
                  {getFieldDecorator('purchaseAgentName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sinv.common.model.supplierReceiptRecord.promiseDateStart`)
                    .d('承诺日期从')}
                >
                  {getFieldDecorator('promiseDeliveryDateStart')(
                    <DatePicker
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('promiseDeliveryDateEnd') &&
                        moment(getFieldValue('promiseDeliveryDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sinv.common.model.supplierReceiptRecord.promiseDateEnd`)
                    .d('承诺日期至')}
                >
                  {getFieldDecorator('promiseDeliveryDateEnd')(
                    <DatePicker
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('promiseDeliveryDateStart') &&
                        moment(getFieldValue('promiseDeliveryDateStart')).isAfter(
                          currentDate,
                          'day'
                        )
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.immedShippedFlag`).d('是否直发')}
                >
                  {getFieldDecorator('immedShippedFlag')(
                    <Select allowClear>
                      {flagCode.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号')}
                >
                  {getFieldDecorator('releaseNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.customer.tag`).d('客户')}>
                  {getFieldDecorator('companyId')(
                    <Lov code="SINV.ASN_CUSTOMER" queryParams={{ organizationId }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov code="SPFM.USER_AUTHORITY_COMPANY" queryParams={{ organizationId }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.exemptInspectionFlag`).d('是否免检')}
                >
                  {getFieldDecorator('exemptInspectionFlag')(
                    <Select allowClear>
                      {flagCode.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`entity.organization.class.purchase`).d('采购组织')}
                >
                  {getFieldDecorator('purOrganizationName')(<Input />)}
                </FormItem>
              </Col>
              {((rcvFlag && planDataFlag) || planFlag) && (
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sinv.common.model.common.planFlag`).d('按计划送货')}
                  >
                    {getFieldDecorator('planFlag', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`sinv.common.model.common.planFlag`).d('按计划送货'),
                          }),
                        },
                      ],
                      initialValue: isEmpty(flagCode) ? undefined : '1',
                    })(
                      <Select disabled={isChinoeFlage} allowClear>
                        {flagCode.map((n) => (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              )}
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.organizationName`).d('收货组织')}
                >
                  {getFieldDecorator('organizationName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.inventoryName`).d('库房')}
                >
                  {getFieldDecorator('inventoryName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.locationName`).d('库位')}
                >
                  {getFieldDecorator('locationName')(<Input />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {isRowCollapsed
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.onClick}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
