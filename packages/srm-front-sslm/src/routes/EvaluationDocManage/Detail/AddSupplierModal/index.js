/**
 * AddSupplierModal - 新增供应商弹窗
 * @date: 2020/6/17
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { uniq, uniqBy, difference, isArray } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';

import Search from './Search';
import List from './List';

export default class AddSupplierModal extends PureComponent {
  state = {
    dataSource: [],
    pagination: {},
    selectedRowKeys: [],
    selectedRows: [],
    unChooseCompanyNums: [],
    selectAllFlag: 0,
  };

  search;

  list;

  componentDidMount() {
    const { form: { getFieldsValue = () => {} } = {} } = (this.search || {}).props;
    this.handleFetchList({ ...getFieldsValue() });
  }

  /**
   * handleFetchList - 查询列表数据
   * @param {Array} params - 查询条件
   */
  @Bind()
  handleFetchList(param = {}) {
    const { stageIds } = param;
    const { docManageRemote } = this.props;
    const params = {
      ...param,
      stageIds: isArray(stageIds) ? stageIds.join() : stageIds,
      customizeUnitCode:
        'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDOR_ADDMODAL,SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDOR_FILTER',
    };
    const { fetchList = e => e } = this.props;
    const queryParams = docManageRemote
      ? docManageRemote.process('SSLM.EVALUATION_DOC_MANAGE_DETAIL_ADD_SUP_SEARCH_VALUES', params)
      : params;
    fetchList(queryParams, res => {
      if (res) {
        const { dataSource, pagination } = res;
        this.setState({
          dataSource,
          pagination,
        });
        // 处理选中值
        const { selectedRows, unChooseCompanyNums, selectAllFlag } = this.state;
        // tableData已勾选的数据
        const { tableData } = this.props;
        if (selectAllFlag === 1) {
          const newSelectedRows = selectedRows.concat(dataSource);

          const finalSelectedRows = uniqBy(newSelectedRows, 'companyNum').filter(
            record => !unChooseCompanyNums.includes(record.companyNum)
          );

          const companyNum = tableData.map(item => item.supplierNum);
          const result = finalSelectedRows.filter(item => !companyNum.includes(item.companyNum));
          this.setState({
            selectedRows: [...result],
            selectedRowKeys: [...result.map(item => item.companyNum)],
          });
        }
      }
    });
  }

  /**
   * onTableChange - 表格分页事件
   * @param {Array} page - 分页参数
   */
  @Bind()
  onTableChange(page) {
    const { form: { getFieldsValue = () => {} } = {} } = (this.search || {}).props;
    this.handleFetchList({ page, ...getFieldsValue() });
  }

  /**
   * onTableRowSelectChange - 行选择onChange
   * @param {Array} rest
   */
  @Bind()
  onTableRowSelectChange(selectedRowKeys, selectedRows) {
    const { tableData } = this.props;
    // dataSource参评供应弹窗数据
    const { dataSource = [], unChooseCompanyNums = [], selectAllFlag } = this.state;
    const companyNum = tableData.map(item => item.supplierNum);
    const result = selectedRows.filter(item => !companyNum.includes(item.companyNum));
    if (result.length !== selectedRows.length) {
      notification.warning({
        message: intl
          .get('sslm.supplierDocManage.view.docManage.noRepeatSupplier')
          .d('无法勾选已经存在的供应商！'),
      });
    }
    this.setState({
      selectedRows: [...result], // 父组件通过ref拿到此数据
      selectedRowKeys: [...result.map(item => item.companyNum)],
    });

    if (selectAllFlag === 1) {
      // 当前页的供应商编码集合
      const currentPageNums = dataSource.map(record => record.companyNum);
      // 处理全选之后取消勾选之后再次勾选
      const filterUnChooseCompanyNums = unChooseCompanyNums.filter(
        item => !selectedRowKeys.includes(item)
      );
      // 获取当前页取消勾选的数据
      const newUnChooseEvalDtlIds = filterUnChooseCompanyNums.concat(
        difference(currentPageNums, selectedRowKeys)
      );
      this.setState({
        unChooseCompanyNums: uniq(newUnChooseEvalDtlIds),
      });
    }
  }

  /**
   * 全选按钮处理逻辑
   */
  @Bind()
  handleSelectAll() {
    // tableData已勾选的数据
    const { tableData } = this.props;
    // dataSource参评供应弹窗数据
    const { dataSource = [], selectAllFlag } = this.state;
    if (selectAllFlag === 0) {
      // 全选
      const companyNum = tableData.map(item => item.supplierNum);
      const result = dataSource.filter(item => !companyNum.includes(item.companyNum));
      if (result.length !== dataSource.length) {
        notification.warning({
          message: intl
            .get('sslm.supplierDocManage.view.docManage.noRepeatSupplier')
            .d('无法勾选已经存在的供应商！'),
        });
      }
      this.setState({
        selectedRows: [...result], // 父组件通过ref拿到此数据
        selectedRowKeys: [...result.map(item => item.companyNum)],
        unChooseCompanyNums: [],
      });
    } else {
      // 取消全选
      this.setState({
        selectedRows: [],
        selectedRowKeys: [],
        unChooseCompanyNums: [],
      });
    }
    this.setState({
      selectAllFlag: selectAllFlag ? 0 : 1,
    });
  }

  render() {
    const {
      loading,
      basicForm,
      lifeCycleStageCode,
      customizeTable = () => {},
      customizeFilterForm = () => {},
      tableData,
      docManageRemote,
      basicInfo,
    } = this.props;
    const {
      dataSource = [],
      pagination,
      selectedRowKeys,
      selectedRows,
      selectAllFlag,
    } = this.state;
    const searchProps = {
      basicForm,
      onRef: node => {
        this.search = node;
      },
      fetchList: this.handleFetchList,
      lifeCycleStageCode,
      customizeFilterForm,
      docManageRemote,
      basicInfo,
    };

    const listProps = {
      loading,
      onChange: this.onTableChange,
      pagination,
      dataSource,
      rowSelection: {
        selectedRowKeys,
        selectedRows,
        onChange: this.onTableRowSelectChange,
      },
      defaultTableRowKey: 'companyNum',
      customizeTable,
      tableData,
      handleSelectAll: this.handleSelectAll,
      selectAllFlag,
    };
    return (
      <Fragment>
        <Search {...searchProps} />
        <br />
        <List {...listProps} />
      </Fragment>
    );
  }
}
