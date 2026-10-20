/**
 * Recommend - 供应商生命周期配置 - 申请单供应商分类表
 * @date: 2018-9-6
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import uuidv4 from 'uuid/v4';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { PureComponent, Fragment } from 'react';
// eslint-disable-next-line no-unused-vars
import { Button, Form, Input, InputNumber, Badge, Select } from 'hzero-ui';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import remote from 'hzero-front/lib/utils/remote';
import { dateRender, enableRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

import Lov from '@/routes/components/Lov'; // lov父级品类不可选
import LovMultiple from '@/routes/components/LovMultiple';

const FormItem = Form.Item;
const { Option } = Select;

/**
 * 申请单供应商分类表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form 表单
 * @return React.element
 */
@remote({
  code: 'SSLM_SUPPLIER_LIFE_CATEGORY', // 德康src-26781 二开埋点
  name: 'supplierLifeCategoryRemote',
})
@formatterCollections({ code: ['sslm.commonApplication'] })
export default class SupplierClassificationTable extends PureComponent {
  state = {
    selectedRows: [],
    selectedRowKeys: [],
  };

  /**
   * 处理多选新建
   */
  @Bind()
  handleMultipleAdd(newSelectedRows) {
    const { dataSource = [], onUpdateData = e => e } = this.props;
    const data = (newSelectedRows || []).map(n => {
      const { categoryId, ...rest } = n;
      return {
        ...rest,
        categoryAlterLineId: uuidv4(),
        operationType: 'ADD',
        _status: 'create',
        supplierCategoryId: categoryId,
      };
    });
    const newDataSource = [...data, ...dataSource];
    onUpdateData(newDataSource);
  }

  /**
   * 删除分类
   */
  @Bind()
  handleDelete() {
    const { dataSource, onDeleteRows = () => {} } = this.props;
    const { selectedRows, selectedRowKeys } = this.state;
    // 前端全量删除勾选数据
    const newList = dataSource.filter(n => !selectedRowKeys.includes(n.categoryAlterLineId));
    // 需后台删除的数据
    const remotRows = selectedRows
      .filter(n => n._status !== 'create')
      .map(n => n.categoryAlterLineId);

    onDeleteRows(newList, remotRows);
  }

  /**
   * 选中项改变时的回调
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * 清除回调
   */
  @Bind()
  handleClean(record) {
    const { dataSource = [], onUpdateData = e => e } = this.props;
    const newDataSource = dataSource.filter(
      n => n.categoryAlterLineId !== record.categoryAlterLineId
    );
    onUpdateData(newDataSource);
  }

  /**
   * 编辑／取消编辑
   */
  @Bind()
  handleEdit(record, flag) {
    const { dataSource = [], onUpdateData = e => e } = this.props;
    const newDataSource = dataSource.map(n => {
      if (n.categoryAlterLineId === record.categoryAlterLineId) {
        return { ...n, _status: flag ? 'update' : '' };
      } else {
        return n;
      }
    });
    onUpdateData(newDataSource);
  }

