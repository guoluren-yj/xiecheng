/**
 * SupplierResult - 我收到的考评结果查询
 * @date: 2018-12-27
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import querystring from 'querystring';

import intl from 'utils/intl';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getUserOrganizationId,
} from 'utils/utils';
import { Header, Content } from 'components/Page';
import { DATETIME_MIN } from 'utils/constants';
import ExcelExport from 'components/ExcelExport';
import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { SRM_SSLM } from '_utils/config';
import Search from './Search.js';
import List from './List.js';

/**
 * 考评结果查询组件
 * @extends {Component} - React.Component
 * @reactProps {!Object} receivedEvaluationResult - 数据源
 * @reactProps {!Boolean} loading - 加载页面数据
 * @reactProps {Function} [dispatch= e => e] -redux dispatch方法
 * @return React.element
 */

@formatterCollections({ code: ['sslm.common'] })
@withCustomize({
  unitCode: [
    'SSLM.EVALUATION_RECEIVED_LIST.BTN_GROUP',
    'SSLM.EVALUATION_RECEIVED_LIST.LIST',
    'SSLM.EVALUATION_RECEIVED_LIST.FILTER',
  ],
})
@connect(({ receivedEvaluationResult, loading }) => ({
  receivedEvaluationResult,
  loading: loading.effects['receivedEvaluationResult/fetchList'],
  tenantId: getCurrentOrganizationId(),
  supplierTenantId: getUserOrganizationId(),
}))
export default class Page extends Component {
  form;

  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
    };
  }

  componentDidMount() {
    const {
      dispatch,
      location: { state: { _back } = {} },
      receivedEvaluationResult: { pagination },
    } = this.props;
    if (_back === -1) {
      this.handleSearch(pagination);
    } else {
      this.handleSearch();
    }
    dispatch({ type: 'receivedEvaluationResult/fetchLov' });
  }

  /**
   * 查询表单请求
   * @param {?Object} fields - 查询表单值对象
   * @memberof Annual
   */
  @Bind()
  handleSearch(fields = {}, needCleanSelect = true) {
    const { tenantId, dispatch, supplierTenantId } = this.props;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const values = {
        ...formValue,
        creationDateFrom:
          formValue.creationDateFrom && formValue.creationDateFrom.format(DATETIME_MIN),
        creationDateTo: formValue.creationDateTo && formValue.creationDateTo.format(DATETIME_MIN),
      };
      filterValues = filterNullValueObject(values);
    }
    dispatch({
      type: 'receivedEvaluationResult/fetchList',
      payload: {
        tenantId,
        supplierTenantId,
        page: isEmpty(fields) ? {} : fields,
        pageEntryPoint: 'CUSTOMER_OWNED',
        ...filterValues,
        customizeUnitCode:
          'SSLM.EVALUATION_RECEIVED_LIST.LIST,SSLM.EVALUATION_RECEIVED_LIST.FILTER',
      },
    });
    if (needCleanSelect) {
      this.setState({ selectedRowKeys: [] });
    }
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * @param {string} record.docId - 被点击查看详细条目的Id
   */
  @Bind()
  handleViewDetail(record) {
    const { dispatch } = this.props;
    const { evalHeaderId, evalGranularity, tenantId } = record;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/received-query/detail/${evalHeaderId}`,
        search: querystring.stringify({
          evalGranularity,
          partnerTenantId: tenantId,
        }),
      })
    );
  }

  /**
   * 对表格选择中的项进行操作
   * @param {Array} selectedRowKeys - table中被选中的行的键组成的数组
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys) {
    this.setState({
      selectedRowKeys,
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleParams() {
    const { selectedRowKeys } = this.state;
    const { supplierTenantId } = this.props;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const values = {
        ...formValue,
        creationDateFrom:
          formValue.creationDateFrom && formValue.creationDateFrom.format(DATETIME_MIN),
        creationDateTo: formValue.creationDateTo && formValue.creationDateTo.format(DATETIME_MIN),
        chooseIds: String(selectedRowKeys),
      };
      filterValues = filterNullValueObject(values);
    }
    return {
      ...filterValues,
      supplierTenantId,
    };
  }

  /**
   * render
   * @return React.element
   */
  render() {
    const { selectedRowKeys } = this.state;
    const {
      receivedEvaluationResult: { levelValue, archiveStatus, dataSource, pagination },
      loading,
      tenantId,
      customizeBtnGroup,
      customizeFilterForm,
      custLoading,
      customizeTable,
    } = this.props;
    const listProps = {
      tenantId,
      loading,
      pagination,
      dataSource,
      customizeTable,
      viewDetail: this.handleViewDetail,
      rowSelection: {
        selectedRowKeys,
        onChange: this.handleRowSelectChange,
      },
      onChange: page => this.handleSearch(page, false),
    };
    const searchProps = {
      tenantId,
      levelValue,
      archiveStatus,
      customizeFilterForm,
      custLoading,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
    };

    const buttons = [
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${tenantId}/eval-headers/result/supplier/export`,
          queryParams: () => this.handleParams(),
          otherButtonProps: {
            permissionList: [
              {
                code: 'srm.partner.evaluation-manage.received-result.ps.list.export.new',
                type: 'button',
                meaning: '我收到的考评结果-导出',
              },
            ],
          },
          buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
          templateCode: 'SRM_C_SRM_SSLM_KPI_EVAL_HEADER_RESULT_EXPORT',
        },
      },
      {
        name: 'export',
        btnComp: ExcelExport,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${tenantId}/eval-headers/result/supplier/export`,
          queryParams: () => this.handleParams(),
          otherButtonProps: {
            type: 'c7n-pro',
            icon: 'unarchive',
            permissionList: [
              {
                code: 'srm.partner.evaluation-manage.received-result.ps.list.export.old',
                type: 'button',
                meaning: '我收到的考评结果-导出',
              },
            ],
          },
        },
      },
    ];

    return (
      <Fragment>
        <Header
          title={intl.get(`sslm.common.model.message.received.evaluation`).d('我收到的考评结果')}
        >
          {customizeBtnGroup(
            {
              // code: 'SSLM.EVALUATION_RECEIVED_LIST.BTN_GROUP',
              code: '',
              pro: true,
            },
            <DynamicButtons buttons={buttons} />
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <Search {...searchProps} />
          </div>
          <List {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
