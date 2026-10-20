/**
 * supplyAbility - 供货能力评审
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Table, Tabs, Spin } from 'hzero-ui';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';

import remote from 'utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import CacheComponent from 'components/CacheComponent';
import { SRM_SSLM } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { dateRender } from 'utils/renderer';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  getUserOrganizationId,
} from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import intl from 'utils/intl';

import ReviewTable from './ReviewTable';
import FilterForm from './FilterForm';
import Search from './Search';

/**
 * 供货能力评审
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} supplyAbility - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ supplyAbility, loading, user }) => ({
  supplyAbility,
  userId: user.currentUser.id,
  organizationId: getCurrentOrganizationId(),
  userOrganizationId: getUserOrganizationId(),
  queryListLoading: loading.effects['supplyAbility/queryList'],
  queryReviewDetailLoading: loading.effects['supplyAbility/queryReviewDetail'],
}))
@formatterCollections({
  code: ['sslm.common', 'sslm.supplyAbility', 'sslm.supplierDocManage'],
})
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_ABILITY_QUERY.LIST_TABLE',
    'SSLM.SUPPLIER_ABILITY_QUERY.FILTERFORM',
    'SSLM.SUPPLIER_ABILITY_QUERY.SUPPLYABILITYQUERY',
    'SSLM.SUPPLIER_ABILITY_QUERY.DEFINITIONTABLE',
    'SSLM.SUPPLIER_ABILITY_QUERY.LIST.BTN_GROUP',
    'SSLM.SUPPLIER_ABILITY_QUERY.LIST_TAB',
  ],
})
@remote({
  code: 'SSLM.SUPPLY_ABILITY_QUERY_LIST',
  name: 'supplyAbilityQueryRemote',
})
@CacheComponent({ cacheKey: '/sslm/supplier-ablility-query' })
export default class DefinitionList extends PureComponent {
  constructor(props) {
    super(props);
    const routeParams = qs.parse(props.location.search.substr(1));
    this.state = {
      activeKey: 'reviewTable', // tabs的key
      routeParams,
    };
  }

  componentDidMount() {
    const { activeKey } = this.state;
    this.handleSaveKey(activeKey);
    this.init();
  }

  // getSnapshotBeforeUpdate() {
  //   if (!this.custFlag && !this.props.custLoading && this.filterForm) {
  //     this.handleSearch();
  //     this.custFlag = true;
  //   }
  //   if (!this.cusReviewFlag && !this.props.custLoading && this.filterReviewForm) {
  //     this.handleReviewSearch();
  //     this.cusReviewFlag = true;
  //   }
  // }

  /**
   * 查询值集
   * @returns
   */
  @Bind()
  init() {
    const { dispatch, organizationId } = this.props;

    // 查询lov值集
    dispatch({
      type: 'supplyAbility/queryStageList',
      payload: { lovCode: 'SSLM.LIFE_CYCLE_STAGE', organizationId },
    });

    // 查询独立值集
    const lovCode = {
      lineStatus: 'SUPPLY_ABILITY_REVIEW_LINE_STATUS',
      headerStatus: 'SUPPLY_ABILITY_REVIEW_STATUS',
    };
    dispatch({
      type: 'supplyAbility/queryValueSet',
      payload: lovCode,
    });
  }

  /**
   * 查询参数里的时间处理
   * @param {Object} filterValues 查询参数
   */
  @Bind()
  handleFilterDate(filterValues) {
    const {
      startCreateDate,
      startUpdateDate,
      endCreateDate,
      endUpdateDate,
      supplierNameLov,
      ...others
    } = filterValues;
    let startDate;
    let endDate;
    let startUpdate;
    let endUpdate;
    if (startCreateDate) startDate = moment(startCreateDate).format(DATETIME_MIN);
    if (endCreateDate) endDate = moment(endCreateDate).format(DATETIME_MAX);
    if (startUpdateDate) startUpdate = moment(startUpdateDate).format(DATETIME_MIN);
    if (endUpdateDate) endUpdate = moment(endUpdateDate).format(DATETIME_MAX);
    return {
      ...others,
      startCreateDate: startDate,
      endCreateDate: endDate,
      startUpdateDate: startUpdate,
      endUpdateDate: endUpdate,
    };
  }

  /**
   * 查询页面初始数据
   * @param {Object} payload 分页参数和表单对象
   */
  @Bind()
  handleSearch(payload) {
    const { dispatch, organizationId } = this.props;
    const form = this.filterForm;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());

    const newFilterValues = this.handleFilterDate(filterValues);

    // 分页改造参数
    const pageFilterParams = {
      asyncCountFlag: 'DEFAULT',
      oldTotalElements: payload?.total ? payload.total : '',
    };
    dispatch({
      type: 'supplyAbility/queryList',
      payload: {
        organizationId,
        page: payload,
        ...filterNullValueObject(newFilterValues),
        ...filterNullValueObject(pageFilterParams),
        customizeUnitCode:
          'SSLM.SUPPLIER_ABILITY_QUERY.SUPPLYABILITYQUERY,SSLM.SUPPLIER_ABILITY_QUERY.DEFINITIONTABLE',
      },
    });
  }

  /**
   * 查询供货能力清单
   * @function handleReviewSearch
   * @param {Number} params.organizationId 租户Id
   * @param {Number} [params.page = 0] - 数据页码
   * @param {Number} [params.size = 10] - 分页大小
   */
  @Bind()
  handleReviewSearch(payload, filter, sorter = {}) {
    // h0组件中列排序时增加接口传参
    const { field = '', order = '' } = sorter;
    const sorterField = field && order ? { [`${field}Order`]: order } : {};
    const { dispatch, organizationId } = this.props;
    const form = this.filterReviewForm;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const newFilterValues = this.handleFilterDate(filterValues);

    // 分页改造参数
    const pageFilterParams = {
      asyncCountFlag: 'DEFAULT',
      oldTotalElements: payload?.total ? payload.total : '',
    };
    dispatch({
      type: 'supplyAbility/queryReviewDetail',
      payload: {
        organizationId,
        page: payload,
        ...filterNullValueObject(newFilterValues),
        ...sorterField,
        ...filterNullValueObject(pageFilterParams),
        customizeUnitCode:
          'SSLM.SUPPLIER_ABILITY_QUERY.LIST_TABLE,SSLM.SUPPLIER_ABILITY_QUERY.FILTERFORM',
      },
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const form = this.filterReviewForm;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const newFilterValues = this.handleFilterDate(filterValues);
    return newFilterValues;
  }

  /**
   * 调转到详情页
   * @param {Number} supplyAbilityId
   */
  @Bind()
  handleGoDetail(supplyAbilityId) {
    if (supplyAbilityId) {
      this.props.history.push(`/sslm/supplier-ablility-query/detail/${supplyAbilityId}`);
    }
  }

  /**
   * 保存激活的tab的key
   * @param {String} activeKey
   */
  @Bind()
  handleSaveKey(activeKey) {
    this.setState({ activeKey });
  }

  /**
   * 下载文件
   * @param {Object} file 文件对象
   */
  @Bind()
  onDraggerUploadPreview(file) {
    const url = file.response;
    window.open(url, '_blank');
  }

  render() {
    const {
      userId,
      dispatch,
      organizationId,
      userOrganizationId,
      supplyAbility: {
        definitionData = {},
        definitionPagination = {},
        reviewMaterialData = {},
        reviewMaterialPagination = {},
        code: { lineStatus = [], headerStatus = [] } = {},
        stageList = [],
      },
      customizeTable,
      customizeFilterForm,
      custLoading,
      customizeBtnGroup,
      customizeTabPane,
      queryListLoading,
      supplyAbilityQueryRemote,
      queryReviewDetailLoading,
    } = this.props;
    const loading = queryListLoading || queryReviewDetailLoading || false;
    const { content = [] } = definitionData;
    const { activeKey, routeParams } = this.state;
    const filterReviewProps = {
      userId,
      lineStatus,
      organizationId,
      customizeFilterForm,
      userOrganizationId,
      stageList,
      custLoading,
      routeParams,
      onReviewSearch: this.handleReviewSearch,
      ...{ search: this.props.location.search },
      onRef: ref => {
        this.filterReviewForm = ref.props.form;
      },
    };
    const filterProps = {
      userId,
      headerStatus,
      organizationId,
      userOrganizationId,
      onSearch: this.handleSearch,
      stageList,
      routeParams,
      ...{ search: this.props.location.search },
      onRef: ref => {
        this.filterForm = ref.props.form;
      },
      customizeFilterForm,
      custLoading,
    };
    const reviewTableProps = {
      isOperate: false,
      isEdit: false,
      isHaveSupplier: true,
      dataSource: reviewMaterialData,
      pagination: reviewMaterialPagination,
      tableChange: this.handleReviewSearch,
      onHandleGoDetail: this.handleGoDetail,
      upload: this.showUploadModal,
      customizeTable,
      custLoading,
    };
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'supplyAbilityStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
        render: (text, record) => (
          <a onClick={() => this.handleGoDetail(record.supplyAbilityId)}>{text}</a>
        ),
      },
      {
        title: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.lifeCycleStage`).d('生命周期阶段'),
        dataIndex: 'stageDescription',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.view.company.name`).d('公司'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`sslm.common.view.creator.name`).d('创建人'),
        width: 100,
        dataIndex: 'createUserName',
      },
      {
        title: intl
          .get('sslm.supplyAbility.model.supplyAbility.createUserDepartment')
          .d('创建人部门'),
        width: 100,
        dataIndex: 'createUserDepartment',
      },
      {
        title: intl.get(`sslm.common.view.created.date`).d('创建日期'),
        width: 120,
        dataIndex: 'creationDate',
        render: dateRender,
      },
      {
        title: intl
          .get(`sslm.supplyAbility.model.supplyAbility.lastUpdateUserName`)
          .d('最后更新人'),
        width: 100,
        dataIndex: 'lastUpdateUserName',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.lastUpdateDate`).d('最后更新日期'),
        width: 120,
        dataIndex: 'lastUpdateDate',
        render: dateRender,
      },
    ];

    const buttons =
      activeKey === 'reviewTable'
        ? [
            {
              name: 'exportPro',
              btnComp: ExcelExportPro,
              btnProps: {
                requestUrl: `${SRM_SSLM}/v1/${organizationId}/supply-abilitys/detail/export_post`,
                queryParams: () => this.handleGetFormValue(),
                buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
                templateCode: 'SRM_C_SRM_SSLM_SUPPLY_ABILITY_DETAIL',
                method: 'POST',
                allBody: true,
                otherButtonProps: {
                  permissionList: [
                    {
                      code:
                        'srm.partner.suplier-ability.supply-ability-query.ps.details.export.new',
                      type: 'button',
                      meaning: '供货能力清单查询-导出',
                    },
                  ],
                },
              },
            },
            {
              name: 'export',
              btnComp: ExcelExport,
              btnProps: {
                requestUrl: `${SRM_SSLM}/v1/${organizationId}/supply-abilitys/detail/export`,
                queryParams: () => this.handleGetFormValue(),
                otherButtonProps: {
                  type: 'c7n-pro',
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code:
                        'srm.partner.suplier-ability.supply-ability-query.ps.details.export.old',
                      type: 'button',
                      meaning: '供货能力清单查询-导出',
                    },
                  ],
                },
              },
            },
          ]
        : [];
    const remoteBtnProps = {
      dispatch,
      activeKey,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`sslm.supplyAbility.view.message.title.query`).d('供货能力清单查询')}
        >
          {customizeBtnGroup(
            {
              code: activeKey === 'reviewTable' ? 'SSLM.SUPPLIER_ABILITY_QUERY.LIST.BTN_GROUP' : '',
              pro: true,
            },
            <DynamicButtons buttons={buttons} />
          )}
          {supplyAbilityQueryRemote.render(
            'SSLM.SUPPLY_ABILITY_QUERY_LIST.HEADER_BTNS',
            null,
            remoteBtnProps
          )}
        </Header>
        <Content style={{ paddingTop: 0 }}>
          <Spin spinning={loading}>
            {customizeTabPane(
              { code: 'SSLM.SUPPLIER_ABILITY_QUERY.LIST_TAB' },
              <Tabs activeKey={activeKey} animated={false} onChange={this.handleSaveKey}>
                <Tabs.TabPane
                  forceRender
                  tab={intl
                    .get(`sslm.supplyAbility.view.message.reviewTable`)
                    .d('供货能力清单明细查询')}
                  key="reviewTable"
                >
                  <div className="table-list-search">
                    <FilterForm {...filterReviewProps} />
                  </div>
                  <ReviewTable {...reviewTableProps} />
                </Tabs.TabPane>
                <Tabs.TabPane
                  forceRender
                  tab={intl
                    .get(`sslm.supplyAbility.view.message.supplyAbilityQuery`)
                    .d('供货能力清单查询')}
                  key="definitionTable"
                >
                  <div className="table-list-search">
                    <Search {...filterProps} />
                  </div>
                  {customizeTable(
                    {
                      code: 'SSLM.SUPPLIER_ABILITY_QUERY.DEFINITIONTABLE',
                    },
                    <Table
                      bordered
                      rowKey="supplyAbilityId"
                      dataSource={content}
                      columns={columns}
                      custLoading={custLoading}
                      pagination={definitionPagination}
                      onChange={this.handleSearch}
                    />
                  )}
                </Tabs.TabPane>
              </Tabs>
            )}
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
