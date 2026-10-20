/*
 * CertificationDeal - 认证处理
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
// import { TextField } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import SearchBarTable from '_components/SearchBarTable';
import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import queryString from 'querystring';

import { tableMaxHeight, tableHeight, renderStatus } from '@/routes/components/utils';
import {
  queryAllApprovalData,
  renderApprovaBtn,
  renderApproveProgress,
} from '@/routes/components/WorkFlowApproval';
import ListTooltip from '@/routes/components/AiApprove/ListTooltip';
import { getPermissionList } from '@/routes/components/utils/utils';

/**
 * 认证处理
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
export default class CertificationDeal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // pageChacheFlag: true,
      approvalDataMap: {},
      revokeDataMap: {},
      approvalHistoryMap: {},
    };
  }

  componentDidMount() {
    const { dataSet } = this.props;
    dataSet.addEventListener('load', this.handleDsLoadAfter);
  }

  componentWillUnmount() {
    const { dataSet } = this.props;
    dataSet.removeEventListener('load', this.handleDsLoadAfter);
  }

  @Bind()
  handleDsLoadAfter(dataSetProps) {
    const { dataSet: ds } = dataSetProps || {};
    const businessKeys = ds.filter(r => r.get('businessKey')).map(r => r.get('businessKey'));
    queryAllApprovalData({ businessKeys }).then(response => {
      if (response) {
        const { approvalDataMap, revokeDataMap, approvalHistoryMap } = response;
        this.setState({
          approvalDataMap,
          revokeDataMap,
          approvalHistoryMap,
        });
      }
    });
  }

  // 跳转详情
  @Bind()
  handleJumpDetail(record = {}) {
    const { dispatch } = this.props;
    const recordData = record.toData();
    const {
      changeReqId,
      investigateTemplateId,
      investgHeaderId,
      dimensionCode,
      allowSupplierInvite,
    } = recordData;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/supplier-invite-manage/certification-deal/detail/${changeReqId}`,
        search: queryString.stringify({
          investigateTemplateId,
          investgHeaderId,
          dimensionCode,
          allowSupplierInvite,
        }),
      })
    );
  }

  @Bind()
  getInviteColumns() {
    const { approvalDataMap = {}, revokeDataMap = {}, approvalHistoryMap = {} } = this.state;
    const permissionCodeList = {
      approvaPermission: {
        code: 'srm.partner.my-partner.supplier-invite.button.auth-list.approval',
        type: 'approva',
      },
      revokePermission: {
        code: 'srm.partner.my-partner.supplier-invite.button.auth-list.repeal-approval',
        type: 'revoke',
      },
    };
    const permissionListMap = getPermissionList(permissionCodeList);

    const columns = [
      {
        name: 'companyName',
        width: 150,
        renderer: ({ value, record }) => (
          <a onClick={() => this.handleJumpDetail(record)}>{value}</a>
        ),
      },
      {
        name: 'operation',
        width: 150,
        renderer: ({ record, dataSet }) => {
          const approvalProps = {
            onSuccess: () => dataSet.query(),
            processDataMap: { approvalDataMap, revokeDataMap },
            record,
            permissionListMap,
          };
          return renderApprovaBtn(approvalProps) || '-';
        },
      },
      {
        name: 'reqStatus',
        renderer: renderStatus,
      },
      {
        name: 'aiApproveStatus',
        width: 140,
        title: intl.get('sslm.common.button.intelligentReview').d('智能预审'),
        renderer: params => (params.value ? <ListTooltip {...params} /> : '-'),
      },
      {
        name: 'domesticForeignRelationMeaning',
      },
      {
        name: 'certificationTypeMeaning',
      },
      {
        name: 'certificationRegionIdMeaning',
      },
      {
        name: 'saleName',
      },
      {
        name: 'submitDate',
      },
      {
        name: 'supRegisteredSourceMeaning',
      },
      {
        name: 'inviteId',
      },
      {
        name: 'supplierName',
      },
      {
        name: 'invitorName',
      },
      {
        name: 'approvalProgress',
        width: 160,
        title: intl.get('sslm.common.view.title.approvalProgress').d('审批进度'),
        renderer: ({ record }) => {
          return renderApproveProgress({ approvalHistoryMap, record });
        },
      },
    ];
    return columns;
  }

  render() {
    const { dataSet, customizeTable } = this.props;
    return (
      <div style={{ height: tableHeight.hasTab }}>
        {customizeTable(
          {
            code: 'SSLM.ENT_CER_PRO.LIST.CERTIFICATION_DEAL_TABLE',
            readOnly: true,
          },
          <SearchBarTable
            cacheState
            dataSet={dataSet}
            columns={this.getInviteColumns()}
            searchCode="SSLM.SUPPLIER_INVITE_MANAGE_LIST.CERTIFI_DEAL"
            style={{ maxHeight: tableMaxHeight.hasTab }}
          />
        )}
      </div>
    );
  }
}
