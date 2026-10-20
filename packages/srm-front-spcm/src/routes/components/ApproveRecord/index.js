/*
 * ContractPartner - 采购协议审批记录
 * @date: 2019-06-08
 * @author: SWJ <wenjing.sun@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { Popover } from 'hzero-ui';

import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { tableScrollWidth, createPagination, getCurrentOrganizationId } from 'utils/utils';
import EditTable from 'components/EditTable';
import ExcelExport from 'components/ExcelExport';
import styles from './index.less';

const rowKey = 'partnerId';
const commonPrompt = 'spcm.common.model.common';

/**
 * ContractPartner - 采购协议审批记录
 * @extends {Component} - React.Component
 * @reactProps {Object} dataSource - 数据源
 * @return React.element
 */
@withRouter
@connect(({ loading, contractCommon }) => ({
  queryingApproveRecord: loading.effects['contractCommon/fetchApproveRecord'],
  contractCommon,
}))
export default class ContractPartner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [], // 审批记录数据
      pagination: {},
      organizationId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.fetchApproveRecord();
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const columnArray = [
      {
        title: intl.get(`${commonPrompt}.approveSequenceCode`).d('审批流'),
        dataIndex: 'approveSequenceCodeMeaning',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.processNode`).d('审批节点'),
        dataIndex: 'processNodeName',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.processName`).d('审批人'),
        dataIndex: 'processName',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.processAction`).d('审批操作'),
        dataIndex: 'processActionMeaning',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.processDate`).d('时间'),
        dataIndex: 'processDate',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.processRemark`).d('审批说明'),
        dataIndex: 'processRemark',
        width: 120,
        render: (_, record) => (
          <Popover
            content={record.processRemark}
            overlayStyle={{ width: '200px', wordWrap: 'break-word' }}
            placement="bottomLeft"
            trigger="hover"
          >
            {record.processRemark}
          </Popover>
        ),
      },
    ];
    return columnArray;
  }

  /**
   * fetchApproveRecord - 查询审批记录数据
   * @param {object} page - 审批记录分页条件
   */
  @Bind()
  fetchApproveRecord(page = {}) {
    const { dispatch, pcHeaderId } = this.props;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchApproveRecord',
        payload: {
          page,
          pcHeaderId,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            dataSource: res.content.map((n) => ({ ...n, _status: 'update' })),
            pagination: createPagination(res),
          });
        }
      });
    }
  }

  render() {
    const { queryingApproveRecord = false, pcHeaderId, isShowExport = false } = this.props;
    const { dataSource = [], pagination = {}, organizationId } = this.state;
    const columns = this.getColumns();
    const scrollX = tableScrollWidth(columns);
    const editTableProps = {
      loading: queryingApproveRecord,
      columns,
      dataSource,
      rowKey,
      pagination,
      bordered: true,
      onChange: (page) => this.fetchApproveRecord(page),
      scroll: { x: scrollX },
    };
    const baseExportBtnProps = {
      icon: 'export',
    };
    const exportRequestUrl = `${SRM_SPCM}/v1/${organizationId}/pc-approval-records/approvel-records/export`;
    const queryParams = {
      pcHeaderId,
    };
    return (
      <Fragment>
        {isShowExport && (
          <div className={styles['btn-wrapper']}>
            <ExcelExport
              buttonText={intl.get(`hzero.common.button.export`).d('导出')}
              otherButtonProps={baseExportBtnProps}
              requestUrl={exportRequestUrl}
              queryParams={queryParams}
            />
          </div>
        )}
        {<EditTable {...editTableProps} />}
      </Fragment>
    );
  }
}
