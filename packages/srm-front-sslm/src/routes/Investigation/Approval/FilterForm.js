/*
 * FilterForm - 调查表审批表单
 * @date: 2018/08/07 14:57:58
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Input, Select, DatePicker, Col, Row } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import moment from 'moment';
import Lov from 'components/Lov';
import { getCurrentOrganizationId, getDateFormat, getUserOrganizationId } from 'utils/utils';

/**
 * 调查表审批表单
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
@cacheComponent({ cacheKey: '/sslm/investigation-approval' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
      organizationId: getCurrentOrganizationId(),
      userOrganizationId: getUserOrganizationId(),
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
    const { expandForm, organizationId, userOrganizationId } = this.state;
    const {
      enumMap = {},
      form: { getFieldDecorator, getFieldValue },
      form,
      customizeFilterForm,
      custLoading,
      code,
    } = this.props;
    return customizeFilterForm(
      {
        code, // 单元编码，必传
        form,
        expand: expandForm, // 控制查询表单收起展开状态的参数
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
                  {getFieldDecorator('partnerCompanyName')(<Input trim />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.model.investigate.type`).d('调查表类型')}
                >
                  {getFieldDecorator('investigateType')(
                    <Select style={{ width: '100%' }} allowClear>
                      {(enumMap.types || []).map((n) =>
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
                  label={intl.get(`sslm.common.view.creator.name`).d('创建人')}
                >
                  {getFieldDecorator('createUserName')(<Input />)}
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
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.investigCorrelat.view.message.submitDateFrom`)
                    .d('提交时间从')}
                >
                  {getFieldDecorator('submitDateFrom')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('submitDateTo') &&
                        moment(getFieldValue('submitDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.investigCorrelat.view.message.submitDateTo`)
                    .d('提交时间到')}
                >
                  {getFieldDecorator('submitDateTo')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('submitDateFrom') &&
                        moment(getFieldValue('submitDateFrom')).isAfter(currentDate, 'day')
                      }
                      format={getDateFormat()}
                      placeholder={null}
                    />
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
