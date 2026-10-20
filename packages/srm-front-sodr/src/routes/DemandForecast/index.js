/**
 * RiskAssessmentList -风险评估 列表页
 * @date: 2019-12-4
 * @author guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import { Tabs, Popover, Modal, Button } from 'hzero-ui';
import { Icon } from 'choerodon-ui/pro';
import { connect } from 'dva';
import classnames from 'classnames';
import { isArray, isEmpty } from 'lodash';
import moment from 'moment';
import { stringify } from 'querystring';

import intl from 'utils/intl';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  delItemsToPagination,
  createPagination,
} from 'utils/utils';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATETIME_FORMAT,
  DATETIME_MAX,
  DATETIME_MIN,
} from 'utils/constants';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import CommonImport from 'hzero-front/lib/components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { SRM_SPRM } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import OperationRecord from '@/routes/components/OperationRecord/OperationRecordCopy';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';

import { Button as PermissionButton } from 'components/Permission';
import ProjectForecast from './ProjectForecast';
import AnnualForecast from './AnnualForecast';
import MonthlyForecast from './MonthlyForecast';
import WeekForecast from './WeekForecast';
import styles from './index.less';
import { queryPermissions } from '@/services/demandForecastService';
import { getCustomizeData } from '@/services/quotePurchaseRequisitionService';

const { TabPane } = Tabs;

const organizationId = getCurrentOrganizationId();
const promptCode = 'sodr.demandForecast';
@withCustomize({
  unitCode: [
    'SPRM.PREDICTION_ORDER_CREATION.TAB',
    'SPRM.PREDICTION_ORDER_CREATION.WEEK_LIST',
    'SPRM.PREDICTION_ORDER_CREATION.YEAR_LIST',
    'SPRM.PREDICTION_ORDER_CREATION.MONTH_LIST',
    'SPRM.PREDICTION_ORDER_CREATION.PROJECT_LIST',
    'SPRM.PREDICTION_ORDER_CREATION.BTNS',
  ],
})
@connect(({ loading = {}, demandForecast = {} }) => ({
  fetchListLoading: loading.effects['demandForecast/fetchList'],
  fetchSaveLoading: loading.effects['demandForecast/fetchSave'],
  fetchDeteteLoading: loading.effects['demandForecast/batchDelete'],
  fetchReleaseLoading: loading.effects['demandForecast/batchRelease'],
  fetchOperationRecordListLoading: loading.effects['demandForecast/fetchOperationRecordList'],
  annualForecast: demandForecast.annualForecast,
  monthlyForecast: demandForecast.monthlyForecast,
  weekForecast: demandForecast.weekForecast,
  projectForecast: demandForecast.projectForecast,
  enumMap: demandForecast.enumMap,
  selectedKeys: demandForecast.selectedKeys,
  demandForecast,
}))
@formatterCollections({
  code: [
    'sodr.demandForecast',
    'hzero.common',
    'entity.organization',
    'entity.attachment',
    'entity.company',
    'entity.business',
    'entity.item',
    'entity.roles',
    'sqam.incomingInspectionQuery',
    'sodr.common',
    'sprm.common',
    'entity.supplier',
    'sprm.purchaseRequisitionApproval',
  ],
})
export default class extends React.Component {
  form;

  state = {
    activeKey: 'annualForecast',
    operationRecordList: [],
    operationRecordPagination: {},
    btnPermissions: {},
    currentTemplateCode: '',
  };

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'demandForecast/updateState',
      payload: {
        annualForecast: { list: [], pagination: {} },
        monthlyForecast: { list: [], pagination: {} },
        weekForecast: { list: [], pagination: {} },
        projectForecast: { list: [], pagination: {} },
      },
    });
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'demandForecast/fetchEnum',
    });
    // 获取默认的tab拿到默认activeKey
    Promise.all([getCustomizeData(['SPRM.PREDICTION_ORDER_CREATION.TAB'])]).then((res) => {
      if (res && isArray(res) && !isEmpty(res) && res[0]) {
        const custConfigDefaultActive = res[0]['SPRM.PREDICTION_ORDER_CREATION.TAB']?.fields.filter(
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

    let templateCode = 'SPRM_DEMAND_CREATE_PROJECT_FORECAST_EXPORT';
    let importCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.project.list.import';
    let newImportCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.new.project.list.import';
    let exportCode = '';
    let newExportCode = '';
    let newCloseCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.year.close';

    switch (activeKey) {
      case 'annualForecast':
        templateCode = 'SPRM_DEMAND_CREATE_YEAR_FORECAST_EXPORT';
        importCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.year.list.import';
        newImportCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.new.year.list.import';
        exportCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.year.list.export';
        newExportCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.new.year.list.export';
        newCloseCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.year.close';
        break;
      case 'monthlyForecast':
        templateCode = 'SPRM_DEMAND_CREATE_MONTH_FORECAST_EXPORT';
        importCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.month.list.import';
        newImportCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.new.month.list.import';
        exportCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.month.list.export';
        newExportCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.new.month.list.export';
        newCloseCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.month.close';
        break;
      case 'weekForecast':
        templateCode = 'SPRM_DEMAND_CREATE_WEEK_FORECAST_EXPORT';
        importCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.week.list.import';
        newImportCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.new.week.list.import';
        exportCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.week.list.export';
        newExportCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.new.week.list.export';
        newCloseCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.week.close';
        break;
      default:
        templateCode = 'SPRM_DEMAND_CREATE_PROJECT_FORECAST_EXPORT';
        importCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.project.list.import';
        newImportCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.new.project.list.import';
        exportCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.project.list.export';
        newExportCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.new.project.list.export';
        newCloseCode = 'hzero.srm.requirement.forecast.demand-forecast.ps.project.close';
        break;
    }

    const codeList = [importCode, newImportCode, exportCode, newExportCode, newCloseCode];

    queryPermissions(codeList).then((res) => {
      if (res && !res.failed) {
        const btnPermissions = {};
        res.forEach((item) => {
          if (item.code === exportCode) {
            btnPermissions.export = item;
          } else if (item.code === newExportCode) {
            btnPermissions.newExport = item;
          } else if (item.code === importCode) {
            btnPermissions.import = item;
          } else if (item.code === newImportCode) {
            btnPermissions.newImport = item;
          } else if (item.code === newCloseCode) {
            btnPermissions.close = item;
          }
        });
        this.setState({
          btnPermissions,
          currentTemplateCode: templateCode,
        });
      }
    });
  };

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
    const forecastYearFrom = formValues.forecastYearFrom
      ? formValues.forecastYearFrom.format(DEFAULT_DATE_FORMAT)
      : null;
    const forecastYearTo = formValues.forecastYearTo
      ? formValues.forecastYearTo.format(DEFAULT_DATE_FORMAT)
      : null;
    const searchCondition = filterNullValueObject({
      ...formValues,
      forecastYearFrom,
      forecastYearTo,
    });
    dispatch({
      type: 'demandForecast/fetchList',
      payload: {
        page: { ...pagination, ...page },
        ...searchCondition,
        forecastType: 'YEAR',
        flag: 'annualForecast',
        customizeUnitCode: 'SPRM.PREDICTION_ORDER_CREATION.YEAR_LIST',
      },
    }).then((res) => {
      if (res) {
        this.setState(
          {
            activeKey: 'annualForecast',
          },
          () => {
            this.handleRowSelectChange({
              annualForecastSelectedRowKeys: [],
              annualForecastSelectedRows: [],
            });
          }
        );
      }
    });
  }

  /**
   * 预测单的导入
   */
  @Bind()
  handleImport() {
    const { activeKey } = this.state;
    let code = '';
    switch (activeKey) {
      case 'annualForecast':
        code = 'SPRM.DEMAND_FORECAST_YEAR';
        break;
      case 'monthlyForecast':
        code = 'SPRM.DEMAND_FORECAST_MONTH';
        break;
      case 'weekForecast':
        code = 'SPRM.DEMAND_FORECAST_WEEK';
        break;
      case 'projectForecast':
        code = 'SPRM.DEMAND_FORECAST_PROJECT';
        break;
      default:
        break;
    }
    const option = {
      pathname: `/sodr/demand-forecast/data-import/${code}`,
      search: stringify({
        action: 'hzero.common.viewtitle.batchImport',
        backPath: `/sodr/demand-forecast/list`,
      }),
    };
    this.props.history.push(option);
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
    const forecastMonthTo = formValues.forecastMonthTo
      ? formValues.forecastMonthTo.format(DEFAULT_DATE_FORMAT)
      : null;
    const searchCondition = filterNullValueObject({
      ...formValues,
      forecastMonthFrom,
      forecastMonthTo,
    });
    dispatch({
      type: 'demandForecast/updateState',
      payload: {
        monthlyForecast: {
          list: [],
        },
      },
    });
    dispatch({
      type: 'demandForecast/fetchList',
      payload: {
        page: { ...pagination, ...page },
        ...searchCondition,
        forecastType: 'MONTH',
        flag: 'monthlyForecast',
        customizeUnitCode: 'SPRM.PREDICTION_ORDER_CREATION.MONTH_LIST',
      },
    }).then((res) => {
      if (res) {
        this.setState(
          {
            activeKey: 'monthlyForecast',
          },
          () => {
            this.handleRowSelectChange({
              monthlyForecastSelectedRowKeys: [],
              monthlyForecastSelectedRows: [],
            });
          }
        );
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
    const weekForecastDateTo = formValues.weekForecastDateTo
      ? formValues.weekForecastDateTo.format(DATETIME_MAX)
      : null;
    const searchCondition = filterNullValueObject({
      ...formValues,
      weekForecastDateFrom,
      weekForecastDateTo,
    });
    dispatch({
      type: 'demandForecast/updateState',
      payload: {
        weekForecast: {
          list: [],
        },
      },
    });
    dispatch({
      type: 'demandForecast/fetchList',
      payload: {
        page: { ...pagination, ...page },
        ...searchCondition,
        forecastType: 'WEEK',
        flag: 'weekForecast',
        customizeUnitCode: 'SPRM.PREDICTION_ORDER_CREATION.WEEK_LIST',
      },
    }).then((res) => {
      if (res) {
        this.setState(
          {
            activeKey: 'weekForecast',
          },
          () => {
            this.handleRowSelectChange({
              weekForecastSelectedRowKeys: [],
              weekForecastSelectedRows: [],
            });
          }
        );
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
    const forecastPickFrom = formValues.forecastPickFrom
      ? formValues.forecastPickFrom.format(DEFAULT_DATE_FORMAT)
      : null;
    const forecastPickTo = formValues.forecastPickTo
      ? formValues.forecastPickTo.format(DEFAULT_DATE_FORMAT)
      : null;
    const searchCondition = filterNullValueObject({
      ...formValues,
      forecastPickFrom,
      forecastPickTo,
    });
    dispatch({
      type: 'demandForecast/fetchList',
      payload: {
        page: { ...pagination, ...page },
        ...searchCondition,
        forecastType: 'PROJECT',
        flag: 'projectForecast',
        customizeUnitCode: 'SPRM.PREDICTION_ORDER_CREATION.PROJECT_LIST',
      },
    }).then((res) => {
      if (res) {
        this.setState(
          {
            activeKey: 'projectForecast',
          },
          () => {
            this.handleRowSelectChange({
              projectForecastSelectedRowKeys: [],
              projectForecastSelectedRows: [],
            });
          }
        );
      }
    });
  }

  @Bind()
  handleRowSelectChange(json = {}) {
    this.setState(json);
    const { dispatch } = this.props;
    dispatch({ type: 'demandForecast/updateState', payload: { selectedKeys: { ...json } } });
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    const { dispatch } = this.props;
    const { activeKey } = this.state;
    dispatch({ type: 'demandForecast/addRow', payload: { flag: activeKey } });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { activeKey } = this.state;
    const { selectedKeys, dispatch } = this.props;
    const {
      annualForecastSelectedRows = [],
      monthlyForecastSelectedRows = [],
      weekForecastSelectedRows = [],
      projectForecastSelectedRows = [],
    } = selectedKeys;

    const selectedRows =
      activeKey === 'annualForecast'
        ? annualForecastSelectedRows
        : activeKey === 'monthlyForecast'
          ? monthlyForecastSelectedRows
          : activeKey === 'weekForecast'
            ? weekForecastSelectedRows
            : projectForecastSelectedRows;

    const customizeUnitCodeList = {
      annualForecast: 'SPRM.PREDICTION_ORDER_CREATION.YEAR_LIST',
      monthlyForecast: 'SPRM.PREDICTION_ORDER_CREATION.MONTH_LIST',
      weekForecast: 'SPRM.PREDICTION_ORDER_CREATION.WEEK_LIST',
      projectForecast: "SPRM.PREDICTION_ORDER_CREATION.PROJECT_LIST",
    };

    // 验证表单
    let errFlag = 0;
    selectedRows.forEach((item) =>
      item?.$form?.validateFields((err) => {
        if (err) {
          errFlag = 1;
        }
      })
    );

    if (errFlag) {
      return;
    }

    // 取消新建预测单上的uuid
    selectedRows.forEach((item) => {
      if (item._status === 'create') {
        // eslint-disable-next-line no-param-reassign
        item.forecastId = null;
      }
    });

    const data = this.convertFormantDate(selectedRows, activeKey);

    dispatch({
      type: 'demandForecast/fetchSave',
      payload: {
        data,
        customizeUnitCode: customizeUnitCodeList[activeKey] || null,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        switch (activeKey) {
          case 'annualForecast':
            this.fetchAnnualForecastList();
            break;
          case 'monthlyForecast':
            this.fetchMonthlyForecastList();
            break;
          case 'weekForecast':
            this.fetchWeekForecastList();
            break;
          case 'projectForecast':
            this.fetchProjectForecastList();
            break;
          default:
            break;
        }
      }
    });
  }

  /**
   * 转换参数为合法入参
   */
  convertFormantDate(selectedRows, activeKey) {
    return selectedRows.map((item) => {
      const {
        estimatedDeliveryDate,
        supplierConfirmDelivery,
        forecastYear,
        weekForecastDate,
      } = item;
      const temV = moment(forecastYear);
      let returnVal = {
        ...item,
        forecastYear: activeKey === 'annualForecast' ? temV.format('YYYY') : temV.format('YYYY-MM'),
      };
      if (estimatedDeliveryDate) {
        returnVal = {
          ...returnVal,
          estimatedDeliveryDate: estimatedDeliveryDate.format(DEFAULT_DATETIME_FORMAT),
        };
      }
      if (!item.forecastStatus && supplierConfirmDelivery) {
        returnVal = {
          ...returnVal,
          supplierConfirmDelivery: moment(supplierConfirmDelivery)?.format(DEFAULT_DATETIME_FORMAT),
        };
      }
      if (!item.forecastStatus && weekForecastDate) {
        returnVal = {
          ...returnVal,
          forecastYear: temV.format(DEFAULT_DATETIME_FORMAT),
          weekForecastDate: moment(weekForecastDate).format(DEFAULT_DATETIME_FORMAT),
        };
      }
      return returnVal;
    });
  }

  /**
   * 发布
   */
  @Bind()
  handlePublish() {
    const { activeKey } = this.state;
    const { selectedKeys, dispatch } = this.props;
    const {
      annualForecastSelectedRows = [],
      monthlyForecastSelectedRows = [],
      weekForecastSelectedRows = [],
      projectForecastSelectedRows = [],
    } = selectedKeys;

    const selectedRows =
      activeKey === 'annualForecast'
        ? annualForecastSelectedRows
        : activeKey === 'monthlyForecast'
          ? monthlyForecastSelectedRows
          : activeKey === 'weekForecast'
            ? weekForecastSelectedRows
            : projectForecastSelectedRows;

    const customizeUnitCodeList = {
      annualForecast: 'SPRM.PREDICTION_ORDER_CREATION.YEAR_LIST',
      monthlyForecast: 'SPRM.PREDICTION_ORDER_CREATION.MONTH_LIST',
      weekForecast: 'SPRM.PREDICTION_ORDER_CREATION.WEEK_LIST',
      projectForecast: "SPRM.PREDICTION_ORDER_CREATION.PROJECT_LIST",
    };

    // 验证表单
    let errFlag = 0;
    selectedRows.forEach((item) =>
      item?.$form?.validateFields((err) => {
        if (err) {
          errFlag = 1;
        }
      })
    );

    if (errFlag) {
      return;
    }

    // 取消新建预测单上的uuid
    selectedRows.forEach((item) => {
      if (item._status === 'create') {
        // eslint-disable-next-line no-param-reassign
        item.forecastId = null;
      }
    });

    const data = this.convertFormantDate(selectedRows, activeKey);
    if (data.length > 0) {
      dispatch({ type: 'demandForecast/batchRelease', payload: { data, customizeUnitCode: customizeUnitCodeList[activeKey] || null } }).then((res) => {
        if (res) {
          notification.success({
            message: intl.get(`hzero.common.notification.success.release`).d('发布成功'),
          });
          switch (activeKey) {
            case 'annualForecast':
              this.fetchAnnualForecastList();
              break;
            case 'monthlyForecast':
              this.fetchMonthlyForecastList();
              break;
            case 'weekForecast':
              this.fetchWeekForecastList();
              break;
            case 'projectForecast':
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
   * 关闭
   */
  @Bind()
  handleClose() {
    const { activeKey } = this.state;
    const { selectedKeys, dispatch } = this.props;
    const {
      annualForecastSelectedRows = [],
      monthlyForecastSelectedRows = [],
      weekForecastSelectedRows = [],
      projectForecastSelectedRows = [],
    } = selectedKeys;
    const _this = this;
    Modal.confirm({
      title: intl.get(`sodr.common.model.common.closeTitle`).d('关闭'),
      content: `${intl.get(`sodr.common.modal.common.confirmClose`).d('确定关闭')}?`,
      onOk() {
        const selectedRows =
          activeKey === 'annualForecast'
            ? annualForecastSelectedRows
            : activeKey === 'monthlyForecast'
              ? monthlyForecastSelectedRows
              : activeKey === 'weekForecast'
                ? weekForecastSelectedRows
                : projectForecastSelectedRows;
        if (selectedRows.length > 0) {
          dispatch({ type: 'demandForecast/batchClose', payload: { data: selectedRows } }).then(
            (res) => {
              if (res) {
                notification.success({
                  message: intl.get(`hzero.common.notification.success.close`).d('关闭成功'),
                });
                switch (activeKey) {
                  case 'annualForecast':
                    _this.fetchAnnualForecastList();
                    break;
                  case 'monthlyForecast':
                    _this.fetchMonthlyForecastList();
                    break;
                  case 'weekForecast':
                    _this.fetchWeekForecastList();
                    break;
                  case 'projectForecast':
                    _this.fetchProjectForecastList();
                    break;
                  default:
                    break;
                }
              }
            }
          );
        }
      },
      onCancel() { },
    });
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
      type: 'demandForecast/updateState',
      payload: { [key]: { list: data, pagination } },
    });
  }

  @Bind()
  handleDelete() {
    const { activeKey } = this.state;
    const { dispatch, [activeKey]: dataS, selectedKeys } = this.props;
    const {
      annualForecastSelectedRowKeys = [],
      monthlyForecastSelectedRowKeys = [],
      weekForecastSelectedRowKeys = [],
      projectForecastSelectedRowKeys = [],
    } = selectedKeys;
    const selectedRowKeys =
      activeKey === 'annualForecast'
        ? annualForecastSelectedRowKeys
        : activeKey === 'monthlyForecast'
          ? monthlyForecastSelectedRowKeys
          : activeKey === 'weekForecast'
            ? weekForecastSelectedRowKeys
            : projectForecastSelectedRowKeys;
    const { list = [], pagination = {} } = dataS;
    // 要去重新渲染的预测单
    const reRenderData = list.filter((item) => !selectedRowKeys.includes(item.forecastId));
    dispatch({
      type: 'demandForecast/updateState',
      payload: {
        [activeKey]: {
          list: reRenderData,
          pagination: delItemsToPagination(selectedRowKeys.length, reRenderData.length, pagination),
        },
      },
    });
    // 新建的预测单
    const newStatusData = list.filter(
      (item) => selectedRowKeys.includes(item.forecastId) && item.forecastStatus === 'NEW'
    );
    if (newStatusData.length > 0) {
      dispatch({ type: 'demandForecast/batchDelete', payload: { data: newStatusData } }).then(
        (res) => {
          if (!res?.failed) {
            notification.success({
              message: intl.get(`hzero.common.notification.success.delete`).d('删除成功'),
            });
            switch (activeKey) {
              case 'annualForecast':
                this.fetchAnnualForecastList();
                break;
              case 'monthlyForecast':
                this.fetchMonthlyForecastList();
                break;
              case 'weekForecast':
                this.fetchWeekForecastList();
                break;
              case 'projectForecast':
                this.fetchProjectForecastList();
                break;
              default:
                break;
            }
          }
        }
      );
    }
  }

  /**
   * 导出对应tab内容
   */
  @Bind()
  requestUrl() {
    const { activeKey } = this.state;
    switch (activeKey) {
      case 'annualForecast':
        return `${SRM_SPRM}/v1/${organizationId}/year/export`;
      case 'monthlyForecast':
        return `${SRM_SPRM}/v1/${organizationId}/month/export`;
      case 'weekForecast':
        return `${SRM_SPRM}/v1/${organizationId}/week/export`;
      case 'projectForecast':
        return `${SRM_SPRM}/v1/${organizationId}/project/export`;
      default:
        return null;
    }
  }

  /**
   * 导出对应tab内容的params
   */
  @Bind()
  queryParams(flag) {
    const { activeKey } = this.state;
    const { selectedKeys } = this.props;
    const {
      annualForecastSelectedRowKeys = [],
      monthlyForecastSelectedRowKeys = [],
      weekForecastSelectedRowKeys = [],
      projectForecastSelectedRowKeys = [],
    } = selectedKeys;
    let searchCondition = null;
    let formValues = null;
    switch (activeKey) {
      case 'annualForecast': {
        formValues = this.annualForecastForm ? this.annualForecastForm.getFieldsValue() : {};
        const forecastYearFrom = formValues.forecastYearFrom
          ? formValues.forecastYearFrom.format(DEFAULT_DATE_FORMAT)
          : null;
        const forecastYearTo = formValues.forecastYearTo
          ? formValues.forecastYearTo.format(DEFAULT_DATE_FORMAT)
          : null;
        searchCondition = filterNullValueObject({
          ...formValues,
          forecastYearFrom,
          forecastYearTo,
          flag: 'annualForecast',
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
        const forecastMonthTo = formValues.forecastMonthTo
          ? formValues.forecastMonthTo.format(DEFAULT_DATE_FORMAT)
          : null;
        searchCondition = filterNullValueObject({
          ...formValues,
          forecastMonthFrom,
          forecastMonthTo,
          flag: 'monthlyForecast',
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
        const forecastPickFrom = formValues.forecastPickFrom
          ? formValues.forecastPickFrom.format(DEFAULT_DATE_FORMAT)
          : null;
        const forecastPickTo = formValues.forecastPickTo
          ? formValues.forecastPickTo.format(DEFAULT_DATE_FORMAT)
          : null;
        searchCondition = filterNullValueObject({
          ...formValues,
          forecastPickFrom,
          forecastPickTo,
          flag: 'projectForecast',
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
   * flag 是否导出
   */
  @Bind()
  deleteDisabled(flag) {
    const { activeKey } = this.state;
    const { selectedKeys } = this.props;
    const {
      annualForecastSelectedRows = [],
      monthlyForecastSelectedRows = [],
      weekForecastSelectedRows = [],
      projectForecastSelectedRows = [],
    } = selectedKeys;
    switch (activeKey) {
      case 'annualForecast':
        return flag
          ? !annualForecastSelectedRows.length > 0 ||
          annualForecastSelectedRows.filter((item) => item._status === 'create').length > 0
          : !annualForecastSelectedRows.length > 0 ||
          annualForecastSelectedRows.filter(
            (item) => item._status === 'update' && item.forecastStatus !== 'NEW'
          ).length > 0;
      case 'monthlyForecast':
        return flag
          ? !monthlyForecastSelectedRows.length > 0 ||
          monthlyForecastSelectedRows.filter((item) => item._status === 'create').length > 0
          : !monthlyForecastSelectedRows.length > 0 ||
          monthlyForecastSelectedRows.filter(
            (item) => item._status === 'update' && item.forecastStatus !== 'NEW'
          ).length > 0;
      case 'weekForecast':
        return flag
          ? !weekForecastSelectedRows.length > 0 ||
          weekForecastSelectedRows.filter((item) => item._status === 'create').length > 0
          : !weekForecastSelectedRows.length > 0 ||
          weekForecastSelectedRows.filter(
            (item) => item._status === 'update' && item.forecastStatus !== 'NEW'
          ).length > 0;
      case 'projectForecast':
        return flag
          ? !projectForecastSelectedRows.length > 0 ||
          projectForecastSelectedRows.filter((item) => item._status === 'create').length > 0
          : !projectForecastSelectedRows.length > 0 ||
          projectForecastSelectedRows.filter(
            (item) => item._status === 'update' && item.forecastStatus !== 'NEW'
          ).length > 0;
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
      type: 'demandForecast/fetchOperationRecordList',
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

  @Bind()
  saveButtonDisabled() {
    const { activeKey } = this.state;
    const { selectedKeys } = this.props;
    const {
      annualForecastSelectedRows = [],
      monthlyForecastSelectedRows = [],
      weekForecastSelectedRows = [],
      projectForecastSelectedRows = [],
    } = selectedKeys;
    switch (activeKey) {
      case 'annualForecast':
        return (
          !annualForecastSelectedRows.length ||
          annualForecastSelectedRows.filter(
            (item) => item.forecastStatus === 'CLOSED' || item.forecastStatus === 'RELEASE'
          ).length
        );
      case 'monthlyForecast':
        return (
          !monthlyForecastSelectedRows.length ||
          monthlyForecastSelectedRows.filter(
            (item) => item.forecastStatus === 'CLOSED' || item.forecastStatus === 'RELEASE'
          ).length
        );
      case 'weekForecast':
        return (
          !weekForecastSelectedRows.length ||
          weekForecastSelectedRows.filter(
            (item) => item.forecastStatus === 'CLOSED' || item.forecastStatus === 'RELEASE'
          ).length
        );
      case 'projectForecast':
        return (
          !projectForecastSelectedRows.length ||
          projectForecastSelectedRows.filter(
            (item) => item.forecastStatus === 'CLOSED' || item.forecastStatus === 'RELEASE'
          ).length
        );
      default:
        return true;
    }
  }

  @Bind()
  releaseButtonDisabled() {
    const { activeKey } = this.state;
    const { selectedKeys } = this.props;
    const {
      annualForecastSelectedRows = [],
      monthlyForecastSelectedRows = [],
      weekForecastSelectedRows = [],
      projectForecastSelectedRows = [],
    } = selectedKeys;
    switch (activeKey) {
      case 'annualForecast':
        return (
          !annualForecastSelectedRows.length ||
          annualForecastSelectedRows.filter(
            (item) =>
              item.forecastStatus === 'RELEASE' ||
              item.forecastStatus === 'CLOSED' ||
              item.forecastStatus === 'FEEDBACK'
          ).length
        );
      case 'monthlyForecast':
        return (
          !monthlyForecastSelectedRows.length ||
          monthlyForecastSelectedRows.filter(
            (item) =>
              item.forecastStatus === 'RELEASE' ||
              item.forecastStatus === 'CLOSED' ||
              item.forecastStatus === 'FEEDBACK'
          ).length
        );
      case 'weekForecast':
        return (
          !weekForecastSelectedRows.length ||
          weekForecastSelectedRows.filter(
            (item) =>
              item.forecastStatus === 'RELEASE' ||
              item.forecastStatus === 'CLOSED' ||
              item.forecastStatus === 'FEEDBACK'
          ).length
        );
      case 'projectForecast':
        return (
          !projectForecastSelectedRows.length ||
          projectForecastSelectedRows.filter(
            (item) =>
              item.forecastStatus === 'RELEASE' ||
              item.forecastStatus === 'CLOSED' ||
              item.forecastStatus === 'FEEDBACK'
          ).length
        );
      default:
        return true;
    }
  }

  /**
   * 关闭按钮是否可用
   */
  @Bind()
  closeButtonDisabled() {
    const { activeKey } = this.state;
    const { selectedKeys } = this.props;
    const {
      annualForecastSelectedRows = [],
      monthlyForecastSelectedRows = [],
      weekForecastSelectedRows = [],
      projectForecastSelectedRows = [],
    } = selectedKeys;
    switch (activeKey) {
      case 'annualForecast':
        return (
          !annualForecastSelectedRows.length ||
          annualForecastSelectedRows.filter(
            (item) =>
              item.forecastStatus === 'CLOSED' ||
              item.forecastStatus === 'NEW' ||
              item._status === 'create' ||
              item.forecastStatus === 'RELEASE'
          ).length
        );
      case 'monthlyForecast':
        return (
          !monthlyForecastSelectedRows.length ||
          monthlyForecastSelectedRows.filter(
            (item) =>
              item.forecastStatus === 'CLOSED' ||
              item.forecastStatus === 'NEW' ||
              item._status === 'create' ||
              item.forecastStatus === 'RELEASE'
          ).length
        );
      case 'weekForecast':
        return (
          !weekForecastSelectedRows.length ||
          weekForecastSelectedRows.filter(
            (item) =>
              item.forecastStatus === 'CLOSED' ||
              item.forecastStatus === 'NEW' ||
              item._status === 'create' ||
              item.forecastStatus === 'RELEASE'
          ).length
        );
      case 'projectForecast':
        return (
          !projectForecastSelectedRows.length ||
          projectForecastSelectedRows.filter(
            (item) =>
              item.forecastStatus === 'CLOSED' ||
              item.forecastStatus === 'NEW' ||
              item._status === 'create' ||
              item.forecastStatus === 'RELEASE'
          ).length
        );
      default:
        return true;
    }
  }

  @Bind()
  handleItemChange(record, lovRecord, flag) {
    const { dispatch } = this.props;
    const { partnerItemId } = lovRecord;
    if (partnerItemId) {
      dispatch({
        type: 'demandForecast/fetchCategory',
        payload: {
          itemId: partnerItemId,
          enabledFlag: 1,
        },
      }).then((res) => {
        if (res && isArray(res) && res.length === 1) {
          const { categoryName, categoryId, categoryCode } = res[0];
          this.setModelValue(
            {
              categoryName,
              categoryId,
              categoryCode,
              forecastId: record.forecastId,
            },
            flag
          );
        }
      });
    }
    this.setModelValue(
      {
        itemName: lovRecord.itemName,
        uomName: lovRecord.uomName,
        itemSpecification: lovRecord.specifications,
        itemModel: lovRecord.model,
        itemId: lovRecord.itemId,
        forecastId: record.forecastId,
      },
      flag
    );
    // 取消行选中
    this.clearSelected();
  }

  /**
   * 取消行选中，组件原因需要重新勾选行
   */
  @Bind
  clearSelected() {
    const { activeKey } = this.state;
    const { dispatch, selectedKeys } = this.props;
    switch (activeKey) {
      case 'annualForecast':
        dispatch({
          type: 'demandForecast/updateState',
          payload: {
            selectedKeys: {
              ...selectedKeys,
              annualForecastSelectedRows: [],
              annualForecastSelectedRowKeys: [],
            },
          },
        });
        break;
      case 'monthlyForecast':
        dispatch({
          type: 'demandForecast/updateState',
          payload: {
            selectedKeys: {
              ...selectedKeys,
              monthlyForecastSelectedRows: [],
              monthlyForecastSelectedRowKeys: [],
            },
          },
        });
        break;
      case 'weekForecast':
        dispatch({
          type: 'demandForecast/updateState',
          payload: {
            selectedKeys: {
              ...selectedKeys,
              weekForecastSelectedRows: [],
              weekForecastSelectedRowKeys: [],
            },
          },
        });
        break;
      case 'projectForecast':
        dispatch({
          type: 'demandForecast/updateState',
          payload: {
            selectedKeys: {
              ...selectedKeys,
              projectForecastSelectedRowKeys: [],
              projectForecastSelectedRows: [],
            },
          },
        });
        break;
      default:
        break;
    }
  }

  @Bind()
  headerButtons() {
    const {
      fetchListLoading = false,
      fetchSaveLoading = false,
      fetchDeteteLoading = false,
      fetchReleaseLoading = false,
    } = this.props;

    const { activeKey, btnPermissions, currentTemplateCode } = this.state;
    const templateCode = currentTemplateCode;
    let businessObjectTemplateCode = 'SPRM.DEMAND_FORECAST_PROJECT';

    switch (activeKey) {
      case 'annualForecast':
        businessObjectTemplateCode = 'SPRM.DEMAND_FORECAST_YEAR';
        break;
      case 'monthlyForecast':
        businessObjectTemplateCode = 'SPRM.DEMAND_FORECAST_MONTH';
        break;
      case 'weekForecast':
        businessObjectTemplateCode = 'SPRM.DEMAND_FORECAST_WEEK';
        break;
      default:
        businessObjectTemplateCode = 'SPRM.DEMAND_FORECAST_PROJECT';
        break;
    }

    const btns = [
      {
        name: 'save',
        btnComp: Button,
        child: intl.get(`hzero.common.button.save`).d('保存'),
        btnProps: {
          icon: 'save',
          onClick: this.handleSave,
          type: 'primary',
          loading:
            fetchListLoading || fetchSaveLoading || fetchDeteteLoading || fetchReleaseLoading,
          disabled: this.saveButtonDisabled(),
        },
      },
      {
        name: 'delete',
        child: intl.get(`hzero.common.button.delete`).d('删除'),
        btnComp: Button,
        noNest: true,
        btnProps: {
          icon: 'delete',
          type: 'c7n-pro',
          onClick: this.handleDelete,
          loading:
            fetchListLoading || fetchSaveLoading || fetchDeteteLoading || fetchReleaseLoading,
          disabled: this.deleteDisabled(),
          style: { display: 'block', border: 'none', textAlign: 'left' },
        },
      },
      {
        name: 'create',
        child: intl.get(`hzero.common.button.create`).d('新建'),
        btnProps: {
          icon: 'plus',
          onClick: this.handleCreate,
          loading:
            fetchListLoading || fetchSaveLoading || fetchDeteteLoading || fetchReleaseLoading,
        },
      },
      {
        name: 'release',
        child: intl.get(`hzero.common.button.release`).d('发布'),
        btnProps: {
          icon: 'rocket',
          loading:
            fetchListLoading || fetchSaveLoading || fetchDeteteLoading || fetchReleaseLoading,
          disabled: this.releaseButtonDisabled(),
          onClick: this.handlePublish,
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
        btnPermissions?.close &&
        btnPermissions?.close.approve === false &&
        btnPermissions?.close?.controllerType === 'hidden'
      )
    ) {
      btns.push({
        name: 'close',
        child: intl.get(`hzero.common.button.close`).d('关闭'),
        btnComp: Button,
        btnProps: {
          icon: 'close',
          type: 'c7n-pro',
          loading: fetchListLoading,
          disabled:
            this.closeButtonDisabled() ||
            (btnPermissions?.close &&
              btnPermissions?.close.approve === false &&
              btnPermissions?.close?.controllerType !== 'hidden'),
          onClick: this.handleClose,
          style: { display: 'block', border: 'none', textAlign: 'left' },
        },
      });
    }

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
          name: 'export',
          noNest: true,
          child: (text) => (
            <ExcelExport
              data-name="export"
              {...{
                otherButtonProps: {
                  icon: 'unarchive',
                  type: 'c7n-pro',
                  style: {
                    display: 'inline-block',
                    border: 'none',
                    textAlign: 'left',
                    paddingLeft: '6px',
                  },
                  disabled:
                    btnPermissions?.export &&
                    btnPermissions?.export.approve === false &&
                    btnPermissions?.export?.controllerType !== 'hidden',
                },
                requestUrl: this.requestUrl(),
                queryParams: this.deleteDisabled(true)
                  ? this.queryParams()
                  : this.queryParams(true),
                buttonText:
                  text ||
                  (!this.deleteDisabled(true)
                    ? intl.get(`sodr.common.view.tab.checkExport`).d('勾选导出')
                    : intl.get('hzero.common.button.export').d('导出')),
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
        //   name: 'checkExportPro',
        //   btnComp: ExcelExportPro,
        //   btnProps: {
        //     templateCode,
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
        //     loading: fetchListLoading,
        //     buttonText: intl.get(`sodr.common.view.tab.checkExport.new`).d('勾选导出-新'),
        //   },
        // },
        {
          name: 'newExport',
          noNest: true,
          child: (text) => (
            <ExcelExportPro
              data-name="newExport"
              {...{
                templateCode,
                otherButtonProps: {
                  icon: 'unarchive',
                  type: 'c7n-pro',
                  disabled:
                    btnPermissions?.newExport &&
                    btnPermissions?.newExport.approve === false &&
                    btnPermissions?.newExport?.controllerType !== 'hidden',
                },
                requestUrl: this.requestUrl(),
                queryParams: this.deleteDisabled(true)
                  ? this.queryParams()
                  : this.queryParams(true),
                loading: fetchListLoading,
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

    if (
      !(
        btnPermissions?.import &&
        btnPermissions?.import.approve === false &&
        btnPermissions?.import?.controllerType === 'hidden'
      )
    ) {
      btns.push({
        name: 'batchImport',
        btnComp: PermissionButton,
        child: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        btnProps: {
          disabled:
            btnPermissions?.import &&
            btnPermissions?.import.approve === false &&
            btnPermissions?.import?.controllerType !== 'hidden',
          onClick: this.handleImport,
          icon: 'archive',
          type: 'c7n-pro',
          style: { display: 'block', border: 'none', textAlign: 'left', paddingLeft: '14px' },
        },
      });
    }

    if (
      !(
        btnPermissions?.newImport &&
        btnPermissions?.newImport.approve === false &&
        btnPermissions?.newImport?.controllerType === 'hidden'
      )
    ) {
      btns.push({
        name: 'newBatchImport',
        noNest: true,
        child: (text) => (
          <CommonImport
            data-name="newBatchImport"
            {...{
              prefixPatch: `${SRM_SPRM}`,
              businessObjectTemplateCode,
              icon: 'archive',
              type: 'c7n-pro',
              buttonText:
                text || intl.get('hzero.common.viewtitle.batchImport.new').d('批量导入-新'),
              buttonProps: {
                disabled:
                  btnPermissions?.newImport &&
                  btnPermissions?.newImport.approve === false &&
                  btnPermissions?.newImport?.controllerType !== 'hidden',
              },
              successCallBack: () => {
                notification.success();
                switch (activeKey) {
                  case 'annualForecast':
                    this.fetchAnnualForecastList();
                    break;
                  case 'monthlyForecast':
                    this.fetchMonthlyForecastList();
                    break;
                  case 'weekForecast':
                    this.fetchWeekForecastList();
                    break;
                  case 'projectForecast':
                    this.fetchProjectForecastList();
                    break;
                  default:
                    break;
                }
              },
            }}
          />
        ),
      });
    }

    return btns;
  }

  render() {
    const {
      annualForecast = {},
      monthlyForecast = {},
      projectForecast = {},
      weekForecast = {},
      enumMap = {},
      fetchListLoading = false,
      // fetchSaveLoading = false,
      fetchOperationRecordListLoading = false,
      customizeTabPane,
      customizeTable,
      customizeBtnGroup,
      selectedKeys,
    } = this.props;
    const {
      projectForecastSelectedRowKeys,
      monthlyForecastSelectedRowKeys,
      annualForecastSelectedRowKeys,
      weekForecastSelectedRowKeys,
    } = selectedKeys;
    const {
      activeKey,
      operationRecordModalVisible,
      operationRecordPagination,
      operationRecordList,
    } = this.state;
    const annualForecastProps = {
      annualForecast,
      fetchList: this.fetchAnnualForecastList,
      bindForm: this.bindForm,
      fetchListLoading,
      handleRowSelectChange: this.handleRowSelectChange,
      selectedRowKeys: annualForecastSelectedRowKeys,
      setModelValue: this.setModelValue,
      activeKey,
      handleShowRecordModal: this.handleShowRecordModal,
      enumMap,
      handleItemChange: this.handleItemChange,
      clearSelected: this.clearSelected,
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
      handleShowRecordModal: this.handleShowRecordModal,
      enumMap,
      handleItemChange: this.handleItemChange,
      clearSelected: this.clearSelected,
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
      handleShowRecordModal: this.handleShowRecordModal,
      enumMap,
      handleItemChange: this.handleItemChange,
      clearSelected: this.clearSelected,
      customizeTable,
    };
    const weekForecastProps = {
      customizeTable,
      weekForecast,
      fetchList: this.fetchWeekForecastList,
      bindForm: this.bindForm,
      fetchListLoading,
      handleRowSelectChange: this.handleRowSelectChange,
      selectedRowKeys: weekForecastSelectedRowKeys,
      setModelValue: this.setModelValue,
      activeKey,
      handleShowRecordModal: this.handleShowRecordModal,
      enumMap,
      handleItemChange: this.handleItemChange,
      clearSelected: this.clearSelected,
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
          title={intl.get(`${promptCode}.view.message.title.demandForecastQuery`).d('预测单查询')}
        >
          <>
            {customizeBtnGroup(
              { code: 'SPRM.PREDICTION_ORDER_CREATION.BTNS', pro: true },
              <DynamicButtons buttons={this.headerButtons()} />
            )}
          </>
        </Header>
        <Content>
          {customizeTabPane(
            { code: 'SPRM.PREDICTION_ORDER_CREATION.TAB' },
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
