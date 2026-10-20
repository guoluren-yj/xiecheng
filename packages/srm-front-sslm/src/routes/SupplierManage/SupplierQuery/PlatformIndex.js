/**
 * PlatformTable -平台供应商首页
 * @date: 2018-8-16
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Tabs, Modal, Spin, Row, Col, Input, Button, Table } from 'hzero-ui';
import { isEmpty, omit, round } from 'lodash';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';

import remote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Content, Header } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import cacheComponent from 'components/CacheComponent';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';

import { getCurrentOrganizationId, filterNullValueObject, getCurrentLanguage } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import intl from 'utils/intl';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';

import PlatformList from './PlatformList';
import PlatformTable from './PlatformTable';

const { TabPane } = Tabs;
const language = getCurrentLanguage();

const customizeUnitCode =
  'SSLM.SUPPLIER_LIFE_CYCLE.SUMMARY_TABLE,SSLM.SUPPLIER_LIFE_CYCLE.SUMMARY_FORM';
@formatterCollections({
  code: [
    'sslm.supplierManage',
    'sslm.common',
    'sslm.siteInvestigateReport',
    'sslm.supplierInform',
    'sslm.supplierDetail',
    'sslm.enterpriseInform',
  ],
})
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_LIFE_CYCLE.SUMMARY_TABLE',
    'SSLM.SUPPLIER_LIFE_CYCLE.SUMMARY_FORM',
    'SSLM.SUPPLIER_LIFE_CYCLE.SUMMARY.BTN_GROUP',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ supplierQuery, loading }) => ({
  supplierQuery,
  organizationId: getCurrentOrganizationId(),
  loading: loading.effects['supplierQuery/fetchSupplierPool'],
  queryCategoryLoading: loading.effects['supplierQuery/queryCategory'],
  queryLifeCycleLoading: loading.effects['supplierQuery/fetchSupplierLifeCycle'],
}))
@remote({
  code: 'SSLM_SUPPLIER_MANAGE_LIST',
  name: 'manageListRemote',
})
@cacheComponent({ cacheKey: '/sslm/supplier-manager/list' })
export default class Index extends Component {
  constructor(props) {
    super(props);
    const parsed = queryString.parse(location.search.substr(1));
    const { stageId = 'all', sourceKey } = parsed || {};
    this.state = {
      sourceKey,
      stageId: stageId || 'all',
      expand: {},
      allLoading: false,
      modalVisible: false,
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  activateTabs = [];

  componentDidMount() {
    const { dispatch, organizationId } = this.props;
    const { stageId } = this.state;
    const parsed = queryString.parse(location.search.substr(1));
    const { sourceKey } = parsed;
    dispatch({
      type: 'supplierQuery/fetchLifeCyclesStages',
      payload: {
        organizationId,
      },
    }).then(res => {
      if (res) {
        // 等动态tab页渲染完之后进行赋值查询等操作
        const { companyId, companyName, categoryId, categoryDescription } = parsed || {};
        if (categoryId) {
          if (this[`platFormList${stageId}`]) {
            const {
              props: { form: { setFieldsValue = e => e, resetFields = e => e } = {} } = {},
            } = this[`platFormList${stageId}`];
            resetFields();
            if (companyId) {
              setFieldsValue({ companyId, companyName });
            }
            setFieldsValue({ categoryIds: categoryId, categoryDescription });
          }
        }
        this.fetchQueryPageSize({}, stageId);
      }
    });
    this.fetchCodeList();
    if (sourceKey) {
      this.setState({ sourceKey });
    }
  }

  getSnapshotBeforeUpdate(prevProps) {
    const {
      location: { search: prevPropsSearch },
    } = prevProps;
    const {
      location: { search: PropsSearch },
    } = this.props;

    if (prevPropsSearch !== PropsSearch) {
      const parsed = queryString.parse(PropsSearch.substr(1));
      const { stageId = 'all' } = parsed;
      if (stageId === '') {
        parsed.stageId = 'all';
      }
      this.setState({ stageId: parsed.stageId });
      return parsed;
    } else {
      return null;
    }
  }

  componentDidUpdate(prevProps, prevState, parsed) {
    if (parsed !== null) {
      // 延迟执行 ，用于拿到form
      setTimeout(() => {
        if (this[`platFormList${parsed.stageId}`]) {
          const {
            props: { form: { setFieldsValue = e => e, resetFields = e => e } = {} } = {},
          } = this[`platFormList${parsed.stageId}`];
          resetFields();
          const params = filterNullValueObject(omit(parsed, ['stageId']));
          setFieldsValue({
            ...params,
            categoryIds: params.categoryId,
          });
        }
        const { stageId = 'all' } = parsed;
        this.fetchQueryPageSize({}, stageId);
      }, 200);
    }
  }

  componentWillUnmount() {
    this.activateTabs = [];
  }

  // 改变loading
  @Bind()
  changeLoading(allLoading) {
    this.setState({ allLoading });
  }

  // 跳转详情页
  @Bind()
  handleDetail(record) {
    const { history } = this.props;
    const {
      tenantId,
      companyId,
      spfmCompanyId,
      supplierCompanyId,
      spfmSupplierCompanyId,
      supplierTenantId,
    } = record;
    history.push({
      pathname: '/sslm/supplier-manager/supplier-detail',
      search: queryString.stringify({
        tenantId,
        companyId,
        spfmCompanyId,
        supplierCompanyId,
        spfmPartnerCompanyId: spfmSupplierCompanyId,
        partnerTenantId: supplierTenantId,
      }),
    });
  }

  /**
   * 获得值级
   * @param {object} lovCodes --值级
   */
  @Bind()
  fetchCodeList() {
    const { dispatch, organizationId } = this.props;
    const lovCodes = {
      // 是否是ERP供应商
      isErp: 'SPFM.COMPANY.SERVICE_AREA',
      // 经营性质
      businessNature: 'SPFM.BUSINESS_NATURE',
      // 纳税人标志
      taxpayerType: 'SPFM.TAXPAYER_TYPE',
      // 企业类型
      companyType: 'HPFM.COMPANY_TYPE',
      // 认证地区
      foreignRelationList: 'SPFM.DOMESTIC_FOREIGN_RELATION',
      // CA状态
      caAuthStatusList: 'SPFM.CA_STATUS',
      // 送货服务范围
      serviceAreaCodeList: 'SPFM.COMPANY.SERVICE_AREA',
      tenantId: organizationId,
    };
    // 初始化 值集
    dispatch({
      type: `supplierQuery/batchCode`,
      payload: {
        lovCodes,
      },
    });
  }

  /**
   * 获取分页pageSize数量
   * @param {object} formSource --来源界面
   */
  @Bind()
  fetchQueryPageSize(page = {}, stageId = '', firstOpenPage = false) {
    const {
      dispatch,
      supplierQuery: { pageSizeMap = {} },
    } = this.props;
    if (firstOpenPage) {
      return;
    }
    if (isEmpty(pageSizeMap)) {
      // 初始化 值集
      dispatch({
        type: `supplierQuery/queryPageSize`,
        payload: {
          formSource: 'lifeCycleSum', // 生命周期汇总页面
        },
      }).then(res => {
        if (res) {
          this.handleSearch(page, stageId);
        }
      });
    } else {
      this.handleSearch(page, stageId);
    }
  }

  @Bind()
  handeFirstQuery(stageId) {
    if (isEmpty(this.activateTabs)) {
      this.fetchQueryPageSize({}, stageId, true);
      return;
    }
    this.fetchQueryPageSize({}, stageId);
  }

  @Bind()
  changeTabs(stageId) {
    const newActivateTabs = [...this.activateTabs];
    if (!this.activateTabs.includes(stageId)) {
      newActivateTabs.push(stageId);
    }
    // 缓存激活的tab
    this.activateTabs = [...newActivateTabs];
    this.setState({
      stageId,
    });
  }

  /**
   * 获取供应商列表
   * @param {object} query --初始查询时的默认参数
   * @param {?number} query.page --页码
   * @param {object} otherParam -- 从url获取的查询参数
   * @param {?number} query.size --条数
   * @param {?string} query.getOrganizationId --租户ID
   * @param {?object} params --条件查询时的表单的参数
   */
  @Bind()
  handleSearch(page = {}, stageId = '') {
    const {
      dispatch,
      organizationId,
      supplierQuery: { pageSizeMap = {} },
    } = this.props;
    const { stageId: oldStageId, sourceKey } = this.state;
    const parsed = queryString.parse(location.search.substr(1));
    // skipFlag 特步二开供应商分类定义传的标识，用于后端查询
    const { skipFlag = null } = parsed;
    // 解决从state中取stageId存在异步的问题
    const newStageId = stageId || oldStageId;
    const fieldValues =
      (this[`platFormList${newStageId}`] &&
        this[`platFormList${newStageId}`].props &&
        this[`platFormList${newStageId}`].props.form.getFieldsValue()) ||
      {};
    const { registeredCapitalFrom, registeredCapitalTo } = fieldValues || {};

    const {
      registeredRegionId,
      registeredCityId,
      registeredDistrictId,
      registeredCityMeaning,
      registeredDistrictMeaning,
      registeredRegionMeaning,
      ...others
    } = fieldValues;
    const registeredRegionIdsStr = registeredDistrictId || registeredCityId || registeredRegionId;
    const registeredRegionIds = registeredRegionIdsStr
      ? registeredRegionIdsStr.split(',')
      : undefined;
    // 从供应商分类定义跳转过来，传categoryId，后端查询父子级分类对应的供应商
    let categoryId = null;
    // 非其他功能跳转过来的正常传categoryIds
    let categoryIds = null;
    // SUPPLIER_CATEGORY 供应商分类定义跳转过来
    if (sourceKey === 'SUPPLIER_CATEGORY') {
      categoryId = fieldValues.categoryIds;
      categoryIds = null;
    } else {
      categoryIds = fieldValues.categoryIds && fieldValues.categoryIds.split(',');
      categoryId = null;
    }

    const newFilterValues = {
      ...others,
      categoryId,
      categoryIds,
      industryIdList: fieldValues.industryIdList && fieldValues.industryIdList.split(','),
      categoryIdList: fieldValues.categoryIdList && fieldValues.categoryIdList.split(','),
      newUpdateDateStart:
        fieldValues.newUpdateDateStart &&
        moment(fieldValues.newUpdateDateStart).format(DATETIME_MIN),
      newUpdateDateEnd:
        fieldValues.newUpdateDateEnd && moment(fieldValues.newUpdateDateEnd).format(DATETIME_MAX),
      registeredCapitalFrom:
        language === 'en_US'
          ? registeredCapitalFrom
            ? round(registeredCapitalFrom * 100, 6)
            : registeredCapitalFrom
          : registeredCapitalFrom,
      registeredCapitalTo:
        language === 'en_US'
          ? registeredCapitalTo
            ? round(registeredCapitalTo * 100, 6)
            : registeredCapitalTo
          : registeredCapitalTo,
      registeredRegionIds,
    };

    // 分页改造参数
    const pageFilterParams = {
      asyncCountFlag: 'DEFAULT',
      oldTotalElements: page.total ? page.total : '',
    };
    const pageSizeNum = pageSizeMap.size || 10;

    dispatch({
      type: 'supplierQuery/fetchSupplierPool',
      payload: {
        page: { pageSize: pageSizeNum, ...page },
        organizationId,
        tenantId: organizationId,
        stageId: newStageId === 'all' ? undefined : newStageId,
        ...filterNullValueObject(newFilterValues),
        customizeUnitCode,
        categoryName: undefined,
        itemCategoryName: undefined,
        skipFlag,
        ...filterNullValueObject(pageFilterParams),
      },
    });
  }

  /**
   * 是否展开
   */
  @Bind()
  toggle() {
    const { stageId, expand } = this.state;
    this.setState({
      expand: {
        [stageId]: !expand[stageId],
      },
    });
  }

  /**
   * 获得导出参数
   */
  @Bind()
  getQueueParams() {
    const { stageId } = this.state;
    const { organizationId } = this.props;
    const fieldValues =
      this[`platFormList${stageId}`] &&
      this[`platFormList${stageId}`].props &&
      this[`platFormList${stageId}`].props.form.getFieldsValue();
    const { registeredCapitalFrom, registeredCapitalTo } = fieldValues || {};
    const {
      registeredRegionId,
      registeredCityId,
      registeredDistrictId,
      registeredCityMeaning,
      registeredDistrictMeaning,
      registeredRegionMeaning,
      ...others
    } = fieldValues;
    const registeredRegionIdsStr = registeredDistrictId || registeredCityId || registeredRegionId;
    const registeredRegionIds = registeredRegionIdsStr
      ? registeredRegionIdsStr.split(',')
      : undefined;
    const filterValues = {
      stageId: stageId === 'all' ? undefined : stageId,
      ...others,
      categoryIds: fieldValues.categoryIds && fieldValues.categoryIds.split(','),
      industryIdList: fieldValues.industryIdList && fieldValues.industryIdList.split(','),
      categoryIdList: fieldValues.categoryIdList && fieldValues.categoryIdList.split(','),
      registeredRegionIds,
      newUpdateDateStart:
        fieldValues &&
        fieldValues.newUpdateDateStart &&
        moment(fieldValues.newUpdateDateStart).format(DATETIME_MIN),
      newUpdateDateEnd:
        fieldValues &&
        fieldValues.newUpdateDateEnd &&
        moment(fieldValues.newUpdateDateEnd).format(DATETIME_MAX),
      organizationId,
      tenantId: organizationId,
      categoryName: undefined,
      registeredCapitalFrom:
        language === 'en_US'
          ? registeredCapitalFrom
            ? round(registeredCapitalFrom * 100, 6)
            : registeredCapitalFrom
          : registeredCapitalFrom,
      registeredCapitalTo:
        language === 'en_US'
          ? registeredCapitalTo
            ? round(registeredCapitalTo * 100, 6)
            : registeredCapitalTo
          : registeredCapitalTo,
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.SUMMARY_TABLE',
    };
    return filterNullValueObject(filterValues);
  }

  /**
   * 品类弹框
   */
  @Bind()
  handleModal() {
    const { modalVisible, selectedRows = [] } = this.state;
    this.setState({ modalVisible: !modalVisible });
    if (!modalVisible) {
      this.queryCategory();
    }

    const { props: { form: { setFieldsValue = e => e } = {} } = {} } = this.platFormListall;
    setFieldsValue({ itemCategoryId: selectedRows.map(n => n.categoryName).join('，') });
  }

  // 清空多选数据
  @Bind()
  emitEmpty() {
    const { props: { form: { setFieldsValue = e => e } = {} } = {} } = this.platFormListall;
    setFieldsValue({
      itemCategoryId: undefined,
    });
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  /**
   * 重置Modal中的品类查询
   */
  @Bind()
  handleResetCategory() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  /**
   * 查询品类
   */
  @Bind()
  queryCategory(page = {}) {
    const { dispatch, form: { getFieldsValue = e => e } = {} } = this.props;
    const formValue = getFieldsValue();
    const { categoryName, categoryCode } = formValue;
    dispatch({
      type: 'supplierQuery/queryCategory',
      payload: {
        page,
        viewCode: 'SMDM.TREE_ITEM_CATEGORY',
        enabledFlag: 1,
        categoryName,
        categoryCode,
      },
    });
    this.setState({ modalVisible: true });
  }

  /**
   * 选中项发生改变的回调
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * 查找生命周期升降级记录
   */
  @Bind()
  querySupplierLifeCycle(record = {}) {
    const { dispatch } = this.props;
    const { companyId, supplierCompanyId } = record;
    return dispatch({
      type: `supplierQuery/fetchSupplierLifeCycle`,
      payload: {
        companyId,
        supplierCompanyId,
      },
    });
  }

  render() {
    const {
      supplierQuery: {
        code,
        supplierList = {},
        pagination = {},
        supplierStage = {},
        categoryList = [],
        categoryPagination = {},
      },
      form: { getFieldDecorator },
      loading,
      organizationId,
      customizeTable,
      custLoading,
      queryCategoryLoading,
      customizeFilterForm,
      queryLifeCycleLoading,
      history,
      manageListRemote,
      customizeBtnGroup,
    } = this.props;
    const { stageId, modalVisible, selectedRowKeys, selectedRows, expand, allLoading } = this.state;
    const lifeCycleStageLanes = [
      {
        stageId: 'all',
        stageDescription: intl.get(`hzero.common.scope.all`).d('全部'),
      },
      ...(supplierStage.lifeCycleStageLanes || []),
    ];
    const columns = [
      {
        title: intl.get('sslm.supplierManage.model.title.categoryName').d('类别名称'),
        dataIndex: 'categoryName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierManage.model.title.categoryCode').d('类别编码'),
        dataIndex: 'categoryCode',
        width: 120,
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: this.handleRowSelectChange,
    };

    const buttons = !isEmpty(supplierList[stageId])
      ? [
          {
            name: 'detailExport',
            btnComp: ExcelExportPro,
            btnProps: {
              requestUrl: `${SRM_SSLM}/v1/${organizationId}/supplier-pool/detail-export-post`,
              queryParams: () => this.getQueueParams(),
              method: 'POST',
              allBody: true,
              buttonText: intl.get('sslm.common.button.detailExport').d('详情导出'),
              templateCode: 'SRM_C_SRM_SPFM_PARTNER_DETAIL_POOL',
              otherButtonProps: {
                loading: allLoading,
                permissionList: [
                  {
                    code:
                      'srm.partner.suplier-lifecycle.summary-query.ps.supplier.pool.details.export',
                    type: 'button',
                    meaning: '供应商生命周期汇总查询-详情导出',
                  },
                ],
              },
            },
          },
          {
            name: 'exportPro',
            btnComp: ExcelExportPro,
            btnProps: {
              requestUrl: `${SRM_SSLM}/v1/${organizationId}/supplier-pool/export_post`,
              method: 'POST',
              allBody: true,
              queryParams: () => this.getQueueParams(),
              otherButtonProps: {
                loading: allLoading,
                permissionList: [
                  {
                    code: 'srm.partner.suplier-lifecycle.summary-query.ps.supplier.pool.export.new',
                    type: 'button',
                    meaning: '供应商生命周期汇总查询-导出',
                  },
                ],
              },
              buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
              templateCode: 'SRM_C_SRM_SSLM_LIFE_CYCLE_SUPPLIER_POOL',
            },
          },
          {
            name: 'export',
            btnComp: ExcelExport,
            btnProps: {
              requestUrl: `${SRM_SSLM}/v1/${organizationId}/supplier-pool/export`,
              queryParams: () => this.getQueueParams(),
              otherButtonProps: {
                type: 'c7n-pro',
                icon: 'unarchive',
                loading: allLoading,
                permissionList: [
                  {
                    code: 'srm.partner.suplier-lifecycle.summary-query.ps.supplier.pool.export.old',
                    type: 'button',
                    meaning: '供应商生命周期汇总查询-导出',
                  },
                ],
              },
            },
          },
        ]
      : [];

    const manageListRemoteProps = {
      allLoading,
      setLoading: this.changeLoading,
      getQueryParams: this.getQueueParams,
    };

    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sslm.supplierManage.view.title.supplierLifecycleQuery`)
            .d('供应商生命周期汇总查询')}
        >
          {customizeBtnGroup(
            {
              code: 'SSLM.SUPPLIER_LIFE_CYCLE.SUMMARY.BTN_GROUP',
              pro: true,
            },
            <DynamicButtons buttons={buttons} />
          )}
          {manageListRemote &&
            manageListRemote.render(
              'SSLM_SUPPLIER_MANAGE_LIST_HEADER_BTN',
              <Fragment />,
              manageListRemoteProps
            )}
        </Header>
        <Content>
          <Tabs
            activeKey={this.state.stageId}
            tabPosition="top"
            onChange={this.changeTabs}
            animated={false}
          >
            {lifeCycleStageLanes.map(n => {
              let Com = this[n.stageId];
              if (!this[n.stageId]) {
                // eslint-disable-next-line
                Com = this[n.stageId] = PlatformList(
                  `/sslm/supplier-manager/list/search-${n.stageId}`
                );
              }
              return (
                (n || {}).stageDescription && (
                  <TabPane key={n.stageId} tab={n.stageDescription}>
                    <Com
                      active={this.state.stageId === n.stageId}
                      cacheKey={`/sslm/supplier-manager/list/search-${n.stageId}`}
                      organizationId={organizationId}
                      code={code}
                      stageId={n.stageId}
                      expand={!!expand[n.stageId]}
                      onSearch={this.handleSearch}
                      onToggle={this.toggle}
                      // handleModal={this.handleModal}
                      // emitEmpty={this.emitEmpty}
                      custLoading={custLoading}
                      selectedRows={selectedRows}
                      remote={manageListRemote}
                      customizeFilterForm={customizeFilterForm}
                      onRef={ref => {
                        this[`platFormList${n.stageId}`] = ref;
                      }}
                      handeFirstQuery={this.handeFirstQuery}
                      clearSourceKey={() => this.setState({ sourceKey: null })}
                    />
                    <div style={{ marginTop: 10 }}>
                      <PlatformTable
                        loading={loading}
                        supplierList={supplierList[n.stageId] || {}}
                        pagination={pagination[n.stageId] || {}}
                        onSearch={this.handleSearch}
                        customizeTable={customizeTable}
                        custLoading={custLoading}
                        onJump={this.handleDetail}
                        queryLifeCycleLoading={queryLifeCycleLoading}
                        querySupplierLifeCycle={this.querySupplierLifeCycle}
                        history={history}
                      />
                    </div>
                  </TabPane>
                )
              );
            })}
          </Tabs>
          {modalVisible && (
            <Modal
              width={720}
              title={intl.get('sslm.siteInvestigateReport.modal.mange.category').d('品类')}
              visible={modalVisible}
              onOk={this.handleModal}
              onCancel={this.handleModal}
            >
              <Form>
                <Row gutter={24} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Row style={{ display: 'flex', alignItems: 'center' }}>
                      <Col span={8}>
                        {intl.get('sslm.supplierManage.model.title.categoryName').d('类别名称')}:
                      </Col>
                      <Col span={16}>
                        {getFieldDecorator('categoryName')(<Input trim dbc2sbc={false} />)}
                      </Col>
                    </Row>
                  </Col>
                  <Col span={8}>
                    <Row style={{ display: 'flex', alignItems: 'center' }}>
                      <Col span={8}>
                        {intl.get('sslm.supplierManage.model.title.categoryCode').d('类别编码')}:
                      </Col>
                      <Col span={16}>
                        {getFieldDecorator('categoryCode')(<Input trim dbc2sbc={false} />)}
                      </Col>
                    </Row>
                  </Col>
                  <Col span={8}>
                    <Button
                      data-code="reset"
                      onClick={this.handleResetCategory}
                      style={{ marginRight: 8 }}
                    >
                      {intl.get('hzero.common.button.reset').d('重置')}
                    </Button>
                    <Button
                      data-code="search"
                      type="primary"
                      htmlType="submit"
                      onClick={this.queryCategory}
                    >
                      {intl.get('hzero.common.button.search').d('查询')}
                    </Button>
                  </Col>
                </Row>
              </Form>
              <Spin spinning={queryCategoryLoading}>
                <Table
                  bordered
                  rowKey="categoryId"
                  columns={columns}
                  rowSelection={rowSelection}
                  dataSource={categoryList}
                  onChange={this.queryCategory}
                  pagination={categoryPagination}
                />
              </Spin>
            </Modal>
          )}
        </Content>
      </React.Fragment>
    );
  }
}
