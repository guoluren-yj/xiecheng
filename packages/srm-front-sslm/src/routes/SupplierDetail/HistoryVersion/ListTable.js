/*
 * ListTable - 历史版本对比列表信息
 * @date: 2018/08/07 14:56:50
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { routerRedux, withRouter } from 'dva/router';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { dateTimeRender } from 'utils/renderer';
import { getResponse, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryMenuPermissions } from '@/services/commonService';

/**
 * 历史版本对比列表信息
 * @extends {Component} - React.Component
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
// @formatterCollections({ code: 'smdm.uomType' })
@formatterCollections({ code: ['sslm.historyVersion'] })
@withRouter
export default class ListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuCode: {},
    };
  }

  componentDidMount() {
    queryMenuPermissions({
      code: [
        'srm.partner.my-partner.supplier-inform-change-new',
        'srm.mdm.firm-info-change-new',
        'srm.partner.my-partner.firm-info-change-confirm-new',
      ].join(),
    }).then(response => {
      const res = getResponse(response);
      if (res) {
        this.setState({
          menuCode: res,
        });
      }
    });
  }

  // 处理单据编号跳转
  @Bind()
  handleToDetail(record) {
    const { menuCode } = this.state;
    const { dispatch, location, match, isInclude } = this.props;
    const {
      type,
      investgHeaderId,
      investigateTemplateId,
      changeReqId,
      companyId,
      supplierCompanyId,
      changeConfirmId,
      partnerTenantId,
      domesticForeignRelation,
    } = record;
    const backParams = querystring.parse(location.search.substr(1));
    const basePath = match.path.substring(0, match.path.indexOf('/version-history'));
    // 是否分配【供应商信息变更】新菜单
    const supChangeFlag = menuCode['srm.partner.my-partner.supplier-inform-change-new'];
    // 有新企业信息变更菜单
    const enterpriseFlag = menuCode['srm.mdm.firm-info-change-new'];
    // 有新企业信息变更租户审批菜单
    const enterpriseTenantFlag = menuCode['srm.partner.my-partner.firm-info-change-confirm-new'];

    let pathname = '';
    let queryParams = {};
    switch (type) {
      // 调查表
      case 'INVESTIGATE':
        pathname = `/sslm/investigation-send/detail`;
        queryParams = { investgHeaderId, investigateTemplateId };
        break;
      // 供应商信息变更
      case 'SUP_CHANGE':
        pathname = supChangeFlag
          ? '/sslm/supplier-inform-change-new/detail/read'
          : `/sslm/supplier-inform-change/detail/${changeReqId}/${companyId}`;
        queryParams = supChangeFlag
          ? { changeReqId, investgHeaderId, investigateTemplateId }
          : { supplierCompanyId };
        break;
      // 租户级企业信息变更
      case 'FIRM_CHANGE':
        pathname = enterpriseTenantFlag
          ? `/sslm/enterprise-inform-tenant-approval-new/detail/${changeConfirmId}`
          : `/sslm/enterprise-inform-confirm/detail/${changeReqId}/${changeConfirmId}/${companyId}/${partnerTenantId}`;
        queryParams = enterpriseTenantFlag
          ? {
              changeReqId,
              partnerTenantId,
              pageType: 'approval',
              openMenuType: 'openTab',
            }
          : {};
        break;
      // 平台级企业信息变更
      case 'PLATFORM_FIRM_CHANGE':
        pathname = enterpriseFlag
          ? '/sslm/enterprise-inform-change-new/detail/view'
          : `${basePath}/enterprise-inform-change/detail/${changeReqId}`;
        queryParams = enterpriseFlag
          ? {
              changeReqId,
              partnerTenantId,
              tenantId: partnerTenantId,
              openMenuType: 'openTab',
            }
          : {
              companyId,
              domesticForeignRelation,
              partnerTenantId,
              tenantId: partnerTenantId,
            };
        break;
      default:
        break;
    }
    const search = querystring.stringify(filterNullValueObject(queryParams));

    // 新的全用openTab跳转
    if (enterpriseFlag || enterpriseTenantFlag) {
      openTab({
        key: pathname,
        search,
        title: intl.get('sslm.enterpriseInform.view.title.changeApplication').d('企业信息变更'),
      });
    }
    // 平台级企业信息变更使用openTab打开新路由（采购方可能没有企业信息变更菜单）
    else if (type === 'PLATFORM_FIRM_CHANGE' && isInclude) {
      openTab({
        key: pathname,
        search,
        title: intl.get('sslm.enterpriseInform.view.title.changeApplication').d('企业信息变更'),
      });
    } else if (pathname) {
      dispatch(
        routerRedux.push({
          pathname,
          search,
          state: {
            historyBack: `${basePath}/version-history?${querystring.stringify(backParams)}`,
          },
        })
      );
    }
  }

  /**
   * 打开操作记录弹窗
   * @param {Object} record
   */
  @Bind()
  operate(record) {
    const { operate } = this.props;
    const { type, investgHeaderId, changeReqId } = record;
    if (operate) {
      operate(type, investgHeaderId, changeReqId);
    }
  }

  render() {
    const { remote, loading, dataSource, searchPaging, pagination, isPub } = this.props;
    const columns = [
      {
        title: intl.get('sslm.historyVersion.model.historyVersion.versionHistoryId').d('历史版本'),
        dataIndex: 'versionNumber',
        width: 80,
      },
      {
        title: intl.get('sslm.historyVersion.model.historyVersion.createUserName').d('申请人'),
        dataIndex: 'createUserName',
        width: 130,
      },
      {
        title: intl.get('sslm.historyVersion.model.historyVersion.updateDate').d('更新时间'),
        dataIndex: 'updateDate',
        width: 120,
        render: dateTimeRender,
      },
      {
        title: intl.get('sslm.historyVersion.model.historyVersion.typeMeaning').d('更新来源'),
        dataIndex: 'typeMeaning',
        width: 120,
      },
      {
        title: intl.get('sslm.historyVersion.model.historyVersion.receiptNumber').d('单据编号'),
        dataIndex: 'documentCode',
        width: 120,
        render: (value, record) =>
          record.type === 'INTERFACE' ? (
            '-'
          ) : !record.tenantFlag || isPub ? (
            value
          ) : (
            <a onClick={() => this.handleToDetail(record)}>{value}</a>
          ),
      },
      {
        title: intl.get('sslm.historyVersion.view.message.operateHistory').d('操作记录'),
        dataIndex: 'companyNum',
        width: 100,
        render: (_, record) =>
          record.type === 'INTERFACE' ? (
            '-'
          ) : (
            // tenantFlag 判断是否为当前租户数据
            <a onClick={() => this.operate(record)} disabled={!record.tenantFlag}>
              {intl.get('sslm.historyVersion.view.message.operateHistory').d('操作记录')}
            </a>
          ),
      },
    ];
    const newColumns = remote
      ? remote.process('SSLM_SUPPLIER_DETAIL_HISTORY_VERSION_TABLE_COLUMNS', columns)
      : columns;
    return (
      <Table
        loading={loading}
        rowKey={(record, index) => index}
        bordered
        columns={newColumns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={searchPaging}
      />
    );
  }
}
