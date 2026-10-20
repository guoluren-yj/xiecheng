/*
 * 调查表模板历史版本查询表格
 * @date: 2018/08/07 15:12:06
 * @author: yunqiang.wu yunqiang.wu@hang-china.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { dateTimeRender } from 'utils/renderer';
import styles from '../../index.less';

/**
 * 租户级调查模板定义查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onHandleChangeColumn - 列改变时修改状态树
 * @reactProps {Function} toTemplateDetail - 跳转模板详情页
 * @reactProps {Function} allocateToCompany - 分配至公司
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.investTemHisOrg'],
})
export default class ListTable extends PureComponent {
  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
  }

  @Bind()
  latestFlag(record) {
    if (this.props.onHandleLatest) {
      this.props.onHandleLatest(record.investigateTemplateId);
    }
  }

  /**
   * 修改列时改变状态树的数据
   * @param {Sting} dataIndex
   * @param {Sting} value
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
   * 分配至公司
   * @param {Object} record
   */
  @Bind()
  allocateToCompany(record = {}) {
    if (this.props.onHandleAllocateToCompany) {
      this.props.onHandleAllocateToCompany(record.investigateTemplateId);
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
    const { loading, effecting, dataSource, onSearchPaging, pagination } = this.props;
    const columns = [
      {
        title: intl.get(`sslm.investTemHisOrg.model.investTemHisOrg.templateCode`).d('模板代码'),
        dataIndex: 'templateCode',
        key: 'templateCode',
        width: 150,
      },
      {
        title: intl.get(`sslm.investTemHisOrg.model.investTemHisOrg.templateName`).d('模板名称'),
        dataIndex: 'templateName',
        key: 'templateName',
        width: 150,
      },
      {
        title: intl.get(`sslm.investTemHisOrg.model.investTemHisOrg.versionNumber`).d('版本'),
        dataIndex: 'versionNumber',
        render: (val, record) => (
          <a onClick={() => this.toTemplateDetail(record.investigateTemplateId)}>{val}</a>
        ),
        width: 100,
      },
      {
        title: intl.get(`sslm.investTemHisOrg.model.investTemHisOrg.latestFlag`).d('生效状态'),
        dataIndex: 'releaseFlag',
        width: 100,
        render: val =>
          val
            ? intl.get(`sslm.investTemHisOrg.view.message.table.effect`).d('已发布')
            : intl.get(`sslm.investTemHisOrg.view.message.table.release`).d('发布'),
      },
      {
        title: intl
          .get(`sslm.investTemHisOrg.model.investTemHisOrg.investigateType`)
          .d('调查表类型'),
        dataIndex: 'investigateTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`sslm.investTemHisOrg.model.investTemHisOrg.industryId`).d('行业'),
        dataIndex: 'industryMeaning',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
      },
    ];
    return (
      <Fragment>
        <Table
          bordered
          loading={loading || effecting}
          className={styles.table}
          rowKey="investigateTemplateId"
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onSearchPaging}
        />
      </Fragment>
    );
  }
}
