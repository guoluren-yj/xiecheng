/**
 * create 创建招标
 * @date: 2019-05-28
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Button, Modal, Popover, Row, Col, InputNumber } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import EditTable from 'components/EditTable';
import Table from '_components/Table';
import Lov from 'components/Lov';
import CPopover from '@/routes/sbid/components/CPopover';
import { phoneRender } from '@/utils/renderer';
import styles from './index.less';

@Form.create({ fieldNameProp: null })
class SupplierLineTable extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 改变供应商编码-获取供应商名称
   */
  @Bind()
  changeSupplierCompanyNum(value, dataList, record) {
    const {
      supplierCompanyName,
      supplierCompanyCode,
      supplierCompanyId,
      supplierTenantId,
      companyId,
      contactName,
      mobilephone,
      mail,
      stageDescription,
      supplierContactId,
      internationalTelCode,
      internationalTelCodeMeaning,
    } = dataList;

    record.$form.setFieldsValue({
      supplierCompanyName,
      supplierCompanyNum: supplierCompanyCode,
      supplierTenantId,
      companyId,
      supplierCompanyId,
      supplierContactId,
      stageDescription,
      contactName,
      contactMobilephone: mobilephone,
      contactMail: mail,
      internationalTelCode,
      internationalTelCodeMeaning,
    });
  }

  /**
   * 改变联系人
   *
   * @param {*} val
   * @param {*} dataList
   * @param {*} record
   * @memberof SupplierLineTable
   */
  @Bind()
  changeContactName(val, dataList, record) {
    const {
      companyContactId,
      mail,
      mobilephone,
      name,
      internationalTelCode,
      internationalTelCodeMeaning,
    } = dataList;

    record.$form.setFieldsValue({
      companyContactId,
      contactMobilephone: mobilephone,
      contactMail: mail,
      name,
      internationalTelCode,
      internationalTelCodeMeaning,
    });
  }

  /**
   * 供应商数据字段重命名
   *
   * @param {*} [dataSource=[]]
   * @returns
   * @memberof SupplierLineTable
   */
  handleDataSource(dataSource = []) {
    if (!dataSource || !dataSource.length) {
      return [];
    }

    const newDataSource = dataSource.map((item) => {
      return Object.assign(item, {
        contactMobilephone: item.mobilephone,
        contactMail: item.mail,
        internationalTelCode: item.internationalTelCode,
        internationalTelCodeMeaning: item.internationalTelCodeMeaning,
      });
    });

    return newDataSource;
  }

  /**
   * 重置表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch(page = {}) {
    const { onSearchBulkSupplier } = this.props;
    if (onSearchBulkSupplier) {
      onSearchBulkSupplier(page);
    }
  }

  /**
   * 查询供应商分类表单
   *
   * @returns
   * @memberof SupplierLineTable
   */
  renderSearchForm() {
    const {
      form,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              label={intl.get(`ssrc.bidHall.model.bidHall.supplierCat`).d('供应商分类')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('categoryId')(
                <Lov
                  code="SSLM.SUPPLIER_CATEGORY"
                  textField="categoryDescription"
                  queryParams={{ isCategoryEnabledFlag: 1 }}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get(`ssrc.bidHall.model.bidHall.itemCategory`).d('物品分类')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('itemCategoryId', {})(<Lov code="SMDM.TREE_ITEM_CATEGORY" />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item>
              <Button
                data-code="reset"
                onClick={this.handleFormReset}
                style={{ marginRight: '8px' }}
              >
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.status.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              label={intl.get(`ssrc.bidHall.model.bidHall.supplierCode`).d('供应商编码')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('supplierCompanyNum', {})(<Input />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get(`ssrc.bidHall.model.bidHall.supplierName`).d('供应商名称')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('supplierCompanyName', {})(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              label={intl.get(`ssrc.bidHall.model.bidHall.supplierStage`).d('供应商生命周期')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('stageDescription', {})(<Input />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('queryItemId')(
                <Lov
                  code="SMDM.CUSTOMER_ITEM"
                  lovOptions={{
                    displayField: 'itemName',
                    valueField: 'itemId',
                  }}
                  queryParams={{
                    invOrganizationId: form.getFieldValue('invOrganizationId'),
                    ouId: form.getFieldValue('ouId') || null,
                    // companyId,
                  }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              label={intl
                .get(`ssrc.bidHall.model.bidHall.registeredCapitalTenThousand`)
                .d('注册资本(万)')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('registeredCapital', {
                rules: [],
              })(<InputNumber min={0} style={{ width: '100%' }} />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  getModalColumns = () => {
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 200,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.queryRfq.lifeCycle`).d('生命周期阶段'),
        dataIndex: 'stageDescription',
        width: 140,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.contactName`).d('联系人'),
        dataIndex: 'contactName',
        width: 200,
      },
      {
        title: intl.get(`ssrc.bidHall.model.queryRfq.contactMobilephone`).d('联系电话'),
        dataIndex: 'contactMobilephone',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.queryRfq.contactMail`).d('电子邮件'),
        dataIndex: 'contactMail',
        width: 180,
      },
    ];

    return columns;
  };

  render() {
    const {
      templateId = null,
      loading,
      loadingSupplierLov,
      dataSource = [],
      organizationId,
      userId,
      companyId,
      onSearch,
      onSearchBulkSupplier,
      SupplierLineRowSelection,
      batchSupplierRowSelection,
      onSaveLine,
      onDeleteLines,
      onCreateLine,
      // supplierCompanyId,
      sourceMethod,
      supplierLineSelectedRowKeys,
      batchAddBidSupplier,
      cancelBatchOperate,
      openBatchAddModel,
      batchOperateSupplierModelVisible,
      bulkSupplierList,
      pagination,
      bulkSupplierListPagination,
      match: { params },
      customizeTable = () => {},
      allowAddSuppliers,
    } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyId',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('supplierCompanyId', {
                rules: [
                  {
                    required: sourceMethod === 'INVITE',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.supplierCode`).d('供应商编码'),
                    }),
                  },
                ],
                initialValue: record.supplierCompanyId,
              })(
                <Lov
                  code="SSRC.SUPPLIER"
                  onChange={(value, dataList) =>
                    this.changeSupplierCompanyNum(value, dataList, record)
                  }
                  queryParams={{
                    organizationId,
                    userId,
                    companyId,
                    sourceFrom: 'BID',
                    templateId,
                    sourceHeaderId: params.bidId,
                  }}
                  textValue={record.supplierCompanyNum}
                  disabled={record._status !== 'create'}
                />
              )}
              {record.$form.getFieldDecorator('supplierCompanyNum', {
                initialValue: record.supplierCompanyNum,
              })}
              {record.$form.getFieldDecorator('companyId', {
                initialValue: record.companyId,
              })}
              {record.$form.getFieldDecorator('supplierTenantId', {
                initialValue: record.supplierTenantId,
              })}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('supplierCompanyName', {
                initialValue: val,
              })(<Input disabled />)}
              {record.$form.getFieldDecorator('supplierTenantId', {
                initialValue: record.supplierTenantId,
              })}
              {record.$form.getFieldDecorator('supplierContactId', {
                initialValue: record.supplierContactId,
              })}
            </Form.Item>
          ) : val ? (
            <Popover placement="topLeft" content={val}>
              {val}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.queryRfq.lifeCycle`).d('生命周期阶段'),
        dataIndex: 'stageDescription',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('stageDescription', {
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.contactName`).d('联系人'),
        dataIndex: 'contactName',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('contactName', {
                initialValue: val,
                rules: [
                  {
                    required: record.$form.getFieldValue('supplierCompanyId') && true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.contactName`).d('联系人'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SSRC.SUPPLIER_CONTANCTS"
                  textValue={record.contactName || record.$form.getFieldValue('contactName')}
                  queryParams={{
                    companyId,
                    supplierCompanyId: record.$form.getFieldValue('supplierCompanyId'),
                  }}
                  onChange={(value, dataList) => this.changeContactName(value, dataList, record)}
                  disabled={
                    !record.$form.getFieldValue('supplierCompanyId') || sourceMethod !== 'INVITE'
                  }
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.queryRfq.contactMobilephone`).d('联系电话'),
        dataIndex: 'contactMobilephone',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('contactMobilephone', {
                initialValue: record.contactMobilephone,
              })(
                <div>
                  {phoneRender(
                    record.$form.getFieldValue('internationalTelCodeMeaning'),
                    record.$form.getFieldValue('contactMobilephone')
                  )}
                </div>
              )}
              {record.$form.getFieldDecorator('internationalTelCode', {
                initialValue: record.internationalTelCode,
              })}
              {record.$form.getFieldDecorator('internationalTelCodeMeaning', {
                initialValue: record.internationalTelCodeMeaning,
              })}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.queryRfq.contactMail`).d('电子邮件'),
        dataIndex: 'contactMail',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              <CPopover content={val}>
                {record.$form.getFieldDecorator('contactMail', {
                  initialValue: val,
                })(<Input disabled />)}
              </CPopover>
            </Form.Item>
          ) : val ? (
            <Popover placement="topLeft" content={val}>
              {val}
            </Popover>
          ) : (
            ''
          ),
      },
    ];

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const modalColumns = this.getModalColumns();
    const modalScrollX = sum(modalColumns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <React.Fragment>
        <div className={styles['item-list-search']}>
          <Form layout="inline">
            <Button
              type="primary"
              onClick={onCreateLine}
              disabled={sourceMethod !== 'INVITE' || !allowAddSuppliers}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
            <Button onClick={onSaveLine} disabled={sourceMethod !== 'INVITE'}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button
              onClick={openBatchAddModel}
              disabled={sourceMethod !== 'INVITE' || !allowAddSuppliers}
            >
              {intl.get(`ssrc.bidHall.model.bidHall.batchAddSupplier`).d('批量添加供应商')}
            </Button>
            <Button
              onClick={onDeleteLines}
              disabled={sourceMethod !== 'INVITE' || supplierLineSelectedRowKeys.length === 0}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          </Form>
        </div>
        {customizeTable(
          { code: 'SSRC.BID_HALL_EDIT.SUPPLIER.TABLE' },
          <EditTable
            bordered
            rowKey="bidLineSupplierId"
            loading={loading}
            columns={columns}
            rowSelection={SupplierLineRowSelection}
            scroll={{ x: scrollX }}
            dataSource={dataSource}
            pagination={pagination}
            onChange={(page) => onSearch(page)}
          />
        )}

        <Modal
          visible={batchOperateSupplierModelVisible}
          title={
            <span>
              {intl.get(`ssrc.bidHall.model.bidHall.batchAddSupplier`).d('批量添加供应商')}
            </span>
          }
          width="68%"
          onOk={batchAddBidSupplier}
          onCancel={cancelBatchOperate}
          destroyOnClose
        >
          {this.renderSearchForm()}
          <Table
            bordered
            rowKey="supplierCompanyId"
            loading={loadingSupplierLov}
            columns={modalColumns}
            rowSelection={batchSupplierRowSelection}
            scroll={{ x: modalScrollX }}
            dataSource={this.handleDataSource(bulkSupplierList)}
            onChange={(page) => onSearchBulkSupplier(page)}
            pagination={bulkSupplierListPagination}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

export default SupplierLineTable;
