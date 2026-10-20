/*
 * InvestigationReceived - 我收到的调查表
 * @date: 2018/08/08 14:07:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import intl from 'utils/intl';
import remote from 'utils/remote';
import { SRM_SSLM } from '_utils/config';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { DATETIME_MIN } from 'utils/constants';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

const organizationId = getCurrentOrganizationId();

/**
 * 我收到的调查表页面
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} invitationList - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading, investigationReceived }) => ({
  loading: loading.effects['investigationReceived/fetchReceivedList'],
  investigationReceived,
}))
@formatterCollections({
  code: ['sslm.investigCorrelat', 'sslm.common', 'sslm.investigationCorrelation'],
})
@withCustomize({
  unitCode: ['SSLM.RECEIVED_INVESTIGATION.LIST.GRID', 'SSLM.RECEIVED_INVESTIGATION.LIST.BTN_GROUP'],
})
  @remote(
    {
      code: 'SSLM_RECEIVED_INVESTIGATION_LIST',
      name: 'remote',
    },
  )
export default class InvestigationReceived extends Component {
  constructor(props) {
    super(props);
    const isPub = props.location.pathname.match('/pub/');
    this.state = {
      isPub,
    };
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: e => e,
  };

  componentDidMount() {
    const {
      investigationReceived: { pagination = {} },
    } = this.props;
    this.props.dispatch({
      type: 'investigationReceived/init',
    });
    this.handleSearch(pagination);
  }

  /**
   * 查询邀约汇总列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(fields) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const { beginDate, endDate } = filterValues;
    dispatch({
      type: 'investigationReceived/fetchReceivedList',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
        beginDate: beginDate ? beginDate.format(DATETIME_MIN) : undefined,
        endDate: endDate ? endDate.format(DATETIME_MIN) : undefined,
        customizeUnitCode: 'SSLM.RECEIVED_INVESTIGATION.LIST.GRID',
      },
    });
  }

  /**
   * 导出参数
   */
  @Bind()
  handleParams() {
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const { beginDate, endDate } = filterValues;
    return filterNullValueObject({
      ...filterValues,
      beginDate: beginDate ? beginDate.format(DATETIME_MIN) : undefined,
      endDate: endDate ? endDate.format(DATETIME_MIN) : undefined,
    });
  }

  @Bind()
  onHandleToDetail(investgHeaderId, investigateTemplateId, tenantId) {
    const { isPub } = this.state;
    const pathname = `${isPub ? '/pub' : ''}/sslm/investigation-received/detail`;
    const historyBack = `${isPub ? '/pub' : ''}/sslm/investigation-received/list`;
    const search = querystring.stringify({
      investgHeaderId,
      investigateTemplateId,
      organizationId: tenantId,
    });
    this.props.history.push({
      pathname,
      search,
      state: { historyBack },
    });
  }

  render() {
    const {
      remote,
      investigationReceived: { pagination, investigationList, inviteType, processStatusList },
      loading,
      customizeBtnGroup,
      customizeTable,
      custLoading,
    } = this.props;
    const filterPropsReceive = {
      loading,
      inviteType,
      processStatusList,
      onFilterChange: this.handleSearch,
      onRef: node => {
        this.filterForm = node.props.form;
      },
    };
    const listPropsEmit = {
      remote,
      pagination,
      loading,
      dataSource: investigationList,
      editLine: this.editLine,
      searchPaging: this.handleSearch,
      handleToDetail: this.onHandleToDetail,
      customizeTable,
      custLoading,
    };

    const buttons = [
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/investigate/received/export`,
          queryParams: () => this.handleParams(),
          otherButtonProps: {
            permissionList: [
              {
                code:
                  'srm.partner.investigation-po.my-received-investigatation.ps.investigate.export.new',
                type: 'button',
                meaning: '我收到的调查表-导出',
              },
            ],
          },
          buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
          templateCode: 'SRM_C_SRM_SSLM_INVESTG_HEADER_RECEIVED_EXPORT',
        },
      },
      {
        name: 'export',
        btnComp: ExcelExport,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/investigate/received/export`,
          queryParams: () => this.handleParams(),
          otherButtonProps: {
            icon: 'unarchive',
            type: 'c7n-pro',
            permissionList: [
              {
                code:
                  'srm.partner.investigation-po.my-received-investigatation.ps.investigate.export.old',
                type: 'button',
                meaning: '我收到的调查表-导出',
              },
            ],
          },
        },
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sslm.investigationCorrelation.view.title.receivedInvest`)
            .d('我收到的调查表')}
        >
          {customizeBtnGroup(
            {
              // code: 'SSLM.RECEIVED_INVESTIGATION.LIST.BTN_GROUP',
              code: '',
              pro: true,
            },
            <DynamicButtons buttons={buttons} />
          )}
        </Header>
        <Content>
          <FilterForm {...filterPropsReceive} />
          <ListTable {...listPropsEmit} />
        </Content>
      </React.Fragment>
    );
  }
}
