/**
 * index -创建一般付款申请
 * @date: 2019-12-11
 * @author zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col, DatePicker, Select } from 'hzero-ui';
import { isFunction, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { SEARCH_FORM_ROW_LAYOUT, SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';

const FormItem = Form.Item;
// Option组件初始化
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const { Option } = Select;

const commonPrompt = 'sprm.payment.common';

@withCustomize({
  unitCode: ['SFIN.PAYMENT_REQUEST_CREATE_LIST.FILTER'],
})
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sprm/purchase-requisition-creation/list' })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
    };
  }

  /**
   * onClick - 查询按钮事件
   */
  @Bind()
  onClick() {
    const { searchList } = this.props;
    if (isFunction(searchList)) {
      searchList();
    }
  }

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind()
  onReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  render() {
    const { form, enumMap = {}, customizeFilterForm } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue, registerField } = form;
    const { expandForm, tenantId } = this.state;
    const { sourceList = [] } = enumMap;
    return customizeFilterForm(
      {
        code: 'SFIN.PAYMENT_REQUEST_CREATE_LIST.FILTER',
        form,
        expand: expandForm,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.paymentNum`).d('付款申请单号')}
                >
                  {getFieldDecorator('paymentNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('entity.company.tag').d('公司')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('companyId')(
                    <Lov code="SPFM.USER_AUTH.COMPANY" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${commonPrompt}.ouId`).d('业务实体')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('ouId')(
                    <Lov
                      code="SPFM.USER_AUTH.OU"
                      queryParams={{ tenantId }}
                      // onChange={(value, lovRecord) => companyChange(value, lovRecord)}
                      // disabled={paymentHeaderId}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('entity.supplier.tag').d('供应商')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SFIN.USER_AUTH.EXT_SUPPLIER"
                      textField="displaySupplierName"
                      queryParams={{ tenantId }}
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
                <Form.Item
                  label={intl.get(`${commonPrompt}.creationDateStart`).d('申请日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateEnd') &&
                        moment(getFieldValue('creationDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.creationDateEnd`).d('申请日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateEnd')(
                    <DatePicker
                      placeholder={null}
                      format={getDateFormat()}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateStart') &&
                        moment(getFieldValue('creationDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.paymentHeaderStatus`).d('申请单状态')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('paymentHeaderStatus')(
                    <Select allowClear>
                      {sourceList
                        .filter((n) => ['PENDING', 'REJECTED', 'RETURNED'].includes(n.value))
                        .map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
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
