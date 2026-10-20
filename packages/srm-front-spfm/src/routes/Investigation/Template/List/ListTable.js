/*
 * ListTable - 平台级调查模板定义数据展示
 * @date: 2018/08/07 15:22:29
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Input, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Checkbox from 'components/Checkbox';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { dateTimeRender } from 'utils/renderer';

import styles from '../index.less';

/**
 * 租户级调查模板定义查询表单
 * @extends {Component} - React.Component
 * @reactProps {Function} cancelRow // 搜索
 * @reactProps {Function} handleChangeColumn // 列改变时修改状态树
 * @reactProps {Function} toTemplateDetail // 跳转模板详情页
 * @return React.element
 */
const FormItem = Form.Item;
export default class ListTable extends Component {
  /**
   * 取消行
   * @param {Object} record
   */
  @Bind()
  cancelRow(record) {
    if (this.props.onHandleDelete) {
      this.props.onHandleDelete(record);
    }
  }

  /**
   * 列改变时修改状态树
   * @param {String} dataIndex
   * @param {String} value
   * @param {Object} record
   */
  @Bind()
  handleChangeColumn(dataIndex, value, record) {
    if (this.props.onHandleChangeColumn) {
      this.props.onHandleChangeColumn(dataIndex, value, record);
    }
  }

  /**
   * 跳转详情页
   * @param {Number} investigateTemplateId
   */
  @Bind()
  toTemplateDetail(investigateTemplateId) {
    if (this.props.onHandleToTemplateDetail) {
      this.props.onHandleToTemplateDetail(investigateTemplateId);
    }
  }

  /**
   * 复制模板
   * @param {Object} record
   */
  @Bind()
  referenceTemplate(record = {}) {
    if (this.props.onHandleReferenceTemplate) {
      const { investigateType, industryId, industryMeaning, investigateTemplateId } = record;
      this.props.onHandleReferenceTemplate(
        investigateType,
        industryId,
        industryMeaning,
        investigateTemplateId
      );
    }
  }

  render() {
    const { loading, dataSource, onSearchPaging, pagination } = this.props;
    const columns = [
      {
        title: intl.get(`spfm.investigation.model.investigation.templateCode`).d('预置模板代码'),
        dataIndex: 'templateCode',
        width: 150,
      },
      {
        title: intl.get(`spfm.investigation.model.investigation.templateName`).d('模板名称'),
        dataIndex: 'templateName',
        width: 120,
      },
      {
        title: intl.get(`spfm.investigation.model.investigation.investigateType`).d('调查表类型'),
        dataIndex: 'investigateTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`spfm.investigation.model.investigation.industryId`).d('行业'),
        dataIndex: 'industryMeaning',
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`remark`, {
              initialValue: record.remark,
            })(<Input />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`enabledFlag`, {
              initialValue: record.enabledFlag === 0 ? 0 : 1,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.investigation.model.investigation.templateDetail`).d('模板明细'),
        dataIndex: 'templateDetail',
        width: 100,
        render: (val, record) => (
          <a onClick={() => this.toTemplateDetail(record.investigateTemplateId)}>
            {intl.get(`spfm.investigation.model.investigation.templateDetail`).d('模板明细')}
          </a>
        ),
      },
    ];
    const editTableProps = {
      loading,
      columns,
      dataSource,
      pagination,
      bordered: true,
      rowKey: 'investigateTemplateId',
      onChange: onSearchPaging,
      className: styles.table,
    };
    return <EditTable {...editTableProps} />;
  }
}
