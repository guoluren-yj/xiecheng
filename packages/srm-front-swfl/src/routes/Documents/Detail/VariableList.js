/*
 * VariableList.js - 详情页变量列表
 * @date: 2019-04-29
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Popconfirm } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { yesOrNoRender, enableRender } from 'utils/renderer';

/**
 * 流程单据详情页变量列表
 * @extends {Component} - React.Component
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
export default class VariableList extends Component {
  /**
   * 编辑
   * @param {object} record - 数据对象
   */
  @Bind()
  editOption(record) {
    this.props.onEdit(record);
  }

  /**
   * 删除
   * @param {object} record - 数据对象
   */
  @Bind()
  deleteOption(record) {
    this.props.onDelete(record);
  }

  render() {
    const { loading, predefined, dataSource = [] } = this.props;
    const columns = [
      {
        title: intl.get('hwfp.common.model.common.variableCode').d('字段编码'),
        dataIndex: 'variableName',
        width: 120,
      },
      {
        title: intl.get('hwfp.common.model.common.variableName').d('字段名称'),
        dataIndex: 'description',
        width: 200,
      },
      {
        title: intl.get('hwfp.common.model.common.variableType').d('字段类型'),
        dataIndex: 'variableTypeMeaning',
        width: 120,
      },
      {
        title: intl.get('hwfp.common.model.common.componentType').d('组件类型'),
        dataIndex: 'componentTypeMeaning',
        width: 120,
      },
      {
        title: intl.get('hwfp.common.model.common.lovCode').d('来源值集'),
        dataIndex: 'lovCode',
        width: 120,
      },
      {
        title: intl.get('hwfp.common.model.common.requiredFlag').d('是否必输'),
        dataIndex: 'requiredFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get('hwfp.common.model.common.sourceView').d('所属业务对象'),
        dataIndex: 'modelName',
        width: 120,
      },
      {
        title: intl.get('hwfp.common.model.common.cuszFieldName').d('展示字段映射'),
        dataIndex: 'cuszFieldNameMeaning',
        width: 120,
      },
      {
        title: intl.get('hwfp.common.model.common.rejectValidate').d('拒绝再提交参数校验'),
        dataIndex: 'refuseCheckFlag',
        width: 120,
        render: (val) => enableRender(val || 0),
      },
      {
        title: intl.get('hwfp.common.model.common.jumpValidate').d('驳回跳过节点参数校验'),
        dataIndex: 'rebutCheckFlag',
        width: 120,
        render: (val) => enableRender(val || 0),
      },
      {
        title: intl.get('hwfp.common.model.common.variableDynamicFlag').d('变量值动态获取'),
        dataIndex: 'variableDynamicFlag',
        width: 120,
        render: (val) => enableRender(val || 0),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 120,
        fixed: 'right',
        render: (val, record) => {
          return (
            <>
              {!predefined && (
                <a onClick={() => this.editOption(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
              {!predefined && !record.copyFlag && (
                <Popconfirm
                  placement="topRight"
                  title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
                  onConfirm={() => this.deleteOption(record)}
                >
                  <a style={{ marginLeft: '16px' }}>
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </a>
                </Popconfirm>
              )}
            </>
          );
        },
      },
    ];
    return (
      <>
        <Table
          bordered
          scroll={{ x: tableScrollWidth(columns) }}
          rowKey={(val, index) => index + 1}
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
        />
      </>
    );
  }
}
