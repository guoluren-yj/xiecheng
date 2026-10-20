/*
 * Search - 送货单取消表单查询
 * @date: 2018-12-06 14:25:03
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import moment from 'moment';
import intl from 'utils/intl';
import { getDateFormat, getDateTimeFormat, getUserOrganizationId } from 'utils/utils';

const commonModelPrompt = 'sinv.common.model.common';
const modelPrompt = 'sinv.deliveryCanceled.model.deliveryCanceled';
// const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const { Option } = Select;

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sinv/delivery-cancelled/list' })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      organizationId: getUserOrganizationId(),
      expandForm: true,
    };
  }

  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (!err) {
          onSearch(values);
        }
      });
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
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const { form, customizeFilterForm, cancelStatus = [], asnCancelStatus = [] } = this.props;
    const { expandForm, organizationId } = this.state;
    const { getFieldDecorator = (e) => e, getFieldValue = (e) => e } = form;
    return customizeFilterForm(
      {
        form,
        expand: !expandForm,
        code: 'SINV.DELIVERY_CANCELLED.FILTER',
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row gutter={12}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.asnNum`).d('送货单号')}
                >
                  {getFieldDecorator('asnNum')(<Input />)}
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
                      textField="companyName"
                      queryParams={{ organizationId }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'none' : 'block' }} gutter={12}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
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
                  label={intl.get('hzero.common.date.creation.to').d('创建日期至')}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
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
                  label={intl.get(`${commonModelPrompt}.agentName`).d('采购员')}
                >
                  {getFieldDecorator('purchaseAgentName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.shipDateFrom`).d('发货日期从')}
                >
                  {getFieldDecorator('shipDateFrom')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('shipDateTo') &&
                        moment(getFieldValue('shipDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.shipDateTo`).d('发货日期至')}
                >
                  {getFieldDecorator('shipDateTo')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('shipDateFrom') &&
                        moment(getFieldValue('shipDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.cancelStatus`).d('取消导入状态')}
                >
                  {getFieldDecorator('cancelSyncStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {cancelStatus.map((n) =>
                        (n || {}).value && (n || {}).value !== 'SUCCESS' ? (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ) : undefined
                      )}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sinv.common.model.common.expectedArriveTimeFrom`)
                    .d('预计到货时间从')}
                >
                  {getFieldDecorator('expectedArriveDateFrom')(
                    <DatePicker
                      format={getDateTimeFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('expectedArriveDateTo') &&
                        moment(getFieldValue('expectedArriveDateTo')).isBefore(currentDate, 'time')
                      }
                      showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sinv.common.model.common.expectedArriveTimeTo`)
                    .d('预计到货时间至')}
                >
                  {getFieldDecorator('expectedArriveDateTo')(
                    <DatePicker
                      format={getDateTimeFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('expectedArriveDateFrom') &&
                        moment(getFieldValue('expectedArriveDateFrom')).isAfter(currentDate, 'time')
                      }
                      showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.cancelStatus`).d('取消状态')}
                >
                  {getFieldDecorator('cancelStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {asnCancelStatus.map((n) => (
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
                {expandForm
                  ? intl.get('hzero.common.button.viewMore').d('更多查询')
                  : intl.get(`hzero.common.button.collected`).d('收起查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get(`hzero.common.button.reset`).d('重置')}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get(`hzero.common.button.search`).d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
