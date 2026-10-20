/**
 * AsignTable - 供应商配额管理-详情-配额分配
 * @date: 2020-06-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import uuidv4 from 'uuid/v4';
import { isEmpty, pullAllBy, cloneDeep, isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Row, Divider, Form, Input, InputNumber, Modal } from 'hzero-ui';
import { Button as PermissionButton } from 'components/Permission';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';

import styles from '../index.less';

const FormItem = Form.Item;
const tenantId = getCurrentOrganizationId();

export default class AsignTable extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
    };
  }

  /**
   * 选中项发生改变时的回调
   */
  @Bind()
  handleSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const { quotaAsignList, changeState = e => e } = this.props;
    changeState({
      quotaAsignList: [{ quotaLineId: uuidv4(), _status: 'create' }, ...quotaAsignList],
    });
  }

  /**
   * 编辑／取消编辑
   */
  @Bind()
  handleEdit(flag, record) {
    const { quotaAsignList, changeState = e => e } = this.props;
    const newQuotaAsignList = quotaAsignList.map(n =>
      n.quotaLineId === record.quotaLineId ? { ...n, _status: flag ? 'update' : '' } : n
    );
    changeState({ quotaAsignList: newQuotaAsignList });
  }

  /**
   * 清除
   */
  @Bind()
  handleClean(record) {
    const { quotaAsignList, changeState = e => e } = this.props;
    const { selectedRows } = this.state;
    const newQuotaAsignList = quotaAsignList.filter(n => n.quotaLineId !== record.quotaLineId);
    changeState({ quotaAsignList: newQuotaAsignList });
    const newSelectedRows = selectedRows.filter(n => n.quotaLineId !== record.quotaLineId);
    this.setState({
      selectedRowKeys: newSelectedRows.map(n => n.quotaLineId),
      selectedRows: newSelectedRows,
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { selectedRows } = this.state;
    const { quotaAsignList, changeState = e => e } = this.props;
    const { onDelete } = this.props;
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        const oldLines = selectedRows.filter(n => n._status !== 'create').map(n => n.quotaLineId); // 接口返回的数据
        const newLines = selectedRows.filter(n => n._status === 'create');
        if (!isEmpty(oldLines)) {
          onDelete(oldLines);
        } else if (!isEmpty(newLines)) {
          const newQuotaAsignList = cloneDeep(quotaAsignList);
          const newList = pullAllBy(newQuotaAsignList, newLines, 'quotaLineId');
          this.setState({ selectedRowKeys: [], selectedRows: [] });
          changeState({ quotaAsignList: newList });
        }
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { quotaAsignList, onSave } = this.props;
    const tableValues = getEditTableData(quotaAsignList, ['_status', 'quotaLineId']);
    if (!isEmpty(tableValues)) {
      onSave(tableValues);
    }
  }

  render() {
    const { selectedRowKeys } = this.state;
    const {
      isEdit,
      remote,
      evalStatus,
      quotaAsignList,
      customizeTable,
      saveQuotaLoading,
      deleteQuotaLoading,
      companyId,
      customizeBtnGroup,
      customizeBtnGroupCode,
    } = this.props;
    const columns = [
      {
        dataIndex: 'supplierNum',
        width: 200,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.suppilerCode').d('供应商编码'),
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            record.publishSign ? (
              val
            ) : (
              <FormItem>
                {record.$form.getFieldDecorator('erpSupplierId', {
                  initialValue: record.erpSupplierId,
                })}
                {record.$form.getFieldDecorator('supplierId', {
                  initialValue: record.supplierId,
                })}
                {record.$form.getFieldDecorator('id', {
                  initialValue: record.supplierId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.supplierQuotaManage.modal.quota.suppilerCode')
                          .d('供应商编码'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SSLM.ERP.SUPPLIER.VIEW"
                    queryParams={{ tenantId, companyId }}
                    lovOptions={{ displayField: 'companyNum' }}
                    textValue={record.supplierNum}
                    onChange={(_, lovRecord) => {
                      record.$form.setFieldsValue({
                        supplierId: lovRecord.companyId,
                        supplierName: lovRecord.companyName,
                        erpSupplierNum: lovRecord.supplierNum,
                        erpSupplierId: lovRecord.supplierId,
                      });
                    }}
                  />
                )}
              </FormItem>
            )
          ) : (
            val
          ),
      },
      {
        dataIndex: 'supplierName',
        width: 200,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.suppilerName').d('供应商名称'),
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            record.publishSign ? (
              val
            ) : (
              <FormItem>
                {record.$form.getFieldDecorator('supplierName', {
                  initialValue: record.supplierName,
                })(<Input disabled />)}
              </FormItem>
            )
          ) : (
            val
          ),
      },
      {
        dataIndex: 'erpSupplierNum',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.erpSuppilerCode').d('ERP供应商编码'),
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            record.publishSign ? (
              val
            ) : (
              <FormItem>
                {record.$form.getFieldDecorator('erpSupplierNum', {
                  initialValue: record.erpSupplierNum,
                })(<Input disabled />)}
              </FormItem>
            )
          ) : (
            val
          ),
      },
      {
        dataIndex: 'quotaRatio',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.ratio').d('配额比（%）'),
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('quotaRatio', {
                initialValue: record.quotaRatio,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.supplierQuotaManage.modal.quota.ratio').d('配额比（%）'),
                    }),
                  },
                ],
              })(<InputNumber min={0} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        dataIndex: 'orderSeq',
        width: 120,
        title: intl.get('hzero.common.priority').d('优先级'),
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('orderSeq', {
                initialValue: record.orderSeq,
              })(<InputNumber min={1} precision={0} step={1} />)}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
    if (isEdit) {
      columns.push({
        dataIndex: 'option',
        width: 100,
        title: intl.get(`hzero.common.button.action`).d('操作'),
        render: (_, record) => (
          <Fragment>
            {record._status === 'create' && (
              <a onClick={() => this.handleClean(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            )}
            {record._status === 'update' && (
              <a onClick={() => this.handleEdit(false, record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {record._status !== 'create' && record._status !== 'update' && (
              <a onClick={() => this.handleEdit(true, record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </Fragment>
        ),
      });
    }
    const remoteColumns = remote
      ? remote.process('SSLM_SUPPLIER_QUOTA_MANAGE_DETAIL_TABLE_COLUMNS', columns, { isEdit })
      : columns;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectChange,
    };
    const isSave = isEmpty(
      quotaAsignList.filter(n => n._status === 'create' || n._status === 'update')
    );
    const scrollX = sum(remoteColumns.map(n => (isNumber(n.width) ? n.width : 150)));

    return (
      <Fragment>
        <Row className={styles['quota-title-wrap']}>
          <Row className={styles['quota-second-title']}>
            <span className={styles['quota-vertical-line']} />
            {intl.get('sslm.supplierQuotaManage.view.message.auotaAsign').d('配额分配')}
          </Row>
          <Divider style={{ marginTop: 16, marginBottom: 16 }} />
        </Row>
        <Row style={{ display: isEdit ? 'block' : 'none', textAlign: 'right', marginBottom: 16 }}>
          {/* 单据为新建状态才可删除 */}
          {customizeBtnGroup(
            {
              code: customizeBtnGroupCode,
            },
            [
              evalStatus === 'NEW' && (
                <PermissionButton
                  data-name="delete"
                  disabled={isEmpty(selectedRowKeys)}
                  loading={deleteQuotaLoading}
                  onClick={this.handleDelete}
                  permissionList={[
                    {
                      code: `srm.partner.supplier-quota-manage.manage.ps.btn-detail-line-delete`,
                      type: 'button',
                      meaning: '供应商配额管理详情-行删除',
                    },
                  ]}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </PermissionButton>
              ),
              <PermissionButton
                data-name="save"
                style={{ margin: '0 8px' }}
                disabled={isSave}
                loading={saveQuotaLoading}
                onClick={this.handleSave}
                permissionList={[
                  {
                    code: `srm.partner.supplier-quota-manage.manage.ps.btn-detail-line-save`,
                    type: 'button',
                    meaning: '供应商配额管理详情-行保存',
                  },
                ]}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </PermissionButton>,
              <PermissionButton
                data-name="create"
                type="primary"
                onClick={this.handleAdd}
                permissionList={[
                  {
                    code: `srm.partner.supplier-quota-manage.manage.ps.btn-detail-line-new`,
                    type: 'button',
                    meaning: '供应商配额管理详情-行新建',
                  },
                ]}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </PermissionButton>,
            ].filter(Boolean)
          )}
        </Row>
        {customizeTable(
          {
            code: 'SSLM.SUPPLIER_QUOTA_MANAGE.LINE',
            clearCache: (a, b, cb) => {
              if (a !== b) cb(a);
            },
            useNewValid: true,
          },
          <EditTable
            bordered
            rowKey="quotaLineId"
            columns={remoteColumns}
            pagination={false}
            dataSource={quotaAsignList}
            rowSelection={isEdit ? rowSelection : null}
            scroll={{ x: scrollX, y: 350 }}
          />
        )}
      </Fragment>
    );
  }
}
