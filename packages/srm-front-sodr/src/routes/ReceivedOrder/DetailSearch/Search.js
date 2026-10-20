/*
 *
 * @date: 2018-11-28 11:08:22
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Input, Select, Row, Col, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';
import { getCurrentOrganizationId, getDateFormat, getUserOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import LovModal from '../../components/MultipleLov';
/**
 * 订单查找表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch // 搜索
 * @reactProps {Function} handleFormReset // 重置表单
 * @return React.element
 */
const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sodr/received-order/detail' })
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

  // componentDidMount() {
  //   const { onSearch } = this.props;
  //   if (onSearch) {
  //     onSearch();
  //   }
  // }

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

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const {
      handleReset,
      form: { resetFields },
    } = this.props;
    resetFields();
    handleReset();
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
   * 改变Lov时清空供应商地点
   * @param {Number} rowKey
   */
  @Bind()
  onChangeSupplierId(rowKey) {
    const { form } = this.props;
    if (!rowKey || form.getFieldsValue(['supplierId']) !== rowKey) {
      form.resetFields(['supplierSiteCode', 'supplierSiteName']);
    }
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
    const { form, enumMap = {}, customizeFilterForm } = this.props;
    const { flag = [], signStatus = [] } = enumMap;
    const { expandForm, organizationId, tenantId } = this.state;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    return customizeFilterForm(
      // <div className="table-list-search">
      {
        form,
        expand: expandForm,
        code: 'SODR.RECEIVED_ORDER_LIST.FILTER_DETAIL',
      },
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18} style={{ paddingRight: 5 }}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.displayPoNum`).d('订单号')}
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
                  label={intl.get(`sodr.common.model.common.displayLineNum`).d('行号')}
                >
                  {getFieldDecorator('displayLineNum')(
                    <Input disabled={!getFieldValue('displayPoNum')} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.urgentOrder`).d('是否加急')}
                >
                  {getFieldDecorator('urgentFlag')(
                    <Select allowClear>
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
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common..useFlag`).d('是否超期')}
                >
                  {getFieldDecorator('beyondFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      <Option value="1">{intl.get(`hzero.common.yes`).d('是')}</Option>
                      <Option value="0">{intl.get(`hzero.common.no`).d('否')}</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.customer.tag`).d('客户')}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTH.CUSTOMER"
                      textField="customCompanyName"
                      queryParams={{ organizationId }}
                      onChange={this.onChangeCompanyId}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.business.tag`).d('业务实体')}>
                  {getFieldDecorator('ouId')(
                    <Lov
                      code="SPRM.OU"
                      // disabled={!getFieldValue('companyId')}
                      queryParams={{
                        tenantId,
                        enabledFlag: 1,
                        companyId: getFieldValue('companyId'),
                      }}
                      textField="orgName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.order.type`).d('订单类型')}>
                  {getFieldDecorator('poTypeId')(
                    <Lov
                      code="SPUC_ORDER_TYPE"
                      queryParams={{ organizationId: tenantId, enabledFlag: 1 }}
                      textField="orderTypeCode"
                    />
                  )}
                </FormItem>
              </Col>
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.releaseNum`).d('发放号')}
                >
                  {getFieldDecorator('releaseNum')(<Input />)}
                </FormItem>
              </Col> */}
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.displayLineLocationNum`).d('发运号')}
                >
                  {getFieldDecorator('displayLineLocationNum')(<Input />)}
                </FormItem>
              </Col> */}
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.sendOrder.model.common.fromDocumentNum`).d('来源单据号')}
                >
                  {getFieldDecorator('fromDocumentNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.sendOrder.model.sendOrder.customerItemName`).d('客户物料')}
                >
                  {getFieldDecorator('customerItemName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.agentId`).d('采购员')}
                >
                  {getFieldDecorator('agentIds')(
                    <LovModal
                      code="SPFM.USER_AUTH.PURCHASE_AGENT_SUPPLIER"
                      queryParams={{ organizationId }}
                      textField="agentName"
                    />
                  )}
                </FormItem>
              </Col>
              {/* <Col span={8}>
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
              </Col> */}
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.erpStatus`).d('ERP状态')}
                >
                  {getFieldDecorator('erpStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {erpStatus.map((n) => (
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
                  label={intl.get(`sodr.sendOrder.model.common.closed`).d('已关闭')}
                >
                  {getFieldDecorator('closedFlag')(
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
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.urgentDateStart`).d('加急时间从')}
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
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.urgentDateEnd`).d('加急时间至')}
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
              </Col>
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.status.canceled`).d('已取消')}
                >
                  {getFieldDecorator('cancelledFlag')(
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
                  label={intl.get(`sodr.common.model.common.freeFlag`).d('是否免费')}
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
                  label={intl.get(`sodr.common.model.common.needByDateStart`).d('需求日期从')}
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
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.needByDateEnd`).d('需求日期至')}
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
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.promisedDateFrom`).d('承诺日期从')}
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
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.promisedDateTo`).d('承诺日期至')}
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
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.delayFlag`).d('交期满足需求')}
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
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.purchaseOrgName`).d('采购组织')}
                >
                  {getFieldDecorator('purchaseOrgIds')(
                    <LovModal code="HPFM.PURCHASE_ORGANIZATION" queryParams={{ organizationId }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.inventory`).d('库存组织')}
                >
                  {getFieldDecorator('invOrganizationIds')(
                    <LovModal
                      code="SSLM.INV_ORGANIZATION"
                      queryParams={{ organizationId }}
                      onChange={(value) =>
                        this.handleOriginationLovChange(value, 'invOrganizationIds')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.sendOrder.model.sendOrder.consignedFlag`).d('是否寄售')}
                >
                  {getFieldDecorator('consignedFlag')(
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
                  label={intl.get(`sodr.common.model.common.source.platform`).d('来源平台')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('poSourcePlatform')(
                    <Select allowClear>
                      {orderSource.map(n => (
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
                        invOrganizationId: getFieldValue('invOrganizationId'),
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
                htmlType="submit"
                type="primary"
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
