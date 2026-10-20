import React, { useEffect, useState } from 'react';
import { Drawer, Button, Table } from 'hzero-ui';
import { connect } from 'dva';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { compose, sum, isNumber, isEmpty, uniqBy, pullAllBy, omit } from 'lodash';

import Search from '@/routes/EvaluationTemplate/Indicator/Search';

const defaultTableRowKey = 'evalTplIndId';

const CreateIndicatorDrawer = ({
  dispatch,
  evalTplId,
  visible,
  tableLoading,
  onClose = (e) => e,
  handleCreate = (e) => e,
  formulaConfig = (e) => e,
  optionsConfig = (e) => e,
}) => {
  const [dataSource, setDataSource] = useState([]);
  const [flatKeys, setFlatKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  /**
   * onCell - 设置表格单元格属性函数
   */
  const onCell = () => {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  };

  /**
   * formulaConfigurationRender - 操作记录render
   * @param {String} text - 显示内容
   * @param {object} params - 查询条件
   */
  const formulaConfigurationRender = (text, record) => {
    return (
      (record.isNoChildren || record.isNoEnableChildren) &&
      ((record.scoreType === 'SYSTEM' && (
        <a onClick={() => formulaConfig(record)}>
          {intl.get('spfm.supplierKpiIndicator.view.button.formulaConfig').d('公式配置')}
        </a>
      )) ||
        (record.scoreType === 'MANUAL' && record.indicatorType === 'OPT' && (
          <a onClick={() => optionsConfig(record)}>
            {intl.get('spfm.supplierKpiIndicator.view.button.optionsConfig').d('选项配置')}
          </a>
        )))
    );
  };

  /**
   * onTableExpand - 行折叠函数
   * @param {Object} expanded - 是否展开
   * @param {Object} record - 当前行数据
   */
  const onTableExpand = (expanded, record) => {
    setFlatKeys(
      expanded
        ? uniqBy(flatKeys.concat(record[defaultTableRowKey]))
        : flatKeys.filter((o) => o !== record[defaultTableRowKey])
    );
  };

  /**
   * onTableChange - 表格分页事件
   * @param {String} page - 分页参数
   */
  const onTableChange = (page) => {
    this.fetchList({ page });
  };

  // 查询模板指标
  const queryList = (params = {}) => {
    dispatch({
      type: 'scoreLevel/queryIndicatorsListTree',
      payload: { ...params, evalTplId },
    }).then((newDataSource) => {
      const newFlatKeys = [];
      const getFlatKeys = (collections = []) => {
        collections.forEach((n) => {
          newFlatKeys.push(n[defaultTableRowKey]);
          if (!isEmpty(n.children)) {
            getFlatKeys(n.children);
          }
        });
      };
      getFlatKeys(newDataSource);
      setFlatKeys(newFlatKeys);
      setDataSource(newDataSource);
    });
  };

  /**
   * onRowSelect - 表格行选中
   * @param {Object} record - 当前行数据
   * @param {String} selected - 是否选中
   */
  const onRowSelect = (record, selected) => {
    let newSelectedRows = [...selectedRows];
    if (selected) {
      if (record.enabledFlag) {
        newSelectedRows.push(omit(record, ['children']));
      }
    } else {
      newSelectedRows = newSelectedRows.filter(
        (o) => o[defaultTableRowKey] !== record[defaultTableRowKey]
      );
    }

    function getChildrenNodeDeep(collections = []) {
      collections.forEach((n) => {
        if (selected) {
          if (n.enabledFlag) {
            newSelectedRows.push(omit(n, ['children']));
          }
        } else {
          newSelectedRows = newSelectedRows.filter(
            (o) => o[defaultTableRowKey] !== n[defaultTableRowKey]
          );
        }
        if (!isEmpty(n.children)) {
          getChildrenNodeDeep(n.children);
        }
      });
    }
    getChildrenNodeDeep(record.children || []);

    setSelectedRows(uniqBy(newSelectedRows, defaultTableRowKey));
  };

  const onRowSelectAll = (selected, newSelectedRows, changeRows) => {
    setSelectedRows(
      selected
        ? uniqBy(selectedRows.concat(changeRows), defaultTableRowKey)
        : pullAllBy([...selectedRows], changeRows, defaultTableRowKey)
    );
  };

  const handleCancel = () => {
    setSelectedRows([]);
    setDataSource([]);
    setFlatKeys([]);
    onClose();
  };

  const drawerProps = {
    title: intl.get(`spfm.supplierKpiIndicator.view.title.addIndicator`).d('新增指标'),
    visible,
    mask: true,
    maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
    placement: 'right',
    destroyOnClose: true,
    onClose: handleCancel,
    width: 1000,
  };

  const tableProps = {
    dataSource,
    columns: [
      {
        title: intl.get(`spfm.supplierKpiIndicator.model.supplier.indicatorCode`).d('指标编码'),
        dataIndex: 'indicatorCode',
        width: 150,
        fixed: 'left',
        onCell,
      },
      {
        title: intl.get(`spfm.supplierKpiIndicator.model.supplier.indicatorName`).d('指标名称'),
        dataIndex: 'indicatorName',
        width: 180,
        fixed: 'left',
        onCell,
      },
      {
        title: intl.get(`spfm.supplierKpiIndicator.model.supplier.scoreType`).d('评分方式'),
        dataIndex: 'scoreTypeMeaning',
        width: 120,
        fixed: 'left',
        onCell,
        render: (text, record) =>
          (record.isNoChildren || record.isNoEnableChildren) && record.enabledFlag === 1
            ? text
            : null,
      },
      {
        title: intl.get(`spfm.supplierKpiIndicator.model.supplier.indicatorType`).d('指标类型'),
        dataIndex: 'indicatorTypeMeaning',
        width: 180,
        onCell,
      },
      {
        title: intl.get(`spfm.supplierKpiIndicator.model.suKpiIn.evalStandard`).d('评分标准'),
        dataIndex: 'evalStandard',
        width: 180,
        onCell,
      },
      {
        title: intl.get(`spfm.supplierKpiIndicator.model.suKpiIn.respWeight`).d('权重%'),
        dataIndex: 'evalWeight',
        width: 100,
        onCell,
      },
      {
        title: intl.get(`spfm.supplierKpiIndicator.model.suKpiIn.score`).d('分值'),
        width: 200,
        children: [
          {
            title: intl.get(`spfm.supplierKpiIndicator.model.supplier.scoreFrom`).d('分值从'),
            width: 100,
            align: 'right',
            dataIndex: 'scoreFrom',
          },
          {
            title: intl.get(`spfm.supplierKpiIndicator.model.supplier.scoreTo`).d('分值至'),
            width: 100,
            align: 'right',
            dataIndex: 'scoreTo',
          },
        ],
      },
      {
        title: intl.get(`spfm.supplierKpiIndicator.model.supplier.defaultScore`).d('缺省分值'),
        dataIndex: 'defaultScore',
        width: 100,
      },
      {
        title: intl.get(`spfm.supplierKpiIndicator.model.supplier.indiScore`).d('指标分值'),
        dataIndex: 'indicatorScore',
        key: 'indicatorScore',
        width: 100,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
      // 新增排序
      {
        title: intl.get('spfm.supplierKpiIndicator.model.supplier.orderSeq').d('排序'),
        dataIndex: 'orderSeq',
        width: 100,
        // render: enableRender,
      },
      {
        title: intl.get(`spfm.supplierKpiIndicator.view.title.formulaConfiguration`).d('公式配置'),
        width: 100,
        render: formulaConfigurationRender,
      },
    ],
    rowKey: defaultTableRowKey,
    bordered: true,
    loading: tableLoading,
    onChange: onTableChange,
    pagination: false,
    expandedRowKeys: flatKeys,
    onExpand: onTableExpand,
    rowSelection: {
      selectedRowKeys: selectedRows.map((n) => n[defaultTableRowKey]),
      onSelect: onRowSelect,
      onSelectAll: onRowSelectAll,
      getCheckboxProps: (record) => {
        return { disabled: !record.enabledFlag };
      },
    },
  };

  tableProps.scroll = {
    x: sum(tableProps.columns.map((n) => (isNumber(n.width) ? n.width : 150))),
  };

  const searchProps = {
    fetchList: queryList,
  };

  useEffect(() => {
    if (visible && evalTplId) {
      queryList();
    }
  }, [visible, evalTplId]);

  return (
    <Drawer {...drawerProps}>
      <Search {...searchProps} />
      <br />
      <Table {...tableProps} />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e8e8e8',
          padding: '10px 16px',
          textAlign: 'right',
          left: 0,
          background: '#fff',
          borderRadius: '0 0 4px 4px',
          zIndex: 1,
        }}
      >
        <Button onClick={handleCancel} style={{ marginRight: 8 }}>
          {intl.get('hzero.common.button.cancel').d('取消')}
        </Button>

        <Button
          type="primary"
          // loading={createIndicatorLoading || saveIndicatorRefLoading}
          onClick={() => handleCreate(selectedRows)}
        >
          {intl.get('hzero.common.button.ok').d('确定')}
        </Button>
      </div>
    </Drawer>
  );
};

export default compose(
  connect(({ scoreLevel, loading }) => ({
    scoreLevel,
    tableLoading: loading['scoreLevel/queryIndicatorsListTree'],
  }))
)(CreateIndicatorDrawer);
