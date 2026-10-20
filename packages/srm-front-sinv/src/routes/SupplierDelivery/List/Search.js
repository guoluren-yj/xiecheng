/**
 * Search - 订单查找表单
 * @date: 2018-12-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Input, Select, Col, Row, DatePicker, Tooltip, Icon } from 'hzero-ui';
// import { Icon } from 'choerodon-ui';
import Lov from 'components/Lov';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import moment from 'moment';

import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import {
  getUserOrganizationId,
  getCurrentTenant,
  getDateFormat,
  getDateTimeFormat,
} from 'utils/utils';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import LovModal from '../../components/MultipleLov';

// import SearchDrawer from './SearchDrawer';

/**
 * 订单查找表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch  搜索
 * @reactProps {Function} handleFormReset  重置表单
 * @reactProps {Function} toggleForm  展开查询条件
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
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sinv/supplier-delivery/list' })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      moreSearchParams: false,
      organizationId: getUserOrganizationId(),
      tenantNum: getCurrentTenant().tenantNum,
    };
  }
  /**
   * 查询方法
   */

  @Bind()
  handleSearch() {
    const { onFilterChange } = this.props;
    if (isFunction(onFilterChange)) {
      onFilterChange();
    }
  }
  /**
   * 重置表单
   */

  @Bind()
  handleFormReset() {
    const { form, handleReset } = this.props;
    form.resetFields();
    form.setFieldsValue({
      creationDateFrom: null,
      creationDateTo: null,
    });
    if (handleReset) {
      handleReset();
    }
  }

  /**
   * 改变state中[field]对应字段的值
   * @param {String} field // 值对应的key
   * @param {Boolean} flag // 值
   */
  @Bind()
  handleMoreParamsVisible(field, flag) {
    this.setState({ [field]: !!flag });
  }
  /**
   * 滑窗关闭并搜索
   */

  @Bind()
  handleSearchMore() {
    this.setState({ moreSearchParams: false }, this.handleSearch());
  }
  /**
   * 关闭滑窗搜索
   */

  @Bind()
  handleHideDrawer() {
    this.handleMoreParamsVisible('moreSearchParams', false);
  }

  render() {
    const { form, enumMap, customizeFilterForm } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { moreSearchParams, organizationId, tenantNum } = this.state;
    const { printStatus, type = [], importStatus = [], status = [], cancelStatus = [] } = enumMap;
    // const searchDrawerProps = {
    //   form,
    //   enumMap,
    //   customizeForm,
    //   destroyOnClose: true,
    //   visible: moreSearchParams,
    //   onHideDrawer: this.handleHideDrawer,
    //   onSearch: this.handleSearchMore,
    //   onReset: this.handleFormReset,
    // };
    return customizeFilterForm(
      {
        form,
        expand: moreSearchParams,
        code: 'SINV.SUPPLIER_DELIVERY_LIST.QUERY',
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.asnNum`).d('送货单号')}
                >
                  {getFieldDecorator('asnNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.displayPoNum`).d('订单号')}
                >
                  {getFieldDecorator('displayPoNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sinv.supplierDelivery.model.supplierDelivery.printStatusFlag`)
                    .d('是否可打印')}
                >
                  {getFieldDecorator('printStatusFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      {(printStatus || []).map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row
              {...SEARCH_FORM_ROW_LAYOUT}
              style={{ display: moreSearchParams ? 'block' : 'none' }}
            >
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get('entity.customer.tag').d('客户')}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SINV.ASN_CUSTOMER"
                      textField="companyName"
                      queryParams={{ organizationId }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get('entity.company.tag').d('公司')}>
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov code="SPFM.USER_AUTHORITY_COMPANY" queryParams={{ organizationId }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型')}
                >
                  {getFieldDecorator('asnTypeCode')(
                    <Select style={{ width: '100%' }} allowClear>
                      {type.map((n) => (
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
                  label={intl
                    .get(`sinv.supplierDelivery.model.supplierDelivery.asnStatus`)
                    .d('送货单状态')}
                >
                  {getFieldDecorator('asnStatus')(
                    <Select style={{ width: `100%` }} allowClear>
                      {tenantNum === 'SRM-SQUIRRELS'
                        ? status.map((n) => {
                            return (
                              <Option key={n.value} value={n.value}>
                                {n.meaning}
                              </Option>
                            );
                          })
                        : status.map((n) => {
                            if (n.value !== 'CONFIRMED') {
                              return (
                                <Option key={n.value} value={n.value}>
                                  {n.meaning}
                                </Option>
                              );
                            }
                            return false;
                          })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员')}
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
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sinv.supplierDelivery.model.supplierDelivery.submitStatus`)
                    .d('导入状态')}
                >
                  {getFieldDecorator('submitSyncStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {importStatus.map((n) => (
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
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                >
                  {getFieldDecorator('creationDateFrom', {
                    initialValue: moment().subtract(1, 'quarters'),
                  })(
                    <DatePicker
                      defaultValue={moment().subtract(1, 'quarters')}
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
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
                  {getFieldDecorator('creationDateTo', {
                    initialValue: moment(),
                  })(
                    <DatePicker
                      defaultValue={moment()}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
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
                  label={intl.get(`sinv.common.model.common.shipDateFrom`).d('发货日期从')}
                >
                  {getFieldDecorator('shipDateFrom')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('shipDateTo') &&
                        moment(getFieldValue('shipDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.shipDateTo`).d('发货日期至')}
                >
                  {getFieldDecorator('shipDateTo')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('shipDateFrom') &&
                        moment(getFieldValue('shipDateFrom')).isAfter(currentDate, 'day')
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
                    .get(`sinv.common.model.common.expectedArriveTimeFrom`)
                    .d('预计到货时间从')}
                >
                  {getFieldDecorator('expectedArriveDateFrom')(
                    <DatePicker
                      format={getDateTimeFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('expectedArriveDateTo') &&
                        moment(getFieldValue('expectedArriveDateTo')).isBefore(currentDate, 'time')
                      }
                      showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sinv.common.model.common.expectedArriveTimeTo`)
                    .d('预计到货时间至')}
                >
                  {getFieldDecorator('expectedArriveDateTo')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('expectedArriveDateFrom') &&
                        moment(getFieldValue('expectedArriveDateFrom')).isAfter(currentDate, 'time')
                      }
                      showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
                      format={getDateTimeFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.cancelStatus`).d('取消状态')}
                >
                  {getFieldDecorator('cancelStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {cancelStatus.map((n) => (
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
                  label={intl.get(`sinv.common.model.common.createByName`).d('创建人')}
                >
                  {getFieldDecorator('createByName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.supplierDelivery.model.common.expressNum`).d('物流单号')}
                >
                  {getFieldDecorator('expressNum')(<Input inputChinese={false} maxLength={150} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.organizationName`).d('收货组织')}
                >
                  {getFieldDecorator('invOrganizationName')(<Input />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => this.handleMoreParamsVisible('moreSearchParams', !moreSearchParams)}
              >
                {moreSearchParams
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Tooltip
                placement="top"
                title={intl
                  .get('hzero.common.button.searchTip')
                  .d('默认查询3个月内创建的单据，可在【更多查询】下修改查询时间范围')}
              >
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                  <Icon style={{ color: '#fff', margin: '0 0 1px 4px' }} type="question-circle-o" />
                  {/* <Icon
                    style={{ color: '#fff', margin: '0 0 1px 2px' }}
                    type="help_outline"
                    width={8}
                    height={8}
                  /> */}
                </Button>
              </Tooltip>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
