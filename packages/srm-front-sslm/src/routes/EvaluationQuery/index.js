/**
 * EvaluationQuery - 考评结果查询
 * @date: 2018-12-29
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import moment from 'moment';
import { Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isUndefined, isEmpty, isObject, isString } from 'lodash';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import { Button as PermissionButton } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import CacheComponent from 'components/CacheComponent';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import ExcelExport from 'components/ExcelExport';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { SRM_SSLM } from '_utils/config';
import { downloadFile } from 'hzero-front/lib/services/api';
import ExcelExportPro from 'components/ExcelExportPro';
import ParamValueModal from '@/routes/ParamValueModal';
import remote from 'utils/remote';
import Search from './Search.js';
import List from './List.js';
import FilterForm from './FilterForm';
import TableList from './TableList';
import ScoreDetailModal from './Detail/ScoreDetailModal';
import ScorePartDetailModal from './Detail/ScorePartDetailModal';

/**
 * @export
 * @class Annual - 考评结果查询组件
 * @extends {Component} - React.Component
 * @reactProps {!Object} evaluationQuery - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e => e] -redux dispatch方法
 * @returns React.element
 */
@formatterCollections({
  code: ['sslm.query', 'sslm.evaluationQuery', 'sslm.common', 'sslm.supplierDocManage'],
})
@withCustomize({
  unitCode: [
    'SSLM.EVALUATION_QUERY_DETAIL.LIST',
    'SSLM.EVALUATION_QUERY_ARCHIVES.LIST_FILTER',
    'SSLM.EVALUATION_QUERY_DETAIL.LIST_FILTER',
    'SSLM.EVALUATION_QUERY_ARCHIVES.LIST',
    'SSLM.EVALUATION_QUERY_DETAIL.BTN_GROUP',
    'SSLM.EVALUATION_QUERY_ARCHIVES.BTN_GROUP',
    'SSLM.EVALUATION_QUERY_DETAIL.PARAM_VALUE_LIST',
  ],
})
@connect(({ evaluationQuery, evaluationDocManage, loading }) => ({
  evaluationQuery,
  evaluationDocManage,
  loading:
    loading.effects['evaluationQuery/fetchList'] ||
    loading.effects['evaluationQuery/handleExport'] ||
    loading.effects['evaluationQuery/fetchDetailList'] ||
    loading.effects['evaluationQuery/fetchScoreDetail'] ||
    loading.effects['evaluationDocManage/fetchEvaluationStatus'] ||
    loading.effects['evaluationQuery/handlePrint'],
  tenantId: getCurrentOrganizationId(),
}))
@CacheComponent({ cacheKey: '/sslm/evaluation-query/list' })
@remote({
  code: 'SSLM_EVALUATIONQUERY_DEFINITION', // 对应二开模块暴露的Expose的编码
  name: 'evaluationQueryRemote', // 默认 'remote'， 如有属性冲突可以改此属性
})
export default class EvaluationQuery extends Component {
  form;

