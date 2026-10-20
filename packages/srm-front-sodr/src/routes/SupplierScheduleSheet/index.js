/*
 * supplierScheduleSheet - 新版供应商排程单创建
 * @date: 2018/10/13 11:47:39
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Modal } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty, isArray, findIndex, uniqBy, throttle } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { stringify } from 'querystring';
import moment from 'moment';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import notification from 'utils/notification';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import {
  // getUserOrganizationId,
  getCurrentOrganizationId,
  getEditTableData,
  addItemsToPagination,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_SPUC } from '_utils/config';
import { DATETIME_MIN, DATETIME_MAX, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImport from 'hzero-front/lib/components/Import';
import DynamicButtons from '_components/DynamicButtons';

import CreateList from './List'; // 创建列表
import OperationRecord from '../components/NewPlantOperationRecord/OperationRecord';
import PlanNum from './PlantNum';
import AsnNumsModel from '../ScheduleSheet/AsnNumsModel';

/**
 * 计划单
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} supplierScheduleSheet - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: [
    'sodr.supplierScheduleSheet',
    'sodr.common',
    'entity.company',
    'entity.order',
    'entity.customer',
    'entity.business',
    'entity.organization',
    'entity.item',
    'sodr.quotePurchase',
    'sodr.orderMaintain',
    'sodr.orderApproval',
    'sinv.common',
    'sodr.sendOrder',
    'ssrc.inquiryHall',
    'sodr.schedule',
    'sodr.sheet',
    'sodr.orderType',
    'sodr.quotePurchaseRequisition',
  ],
})
@withCustomize({
  unitCode: [
    'SODR.PLAN_SHEET_CREATE.FEEDBACK.LIST_NEW',
    'SODR.PLAN_SHEET_CREATE.FEEDBACK.QUERY_FORM',
    'SODR.PLAN_SHEET_CREATE.FEEDBACK.BUTTONS',
  ],
})
@connect(({ loading, supplierScheduleSheet }) => ({
  loadingList: loading.effects['supplierScheduleSheet/queryPlanCreateList'],
  loadingDetailList: loading.effects['supplierScheduleSheet/queryPlanUpdateList'],
  createQueryLoading: loading.effects['supplierScheduleSheet/createQuery'],
  createSaveLoading: loading.effects['supplierScheduleSheet/savePlan'],
  createDeleteLoading: loading.effects['supplierScheduleSheet/deletePlan'],
  createReleaseLoading: loading.effects['supplierScheduleSheet/releasePlan'],
  updateReleaseLoading: loading.effects['supplierScheduleSheet/releasePlan'],
  updateCancelLoading: loading.effects['supplierScheduleSheet/cancelPlan'],
  operationAsnNumsLoading: loading.effects['supplierScheduleSheet/operationAsnNums'],
  operationRecordLoading: loading.effects['scheduleSheetCommon/operationRecord'],
  supplierScheduleSheet,
}))
export default class supplierScheduleSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // : 'list',
      tenantId: getCurrentOrganizationId(),
      selectedCreateRowKeys: [], // 创建计划单 key,
      selectedUpdateRows: [],
      operatingVisible: false, // 操作记录模态框
      planId: null, // 计划单主键id
      createVisible: false, // 新建模态框false
      selectedCreateQueryRowKeys: [],
      selectedCreateQueryRows: [],
      selectedCreateRows: [],
      cacheCreateSelected: [],
      cacheUpdateSelected: [],
      createFlag: false, // 新建按钮标识
      asnNumsVisible: false, // 送货单模态框
      poLineLocationId: null, // 计划单订单发运行id
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // 值集查询
    dispatch({
      type: 'supplierScheduleSheet/init',
    });
    this.fetchSetting();
  }

  // erp来源计划时控制 新建按钮.
  @Bind()
  fetchSetting() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierScheduleSheet/fetchSettings',
    }).then((res) => {
      if (res) {
        if (Number(res['010801'])) {
          this.setState({
            createFlag: true,
          });
        }
      }
    });
  }

  /**
   * 查询列表
   * @param {Object} fields
   * @param {*} otherParams
   */
  @Bind()
  handleSearch(page = {}, flag = 1, isChangePage = false) {
    const fields = this.listForm ? this.listForm.searchForm.props.form.getFieldsValue() : {};
    const allFields = this.handleFormQuery(fields);
    const { planDate, ...handleFormValues } = allFields;
    // 缓存跨页选中数据
    const type = 'create';
    const {
      supplierScheduleSheet: {
        planCreateList = [],
        planUpdateList = [],
        planCreateListPagination = {},
        planUpdateListPagination = {},
      },
    } = this.props;
    const {
      cacheCreateSelected = [],
      cacheUpdateSelected = [],
      selectedUpdateRowKeys = [],
      selectedCreateRowKeys = [],
    } = this.state;
    const pagination = type === 'create' ? planCreateListPagination : planUpdateListPagination;
    const list = type === 'create' ? planCreateList : planUpdateList;
    const seletedRowKeys = type === 'create' ? selectedCreateRowKeys : selectedUpdateRowKeys;
    const cacheSelected = type === 'create' ? cacheCreateSelected : cacheUpdateSelected;
    if (page.current && pagination.current && page.current !== pagination.current) {
      const currentPageSelected = list.filter((i) => seletedRowKeys.includes(i.planId));
      const _cacheData = getEditTableData(currentPageSelected, ['poLineLocationId']);
      if (!isEmpty(currentPageSelected) && isEmpty(_cacheData)) {
        return false;
      }
      const newCacheData = uniqBy(cacheSelected.concat(_cacheData), 'poLineLocationId');
      const cacheData = type === 'create' ? 'cacheCreateSelected' : 'cacheUpdateSelected';
      this.setState({ [cacheData]: newCacheData });
    }
    this.handleSearchList({
      camp: 'SUPPLIER',
      page,
      ...handleFormValues,
      customizeUnitCode:
        'SODR.PLAN_SHEET_CREATE.FEEDBACK.LIST_NEW,SODR.PLAN_SHEET_CREATE.FEEDBACK.QUERY_FORM',
      asyncCountFlag: 'DEFAULT',
      ...(isChangePage ? { oldTotalElements: pagination.total } : null),
    });
    if (flag) {
      this.setState({
        selectedCreateRowKeys: [],
        selectedCreateRows: [],
      });
    }
  }

  /**
   * 查询创建列表
   * @param fields
   */
  @Bind()
  handleSearchList(fields) {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierScheduleSheet/queryPlanCreateList',
      payload: fields,
    }).then((res) => {
      if (res && res.needCountFlag === 'Y') {
        dispatch({
          type: 'supplierScheduleSheet/queryPlanCreateListPage',
          payload: fields,
        });
      }
    });
  }

  /**
   * 查询维护列表
   */
  @Bind()
  handleSearchDetailList(fields) {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierScheduleSheet/queryPlanUpdateList',
      payload: { ...fields },
    });
  }

  // 从缓存中获取跨页选中的个性化数据
  @Bind()
  getCacheSelected(data, type) {
    const {
      supplierScheduleSheet: { planCreateList = [], planUpdateList = [] },
    } = this.props;
    const { cacheCreateSelected, cacheUpdateSelected } = this.state;
    const cacheSelected = type === 'create' ? cacheCreateSelected : cacheUpdateSelected;
    const currentData = type === 'create' ? planCreateList : planUpdateList;
    return data.map((i) => {
      const cached = cacheSelected.find((j) => j.planId === i.planId);
      // 非当前页则取缓存
      const currentRowKeys = currentData.map((m) => m.planId);
      const isCurrent = currentRowKeys.includes(i.planId);
      const _data = isCurrent ? i : { ...i, ...cached };
      return _data;
    });
  }

  /**
   * 拆分
   */
  @Bind()
  handleTranslate(record) {
    const {
      supplierScheduleSheet: { createQueryList = [], createQueryListPagination = {} },
      dispatch,
    } = this.props;
    const newItem = {
      ...record,
      planIdAndPoLineLocationId: uuid(),
      planQuantity: null,
      planDate: null,
      purchaserRemark: null,
      _status: 'create',
      objectVersionNuber: null,
      _token: null,
    };
    const index = findIndex(createQueryList, function (o) {
      return o.planIdAndPoLineLocationId === record.planIdAndPoLineLocationId;
    });
    createQueryList.splice(index, 0, newItem);
    console.log('createQueryList', createQueryList);
    const newPagaination = addItemsToPagination(
      1,
      createQueryList.length,
      createQueryListPagination
    );
    dispatch({
      type: 'supplierScheduleSheet/updateState',
      payload: { createQueryList, planCreateListPagination: newPagaination },
    });
  }

  /**
   * 选中行创建查询计划单改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleCreateQueryRowSelectChange(newSelectedRowKeys, rows) {
    this.setState({
      selectedCreateQueryRowKeys: newSelectedRowKeys,
      selectedCreateQueryRows: rows,
    });
  }

  /**
   * 选中行创建计划单改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleCreateListRowSelectChange(newSelectedRowKeys, rows) {
    this.setState({ selectedCreateRowKeys: newSelectedRowKeys, selectedCreateRows: rows });
  }

  /**
   * 明细选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleUpdateSelectChange(selectedRowKeys, rows) {
    this.setState({ selectedUpdateRows: rows });
  }

  @Bind()
  handleTabsChange(key) {
    const {
      supplierScheduleSheet: { planCreateListPagination = {}, planUpdateListPagination = {} },
      dispatch,
    } = this.props;
    dispatch({
      type: 'supplierScheduleSheet/updateState',
      payload: {
        radioTab: key === 'list' ? 'list' : 'detail',
      },
    });
    this.handleSearch(key === 'list' ? planCreateListPagination : planUpdateListPagination, key);
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
    const { selectedCreateRows = [] } = this.state;
    const data = this.getCacheSelected(selectedCreateRows, 'create');
    Modal.confirm({
      title: intl
        .get(`sodr.supplierScheduleSheet.view.message.title.confirmCancelPlan`)
        .d('是否确认取消计划单'),
      onOk: throttle(
        () => {
          dispatch({
            type: 'supplierScheduleSheet/cancelPlan',
            payload: data,
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
        .get(`sodr.supplierScheduleSheet.view.message.title.confirmReleasePlan`)
        .d('是否确认发布计划单'),
      onOk: throttle(
        () => {
          if (status === 'create') {
            const createParams = getEditTableData(selectedCreateRows, ['planId']);
            const newCreateParams = createParams.map((item) => {
              return {
                ...item,
                planDate: moment(item.planDate).format(DEFAULT_DATETIME_FORMAT),
              };
            });
            const _newCreateParams = this.getCacheSelected(newCreateParams, 'create');
            const warning = this.validateReleasePlan(_newCreateParams);
            if (warning) {
              notification.error({
                description: warning,
              });
              return;
            }
            if (!isEmpty(_newCreateParams)) {
              dispatch({
                type: 'supplierScheduleSheet/releasePlan',
                payload: {
                  data: _newCreateParams,
                  customizeUnitCode: 'SODR.PLAN_SHEET_CREATE.FEEDBACK.LIST_NEW',
                },
              }).then((response) => {
                if (response) {
                  notification.success();
                  this.handleSearch();
                }
              });
            }
          } else {
            const updateParams = getEditTableData(selectedUpdateRows, ['planId']);
            const _updateParams = this.getCacheSelected(updateParams, 'create');
            if (!isEmpty(_updateParams)) {
              dispatch({
                type: 'supplierScheduleSheet/releasePlan',
                payload: {
                  data: _updateParams,
                  customizeUnitCode: 'SODR.PLAN_SHEET_CREATE.FEEDBACK.LIST_NEW',
                },
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
   *创建发布计划单
   */
  @Bind()
  handleSupplierRelease() {
    const { dispatch } = this.props;
    const { selectedCreateQueryRows = [] } = this.state;
    Modal.confirm({
      title: intl
        .get(`sodr.supplierScheduleSheet.view.message.title.confirmReleasePlan`)
        .d('是否确认发布计划单'),
      onOk: throttle(
        () => {
          const createParams = getEditTableData(selectedCreateQueryRows, [
            'planIdAndPoLineLocationId',
            '_status',
          ]);
          const newCreateParams = createParams.map((item) => {
            return {
              ...item,
              planDate: item.planDate.format(DEFAULT_DATETIME_FORMAT),
            };
          });
          if (!isEmpty(newCreateParams)) {
            dispatch({
              type: 'supplierScheduleSheet/handleSupplierRelease',
              payload: newCreateParams,
            }).then((response) => {
              if (response) {
                notification.success();
                this.handleCreateQuery(true);
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
   *创建保存计划单
   */
  @Bind()
  handleSupplierSave() {
    const { dispatch } = this.props;
    const { selectedCreateQueryRows = [] } = this.state;
    Modal.confirm({
      title: intl
        .get(`sodr.supplierScheduleSheet.view.message.title.confirmSavePlan`)
        .d('是否确认保存计划单'),
      onOk: throttle(
        () => {
          const params = getEditTableData(selectedCreateQueryRows, [
            'planIdAndPoLineLocationId',
            '_status',
          ]);
          const newParams = params.map((item) => {
            return {
              ...item,
              planDate: item.planDate.format(DEFAULT_DATETIME_FORMAT),
            };
          });
          if (!isEmpty(newParams)) {
            dispatch({
              type: 'supplierScheduleSheet/handleSupplierSave',
              payload: newParams,
            }).then((response) => {
              if (response) {
                notification.success();
                this.handleCreateQuery(true);
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
   *保存计划单
   */
  @Bind()
  handleSavePlan() {
    const { dispatch } = this.props;
    const { selectedCreateRows = [] } = this.state;
    Modal.confirm({
      title: intl
        .get(`sodr.supplierScheduleSheet.view.message.title.confirmSavePlan`)
        .d('是否确认保存计划单'),
      onOk: throttle(
        () => {
          const params = getEditTableData(selectedCreateRows, ['planId', '_status']);
          const newParams = params.map((item) => {
            return {
              ...item,
              planDate: item.planDate.format(DEFAULT_DATETIME_FORMAT),
            };
          });
          if (!isEmpty(newParams)) {
            dispatch({
              type: 'supplierScheduleSheet/savePlan',
              payload: newParams,
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

  /**
   *删除计划单
   */
  @Bind()
  handleDeletePlan() {
    const { dispatch } = this.props;
    const { selectedCreateRows = [] } = this.state;
    Modal.confirm({
      title: intl
        .get(`sodr.supplierScheduleSheet.view.message.title.confirmDeletePlan`)
        .d('是否确认删除计划单'),
      onOk: throttle(
        () => {
          dispatch({
            type: 'supplierScheduleSheet/deletePlan',
            payload: selectedCreateRows,
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
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    let timeArray = [];
    timeArray = ['needByDateStart', 'needByDateEnd', 'creationDateEnd', 'creationDateStart'];
    timeArray.forEach((item) => {
      if (item === 'needByDateEnd' || item === 'creationDateEnd') {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
      } else {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
      }
    });
    return {
      ...filterValues,
      ...dealTime,
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
  handleCreateQuery(flag, page, isChangePage = false) {
    const {
      dispatch,
      supplierScheduleSheet: {
        createQueryListPagination: { total },
      },
    } = this.props;
    const payload = {
      ...(flag && this.planCreateForm.planNumForm.props.form.getFieldsValue()),
      page,
      customizeUnitCode:
        'SODR.PLAN_SHEET_CREATE.FEEDBACK.LIST_NEW,SODR.PLAN_SHEET_CREATE.FEEDBACK.QUERY_FORM',
      asyncCountFlag: 'DEFAULT',
      ...(isChangePage ? { oldTotalElements: total } : null),
    };
    dispatch({
      type: 'supplierScheduleSheet/createQuery',
      payload,
    }).then((res) => {
      if (res && res.needCountFlag === 'Y') {
        dispatch({
          type: 'supplierScheduleSheet/createQueryPage',
          payload,
        });
      }
    });
    this.setState({ selectedCreateQueryRowKeys: [] });
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
      type: 'supplierScheduleSheet/createSurePlan',
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
      pathname: '/sodr/supplier-schedule-sheet/data-import/SSPL.SUPPLIER_PLAN_IMPORT',
      search: stringify({
        action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        backPath: `/sodr/supplier-schedule-sheet/list`,
      }),
    };
    this.props.history.push(option);
  }

  /**
   * 关联送货单
   * @param {*} record
   */
  @Bind()
  handleToAsnNums(record) {
    this.setState({ asnNumsVisible: true, poLineLocationId: record.poLineLocationId });
  }

  @Bind()
  hideAsnNumsModel(flag) {
    this.setState({ asnNumsVisible: flag });
  }

  /**
   * 查询送货单列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleAsnNumsSearch(page = {}) {
    const { dispatch } = this.props;
    const { poLineLocationId } = this.state;
    dispatch({
      type: `supplierScheduleSheet/operationAsnNums`,
      payload: {
        page,
        poLineLocationId,
      },
    });
  }

  /**
   *
   * @returns 个性化按钮组
   */
  @Bind()
  getButtons() {
    const { customizeBtnGroup, createReleaseLoading, createDeleteLoading } = this.props;
    const { selectedCreateRowKeys, createFlag, tenantId } = this.state;
    const fields = this.listForm ? this.listForm.searchForm.props.form.getFieldsValue() : {};
    const handleFormValues = this.handleFormQuery(fields);
    // const createpoLineLocationId = selectedCreateRowKeys.join(',');
    const primaryExportBtnProps = {
      icon: 'export',
    };
    const listCheckExportBtnProps = {
      icon: 'export',
      disabled: isArray(selectedCreateRowKeys) && isEmpty(selectedCreateRowKeys),
    };
    const headerBtnsRender = [
      {
        name: 'release',
        child: intl.get('sodr.common.button.supplierScheduleSheet.release').d('发布'),
        btnProps: {
          type: 'primary',
          onClick: () => this.handleReleasePlan('create'),
          loading: createReleaseLoading,
          icon: 'rocket',
          disabled: isEmpty(selectedCreateRowKeys),
        },
      },
      {
        name: 'cancel',
        child: intl.get('sodr.common.button.supplierScheduleSheet.cancel').d('取消'),
        btnProps: {
          onClick: this.handleCancelPlan,
          loading: createDeleteLoading || createReleaseLoading,
          icon: 'close',
          disabled: isEmpty(selectedCreateRowKeys),
        },
      },
      {
        name: 'new',
        child: intl.get('sodr.common.button.supplierScheduleSheet.createPlan').d('新建'),
        btnProps: {
          onClick: this.handleCreatePlan,
          icon: 'plus',
          disabled: createFlag,
        },
      },
      {
        name: 'newMaterialImport',
        btnComp: CommonImport,
        child: intl.get(`hzero.common.button.newBatchImport`).d('(新)批量导入'),
        childFor: 'buttonText',
        btnProps: {
          businessObjectTemplateCode: 'SSPL.SUPPLIER_PLAN_IMPORT',
          prefixPatch: SRM_SPUC,
          refreshButton: true,
          successCallBack: () => {
            this.handleFormQuery(fields);
          },
          buttonProps: {
            permissionList: [
              {
                code: 'srm.po-admin.scheduling.plan-create.ps.button.newimport',
                type: 'c7n-pro',
                meaning: '计划排程创建-新版导入',
              },
            ],
          },
        },
      },
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        child: selectedCreateRowKeys.length
          ? intl.get(`hzero.common.button.newSelectedExport`).d('(新)勾选导出')
          : intl.get(`hzero.common.button.newExport`).d('(新)导出'),
        childFor: 'buttonText',
        btnProps: {
          templateCode: 'SPUC_ORDER_PLAN_EXPORT_NEW_SUP',
          otherButtonProps: {
            icon: 'unarchive',
            permissionList: [
              {
                code: 'srm.po-admin.scheduling.plan-create.ps.button.newexport',
                type: 'c7n-pro',
                meaning: '计划排程创建-新版导出',
              },
            ],
          },
          method: 'POST',
          allBody: true,
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/plans/from-supplier/export/new-module`,
          queryParams: selectedCreateRowKeys.length
            ? {
                planIdList: selectedCreateRowKeys,
                camp: 'SUPPLIER',
                customizeUnitCode:
                  'SODR.PLAN_SHEET_CREATE.FEEDBACK.LIST_NEW,SODR.PLAN_SHEET_CREATE.FEEDBACK.QUERY_FORM',
              }
            : {
                camp: 'SUPPLIER',
                ...handleFormValues,
                customizeUnitCode:
                  'SODR.PLAN_SHEET_CREATE.FEEDBACK.LIST_NEW,SODR.PLAN_SHEET_CREATE.FEEDBACK.QUERY_FORM',
              },
        },
      },
      {
        name: 'batchImport',
        child: intl.get('sodr.supplierScheduleSheet.button.planImport').d('批量导入'),
        btnProps: {
          onClick: this.handleImport,
        },
      },
      {
        name: 'export',
        btnComp: ExcelExport,
        childFor: 'buttonText',
        btnProps: {
          method: 'POST',
          otherButtonProps: primaryExportBtnProps,
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/plans/from-supplier/export`,
          queryParams: { camp: 'SUPPLIER', ...handleFormValues },
        },
      },
      {
        name: 'checkExport',
        btnComp: ExcelExport,
        child: intl.get(`sodr.common.view.tab.checkExport`).d('勾选导出'),
        childFor: 'buttonText',
        btnProps: {
          method: 'POST',
          otherButtonProps: listCheckExportBtnProps,
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/plans/from-supplier/export`,
          queryParams: { planIdList: selectedCreateRowKeys, camp: 'SUPPLIER' },
        },
      },
    ];
    return customizeBtnGroup(
      { code: 'SODR.PLAN_SHEET_CREATE.FEEDBACK.BUTTONS', pro: true },
      <DynamicButtons buttons={headerBtnsRender} />
    );
  }

  render() {
    const {
      // radioTab,
      selectedCreateRowKeys,
      selectedCreateRows,
      operatingVisible,
      planId,
      createVisible,
      selectedCreateQueryRowKeys,
      asnNumsVisible,
      poLineLocationId,
    } = this.state;
    const {
      supplierScheduleSheet: {
        enumMap = {},
        planCreateList = [],
        planCreateListPagination = {},
        createQueryListPagination = {},
        createQueryList = [],
        asnNumsPagination = {},
        asnNumsDataSource = [],
      },
      loadingList,
      dispatch,
      createQueryLoading,
      // createSaveLoading,
      operationAsnNumsLoading,
      operationRecordLoading,
    } = this.props;
    const listProps = {
      enumMap,
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
      pagination: planCreateListPagination,
      onRef: (node) => {
        this.listForm = node;
      },
      handleOperating: this.handleOperating,
    };
    const operationRecordProps = {
      dispatch,
      id: planId,
      visible: operatingVisible,
      hideModal: this.handleOperating,
      operationRecordLoading,
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
        onChange: this.handleCreateQueryRowSelectChange,
      },
      loading: createQueryLoading,
      selectedCreateQueryRowKeys,
      handleSupplierSave: this.handleSupplierSave,
      handleSupplierRelease: this.handleSupplierRelease,
      handleTranslate: this.handleTranslate,
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

    return (
      <Fragment>
        <Header
          title={intl.get(`sodr.supplierScheduleSheet.view.message.title.create`).d('排程单创建')}
        >
          {this.getButtons()}
        </Header>
        <Content>
          <CreateList {...listProps} />
        </Content>
        {operatingVisible && <OperationRecord {...operationRecordProps} />}
        {createVisible && <PlanNum {...planCreateProps} />}
        {asnNumsVisible && <AsnNumsModel {...asnNumsModelProps} />}
      </Fragment>
    );
  }
}
