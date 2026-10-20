/*
 * PlanSheet - 采购商排程单确认
 * @date: 2018/10/13 11:47:39
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Form, Modal } from 'hzero-ui';
import { connect } from 'dva';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import { isEmpty, isArray, throttle } from 'lodash';
import qs from 'querystring';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { getUserOrganizationId, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { SRM_SPUC } from '_utils/config';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import UpdateList from './List';
import OperationRecord from '../components/NewPlantOperationRecord/OperationRecord';
import AsnNumsModel from '../ScheduleSheet/AsnNumsModel';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
/**
 * 排程单确认
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} purchaseScheduleSheetConfirm - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sodr.purchaseScheduleSheetConfirm',
    'sodr.common',
    'entity.company',
    'entity.order',
    'entity.customer',
    'entity.business',
    'entity.organization',
    'entity.item',
    'sodr.planSheet',
    'hzero.common',
  ],
})
@withCustomize({
  unitCode: ['SODR.PLAN_SHEET_CONFIRM.BUTTONS'],
})
@connect(({ loading, purchaseScheduleSheetConfirm }) => ({
  loadingList: loading.effects['purchaseScheduleSheetConfirm/queryPlanReleaseList'],
  sureLoading: loading.effects['purchaseScheduleSheetConfirm/surePlan'],
  operationAsnNumsLoading: loading.effects['purchaseScheduleSheetConfirm/operationAsnNums'],
  operationRecordLoading: loading.effects['scheduleSheetCommon/operationRecord'],
  purchaseScheduleSheetConfirm,
}))
export default class PurchaseScheduleConfrim extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      supplierTenantId: getUserOrganizationId(),
      selectedUpdateRowKeys: [], // 修改计划单 key,
      selectedUpdateRows: [], // 修改计划单 key,
      operatingVisible: false, // 操作记录模态框
      planId: null, // 计划单主键id
      updateSupplierNumFlag: false, // 供应商数量修改标志
      asnNumsVisible: false, // 送货单模态框
      poLineLocationId: null, // 计划单订单发运行id
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // 值集查询
    dispatch({
      type: 'purchaseScheduleSheetConfirm/init',
    });
    this.fetchSetting();
  }

  componentDidUpdate(prevProps) {
    const {
      location: { search },
    } = this.props;
    const { displayPoNum } = qs.parse(search.substr(1));
    const { displayPoNum: poNum } = qs.parse(prevProps.location.search.substr(1));
    const { setFieldsValue } = (((this.detailForm || {}).searchForm || {}).props || {}).form || {};
    if (displayPoNum !== poNum) {
      setFieldsValue({ poNum: displayPoNum });
      this.handleSearch();
    }
  }

  // erp来源计划时控制 新建按钮
  @Bind()
  fetchSetting() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseScheduleSheetConfirm/fetchSettings',
    }).then((res) => {
      if (res && Number(res['010804']) === 0) {
        this.setState({
          updateSupplierNumFlag: true,
        });
      }
    });
  }

  /**
   * 跳转详情
   */
  @Bind()
  onJumpDetail(record) {
    const { history } = this.props;
    history.push({
      pathname: `/sodr/plan-sheet-confirm/detail/${record.planHeaderId}`,
    });
  }

  /**
   * 数据校验
   * @param {Object} lineQuoSelectedRows
   */
  @Bind()
  validateFieldsData(lineQuoSelectedRows) {
    let errorFlag = false;
    lineQuoSelectedRows.map((record) => {
      if (record?.$form?.validateFields) {
        record.$form.validateFields((err) => {
          if (err) {
            errorFlag = true;
          }
        });
      }
      return errorFlag;
    });
    return errorFlag;
  }

  /**
   * 数据获取校验
   * @param {Object} data
   */
  @Bind()
  getFieldsData(data) {
    return data
      .map((record) => {
        if (record?.$form?.getFieldsValue) {
          return { ...record, ...record?.$form?.getFieldsValue() };
        }
        return record;
      })
      .map((record) => {
        const { planDate } = record;
        const _planDate = planDate ? moment(planDate).format(DATETIME_MIN) : undefined;
        return { ...record, planDate: _planDate, $form: undefined };
      });
  }

  /**
   * 查询列表
   * @param {Object} fields
   * @param {*} otherParams
   */
  @Bind()
  handleSearch(page = {}, flag = 1, params = {}, isChangePage = false) {
    const fields = this.detailForm ? this.detailForm.searchForm.props.form.getFieldsValue() : {};
    const handleFormValues = this.handleFormQuery(fields);
    const {
      purchaseScheduleSheetConfirm: { planUpdateListPagination = {}, planUpdateList = [] },
    } = this.props;
    const { total } = planUpdateListPagination;
    const { selectedUpdateRows, selectedUpdateRowKeys } = this.state;
    if (
      page.current &&
      planUpdateListPagination.current &&
      page.current !== planUpdateListPagination.current
    ) {
      const currentPageSelected = planUpdateList.filter((i) =>
        selectedUpdateRowKeys.includes(i.planId)
      );
      // 翻页数据校验
      if (this.validateFieldsData(currentPageSelected)) return;
      const _cacheData = selectedUpdateRows.map((i) => {
        const target = planUpdateList.find((j) => j.planId === i.planId);
        const current = target || i;
        if (current?.$form?.getFieldsValue) {
          const item = { ...current, ...current.$form.getFieldsValue() };
          delete item.$form;
          return item;
        }
        const b = i;
        delete b.$form;
        return i;
      });
      this.setState({ selectedUpdateRows: _cacheData });
    }
    if (flag) {
      this.setState({
        selectedUpdateRowKeys: [],
        selectedUpdateRows: [],
      });
    }
    this.handleSearchDetailList({
      camp: 'SUPPLIER',
      page,
      flag,
      ...handleFormValues,
      ...params,
      customizeUnitCode: 'SODR.PLAN_SHEET_CONFIRM.LIST,SODR.PLAN_SHEET_CONFIRM.QUERY_FORM',
      asyncCountFlag: 'DEFAULT',
      ...(isChangePage ? { oldTotalElements: total } : null),
    });
  }

  /**
   * 查询维护列表
   */
  @Bind()
  handleSearchDetailList(fields) {
    const {
      dispatch,
      purchaseScheduleSheetConfirm: { planUpdateList = [] },
    } = this.props;
    const { selectedUpdateRows } = this.state;
    const { flag, ..._fields } = fields;
    const _selectedUpdateRows = !flag ? selectedUpdateRows : [];
    const payload = { ..._fields, selectedUpdateRows: _selectedUpdateRows };
    dispatch({
      type: 'purchaseScheduleSheetConfirm/queryPlanReleaseList',
      payload,
    }).then((res) => {
      if (res) {
        if (res.needCountFlag === 'Y') {
          dispatch({
            type: 'purchaseScheduleSheetConfirm/queryPlanReleaseListPage',
            payload,
          });
        }
        planUpdateList.forEach((item) => {
          if (item?.$form?.resetFields) {
            item.$form.resetFields();
          }
        });
      }
    });
  }

  /**
   * 选中行创建计划单改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleCreateListRowSelectChange(newSelectedRowKeys) {
    this.setState({ selectedCreateRowKeys: newSelectedRowKeys });
  }

  /**
   * 明细选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleUpdateSelectChange(selectedRowKeys, rows) {
    this.setState({ selectedUpdateRowKeys: selectedRowKeys, selectedUpdateRows: rows });
  }

  /**
   *  创建计划单
   */
  @Bind()
  handleCreatePlan() {
    const { selectedCreateRowKeys } = this.state;
    const ids = selectedCreateRowKeys.join(',');
    const { dispatch, history } = this.props;
    dispatch({
      type: 'purchaseScheduleSheetConfirm/createPlan',
      payload: ids,
    }).then((res) => {
      if (res) {
        notification.success();
        history.push({
          pathname: `/sodr/plan-sheet/detail/${res.planHeaderId}`,
        });
      }
    });
  }

  /**
   *发布计划单
   */
  @Bind()
  handleRelease() {
    const { dispatch } = this.props;
    const { selectedUpdateRowKeys = [] } = this.state;
    dispatch({
      type: 'purchaseScheduleSheetConfirm/releasePlan',
      payload: selectedUpdateRowKeys,
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch();
      }
    });
  }

  /**
   *确认计划单
   */
  @Bind()
  handleSure() {
    const {
      dispatch,
      purchaseScheduleSheetConfirm: { planUpdateList = [] },
    } = this.props;
    const { selectedUpdateRows = [] } = this.state;
    Modal.confirm({
      title: intl.get(`sodr.planSheet.view.message.title.confirmPlan`).d('是否确认计划单'),
      onOk: throttle(
        () => {
          // 当前页数据从props中取，其余从缓存取。
          const newSelectedRows = selectedUpdateRows.map((i) => {
            const current = planUpdateList.find((j) => i.planId === j.planId);
            return current || i;
          });
          if (this.validateFieldsData(newSelectedRows)) return;
          const newCreateParams = this.getFieldsData(newSelectedRows);
          if (!isEmpty(newCreateParams)) {
            dispatch({
              type: 'purchaseScheduleSheetConfirm/surePlan',
              payload: {
                data: newCreateParams,
                customizeUnitCode: 'SODR.PLAN_SHEET_CONFIRM.LIST',
              },
            }).then((res) => {
              if (res) {
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
   *反馈计划单
   */
  // @Bind()
  // handleFeedBack() {
  //   const { dispatch } = this.props;
  //   const { selectedUpdateRows = [] } = this.state;
  //   Modal.confirm({
  //     title: intl.get(`sodr.planSheet.view.message.title.confirmPlan`).d('是否确认反馈计划单'),
  //     onOk: () => {
  //       const newCreateParams = getEditTableData(selectedUpdateRows, ['poLineLocationId']);
  //       if (!isEmpty(newCreateParams)) {
  //         dispatch({
  //           type: 'purchaseScheduleSheetConfirm/feedBackPlan',
  //           payload: newCreateParams,
  //         }).then((res) => {
  //           if (res) {
  //             notification.success();
  //             this.handleSearch();
  //           }
  //         });
  //       }
  //     },
  //   });
  // }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    let timeArray = [];
    timeArray = ['needByDateStart', 'needByDateEnd'];
    timeArray.forEach((item) => {
      if (item === 'needByDateEnd') {
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
      type: `purchaseScheduleSheetConfirm/operationAsnNums`,
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
    const { customizeBtnGroup, sureLoading } = this.props;
    const { tenantId, selectedUpdateRowKeys } = this.state;
    const fields = this.detailForm ? this.detailForm.searchForm.props.form.getFieldsValue() : {};
    const handleFormValues = this.handleFormQuery(fields);
    const listCheckExportBtnProps = {
      icon: 'export',
      disabled: isArray(selectedUpdateRowKeys) && isEmpty(selectedUpdateRowKeys),
    };
    const primaryExportBtnProps = {
      icon: 'export',
    };
    // const planIds = selectedUpdateRowKeys.join(',');

    const headerBtnsRender = [
      {
        name: 'confirm',
        child: intl.get('sodr.common.button.purchaseScheduleSheetConfirm.confirm').d('确认'),
        btnProps: {
          icon: 'check',
          type: 'primary',
          disabled: isEmpty(selectedUpdateRowKeys),
          onClick: this.handleSure,
          loading: sureLoading,
        },
      },
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        child: selectedUpdateRowKeys.length
          ? intl.get(`hzero.common.button.newSelectedExport`).d('(新)勾选导出')
          : intl.get(`hzero.common.button.newExport`).d('(新)导出'),
        childFor: 'buttonText',
        btnProps: {
          templateCode: 'SPUC_ORDER_PLAN_EXPORT_CONFIRM_PURCHASE',
          exportAsync: true,
          otherButtonProps: {
            icon: 'unarchive',
            permissionList: [
              {
                code: 'srm.po-admin.plan.scheduling.plan-confirm.ps.button.newexport',
                type: 'c7n-pro',
                meaning: '计划排程确认-新版导出',
              },
            ],
          },
          method: 'POST',
          allBody: true,
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/plans/purchaser-confirm/export/new-module`,
          queryParams: selectedUpdateRowKeys.length
            ? {
                planIdList: selectedUpdateRowKeys,
                camp: 'SUPPLIER',
                customizeUnitCode:
                  'SODR.PLAN_SHEET_CONFIRM.LIST,SODR.PLAN_SHEET_CONFIRM.QUERY_FORM',
              }
            : {
                camp: 'SUPPLIER',
                ...handleFormValues,
                customizeUnitCode:
                  'SODR.PLAN_SHEET_CONFIRM.LIST,SODR.PLAN_SHEET_CONFIRM.QUERY_FORM',
              },
        },
      },
      {
        name: 'export',
        btnComp: ExcelExport,
        child: intl.get(`hzero.common.export`).d('导出'),
        childFor: 'buttonText',
        btnProps: {
          method: 'POST',
          otherButtonProps: primaryExportBtnProps,
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/plans/purchaser-confirm/export`,
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
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/plans/purchaser-confirm/export`,
          queryParams: { planIdList: selectedUpdateRowKeys, camp: 'SUPPLIER' },
        },
      },
    ];
    return customizeBtnGroup(
      { code: 'SODR.PLAN_SHEET_CONFIRM.BUTTONS', pro: true },
      <DynamicButtons buttons={headerBtnsRender} />
    );
  }

  @Bind()
  replaceArr(arr, targetArr) {
    if (targetArr.length) {
      const result = arr.map((i) => {
        const cache = targetArr.find((j) => j.planId === i.planId);
        return cache ? { ...i, ...cache, serialNum: i.serialNum } : { $form: cache?.$form, ...i };
      });
      return result;
    }
    return arr;
  }

  render() {
    const {
      tenantId,
      supplierTenantId,
      selectedUpdateRowKeys,
      selectedUpdateRows,
      operatingVisible,
      planId,
      updateSupplierNumFlag,
      asnNumsVisible,
      poLineLocationId,
    } = this.state;

    const {
      purchaseScheduleSheetConfirm: {
        enumMap = {},
        planUpdateList = [],
        planUpdateListPagination = {},
        asnNumsDataSource = [],
        asnNumsPagination = {},
      },
      dispatch,
      loadingList,
      operationAsnNumsLoading,
      operationRecordLoading,
    } = this.props;
    const detailSearchProps = {
      enumMap,
      dispatch,
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
      loading: loadingList,
      dataSource: planUpdateList,
      pagination: planUpdateListPagination,
      onSearch: this.handleSearch,
      onRef: (node) => {
        this.detailForm = node;
      },
      updateSupplierNumFlag,
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
    const operationRecordProps = {
      dispatch,
      id: planId,
      visible: operatingVisible,
      hideModal: this.handleOperating,
      operationRecordLoading,
    };
    return (
      <Fragment>
        <Header
          title={intl.get(`sodr.purchaseScheduleSheetConfirm.view.message.title`).d('排程单确认')}
        >
          {this.getButtons()}
        </Header>
        <Content>
          <UpdateList {...detailSearchProps} />
        </Content>
        {operatingVisible && <OperationRecord {...operationRecordProps} />}
        {asnNumsVisible && <AsnNumsModel {...asnNumsModelProps} />}
      </Fragment>
    );
  }
}
