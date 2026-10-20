/*
 * FilterForm - 企业邀约汇总表单
 * @date: 2018/08/07 14:57:58
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Input, Select, DatePicker, Col, Row } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getDateFormat, getUserOrganizationId } from 'utils/utils';

/**
 * 企业邀约汇总表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch  搜索
 * @reactProps {Function} handleFormReset  重置表单
 * @reactProps {Function} toggleForm  展开查询条件
 * @reactProps {Function} disabledEndDate  禁选时间
 * @reactProps {Function} renderAdvancedForm 渲染所有查询条件
 * @reactProps {Function} renderSimpleForm 渲染缩略查询条件
 * @return React.element
 */

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
// @formatterCollections({ code: 'spfm.invitationList' })
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
      userOrganizationId: getUserOrganizationId(),
    };
  }

  componentDidMount() {
    // 将跳转参数，设置为查询查询条件默认值
    const { form, routerParams } = this.props;
    form.setFieldsValue({
      ...routerParams,
    });
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
   * 渲染所有的查询条件
   * @returns React.component
   */
  @Bind()
  renderAdvancedForm() {
    const {
      form,
      form: { getFieldDecorator, getFieldValue },
      inviteType = [],
      processStatus = [],
      investigateYOrNStatus = [],
      levelTypeYOrNStatus = [],
      customizeFilterForm = () => {},
      code = '',
    } = this.props;
    const { expandForm, userOrganizationId } = this.state;
    return customizeFilterForm(
      {
        code, // 单元编码，必传
        form,
        expand: expandForm, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`spfm.invitationList.model.invitationList.inviteType`)
                    .d('邀请类型')}
                >
                  {getFieldDecorator('inviteType')(
                    <Select style={{ width: '100%' }} allowClear>
                      {(inviteType || []).map((n) =>
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
                  label={intl
                    .get(`spfm.invitationList.model.invitationList.processStatus`)
                    .d('邀约状态')}
                >
                  {getFieldDecorator('processStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {(processStatus || []).map((n) =>
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
                <FormItem {...formItemLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      queryParams={{ organizationId: userOrganizationId }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`spfm.invitationList.model.invitationList.startDate`)
                    .d('发出时间从')}
                >
                  {getFieldDecorator('startDate')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('endDate') &&
                        moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                      }
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`spfm.invitationList.model.invitationList.endDate`)
                    .d('发出时间到')}
                >
                  {getFieldDecorator('endDate')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('startDate') &&
                        moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
                      }
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                    />
                  )}
                </FormItem>
              </Col>
              {this.props.emit ? (
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`spfm.invitationList.model.invitationList.searchCompanyName`)
                      .d('被邀请企业名称')}
                  >
                    {getFieldDecorator('searchCompanyName')(<Input dbc2sbc={false} />)}
                  </FormItem>
                </Col>
              ) : (
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`spfm.invitationList.model.invitationList.sendCompanyName`)
                      .d('发出方企业')}
                  >
                    {getFieldDecorator('searchCompanyName')(<Input dbc2sbc={false} />)}
                  </FormItem>
                </Col>
              )}
              {this.props.emit ? (
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`spfm.invitationList.model.invitationList.sendUserName`)
                      .d('发起邀请人')}
                  >
                    {getFieldDecorator('sendUserName')(<Input />)}
                  </FormItem>
                </Col>
              ) : (
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`spfm.invitationList.model.invitationList.handleUserName`)
                      .d('邀请处理人')}
                  >
                    {getFieldDecorator('handleUserName')(<Input />)}
                  </FormItem>
                </Col>
              )}
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`spfm.invitationRegister.model.invitation.purchaseAgentId`)
                    .d('采购员')}
                >
                  {getFieldDecorator('purchaseAgentId')(
                    <Lov
                      code="SPFM.PURCHASE_AGENT_NOUSER"
                      queryParams={{ tenantId: userOrganizationId }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`spfm.invitationList.model.invitationList.inviteId`)
                    .d('邀请编号')}
                >
                  {getFieldDecorator('displayInviteIdStr')(
                    <Input dbc2sbc={false} inputChinese={false} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`spfm.invitationList.model.invitationList.investigateFalg`)
                    .d('是否发出调查表')}
                >
                  {getFieldDecorator('investigateFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      {(investigateYOrNStatus || []).map((n) =>
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
                  label={intl
                    .get(`spfm.invitationList.model.invitationList.levelTypeFlag`)
                    .d('是否集团级')}
                >
                  {getFieldDecorator('levelTypeFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      {(levelTypeYOrNStatus || []).map((n) =>
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
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleFormReset}>
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
    return <div className="table-list-search">{this.renderAdvancedForm()}</div>;
  }
}
