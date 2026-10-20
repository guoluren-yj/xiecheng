import React, { Component } from 'react';
import { Row, Col, Popover, Table } from 'hzero-ui';
import { math } from 'choerodon-ui/dataset';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isUndefined, isEmpty, sum } from 'lodash';
import { withRouter } from 'react-router';

import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import AutoHeightTable from 'srm-front-boot/lib/components/Table';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { Button as PermissionButton } from 'components/Permission';

import ViewLadder from '@/components/ViewLadder';
import { precisionRender } from '@/utils/precision';
import { openSkuEdit, openSkuDetail } from '@/utils/openCommonTab';
import { getH0CustDimensions, withCustomDimension } from '@/utils/customDimension';
import { getSkuUomConfig } from '@/services/mallProtocolManagementService';
import SearchForm from './SearchForm';
import SearchModal from './SearchModal.js';
import style from './index.less';
import PriceModal from '../PriceModal';
import { protManageBtns } from '../../const/uniCode';
import ListTransfer from './ListTransfer';

const organizationId = getCurrentOrganizationId();

@withCustomDimension()
@connect(({ mallProtocolManagement, loading }) => ({
  mallProtocolManagement,
  addLoading: loading.effects['mallProtocolManagement/lineAddProduct'],
  replaceLoading: loading.effects['mallProtocolManagement/changeProduct'],
  deleteLoading: loading.effects['mallProtocolManagement/lineDeleteProduct'],
  fetchLoading: loading.effects['mallProtocolManagement/fetcthProductDetail'],
  fetchNoExitLoading: loading.effects['mallProtocolManagement/fetchNoExitProductList'],
}))
@withRouter
export default class ProtocolSearch extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      display: false,
      currentSku: [],
      visible: false,
      productVisible: false,
      dataValue: {},
      uomFlag: false,
    };
  }

  searchForm;

  rightForm;

  componentDidMount() {
    this.fetchUomConfig();
    this.fetcthProtocolData();
  }

  fetchUomConfig = async () => {
    const res = getResponse(await getSkuUomConfig());
    if (res) this.setState({ uomFlag: res });
  };

  @Bind()
  handleOpen() {
    this.setState({ display: true });
  }

  @Bind()
  handleHidden() {
    this.setState({ display: false });
  }

  @Bind()
  handleViewPriceModal(record) {
    this.setState({
      visible: true,
      currentSku: record,
    });
  }

  // 获取表单查询参数&固定参数
  @Bind()
  getQueryParams() {
    const filterValue = isUndefined(this.searchForm) ? {} : this.searchForm.getFieldsValue();
    const filterRightValue = isUndefined(this.rightForm) ? {} : this.rightForm.getFieldsValue();
    return {
      tenantId: organizationId,
      ...filterValue,
      ...filterRightValue,
      validDateFrom:
        filterRightValue.validDateFrom && filterRightValue.validDateFrom.format(DATETIME_MIN),
      validDateTo:
        filterRightValue.validDateTo && filterRightValue.validDateTo.format(DATETIME_MAX),
      creationDateFrom:
        filterRightValue.creationDateFrom && filterRightValue.creationDateFrom.format(DATETIME_MIN),
      creationDateTo:
        filterRightValue.creationDateTo && filterRightValue.creationDateTo.format(DATETIME_MAX),
      releaseDateFrom:
        filterRightValue.releaseDateFrom && filterRightValue.releaseDateFrom.format(DATETIME_MIN),
      releaseDateTo:
        filterRightValue.releaseDateTo && filterRightValue.releaseDateTo.format(DATETIME_MAX),
    };
  }

  @Bind()
  fetcthProtocolData(page = { page: 0, size: 10 }) {
    const { dispatch } = this.props;
    const filterParams = this.getQueryParams();
    const params = {
      ...filterParams,
      page: isEmpty(page) ? {} : page,
    };
    dispatch({
      type: 'mallProtocolManagement/fetcthProductDetail',
      payload: params,
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.searchForm = (ref || {}).props.form;
  }

  @Bind()
  handleRightRef(ref = {}) {
    this.rightForm = (ref || {}).props.form;
  }

  /**
   * 展示商品穿梭框
   */
  @Bind()
  handleShowTransfer(record, type) {
    const { agreementLineId, supplierTenantId, tenantId } = record;
    this.setState(
      {
        agreementLineId,
        productVisible: true,
        supplierTenantId,
        type,
        agreementLine: [record],
        tenantId,
      },
      () => {
        this.fetchNoExitProductList();
      }
    );
  }

  /**
   * 查询未分配服务列表
   */
  @Bind()
  fetchNoExitProductList(params = {}) {
    const { dispatch } = this.props;
    const { agreementLineId, supplierTenantId } = this.state;
    dispatch({
      type: 'mallProtocolManagement/fetchNoExitProductList',
      payload: {
        ...params,
        agreementLineId,
        supplierTenantId,
      },
    });
  }

  /**
   * 添加服务
   */
  @Bind()
  handleAddProduct(rows = []) {
    const { dispatch } = this.props;
    const { agreementLineId } = this.state;
    dispatch({
      type: 'mallProtocolManagement/lineAddProduct',
      payload: {
        agreementLineId,
        agreementDetailsDTOS: rows,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetcthProtocolData();
        this.setState({
          productVisible: false,
        });
      }
    });
  }

  /**
   * 删除/批量删除
   */
  @Bind()
  handleDeleteLines(list = [], clear = false) {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallProtocolManagement/lineDeleteProduct',
      payload: {
        agreementDetails: list,
      },
    }).then(res => {
      if (res) {
        if (clear) {
          this.setState({ selectedRows: [], selectedRowKeys: [] });
        }
        this.fetcthProtocolData();
      }
    });
  }

  // 表格勾选
  @Bind()
  handlerRowSelect(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  // 商品预览
  @Bind()
  handleGoodsPreview(record) {
    this.setState({
      productVisible: false,
    });
    openSkuDetail({
      recordData: record,
      backPath: '/small/mall-protocol-management/list?tabKey=d',
    });
  }

  // 商品编辑
  @Bind()
  handleGoodsEdit(record) {
    const { spuId } = record;
    this.setState({
      productVisible: false,
    });
    openSkuEdit({
      spuId,
      backPath: '/small/mall-protocol-management/list?tabKey=d',
    });
  }

  // 替换
  @Bind()
  handleGoodsReplace(list, rows) {
    const { dispatch } = this.props;
    const newList = {
      ...list[0],
      skuIds: rows.map(n => n.skuId),
    };
    dispatch({
      type: 'mallProtocolManagement/changeProduct',
      payload: newList,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetcthProtocolData();
        this.setState({
          productVisible: false,
        });
      }
    });
  }

  // 查询表单联动
  @Bind()
  handleChange(params, type) {
    const { dataValue } = this.state;
    const newDataValue = {
      ...dataValue,
      ...params,
    };
    this.setState({
      dataValue: newDataValue,
    });
    if (type) {
      this.searchForm.resetFields();
      this.rightForm.resetFields();
    } else {
      this.searchForm.setFieldsValue(newDataValue);
      this.rightForm.setFieldsValue(newDataValue);
    }
  }

  @Bind()
  renderRegion(record) {
    if (record.allRegionFlag === 1) {
      return intl.get('small.common.model.allAreas').d('所有区域');
    } else {
      const list = record.agreementRegionDTOList || [];
      const tablePopover = {
        columns: [
          {
            title: intl.get('small.common.model.regionCode').d('区域编码'),
            dataIndex: 'regionCode',
            width: 120,
          },
          {
            title: intl.get('small.common.model.regionName').d('区域名称'),
            dataIndex: 'regionName',
          },
        ],
        rowKey: 'regionId',
        bordered: true,
        pagination: false,
        dataSource: list,
      };
      const content = <Table {...tablePopover} />;
      return list.length === 1 ? (
        list[0].regionName
      ) : (
        <Popover placement="top" content={content}>
          <a>{intl.get('hzero.common.button.more').d('更多')}</a>
        </Popover>
      );
    }
  }

  @Bind()
  renderOrg(record) {
    if (record.allUnitFlag === 1) {
      return intl.get('small.common.model.allOrganizations').d('所有组织');
    } else {
      const list = record.agreementUnitDTOList || [];
      const tablePopover = {
        columns: [
          {
            title: intl.get('small.common.model.unitNum').d('组织编码'),
            dataIndex: 'unitCode',
            width: 120,
          },
          {
            title: intl.get('small.common.model.unitName').d('组织名称'),
            dataIndex: 'unitName',
          },
        ],
        rowKey: 'unitId',
        bordered: true,
        pagination: false,
        dataSource: list,
      };
      const content = <Table {...tablePopover} />;
      return list.length === 1 ? (
        list[0].unitName
      ) : (
        <Popover placement="top" content={content}>
          <a>{intl.get('hzero.common.button.more').d('更多')}</a>
        </Popover>
      );
    }
  }

  @Bind()
  handleToNew(record) {
    const { history } = this.props;
    if (record.agreementStatus === 'NEW') {
      history.push({
        pathname: `/small/mall-protocol-management/handwork`,
        state: { tabKey: 'd' },
        search: `?agreementId=${record.agreementId}`,
      });
    } else {
      history.push({
        pathname: `/small/mall-protocol-management/check-detail/${record.agreementId}`,
        state: { tabKey: 'd' },
      });
    }
  }

  @Bind()
  getColumns() {
    const { uomFlag } = this.state;
    const { custDimensions } = this.props;
    const custDimRenderers = getH0CustDimensions(custDimensions);
    return [
      {
        title: intl.get('small.common.model.product.status').d('商品状态'),
        dataIndex: 'agreementDetailStatusMeaning',
        align: 'center',
        width: 90,
        render: (val, record) => {
          const { remark, remarkMeaning, shelfFlagMeaning } = record;
          return (
            <Col>
              <Row>{shelfFlagMeaning || val || '-'}</Row>
              {remark && (
                <Row>
                  <Popover placement="top" content={remarkMeaning || remark}>
                    <a>{intl.get('small.common.view.rejectReason').d('拒绝原因')}</a>
                  </Popover>
                </Row>
              )}
            </Col>
          );
        },
      },
      {
        title: intl.get('small.common.model.productInfo').d('商品信息'),
        dataIndex: 'productInfo',
        className: style['agreement-table'],
        render: (_, record) => {
          const { imagePath, skuName, skuCode, skuUom, skuBrand } = record;
          return (
            <div className={style['product-container']}>
              <div>
                <img alt="" src={imagePath} />
              </div>
              <div className={style['product-info-right']}>
                <div className={style['product-info']}>
                  <p>
                    {intl.get('small.common.model.productNum').d('商品编码')}：{skuCode}
                  </p>
                  <p>
                    {intl.get('small.common.model.productName').d('商品名称')}：{skuName}
                  </p>
                  <p hidden={!uomFlag}>
                    {intl.get('small.common.model.saleUom').d('销售单位')}：{skuUom}
                  </p>
                  <p>
                    {intl.get('small.common.model.productBrand').d('商品品牌')}：{skuBrand}
                  </p>
                  {/* <p>
                    {intl.get(`small.common.view.status`).d('状态')}：{shelfFlagMeaning}
                  </p> */}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        title: intl.get(`small.common.view.agreementInfo`).d('协议信息'),
        dataIndex: 'agreementInfo',
        className: style['agreement-table'],
        width: 220,
        render: (_, record) => {
          const {
            lineNum,
            versionNum,
            effectiveFlag,
            agreementName,
            agreementNumber,
            agreementStatusMeaning,
          } = record;
          const effectMeaning =
            effectiveFlag === -1
              ? intl.get('small.common.model.noEffective').d('无效')
              : effectiveFlag === 0
              ? intl.get('small.common.model.effective').d('有效')
              : effectiveFlag === 1
              ? intl.get('small.common.model.willEffective').d('待生效')
              : '-';
          return (
            <div className={style['product-info']}>
              <p>
                {intl.get('small.common.model.agreementNum').d('协议编号')}：
                {<a onClick={() => this.handleToNew(record)}>{agreementNumber}</a>}
              </p>
              <p>
                {intl.get('small.common.model.agreementName').d('协议名称')}：{agreementName}
              </p>
              <p>
                {intl.get('small.common.model.agreementStatus').d('协议状态')}：
                {agreementStatusMeaning}/{effectMeaning}
              </p>
              <p>
                {intl.get('small.common.model.version').d('版本')}：
                {versionNum ? `v${versionNum}` : '-'}
              </p>
              <p>
                {intl.get('small.common.model.lineNum').d('行号')}：{lineNum}
              </p>
            </div>
          );
        },
      },
      {
        title: intl.get('small.common.view.supplierPurCompany').d('供采公司'),
        dataIndex: 'companyInfo',
        className: style['agreement-table'],
        width: 220,
        render: (_, record) => {
          const { companyName, supplierCompanyName } = record;
          return (
            <div className={style['product-info']}>
              <p>
                {intl.get('small.common.model.pur').d('采')}：{companyName}
              </p>
              <p>
                {intl.get('small.common.model.sup').d('供')}：{supplierCompanyName}
              </p>
            </div>
          );
        },
      },
      {
        title: intl.get('small.common.model.itemInfo').d('物料信息'),
        dataIndex: 'cateInfo',
        className: style['agreement-table'],
        width: 220,
        render: (_, record) => {
          const { itemName, itemCode, uomName, itemCategoryName, itemCategoryCode } = record;
          const itemCategory = itemCategoryCode
            ? `${itemCategoryCode || ''}-${itemCategoryName || ''}`
            : '';
          return (
            <div className={style['product-info']}>
              <p>
                {intl.get('small.common.model.itemCode').d('物料编码')}：{itemCode}
              </p>
              <p>
                {intl.get('small.common.model.item.name').d('物料名称')}：{itemName}
              </p>
              <p>
                {intl.get('small.common.model.itemCategory').d('物料分类')}：{itemCategory}
              </p>
              <p>
                {intl.get('small.common.model.uom').d('单位')}：{uomName}
              </p>
            </div>
          );
        },
      },
      {
        title: intl.get('small.common.model.priceInfo').d('价格信息'),
        dataIndex: 'priceinfo',
        className: style['agreement-table'],
        width: 160,
        render: (_, record) => {
          const { currencyName, tax, priceTypeMeaning } = record;
          return (
            <div className={style['product-info']}>
              <p>
                {intl.get('small.common.model.taxPrice').d('含税价')}：
                {record.ladderFlag ? (
                  <ViewLadder
                    popOverProps={{ placement: 'top' }}
                    dataSource={record.agreementLadders || []}
                  />
                ) : (
                  precisionRender({ recordData: record, name: 'taxPrice' })
                )}
              </p>
              <p>
                {intl.get('small.common.model.currency').d('币种')}：{currencyName}
              </p>
              <p>
                {intl.get('small.common.model.tax').d('税率')}：{tax && math.floor(tax)}
              </p>
              <p>
                {intl.get('small.common.model.priceType').d('价格类型')}：{priceTypeMeaning}
              </p>
            </div>
          );
        },
      },
      {
        title: intl.get('small.common.model.saleInfo').d('可售信息'),
        dataIndex: 'selfInfo',
        className: style['agreement-table'],
        width: 180,
        render: (val, record) => {
          return (
            <div className={style['product-info']}>
              <p>
                {intl.get('small.common.model.saleRegion').d('可售区域')}：
                {this.renderRegion(record)}
              </p>
              <p>
                {intl.get('small.common.model.saleOrg').d('可售组织')}：{this.renderOrg(record)}
              </p>
              {custDimRenderers.map(m => (
                <p>
                  {m.title}：{m.render(record)}
                </p>
              ))}
            </div>
          );
        },
      },
      {
        title: intl.get('small.common.view.operate').d('操作'),
        dataIndex: 'edit',
        className: style['agreement-table'],
        width: 90,
        fixed: 'right',
        render: (_, record) => {
          return (
            <div className={style['product-info']}>
              <p>
                <a onClick={() => this.handleGoodsPreview(record)}>
                  {intl.get('small.common.model.look').d('查看')}
                </a>
              </p>
              {!['TERMINATED', 'DISABLED'].includes(record.agreementStatus) && (
                <>
                  {record.purchaseTenantId === organizationId && (
                    <p>
                      <PermissionButton
                        onClick={() => this.handleGoodsEdit(record)}
                        funcType="link"
                        type="c7n-pro"
                        permissionList={[
                          {
                            code: `sagm.protocol-management.button.skuNumber`,
                            type: 'button',
                            meaning: '商城协议管理-协议商品数量',
                          },
                        ]}
                      >
                        {intl.get('hzero.common.model.edit').d('编辑')}
                      </PermissionButton>
                    </p>
                  )}
                  <p>
                    <PermissionButton
                      onClick={() => this.handleShowTransfer(record, 'add')}
                      funcType="link"
                      type="c7n-pro"
                      color="primary"
                      permissionList={[
                        {
                          code: `sagm.protocol-management.button.skuNumber`,
                          type: 'button',
                          meaning: '商城协议管理-协议商品数量',
                        },
                      ]}
                    >
                      {intl.get('small.common.model.addPlusProduct').d('追加商品')}
                    </PermissionButton>
                  </p>
                  <p>
                    <PermissionButton
                      onClick={() => this.handleShowTransfer(record, 'replace')}
                      funcType="link"
                      type="c7n-pro"
                      color="primary"
                      permissionList={[
                        {
                          code: `sagm.protocol-management.button.skuNumber`,
                          type: 'button',
                          meaning: '商城协议管理-协议商品数量',
                        },
                      ]}
                    >
                      {intl.get('small.common.model.changeProduct').d('更换商品')}
                    </PermissionButton>
                  </p>
                  <p>
                    <PermissionButton
                      onClick={() => this.handleDeleteLines([record])}
                      funcType="link"
                      type="c7n-pro"
                      color="primary"
                      permissionList={[
                        {
                          code: `sagm.protocol-management.button.skuNumber`,
                          type: 'button',
                          meaning: '商城协议管理-协议商品数量',
                        },
                      ]}
                    >
                      {intl.get('hzero.common.button.delete').d('删除')}
                    </PermissionButton>
                  </p>
                </>
              )}
            </div>
          );
        },
      },
    ];
  }

  @Bind()
  getTransforColumns() {
    return [
      {
        title: intl.get('small.common.model.productNum').d('商品编码'),
        dataIndex: 'skuCode',
        width: 150,
      },
      {
        title: intl.get('small.common.model.productName').d('商品名称'),
        dataIndex: 'skuName',
      },
      // {
      //   title: intl.get('small.common.model.uom').d('单位'),
      //   dataIndex: 'uomName',
      //   width: 100,
      // },
      {
        title: intl.get('small.common.model.platformCategory').d('平台分类'),
        dataIndex: 'categoryName',
        width: 150,
      },
      {
        title: intl.get('small.common.view.operate').d('操作'),
        dataIndex: 'edit',
        width: 150,
        render: (_, record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.handleGoodsPreview(record, record.sourceFrom)}>
                {intl.get('small.common.model.look').d('查看')}
              </a>
              <a onClick={() => this.handleGoodsEdit(record)}>
                {intl.get('hzero.common.model.edit').d('编辑')}
              </a>
            </span>
          );
        },
      },
    ];
  }

  render() {
    const {
      type,
      display,
      visible,
      uomFlag,
      tenantId,
      dataValue,
      currentSku,
      selectedRows,
      agreementLine,
      productVisible,
      selectedRowKeys,
    } = this.state;
    const {
      activeKey,
      addLoading,
      fetchLoading,
      deleteLoading,
      replaceLoading,
      fetchNoExitLoading,
      mallProtocolManagement,
      path,
      customizeBtnGroup,
    } = this.props;
    const {
      agreementStatus = [],
      noExitPagination = {},
      noExitProductList = [],
      productDetailList = [],
      productDetailPagination = {},
    } = mallProtocolManagement;

    const priceModalProps = {
      visible,
      currentSku,
      onClose: () => this.setState({ visible: false }),
    };
    const transferProps = {
      type,
      tenantId,
      addLoading,
      agreementLine,
      replaceLoading,
      productVisible,
      rowKey: 'skuId',
      noExitPagination,
      noExitProductList,
      fetchNoExitLoading,
      agreementStatus: 'noExitProduct',
      columns: this.getTransforColumns(),
      onGoodsReplace: this.handleGoodsReplace,
      onHandleAddProduct: this.handleAddProduct,
      onFetchNoExitProductList: this.fetchNoExitProductList,
      onHandleCloseModal: () => this.setState({ productVisible: false }),
      modalTitle: intl.get('small.common.model.productInfo').d('商品信息'),
    };

    const columns = this.getColumns();

    const scrollWidth = sum(columns.map(n => n.width)) + 281;
    return (
      <React.Fragment>
        <SearchForm
          display={display}
          activeKey={activeKey}
          dataValue={dataValue}
          onRef={this.handleRef}
          onOpen={this.handleOpen}
          onHidden={this.handleHidden}
          agreementStatus={agreementStatus}
          onHandleChange={this.handleChange}
          onSearchLine={this.fetcthProtocolData}
          onReset={() => this.rightForm.resetFields()}
        />
        <div className="table-operator">
          <PermissionButton
            loading={deleteLoading}
            disabled={selectedRows.length === 0}
            onClick={() => this.handleDeleteLines(selectedRows, true)}
            permissionList={[
              {
                code: `sagm.protocol-management.button.skuNumber`,
                type: 'button',
                meaning: '商城协议管理-协议商品数量',
              },
            ]}
          >
            {intl.get('small.common.model.batchDelete').d('批量删除')}
          </PermissionButton>
          <ExcelExportPro
            templateCode={uomFlag ? 'SAGM_AGREEMENT_SKU_UOM_EXPORT' : 'SAGM_AGREEMENT_SKU_EXPORT'}
            buttonText={intl.get('sagm.common.view.button.skuExportNew').d('(新)商品导出')}
            requestUrl={`/sagm/v1/${organizationId}/agreement-details/export/new${
              uomFlag ? '/sku-uom' : ''
            }`}
            queryParams={this.getQueryParams()}
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: `${path}.button.sku-export-new`,
                  type: 'button',
                  meaning: '商城协议-（新）商品导出',
                },
              ],
            }}
            exportAsync
          />
          {customizeBtnGroup(
            {
              code: protManageBtns.product,
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons
              buttons={[
                {
                  name: 'oldExport',
                  btnComp: ExcelExport,
                  btnProps: {
                    buttonText: intl.get('small.common.view.button.productExport').d('商品导出'),
                    requestUrl: `/sagm/v1/${organizationId}/agreement-details/export${
                      uomFlag ? '/sku-uom' : ''
                    }`,
                    queryParams: this.getQueryParams(),
                    otherButtonProps: { icon: 'unarchive', type: 'c7n-pro' },
                    exportAsync: true,
                  },
                },
              ]}
            />
          )}
        </div>
        <AutoHeightTable
          bordered
          columns={columns}
          rowKey="agreementDetailId"
          scroll={{ x: scrollWidth }}
          dataSource={productDetailList}
          rowSelection={{
            selectedRows,
            selectedRowKeys,
            onChange: this.handlerRowSelect,
          }}
          onChange={this.fetcthProtocolData}
          pagination={productDetailPagination}
          loading={fetchLoading || deleteLoading}
        />
        {visible && <PriceModal {...priceModalProps} />}
        <SearchModal
          display={display}
          activeKey={activeKey}
          dataValue={dataValue}
          onOpen={this.handleOpen}
          onRef={this.handleRightRef}
          onHidden={this.handleHidden}
          onSearch={this.fetcthProtocolData}
          onHandleChange={this.handleChange}
        />
        <ListTransfer {...transferProps} />
      </React.Fragment>
    );
  }
}
