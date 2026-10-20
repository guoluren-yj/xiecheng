/**
 * RiskAssessmentList -风险评估 列表页
 * @date: 2019-12-4
 * @author guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import { Tabs, Popover, Icon } from 'hzero-ui';
import { connect } from 'dva';
import classnames from 'classnames';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { stringify } from 'querystring';
import intl from 'utils/intl';
import moment from 'moment';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  delItemsToPagination,
  createPagination,
  getEditTableData,
  getCurrentUser,
} from 'utils/utils';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT, DATETIME_MIN } from 'utils/constants';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import CommonImport from 'hzero-front/lib/components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { SRM_SPRM } from '_utils/config';
import { isArray, isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';
import OperationRecord from '@/routes/components/OperationRecord/OperationRecordCopy';
import { Button as PermissionButton } from 'components/Permission';
import { queryPermissions } from '@/services/demandForecastService';
import { getCustomizeData } from '@/services/quotePurchaseRequisitionService';

import ProjectForecast from './ProjectForecast';
import AnnualForecast from './AnnualForecast';
import MonthlyForecast from './MonthlyForecast';
import WeekForecast from './WeekForecast';
import styles from './index.less';

const { TabPane } = Tabs;

const { organizationId: supplierTenantId } = getCurrentUser();

const organizationId = getCurrentOrganizationId();
const promptCode = 'sodr.demandForecast';

@withCustomize({
  unitCode: [
    'SPRM.PREDICTION_ORDER_FEEDBACK.TAB',
    'SPRM.PREDICTION_ORDER_FEEDBACK.MONTH_BACK_LIST',
    'SPRM.PREDICTION_ORDER_FEEDBACK.PROJECT_LIST',
    'SPRM.PREDICTION_ORDER_FEEDBACK.YEAR_LIST',
    'SPRM.PREDICTION_ORDER_FEEDBACK.WEEK_BACK_LIST',
    'SPRM.PREDICTION_ORDER_FEEDBACK.BTN',
  ],
})
@connect(({ loading = {}, demandForecastFeedback = {} }) => ({
  fetchListLoading: loading.effects['demandForecastFeedback/fetchList'],
  fetchFeedbackLoading: loading.effects['demandForecastFeedback/fetchFeedback'],
  fetchSupplySaveLoading: loading.effects['demandForecastFeedback/fetchSupplySave'],
  fetchOperationRecordListLoading:
    loading.effects['demandForecastFeedback/fetchOperationRecordList'],
  annualForecast: demandForecastFeedback.annualForecast,
  monthlyForecast: demandForecastFeedback.monthlyForecast,
  weekForecast: demandForecastFeedback.weekForecast,
  projectForecast: demandForecastFeedback.projectForecast,
  enumMap: demandForecastFeedback.enumMap,
  demandForecastFeedback,
}))
@formatterCollections({
  code: [
    'sqam.demandForecast',
    'hzero.common',
    'sqam.common',
    'entity.organization',
    'entity.attachment',
    'entity.company',
    'entity.customerCompany',
    'entity.business',
    'entity.item',
    'entity.roles',
    'sqam.incomingInspectionQuery',
    'sodr.common',
    'entity.supplier',
    'sprm.purchaseRequisitionApproval',
    'sodr.demandForecast',
    'sprm.common',
  ],
})
export default class extends React.Component {
  form;

  editArr = new Set();

  state = {
    annualForecastSelectedRowKeys: [],
    annualForecastSelectedRows: [],
    monthlyForecastSelectedRowKeys: [],
    monthlyForecastSelectedRows: [],
    weekForecastSelectedRows: [],
    weekForecastSelectedRowKeys: [],
    projectForecastSelectedRowKeys: [],
    projectForecastSelectedRows: [],
    activeKey: 'annualForecast',
    operationRecordList: [],
    operationRecordPagination: {},
    btnPermissions: {},
    currentTemplateCode: '',
  };

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'demandForecastFeedback/updateState',
      payload: {
        annualForecast: { list: [], pagination: {} },
        monthlyForecast: { list: [], pagination: {} },
        weekForecast: { list: [], pagination: {} },
        projectForecast: { list: [], pagination: {} },
        selectedKeys: {},
      },
    });
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'demandForecastFeedback/fetchEnum',
    });

    // 获取默认的tab拿到默认activeKey
    Promise.all([getCustomizeData(['SPRM.PREDICTION_ORDER_FEEDBACK.TAB'])]).then((res) => {
      if (res && isArray(res) && !isEmpty(res) && res[0]) {
        const custConfigDefaultActive = res[0]['SPRM.PREDICTION_ORDER_FEEDBACK.TAB']?.fields.filter(
          (item) => item.defaultActive === 1
        )?.[0]?.fieldCode;
        if (custConfigDefaultActive) {
          this.setState({ activeKey: custConfigDefaultActive });
        }
        this.getBtnPermissions();
      }
    });
  }

  getBtnPermissions = () => {
    const { activeKey } = this.state;
    let templateCode = '';
    let exportCode = '';
    let newExportCode = '';

    switch (activeKey) {
      case 'annualForecast':
        templateCode = 'SPRM_DEMAND_YEAR_FORECAST_EXPORT';
        exportCode =
          'hzero.srm.requirement.sale.forecast.demand-forecast-feedback.ps.year.list.export';
        newExportCode =
          'hzero.srm.requirement.sale.forecast.demand-forecast-feedback.ps.new.year.list.export';
        break;
      case 'monthlyForecast':
        templateCode = 'SPRM_DEMAND_MONTH_FORECAST_EXPORT';
        exportCode =
          'hzero.srm.requirement.sale.forecast.demand-forecast-feedback.ps.month.list.export';
        newExportCode =
          'hzero.srm.requirement.sale.forecast.demand-forecast-feedback.ps.new.month.list.export';
        break;
      case 'weekForecast':
        templateCode = 'SPRM_DEMAND_WEEK_FORECAST_EXPORT';
        exportCode =
          'hzero.srm.requirement.sale.forecast.demand-forecast-feedback.ps.week.list.export';
        newExportCode =
          'hzero.srm.requirement.sale.forecast.demand-forecast-feedback.ps.new.week.list.export';
        break;
      default:
        templateCode = 'SPRM_DEMAND_PROJECT_FORECAST_EXPORT';
        exportCode =
          'hzero.srm.requirement.sale.forecast.demand-forecast-feedback.ps.project.list.export';
        newExportCode =
          'hzero.srm.requirement.sale.forecast.demand-forecast-feedback.ps.new.project.list.export';
        break;
    }

    const codeList = [exportCode, newExportCode];

    queryPermissions(codeList).then((res) => {
      if (res && !res.failed) {
        const btnPermissions = {};
        res.forEach((item) => {
          if (item.code === exportCode) {
            btnPermissions.export = item;
          } else if (item.code === newExportCode) {
            btnPermissions.newExport = item;
          }
        });
        this.setState({ btnPermissions, currentTemplateCode: templateCode });
      }
    });
  };

  /**
   * 添加editArr
   * @param {number} id
   */
  @Bind()
  addEditArr(record) {
    const { _status, forecastId } = record;
    if (_status === 'update') {
      this.editArr.add(forecastId);
    }
  }

  /**
   * 清除editArr
   */
  @Bind()
  clearEditArr() {
    this.editArr.clear();
  }

  /**
   * FilterForm绑定到这里
   */
  @Bind()
  bindForm(form, flag) {
    if (flag === 'monthlyForecast') {
      this.monthlyForecastForm = form;
    } else if (flag === 'projectForecast') {
      this.projectForecastForm = form;
    } else if (flag === 'weekForecast') {
      this.weekForecastForm = form;
    } else {
      this.annualForecastForm = form;
    }
  }

  /**
   * fetchlist
   */
  @Bind()
  fetchAnnualForecastList(page = {}) {
    const { dispatch, annualForecast = {} } = this.props;
    const { pagination = {} } = annualForecast;
    const formValues = this.annualForecastForm ? this.annualForecastForm.getFieldsValue() : {};
    const forecastYear = formValues.forecastYear
      ? formValues.forecastYear.format(DEFAULT_DATE_FORMAT)
      : null;
    const searchCondition = filterNullValueObject({
      ...formValues,
      forecastYear,
    });
    dispatch({
      type: 'demandForecastFeedback/fetchList',
      payload: {
        page: { ...pagination, ...page },
        ...searchCondition,
        forecastType: 'YEAR',
        flag: 'annualForecast',
        supplierTenantId,
        customizeUnitCode: 'SPRM.PREDICTION_ORDER_FEEDBACK.YEAR_LIST',
      },
    }).then((res) => {
      if (res) {
        this.clearEditArr();
        this.setState({
          activeKey: 'annualForecast',
          annualForecastSelectedRowKeys: [],
          annualForecastSelectedRows: [],
        });
      }
    });
  }

  /**
   * fetchMonthlyForecastList
   */
  @Bind()
  fetchMonthlyForecastList(page = {}) {
    const { dispatch, monthlyForecast = {} } = this.props;
    const { pagination = {} } = monthlyForecast;
    const formValues = this.monthlyForecastForm ? this.monthlyForecastForm.getFieldsValue() : {};
    const forecastMonthFrom = formValues.forecastMonthFrom
      ? formValues.forecastMonthFrom.format(DEFAULT_DATE_FORMAT)
      : null;
    const searchCondition = filterNullValueObject({
      ...formValues,
      forecastMonthFrom,
    });
    dispatch({
      type: 'demandForecastFeedback/fetchList',
      payload: {
        page: { ...pagination, ...page },
        ...searchCondition,
        forecastType: 'MONTH',
        flag: 'monthlyForecast',
        supplierTenantId,
        customizeUnitCode: 'SPRM.PREDICTION_ORDER_FEEDBACK.MONTH_BACK_LIST',
      },
    }).then((res) => {
      if (res) {
        this.clearEditArr();
        this.setState({
          activeKey: 'monthlyForecast',
          monthlyForecastSelectedRowKeys: [],
          monthlyForecastSelectedRows: [],
        });
      }
    });
  }

  /**
   * fetchWeekForecastList
   */
  @Bind()
  fetchWeekForecastList(page = {}) {
    const { dispatch, weekForecast = {} } = this.props;
    const { pagination = {} } = weekForecast;
    const formValues = this.weekForecastForm ? this.weekForecastForm.getFieldsValue() : {};
    const weekForecastDateFrom = formValues.weekForecastDateFrom
      ? formValues.weekForecastDateFrom.format(DATETIME_MIN)
      : null;
    const searchCondition = filterNullValueObject({
      ...formValues,
      supplierTenantId,
      weekForecastDateFrom,
    });
    dispatch({
      type: 'demandForecastFeedback/fetchList',
      payload: {
        page: { ...pagination, ...page },
        ...searchCondition,
        forecastType: 'WEEK',
        flag: 'weekForecast',
        customizeUnitCode: 'SPRM.PREDICTION_ORDER_FEEDBACK.WEEK_BACK_LIST',
      },
    }).then((res) => {
      if (res) {
        this.clearEditArr();
        this.setState({
          activeKey: 'weekForecast',
          weekForecastSelectedRowKeys: [],
          weekForecastSelectedRows: [],
        });
      }
    });
  }

  /**
   * fetchProjectForecastList
   */
  @Bind()
  fetchProjectForecastList(page = {}) {
    const { dispatch, projectForecast = {} } = this.props;
    const { pagination = {} } = projectForecast;
    const formValues = this.projectForecastForm ? this.projectForecastForm.getFieldsValue() : {};
    const estimatedDeliveryDate = formValues.estimatedDeliveryDate
      ? formValues.estimatedDeliveryDate.format(DEFAULT_DATETIME_FORMAT)
      : null;
    const searchCondition = filterNullValueObject({
      ...formValues,
      estimatedDeliveryDate,
    });
    dispatch({
      type: 'demandForecastFeedback/fetchList',
      payload: {
        page: { ...pagination, ...page },
        ...searchCondition,
        forecastType: 'PROJECT',
        flag: 'projectForecast',
        supplierTenantId,
        customizeUnitCode: 'SPRM.PREDICTION_ORDER_FEEDBACK.PROJECT_LIST',
      },
    }).then((res) => {
      if (res) {
        this.clearEditArr();
        this.setState({
          activeKey: 'projectForecast',
          projectForecastSelectedRowKeys: [],
          projectForecastSelectedRows: [],
        });
      }
    });
  }

  @Bind()
  handleRowSelectChange(json = {}) {
    this.setState(json);
    const { dispatch } = this.props;
    dispatch({
      type: 'demandForecastFeedback/updateState',
      payload: { selectedKeys: { ...json } },
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    const { dispatch } = this.props;
    const { activeKey } = this.state;
    dispatch({ type: 'demandForecastFeedback/addRow', payload: { flag: activeKey } });
  }

  /**
   * 保存
   */
  /**
   * 反馈
   */
  @Bind()
  handleSave() {
    const { activeKey } = this.state;
    const { [`${activeKey}SelectedRows`]: list } = this.state;
    const { dispatch } = this.props;
    let data = getEditTableData(list, ['_status']);
    data = data.map((item) => {
      const { supplierConfirmDelivery } = item;
      let mItem = item;
      if (supplierConfirmDelivery) {
        mItem = {
          ...item,
          supplierConfirmDelivery: moment(supplierConfirmDelivery)?.format(DEFAULT_DATETIME_FORMAT),
        };
      }
      return mItem;
    });
    if (data.length > 0) {
      dispatch({
        type: 'demandForecastFeedback/fetchSupplySave',
        payload: {
          data,
          customizeUnitCode:
            activeKey === 'monthlyForecast'
              ? 'SPRM.PREDICTION_ORDER_FEEDBACK.MONTH_BACK_LIST'
              : activeKey === 'weekForecast'
                ? 'SPRM.PREDICTION_ORDER_FEEDBACK.WEEK_BACK_LIST'
                : null,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          switch (activeKey) {
            case 'annualForecast':
              this.setState({ annualForecastSelectedRowKeys: [], annualForecastSelectedRows: [] });
              this.fetchAnnualForecastList();
              break;
            case 'monthlyForecast':
              this.setState({
                monthlyForecastSelectedRowKeys: [],
                monthlyForecastSelectedRows: [],
              });
              this.fetchMonthlyForecastList();
              break;
            case 'weekForecast':
              this.setState({
                weekForecastSelectedRowKeys: [],
                weekForecastSelectedRows: [],
              });
              this.fetchWeekForecastList();
              break;
            case 'projectForecast':
              this.setState({
                projectForecastSelectedRowKeys: [],
                projectForecastSelectedRows: [],
              });
              this.fetchProjectForecastList();
              break;
            default:
              break;
          }
        }
      });
    }
  }

  /**
   * 反馈
   */
  @Bind()
  handleFeedback() {
    const { activeKey } = this.state;
    const { [`${activeKey}SelectedRows`]: list } = this.state;
    const { dispatch } = this.props;
    let data = getEditTableData(list, ['_status']);
    data = data.map((item) => {
      const { supplierConfirmDelivery } = item;
      let mItem = item;
      if (supplierConfirmDelivery) {
        mItem = {
          ...item,
          supplierConfirmDelivery: moment(supplierConfirmDelivery)?.format(DEFAULT_DATETIME_FORMAT),
        };
      }
      return mItem;
    });
    const customizeUnitCodeList = {
      annualForecast: 'SPRM.PREDICTION_ORDER_FEEDBACK.YEAR_LIST',
      monthlyForecast: 'SPRM.PREDICTION_ORDER_FEEDBACK.MONTH_BACK_LIST',
      weekForecast: 'SPRM.PREDICTION_ORDER_FEEDBACK.WEEK_BACK_LIST',
      projectForecast: 'SPRM.PREDICTION_ORDER_FEEDBACK.PROJECT_LIST',
    };
    if (data.length > 0) {
      dispatch({
        type: 'demandForecastFeedback/fetchFeedback',
        payload: {
          data,
          customizeUnitCode: customizeUnitCodeList[activeKey] || null,
        },
      }).then((res) => {
        if (res) {
          const errrorList = isArray(res) ? (res || [])?.map((e) => e.encryptRowKey) : [];
          if (errrorList.length > 0) {
            const msg = list.filter((e) => errrorList.includes(e.forecastId));
            const allError = msg.map((e) => {
              const err = res.find((i) => i?.encryptRowKey === e.forecastId) || {};
              return (
                <p>
                  {intl
                    .get('sprm.common.demandForecast.monthError', {
                      companyName: e.companyName || '',
                      invOrganizationName: e.invOrganizationName || '',
                      itemCode: e.itemCode || '',
                      forecastYear: e.forecastYear || '',
                      errors: err?.message || '',
                    })
                    .d(
                      `公司为【${e.companyName}】、库存组织为【${e.invOrganizationName}】、物料编码为【${e.itemCode}】、预测起始时间为【${e.forecastYear}】的预测单反馈失败，具体报错信息为：${err.message}，请刷新页面后重试。`
                    )}
                </p>
              );
            });
            notification.error({ message: allError });
          } else {
            notification.success();
            switch (activeKey) {
              case 'annualForecast':
                this.setState({
                  annualForecastSelectedRowKeys: [],
                  annualForecastSelectedRows: [],
                });
                this.fetchAnnualForecastList();
                break;
              case 'monthlyForecast':
                this.setState({
                  monthlyForecastSelectedRowKeys: [],
                  monthlyForecastSelectedRows: [],
                });
                this.fetchMonthlyForecastList();
                break;
              case 'weekForecast':
                this.setState({
                  weekForecastSelectedRowKeys: [],
                  weekForecastSelectedRows: [],
                });
                this.fetchWeekForecastList();
                break;
              case 'projectForecast':
                this.setState({
                  projectForecastSelectedRowKeys: [],
                  projectForecastSelectedRows: [],
                });
                this.fetchProjectForecastList();
                break;
              default:
                break;
            }
          }
        }
      });
    }
  }

  /**
   * setModelValue
   */
  @Bind()
  setModelValue(params, key) {
    const { dispatch, [key]: dataS } = this.props;
    const { list = [], pagination = {} } = dataS;
    const data = list.map((item) => {
      if (item.forecastId === params.forecastId) {
        return { ...item, ...params };
      }
      return item;
    });
    dispatch({
      type: 'demandForecastFeedback/updateState',
      payload: { [key]: { list: data, pagination } },
    });
  }

  @Bind()
  handleDelete() {
    const {
      activeKey,
      annualForecastSelectedRowKeys = [],
      monthlyForecastSelectedRowKeys = [],
      projectForecastSelectedRowKeys = [],
      weekForecastSelectedRowKeys = [],
    } = this.state;
    const selectedRowKeys =
      activeKey === 'annualForecast'
        ? annualForecastSelectedRowKeys
        : activeKey === 'monthlyForecast'
          ? monthlyForecastSelectedRowKeys
          : activeKey === 'weekForecast'
            ? weekForecastSelectedRowKeys
            : projectForecastSelectedRowKeys;
    const { dispatch, [activeKey]: dataS } = this.props;
    const { list = [], pagination = {} } = dataS;
    const data = list.filter((item) => !selectedRowKeys.includes(item.forecastId));
    dispatch({
      type: 'demandForecastFeedback/updateState',
      payload: {
        [activeKey]: {
          list: data,
          pagination: delItemsToPagination(selectedRowKeys.length, data.length, pagination),
        },
      },
    });
  }

  /**
   * 导出对应tab内容
   */
  @Bind()
  requestUrl() {
    const { activeKey } = this.state;
    switch (activeKey) {
      case 'annualForecast':
        return `${SRM_SPRM}/v1/${organizationId}/year-supplier/export`;
      case 'monthlyForecast':
        return `${SRM_SPRM}/v1/${organizationId}/month-supplier/export`;
      case 'weekForecast':
        return `${SRM_SPRM}/v1/${organizationId}/week-supplier/export`;
      case 'projectForecast':
        return `${SRM_SPRM}/v1/${organizationId}/project-supplier/export`;
      default:
        return null;
    }
  }

  /**
   * 导出对应tab内容的params
   */
  @Bind()
  queryParams(flag) {
    const {
      activeKey,
      annualForecastSelectedRowKeys,
      monthlyForecastSelectedRowKeys,
      projectForecastSelectedRowKeys,
      weekForecastSelectedRowKeys,
    } = this.state;
    let searchCondition = null;
    let formValues = null;
    switch (activeKey) {
      case 'annualForecast': {
        formValues = this.annualForecastForm ? this.annualForecastForm.getFieldsValue() : {};
        const forecastYear = formValues.forecastYear
          ? formValues.forecastYear.format(DEFAULT_DATE_FORMAT)
          : null;
        searchCondition = filterNullValueObject({
          ...formValues,
          supplierTenantId,
          forecastYear,
        });
        return !flag
          ? { forecastType: 'YEAR', ...searchCondition }
          : {
            forecastType: 'YEAR',
            forecastIds: annualForecastSelectedRowKeys,
            ...searchCondition,
          };
      }
      case 'monthlyForecast': {
        formValues = this.monthlyForecastForm ? this.monthlyForecastForm.getFieldsValue() : {};
        const forecastMonthFrom = formValues.forecastMonthFrom
          ? formValues.forecastMonthFrom.format(DEFAULT_DATE_FORMAT)
          : null;
        searchCondition = filterNullValueObject({
          ...formValues,
          supplierTenantId,
          forecastMonthFrom,
        });
        return !flag
          ? { forecastType: 'MONTH', ...searchCondition }
          : {
            forecastType: 'MONTH',
            forecastIds: monthlyForecastSelectedRowKeys,
            ...searchCondition,
          };
      }
      case 'weekForecast': {
        formValues = this.weekForecastForm ? this.weekForecastForm.getFieldsValue() : {};
        const forecastMonthFrom = formValues.forecastMonthFrom
          ? formValues.forecastMonthFrom.format(DEFAULT_DATE_FORMAT)
          : null;
        const forecastMonthTo = formValues.forecastMonthTo
          ? formValues.forecastMonthTo.format(DEFAULT_DATE_FORMAT)
          : null;
        searchCondition = filterNullValueObject({
          ...formValues,
          forecastMonthFrom,
          forecastMonthTo,
          supplierTenantId,
          flag: 'weekForecast',
        });
        return !flag
          ? { forecastType: 'WEEK', ...searchCondition }
          : {
            forecastType: 'WEEK',
            forecastIds: weekForecastSelectedRowKeys,
            ...searchCondition,
          };
      }
      case 'projectForecast': {
        formValues = this.projectForecastForm ? this.projectForecastForm.getFieldsValue() : {};
        const estimatedDeliveryDate = formValues.estimatedDeliveryDate
          ? formValues.estimatedDeliveryDate.format(DEFAULT_DATETIME_FORMAT)
          : null;
        searchCondition = filterNullValueObject({
          ...formValues,
          supplierTenantId,
          estimatedDeliveryDate,
        });
        return !flag
          ? { forecastType: 'PROJECT', ...searchCondition }
          : {
            forecastType: 'PROJECT',
            forecastIds: projectForecastSelectedRowKeys,
            ...searchCondition,
          };
      }
      default:
        return null;
    }
  }

  /**
   * 删除按钮的Disabled
   */
  @Bind()
  deleteDisabled(flag) {
    const {
      activeKey,
      annualForecastSelectedRows,
      monthlyForecastSelectedRows,
      projectForecastSelectedRows,
      weekForecastSelectedRows,
    } = this.state;
    switch (activeKey) {
      case 'annualForecast':
        return flag
          ? !annualForecastSelectedRows.length > 0 ||
          annualForecastSelectedRows.filter((item) => item._status === 'create').length > 0
          : !annualForecastSelectedRows.length > 0 ||
          annualForecastSelectedRows.filter((item) => item._status === 'update').length > 0;
      case 'monthlyForecast':
        return flag
          ? !monthlyForecastSelectedRows.length > 0 ||
          monthlyForecastSelectedRows.filter((item) => item._status === 'create').length > 0
          : !monthlyForecastSelectedRows.length > 0 ||
          monthlyForecastSelectedRows.filter((item) => item._status === 'update').length > 0;
      case 'weekForecast':
        return flag
          ? !weekForecastSelectedRows.length > 0 ||
          weekForecastSelectedRows.filter((item) => item._status === 'create').length > 0
          : !weekForecastSelectedRows.length > 0 ||
          weekForecastSelectedRows.filter((item) => item._status === 'update').length > 0;
      case 'projectForecast':
        return flag
          ? !projectForecastSelectedRows.length > 0 ||
          projectForecastSelectedRows.filter((item) => item._status === 'create').length > 0
          : !projectForecastSelectedRows.length > 0 ||
          projectForecastSelectedRows.filter((item) => item._status === 'update').length > 0;
      default:
        return true;
    }
  }

  @Bind()
  feedbackDisabled() {
    const {
      activeKey,
      annualForecastSelectedRows,
      monthlyForecastSelectedRows,
      projectForecastSelectedRows,
      weekForecastSelectedRows,
    } = this.state;
    switch (activeKey) {
      case 'annualForecast':
        return (
          annualForecastSelectedRows.filter(
            (item) => item.forecastStatus === 'FEEDBACK' || item.forecastStatus === 'CLOSED'
          ).length > 0 || annualForecastSelectedRows.length <= 0
        );
      case 'monthlyForecast':
        return (
          monthlyForecastSelectedRows.filter(
            (item) => item.forecastStatus === 'FEEDBACK' || item.forecastStatus === 'CLOSED'
          ).length > 0 || monthlyForecastSelectedRows.length <= 0
        );
      case 'weekForecast':
        return (
          weekForecastSelectedRows.filter(
            (item) => item.forecastStatus === 'FEEDBACK' || item.forecastStatus === 'CLOSED'
          ).length > 0 || weekForecastSelectedRows.length <= 0
        );
      case 'projectForecast':
        return (
          projectForecastSelectedRows.filter(
            (item) => item.forecastStatus === 'FEEDBACK' || item.forecastStatus === 'CLOSED'
          ).length > 0 || projectForecastSelectedRows.length <= 0
        );
      default:
        return true;
    }
  }

  @Bind()
  saveButtonDisabled() {
    const { activeKey } = this.state;
    const {
      projectForecastSelectedRows,
      monthlyForecastSelectedRows,
      annualForecastSelectedRows,
      weekForecastSelectedRows,
    } = this.state;
    switch (activeKey) {
      case 'annualForecast':
        return (
          annualForecastSelectedRows.filter(
            (item) => item.forecastStatus === 'FEEDBACK' || item.forecastStatus === 'CLOSED'
          ).length > 0 || annualForecastSelectedRows.length <= 0
        );
      case 'monthlyForecast':
        return (
          monthlyForecastSelectedRows.filter(
            (item) => item.forecastStatus === 'FEEDBACK' || item.forecastStatus === 'CLOSED'
          ).length > 0 || monthlyForecastSelectedRows.length <= 0
        );
      case 'weekForecast':
        return (
          weekForecastSelectedRows.filter(
            (item) => item.forecastStatus === 'FEEDBACK' || item.forecastStatus === 'CLOSED'
          ).length > 0 || weekForecastSelectedRows.length <= 0
        );
      case 'projectForecast':
        return (
          projectForecastSelectedRows.filter(
            (item) => item.forecastStatus === 'FEEDBACK' || item.forecastStatus === 'CLOSED'
          ).length > 0 || projectForecastSelectedRows.length <= 0
        );
      default:
        return true;
    }
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { forecastId } = this.state;
    dispatch({
      type: 'demandForecastFeedback/fetchOperationRecordList',
      payload: {
        forecastId,
        page,
      },
    }).then((result) => {
      if (result) {
        this.setState({
          operationRecordList: result.content,
          operationRecordPagination: createPagination(result),
        });
      }
    });
  }

  @Bind()
  handleModalVisible(flag, val) {
    this.setState({ [flag]: val });
  }

  @Bind()
  handleShowRecordModal(record) {
    const { forecastId } = record;
    this.setState({ forecastId }, () => {
      this.handleModalVisible('operationRecordModalVisible', true);
    });
  }

  /**
   * 到导入页面
   */
  @Bind()
  handleImport() {
    const { activeKey } = this.state;
    let code = '';
    switch (activeKey) {
      case 'weekForecast':
        code = 'SPRM.FORECAST_WEEK_SUPPLY';
        break;
      case 'annualForecast':
        code = 'SPRM.FORECAST_MONTH_SUPPLY';
        break;
      case 'monthlyForecast':
        code = 'SPRM.FORECAST_MONTH_SUPPLY';
        break;
      case 'projectForecast':
      default:
        break;
    }
    const option = {
      pathname: `/sodr/demand-forecast-feedback/data-import/${code}`,
      search: stringify({
        action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        backPath: `/sodr/demand-forecast-feedback/list`,
      }),
    };
    this.props.history.push(option);
  }

  headerButtons = () => {
    const {
      fetchListLoading = false,
      fetchFeedbackLoading = false,
      fetchSupplySaveLoading = false,
    } = this.props;
    const { activeKey, currentTemplateCode, btnPermissions } = this.state;

    const btns = [
      {
        name: 'save',
        child: intl.get(`hzero.common.button.save`).d('保存'),
        btnProps: {
          icon: 'save',
          onClick: this.handleSave,
          type: 'primary',
          loading: fetchListLoading || fetchFeedbackLoading || fetchSupplySaveLoading,
          disabled: this.saveButtonDisabled(),
        },
      },
      {
        name: 'feedback',
        child: intl.get(`hzero.common.button.feadback`).d('反馈'),
        btnProps: {
          icon: 'check',
          onClick: this.handleFeedback,
          loading: fetchListLoading || fetchFeedbackLoading || fetchSupplySaveLoading,
          disabled: this.feedbackDisabled(),
        },
      },

      {
        name: 'more',
        group: true,
        child: <Icon type="more_horiz" />,
        children: [],
      },
    ];

    if (
      !(
        btnPermissions?.export &&
        btnPermissions?.export.approve === false &&
        btnPermissions?.export?.controllerType === 'hidden'
      )
    ) {
      btns.push(
        // {
        //   name: 'checkExport',
        //   btnComp: ExcelExport,
        //   btnProps: {
        //     loading: fetchListLoading,
        //     otherButtonProps: {
        //       icon: 'unarchive',
        //       type: 'c7n-pro',
        //       disabled:
        //         this.deleteDisabled(true) ||
        //         (btnPermissions?.export &&
        //           btnPermissions?.export.approve === false &&
        //           btnPermissions?.export?.controllerType !== 'hidden'),
        //       // permissionList: [
        //       //   {
        //       //     code: exportCode,
        //       //     type: 'button',
        //       //   },
        //       // ],
        //     },
        //     requestUrl: this.requestUrl(true),
        //     queryParams: this.queryParams(true),
        //     buttonText: intl.get(`sodr.common.view.tab.checkExport`).d('勾选导出'),
        //   },
        // },
        {
          name: 'filterExport',
          noNest: true,
          child: (text) => (
            <ExcelExport
              data-name="filterExport"
              {...{
                loading: fetchListLoading,
                buttonText:
                  text ||
                  (!this.deleteDisabled(true)
                    ? intl.get('sodr.common.view.tab.checkExport').d('勾选导出')
                    : intl.get('hzero.common.button.export').d('导出')),
                otherButtonProps: {
                  icon: 'unarchive',
                  type: 'c7n-pro',
                  disabled:
                    btnPermissions?.export &&
                    btnPermissions?.export.approve === false &&
                    btnPermissions?.export?.controllerType !== 'hidden',
                  // permissionList: [
                  //   {
                  //     code: exportCode,
                  //     type: 'button',
                  //   },
                  // ],
                },
                requestUrl: this.requestUrl(),
                queryParams: this.deleteDisabled(true)
                  ? this.queryParams()
                  : this.queryParams(true),
              }}
            />
          ),
        }
      );
    }
    if (
      !(
        btnPermissions?.newExport &&
        btnPermissions?.newExport.approve === false &&
        btnPermissions?.newExport?.controllerType === 'hidden'
      )
    ) {
      btns.push(
        // {
        //   name: 'newCheckExport',
        //   btnComp: ExcelExportPro,
        //   btnProps: {
        //     currentTemplateCode,
        //     otherButtonProps: {
        //       icon: 'unarchive',
        //       type: 'c7n-pro',
        //       disabled:
        //         this.deleteDisabled(true) ||
        //         (btnPermissions?.newExport &&
        //           btnPermissions?.newExport.approve === false &&
        //           btnPermissions?.newExport?.controllerType !== 'hidden'),
        //       // permissionList: [
        //       //   {
        //       //     code: newExportCode,
        //       //     type: 'button',
        //       //   },
        //       // ],
        //     },
        //     requestUrl: this.requestUrl(true),
        //     queryParams: this.queryParams(true),
        //     buttonText: intl.get(`sodr.common.view.tab.checkExport.new`).d('勾选导出-新'),
        //   },
        // },
        {
          name: 'newFilterExport',
          noNest: true,
          child: (text) => (
            <ExcelExportPro
              data-name="newFilterExport"
              {...{
                templateCode: currentTemplateCode,
                otherButtonProps: {
                  icon: 'unarchive',
                  type: 'c7n-pro',
                  disabled:
                    btnPermissions?.newExport &&
                    btnPermissions?.newExport.approve === false &&
                    btnPermissions?.newExport?.controllerType !== 'hidden',
                  // permissionList: [
                  //   {
                  //     code: newExportCode,
                  //     type: 'button',
                  //   },
                  // ],
                },
                requestUrl: this.requestUrl(),
                queryParams: this.deleteDisabled(true)
                  ? this.queryParams()
                  : this.queryParams(true),
                buttonText:
                  text ||
                  (!this.deleteDisabled(true)
                    ? intl.get(`sodr.common.view.tab.checkExport.new`).d('勾选导出-新')
                    : intl.get('hzero.common.export.new').d('导出-新')),
              }}
            />
          ),
        }
      );
    }

    if (activeKey === 'monthlyForecast') {
      btns.push({
        name: 'monthBatchImport',
        noNest: true,
        child: (text) => (
          <Popover
            placement="top"
            trigger="hover"
            content={intl
              .get('hzero.common.viewtitle.importWarning')
              .d('请先导出需要导入填写的预测数据，以获取预测单ID及预测时间等必备字段')}
          >
            <PermissionButton
              onClick={this.handleImport}
              icon="archive"
              type="c7n-pro"
              permissionList={[
                {
                  code: `hzero.srm.requirement.sale.forecast.demand-forecast-feedback.ps.month.list.import`,
                  type: 'button',
                  meaning: '批量导入',
                },
              ]}
            >
              {text || intl.get('hzero.common.viewtitle.batchImport').d('批量导入')}
            </PermissionButton>
          </Popover>
        ),
      });
      btns.push({
        name: 'newMonthBatchImport',
        noNest: true,
        child: (text) => (
          <Popover
            placement="top"
            trigger="hover"
            content={intl
              .get('hzero.common.viewtitle.importWarning')
              .d('请先导出需要导入填写的预测数据，以获取预测单ID及预测时间等必备字段')}
          >
            <CommonImport
              prefixPatch={`${SRM_SPRM}`}
              businessObjectTemplateCode="SPRM.FORECAST_MONTH_SUPPLY"
              buttonText={
                text || intl.get('hzero.common.viewtitle.batchImport.new').d('批量导入-新')
              }
              buttonProps={{
                icon: 'archive',
                type: 'c7n-pro',
                permissionList: [
                  {
                    code: `hzero.srm.requirement.sale.forecast.demand-forecast-feedback.ps.new.month.list.import`,
                    type: 'button',
                    meaning: '批量导入-新',
                  },
                ],
              }}
              successCallBack={() => {
                notification.success();
                this.fetchMonthlyForecastList();
              }}
            />
          </Popover>
        ),
      });
    }
    if (activeKey === 'weekForecast') {
      // btns.push({
      //   name: 'batchExport',
      //   child: (
      //     <Popover
      //       placement="top"
      //       trigger="hover"
      //       content={intl
      //         .get('hzero.common.viewtitle.importWarning')
      //         .d('请先导出需要导入填写的预测数据，以获取预测单ID及预测时间等必备字段')}
      //     >
      //       <Button onClick={this.handleImport}>
      //         {intl.get('hzero.common.viewtitle.batchImport').d('批量导入')}
      //       </Button>
      //     </Popover>
      //   ),
      // });
      btns.push({
        name: 'batchImport',
        noNest: true,
        child: (text) => (
          <Popover
            placement="top"
            trigger="hover"
            content={intl
              .get('hzero.common.viewtitle.importWarning')
              .d('请先导出需要导入填写的预测数据，以获取预测单ID及预测时间等必备字段')}
          >
            <PermissionButton
              onClick={this.handleImport}
              icon="archive"
              type="c7n-pro"
              permissionList={[
                {
                  code: `hzero.srm.requirement.sale.forecast.demand-forecast-feedback.ps.list.import`,
                  type: 'button',
                  meaning: '批量导入',
                },
              ]}
            >
              {text || intl.get('hzero.common.viewtitle.batchImport').d('批量导入')}
            </PermissionButton>
          </Popover>
        ),
      });
      btns.push({
        name: 'newBatchImport',
        noNest: true,
        child: (text) => (
          <Popover
            placement="top"
            trigger="hover"
            content={intl
              .get('hzero.common.viewtitle.importWarning')
              .d('请先导出需要导入填写的预测数据，以获取预测单ID及预测时间等必备字段')}
          >
            <CommonImport
              prefixPatch={`${SRM_SPRM}`}
              businessObjectTemplateCode="SPRM.FORECAST_WEEK_SUPPLY"
              buttonText={
                text || intl.get('hzero.common.viewtitle.batchImport.new').d('批量导入-新')
              }
              buttonProps={{
                icon: 'archive',
                type: 'c7n-pro',
                permissionList: [
                  {
                    code: `hzero.srm.requirement.sale.forecast.demand-forecast-feedback.ps.new.list.import`,
                    type: 'button',
                    meaning: '批量导入-新',
                  },
                ],
              }}
              successCallBack={() => {
                notification.success();
                this.fetchWeekForecastList();
              }}
            />
          </Popover>
        ),
      });
    }
    return btns;
  };

  render() {
    const {
      annualForecast = {},
      monthlyForecast = {},
      projectForecast = {},
      weekForecast = {},
      enumMap = {},
      fetchListLoading = false,
      // fetchFeedbackLoading = false,
      fetchOperationRecordListLoading = false,
      customizeTabPane,
      customizeTable,
      customizeBtnGroup,
    } = this.props;
    const {
      projectForecastSelectedRowKeys,
      monthlyForecastSelectedRowKeys,
      annualForecastSelectedRowKeys,
      weekForecastSelectedRowKeys,
      activeKey,
      operationRecordModalVisible,
      operationRecordPagination,
      operationRecordList,
    } = this.state;
    const annualForecastProps = {
      annualForecast,
      organizationId,
      fetchList: this.fetchAnnualForecastList,
      bindForm: this.bindForm,
      fetchListLoading,
      handleRowSelectChange: this.handleRowSelectChange,
      selectedRowKeys: annualForecastSelectedRowKeys,
      setModelValue: this.setModelValue,
      activeKey,
      addEditArr: this.addEditArr,
      handleShowRecordModal: this.handleShowRecordModal,
      enumMap,
      customizeTable,
    };
    const projectForecastProps = {
      projectForecast,
      fetchList: this.fetchProjectForecastList,
      bindForm: this.bindForm,
      fetchListLoading,
      handleRowSelectChange: this.handleRowSelectChange,
      selectedRowKeys: projectForecastSelectedRowKeys,
      setModelValue: this.setModelValue,
      activeKey,
      addEditArr: this.addEditArr,
      handleShowRecordModal: this.handleShowRecordModal,
      enumMap,
      customizeTable,
    };
    const monthlyForecastProps = {
      monthlyForecast,
      fetchList: this.fetchMonthlyForecastList,
      bindForm: this.bindForm,
      fetchListLoading,
      handleRowSelectChange: this.handleRowSelectChange,
      selectedRowKeys: monthlyForecastSelectedRowKeys,
      setModelValue: this.setModelValue,
      activeKey,
      addEditArr: this.addEditArr,
      handleShowRecordModal: this.handleShowRecordModal,
      enumMap,
      customizeTable,
    };
    const weekForecastProps = {
      weekForecast,
      dispatch: this.props.dispatch,
      fetchList: this.fetchWeekForecastList,
      bindForm: this.bindForm,
      fetchListLoading,
      handleRowSelectChange: this.handleRowSelectChange,
      selectedRowKeys: weekForecastSelectedRowKeys,
      setModelValue: this.setModelValue,
      activeKey,
      addEditArr: this.addEditArr,
      handleShowRecordModal: this.handleShowRecordModal,
      enumMap,
      customizeTable,
    };
    const operationRecordProps = {
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      hideModal: () => {
        this.handleModalVisible('operationRecordModalVisible', false);
        this.setState({ operationRecordList: [], operationRecordPagination: {} });
      },
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`${promptCode}.view.message.title.demandForecastFeedback`)
            .d('预测单反馈')}
        >
          <>
            {customizeBtnGroup(
              { code: 'SPRM.PREDICTION_ORDER_FEEDBACK.BTN', pro: true },
              <DynamicButtons buttons={this.headerButtons()} />
            )}
          </>
        </Header>
        <Content>
          {customizeTabPane(
            { code: 'SPRM.PREDICTION_ORDER_FEEDBACK.TAB' },
            <Tabs
              animated={false}
              className={classnames(styles.mT)}
              onChange={(key) => this.setState({ activeKey: key }, () => this.getBtnPermissions())}
            // activeKey={activeKey}
            // defaultActiveKey={activeKey}
            >
              <TabPane
                tab={intl.get(`${promptCode}.view.message.title.annualForecast`).d('年度预测')}
                key="annualForecast"
              >
                <AnnualForecast {...annualForecastProps} />
              </TabPane>
              <TabPane
                tab={
                  <Popover
                    content={intl
                      .get(`${promptCode}.view.message.title.monthlyForecast1to12`)
                      .d('Month1-Month12填写当月预测数量')}
                  >
                    {intl.get(`${promptCode}.view.message.title.monthlyForecast`).d('月度预测')}
                  </Popover>
                }
                key="monthlyForecast"
              >
                <MonthlyForecast {...monthlyForecastProps} />
              </TabPane>
              <TabPane
                tab={
                  <Popover
                    content={intl
                      .get(`${promptCode}.view.message.title.weekForecast1to12`)
                      .d('Week1-Week12填写当前周期预测数量')}
                  >
                    {intl.get(`${promptCode}.view.message.title.weekForecast`).d('周期预测')}
                  </Popover>
                }
                key="weekForecast"
              >
                <WeekForecast {...weekForecastProps} />
              </TabPane>
              <TabPane
                tab={intl.get(`${promptCode}.view.message.title.projectForecast`).d('项目预测')}
                key="projectForecast"
              >
                <ProjectForecast {...projectForecastProps} />
              </TabPane>
            </Tabs>
          )}
        </Content>
        <OperationRecord {...operationRecordProps} />
      </React.Fragment>
    );
  }
}
