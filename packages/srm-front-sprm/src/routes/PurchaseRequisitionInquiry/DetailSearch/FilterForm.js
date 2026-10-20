/*
 * 按明细查询表单
 * @date: 2019-07-18
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  DatePicker,
  Icon,
  Tooltip,
  InputNumber,
} from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import { isFunction, isArray } from 'lodash';
import { connect } from 'dva';

import { SEARCH_FORM_ROW_LAYOUT, SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import {
  getDateTimeFormat,
  getDateFormat,
  getCurrentOrganizationId,
  createPagination,
} from 'utils/utils';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import ExecutedBysModal from './ExecutedBysModal';
import Multiple from './../../components/MultipleLov';

const { Option } = Select;
const commonPrompt = 'sprm.common.model.common';
@connect(({ purchaseRequisitionInquiry, loading }) => ({
  purchaseRequisitionInquiry,
  queryExecutedBysLoading: loading.effects['purchaseRequisitionInquiry/queryExecutedBys'],
}))
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sprm/purchase-requisition-inquiry-detail' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
      executedByName: undefined,
      executedBysVisible: false,
      selectedRows: [],
      selectedRowKeys: [],
    };
  }

  /**
   * 表单查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form, pagination } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch({ pageSize: pagination.pageSize });
        }
      });
    }
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    const { onResetSearchValues, form } = this.props;
    form.resetFields();
    this.setState({ executedByName: undefined });
    if (isFunction(onResetSearchValues)) {
      onResetSearchValues();
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
    const oldRows = selectedRows.filter(item => !currentRows.includes(item.userId));
    const newSelectedRow = [...new Set([...oldRows, ...addSelectedRows])];
    this.setState({
      selectedRows: newSelectedRow,
      selectedRowKeys,
    });
  }

  @Bind()
  fetchLovData(page = {}) {
    const { purchaseAgentId } = this.state;
    const { dispatch } = this.props;
    const values = this.form ? this.form.getFieldsValue() : {};
    dispatch({
      type: 'purchaseRequisitionInquiry/queryExecutedBys',
      payload: {
        page,
        purchaseAgentId,
        ...values,
      },
    }).then(res => {
      if (res) {
        this.setState({
          executedBysDataSource: res.content,
          executedBysPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 保存多选数据
   * @param {Array} record 弹窗中选择的多条采购负责人数据
   */
  @Bind()
  onSaveRecord() {
    const { form } = this.props;
    const { selectedRows } = this.state;
    const executorName = selectedRows?.map(o => o.userName);
    const executorBys = selectedRows?.map(o => o.userId);
    form.registerField('executedByName');
    // form.setFieldsValue({ executorBys, executedByName: executorName });
    form.setFieldsValue({ executorBys });
    this.setState({
      executedByName: executorName,
    });
    this.handleModal(false);
  }

  // 清空需求执行人
  @Bind()
  emitEmpty() {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ executedBys: undefined, executedByName: undefined });
    this.setState({
      executedByName: undefined,
    });
  }

  render() {
    const {
      executedByName,
      selectedRowKeys,
      executedBysVisible,
      executedBysDataSource,
      executedBysPagination,
    } = this.state;
    const {
      form,
      problemSource,
      autoOrderStatus,
      prStatus,
      loading,
      // abcTypeList,
      flag = [],
      executeBillType,
      queryExecutedBysLoading,
      customizeFilterForm,
      executionStrategyList,
      isOldUser,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const { expandForm, tenantId } = this.state;
    const statusFilterArr = [
      'PENDING',
      'SUBMIT_SYNC',
      'SUBMITTED',
      'APPROVED',
      'REJECTED',
      'ASSIGNED',
      'SUSPEND',
      'CLOSED',
      'CANCELLED',
      'CLOSEDING',
      'CANCELLEDING',
      'WORKFLOW_APPROVAL',
    ];

    const queryFields = [
      {
        field: 'loginName',
        label: intl.get(`sprm.common.model.common.user`).d('账户'),
      },
      {
        field: 'userName',
        label: intl.get(`sprm.common.model.common.userName`).d('用户名'),
      },
    ];
    const fieldsColumn = [
      {
        title: intl.get('sprm.common.model.common.user').d('账户'),
        dataIndex: 'loginName',
        align: 'left',
        width: 150,
      },
      {
        title: intl.get('sprm.common.model.common.userName').d('用户名'),
        dataIndex: 'userName',
        align: 'left',
        width: 150,
      },
    ];

    const lovClassNames = ['lov-input'];
    if (executedByName) {
      lovClassNames.push('lov-suffix');
    }
    const suffix = (
      <React.Fragment>
        <Icon key="clear" className="lov-clear" type="close-circle" onClick={this.emitEmpty} />
        <Icon
          key="search"
          type="search"
          onClick={() => this.handleModal(true)}
          style={{ cursor: 'pointer', color: '#666', marginLeft: '4px' }}
        />
      </React.Fragment>
    );

    const executedBysModalProps = {
      queryFields,
      fieldsColumn,
      selectedRowKeys,
      executedBysDataSource,
      executedBysPagination,
      queryExecutedBysLoading,
      fetchLovData: this.fetchLovData,
      handleModal: this.handleModal,
      onSaveRecord: this.onSaveRecord,
      handleRowSelect: this.handleRowSelect,
      executedBysVisible,
      onRef: ref => {
        this.form = ref.props.form;
      },
    };

    return (
      <React.Fragment>
        {customizeFilterForm(
          {
            code: 'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.DETAIL_SEARCH.FILTER', // 单元编码，必传
            form,
            expand: expandForm, // 控制查询表单收起展开状态的参数
          },
          <Form layout="inline" className="more-fields-search-form">
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={18}>
                <Row {...SEARCH_FORM_ROW_LAYOUT}>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`${commonPrompt}.prNum`).d('采购申请编号')}
                    >
                      {getFieldDecorator('displayPrNum')(<Input trim inputChinese={false} />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`${commonPrompt}.title`).d('标题')}
                    >
                      {getFieldDecorator('title')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get('hzero.common.status').d('状态')}
                    >
                      {getFieldDecorator('prLineStatusCode')(
                        <Select allowClear>
                          {prStatus
                            ?.filter(i => statusFilterArr.includes(i.value))
                            .map(item => (
                              <Select.Option key={item.value} value={item.value}>
                                {item.meaning}
                              </Select.Option>
                            ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源')}
                    >
                      {getFieldDecorator('prSourcePlatform')(
                        <Select allowClear>
                          {problemSource?.map(item => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`${commonPrompt}.creationDateStart`).d('创建时间从')}
                    >
                      {getFieldDecorator('createdDateStart')(
                        <DatePicker
                          showTime={{
                            defaultValue: moment('00:00:00', 'HH:mm:ss'),
                          }}
                          format={getDateTimeFormat()}
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
                      {...formItemLayout}
                      label={intl.get(`${commonPrompt}.creationDateTo`).d('创建时间至')}
                    >
                      {getFieldDecorator('createdDateEnd')(
                        <DatePicker
                          showTime={{
                            defaultValue: moment('23:59:59', 'HH:mm:ss'),
                          }}
                          disabledDate={currentDate =>
                            getFieldValue('createdDateStart') &&
                            moment(getFieldValue('createdDateStart')).isAfter(currentDate, 'day')
                          }
                          format={getDateTimeFormat()}
                          placeholder={null}
                        />
                      )}
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
                          format={getDateFormat()}
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
                          format={getDateFormat()}
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
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.urgentFlag`)
                        .d('是否加急')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('urgentFlag')(
                        <Select allowClear>
                          {flag?.map(n => (
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
                      label={intl.get(`sprm.common.model.common.projectNum`).d('项目号')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('projectNum')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${commonPrompt}.executeBillType`).d('执行单据类型')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('executeBillType')(
                        <Select allowClear>
                          {executeBillType?.map(n => (
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
                      label={intl.get(`${commonPrompt}.handlePerson`).d('需求执行人')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('executorBys', {
                        initialValue: isArray(executedByName) ? executedByName.join(',') : '',
                      })(
                        <Tooltip title={isArray(executedByName) ? executedByName.join() : ''}>
                          <Input
                            readOnly
                            suffix={suffix}
                            className={lovClassNames.join(' ')}
                            allowClear
                            value={isArray(executedByName) ? executedByName.join() : ''}
                          />
                        </Tooltip>
                      )}
                    </Form.Item>
                  </Col>
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
                      label={intl.get(`${commonPrompt}.buyType`).d('采购品类')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
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
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`${commonPrompt}.executionHeaderBillNum`).d('执行单据编号')}
                    >
                      {getFieldDecorator('executionHeaderBillNum')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员')}
                    >
                      {getFieldDecorator('purchaseAgentIds')(
                        <Multiple
                          code="SPUC.PURCHASE_AGENT"
                          queryParams={{ tenantId }}
                          oldValueField="purchaseAgentNames"
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`entity.roles.proposer`).d('申请人')}
                    >
                      {getFieldDecorator('prRequestedName')(<Input />)}
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
                          format={getDateFormat()}
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
                          format={getDateFormat()}
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
                      label={intl.get(`${commonPrompt}.executionStrategyCode`).d('执行策略')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('executionStrategyCode')(
                        <Select allowClear>
                          {(isOldUser
                            ? executionStrategyList?.filter(
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
                      label={intl.get(`sprm.common.model.wbs`).d('WBS元素')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('wbsCode')(
                        <Lov
                          code="SMDM.PURCHASE_WBS"
                          lovOptions={{ valueField: 'wbsCode' }}
                          queryParams={{
                            tenantId,
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`sprm.common.model.costCenter`).d('成本中心')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('costId')(
                        <Lov
                          code="SPRM.COST_CENTER"
                          queryParams={{
                            tenantId,
                          }}
                          lovOptions={{ valueField: 'costId' }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`entity.organization.class.purchase`).d('采购组织')}
                    >
                      {getFieldDecorator('purchaseOrgIds')(
                        <Multiple
                          code="HPFM.PURCHASE_ORGANIZATION"
                          queryParams={{ tenantId }}
                          oldValueField="purchaseOrgNames"
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get('entity.item.code').d('物料编码')}
                    >
                      {getFieldDecorator('itemId')(
                        <Lov
                          code="SODR.PO_ITEM"
                          queryParams={{ tenantId }}
                          textField="itemCode"
                          lovOptions={{ displayField: 'itemCode', valueField: 'itemId' }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`entity.roles.creator`).d('创建人')}
                    >
                      {getFieldDecorator('createdBys')(
                        <Multiple
                          code="SPCM.ACCEPT_USER"
                          queryParams={{
                            tenantId,
                          }}
                          oldValueField="createdBysNames"
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get('sprm.common.model.autoOrderStatus').d('自动创建PO状态')}
                    >
                      {getFieldDecorator('changeOrderCode')(
                        <Select allowClear>
                          {autoOrderStatus?.map(item => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get('sprm.common.model.autoAssignedFlag').d('是否自动分配成功')}
                    >
                      {getFieldDecorator('autoAssignedFlag')(
                        <Select allowClear>
                          {[
                            {
                              value: 1,
                              meaning: intl.get('hzero.common.button.success').d('成功'),
                            },
                            {
                              value: 0,
                              meaning: intl.get('hzero.common.status.failure').d('失败'),
                            },
                          ].map(item => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
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
                          format={getDateTimeFormat()}
                          disabledDate={currentDate =>
                            getFieldValue('assignedDateEnd') &&
                            moment(getFieldValue('assignedDateEnd')).isBefore(currentDate, 'day')
                          }
                          defaultTime={moment('00:00:00', 'HH:mm:ss')}
                        />
                      )}
                    </Form.Item>
                  </Col>
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
                          format={getDateTimeFormat()}
                          disabledDate={currentDate =>
                            getFieldValue('assignedDateStart') &&
                            moment(getFieldValue('assignedDateStart')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`${commonPrompt}.sqType`).d('申请类型')}
                    >
                      {getFieldDecorator('prTypeId')(
                        <Lov code="SPUC.PR_DEMAND_TYPE" queryParams={{ tenantId }} />
                      )}
                    </Form.Item>
                  </Col>
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
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
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
                    loading={loading}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
        <ExecutedBysModal {...executedBysModalProps} />
      </React.Fragment>
    );
  }
}
