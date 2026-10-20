/**
 * SupplierClassify - 供应商分类
 * @date: 2020-03-19
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import React, { Component, Fragment } from 'react';
import { Input, Form, Button } from 'hzero-ui';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import {
  getEditTableData,
  getCurrentOrganizationId,
  addItemsToPagination,
  delItemToPagination,
} from 'utils/utils';
import Lov from '@/routes/components/Lov';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import { yesOrNoRender } from 'utils/renderer';
import LovMultiple from '@/routes/components/LovMultiple';

const FormItem = Form.Item;

const tenantId = getCurrentOrganizationId();

@connect(({ supplierInform, loading }) => ({
  supplierInform,
  operateLoading:
    loading.effects[`supplierInform/querySupplierClassify`] ||
    loading.effects[`supplierInform/saveSupplierClassifyList`],
}))
export default class SupplierClassify extends Component {
  state = {
    // checked: true,
  };

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.handleSupplierClassifyList();
  }

  /**
   * 查询供应商分类信息
   */
  @Bind()
  handleSupplierClassifyList(page = {}) {
    const { dispatch, changeReqId, customizeUnitCode } = this.props;
    dispatch({
      type: 'supplierInform/querySupplierClassify',
      payload: {
        page,
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
      detailHeader,
      supplierInform: { supplierClassifyList = [] },
    } = this.props;

    const tableValues = getEditTableData(supplierClassifyList, ['_status', 'cateId']);
    const isEditing = !!supplierClassifyList.find(
      d => d._status === 'create' || d._status === 'update'
    );
    const filterValue = {
      _status: 'create',
      tenantId,
      dataChangeFlag: 2,
      supplierTenantId: detailHeader.supplierTenantId,
      supplierCompanyId: detailHeader.supplierCompanyId,
    };

    if (isEditing) {
      if (Array.isArray(tableValues) && tableValues.length !== 0) {
        return tableValues.map(n => ({ ...n, ...filterValue }));
      } else {
        notification.warning({
          message: intl
            .get('sslm.common.view.message.supplierClassifyRequiredMsg')
            .d('供应商分类信息填写有误'),
        });
        return false;
      }
    } else {
      return [];
    }
  }

  /**
   * 供应商保存
   */
  @Bind()
  handleSave() {
    const { dispatch, customizeUnitCode } = this.props;
    const list = this.checkData();
    if (list) {
      dispatch({
        type: 'supplierInform/saveSupplierClassifyList',
        payload: { list, customizeUnitCode },
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
      changeReqId,
      dispatch,
      supplierInform: { supplierClassifyList = [], supplierClassifyPagination },
    } = this.props;
    const data = (newSelectedRows || []).map(n => {
      const { categoryId, ...rest } = n;
      return {
        supplierCategoryId: categoryId,
        ...rest,
        _status: 'create',
        cateId: uuidv4(),
        changeReqId,
        enabledFlag: 1,
      };
    });
    dispatch({
      type: 'supplierInform/updateState',
      payload: {
        supplierClassifyList: [...data, ...supplierClassifyList],
        supplierClassifyPagination: addItemsToPagination(
          data.length,
          supplierClassifyList.length,
          supplierClassifyPagination
        ),
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
      supplierInform: { supplierClassifyList = [], supplierClassifyPagination = {} },
    } = this.props;
    const newSupplierClassifyList = supplierClassifyList.filter(n => n.cateId !== record.cateId);
    dispatch({
      type: 'supplierInform/updateState',
      payload: {
        supplierClassifyList: newSupplierClassifyList,
        supplierClassifyPagination: delItemToPagination(
          supplierClassifyList.length,
          supplierClassifyPagination
        ),
      },
    });
  }
  // /**
  //  * 是否启用checkBox change
  //  * @param {*} e
  //  * @param {*} record
  //  */
  // @Bind()
  // handleChangeCheckbox(e, record) {
  //   console.log('e.target.checked', e.target.checked);
  //   const {
  //     dispatch,
  //     supplierInform: { supplierClassifyList = [] },
  //   } = this.props;
  //   const newSupplierClassifyList = supplierClassifyList.map(item =>
  //     item.cateId === record.cateId ? { ...item, enabledFlag: e.target.checked } : item
  //   );
  //   dispatch({
  //     type: 'supplierInform/updateState',
  //     payload: {
  //       supplierClassifyList: newSupplierClassifyList,
  //     },
  //   });
  // }

  /**
   * 编辑/取消
   */
  @Bind()
  handleEdit(flag, record) {
    const {
      dispatch,
      supplierInform: { supplierClassifyList = [] },
    } = this.props;

    // console.log('record', record);
    const newSupplierClassifyList = supplierClassifyList.map(item => {
      // console.log('item', item);
      if (item.cateId === record.cateId) {
        return { ...item, _status: flag ? 'update' : '' };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'supplierInform/updateState',
      payload: {
        supplierClassifyList: newSupplierClassifyList,
      },
    });
  }

  render() {
    const {
      pubEdit,
      supplierInform: { supplierClassifyList = [], supplierClassifyPagination },
      operateLoading,
      changFlag,
      custLoading,
      customizeTable,
      customizeUnitCode,
      savePermissionFlag,
    } = this.props;

    // const isSave = supplierClassifyList.filter(o => o._status === 'create' || o._status === 'update');

    const columns = [
      {
        title: intl.get('sslm.enterpriseInform.model.supplierClassify.code').d('供应商类型分类'),
        dataIndex: 'categoryCode',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('supplierCategoryId', {
                initialValue: record.supplierCategoryId,
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
                  queryParams={{ tenantId, enabledFlag: 1 }}
                  textValue={val}
                  lovOptions={{
                    displayField: 'categoryCode',
                    valueField: 'categoryId',
                  }}
                  onChange={(_, lovRecord) => {
                    const { categoryId, ...rest } = lovRecord;
                    record.$form.setFieldsValue({
                      supplierCategoryId: categoryId,
                      ...rest,
                    });
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
                disabled={pubEdit ? !pubEdit : changFlag || !savePermissionFlag}
                onClick={() => this.handleEdit(true, record)}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </Fragment>
        ),
      },
    ].filter(Boolean);
    return (
      <Fragment>
        <div
          style={{
            textAlign: 'right',
            paddingBottom: 16,
            display: changFlag || !savePermissionFlag ? 'none' : 'block',
          }}
        >
          <Button onClick={this.handleSave} loading={operateLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <LovMultiple
            code="SSLM.SUPPLIER_CATEGORY_TREE"
            queryParams={{ tenantId, enabledFlag: 1 }}
            isButton
            type="primary"
            style={{ marginLeft: 8 }}
            buttonText={intl.get(`hzero.common.button.create`).d('新建')}
            changeSelectRows={this.handleMultipleAdd}
            parentNodeDisable
            loading={operateLoading}
          />
        </div>
        {customizeTable(
          {
            code: customizeUnitCode,
          },
          <EditTable
            bordered
            rowKey="cateId"
            columns={columns}
            dataSource={supplierClassifyList}
            pagination={supplierClassifyPagination}
            loading={operateLoading}
            custLoading={custLoading}
            onChange={this.handleSupplierClassifyList}
          />
        )}
      </Fragment>
    );
  }
}
