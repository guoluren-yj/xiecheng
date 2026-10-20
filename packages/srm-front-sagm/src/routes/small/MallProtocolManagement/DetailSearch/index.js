import React, { Component, memo } from 'react';
import { Table, Modal, Form, Select, Popover } from 'hzero-ui';
import { math } from 'choerodon-ui/dataset';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isEmpty, sum } from 'lodash';
import { withRouter } from 'react-router';

import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import withCustomize from 'srm-front-cuz';
import Lov from 'components/Lov';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { dateRender } from 'utils/renderer';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import { Button as PermissionButton } from 'components/Permission';
import DynamicButtons from '_components/DynamicButtons';
import { checkPermission } from 'services/api';

import { openSkuEdit, openSkuDetail } from '@/utils/openCommonTab';
import ViewLadder from '@/components/ViewLadder';
import { precisionRender } from '@/utils/precision';
import { getH0CustDimensions, withCustomDimension } from '@/utils/customDimension';
import SearchForm from './SearchForm';
import SearchModal from './SearchModal.js';
import ListTransfer from './ListTransfer';
import PriceModal from '../PriceModal';
import { protocalDetailCode, protManageBtns } from '../../const/uniCode';
import { PERMISSION_PROTOCOL_MANAGEMENT_SKU_NUMBER } from '../../const/permissionCode';
import style from '../index.less';

const TableList = memo((props) => {
  const { customizeTable, selectChange, getColumns, selectedRowKeys, ...otherProps } = props;
  const columns = getColumns();
  const scrollWidth = sum(columns.map((n) => n.width)) + 271;
  return customizeTable(
    { code: 'SMAL.AGREEMENT_MANAGEMENT.DETAIL' },
    <Table
      bordered
      rowKey="agreementLineId"
      columns={columns}
      {...otherProps}
      scroll={{ x: scrollWidth }}
      rowSelection={{ selectedRowKeys, onChange: selectChange }}
    />
  );
});

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

