/**
 * index.js - 开票即对账规则
 * @date: 2018-11-12
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import uuidv4 from 'uuid/v4';

// import { Content } from 'components/Page';
// import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import Switch from 'components/Switch';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import {
  delItemToPagination,
  addItemToPagination,
  getCurrentOrganizationId,
  getEditTableData,
  filterNullValueObject,
} from 'utils/utils';

import FilterForm from './FilterForm';
import MultiSelectModal from './MultiSelectModal';

@connect(({ loading, onlyInvoiceRule }) => ({
  onlyInvoiceRule,
  tenantId: getCurrentOrganizationId(),
  loading: loading.effects['onlyInvoiceRule/fetchRuleDetail'],
  saving: loading.effects['onlyInvoiceRule/saveRuleDetail'],
  deleting: loading.effects['onlyInvoiceRule/deleteRuleDetail'],
}))
@formatterCollections({
  code: ['sodr.onlyInvoiceRule', 'entity.supplier', 'entity.company'],
})
export default class SupplierList extends Component {
  state = {
    selectedRows: [],
    rowKey: 'ruleDetailId',
    dataListName: 'ruleDetailList',
    pagination: 'ruleDetailPagination',
    supplierVisible: false,
    addAllFlag: true,
    isIncludeAll: false, // 是否加入全部标识 不再采用之前的addAllFlag和props里面的includeAllFlag
    versionNumber: null,
  };

  componentDidMount() {
    const { modalProps = {} } = this.props;
    const { includeAllFlag, objectVersionNumber } = modalProps;
    this.setState({
      isIncludeAll: includeAllFlag,
      versionNumber: objectVersionNumber,
    });
    this.fetchRuleDetail();
    // this.fetchRuleType();
  }

  @Bind()
  fetchRuleDetail(page = {}, newBillRuleId) {
    const { dispatch, modalProps = {} } = this.props;
    const { billRuleType, billRuleId, consignmentType } = modalProps;
    const values = this.filterForm ? this.filterForm.props.form.getFieldsValue() : {};
    dispatch({
      type: 'onlyInvoiceRule/fetchRuleDetail',
      payload: {
        page,
        ...values,
        billRuleId: newBillRuleId || billRuleId,
        billRuleType,
        consignmentType,
      },
    });
  }

  /**
   * because the second param of table onChange is an Object, so don't use fetchRuleDetail directly to resolve the bug
   * @param {*} page
   * @param {*} secondParams
   */
  @Bind()
  handleTableChange(page = {}) {
    this.fetchRuleDetail(page);
  }

  @Bind()
  fetchRuleType() {
    const { dispatch, modalProps = {} } = this.props;
    const { companyId, billRuleType, orderTypeId } = modalProps;
    dispatch({
      type: 'onlyInvoiceRule/fetchRuleType',
      payload: {
        companyId,
        orderTypeId,
        billRuleType,
      },
    });
  }

  /**
   * 保存选中的行
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 保存数据
   */
  @Bind()
  handlSave() {
    const {
      dispatch,
      onlyInvoiceRule: { ruleDetailPagination = {}, ruleDetailList = [] },
      modalProps = {},
    } = this.props;
    const { billRuleId } = modalProps;
    const dataList = getEditTableData(ruleDetailList, ['ruleDetailId']);
    if (isEmpty(dataList)) return;
    const newDataList = dataList
      .map((o) => ({ ...o, billRuleId }))
      .filter((item) => item._status === 'create');
    dispatch({
      type: 'onlyInvoiceRule/saveRuleDetail',
      payload: newDataList,
    }).then((res) => {
      if (res) {
        this.fetchRuleDetail(ruleDetailPagination, billRuleId);
        notification.success();
      }
    });
  }

  /**
   * 删除对账单规则
   */
  @Bind()
  handleDelete() {
    const { dispatch, onlyInvoiceRule = {} } = this.props;
    const { selectedRows, pagination, rowKey, dataListName } = this.state;
    const newSelectedRows = selectedRows.map((o) => o[rowKey]);
    const newDataList = onlyInvoiceRule[dataListName].filter(
      (o) => newSelectedRows.indexOf(o[rowKey]) > -1 === false
    );

    this.handleDeleteRow(newDataList);

    // 已保存的数据的 id
    const idList = newSelectedRows.filter((o) => !`${o}`.startsWith('create'));
    // 接口删除
    if (!isEmpty(idList)) {
      dispatch({
        type: 'onlyInvoiceRule/deleteRuleDetail',
        payload: idList,
      }).then((res) => {
        if (res) {
          this.setState({ selectedRows: [] });
          this.fetchRuleDetail(onlyInvoiceRule[pagination]);
          notification.success();
        }
      });
    }
  }

  /**
   * 新建行
   */
  @Bind()
  handleCreateRow() {
    this.fetchSupplierLovData();
    // const { dispatch, onlyInvoiceRule = {}, tenantId } = this.props;
    // const { rowKey, dataListName, pagination } = this.state;
    // dispatch({
    //   type: 'onlyInvoiceRule/updateState',
    //   payload: {
    //     [dataListName]: [
    //       {
    //         [rowKey]: uuidv4(),
    //         _status: 'create', // 新建标记位
    //         tenantId,
    //       },
    //       ...onlyInvoiceRule[dataListName],
    //     ],
    //     [pagination]: addItemToPagination(
    //       onlyInvoiceRule[dataListName].length,
    //       onlyInvoiceRule[pagination]
    //     ),
    //   },
    // });
  }

  /**
   * 删除新建行
   */
  @Bind()
  handleDeleteRow(newDataList) {
    const { dispatch, onlyInvoiceRule = {} } = this.props;
    const { dataListName, pagination } = this.state;
    // const newDataList = onlyInvoiceRule[dataListName].filter(
    //   item => item[rowKey] !== record[rowKey]
    // );
    dispatch({
      type: 'onlyInvoiceRule/updateState',
      payload: {
        [dataListName]: newDataList,
        [pagination]: delItemToPagination(
          onlyInvoiceRule[dataListName].length,
          onlyInvoiceRule[pagination]
        ),
      },
    });
  }

  /**
   * 获得 FilterForm 的组件实例
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref;
  }

  /*
   * 全部添加供应商
   */
  @Bind()
  selectAllOnChange(value) {
    const {
      dispatch,
      onlyInvoiceRule: { ruleDetailPagination = {} },
      modalProps = {},
    } = this.props;
    const { addAllFlag, versionNumber } = this.state;
    const { billRuleId } = modalProps;
    if (addAllFlag) {
      this.setState({ addAllFlag: false });
      dispatch({
        type: 'onlyInvoiceRule/addAll',
        payload: {
          billRuleId,
          includeAllFlag: value,
          objectVersionNumber: versionNumber,
        },
      }).then((res) => {
        const this_ = this;
        setTimeout(() => {
          this_.setState({ addAllFlag: true });
        }, 1000);
        if (res) {
          dispatch({
            type: 'onlyInvoiceRule/updateState',
            payload: {
              ruleDetailList: [],
              ruleDetailPagination: {},
            },
          });
          this.setState({
            isIncludeAll: value,
            versionNumber: res.objectVersionNumber,
          });
          this.fetchRuleType();
          this.fetchRuleDetail(ruleDetailPagination);
          notification.success();
        }
      });
    } else {
      // this.setState({
      //   isIncludeAll: false,
      // });
    }
  }

  @Bind()
  batchConfirm() {
    const { onlyInvoiceRule = {}, dispatch } = this.props;
    const { selectedRows, rowKey, dataListName } = this.state;
    const selectedRowKeys = selectedRows.map((o) => o[rowKey]);
    onlyInvoiceRule[dataListName].forEach((item) => {
      if (selectedRowKeys.indexOf(item[rowKey]) !== -1) {
        item.$form.setFieldsValue({ secondConfirmationFlag: 1 });
      }
    });
    dispatch({
      type: 'onlyInvoiceRule/saveSecondConfirm',
      payload: selectedRows.map((item) => ({ ...item, secondConfirmationFlag: 1 })),
    }).then((res) => {
      if (res) {
        this.setState({ selectedRows: [] });
        this.fetchRuleDetail();
        notification.success();
      }
    });
  }

  @Bind()
  confirmLine(rows, val) {
    const { dispatch } = this.props;
    const dataList = getEditTableData([rows], ['ruleDetailId']).map((item) => ({
      ...item,
      secondConfirmationFlag: val,
    }));
    if (isEmpty(dataList)) return;
    dispatch({
      type: 'onlyInvoiceRule/saveSecondConfirm',
      payload: dataList,
    }).then((res) => {
      if (res) {
        this.fetchRuleDetail();
        notification.success();
      }
    });
  }

  renderTable(includeAllFlag, type) {
    const {
      loading,
      onlyInvoiceRule = {},
      saving,
      deleting,
      onlyInvoiceRule: { ruleDetailList = [] },
    } = this.props;
    const { rowKey, dataListName, pagination, selectedRows, isIncludeAll } = this.state;
    const isSave = ruleDetailList.filter((o) => o._status === 'create');
    const columns = [
      {
        title: intl.get('entity.supplier.code').d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        width: 200,
        // render: (val, record) => {
        //   if (['update'].includes(record._status)) {
        //     const { getFieldDecorator, setFieldsValue } = record.$form;
        //     return (
        //       <Form.Item>
        //         {getFieldDecorator('supplierCompanyId', {
        //           initialValue: record.supplierCompanyId,
        //           rules: [
        //             {
        //               required: true,
        //               message: intl.get('hzero.common.validation.notNull', {
        //                 name: intl.get('entity.supplier.code').d('供应商编码'),
        //               }),
        //             },
        //           ],
        //         })(
        //           <Lov
        //             code="SPFM.USER_AUTH.SUPPLIER"
        //             textValue={record.supplierCompanyCode}
        //             onChange={(_, lovRecord) => {
        //               setFieldsValue({
        //                 supplierCompanyName: lovRecord.supplierCompanyName,
        //               });
        //             }}
        //           />
        //         )}
        //       </Form.Item>
        //     );
        //   } else {
        //     return val;
        //   }
        // },
      },
      {
        title: intl.get('entity.supplier.name').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        // render: (val, record) => {
        //   if (['update'].includes(record._status)) {
        //     const { getFieldDecorator } = record.$form;
        //     return (
        //       <Form.Item>
        //         {getFieldDecorator('supplierCompanyName', {
        //           initialValue: record.supplierCompanyName,
        //         })(<Input disabled />)}
        //       </Form.Item>
        //     );
        //   } else {
        //     return val;
        //   }
        // },
      },
      {
        title: intl
          .get('sodr.onlyInvoiceRule.model.common.secondConfirmationFlag')
          .d('自动对账二次确认'),
        dataIndex: 'secondConfirmationFlag',
        render: (val, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator('secondConfirmationFlag', {
                initialValue: record.secondConfirmationFlag,
              })(
                <Switch
                  disabled={record._status === 'create'}
                  onChange={(text) => this.confirmLine(record, text)}
                />
              )}
            </Form.Item>
          );
        },
      },
      // {
      //   title: intl.get('hzero.common.button.action').d('操作'),
      //   align: 'center',
      //   dataIndex: 'edit',
      //   width: 75,
      //   render: (_, record) => (
      //     <span className="action-link">
      //       {record._status === 'create' ? (
      //         <a
      //           onClick={() => {
      //             this.handleDeleteRow(record);
      //           }}
      //         >
      //           {intl.get('hzero.common.button.clean').d('清除')}
      //         </a>
      //       ) : (
      //         ''
      //       )}
      //     </span>
      //   ),
      // },
    ];

    if (type !== 'AUTO_BILL') {
      columns.splice(2, 1);
    }
    const rowSelection = {
      selectedRowKeys: selectedRows.map((o) => o[rowKey]),
      onChange: this.onSelectChange,
      // getCheckboxProps: () => ({
      //   disabled: isIncludeAll, // Column configuration not to be checked
      // }),
      // getCheckboxProps: record => ({
      //   disabled: record._status === 'create',
      // }),
    };

    const filterProps = {
      onSearch: this.fetchRuleDetail,
      onRef: this.handleBindRef,
    };
    return (
      <React.Fragment>
        <div className="table-list-search">
          <FilterForm {...filterProps} />
        </div>
        <div className="table-list-search" style={{ textAlign: 'right' }}>
          {intl.get('sodr.onlyInvoiceRule.model.common.includeAllFlag').d('加入全部')}：
          <Switch
            checked={isIncludeAll}
            // disabled={isIncludeAll}
            checkedValue={1}
            unCheckedValue={0}
            onChange={this.selectAllOnChange}
          />
          {type === 'AUTO_BILL' && (
            <Button
              disabled={isEmpty(selectedRows)}
              onClick={() => this.batchConfirm()}
              style={{ marginLeft: 8 }}
            >
              {intl.get('sodr.onlyInvoiceRule.model.common.batchConfirm').d('批量启用二次确认')}
            </Button>
          )}
          <Button
            icon="delete"
            disabled={isEmpty(selectedRows)}
            loading={deleting || loading}
            onClick={this.handleDelete}
            style={{ marginLeft: 8 }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button
            icon="save"
            disabled={isEmpty(isSave)}
            loading={saving || loading}
            onClick={this.handlSave}
            style={{ marginLeft: 8 }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            type="primary"
            icon="plus"
            // disabled={includeAllFlag === 1}
            onClick={this.handleCreateRow}
            style={{ marginLeft: 8 }}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </div>
        <EditTable
          bordered
          loading={loading}
          rowKey={rowKey}
          dataSource={onlyInvoiceRule[dataListName]}
          columns={columns}
          pagination={onlyInvoiceRule[pagination]}
          rowSelection={rowSelection}
          onChange={this.handleTableChange}
        />
      </React.Fragment>
    );
  }

  /**
   * 控制供应商弹出框的显示
   */
  @Bind()
  handleShowSuppiler() {
    const { supplierVisible } = this.state;
    this.setState({
      supplierVisible: !supplierVisible,
    });
  }

  /**
   * 查询供应商选择lov数据
   */
  @Bind()
  fetchSupplierLovData(params = {}) {
    const { supplierVisible } = this.state;
    if (!supplierVisible) {
      this.handleShowSuppiler();
    }
    const {
      dispatch,
      onlyInvoiceRule: { supplierPagination = {} },
      modalProps = {},
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const { billRuleType, companyId, consignmentType } = modalProps;
    dispatch({
      type: 'onlyInvoiceRule/fetchSupplierLovData',
      payload: {
        billRuleType,
        companyId,
        consignmentType,
        page: isEmpty(params) ? supplierPagination : params,
        ...fieldValues,
      },
    });
  }

  /**
   * 更新modal供应商列表数据
   * @param {Array} record 弹窗中选择的多条供应商记录
   */
  @Bind()
  saveRecordRows(record = []) {
    this.handleShowSuppiler();
    const { rowKey, dataListName, pagination } = this.state;
    const { dispatch, onlyInvoiceRule = {}, tenantId } = this.props;
    const arr = record.map((o) => ({
      [rowKey]: `create-${uuidv4()}`,
      _status: 'create', // 新建标记位
      tenantId,
      secondConfirmationFlag: 0,
      supplierCompanyName: o.supplierCompanyName,
      supplierCompanyId: o.supplierCompanyId,
      supplierCompanyCode: o.supplierCompanyCode,
    }));
    dispatch({
      type: 'onlyInvoiceRule/updateState',
      payload: {
        [dataListName]: [...arr, ...onlyInvoiceRule[dataListName]],
        [pagination]: addItemToPagination(
          onlyInvoiceRule[dataListName].length,
          onlyInvoiceRule[pagination]
        ),
      },
    });
  }

  /**
   * 查询供应商lov
   */
  @Bind()
  handleFecthRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  render() {
    const { supplierVisible } = this.state;
    const {
      onlyInvoiceRule: { supplierPagination = {}, supplierList = {} },
    } = this.props;
    const queryFields = [
      {
        field: 'supplierCompanyName',
        label: intl.get('entity.supplier.name').d('供应商名称'),
      },
      {
        field: 'supplierCompanyCode',
        label: intl.get('entity.supplier.code').d('供应商编码'),
      },
    ];
    const fieldsColumn = [
      {
        title: intl.get('entity.supplier.name').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        align: 'left',
        width: 150,
      },
      {
        title: intl.get('entity.supplier.code').d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        align: 'left',
        width: 150,
      },
    ];
    const suppilerModel = {
      supplierVisible,
      queryFields,
      fieldsColumn,
      supplierPagination,
      supplierList,
      onRef: this.handleFecthRef,
      onChange: this.handleShowSuppiler,
      onSaveRecord: this.saveRecordRows,
      fetchSupplierData: this.fetchSupplierLovData,
    };
    const { modalProps = {} } = this.props;
    const { includeAllFlag, type } = modalProps;

    return (
      <div style={{ marginTop: '18px' }}>
        <React.Fragment>
          {/* <Header title={modalTitle}>

          </Header> */}
          {/* <Content> */}
          {this.renderTable(includeAllFlag, type)}
          {/* <Tabs activeKey={activeKey} animated={false} onChange={this.handleTabsChange}>
            <Tabs.TabPane
              tab={intl.get(`sodr.onlyInvoiceRule.view.message.tab.standard`).d('非寄售')}
              key="STANDARD"
            >
              {this.renderTable(includeAllFlag)}
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get(`sodr.onlyInvoiceRule.view.message.tab.consignment`).d('寄售')}
              key="CONSIGNMENT"
            >
              {this.renderTable(includeAllFlag)}
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get(`sodr.onlyInvoiceRule.view.message.tab.acceptance`).d('验收')}
              key="ACCEPT"
            >
              {this.renderTable(includeAllFlag)}
            </Tabs.TabPane>
          </Tabs> */}
          {/* </Content> */}
        </React.Fragment>
        <MultiSelectModal {...suppilerModel} Key="new" />
      </div>
    );
  }
}
