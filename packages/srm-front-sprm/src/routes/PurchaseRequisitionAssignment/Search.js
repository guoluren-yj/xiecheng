/**
 * Search - 需求分配
 * @date: 2019-07-11
 * @author: zhutian <tian.zhu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input, Select, DatePicker, Button, InputNumber } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  DEFAULT_DATETIME_FORMAT,
  DEFAULT_DATE_FORMAT,
} from 'utils/constants';
import MultipleLov from './../components/MultipleLov';

const commonPrompt = 'sprm.common.model.common';
const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
/**
 * 需求分配查询表单组件
 * @export
 * @class Search
 * @extends {Component} - React.Component
 * @reactProps {object} form - 表单对象
 * @returns React.element
 */
@Form.create({ fieldNameProp: null })
export default class Search extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      collapsed: false,
      tenantId: getCurrentOrganizationId(),
      executedByName: undefined,
      executedBysVisible: false,
      selectedRows: [],
      selectedRowKeys: [],
    };
  }

  @Bind()
  handleSearch() {
    const { onSearch, pagination } = this.props;
    if (isFunction(onSearch)) {
      onSearch({ pageSize: pagination.pageSize });
    }
  }

  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  toggleCollapse() {
    const { collapsed } = this.state;
    this.setState({
      collapsed: !collapsed,
    });
  }

  // 需求执行人Modal
  @Bind()
  handleModal(executedBysVisible) {
    // const { purchaseAgentId } = this.state;
    // if (!purchaseAgentId) return;
    if (executedBysVisible) {
      this.setState(
        {
          executedBysVisible,
        },
        () => {
          this.fetchLovData();
        }
      );
    } else {
      this.setState({
        selectedRows: [],
        selectedRowKeys: [],
        executedBysVisible,
      });
    }
  }

  /**
   * 改变多选框
   */
  @Bind()
  handleRowSelect(selectedRowKeys, addSelectedRows) {
    const { selectedRows, executedBysDataSource = [] } = this.state;
    const currentRows = executedBysDataSource?.map(item => item.userId);
    const oldRows = selectedRows?.filter(item => !currentRows.includes(item.userId));
    const newSelectedRow = [...new Set([...oldRows, ...addSelectedRows])];
    this.setState({
      selectedRows: newSelectedRow,
      selectedRowKeys,
    });
  }

  render() {
    const { collapsed, tenantId } = this.state;
    const {
      form: { getFieldDecorator, getFieldValue },
      prSourcePlatformList = [],
      projectCategoryList = [],
      // abcTypeList = [],
      yesAndNoList = [],
      executionStatusList = [],
      executionStrategyList = [],
      customizeFilterForm,
      form,
      prLineStatusCode,
      isOldUser,
    } = this.props;
    return (
      <React.Fragment>
        {customizeFilterForm(
          {
            code: 'SPRM.PURCHASE_REQUISITION_ASSIGNMENT.LIST.FILTER_S', // 单元编码，必传
            form,
            expand: collapsed,
          },
          <Form layout="inline" className="more-fields-search-form">
            <Row>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.prNum`).d('采购申请编号')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('displayPrNum')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`${commonPrompt}.title`).d('标题')}
                    >
                      {getFieldDecorator('title')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('entity.item.code').d('物料编码')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('itemCode')(
                        <Lov
                          code="SODR.PO_ITEM"
                          queryParams={{ tenantId }}
                          onChange={(_, lovRecord) => {
                            form.registerField('itemId');
                            form.setFieldsValue({ itemId: lovRecord.itemId });
                          }}
                          lovOptions={{ valueField: 'itemCode' }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ display: collapsed ? 'block' : 'none' }}>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('prSourcePlatform')(
                        <Select allowClear>
                          {prSourcePlatformList?.map(item => (
                            <Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('entity.roles.creator').d('创建人')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('creatorName')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.neededDateStart`).d('需求日期从')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('neededDateStart')(
                        <DatePicker
                          placeholder={null}
                          format={DEFAULT_DATE_FORMAT}
                          disabledDate={currentDate =>
                            getFieldValue('neededDateEnd') &&
                            moment(getFieldValue('neededDateEnd')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.neededDateEnd`).d('需求日期至')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('neededDateEnd')(
                        <DatePicker
                          placeholder={null}
                          format={DEFAULT_DATE_FORMAT}
                          disabledDate={currentDate =>
                            getFieldValue('neededDateStart') &&
                            moment(getFieldValue('neededDateStart')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.applicant`).d('申请人')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('prRequestedName')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.handleStatus`).d('执行状态')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('executionStatusCode')(
                        <Select allowClear>
                          {executionStatusList?.map(item => (
                            <Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.processor`).d('处理人')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('executorName')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.unitName`).d('所属部门')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('unitId')(
                        <Lov code="SPRM.USER_DEPARTMENT" queryParams={{ tenantId }} />
                      )}
                    </Form.Item>
                  </Col>
                  {/* <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.itemAbcClass`).d('物料ABC属性')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('itemAbcClass')(
                        <Select allowClear>
                          {abcTypeList.map((item) => (
                            <Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col> */}

                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.sqType`).d('申请类型')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('prTypeId')(
                        <Lov
                          code="SPUC.PR_DEMAND_TYPE"
                          queryParams={{
                            tenantId,
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  {/* <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.buyType`).d('采购品类')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('categoryId')(
                        <Lov
                          code="SMDM.TREE_ITEM_CATEGORY"
                          queryParams={{
                            tenantId,
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col> */}
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('entity.company.tag').d('公司')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('companyId')(
                        <Lov
                          code="SPFM.USER_AUTH.COMPANY"
                          queryParams={{
                            tenantId,
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.createdDateStart`).d('创建日期从')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('createdDateStart')(
                        <DatePicker
                          showTime={{
                            defaultValue: moment('00:00:00', 'HH:mm:ss'),
                          }}
                          format={DEFAULT_DATETIME_FORMAT}
                          placeholder={null}
                          disabledDate={currentDate =>
                            getFieldValue('createdDateEnd') &&
                            moment(getFieldValue('createdDateEnd')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.createdDateEnd`).d('创建日期至')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('createdDateEnd')(
                        <DatePicker
                          showTime={{
                            defaultValue: moment('23:59:59', 'HH:mm:ss'),
                          }}
                          format={DEFAULT_DATETIME_FORMAT}
                          placeholder={null}
                          disabledDate={currentDate =>
                            getFieldValue('createdDateStart') &&
                            moment(getFieldValue('createdDateStart')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.projectCategory`).d('项目类别')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('projectCategory')(
                        <Select allowClear>
                          {projectCategoryList?.map(item => (
                            <Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.handlePerson`).d('需求执行人')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('executorBys')(
                        <MultipleLov
                          code="SSLM.KPI_USER"
                          queryParams={{ tenantId }}
                          lovOptions={{ displayField: 'userName' }}
                          oldValueField="executedByName"
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`${commonPrompt}.executionHeaderBillNum`).d('执行单据编号')}
                    >
                      {getFieldDecorator('executionHeaderBillNum')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`${commonPrompt}.executionHeaderBillNum`).d('执行单据编号')}
                    >
                      {getFieldDecorator('executionHeaderBillNum')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.requestDateStart`).d('申请日期从')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('requestDateStart')(
                        <DatePicker
                          placeholder={null}
                          format={DEFAULT_DATE_FORMAT}
                          disabledDate={currentDate =>
                            getFieldValue('requestDateEnd') &&
                            moment(getFieldValue('requestDateEnd')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.requestDateEnd`).d('申请日期至')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('requestDateEnd')(
                        <DatePicker
                          placeholder={null}
                          format={DEFAULT_DATE_FORMAT}
                          disabledDate={currentDate =>
                            getFieldValue('requestDateStart') &&
                            moment(getFieldValue('requestDateStart')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`${commonPrompt}.lineNumber`).d('行号')}
                    >
                      {getFieldDecorator('displayLineNum')(<InputNumber />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.executionStrategyCode`).d('执行策略')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('executionStrategyCode')(
                        <Select allowClear>
                          {(isOldUser
                            ? executionStrategyList.filter(
                                item =>
                                  item.value !== 'BEFORE_SOURCE_AFTER_ORDER' &&
                                  item.value !== 'SOURCE_AND_ORDER'
                              )
                            : executionStrategyList
                          )?.map(item => (
                            <Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`entity.organization.class.purchaseAgentName`).d('采购员')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('purchaseAgentIds')(
                        <MultipleLov
                          code="SPUC.PURCHASE_AGENT"
                          queryParams={{ tenantId }}
                          lovOptions={{ displayField: 'purchaseAgentName' }}
                          oldValueField="purchaseAgentNames"
                        />
                      )}
                    </Form.Item>
                  </Col>
                  {prLineStatusCode !== 'APPROVED' && (
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`${commonPrompt}.assignedDateStart`).d('分配日期从')}
                        {...SEARCH_FORM_ITEM_LAYOUT}
                      >
                        {getFieldDecorator('assignedDateStart')(
                          <DatePicker
                            showTime={{
                              defaultValue: moment('00:00:00', 'HH:mm:ss'),
                            }}
                            placeholder={null}
                            format={DEFAULT_DATETIME_FORMAT}
                            disabledDate={currentDate =>
                              getFieldValue('assignedDateEnd') &&
                              moment(getFieldValue('assignedDateEnd')).isBefore(currentDate, 'day')
                            }
                          />
                        )}
                      </Form.Item>
                    </Col>
                  )}
                  {prLineStatusCode !== 'APPROVED' && (
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`${commonPrompt}.assignedDateEnd`).d('分配日期至')}
                        {...SEARCH_FORM_ITEM_LAYOUT}
                      >
                        {getFieldDecorator('assignedDateEnd')(
                          <DatePicker
                            showTime={{
                              defaultValue: moment('23:59:59', 'HH:mm:ss'),
                            }}
                            placeholder={null}
                            format={DEFAULT_DATETIME_FORMAT}
                            disabledDate={currentDate =>
                              getFieldValue('assignedDateStart') &&
                              moment(getFieldValue('assignedDateStart')).isAfter(currentDate, 'day')
                            }
                          />
                        )}
                      </Form.Item>
                    </Col>
                  )}
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.supplierName`).d('供应商名称')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('tempKey')(
                        <Lov
                          code="SPRM.SUPPLIER"
                          queryParams={{ tenantId }}
                          lovOptions={{ displayField: 'displaySupplierName' }}
                          onChange={(val, lovRecord) => {
                            const { supplierCompanyId, supplierId, supplierTenantId } = lovRecord;
                            form.registerField('supplierCompanyId');
                            form.registerField('supplierId');
                            form.registerField('supplierTenantId');
                            form.setFieldsValue({
                              supplierCompanyId,
                              supplierId,
                              supplierTenantId,
                            });
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.urgentFlag`).d('是否加急')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('urgentFlag')(
                        <Select allowClear>
                          {yesAndNoList?.map(item => (
                            <Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button onClick={this.toggleCollapse}>
                    {collapsed
                      ? intl.get('hzero.common.button.collected').d('收起查询')
                      : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
                  </Button>
                  <Button data-code="reset" onClick={this.handleReset}>
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
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </React.Fragment>
    );
  }
}
