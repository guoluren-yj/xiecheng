/*
 * EnterpriseCertificationApproval - 平台级注册企业审批
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { routerRedux } from 'dva/router';
// import { getCurrentOrganizationId } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';

import { tableMaxHeight, tableHeight, renderStatus } from '@/routes/components/utils';

import { certificationApprovalDS } from './stores/indexDS';

/**
 * 平台级注册企业审批
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
@formatterCollections({
  code: ['sslm.certificationApproval', 'spfm.certificationApproval'],
})
@withProps(
  () => {
    const certificationApprovalDs = new DataSet({
      ...certificationApprovalDS(),
    });
    return {
      certificationApprovalDs,
    };
  },
  { cacheState: true }
)
export default class EnterpriseCertificationApproval extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageChacheFlag: true,
    };
  }

  // 查询
  @Bind()
  handleQuery(queryProps = {}) {
    const { certificationApprovalDs } = this.props;
    const { pageChacheFlag } = this.state;
    const { params } = queryProps;
    if (certificationApprovalDs.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = certificationApprovalDs.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['multiSelectReqNums'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      certificationApprovalDs.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      if (pageChacheFlag) {
        certificationApprovalDs.query(certificationApprovalDs.currentPage);
      } else {
        certificationApprovalDs.query();
      }
    } else {
      certificationApprovalDs.query();
    }
  }

  // 清空、重置回调
  @Bind()
  clearValues() {
    const { certificationApprovalDs } = this.props;
    // eslint-disable-next-line no-unused-expressions
    certificationApprovalDs.queryDataSet?.current.reset();
  }

  // 跳转详情
  @Bind()
  handleJumpDetail(record = {}) {
    const { dispatch } = this.props;
    const recordData = record.toData();
    const { changeReqId } = recordData;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/platform-certification-approval/detail/${changeReqId}`,
      })
    );
  }

  @Bind()
  getColumns() {
    const columns = [
      {
        name: 'companyNum',
      },
      {
        name: 'companyName',
        renderer: ({ value, record }) => (
          <a onClick={() => this.handleJumpDetail(record)}>{value}</a>
        ),
      },
      {
        name: 'tenantName',
      },
      {
        name: 'reqStatus',
        renderer: renderStatus,
      },
      {
        name: 'domesticForeignRelationMeaning',
      },
      {
        name: 'unifiedSocialCode',
      },
      {
        name: 'dunsCode',
      },
      {
        name: 'businessRegistrationNumber',
      },
      {
        name: 'legalRepName',
      },
      {
        name: 'saleName',
      },
      {
        name: 'submitDate',
      },
      {
        name: 'approveMethodMeaning',
      },
      {
        name: 'registerUrlTenantName',
      },
    ];
    return columns;
  }

  render() {
    const { certificationApprovalDs } = this.props;
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sslm.certificationApproval.view.title.certificationApproval')
            .d('注册企业审批（新）')}
        />
        <Content>
          <div style={{ height: tableHeight.hasTab }}>
            <SearchBarTable
              cacheState
              dataSet={certificationApprovalDs}
              columns={this.getColumns()}
              searchCode="SSLM.CERTIFICATION_APPROVAL_LIST.SEARCH_BAR"
              style={{ maxHeight: tableMaxHeight.hasTab }}
              searchBarConfig={{
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
          </div>
        </Content>
      </React.Fragment>
    );
  }
}
