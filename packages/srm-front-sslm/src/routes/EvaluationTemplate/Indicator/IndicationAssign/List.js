/**
 * List - 供应商绩效标准指标定义 - 列表组件
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { sum, debounce, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { Form, Input, InputNumber, Icon } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import EditTable from 'components/EditTable';

import MultiSelectModal from './MultiSelectModal';

const { Item: FormItem } = Form;

/**
 * List - 供应商绩效标准指标定义 - 列表组件
 * @extends {Component} - React.Component
 * @reactProps {function} [ref= (e => e)] - react ref属性
 * @reactProps {boolean} [loading=false] - 表格处理状态
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @reactProps {object} [pagination={}] - 分页数据
 * @reactProps {Array<Object>} [dataSource=[]] - 表格数据源
 * @reactProps {object} [rowSelection={}] - 表格选择框配置
 * @return React.element
 */
@connect(({ evaluationTemplate, loading }) => ({
  evaluationTemplate,
  querySupplierLoading: loading.effects['evaluationTemplate/fetchSupplierLovData'],
  queryClassifyLoading: loading.effects['evaluationTemplate/fetchSupplierClassify'],
}))
export default class List extends Component {
  state = {
    activeRow: {},
    classifyVisible: false,
  };

  componentDidMount() {
    const { handleSearch } = this.props;
    if (isFunction(handleSearch)) {
      handleSearch();
    }
  }

