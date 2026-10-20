/*
 * FilterForm - 企业邀约汇总表单
 * @date: 2018/08/07 14:57:58
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Input, Select, DatePicker, Col, Row } from 'hzero-ui';
import moment from 'moment';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getDateFormat, getUserOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import { Bind } from 'lodash-decorators';
import { DATETIME_MIN } from 'utils/constants';
/**
 * 我收到的调查表表单
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
  style: { width: '100%' },
};

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sslm/investigation-send' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      userOrganizationId: getUserOrganizationId(),
      organizationId: getCurrentOrganizationId(),
      expandForm: false,
    };
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onFilterChange, form } = this.props;
    if (onFilterChange) {
      form.validateFields((err, values) => {
        const { startDate, endDate } = values;
        onFilterChange({
          ...values,
          startDate: startDate ? startDate.format(DATETIME_MIN) : undefined,
          endDate: endDate ? endDate.format(DATETIME_MIN) : undefined,
        });
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

  /**
   * 渲染查询条件
   * @returns React.component
   */
  @Bind()
  renderForm() {
    const {
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      investigateTypes = [],
      processStatusList = [],
      custLoading,
      customizeFilterForm,
    } = this.props;
    const { expandForm, organizationId, userOrganizationId } = this.state;
    getFieldDecorator('partnerCompanyId');
    return customizeFilterForm(
      {
        code: 'SSLM.SEND_INVESTIGATION.LIST_QUERY',
        form: this.props.form,
        expand: expandForm,
      },
      <Form layout="inline" className="more-fields-form" custLoading={custLoading}>
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.model.investigate.code`).d('调查表编号')}
                >
                  {getFieldDecorator('investgNumber')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.supplier.supplierCompany`).d('供应商')}
                >
                  {getFieldDecorator('partnerCompanyName')(
                    <Input
                      trim
                      dbc2sbc={false}
                      onChange={() => {
                        setFieldsValue({
                          partnerCompanyId: undefined,
                        });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.model.investigate.status`).d('调查表状态')}
                >
                  {getFieldDecorator('processStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {processStatusList.map(n =>
                        (n || {}).value ? (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ) : (
                          undefined
                        )
                      )}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.company.name`).d('公司')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      textField="companyName"
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      queryParams={{ organizationId: userOrganizationId }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.common.view.creator.name').d('创建人')}
                >
                  {getFieldDecorator('createUserName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.common.view.creator.unitName').d('创建人部门')}
                >
                  {getFieldDecorator('unitName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.model.investigate.type`).d('调查表类型')}
                >
                  {getFieldDecorator('investigateType')(
                    <Select style={{ width: '100%' }} allowClear>
                      {investigateTypes.map(n =>
                        (n || {}).value ? (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ) : (
                          undefined
                        )
                      )}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                >
                  {getFieldDecorator('startDate')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('endDate') &&
                        moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
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
                  {getFieldDecorator('endDate')(
                    <DatePicker
                      disabledDate={currentDate =>
                        getFieldValue('startDate') &&
                        moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
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
                  label={intl.get(`sslm.common.model.investigate.template`).d('调查表模板')}
                >
                  {getFieldDecorator('templateCode')(
                    <Lov
                      textField="templateName"
                      code="SSLM.INVESTIGATE_TEMPLATE_ID"
                      queryParams={{ organizationId }}
                      lovOptions={{
                        displayField: 'templateName',
                        valueField: 'templateCode',
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.common.model.investigate.template.versionNumber`)
                    .d('版本号')}
                >
                  {getFieldDecorator('versionNumber')(<Input trim />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
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
    return <div className="table-list-search">{this.renderForm()}</div>;
  }
}
