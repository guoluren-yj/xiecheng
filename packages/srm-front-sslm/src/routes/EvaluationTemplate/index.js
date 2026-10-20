/**
 * index - 送货单创建
 * @date: 2018-12-05
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Button } from 'hzero-ui';
import { Modal, DataSet } from 'choerodon-ui/pro';
import uuidv4 from 'uuid/v4';
import { isEmpty, isString, uniqBy, uniq } from 'lodash';
import { connect } from 'dva';
import queryString from 'querystring';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import remote from 'utils/remote';

import { Header, Content } from 'components/Page';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import List from './TemplateList';
import Search from './Search';
import TemplateCopy from './TemplateCopy';
import AssignSupplierCategory from './AssignSupplierCategory';
import CompanyModal from './AssignCompany';
import SupplierEvaluationAuto from './SupplierEvaluationAuto';
import { getTemplateCopyDs } from './TemplateCopy/indexDS';

const organizationId = getCurrentOrganizationId();

/**
 * Detail - 业务组件 - 送货单创建明细
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [evaluationTemplate={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {boolean} [batchSubmitDeliveryLoading=false] - 批量提交送货单处理中
 * @reactProps {boolean} [queryOperationRecordLoading=false] - 查询操作记录处理中
 * @reactProps {boolean} [batchDeleteDeliveryLoading=false] - 批量删除处理中
 * @reactProps {boolean} [batchCreateDeliveryLoading=false] - 批量创建处理中
 * @reactProps {boolean} [queryCreateListLoading=false] - 查询可创建数据处理中
 * @reactProps {boolean} [queryMaintenanceListLoading=false] - 查询可维护送货单处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading = {}, evaluationTemplate = {} }) => ({
  deleteEvalTplScopeItemListLoading: loading.effects['evaluationTemplate/saveEvalTplScopeItemList'],
  saveEvalTplScopeItemListLoading: loading.effects['evaluationTemplate/saveEvalTplScopeItemList'],
  queryEvalTplScopeItemListLoading: loading.effects['evaluationTemplate/queryEvalTplScopeItemList'],
  saveEvalTplScopeCategoryListLoading:
    loading.effects['evaluationTemplate/saveEvalTplScopeCategoryList'],
  queryEvalTplScopeCategoryListLoading:
    loading.effects['evaluationTemplate/queryEvalTplScopeCategoryList'],
  deleteEvalTplScopeLoading: loading.effects['evaluationTemplate/deleteEvalTplScope'],
  saveEvalTplScopeLoading: loading.effects['evaluationTemplate/saveEvalTplScope'],
  queryEvalTplScopeSupplierListLoading:
    loading.effects['evaluationTemplate/queryEvalTplScopeSupplierList'],
  queryEvalTplScopeListLoading: loading.effects['evaluationTemplate/queryEvalTplScopeList'],
  saveLoading: loading.effects['evaluationTemplate/save'],
  queryListLoading: loading.effects['evaluationTemplate/queryList'],
  saveEvalTemplateLoading: loading.effects['evaluationTemplate/saveEvalTemplate'],
  fetchCompanyLoading: loading.effects['evaluationTemplate/fetchCompany'],
  saveCompanyLoading: loading.effects['evaluationTemplate/saveCompany'],
  publishEvalTplLoading: loading.effects['evaluationTemplate/publishEvalTpl'],
  evaluationTemplate,
}))
@formatterCollections({
  code: [
    'sslm.evaluationTemplate',
    'sslm.common',
    'spfm.evaluationTemplate',
    'sslm.supplierKpiIndicator',
  ],
})
@withCustomize({
  unitCode: ['SSLM.EVALUATION_TEMPLATE.LIST.TABLE'],
})
@remote(
  {
    code: 'SSLM_EVALUATIONTEMPLATE_DEFINITION',
    name: 'evaluationTemplateRemote',
  },
  {
    events: {
      cuxAssignCompany() {}, // 二开分配公司逻辑
    },
  }
)
export default class EvaluationTemplate extends PureComponent {
  constructor(props) {
    super(props);
    this.defaultTableRowKey = 'evalTplId';
    this.state = {
      dataSource: [], // [{ id: 1, evalTplCode: 'aaaa' }, {id: 2}],
      pagination: {},
      editableRows: [],
      assignSupplierCategoryVisible: false,
      currentActionRowData: {},
      publishingRowData: [],
      companyVisible: false,
      companyMode: '',
      unlockingRowData: [],
      enadledRowProcessingKeys: [],
      supplierEvaluationAutoVisible: false,
      currentRows: {}, // 当前操作行
      cuxLoading: false, // 二开操作导致的按钮loading
    };

    // 方法注册
    [
      'fetchList',
      'onTableChange',
      'redirectIndicators',
      'save',
      'saveEvalTemplate',
      'fetchKpiEvalTplTypeCode',
      'fetchDataSourceCode',
      'fetchEvalDimensionCode',
      'fetchEvalGranularityCode',
      'fetchLifeCycleStageCode',
      'fetchEvalTplScopeList',
      'fetchEvalTplScopeSupplierList',
      'fetchEvalTplScopeCategoryList',
      'publishEvalTpl',
      'cancelEditing',
      'deleteNewRow',
      'setRowEditable',
      'add',
      'handleImport',
      'openAssignSupplierCategory',
      'closeAssignSupplierCategory',
      'handleCompanyVisible',
      'handleToScoreLevel',
      'handleToPurchaseCate',
      'handleLoadCompany',
      'saveCompany',
      'unlockEvalTpl',
      'onEvalGranularityChange',
      'onEvalSortMethodChange',
      'saveEvalTplScope',
      'deleteEvalTplScope',
      'saveEvalTplScopeCategoryList',
      'fetchEvalTplScopeItemList',
      'saveEvalTplScopeItemList',
      'deleteEvalTplScopeItemList',
      'clearParamsCache',
      'enableEvalTemplate',
      'openSupplierEvaluationAuto',
      'openViewHistory',
      'closeSupplierEvaluationAuto',
      'fetchKpiEvalCycleCode',
      'fetchEvaluationAuto',
      'saveEvaluationAuto',
      // 'weightSwatch',
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  list;

  UN_LISTEN; // 监听路由变化

  componentDidMount() {
    const {
      evaluationTemplate: { paramsCache },
    } = this.props;

    this.UN_LISTEN = this.props.history.listen(location => {
      if (location.pathname === '/sslm/evaluation-template/list') {
        this.fetchList(paramsCache || {});
        this.fetchKpiEvalTplTypeCode();
        this.fetchEvalDimensionCode();
        this.fetchEvalGranularityCode();
        this.fetchLifeCycleStageCode();
        this.fetchKpiEvalCycleCode();
        this.fetchKpiSupplierScope();
        this.fetchEvalSortMethodCode();
        this.fetchTriggerTimeScope();
      }
    });
  }

  componentWillUnmount() {
    this.UN_LISTEN(); // 再次调用解绑
  }

  /**
   * fetchList - 查询行数据
   * @param {object} params - 查询条件
   */
  fetchList(params) {
    const { dispatch } = this.props;
    const formValues = !this.search
      ? {}
      : filterNullValueObject(this.search.props.form.getFieldsValue());
    const { ...rest } = formValues;
    return dispatch({
      type: 'evaluationTemplate/queryList',
      params: {
        ...params,
        ...rest,
        customizeUnitCode: 'SSLM.EVALUATION_TEMPLATE.LIST.TABLE',
      },
    }).then(res => {
      if (res) {
        // success(res);
        const { dataSource, pagination } = res || {};
        this.setState({
          editableRows: [],
          dataSource,
          pagination,
        });
      }
    });
  }

  @Bind
  setLoading(flag) {
    this.setState({
      cuxLoading: flag,
    });
  }

  /**
   * fetchStatusCode - 查询状态值集
   */
  fetchKpiEvalTplTypeCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryCode',
      payload: { lovCode: 'SSLM.KPI_EVAL_TPL_TYPE_ALL', tenantId: organizationId },
    });
  }

  /**
   * fetchDataSourceCode - 查询是否值集
   */
  fetchDataSourceCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryCode',
      payload: { lovCode: 'SSLM.KPI_DATA_SOURCE' },
    });
  }

  /**
   * fetchEvalDimensionCode - 查询考评维度值集
   */
  fetchEvalDimensionCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryCode',
      payload: { lovCode: 'SSLM.KPI_EVAL_DIMENSION' },
    });
  }

  /**
   * fetchEvalGranularityCode - 查询考评维度值集
   */
  fetchEvalGranularityCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryCode',
      payload: { lovCode: 'SSLM.KPI_EVAL_GRANULARITY' },
    });
  }

  /**
   * fetchKpiEvalCycleCode - 考评周期
   */
  fetchKpiEvalCycleCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryCode',
      payload: { lovCode: 'SSLM.KPI_EVAL_CYCLE' },
    });
  }

  /**
   * fetchLifeCycleStageCode - 查询供应商生命周期值集
   */
  fetchLifeCycleStageCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryUnifyIdpValue',
      payload: {
        lovCode: 'SSLM.LIFE_CYCLE_STAGE',
        params: { tenantId: getCurrentOrganizationId() },
      },
    });
  }

  /**
   * fetchEvalSortMethodCode - 查询考评档案排名方式值集
   */
  fetchEvalSortMethodCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryCode',
      payload: { lovCode: 'SSLM.KPI_EVAL_SORT_METHOD', tenantId: getCurrentOrganizationId() },
    });
  }

  /**
   * fetchKpiSupplierScope - 参评供应商范围
   */
  fetchKpiSupplierScope() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryCode',
      payload: { lovCode: 'SSLM.KPI_SUPPLIER_SCOPE', tenantId: getCurrentOrganizationId() },
    });
  }

  fetchTriggerTimeScope() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryCode',
      payload: { lovCode: 'SSLM.LOV_HOUR_LIST', tenantId: getCurrentOrganizationId() },
    });
  }

  /**
   * save - 批量保存评估模板
   */
  save() {
    const { dataSource = [] } = this.state;
    const tableValues = getEditTableData(dataSource, [this.defaultTableRowKey]);
    const isEditing = !!dataSource.find(d => d._status === 'create' || d._status === 'update');
    if (isEditing) {
      if (Array.isArray(tableValues) && tableValues.length !== 0) {
        // 保存
        this.saveEvalTemplate(tableValues);
      } else {
        notification.warning({
          message: intl.get('sslm.common.view.message.requiredMsg').d('请检查是否有必填项未填写！'),
        });
      }
    }
  }

  /**
   * saveEvalTemplate - 批量保存评估模板异步方法
   */
  saveEvalTemplate(data, cb = e => e) {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationTemplate/saveEvalTemplate',
      data,
    }).then(res => {
      if (res && res.failed) {
        notification.error({
          description: res.message,
        });
      } else if (res) {
        cb();
        notification.success();
        this.fetchList();
      }
    });
  }

  /**
   * saveEvalTemplate - 批量保存评估模板异步方法
   */
  enableEvalTemplate(data, cb = e => e) {
    const { dispatch } = this.props;
    const { enadledRowProcessingKeys = [] } = this.state;
    this.setState({
      enadledRowProcessingKeys: uniq(
        enadledRowProcessingKeys.concat(data[this.defaultTableRowKey])
      ),
    });
    dispatch({
      type: 'evaluationTemplate/enableEvalTemplate',
      data,
    }).then(res => {
      this.setState({
        enadledRowProcessingKeys: this.state.enadledRowProcessingKeys.filter(
          o => o !== data[this.defaultTableRowKey]
        ),
      });
      if (res && res.failed) {
        notification.error({
          description: res.message,
        });
      } else if (res) {
        cb();
        notification.success();
        this.fetchList();
      }
    });
  }

  publishEvalTpl(data) {
    const { dispatch } = this.props;
    const { publishingRowData = [] } = this.state;
    this.setState({
      publishingRowData: uniqBy(publishingRowData.concat(data), this.defaultTableRowKey),
    });
    return dispatch({
      type: 'evaluationTemplate/publishEvalTpl',
      data,
    }).then(res => {
      if (res && res.failed) {
        notification.error({
          description: res.message,
        });
      } else {
        notification.success();
        this.setState({
          publishingRowData: this.state.publishingRowData.filter(
            o => o[this.defaultTableRowKey] !== data[this.defaultTableRowKey]
          ),
        });
        this.fetchList();
      }
    });
  }

  unlockEvalTpl(data) {
    const { dispatch } = this.props;
    const { unlockingRowData = [] } = this.state;
    this.setState({
      unlockingRowData: uniqBy(unlockingRowData.concat(data), this.defaultTableRowKey),
    });
    return dispatch({
      type: 'evaluationTemplate/unlockEvalTpl',
      data,
    }).then(res => {
      this.setState({
        unlockingRowData: this.state.unlockingRowData.filter(
          o => o[this.defaultTableRowKey] !== data[this.defaultTableRowKey]
        ),
      });
      if (res && res.failed) {
        notification.error({
          description: (res || {}).message,
        });
      } else {
        notification.success();
        this.fetchList();
      }
    });
  }

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

  // 自动考评查询
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

  // 自动考评创建
  saveEvaluationAuto(data, cb = e => e) {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationTemplate/saveEvaluationAuto',
      data,
    }).then(res => {
      if (res && res.failed) {
        notification.error({
          description: res.message,
        });
      } else if (res) {
        cb();
        notification.success();
      }
    });
  }

  fetchEvalTplScopeSupplierList(params, cb = e => e) {
    const { dispatch } = this.props;
    const { currentActionRowData } = this.state;
    const { categoryDescription, ...rest } = params || {};
    return dispatch({
      type: 'evaluationTemplate/queryEvalTplScopeSupplierList',
      templateId: currentActionRowData.evalTplId,
      params: rest,
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  saveEvalTplScope(data, cb = e => e) {
    const { dispatch } = this.props;
    const { currentActionRowData } = this.state;
    dispatch({
      type: 'evaluationTemplate/saveEvalTplScope',
      templateId: currentActionRowData.evalTplId,
      data,
    }).then(res => {
      if (res && res.failed) {
        notification.error({
          description: res.message,
        });
      } else if (res) {
        cb();
        if (currentActionRowData.activeEvalGranularity !== 'SU') {
          this.setState({
            currentActionRowData: { ...currentActionRowData, ...res },
          });
        }
        notification.success();
        this.fetchList();
      }
    });
  }

  deleteEvalTplScope(data, cb = e => e) {
    const { dispatch } = this.props;
    const { currentActionRowData } = this.state;
    dispatch({
      type: 'evaluationTemplate/deleteEvalTplScope',
      templateId: currentActionRowData.evalTplId,
      data,
    }).then(({ success, response }) => {
      if (success) {
        cb();
        notification.success();
        // this.fetchList();
      } else {
        notification.error({
          description: response.message,
        });
      }
    });
  }

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

  saveEvalTplScopeCategoryList(scopeId, data, cb = e => e) {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationTemplate/saveEvalTplScopeCategoryList',
      scopeId,
      data,
    }).then(res => {
      if (res && res.failed) {
        notification.error({
          description: res.message,
        });
      } else if (res) {
        cb();
        notification.success();
      }
    });
  }

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

  saveEvalTplScopeItemList(scopeId, data, cb = e => e) {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationTemplate/saveEvalTplScopeItemList',
      scopeId,
      data,
    }).then(res => {
      if (res && res.failed) {
        notification.error({
          description: res.message,
        });
      } else if (res) {
        cb();
        notification.success();
      }
    });
  }

  deleteEvalTplScopeItemList(scopeId, data, cb = e => e) {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationTemplate/deleteEvalTplScopeItemList',
      scopeId,
      data,
    }).then(res => {
      const { success, response } = res;
      if (success) {
        cb();
        notification.success();
      } else {
        notification.error({
          description: response.message,
        });
      }
    });
  }

  add() {
    const { editableRows = [], dataSource = [], pagination } = this.state;
    const id = uuidv4();
    const newDataSource = [{ [this.defaultTableRowKey]: id, _status: 'create' }, ...dataSource];
    this.setState({
      editableRows: [{ key: id, isCreate: true }, ...editableRows],
      dataSource: newDataSource,
      pagination: {
        ...pagination,
        pageSize:
          newDataSource.length > (pagination.pageSize || 10)
            ? (pagination.pageSize || 10) + 1
            : pagination.pageSize,
      },
    });
  }

  onTableChange(page) {
    this.fetchList({ page });
  }

  redirectIndicators(record, id, action) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/evaluation-template/indicators/${action}/${id}`,
        state: record,
      })
    );
  }

  cancelEditing(key) {
    const { editableRows = [], dataSource = [] } = this.state;
    // 修改编辑状态
    let newDataSource = dataSource;
    // 编辑的行改为update
    if (key) {
      newDataSource = dataSource.map(item => {
        if (item[this.defaultTableRowKey] === key) {
          const { $form, ...rest } = item;
          return { ...rest, _status: '' };
        } else {
          return item;
        }
      });
    }
    this.setState({
      editableRows: editableRows.filter(o => o.key !== key),
      dataSource: newDataSource,
    });
  }

  deleteNewRow(key) {
    const { dataSource = [], editableRows = [], pagination } = this.state;
    if (isString(key)) {
      const newPageSize = (pagination.pageSize || 10) - 1;
      this.setState({
        dataSource: dataSource.filter(o => o[this.defaultTableRowKey] !== key),
        editableRows: editableRows.filter(o => o.key !== key),
        pagination: {
          ...pagination,
          pageSize: newPageSize < 10 ? 10 : newPageSize,
        },
      });
    }
  }

  setRowEditable(editableRows, currentEditRecord = {}) {
    const { dataSource = [] } = this.state;
    let newDataSource = dataSource;
    // 编辑的行改为update
    if (!isEmpty(currentEditRecord)) {
      newDataSource = dataSource.map(item => {
        if (item[this.defaultTableRowKey] === currentEditRecord[this.defaultTableRowKey]) {
          return { ...item, _status: 'update' };
        } else {
          return item;
        }
      });
    }
    this.setState({
      editableRows,
      dataSource: newDataSource,
    });
  }

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

  /**
   * 跳转历史版本页面
   * @param {object} record - 行数据
   */
  openViewHistory(record) {
    const { history } = this.props;
    const { evalTplCode } = record;
    if (evalTplCode) {
      history.push(`/sslm/evaluation-template/historical-version/list?evalTplCode=${evalTplCode}`);
    }
  }

  /**
   *  供应商及品类导入
   */
  handleImport(evalGranularity) {
    const evalGranularityCode =
      evalGranularity === 'SU+CA'
        ? 'SSLM.BATCH_IMPORT_SUP_CATEGORY'
        : evalGranularity === 'SU+IT'
        ? 'SSLM.BATCH_IMPORT_SUP_ITEM'
        : 'SSLM.BATCH_IMPORT_SUP';
    this.closeAssignSupplierCategory();
    openTab({
      key: `/sslm/evaluation-template/comment-import/${evalGranularityCode}`,
      title: intl.get('hzero.common.title.batchImport').d('批量导入'),
      search: queryString.stringify({
        action: intl.get('hzero.common.title.batchImport').d('批量导入'),
      }),
    });
  }

  // 自动考评抽屉框打开
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
  closeSupplierEvaluationAuto() {
    this.setState({
      supplierEvaluationAutoVisible: false,
      currentActionRowData: {},
    });
  }

  closeAssignSupplierCategory() {
    this.setState({
      assignSupplierCategoryVisible: false,
      currentActionRowData: {},
    });
    this.fetchList();
  }

  /**
   * 关闭或打开分配适用公司模板
   * @param {boolean} flag - 关闭或打开
   * @param {object} record - 行数据
   */
  handleCompanyVisible(flag, record = {}) {
    const { evalStatusCode } = record;
    this.setState({
      companyVisible: flag,
    });
    if (flag) {
      this.setState({
        currentRows: record,
        templateId: record.evalTplId,
        companyMode: evalStatusCode === 'PUBLISHED' ? 'view' : 'edit',
      });
    }
  }

  /**
   * 跳转点定义评分等级页面
   * @param {object} record - 行数据
   */
  handleToScoreLevel(record) {
    const { history } = this.props;
    const { evalStatusCode, evalTplId, evalTplType } = record;
    if (evalStatusCode === 'PUBLISHED') {
      history.push(
        `/sslm/evaluation-template/score-level/view?templateId=${evalTplId}&evalTplType=${evalTplType}`
      );
    } else {
      history.push(
        `/sslm/evaluation-template/score-level/edit?templateId=${evalTplId}&evalTplType=${evalTplType}`
      );
    }
  }

  /**
   * 跳转到分配采购品类页面
   * @param {object} record - 行数据
   */
  handleToPurchaseCate(record) {
    const { history } = this.props;
    const { evalStatusCode, evalTplId } = record;
    if (evalStatusCode === 'PUBLISHED') {
      history.push(`/sslm/evaluation-template/purchase-category/view/${evalTplId}`);
    } else {
      history.push(`/sslm/evaluation-template/purchase-category/edit/${evalTplId}`);
    }
  }

  /**
   * 加载分配公司数据
   */
  handleLoadCompany() {
    const { dispatch } = this.props;
    const { templateId } = this.state;
    return dispatch({
      type: 'evaluationTemplate/fetchCompany',
      payload: { templateId },
    });
  }

  /**
   * 保存分配公司
   */
  async saveCompany(createList = [], deleteList = []) {
    const { templateId } = this.state;
    const { dispatch, evaluationTemplateRemote } = this.props;
    if (evaluationTemplateRemote.event) {
      const eventProps = {
        templateId,
        companyList: [...createList, ...deleteList],
        assignCompanyNode: this.assignCompanyNode,
        onRefresh: this.fetchList,
        setLoading: this.setLoading,
      };
      // 默认返回true,当返回false时走二开逻辑不走标准逻辑
      const res = await evaluationTemplateRemote.event.fireEvent('cuxAssignCompany', eventProps);
      if (!res) {
        return;
      }
    }
    return dispatch({
      type: 'evaluationTemplate/saveCompany',
      payload: {
        templateId,
        scoreCompany: [...createList, ...deleteList],
      },
    });
  }

  /**
   * onEvalGranularityChange
   * @param {object} activeEvalGranularity
   */
  onEvalGranularityChange(activeEvalGranularity) {
    const { currentActionRowData = {} } = this.state;
    this.setState({
      currentActionRowData: { ...currentActionRowData, activeEvalGranularity },
    });
  }

  /**
   * onEvalSortMethodChange
   * @param {object} evalSortMethod
   */
  onEvalSortMethodChange(evalSortMethod) {
    const { currentActionRowData = {} } = this.state;
    this.setState({
      currentActionRowData: { ...currentActionRowData, evalSortMethod },
    });
  }

  /**
   * 清除查询参数缓存
   */
  clearParamsCache() {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationTemplate/updateState',
      payload: {
        paramsCache: [],
      },
    });
  }

  /**
   * 绑定table的ref
   */
  @Bind
  onTableRef(ref = {}) {
    this.list = ref;
  }

  // 复制回调
  @Bind()
  handleCopy(record) {
    const { evalTplId } = record;
    const dataSet = new DataSet(getTemplateCopyDs({ evalTplId }));
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 380 },
      title: intl.get('sslm.evaluationTemplate.view.title.templateCopy').d('模板复制'),
      children: <TemplateCopy dataSet={dataSet} />,
      onOk: async () => {
        return new Promise(resolve => {
          dataSet
            .submit()
            .then(response => {
              if (response) {
                this.fetchList();
                resolve();
              }
            })
            .finally(() => resolve(false));
        });
      },
    });
  }

  render() {
    const {
      deleteEvalTplScopeItemListLoading,
      saveEvalTplScopeItemListLoading,
      queryEvalTplScopeItemListLoading,
      saveEvalTplScopeCategoryListLoading,
      queryEvalTplScopeCategoryListLoading,
      deleteEvalTplScopeLoading,
      saveEvalTplScopeLoading,
      queryEvalTplScopeSupplierListLoading,
      queryEvalTplScopeListLoading,
      queryListLoading,
      saveEvalTemplateLoading,
      fetchCompanyLoading,
      saveCompanyLoading,
      publishEvalTplLoading,
      evaluationTemplate = {},
      history,
      customizeTable,
      custLoading,
      evaluationTemplateRemote,
    } = this.props;
    const { code = {}, paramsCache, EvaluationAutoData } = evaluationTemplate;
    const {
      cuxLoading,
      currentRows,
      dataSource = [],
      pagination = {},
      editableRows,
      assignSupplierCategoryVisible,
      currentActionRowData,
      publishingRowData,
      companyVisible,
      companyMode,
      unlockingRowData,
      enadledRowProcessingKeys = [],
      supplierEvaluationAutoVisible,
    } = this.state;
    const searchProps = {
      wrappedComponentRef: node => {
        this.search = node;
      },
      fetchList: this.fetchList,
      clearParamsCache: this.clearParamsCache,
      paramsCache,
      kpiEvalTplTypeCode: code['SSLM.KPI_EVAL_TPL_TYPE_ALL'],
    };
    const listProps = {
      onRef: this.onTableRef,
      dataSource,
      pagination,
      loading: queryListLoading || publishEvalTplLoading,
      onChange: this.onTableChange,
      redirectIndicators: this.redirectIndicators,
      editableRows,
      setRowEditable: this.setRowEditable,
      cancelEditing: this.cancelEditing,
      deleteNewRow: this.deleteNewRow,
      defaultTableRowKey: this.defaultTableRowKey,
      kpiEvalTplTypeCode: code['SSLM.KPI_EVAL_TPL_TYPE_ALL'],
      openAssignSupplierCategory: this.openAssignSupplierCategory,
      openSupplierEvaluationAuto: this.openSupplierEvaluationAuto,
      openViewHistory: this.openViewHistory,
      publishEvalTpl: this.publishEvalTpl,
      publishingRowData,
      history,
      onHandleViewCompany: this.handleCompanyVisible,
      toScoreLevel: this.handleToScoreLevel,
      toPurchaseCate: this.handleToPurchaseCate,
      unlockingRowData,
      unlockEvalTpl: this.unlockEvalTpl,
      enadledRowProcessingKeys,
      enableEvalTemplate: this.enableEvalTemplate,
      weightSwatch: this.weightSwatch,
      customizeTable,
      custLoading,
      onCopy: this.handleCopy,
    };
    const assignSupplierCategoryProps = {
      evaluationTemplateRemote,
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
      saveEvalTplScope: this.saveEvalTplScope,
      onEvalGranularityChange: this.onEvalGranularityChange,
      onEvalSortMethodChange: this.onEvalSortMethodChange,
      deleteEvalTplScope: this.deleteEvalTplScope,
      fetchEvalTplScopeCategoryList: this.fetchEvalTplScopeCategoryList,
      saveEvalTplScopeCategoryList: this.saveEvalTplScopeCategoryList,
      fetchEvalTplScopeItemList: this.fetchEvalTplScopeItemList,
      saveEvalTplScopeItemList: this.saveEvalTplScopeItemList,
      deleteEvalTplScopeItemList: this.deleteEvalTplScopeItemList,
      processing: {
        queryEvalTplScopeListLoading,
        queryEvalTplScopeSupplierListLoading,
        saveEvalTplScopeLoading,
        deleteEvalTplScopeLoading,
        queryEvalTplScopeCategoryListLoading,
        saveEvalTplScopeCategoryListLoading,
        deleteEvalTplScopeItemListLoading,
        saveEvalTplScopeItemListLoading,
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
      triggerTimeCode: code['SSLM.LOV_HOUR_LIST'],
      fetchEvaluationAuto: this.fetchEvaluationAuto,
      saveEvaluationAuto: this.saveEvaluationAuto,
      EvaluationAutoData,
    };

    return (
      <Fragment>
        <Header
          title={intl
            .get(`sslm.evaluationTemplate.view.title.evaluationTemplate`)
            .d('评分模板定义')}
        >
          <Button
            icon="plus"
            type="primary"
            loading={saveEvalTemplateLoading || queryListLoading}
            onClick={this.add}
          >
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
          <Button
            icon="save"
            onClick={this.save}
            disabled={isEmpty(editableRows) || saveEvalTemplateLoading || queryListLoading}
            loading={saveEvalTemplateLoading || queryListLoading}
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
          <CompanyModal
            currentRows={currentRows}
            loading={fetchCompanyLoading}
            modalLoading={saveCompanyLoading || cuxLoading}
            companyVisible={companyVisible}
            evaluationTemplateRemote={evaluationTemplateRemote}
            onHandleCloseCompany={this.handleCompanyVisible}
            onLoad={this.handleLoadCompany}
            onSaveCompany={this.saveCompany}
            mode={companyMode}
            onRef={node => {
              this.assignCompanyNode = node;
            }}
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
