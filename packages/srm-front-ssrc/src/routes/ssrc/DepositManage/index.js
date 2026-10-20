/**
 * DepositManage - 寻源费用管理列表
 * @date: 2020-04-01
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import queryString from 'querystring';

import {
  getResponse,
  getCurrentTenant,
  getCurrentOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { fetchBidConfig } from '@/services/inquiryHallService';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import remote from 'hzero-front/lib/utils/remote';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

const promptCode = 'ssrc.depositManage';

/**
 * DepositManage - 业务组件 - 寻源费用管理列表
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [depositManage={}] - 数据源
 * @reactProps {!Object} [loading={}] - dva http请求是否完成标识
 * @reactProps {!Object} [loading.effect={}] - 基于对应请求是否完成控制loading
 * @reactProps {boolean} [fetchRfxListLoading=false] - 查询寻源单列表是否完成
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

@formatterCollections({
  code: 'ssrc.depositManage',
})
@connect(({ depositManage, inquiryHall, loading }) => ({
  inquiryHall,
  depositManage,
  fetchRfxListLoading: loading.effects['depositManage/fetchQueryRfxListWithDeposit'],
}))
@remote({
  code: 'SSRC_DEPOSIT_MANAGE',
  name: 'remote',
})
export default class DepositManage extends Component {
  form;

  state = {
    openNewBidFlag: false,
    selectedRows: [],
    selectedRowKeys: [],
  };

  /**
   * 组件创建完成
   */
  componentDidMount() {
    const {
      depositManage: { pagination = {} },
    } = this.props;
    this.fetchBidConfig();
    this.handleQueryRfxList(pagination);
  }

  /**
   * 点击行跳转
   * @param {!Object} row - 点击行row
   */
  @Bind()
  handleRowClick(row = {}) {
    const { dispatch } = this.props;
    const { sourceId, sourceFrom, tenantId } = row;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/deposit-manage/detail/${sourceId}`,
        search: queryString.stringify({
          sourceFrom,
          tenantId,
        }),
      })
    );
  }

  @Bind()
  async fetchBidConfig() {
    const res = getResponse(await fetchBidConfig({ tenant: getCurrentTenant().tenantNum }));
    if (res) {
      this.setState({
        openNewBidFlag: Number(res[0]?.newBid || 1),
      });
    }
  }

  /**
   * 绑定form ref,回传到当前组件
   * @param {object} ref - form组件
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = ref.props.form || {};
  }

  /**
   * 查询询价单列表
   * @param {Object} page -分页对象
   */
  @Bind()
  handleQueryRfxList(page = {}) {
    const { dispatch } = this.props;
    // const values = isUndefined(this.form) ? {} : this.form.getFieldsValue();
    // dispatch({
    //   type: 'depositManage/fetchQueryRfxListWithDeposit',
    //   payload: {
    //     page,
    //     ...values,
    //   },
    // });
    setTimeout(() => {
      const values = isUndefined(this.form) ? {} : this.form.getFieldsValue();
      dispatch({
        type: 'depositManage/fetchQueryRfxListWithDeposit',
        payload: {
          page,
          ...values,
        },
      });
    });
  }

  @Bind()
  getExportparams() {
    let exportParams = {
      rfxHeaderIds: [],
      bidHeaderIds: [],
    };
    const { selectedRows = [] } = this.state;
    if (this.form) {
      exportParams = { ...exportParams, ...this.form.getFieldsValue() };
    }
    selectedRows.forEach((item) => {
      if (item.secondarySourceCategory !== 'NEW_BID' && item.sourceCategory === 'BID') {
        exportParams.bidHeaderIds.push(item.sourceId);
      } else {
        exportParams.rfxHeaderIds.push(item.sourceId);
      }
    });
    return filterNullValueObject(exportParams);
  }

  @Bind()
  changeSelectedRowKeys(keys = [], rows = []) {
    this.setState({
      selectedRows: rows,
      selectedRowKeys: keys,
    });
  }

  render() {
    const { openNewBidFlag, selectedRowKeys, selectedRows } = this.state;
    const {
      depositManage: { dataSource = [], pagination = {} },
      fetchRfxListLoading = false,
      remote: remoteFunc,
    } = this.props;
    const filterFormProps = {
      onRef: this.handleBindRef,
      onSearch: this.handleQueryRfxList,
      remoteFunc,
    };
    const tableProps = {
      dataSource,
      pagination,
      openNewBidFlag,
      loading: fetchRfxListLoading,
      onChange: this.handleQueryRfxList,
      onRowClick: this.handleRowClick,
      rowSelection: {
        selectedRows,
        selectedRowKeys,
        onChange: this.changeSelectedRowKeys,
      },
      remoteFunc,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`${promptCode}.view.message.title.sourcingCostManagement`)
            .d('寻源费用管理')}
        >
          <ExcelExportPro
            buttonText={
              selectedRowKeys.length
                ? intl.get('ssrc.depositManage.model.depositManage.selectExport').d('勾选导出')
                : intl.get('hzero.common.export.new').d('(新)导出')
            }
            requestUrl={`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/expenses-headers/source-summary/export`}
            templateCode="SRM_C_SRM_SSRC_EXPENSES_REL_DOC_EXPORT"
            queryParams={this.getExportparams()}
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              style: { marginRight: '8px' },
              permissionList: [
                {
                  code: `${this.props.match.path}.button.export-new`,
                  type: 'button',
                  meaning:
                    intl
                      .get(`${promptCode}.view.message.title.sourcingCostManagement`)
                      .d('寻源费用管理') -
                    intl.get('hzero.common.button.priceExportNew').d('(新)批量导出'),
                },
              ],
            }}
          />
        </Header>
        <Content>
          <FilterForm {...filterFormProps} />
          <ListTable {...tableProps} />
        </Content>
      </React.Fragment>
    );
  }
}
