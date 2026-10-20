/*
 * OrderConfigModal - 订单配置表弹窗
 * @date: 2018/10/09 14:56:50
 * @author: LZH<zhaohui-liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Button, Form, Input, Row, Col, Select, Icon, Tooltip } from 'hzero-ui';
// import { Select } from 'choerodon-ui/pro';
import uuid from 'uuid/v4';
import { isEmpty, cloneDeep, isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import Checkbox from 'components/Checkbox';
import notification from 'utils/notification';
import { getMeaningCodes, getAutoSignEnable } from '@/services/configServerService';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import {
  createPagination,
  getCurrentOrganizationId,
  getEditTableData,
  addItemToPagination,
} from 'utils/utils';
import EditTable from 'components/EditTable';
import styles from './index.less';

const FormItem = FormItem;
// 变更需同步结算池字段不可编辑
const settleValidateDisabledFields = [
  ['SODR_PO_HEADER', 'currency_code'],
  ['SODR_PO_LINE', 'quantity'],
  ['SODR_PO_LINE', 'unit_price'],
  ['SODR_PO_LINE', 'entered_tax_included_price'],
  ['SODR_PO_LINE', 'tax_rate'],
  ['SODR_PO_LINE', 'unit_price_batch'],
  ['SODR_PO_LINE', 'uom_id'],
  ['SODR_PO_LINE', 'item_code'],
  ['SODR_PO_LINE', 'currency_code'],
  ['SODR_PO_LINE_LOCATION', 'inv_organization_id'],
  ['SODR_PO_LINE_LOCATION', 'inv_inventory_id'],
  ['SODR_PO_LINE_LOCATION', 'inv_location_id'],
  ['SODR_PO_LINE_LOCATION', 'closed_flag'],
  ['SODR_PO_LINE_LOCATION', 'cancelled_flag'],
];

@Form.create({ fieldNameProp: null })
@connect(({ loading, configServer }) => ({
  saveOrderConfigListLoading: loading.effects['configServer/saveOrderConfigList'],
  deleteOrderConfigListLoading: loading.effects['configServer/deleteOrderConfigList'],
  fetchOrderConfigListLoading: loading.effects['configServer/fetchOrderConfigList'],
  configServer,
}))
export default class OrderConfig extends Component {
  state = {
    dataSource: [], // 没有id的创建uuid数组
    dataContent: [], // 原始数据，没有做任何修改
    selectedRows: [], // 选中项
    meaningCodes: [], // 字段编码
    pagination: {},
    autoSignFlag: false, // 业务规则定义是否开启订单自动转协议
  };

  componentDidMount() {
    this.handleSearch();
    getMeaningCodes().then(res => {
      this.setState({ meaningCodes: res });
    });
    getAutoSignEnable().then(res => {
      this.setState({ autoSignFlag: res });
    });
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, form } = this.props;
    const fieldName = form.getFieldValue('fieldName');
    dispatch({
      type: 'configServer/fetchOrderConfigList',
      payload: {
        page,
        fieldName,
      },
    }).then(res => {
      if (res) {
        const dataList = cloneDeep(
          res.content.map(n => ({ ...n, _status: 'update', rowId: uuid() }))
        );
        form.resetFields();
        form.setFieldsValue({ fieldName });
        dataList.forEach(e => {
          if (!e.poChangeConfigId) {
            e.poChangeConfigId = uuid();
          }
        });
        this.setState({
          dataSource: dataList,
          dataContent: res.content,
          pagination: createPagination(res),
        });
        dispatch({
          type: 'configServer/updateState',
          payload: { orderConfigPagination: createPagination(res) },
        });
      }
    });
  }

  @Bind()
  createList() {
    const { dataSource, pagination } = this.state;
    const newRow = [
      {
        tableName: '',
        edited: true,
        _status: 'create',
        rowId: uuid(),
        canModifyFlag: 1,
        configTypeMeaning: intl.get('spfm.configServer.view.message.extend').d('扩展'),
        configType: 'ATTRIBUTE',
        canModifyVisible: 1,
      },
      ...dataSource,
    ];
    this.setState({
      dataSource: newRow,
      dataContent: newRow,
      pagination: addItemToPagination(dataSource.length, pagination),
    });
  }

  @Bind()
  deleteList() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    Modal.confirm({
      title: intl.get('spfm.configServer.view.message.ifClean').d('确认删除？'),
      onOk: () => {
        dispatch({
          type: 'configServer/deleteOrderConfigList',
          payload: selectedRows.map(item => item.poChangeConfigId),
        }).then(res => {
          if (res) {
            this.handleSearch();
          }
        });
      },
    });
  }

  @Bind()
  handleChangeRows(_, selectedRow) {
    this.setState({
      selectedRows: selectedRow,
    });
  }

  @Bind()
  saveList() {
    const { dataSource, dataContent, pagination, autoSignFlag } = this.state;
    // const data = getEditTableData(
    //   dataSource.filter((item) => item.edited),
    //   ['_status', 'rowId', 'edited']
    // );
    const { form, dispatch, versionNum } = this.props;
    const value = form.getFieldsValue();
    const dataList = cloneDeep(dataSource);
    dataList.forEach((e, index) => {
      e.recordFlag = value[`recordFlag#${e.poChangeConfigId}`] === 1 ? 1 : 0;
      e.upgradeFlag = value[`upgradeFlag#${e.poChangeConfigId}`] === 1 ? 1 : 0;
      e.canModifyFlag = value[`canModifyFlag#${e.poChangeConfigId}`] === 1 ? 1 : 0;
      e.purchaseApprovalFlag = value[`purchaseApprovalFlag#${e.poChangeConfigId}`] === 1 ? 1 : 0;
      e.supplierConfirmFlag = value[`supplierConfirmFlag#${e.poChangeConfigId}`] === 1 ? 1 : 0;
      e.supplierConfirmFlagForErp =
        value[`supplierConfirmFlagForErp#${e.poChangeConfigId}`] === 1 ? 1 : 0;
      e.poChangeConfigId = dataContent[index].poChangeConfigId;
      e.signAfterChangeFlag = value[`signAfterChangeFlag#${e.poChangeConfigId}`] === 1 ? 1 : 0;
      e.settleValidateFlag = value[`settleValidateFlag#${e.poChangeConfigId}`] === 1 ? 1 : 0;
    });

    const changedDataList = dataList.filter(
      (a, index) =>
        a.recordFlag !== dataSource[index].recordFlag ||
        a.upgradeFlag !== dataSource[index].upgradeFlag ||
        a.canModifyFlag !== dataSource[index].canModifyFlag ||
        a.purchaseApprovalFlag !== dataSource[index].purchaseApprovalFlag ||
        a.supplierConfirmFlag !== dataSource[index].supplierConfirmFlag ||
        a.supplierConfirmFlagForErp !== dataSource[index].supplierConfirmFlagForErp ||
        a.signAfterChangeFlag !== dataSource[index].signAfterChangeFlag ||
        a.settleValidateFlag !== dataSource[index].settleValidateFlag
    );
    const datas = getEditTableData(dataList, ['_status', 'rowId', 'edited']);

    const warningSignData =
      autoSignFlag === 1
        ? datas
            .filter(item => {
              return item.canModifyFlag === 1 && item.signAfterChangeFlag !== 1;
            })
            .map(t => t.fieldNameMeaning)
        : [];
    if (!isEmpty(changedDataList)) {
      // 当订单自动转协议开启，校验【SRM来源-允许变更】勾选的字段，【变更后重新签署】无勾选，则提示，否则取消保存
      if (warningSignData.length) {
        Modal.confirm({
          title: (
            <>
              {warningSignData.join(', ')}
              {intl.get('spfm.configServer.view.message.signWarning').d(`配置了允许变更
            但不需要重新签署，是否确认？`)}
            </>
          ),
          onOk: () => {
            dispatch({
              type: 'configServer/saveOrderConfigList',
              payload: datas.map(t => {
                const copy = cloneDeep(t);
                copy.versionNum = versionNum;
                return copy;
              }),
            }).then(res => {
              if (res) {
                notification.success();
                this.handleSearch(pagination);
              }
            });
          },
        });
      } else {
        dispatch({
          type: 'configServer/saveOrderConfigList',
          payload: datas.map(t => {
            const copy = cloneDeep(t);
            copy.versionNum = versionNum;
            return copy;
          }),
        }).then(res => {
          if (res) {
            notification.success();
            this.handleSearch(pagination);
          }
        });
      }
    } else {
      notification.warning({
        message: intl.get(`spfm.configServer.view.message.warning.noContent`).d(`未修改任何数据`),
      });
    }
  }

  @Bind()
  hideModal() {
    const { onOrderConfig } = this.props;
    if (onOrderConfig) {
      onOrderConfig('orderConfigVisible', false);
    }
  }

  // 是否可编辑 事件回调
  @Bind()
  handleCheckboxEdit(e, record) {
    const { form } = this.props;
    const { checked } = e.target;
    const { dataSource = [] } = this.state;
    const data = dataSource.map(item => {
      if (item.poChangeConfigId === record.poChangeConfigId) {
        if (+checked === 1) {
          form.setFieldsValue({
            canModifyFlag: 1,
          });
          return {
            ...item,
            canModifyFlag: 1,
            // supplierConfirmFlag: 1,
            // purchaseApprovalFlag: 1,
          };
        } else {
          form.setFieldsValue({
            canModifyFlag: 0,
          });
          return {
            ...item,
            canModifyFlag: 0,
            // supplierConfirmFlag: 0,
            // purchaseApprovalFlag: 0,
          };
        }
      }
      return item;
    });
    this.setState({
      dataSource: data,
    });
  }

  @Bind()
  isDisabledField(record) {
    return settleValidateDisabledFields.some(
      i => i[0] === record.tableName && i[1] === record.fieldName
    );
  }

  // 全选控制
  @Bind()
  selectedFlagAll(e, item) {
    const { form } = this.props;
    const { dataSource, autoSignFlag } = this.state;
    if (item === 'settleValidateFlag') {
      dataSource.forEach(a => {
        form.setFieldsValue({
          [`settleValidateFlag#${a.poChangeConfigId}`]: e.target.checked ? 1 : 0,
        });
      });
      return;
    }
    dataSource.forEach(a => {
      form.setFieldsValue({ [`${item}#${a.poChangeConfigId}`]: e.target.checked ? 1 : 0 });
    });
    if (item === 'purchaseApprovalFlag') {
      if (e.target.checked) {
        dataSource.forEach(a => {
          form.setFieldsValue({ [`supplierConfirmFlag#${a.poChangeConfigId}`]: 1 });
        });
      } else {
        dataSource.forEach(a => {
          form.resetFields(`supplierConfirmFlag#${a.poChangeConfigId}`);
        });
      }
    } else if (item === 'canModifyFlag' && !e.target.checked) {
      dataSource.forEach(a => {
        form.setFieldsValue({
          [`supplierConfirmFlag#${a.poChangeConfigId}`]: 0,
          [`purchaseApprovalFlag#${a.poChangeConfigId}`]: 0,
        });
      });
    } else if (
      ['supplierConfirmFlag', 'supplierConfirmFlagForErp', 'signAfterChangeFlag'].includes(item) &&
      autoSignFlag
    ) {
      dataSource.forEach(a => {
        if (e.target.checked) {
          form.setFieldsValue({
            [`supplierConfirmFlag#${a.poChangeConfigId}`]: 1,
            [`supplierConfirmFlagForErp#${a.poChangeConfigId}`]: 1,
            [`signAfterChangeFlag#${a.poChangeConfigId}`]: 1,
            [`upgradeFlag#${a.poChangeConfigId}`]: 1,
          });
        } else {
          form.setFieldsValue({
            [`supplierConfirmFlag#${a.poChangeConfigId}`]: 0,
            [`supplierConfirmFlagForErp#${a.poChangeConfigId}`]: 0,
            [`signAfterChangeFlag#${a.poChangeConfigId}`]: 0,
            [`upgradeFlag#${a.poChangeConfigId}`]: 0,
          });
        }
      });
    }
  }

  @Bind()
  purchaseApprovalFlagChange(e, record) {
    const { form } = this.props;
    if (e.target.checked) {
      form.setFieldsValue({ [`supplierConfirmFlag#${record.poChangeConfigId}`]: 1 });
    } else {
      form.resetFields(`supplierConfirmFlag#${record.poChangeConfigId}`);
    }
  }

  //  【SRM来源-变更需供应商确认】【ERP来源-变更需供应商确认】【变更后重新签署】 变动逻辑保持一致
  @Bind()
  supplierSignChange(e, record) {
    const { form } = this.props;
    const { autoSignFlag } = this.state;
    if (autoSignFlag) {
      if (e.target.checked) {
        form.setFieldsValue({
          [`supplierConfirmFlag#${record.poChangeConfigId}`]: 1,
          [`supplierConfirmFlagForErp#${record.poChangeConfigId}`]: 1,
          [`signAfterChangeFlag#${record.poChangeConfigId}`]: 1,
          [`upgradeFlag#${record.poChangeConfigId}`]: 1,
        });
      } else {
        form.setFieldsValue({
          [`supplierConfirmFlag#${record.poChangeConfigId}`]: 0,
          [`supplierConfirmFlagForErp#${record.poChangeConfigId}`]: 0,
          [`signAfterChangeFlag#${record.poChangeConfigId}`]: 0,
          [`upgradeFlag#${record.poChangeConfigId}`]: 0,
        });
      }
    }
  }

  // // 版本勾选受【ERP来源-变更需供应商确认】影响
  // @Bind()
  // supplierConfirmFlagForErpChange(e, record) {
  //   const { form } = this.props;
  //   const { autoSignFlag } = this.state;
  //   if (autoSignFlag) {
  //     if (e.target.checked) {
  //       form.setFieldsValue({
  //         [`supplierConfirmFlagForErp#${record.poChangeConfigId}`]: 1,
  //         [`upgradeFlag#${record.poChangeConfigId}`]: 1,
  //       });
  //     } else {
  //       form.setFieldsValue({
  //         [`supplierConfirmFlagForErp#${record.poChangeConfigId}`]: 0,
  //         [`upgradeFlag#${record.poChangeConfigId}`]: 0,
  //       });
  //     }
  //   }
  // }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['fieldName']);
  }

  /**
   * 字段名称lov带出位置
   */
  @Bind()
  onchangeSelect(val, record) {
    const { dataSource } = this.state;
    const newDataSource = dataSource.map(item => {
      if (item.rowId === record.rowId) {
        return {
          ...item,
          edited: true,
          tableName: val,
          fieldName: '',
        };
      }
      return item;
    });
    record.$form.setFieldsValue({ fieldName: '' });
    this.setState({
      dataSource: [...newDataSource],
      dataContent: [...newDataSource],
    });
  }

  render() {
    const {
      form,
      visible,
      fetchOrderConfigListLoading,
      saveOrderConfigListLoading,
      deleteOrderConfigListLoading,
    } = this.props;
    const { dataSource, dataContent, autoSignFlag } = this.state;
    const value = form.getFieldsValue();
    const dataList = cloneDeep(dataSource);
    dataList.forEach((e, index) => {
      e.recordFlag = value[`recordFlag#${e.poChangeConfigId}`] === 1 ? 1 : 0;
      e.upgradeFlag = value[`upgradeFlag#${e.poChangeConfigId}`] === 1 ? 1 : 0;
      e.canModifyFlag = value[`canModifyFlag#${e.poChangeConfigId}`] === 1 ? 1 : 0;
      e.purchaseApprovalFlag = value[`purchaseApprovalFlag#${e.poChangeConfigId}`] === 1 ? 1 : 0;
      e.supplierConfirmFlag = value[`supplierConfirmFlag#${e.poChangeConfigId}`] === 1 ? 1 : 0;
      e.supplierConfirmFlagForErp =
        value[`supplierConfirmFlagForErp#${e.poChangeConfigId}`] === 1 ? 1 : 0;
      e.poChangeConfigId = dataContent[index].poChangeConfigId;
      e.settleValidateFlag = value[`settleValidateFlag#${e.poChangeConfigId}`] === 1 ? 1 : 0;
    });
    const dataUpgradeChangedList = dataList.filter(a => a.upgradeFlag === 0);
    const dataRecordChangedList = dataList.filter(a => a.recordFlag === 0);
    const canModifyFlagList = dataList.filter(a => a.canModifyFlag === 0);
    const allCanModifyFlagList = dataList.filter(a => a.canModifyVisible === 0);
    const purchaseApprovalFlagList = dataList.filter(a => a.purchaseApprovalFlag === 0);
    const supplierConfirmFlagList = dataList.filter(a => a.supplierConfirmFlag === 0);
    const supplierConfirmFlagForErpList = dataList.filter(a => a.supplierConfirmFlagForErp === 0);
    const settleValidateFlagList = dataList.filter(a => a.settleValidateFlag === 0);
    // const dataSupplierErpList = dataList.filter(a => a.supplierConfirmFlag === 0);
    const cancelledFlag = dataList.some(record => record.fieldName === 'cancelled_flag');
    const closedFlag = dataList.some(record => record.fieldName === 'closed_flag');
    const cancelAndCloseCheckFlag =
      (cancelledFlag && dataList.length === 1) ||
      (closedFlag && dataList.length === 1) ||
      (cancelledFlag && closedFlag && dataList.length === 2);
    const settleValidateDisbaledAll = dataList.some(i => this.isDisabledField(i));
    const columns = [
      {
        title: intl.get(`spfm.configServer.model.order.tableName1`).d('类型'),
        dataIndex: 'configTypeMeaning',
        width: 200,
        render: (_, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('configTypeMeaning', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfm.configServer.model.order.fieldName`).d('类型'),
                  }),
                },
              ],
              initialValue: record.configTypeMeaning,
            })(
              // record?.poChangeConfigId ?
              <span>{record.configTypeMeaning}</span>
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.order.tableName`).d('字段位置'),
        dataIndex: 'tableName',
        width: 200,
        render: (_, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('tableName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfm.configServer.model.order.fieldName`).d('字段位置'),
                  }),
                },
              ],
              initialValue: record.tableNameMeaning,
            })(
              record?.poChangeConfigId ? (
                <span>{record.tableNameMeaning}</span>
              ) : (
                <Select style={{ width: 150 }} onChange={val => this.onchangeSelect(val, record)}>
                  {this.state.meaningCodes.map(item => (
                    <Select.Option value={item.value}>{item.meaning}</Select.Option>
                  ))}
                </Select>
              )
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.order.fieldName`).d('字段编码'),
        dataIndex: 'fieldName',
        width: 250,
        render: (_, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('fieldName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfm.configServer.model.order.fieldName`).d('字段编码'),
                  }),
                },
              ],
              initialValue: record.fieldNameMeaning,
            })(
              record?.fieldNameMeaning ? (
                <span>{record.fieldNameMeaning}</span>
              ) : (
                <Lov
                  disabled={!record.$form.getFieldValue('tableName')}
                  code="SODR.PO_CHANGE_ATT_INIT"
                  queryParams={{
                    tenantId: getCurrentOrganizationId(),
                    tableName: record.$form.getFieldValue('tableName'),
                  }}
                  lovOptions={{ valueField: 'fieldCode', displayField: 'fieldName' }}
                />
              )
            )}
          </Form.Item>
        ),
      },
      {
        title: (
          <div>
            <Checkbox
              onChange={e => this.selectedFlagAll(e, 'upgradeFlag')}
              checked={isEmpty(dataUpgradeChangedList)}
              disabled={isEmpty(supplierConfirmFlagList)}
            />
            <span style={{ marginLeft: '8px' }}>
              {intl.get(`spfm.configServer.model.order.upgradeFlag`).d('版本升级')}
            </span>
          </div>
        ),
        dataIndex: 'upgradeFlag',
        width: 140,
        align: 'left',
        render: (text, record) => {
          return (
            <Form.Item style={{ margin: 0, height: 16 }}>
              {form.getFieldDecorator(`upgradeFlag#${record.poChangeConfigId}`, {
                initialValue: record.upgradeFlag,
              })(
                <Checkbox
                  disabled={
                    autoSignFlag &&
                    form.getFieldValue(`supplierConfirmFlagForErp#${record.poChangeConfigId}`)
                  }
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: (
          <div>
            <Checkbox
              onChange={e => this.selectedFlagAll(e, 'recordFlag')}
              checked={isEmpty(dataRecordChangedList)}
            />
            <span style={{ marginLeft: '8px' }}>
              {intl.get(`spfm.configServer.model.order.recordFlag`).d('变更记录')}
            </span>
          </div>
        ),
        dataIndex: 'recordFlag',
        width: 150,
        align: 'left',
        className: 'order-checkbox',
        render: (text, record) => {
          return (
            <Form.Item style={{ margin: 0, height: 16 }}>
              {form.getFieldDecorator(`recordFlag#${record.poChangeConfigId}`, {
                initialValue: record.recordFlag,
              })(<Checkbox />)}
            </Form.Item>
          );
        },
      },
      {
        title: (
          <div>
            <Checkbox
              onChange={e => this.selectedFlagAll(e, 'canModifyFlag')}
              checked={isEmpty(canModifyFlagList) || cancelAndCloseCheckFlag}
              disabled={!isEmpty(allCanModifyFlagList) || cancelledFlag || closedFlag}
            />
            <span style={{ marginLeft: '8px' }}>
              {intl.get(`spfm.configServer.model.order.canModifyFlagSrm`).d('SRM来源-允许变更')}
            </span>
          </div>
        ),
        dataIndex: 'canModifyFlag',
        width: 150,
        align: 'left',
        className: 'order-checkbox',
        render: (text, record) => {
          return (
            <Form.Item style={{ margin: 0, height: 16 }}>
              {form.getFieldDecorator(`canModifyFlag#${record.poChangeConfigId}`, {
                initialValue: record.canModifyFlag,
              })(
                <Checkbox
                  onChange={e => {
                    // this.handleCheckboxEdit(e, record);
                    if (
                      e.target.checked &&
                      record.fieldName === 'item_code' &&
                      record.tableName === 'SODR_PO_LINE'
                    ) {
                      Modal.info({
                        content: intl
                          .get('spfm.configServer.model.order.itemCodeChangeMessage')
                          .d(
                            '在【订单工作台-订单变更页面】更新【物料编码】，将联动更新字段【物料描述】【单位】【物料分类】【型号】【规格】字段（其他字段不联动更新），请检查这些字段是否允许变更，若不允许变更，订单变更提交将会失败'
                          ),
                      });
                    }
                    form.setFieldsValue({
                      [`purchaseApprovalFlag#${record.poChangeConfigId}`]: 0,
                      [`supplierConfirmFlag#${record.poChangeConfigId}`]: 0,
                    });
                  }}
                  defaultChecked={
                    record.fieldName === 'cancelled_flag' || record.fieldName === 'closed_flag'
                  }
                  disabled={
                    !record.canModifyVisible ||
                    record.configTypeMeaning === '扩展' ||
                    (record.fieldName === 'cancelled_flag' &&
                      record.tableName !== 'SODR_PO_ITEM_BOM') ||
                    record.fieldName === 'closed_flag'
                  }
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: (
          <div>
            <Checkbox
              onChange={e => this.selectedFlagAll(e, 'purchaseApprovalFlag')}
              checked={isEmpty(purchaseApprovalFlagList)}
              disabled={
                !isEmpty(allCanModifyFlagList) ||
                !isEmpty(canModifyFlagList) ||
                cancelledFlag ||
                closedFlag
              }
            />
            <span style={{ marginLeft: '8px' }}>
              {intl
                .get(`spfm.configServer.model.order.purchaseApprovalFlagSrm`)
                .d('SRM来源-变更需采购方审批')}
            </span>
          </div>
        ),
        dataIndex: 'purchaseApprovalFlag',
        width: 200,
        align: 'left',
        className: 'order-checkbox',
        render: (text, record) => {
          return (
            <Form.Item style={{ margin: 0, height: 16 }}>
              {form.getFieldDecorator(`purchaseApprovalFlag#${record.poChangeConfigId}`, {
                initialValue: record.purchaseApprovalFlag,
              })(
                <Checkbox
                  onClick={e => this.purchaseApprovalFlagChange(e, record)}
                  // disabled={!record.canModifyVisible}
                  disabled={
                    form.getFieldValue(`canModifyFlag#${record.poChangeConfigId}`) === 0 ||
                    (record.fieldName === 'cancelled_flag' &&
                      record.tableName !== 'SODR_PO_ITEM_BOM') ||
                    record.fieldName === 'closed_flag'
                  }
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: (
          <div>
            <Checkbox
              onChange={e => this.selectedFlagAll(e, 'supplierConfirmFlag')}
              checked={isEmpty(supplierConfirmFlagList)}
              disabled={
                (!isEmpty(purchaseApprovalFlagList) ||
                  !isEmpty(allCanModifyFlagList) ||
                  !isEmpty(canModifyFlagList)) &&
                !cancelledFlag &&
                !closedFlag
              }
            />
            <span style={{ marginLeft: '8px' }}>
              {intl
                .get(`spfm.configServer.model.order.supplierConfirmFlagSrm`)
                .d('SRM来源-变更需供应商确认')}
            </span>
          </div>
        ),
        dataIndex: 'supplierConfirmFlag',
        width: 200,
        align: 'left',
        className: 'order-checkbox',
        render: (text, record) => {
          return (
            <Form.Item style={{ margin: 0, height: 16 }}>
              {form.getFieldDecorator(`supplierConfirmFlag#${record.poChangeConfigId}`, {
                initialValue: record.supplierConfirmFlag,
              })(
                <Checkbox
                  // disabled={
                  //   form.getFieldValue(`purchaseApprovalFlag#${record.poChangeConfigId}`) ||
                  //   !record.canModifyVisible
                  // }
                  disabled={
                    form.getFieldValue(`canModifyFlag#${record.poChangeConfigId}`) === 0 &&
                    record.fieldName !== 'cancelled_flag' &&
                    record.fieldName !== 'closed_flag'
                  }
                  onChange={e => {
                    if (autoSignFlag) {
                      this.supplierSignChange(e, record);
                    }
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: (
          <div>
            <Checkbox
              onChange={e => this.selectedFlagAll(e, 'supplierConfirmFlagForErp')}
              checked={isEmpty(supplierConfirmFlagForErpList)}
            />
            <span style={{ marginLeft: '8px' }}>
              {intl
                .get(`spfm.configServer.model.order.supplierConfirmFlagErp`)
                .d('ERP来源-变更需供应商确认')}
            </span>
          </div>
        ),
        dataIndex: 'supplierConfirmFlagForErp',
        width: 200,
        align: 'left',
        render: (text, record) => {
          return (
            <Form.Item style={{ margin: 0, height: 16 }}>
              {form.getFieldDecorator(`supplierConfirmFlagForErp#${record.poChangeConfigId}`, {
                initialValue: record.supplierConfirmFlagForErp,
              })(
                <Checkbox
                  onChange={e => {
                    if (autoSignFlag) {
                      this.supplierSignChange(e, record);
                      // this.supplierConfirmFlagForErpChange(e, record);
                    }
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: (
          <div>
            <Checkbox
              disabled={!autoSignFlag}
              onChange={e => this.selectedFlagAll(e, 'signAfterChangeFlag')}
              checked={isEmpty(supplierConfirmFlagList)}
            />
            <span style={{ marginLeft: '8px' }}>
              {intl.get(`spfm.configServer.model.order.signAfterChangeFlag`).d('变更后重新签署')}
            </span>
            <span style={{ marginLeft: '8px' }}>
              <Tooltip
                title={intl
                  .get(`spfm.configServer.model.order.supplierResignTips`)
                  .d(
                    '勾选后，订单自动创建的协议如开启电子签章，则勾选字段发生变更，则需供采双方重新签章。如果是外部系统来源订单，请同时勾选“版本”列，仅版本升级后才会重新签章。'
                  )}
              >
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          </div>
        ),
        dataIndex: 'signAfterChangeFlag',
        width: 200,
        align: 'left',
        render: (text, record) => {
          return (
            <Form.Item style={{ margin: 0, height: 16 }}>
              {form.getFieldDecorator(`signAfterChangeFlag#${record.poChangeConfigId}`, {
                initialValue: record.signAfterChangeFlag,
              })(
                <Checkbox
                  disabled={!autoSignFlag}
                  onChange={e => {
                    this.supplierSignChange(e, record);
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: (
          <div>
            <Checkbox
              disabled={settleValidateDisbaledAll}
              onChange={e => this.selectedFlagAll(e, 'settleValidateFlag')}
              checked={isEmpty(settleValidateFlagList)}
            />
            <span style={{ marginLeft: '8px' }}>
              {intl.get(`spfm.configServer.model.order.settleValidateFlag`).d('变更需同步结算池')}
            </span>
            <span style={{ marginLeft: '8px' }}>
              <Tooltip
                title={intl
                  .get(`spfm.configServer.model.order.settleValidateFlagTips`)
                  .d(
                    '勾选后，若开启订单同步结算池，若勾选字段发生变更，且通过结算信息的变更校验条件，则会再次触发同步结算池；不勾选该配置，若勾选字段发生变更，则不会再次触发同步结算池。'
                  )}
              >
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          </div>
        ),
        dataIndex: 'settleValidateFlag',
        width: 200,
        align: 'left',
        render: (text, record) => {
          return (
            <Form.Item style={{ margin: 0, height: 16 }}>
              {form.getFieldDecorator(`settleValidateFlag#${record.poChangeConfigId}`, {
                initialValue: record.settleValidateFlag,
              })(<Checkbox disabled={this.isDisabledField(record)} />)}
            </Form.Item>
          );
        },
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));
    return (
      <Modal
        title={intl.get(`spfm.configServer.view.message.title`).d('订单配置表')}
        visible={visible}
        footer={null}
        width={1000}
        onCancel={this.hideModal}
      >
        {/* <Content style={{ paddingLeft: 0, paddingRight: 0 }}> */}
        <div className="table-list-search">
          <Form layout="inline">
            <Form.Item label={intl.get(`spfm.configServer.model.order.fieldName`).d('字段名')}>
              {form.getFieldDecorator('fieldName')(<Input />)}
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                data-code="search"
                onClick={this.handleSearch}
                style={{ marginLeft: 8 }}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </Form.Item>
          </Form>
        </div>
        <Row>
          <Col>
            <Button
              type="primary"
              onClick={this.saveList}
              loading={saveOrderConfigListLoading || fetchOrderConfigListLoading}
              style={{ float: 'right', marginRight: 6 }}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button
              onClick={this.deleteList}
              style={{ float: 'right', marginRight: 6 }}
              loading={deleteOrderConfigListLoading || fetchOrderConfigListLoading}
              disabled={!this.state.selectedRows.length}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button
              type="primary"
              style={{ float: 'right', marginRight: 6 }}
              onClick={this.createList}
              loading={deleteOrderConfigListLoading || fetchOrderConfigListLoading}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </Col>
        </Row>
        <div className={styles['order-config-table']}>
          {/* <EditTable */}
          <EditTable
            bordered
            loading={fetchOrderConfigListLoading}
            rowKey="rowId"
            dataSource={dataSource}
            pagination={this.state.pagination}
            onChange={this.handleSearch}
            columns={columns}
            scroll={{ x: scrollX }}
            rowSelection={{
              selectedRowKeys: this.state.selectedRows.map(item => item.rowId),
              onChange: this.handleChangeRows,
              getCheckboxProps: record => ({
                disabled: record.configTypeMeaning === '标准', // 配置无法勾选的
              }),
            }}
          />
        </div>
        {/* </Content> */}
      </Modal>
    );
  }
}
