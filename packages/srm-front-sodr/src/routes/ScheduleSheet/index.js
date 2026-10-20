/*
 * ScheduleSheet - 新版排程单
 * @date: 2018/10/13 11:47:39
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Tabs, Modal } from 'hzero-ui';
import { Modal as ModalPro } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { isEmpty, isArray, findIndex, isNil, throttle } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { routerRedux } from 'dva/router';
import { stringify } from 'querystring';
import moment from 'moment';
import DynamicButtons from '_components/DynamicButtons';
import notification from 'utils/notification';
import intl from 'utils/intl';
import {
  getUserOrganizationId,
  getCurrentOrganizationId,
  getEditTableData,
  addItemsToPagination,
  delItemsToPagination,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_SPUC } from '_utils/config';
import { DATETIME_MIN, DATETIME_MAX, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImport from 'hzero-front/lib/components/Import';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import remoteFunc from 'hzero-front/lib/utils/remote';
// import { btnGroup } from './utils';
import { getCuzDefaultTab } from './utils';
import CreateList from './List'; // 创建列表
import UpdateList from './DetailSearch';
import PlanConfirm from './PlanConfirm';
import OperationRecord from '../components/NewPlantOperationRecord/OperationRecord';
import PlanNum from './PlantNum';
import AsnNumsModel from './AsnNumsModel';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';

import styles from './index.less';

const { TabPane } = Tabs;

/**
 * 计划单
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} scheduleSheet - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@remoteFunc({
  code: 'SODR_SCHEDULES_SHEET_LIST',
  name: 'remote',
})
@formatterCollections({
  code: [
    'sinv.common',
    'ssrc.inquiryHall',
    'sodr.scheduleSheet',
    'sodr.schedule',
    'sodr.common',
    'sodr.sheet',
    'entity.company',
    'entity.order',
    'entity.customer',
    'entity.business',
    'entity.organization',
    'entity.item',
    'sodr.orderMaintain',
    'sodr.orderApproval',
    'entity.supplier',
    'sodr.sendOrder',
    'sodr.quotePurchase',
    'sodr.supplierScheduleSheet',
    'sodr.orderType',
    'sodr.quotePurchaseRequisition',
  ],
})
@withCustomize({
  unitCode: [
    'SODR.PLAN_SHEET_CREATE.LIST_CREAT_BTNS',
    'SODR.PLAN_SHEET_UPDATE.NEW_BTNS',
    'SODR.PLAN_SHEET_UPDATE.LIST',
    'SODR.PLAN_SHEET_CREATE.LIST_NEW',
    'SODR.PLAN_SHEET_CREATE.QUERY_FORM',
    'SODR.PLAN_SHEET_UPDATE.QUERY_FORM',
    'SODR.PLAN_SHEET_CREATE.TAB',
  ],
})
@connect(({ loading, scheduleSheet }) => ({
  loadingList: loading.effects['scheduleSheet/queryPlanCreateList'],
  loadingDetailList: loading.effects['scheduleSheet/queryPlanUpdateList'],
  createQueryLoading: loading.effects['scheduleSheet/createQuery'],
  createSaveLoading: loading.effects['scheduleSheet/savePlan'],
  createDeleteLoading: loading.effects['scheduleSheet/deletePlan'],
  createReleaseLoading: loading.effects['scheduleSheet/releasePlan'],
  updateReleaseLoading: loading.effects['scheduleSheet/releasePlan'],
  feedbackAgreePlanLoading: loading.effects['scheduleSheet/feedbackAgreePlan'],
  updateCancelLoading: loading.effects['scheduleSheet/cancelPlan'],
  operationAsnNumsLoading: loading.effects['scheduleSheet/operationAsnNums'],
  createSurePlanLoading: loading.effects['scheduleSheet/createSurePlan'],
  deleteWarnPlanLoading: loading.effects['scheduleSheet/deleteWarnPlan'],
  operationRecordLoading: loading.effects['scheduleSheetCommon/operationRecord'],
  scheduleSheet,
}))
export default class ScheduleSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // : 'list',
      tenantId: getCurrentOrganizationId(),
      supplierTenantId: getUserOrganizationId(),
      selectedCreateRowKeys: [], // 创建计划单 key,
      selectedCreateQueryRows: [],
      selectedUpdateRowKeys: [], // 修改计划单 key,
      selectedUpdateRows: [],
      operatingVisible: false, // 操作记录模态框
      planId: null, // 计划单主键id
      createVisible: false, // 新建模态框false
      selectedCreateQueryRowKeys: [],
      selectedCreateRows: [],
      createFlag: false, // 新建按钮标识
      asnNumsVisible: false, // 送货单模态框
      poLineLocationId: null, // 计划单订单发运行id
      existSapFlag: false, // 非SRM来源排程单
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    const cuzCodes = String(['SODR.PLAN_SHEET_CREATE.TAB']);
    const defaultTab = await getCuzDefaultTab(cuzCodes);
    const { fieldCode = 'list' } = defaultTab || {};
    // 值集查询
    dispatch({
      type: 'scheduleSheet/init',
      payload: {
        radioTab: fieldCode,
      },
    });
    this.fetchSetting();
    this.handleTabsChange(fieldCode);
    window.addEventListener('message', this.handleEvent);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleEvent);
  }

  /**
   * 监听二开请求
   * @param {*} e
   */
  @Bind()
  handleEvent(e) {
    const { type, payload } = e.data;
    if (type === 'sodr/schedule-sheet/list' && payload === 'MARUBI') {
      this.handleSearch();
    }
  }

  // erp来源计划时控制 新建按钮
  @Bind()
  fetchSetting() {
    const { dispatch } = this.props;
    dispatch({
      type: 'scheduleSheet/fetchSettings',
    }).then((res) => {
      if (res && Number(res['010801'])) {
        this.setState({
          createFlag: true,
        });
      }
    });
  }

  /**
   * 查询列表
   * @param {Object} fields
   * @param {*} otherParams
   */
  @Bind()
  handleSearch(page = {}, key) {
    const radioTab = key || this.props.scheduleSheet.radioTab;
    if (radioTab === 'list') {
      const fields = this.listForm ? this.listForm.searchForm.props.form.getFieldsValue() : {};
      const allFields = this.handleFormQuery(fields);
      const { planDate, ...handleFormValues } = allFields;
      this.handleSearchList({
        page,
        ...handleFormValues,
      });
      this.setState(
        {
          selectedCreateRowKeys: [],
          selectedCreateRows: [],
        },
        () => {
          this.props.dispatch({
            type: 'scheduleSheet/updateState',
            payload: {
              selectedCreateRowKeys: [],
            },
          });
        }
      );
    } else {
      const fields = this.detailForm ? this.detailForm.searchForm.props.form.getFieldsValue() : {};
      const handleFormValues = this.handleFormQuery(fields);
      this.handleSearchDetailList({
        page,
        ...handleFormValues,
      });
      this.setState(
        {
          selectedUpdateRowKeys: [],
          selectedUpdateRows: [],
        },
        () => {
          this.props.dispatch({
            type: 'scheduleSheet/updateState',
            payload: {
              selectedUpdateRowKeys: [],
            },
          });
        }
      );
    }
  }

  @Bind()
  onCreatePageChange(page, sort, isChangePage = false) {
    const fields = this.listForm ? this.listForm.searchForm.props.form.getFieldsValue() : {};
    const allFields = this.handleFormQuery(fields);
    const { planDate, ...handleFormValues } = allFields;
    this.handleSearchList(
      {
        page,
        sort,
        ...handleFormValues,
      },
      isChangePage
    );
  }

  @Bind()
  onUpdatePageChange(page, sort, isChangePage = false) {
    const fields = this.detailForm ? this.detailForm.searchForm.props.form.getFieldsValue() : {};
    const handleFormValues = this.handleFormQuery(fields);
    this.handleSearchDetailList(
      {
        page,
        sort,
        ...handleFormValues,
      },
      isChangePage
    );
  }

  /**
   * 查询创建列表
   * @param fields
   */
  @Bind()
  handleSearchList(fields, isChangePage = false) {
    const {
      dispatch,
      scheduleSheet: {
        planCreateListPagination: { total },
      },
    } = this.props;
    const payload = {
      ...fields,
      customizeUnitCode: 'SODR.PLAN_SHEET_CREATE.LIST_NEW,SODR.PLAN_SHEET_CREATE.QUERY_FORM',
      asyncCountFlag: 'DEFAULT',
      ...(isChangePage ? { oldTotalElements: total } : null),
    };
    dispatch({
      type: 'scheduleSheet/queryPlanCreateList',
      payload,
    }).then((res) => {
      if (res && res.needCountFlag === 'Y') {
        dispatch({
          type: 'scheduleSheet/queryPlanCreateListPage',
          payload,
        });
      }
    });
  }

  /**
   * 查询维护列表
   */
  @Bind()
  handleSearchDetailList(fields, isChangePage = false) {
    const {
      dispatch,
      scheduleSheet: {
        planUpdateList,
        planUpdateListPagination: { total },
      },
    } = this.props;
    const payload = {
      ...fields,
      customizeUnitCode: 'SODR.PLAN_SHEET_UPDATE.LIST,SODR.PLAN_SHEET_UPDATE.QUERY_FORM',
      asyncCountFlag: 'DEFAULT',
      ...(isChangePage ? { oldTotalElements: total } : null),
    };
    dispatch({
      type: 'scheduleSheet/queryPlanUpdateList',
      payload,
    }).then((res) => {
      if (res && res.needCountFlag === 'Y') {
        dispatch({
          type: 'scheduleSheet/queryPlanUpdateListPage',
          payload,
        });
      }
      planUpdateList.forEach((i) => {
        if (i.$form && i.$form.resetFields && typeof i.$form.resetFields === 'function') {
          i.$form.resetFields();
        }
      });
    });
  }

  /**
   * 拆分
   */
  @Bind()
  handleTranslate(record) {
    const {
      scheduleSheet: { planCreateList = [], planCreateListPagination = {} },
      dispatch,
    } = this.props;
    const newItem = {
      ...record,
      planId: uuid(),
      uuidFlag: true,
      planQuantity: undefined,
      planDate: null,
      purchaserRemark: null,
      _status: 'create',
      objectVersionNuber: null,
      _token: null,
    };
    const index = findIndex(planCreateList, function (o) {
      return o.planId === record.planId;
    });
    planCreateList.splice(index, 0, newItem);
    const newPagaination = addItemsToPagination(1, planCreateList.length, planCreateListPagination);
    dispatch({
      type: 'scheduleSheet/updateState',
      payload: { planCreateList, planCreateListPagination: newPagaination },
    });
  }

  /**
   * 关联送货单
   * @param {*} record
   */
  @Bind()
  handleToAsnNums(record) {
    this.setState({
      asnNumsVisible: true,
      poLineLocationId: record.poLineLocationId,
      planId: record.planId,
    });
  }

  @Bind()
  hideAsnNumsModel(flag) {
    this.setState({ asnNumsVisible: flag });
  }

  /**
   * 选中行创建查询计划单改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleCreateQueryRowSelectChange(newSelectedRowKeys, selectedCreateQueryRows) {
    this.setState({ selectedCreateQueryRowKeys: newSelectedRowKeys, selectedCreateQueryRows });
  }

  /**
   * 选中行创建计划单改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleCreateListRowSelectChange(newSelectedRowKeys, rows) {
    this.setState({ selectedCreateRowKeys: newSelectedRowKeys, selectedCreateRows: rows }, () => {
      this.props.dispatch({
        type: 'scheduleSheet/updateState',
        payload: {
          selectedCreateRowKeys: newSelectedRowKeys,
        },
      });
    });
  }

  /**
   * 明细选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleUpdateSelectChange(selectedRowKeys, rows) {
    // 个性化二开按钮组行标识
    const {
      scheduleSheet: { planUpdateList = [] },
    } = this.props;
    const cuzOrderList = planUpdateList.map((order) => {
      return {
        ...order,
        cuz_selected: selectedRowKeys.includes(order.planId),
      };
    });
    const existSapFlag = rows.filter((n) => n.sourceCode !== 'SRM').length > 0;
    this.setState(
      {
        selectedUpdateRowKeys: selectedRowKeys,
        selectedUpdateRows: rows,
        existSapFlag,
      },
      () => {
        this.props.dispatch({
          type: 'scheduleSheet/updateState',
          payload: {
            selectedUpdateRowKeys: selectedRowKeys,
            planUpdateList: cuzOrderList,
          },
        });
      }
    );
  }

  @Bind()
  handleTabsChange(key) {
    const {
      scheduleSheet: { planCreateListPagination = {}, planUpdateListPagination = {} },
      dispatch,
    } = this.props;
    if (key === 'list') {
      this.handleSearch(planCreateListPagination, key);
    } else if (this.detailForm) {
      this.handleSearch(planUpdateListPagination, key);
    }
    dispatch({
      type: 'scheduleSheet/updateState',
      payload: {
        radioTab: key === 'list' ? 'list' : 'detail',
      },
    });
  }

  /**
   *  创建计划单
   */
  @Bind()
  handleCreatePlan() {
    this.setState(
      {
        createVisible: true,
      },
      () => this.handleCreateQuery(false)
    );
  }

  /**
   *取消计划单
   */
  @Bind()
  handleCancelPlan() {
    const { dispatch } = this.props;
    const { selectedUpdateRows = [] } = this.state;
    Modal.confirm({
      title: intl
        .get(`sodr.scheduleSheet.view.message.title.confirmCancelPlan`)
        .d('是否确认取消计划单'),
      onOk: throttle(
        () => {
          const newCreateParams = getEditTableData(selectedUpdateRows, ['planId']).map((record) => {
            const { planDate } = record;
            return {
              ...record,
              planDate: planDate ? moment(planDate).format(DATETIME_MIN) : undefined,
            };
          });
          dispatch({
            type: 'scheduleSheet/cancelPlan',
            payload: newCreateParams,
          }).then((res) => {
            if (res) {
              notification.success();
              this.handleSearch();
            }
          });
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  }

  /**
   * 校验计划单发布
   * @param {Array} releasePlan
   * @return {String}
   */
  @Bind()
  validateReleasePlan(releasePlan) {
    let warning;
    for (let i = 0; i < releasePlan.length; i++) {
      const plan = releasePlan[i];
      // 校验计划数量
      if (!plan.planQuantity) {
        warning = intl
          .get('sodr.supplierScheduleSheet.view.message.warning.planQuantity')
          .d(`数量为零，请检查后重新发布`);
      }
      break;
    }
    return warning;
  }

  /**
   *发布计划单
   */
  @Bind()
  handleReleasePlan(status) {
    const { dispatch } = this.props;
    const { selectedCreateRows = [], selectedUpdateRows = [] } = this.state;
    Modal.confirm({
      title: intl
        .get(`sodr.scheduleSheet.view.message.title.confirmReleasePlan`)
        .d('是否确认发布计划单'),
      onOk: throttle(
        () => {
          // const newUpdateParams = updateParams.map(item => {
          //   return {
          //     ...item,
          //     planDate: item.planDate.format(DATETIME_MIN),
          //   };
          // });
          if (status === 'create') {
            const createParams = getEditTableData(selectedCreateRows, ['planId']);
            const newCreateParams = createParams.map((item) => {
              return {
                ...item,
                planDate: moment(item.planDate).format(DEFAULT_DATETIME_FORMAT),
              };
            });
            const warning = this.validateReleasePlan(newCreateParams);
            if (warning) {
              notification.error({
                description: warning,
              });
              return;
            }
            if (!isEmpty(newCreateParams)) {
              dispatch({
                type: 'scheduleSheet/releasePlan',
                payload: newCreateParams,
              }).then((response) => {
                if (response) {
                  notification.success();
                  this.handleSearch();
                }
              });
            }
          } else {
            const updateParams = getEditTableData(selectedUpdateRows, ['planId']).map((record) => {
              const { planDate } = record;
              return {
                ...record,
                planDate: planDate ? moment(planDate).format(DATETIME_MIN) : undefined,
              };
            });
            if (!isEmpty(updateParams)) {
              dispatch({
                type: 'scheduleSheet/releasePlan',
                payload: updateParams,
              }).then((response) => {
                if (response) {
                  notification.success();
                  this.handleSearch();
                }
              });
            }
          }
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  }

  /**
   *保存计划单
   */
  @Bind()
  handleSavePlan() {
    const { dispatch } = this.props;
    const { selectedCreateRows = [] } = this.state;
    Modal.confirm({
      title: intl
        .get(`sodr.scheduleSheet.view.message.title.confirmSavePlan`)
        .d('是否确认保存计划单'),
      onOk: throttle(
        () => {
          const params = getEditTableData(selectedCreateRows, ['planId', '_status']);
          const newParams = params.map((item) => {
            return {
              ...item,
              planDate: moment(item.planDate).format(DEFAULT_DATETIME_FORMAT),
            };
          });
          if (!isEmpty(newParams)) {
            dispatch({
              type: 'scheduleSheet/savePlan',
              payload: newParams,
            }).then((response) => {
              if (response) {
                notification.success();
                dispatch({
                  type: 'scheduleSheet/updateState',
                  payload: { planCreateList: [] },
                });
                this.handleSearch();
              }
            });
          }
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  }

  /**
   *删除计划单
   */
  @Bind()
  async handleDeletePlan() {
    const {
      dispatch,
      scheduleSheet: { planCreateList = [], planCreateListPagination = {} },
    } = this.props;
    const { selectedCreateRows = [] } = this.state;
    // 先删除拆分行
    const selectedSplitRows = selectedCreateRows.filter((item) => item.uuidFlag);
    const selectedSplitRowKeys = selectedSplitRows.map((item) => item.planId);
    const selectedOriginRows = selectedCreateRows.filter((item) => !item.uuidFlag);
    const selectedOriginRowsKeys = selectedOriginRows.map((item) => item.planId);
    const filterSplitList = planCreateList.filter(
      (item) => !selectedSplitRowKeys.includes(item.planId)
    );
    const deleteList = async () => {
      if (selectedSplitRows.length) {
        await dispatch({
          type: 'scheduleSheet/updateState',
          payload: {
            planCreateList: filterSplitList,
            planCreateListPagination: delItemsToPagination(
              selectedSplitRowKeys.length,
              planCreateList.length,
              planCreateListPagination
            ),
            selectedCreateRows: selectedCreateRows.filter((i) => !i.uuidFlag),
          },
        });
      }
      // 再删除原行
      if (selectedOriginRows.length) {
        const res = await dispatch({
          type: 'scheduleSheet/deletePlan',
          payload: selectedOriginRows.map((item) => {
            const obj = item;
            delete obj.$form;
            return { ...obj };
          }),
        });
        if (res) {
          notification.success();
          this.handleSearch();
        }
      }
    };
    // 删除弱校验弹框提示
    const deleteWarn = async () => {
      const warnResult = await dispatch({
        type: 'scheduleSheet/deleteWarnPlan',
        payload: selectedOriginRowsKeys,
      });
      return warnResult;
    };
    const res = await deleteWarn();
    if (!res) return false;
    if (isArray(res) && isEmpty(res)) {
      Modal.confirm({
        title: intl
          .get(`sodr.scheduleSheet.view.message.title.confirmDeletePlan`)
          .d('是否确认删除计划单'),
        onOk: throttle(deleteList, THROTTLE_TIME, { trailing: false }),
      });
    } else {
      ModalPro.confirm({
        style: { width: 742 },
        children: <PlanConfirm data={res} />,
        className: styles['schedule-sheet-modal-confirm'],
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: throttle(deleteList, THROTTLE_TIME, { trailing: false }),
      });
    }
  }

  /**
   * 跳转到列表的详情页
   * @param {String} poHeaderId
   */
  @Bind()
  redirectToDetail(record) {
    const { poHeaderId, poSourcePlatform } = record;
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sodr/send-order/detail/${poHeaderId}`,
        search: poSourcePlatform ? stringify({ poSourcePlatform }) : stringify({}),
      })
    );
  }

  delObjectKey = (obj) => {
    const param = {};
    if (obj === null || obj === '' || obj === undefined) return param;
    for (const key in obj) {
      if (obj[key] !== null) {
        param[key] = obj[key];
      }
    }
    return param;
  };

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    let timeArray = [];
    timeArray = [
      'needByDateStart',
      'needByDateEnd',
      'creationDateEnd',
      'creationDateStart',
      'lastUpdateDateStart',
      'lastUpdateDateEnd',
    ];

    timeArray.forEach((item) => {
      if (item === 'needByDateEnd' || item === 'creationDateEnd' || item === 'lastUpdateDateEnd') {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
      } else {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
      }
    });
    const _filterValues = this.delObjectKey(filterValues);
    const { queryPlanStatusList = [] } = filterValues;
    return {
      ..._filterValues,
      ...dealTime,
      queryPlanStatusList: queryPlanStatusList.toString(),
    };
  }

  /**
   * 跳转详情
   */
  @Bind()
  onJumpDetail(record) {
    const { history } = this.props;
    history.push({
      pathname: `/sodr/plan-sheet/detail/${record.planHeaderId}`,
    });
  }

  /**
   * 操作记录
   */
  @Bind()
  handleOperating(flag, record) {
    if (flag) {
      this.setState({
        operatingVisible: true,
        planId: record.planId,
      });
    } else {
      this.setState({
        operatingVisible: false,
      });
    }
  }

  /**
   * 隐藏弹窗
   */
  @Bind()
  handleChangeVisible() {
    this.setState({
      createVisible: false,
    });
  }

  /**
   * 新建查询
   */
  @Bind()
  handleCreateQuery(flag, page, pageFlag = 1) {
    const {
      dispatch,
      scheduleSheet: {
        createQueryListPagination: { total },
      },
    } = this.props;
    const payload = {
      ...(flag ? this.planCreateForm.planNumForm.props.form.getFieldsValue() : null),
      page,
      customizeUnitCode: 'SODR.PLAN_SHEET.CREATE_LIST,SODR.PLAN_SHEET.CREATE_FILTER_FORM',
      asyncCountFlag: 'DEFAULT',
      ...(pageFlag ? null : { oldTotalElements: total }),
    };
    dispatch({
      type: 'scheduleSheet/createQuery',
      payload,
    }).then((res) => {
      if (res && res.needCountFlag === 'Y') {
        dispatch({
          type: 'scheduleSheet/createQueryPage',
          payload,
        });
      }
    });
    if (pageFlag) {
      this.setState({ selectedCreateQueryRowKeys: [], selectedCreateQueryRows: [] });
    }
  }

  /**
   * 确认新建
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleChangeSure() {
    const { selectedCreateQueryRowKeys } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'scheduleSheet/createSurePlan',
      payload: { selectedCreateQueryRowKeys },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchList();
        this.setState({
          createVisible: false,
        });
      }
    });
  }

  /**
   * 计划单的批量导入
   */
  @Bind()
  handleImport() {
    const option = {
      pathname: '/sodr/schedule-sheet/data-import/SSPL.PLAN_IMPORT',
      search: stringify({
        action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        backPath: `/sodr/schedule-sheet/list`,
      }),
    };
    this.props.history.push(option);
  }

  /**
   * 计划单的批量导入
   */
  @Bind()
  materielImport() {
    const option = {
      pathname: '/sodr/schedule-sheet/data-import/SSPL.PLAN_ITEM_IMPORT',
      search: stringify({
        action: intl.get('sodr.scheduleSheet.button.materiel').d('物料批量导入'),
        backPath: `/sodr/schedule-sheet/list`,
      }),
    };
    this.props.history.push(option);
  }

  /**
   * 查询送货单列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleAsnNumsSearch(page = {}) {
    const { dispatch } = this.props;
    const { poLineLocationId, planId } = this.state;
    dispatch({
      type: `scheduleSheet/operationAsnNums`,
      payload: {
        page,
        poLineLocationId,
        planId,
      },
    });
  }
  /**
   * 导出查询参数 list需转为数组
   * @returns
   */

  @Bind()
  handleParams(radioTab) {
    let handleFormValues;
    if (radioTab === 'list') {
      const fields = this.listForm ? this.listForm.searchForm.props.form.getFieldsValue() : {};
      handleFormValues = this.handleFormQuery(fields);
    } else {
      const fields = this.detailForm ? this.detailForm.searchForm.props.form.getFieldsValue() : {};
      handleFormValues = this.handleFormQuery(fields);
    }
    const { itemCodes, queryPlanStatusList } = handleFormValues;
    const planStatusList = isEmpty(queryPlanStatusList) ? [] : queryPlanStatusList.split(',');
    const itemCode = isNil(itemCodes) ? itemCodes : itemCodes.split(',');
    return { ...handleFormValues, itemCodes: itemCode, queryPlanStatusList: planStatusList };
  }

  @Bind()
  handleFeedbackAgreePlan() {
    const { dispatch } = this.props;
    const { selectedUpdateRows = [] } = this.state;
    Modal.confirm({
      title: intl
        .get(`sodr.scheduleSheet.view.message.title.confirmFeedbackAgreePlan`)
        .d('是否确认反馈同意计划单'),
      onOk: throttle(
        () => {
          const updateParams = getEditTableData(selectedUpdateRows, ['planId']).map((record) => {
            const { planDate } = record;
            return {
              ...record,
              planDate: planDate ? moment(planDate).format(DATETIME_MIN) : undefined,
            };
          });
          if (!isEmpty(updateParams)) {
            dispatch({
              type: 'scheduleSheet/feedbackAgreePlan',
              payload: updateParams,
            }).then((response) => {
              if (response) {
                notification.success();
                this.handleSearch();
              }
            });
          }
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  }

  // 计划单创建
  @Bind()
  headerBtnsRender() {
    const {
      scheduleSheet: { radioTab },
      createSaveLoading,
      createDeleteLoading,
      createReleaseLoading,
      deleteWarnPlanLoading,
    } = this.props;
    const { selectedCreateRowKeys, createFlag, tenantId } = this.state;
    const createpoLineLocationId = selectedCreateRowKeys.join(',');
    const primaryExportBtnProps = {
      icon: 'export',
    };
    const listCheckExportBtnProps = {
      icon: 'export',
      disabled: isArray(selectedCreateRowKeys) && isEmpty(selectedCreateRowKeys),
    };
    const btns = [
      {
        name: 'release',
        child: intl.get('sodr.common.button.scheduleSheet.release').d('发布'),
        btnProps: {
          icon: 'rocket',
          type: 'primary',
          disabled: isEmpty(selectedCreateRowKeys),
          onClick: () => this.handleReleasePlan('create'),
          loading:
            createReleaseLoading ||
            createSaveLoading ||
            createDeleteLoading ||
            deleteWarnPlanLoading,
        },
      },
      {
        name: 'save',
        child: intl.get('sodr.common.button.scheduleSheet.save').d('保存'),
        btnProps: {
          icon: 'save',
          disabled: isEmpty(selectedCreateRowKeys),
          onClick: this.handleSavePlan,
          loading:
            createSaveLoading ||
            createDeleteLoading ||
            createReleaseLoading ||
            deleteWarnPlanLoading,
        },
      },
      {
        name: 'delete',
        child: intl.get('sodr.common.button.scheduleSheet.delete').d('删除'),
        btnProps: {
          icon: 'delete',
          disabled: isEmpty(selectedCreateRowKeys),
          onClick: this.handleDeletePlan,
          loading:
            createDeleteLoading ||
            createSaveLoading ||
            createReleaseLoading ||
            deleteWarnPlanLoading,
        },
      },
      {
        name: 'create',
        child: intl.get('sodr.common.button.scheduleSheet.createPlan').d('新建'),
        btnProps: {
          icon: 'plus',
          disabled: createFlag,
          onClick: this.handleCreatePlan,
        },
      },
      {
        name: 'materielImportPro',
        btnComp: CommonImport,
        // childFor: 'buttonText',
        btnProps: {
          businessObjectTemplateCode: 'SSPL.PLAN_IMPORT',
          prefixPatch: SRM_SPUC,
          refreshButton: true,
          buttonText: intl.get(`hzero.common.button.newBatchImport`).d('(新)批量导入'),
          buttonProps: {
            permissionList: [
              {
                code: 'srm.po-admin.plan.scheduling.new-release.ps.button.newimport',
                type: 'c7n-pro',
                meaning: '计划排程创建-新版导入',
              },
            ],
          },
        },
      },
      {
        name: 'planImportPro',
        btnComp: CommonImport,
        // childFor: 'buttonText',
        btnProps: {
          businessObjectTemplateCode: 'SSPL.PLAN_ITEM_IMPORT',
          prefixPatch: SRM_SPUC,
          refreshButton: true,
          buttonText: intl.get(`sodr.common.view.button.newItemBatchImport`).d('(新)物料批量导入'),
          buttonProps: {
            permissionList: [
              {
                code: 'srm.po-admin.plan.scheduling.new-release.ps.button.newitemimport',
                type: 'c7n-pro',
                meaning: '计划排程创建-新版物料导入',
              },
            ],
          },
        },
      },
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        // childFor: 'buttonText',
        btnProps: {
          buttonText: selectedCreateRowKeys.length
            ? intl.get(`hzero.common.button.newSelectedExport`).d('新版勾选导出')
            : intl.get(`hzero.common.button.newExport`).d('新版导出'),
          templateCode: 'SPUC_ORDER_PLAN_EXPORT_NEW',
          otherButtonProps: {
            icon: 'unarchive',
            permissionList: [
              {
                code: 'srm.po-admin.plan.scheduling.new-release.ps.button.newexport',
                type: 'c7n-pro',
                meaning: '计划排程创建-新版导出',
              },
            ],
          },
          method: 'POST',
          allBody: true,
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/plans/batch-export/new/new-module`,
          queryParams: selectedCreateRowKeys.length
            ? {
                planIds: createpoLineLocationId,
                customizeUnitCode:
                  'SODR.PLAN_SHEET_CREATE.LIST_NEW,SODR.PLAN_SHEET_CREATE.QUERY_FORM',
              }
            : {
                ...this.handleParams(radioTab),
                customizeUnitCode:
                  'SODR.PLAN_SHEET_CREATE.LIST_NEW,SODR.PLAN_SHEET_CREATE.QUERY_FORM',
              },
        },
      },
      {
        name: 'planImport',
        child: intl.get('sodr.scheduleSheet.button.planImport').d('批量导入'),
        btnProps: {
          onClick: this.handleImport,
        },
      },
      {
        name: 'materielImport',
        child: intl.get('sodr.scheduleSheet.button.materiel').d('物料批量导入'),
        btnProps: {
          onClick: this.materielImport,
        },
      },
      {
        name: 'export',
        btnComp: ExcelExport,
        childFor: 'buttonText',
        btnProps: {
          otherButtonProps: primaryExportBtnProps,
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/plans/batch-export/new`,
          queryParams: () => this.handleParams(radioTab),
          method: 'POST',
        },
      },
      {
        name: 'checkExport',
        btnComp: ExcelExport,
        childFor: 'buttonText',
        child: intl.get(`sodr.common.view.tab.checkExport`).d('勾选导出'),
        btnProps: {
          otherButtonProps: listCheckExportBtnProps,
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/plans/batch-export/new`,
          queryParams: { planIds: createpoLineLocationId },
          method: 'POST',
        },
      },
    ];

    return btns;
  }

  // 计划单更新
  @Bind()
  headerBtnsDetail() {
    const {
      scheduleSheet: { radioTab, planUpdateList = [] },
      updateReleaseLoading,
      updateCancelLoading,
      feedbackAgreePlanLoading,
      remote,
    } = this.props;
    const { tenantId, selectedUpdateRowKeys, existSapFlag } = this.state;
    const primaryExportBtnProps = {
      icon: 'export',
    };

    const updateListCheckExportBtnProps = {
      icon: 'export',
      disabled: isArray(selectedUpdateRowKeys) && isEmpty(selectedUpdateRowKeys),
    };
    const updatepoLineLocationId = selectedUpdateRowKeys.join(',');
    const btns = [
      {
        name: 'release',
        child: intl.get('sodr.common.button.scheduleSheet.release').d('发布'),
        btnProps: {
          icon: 'rocket',
          type: 'primary',
          disabled:
            (isArray(selectedUpdateRowKeys) && isEmpty(selectedUpdateRowKeys)) || existSapFlag,
          onClick: () => this.handleReleasePlan('update'),
          loading: updateReleaseLoading,
        },
      },
      {
        name: 'cancel',
        child: intl.get('sodr.common.button.scheduleSheet.cancel').d('取消'),
        btnProps: {
          icon: 'cancel',
          disabled:
            (isArray(selectedUpdateRowKeys) && isEmpty(selectedUpdateRowKeys)) || existSapFlag,
          onClick: this.handleCancelPlan,
          loading: updateCancelLoading,
        },
      },
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        // childFor: 'buttonText',
        btnProps: {
          buttonText: selectedUpdateRowKeys.length
            ? intl.get(`hzero.common.button.newSelectedExport`).d('(新)勾选导出')
            : intl.get(`hzero.common.button.newExport`).d('(新)导出'),
          templateCode: 'SPUC_ORDER_PLAN_EXPORT_UPDATE',
          otherButtonProps: {
            icon: 'unarchive',
            permissionList: [
              {
                code: 'srm.po-admin.plan.scheduling.new-release.ps.button.updatenewexport',
                type: 'c7n-pro',
                meaning: '计划排程创建-更新-新版导出',
              },
            ],
          },
          method: 'POST',
          allBody: true,
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/plans/batch-export/release/new-module`,
          queryParams: selectedUpdateRowKeys.length
            ? {
                planIds: updatepoLineLocationId,
                customizeUnitCode: 'SODR.PLAN_SHEET_UPDATE.LIST,SODR.PLAN_SHEET_UPDATE.QUERY_FORM',
              }
            : {
                ...this.handleParams(radioTab),
                customizeUnitCode: 'SODR.PLAN_SHEET_UPDATE.LIST,SODR.PLAN_SHEET_UPDATE.QUERY_FORM',
              },
        },
      },
      {
        name: 'export',
        btnComp: ExcelExport,
        childFor: 'buttonText',
        btnProps: {
          method: 'POST',
          otherButtonProps: primaryExportBtnProps,
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/plans/batch-export/release`,
          queryParams: () => this.handleParams(radioTab),
        },
      },
      {
        name: 'checkExport',
        btnComp: ExcelExport,
        childFor: 'buttonText',
        child: intl.get(`sodr.common.view.tab.checkExport`).d('勾选导出'),
        btnProps: {
          method: 'POST',
          otherButtonProps: updateListCheckExportBtnProps,
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/plans/batch-export/release`,
          queryParams: { planIds: updatepoLineLocationId },
        },
      },
      {
        name: 'feedbackAgree',
        child: intl.get('sodr.common.button.scheduleSheet.feedbackAgree').d('反馈同意'),
        btnProps: {
          icon: 'forum-o',
          disabled:
            (isArray(selectedUpdateRowKeys) && isEmpty(selectedUpdateRowKeys)) || existSapFlag,
          onClick: () => this.handleFeedbackAgreePlan('update'),
          loading: feedbackAgreePlanLoading,
        },
      },
    ];

    return remote
      ? remote.process('SODR_SCHEDULES_SHEET_LIST_PROCESS_DETAIL_BTN', btns, {
          content: this,
          selectedUpdateRowKeys,
          dataSource: planUpdateList,
        })
      : btns;
  }

  render() {
    const {
      // radioTab,
      tenantId,
      supplierTenantId,
      selectedCreateRowKeys,
      selectedCreateRows,
      selectedUpdateRowKeys,
      selectedUpdateRows,
      operatingVisible,
      planId,
      createVisible,
      selectedCreateQueryRowKeys,
      selectedCreateQueryRows,
      asnNumsVisible,
      poLineLocationId,
    } = this.state;
    const {
      scheduleSheet: {
        radioTab,
        enumMap = {},
        planCreateList = [],
        planCreateListPagination = {},
        planUpdateList = [],
        planUpdateListPagination = {},
        createQueryListPagination = {},
        createQueryList = [],
        asnNumsPagination = {},
        asnNumsDataSource = [],
      },
      loadingList,
      dispatch,
      loadingDetailList,
      createQueryLoading,
      operationAsnNumsLoading,
      createSurePlanLoading,
      customizeTable,
      customizeBtnGroup,
      customizeFilterForm,
      customizeTabPane,
      operationRecordLoading,
      remote,
    } = this.props;
    const listProps = {
      enumMap,
      redirectToDetail: this.redirectToDetail,
      handleTranslate: this.handleTranslate,
      handleToAsnNums: this.handleToAsnNums,
      dispatch,
      rowSelection: {
        selectedRowKeys: selectedCreateRowKeys,
        selectedRows: selectedCreateRows,
        onChange: this.handleCreateListRowSelectChange,
      },
      onSearch: this.handleSearch,
      loading: loadingList,
      dataSource: planCreateList,
      customizeTable,
      customizeFilterForm,
      pagination: planCreateListPagination,
      onRef: (node) => {
        this.listForm = node;
      },
      handleOperating: this.handleOperating,
      onCreatePageChange: this.onCreatePageChange,
    };
    const detailSearchProps = {
      remote,
      enumMap,
      dispatch,
      redirectToDetail: this.redirectToDetail,
      handleOperating: this.handleOperating,
      onJumpDetail: this.onJumpDetail,
      handleToAsnNums: this.handleToAsnNums,
      rowSelection: {
        selectedRowKeys: selectedUpdateRowKeys,
        selectedRows: selectedUpdateRows,
        onChange: this.handleUpdateSelectChange,
      },
      tenantId,
      supplierTenantId,
      loading: loadingDetailList,
      dataSource: planUpdateList,
      pagination: planUpdateListPagination,
      onSearch: this.handleSearch,
      customizeTable,
      customizeFilterForm,
      onRef: (node) => {
        this.detailForm = node;
      },
      onUpdatePageChange: this.onUpdatePageChange,
    };
    const operationRecordProps = {
      dispatch,
      id: planId,
      visible: operatingVisible,
      hideModal: this.handleOperating,
      operationRecordLoading,
    };
    const asnNumsModelProps = {
      dispatch,
      poLineLocationId,
      operationAsnNumsLoading,
      visible: asnNumsVisible,
      pagination: asnNumsPagination,
      dataSource: asnNumsDataSource,
      hideAsnNumsModel: this.hideAsnNumsModel,
      handleAsnNumsSearch: this.handleAsnNumsSearch,
    };

    const planCreateProps = {
      onRef: (node) => {
        this.planCreateForm = node;
      },
      dataSource: createQueryList,
      pagination: createQueryListPagination,
      visible: createVisible,
      handleChangeVisible: this.handleChangeVisible,
      handleChangeSure: this.handleChangeSure,
      handleCreateQuery: this.handleCreateQuery,
      rowSelection: {
        selectedRowKeys: selectedCreateQueryRowKeys,
        selectedRows: selectedCreateQueryRows,
        onChange: this.handleCreateQueryRowSelectChange,
      },
      loading: createQueryLoading,
      selectedCreateQueryRowKeys,
      createSurePlanLoading,
    };

    return (
      <Fragment>
        <Header title={intl.get(`sodr.scheduleSheet.view.message.title.create`).d('排程单创建')}>
          {radioTab === 'list' ? (
            <Fragment>
              {customizeBtnGroup(
                { code: 'SODR.PLAN_SHEET_CREATE.LIST_CREAT_BTNS', pro: true },
                <DynamicButtons buttons={this.headerBtnsRender()} />
              )}
            </Fragment>
          ) : (
            <Fragment>
              {customizeBtnGroup(
                { code: 'SODR.PLAN_SHEET_UPDATE.NEW_BTNS', pro: true },
                <DynamicButtons buttons={this.headerBtnsDetail()} />
              )}
            </Fragment>
          )}
        </Header>
        <Content>
          {customizeTabPane(
            { code: 'SODR.PLAN_SHEET_CREATE.TAB' },
            <Tabs onChange={this.handleTabsChange} animated={false}>
              <TabPane
                tab={intl.get(`sodr.scheduleSheet.view.tab.list.create`).d('计划创建')}
                key="list"
              >
                <CreateList {...listProps} />
              </TabPane>
              <TabPane
                tab={intl.get(`sodr.common.view.tab.detail.toUpdate`).d('计划单更新')}
                key="detail"
              >
                <UpdateList {...detailSearchProps} />
              </TabPane>
            </Tabs>
          )}
        </Content>
        {operatingVisible && <OperationRecord {...operationRecordProps} />}
        {createVisible && <PlanNum {...planCreateProps} />}
        {asnNumsVisible && <AsnNumsModel {...asnNumsModelProps} />}
      </Fragment>
    );
  }
}
