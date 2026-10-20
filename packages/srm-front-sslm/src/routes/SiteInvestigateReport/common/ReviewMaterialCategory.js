/**
 * ReviewMaterialCategory - 推荐物料／品类
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { connect } from 'dva';
import { isEmpty, isFunction, isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { Button, Form, Input, Spin, Modal } from 'hzero-ui';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import notification from 'utils/notification';
import Table from 'srm-front-boot/lib/components/EditTable';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  createPagination,
  getEditTableData,
  addItemsToPagination,
  delItemsToPagination,
} from 'utils/utils';
import NewLov from '@/routes/components/Lov'; // lov父级品类不可选

const tenantId = getCurrentOrganizationId();

const FormItem = Form.Item;

@formatterCollections({
  code: ['sslm.siteInvestigateReport'],
})
@connect(({ siteInvestigateReport, loading }) => ({
  siteInvestigateReport,
  queryLoading: loading.effects['siteInvestigateReport/queryMaterialCategory'],
  querySupplierMaterialCategory:
    loading.effects['siteInvestigateReport/querySupplierMaterialCategory'],
  saveLoading: loading.effects['siteInvestigateReport/saveMaterialCategory'],
  deleteLoading: loading.effects['siteInvestigateReport/deleteMaterialCategory'],
}))
export default class ReviewMaterialCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [], // 选中项
      dataSource: [],
      pagination: {},
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { evalHeaderId: prevEvalHeaderId } = prevProps;
    const { evalHeaderId } = this.props;
    return evalHeaderId !== prevEvalHeaderId;
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      this.queryMaterialCategory();
    }
  }

  componentDidMount() {
    const { onRef = e => e } = this.props;
    onRef(this);
    this.queryMaterialCategory();
  }

  /**
   * 查询物料／品类
   */
  @Bind()
  queryMaterialCategory(page = {}) {
    const {
      dispatch,
      evalHeaderId,
      entrance = '',
      customizeCode: customizeUnitCode,
      isAlreadyFeedback,
    } = this.props;
    const type =
      entrance === 'feedBack' || entrance === 'receive'
        ? 'siteInvestigateReport/querySupplierMaterialCategory'
        : 'siteInvestigateReport/queryMaterialCategory';
    dispatch({
      type,
      payload: {
        isAlreadyFeedback,
        customizeUnitCode,
        evalHeaderId,
        page,
      },
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.content.map(n => ({ ...n, _status: 'update' })),
          pagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const { evalHeaderId } = this.props;
    const { dataSource, pagination } = this.state;
    const newDataSource = [
      { evalHeaderId, evalItemCateId: uuidv4(), _status: 'create' },
      ...dataSource,
    ];
    this.setState({
      dataSource: newDataSource,
      pagination: addItemsToPagination(1, dataSource.length, pagination),
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { dispatch } = this.props;
    const { dataSource } = this.state;

    const tableValues = getEditTableData(dataSource, ['evalItemCateId', '_status']);
    if (!isEmpty(tableValues)) {
      dispatch({
        type: 'siteInvestigateReport/saveMaterialCategory',
        payload: tableValues,
      }).then(res => {
        if (res) {
          notification.success();
          this.queryMaterialCategory();
        }
      });
    }
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { selectedRows, dataSource, pagination } = this.state;
    const { dispatch } = this.props;
    Modal.confirm({
      title: intl.get('sslm.siteInvestigateReport.view.message.deleteConfirm').d('确认删除？'),
      onOk: () => {
        if (!isEmpty(selectedRows)) {
          const createRows = selectedRows
            .filter(n => n._status === 'create')
            .map(n => n.evalItemCateId);
          const updateRows = selectedRows
            .filter(n => n._status === 'update')
            .map(n => n.evalItemCateId);

          if (!isEmpty(createRows)) {
            const newDataSource = dataSource.filter(
              n => createRows.indexOf(n.evalItemCateId) > -1 === false
            );
            this.setState({
              dataSource: newDataSource,
              pagination: delItemsToPagination(createRows.length, dataSource.length, pagination),
            });
          }
          if (!isEmpty(updateRows)) {
            dispatch({
              type: 'siteInvestigateReport/deleteMaterialCategory',
              payload: updateRows,
            }).then(res => {
              if (res) {
                notification.success();
                this.queryMaterialCategory();
              }
            });
          }
          this.setState({ selectedRows: [], selectedRowKeys: [] });
        }
      },
    });
  }

  /**
   * 选中项发生改变的回调
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  render() {
    const { selectedRowKeys, selectedRows, dataSource, pagination } = this.state;
    const {
      queryLoading,
      evalStatus = '',
      saveLoading,
      deleteLoading,
      querySupplierMaterialCategory,
      isView = false,
      isPub = false,
      customizeTable,
      customizeBtnGroup,
      custLoading,
      customizeCode = '',
      entrance = '',
    } = this.props;

    const isEdit =
      (evalStatus === 'NEW' ||
        evalStatus === 'FEEDBACK' ||
        evalStatus === 'FEEDBACK_APPROVALED' ||
        evalStatus === 'NEW_APPROVALED') &&
      !isView &&
      !isPub;

    const columns = [
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.materialCode').d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        render: (val, record) => {
          if (isEdit && ['create', 'update'].includes(record._status)) {
            record.$form.getFieldDecorator('itemId', { initialValue: record.itemId });
            return (
              <FormItem>
                {record.$form.getFieldDecorator('itemCode', {
                  rules: [
                    {
                      required: !(
                        record.$form.getFieldValue('itemCategoryCode') || record.itemCategoryCode
                      ),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.siteInvestigateReport.modal.mange.materialCode')
                          .d('物料编码'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <Lov
                    code="SSLM.RELATED_CATEGORY_ITEM"
                    textField="itemCode"
                    queryParams={{
                      tenantId,
                      categoryId: record.$form.getFieldValue('itemCategoryId'),
                    }}
                    lovOptions={{
                      displayField: 'itemCode',
                      valueField: 'itemCode',
                    }}
                    onChange={(_, lovRecord) => {
                      record.$form.setFieldsValue({
                        itemId: lovRecord.itemId,
                        itemName: lovRecord.itemName,
                        itemCategoryId: lovRecord.categoryId,
                        itemCategoryCode: lovRecord.categoryCode,
                        itemCategoryName: lovRecord.categoryName,
                      });
                      setTimeout(() => {
                        record.$form.validateFields({ force: true });
                      }, 300);
                    }}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.materialDesc').d('物料描述'),
        dataIndex: 'itemName',
        width: 200,
        render: (val, record) =>
          isEdit && ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('itemName', {
                initialValue: val,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.categoryCode').d('品类代码'),
        dataIndex: 'itemCategoryCode',
        width: 150,
        render: (val, record) => {
          if (isEdit && ['create', 'update'].includes(record._status)) {
            record.$form.getFieldDecorator('itemCategoryId', {
              initialValue: record.itemCategoryId,
            });
            return (
              <FormItem>
                {record.$form.getFieldDecorator('itemCategoryCode', {
                  rules: [
                    {
                      required: !(record.$form.getFieldValue('itemCode') || record.itemCode),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.siteInvestigateReport.modal.mange.categoryCode')
                          .d('品类代码'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <NewLov
                    code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                    queryParams={{
                      tenantId,
                      hzeroUIFlag: 1,
                      businessObjectCode: 'SRM_C_SRM_SSLM_SITE_EVAL_HEADER',
                      itemId: record.$form.getFieldValue('itemId'),
                    }}
                    lovOptions={{
                      displayField: 'categoryCode',
                      valueField: 'categoryCode',
                    }}
                    textField="itemCategoryCode"
                    onChange={(_, lovRecord) => {
                      record.$form.setFieldsValue({
                        itemCategoryId: lovRecord.categoryId,
                        itemCategoryName: lovRecord.categoryName,
                      });
                      setTimeout(() => {
                        record.$form.validateFields({ force: true });
                      }, 300);
                    }}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.category').d('品类'),
        dataIndex: 'itemCategoryName',
        width: 200,
        render: (val, record) =>
          isEdit && ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('itemCategoryName', {
                initialValue: val,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.brand').d('品牌'),
        dataIndex: 'brand',
        width: 150,
        render: (val, record) =>
          isEdit && ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('brand', {
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        width: 150,
        dataIndex: 'remark',
        render: (val, record) =>
          isEdit && ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('remark', {
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: this.handleRowSelectChange,
    };
    const spining =
      entrance === 'feedBack' || entrance === 'receive'
        ? querySupplierMaterialCategory
        : queryLoading;

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    return (
      <Spin spinning={spining}>
        <div className="table-list-search" style={{ textAlign: 'right' }}>
          {isEdit &&
            customizeBtnGroup(
              {
                code: 'SSLM_SITEINVESTIGATEREPORT.MATERIAL_CATEGORY_BTNGROUP',
              },
              [
                <Button
                  data-name="delete"
                  loading={deleteLoading}
                  disabled={isEmpty(selectedRows)}
                  onClick={this.handleDelete}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>,
                <Button
                  data-name="save"
                  loading={saveLoading}
                  onClick={this.handleSave}
                  style={{ margin: '0 8px' }}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>,
                <Button data-name="create" type="primary" onClick={this.handleAdd}>
                  {intl.get(`hzero.common.button.create`).d('新建')}
                </Button>,
              ]
            )}
        </div>
        {isFunction(customizeTable) ? (
          customizeTable(
            {
              code: customizeCode,
            },
            <Table
              bordered
              custLoading={custLoading}
              rowKey="evalItemCateId"
              columns={columns}
              dataSource={dataSource}
              pagination={pagination}
              scroll={{ x: scrollX, y: 350 }}
              rowSelection={isEdit ? rowSelection : null}
              onChange={this.queryMaterialCategory}
            />
          )
        ) : (
          <Table
            bordered
            custLoading={custLoading}
            rowKey="evalItemCateId"
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            rowSelection={isEdit ? rowSelection : null}
            onChange={this.queryMaterialCategory}
          />
        )}
      </Spin>
    );
  }
}
