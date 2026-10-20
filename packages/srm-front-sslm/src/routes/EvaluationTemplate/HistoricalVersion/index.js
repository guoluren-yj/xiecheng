/**
 * 查看历史版本记录页面
 * @Author: zlh
 * @Date: 2022-9-13 10:03:57
 * @LastEditTime: 2022-9-13 10:03:57
 * @Copyright: Copyright (c) 2022, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import qs from 'querystring';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import List from './List';
import CompanyModal from '../AssignCompany';
import SupplierEvaluationAuto from '../SupplierEvaluationAuto';
import AssignSupplierCategory from '../AssignSupplierCategory';

@formatterCollections({
  code: ['hzero.common'],
})
@connect(({ evaluationTemplate, loading }) => ({
  evaluationTemplate,
  queryHistoricalVersionLoading: loading.effects['evaluationTemplate/fetchHistoricalVersionInfo'],
  fetchCompanyLoading: loading.effects['evaluationTemplate/fetchCompany'],
  queryEvalTplScopeListLoading: loading.effects['evaluationTemplate/queryEvalTplScopeList'],
  queryEvalTplScopeSupplierListLoading:
    loading.effects['evaluationTemplate/queryEvalTplScopeSupplierList'],
  queryEvalTplScopeCategoryListLoading:
    loading.effects['evaluationTemplate/queryEvalTplScopeCategoryList'],
  queryEvalTplScopeItemListLoading: loading.effects['evaluationTemplate/queryEvalTplScopeItemList'],
}))
export default class HistoricalVersion extends PureComponent {
  constructor(props) {
    super(props);
    const routerParam = qs.parse(this.props.location.search.substr(1)) || {};
    const { evalTplCode } = routerParam;
    this.defaultTableRowKey = 'evalTplId';
    this.state = {
      evalTplCode,
      companyVisible: false,
      companyMode: '',
      assignSupplierCategoryVisible: false,
      supplierEvaluationAutoVisible: false,
      currentActionRowData: {},
    };
  }

  componentDidMount() {
    this.fetchHistoricalVersionData();
  }

  /**
   * onTableChange - 表格分页事件
   * @param {Array} page - 分页参数
   */
  @Bind()
  onTableChange(page) {
    this.fetchHistoricalVersionData({ page });
  }

  // 查询历史版本信息
  @Bind()
  fetchHistoricalVersionData(param = {}) {
    const { dispatch } = this.props;
    const { evalTplCode } = this.state;
    dispatch({
      type: 'evaluationTemplate/fetchHistoricalVersionInfo',
      payload: {
        ...param,
        evalTplCode,
      },
    });
  }

  /**
   * 跳转查看指标
   * @param {object} record - 行数据
   */
  @Bind()
  redirectIndicators(record, id, action) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/evaluation-template/indicators/${action}/${id}`,
        state: { ...record, routeType: 'HistoricalVersion' },
      })
    );
  }

  /**
   * 跳转查看评分等级页面
   * @param {object} record - 行数据
   */
  @Bind()
  handleToScoreLevel(record) {
    const { history } = this.props;
    const { evalTplId, evalTplType, evalTplCode } = record;
    history.push(
      `/sslm/evaluation-template/score-level/view?templateId=${evalTplId}&evalTplType=${evalTplType}&evalTplCode=${evalTplCode}&routeType=HistoricalVersion`
    );
  }

  /**
   * 关闭或打开分配适用公司模板
   * @param {boolean} flag - 关闭或打开
   * @param {object} record - 行数据
   */
  @Bind()
  handleCompanyVisible(flag, record = {}) {
    const { evalTplId } = record;
    this.setState({
      companyVisible: flag,
    });
    if (flag) {
      this.setState({
        templateId: evalTplId,
        companyMode: 'view',
      });
    }
  }

  /**
   * 加载分配公司数据
   */
  @Bind()
  handleLoadCompany() {
    const { dispatch } = this.props;
    const { templateId } = this.state;
    return dispatch({
      type: 'evaluationTemplate/fetchCompany',
      payload: { templateId },
    });
  }

  // 自动考评抽屉框打开
  @Bind()
  openSupplierEvaluationAuto(currentActionRowData) {
    this.setState({
      supplierEvaluationAutoVisible: true,
      currentActionRowData: {
        ...currentActionRowData,
        activeEvalGranularity: currentActionRowData.evalGranularity,
      },
    });
  }

  // 自动考评抽屉框关闭
  @Bind()
  closeSupplierEvaluationAuto() {
    this.setState({
      supplierEvaluationAutoVisible: false,
      currentActionRowData: {},
    });
  }

  @Bind()
  openAssignSupplierCategory(currentActionRowData) {
    this.setState({
      assignSupplierCategoryVisible: true,
      currentActionRowData: {
        ...currentActionRowData,
        evalTplType: currentActionRowData.evalTplType,
        activeEvalGranularity: currentActionRowData.evalGranularity,
      },
    });
  }

  @Bind()
  closeAssignSupplierCategory() {
    this.setState({
      assignSupplierCategoryVisible: false,
      currentActionRowData: {},
    });
  }

  /**
   * 跳转到分配采购品类页面
   * @param {object} record - 行数据
   */
  @Bind()
  handleToPurchaseCate(record) {
    const { history } = this.props;
    const { evalTplId, evalTplCode } = record;
    history.push(
      `/sslm/evaluation-template/purchase-category/view/${evalTplId}?&evalTplCode=${evalTplCode}&routeType=HistoricalVersion`
    );
  }

  // 自动考评查询
  @Bind()
  fetchEvaluationAuto(templateId, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryEvaluationAuto',
      templateId,
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  @Bind()
  fetchEvalTplScopeList(templateId, params, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryEvalTplScopeList',
      templateId,
      params,
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  @Bind()
  fetchEvalTplScopeSupplierList(params, cb = e => e) {
    const { dispatch } = this.props;
    const { currentActionRowData } = this.state;
    return dispatch({
      type: 'evaluationTemplate/queryEvalTplScopeSupplierList',
      templateId: currentActionRowData.evalTplId,
      params,
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  @Bind()
  fetchEvalTplScopeCategoryList(scopeId, params, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryEvalTplScopeCategoryList',
      scopeId,
      params,
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  @Bind()
  fetchEvalTplScopeItemList(scopeId, params, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryEvalTplScopeItemList',
      scopeId,
      params,
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  render() {
    const {
      match,
      evaluationTemplate: { historicalVersionData = [], code = {}, EvaluationAutoData, pagination },
      fetchCompanyLoading,
      queryHistoricalVersionLoading,
      queryEvalTplScopeListLoading,
      queryEvalTplScopeSupplierListLoading,
      queryEvalTplScopeCategoryListLoading,
      queryEvalTplScopeItemListLoading,
    } = this.props;
    const {
      companyMode,
      companyVisible,
      supplierEvaluationAutoVisible,
      assignSupplierCategoryVisible,
      currentActionRowData,
    } = this.state;

    const basePath = match.path.substring(0, match.path.indexOf('/historical-version'));

    const listProps = {
      onChange: this.onTableChange,
      dataSource: historicalVersionData,
      pagination,
      loading: queryHistoricalVersionLoading,
      redirectIndicators: this.redirectIndicators,
      defaultTableRowKey: this.defaultTableRowKey,
      kpiEvalTplTypeCode: code['SSLM.KPI_EVAL_TPL_TYPE_ALL'],
      openAssignSupplierCategory: this.openAssignSupplierCategory,
      openSupplierEvaluationAuto: this.openSupplierEvaluationAuto,
      onHandleViewCompany: this.handleCompanyVisible,
      toScoreLevel: this.handleToScoreLevel,
      toPurchaseCate: this.handleToPurchaseCate,
    };

    const assignSupplierCategoryProps = {
      visible: assignSupplierCategoryVisible,
      actionDataSource: currentActionRowData,
      handleImport: this.handleImport,
      close: this.closeAssignSupplierCategory,
      evalDimensionCode: code['SSLM.KPI_EVAL_DIMENSION'],
      evalGranularityCode: code['SSLM.KPI_EVAL_GRANULARITY'],
      evalSortMethodCode: code['SSLM.KPI_EVAL_SORT_METHOD'],
      lifeCycleStageCode: code['SSLM.LIFE_CYCLE_STAGE'],
      kpiSupplierScope: code['SSLM.KPI_SUPPLIER_SCOPE'],
      fetchEvalTplScopeList: this.fetchEvalTplScopeList,
      fetchEvalTplScopeSupplierList: this.fetchEvalTplScopeSupplierList,
      fetchEvalTplScopeCategoryList: this.fetchEvalTplScopeCategoryList,
      fetchEvalTplScopeItemList: this.fetchEvalTplScopeItemList,
      processing: {
        queryEvalTplScopeListLoading,
        queryEvalTplScopeSupplierListLoading,
        queryEvalTplScopeCategoryListLoading,
        queryEvalTplScopeItemListLoading,
      },
    };

    const supplierEvaluationAutoProps = {
      Ref: node => {
        this.supplierEvaluationAutoForm = node;
      },
      visible: supplierEvaluationAutoVisible,
      close: this.closeSupplierEvaluationAuto,
      actionDataSource: currentActionRowData,
      kpiEvalCycleCode: code['SSLM.KPI_EVAL_CYCLE'],
      fetchEvaluationAuto: this.fetchEvaluationAuto,
      EvaluationAutoData,
    };

    return (
      <Fragment>
        <Header
          title={intl.get('hzero.common.button.viewHistory').d('查看历史版本')}
          backPath={`${basePath}/list`}
        />
        <Content>
          <List {...listProps} />
          <CompanyModal
            loading={fetchCompanyLoading}
            companyVisible={companyVisible}
            onHandleCloseCompany={this.handleCompanyVisible}
            onLoad={this.handleLoadCompany}
            onSaveCompany={this.saveCompany}
            mode={companyMode}
          />
        </Content>
        <AssignSupplierCategory {...assignSupplierCategoryProps} />
        {supplierEvaluationAutoVisible && (
          <SupplierEvaluationAuto {...supplierEvaluationAutoProps} />
        )}
      </Fragment>
    );
  }
}
