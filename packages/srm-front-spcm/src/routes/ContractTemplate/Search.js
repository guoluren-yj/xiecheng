/**
 * index.js - 协议模板管理
 * @date: 2019-05-15
 * @author: geekrainy <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Input, Select, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { SEARCH_FORM_ROW_LAYOUT, DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { isFunction } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import DatePicker from '../components/Form/DatePicker';

const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const commonPrompt = 'spcm.contractTemplate.model';
const common = 'spcm.common.model';

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/spcm/contract-template/list' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
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
   * query - 查询按钮事件
   */
  @Bind()
  query() {
    const { onFetchList } = this.props;
    if (isFunction(onFetchList)) {
      onFetchList();
    }
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

  @Bind()
  handleChangePrompt() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['pcTypeId']);
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      enumMap = {},
    } = this.props;
    const { flag = [], templateStatusList = [] } = enumMap;
    const { tenantId, expandForm } = this.state;
    const paramsCompany = getFieldValue('companyId')
      ? { companyId: getFieldValue('companyId') }
      : {};
    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.templateCode`).d('协议模板编码')}
                >
                  {getFieldDecorator('templateCode')(<Input typeCase="upper" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.agreementTemplateName`).d('协议模板名称')}
                >
                  {getFieldDecorator('templateName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.enabledFlag`).d('是否启用')}
                >
                  {getFieldDecorator('enabledFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      {flag.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPCM.USER_AUTH.COMPANY"
                      textField="companyName"
                      queryParams={{ tenantId }}
                      onChange={this.handleChangePrompt}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`${common}.pcType`).d('协议类型')}>
                  {getFieldDecorator('pcTypeId')(
                    <Lov
                      code="SPCM.PC_TYPE_ALL"
                      textField="pcTypeName"
                      queryParams={{ ...paramsCompany, tenantId }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`hzero.common.status`).d('状态')}>
                  {getFieldDecorator('templateStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {templateStatusList.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.startDateActive`).d('模板起始日期')}
                >
                  {getFieldDecorator('startDateActive')(
                    <DatePicker
                      mode="date"
                      style={{ width: '100%' }}
                      format={DEFAULT_DATE_FORMAT}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.endDateActive`).d('模板失效日期')}
                >
                  {getFieldDecorator('endDateActive')(
                    <DatePicker style={{ width: '100%' }} format={DEFAULT_DATE_FORMAT} />
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
              <Button data-code="reset" onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button data-code="search" type="primary" htmlType="submit" onClick={this.query}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
