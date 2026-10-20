/*
 * Search - 订单按明细查找表单
 * @date: 2018-11-26 16:04:49
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getDateFormat, getUserOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import LovModal from '../../components/MultipleLov';

/**
 * 订单查找表单
 * @extends {Component} - React.Component
 * @reactProps {Function} handleSearch  搜索
 * @reactProps {Function} handleFormReset  重置表单
 * @reactProps {Function} toggleForm  展开查询条件
 * @reactProps {Function} renderAdvancedForm 渲染所有查询条件
 * @reactProps {Function} renderSimpleForm 渲染缩略查询条件
 * @return React.element
 */
const modelPrompt = 'sodr.sendOrder.model.common';
const FormItem = Form.Item;
const { Option } = Select;

// @prompt({ code: 'spfm.invitationList' })
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sodr/send-order/detail' })
export default class Search extends Component {
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
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch();
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
   * 改变滑窗Visible
   * @param {String} field
   * @param {Boolean} flag
   */
  @Bind()
  handleMoreParamsVisible(field, flag) {
    this.setState({ [field]: !!flag });
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { form, handleReset } = this.props;
    form.resetFields();
    if (handleReset) {
      handleReset();
    }
  }

  /**
   * 改变Lov时清空供应商地点
   * @param {Number} rowKey
   */
  @Bind()
  onChangeSupplierId(rowKey, record = []) {
    const supplierIds = [];
    const supplierCompanyIds = [];
    const displaySupplierNameArray = [];
    const { form } = this.props;
    const { registerField, setFieldsValue } = form;
    for (let i = 0; i < record.length; i++) {
      if (record[i]) {
        const { supplierId, supplierCompanyId, displaySupplierName } = record[i];
        if (supplierId) {
          supplierIds.push(supplierId);
        }
        if (supplierCompanyId) {
          supplierCompanyIds.push(supplierCompanyId);
        }
        if (displaySupplierName) {
          displaySupplierNameArray.push(displaySupplierName);
        }
      }
    }
    if (!rowKey || form.getFieldsValue(['supplierId']) !== rowKey) {
      form.resetFields(['supplierSiteId', 'supplierSiteName', 'supplierSiteId']);
    }
    registerField('supplierIds');
    registerField('supplierCompanyIds');
    setFieldsValue({
      supplierIds: supplierIds.join(','),
      supplierCompanyIds: supplierCompanyIds.join(','),
    });
  }

  /**
   * 收货组织级联改变回调函数
   * @param {*} value
   * @param {*} field
   */
  @Bind()
  handleOriginationLovChange(value, field) {
    const {
      form: { setFieldsValue, getFieldValue },
    } = this.props;
    const oldValue = getFieldValue(field);
    if (oldValue !== value) {
      setFieldsValue({ invInventoryIds: undefined });
    }
    if (setFieldsValue) {
      setFieldsValue({ tmpOrganizationIds: value, invOrganizationIds: value });
    }
  }

