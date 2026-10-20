/*
 * index.js - 我收到的协议-搜索
 * @Author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @Date: 2019-05-24
 * @LastEditTime: 2019-08-22 15:28:41
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input, InputNumber, Select, Button, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import moment from 'moment';

import { DEFAULT_DATE_FORMAT, SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';

const commonPrompt = 'spcm.common.model.common';
const modelPrompt = 'spcm.supplierContractView.model';
const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/spcm/supplier-contract-view/list' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
      organizationId: getUserOrganizationId(),
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
   * onClick - 查询按钮事件
   */
  @Bind()
  onClick() {
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

  /**
   * cascadingEvent - 级联事件
   */
  // @Bind()
  // cascadingEventCompany() {
  //   const {
  //     form: { resetFields },
  //   } = this.props;
  //   resetFields(['pcTypeId', 'pcTemplateId']);
  // }

  // @Bind()
  // cascadingEventName() {
  //   const {
  //     form: { resetFields },
  //   } = this.props;
  //   resetFields(['pcTemplateId']);
  // }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      enumMap = {},
      customizeFilterForm,
      remote,
    } = this.props;
    // const paramsCompany = getFieldValue('companyId')
    //   ? { companyId: getFieldValue('companyId') }
    //   : {};
    // const paramsName = getFieldValue('pcTypeId') ? { pcTypeId: getFieldValue('pcTypeId') } : {};
    const { flag = [] } = enumMap;
    const statusList = flag.filter((item) =>
      [
        'PUBLISHED',
        'SUPPLIER_REJECTED',
        'CONFIRMED',
        'EFFECTED',
        'TERMINATION',
        'CANCELLATION',
        'APPROVAL_PENDING',
        'HAVE_ALTERATION',
        'TERMINATION_CONFIRM',
        'ARCHIVE',
        'EXPIRED',
        // 'REPLENISHING',
        // 'PURCHASER_SIGN_CONTRACT',
        'SUPPLIER_SIGN_CONTRACT',
        'TO_BE_VALID',
        'EFFECTED_TO_APPROVAL',
      ].includes(item.value)
    );
    const remoteStatusList = remote
      ? remote.process('SPCM_SUP_CONTRACT_VIEW_SEARCH_STATUS_LIST', statusList, { current: this })
      : statusList;
    const { status = [], orderSign = [] } = enumMap;
    const { organizationId, tenantId, expandForm } = this.state;
    // const { companyName } = dataSource;
    return customizeFilterForm(
      {
        form: this.props.form,
        expand: expandForm,
        code: 'SPCM.SUPPLIER_CONTRACT_VIEW.LIST.FILTER',
      },
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.purchaseAgreementNum`).d('采购协议编号')}
                >
                  {getFieldDecorator('pcNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.purchaseAgreementName`).d('采购协议名称')}
                >
                  {getFieldDecorator('pcName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.pcStatusCode`).d('状态')}
                >
                  {getFieldDecorator('pcStatusCode')(
                    <Select style={{ width: '100%' }} allowClear>
                      {remoteStatusList.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`entity.customer.tag`).d('客户')}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPCM.USER_AUTH.CUSTOMER"
                      textField="companyName"
                      queryParams={{ organizationId, tenantId }}
                      onChange={this.cascadingEventCompany}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.pcKindCode`).d('协议性质')}
                >
                  {getFieldDecorator('pcKindCode')(
                    <Select style={{ width: '100%' }} allowClear>
                      {status.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      placeholder=""
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.to').d('创建日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      format={DEFAULT_DATE_FORMAT}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('spcm.common.model.confirmedDateFrom').d('生效日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('confirmedDateFrom')(
                    <DatePicker
                      format={DEFAULT_DATE_FORMAT}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('confirmedDateTo') &&
                        moment(getFieldValue('confirmedDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('spcm.common.model.confirmedDateTo').d('生效日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('confirmedDateTo')(
                    <DatePicker
                      format={DEFAULT_DATE_FORMAT}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('confirmedDateFrom') &&
                        moment(getFieldValue('confirmedDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.version`).d('版本号')}
                >
                  {getFieldDecorator('version')(
                    <InputNumber
                      maxLength={18}
                      parser={(value) => (/^\d+$/.test(value) ? value : '')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.mainAgreementCode`).d('主协议编码')}
                >
                  {getFieldDecorator('mainPcNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.showOrderSign`).d('展示订单签署')}
                >
                  {getFieldDecorator('orderSignFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      {orderSign.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
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
              <Button data-code="reset" onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button data-code="search" type="primary" htmlType="submit" onClick={this.onClick}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
