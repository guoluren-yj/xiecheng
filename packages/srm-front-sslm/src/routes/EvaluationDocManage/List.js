import React, { Component } from 'react';
import Table from 'srm-front-boot/lib/components/Table';
import { sum, isNumber } from 'lodash';
import { dateRender, dateTimeRender, valueMapMeaning } from 'utils/renderer';
import intl from 'utils/intl';

/**
 * 考评档案管理汇总列表组件
 * @extends {Component} - React.Component
 * @reactProps {object} tableData - 表格数据源
 * @reactProps {boolean} loading - 数据加载状态
 * @reactProps {object} pagination - 分页器
 * @reactProps {object} rowSelection - 行选择
 * @returns React.element
 */
export default class List extends Component {
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 120,
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
   * @return React.element
   */
  render() {
    const {
      loading,
      dataSource,
      pagination,
      rowSelection,
      viewDetail,
      handleChange,
      methodValue,
      customizeTable,
      custLoading,
      onCopy,
      onView,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.evalStatus`).d('档案状态'),
        dataIndex: 'evalStatusMeaning',
        width: 120,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 100,
        render: (_, record) => (
          <a onClick={() => onCopy(record)}>{intl.get('hzero.common.button.copy').d('复制')}</a>
        ),
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.evalNum`).d('档案编码'),
        dataIndex: 'evalNum',
        width: 140,
        render: (val, record) => <a onClick={() => viewDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.evalName`).d('档案描述'),
        dataIndex: 'evalName',
        width: 200,
        onCell: this.onCell,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.evalTplName`).d('考评模板'),
        dataIndex: 'evalTplName',
        width: 200,
        // onCell: this.onCell,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.evalTplType`).d('模板类型'),
        dataIndex: 'evalTplTypeMeaning',
        width: 200,
        // onCell: this.onCell,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.kpiMethod`).d('考评方式'),
        dataIndex: 'kpiMethod',
        width: 120,
        // onCell: this.onCell,
        render: val => valueMapMeaning(methodValue, val),
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.evalDocManage.peopleNotScore`).d('未评分人'),
        dataIndex: 'peopleNotScore',
        width: 100,
        render: (_, record) => {
          return record.evalStatus === 'MANUAL_EVALUATING' ? (
            <a onClick={() => onView(record)}>{intl.get('hzero.common.button.view').d('查看')}</a>
          ) : (
            <span>{intl.get('hzero.common.button.view').d('查看')}</span>
          );
        },
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.evalCycle`).d('考评周期'),
        dataIndex: 'evalCycleMeaning',
        width: 100,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.evalDocManage.evalDateFrom`).d('考评日期从'),
        dataIndex: 'evalDateFrom',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.evalDocManage.evalDateTo`).d('考评日期至'),
        dataIndex: 'evalDateTo',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.evalDocManage.evalLevel`).d('考评维度'),
        dataIndex: 'evalDimensionMeaning',
        width: 120,
        // onCell: this.onCell,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.evalDocManage.levelValue`).d('维度值'),
        dataIndex: 'evalDimensionValueMeaning',
        width: 200,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.evaluationDocManage.PIC`).d('考评负责人'),
        dataIndex: 'processUserName',
        width: 120,
      },
      {
        title: intl
          .get(`sslm.supplierDocManage.model.evaluationDocManage.createdUserName`)
          .d('创建人'),
        dataIndex: 'createdUserName',
        width: 120,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.evalDocManage.createTime`).d('建档时间'),
        dataIndex: 'creationDate',
        width: 170,
        render: dateTimeRender,
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    return customizeTable(
      {
        code: 'SSLM.EVALUATION_DOC_MANAGE_LIST.LIST',
      },
      <Table
        bordered
        rowKey="evalHeaderId"
        loading={loading}
        pagination={pagination}
        columns={columns}
        dataSource={dataSource}
        rowSelection={rowSelection}
        scroll={{ x: scrollX, y: 'calc(100vh - 339px)' }}
        onChange={page => handleChange(page)}
        custLoading={custLoading}
      />
    );
  }
}
