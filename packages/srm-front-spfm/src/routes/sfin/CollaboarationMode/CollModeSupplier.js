/*
 * CollModeSupplier - 协同模式供应商列表 Modal
 * @date: 2020-9-15
 * @author: JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Modal, Table, Row, Col, Input, Switch } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, isFunction } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';

import { getCurrentOrganizationId, createPagination } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
} from 'utils/constants';
import SupplierAddMulti from './SupplierAddMulti';

const FormItem = Form.Item;

@connect(({ loading, configServer }) => ({
  configServer,
  tenantId: getCurrentOrganizationId(),
  fetching: loading.effects['configServer/fetchCollModeSupplier'],
}))
@Form.create({ fieldNameProp: null })
export default class CollModeSupplier extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      header: {},
      dataSource: [],
      pagination: {},
      selectedRows: [],
      supplierModalVisible: false,
    };
  }

  componentDidMount() {
    this.handleSearchHeader();
    this.handleSearch();
  }

  @Bind()
  handleSearchHeader() {
    const { dispatch, tenantId, invoiceRuleId } = this.props;
    dispatch({
      type: 'configServer/fetchRuleDetail',
      payload: { tenantId, invoiceRuleId },
    }).then((res) => {
      if (res) {
        this.setState({
          header: res,
        });
      }
    });
  }

  @Bind()
  handleSearch(page = {}) {
    const {
      dispatch,
      tenantId,
      invoiceRuleId,
      form: { getFieldsValue },
    } = this.props;
    dispatch({
      type: 'configServer/fetchCollModeSupplier',
      payload: { tenantId, invoiceRuleId, ...getFieldsValue(), page },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content,
          pagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { dataSource } = this.state;
    const { dispatch, tenantId } = this.props;
    const saveData = [];
    dataSource.forEach((item) => {
      const { _status, ruleDetailId, ...other } = item;
      if (_status === 'create') {
        saveData.push(other);
      }
    });
    dispatch({
      type: 'configServer/saveCollModeSupplier',
      payload: { tenantId, body: saveData },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch();
      }
    });
  }

  @Bind()
  handleDelete() {
    const { selectedRows, dataSource } = this.state;
    const { dispatch, invoiceRuleId, tenantId } = this.props;
    Modal.confirm({
      title: intl.get(`spfm.configServer.view.message.ifClean`).d('确认删除？'),
      onOk: () => {
        const deleteList = selectedRows
          .filter((item) => item._status !== 'create')
          .map((i) => ({
            ruleDetailId: i.ruleDetailId,
            objectVersionNumber: i.objectVersionNumber,
          }));
        if (isArray(deleteList) && isEmpty(deleteList)) {
          const selectedRowKeys = selectedRows.map((item) => item.ruleDetailId);
          this.setState({
            dataSource: dataSource.filter((item) => !selectedRowKeys.includes(item.ruleDetailId)),
          });
        } else {
          dispatch({
            type: 'configServer/delCollModeSupplier',
            payload: { tenantId, invoiceRuleId, body: deleteList },
          }).then((res) => {
            if (res) {
              notification.success();
              this.handleSearch();
            }
          });
        }
      },
    });
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  hideModal() {
    const { onState } = this.props;
    if (isFunction(onState)) {
      onState('collModeSupplierVisible', false);
    }
  }

  /**
   * 改变state
   */
  @Bind()
  handleStateChange(field, value, otherParams) {
    this.setState({ [field]: value, ...otherParams });
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  @Bind()
  handleIncludeAll(includeAllFlag) {
    const { header } = this.state;
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'configServer/includeSupplierAll',
      payload: { ...header, tenantId, includeAllFlag },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchHeader();
        this.handleSearch();
      }
    });
  }

  @Bind()
  handleAddSupplier(data) {
    const { dataSource } = this.state;
    const { invoiceRuleId } = this.props;
    const newData = data.map((item) => ({
      ...item,
      invoiceRuleId,
      _status: 'create',
      ruleDetailId: uuid(),
    }));
    this.setState({ dataSource: dataSource.concat(newData) });
  }

  @Bind()
  handleRowSelect(_, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  formRender(getFieldDecorator) {
    return (
      <Form layout="inline">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl
                .get(`spfm.configServer.model.configServer.supplierCompanyCode`)
                .d('供应商编码')}
            >
              {getFieldDecorator('supplierCompanyCode')(<Input trim inputChinese={false} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl
                .get(`spfm.configServer.model.configServer.supplierCompanyName`)
                .d('供应商名称')}
            >
              {getFieldDecorator('supplierCompanyName')(<Input trim />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT} className="search-btn-more">
            <FormItem>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  tableRender(dataSource, pagination, selectedRows, loading) {
    const columns = [
      {
        title: intl.get(`spfm.configServer.model.configServer.supplierCompanyCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        width: 150,
      },
      {
        title: intl.get(`spfm.configServer.model.configServer.supplierCompanyName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 350,
      },
    ];
    const tableProps = {
      loading,
      columns,
      dataSource,
      bordered: true,
      pagination,
      rowKey: 'ruleDetailId',
      rowSelection: {
        selectedRowKeys: selectedRows.map((n) => n.ruleDetailId),
        onChange: this.handleRowSelect,
      },
    };
    return <Table {...tableProps} />;
  }

  btnListRender(loading, isDisabled, includeAllFlag) {
    return (
      <div className="header" style={{ textAlign: 'right', margin: '2px 0 8px 0' }}>
        {intl.get('sodr.onlyInvoiceRule.model.common.includeAllFlag').d('加入全部')}：
        <Switch
          loading={loading}
          checkedValue={1}
          unCheckedValue={0}
          value={includeAllFlag}
          onChange={this.handleIncludeAll}
        />
        <Button
          loading={loading}
          onClick={this.handleDelete}
          disabled={isDisabled}
          style={{ margin: '0 14px' }}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
        <Button loading={loading} onClick={this.handleSave} disabled={isDisabled}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        <Button
          type="primary"
          style={{ marginLeft: 14 }}
          onClick={() => this.handleStateChange('supplierModalVisible', true)}
        >
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>
      </div>
    );
  }

  render() {
    const {
      dataSource = [],
      supplierModalVisible,
      pagination,
      selectedRows,
      header: { includeAllFlag, invoiceRuleId },
    } = this.state;
    const {
      visible = false,
      fetching,
      form: { getFieldDecorator },
    } = this.props;
    const supplierModalProps = {
      invoiceRuleId,
      onSaveRecord: this.handleAddSupplier,
      visible: supplierModalVisible,
      onState: this.handleStateChange,
    };
    return (
      <Fragment>
        <Modal
          title={
            <div>
              {intl.get(`spfm.configServer.model.configServer.supplierList`).d('供应商列表')}
            </div>
          }
          visible={visible}
          onCancel={this.hideModal}
          width={800}
          footer={null}
        >
          {this.formRender(getFieldDecorator)}
          {this.btnListRender(fetching, isArray(dataSource) && isEmpty(dataSource), includeAllFlag)}
          {this.tableRender(dataSource, pagination, selectedRows, fetching)}
        </Modal>
        {supplierModalVisible && <SupplierAddMulti {...supplierModalProps} />}
      </Fragment>
    );
  }
}