@withCustomDimension()
@withCustomize({
  unitCode: [protocalDetailCode.LIST],
})
@connect(({ mallProtocolManagement, loading }) => ({
  mallProtocolManagement,
  fetchLoading: loading.effects['mallProtocolManagement/fetcthProtocolLineData'],
  fetchExitLoading: loading.effects['mallProtocolManagement/fetchExitProductList'],
  fetchNoExitLoading: loading.effects['mallProtocolManagement/fetchNoExitProductList'],
  addLoading: loading.effects['mallProtocolManagement/lineAddProduct'],
  deleteLoading: loading.effects['mallProtocolManagement/lineDeleteProduct'],
  createLoading: loading.effects['mallProtocolManagement/createProduct'],
}))
@withRouter
@Form.create({ fieldNameProp: null })
export default class ProtocolSearch extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      agreementLine: [],
      selectedRows: [],
      selectedRowKeys: [],
      productModalVisible: false,
      display: false,
      productVisible: false,
      supplierTenantId: '',
      agreementStatus: '',
      currentSku: '',
      visible: false,
      dataValue: {},
      categoryName: '',
      skuApprove: true,
    };
  }

  searchForm;

  rightForm;

  async componentDidMount() {
    this.fetcthProtocolLineData();
    const res = await checkPermission([PERMISSION_PROTOCOL_MANAGEMENT_SKU_NUMBER]);
    const isApprove = ((res || [])[0] || {}).approve;
    this.setState({ skuApprove: isApprove });
  }

  @Bind()
  getFormValues() {
    const { getFieldsValue: getTopValues = () => ({}) } = this.searchForm || {};
    const { getFieldsValue: getRightValues = () => ({}) } = this.rightForm || {};
    const params = { ...getTopValues(), ...getRightValues() };
    return {
      ...params,
      tenantId: getCurrentOrganizationId(),
      validDateFrom: params.validDateFrom && params.validDateFrom.format(DATETIME_MIN),
      validDateTo: params.validDateTo && params.validDateTo.format(DATETIME_MAX),
      creationDateFrom: params.creationDateFrom && params.creationDateFrom.format(DATETIME_MIN),
      creationDateTo: params.creationDateTo && params.creationDateTo.format(DATETIME_MAX),
    };
  }

  @Bind()
  handleOpen() {
    this.setState({ display: true });
  }

  @Bind()
  handleHidden() {
    this.setState({ display: false });
  }

  @Bind()
  fetcthProtocolLineData(page = { page: 0, size: 10 }) {
    const { dispatch } = this.props;
    const params = {
      tenantId: getCurrentOrganizationId(),
      page: isEmpty(page) ? {} : page,
      deleteFlag: 0,
      ...this.getFormValues(),
      customizeUnitCode: [protocalDetailCode.LIST, protocalDetailCode.SEARCH_FORM].join(','),
    };
    dispatch({
      type: 'mallProtocolManagement/fetcthProtocolLineData',
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

  // 勾选事件
  @Bind()
  handleSelectChange(keys, rows) {
    const { selectedRows } = this.state;
    const rowKey = 'agreementLineId';
    const newRows = [...selectedRows];

    // 将勾选行存储
    rows.forEach((row) => {
      if (selectedRows.every((r) => r[rowKey] !== row[rowKey])) {
        newRows.push(row);
      }
    });

    const cacheSelectedRows = newRows.filter((f) => keys.includes(f[rowKey])); // 将取消勾选的行过滤
    this.setState({
      selectedRowKeys: keys,
      selectedRows: cacheSelectedRows,
      agreementLine: cacheSelectedRows,
    });
  }

  @Bind()
  handleCreateProduct(list = []) {
    this.setState(
      {
        productModalVisible: true,
        agreementLine: list,
      },
      () => {
        this.fetchPlatformCategory((list[0] || {}).catalogId);
      }
    );
    this.fetchTemplate();
  }

  @Bind()
  fetchTemplate() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallProtocolManagement/fetchTemplate',
    });
  }

  @Bind()
  fetchPlatformCategory(catalogId = '') {
    const { dispatch } = this.props;
    if (!catalogId) return false;
    dispatch({
      type: 'mallProtocolManagement/fetchPlatformCategory',
      payload: {
        page: 0,
        size: 1,
        catalogId,
        enabledFlag: 1,
        tenantId: getCurrentOrganizationId(),
      },
    }).then((res) => {
      if (res && res[0]) {
        const { categoryId, categoryName } = res[0] || {};
        if (this.props.form) {
          this.props.form.setFieldsValue({ cid: categoryId });
          this.setState({ categoryName });
        }
      }
    });
  }

  /**
   * 创建商品
   */
  @Bind()
  handleProductOK(params = {}) {
    const {
      dispatch,
      form: { getFieldValue, validateFields },
    } = this.props;
    const { agreementLine, agreementLineId } = this.state;
    validateFields((err) => {
      if (!err) {
        dispatch({
          type: 'mallProtocolManagement/createProduct',
          payload: {
            cid: getFieldValue('cid') || params.cid,
            agreementSkuDTO: {
              agreementLineList: agreementLine,
              details: getFieldValue('content') || params.details,
            },
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.setState(
              {
                productModalVisible: false,
                selectedRowKeys: [],
                selectedRows: [],
              },
              () => {
                this.fetcthProtocolLineData();
                if (agreementLineId) {
                  this.fetchExitProductList();
                  this.fetchNoExitProductList();
                }
              }
            );
          }
        });
      }
    });
  }

  /**
   * 展示商品穿梭框
   */
  @Bind()
  async handleShowTransfer(record) {
    this.setState(
      {
        // companyId: record.companyId,
        agreementLineId: record.agreementLineId,
        productVisible: true,
        supplierTenantId: record.supplierTenantId,
        agreementLine: [record],
        agreementStatus: record.agreementStatus,
        isEffective: record.effectiveFlag !== -1,
      },
      () => {
        this.fetchExitProductList();
        this.fetchNoExitProductList();
      }
    );
  }

  /**
   * 查询已有服务列表
   */
  @Bind()
  fetchExitProductList(params = {}) {
    const { dispatch } = this.props;
    const { agreementLineId } = this.state;
    dispatch({
      type: 'mallProtocolManagement/fetchExitProductList',
      payload: {
        ...params,
        agreementLineId,
      },
    });
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
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetcthProtocolLineData();
        this.fetchExitProductList();
        this.fetchNoExitProductList();
      }
    });
  }

  /**
   * 删除服务
   */
  @Bind()
  handleRemoveProduct(rows = []) {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallProtocolManagement/lineDeleteProduct',
      payload: {
        agreementDetails: rows,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetcthProtocolLineData();
        this.fetchExitProductList();
        this.fetchNoExitProductList();
      }
    });
  }

  @Bind()
  handleGoodsPreview(record) {
    this.setState({
      productVisible: false,
    });
    openSkuDetail({
      recordData: record,
      backPath: '/small/mall-protocol-management/list?tabKey=b',
    });
  }

  @Bind()
  handleGoodsEdit(record) {
    const { spuId } = record;
    this.setState({
      productVisible: false,
    });
    openSkuEdit({
      spuId,
      backPath: '/small/mall-protocol-management/list?tabKey=b',
    });
  }

  @Bind()
  handleToNew(record) {
    const { history } = this.props;
    if (record.agreementStatus === 'NEW') {
      history.push({
        pathname: `/small/mall-protocol-management/handwork`,
        state: { tabKey: 'b' },
        search: `?agreementId=${record.agreementId}`,
      });
    } else {
      history.push({
        pathname: `/small/mall-protocol-management/check-detail/${record.agreementId}`,
        state: { tabKey: 'b' },
      });
    }
  }

  @Bind()
  handleViewPriceModal(record) {
    this.setState({
      visible: true,
      currentSku: record,
    });
  }

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
        style: {
          overflow: 'scroll',
          maxHeight: 'calc(100vh - 180px)',
        },
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
  renderCompany(record) {
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
        <Popover placement="left" content={content}>
          <a>{intl.get('hzero.common.button.more').d('更多')}</a>
        </Popover>
      );
    }
  }

  @Bind()
  handleOther(record) {
    const list = [record];
    const tablePopover = {
      columns: [
        {
          title: intl.get('small.common.model.paymentMethod').d('支付方式'),
          dataIndex: 'paymentTypeMeaning',
          width: 100,
        },
        {
          title: intl.get('small.common.model.agreementQuantity').d('协议数量'),
          dataIndex: 'agreementQuantity',
          width: 100,
          render: () => precisionRender({ recordData: record, name: 'agreementQuantity' }),
        },
        {
          title: intl.get('small.common.model.orderQuantity').d('起订量'),
          dataIndex: 'orderQuantity',
          width: 100,
          render: () => precisionRender({ recordData: record, name: 'orderQuantity' }),
        },
        {
          title: intl.get('small.common.model.purchaseQuantityLimit').d('最大购买量'),
          dataIndex: 'purchaseQuantityLimit',
          width: 100,
          render: () => precisionRender({ recordData: record, name: 'purchaseQuantityLimit' }),
        },
        {
          title: intl.get('small.common.model.purchaseAmountLimit').d('采购额上限'),
          dataIndex: 'purchaseAmountLimit',
          width: 100,
          render: () => precisionRender({ recordData: record, name: 'purchaseAmountLimit' }),
        },
        {
          title: intl.get('small.common.model.deliveryDay').d('供货周期（天）'),
          dataIndex: 'deliveryDay',
          width: 100,
        },
        {
          title: intl.get('small.common.model.guaranteeDay').d('质保期（天）'),
          dataIndex: 'guaranteeDay',
          width: 100,
        },
        {
          title: intl.get('small.common.model.materialType').d('物资类型'),
          dataIndex: 'materialTypeMeaning',
          width: 100,
        },
      ],
      rowKey: 'companyId',
      bordered: true,
      pagination: false,
      dataSource: list,
    };
    const content = <Table {...tablePopover} />;
    return (
      <Popover placement="left" content={content}>
        <a>{intl.get('small.common.model.look').d('查看')}</a>
      </Popover>
    );
  }

  componentWillReceiveProps(props) {
    const {
      form: { getFieldValue, setFieldsValue },
      mallProtocolManagement: { productTemplate = [] } = {},
    } = props;
    const { templateId, content } = productTemplate.find((f) => f.defaultFlag === 1) || {};
    if (!getFieldValue('templateId') && templateId) {
      setFieldsValue({ templateId, content });
    }
  }

  getColumns = () => {
    const { custDimensions } = this.props;
    const custDimRenderers = getH0CustDimensions(custDimensions);
    return [
      {
        title: intl.get(`small.common.view.status`).d('状态'),
        dataIndex: 'effectiveFlag',
        align: 'center',
        width: 110,
        render: (val, record) =>
          `${record.agreementStatusMeaning}/${
            val === -1
              ? intl.get('small.common.model.noEffective').d('无效')
              : val === 0
              ? intl.get('small.common.model.effective').d('有效')
              : val === 1
              ? intl.get('small.common.model.willEffective').d('待生效')
              : '-'
          }`,
      },
      {
        title: intl.get(`small.common.view.agreementInfo`).d('协议信息'),
        dataIndex: 'agreementInfo',
        className: style['agreement-table'],
        render: (_, record) => {
          const { agreementName, agreementNumber, creationDate, lineNum, versionNum } = record;
          return (
            <div className={style['product-info']}>
              <p>
                {intl.get('small.common.model.agreementNum').d('协议编号')}：
                {<a onClick={() => this.handleToNew(record)}>{agreementNumber}</a>}
              </p>
              <p style={{ maxWidth: 280 }} title={agreementName}>
                {intl.get('small.common.model.agreementName').d('协议名称')}：{agreementName}
              </p>
              <p>
                {intl.get('small.common.model.version').d('版本')}：
                {versionNum ? `v${versionNum}` : '-'}
              </p>
              <p>
                {intl.get('small.common.model.creationDate').d('创建日期')}：
                {dateRender(creationDate)}
              </p>
              <p>
                {intl.get('small.common.model.agreementLineNum').d('协议行号')}：{lineNum}
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
        dataIndex: 'priceInfo',
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
        title: intl.get('small.common.model.termOfValidity').d('有效期'),
        className: style['agreement-table'],
        dataIndex: 'validDate',
        width: 110,
        render: (_, record) => {
          const { validDateFrom, validDateTo } = record;
          return (
            <div className={style['product-info']}>
              <p>{dateRender(validDateFrom)}</p>
              <p>{intl.get('small.common.model.to').d('至')}</p>
              <p>{dateRender(validDateTo)}</p>
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
                {intl.get('small.common.model.buyOrganization').d('可采买组织')}：
                {this.renderCompany(record)}
              </p>
              {custDimRenderers.map((m) => (
                <p>
                  {m.title}：{m.render(record)}
                </p>
              ))}
              <p>
                {intl.get('small.common.model.otherInfo').d('其他信息')}：{this.handleOther(record)}
              </p>
            </div>
          );
        },
      },
      {
        title: intl.get('small.common.model.addProduct').d('添加商品'),
        dataIndex: 'detailsFlag',
        width: 90,
        fixed: 'right',
        render: (val, record) => (
          <a onClick={() => this.handleShowTransfer(record)}>
            {intl.get('small.common.model.goods').d('商品')}({val})
          </a>
        ),
      },
    ];
  };

  render() {
    const {
      selectedRowKeys,
      selectedRows,
      productModalVisible,
      display,
      productVisible,
      agreementStatus,
      currentSku,
      visible,
      dataValue,
      agreementLine,
      agreementLineId,
      isEffective,
      categoryName,
      skuApprove,
    } = this.state;
    const {
      mallProtocolManagement,
      activeKey,
      form,
      fetchLoading,
      fetchExitLoading,
      fetchNoExitLoading,
      addLoading,
      deleteLoading,
      createLoading,
    } = this.props;
    const { getFieldDecorator, setFieldsValue } = form;
    const {
      protocolLine = [],
      protocolLinePagination = {},
      exitProductList,
      noExitProductList,
      exitPagination,
      noExitPagination,
      productTemplate,
    } = mallProtocolManagement;
    const transferProps = {
      rowKey: 'skuId',
      skuApprove,
      modalTitle: intl.get('small.common.model.productInfo').d('商品信息'),
      columns: [
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
            const { purchaseTenantId } = record;
            return (
              <span className="action-link">
                <a onClick={() => this.handleGoodsPreview(record)}>
                  {intl.get('small.common.model.look').d('查看')}
                </a>
                {skuApprove && purchaseTenantId === getCurrentOrganizationId() && (
                  <a
                    onClick={() =>
                      this.handleGoodsEdit(
                        record,
                        record.agreementDetailId ? agreementLineId : null
                      )
                    }
                  >
                    {intl.get('hzero.common.model.edit').d('编辑')}
                  </a>
                )}
              </span>
            );
          },
        },
      ],
      productVisible,
      addLoading,
      deleteLoading,
      fetchExitLoading,
      fetchNoExitLoading,
      onFetchExitProductList: this.fetchExitProductList,
      onFetchNoExitProductList: this.fetchNoExitProductList,
      onHandleCloseModal: () => this.setState({ productVisible: false }),
      onHandleAddProduct: this.handleAddProduct,
      onHandleRemoveProduct: this.handleRemoveProduct,
      onCreateProduct: () => this.handleCreateProduct(agreementLine),
      onProductOK: this.handleProductOK,
      exitProductList,
      noExitProductList,
      exitPagination,
      noExitPagination,
      productTemplate,
      agreementStatus,
      agreementLine,
      isEffective,
    };
    const priceModalProps = {
      currentSku,
      visible,
      onClose: () => this.setState({ visible: false }),
    };
    const noCreateList = selectedRows.filter(
      (n) => ['TERMINATED', 'DISABLED'].includes(n.agreementStatus) || n.effectiveFlag === -1
    );

    const params = this.getFormValues();
    const queryParams = parseParameters({
      page: protocolLinePagination,
      ...params,
    });
    const filterParams = filterNullValueObject(queryParams);
    const organizationId = getCurrentOrganizationId();
    const { customizeTable, path, customizeBtnGroup } = this.props;
    return (
      <React.Fragment>
        <SearchForm
          onRef={this.handleRef}
          onSearchLine={this.fetcthProtocolLineData}
          activeKey={activeKey}
          onOpen={this.handleOpen}
          onHidden={this.handleHidden}
          onReset={() => this.rightForm.resetFields()}
          dataValue={dataValue}
          onHandleChange={this.handleChange}
        />
        <div className="table-operator">
          <PermissionButton
            disabled={noCreateList.length > 0 || selectedRows.length === 0}
            onClick={() => this.handleCreateProduct(selectedRows)}
            permissionList={[
              {
                code: `sagm.protocol-management.button.skuNumber`,
                type: 'button',
                meaning: '商城协议管理-协议商品数量',
              },
            ]}
          >
            {intl.get('small.common.model.batchCreateProducts').d('批量创建商品')}
          </PermissionButton>
          <ExcelExportPro
            templateCode="SMAL_AGREEMENT_LINE_EXPORT"
            buttonText={intl.get('sagm.common.button.exportNew').d('(新)导出')}
            requestUrl={`/sagm/v1/${organizationId}/agreement-lines/export/new`}
            queryParams={filterParams}
            exportAsync
            otherButtonProps={{
              type: 'c7n-pro',
              icon: 'unarchive',
              permissionList: [
                {
                  code: `${path}.button.export-new`,
                  type: 'button',
                  meaning: '商城协议-（新）导出',
                },
              ],
            }}
          />
          {customizeBtnGroup(
            {
              code: protManageBtns.detail,
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons
              buttons={[
                {
                  name: 'oldExport',
                  btnComp: ExcelExport,
                  btnProps: {
                    requestUrl: `/sagm/v1/${organizationId}/agreement-lines/export`,
                    otherButtonProps: { type: 'c7n-pro', icon: 'unarchive' },
                    queryParams: filterParams,
                    exportAsync: true,
                  },
                },
              ]}
            />
          )}
        </div>
        <TableList
          loading={fetchLoading}
          getColumns={this.getColumns}
          customizeTable={customizeTable}
          selectChange={this.handleSelectChange}
          selectedRowKeys={selectedRowKeys}
          dataSource={protocolLine}
          pagination={protocolLinePagination}
          onChange={this.fetcthProtocolLineData}
        />
        {productModalVisible && (
          <Modal
            title={intl.get('small.common.model.createBasedOnItem').d('基于物料创建商品')}
            destroyOnClose
            onCancel={() => this.setState({ productModalVisible: false })}
            visible={productModalVisible}
            onOk={this.handleProductOK}
            confirmLoading={createLoading}
          >
            <Form.Item
              label={intl.get('small.common.model.productIntroTemp').d('商品介绍模板')}
              {...formLayout}
            >
              {getFieldDecorator('content')}
              {getFieldDecorator('templateId')(
                <Select
                  style={{ width: '100%' }}
                  onChange={(val) => {
                    const { content = '' } =
                      productTemplate.find((f) => f.templateId === val) || {};
                    setFieldsValue({ content });
                  }}
                >
                  {productTemplate.map((item) => (
                    <Select.Option key={item.templateId} value={item.templateId}>
                      {item.templateName}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item
              label={intl.get('small.common.model.platformCategory').d('平台分类')}
              {...formLayout}
            >
              {getFieldDecorator('cid', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('small.common.model.platformCategory').d('平台分类'),
                    }),
                  },
                ],
              })(
                <Lov
                  textValue={categoryName}
                  code="SMPC.CATEGORY"
                  isDbc2Sbc={false}
                  queryParams={{
                    supplierTenantId: getCurrentOrganizationId(),
                  }}
                />
              )}
            </Form.Item>
          </Modal>
        )}
        <SearchModal
          onRef={this.handleRightRef}
          display={display}
          onCancel={this.handleCancel}
          onSearchLine={this.fetcthProtocolLineData}
          activeKey={activeKey}
          onOpen={this.handleOpen}
          onHidden={this.handleHidden}
          dataValue={dataValue}
          onHandleChange={this.handleChange}
        />
        <ListTransfer {...transferProps} />
        {visible && <PriceModal {...priceModalProps} />}
      </React.Fragment>
    );
  }
}
