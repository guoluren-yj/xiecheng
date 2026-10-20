/**
 * ListTransfer - 通用列表组件
 * @date: 2019-08-24
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Table, Button, Row, Col, Form, Select } from 'hzero-ui';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';

import TransferSearch from './TransferSearch';
import style from './index.less';

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

/**
 * ListTransfer - 通用列表组件
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ListTransfer extends PureComponent {
  state = {
    leftSelectedRows: [],
    rightSelectedRows: [],
    productModalVisible: false,
  };

  /**
   * 勾选table
   * @param {Array} selectedRows table数组
   */
  @Bind()
  onLeftSelectChange(keys, selectedRows) {
    const { rowKey } = this.props;
    const { leftSelectedRows = [] } = this.state;
    const leftSelectedRowsKey = leftSelectedRows.map(n => n[rowKey]);
    // 新增勾选
    const addRows = selectedRows.filter(n => !leftSelectedRowsKey.includes(n[rowKey]));
    const newRows = [...leftSelectedRows, ...addRows];
    // 取消勾选
    const newLeftSelectedRows = newRows.filter(n => keys.includes(n[rowKey]));
    this.setState({ leftSelectedRows: newLeftSelectedRows });
  }

  /**
   * 勾选table
   * @param {Array} selectedRows table数组
   */
  @Bind()
  onRightSelectChange(keys, selectedRows) {
    const { rowKey } = this.props;
    const { rightSelectedRows = [] } = this.state;
    const rightSelectedRowsKey = rightSelectedRows.map(n => n[rowKey]);
    // 新增勾选
    const addRows = selectedRows.filter(n => !rightSelectedRowsKey.includes(n[rowKey]));
    const newRows = [...rightSelectedRows, ...addRows];
    // 取消勾选
    const newRightSelectedRows = newRows.filter(n => keys.includes(n[rowKey]));
    this.setState({ rightSelectedRows: newRightSelectedRows });
  }

  /**
   * 绑定form
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref.props.form;
  }

  /**
   * 关闭模态框
   */
  @Bind()
  handleCloseModal() {
    const { onHandleCloseModal } = this.props;
    this.setState({
      leftSelectedRows: [],
      rightSelectedRows: [],
    });
    onHandleCloseModal();
  }

  /**
   * 查询已经分配的服务
   */
  @Bind()
  fetchExitProductList(params = {}) {
    const { onFetchExitProductList } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    onFetchExitProductList({ page: params, ...filterValues });
  }

  /**
   * 查询未分配的服务
   */
  @Bind()
  fetchNoExitProductList(params = {}) {
    const { onFetchNoExitProductList } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    onFetchNoExitProductList({ page: params, ...filterValues });
  }

  /**
   * 条件查询未分配和已分配
   */
  @Bind()
  fetchProductList() {
    const { onFetchNoExitProductList, onFetchExitProductList, agreementStatus } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    onFetchNoExitProductList({ ...filterValues });
    if (agreementStatus === 'PUBLISHED') onFetchExitProductList({ ...filterValues });
  }

  /**
   * 加入服务
   */
  @Bind()
  handleAddProduct() {
    const { onHandleAddProduct } = this.props;
    const { leftSelectedRows } = this.state;
    onHandleAddProduct(leftSelectedRows);
    this.setState({
      leftSelectedRows: [],
    });
  }

  /**
   * 删除服务
   */
  @Bind()
  handleRemoveProduct() {
    const { onHandleRemoveProduct } = this.props;
    const { rightSelectedRows } = this.state;
    onHandleRemoveProduct(rightSelectedRows);
    this.setState({
      rightSelectedRows: [],
    });
  }

  @Bind()
  handleCreateProduct() {
    const { onCreateProduct, onQueryCategory, agreementLine = [] } = this.props;
    this.setState(
      {
        productModalVisible: true,
      },
      () => {
        onQueryCategory(this.props.form, (agreementLine[0] || {}).catalogId);
      }
    );
    onCreateProduct();
  }

  @Bind()
  handleProductOK() {
    const {
      form: { getFieldValue, validateFields },
      onProductOK,
    } = this.props;
    const params = {
      cid: getFieldValue('cid'),
      details: getFieldValue('content'),
    };
    validateFields(err => {
      if (!err) {
        this.setState({ productModalVisible: false });
        onProductOK(params);
      }
    });
  }

  @Bind()
  handleOk() {
    const { type, onGoodsReplace, agreementLine } = this.props;
    const { leftSelectedRows = [] } = this.state;
    this.setState({ productModalVisible: false });
    if (type === 'replace') {
      onGoodsReplace(agreementLine, leftSelectedRows);
      this.setState({
        leftSelectedRows: [],
      });
    } else {
      this.handleAddProduct();
    }
  }

  render() {
    const { leftSelectedRows = [], rightSelectedRows = [], productModalVisible } = this.state;
    const {
      form,
      modalTitle,
      rowKey,
      columns,
      disabledFlg = false,
      fetchExitLoading,
      fetchNoExitLoading,
      addLoading,
      deleteLoading,
      createLoading,
      replaceLoading,
      productVisible,
      agreementStatus,
      exitProductList = [], // 模块下已分配服务
      noExitProductList = [], // 模块下未分配服务
      exitPagination = {}, // 模块下已分配服务分页
      noExitPagination = {}, // 模块下未分配服务分页
      productTemplate = [],
      agreementLine,
      tenantId,
      skuApprove,
    } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const filterProps = {
      onSearch: this.fetchProductList,
      onRef: this.handleBindRef,
      tenantId,
    };
    const leftRowSelection = {
      selectedRowKeys: leftSelectedRows.map(o => o[rowKey]),
      onChange: this.onLeftSelectChange,
      getCheckboxProps: () => ({
        disabled: disabledFlg,
      }),
    };
    const rightRowSelection = {
      selectedRowKeys: rightSelectedRows.map(o => o[rowKey]),
      onChange: this.onRightSelectChange,
      getCheckboxProps: () => ({
        disabled: disabledFlg,
      }),
    };
    const tableProps =
      agreementStatus === 'noExitProduct'
        ? {
            bordered: true,
            rowKey: 'skuId',
            loading: fetchNoExitLoading,
            columns,
            dataSource: noExitProductList,
            rowSelection: leftRowSelection,
            onChange: this.fetchNoExitProductList,
            pagination: noExitPagination,
            className: style['transfer-page'],
          }
        : {
            bordered: true,
            rowKey: 'skuId',
            loading: fetchExitLoading,
            columns,
            dataSource: exitProductList,
            rowSelection: rightRowSelection,
            onChange: this.fetchExitProductList,
            pagination: exitPagination,
            className: style['transfer-page'],
          };
    const footerButtons = [
      <Button onClick={this.handleCloseModal}>
        {intl.get('hzero.common.button.cancel').d('取消')}
      </Button>,
      <Button
        disabled={leftSelectedRows.length === 0}
        type="primary"
        loading={addLoading || replaceLoading}
        onClick={this.handleOk}
      >
        {intl.get('hzero.common.button.ok').d('确定')}
      </Button>,
    ];
    const footer = agreementStatus === 'PUBLISHED' ? null : footerButtons;
    return (
      <>
        <Modal
          title={modalTitle}
          visible={productVisible}
          onOk={this.handleOk}
          onCancel={this.handleCloseModal}
          footer={footer}
          width={agreementStatus === 'PUBLISHED' ? 1000 : 800}
          wrapClassName={style['transfer-modal']}
          okText={intl.get('hzero.common.button.ok').d('确定')}
          cancelText={intl.get('hzero.common.button.cancel').d('取消')}
          destroyOnClose
        >
          {skuApprove && agreementStatus === 'PUBLISHED' && (
            <Row>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('small.common.model.item').d('物料')}
                >
                  <p
                    className={style['cate-name']}
                    title={agreementLine[0] && agreementLine[0].itemName}
                  >
                    {agreementLine[0] && agreementLine[0].itemName}
                  </p>
                  <Button
                    className={style['cate-button']}
                    onClick={() => this.handleCreateProduct()}
                  >
                    {intl.get('small.common.model.createBasedOnItem').d('基于物料创建商品')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          )}
          <Row>
            <div className="table-list-search">
              <TransferSearch {...filterProps} />
            </div>
          </Row>
          {skuApprove && agreementStatus === 'PUBLISHED' ? (
            <Row gutter={12}>
              <Col span={11} className={style.fl}>
                <p>{intl.get('small.common.model.productInventory').d('商品库')}</p>
                <Table
                  bordered
                  rowKey="skuId"
                  loading={fetchNoExitLoading}
                  columns={columns}
                  dataSource={noExitProductList}
                  rowSelection={leftRowSelection}
                  onChange={this.fetchNoExitProductList}
                  pagination={noExitPagination}
                  className={style['transfer-page']}
                />
              </Col>
              <Col span={2} className={style['transfer-button']}>
                <Button
                  style={{ marginBottom: '15px' }}
                  onClick={this.handleAddProduct}
                  disabled={leftSelectedRows.length <= 0}
                  loading={addLoading}
                >
                  {`${intl.get('small.common.model.join').d('加入')}>`}
                </Button>
                <Button
                  onClick={this.handleRemoveProduct}
                  disabled={rightSelectedRows.length <= 0}
                  loading={deleteLoading}
                >
                  {`<${intl.get('small.common.model.delete').d('删除')}`}
                </Button>
              </Col>
              <Col span={11} className={style.fr}>
                <p>{intl.get('small.common.model.exitProducts').d('已添加商品')}</p>
                <Table
                  bordered
                  rowKey="skuId"
                  loading={fetchExitLoading}
                  columns={columns}
                  dataSource={exitProductList}
                  rowSelection={rightRowSelection}
                  onChange={this.fetchExitProductList}
                  pagination={exitPagination}
                  className={style['transfer-page']}
                />
              </Col>
            </Row>
          ) : (
            <Table {...tableProps} />
          )}
        </Modal>
        <Modal
          title={intl.get('small.common.model.createProduct').d('创建商品')}
          destroyOnClose
          onCancel={() => this.setState({ productModalVisible: false })}
          visible={productModalVisible}
          onOk={() => this.handleProductOK()}
          confirmLoading={createLoading}
        >
          <Form.Item
            label={intl.get('small.common.model.productIntroTemp').d('商品介绍模板')}
            {...formLayout}
          >
            {getFieldDecorator('content')}
            <Select
              style={{ width: '100%' }}
              onChange={val => {
                const { content = '' } = productTemplate.find(f => f.templateId === val) || {};
                setFieldsValue({ content });
              }}
            >
              {productTemplate.map(item => (
                <Select.Option key={item.templateId} value={item.templateId}>
                  {item.templateName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={intl.get('small.common.model.platformCategory').d('平台分类')}
            {...formLayout}
          >
            {getFieldDecorator('categoryName')}
            {getFieldDecorator('cid', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('small.common.model.platformCategory').d('平台分类'),
                  }),
                },
              ],
            })(
              <Lov
                textValue={getFieldValue('categoryName')}
                code="SMPC.CATEGORY"
                isDbc2Sbc={false}
                queryParams={{
                  supplierTenantId: getCurrentOrganizationId(),
                }}
              />
            )}
          </Form.Item>
        </Modal>
      </>
    );
  }
}