  render() {
    const { form, enumMap = {}, customizeFilterForm, remote } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const { expandForm, tenantId, organizationId } = this.state;
    const { orderSource = [], flag = [], signStatus = [] } = enumMap;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return customizeFilterForm(
      // <div className="table-list-search">
      {
        form,
        expand: expandForm,
        code: 'SODR.SEND_ORDER_LIST.FILTER_DETAIL',
      },
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18} style={{ paddingRight: 5 }}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.orderNum`).d('订单号')}
                >
                  {getFieldDecorator('displayPoNum')(
                    <Input
                      inputChinese={false}
                      onChange={(e) => {
                        if (!e.target.value) {
                          setFieldsValue({ displayLineNum: null });
                        }
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.srmPoNum`).d('SRM订单号')}
                >
                  {getFieldDecorator('poNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.lineNum`).d('行号')}>
                  {getFieldDecorator('displayLineNum')(
                    <Input disabled={!getFieldValue('displayPoNum')} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.shipmentNum`).d('发运号')}
                >
                  {getFieldDecorator('displayLineLocationNum')(<Input />)}
                </FormItem>
              </Col> */}
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.fromDocumentNum`).d('来源单据号')}
                >
                  {getFieldDecorator('fromDocumentNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.release.from`).d('发布日期从')}
                >
                  {getFieldDecorator('releasedDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('releasedDateEnd') &&
                        moment(getFieldValue('releasedDateEnd')).isBefore(currentDate, 'day')
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
                  {getFieldDecorator('releasedDateEnd')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('releasedDateStart') &&
                        moment(getFieldValue('releasedDateStart')).isAfter(currentDate, 'day')
                      }
                      format={getDateFormat()}
                      placeholder={null}
                    />
                  )}
                </FormItem>
              </Col>
              {/* <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.order.type`).d('订单类型')}>
                  {getFieldDecorator('poTypeId')(
                    <Lov
                      code="SPUC_ORDER_TYPE"
                      queryParams={{ organizationId: tenantId, enabledFlag: 1 }}
                      textField="orderTypeCode"
                    />
                  )}
                </FormItem>
              </Col> */}
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTH.COMPANY"
                      queryParams={{ organizationId }}
                      textField="companyName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.business.tag`).d('业务实体')}>
                  {getFieldDecorator('ouId')(
                    <Lov
                      code="HPFM.OU"
                      queryParams={{ organizationId, tenantId, enabledFlag: 1 }}
                      textField="orgName"
                    />
                  )}
                </FormItem>
              </Col>
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.releaseNum`).d('发放号')}
                >
                  {getFieldDecorator('releaseNum')(<Input />)}
                </FormItem>
              </Col> */}
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.purchaseOrgId`).d('采购组织')}
                >
                  {getFieldDecorator('purchaseOrgIds')(
                    <LovModal
                      code="SPFM.USER_AUTH.PURORG"
                      queryParams={{ organizationId }}
                      textField="purOrganizationName"
                      lovOptions={{ displayField: 'organizationName' }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.purchaseAgent`).d('采购员')}
                >
                  {getFieldDecorator('agentIds')(
                    <LovModal
                      code="SPFM.USER_AUTH.PURCHASE_AGENT"
                      queryParams={{ organizationId }}
                      textField="agentName"
                    />
                  )}
                </FormItem>
              </Col>
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.erpStatus`).d('ERP状态')}
                >
                  {getFieldDecorator('erpStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {erpStatus.map((n) =>
                        (n || {}).value ? (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ) : undefined
                      )}
                    </Select>
                  )}
                </FormItem>
              </Col> */}
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.supplier.tag`).d('供应商')}>
                  {getFieldDecorator('tempKeys')(
                    <LovModal
                      code="SODR.AUTH_SUPPLIER"
                      // lovOptions={{ displayField: 'displaySupplierName' }}
                      textField="displaySupplierName"
                      onChange={this.onChangeSupplierId}
                      queryParams={{
                        tenantId,
                        companyId: getFieldValue('companyId'),
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.supplierSites`).d('供应商地点')}
                >
                  {getFieldDecorator('supplierSiteId')(
                    <Lov
                      disabled={!getFieldValue('supplierIds')}
                      code="SSLM.SUPPLIER_SITE_BY_IDS"
                      queryParams={{
                        supplierIds: getFieldValue('supplierIds'),
                        organizationId: tenantId,
                      }}
                      textField="supplierSiteName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.item.code`).d('物料编码')}>
                  {getFieldDecorator('itemCodes')(
                    <LovModal code="SODR.PO_ITEM" queryParams={{ tenantId }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                >
                  {getFieldDecorator('creationDateStart', {
                    initialValue: moment().subtract(3, 'months'),
                  })(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateEnd') &&
                        moment(getFieldValue('creationDateEnd')).isBefore(currentDate, 'day')
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
                  {getFieldDecorator('creationDateEnd', {
                    initialValue: moment(),
                  })(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateStart') &&
                        moment(getFieldValue('creationDateStart')).isAfter(currentDate, 'day')
                      }
                      format={getDateFormat()}
                      placeholder={null}
                    />
                  )}
                </FormItem>
              </Col>
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.purchaseReqNum`).d('采购申请号')}
                >
                  {getFieldDecorator('purReqNum')(<Input />)}
                </FormItem>
              </Col> */}
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.urgentOrNot`).d('是否加急')}
                >
                  {getFieldDecorator('urgentFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      {flag.map(n => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col> */}
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.useFlag`).d('是否超期')}
                >
                  {getFieldDecorator('beyondFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      <Option value="1">是</Option>
                      <Option value="0">否</Option>
                    </Select>
                  )}
                </FormItem>
              </Col> */}
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.urgentDateStart`).d('加急时间从')}
                >
                  {getFieldDecorator('urgentDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('urgentDateEnd') &&
                        moment(getFieldValue('urgentDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col> */}
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.urgentDateEnd`).d('加急时间至')}
                >
                  {getFieldDecorator('urgentDateEnd')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('urgentDateStart') &&
                        moment(getFieldValue('urgentDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col> */}
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.freeFlag`).d('是否免费')}
                >
                  {getFieldDecorator('freeFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      {flag
                        .filter((item) => item.value !== 'NEW')
                        .map((n) => (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </FormItem>
              </Col> */}
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.needDateStart`).d('需求日期从')}
                >
                  {getFieldDecorator('needByDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('needByDateEnd') &&
                        moment(getFieldValue('needByDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col> */}
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.needDateEnd`).d('需求日期至')}
                >
                  {getFieldDecorator('needByDateEnd')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('needByDateStart') &&
                        moment(getFieldValue('needByDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col> */}
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.cancelledFlag`).d('是否取消')}
                >
                  {getFieldDecorator('lineCancelledFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      {flag.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col> */}
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.promisedDateFrom`).d('承诺日期从')}
                >
                  {getFieldDecorator('promiseDeliveryDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('promiseDeliveryDateEnd') &&
                        moment(getFieldValue('promiseDeliveryDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col> */}
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.promisedDateTo`).d('承诺日期至')}
                >
                  {getFieldDecorator('promiseDeliveryDateEnd')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('promiseDeliveryDateStart') &&
                        moment(getFieldValue('promiseDeliveryDateStart')).isAfter(
                          currentDate,
                          'day'
                        )
                      }
                    />
                  )}
                </FormItem>
              </Col> */}
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.delayFlag`).d('交期满足需求')}
                >
                  {getFieldDecorator('delayFlag')(
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
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.closedFlag`).d('是否关闭')}
                >
                  {getFieldDecorator('lineClosedFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      {flag.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col> */}
              <Col span={8}>
                <FormItem
                  label={intl.get(`${modelPrompt}.sourcePlatform`).d('来源平台')}
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
                  label={intl.get(`${modelPrompt}.itemCategory`).d('物料分类')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('categoryIds')(
                    <LovModal
                      code="SPRM.ITEM_CATEGOR"
                      queryParams={{
                        organizationId: tenantId,
                      }}
                      textField="categoryName"
                      isCascade // 是否级联勾选
                      parentRowKey="parentCategoryId" // 父级id
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`entity.organization.class.receipt`).d('收货组织')}
                >
                  {getFieldDecorator('invOrganizationIds')(
                    <LovModal
                      code="SPUC.SMDM.INV_ORG"
                      // textField="organizationName"
                      queryParams={{
                        organizationId,
                      }}
                      onChange={(value) =>
                        this.handleOriginationLovChange(value, 'invOrganizationIds')
                      }
                    />
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
              <Col span={8}>
                <FormItem
                  label={intl.get(`sodr.common.model.common.popcNum`).d('订单协议单号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('pcNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.inventoryName`).d('收货库房')}
                >
                  {getFieldDecorator('invInventoryIds')(
                    <LovModal
                      code="SODR.INVENTORY"
                      queryParams={{
                        enabledFlag: 1,
                        tenantId,
                        organizationId: getFieldValue('tmpOrganizationIds'),
                        invOrganizationId: getFieldValue('invOrganizationIds'),
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.need.from`).d('需求日期从')}
                >
                  {getFieldDecorator('queryParamNeedByDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('queryParamNeedByDateEnd') &&
                        moment(getFieldValue('queryParamNeedByDateEnd')).isBefore(
                          currentDate,
                          'day'
                        )
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.need.to`).d('需求日期至')}
                >
                  {getFieldDecorator('queryParamNeedByDateEnd')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('queryParamNeedByDateStart') &&
                        moment(getFieldValue('queryParamNeedByDateStart')).isAfter(
                          currentDate,
                          'day'
                        )
                      }
                      format={getDateFormat()}
                      placeholder={null}
                    />
                  )}
                </FormItem>
              </Col>
              {remote.process('detailFilterExtraForm', {
                form,
              })}
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm} style={{ marginRight: 8 }}>
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
      // </div>
    );
  }
}
