/*
 * SupplierOnlineConfirm - 供应商在线确认弹窗
 * @date: 2019-08-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Modal, Form, Table, Row, Col, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import notification from 'utils/notification';

import {
  SEARCH_COL_CLASSNAME,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_4_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import intl from 'utils/intl';
import { createPagination } from 'utils/utils';

import styles from './index.less';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class SupplierOnlineConfirm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notPermitDataSource: [],
      notPermitPagination: {},
      notPermitSelectedRowKeys: [],
      permitPagination: {},
      permitDataSource: [],
      permitSelectedRowKeys: [],
      allPermitDataSource: [],
    };
    props.onRef(this);
  }

  componentDidMount() {
    this.handleSearchNotPermitList();
    this.handleSearchPermitList();
  }

  /**
   * 查询未分配的供应商列表
   * @param {*} [page={}]
   */
  @Bind()
  handleSearchNotPermitList(page = {}) {
    const { onSearchNotPermitList } = this.props;
    onSearchNotPermitList(page).then(res => {
      if (res) {
        this.setState({
          notPermitDataSource: res.content,
          notPermitPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 查询未分配的供应商列表
   * @param {Object} [page={}]
   */
  @Bind()
  handleSearchPermitList(page = {}) {
    const { allPermitDataSource } = this.state;
    const { onSearchPermitList } = this.props;
    onSearchPermitList(page).then(res => {
      if (res) {
        this.setState({
          allPermitDataSource: [...allPermitDataSource, ...res.content],
          permitDataSource: res.content,
          permitPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 允许供应商在线确认
   */
  @Bind()
  handleAssign() {
    const { onAssign } = this.props;
    const { notPermitSelectedRowKeys, notPermitPagination, permitPagination } = this.state;
    onAssign(notPermitSelectedRowKeys).then(res => {
      if (res) {
        notification.success();
        this.setState({ notPermitSelectedRowKeys: [] });
        this.handleSearchPermitList(permitPagination);
        this.handleSearchNotPermitList(notPermitPagination);
      }
    });
  }

  /**
   * 取消供应商在线确认
   */
  @Bind()
  handleCancelAssign() {
    const { onCancelAssign } = this.props;
    const {
      permitSelectedRowKeys,
      allPermitDataSource,
      notPermitPagination,
      permitPagination,
    } = this.state;
    const arr = [];
    allPermitDataSource.forEach(i => {
      if (permitSelectedRowKeys.includes(i.supplierCompanyId)) {
        const { _token, supplierCompanyId } = i;
        arr.push({ _token, supplierCompanyId });
      }
    });
    onCancelAssign(arr).then(res => {
      if (res) {
        notification.success();
        this.setState({ permitSelectedRowKeys: [] });
        this.handleSearchPermitList(permitPagination);
        this.handleSearchNotPermitList(notPermitPagination);
      }
    });
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      notPermitPagination,
      notPermitDataSource,
      notPermitSelectedRowKeys,
      permitDataSource,
      permitPagination,
      permitSelectedRowKeys,
    } = this.state;
    const {
      visible,
      onCancel,
      loadingFetchNotPermitList,
      loadingFetchPermitList,
      loadingHandleAssign,
      loadingHandleCancelAssign,
      form: { getFieldDecorator },
    } = this.props;
    const modalProps = {
      visible,
      onCancel,
      width: 1000,
      title: intl.get(`spfm.configServer.view.purchaseContract.modal.supplierList`).d('供应商列表'),
      footer: null,
    };
    const notPermitTableProps = {
      columns: [
        {
          title: intl.get(`entity.supplier.name`).d('供应商名称'),
          dataIndex: 'supplierCompanyName',
          width: 120,
        },
        {
          title: intl.get(`entity.supplier.code`).d('供应商编码'),
          dataIndex: 'supplierCompanyCode',
          width: 120,
        },
      ],
      title: () =>
        intl.get(`spfm.configServer.view.purchaseContract.modal.optional`).d('可选供应商'),
      loading: loadingFetchNotPermitList,
      bordered: true,
      pagination: notPermitPagination,
      dataSource: notPermitDataSource,
      rowKey: 'supplierCompanyId',
      rowSelection: {
        selectedRowKeys: notPermitSelectedRowKeys,
        onChange: rowKeys => this.setState({ notPermitSelectedRowKeys: rowKeys }),
      },
      onChange: this.handleSearchNotPermitList,
    };
    const permitTableProps = {
      columns: [
        {
          title: intl.get(`entity.supplier.name`).d('供应商名称'),
          dataIndex: 'supplierCompanyName',
          width: 120,
        },
        {
          title: intl.get(`entity.supplier.code`).d('供应商编码'),
          dataIndex: 'supplierCompanyCode',
          width: 120,
        },
      ],
      title: () =>
        intl.get(`spfm.configServer.view.purchaseContract.modal.selected`).d('已选供应商'),
      bordered: true,
      loading: loadingFetchPermitList,
      pagination: permitPagination,
      dataSource: permitDataSource,
      rowKey: 'supplierCompanyId',
      rowSelection: {
        selectedRowKeys: permitSelectedRowKeys,
        onChange: rowKeys => this.setState({ permitSelectedRowKeys: rowKeys }),
      },
      onChange: this.handleSearchPermitList,
    };
    return (
      <Modal {...modalProps}>
        <Form className="more-fields-search-form">
          <Row {...SEARCH_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_4_LAYOUT}>
              <FormItem
                {...SEARCH_FORM_ITEM_LAYOUT}
                label={intl.get(`entity.supplier.code`).d('供应商编码')}
              >
                {getFieldDecorator('supplierCompanyCode')(<Input />)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_4_LAYOUT}>
              <FormItem
                {...SEARCH_FORM_ITEM_LAYOUT}
                label={intl.get(`entity.supplier.name`).d('供应商名称')}
              >
                {getFieldDecorator('supplierCompanyName')(<Input />)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_4_LAYOUT} className={SEARCH_COL_CLASSNAME}>
              <FormItem>
                <Button onClick={this.handleReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => {
                    this.handleSearchNotPermitList();
                    this.handleSearchPermitList();
                  }}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <div className={styles['supplier-online-confirm']}>
          <div className="one-col">
            <Table {...notPermitTableProps} />
          </div>
          <div className="two-col">
            <Button
              icon="right"
              loading={loadingHandleAssign}
              disabled={!notPermitSelectedRowKeys.length}
              onClick={this.handleAssign}
            >
              {intl.get('spfm.configServer.view.button.add.selectedSupplier').d('添加')}
            </Button>
            <Button
              icon="left"
              loading={loadingHandleCancelAssign}
              disabled={!permitSelectedRowKeys.length}
              onClick={this.handleCancelAssign}
            >
              {intl.get(`hzero.common.button.delete`).d('删除')}
            </Button>
          </div>
          <div className="three-col">
            <Table {...permitTableProps} />
          </div>
        </div>
      </Modal>
    );
  }
}