  /**
   * getColumns - 组装columns
   */
  @Bind()
  getColumns() {
    const { radioValue, averageFlag } = this.props;
    const defaultColumns = [
      {
        title: intl.get('sslm.supplierKpiIndicator.model.supplier.respUser').d('评分账户'),
        dataIndex: 'respLoginName',
        width: 150,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            const { dispatch } = this.props;
            return (
              <FormItem>
                {getFieldDecorator('respLoginName', {
                  initialValue: record.respLoginName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.supplierKpiIndicator.model.supplier.respUser')
                          .d('评分账户'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SSLM.KPI_CHOOSE_USER"
                    textValue={record.respLoginName}
                    queryParams={{ tenantId: getCurrentOrganizationId() }}
                    onChange={(_, row) => {
                      dispatch({
                        type: 'evaluationTemplate/updatePermissionsList',
                        payload: {
                          data: {
                            ...record,
                            respLoginName: row.loginName,
                            respUserId: row.userId,
                            respUserName: row.userName,
                          },
                        },
                      });
                    }}
                  />
                )}
              </FormItem>
            );
          } else {
            return record.respLoginName;
          }
        },
      },
      {
        title: intl
          .get('sslm.supplierKpiIndicator.model.supplier.respUserNameDesc')
          .d('评分用户描述'),
        dataIndex: 'respUserName',
        width: 180,
      },
      {
        title: intl.get('sslm.supplierKpiIndicator.model.supplier.respWeight').d('权重%'),
        dataIndex: 'respWeight',
        width: 130,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            const { dispatch } = this.props;
            return (
              <FormItem>
                {getFieldDecorator('respWeight', {
                  initialValue: record.respWeight,
                  rules: [
                    {
                      required: !averageFlag,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.supplierKpiIndicator.model.supplier.respWeight')
                          .d('权重%'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    onChange={debounce(value => {
                      dispatch({
                        type: 'evaluationTemplate/updatePermissionsList',
                        payload: {
                          data: {
                            ...record,
                            respWeight: value,
                          },
                        },
                      });
                    }, 30)}
                    min={0}
                    precision={2}
                    max={100}
                    step={0.01}
                    disabled={averageFlag}
                  />
                )}
              </FormItem>
            );
          } else {
            return record.respWeight;
          }
        },
      },
    ];
    if (radioValue === 'RESP_SUPPLIER') {
      defaultColumns.push({
        title: intl.get('sslm.supplierKpiIndicator.model.supplier.supplierCompanyName').d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 130,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('supplierCompanyName', {
                  initialValue: record.supplierCompanyName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.supplierKpiIndicator.model.supplier.supplierCompanyName')
                          .d('供应商'),
                      }),
                    },
                  ],
                })(
                  <Input
                    readOnly
                    suffix={
                      <Icon
                        style={{ cursor: 'pointer' }}
                        type="search"
                        onClick={() => this.showSupplier(record)}
                      />
                    }
                  />
                )}
              </FormItem>
            );
          } else {
            return record.supplierCompanyName;
          }
        },
      });
    }
    return defaultColumns;
  }

  /**
   * 显示供应商弹窗
   */
  @Bind()
  showSupplier(record) {
    const {
      evaluationTemplate: { permissionsList: dataSource },
    } = this.props;

    const filterData = [];
    dataSource.forEach(item => {
      if (record && record.respLoginName === item.respLoginName) {
        filterData.push(item);
      }
    });
    this.setState({
      filterData,
      activeRow: record,
      classifyVisible: true,
    });
  }

  /**
   * 弹窗确定按钮处理逻辑
   */
  @Bind()
  handleOk(selectedRows) {
    const { activeRow } = this.state;
    const { add, update } = this.props;
    const { evalTplIndRespId, _status, $form, ...others } = activeRow;
    selectedRows.forEach((item, index) => {
      if (index === 0) {
        const { setFieldsValue } = $form;
        setFieldsValue({
          supplierCompanyId: item.supplierCompanyId,
          supplierCompanyName: item.supplierCompanyName,
        });
        update({
          evalTplIndRespId,
          supplierCompanyId: item.supplierCompanyId,
          supplierCompanyName: item.supplierCompanyName,
          _status: _status || 'update',
        });
      } else {
        add({
          ...others,
          supplierCompanyId: item.supplierCompanyId,
          supplierCompanyName: item.supplierCompanyName,
        });
      }
    });
    if (this.AssignCategoryModal) {
      this.AssignCategoryModal.setState({ selectedRows: [], selectedRowKeys: [] });
    }
    this.setState({ activeRow: {}, classifyVisible: false });
  }

  /**
   * 弹窗取消按钮处理逻辑
   */
  @Bind()
  handleCancel() {
    this.setState({ activeRow: {}, classifyVisible: false });
    if (this.AssignCategoryModal) {
      this.AssignCategoryModal.setState({ selectedRows: [], selectedRowKeys: [] });
    }
  }

  render() {
    const {
      loading,
      onChange,
      rowSelection,
      customizeTable,
      detailPermissionCode,
      defaultTableRowKey,
      queryClassifyLoading,
      querySupplierLoading,
      handleSearch = () => {},
      evaluationTemplate: {
        supplierList,
        supplierPagination,
        permissionsList: dataSource,
        supplierClassifyList,
      },
    } = this.props;
    const { classifyVisible, activeRow, filterData } = this.state;
    const multiSelectModalProps = {
      filterData,
      activeRow,
      classifyVisible,
      queryClassifyLoading,
      querySupplierLoading,
      supplierClassifyList,
      supplierList,
      supplierPagination,
      onRef: node => {
        this.AssignCategoryModal = node;
      },
      onOk: this.handleOk,
      onCancel: this.handleCancel,
      onSearch: handleSearch,
    };
    const columns = this.getColumns();
    const editTableProps = {
      pagination: false,
      bordered: true,
      resizable: true,
      loading,
      rowKey: defaultTableRowKey,
      scroll: { x: sum(columns.map(item => (item.width ? item.width : 100))) },
      columns,
      dataSource,
      onChange,
      rowSelection,
    };

    return (
      <Fragment>
        {customizeTable ? (
          customizeTable(
            {
              code: detailPermissionCode,
            },
            <EditTable {...editTableProps} />
          )
        ) : (
          <EditTable {...editTableProps} />
        )}
        <MultiSelectModal {...multiSelectModalProps} />
      </Fragment>
    );
  }
}