  render() {
    const {
      loading = false,
      isEdit = false,
      deleteLoading,
      customizeTable,
      custLoading,
      customizeUnitCode = '',
      supplierLifeCategoryRemote,
      code: { categoryAlterOpsTypeList = [], evaluationLevel = [], enabledList = [] } = {},
      dataSource = [],
      customizeBtnGroup,
      customizeBtnGroupCode,
      sourceKey,
    } = this.props;
    const { selectedRows, selectedRowKeys } = this.state;

    const categoryCode = supplierLifeCategoryRemote
      ? supplierLifeCategoryRemote.process(
          'SSLM_SUPPLIER_LIFE_CATEGORY_CODE',
          'SSLM.SUPPLIER_CATEGORY_TREE'
        )
      : 'SSLM.SUPPLIER_CATEGORY_TREE';

    const columns = [
      {
        title: intl
          .get('sslm.commonApplication.model.coApp.supplierCategoryCode')
          .d('供应商分类代码'),
        width: 200,
        dataIndex: 'categoryCode',
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('categoryCode', {
                initialValue: record.categoryCode,
              })}
              {record.$form.getFieldDecorator('evaluationLevelFlag', {
                initialValue: record.evaluationLevelFlag,
              })}
              {record.$form.getFieldDecorator('evaluationScoreFlag', {
                initialValue: record.evaluationScoreFlag,
              })}
              {record.$form.getFieldDecorator('supplierCategoryId', {
                initialValue: record.supplierCategoryId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.commonApplication.model.coApp.supplierCategoryCode')
                        .d('供应商分类代码'),
                    }),
                  },
                ],
              })(
                <Lov
                  parentNodeDisable
                  code={categoryCode}
                  textValue={record.categoryCode}
                  lovOptions={{ displayField: 'categoryCode' }}
                  queryParams={
                    {
                      // supplierTenantId,
                      // supplierCompanyId,
                    }
                  }
                  onChange={(_, lovRecord) => {
                    record.$form.setFieldsValue(lovRecord);
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl
          .get('sslm.commonApplication.model.coApp.SupplierCategoryDes')
          .d('供应商分类描述'),
        width: 200,
        dataIndex: 'categoryDescription',
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('categoryDescription', {
                initialValue: val,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.level').d('评级'),
        width: 100,
        dataIndex: 'evaluationLevel',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('evaluationLevel', {
                initialValue: val,
                rules: [
                  {
                    // 若使用record.evaluationLevelFlag || record.$form.getFieldValue('evaluationLevelFlag')形式，保存时获取不到evaluationLevelFlag的值
                    required:
                      record._status === 'update'
                        ? record.evaluationLevelFlag
                        : record.$form.getFieldValue('evaluationLevelFlag'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.commonApplication.model.coApp.level').d('评级'),
                    }),
                  },
                ],
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {evaluationLevel.map(n => (
                    <Option value={n.value} key={n.value}>
                      {n.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            record.evaluationLevelMeaning
          ),
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.score').d('评分'),
        width: 120,
        dataIndex: 'evaluationScore',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('evaluationScore', {
                initialValue: val,
                rules: [
                  {
                    // 若使用record.evaluationScoreFlag || record.$form.getFieldValue('evaluationScoreFlag')形式，保存时获取不到evaluationScoreFlag的值
                    required:
                      record._status === 'update'
                        ? record.evaluationScoreFlag
                        : record.$form.getFieldValue('evaluationScoreFlag'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.commonApplication.model.coApp.score').d('评分'),
                    }),
                  },
                ],
              })(<InputNumber />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.optionType').d('操作类型'),
        width: 140,
        dataIndex: 'operationTypeMeaning',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('operationType', {
                initialValue: record.operationType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.commonApplication.model.coApp.optionType').d('操作类型'),
                    }),
                  },
                ],
              })(
                <Select
                  allowClear
                  style={{ width: '100%' }}
                  onChange={value => {
                    record.$form.setFieldsValue({ enabledFlag: value === 'DISABLE' ? '0' : '1' });
                  }}
                >
                  {categoryAlterOpsTypeList.map(n => (
                    <Option value={n.value} key={n.value}>
                      {n.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`enabledFlag`, {
                initialValue: record.enabledFlag !== undefined ? String(record.enabledFlag) : '1',
              })(
                <Select allowClear disabled style={{ width: '100%' }}>
                  {enabledList.map(n => (
                    <Option value={n.value} key={n.value}>
                      {n.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            enableRender(record.enabledFlag)
          ),
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.alterReason').d('变更理由'),
        width: 200,
        dataIndex: 'alterReason',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`alterReason`, {
                initialValue: record.alterReason,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.alterDate').d('变更时间'),
        width: 120,
        dataIndex: 'alterDate',
        render: dateRender,
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.alterUserName').d('变更人'),
        width: 100,
        dataIndex: 'alterUserId',
        render: (_, record) => record.realName || record.loginName,
      },
    ];
    if (isEdit) {
      columns.push({
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        dataIndex: 'option',
        render: (_, record) => {
          return (
            <Fragment>
              {record._status === 'create' && (
                <a onClick={() => this.handleClean(record)}>
                  {intl.get('hzero.common.button.clean').d('清除')}
                </a>
              )}
              {record._status === 'update' && (
                <a onClick={() => this.handleEdit(record, false)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              )}
              {record._status !== 'update' && record._status !== 'create' && (
                <a onClick={() => this.handleEdit(record, true)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
            </Fragment>
          );
        },
      });
    }

    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        // 历史数据不允许删除
        disabled: record.isRequisitionAddFlag,
      }),
    };
    const tableLoading = loading || deleteLoading;
    return (
      <Fragment>
        {isEdit &&
          (customizeBtnGroup ? (
            <div
              style={{
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'flex-start',
                flexDirection: 'row-reverse',
              }}
            >
              {customizeBtnGroup(
                {
                  code: customizeBtnGroupCode,
                },
                [
                  <Button
                    data-name="deleteClassify"
                    onClick={this.handleDelete}
                    style={{ marginRight: 8 }}
                    loading={deleteLoading}
                    disabled={isEmpty(selectedRowKeys)}
                  >
                    {intl.get('sslm.commonApplication.model.coApp.deleteClassify').d('删除分类')}
                  </Button>,
                  <LovMultiple
                    data-name="createClassify"
                    code={categoryCode}
                    isButton
                    type="primary"
                    queryParams={{ sourceKey }}
                    buttonText={intl
                      .get('sslm.commonApplication.model.coApp.createClassify')
                      .d('新建分类')}
                    changeSelectRows={this.handleMultipleAdd}
                    parentNodeDisable
                  />,
                ]
              )}
            </div>
          ) : (
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Button
                onClick={this.handleDelete}
                style={{ marginRight: 8 }}
                loading={deleteLoading}
                disabled={isEmpty(selectedRowKeys)}
              >
                {intl.get('sslm.commonApplication.model.coApp.deleteClassify').d('删除分类')}
              </Button>
              <LovMultiple
                code={categoryCode}
                isButton
                type="primary"
                queryParams={{ sourceKey }}
                buttonText={intl
                  .get('sslm.commonApplication.model.coApp.createClassify')
                  .d('新建分类')}
                changeSelectRows={this.handleMultipleAdd}
                parentNodeDisable
              />
            </div>
          ))}
        {customizeTable ? (
          customizeTable(
            {
              code: customizeUnitCode,
            },
            <EditTable
              bordered
              loading={tableLoading}
              columns={columns}
              dataSource={dataSource}
              rowKey="categoryAlterLineId"
              pagination={false}
              rowSelection={isEdit ? rowSelection : null}
              custLoading={custLoading}
            />
          )
        ) : (
          <EditTable
            bordered
            loading={tableLoading}
            columns={columns}
            dataSource={dataSource}
            rowKey="categoryAlterLineId"
            pagination={false}
            rowSelection={isEdit ? rowSelection : null}
          />
        )}
      </Fragment>
    );
  }
}
