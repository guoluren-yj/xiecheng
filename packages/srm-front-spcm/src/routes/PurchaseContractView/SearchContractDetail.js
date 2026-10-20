/*
 * index.js - 我发起的协议-搜索
 * @Author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @Date: 2019-05-23
 * @LastEditTime: 2022-12-01 17:45:43
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input, InputNumber, Select, Button, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { DEFAULT_DATE_FORMAT, SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { isFunction } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import moment from 'moment';

const { Option } = Select;

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const commonPrompt = 'spcm.common.model';
const modelPrompt = 'spcm.purchaseContractView.model';
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/spcm/purchase-contract-view' })
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
  @Bind()
  cascadingEventCompany() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['pcTypeId', 'pcTemplateId']);
  }

  @Bind()
  cascadingEventName() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['pcTemplateId']);
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
    const {
      customizeFilterForm,
      form: { getFieldDecorator, getFieldValue },
      enumMap = {},
      code,
      enumObj = {},
    } = this.props;
    // const paramsCompany = getFieldValue('companyId')
    //   ? { companyId: getFieldValue('companyId') }
    //   : {};
    const paramsName = getFieldValue('pcTypeId') ? { pcTypeId: getFieldValue('pcTypeId') } : {};
    const { flag = [] } = enumMap;
    const { status = [], orderSign = [] } = enumMap;
    const { tenantId, expandForm } = this.state;
    const statusEnum = enumObj?.statusEnum || [];
    const isUseNewStatusEnum = Array.isArray(statusEnum) && statusEnum.length > 0;
    const flagFilter = flag.filter((item) =>
      [
        'PENDING',
        'SUBMITTED',
        'PUBLISHED',
        'REJECTED',
        'SUPPLIER_REJECTED',
        'CONFIRMED',
        'DELETED',
        'APPROVED',
        'APPROVAL_PENDING',
        'EFFECTED',
        'TERMINATION',
        'CANCELLATION',
        'HAVE_ALTERATION',
        'TERMINATION_CONFIRM',
        'ARCHIVE',
        'INVALID_TO_APPROVAL', // 作废待审批
        'CHANGE_TO_APPROVAL', // 变更审批中
        'TERMINATION_TO_APPROVAL', // 终止审批中
        'EXPIRED',
        'REPLENISHING',
        'PURCHASER_SIGN_CONTRACT',
        'SUPPLIER_SIGN_CONTRACT',
        'ARCHIVE_TO_APPROVAL',
      ].includes(item.value)
    );
    const statusList = isUseNewStatusEnum ? statusEnum : flagFilter;
    return customizeFilterForm(
      {
        form: this.props.form,
        expand: expandForm,
        code: code || 'SPCM.PURCHASE_CONTRACT_VIEW.LIST.FILTER',
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
                  {getFieldDecorator('pcStatusSet')(
                    <Select mode="multiple" style={{ width: '100%' }} allowClear>
                      {statusList.map((n) => (
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
                      onChange={this.cascadingEventCompany}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.agreementObject`).d('协议对象')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SPRM.SUPPLIER"
                      queryParams={{ tenantId }}
                      //   onChange={value => this.handleLovChange(value, 'pcTypeId')}
                      textField="displaySupplierName"
                      onChange={this.onChangeSupplierId}
                    />
                  )}
                  {getFieldDecorator('supplierCompanyDeputyId')(<Input type="hidden" />)}
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
                  label={intl.get('spcm.common.model.startDateActive').d('协议起始日期')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('startDateFrom')(
                    <DatePicker
                      format={DEFAULT_DATE_FORMAT}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('endDateTo') &&
                        moment(getFieldValue('endDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('spcm.common.model.endDateActive').d('协议终止日期')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('endDateTo')(
                    <DatePicker
                      format={DEFAULT_DATE_FORMAT}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('startDateFrom') &&
                        moment(getFieldValue('startDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.archiveCode`).d('归档码')}
                >
                  {getFieldDecorator('archiveCode')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`entity.roles.creator`).d('创建人')}>
                  {getFieldDecorator('createByRealName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`entity.organization.class.purchase`).d('采购组织')}
                >
                  {getFieldDecorator('purchaseOrgId')(
                    <Lov
                      code="SPFM.USER_AUTH.PURORG"
                      textField="organizationName"
                      queryParams={{ tenantId }}
                    />
                  )}
                </Form.Item>
              </Col>
              {/* <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.pcType`).d('协议类型')}
                >
                  {getFieldDecorator('pcTypeId')(
                    <Lov
                      code="SPCM.PC_TYPE_ALL"
                      textField="pcTypeName"
                      queryParams={{ ...paramsCompany, tenantId }}
                      onChange={this.cascadingEventName}
                    />
                  )}
                </Form.Item>
              </Col> */}
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.pcTemplateId`).d('协议模板')}
                >
                  {getFieldDecorator('pcTemplateId')(
                    <Lov
                      code="SPCM.PC_TEMPLATE"
                      textField="templateName"
                      queryParams={{ ...paramsName, tenantId }}
                    />
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
                  label={intl.get(`spcm.common.model.common.MaterialClassify`).d('物料分类')}
                >
                  {getFieldDecorator('categoryName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.common.itemCode`).d('物料编码')}
                >
                  {getFieldDecorator('itemCode')(
                    <Lov
                      code="SPCM.ITEM_RELATE_PUR_PRICE"
                      lovOptions={{ valueField: 'itemCode', displayField: 'itemCode' }}
                      queryParams={{ tenantId }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.common.itemName`).d('物料名称')}
                >
                  {getFieldDecorator('itemName')(<Input />)}
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
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.scopeOfApplicationQuery`).d('适用范围查询')}
                >
                  {getFieldDecorator(`sourceAppScopeDataId`)(
                    <Lov
                      code="SPCM.USER_AUTH.COMPANY"
                      queryParams={{ tenantId }}
                      textField="companyNum"
                    />
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
