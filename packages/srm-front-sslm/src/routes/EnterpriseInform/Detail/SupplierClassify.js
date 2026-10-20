/**
 * SupplierClassify - 供应商分类
 * @date: 2020-03-19
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import uuidv4 from 'uuid/v4';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import React, { Component, Fragment } from 'react';
import { Input, Form, Button } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from '@/routes/components/Lov';
import Checkbox from 'components/Checkbox';
import { getEditTableData } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import LovMultiple from '@/routes/components/LovMultiple';

const FormItem = Form.Item;

@connect(({ enterpriseInform, loading }) => ({
  enterpriseInform,
  queryLoading: loading.effects[`enterpriseInform/querySupplierClassify`],
  saveLoading:
    loading.effects[`enterpriseInform/saveSupplierClassify`] ||
    loading.effects[`enterpriseInform/querySupplierClassify`],
}))
export default class SupplierClassify extends Component {
  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.handleSupplierClassifyList();
  }

  /**
   * 查询分类信息
   */
  @Bind()
  handleSupplierClassifyList() {
    const { dispatch, changeReqId, customizeUnitCode } = this.props;
    dispatch({
      type: 'enterpriseInform/querySupplierClassify',
      payload: {
        changeReqId,
        customizeUnitCode,
      },
    });
  }

  /**
   * 校验数据
   */
  @Bind()
  checkData() {
    const {
      changeReqId,
      enterpriseInform: { supplierClassifyList = [] },
    } = this.props;
    const tableValues = getEditTableData(supplierClassifyList, ['_status', 'firmChangeCateId']);
    const isEditing = !!supplierClassifyList.find(
      d => d._status === 'create' || d._status === 'update'
    );

    if (isEditing) {
      if (Array.isArray(tableValues) && tableValues.length !== 0) {
        return tableValues.map(n => ({ ...n, changeReqId }));
      } else {
        return false;
      }
    } else {
      return [];
    }
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { dispatch, customizeUnitCode } = this.props;
    const list = this.checkData();

    if (list) {
      dispatch({
        type: 'enterpriseInform/saveSupplierClassify',
        payload: {
          list,
          customizeUnitCode,
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSupplierClassifyList();
        }
      });
    }
  }

  /**
   * 处理多选新建
   */
  @Bind()
  handleMultipleAdd(newSelectedRows) {
    const {
      dispatch,
      enterpriseInform: { supplierClassifyList = [] },
      partnerTenantId = '-1',
    } = this.props;
    const data = (newSelectedRows || []).map(n => {
      const { categoryDescription, categoryCode } = n;
      const tenantIdObj = partnerTenantId !== '-1' ? { tenantId: partnerTenantId } : {};
      return {
        categoryDescription,
        categoryCode,
        _status: 'create',
        firmChangeCateId: uuidv4(),
        ...tenantIdObj,
        enabledFlag: 1,
      };
    });
    dispatch({
      type: 'enterpriseInform/updateState',
      payload: {
        supplierClassifyList: [...data, ...supplierClassifyList],
      },
    });
  }

  /**
   * 清除
   */
  @Bind()
  handleClean(record) {
    const {
      dispatch,
      enterpriseInform: { supplierClassifyList = [] },
    } = this.props;
    const newSupplierClassifyList = supplierClassifyList.filter(
      n => n.firmChangeCateId !== record.firmChangeCateId
    );
    dispatch({
      type: 'enterpriseInform/updateState',
      payload: {
        supplierClassifyList: newSupplierClassifyList,
      },
    });
  }

  /**
   * 编辑/取消
   */
  @Bind()
  handleEdit(flag, record) {
    const {
      dispatch,
      enterpriseInform: { supplierClassifyList = [] },
    } = this.props;
    const newSupplierClassifyList = supplierClassifyList.map(item => {
      if (item.firmChangeCateId === record.firmChangeCateId) {
        return { ...item, _status: flag ? 'update' : '' };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'enterpriseInform/updateState',
      payload: {
        supplierClassifyList: newSupplierClassifyList,
      },
    });
  }

  render() {
    const {
      pubEdit,
      enterpriseInform: { supplierClassifyList = [] },
      queryLoading,
      changFlag,
      partnerTenantId,
      saveLoading,
      custLoading,
      customizeTable,
      customizeUnitCode,
    } = this.props;

    const columns = [
      {
        title: intl.get('sslm.enterpriseInform.model.supplierClassify.code').d('供应商类型分类'),
        dataIndex: 'categoryCode',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('categoryCode', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.enterpriseInform.model.supplierClassify.code')
                        .d('供应商类型分类'),
                    }),
                  },
                ],
              })(
                <Lov
                  parentNodeDisable
                  disabled={changFlag}
                  code="SSLM.SUPPLIER_CATEGORY_TREE"
                  queryParams={{ queryTenantId: partnerTenantId, enabledFlag: 1 }}
                  textValue={val}
                  lovOptions={{
                    displayField: 'categoryCode',
                    valueField: 'categoryCode',
                  }}
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
          .get('sslm.enterpriseInform.model.supplierClassify.describe')
          .d('供应商分类描述'),
        dataIndex: 'categoryDescription',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
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
        title: intl.get('hzero.common.status.isEnable').d('是否启用'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: val || 0,
                })(<Checkbox disabled={changFlag} />)}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(val);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operation',
        width: 100,
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
              <a
                disabled={pubEdit ? !pubEdit : changFlag}
                onClick={() => this.handleEdit(true, record)}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </Fragment>
        ),
      },
    ];
    return (
      <Fragment>
        <div style={{ textAlign: 'right', paddingBottom: 16 }}>
          <Button onClick={this.handleSave} disabled={changFlag} loading={saveLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <LovMultiple
            code="SSLM.SUPPLIER_CATEGORY_TREE"
            queryParams={{ queryTenantId: partnerTenantId, enabledFlag: 1 }}
            isButton
            type="primary"
            style={{ marginLeft: 8 }}
            buttonText={intl.get(`hzero.common.button.create`).d('新建')}
            changeSelectRows={this.handleMultipleAdd}
            parentNodeDisable
            disabled={changFlag}
            loading={saveLoading}
          />
        </div>
        {customizeTable(
          {
            code: customizeUnitCode,
          },
          <EditTable
            bordered
            custLoading={custLoading}
            rowKey="firmChangeCateId"
            columns={columns}
            dataSource={supplierClassifyList}
            pagination={false}
            loading={queryLoading}
          />
        )}
      </Fragment>
    );
  }
}
