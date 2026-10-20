/**
 * index.js - 验收单
 * @date: 2018-11-12
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Drawer, Tabs, Table, Row, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import { intersection } from 'lodash'; 交集

import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import Switch from 'components/Switch';

import SupplierFilterForm from './SupplierFilterForm';
import CompanyFilterForm from './CompanyFilterForm';
import ItemFilterForm from './ItemFilterForm';
import SupplierModal from './SupplierModal';
import ItemModal from './ItemModal';
// import OrderTypeFilterForm from './OrderTypeFilterForm';
import styles from './index.less';

const FormItem = Form.Item;

const { TabPane } = Tabs;
@Form.create({ fieldNameProp: null })
@connect(({ loading, acceptanceSheet }) => ({
  acceptanceSheet,
  tenantId: getCurrentOrganizationId(),
  fetchCompanyLoading: loading.effects['acceptanceSheet/queryCompany'],
  fetchSupplierLoading: loading.effects['acceptanceSheet/querySupplier'],
  fetchItemLoading: loading.effects['acceptanceSheet/queryItem'],
  fetchSupplierDetailLoading: loading.effects['acceptanceSheet/querySupplierDetail'], // 供应商新增
  fetchSupplierHeaderLoading: loading.effects['acceptanceSheet/querySupplierHeader'], // 供应商头
  fetchItemHeaderLoading: loading.effects['acceptanceSheet/queryItemHeader'], // 物料头
  fetchItemDetailLoading: loading.effects['acceptanceSheet/queryItemDetail'], // 物料新增
  deleteSupplierLoading: loading.effects['acceptanceSheet/ deleteSupplier'], // 供应商删除
  deleteItemLoading: loading.effects['acceptanceSheet/ deleteSupplier'], // 物料删除
}))
@formatterCollections({
  code: ['sinv.CheckUpdateRule', 'entity.company', 'entity.supplier'],
})
export default class BillUpdateRule extends Component {
  constructor(props) {
    super(props);
    this.companyForm = {}; // 查询表单引用对象
    this.supplierForm = {}; // 查询表单引用对象
    this.itemForm = {}; // 查询表单引用对象
    this.supplierDetailForm = {}; // 查询表单引用对象
    this.itemDetailForm = {};
    this.state = {
      // activeKey: 'company', // 当前激活的业务类型 Tab key 值
      selectedRowKeys: [], // 选中的供应商明细行列表
      supplierVisible: false,
      itemVisible: false,
      selectedSupplierRowKeys: [],
      selectedSupplierRows: [],
      selectedItemRowKeys: [],
      selectedItemRows: [],
      selectedSupplierListRowKeys: [],
      selectedSupplierListRows: [],
      selectedItemListRowKeys: [],
      selectedItemListRows: [],
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询公司lov值集, 不分页
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, settings } = this.props;
    dispatch({
      type: 'acceptanceSheet/queryCompany',
      payload: { page },
    }).then((res) => {
      if (res) {
        // const response = res.content || [];
        // 取出查询出来的公司主键
        if (settings['010408']) {
          const flagCompanyId = `${settings['010408']}`.split(',');
          // const companyId = response.map(item => item.companyId);
          // 处理交集
          //  const selectedCompanyKeys = intersection(flagCompanyId, companyId);
          this.setState({
            selectedRowKeys: flagCompanyId || [],
          });
        }
      }
    });
  }

  /**
   * 查询公司lov值集, 不分页
   * @param {Object} page - 分页信息
   */
  @Bind()
  handleCompanySearch(page = {}) {
    const { dispatch } = this.props;
    const values = filterNullValueObject(this.companyForm.props.form.getFieldsValue());
    dispatch({
      type: 'acceptanceSheet/queryCompany',
      payload: {
        page,
        ...values,
      },
    });
  }

  /**
   * 查询供应商
   * @param {Object} page - 分页信息
   */
  @Bind()
  handSupplierSearch(page = {}) {
    const { dispatch } = this.props;
    const values =
      this.supplierForm.props &&
      filterNullValueObject(this.supplierForm.props.form.getFieldsValue());
    dispatch({
      type: 'acceptanceSheet/querySupplier',
      payload: {
        dimensionCode: 'SUPPLIER',
        page,
        ...values,
      },
    });
  }

  /**
   * 查询供应商新增
   * @param {Object} page - 分页信息
   */
  @Bind()
  handSupplierDetailSearch(page = {}) {
    const { dispatch } = this.props;
    const values =
      this.supplierDetailForm.props &&
      filterNullValueObject(this.supplierDetailForm.props.form.getFieldsValue());
    dispatch({
      type: 'acceptanceSheet/querySupplierDetail',
      payload: {
        dimensionCode: 'SUPPLIER',
        page,
        ...values,
      },
    });
  }

  /**
   * 查询物料品类
   * @param {Object} page - 分页信息
   */
  @Bind()
  handItemSearch(page = {}) {
    const { dispatch } = this.props;
    const values =
      this.itemForm.props && filterNullValueObject(this.itemForm.props.form.getFieldsValue());
    dispatch({
      type: 'acceptanceSheet/queryItem',
      payload: {
        dimensionCode: 'CATEGORY',
        page,
        ...values,
      },
    });
  }

  /**
   * 查询物料头
   */
  @Bind()
  handItemHeader() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'acceptanceSheet/queryItemHeader',
      payload: {
        dimensionCode: 'CATEGORY',
        tenantId,
      },
    });
  }

  /**
   * 查询供应商头
   */
  @Bind()
  handSupplierHeader() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'acceptanceSheet/querySupplierHeader',
      payload: {
        dimensionCode: 'SUPPLIER',
        tenantId,
      },
    });
  }

  /**
   * 查询物料新增
   * @param {Object} page - 分页信息
   */
  @Bind()
  handItemDetailSearch(page = {}) {
    const { dispatch } = this.props;
    const values =
      this.itemDetailForm.props &&
      filterNullValueObject(this.itemDetailForm.props.form.getFieldsValue());
    dispatch({
      type: 'acceptanceSheet/queryItemDetail',
      payload: {
        dimensionCode: 'CATEGORY',
        page,
        ...values,
      },
    });
  }

  /**
   * 获得 FilterForm 的组件实例
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleCompanyRef(ref = {}) {
    this.companyForm = ref;
  }

  /**
   * 获得 FilterForm 的组件实例
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleSupplierRef(ref = {}) {
    this.supplierForm = ref;
  }

  /**
   * 获得 FilterForm 的组件实例
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleSupplierDetailRef(ref = {}) {
    this.supplierDetailForm = ref;
  }

  /**
   * 获得 FilterForm 的组件实例
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleItemRef(ref = {}) {
    this.itemForm = ref;
  }

  /**
   * 切换公司/供应商/物料列表
   */
  @Bind()
  handleTabChange(activeKey) {
    if (activeKey === 'company') {
      this.handleSearch();
    }
    if (activeKey === 'supplier') {
      this.handSupplierHeader();
      this.handSupplierSearch();
    }
    if (activeKey === 'item') {
      this.handItemHeader();
      this.handItemSearch();
    }
  }

  /**
   * 新增查询明细供应商
   */
  @Bind()
  handAddSupplier() {
    this.setState({
      supplierVisible: true,
    });
  }

  /**
   * 新增查询明细供应商
   */
  @Bind()
  handAddItem() {
    this.setState({
      itemVisible: true,
    });
  }

  /**
   * 隐藏模态框
   */
  @Bind()
  hideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('checkUpdateRuleVisible', false);
    }
  }

  /**
   * 隐藏供应商详情模态框
   */
  @Bind()
  hideSupplierModal() {
    this.setState({
      supplierVisible: false,
    });
  }

  /**
   * 隐藏物料详情模态框
   */
  @Bind()
  hideItemModal() {
    this.setState({
      itemVisible: false,
    });
  }

  /**
   * 加入全部供应商或取消
   */
  @Bind()
  addAllSupplier(e) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'acceptanceSheet/saveSupplier',
      payload: {
        enabledFlag: e,
        dimensionCode: 'SUPPLIER',
        tenantId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handSupplierHeader();
        this.handSupplierSearch();
      }
    });
  }

  /**
   * 加入全部物料或取消
   */
  @Bind()
  addAllItem(e) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'acceptanceSheet/saveSupplier',
      payload: {
        enabledFlag: e,
        dimensionCode: 'CATEGORY',
        tenantId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handItemHeader();
        this.handItemSearch();
      }
    });
  }

  /**
   * 删除物料
   */
  @Bind()
  handleDeleteItem() {
    const { selectedItemListRows } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'acceptanceSheet/deleteSupplier',
      payload: selectedItemListRows,
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({
          selectedItemListRowKeys: [],
        });
        this.handItemHeader();
        this.handItemSearch();
      }
    });
  }

  /**
   * 删除供应商
   */
  @Bind()
  handleDeleteSupplier() {
    const { selectedSupplierListRows } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'acceptanceSheet/deleteSupplier',
      payload: selectedSupplierListRows,
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({
          selectedSupplierListRowKeys: [],
        });
        this.handSupplierHeader();
        this.handSupplierSearch();
      }
    });
  }

  /**
   * 保存公司
   */
  @Bind()
  saveCompany() {
    const { saveCompany } = this.props;
    const { selectedRowKeys } = this.state;
    const company = { '010408': selectedRowKeys };
    saveCompany(company);
  }

  /**
   * 保存供应商详情
   */
  @Bind()
  saveSupplier() {
    const { selectedSupplierRows } = this.state;
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'acceptanceSheet/saveSupplier',
      payload: {
        enabledFlag: 0,
        dimensionCode: 'SUPPLIER',
        acceptConfigLineList: selectedSupplierRows,
        tenantId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({
          supplierVisible: false,
          selectedItemRowKeys: [],
        });
        this.handSupplierHeader();
        this.handSupplierSearch();
      }
    });
  }

  /**
   * 保存物料详情
   */
  @Bind()
  saveItem() {
    const { selectedItemRows } = this.state;
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'acceptanceSheet/saveSupplier',
      payload: {
        enabledFlag: 0,
        dimensionCode: 'CATEGORY',
        acceptConfigLineList: selectedItemRows,
        tenantId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({
          itemVisible: false,
          selectedItemRowKeys: [],
        });
        this.handItemHeader();
        this.handItemSearch();
      }
    });
  }

  /**
   * 列表勾选回调
   * @param {Array} selectedRowKeys - 选中的列表项
   */
  @Bind()
  handleSelectRows(selectedRowKeys) {
    // const {selectedRowKeys} =this.state;
    this.setState({
      selectedRowKeys,
    });
  }

  /**
   * 供应商弹详情窗列表勾选回调
   * @param {*}
   * * @param {Array} selectedRowKeys - 选中的列表项
   */
  @Bind()
  handleSelectSupplierRows(selectedRowKeys, selectedRows) {
    this.setState({
      selectedSupplierRowKeys: selectedRowKeys,
      selectedSupplierRows: selectedRows,
    });
  }

  /**
   * 物料详情弹窗列表勾选回调
   * @param {*}
   * @param {Array} selectedRowKeys - 选中的列表项
   */
  @Bind()
  handleSelectItemRows(selectedRowKeys, selectedRows) {
    this.setState({
      selectedItemRowKeys: selectedRowKeys,
      selectedItemRows: selectedRows,
    });
  }

  /**
   * 供应商列表勾选回调
   * @param {*}
   * * @param {Array} selectedRowKeys - 选中的列表项
   */
  @Bind()
  handleSelectSupplierListRows(selectedRowKeys, selectedRows) {
    this.setState({
      selectedSupplierListRowKeys: selectedRowKeys,
      selectedSupplierListRows: selectedRows,
    });
  }

  /**
   * 物料列表勾选回调
   * @param {*}
   * @param {Array} selectedRowKeys - 选中的列表项
   */
  @Bind()
  handleSelectItemListRows(selectedRowKeys, selectedRows) {
    this.setState({
      selectedItemListRowKeys: selectedRowKeys,
      selectedItemListRows: selectedRows,
    });
  }

  render() {
    const {
      visible = false,
      fetchCompanyLoading,
      fetchSupplierLoading,
      fetchItemLoading,
      fetchSupplierDetailLoading,
      fetchItemDetailLoading,
      deleteSupplierLoading,
      deleteItemLoading,
      form,
      dispatch,
      acceptanceSheet: {
        checkCompanyList = [],
        checkCompanyListPagination = {},
        checkSupplierList = [],
        checkSupplierPagination = {},
        checkItemList = [],
        checkItemPagination = {},
        supplierDetailList = [],
        supplierDetailPagination = {},
        itemDetailList = [],
        itemDetailPagination = {},
        itemHeader = {},
        supplierHeader = {},
      },
    } = this.props;
    const { getFieldDecorator } = form;
    const {
      selectedRowKeys,
      selectedSupplierRowKeys,
      selectedItemRowKeys,
      selectedSupplierListRowKeys,
      selectedItemListRowKeys,
      supplierVisible,
      itemVisible,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectRows,
    };
    // 供应商详情
    const rowSelectionSupplier = {
      selectedRowKeys: selectedSupplierRowKeys,
      onChange: this.handleSelectSupplierRows,
    };

    const rowSelectionItem = {
      selectedRowKeys: selectedItemRowKeys,
      onChange: this.handleSelectItemRows,
    };

    const rowSelectListSupplier = {
      selectedRowKeys: selectedSupplierListRowKeys,
      onChange: this.handleSelectSupplierListRows,
    };

    const rowSelectListItem = {
      selectedRowKeys: selectedItemListRowKeys,
      onChange: this.handleSelectItemListRows,
    };

    const companyColumns = [
      {
        title: intl.get('entity.company.code').d('公司编码'),
        width: 300,
        dataIndex: 'companyNum',
      },
      {
        title: intl.get('entity.company.name').d('公司名称'),
        dataIndex: 'companyName',
      },
    ];
    // const orderTypeColumns = [
    //   {
    //     title: intl.get('entity.orderType.code').d('订单类型编码'),
    //     width: 300,
    //     dataIndex: 'supplierCompanyNumber',
    //   },
    //   {
    //     title: intl.get('entity.orderType.name').d('订单类型名称'),
    //     dataIndex: 'supplierCompanyName',
    //   },
    // ];
    const supplierColumns = [
      {
        title: intl.get('entity.supplier.code').d('供应商编码'),
        width: 300,
        dataIndex: 'supplierNum',
      },
      {
        title: intl.get('entity.supplier.name').d('供应商名称'),
        dataIndex: 'supplierName',
      },
    ];
    const itemCategoryColumns = [
      {
        title: intl.get('sinv.CheckUpdateRule.model.common.categoryCode').d('品类编码'),
        width: 300,
        dataIndex: 'categoryCode',
      },
      {
        title: intl.get('sinv.CheckUpdateRule.model.common.categoryName').d('品类名称'),
        dataIndex: 'categoryName',
      },
    ];
    const companyFilterProps = {
      onSearch: this.handleCompanySearch,
      onRef: this.handleCompanyRef,
    };
    // const orderTypeFilterProps = {
    //   onSearch: this.handleSearch,
    //   onRef: this.handleBindRef,
    // };
    const supplierFilterProps = {
      onSearch: this.handSupplierSearch,
      onRef: this.handleSupplierRef,
    };
    const itemFilterProps = {
      onSearch: this.handItemSearch,
      onRef: this.handleItemRef,
    };
    // const supplierDetailFilterProps = {
    //   onSearch: this.handSupplierDetailSearch,
    //   onRef: this.handleSupplierDetailRef,
    // };
    const supplierDetailProps = {
      loading: fetchSupplierDetailLoading,
      rowSelection: rowSelectionSupplier,
      onSearch: this.handSupplierDetailSearch,
      supplierDetailList,
      dispatch,
      pagination: supplierDetailPagination,
      hideModal: this.hideSupplierModal,
      saveSupplier: this.saveSupplier,
      visible: supplierVisible,
    };
    const itemDetailProps = {
      dispatch,
      loading: fetchItemDetailLoading,
      rowSelection: rowSelectionItem,
      onSearch: this.handItemDetailSearch,
      itemDetailList,
      pagination: itemDetailPagination,
      hideModal: this.hideItemModal,
      saveItem: this.saveItem,
      visible: itemVisible,
    };
    return (
      <Drawer
        destroyOnClose
        placement="right"
        width={1000}
        // closable={false}
        onClose={this.hideModal}
        visible={visible}
        style={{ padding: 0 }}
      >
        <Tabs onChange={this.handleTabChange} animated={false} className={styles['ant-tab']}>
          <TabPane tab={intl.get('entity.item.companyId').d('公司')} key="company">
            <div className="table-list-search">
              <CompanyFilterForm {...companyFilterProps} />
              <Row style={{ marginTop: 16, lineHeight: '28px' }}>
                <div style={{ float: 'right' }}>
                  <Button
                    style={{ marginLeft: 8 }}
                    type="primary"
                    onClick={() => this.saveCompany()}
                  >
                    {intl.get('hzero.common.button.save').d('保存')}
                  </Button>
                </div>
              </Row>
            </div>
            <Table
              bordered
              rowSelection={rowSelection}
              loading={fetchCompanyLoading}
              rowKey="companyId"
              // scroll={{ y: 600 }}
              dataSource={checkCompanyList}
              columns={companyColumns}
              pagination={checkCompanyListPagination}
              onChange={(page) => this.handleCompanySearch(page)}
            />
          </TabPane>
          {/* <TabPane tab="采购订单类型" key="orderType"> */}
          {/*  <div className="table-list-search"> */}
          {/*    <OrderTypeFilterForm {...orderTypeFilterProps} /> */}
          {/*    <Row style={{ marginTop: 16, lineHeight: '28px' }}> */}
          {/*      <div style={{ float: 'right' }}> */}
          {/*        <Button */}
          {/*          style={{ marginLeft: 8 }} */}
          {/*          type="primary" */}
          {/*          onClick={this.handleSaveDetail} */}
          {/*        > */}
          {/*          {intl.get('hzero.common.button.save').d('保存')} */}
          {/*        </Button> */}
          {/*      </div> */}
          {/*    </Row> */}
          {/*  </div> */}
          {/*  <Table */}
          {/*    bordered */}
          {/*    rowSelection={rowSelection} */}
          {/*    loading={loading} */}
          {/*    rowKey="companyId" */}
          {/*    dataSource={[]} */}
          {/*    columns={orderTypeColumns} */}
          {/*    // pagination={pagination[item.ruleId] || {}} */}
          {/*    onChange={this.handleSearch} */}
          {/*  /> */}
          {/* </TabPane> */}
          <TabPane tab={intl.get('entity.supplier.tag').d('供应商')} key="supplier">
            <div className="table-list-search">
              <SupplierFilterForm {...supplierFilterProps} />
              <Form layout="inline">
                <Row style={{ marginTop: 16, lineHeight: '28px' }}>
                  <FormItem
                    label={intl
                      .get('sinv.CheckUpdateRule.model.common.includeAllFlag')
                      .d('加入全部')}
                  >
                    {getFieldDecorator('supplierEnabledFlag', {
                      initialValue: supplierHeader.enabledFlag || 0,
                    })(<Switch onChange={(e) => this.addAllSupplier(e)} />)}
                  </FormItem>
                  <div style={{ float: 'right' }}>
                    <Button
                      style={{ marginRight: 8 }}
                      disabled={!selectedSupplierListRowKeys.length || supplierHeader.enabledFlag}
                      onClick={this.handleDeleteSupplier}
                      loading={deleteSupplierLoading}
                    >
                      {intl.get('sinv.CheckUpdateRule.button.deleteSupplier').d('删除供应商')}
                    </Button>
                    <Button
                      type="primary"
                      disabled={supplierHeader.enabledFlag}
                      style={{ marginRight: 8 }}
                      onClick={this.handAddSupplier}
                    >
                      {intl.get('sinv.CheckUpdateRule.button.addSupplier').d('新增供应商')}
                    </Button>
                  </div>
                </Row>
              </Form>
            </div>
            <Table
              bordered
              loading={fetchSupplierLoading}
              rowKey="supplierCompanyId"
              dataSource={checkSupplierList}
              columns={supplierColumns}
              rowSelection={rowSelectListSupplier}
              pagination={checkSupplierPagination}
              onChange={this.handSupplierSearch}
            />
          </TabPane>
          <TabPane
            tab={intl.get('sinv.CheckUpdateRule.view.title.categoryName').d('物料品类')}
            key="item"
          >
            <div className="table-list-search">
              <ItemFilterForm {...itemFilterProps} />
              <Form layout="inline">
                <Row style={{ marginTop: 16, lineHeight: '28px' }}>
                  <FormItem
                    label={intl
                      .get('sinv.CheckUpdateRule.model.common.includeAllFlag')
                      .d('加入全部')}
                  >
                    {getFieldDecorator('itemEnabledFlag', {
                      initialValue: itemHeader.enabledFlag || 0,
                    })(<Switch onChange={(e) => this.addAllItem(e)} />)}
                  </FormItem>
                  <div style={{ float: 'right' }}>
                    <Button
                      style={{ marginRight: 8 }}
                      onClick={this.handleDeleteItem}
                      loading={deleteItemLoading}
                      disabled={!selectedItemListRowKeys.length || supplierHeader.enabledFlag}
                    >
                      {intl.get('sinv.CheckUpdateRule.button.deleteItem').d('删除物料品类')}
                    </Button>
                    <Button
                      disabled={itemHeader.enabledFlag}
                      style={{ marginRight: 8 }}
                      onClick={this.handAddItem}
                      type="primary"
                    >
                      {intl.get('sinv.CheckUpdateRule.button.addItem').d('新增物料品类')}
                    </Button>
                  </div>
                </Row>
              </Form>
            </div>
            <Table
              bordered
              loading={fetchItemLoading}
              rowKey="categoryId"
              rowSelection={rowSelectListItem}
              dataSource={checkItemList}
              columns={itemCategoryColumns}
              pagination={checkItemPagination}
              onChange={this.handleSearch}
            />
          </TabPane>
        </Tabs>
        {supplierVisible && <SupplierModal {...supplierDetailProps} />}
        {itemVisible && <ItemModal {...itemDetailProps} />}
      </Drawer>
    );
  }
}
