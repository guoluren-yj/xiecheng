/*
 * Search - 供应商生命周期申请单查询
 * @date: 2018-9-18
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty, compact } from 'lodash';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
// import qs from 'querystring';
import { SRM_SSLM } from '_utils/config';
import ExcelExport from 'components/ExcelExport';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  getCurrentUser,
  getDateFormat,
  filterNullValueObject,
} from 'utils/utils';
import { DATETIME_MIN } from 'utils/constants';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

const organizationId = getCurrentOrganizationId();

@connect(({ loading, supplierLifeSearch }) => ({
  supplierLifeSearch,
  loading: loading.effects['supplierLifeSearch/fetchApplyForm'],
}))
@formatterCollections({ code: ['sslm.supplierLifeSearch', 'sslm.common'] })
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_LIFE_MANAGE.APPLY_SEARCH',
    'SSLM.SUPPLIER_LIFE_MANAGE.APPLY_LIST',
    'SSLM.SUPPLIER_LIFE_MANAGE.BTN_GROUP',
    'SSLM.SUPPLIER_LIFE_MANAGE.REGISTER_APPLY_LIST', // 注册申请单-列表
    'SSLM.SUPPLIER_LIFE_MANAGE.REGISTER_APPLY_SEARCH', // 注册申请单-查询
    'SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_APPLY_LIST', // 推荐申请单-列表
    'SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_APPLY_SEARCH', // 推荐申请单-查询
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_APPLY_LIST', // 潜在申请单-列表
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_APPLY_SEARCH', // 潜在申请单-查询
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_APPLY_LIST', // 合格申请单-列表
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_APPLY_SEARCH', // 合格申请单-查询
    'SSLM.SUPPLIER_LIFE_MANAGE.RESERVED_APPLY_LIST', // 预留申请单-列表
    'SSLM.SUPPLIER_LIFE_MANAGE.RESERVED_APPLY_SEARCH', // 预留申请单-查询
    'SSLM.SUPPLIER_LIFE_MANAGE.ELIMINATED_APPLY_LIST', // 淘汰申请单-列表
    'SSLM.SUPPLIER_LIFE_MANAGE.ELIMINATED_APPLY_SEARCH', // 淘汰申请单-查询
  ],
})
export default class Search extends Component {
  form;

  /**
   * state 初始化
   */
  constructor(props) {
    super(props);
    this.state = {
      tenantId: organizationId,
      currentUser: getCurrentUser(),
      dateFormat: getDateFormat(),
      customizeFilterFormCode: 'SSLM.SUPPLIER_LIFE_MANAGE.APPLY_SEARCH',
      customizeTableCode: 'SSLM.SUPPLIER_LIFE_MANAGE.APPLY_LIST',
    };
  }

  /**
   * render()调用后获取渲染数据
   */
  componentDidMount() {
    const {
      dispatch,
      match: { params },
      location: { state: { _back } = {} },
      supplierLifeSearch: { pagination = {} },
    } = this.props;

    const { tenantId } = this.state;
    // 校验是否从详情页返回
    const page = _back === -1 ? pagination : {};
    dispatch({
      type: 'supplierLifeSearch/fetchStageList',
      payload: {
        tenantId,
      },
    }).then(res => {
      if (res) {
        const currentStage = res.find(item => item.value.toString() === params.stageId) || {};
        let customizeFilterFormCode = '';
        let customizeTableCode = '';
        switch (currentStage.stageCode) {
          case 'REGISTER':
            customizeFilterFormCode = 'SSLM.SUPPLIER_LIFE_MANAGE.REGISTER_APPLY_SEARCH';
            customizeTableCode = 'SSLM.SUPPLIER_LIFE_MANAGE.REGISTER_APPLY_LIST';
            break;
          case 'RECOMMEND':
            customizeFilterFormCode = 'SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_APPLY_SEARCH';
            customizeTableCode = 'SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_APPLY_LIST';
            break;
          case 'POTENTIAL':
            customizeFilterFormCode = 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_APPLY_SEARCH';
            customizeTableCode = 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_APPLY_LIST';
            break;
          case 'QUALIFIED':
            customizeFilterFormCode = 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_APPLY_SEARCH';
            customizeTableCode = 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_APPLY_LIST';
            break;
          case 'RESERVED':
            customizeFilterFormCode = 'SSLM.SUPPLIER_LIFE_MANAGE.RESERVED_APPLY_SEARCH';
            customizeTableCode = 'SSLM.SUPPLIER_LIFE_MANAGE.RESERVED_APPLY_LIST';
            break;
          case 'ELIMINATED':
            customizeFilterFormCode = 'SSLM.SUPPLIER_LIFE_MANAGE.ELIMINATED_APPLY_SEARCH';
            customizeTableCode = 'SSLM.SUPPLIER_LIFE_MANAGE.ELIMINATED_APPLY_LIST';
            break;
          default:
            customizeFilterFormCode = 'SSLM.SUPPLIER_LIFE_MANAGE.APPLY_SEARCH';
            customizeTableCode = 'SSLM.SUPPLIER_LIFE_MANAGE.APPLY_LIST';
            break;
        }
        this.setState({ customizeFilterFormCode, customizeTableCode }, () => {
          this.handleSearch(page);
        });
      }
    });
    dispatch({
      type: 'supplierLifeSearch/fetchFormType',
    });
    dispatch({
      type: 'supplierLifeSearch/fetchFormStatus',
    });
  }

  /**
   * 数据查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const {
      dispatch,
      match: { params },
    } = this.props;
    const { stageId } = params;
    const { tenantId, customizeFilterFormCode, customizeTableCode } = this.state;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const { startDate, endDate, supplierNameLov, ...others } = filterValues;
    const newFilterValues = {
      ...others,
      startDate: startDate ? startDate.format(DATETIME_MIN) : undefined,
      endDate: endDate ? endDate.format(DATETIME_MIN) : undefined,
    };
    dispatch({
      type: 'supplierLifeSearch/fetchApplyForm',
      payload: {
        tenantId,
        toStageId: stageId,
        page: isEmpty(fields) ? {} : fields,
        ...newFilterValues,
        customizeUnitCode: [customizeFilterFormCode, customizeTableCode],
      },
    });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 页面跳转
   */
  @Bind()
  redirectToApplication(val, record) {
    const { requisitionId, toStageId } = record;
    const { history } = this.props;
    history.push(
      `/sslm/supplier-life-manage/qualified-view?requisitionId=${requisitionId}&toStageId=${toStageId}`
    );
  }

  /**
   * 获取导出参数
   */
  @Bind()
  getQueryParams() {
    const {
      match: { params: { stageId } = {} },
    } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const { startDate, endDate, supplierNameLov, ...others } = filterValues;
    const queryParams = {
      ...others,
      toStageId: stageId,
      startDate: startDate ? startDate.format(DATETIME_MIN) : undefined,
      endDate: endDate ? endDate.format(DATETIME_MIN) : undefined,
    };
    return queryParams;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      tenantId,
      currentUser,
      dateFormat,
      customizeFilterFormCode,
      customizeTableCode,
    } = this.state;
    const {
      loading,
      supplierLifeSearch,
      match: { params },
      custLoading,
      customizeTable,
      customizeFilterForm,
      customizeBtnGroup,
    } = this.props;
    const {
      formList = [],
      pagination = {},
      formType = [],
      formStatus = [],
      stageList = [],
    } = supplierLifeSearch;
    const currentStage = stageList.find(item => item.value.toString() === params.stageId) || {};
    const filterProps = {
      formType,
      formStatus,
      tenantId,
      dateFormat,
      custLoading,
      customizeFilterForm,
      userId: currentUser.id,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      loading,
      pagination,
      custLoading,
      currentStage,
      customizeTable,
      stageId: params.stageId,
      dataSource: formList,
      onChange: this.handleSearch,
      redirectToApplication: this.redirectToApplication,
      stageCode: currentStage.stageCode,
    };

    const stageName = `${currentStage.meaning} - `;
    let templateCode = '';
    let newPermissionCode = '';
    let oldPermissionCode = '';
    switch (currentStage.stageCode) {
      case 'REGISTER':
        templateCode = 'SRM_C_SRM_SSLM_LIFE_CYCLE_REQS_REGISTER';
        newPermissionCode = 'srm.partner.suplier-lifecycle.management.ps.register.export.new';
        oldPermissionCode = 'srm.partner.suplier-lifecycle.management.ps.register.export.old';
        break;
      case 'RECOMMEND':
        templateCode = 'SRM_C_SRM_SSLM_RECOMMEND_HEADER_LIST';
        newPermissionCode = 'srm.partner.suplier-lifecycle.management.ps.recommend.export.new';
        oldPermissionCode = 'srm.partner.suplier-lifecycle.management.ps.recommend.export.old';
        break;
      case 'POTENTIAL':
        templateCode = 'SRM_C_SRM_SSLM_POTENTIAL_HEADER_LIST';
        newPermissionCode = 'srm.partner.suplier-lifecycle.management.ps.potential.export.new';
        oldPermissionCode = 'srm.partner.suplier-lifecycle.management.ps.potential.export.old';
        break;
      case 'QUALIFIED':
        templateCode = 'SRM_C_SRM_SSLM_QUALIFIED_HEADER_LIST';
        newPermissionCode = 'srm.partner.suplier-lifecycle.management.ps.qualified.export.new';
        oldPermissionCode = 'srm.partner.suplier-lifecycle.management.ps.qualified.export.old';
        break;
      case 'ELIMINATED':
        templateCode = 'SRM_C_SRM_SSLM_DEGRADE_HEADER';
        newPermissionCode = 'srm.partner.suplier-lifecycle.management.ps.eliminate.export.new';
        oldPermissionCode = 'srm.partner.suplier-lifecycle.management.ps.eliminate.export.old';
        break;
      default:
        templateCode = 'SRM_C_SRM_SSLM_PREPARE_HEADER_LIST';
        newPermissionCode = 'srm.partner.suplier-lifecycle.management.ps.prepare.export.new';
        oldPermissionCode = 'srm.partner.suplier-lifecycle.management.ps.prepare.export.old';
        break;
    }
    const oldPermissionList = oldPermissionCode
      ? {
          permissionList: oldPermissionCode && [
            {
              code: oldPermissionCode,
              type: 'button',
              meaning: '供应商生命周期管理-导出',
            },
          ],
        }
      : {};
    const buttons = compact([
      currentStage.stageCode && {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/life-cycle-reqss/export`,
          queryParams: () => this.getQueryParams(),
          otherButtonProps: newPermissionCode && {
            permissionList: [
              {
                code: newPermissionCode,
                type: 'button',
                meaning: '供应商生命周期管理-导出',
              },
            ],
          },
          buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
          templateCode,
        },
      },
      currentStage.stageCode && {
        name: 'export',
        btnComp: ExcelExport,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/life-cycle-reqss/export`,
          queryParams: () => this.getQueryParams(),
          otherButtonProps: {
            type: 'c7n-pro',
            icon: 'unarchive',
            ...oldPermissionList,
          },
        },
      },
    ]);
    return (
      <Fragment>
        <Header
          title={
            stageName +
            intl.get('sslm.supplierLifeSearch.view.message.title').d(`${stageName}申请单查询`)
          }
          backPath="/sslm/supplier-life-manage"
        >
          {customizeBtnGroup(
            {
              // code: 'SSLM.SUPPLIER_LIFE_MANAGE.BTN_GROUP',
              code: '',
              pro: true,
            },
            <DynamicButtons buttons={buttons} />
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} customizeFilterFormCode={customizeFilterFormCode} />
          </div>
          <ListTable {...listProps} customizeTableCode={customizeTableCode} />
        </Content>
      </Fragment>
    );
  }
}
