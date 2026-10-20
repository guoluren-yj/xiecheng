/**
 * index - 送货单创建
 * @date: 2018-12-05
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import { isEmpty, uniqBy, isUndefined } from 'lodash';
import React, { PureComponent, Fragment } from 'react';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import queryString from 'querystring';
import { openTab } from 'utils/menuTab';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import CommonImport from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { Button as PerButton } from 'components/Permission';
import { Modal } from 'choerodon-ui/pro';

import formatterCollections from 'utils/intl/formatterCollections';

import Search from './Search';
import List from './List';
import Detail from './Detail';
import Formula from './Formula';
import Options from './Options';
import IndicationAssign from './IndicationAssign';

const organizationId = getCurrentOrganizationId();
const customizeUnitCode = ['SSLM.KPI.INDICATOR.LIST.TABLE', 'SSLM.KPI.INDICATOR.LIST.EDIT_FORM'];

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
@withCustomize({
  unitCode: [
    'SSLM.KPI.INDICATOR.LIST.BTN_GROUP',
    'SSLM.KPI.INDICATOR.LIST.TABLE',
    'SSLM.KPI.INDICATOR.LIST.EDIT_FORM',
    'SSLM.KPI.INDICATOR.LIST.DETAIL_PERMISSION', // 细项权限
  ],
})
@connect(({ loading = {}, supplierKpiIndicatorOrg = {} }) => ({
  updateIndicatorLoading: loading.effects['supplierKpiIndicatorOrg/updateIndicator'],
  createIndicatorLoading: loading.effects['supplierKpiIndicatorOrg/createIndicator'],
  saveIndicatorRefLoading: loading.effects['supplierKpiIndicatorOrg/saveIndicatorRef'],
  queryFormulaListOrgLoading: loading.effects['supplierKpiIndicatorOrg/queryFormulaListOrg'],
  saveIndicatorFmlsLoading: loading.effects['supplierKpiIndicatorOrg/saveIndicatorFmls'],
  saveIndicatorOplsLoading: loading.effects['supplierKpiIndicatorOrg/saveIndicatorOpls'],
  queryFormulaListLoading: loading.effects['supplierKpiIndicatorOrg/queryFormulaList'],
  queryOptionsListLoading: loading.effects['supplierKpiIndicatorOrg/queryOptionsList'],
  queryListLoading: loading.effects['supplierKpiIndicatorOrg/queryList'],
  queryListTreeLoading: loading.effects['supplierKpiIndicatorOrg/queryListTree'],
  queryIndicatorsListTreeLoading:
    loading.effects['supplierKpiIndicatorOrg/queryIndicatorsListTree'],
  queryParamDefinitionLoading: loading.effects['supplierKpiIndicatorOrg/queryParamDefinition'],
  queryParamConfigLoading: loading.effects['supplierKpiIndicatorOrg/queryParamConfig'],
  deleteParamConfigLoading: loading.effects['supplierKpiIndicatorOrg/deleteParamConfig'],
  deleteIndicatorOplsLoading: loading.effects['supplierKpiIndicatorOrg/deleteIndicatorOpls'],
  batchQueryScoringTempLoading: loading.effects['supplierKpiIndicatorOrg/batchQueryScoringTemp'],
  queryScoringTempLoading: loading.effects['supplierKpiIndicatorOrg/queryScoringTemp'],
  handleDeleteTempLoading: loading.effects['supplierKpiIndicatorOrg/handleDelete'],
  batchHandleUpdateScoringTempLoading:
    loading.effects['supplierKpiIndicatorOrg/batchHandleUpdateScoringTemp'],
  handleUpdateScoringTempLoading:
    loading.effects['supplierKpiIndicatorOrg/handleUpdateScoringTemp'],
  supplierKpiIndicatorOrg,
}))
@formatterCollections({
  code: [
    'spfm.supplierKpiIndicator',
    'spfm.common',
    'entity.company',
    'sslm.common',
    'sslm.supplierKpiIndicator',
  ],
})
export default class SupplierKpiIndicator extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      detailDrawerVisible: false, // 明细抽屉是否隐藏
      currentActionRowData: {}, // 当前操作行数据
      detailDrawerStatus: null, // 明细抽屉状态
      formulaDrawerVisible: false, // 公式抽屉状态
      optionsConfigVisible: false, // 选项配置抽屉状态
      dataSource: [], // 列表数据源
      // pagination: {},
      currentEnabledOrDisabledRowkey: [], // 当前启用/禁用的行数据key

      indicationAssignVisible: false, // 细项权限弹窗visible
      isBatch: false, // 是否批量维护细项权限
      allRowExpand: false, // 全部指标信息展开/收起标识
      indicationSelectedRows: [],
      indicationSelectedRowKeys: [],
      flatKeys: [], // 展开的指标key
      allRowKey: [], // 全部指标key
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
      'closeFormula',
      'fetchScoreTypeCode',
      'fetchFormulaList',
      'fetchListTree',
      'fetchFormulaListOrg',
      'enableIndicator',
      'createIndicator',
      'updateIndicator',
      'saveIndicatorFmls',
      'saveIndicatorRef',
      'onTableExpand',
      'fetchParamDefinition',
      'saveParamDefinition',
      'fetchParamConfig',
      'saveParamConfig',
      'deleteParamConfig',
      'openOptionsConfig',
      'fetchOptionsList',
      'saveIndicatorOpls',
      'deleteIndicatorOpls',
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    this.fetchScoreTypeCode();
    this.fetchDataSourceCode();
    if (!isUndefined(this.search)) {
      const { getFieldsValue = () => {} } = this.search.props.form;
      const searchParams = filterNullValueObject(getFieldsValue());
      this.fetchList(searchParams);
    } else {
      this.fetchList();
    }
    this.selectType();
  }

  /**
   * fetchList - 查询行数据
   * @param {object} params - 查询条件
   */
  fetchList(params = {}) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierKpiIndicatorOrg/queryListTree',
      params: {
        ...params,
        customizeUnitCode: customizeUnitCode.join(','),
      },
    }).then(res => {
      if (res) {
        const { dataSource } = res;
        const flatKeys = [];
        const allRowKey = []; // 全部数据主键id
        const getFlatKeys = (collections = []) => {
          collections.forEach(n => {
            flatKeys.push(n.indicatorId);
            if (!isEmpty(n.children)) {
              getFlatKeys(n.children);
            }
          });
        };
        const getAllRowKeys = (collections = []) => {
          collections.forEach(n => {
            allRowKey.push(n.indicatorId);
            if (!isEmpty(n.children)) {
              getAllRowKeys(n.children);
            }
          });
        };
        if (!isEmpty(params.indicatorCode) || !isEmpty(params.indicatorName)) {
          getFlatKeys(dataSource);
        }
        getAllRowKeys(dataSource);
        this.setState({
          dataSource,
          // pagination,
          flatKeys,
          allRowKey,
        });
      }
    });
  }

  /**
   * fetchScoreTypeCode - 查询评分方式值集
   */
  fetchScoreTypeCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierKpiIndicatorOrg/queryCode',
      payload: { lovCode: 'SPFM.KPI_SCORE_TYPE' },
    });
  }

  /**
   * fetchDataSourceCode - 查询数据源值集
   */
  fetchDataSourceCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierKpiIndicatorOrg/queryCode',
      payload: { lovCode: 'SSLM.KPI_DATA_SOURCE' },
    });
  }

  /**
   * enableIndicator - 是否启用禁用指标
   * @param {object} record - 行数据
   */
  enableIndicator(record) {
    const { dispatch } = this.props;
    const { currentEnabledOrDisabledRowkey, pagination = {} } = this.state;
    const { getFieldsValue = () => {} } = (this.search || {}).props.form;
    this.setState({
      currentEnabledOrDisabledRowkey: currentEnabledOrDisabledRowkey.concat(record.indicatorId),
    });
    return dispatch({
      type: 'supplierKpiIndicatorOrg/indicatorsEnable',
      enabled: record.enabledFlag === 1,
      data: record,
    }).then(res => {
      this.setState({
        currentEnabledOrDisabledRowkey: currentEnabledOrDisabledRowkey.filter(
          o => o.indicatorId !== record.indicatorId
        ),
      });
      if (res && res.failed) {
        notification.error({
          description: res.message,
        });
      } else {
        this.fetchList({ ...getFieldsValue(), page: pagination });
        notification.success();
      }
    });
  }

  /**
   * fetchFormulaList - 查询公式配置数据
   * @param {object} params - 查询条件
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  fetchFormulaList(params, cb = e => e) {
    const { dispatch } = this.props;
    const { currentActionRowData = {} } = this.state;
    const { indicatorId } = currentActionRowData;
    return dispatch({
      type: 'supplierKpiIndicatorOrg/queryFormulaList',
      indicatorId,
      params,
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  /**
   * fetchOptionsList - 查询选项配置数据
   * @param {object} params - 查询条件
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  fetchOptionsList(params, cb = e => e) {
    const { dispatch } = this.props;
    const { currentActionRowData = {} } = this.state;
    const { indicatorId } = currentActionRowData;
    return dispatch({
      type: 'supplierKpiIndicatorOrg/queryOptionsList',
      indicatorId,
      params,
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  /**
   * fetchListTree - 查询列表树结构
   * @param {object} params - 查询条件
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  fetchListTree(params, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierKpiIndicatorOrg/queryIndicatorsListTree',
      params,
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  /**
   * createIndicator - 创建指标
   * @param {object} data - 指标数据
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  createIndicator(data, cb) {
    const { dispatch } = this.props;
    const { form: { getFieldsValue = () => {} } = {} } = (this.search || {}).props;
    return dispatch({
      type: 'supplierKpiIndicatorOrg/createIndicator',
      payload: {
        data,
        customizeUnitCode: customizeUnitCode.join(','),
      },
    }).then(res => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        cb();
        this.fetchList(getFieldsValue());
        notification.success();
      }
    });
  }

  /**
   * createIndicator - 更新指标
   * @param {object} data - 指标数据
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  updateIndicator(data, cb) {
    const { dispatch } = this.props;
    const { form: { getFieldsValue = () => {} } = {} } = (this.search || {}).props;
    return dispatch({
      type: 'supplierKpiIndicatorOrg/updateIndicator',
      payload: {
        data,
        customizeUnitCode: customizeUnitCode.join(','),
      },
    }).then(res => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        cb();
        this.fetchList(getFieldsValue());
        notification.success();
      }
    });
  }

  /**
   * saveIndicatorFmls - 保存指标公式
   * @param {number} indicatorId - 指标编码
   * @param {object} data - 指标数据
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  saveIndicatorFmls(indicatorId, data, cb) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierKpiIndicatorOrg/saveIndicatorFmls',
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
   * saveIndicatorFmls - 保存选项配置
   * @param {number} indicatorId - 指标编码
   * @param {object} data - 指标数据
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  saveIndicatorOpls(indicatorId, data, cb) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierKpiIndicatorOrg/saveIndicatorOpls',
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
   * saveIndicatorRef - 保存指标引用
   * @param {object} data - 指标数据
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  saveIndicatorRef(data, cb) {
    const { dispatch } = this.props;
    const { getFieldsValue = () => {} } = (this.search || {}).props.form;
    return dispatch({
      type: 'supplierKpiIndicatorOrg/saveIndicatorRef',
      data,
    }).then(res => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        cb();
        this.fetchList(getFieldsValue());
        notification.success();
      }
    });
  }

  /**
   * fetchFormulaListOrg - 查询租户级公式列表
   * @param {number} indicatorId - 指标编码
   * @param {object} data - 指标数据
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  fetchFormulaListOrg(indicatorId, params, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierKpiIndicatorOrg/queryFormulaListOrg',
      indicatorId,
      params,
    }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  /**
   * onTableChange - 列表分页变化
   * @param {object} page - 分页参数
   */
  onTableChange(page) {
    const { getFieldsValue = () => {} } = (this.search || {}).props.form;
    this.fetchList({ page, ...getFieldsValue() });
  }

  /**
   * addParentIndicator - 添加顶级指标
   */
  addParentIndicator() {
    this.setState({
      detailDrawerVisible: true,
      detailDrawerStatus: 'addParentIndicator',
    });
  }

  /**
   * closeDetail - 关闭详情
   */
  closeDetail() {
    this.setState({
      detailDrawerVisible: false,
      currentActionRowData: {},
      detailDrawerStatus: null,
    });
  }

  /**
   * addChildIndicator - 添加下级指标
   * @param {object} currentActionRowData - 当前操作行
   */
  addChildIndicator(currentActionRowData = {}) {
    const { indicatorId, indicatorName } = currentActionRowData;
    this.setState({
      detailDrawerVisible: true,
      currentActionRowData: { parentIndicatorId: indicatorId, parentIndicatorName: indicatorName },
      detailDrawerStatus: 'addChildIndicator',
    });
  }

  /**
   * openIndicatorDetail - 打开指标详情页
   * @param {object} currentActionRowData - 当前操作行
   */
  openIndicatorDetail(currentActionRowData) {
    this.setState({
      detailDrawerVisible: true,
      currentActionRowData,
      detailDrawerStatus: 'edit',
    });
  }

  /**
   * closeFormula - 关闭公式抽屉
   */
  closeFormula() {
    this.setState({
      formulaDrawerVisible: false,
      currentActionRowData: {},
    });
  }

  /**
   * openFormula - 打开公式抽屉
   * @param {object} currentActionRowData - 当前操作行
   */
  openFormula(currentActionRowData) {
    this.setState({
      formulaDrawerVisible: true,
      currentActionRowData,
    });
  }

  /**
   * onTableExpand - 表格行展开
   * @param {object} currentActionRowData - 当前操作行
   */
  onTableExpand(expanded, record) {
    const { flatKeys = [] } = this.state;
    this.setState({
      flatKeys: expanded
        ? uniqBy(flatKeys.concat(record.indicatorId))
        : flatKeys.filter(o => o !== record.indicatorId),
    });
  }

  /**
   *  批量导入数据
   */
  @Bind()
  batchImport() {
    openTab({
      key: `/sslm/supplier-kpi-indicator/comment-import/SSLM.INDICATORS`,
      title: intl.get('hzero.common.title.batchImport').d('批量导入'),
      search: queryString.stringify({
        action: intl.get('hzero.common.title.batchImport').d('批量导入'),
      }),
    });
  }

  /**
   * 导出对应tab内容
   */
  @Bind()
  requestUrl() {
    const requestUrl = `${SRM_SSLM}/v1/${organizationId}/indicators/export`;
    return requestUrl;
  }

  // 获取导出参数
  @Bind
  handleParams() {
    if (!isUndefined(this.search)) {
      const { getFieldsValue = () => {} } = this.search.props.form;
      const params = filterNullValueObject(getFieldsValue());
      return params;
    }
  }

  /**
   * 指标类型值集查询
   */
  @Bind()
  selectType() {
    const { dispatch } = this.props;
    const lovCodes = {
      indicatorTypeMeaning: 'SSLM.KPI_INDICATOR_TYPE',
      matchRuleList: 'SSLM.KPI_IND_CONDITION',
      isVetoSelectList: 'HPFM.FLAG',
      tenantId: organizationId,
    };
    dispatch({
      type: 'supplierKpiIndicatorOrg/batchCode',
      payload: lovCodes,
    });
  }

  /**
   * fetchParamDefinition - 查询参数定义
   * @param {object} params - 查询条件
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  fetchParamDefinition(params = {}, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierKpiIndicatorOrg/queryParamDefinition',
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
      type: 'supplierKpiIndicatorOrg/saveParamDefinition',
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
      type: 'supplierKpiIndicatorOrg/queryParamConfig',
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
      type: 'supplierKpiIndicatorOrg/saveParamConfig',
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
      type: 'supplierKpiIndicatorOrg/deleteParamConfig',
      params,
    }).then(res => {
      if (res) {
        notification.success();
      }
      cb(res);
    });
  }

  /**
   * deleteIndicatorOpls - 删除选项配置行
   * @param {function} [cb = e => e] 操作成功回调函数
   */
  deleteIndicatorOpls(params, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierKpiIndicatorOrg/deleteIndicatorOpls',
      params,
    }).then(res => {
      if (res) {
        notification.success();
      }
      cb(res);
    });
  }

  /**
   * openOptionsConfig - 打开选项配置抽屉
   * @param {object} currentActionRowData - 当前操作行
   */
  openOptionsConfig(currentActionRowData) {
    this.setState({
      optionsConfigVisible: true,
      currentActionRowData,
    });
  }

  /**
   * openIndicationAssign - 打开细项权限抽屉
   * @param {Object} currentActionRowData - 当前行数据
   */
  @Bind()
  openIndicationAssign(currentActionRowData, isBatch = false) {
    this.setState({
      indicationAssignVisible: true,
      currentActionRowData,
      isBatch,
    });
  }

  /**
   * handleDelete - 删除评分模板回调
   * @param {Object} currentActionRowData - 当前行数据
   */
  @Bind()
  handleDelete(currentActionRowData) {
    const { dispatch } = this.props;
    const { getFieldsValue = () => {} } = (this.search || {}).props.form;
    const { pagination = {} } = this.state;
    dispatch({
      type: 'supplierKpiIndicatorOrg/handleDelete',
      params: currentActionRowData,
    }).then(res => {
      if (res) {
        this.fetchList({ ...getFieldsValue(), page: pagination });
        notification.success();
      }
    });
  }

  /**
   * handleUpdateScoringTemp - 更新至评分模板回调
   * @param {Object} currentActionRowData - 当前行数据
   */
  @Bind()
  handleUpdateScoringTemp(currentActionRowData) {
    const { dispatch } = this.props;
    let scoringTemps = '';
    let showModalFlag = false;
    const params = {
      indicatorId: currentActionRowData.indicatorId,
      tenantId: organizationId,
      indicatorCode: currentActionRowData.indicatorCode,
    };
    dispatch({
      type: 'supplierKpiIndicatorOrg/queryScoringTemp',
      params,
    })
      .then(res => {
        if (res) {
          const scoringTempsList = res.filter(e => e.evalTplName).map(e => e.evalTplName);
          scoringTemps = scoringTempsList.join(',');
          showModalFlag = res.length > 0;
        }
      })
      .finally(() => {
        if (showModalFlag) {
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: intl
              .get('spfm.supplierKpiIndicator.view.toolTipMessage', {
                name: scoringTemps,
              })
              .d(
                `将更新当前指标信息至使用该指标的评分模板【${scoringTemps}】，更新了指标信息的已发布状态的评分模板将变成”已更新“状态，确认更新吗？`
              ),
            onOk: () => {
              dispatch({
                type: 'supplierKpiIndicatorOrg/handleUpdateScoringTemp',
                params,
              }).then(res => {
                if (res) {
                  const { getFieldsValue = () => {} } = (this.search || {}).props.form;
                  notification.success();
                  this.fetchList(getFieldsValue());
                }
              });
            },
          });
        } else {
          notification.warning({
            placement: 'bottomRight',
            message: intl
              .get('spfm.supplierKpiIndicator.view.message.nonRenewableWarning')
              .d('该字段未被评分模板引用，不可更新'),
          });
        }
      });
  }

  /**
   *  批量更新至评分模版
   */
  @Bind()
  batchUpdateTemplate() {
    const { indicationSelectedRows } = this.state;
    const { dispatch } = this.props;
    let scoringTemps = '';
    let showModalFlag = false;
    const params = indicationSelectedRows;
    dispatch({
      type: 'supplierKpiIndicatorOrg/batchQueryScoringTemp',
      params,
    })
      .then(res => {
        if (res) {
          const scoringTempsList = res.filter(e => e.evalTplName).map(e => e.evalTplName);
          scoringTemps = scoringTempsList.join(',');
          showModalFlag = res.length > 0;
        }
      })
      .finally(() => {
        if (showModalFlag) {
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: intl
              .get('spfm.supplierKpiIndicator.view.toolTipMessage', {
                name: scoringTemps,
              })
              .d(
                `将更新当前指标信息至使用该指标的评分模板【${scoringTemps}】，更新了指标信息的已发布状态的评分模板将变成”已更新“状态，确认更新吗？`
              ),
            onOk: () => {
              dispatch({
                type: 'supplierKpiIndicatorOrg/batchHandleUpdateScoringTemp',
                params,
              }).then(res => {
                if (res) {
                  const { getFieldsValue = () => {} } = (this.search || {}).props.form;
                  this.setState({
                    indicationSelectedRows: [],
                    indicationSelectedRowKeys: [],
                  });
                  this.fetchList(getFieldsValue());
                  notification.success();
                }
              });
            },
          });
        } else {
          notification.warning({
            placement: 'bottomRight',
            message: intl
              .get('spfm.supplierKpiIndicator.view.message.nonRenewableWarning')
              .d('该字段未被评分模板引用，不可更新'),
          });
        }
      });
  }

  /**
   * 全部指标展开/收起
   */
  @Bind()
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
  @Bind()
  expandAll() {
    const { allRowKey } = this.state;
    this.setState({
      flatKeys: allRowKey,
    });
  }

  /**
   * 收起全部指标信息
   */
  @Bind()
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
      queryListTreeLoading,
      supplierKpiIndicatorOrg = {},
      queryIndicatorsListTreeLoading,
      saveIndicatorFmlsLoading,
      queryFormulaListOrgLoading,
      queryParamDefinitionLoading,
      queryOptionsListLoading,
      queryParamConfigLoading,
      deleteParamConfigLoading,
      saveIndicatorOplsLoading,
      deleteIndicatorOplsLoading,
      queryScoringTempLoading,
      handleDeleteTempLoading,
      batchQueryScoringTempLoading,
      handleUpdateScoringTempLoading,
      batchHandleUpdateScoringTempLoading,
      customizeBtnGroup,
      customizeTable,
      customizeForm,
      custLoading,
    } = this.props;
    const {
      dataSource = [],
      detailDrawerVisible,
      currentActionRowData,
      detailDrawerStatus,
      formulaDrawerVisible,
      currentEnabledOrDisabledRowkey,
      optionsConfigVisible,
      flatKeys = [],
      indicationAssignVisible,
      isBatch,
      indicationSelectedRows,
      indicationSelectedRowKeys,
      allRowExpand,
    } = this.state;
    const {
      code = {},
      indicatorTypeCode = [],
      matchRuleList = [],
      isVetoSelectList = [],
    } = supplierKpiIndicatorOrg;
    const searchProps = {
      indicatorTypeCode,
      wrappedComponentRef: node => {
        this.search = node;
      },
      fetchList: this.fetchList,
    };

    const allLoading =
      updateIndicatorLoading ||
      createIndicatorLoading ||
      saveIndicatorRefLoading ||
      queryFormulaListLoading ||
      queryListTreeLoading ||
      queryIndicatorsListTreeLoading ||
      saveIndicatorFmlsLoading ||
      queryFormulaListOrgLoading ||
      queryParamDefinitionLoading ||
      queryOptionsListLoading ||
      queryParamConfigLoading ||
      deleteParamConfigLoading ||
      saveIndicatorOplsLoading ||
      deleteIndicatorOplsLoading ||
      queryScoringTempLoading ||
      handleDeleteTempLoading ||
      batchQueryScoringTempLoading ||
      batchHandleUpdateScoringTempLoading ||
      handleUpdateScoringTempLoading;
    const listProps = {
      ref: node => {
        this.list = node;
      },
      custLoading,
      customizeTable,
      loading:
        queryListTreeLoading ||
        queryScoringTempLoading ||
        handleUpdateScoringTempLoading ||
        batchQueryScoringTempLoading ||
        batchHandleUpdateScoringTempLoading,
      onChange: this.onTableChange,
      pagination: false,
      dataSource,
      addChildIndicator: this.addChildIndicator,
      openIndicatorDetail: this.openIndicatorDetail,
      formulaConfig: this.openFormula,
      optionsConfig: this.openOptionsConfig,
      actionRowKey: currentEnabledOrDisabledRowkey,
      enable: this.enableIndicator,
      expandedRowKeys: flatKeys,
      onExpand: this.onTableExpand,
      openIndicationAssign: this.openIndicationAssign,
      handleUpdateScoringTemp: this.handleUpdateScoringTemp,
      handleDelete: this.handleDelete,
      rowSelection: {
        onChange: (newSelectedRowKeys, newSelectedRows) => {
          this.setState({
            indicationSelectedRows: newSelectedRows,
            indicationSelectedRowKeys: newSelectedRowKeys,
          });
        },
        selectedRowKeys: indicationSelectedRowKeys,
        selectedRows: indicationSelectedRows,
        // getCheckboxProps: record => {
        //   return { disabled: record.scoreType === 'SYSTEM' };
        // },
      },
    };
    const detailProps = {
      customizeForm,
      custLoading,
      indicatorTypeCode,
      isVetoSelectList,
      visible: detailDrawerVisible,
      close: this.closeDetail,
      dataSource: currentActionRowData,
      status: detailDrawerStatus,
      scoreTypeCode: code['SPFM.KPI_SCORE_TYPE'],
      dataSourceCode: code['SSLM.KPI_DATA_SOURCE'],
      createIndicator: this.createIndicator,
      updateIndicator: this.updateIndicator,
      fetchListTree: this.fetchListTree,
      saveIndicatorRef: this.saveIndicatorRef,
      fetchFormulaList: this.fetchFormulaListOrg,
      processing: {
        updateIndicatorLoading,
        createIndicatorLoading,
        saveIndicatorRefLoading,
        queryIndicatorsListTreeLoading,
        queryFormulaListOrgLoading,
      },
    };

    const formulaProps = {
      visible: formulaDrawerVisible,
      close: this.closeFormula,
      fetchFormulaList: this.fetchFormulaList,
      indicatorRowDataSource: currentActionRowData,
      processing: { queryFormulaListLoading, saveIndicatorFmlsLoading },
      matchRuleList,
      queryParamDefinitionLoading,
      queryParamConfigLoading,
      deleteParamConfigLoading,
      saveIndicatorFmls: this.saveIndicatorFmls,
      fetchParamDefinition: this.fetchParamDefinition,
      saveParamDefinition: this.saveParamDefinition,
      fetchParamConfig: this.fetchParamConfig,
      saveParamConfig: this.saveParamConfig,
      deleteParamConfig: this.deleteParamConfig,
    };

    const optionsProps = {
      visible: optionsConfigVisible,
      close: () => {
        this.setState({
          optionsConfigVisible: false,
          currentActionRowData: {},
        });
      },
      fetchOptionsList: this.fetchOptionsList,
      saveIndicatorOpls: this.saveIndicatorOpls,
      deleteIndicatorOpls: this.deleteIndicatorOpls,
      indicatorRowDataSource: currentActionRowData,
      processing: { queryOptionsListLoading, saveIndicatorOplsLoading, deleteIndicatorOplsLoading },
    };

    // 批量维护评分人按钮禁用标识
    const disEvalUserBtn =
      isEmpty(indicationSelectedRows) ||
      !isEmpty(indicationSelectedRows.filter(e => e.scoreType === 'SYSTEM'));
    // 批量更新至评分模板按钮禁用标识
    const disTemplateButn = isEmpty(indicationSelectedRows);

    const buttons = [
      {
        name: 'addParentNode',
        btnProps: {
          icon: 'plus',
          type: 'primary',
          onClick: () => this.addParentIndicator(),
          loading: allLoading,
        },
        child: intl.get('spfm.supplierKpiIndicator.view.button.addParentNode').d('新增顶级指标'),
      },
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/indicators/export`,
          queryParams: () => this.handleParams(),
          templateCode: 'SRM_C_SRM_SSLM_KPI_INDICATOR_EXPORT',
          buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
          otherButtonProps: {
            loading: allLoading,
            permissionList: [
              {
                code: 'srm.partner.evaluation-template.supplier-kpi-indicator.ps.list.export.new',
                type: 'button',
                meaning: '标准指标定义-导出',
              },
            ],
          },
        },
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
          businessObjectTemplateCode: 'SSLM.INDICATORS',
          prefixPatch: SRM_SSLM,
          refreshButton: true,
          successCallBack: () => {
            const { getFieldsValue = () => {} } = (this.search || {}).props.form;
            this.fetchList({ ...getFieldsValue() });
          },
          buttonProps: {
            loading: allLoading,
            permissionList: [
              {
                code: 'srm.partner.evaluation-template.supplier-kpi-indicator.ps.import.model',
                type: 'button',
                meaning: '标准指标定义-批量导入',
              },
            ],
          },
        },
        child: intl.get('hzero.common.title.batchImport').d('批量导入'),
      },
      {
        name: 'export',
        btnComp: ExcelExport,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/indicators/export`,
          queryParams: () => this.handleParams(),
          otherButtonProps: {
            loading: allLoading,
            type: 'c7n-pro',
            icon: 'unarchive',
            permissionList: [
              {
                code: 'srm.partner.evaluation-template.supplier-kpi-indicator.ps.list.export.old',
                type: 'button',
                meaning: '标准指标定义-导出',
              },
            ],
          },
        },
      },
      {
        name: 'batchImport',
        btnComp: PerButton,
        btnProps: {
          type: 'text',
          icon: 'archive',
          onClick: () => this.batchImport(),
          loading: allLoading,
          permissionList: [
            {
              code: 'srm.partner.evaluation-template.supplier-kpi-indicator.ps.import.old',
              type: 'button',
              meaning: '标准指标定义-批量导入',
            },
          ],
        },
        child: intl.get('hzero.common.button.import').d('导入'),
      },
      {
        name: 'maintainRatersInBatches',
        btnComp: PerButton,
        btnProps: {
          type: 'text',
          loading: allLoading,
          icon: 'edit',
          onClick: () => this.openIndicationAssign([], true),
          disabled: disEvalUserBtn,
          permissionList: [
            {
              code: 'srm.partner.evaluation-template.supplier-kpi-indicator.button.evalUser',
              type: 'button',
              meaning: '标准指标定义-批量维护评分人',
            },
          ],
        },
        child: intl
          .get('spfm.supplierKpiIndicator.view.button.maintainRatersInBatches')
          .d('批量维护评分人'),
      },
      {
        name: 'batchUpdateToScoringTemplate',
        btnProps: {
          type: 'c7n-pro',
          loading: allLoading,
          icon: 'edit',
          disabled: disTemplateButn,
          onClick: () => this.batchUpdateTemplate(),
        },
        child: intl
          .get('spfm.supplierKpiIndicator.view.button.batchUpdateToScoringTemplate')
          .d('批量更新至评分模板'),
      },
    ];

    const indicationAssignProps = {
      visible: indicationAssignVisible,
      indicatorRowDataSource: currentActionRowData,
      isBatch,
      customizeTable,
      tableCode: 'SSLM.KPI.INDICATOR.LIST.DETAIL_PERMISSION',
      onCancel: () => {
        this.setState({
          indicationAssignVisible: false,
          currentActionRowData: {},
          isBatch: false,
          indicationSelectedRows: [],
          indicationSelectedRowKeys: [],
        });
      },
      indicationSelectedRows,
    };

    return (
      <Fragment>
        <Header
          title={intl
            .get('spfm.supplierKpiIndicator.view.title.supplierKpiIndicator')
            .d('标准指标定义')}
        >
          {customizeBtnGroup(
            {
              // code: 'SSLM.KPI.INDICATOR.LIST.BTN_GROUP',
              code: '',
              pro: true,
            },
            <DynamicButtons buttons={buttons} maxNum={4} />
          )}
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        <Detail {...detailProps} />
        <Formula {...formulaProps} />
        <Options {...optionsProps} />
        {indicationAssignVisible && <IndicationAssign {...indicationAssignProps} />}
      </Fragment>
    );
  }
}
