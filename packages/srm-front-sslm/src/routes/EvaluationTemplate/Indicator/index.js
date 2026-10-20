/**
 * index - 送货单创建
 * @date: 2018-12-05
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
// import { Button } from 'hzero-ui';
import { isEmpty, isUndefined, uniqBy } from 'lodash';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import { getCurrentOrganizationId, filterNullValueObject, getEditTableData } from 'utils/utils';
import { openTab } from 'utils/menuTab';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import CommonImport from 'components/Import';
import { Button as PerButton } from 'components/Permission';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';

import querystring from 'querystring';
import { SRM_SSLM } from '_utils/config';
import Search from './Search';
import List from './List';
import Detail from './Detail';
import Formula from './Formula';
import Options from './Options';
import IndicationAssign from './IndicationAssign';
import ScoreReminder from './ScoreReminder';

const defaultTableRowKey = 'evalTplIndId';
const organizationId = getCurrentOrganizationId();
const customizeUnitCode = [
  'SSLM.EVALUATION_TEMPLATE.ASSIGN_INDICATORS_TABLE',
  'SSLM.EVALUATION_TEMPLATE.ADD_INDICATOR_TABLE',
];
// 细项权限code
const detailPermissionCode = 'SSLM.EVALUATION_TEMPLATE.ASSIGN_INDICATORS_PERMISSION';

/**
 * Detail - 业务组件 - 送货单创建明细
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [supplierKpiIndicator={}] - 数据源
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
  saveIndicatorsResponsibleListLoading:
    loading.effects['evaluationTemplate/saveIndicatorsResponsibleList'],
  insertOrUpdateIndicatorsLoading: loading.effects['evaluationTemplate/insertOrUpdateIndicators'],
  queryIndicatorsResponsibleListLoading:
    loading.effects['evaluationTemplate/queryIndicatorsResponsibleList'],
  updateIndicatorLoading: loading.effects['evaluationTemplate/updateIndicator'],
  createIndicatorLoading: loading.effects['evaluationTemplate/createIndicator'],
  saveIndicatorRefLoading: loading.effects['evaluationTemplate/saveIndicatorRef'],
  queryFormulaListOrgLoading: loading.effects['evaluationTemplate/queryFormulaListOrg'],
  saveIndicatorFmlsLoading: loading.effects['evaluationTemplate/saveIndicatorFmls'],
  saveIndicatorOplsLoading: loading.effects['evaluationTemplate/saveIndicatorOpls'],
  queryFormulaListLoading: loading.effects['evaluationTemplate/queryFormulaList'],
  queryOptionsListLoading: loading.effects['evaluationTemplate/queryOptionsList'],
  queryIndicatorsListTreeLoading: loading.effects['evaluationTemplate/queryIndicatorsListTree'],
  queryIndicatorsListTreeRefLoading:
    loading.effects['evaluationTemplate/queryIndicatorsListTreeRef'],
  queryParamDefinitionLoading: loading.effects['evaluationTemplate/queryParamDefinition'],
  queryParamConfigLoading: loading.effects['evaluationTemplate/queryParamConfig'],
  deleteParamConfigLoading: loading.effects['evaluationTemplate/deleteParamConfig'],
  evaluationTemplate,
  saveIndicatorLoading: loading.effects['evaluationTemplate/batchUpdateIndicator'],
  handleDeleteLoading: loading.effects['evaluationTemplate/handleDelete'],
}))
@formatterCollections({
  code: [
    'spfm.supplierKpiIndicator',
    'sslm.evaluationTemplate',
    'spfm.common',
    'entity.company',
    'sslm.evaluationQuery',
    'sslm.commonApplication',
  ],
})
@withCustomize({
  unitCode: [
    'SSLM.EVALUATION_TEMPLATE.INDICATOR.LIST.BTN_GROUP',
    'SSLM.EVALUATION_TEMPLATE.ASSIGN_INDICATORS_TABLE',
    'SSLM.EVALUATION_TEMPLATE.ADD_INDICATOR_TABLE',
    'SSLM.EVALUATION_TEMPLATE.ASSIGN_INDICATORS_PERMISSION', // 分配指标-细项权限
  ],
})
export default class SupplierKpiIndicator extends PureComponent {
  constructor(props) {
    super(props);
    const assignRecord = props.location.state || {};
    const { routeType = '', evalTplCode = '', evalStatusCode = '' } = assignRecord;
    this.state = {
      detailDrawerVisible: false,
      currentActionRowData: {},
      detailDrawerStatus: null,
      formulaDrawerVisible: false,
      OptionsDrawerVisible: false,
      dataSource: [],
      // pagination: {},
      currentEnabledOrDisabledRowkey: [],
      indicationAssignVisible: false,
      scoreReminderVisible: false,
      allRowExpand: true, // 全部指标信息展开/收起标识
      flatKeys: [],
      allRowKey: [], // 全部指标key
      indicationAssignStatus: null,
      formulaDrawerStatus: null,
      OptionsDrawerStatus: null,
      assignRecord,
      routeType,
      evalTplCode,
      evalStatusCode,
    };

    // 方法注册
    [
      'fetchList',
      'onTableChange',
      'addParentIndicator',
      'closeDetail',
      'addChildIndicator',
      'openIndicatorDetail',
      'openFormula',
      'openOptions',
      'closeFormula',
      'closeOptions',
      'fetchScoreTypeCode',
      'fetchFormulaList',
      'fetchOptionsList',
      'fetchIndicatorsListTreeRef',
      'fetchFormulaListOrg',
      'enableIndicator',
      'createIndicator',
      'updateIndicator',
      'saveIndicatorFmls',
      'saveIndicatorOpls',
      'fetchOptionsListOrg',
      'saveIndicatorRef',
      'openIndicationAssign',
      'closeIndicationAssign',
      'fetchIndicatorsResponsibleList',
      'saveIndicatorsResponsibleList',
      'onTableExpand',
      'handleImport',
      'init',
      'fetchParamDefinition',
      'saveParamDefinition',
      'fetchParamConfig',
      'saveParamConfig',
      'deleteParamConfig',
      'deleteIndicatorOpls',
      'updateDataSource',
      'saveIndicator',
      'openScoreReminder',
      'closeScoreReminder',
      'handleDelete',
      'expandAllRow',
      'expandAll',
      'collapseAll',
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    this.fetchScoreTypeCode();
    this.fetchDataSourceCode();
    this.fetchList();
    this.init();
  }

  /**
   * 查询值集
   */
  init() {
    const { dispatch } = this.props;
    const lovCodes = {
      matchRuleList: 'SSLM.KPI_IND_CONDITION',
      isVetoSelectList: 'HPFM.FLAG',
      tenantId: organizationId,
    };
    dispatch({
      type: 'evaluationTemplate/init',
      payload: lovCodes,
    });
  }

  /**
   * fetchList - 查询行数据
   * @param {object} params - 查询条件
   */
  fetchList(params = {}) {
    const { dispatch, match = {} } = this.props;
    const { props: { form: { getFieldsValue = () => ({}) } = {} } = {} } = this.search || {};
    const queryData = getFieldsValue();
    return dispatch({
      type: 'evaluationTemplate/queryIndicatorsListTree',
      params: {
        ...queryData,
        ...params,
        evalTplId: match.params.id,
        customizeUnitCode: customizeUnitCode.join(','),
      },
    }).then(res => {
      if (res) {
        const { dataSource } = res;
        const flatKeys = [];
        const allRowKey = [];
        const getFlatKeys = (collections = []) => {
          collections.forEach(n => {
            flatKeys.push(n[defaultTableRowKey]);
            allRowKey.push(n[defaultTableRowKey]);
            if (!isEmpty(n.children)) {
              getFlatKeys(n.children);
            }
          });
        };
        getFlatKeys(dataSource);
        this.setState({
          dataSource,
          // pagination,
          allRowKey,
          flatKeys,
        });
      }
    });
  }

  /**
   * 更新数据
   */
  updateDataSource(dataSource) {
    this.setState({
      dataSource: [...dataSource],
    });
  }

  /**
   * fetchFlagCode - 查询是否值集
   */
  fetchScoreTypeCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryCode',
      payload: { lovCode: 'SPFM.KPI_SCORE_TYPE' },
    });
  }

  /**
   * fetchFlagCode - 查询是否值集
   */
  fetchDataSourceCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryCode',
      payload: { lovCode: 'SSLM.KPI_DATA_SOURCE' },
    });
  }

  /**
   * enableIndicator - 是否启用指标
   * @param {object} record - 当前行数据
   */
  enableIndicator(record) {
    const { dispatch } = this.props;
    const { currentEnabledOrDisabledRowkey, pagination = {} } = this.state;
    this.setState({
      currentEnabledOrDisabledRowkey: currentEnabledOrDisabledRowkey.concat(
        record[defaultTableRowKey]
      ),
    });
    return dispatch({
      type: 'evaluationTemplate/indicatorsEnable',
      enabled: record.enabledFlag === 1,
      data: record,
    }).then(res => {
      this.setState({
        currentEnabledOrDisabledRowkey: currentEnabledOrDisabledRowkey.filter(
          o => o[defaultTableRowKey] !== record[defaultTableRowKey]
        ),
      });
      if (res && res.failed) {
        notification.error({
          description: res.message,
        });
      } else {
        this.fetchList({ page: pagination });
        notification.success();
      }
    });
  }

  /**
   * fetchFormulaList - 查询公式列表
   * @param {object} params - 查询参数
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  fetchFormulaList(params, cb = e => e) {
    const { dispatch } = this.props;
    const { currentActionRowData = {} } = this.state;
    return dispatch({
      type: 'evaluationTemplate/queryFormulaList',
      indicatorId: currentActionRowData[defaultTableRowKey],
      params,
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  /**
   * fetchOptionsList - 查询公式列表
   * @param {object} params - 查询参数
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  fetchOptionsList(params, cb = e => e) {
    const { dispatch } = this.props;
    const { currentActionRowData = {} } = this.state;
    return dispatch({
      type: 'evaluationTemplate/queryOptionsList',
      indicatorId: currentActionRowData[defaultTableRowKey],
      params,
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  /**
   * fetchIndicatorsListTreeRef - 查询引用指标列表
   * @param {object} params - 查询参数
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  fetchIndicatorsListTreeRef(params, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryIndicatorsListTreeRef',
      params: filterNullValueObject(params),
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  /**
   * createIndicator - 创建指标
   * @param {object} data - 保存数据
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  createIndicator(data, cb) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/createIndicator',
      data,
    }).then(res => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        cb();
        this.fetchList();
        notification.success();
      }
    });
  }

  /**
   * updateIndicator - 更新指标
   * @param {object} data - 保存数据
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  updateIndicator(data, cb) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/updateIndicator',
      payload: {
        data,
        customizeUnitCode: customizeUnitCode.join(','),
      },
    }).then(res => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        cb();
        this.fetchList();
        notification.success();
      }
    });
  }

  /**
   * saveIndicatorFmls - 保存指标公式
   * @param {object} data - 保存数据
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  saveIndicatorFmls(indicatorId, data, cb) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/saveIndicatorFmls',
      indicatorId,
      data,
    }).then(res => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        cb();
        notification.success();
      }
    });
  }

  /**
   * saveIndicatorOpls - 保存选项配置行
   * @param {object} data - 保存数据
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  saveIndicatorOpls(indicatorId, data, cb) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/saveIndicatorOpls',
      indicatorId,
      data,
    }).then(res => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        cb();
        notification.success();
      }
    });
  }

  /**
   * saveIndicatorFmls - 保存指标引用
   * @param {object} data - 保存数据
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  saveIndicatorRef(data, cb) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/saveIndicatorRef',
      payload: {
        data,
        customizeUnitCode: customizeUnitCode.join(','),
      },
    }).then(res => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        cb();
        this.fetchList();
        notification.success();
      }
    });
  }

  /**
   * fetchFormulaListOrg - 查询公式租户级
   * @param {number} indicatorId - 指标主键ID
   * @param {object} params - 保存数据
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  fetchFormulaListOrg(indicatorId, params, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryFormulaListOrg',
      indicatorId,
      params,
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  /**
   * fetchOptionsListOrg - 查询选项配置租户级
   * @param {number} indicatorId - 指标主键ID
   * @param {object} params - 保存数据
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  fetchOptionsListOrg(indicatorId, params, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryOptionsListOrg',
      indicatorId,
      params,
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  /**
   * fetchIndicatorsResponsibleList - 查询细项权限列表
   * @param {object} params - 保存数据
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  fetchIndicatorsResponsibleList(params = {}, cb = e => e) {
    const { dispatch } = this.props;
    const { currentActionRowData = {}, indicationAssignStatus } = this.state;
    return dispatch({
      type: 'evaluationTemplate/queryIndicatorsResponsibleList',
      indicationAssignStatus,
      indicatorId: currentActionRowData[defaultTableRowKey],
      params: { ...params, customizeUnitCode: detailPermissionCode },
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  /**
   * saveIndicatorsResponsibleList - 查询细项权限列表
   * @param {number} indicatorId - 指标主键ID
   * @param {object} data - 保存数据
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  saveIndicatorsResponsibleList(indicatorId, data, cb) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/saveIndicatorsResponsibleList',
      indicatorId,
      data,
    }).then(res => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        cb(res);
        notification.success();
      }
    });
  }

  /**
   * onTableChange - 表格分页事件
   * @param {String} page - 分页参数
   */
  onTableChange(page) {
    this.fetchList({ page });
  }

  /**
   * addParentIndicator - 增加顶级指标
   */
  addParentIndicator() {
    const {
      assignRecord: { evalTplType = '' },
    } = this.state;
    const scoreType = evalTplType === 'GYSKP_ORDER' ? 'SYSTEM' : null;
    this.setState({
      detailDrawerVisible: true,
      detailDrawerStatus: 'addParentIndicator',
      currentActionRowData: { parentIndicatorId: -1, scoreType },
    });
  }

  /**
   * saveIndicator - 保存指标
   */
  saveIndicator() {
    const { dispatch } = this.props;
    const { dataSource } = this.state;
    const params = getEditTableData(dataSource, ['children']);
    const data = params.map(n => {
      const { parentId } = n;
      return {
        ...n,
        parentIndicatorId: parentId,
      };
    });
    if (Array.isArray(params) && params.length !== 0) {
      dispatch({
        type: 'evaluationTemplate/batchUpdateIndicator',
        payload: {
          data,
          customizeUnitCode: customizeUnitCode.join(','),
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchList();
        }
      });
    }
  }

  /**
   * closeDetail - 关闭详情页
   */
  closeDetail() {
    this.setState({
      detailDrawerVisible: false,
      currentActionRowData: {},
      detailDrawerStatus: null,
    });
  }

  /**
   * addChildIndicator - 表格分页事件
   * @param {Object} currentActionRowData - 当前行数据
   */
  addChildIndicator(currentActionRowData = {}) {
    const { evalTplIndId, indicatorName, scoreType = null } = currentActionRowData;
    this.setState({
      detailDrawerVisible: true,
      currentActionRowData: {
        parentIndicatorId: evalTplIndId,
        parentIndicatorName: indicatorName,
        scoreType,
      },
      detailDrawerStatus: 'addChildIndicator',
    });
  }

  /**
   * handleDelete - 删除指标回调处理
   * @param {Object} currentActionRowData - 当前行数据
   */
  handleDelete(currentActionRowData = {}) {
    const { dispatch } = this.props;
    const { pagination = {} } = this.state;
    return dispatch({
      type: 'evaluationTemplate/handleDelete',
      params: currentActionRowData,
    }).then(res => {
      if (res) {
        this.fetchList({ page: pagination });
        notification.success();
      }
    });
  }

  /**
   * openIndicatorDetail - 打开指标详情页
   * @param {Object} currentActionRowData - 当前行数据
   */
  openIndicatorDetail(currentActionRowData = {}) {
    this.setState({
      detailDrawerVisible: true,
      currentActionRowData,
      detailDrawerStatus: 'edit',
    });
  }

  /**
   * closeFormula - 关闭公式配置抽屉
   */
  closeFormula() {
    this.setState({
      formulaDrawerVisible: false,
      currentActionRowData: {},
    });
  }

  /**
   * closeOptions - 关闭选项配置抽屉
   */
  closeOptions() {
    this.setState({
      OptionsDrawerVisible: false,
      currentActionRowData: {},
    });
  }

  /**
   * openFormula - 打开公式配置抽屉
   * @param {Object} currentActionRowData - 当前行数据
   */
  openFormula(currentActionRowData) {
    const { match } = this.props;
    const { action } = match.params;
    this.setState({
      formulaDrawerVisible: true,
      currentActionRowData,
      formulaDrawerStatus: action,
    });
  }

  /**
   * openOptions - 打开选项配置抽屉
   * @param {Object} currentActionRowData - 当前行数据
   */
  openOptions(currentActionRowData) {
    const { match } = this.props;
    const { action } = match.params;
    this.setState({
      OptionsDrawerVisible: true,
      currentActionRowData,
      OptionsDrawerStatus: action,
    });
  }

  /**
   * openOptions - 打开分数提醒配置抽屉
   * @param {Object} currentActionRowData - 当前行数据
   */
  openScoreReminder(currentActionRowData) {
    this.setState({
      scoreReminderVisible: true,
      currentActionRowData,
    });
  }

  /**
   * closeScoreReminder - 关闭分数提醒配置抽屉
   */
  closeScoreReminder() {
    this.setState({
      scoreReminderVisible: false,
      currentActionRowData: {},
    });
  }

  /**
   * openIndicationAssign - 打开细项权限抽屉
   * @param {Object} currentActionRowData - 当前行数据
   */
  openIndicationAssign(currentActionRowData) {
    const { match } = this.props;
    const { action } = match.params;
    this.setState(
      {
        indicationAssignVisible: true,
        currentActionRowData,
        indicationAssignStatus: action,
      },
      () => this.fetchIndicatorsResponsibleList()
    );
  }

  /**
   * closeIndicationAssign - 关闭细项权限抽屉
   */
  closeIndicationAssign() {
    this.setState({
      indicationAssignVisible: false,
      currentActionRowData: {},
    });
  }

  /**
   * onTableExpand - 行折叠函数
   * @param {Object} expanded - 是否展开
   * @param {Object} record - 当前行数据
   */
  onTableExpand(expanded, record) {
    const { flatKeys = [] } = this.state;
    this.setState({
      flatKeys: expanded
        ? uniqBy(flatKeys.concat(record[defaultTableRowKey]))
        : flatKeys.filter(o => o !== record[defaultTableRowKey]),
    });
  }

  /**
   * 导出
   */
  handleImport() {
    const {
      match: {
        params: { id: evalTplId },
      },
    } = this.props;
    openTab({
      key: `/sslm/supplier-ablility-definition/import-component/SSLM.KPI_EVAL_TPL_IND`,
      title: intl.get('hzero.common.button.import').d('导入'),
      search: querystring.stringify({
        args: JSON.stringify({
          evalTplId: parseInt(evalTplId, 10),
          organizationId: parseInt(organizationId, 10),
        }),
      }),
    });
  }

  // 获取导出参数
  @Bind
  handleParams() {
    if (!isUndefined(this.search)) {
      const {
        match: {
          params: { id: evalTplId },
        },
      } = this.props;
      const { getFieldsValue = () => {} } = this.search.props.form;
      const params = { ...filterNullValueObject(getFieldsValue()), evalTplId };
      return params;
    }
  }

  /**
   * fetchParamDefinition - 查询参数定义
   * @param {object} params - 查询条件
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  fetchParamDefinition(params = {}, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryParamDefinition',
      params,
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  /**
   * saveParamDefinition - 保存参数定义
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  saveParamDefinition(params, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/saveParamDefinition',
      params,
    }).then(res => {
      if (res) {
        notification.success();
        cb(res);
      }
    });
  }

  /**
   * fetchParamConfig - 查询参数配置
   * @param {object} params - 查询条件
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  fetchParamConfig(params = {}, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/queryParamConfig',
      params,
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  /**
   * saveParamConfig - 保存参数配置
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  saveParamConfig(params, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/saveParamConfig',
      params,
    }).then(res => {
      if (res) {
        notification.success();
        cb(res);
      }
    });
  }

  /**
   * deleteParamConfig - 删除参数配置
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  deleteParamConfig(params, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/deleteParamConfig',
      params,
    }).then(res => {
      if (res) {
        notification.success();
      }
      cb(res);
    });
  }

  /**
   * deleteIndicatorOpls - 删除选项配置
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  deleteIndicatorOpls(params, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationTemplate/deleteOptions',
      params,
    }).then(res => {
      if (res) {
        notification.success();
      }
      cb(res);
    });
  }

  /**
   * 全部指标展开/收起
   */
  expandAllRow() {
    const { allRowExpand } = this.state;
    if (allRowExpand) {
      this.collapseAll();
    } else {
      this.expandAll();
    }
    this.setState({
      allRowExpand: !allRowExpand,
    });
  }

  /**
   * 展开全部指标信息
   */
  expandAll() {
    const { allRowKey } = this.state;
    this.setState({
      flatKeys: allRowKey,
    });
  }

  /**
   * 收起全部指标信息
   */
  collapseAll() {
    this.setState({
      flatKeys: [],
    });
  }

  render() {
    const {
      updateIndicatorLoading,
      createIndicatorLoading,
      saveIndicatorRefLoading,
      queryFormulaListLoading,
      evaluationTemplate = {},
      queryIndicatorsListTreeLoading,
      queryIndicatorsListTreeRefLoading,
      queryIndicatorsResponsibleListLoading,
      saveIndicatorFmlsLoading,
      saveIndicatorOplsLoading,
      queryFormulaListOrgLoading,
      queryOptionsListLoading,
      saveIndicatorsResponsibleListLoading,
      insertOrUpdateIndicatorsLoading,
      queryParamDefinitionLoading,
      queryParamConfigLoading,
      deleteParamConfigLoading,
      match = {},
      customizeBtnGroup,
      customizeTable,
      custLoading,
      saveIndicatorLoading,
      handleDeleteLoading,
    } = this.props;
    const {
      dataSource = [],
      detailDrawerVisible,
      currentActionRowData,
      detailDrawerStatus,
      formulaDrawerVisible,
      currentEnabledOrDisabledRowkey,
      indicationAssignVisible,
      scoreReminderVisible,
      flatKeys = [],
      indicationAssignStatus,
      formulaDrawerStatus,
      OptionsDrawerStatus,
      assignRecord,
      OptionsDrawerVisible,
      routeType,
      evalTplCode,
      evalStatusCode,
      allRowExpand,
    } = this.state;
    const { code = {}, matchRuleList = [], isVetoSelectList = [] } = evaluationTemplate;
    const { action } = match.params;

    const allLoading =
      updateIndicatorLoading ||
      createIndicatorLoading ||
      saveIndicatorRefLoading ||
      queryFormulaListLoading ||
      queryIndicatorsListTreeLoading ||
      queryIndicatorsListTreeRefLoading ||
      queryIndicatorsResponsibleListLoading ||
      saveIndicatorFmlsLoading ||
      saveIndicatorOplsLoading ||
      queryFormulaListOrgLoading ||
      queryOptionsListLoading ||
      saveIndicatorsResponsibleListLoading ||
      insertOrUpdateIndicatorsLoading ||
      queryParamDefinitionLoading ||
      queryParamConfigLoading ||
      deleteParamConfigLoading ||
      handleDeleteLoading ||
      saveIndicatorLoading;

    const searchProps = {
      wrappedComponentRef: node => {
        this.search = node;
      },
      fetchList: this.fetchList,
    };

    const listProps = {
      ref: node => {
        this.list = node;
      },
      customizeTable,
      custLoading,
      loading: queryIndicatorsListTreeLoading,
      onChange: this.onTableChange,
      pagination: false,
      dataSource,
      addChildIndicator: this.addChildIndicator,
      openIndicatorDetail: this.openIndicatorDetail,
      formulaConfig: this.openFormula,
      optionsConfig: this.openOptions,
      scoreAlertConfig: this.openScoreReminder,
      actionRowKey: currentEnabledOrDisabledRowkey,
      enable: this.enableIndicator,
      openIndicationAssign: this.openIndicationAssign,
      defaultTableRowKey,
      expandedRowKeys: flatKeys,
      onExpand: this.onTableExpand,
      evalTplStatusAction: action,
      updateDataSource: this.updateDataSource,
      assignRecord,
      isVetoSelectList,
      handleDelete: this.handleDelete,
      evalStatusCode,
    };
    const detailProps = {
      assignRecord,
      customizeTable,
      custLoading,
      visible: detailDrawerVisible,
      close: this.closeDetail,
      dataSource: currentActionRowData,
      status: detailDrawerStatus,
      scoreTypeCode: code['SPFM.KPI_SCORE_TYPE'],
      dataSourceCode: code['SSLM.KPI_DATA_SOURCE'],
      createIndicator: this.createIndicator,
      updateIndicator: this.updateIndicator,
      fetchListTree: this.fetchIndicatorsListTreeRef,
      saveIndicatorRef: this.saveIndicatorRef,
      fetchFormulaList: this.fetchFormulaListOrg,
      fetchOptionsList: this.fetchOptionsListOrg,
      evalTplId: match.params.id,
      processing: {
        updateIndicatorLoading,
        createIndicatorLoading,
        saveIndicatorRefLoading,
        queryIndicatorsListTreeRefLoading,
        queryFormulaListOrgLoading,
      },
    };

    const formulaProps = {
      visible: formulaDrawerVisible,
      close: this.closeFormula,
      fetchFormulaList: this.fetchFormulaList,
      indicatorRowDataSource: currentActionRowData,
      processing: { queryFormulaListLoading, saveIndicatorFmlsLoading },
      saveIndicatorFmls: this.saveIndicatorFmls,
      formulaDrawerStatus,
      matchRuleList,
      queryParamDefinitionLoading,
      queryParamConfigLoading,
      deleteParamConfigLoading,
      fetchParamDefinition: this.fetchParamDefinition,
      saveParamDefinition: this.saveParamDefinition,
      fetchParamConfig: this.fetchParamConfig,
      saveParamConfig: this.saveParamConfig,
      deleteParamConfig: this.deleteParamConfig,
    };
    const optionsProps = {
      visible: OptionsDrawerVisible,
      close: this.closeOptions,
      fetchOptionsList: this.fetchOptionsList,
      saveIndicatorOpls: this.saveIndicatorOpls,
      deleteIndicatorOpls: this.deleteIndicatorOpls,
      indicatorRowDataSource: currentActionRowData,
      processing: { queryOptionsListLoading, saveIndicatorOplsLoading },
      OptionsDrawerStatus,
    };

    const indicationAssignProps = {
      customizeTable,
      detailPermissionCode,
      visible: indicationAssignVisible,
      close: this.closeIndicationAssign,
      refresh: this.fetchList,
      fetchList: this.fetchIndicatorsResponsibleList,
      indicatorRowDataSource: currentActionRowData,
      saveIndicatorsResponsibleList: this.saveIndicatorsResponsibleList,
      processing: {
        queryIndicatorsResponsibleListLoading,
        saveIndicatorsResponsibleListLoading,
        insertOrUpdateIndicatorsLoading,
      },
      indicationAssignStatus,
      averageFlag: assignRecord.averageFlag,
    };

    const scoreReminderProps = {
      visible: scoreReminderVisible,
      close: this.closeScoreReminder,
      refresh: this.fetchList,
      scoreReminderRowDataSource: currentActionRowData,
      isEdit: !['PUBLISHED'].includes(evalStatusCode),
    };

    const backPath =
      routeType && routeType === 'HistoricalVersion'
        ? `/sslm/evaluation-template/historical-version/list?evalTplCode=${evalTplCode}`
        : '/sslm/evaluation-template/list';

    const buttons = [
      {
        name: 'addParentNode',
        btnProps: {
          icon: 'plus',
          type: 'primary',
          loading: allLoading,
          onClick: () => this.addParentIndicator(),
        },
        child: intl.get('spfm.supplierKpiIndicator.view.button.addParentNode').d('新增顶级指标'),
      },
      {
        name: 'save',
        btnProps: {
          icon: 'save',
          loading: allLoading,
          onClick: () => this.saveIndicator(),
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      {
        name: 'collapseAll',
        btnProps: {
          loading: allLoading,
          icon: allRowExpand ? 'up' : 'down',
          onClick: this.expandAllRow,
        },
        child: allRowExpand
          ? intl.get('hzero.common.button.collapseAll').d('全部收起')
          : intl.get('hzero.common.button.expandAll').d('全部展开'),
      },
      {
        name: 'commonImport',
        btnComp: CommonImport,
        btnProps: {
          buttonText: intl.get('hzero.common.button.newImport').d('(新)导入'),
          refreshButton: true,
          prefixPatch: SRM_SSLM,
          businessObjectTemplateCode: 'SSLM.KPI_EVAL_TPL_IND',
          args: {
            evalTplId: match.params.id,
            organizationId,
          },
          successCallBack: () => {
            this.fetchList();
          },
          loading: allLoading,
          buttonProps: {
            permissionList: [
              {
                code:
                  'srm.partner.evaluation-template.evaluation-template.ps.eval.tpl.import.model',
                type: 'button',
                meaning: '评分模板定义-分配指标-导入',
              },
            ],
          },
        },
      },
      {
        name: 'import',
        btnComp: PerButton,
        child: intl.get('hzero.common.button.import').d('导入'),
        btnProps: {
          permissionList: [
            {
              code: `srm.partner.evaluation-template.evaluation-template.ps.eval.tpl.import.old`,
              type: 'button',
              meaning: '评分模板定义-分配指标-导入',
            },
          ],
          icon: 'archive',
          loading: allLoading,
          onClick: this.handleImport,
        },
      },
      {
        name: 'exportPro',
        btnComp: ExcelExport,
        btnProps: {
          buttonText: intl.get('hzero.common.button.export').d('导出'),
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/tree/export`,
          queryParams: () => this.handleParams(),
          loading: allLoading,
          otherButtonProps: {
            icon: 'unarchive',
            type: 'c7n-pro',
          },
        },
      },
      {
        name: 'newExport',
        btnComp: ExcelExportPro,
        btnProps: {
          loading: allLoading,
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/tree/export`,
          buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
          queryParams: () => this.handleParams(),
          otherButtonProps: {
            type: 'c7n-pro',
            icon: 'unarchive',
            permissionList: [
              {
                code: 'srm.partner.evaluation-template.evaluation-template.button.export',
                type: 'button',
                meaning: '评分模版定义-分配指标-新导出',
              },
            ],
          },
          templateCode: 'SSLM_KPI_EVAL_TPL_IND_EXPORT',
        },
      },
      {
        name: 'batchImportScorer',
        btnComp: CommonImport,
        btnProps: {
          buttonText: intl
            .get('spfm.supplierKpiIndicator.view.button.batchImportScorer')
            .d('批量导入评分人'),
          refreshButton: true,
          prefixPatch: SRM_SSLM,
          businessObjectTemplateCode: 'SSLM.KPI_TPL_IND_RESP',
          successCallBack: () => {
            this.fetchList();
          },
          loading: allLoading,
          buttonProps: {
            permissionList: [
              {
                code: 'srm.partner.evaluation-template.evaluation-template.button.detail',
                type: 'button',
                meaning: '评分模板定义-细项权限弹窗(新)导入',
              },
            ],
          },
        },
      },
    ];

    return (
      <Fragment>
        <Header
          backPath={backPath}
          title={intl.get(`sslm.evaluationTemplate.view.title.assignIndicators`).d('分配指标')}
        >
          {customizeBtnGroup(
            {
              // code: 'SSLM.EVALUATION_TEMPLATE.INDICATOR.LIST.BTN_GROUP',
              code: '',
            },
            action === 'edit' ? (
              <DynamicButtons buttons={buttons} maxNum={4} />
            ) : (
              [
                <ExcelExport
                  requestUrl={`${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/tree/export`}
                  queryParams={() => this.handleParams()}
                  otherButtonProps={{
                    icon: 'unarchive',
                    type: 'c7n-pro',
                    loading: allLoading,
                  }}
                />,
                <ExcelExportPro
                  data-name="newExport"
                  requestUrl={`${SRM_SSLM}/v1/${organizationId}/eval-templates/indicators/tree/export`}
                  templateCode="SSLM_KPI_EVAL_TPL_IND_EXPORT"
                  buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
                  queryParams={() => this.handleParams()}
                  otherButtonProps={{
                    type: 'c7n-pro',
                    icon: 'unarchive',
                    permissionList: [
                      {
                        code: 'srm.partner.evaluation-template.evaluation-template.button.export',
                        type: 'button',
                        meaning: '评分模版定义-分配指标-新导出',
                      },
                    ],
                  }}
                />,
                <PerButton
                  icon={allRowExpand ? 'up' : 'down'}
                  loading={allLoading}
                  data-name="collapseAll"
                  onClick={() => this.expandAllRow()}
                >
                  {allRowExpand
                    ? intl.get('hzero.common.button.collapseAll').d('全部收起')
                    : intl.get('hzero.common.button.expandAll').d('全部展开')}
                </PerButton>,
              ]
            )
          )}
        </Header>
        <Content>
          <Search {...searchProps} />
          <br />
          <List {...listProps} />
        </Content>
        <Detail {...detailProps} />
        <Formula {...formulaProps} />
        <Options {...optionsProps} />
        <IndicationAssign {...indicationAssignProps} />
        <ScoreReminder {...scoreReminderProps} />
      </Fragment>
    );
  }
}
