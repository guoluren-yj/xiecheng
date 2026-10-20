/**
 * Search - 送货单创建 - 可维护送货单查询页面 - 查询form
 * @date: 2018-12-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col, DatePicker, Select } from 'hzero-ui';
import Lov from 'components/Lov';
import moment from 'moment';
import intl from 'utils/intl';
import { SEARCH_FORM_ROW_LAYOUT, DATETIME_MIN } from 'utils/constants';

import { getUserOrganizationId } from 'utils/utils';

// FormItem组件初始化
const FormItem = Form.Item;
// Option组件初始化
const { Option } = Select;

// 配置表格formItem布局参数
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

/**
 * Search - 业务组件 - 送货单创建
 * @extends {Component} - React.Component
 * @reactProps {!Object} [form={}] - form对象
 * @reactProps {Array } [asnTypeCode=[]] - 送货单类型值集
 * @reactProps {function} [fetchList= (e => e)] - 查询数据
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isRowCollapsed: this.props.isRowCollapsedCache, // formItem行是否展开
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
    const { isRowCollapsed } = this.state;
    this.setState({
      isRowCollapsed: !isRowCollapsed,
    });
  }

  /**
   * onClick - 查询按钮事件
   */
  onClick() {
    const {
      fetchList = (e) => e,
      form: { getFieldsValue = (e) => e },
      setQueryParamsCache = (e) => e,
    } = this.props;
    const params = getFieldsValue();
    setQueryParamsCache(params);
    fetchList({
      ...getFieldsValue(),
      creationDateFrom: params.creationDateFrom
        ? moment(params.creationDateFrom).format(DATETIME_MIN)
        : undefined,
      creationDateTo: params.creationDateTo
        ? moment(params.creationDateTo).format(DATETIME_MIN)
        : undefined,
    });
  }

  /**
   * onReset - 重置按钮事件
   */
  onReset() {
    const {
      resetFetchListParamsChange,
      form: { resetFields = (e) => e },
      clearQueryParamsCache = (e) => e,
    } = this.props;
    if (typeof resetFetchListParamsChange === 'function') resetFetchListParamsChange();
    resetFields();
    clearQueryParamsCache();
  }

  render() {
    const { form, asnTypeCode = [], customizeFilterForm } = this.props;
    const { isRowCollapsed } = this.state;
    const { getFieldDecorator = (e) => e, getFieldValue = (e) => e } = form;
    return customizeFilterForm(
      {
        form,
        expand: isRowCollapsed,
        code: 'SINV.DELIVERY_CREATION.FILTER_BY_MAINTAIN',
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.asnNum`).d('送货单号')}
                >
                  {getFieldDecorator('asnNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.displayPoNum`).d('订单号')}
                >
                  {getFieldDecorator('displayPoNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.customer.tag`).d('客户')}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SINV.ASN_CUSTOMER"
                      lovOptions={{ valueField: 'companyId' }}
                      textField="companyName"
                      queryParams={{
                        organizationId: getUserOrganizationId(),
                      }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: isRowCollapsed ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.creation.to`).d('创建日期至')}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型')}
                >
                  {getFieldDecorator('asnTypeCode')(
                    <Select allowClear>
                      {asnTypeCode.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
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
