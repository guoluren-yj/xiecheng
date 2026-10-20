/*
 * FilterForm - 订单确认表单
 * @date: 2018/08/07 14:57:58
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Input, DatePicker, Col, Row, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import Lov from 'components/Lov';
// import Checkbox from 'components/Checkbox';
import { getCurrentOrganizationId, getDateFormat, getUserOrganizationId } from 'utils/utils';

/**
 * 订单确认表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch  搜索
 * @reactProps {Function} handleFormReset  重置表单
 * @reactProps {Function} toggleForm  展开查询条件
 * @reactProps {Function} renderAdvancedForm 渲染所有查询条件
 * @reactProps {Function} renderSimpleForm 渲染缩略查询条件
 * @return React.element
 */
const modelCommonPrompt = 'sodr.confirmOrder.model.common';
// const modelPrompt = 'sodr.confirmOrder.mode.confirmOrder';
const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
// @formatterCollections({ code: 'spfm.invitationList' })
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sodr/confirm-order/list' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
    };
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onFilterChange } = this.props;
    if (onFilterChange) {
      onFilterChange();
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

  /**
   * 渲染查询条件
   * @returns React.component
   */
  @Bind()
  renderForm() {
    const { form, enumMap = {}, customizeFilterForm } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { flag = [], orderSource = [], signStatus = [], statusCodes = [] } = enumMap;
    const { expandForm, tenantId, organizationId } = this.state;
    // // TODO
    // const statusCodess = [
    //   {
    //     value: 'DELIVERY_DATE_REJECT',
    //     meaning: intl.get(`${modelPrompt}.deliveryDateReject`).d('交期审核退回'),
    //   },
    //   { value: 'confirmUpdateFlag0', meaning: intl.get(`${modelPrompt}.newOrder`).d('新订单') },
    //   { value: 'confirmUpdateFlag1', meaning: intl.get(`${modelPrompt}.updated`).d('已更新') },
    //   { value: 'cancelledFlag', meaning: intl.get(`${modelPrompt}.cancelledFlag`).d('已取消') },
    //   { value: 'PUBLISHED', meaning: intl.get(`${modelPrompt}.published`).d('已发布') },
    //   { value: 'CLOSED', meaning: intl.get(`${modelPrompt}.closed`).d('已关闭') },
    //   {
    //     value: 'publishCancelFlag',
    //     meaning: intl.get(`${modelPrompt}.publishCancelFlag`).d('取消发布'),
    //   },
    //   {
    //     value: 'CONFIRMED',
    //     meaning: intl.get(`${modelPrompt}.confirmed`).d('已确认'),
    //   },
    // ];
    return customizeFilterForm(
      {
        form,
        expand: expandForm,
        code: 'SODR.CONFIRM_ORDER_LIST.FILTER',
      },
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18} style={{ paddingRight: 5 }}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelCommonPrompt}.displayPoNum`).d('订单号')}
                >
                  {getFieldDecorator('displayPoNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.order.status`).d('订单状态')}>
                  {getFieldDecorator('statusCode')(
                    <Select style={{ width: '100%' }} allowClear>
                      {statusCodes.map((n) =>
                        (n || {}).value ? (
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
                  label={intl.get(`${modelCommonPrompt}.urgentOrder`).d('是否加急')}
                >
                  {getFieldDecorator('urgentFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      {flag.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.customer.tag`).d('客户')}>
                  {getFieldDecorator('companyId')(
                    <Lov queryParams={{ organizationId }} code="SPFM.USER_AUTH.CUSTOMER" />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.business.tag`).d('业务实体')}>
                  {getFieldDecorator('ouId')(
                    <Lov code="SPRM.OU" queryParams={{ enabledFlag: 1, tenantId }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.order.type`).d('订单类型')}>
                  {getFieldDecorator('poTypeId')(
                    <Lov code="SPUC_ORDER_TYPE" queryParams={{ tenantId, enabledFlag: 1 }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelCommonPrompt}.releaseNum`).d('发放号')}
                >
                  {getFieldDecorator('releaseNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelCommonPrompt}.agentId`).d('采购员')}
                >
                  {getFieldDecorator('agentName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                >
                  {getFieldDecorator('erpCreationDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('erpCreationDateEnd') &&
                        moment(getFieldValue('erpCreationDateEnd')).isBefore(currentDate, 'day')
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
                  {getFieldDecorator('erpCreationDateEnd')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('erpCreationDateStart') &&
                        moment(getFieldValue('erpCreationDateStart')).isAfter(currentDate, 'day')
                      }
                      format={getDateFormat()}
                      placeholder={null}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.release.from`).d('发布日期从')}
                >
                  {getFieldDecorator('releaseDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('releaseDateEnd') &&
                        moment(getFieldValue('releaseDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.release.to`).d('发布日期至')}
                >
                  {getFieldDecorator('releaseDateEnd')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('releaseDateStart') &&
                        moment(getFieldValue('releaseDateStart')).isAfter(currentDate, 'day')
                      }
                      format={getDateFormat()}
                      placeholder={null}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${modelCommonPrompt}.sourcePlatform`).d('来源平台')}
                  {...formItemLayout}
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
                  label={intl.get(`sodr.common.model.common.electricSignFlag`).d('电签标识')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('electricSignFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      {flag.map((n) => (
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
                  label={intl.get(`sodr.common.model.common.electricSignStatus`).d('电签状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('electricSignStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {signStatus.map((n) => (
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
              <Button onClick={this.toggleForm} style={{ marginRight: 0 }}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    return <div className="table-list-search">{this.renderForm()}</div>;
  }
}
