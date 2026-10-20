/**
 * index - 送货单创建
 * @date: 2018-12-05
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Tabs, Button, Modal, Dropdown, Menu } from 'hzero-ui';
import { isEmpty, isFunction, isNil } from 'lodash';
import { connect } from 'dva';
import { stringify } from 'querystring';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { SRM_SPUC } from '_utils/config';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { getCurrentOrganizationId, getUserOrganizationId, getResponse } from 'utils/utils';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
// import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { queryCommonImportConfig } from '@/services/deliveryCreationService';
import CommonImport from 'hzero-front/lib/components/Import';
import DynamicButtons from '_components/DynamicButtons';

import Creation from './Creation';
import Maintenance from './Maintenance';

window.moment = moment;

// TabPane组件初始化
const { TabPane } = Tabs;

/**
 * Detail - 业务组件 - 送货单创建明细
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [deliveryCreation={}] - 数据源
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
    'SINV.DELIVERY_CREATION.LIST_BY_MAINTAIN',
    'SINV.DELIVERY_CREATION.FILTER_BY_MAINTAIN',
    'SINV.DELIVERY_CREATION.LIST',
    'SINV.DELIVERY_CREATION.LIST_BY_PLAN',
    'SINV.DELIVERY_CREATION.FILTER',
    'SINV.DELIVERY_CREATION.BUTTONS.CREATION',
    'SINV.DELIVERY_CREATION.BUTTONS.MAINTENANCE',
  ],
})
@connect(({ loading = {}, deliveryCreation = {} }) => ({
  batchSubmitDeliveryLoading: loading.effects['deliveryCreation/batchSubmitDelivery'],
  queryOperationRecordLoading: loading.effects['deliveryCreation/queryOperationRecord'],
  batchDeleteDeliveryLoading: loading.effects['deliveryCreation/batchDeleteDelivery'],
  batchCreateDeliveryLoading: loading.effects['deliveryCreation/batchCreateDelivery'],
  queryCreateListLoading: loading.effects['deliveryCreation/queryCreateList'],
  queryMaintenanceListLoading: loading.effects['deliveryCreation/queryMaintenanceList'],
  fetchBusinessRuleLoading: loading.effects['deliveryCreation/fetchBusinessRule'],
  fetchSettingsLoading: loading.effects['deliveryCreation/fetchSettings'],
  deliveryCreation,
}))
@formatterCollections({
  code: [
    'sinv.deliveryCreation',
    'sinv.purchaserDelivery',
    'sinv.purchaseReception',
    'sinv.common',
    'entity.company',
    'entity.customer',
    'entity.item',
    'entity.organization',
  ],
})
export default class Permission extends Component {
  constructor(props) {
    super(props);
    const { searchListParams = {} } = props;
    const { defaultTabKey = 'deliveryCreationTab' } = searchListParams;
    this.state = {
      defaultActiveKey: defaultTabKey,
      creationListSelectedRows: [], // 以选中可创建的数据
      maintenanceListSelectedRows: [], // 以选中的可维护送货单
      supplierTenantId: getUserOrganizationId(),
      tenantId: getCurrentOrganizationId(),
      settings: {},
      ruleData: {},
      planFlag: '1',
      importConfig: {}, // 导入配置
      createTabDataSource: [], // 列表数据源
      createTabPagination: {}, // 列表分页
    };
    // 方法注册
    [
      'getActionButtonGroup',
      'onTabsChange',
      'onCreationListRowSelectChange',
      'createDelivery',
      'onMaintenanceListRowSelectChange',
      'fetchFlagCode',
      'fetchCreateList',
      'fetchAsnTypeCode',
      'fetchMaintenanceList',
      'fetchOperationRecord',
      'redirectDetail',
      'batchDeleteDelivery',
      'getCreationQueryParams',
      'getMaintenanceQueryParams',
      'batchSubmitDelivery',
      'setMaintenanceQueryParamsCache',
      'clearMaintenanceQueryParamsCache',
      'setCreationQueryParamsCache',
      'clearCreationQueryParamsCache',
      'fetchSettings',
    ].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'deliveryCreation/fetchLov' });
    this.fetchFlagCode();
    this.fetchAsnTypeCode();
    this.fetchSettings();
    this.fetchImportConfig();
  }

  // 查询按订单按计划导入配置
  @Bind()
  fetchImportConfig() {
    queryCommonImportConfig().then((res) => {
      this.setState({ importConfig: res });
    });
  }

  componentDidUpdate(prevProps) {
    // let params = {};
    const {
      planList = {},
      deliveryCreation,
      custLoading,
      // dispatch,
      location: { state: { _back } = {} },
      searchListParams,
    } = this.props;
    const { ruleData } = planList;
    const { planFlag: planFlagState } = searchListParams;
    const { creationQueryParamsCache = {} } = deliveryCreation;
    const custLoadingFlag = prevProps.custLoading !== custLoading && !custLoading;
    if (custLoadingFlag) {
      const params = this.getCreationQueryParams();
      const { rcvFlag, planDataFlag, planFlag } = ruleData;
      const planFlags = params.planFlag
        ? params.planFlag
        : (rcvFlag && planDataFlag) || planFlag
        ? 1
        : null;
      if (_back === -1) {
        this.fetchCreateList({ ...creationQueryParamsCache, planFlag: planFlagState || planFlags });
      } else {
        this.fetchAllList({ planFlags });
      }
    }
  }

  @Bind()
  fetchAllList({ planFlags }) {
    const { defaultActiveKey } = this.state;
    if (defaultActiveKey === 'deliveryCreationTab') {
      const params = this.getCreationQueryParams();
      this.fetchCreateList({
        ...params,
        planFlag: planFlags,
      });
    } else {
      const params = this.getMaintenanceQueryParams(params);
      this.fetchMaintenanceList(params);
    }
  }

  /**
   * 获取url过来的值
   */

  @Bind()
  gitLocationSearch() {
    const {
      history: {
        location: { search = '' },
      },
    } = this.props;
    // return querystring.parse(search.substr(1)) || '';
    return search.substr(1);
  }

  /**
   * fetchFlagCode - 查询是否值集
   */
  fetchFlagCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'deliveryCreation/queryCode',
      payload: { lovCode: 'HPFM.FLAG' },
    });
  }

  /**
   * fetchFlagCode - 查询是否值集
   */
  fetchAsnTypeCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'deliveryCreation/queryCode',
      payload: { lovCode: 'SINV.ASN_TYPE' },
    });
  }

  /**
   * fetchCreateList - 查询可创建行数据
   * @param {object} params - 查询条件
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  fetchCreateList(params, success = (e) => e) {
    const { planFlag } = params;
    const { dispatch } = this.props;
    console.log('fetchCreateList', planFlag);
    return dispatch({
      type: 'deliveryCreation/queryCreateList',
      // params,
      params: {
        ...params,
        customizeUnitCode: +planFlag
          ? 'SINV.DELIVERY_CREATION.LIST_BY_PLAN,SINV.DELIVERY_CREATION.FILTER'
          : 'SINV.DELIVERY_CREATION.LIST,SINV.DELIVERY_CREATION.FILTER',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          planFlag,
          createTabDataSource: res?.dataSource || [],
          createTabPagination: res.pagination,
        });
        success(res);
      }
    });
  }

  /**
   * fetchMaintenanceList - 查询可维护送货单数据
   * @param {object} params - 查询条件
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  fetchMaintenanceList(params, success = (e) => e) {
    const { dispatch } = this.props;
    const handleFormValues = this.handleFormQuery(params);
    return dispatch({
      type: 'deliveryCreation/queryMaintenanceList',
      params: handleFormValues,
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  // 查询配置
  fetchSettings() {
    const { dispatch } = this.props;
    dispatch({
      type: 'deliveryCreation/fetchSettings',
    }).then((res) => {
      if (res) {
        this.setState({
          settings: res,
        });
      }
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(params) {
    const dealTime = {};
    const timeArray = ['creationDateFrom', 'creationDateTo'];
    timeArray.forEach((item) => {
      dealTime[item] = params[item] ? params[item] : undefined;
    });
    return {
      ...params,
      ...dealTime,
    };
  }

  /**
   * createDelivery - 创建送货单
   */
  createDelivery() {
    const { dispatch, history } = this.props;
    const { creationListSelectedRows = [] } = this.state;
    dispatch({
      type: 'deliveryCreation/batchCreateDelivery',
      data: creationListSelectedRows,
    }).then((res) => {
      if (getResponse(res)) {
        if (res?.length === 1) {
          const asnHeaderId = res.map((n) => n.asnHeaderId);
          // 前端判空/未定义
          if (!isNil(asnHeaderId)) {
            notification.success();
            history.push({ pathname: `/sinv/delivery-creation/detail/${asnHeaderId}` });
          }
        } else if (res?.length > 1) {
          notification.success();
          history.push({ pathname: `/sinv/delivery-creation/detailTable` });
        }
      }
    });
  }

  /**
   * deleteDelivery - 删除送货单
   */
  batchDeleteDelivery() {
    const {
      dispatch,
      // deliveryCreation: { maintenanceQueryParamsCache = {} },
    } = this.props;
    const { maintenanceListSelectedRows = [] } = this.state;
    const { maintenance } = this;
    Modal.confirm({
      title: intl.get(`sinv.common.model.common.confirmDelete`).d('是否确认删除送货单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        return new Promise((resolve, reject) => {
          dispatch({
            type: 'deliveryCreation/batchDeleteDelivery',
            data: maintenanceListSelectedRows,
          }).then((res) => {
            if (res && !res.failed) {
              notification.success();
              resolve();
              this.setState({
                maintenanceListSelectedRows: [],
              });
              if (maintenance && isFunction(maintenance.handleFetchList)) {
                // maintenance.handleFetchList(maintenanceQueryParamsCache);
                maintenance.handleFetchList();
              }
            } else {
              reject();
            }
          });
        });
      },
    });
  }

  /**
   * fetchMaintenanceList - 查询可维护送货单数据
   * @param {object} asnHeaderId - 送货单头ID
   * @param {object} params - 查询条件
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  fetchOperationRecord(asnHeaderId, params, success = (e) => e) {
    const { dispatch } = this.props;
    if (isNil(asnHeaderId)) {
      return;
    }
    return dispatch({
      type: 'deliveryCreation/queryOperationRecord',
      asnHeaderId,
      params,
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * batchSubmitDelivery - 批量提交送货单
   */
  batchSubmitDelivery() {
    const {
      dispatch,
      deliveryCreation: { maintenanceQueryParamsCache = {} },
    } = this.props;
    const { maintenanceListSelectedRows = [] } = this.state;
    const selected = maintenanceListSelectedRows.map((item) => {
      return {
        ...item,
        shipDate: item?.shipDate
          ? moment(item.shipDate).format(DATETIME_MIN)
          : moment().format(DATETIME_MIN),
        expectedArriveDate: item?.expectedArriveDate
          ? moment(item.expectedArriveDate).format(DATETIME_MIN)
          : moment().endOf('day').format(DATETIME_MAX),
      };
    });

    Modal.confirm({
      title: intl.get(`sinv.common.model.common.confirmSubmit`).d('是否确认提交送货单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        return new Promise((resolve, reject) => {
          dispatch({
            type: 'deliveryCreation/batchSubmitDelivery',
            payload: {
              data: selected,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              resolve();
              this.setState({
                maintenanceListSelectedRows: [],
              });
              if (this.maintenance && isFunction(this.maintenance.handleFetchList)) {
                this.maintenance.handleFetchList(maintenanceQueryParamsCache);
              }
            } else {
              reject();
            }
          });
        });
      },
    });
  }

  /**
   * getActionButtonGroup - 设置操作按钮
   */
  getActionButtonGroup() {
    const {
      searchListParams,
      batchDeleteDeliveryLoading,
      batchCreateDeliveryLoading,
      batchSubmitDeliveryLoading,
      deliveryCreation: { creationQueryParams = {}, maintenanceQueryParams = {} },
    } = this.props;
    const {
      defaultActiveKey,
      creationListSelectedRows = [],
      maintenanceListSelectedRows = [],
      supplierTenantId,
      tenantId,
      importConfig,
    } = this.state;
    const { isChinoeFlage = false } = searchListParams; // 埋点
    const planIdList = (creationListSelectedRows.filter((n) => n.planId) || [])
      .map((n) => n.planId)
      .join();
    const { getFieldValue = (e) => e } = ((this.creation?.search || {}).props || {}).form || {};
    const templateCode =
      getFieldValue('planFlag') === '1' ? 'ASN.PLAN_NEW_BATCH_IMPORT' : 'ASN.BATCH_NEW_IMPORT';
    const organizationId = getCurrentOrganizationId();
    const planFlag = getFieldValue('planFlag');
    const isAllExport = isEmpty(creationListSelectedRows);
    const menu =
      Boolean(importConfig?.planFlag) || Boolean(importConfig?.orderFlag) ? (
        <Menu onClick={this.redirectImportCreation}>
          {Boolean(importConfig?.planFlag) && (
            <Menu.Item key="ASN.PLAN_BATCH_IMPORT">
              <a target="_blank" rel="noopener noreferrer">
                {intl.get(`sinv.deliveryCreation.view.button.byPlan`).d('按计划批量导入创建')}
              </a>
            </Menu.Item>
          )}
          {Boolean(importConfig?.orderFlag) && !isChinoeFlage && (
            <Menu.Item key="ASN.BATCH_IMPORT">
              <a target="_blank" rel="noopener noreferrer">
                {intl.get(`sinv.deliveryCreation.view.button.byOrder`).d('按订单批量导入创建')}
              </a>
            </Menu.Item>
          )}
        </Menu>
      ) : (
        <Menu onClick={this.redirectImportCreation}>
          <Menu.Item key="no">
            <a target="_blank" rel="noopener noreferrer">
              {intl.get(`sinv.deliveryCreation.view.button.noData`).d('暂无数据')}
            </a>
          </Menu.Item>
        </Menu>
      );
    const actions = {
      deliveryCreationTab: [
        {
          name: 'create',
          child: intl.get(`sinv.deliveryCreation.view.button.createDelivery`).d('创建送货单'),
          btnProps: {
            type: 'primary',
            icon: 'plus',
            disabled: isEmpty(creationListSelectedRows),
            onClick: this.createDelivery,
            loading: batchCreateDeliveryLoading,
          },
        },
        importConfig?.planFlag && importConfig?.orderFlag
          ? {
              name: 'import-create',
              group: true,
              child: (
                <Dropdown overlay={menu} disabled={batchCreateDeliveryLoading}>
                  <Button icon="to-top" disabled={batchCreateDeliveryLoading}>
                    {intl
                      .get(`sinv.deliveryCreation.view.button.batchImportCreation`)
                      .d('批量导入创建')}
                  </Button>
                </Dropdown>
              ),
            }
          : {
              name: 'import-create',
              child: intl
                .get(`sinv.deliveryCreation.view.button.batchImportCreation`)
                .d('批量导入创建'),
              btnProps: {
                icon: 'to-top',
                disabled:
                  (!importConfig?.orderFlag && !importConfig?.planFlag) ||
                  batchCreateDeliveryLoading,
                onClick: () => this.redirectImportCreation({ key: 'onlyOne' }),
                loading: batchCreateDeliveryLoading,
              },
            },
        {
          name: 'new-export',
          group: true,
          child: (
            <ExcelExportPro
              buttonText={
                isAllExport
                  ? intl.get('sinv.deliveryCreation.view.button.newExport').d('新版导出')
                  : intl.get(`sinv.purchaserDelivery.view.button.newCheckExport`).d('新版勾选导出')
              }
              otherButtonProps={{
                icon: 'unarchive',
                permissionList: [
                  {
                    code:
                      'srm.logistics.delivery.delivery-creation.ps.button.deliverycreation.newexport',
                    type: 'c7n-pro',
                  },
                ],
              }}
              requestUrl={`${SRM_SPUC}/v1/${organizationId}/po-location/purchaser/can-create-asn/export-new`}
              queryParams={
                isAllExport
                  ? {
                      ...creationQueryParams,
                      supplierTenantId,
                    }
                  : {
                      planIdList,
                      supplierTenantId,
                      planFlag: isNaN(planFlag) ? '0' : planFlag,
                      poLineLocationIds: creationListSelectedRows.map((n) => n.poLineLocationId),
                    }
              }
              templateCode="SPUC_SINV_ASN_HEADER_CREATE_EXPORT"
            />
          ),
        },
        {
          name: 'new-import',
          group: true,
          child: (
            <CommonImport
              businessObjectTemplateCode={templateCode}
              prefixPatch={SRM_SPUC}
              refreshButton
              buttonText={intl.get(`sinv.deliveryCreation.view.button.newImport`).d('新版导入')}
              args={{
                tenantId,
                templateCode,
              }}
              buttonProps={{
                icon: 'archive',
                permissionList: [
                  {
                    code: `srm.logistics.delivery.delivery-creation.ps.button.newimport`,
                    type: 'button',
                    meaning: '批量导入-新',
                  },
                ],
              }}
            />
          ),
        },
        {
          name: 'export',
          group: true,
          child: (
            <ExcelExport
              otherButtonProps={{ icon: 'export' }}
              requestUrl={`${SRM_SPUC}/v1/${organizationId}/po-location/purchaser/can-create-asn/export`}
              queryParams={{
                ...creationQueryParams,
                supplierTenantId,
              }}
            />
          ),
        },
        {
          name: 'check-export',
          group: true,
          child: (
            <ExcelExport
              buttonText={intl.get(`sinv.purchaserDelivery.view.button.checkExport`).d('勾选导出')}
              otherButtonProps={{ icon: 'export', disabled: isEmpty(creationListSelectedRows) }}
              requestUrl={`${SRM_SPUC}/v1/${organizationId}/po-location/purchaser/can-create-asn/export`}
              queryParams={{
                planIdList,
                supplierTenantId,
                planFlag: isNaN(planFlag) ? '0' : planFlag,
                poLineLocationIds: creationListSelectedRows.map((n) => n.poLineLocationId),
              }}
            />
          ),
        },
      ],
      deliveryMaintenanceTab: [
        {
          name: 'submit',
          child: intl.get(`hzero.common.button.submit`).d('提交'),
          btnProps: {
            type: 'primary',
            icon: 'check',
            disabled: isEmpty(maintenanceListSelectedRows) || batchDeleteDeliveryLoading,
            onClick: this.batchSubmitDelivery,
            loading: batchSubmitDeliveryLoading,
          },
        },
        {
          name: 'delete',
          child: intl.get(`hzero.common.button.delete`).d('删除'),
          btnProps: {
            icon: 'delete',
            disabled:
              isEmpty(maintenanceListSelectedRows) ||
              batchDeleteDeliveryLoading ||
              batchSubmitDeliveryLoading,
            onClick: this.batchDeleteDelivery,
            loading: batchDeleteDeliveryLoading,
          },
        },
        {
          name: 'new-export',
          group: true,
          child: (
            <ExcelExportPro
              buttonText={
                isEmpty(maintenanceListSelectedRows)
                  ? intl.get('sinv.purchaserDelivery.view.button.newExport').d('新版导出')
                  : intl.get(`sinv.purchaserDelivery.view.button.newCheckExport`).d('新版勾选导出')
              }
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                // funcType: 'flat',
                permissionList: [
                  {
                    code: 'srm.logistics.delivery.delivery-creation.ps.button.maintain.newexport',
                    type: 'c7n-pro',
                    // funcType: 'flat',
                  },
                ],
              }}
              requestUrl={`${SRM_SPUC}/v1/${organizationId}/asn-header/for-supplier/maintain/export`}
              queryParams={
                isEmpty(maintenanceListSelectedRows)
                  ? {
                      ...maintenanceQueryParams,
                      supplierTenantId,
                    }
                  : {
                      // ...maintenanceQueryParams,
                      supplierTenantId,
                      asnHeaderIds: maintenanceListSelectedRows.map((n) => n.asnHeaderId),
                    }
              }
              templateCode="SPUC_SINV_ASN_HEADER_MAINTAIN_EXPORT"
            />
          ),
        },
        {
          name: 'export',
          group: true,
          child: (
            <ExcelExport
              otherButtonProps={{ icon: 'export' }}
              requestUrl={`${SRM_SPUC}/v1/${organizationId}/asn-header/for-supplier/maintain/export`}
              queryParams={{
                ...maintenanceQueryParams,
                supplierTenantId,
              }}
            />
          ),
        },
        {
          name: 'check-export',
          group: true,
          child: (
            <ExcelExport
              buttonText={intl.get(`sinv.purchaserDelivery.view.button.checkExport`).d('勾选导出')}
              otherButtonProps={{ icon: 'export', disabled: isEmpty(maintenanceListSelectedRows) }}
              requestUrl={`${SRM_SPUC}/v1/${organizationId}/asn-header/for-supplier/maintain/export`}
              queryParams={{
                // ...maintenanceQueryParams,
                supplierTenantId,
                asnHeaderIds: maintenanceListSelectedRows.map((n) => n.asnHeaderId),
              }}
            />
          ),
        },
      ],
    };
    return <DynamicButtons buttons={actions[defaultActiveKey]} />;
  }

  @Bind()
  redirectImportCreation({ key }) {
    const { history } = this.props;
    const { tenantId, importConfig } = this.state;
    if (key === 'no') return;
    if (key === 'onlyOne') {
      const symbol = importConfig?.planFlag ? 'ASN.PLAN_BATCH_IMPORT' : 'ASN.BATCH_IMPORT';
      history.push({
        pathname: `/sinv/delivery-creation/import-creation/${symbol}`,
        search: stringify({
          action: intl.get('hzero.common.viewtitle.batchImportCreation').d('批量导入创建'),
          backPath: '/sinv/delivery-creation/list',
          args: JSON.stringify({
            tenantId,
            key,
          }),
        }),
      });
      return false;
    }
    // const { getFieldValue } = ((this.creation.search || {}).props || {}).form || {};
    // const templateCode =
    //   getFieldValue('planFlag') === '1' ? 'ASN.PLAN_BATCH_IMPORT' : 'ASN.BATCH_IMPORT';
    history.push({
      pathname: `/sinv/delivery-creation/import-creation/${key}`,
      search: stringify({
        action: intl.get('hzero.common.viewtitle.batchImportCreation').d('批量导入创建'),
        backPath: '/sinv/delivery-creation/list',
        args: JSON.stringify({
          tenantId,
          key,
        }),
      }),
    });
  }

  /**
   * onTabsChange - tabs onChange事件
   * @param {string} tabsActiveKey - 当前焦点tab key
   */
  onTabsChange(tabsActiveKey) {
    this.setState({
      defaultActiveKey: tabsActiveKey,
    });
  }

  /**
   * onCreationListRowSelectChange - 可创建行tabs 行选中事件
   * @param {Array<object>} creationListSelectedRows - 选中的行
   */
  onCreationListRowSelectChange(creationListSelectedRows) {
    this.setState({
      creationListSelectedRows,
    });
  }

  /**
   * onMaintenanceListRowSelectChange - 可维护送货单行tabs 行选中事件
   * @param {Array<object>} creationListSelectedRows - 选中的行
   */
  onMaintenanceListRowSelectChange(maintenanceListSelectedRows) {
    this.setState({
      maintenanceListSelectedRows,
    });
  }

  /**
   * redirectDetail - 跳转详情页面事件
   * @param {number} 送货单头ID
   */
  redirectDetail(id) {
    // 前端判空/未定义
    if (!isNil(id)) {
      const { dispatch, deliveryCreation = {}, history } = this.props;
      const { defaultActiveKey } = this.state;
      const { isRowCollapsedCache = {} } = deliveryCreation;
      const tabsActive = {
        deliveryCreationTab: 'creation',
        deliveryMaintenanceTab: 'maintenance',
      };
      const { isRowCollapsed } = (this[tabsActive[defaultActiveKey]].search || {}).state || {};
      dispatch({
        type: 'deliveryCreation/updateState',
        payload: {
          isRowCollapsedCache: {
            ...isRowCollapsedCache,
            [defaultActiveKey]: isRowCollapsed,
          },
        },
      });
      history.push({ pathname: `/sinv/delivery-creation/detail/${id}` });
    }
  }

  /**
   * getCreationQueryParams - 获取可创建行查询条件
   */
  getCreationQueryParams() {
    let queryParams = {};
    if (this.creation && this.creation.search) {
      const { getFieldsValue } = ((this.creation.search || {}).props || {}).form || {};
      if (isFunction(getFieldsValue)) {
        queryParams = getFieldsValue();
      }
    }
    return queryParams;
  }

  /**
   * getCreationQueryParams - 获取可维护送货单查询条件
   */
  getMaintenanceQueryParams() {
    let queryParams = {};
    if (this.maintenance && this.maintenance.search) {
      const { getFieldsValue } = ((this.maintenance.search || {}).props || {}).form || {};
      if (isFunction(getFieldsValue)) {
        queryParams = getFieldsValue();
      }
    }
    return queryParams;
  }

  /**
   * setMaintenanceQueryParamsCache - 设置新的可维护送货单查询条件缓存
   * @param {object} [newMaintenanceQueryParamsCache={}] 新的可维护送货单查询条件缓存Map
   */
  setMaintenanceQueryParamsCache(newMaintenanceQueryParamsCache = {}) {
    const { dispatch, deliveryCreation = {} } = this.props;
    const { maintenanceQueryParamsCache = {} } = deliveryCreation;
    dispatch({
      type: 'deliveryCreation/updateState',
      payload: {
        maintenanceQueryParamsCache: {
          ...maintenanceQueryParamsCache,
          ...newMaintenanceQueryParamsCache,
        },
      },
    });
  }

  /**
   * clearMaintenanceQueryParamsCache - 清空新的可维护送货单查询条件缓存
   */
  clearMaintenanceQueryParamsCache() {
    const { dispatch } = this.props;
    dispatch({
      type: 'deliveryCreation/updateState',
      payload: {
        maintenanceQueryParamsCache: {},
      },
    });
  }

  /**
   * setCreationQueryParamsCache - 设置新的送货单创建查询条件缓存
   * @param {object} [newCreationQueryParamsCache={}] 新的送货单创建查询条件缓存Map
   */
  setCreationQueryParamsCache(newCreationQueryParamsCache = {}) {
    const { dispatch, deliveryCreation = {} } = this.props;
    const { creationQueryParamsCache = {} } = deliveryCreation;
    dispatch({
      type: 'deliveryCreation/updateState',
      payload: {
        creationQueryParamsCache: {
          ...creationQueryParamsCache,
          ...newCreationQueryParamsCache,
        },
      },
    });
  }

  /**
   * clearMaintenanceQueryParamsCache - 清空新的送货单创建查询条件缓存
   */
  clearCreationQueryParamsCache() {
    const { dispatch } = this.props;
    dispatch({
      type: 'deliveryCreation/updateState',
      payload: {
        creationQueryParamsCache: {},
      },
    });
  }

  render() {
    const {
      remote, // 埋点
      customizeTable,
      customizeFilterForm,
      customizeBtnGroup,
      resetFetchListParamsChange,
      batchSubmitDeliveryLoading,
      queryOperationRecordLoading,
      queryCreateListLoading,
      queryMaintenanceListLoading,
      batchCreateDeliveryLoading,
      batchDeleteDeliveryLoading,
      fetchBusinessRuleLoading,
      deliveryCreation = {},
      searchListParams = {},
      location = {},
      planList = {}, // TODO
    } = this.props;
    const {
      creationListSelectedRows,
      maintenanceListSelectedRows,
      settings,
      // ruleData,
      planFlag,
      defaultActiveKey,
      createTabDataSource = [], // 列表数据源
      createTabPagination = {}, // 列表分页
    } = this.state;
    const {
      code = {},
      orderSource = [],
      maintenanceQueryParamsCache = {},
      creationQueryParamsCache = {},
      isRowCollapsedCache = {},
    } = deliveryCreation;
    const { state: { _back } = {} } = location;
    const backFlag = _back === -1;
    const creationProps = {
      settings,
      planFlag,
      planList, // TODO
      customizeTable,
      searchListParams,
      customizeFilterForm,
      ruleData: planList?.ruleData,
      dataSource: createTabDataSource, // 列表数据源
      pagination: createTabPagination, // 列表分页
      onRef: (node) => {
        this.creation = node;
      },
      fetchImportConfig: this.fetchImportConfig,
      // fetchSettings: this.fetchSettings,
      isActived: defaultActiveKey === 'deliveryCreationTab',
      isDefaultActived: true,
      onListRowSelectChange: this.onCreationListRowSelectChange,
      selectedRows: creationListSelectedRows,
      flagCode: code['HPFM.FLAG'],
      // planFlag: code['HPFM.FLAG'],
      fetchList: this.fetchCreateList,
      processing: { queryCreateListLoading, batchCreateDeliveryLoading, fetchBusinessRuleLoading },
      setQueryParamsCache: this.setCreationQueryParamsCache,
      clearQueryParamsCache: this.clearCreationQueryParamsCache,
      backFlag,
      orderSource,
      creationQueryParamsCache,
      isRowCollapsedCache: isRowCollapsedCache.deliveryCreationTab,
    };
    const maintenanceProps = {
      remote,
      customizeTable,
      customizeFilterForm,
      searchListParams,
      resetFetchListParamsChange,
      onRef: (node) => {
        this.maintenance = node;
      },
      isActived: defaultActiveKey === 'deliveryMaintenanceTab',
      onListRowSelectChange: this.onMaintenanceListRowSelectChange,
      selectedRows: maintenanceListSelectedRows,
      asnTypeCode: code['SINV.ASN_TYPE'],
      fetchList: this.fetchMaintenanceList,
      fetchOperationRecord: this.fetchOperationRecord,
      processing: {
        queryMaintenanceListLoading,
        batchDeleteDeliveryLoading,
        queryOperationRecordLoading,
        batchSubmitDeliveryLoading,
      },
      redirectDetail: this.redirectDetail,
      batchDeleteDelivery: this.batchDeleteDelivery,
      setQueryParamsCache: this.setMaintenanceQueryParamsCache,
      clearQueryParamsCache: this.clearMaintenanceQueryParamsCache,
      backFlag,
      maintenanceQueryParamsCache,
      isRowCollapsedCache: isRowCollapsedCache.deliveryMaintenanceTab,
    };
    return (
      <Fragment>
        <Header
          title={intl.get(`sinv.deliveryCreation.view.title.deliveryCreation`).d('送货单创建')}
        >
          {/* 个性化按钮 */}
          {customizeBtnGroup(
            {
              code:
                defaultActiveKey === 'deliveryCreationTab'
                  ? `SINV.DELIVERY_CREATION.BUTTONS.CREATION`
                  : `SINV.DELIVERY_CREATION.BUTTONS.MAINTENANCE`,
              pro: true,
            },
            this.getActionButtonGroup()
          )}
        </Header>
        <Content style={{ paddingTop: 0 }}>
          <Tabs
            defaultActiveKey={defaultActiveKey}
            activeKey={defaultActiveKey}
            animated={false}
            onChange={this.onTabsChange}
          >
            <TabPane
              tab={intl.get(`sinv.deliveryCreation.view.title.deliveryCreationTab`).d('送货单创建')}
              key="deliveryCreationTab"
            >
              <Creation {...creationProps} />
            </TabPane>
            <TabPane
              tab={intl
                .get(`sinv.deliveryCreation.view.title.deliveryMaintenanceTab`)
                .d('送货单维护')}
              key="deliveryMaintenanceTab"
            >
              <Maintenance {...maintenanceProps} />
            </TabPane>
          </Tabs>
        </Content>
      </Fragment>
    );
  }
}