  constructor(props) {
    const routerParams = querystring.parse(props.location.search.substr(1));
    const { defaultTabIndex } = routerParams;
    super(props);
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      detailSelectedRowKeys: [],
      detailSelectedRows: [],
      cachTabKey: defaultTabIndex || 'archives',
      scoreDetailVisible: false,
      scorePartDetailVisible: false,
      granular: '',
      granularityList: {},
      paramVauleVisible: false,
      detailCurrentRecord: {},
      remoteLoad: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'evaluationQuery/fetchLov' });
  }

  componentDidUpdate(prevProps) {
    const { custLoading: oldCustLoading } = prevProps;
    const {
      custLoading,
      evaluationQuery: { pagination, detailPagination },
    } = this.props;
    if (oldCustLoading !== custLoading) {
      this.handleSearch(pagination);
      this.handleDetailSearch(detailPagination);
    }
  }

  /**
   * 查询表单请求
   * @param {?Object} fields - 查询表单值对象
   * @param {boolean} needCleanSelect - 是否需要清空选择
   * @memberof Annual
   */
  @Bind()
  handleSearch(fields = {}, needCleanSelect = true) {
    const { tenantId, dispatch } = this.props;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const { supplierNameLov, ...others } = formValue;
      const values = {
        ...others,
        creationDateFrom:
          formValue.creationDateFrom && formValue.creationDateFrom.format(DATETIME_MIN),
        creationDateTo: formValue.creationDateTo && formValue.creationDateTo.format(DATETIME_MAX),
        evalDateFrom: formValue.evalDateFrom && formValue.evalDateFrom.format(DATETIME_MIN),
        evalDateTo: formValue.evalDateTo && formValue.evalDateTo.format(DATETIME_MAX),
      };
      filterValues = filterNullValueObject(values);
    }
    dispatch({
      type: 'evaluationQuery/fetchList',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        pageEntryPoint: 'CUSTOMER_OWNED',
        ...filterValues,
        customizeUnitCode:
          'SSLM.EVALUATION_QUERY_ARCHIVES.LIST_FILTER,SSLM.EVALUATION_QUERY_ARCHIVES.LIST',
      },
    });
    if (needCleanSelect) {
      this.setState({ selectedRowKeys: [] });
    }
  }

  /**
   * 查询表单请求-明细
   * @param {?Object} fields - 查询表单值对象
   * @param {boolean} needCleanSelect - 是否需要清空选择
   * @memberof Annual
   */
  @Bind()
  handleDetailSearch(fields = {}, needCleanSelect = true) {
    const { tenantId, dispatch, location } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { defaultTabIndex, ...defaultFilterValues } = routerParams;
    let filterValues = {};
    if (!isUndefined(this.detailForm)) {
      const formValue = this.detailForm.getFieldsValue();
      const { categoryName, itemName, categoryIds, itemIds, ...otherParams } = formValue;
      const values = {
        ...defaultFilterValues,
        ...otherParams,
        itemIds: itemIds?.split(','),
        categoryIds: categoryIds?.split(','),
        creationDateFrom:
          formValue.creationDateFrom && formValue.creationDateFrom.format(DATETIME_MIN),
        creationDateTo: formValue.creationDateTo && formValue.creationDateTo.format(DATETIME_MAX),
        evalDateFrom: formValue.evalDateFrom && formValue.evalDateFrom.format(DATETIME_MIN),
        evalDateTo: formValue.evalDateTo && formValue.evalDateTo.format(DATETIME_MAX),
      };
      filterValues = filterNullValueObject(values);
    }
    dispatch({
      type: 'evaluationQuery/fetchDetailList',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
        customizeUnitCode:
          'SSLM.EVALUATION_QUERY_DETAIL.LIST,SSLM.EVALUATION_QUERY_DETAIL.LIST_FILTER',
      },
    });
    if (needCleanSelect) {
      this.setState({ detailSelectedRowKeys: [], detailSelectedRows: [] });
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
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleOnRef(ref = {}) {
    this.detailForm = (ref.props || {}).form;
  }

  /**
   * @param {Object} record - 被点击查看详细的条目
   */
  @Bind()
  viewDetail(record = {}) {
    const { dispatch } = this.props;
    const { cachTabKey } = this.state;
    const { evalHeaderId, evalGranularity } = record;
    const search = querystring.stringify({
      evalGranularity,
      cachTabKey,
      evalHeaderId,
    });
    dispatch(
      routerRedux.push({
        pathname: `/sslm/evaluation-query/detail/${evalHeaderId}`,
        search,
      })
    );
  }

  /**
   * 查看评分明细
   *@param {Object} record - 被点击查看评分详情条目的数据
   */
  @Bind()
  handleScoreDetail(record = {}) {
    const { dispatch, tenantId } = this.props;
    const { evalTplId, evalLineId, evalGranularity } = record;
    dispatch({
      type: 'evaluationQuery/fetchScoreDetail',
      payload: {
        tenantId,
        evalTplId,
        evalLineId,
        customizeUnitCode: 'SSLM.EVALUATION_QUERY_DETAIL.RATING_DETAILS',
      },
    });
    this.setState({ scoreDetailVisible: true, granularityList: record, granular: evalGranularity });
  }

  /**
   * 控制评分明细弹框
   * @param {boolean} [visible=true] - 是否显示
   * @memberof Detail
   */
  @Bind()
  handleScoreDetailModal(visible = true) {
    this.setState({ scoreDetailVisible: visible });
  }

  /**
   * 对表格选择中的项进行操作
   * @param {Array} selectedRowKeys - table中被选中的行的键组成的数组
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
    const {
      dispatch,
      evaluationQuery: { dataSource },
    } = this.props;
    // 勾选行增加selectable属性，用于个性化获取勾选行
    const newList = dataSource.map(data => ({
      ...data,
      selectable: selectedRowKeys.includes(data.evalHeaderId),
    }));
    dispatch({
      type: 'evaluationQuery/updateState',
      payload: {
        dataSource: newList,
      },
    });
  }

  /**
   * 对表格选择中的项进行操作
   * @param {Array} selectedRowKeys - table中被选中的行的键组成的数组
   */
  @Bind()
  handleDetailRowSelectChange(selectedRowKeys, detailSelectedRows) {
    this.setState({
      detailSelectedRowKeys: selectedRowKeys,
      detailSelectedRows,
    });
  }

  // 按档案，选中项发生改变时的回调
  @Bind()
  handleArchivesSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * 切换tab注入key
   */
  @Bind()
  changeTabs(key) {
    this.setState({ cachTabKey: key });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleParams() {
    const { selectedRowKeys } = this.state;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const values = {
        ...formValue,
        creationDateFrom:
          formValue.creationDateFrom && formValue.creationDateFrom.format(DATETIME_MIN),
        creationDateTo: formValue.creationDateTo && formValue.creationDateTo.format(DATETIME_MAX),
        evalDateFrom: formValue.evalDateFrom && formValue.evalDateFrom.format(DATETIME_MIN),
        evalDateTo: formValue.evalDateTo && formValue.evalDateTo.format(DATETIME_MAX),
        chooseIds: String(selectedRowKeys),
      };
      filterValues = filterNullValueObject(values);
    }
    return filterValues;
  }

  @Bind()
  isJSON(str) {
    let result;
    try {
      result = JSON.parse(str);
    } catch (e) {
      return false;
    }
    return isObject(result) && !isString(result);
  }

  /**
   * 按档案导出
   */
  @Bind()
  handleExport() {
    const { dispatch } = this.props;
    const payload = this.handleParams();
    dispatch({
      type: 'evaluationQuery/handleExport',
      payload,
    }).then(res => {
      // 判断返回值是否报错信息，接口返回类型为responseType: 'text' 时，接口报错会绕过getRespone检验
      if (this.isJSON(res) && JSON.parse(res).failed) {
        notification.error({ description: JSON.parse(res).message });
      } else if (res) {
        downloadFile({ requestUrl: res });
      }
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleDetailParams() {
    const { detailSelectedRowKeys } = this.state;
    let filterValues = {};
    if (!isUndefined(this.detailForm)) {
      const formValue = this.detailForm.getFieldsValue();
      const values = {
        ...formValue,
        creationDateFrom:
          formValue.creationDateFrom && formValue.creationDateFrom.format(DATETIME_MIN),
        creationDateTo: formValue.creationDateTo && formValue.creationDateTo.format(DATETIME_MAX),
        evalDateFrom: formValue.evalDateFrom && formValue.evalDateFrom.format(DATETIME_MIN),
        evalDateTo: formValue.evalDateTo && formValue.evalDateTo.format(DATETIME_MAX),
        chooseIds: String(detailSelectedRowKeys),
      };
      filterValues = filterNullValueObject(values);
    }
    return filterValues;
  }

  /**
   * 打印功能
   * @author  余荣华
   * @date    2020-05-13 14:10
   */
  @Bind()
  handlePrint() {
    const { detailSelectedRowKeys } = this.state;
    if (detailSelectedRowKeys.length > 1) {
      notification.warning({
        description: intl
          .get(`sslm.evaluationQuery.view.message.noMoreThanOne`)
          .d('仅能勾选一条数据打印'),
      });
      return;
    }
    if (detailSelectedRowKeys.length === 0) {
      notification.warning({
        description: intl
          .get(`sslm.evaluationQuery.view.message.noLessThanOne`)
          .d('请勾选需要打印的数据'),
      });
      return;
    }
    const {
      dispatch,
      evaluationQuery: { detailList = {} },
    } = this.props;
    dispatch({
      type: 'evaluationQuery/handlePrint',
      payload: {
        kpiEvalLineId: detailSelectedRowKeys[0],
        tenantId: detailList[0].tenantId,
      },
    }).then(res => {
      if (res) {
        if (res.type.indexOf('application/json') > -1) {
          const reader = new FileReader();
          reader.onload = () => {
            const json = JSON.parse(reader.result);
            getResponse(json);
          };
          reader.readAsText(res, 'utf-8');
          return;
        }
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow) {
          printWindow.print();
        }
      }
    });
  }

  /**
   * 按档案查询 --- 打印功能
   */
  @Bind()
  handleArchivesPrint() {
    const { selectedRowKeys, selectedRows } = this.state;
    if (selectedRowKeys.length > 1) {
      notification.warning({
        description: intl
          .get(`sslm.evaluationQuery.view.message.noMoreThanOne`)
          .d('仅能勾选一条数据打印'),
      });
      return;
    }
    if (selectedRowKeys.length === 0) {
      notification.warning({
        description: intl
          .get(`sslm.evaluationQuery.view.message.noLessThanOne`)
          .d('请勾选需要打印的数据'),
      });
      return;
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationQuery/handleArchivesPrint',
      payload: {
        evalHeaderId: selectedRowKeys[0],
        tenantId: selectedRows[0].tenantId,
      },
    }).then(res => {
      if (res) {
        if (res.type.indexOf('application/json') > -1) {
          const reader = new FileReader();
          reader.onload = () => {
            const json = JSON.parse(reader.result);
            getResponse(json);
          };
          reader.readAsText(res, 'utf-8');
          return;
        }
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow) {
          printWindow.print();
        }
      }
    });
  }

  /**
   * 查看评分不同指标明细
   *@param {Object} record - 被点击查看评分详情条目的数据
   */
  @Bind()
  onScorePartDetail(record = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationDocManage/fetchEvaluationStatus',
      payload: { evalDtlId: record.evalDtlId },
    });
    this.setState({ scorePartDetailVisible: true, detailCurrentRecord: record });
  }

  /**
   * 控制评分不同指标明细弹框
   * @param {boolean} [visible=true] - 是否显示
   * @memberof Detail
   */
  @Bind()
  handlePartScoreDetailModal(visible = true) {
    this.setState({ scorePartDetailVisible: visible, detailCurrentRecord: {} });
  }

  /**
   * 打开 modal
   */
  @Bind()
  openParamVauleModal(record) {
    const { dispatch } = this.props;
    const { evalDtlId = '' } = record;
    dispatch({
      type: 'evaluationDocManage/queryEvaluationStatus',
      payload: {
        evalDtlId,
        page: {},
        customizeUnitCode: 'SSLM.EVALUATION_QUERY_DETAIL.PARAM_VALUE_LIST',
      },
    });
    this.setState({
      paramVauleVisible: true,
      detailCurrentRecord: record,
    });
  }

  /**
   * 关闭 modal
   */
  @Bind()
  closeParamVauleModal() {
    this.setState({
      paramVauleVisible: false,
      detailCurrentRecord: {},
    });
  }

  /**
   * 获取导出查询参数
   * @returns {Object}
   */
  @Bind()
  getExcelExportQueryParam() {
    if (!isUndefined(this.form)) {
      const fieldsValue = this.form.getFieldsValue() || {};
      if (fieldsValue.creationDateFrom) {
        fieldsValue.creationDateFrom = moment(fieldsValue.creationDateFrom).format(DATETIME_MIN);
      }
      if (fieldsValue.creationDateTo) {
        fieldsValue.creationDateTo = moment(fieldsValue.creationDateTo).format(DATETIME_MAX);
      }
      if (fieldsValue.evalDateFrom) {
        fieldsValue.evalDateFrom = moment(fieldsValue.evalDateFrom).format(DATETIME_MIN);
      }
      if (fieldsValue.evalDateTo) {
        fieldsValue.evalDateTo = moment(fieldsValue.evalDateTo).format(DATETIME_MAX);
      }
      return fieldsValue;
    }
    return {};
  }

  /**
   * 埋点loading
   */
  @Bind()
  setRemoteLoad(flag) {
    this.setState({
      remoteLoad: flag,
    });
  }

  /**
   * @returns React.element
   */
  render() {
    const {
      selectedRowKeys,
      detailSelectedRowKeys,
      detailSelectedRows,
      cachTabKey,
      scoreDetailVisible,
      scorePartDetailVisible,
      granularityList = {},
      granular,
      paramVauleVisible,
      detailCurrentRecord,
      remoteLoad,
      selectedRows,
    } = this.state;
    const {
      evaluationQuery: {
        dataSource,
        pagination,
        archiveStatus,
        levelValue = [],
        cycleValue = [],
        methodValue,
        detailList = [],
        detailPagination = {},
        scoreDetailList = [],
      },
      evaluationDocManage: { modalData = [], modalPagination = {} } = {},
      loading,
      tenantId,
      customizeTable,
      custLoading,
      customizeBtnGroup = () => {},
      customizeFilterForm,
      evaluationQueryRemote,
    } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { defaultTabIndex, ...defaultFilterValues } = routerParams;
    const allLoading = loading || custLoading;
    const searchProps = {
      tenantId,
      levelValue,
      archiveStatus,
      cycleValue,
      methodValue,
      customizeFilterForm,
      custLoading,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      customizeTable,
      custLoading,
      loading: allLoading,
      dataSource,
      viewDetail: this.viewDetail,
      pagination,
      methodValue,
      rowSelection: {
        selectedRowKeys,
        onChange: this.handleRowSelectChange,
      },
      onChange: page => this.handleSearch(page, false),
    };
    const filterProps = {
      tenantId,
      levelValue,
      archiveStatus,
      cycleValue,
      methodValue,
      customizeFilterForm,
      custLoading,
      defaultFilterValues,
      onSearch: this.handleDetailSearch,
      onRef: this.handleOnRef,
    };
    const tableProps = {
      customizeTable,
      custLoading,
      dataSource: detailList,
      pagination: detailPagination,
      loading: allLoading,
      viewDetail: this.viewDetail,
      onScoreDetail: this.handleScoreDetail,
      methodValue,
      rowSelection: {
        selectedRowKeys: detailSelectedRowKeys,
        selectedRows: detailSelectedRows,
        onChange: this.handleDetailRowSelectChange,
      },
      onChange: page => this.handleDetailSearch(page, false),
    };
    const scoreDetailModalProps = {
      evalGranularity: granular,
      checkDetailFlag: granularityList.checkDetailFlag,
      checkLevelFlag: granularityList.checkLevelFlag,
      weightedFlag: granularityList.weightedFlag,
      granularityList,
      scoreDetailList,
      loading: allLoading,
      visible: scoreDetailVisible,
      closeModal: this.handleScoreDetailModal,
      onScorePartDetail: this.onScorePartDetail,
      openParamVauleModal: this.openParamVauleModal,
    };
    const scorePartDetailModalProps = {
      modalData,
      modalPagination,
      docStatus: granularityList.evalStatus,
      loading: allLoading,
      visible: scorePartDetailVisible,
      lineCurrentRecord: detailCurrentRecord,
      closeModal: this.handlePartScoreDetailModal,
    };
    // 参数值查询弹窗
    const paramProps = {
      visible: paramVauleVisible,
      currentRecord: detailCurrentRecord,
      closeModal: this.closeParamVauleModal,
      customizeTable,
      customizeTableCode: 'SSLM.EVALUATION_QUERY_DETAIL.PARAM_VALUE_LIST',
      custLoading,
    };
    const resultListRemoteProps = {
      remoteLoad,
      selectedRows,
      getQueryParams: this.getExcelExportQueryParam,
      setRemoteLoad: this.setRemoteLoad,
      setSelectedRows: this.handleArchivesSelectChange,
    };
    const detailButtonsProps = {
      detailSelectedRows,
      setRemoteLoad: this.setRemoteLoad,
      setSelectedRows: this.handleDetailRowSelectChange,
    };

    return (
      <Fragment>
        <Header title={intl.get(`sslm.evaluationQuery.view.message.resultquery`).d('考评结果查询')}>
          {cachTabKey === 'archives' ? (
            <React.Fragment>
              {customizeBtnGroup({ code: 'SSLM.EVALUATION_QUERY_ARCHIVES.BTN_GROUP' }, [
                <ExcelExportPro
                  key="archivesExportPro"
                  data-name="exportPro"
                  requestUrl={`${SRM_SSLM}/v1/${tenantId}/eval-headers/result/purchase/export/new`}
                  queryParams={this.handleParams()}
                  templateCode="SRM_C_SRM_SSLM_KPI_EVAL_HEADER_HEADER_EXPORT"
                  buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
                  otherButtonProps={{
                    permissionList: [
                      {
                        code: 'srm.partner.evaluation-manage.result.ps.header.list.export.new',
                        type: 'button',
                        meaning: '考评结果按档案查询-新导出',
                      },
                    ],
                  }}
                />,
                <PermissionButton
                  key="archivesExport"
                  data-name="export"
                  icon="unarchive"
                  type="c7n-pro"
                  loading={allLoading}
                  onClick={this.handleExport}
                  permissionList={[
                    {
                      code: 'srm.partner.evaluation-manage.result.ps.header.list.export.old',
                      type: 'button',
                      meaning: '考评结果按档案查询-导出',
                    },
                  ]}
                >
                  {intl.get('hzero.common.button.export').d('导出')}
                </PermissionButton>,
                <PermissionButton
                  key="archivesPrinter"
                  data-name="printer"
                  icon="printer"
                  type="primary"
                  onClick={this.handleArchivesPrint}
                  loading={allLoading}
                  permissionList={[
                    {
                      code: 'srm.partner.evaluation-manage.result.button.list.print.old',
                      type: 'button',
                      meaning: '考评结果查询-按档案查询-打印',
                    },
                  ]}
                >
                  {intl.get('hzero.common.button.print').d('打印')}
                </PermissionButton>,
              ])}
              {evaluationQueryRemote &&
                evaluationQueryRemote.render('SSLM_EVALUATIONQUERY_LIST_HEADER_BUTTONS', <></>, {
                  resultListRemoteProps,
                })}
            </React.Fragment>
          ) : (
            <React.Fragment>
              {customizeBtnGroup({ code: 'SSLM.EVALUATION_QUERY_DETAIL.BTN_GROUP' }, [
                <ExcelExportPro
                  key="detailExportPro"
                  data-name="exportPro"
                  requestUrl={`${SRM_SSLM}/v1/${tenantId}/eval-headers/appraisal/result/export`}
                  queryParams={this.handleDetailParams()}
                  templateCode="SRM_C_SRM_SSLM_KPI_EVAL_HEADER_DETAILS_EXPORT"
                  buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
                  otherButtonProps={{
                    permissionList: [
                      {
                        code: 'srm.partner.evaluation-manage.result.ps.details.list.export.new',
                        type: 'button',
                        meaning: '考评结果明细查询-导出',
                      },
                    ],
                  }}
                />,
                <ExcelExport
                  key="detailExport"
                  data-name="export"
                  requestUrl={`${SRM_SSLM}/v1/${tenantId}/eval-headers/appraisal/result/export`}
                  otherButtonProps={{
                    icon: 'unarchive',
                    type: 'c7n-pro',
                    permissionList: [
                      {
                        code: 'srm.partner.evaluation-manage.result.ps.details.list.export.old',
                        type: 'button',
                        meaning: '考评结果明细查询-导出',
                      },
                    ],
                  }}
                  queryParams={this.handleDetailParams()}
                />,
                <PermissionButton
                  key="detailPrinter"
                  data-name="printer"
                  icon="printer"
                  type="primary"
                  onClick={this.handlePrint}
                  loading={allLoading}
                  permissionList={[
                    {
                      code: 'srm.partner.evaluation-manage.result.button.list.detail.print.old',
                      type: 'button',
                      meaning: '考评结果查询-按明细查询-打印',
                    },
                  ]}
                >
                  {intl.get('hzero.common.button.print').d('打印')}
                </PermissionButton>,
              ])}
              {evaluationQueryRemote &&
                evaluationQueryRemote.render(
                  'SSLM_EVALUATIONQUERY_DEFINITION.LIST_DETAIL_BUTTONS',
                  <></>,
                  detailButtonsProps
                )}
            </React.Fragment>
          )}
        </Header>
        <Content style={{ paddingTop: 0 }}>
          <Tabs activeKey={cachTabKey} onChange={this.changeTabs} animated={false}>
            <Tabs.TabPane
              forceRender
              tab={intl.get(`sslm.evaluationQuery.view.message.archivesQuery`).d('按档案查询')}
              key="archives"
            >
              <div className="table-list-search">
                <Search {...searchProps} />
              </div>
              <List {...listProps} />
            </Tabs.TabPane>
            <Tabs.TabPane
              forceRender
              tab={intl.get(`sslm.evaluationQuery.view.message.detailQuery`).d('按明细查询')}
              key="detail"
            >
              <div className="table-list-search">
                <FilterForm {...filterProps} />
              </div>
              <TableList {...tableProps} />
            </Tabs.TabPane>
          </Tabs>
          <ScoreDetailModal {...scoreDetailModalProps} />
          <ScorePartDetailModal {...scorePartDetailModalProps} />
        </Content>
        <ParamValueModal {...paramProps} />
      </Fragment>
    );
  }
}
