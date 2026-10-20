/**
 * index.js - 开票即对账规则
 * @date: 2018-11-12
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Tabs, Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isNumber, isUndefined } from 'lodash';
import uuidv4 from 'uuid/v4';

import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
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

const promptCode = 'sodr.onlyInvoiceRule.model.common';

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
    activeKey: 'CONSIGNMENT',
    rowKey: 'ruleDetailId',
    dataListName: 'ruleDetailList',
    pagination: 'ruleDetailPagination',
    supplierVisible: false,
    addAllFlag: true,
  };

  componentDidMount() {
    this.handleTabsChange(this.state.activeKey);
    this.fetchRuleType();
  }

  @Bind()
  fetchRuleDetail(page = {}) {
    const { dispatch, modalProps = {} } = this.props;
    const { companyId, billRuleType } = modalProps;
    dispatch({
      type: 'onlyInvoiceRule/fetchRuleDetail',
      payload: {
        page,
        companyId,
        billRuleType,
        consignmentType: this.state.activeKey,
      },
    });
  }

  @Bind()
  fetchRuleType() {
    const { dispatch, modalProps = {} } = this.props;
    const { companyId, billRuleType } = modalProps;
    dispatch({
      type: 'onlyInvoiceRule/fetchRuleType',
      payload: {
        companyId,
        billRuleType,
      },
    });
  }

  /**
   * tabs切换执行
   * @param {String} activeKey 激活面板的key
   */
  @Bind()
  handleTabsChange(activeKey) {
    const {
      onlyInvoiceRule: { ruleDetailPagination = {} },
    } = this.props;
    this.setState({ activeKey }, () => {
      this.fetchRuleDetail(ruleDetailPagination);
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
      onlyInvoiceRule: { ruleDetailPagination = {}, ruleDetailList = [], ruleTypeList = [] },
    } = this.props;
    const { activeKey } = this.state;
    const dataList = getEditTableData(ruleDetailList, ['ruleDetailId']);
    if (isEmpty(dataList)) return;
    const billRuleId = isEmpty(ruleTypeList)
      ? null
      : activeKey === 'CONSIGNMENT'
      ? ruleTypeList[0].billRuleId
      : ruleTypeList[1].billRuleId;
    const newDataList = dataList.map(o => ({ ...o, billRuleId }));
    dispatch({
      type: 'onlyInvoiceRule/saveRuleDetail',
      payload: newDataList,
    }).then(res => {
      if (res) {
        this.fetchRuleDetail(ruleDetailPagination);
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
    const newSelectedRows = selectedRows.map(o => o[rowKey]);
    const newDataList = onlyInvoiceRule[dataListName].filter(
      o => newSelectedRows.indexOf(o[rowKey]) > -1 === false
    );

    this.handleDeleteRow(newDataList);

    // 已保存的数据的 id
    const idList = newSelectedRows.filter(o => isNumber(o));
    // 接口删除
    if (!isEmpty(idList)) {
      dispatch({
        type: 'onlyInvoiceRule/deleteRuleDetail',
        payload: idList,
      }).then(res => {
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
      onlyInvoiceRule: { ruleDetailPagination = {}, ruleTypeList = [] },
    } = this.props;
    const { activeKey, addAllFlag } = this.state;
    const data = isEmpty(ruleTypeList)
      ? null
      : activeKey === 'CONSIGNMENT'
      ? ruleTypeList[0]
      : ruleTypeList[1];
    if (addAllFlag) {
      this.setState({ addAllFlag: false });
      dispatch({
        type: 'onlyInvoiceRule/addAll',
        payload: {
          ...data,
          includeAllFlag: value,
        },
      }).then(res => {
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
          this.fetchRuleType();
          this.fetchRuleDetail(ruleDetailPagination);
          notification.success();
        }
      });
    }
  }

  renderTable(includeAllFlag) {
    const { loading, onlyInvoiceRule = {} } = this.props;
    const { rowKey, dataListName, pagination, selectedRows, addAllFlag } = this.state;
    const columns = [
      {
        title: intl.get('entity.supplier.code').d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        width: 200,
        render: (val, record) => {
          if (['update'].includes(record._status)) {
            const { getFieldDecorator, setFieldsValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('supplierCompanyId', {
                  initialValue: record.supplierCompanyId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('entity.supplier.code').d('供应商编码'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SPFM.USER_AUTH.SUPPLIER"
                    textValue={record.supplierCompanyCode}
                    onChange={(_, lovRecord) => {
                      setFieldsValue({
                        supplierCompanyName: lovRecord.supplierCompanyName,
                      });
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('entity.supplier.name').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        render: (val, record) => {
          if (['update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('supplierCompanyName', {
                  initialValue: record.supplierCompanyName,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return val;
          }
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

    const rowSelection = {
      selectedRowKeys: selectedRows.map(o => o[rowKey]),
      onChange: this.onSelectChange,
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
          {intl.get('sodr.onlyInvoiceRule.model.common.includeAllFlag').d('加入全部')}：
          <Switch
            defaultChecked={!!includeAllFlag}
            disabled={!addAllFlag}
            checkedValue={1}
            unCheckedValue={0}
            onChange={this.selectAllOnChange}
          />
        </div>
        <div className="table-list-search">
          <FilterForm {...filterProps} />
        </div>
        <EditTable
          bordered
          loading={loading}
          rowKey={rowKey}
          dataSource={onlyInvoiceRule[dataListName]}
          columns={columns}
          pagination={onlyInvoiceRule[pagination]}
          rowSelection={rowSelection}
          onChange={this.fetchRuleDetail}
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
    const { supplierVisible, activeKey } = this.state;
    if (!supplierVisible) {
      this.handleShowSuppiler();
    }
    const {
      dispatch,
      onlyInvoiceRule: { supplierPagination = {}, ruleTypeList = [] },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());

    const itemParams = isEmpty(ruleTypeList)
      ? null
      : activeKey === 'CONSIGNMENT'
      ? ruleTypeList[0]
      : ruleTypeList[1];
    const { billRuleType, companyId, consignmentType } = itemParams;
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
    const arr = record.map(o => ({
      [rowKey]: uuidv4(),
      _status: 'create', // 新建标记位
      tenantId,
      supplierCompanyName: o.supplierCompanyName,
      supplierCompanyId: parseInt(o.supplierCompanyId, 10),
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
    const {
      saving,
      loading,
      deleting,
      modalProps: { modalTitle },
      onlyInvoiceRule: { ruleDetailList = [], ruleTypeList = [] },
    } = this.props;
    const { activeKey, selectedRows } = this.state;
    const isSave = ruleDetailList.filter(o => o._status === 'create');
    const includeAllFlag = isEmpty(ruleTypeList)
      ? null
      : activeKey === 'CONSIGNMENT'
      ? ruleTypeList[0].includeAllFlag
      : ruleTypeList[1].includeAllFlag;
    return (
      <div>
        <React.Fragment>
          <Header title={modalTitle}>
            <Button
              type="primary"
              icon="plus"
              disabled={includeAllFlag === 1}
              onClick={this.handleCreateRow}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
            <Button
              icon="save"
              disabled={isEmpty(isSave)}
              loading={saving || loading}
              onClick={this.handlSave}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button
              icon="delete"
              disabled={isEmpty(selectedRows)}
              loading={deleting || loading}
              onClick={this.handleDelete}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          </Header>
          <Content>
            <Tabs activeKey={activeKey} animated={false} onChange={this.handleTabsChange}>
              <Tabs.TabPane
                tab={intl.get(`sodr.onlyInvoiceRule.view.message.tabConsignment`).d('寄售')}
                key="CONSIGNMENT"
              >
                {this.renderTable(includeAllFlag)}
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.message.tabStandard`).d('非寄售')}
                key="STANDARD"
              >
                {this.renderTable(includeAllFlag)}
              </Tabs.TabPane>
            </Tabs>
          </Content>
        </React.Fragment>
        <MultiSelectModal {...suppilerModel} Key="new" />
      </div>
    );
  }
}
