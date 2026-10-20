/*
 * InviteDeal - 邀约处理
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import SearchBarTable from '_components/SearchBarTable';
import { routerRedux } from 'dva/router';
import { Modal, TextField } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';

import { tableMaxHeight, tableHeight, downLoadFile } from '@/routes/components/utils';
import { riskScan } from '@/routes/LifeCycleManage/utils';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 邀约处理
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
export default class InviteDeal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageChacheFlag: true,
    };
  }

  // 跳转详情
  @Bind()
  handleJumpDetail(record = {}) {
    const { dispatch } = this.props;
    const recordData = record.toData();
    const { inviteId } = recordData;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/supplier-invite-manage/invite-deal/detail/${inviteId}`,
      })
    );
  }

  /**
   * 查看注册链接
   */
  @Bind()
  checkRegisterLink(record) {
    const registerUrl = record.get('registerUrl');
    Modal.open({
      footer: null,
      closable: true,
      movable: false,
      title: intl.get(`spfm.invitationList.model.invitationList.registerLink`).d('注册链接'),
      children: <div>{registerUrl}</div>,
    });
  }

  // 查看风险报告
  @Bind()
  handleRiskReport(record) {
    const { fileUrl } = record.get(['fileUrl']);
    const url = downLoadFile({ tenantId: getCurrentOrganizationId(), attachmentUrl: fileUrl });
    window.open(url);
  }

  @Bind()
  getInviteColumns() {
    const columns = [
      {
        name: 'displayInviteId',
        renderer: ({ value, record }) => (
          <a onClick={() => this.handleJumpDetail(record)}>{value}</a>
        ),
      },
      {
        name: 'processStatusMeaning',
      },
      {
        name: 'inviteTypeMeaning',
        renderer: ({ value, record }) => {
          const inviteType = record.get('inviteType');
          return inviteType === 'CUSTOMER'
            ? intl
                .get(`spfm.invitationList.model.invitationList.toBe`, { name: value })
                .d(`成为${value}`)
            : intl
                .get(`spfm.invitationList.model.invitationList.invitation`, { name: value })
                .d(`邀请${value}`);
        },
      },
      {
        name: 'companyName',
      },
      {
        name: 'inviteCompanyName',
      },
      {
        name: 'riskScan',
        renderer: ({ record }) => {
          return (
            <a
              onClick={() => {
                const {
                  inviteType,
                  companyName,
                  companyId,
                  inviteCompanyName,
                  inviteCompanyId,
                } = record.get([
                  'inviteType',
                  'companyName',
                  'inviteCompanyName',
                  'companyId',
                  'inviteCompanyId',
                ]);
                if (inviteType === 'CUSTOMER') {
                  record.init({
                    riskScanCompanyName: companyName,
                    riskScanCompanyId: companyId,
                    companyId: null,
                  });
                } else {
                  record.init({
                    riskScanCompanyName: inviteCompanyName,
                    riskScanCompanyId: inviteCompanyId,
                    companyId: null,
                  });
                }
                riskScan(record, false, true);
              }}
            >
              {intl.get('sslm.common.view.button.isScan').d('风险扫描')}
            </a>
          );
        },
      },
      {
        name: 'riskScanDate',
        width: 160,
      },
      {
        name: 'riskLevelMeaning',
      },
      {
        name: 'fileUrl',
        renderer: ({ record }) => {
          const { fileUrl } = record.get(['fileUrl']);
          if (!fileUrl) {
            return '-';
          }
          return (
            <a
              onClick={() => {
                this.handleRiskReport(record);
              }}
            >
              {intl.get('sslm.common.view.message.riskReport').d('风险报告')}
            </a>
          );
        },
      },
      {
        name: 'salesPersonName',
      },
      {
        name: 'sendUserName',
      },
      {
        name: 'creationDate',
        renderer: ({ value }) => dateTimeRender(value),
      },
      {
        name: 'handleUserName',
      },
      {
        name: 'inviteRegisterId',
      },
      {
        name: 'supplierName',
      },
      {
        name: 'processDate',
      },
      {
        name: 'purchaseAgentNameJoint',
      },
      {
        name: 'levelTypeFlag',
        renderer: ({ value }) => yesOrNoRender(value ? 0 : 1),
      },
      {
        name: 'investigateFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ];
    return columns;
  }

  // 筛选器左侧渲染
  @Bind()
  renderLeftSearchBar() {
    const { dataSet } = this.props;
    return (
      <TextField
        clearButton
        style={{ width: 250 }}
        valueChangeAction="blur"
        onChange={value => {
          // eslint-disable-next-line no-unused-expressions
          dataSet.queryDataSet?.current?.set('searchCompanyName', value);
          dataSet.query();
        }}
        value={dataSet.queryDataSet?.current?.get('searchCompanyName')}
        placeholder={intl
          .get('sslm.supplierInvite.model.invite.invitedEnterpriseName')
          .d('被邀请企业名称')}
      />
    );
  }

  // 查询
  @Bind()
  handleQuery(queryProps = {}) {
    const { dataSet } = this.props;
    const { pageChacheFlag } = this.state;
    const { params } = queryProps;
    if (dataSet.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = dataSet.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['searchCompanyName'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      dataSet.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      if (pageChacheFlag) {
        dataSet.query(dataSet.currentPage);
      } else {
        dataSet.query();
      }
    } else {
      dataSet.query();
    }
  }

  // 清空、重置回调
  @Bind()
  clearValues() {
    const { dataSet } = this.props;
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current.reset();
  }

  render() {
    const { dataSet, customizeTable } = this.props;
    return (
      <div style={{ height: tableHeight.hasTab }}>
        {customizeTable(
          {
            code: 'SSLM.SUP_INV_MAN_INV_PROCESS.LIST_TABLE',
            readOnly: true,
          },
          <SearchBarTable
            cacheState
            dataSet={dataSet}
            columns={this.getInviteColumns()}
            searchCode="SSLM.SUPPLIER_INVITE_MANAGE_LIST.INVITE_DEAL"
            style={{ maxHeight: tableMaxHeight.hasTab }}
            searchBarConfig={{
              left: {
                render: () => this.renderLeftSearchBar(),
              },
              onQuery: queryProps => this.handleQuery(queryProps),
              onReset: () => this.clearValues(),
              onClear: () => this.clearValues(),
              onFieldChange: () => {
                this.setState({
                  pageChacheFlag: false,
                });
              },
            }}
          />
        )}
      </div>
    );
  }
}
