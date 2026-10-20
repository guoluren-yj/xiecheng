/**
 * List - 采购申请创建列表组件
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Table, Form, Icon, Button } from 'hzero-ui';
import { sum, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import { enableRender } from 'utils/renderer';

import intl from 'utils/intl';

// 设置sinv国际化前缀 - view.title
// const viewTitlePrompt = 'sslm.flexFields.view.title';

const defaultListPrimaryKey = 'ruleDetailId';

@Form.create({ fieldNameProp: null })
/**
 * List - 采购申请创建列表组件
 * @extends {Component} - React.Component
 * @reactProps {function} [ref= (e => e)] - react ref属性
 * @reactProps {boolean} [loading=false] - 表格处理状态
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @reactProps {object} [pagination={}] - 分页数据
 * @reactProps {Array<Object>} [dataSource=[]] - 表格数据源
 * @reactProps {object} [rowSelection={}] - 表格选择框配置
 * @return React.element
 */
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   *
   *
   * @param {*} rest
   * @returns
   * @memberof List
   */
  @Bind()
  actionRender(...rest) {
    const {
      editDetail = () => {},
      editableRowKey,
      deleteLoading,
      progressRows = [],
      edit = () => {},
      deleteRows = () => {},
    } = this.props;
    return (
      <span className="action-link">
        <a disabled={isNumber(editableRowKey)} onClick={() => edit(rest[1])}>
          {intl.get(`hzero.common.button.edit`).d('编辑')}
        </a>
        <a onClick={() => deleteRows(rest[1])}>
          {progressRows.some(o => o === rest[1][defaultListPrimaryKey]) && deleteLoading ? (
            <Icon type="loading" />
          ) : (
            intl.get(`hzero.common.button.delete`).d('删除')
          )}
        </a>
        <a onClick={() => editDetail(rest[1])}>
          {intl.get(`hpfm.flexFields.view.button.editDetail`).d('定义规则字段')}
        </a>
      </span>
    );
  }

  render() {
    const {
      loading,
      onChange = () => {},
      pagination = {},
      dataSource = [],
      rowKey,
      add = () => {},
      // deleteRows = e => e,
    } = this.props;
    const tableProps = {
      dataSource,
      columns: [
        {
          title: intl.get(`hpfm.flexFields.model.flexFields.description`).d('规则项描述'),
          dataIndex: 'description',
          render: this.prNumColumnRender,
        },
        {
          title: intl.get(`hzero.common.status`).d('状态'),
          dataIndex: 'enabledFlag',
          width: 80,
          render: enableRender,
        },
        {
          title: intl.get(`hzero.common.button.action`).d('操作'),
          width: 200,
          fixed: 'right',
          render: this.actionRender,
        },
      ],
      rowKey,
      bordered: true,
      loading,
      onChange,
      pagination,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map(n => n.width)) };
    return (
      <Fragment>
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Button onClick={add}>{intl.get('hzero.common.button.create').d('新建')}</Button>
        </div>
        <Table {...tableProps} />
      </Fragment>
    );
  }
}
