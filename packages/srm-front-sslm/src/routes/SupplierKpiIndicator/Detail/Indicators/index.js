/**
 * index - 送货单创建
 * @date: 2018-12-05
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { sum, isEmpty, omit, uniqBy, pullAllBy } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
// import { getCurrentOrganizationId } from 'utils/utils';
import Search from './Search';
// import List from './List';

/**
 * Detail - 业务组件 - 送货单创建明细
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [supplierKpiIndicator={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {boolean} [batchSubmitDeliveryLoading=false] - 批量提交送货单处理中
 * @reactProps {boolean} [queryOperationRecordLoading=false] - 查询操作记录处理中
 * @reactProps {boolean} [batchDeleteDeliveryLoading=false] - 批量删除处理中
 * @reactProps {boolean} [batchCreateDeliveryLoading=false] - 批量创建处理中
 * @reactProps {boolean} [queryCreateListLoading=false] - 查询可创建数据处理中
 * @reactProps {boolean} [queryMaintenanceListLoading=false] - 查询可维护送货单处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['spfm.supplierKpiIndicator'],
})
export default class Indicators extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      // pagination: {},
      selectedRows: [],
      flatKeys: [],
    };

    // 方法注册
    [
      'onRowSelect',
      'handleFetchListTree',
      'formulaConfigurationRender',
      'onTableExpand',
      'onRowSelectAll',
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    const { onRef = e => e } = this.props;
    onRef(this);
    this.handleFetchListTree();
    // this.fetchList();
  }

  /**
   * handleFetchListTree - 查询树结构
   * @param {Object} params - 查询参数
   */
  handleFetchListTree(params = {}) {
    const { fetchListTree = e => e } = this.props;
    fetchListTree(params, res => {
      const { dataSource } = res;
      const flatKeys = [];
      const getFlatKeys = (collections = []) => {
        collections.forEach(n => {
          flatKeys.push(n.indicatorId);
          if (!isEmpty(n.children)) {
            getFlatKeys(n.children);
          }
        });
      };
      if (!isEmpty(params.indicatorCode) || !isEmpty(params.indicatorName)) {
        getFlatKeys(dataSource);
      }
      this.setState({
        dataSource,
        flatKeys,
      });
    });
  }

  /**
   * onRowSelect - 表格行选中
   * @param {Object} record - 当前行数据
   * @param {String} selected - 是否选中
   */
  onRowSelect(record, selected) {
    const { selectedRows } = this.state;
    let newSelectedRows = [...selectedRows];
    if (selected) {
      newSelectedRows.push(omit(record, ['children']));
    } else {
      newSelectedRows = newSelectedRows.filter(o => o.indicatorId !== record.indicatorId);
    }

    function getChildrenNodeDeep(collections = []) {
      collections.forEach(n => {
        if (selected) {
          newSelectedRows.push(omit(n, ['children']));
        } else {
          newSelectedRows = newSelectedRows.filter(o => o.indicatorId !== n.indicatorId);
        }
        if (!isEmpty(n.children)) {
          getChildrenNodeDeep(n.children);
        }
      });
    }
    getChildrenNodeDeep(record.children || []);
    this.setState({
      selectedRows: uniqBy(newSelectedRows, this.defaultTableRowKey),
    });
  }

  onRowSelectAll(selected, newSelectedRows, changeRows) {
    const { selectedRows = [] } = this.state;
    this.setState({
      selectedRows: selected
        ? uniqBy(selectedRows.concat(changeRows), this.defaultTableRowKey)
        : pullAllBy([...selectedRows], changeRows, this.defaultTableRowKey),
    });
  }

  defaultTableRowKey = 'indicatorId';

  /**
   * onCell - 设置表格单元格属性函数
   */
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   * formulaConfigurationRender - 公式配置render
   * @param {String} text - 显示文本
   * @param {number} record - 当前行数据
   */
  formulaConfigurationRender(text, record) {
    const { openFormula = e => e } = this.props;
    return (
      record.scoreType === 'SYSTEM' && (
        <a onClick={() => openFormula(record)}>
          {intl.get('spfm.supplierKpiIndicator.view.button.formulaConfig').d('公式配置')}
        </a>
      )
    );
  }

  /**
   * onTableExpand - 行树形展开
   * @param {boolean} expanded - 是否展开
   * @param {number} record - 当前行数据
   */
  onTableExpand(expanded, record) {
    const { flatKeys = [] } = this.state;
    this.setState({
      flatKeys: expanded
        ? uniqBy(flatKeys.concat(record.indicatorId))
        : flatKeys.filter(o => o !== record.indicatorId),
    });
  }

  render() {
    const { loading } = this.props;
    const { dataSource = [], selectedRows = [], flatKeys } = this.state;

    const searchProps = {
      wrappedComponentRef: node => {
        this.search = node;
      },
      fetchList: this.handleFetchListTree,
    };

    const tableProps = {
      ref: node => {
        this.table = node;
      },
      dataSource,
      columns: [
        {
          title: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.indicatorCode').d('指标编码'),
          dataIndex: 'indicatorCode',
          width: 100,
          onCell: this.onCell,
        },
        {
          title: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.indicatorName').d('指标名称'),
          dataIndex: 'indicatorName',
          width: 150,
          onCell: this.onCell,
        },
        {
          title: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.scoreType').d('评分方式'),
          dataIndex: 'scoreTypeMeaning',
          width: 100,
          onCell: this.onCell,
        },
        {
          title: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.score').d('分值'),
          width: 160,
          children: [
            {
              title: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.scoreFrom').d('分值从'),
              width: 80,
              dataIndex: 'scoreFrom',
            },
            {
              title: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.scoreTo').d('分值至'),
              width: 80,
              dataIndex: 'scoreTo',
            },
          ],
        },
        {
          title: intl
            .get('spfm.supplierKpiIndicator.view.title.formulaConfiguration')
            .d('公式配置'),
          width: 100,
          render: this.formulaConfigurationRender,
        },
      ],
      rowKey: this.defaultTableRowKey,
      bordered: true,
      loading,
      onChange: this.onTableChange,
      pagination: false,
      rowSelection: {
        selectedRowKeys: selectedRows.map(n => n.indicatorId),
        onSelect: this.onRowSelect,
        onSelectAll: this.onRowSelectAll,
      },
      expandedRowKeys: flatKeys,
      onExpand: this.onTableExpand,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map(n => n.width)) };

    return (
      <div style={{ paddingBottom: 60 }}>
        <Search {...searchProps} />
        <br />
        {/* <List {...listProps} /> */}
        <Table {...tableProps} />
      </div>
    );
  }
}
