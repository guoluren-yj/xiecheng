/**
 * ListTransfer - 通用列表组件
 * @date: 2019-08-24
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Table, Row, Col, Form } from 'hzero-ui';
import { Button } from 'choerodon-ui/pro';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';

import TransferSearch from './TransferSearch';
import style from './index.less';

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
  };

  /**
   * 勾选table
   * @param {Array} selectedRows table数组
   */
  @Bind()
  onLeftSelectChange(keys, selectedRows) {
    const { rowKey } = this.props;
    const { leftSelectedRows = [] } = this.state;
    const leftSelectedRowsKey = leftSelectedRows.map((n) => n[rowKey]);
    // 新增勾选
    const addRows = selectedRows.filter((n) => !leftSelectedRowsKey.includes(n[rowKey]));
    const newRows = [...leftSelectedRows, ...addRows];
    // 取消勾选
    const newLeftSelectedRows = newRows.filter((n) => keys.includes(n[rowKey]));
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
    const rightSelectedRowsKey = rightSelectedRows.map((n) => n[rowKey]);
    // 新增勾选
    const addRows = selectedRows.filter((n) => !rightSelectedRowsKey.includes(n[rowKey]));
    const newRows = [...rightSelectedRows, ...addRows];
    // 取消勾选
    const newRightSelectedRows = newRows.filter((n) => keys.includes(n[rowKey]));
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
    const { onFetchNoExitProductList, onFetchExitProductList } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    onFetchNoExitProductList({ ...filterValues });
    onFetchExitProductList({ ...filterValues });
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
    const { onCreateProduct } = this.props;
    onCreateProduct();
  }

  render() {
    const { leftSelectedRows = [], rightSelectedRows = [] } = this.state;
    const {
      modalTitle,
      rowKey,
      columns,
      disabledFlg = false,
      isEffective = true,
      fetchExitLoading,
      fetchNoExitLoading,
      addLoading,
      deleteLoading,
      productVisible,
      agreementStatus,
      exitProductList = [], // 模块下已分配服务
      noExitProductList = [], // 模块下未分配服务
      exitPagination = {}, // 模块下已分配服务分页
      noExitPagination = {}, // 模块下未分配服务分页
      agreementLine,
      skuApprove = true,
    } = this.props;
    const filterProps = {
      onSearch: this.fetchProductList,
      onRef: this.handleBindRef,
      tenantId: agreementLine[0] && agreementLine[0].tenantId,
    };
    const leftRowSelection = {
      selectedRowKeys: leftSelectedRows.map((o) => o[rowKey]),
      onChange: this.onLeftSelectChange,
      getCheckboxProps: () => ({
        disabled: disabledFlg,
      }),
    };
    const rightRowSelection = {
      selectedRowKeys: rightSelectedRows.map((o) => o[rowKey]),
      onChange: this.onRightSelectChange,
      getCheckboxProps: () => ({
        disabled: disabledFlg,
      }),
    };
    return (
      <>
        <Modal
          title={modalTitle}
          visible={productVisible}
          onCancel={this.handleCloseModal}
          footer={false}
          width={!['TERMINATED', 'DISABLED'].includes(agreementStatus) ? 1200 : 1000}
          wrapClassName={style['transfer-modal']}
          destroyOnClose
        >
          {skuApprove && !['TERMINATED', 'DISABLED'].includes(agreementStatus) && isEffective && (
            <Row>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('small.common.model.item').d('物料')}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
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
                  </div>
                </Form.Item>
              </Col>
            </Row>
          )}
          <Row>
            <div className="table-list-search">
              <TransferSearch {...filterProps} />
            </div>
          </Row>
          {skuApprove && !['TERMINATED', 'DISABLED'].includes(agreementStatus) && isEffective ? (
            <Row gutter={12}>
              <Col span={11} className={style.fl}>
                <p>{intl.get('small.common.model.supplierProducts').d('供应商商品库')}</p>
                <Table
                  bordered
                  rowKey="skuId"
                  loading={fetchNoExitLoading}
                  columns={columns}
                  dataSource={noExitProductList}
                  rowSelection={leftRowSelection}
                  onChange={this.fetchNoExitProductList}
                  pagination={{ ...noExitPagination, showQuickJumper: false }}
                  className={style['transfer-page']}
                />
              </Col>
              <Col span={2} className={style['transfer-button']}>
                <Button
                  style={{ marginBottom: '15px' }}
                  onClick={this.handleAddProduct}
                  disabled={leftSelectedRows.length <= 0}
                  loading={addLoading}
                  icon="navigate_next"
                >
                  {`${intl.get('small.common.model.join').d('加入')}`}
                </Button>
                <Button
                  onClick={this.handleRemoveProduct}
                  disabled={rightSelectedRows.length <= 0}
                  loading={deleteLoading}
                  icon="navigate_before"
                >
                  {`${intl.get('small.common.model.delete').d('删除')}`}
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
                  pagination={{ ...exitPagination, showQuickJumper: false }}
                  className={style['transfer-page']}
                />
              </Col>
            </Row>
          ) : (
            <Table
              bordered
              rowKey={rowKey}
              loading={fetchExitLoading}
              columns={columns}
              dataSource={exitProductList}
              onChange={this.fetchExitProductList}
              pagination={exitPagination}
              className={style['transfer-page']}
            />
          )}
        </Modal>
      </>
    );
  }
}
