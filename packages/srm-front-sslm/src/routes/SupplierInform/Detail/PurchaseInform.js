/**
 * PurchaseInform - 采购/财务信息
 * @date: 2019-12-11
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { isNumber, sum, isEmpty, pullAllBy, cloneDeep } from 'lodash';
import { Input, Form, Button, Modal, Row, Col, Spin, Select } from 'hzero-ui';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';

import notification from 'utils/notification';
// import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getEditTableData,
  delItemToPagination,
  delItemsToPagination,
  getCurrentOrganizationId,
  addItemToPagination,
} from 'utils/utils';

import styles from '@/routes/index.less';

const FormItem = Form.Item;
const { Option } = Select;

const tenantId = getCurrentOrganizationId();
@connect(({ supplierInform, loading }) => ({
  supplierInform,
  allLoading:
    loading.effects[`supplierInform/queryPurchaseHeadInform`] ||
    loading.effects[`supplierInform/queryPurchaseInform`] ||
    loading.effects['supplierInform/savePurchaseList'] ||
    loading.effects['supplierInform/deletePurchaseList'],
}))
@formatterCollections({
  code: ['sslm.supplierInform', 'spfm.importErp'],
})
@Form.create({ fieldNameProp: null })
export default class SupplyCapacityInform extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      frozenFlag: false,
      enabledSave: true,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.handPurchaseHeadInfo();
    this.handlePurchase();
  }

  // 查询采购财务头信息
  @Bind()
  handPurchaseHeadInfo() {
    const { dispatch, changeReqId } = this.props;
    dispatch({
      type: 'supplierInform/queryPurchaseHeadInform',
      payload: {
        changeReqId,
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.PURCHASE_HEAD',
      },
    });
  }

  /**
   * 查询采购/财务信息
   */
  @Bind()
  handlePurchase(page = {}) {
    const { dispatch, changeReqId } = this.props;
    dispatch({
      type: 'supplierInform/queryPurchaseInform',
      payload: {
        page,
        changeReqId,
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.PURCHASE_INFO',
      },
    });
  }

  // 监测数据是否变化    ：参数

  @Bind()
  checkData() {
    const {
      supplierInform: { purchaseList = [] },
    } = this.props;

    const payloadData = getEditTableData(purchaseList, ['_status', 'supplierSyncPfId']);
    const isEdit =
      !!purchaseList.find(n => n._status === 'create' || n._status === 'update') ||
      !this.state.enabledSave;
    if (isEdit) {
      if (!this.state.enabledSave || !isEmpty(payloadData)) {
        return payloadData;
      } else {
        notification.warning({
          message: intl
            .get('sslm.common.view.message.purchaseRequiredMsg')
            .d('采购/财务信息填写有误'),
        });
        return false;
      }
    } else {
      return [];
    }
  }

  /**
   * 批量保存数据
   */
  @Bind()
  handleSave() {
    const { dispatch } = this.props;
    const payload = this.checkData();
    if (!isEmpty(payload)) {
      dispatch({
        type: 'supplierInform/savePurchaseList',
        payload,
      }).then(res => {
        if (res) {
          notification.success();
          this.handlePurchase();
        }
      });
    }
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const {
      dispatch,
      changeReqId,
      supplierInform: { purchaseList = [], purchasePagination },
    } = this.props;
    dispatch({
      type: 'supplierInform/updateState',
      payload: {
        purchaseList: [
          {
            _status: 'create',
            supplierSyncPfId: uuidv4(),
            frozenFlag: 0,
            changeReqId,
          },
          ...purchaseList,
        ],
        purchasePagination: addItemToPagination(purchaseList.length, purchasePagination),
      },
    });
  }

  /**
   * 取消编辑行
   * @param {object} record 行数据
   */
  @Bind()
  handleCancelRow(record) {
    const {
      supplierInform: { purchaseList = [] },
      dispatch,
    } = this.props;
    const newPurchaseList = purchaseList.map(item => {
      if (item.supplierSyncPfId === record.supplierSyncPfId) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'supplierInform/updateState',
      payload: { purchaseList: newPurchaseList },
    });
    record.$form.resetFields();
  }

  /**
   * 清除新建的行
   * @param {object} record
   */
  @Bind()
  handleDeleteRow(record) {
    const {
      dispatch,
      supplierInform: { purchaseList = [], purchasePagination = {} },
    } = this.props;
    const newPurchaseList = purchaseList.filter(
      item => item.supplierSyncPfId !== record.supplierSyncPfId
    );
    dispatch({
      type: 'supplierInform/updateState',
      payload: {
        purchaseList: newPurchaseList,
        purchasePagination: delItemToPagination(purchaseList.length, purchasePagination),
      },
    });
  }

  /**
   * 批量编辑行
   * @param {object} record 每行数据
   */
  @Bind()
  handleEditRow(record) {
    const {
      supplierInform: { purchaseList = [] },
      dispatch,
    } = this.props;
    const newPurchaseList = purchaseList.map(item =>
      record.supplierSyncPfId === item.supplierSyncPfId ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: 'supplierInform/updateState',
      payload: { purchaseList: newPurchaseList },
    });
  }

  /**
   * 删除提示框
   */
  @Bind()
  deleteConfirm(onOk) {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  /**
   * 删除新建行数据
   */
  @Bind()
  deleteNewRows(newPurchaseList, newRows) {
    const {
      dispatch,
      supplierInform: { purchaseList = [], purchasePagination },
    } = this.props;
    dispatch({
      type: 'supplierInform/updateState',
      payload: {
        purchaseList: newPurchaseList,
        purchasePagination: delItemsToPagination(
          newRows.length,
          purchaseList.length,
          purchasePagination
        ),
      },
    });
    notification.success();
    this.setState({ selectedRowKeys: [] });
  }

  /**
   * 接口删除
   */
  @Bind()
  deleteExistRows(deleteRowKeys) {
    const {
      dispatch,
      supplierInform: { purchasePagination },
    } = this.props;
    dispatch({
      type: 'supplierInform/deletePurchaseList',
      payload: deleteRowKeys,
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({ selectedRowKeys: [] });
        this.handlePurchase(purchasePagination);
      }
    });
  }

  /**
   * 删除行
   */
  @Bind()
  handleDelete() {
    const {
      dispatch,
      supplierInform: { purchaseList, purchasePagination },
    } = this.props;
    const { selectedRowKeys } = this.state;
    const newPurchaseList = cloneDeep(purchaseList);
    // 根据selectedRowKeys查找出选中行
    const selectedRows = [];
    purchaseList.forEach(i => {
      selectedRowKeys.forEach(j => {
        if (i.supplierSyncPfId === j) {
          selectedRows.push(i);
        }
      });
    });

    if (!isEmpty(selectedRows)) {
      // 选中行的新建行
      const newRows = selectedRows.filter(n => n._status === 'create');
      // 选中行的已有行
      const existRows = selectedRows.filter(n => n._status !== 'create');
      const newList = pullAllBy(newPurchaseList, newRows, 'supplierSyncPfId');
      if (isEmpty(newRows)) {
        this.deleteConfirm(() => this.deleteExistRows(selectedRowKeys));
      } else if (isEmpty(existRows)) {
        this.deleteConfirm(() => this.deleteNewRows(newList, newRows));
      } else {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
          onOk: () => {
            dispatch({
              type: 'supplierInform/deletePurchaseList',
              payload: existRows.map(n => n.supplierSyncPfId),
            }).then(res => {
              if (res) {
                this.handlePurchase(purchasePagination);
                dispatch({
                  type: 'supplierInform/updateState',
                  payload: {
                    supplyCapacityList: newList,
                  },
                });
                notification.success();
                this.setState({ selectedRowKeys: [] });
              }
            });
          },
        });
      }
    }
  }

  /**
   * 采购冻结全选
   * @author  姚格格
   * @date    2020-04-15 12:31
   */
  @Bind()
  frozenFlagChange(e, record) {
    const {
      dispatch,
      supplierInform: { purchaseList },
    } = this.props;
    const { frozenFlag } = this.state;
    this.setState({
      frozenFlag: !frozenFlag,
      enabledSave: false,
    });

    if (record) {
      const newPurchaseList = purchaseList.map(i =>
        i.supplierSyncPfId === record.supplierSyncPfId
          ? { ...i, frozenFlag: i.frozenFlag ? 0 : 1 }
          : i
      );
      const newPurchaseListRest = [...purchaseList].filter(
        item => item._status === 'create' || item._status === 'update'
      );
      const flag = newPurchaseList.every(v => v.frozenFlag === 1);
      dispatch({
        type: 'supplierInform/updateState',
        payload: {
          purchaseList: newPurchaseList,
        },
      });
      this.setState({
        frozenFlag: newPurchaseListRest.length !== 0 ? flag : true,
      });
    } else {
      const newPurchaseList = [...purchaseList].map(list => ({
        ...list,
        frozenFlag: this.state.frozenFlag ? 0 : 1,
        _status: list._status || 'update',
        supplierSyncPfId: list.supplierSyncPfId,
      }));
      dispatch({
        type: 'supplierInform/updateState',
        payload: {
          purchaseList: newPurchaseList,
        },
      });
    }
  }

  /**
   * 选中项发生变化时的回调
   * @param {Array} selectedRowKeys
   */
  @Bind()
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  render() {
    const { selectedRowKeys } = this.state;
    const {
      supplierInform: { purchaseList = [], purchaseHeadInfo = {}, purchasePagination },
      changFlag,
      allLoading,
      form,
      customizeForm = () => {},
      customizeTable = () => {},
      code = {},
      pubEdit,
      customizeBtnGroup,
      detailHeader = {},
      savePermissionFlag = true,
    } = this.props;

    const {
      accountGroup,
      frozenFlag,
      ouCode,
      ouId,
      schemeGroup,
      accountGroupMeaning,
      reconciliationAccount,
      reconciliationAccountMeaning,
    } = purchaseHeadInfo;
    const { getFieldDecorator } = form;
    const disabled = changFlag || !savePermissionFlag;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: () => ({
        disabled,
      }),
    };

    const isSave = purchaseList.filter(o => o._status === 'create' || o._status === 'update');

    const columns = [
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.organizationCode').d('采购组织'),
        width: 150,
        dataIndex: 'organizationCode',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { setFieldsValue } = record.$form;
            record.$form.getFieldDecorator('purchaseOrgId', {
              initialValue: record.purchaseOrgId,
            });
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('organizationCode', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.supplierInform.model.supplierInform.organizationCode')
                          .d('采购组织'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    disabled={disabled}
                    code="SPFM.USER_AUTH.PURORG_CODE"
                    textValue={val}
                    lovOptions={{
                      displayField: 'organizationCode',
                      valueField: 'organizationCode',
                    }}
                    onChange={(value, lovRecord) => {
                      setFieldsValue({
                        organizationName: lovRecord.organizationName,
                        purchaseOrgId: lovRecord.purchaseOrgId,
                      });
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl
          .get('sslm.supplierInform.model.supplierInform.organizationName')
          .d('采购组织名称'),
        width: 120,
        dataIndex: 'organizationName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('organizationName', {
                  initialValue: val,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.purchaseAgent').d('采购员'),
        width: 150,
        dataIndex: 'purchaseAgentName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('purchaseAgentId', {
                  initialValue: record.purchaseAgentId,
                })(
                  <Lov
                    disabled={disabled}
                    code="SMDM.PURCHASE_AGENT"
                    textValue={val}
                    queryParams={{ tenantId }}
                    lovOptions={{
                      displayField: 'purchaseAgentName',
                      valueField: 'purchaseAgentId',
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.termName').d('付款条款'),
        width: 150,
        dataIndex: 'termName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('termId', {
                  initialValue: record.termId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sslm.supplierInform.model.supplierInform.termName`)
                          .d('付款条款'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    disabled={disabled}
                    code="SSLM.PAYMENT.TERM"
                    textValue={val}
                    queryParams={{ tenantId }}
                    lovOptions={{ displayField: 'termName', valueField: 'termId' }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.payMethod').d('付款方式'),
        width: 160,
        align: 'left',
        dataIndex: 'typeCode',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('typeCode', {
                  initialValue: record.typeCode,
                })(
                  <Lov
                    disabled={disabled}
                    code="SMDM.PAYMENT_TYPE"
                    textValue={val}
                    lovOptions={{ displayField: 'typeName', valueField: 'typeCode' }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.typeName;
          }
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.internationalCondition').d('国贸条件'),
        width: 160,
        dataIndex: 'tradeTermsMeaning',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('tradeTerms', {
                initialValue: record.tradeTerms,
              })(
                <Select allowClear disabled={disabled} style={{ width: '100%' }}>
                  {tradeTerms.map(item => (
                    <Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('spfm.importErp.model.importErp.internationalSite').d('国贸地点'),
        width: 160,
        dataIndex: 'tradeTermsSite',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('tradeTermsSite', {
                initialValue: val,
              })(<Input disabled={disabled} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.currencyCode').d('订单货币'),
        width: 150,
        dataIndex: 'currencyName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('currencyCode', {
                  initialValue: record.currencyCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.supplierInform.model.supplierInform.currencyCode')
                          .d('订单货币'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SMDM.CURRENCY"
                    disabled={disabled}
                    lovOptions={{ displayField: 'currencyName', valueField: 'currencyCode' }}
                    textValue={record.currencyName}
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.currencyName;
          }
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.controlAccount').d('统驭科目'),
        width: 150,
        dataIndex: 'reconciliationAccount',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('reconciliationAccount', {
                  initialValue: record.reconciliationAccount,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.supplierInform.model.supplierInform.controlAccount')
                          .d('统驭科目'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SSLM.RECONCILIATION_ACCOUNT"
                    queryParams={{ tenantId }}
                    disabled={disabled}
                    textValue={record.reconciliationAccountMeaning}
                    lovOptions={{
                      displayField: 'meaning',
                      valueField: 'value',
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.reconciliationAccountMeaning;
          }
        },
      },
      {
        title: intl.get(`sslm.supplierInform.model.supplierInform.sortNumber`).d('排序码'),
        width: 150,
        dataIndex: 'sortNumber',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('sortNumber', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sslm.supplierInform.model.supplierInform.sortNumber`)
                          .d('排序码'),
                      }),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                    {
                      pattern: /^\d+$/,
                      message: intl
                        .get(`sslm.supplierInform.view.message.patternValidate`)
                        .d('请输入正整数'),
                    },
                  ],
                })(<Input disabled={disabled} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: (
          <span>
            {intl.get(`sslm.supplierInform.model.purchase.frozenFlag`).d('采购冻结')}
            <Checkbox
              style={{ marginLeft: 10 }}
              onChange={e => this.frozenFlagChange(e)}
              checked={this.state.frozenFlag}
              // disabled={purchaseList.length === 0 || purchaseList[0]._status !== 'create'}
              disabled={disabled}
            />
          </span>
        ),
        width: 120,
        dataIndex: 'frozenFlag',
        render: (val, record) => {
          return (
            <Form.Item>
              {getFieldDecorator(`frozenFlag#${record.supplierSyncPfId}`, {
                initialValue: val,
              })(
                <Checkbox
                  onChange={e => this.frozenFlagChange(e, record)}
                  checked={val}
                  style={{ marginLeft: 58 }}
                  disabled={disabled}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 75,
        render: (_, record) => (
          <span className="action-link">
            {record._status === 'create' ? (
              <a
                disabled={changFlag}
                onClick={() => {
                  this.handleDeleteRow(record);
                }}
              >
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            ) : record._status === 'update' ? (
              <a
                onClick={() => {
                  this.handleCancelRow(record);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                disabled={pubEdit ? !pubEdit : changFlag || !savePermissionFlag}
                onClick={() => {
                  this.handleEditRow(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };

    const { planGroups = [], paymentFrozenList = [], tradeTerms = [] } = code;
    const { changeLevel } = detailHeader;
    return (
      <Spin spinning={allLoading || false}>
        {customizeForm(
          {
            code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.PURCHASE_HEAD', // 必传，和unitCode一一对应
            form, // 无论个性化单元是否只读，均必传
            dataSource: purchaseHeadInfo, // 必传，从后端接口获取到的数据
            readOnly: pubEdit ? !pubEdit : disabled,
          },
          <Form className="ued-edit-form">
            <Row gutter={24} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.importErp.model.importErp.planGroups').d('计划组')}
                >
                  {getFieldDecorator('programmeGroups', {
                    initialValue: purchaseHeadInfo.programmeGroups,
                  })(
                    <Select allowClear style={{ width: '100%' }} disabled={disabled}>
                      {planGroups.map(item => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
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
                    .get('sslm.supplierInform.model.supplierInform.schemeGroup')
                    .d('方案组')}
                >
                  {getFieldDecorator('schemeGroup', {
                    initialValue: schemeGroup,
                  })(<Input disabled={disabled} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierInform.model.supplierInform.accountGroup')
                    .d('账户组')}
                >
                  {getFieldDecorator('accountGroup', {
                    initialValue: accountGroup,
                  })(
                    <Lov
                      code="SSLM.SYNC_ACCOUNT_GROUP"
                      disabled={disabled}
                      queryParams={{ tenantId }}
                      textValue={accountGroupMeaning}
                      lovOptions={{
                        displayField: 'meaning',
                        valueField: 'value',
                      }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierInform.model.supplierInform.controlAccount')
                    .d('统驭科目')}
                >
                  {getFieldDecorator('reconciliationAccount', {
                    initialValue: reconciliationAccount,
                  })(
                    <Lov
                      code="SSLM.RECONCILIATION_ACCOUNT"
                      disabled={disabled}
                      queryParams={{ tenantId }}
                      textValue={reconciliationAccountMeaning}
                      lovOptions={{
                        displayField: 'meaning',
                        valueField: 'value',
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierInform.model.supplierInform.erpCompanyCode')
                    .d('erp公司代码')}
                >
                  {getFieldDecorator('ouId', {
                    initialValue: ouId,
                  })(
                    <Lov
                      code="SPFM.USER_AUTH.OU_CODE"
                      disabled={disabled}
                      textValue={ouCode}
                      lovOptions={{
                        displayField: 'ouCode',
                        valueField: 'ouId',
                      }}
                    />
                  )}
                  {changeLevel === 'GROUP' && !changFlag && !savePermissionFlag && (
                    <div style={{ fontSize: '12px', color: '#999', marginLeft: '-60%' }}>
                      {intl
                        .get('sslm.supplierInform.model.supplierInform.interMessage')
                        .d('变更后此ERP公司代码将更新至集团下所有公司。')}
                    </div>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('spfm.importErp.model.importErp.termName').d('付款条款')}
                >
                  {getFieldDecorator('termId', {
                    initialValue: purchaseHeadInfo.termId,
                  })(
                    <Lov
                      code="SMDM.PAYMENT.TERM"
                      textValue={purchaseHeadInfo.termName}
                      queryParams={{ tenantId }}
                      lovOptions={{
                        displayField: 'termName',
                        valueField: 'termId',
                      }}
                      disabled={disabled}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierInform.model.supplierInform.accountFlag')
                    .d('记账冻结')}
                >
                  {getFieldDecorator('frozenFlag', {
                    initialValue: frozenFlag || 0,
                  })(<Checkbox disabled={disabled} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('spfm.importErp.model.importErp.paymentFreezeCode')
                    .d('付款冻结代码')}
                >
                  {getFieldDecorator('paymentFrozen', {
                    initialValue: purchaseHeadInfo.paymentFrozen,
                  })(
                    <Select allowClear style={{ width: '100%' }} disabled={disabled}>
                      {paymentFrozenList.map(item => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
        <div
          className={styles['table-list-btn']}
          style={{ display: changFlag || !savePermissionFlag ? 'none' : 'block' }}
        >
          {customizeBtnGroup(
            {
              code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.PURCHASE_BTN',
            },
            [
              <Button
                data-name="delete"
                onClick={this.handleDelete}
                disabled={isEmpty(selectedRowKeys)}
                loading={allLoading}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>,
              <Button
                data-name="save"
                loading={allLoading}
                onClick={this.handleSave}
                disabled={isEmpty(isSave)}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>,
              <Button
                type="primary"
                data-name="create"
                loading={allLoading}
                onClick={this.handleAdd}
              >
                {intl.get(`hzero.common.button.create`).d('新建')}
              </Button>,
            ]
          )}
        </div>
        {customizeTable(
          {
            code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.PURCHASE_INFO',
            clearCache: (a, b, cb) => {
              if (a !== b) cb(a);
            },
            useNewValid: true,
          },
          <EditTable
            bordered
            rowKey="supplierSyncPfId"
            columns={columns}
            rowSelection={changFlag ? null : rowSelection}
            dataSource={purchaseList}
            scroll={{ x: scrollX }}
            pagination={purchasePagination}
            loading={allLoading}
            onChange={this.handlePurchase}
          />
        )}
      </Spin>
    );
  }
}
