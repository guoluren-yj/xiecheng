/**
 * index.js - 协议用章-搜索
 * @date: 2019-08-13
 * @author: MJQ <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input, InputNumber, Button, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import moment from 'moment';

import Lov from 'components/Lov';
import {
  DEFAULT_DATE_FORMAT,
  SEARCH_FORM_ROW_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
// import styles from './index.less';

const { Option } = Select;
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/spcm/contract-statement/list' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
      // organizationId: getUserOrganizationId(),
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  /**
   * onClick - 查询按钮事件
   */
  @Bind()
  handlequery() {
    const { onFetchList } = this.props;
    if (isFunction(onFetchList)) {
      onFetchList();
    }
  }

  // 查询条件展开/收起
  @Bind
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({ expandForm: !expandForm });
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind
  onReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  /**
   * 供应商Lov改变时清空供应商地点
   * @param {String} value
   */
  @Bind()
  onChangeSupplierId(value, record) {
    const { form } = this.props;
    const { registerField, setFieldsValue, getFieldValue, resetFields } = form;
    const { supplierId, supplierCompanyId } = record || {};
    if (!value || getFieldValue('displaySupplierName') !== value) {
      resetFields(['supplierSiteCode', 'supplierSiteName']);
    }
    registerField('supplierId');
    registerField('supplierCompanyId');
    setFieldsValue({ supplierId, supplierCompanyDeputyId: supplierCompanyId });
  }

  render() {
    const { expandForm, tenantId } = this.state;
    const {
      form: { getFieldDecorator, getFieldValue },
      enumMap: { flag = [] },
    } = this.props;

    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  // className={styles['ant-first-item']}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`spcm.common.model.common.pcType`).d('协议类型')}
                >
                  {getFieldDecorator('pcTypeId', {
                    rules: [
                      {
                        required: true,
                      },
                    ],
                  })(
                    <Lov
                      code="SPCM.PC_TYPE_ALL"
                      textField="pcTypeName"
                      queryParams={{ tenantId }}
                      onChange={this.cascadingEventName}
                    />
                  )}
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get(`spcm.common.model.common.purchaseAgreementNum`)
                    .d('采购协议编号')}
                >
                  {getFieldDecorator('pcNum')(<Input disabled={!getFieldValue('pcTypeId')} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`spcm.common.model.purchaseAgreementName`).d('采购协议名称')}
                >
                  {getFieldDecorator('pcName')(<Input disabled={!getFieldValue('pcTypeId')} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.company.tag`).d('公司')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPCM.USER_AUTH.COMPANY"
                      textField="companyName"
                      queryParams={{ tenantId }}
                      disabled={!getFieldValue('pcTypeId')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`spcm.common.model.agreementObject`).d('协议对象')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SPRM.SUPPLIER"
                      queryParams={{ tenantId }}
                      disabled={!getFieldValue('pcTypeId')}
                      textField="displaySupplierName"
                      onChange={this.onChangeSupplierId}
                    />
                  )}
                  {getFieldDecorator('supplierCompanyDeputyId')(<Input type="hidden" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`hzero.common.status`).d('状态')}
                >
                  {getFieldDecorator('pcStatusCode')(
                    <Select
                      style={{ width: '100%' }}
                      allowClear
                      disabled={!getFieldValue('pcTypeId')}
                    >
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
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`spcm.common.model.pcTemplateId`).d('协议模板')}
                >
                  {getFieldDecorator('pcTemplateId')(
                    <Lov
                      code="SPCM.PC_TEMPLATE"
                      textField="templateName"
                      queryParams={{ tenantId }}
                      disabled={!getFieldValue('pcTypeId')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      placeholder=""
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                      disabled={!getFieldValue('pcTypeId')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.to').d('创建日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      placeholder=""
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                      disabled={!getFieldValue('pcTypeId')}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`spcm.common.archiveCode`).d('归档码')}
                >
                  {getFieldDecorator('archiveCode')(
                    <Input disabled={!getFieldValue('pcTypeId')} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`spcm.common.model.version`).d('版本号')}
                >
                  {getFieldDecorator('version')(
                    <InputNumber
                      maxLength={18}
                      parser={(value) => (/^\d+$/.test(value) ? value : '')}
                      disabled={!getFieldValue('pcTypeId')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`spcm.common.model.mainAgreementCode`).d('主协议编码')}
                >
                  {getFieldDecorator('mainPcNum')(<Input disabled={!getFieldValue('pcTypeId')} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`entity.roles.creator`).d('创建人')}>
                  {getFieldDecorator('createByRealName')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                onClick={this.handlequery}
                disabled={!getFieldValue('pcTypeId')}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
