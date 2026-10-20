import React, { Component } from 'react';
import { connect } from 'dva';
import queryString from 'querystring';
import { DataSet, Modal as c7nModal } from 'choerodon-ui/pro';
import { Button, Modal, Spin, Popconfirm, Tabs } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isNull } from 'lodash';
import { withRouter } from 'react-router-dom';
import qs from 'qs';
import { observer } from 'mobx-react-lite';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { PRIVATE_BUCKET } from '_utils/config';

import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { checkPermission } from 'services/api';
import { Authority } from '@/routes/small/Agreements';
import { openRecordTabs } from '@/utils/drawer/commonDrawer';
import agmHeaderRender from '@/routes/sagm/ProtocolWorkbench/component/Record/agmHeader';
import { openSkuEdit, openSkuDetail } from '@/utils/openCommonTab';
import { getPriceInfo } from '@/services/mallProtocolManagementService';
import { AgreeAuthorityContext } from '@/routes/sagm/ProtocolWorkbench/context';
import PriceModal from '../PriceModals';
import style from './index.less';
import BaseInfo from './BaseInfo';
import ListTransfer from '../DetailSearch/ListTransfer';
import ItemProductModal from './itemPropductModal';
import TableList from './TableList';
import { protocalUnitCode, batchProtocalCode } from '../../const/uniCode';
import { agreementLineDS } from './TableList/TableDs';
import { PERMISSION_PROTOCOL_MANAGEMENT_SKU_NUMBER } from '../../const/permissionCode';

const customizeUnitCode = protocalUnitCode.edit;
@formatterCollections({
  code: [
    'small.common',
    'sagm.common',
    'small.freight',
    'small.mallProtocolManagement',
    'small.groupCategoryMaintenance',
  ],
})
@withCustomize({
  unitCode: [
    'SMAL.AGREEMENT_MANAGEMENT.LINE.TABLE.BTNS',
    'SMAL.AGREEMENT_MANAGEMENT.IMPORT_MANUAL_NEW',
    'SMAL.AGREEMENT_MANAGEMENT.IMOIRT_PRICE_LIB_NEW',
    batchProtocalCode.BATCH_MANUAL_FORM,
    batchProtocalCode.BATCH_PRICE_FORM,
  ],
})
@connect(({ mallProtocolManagement, loading }) => ({
  mallProtocolManagement,
  submitHeadLoading: loading.effects['mallProtocolManagement/submitAgreement'],
  saveHeadLoading: loading.effects['mallProtocolManagement/saveAgreement'],
  fetchDataLoading: loading.effects['mallProtocolManagement/queryAgreement'],
  fetchLineLoading: loading.effects['mallProtocolManagement/fetchDetailLine'],
  fetchExitLoading: loading.effects['mallProtocolManagement/fetchExitProductList'],
  fetchNoExitLoading: loading.effects['mallProtocolManagement/fetchNoExitProductList'],
  addLoading: loading.effects['mallProtocolManagement/lineAddProduct'],
  deleteLoading: loading.effects['mallProtocolManagement/lineDeleteProduct'],
  createLoading: loading.effects['mallProtocolManagement/createProduct'],
  delHeadLoading: loading.effects['mallProtocolManagement/deleteHeadData'],
  validateLoading: loading.effects['mallProtocolManagement/validateItemPrice'],
}))
@withRouter
export default class HandWork extends Component {
  agreementLineDs;

  constructor(props) {
    super(props);
    const { quoteType, agreementId: exitId } = qs.parse(props.location.search.substr(1));
    const { state: { quoteData, tabKey = 'a' } = {} } = props.location;
    const { dispatch } = props;
    let initSupplierTenantId;
    if (quoteType && quoteData && quoteData.length > 0) {
      const initData = {
        companyId: quoteData[0].companyId,
        companyName: quoteData[0].companyName,
        supplierCompanyId: quoteData[0].supplierCompanyId,
        supplierTenantId: quoteData[0].supplierTenantId,
        supplierCompanyName: quoteData[0].supplierCompanyName,
        sourceFrom: quoteType === 'price' ? 'PRICE' : 'PUR',
        sourceFromNumber:
          quoteType === 'price' ? quoteData[0].matchId : quoteData[0].agreementProductMatchId,
      };
      initSupplierTenantId = quoteData[0].supplierTenantId;
      dispatch({
        type: 'mallProtocolManagement/updateState',
        payload: {
          initData,
        },
      });
      this.agreementLineDs = new DataSet(agreementLineDS(true));
    }
    this.state = {
      priceRule: '',
      line: {},
      priceModalVisible: false, // 阶梯价格弹窗显示
      quoteType,
      supTenantId: initSupplierTenantId, // 头信息供应商租户id
      supplierTenantId: initSupplierTenantId, // 行信息供应商租户id

      agreementLine: [], // 批量创建商品的协议行
      productModalVisible: false, // 批量创建商品的弹窗显示
      productVisible: false, // 商品穿梭框
      agreementStatus: '',
      tabKey,
      categoryName: '', // 平台分类
      agreementId: exitId,

      lineQueryLoading: false, // 保存后行查询状态
      skuApprove: true,
    };
  }

  form;

  // // 查询批量维护数据弹框的区域、组织、公司初始数据
  // @Bind()
  // fetchInfo() {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'mallProtocolManagement/queryAllCity',
  //   });
  //   dispatch({
  //     type: 'mallProtocolManagement/queryCompany',
  //   });
  //   dispatch({
  //     type: 'mallProtocolManagement/fetchUnitList',
  //   });
  // }

  isJson = (res) => {
    let result;
    try {
      result = JSON.parse(res);
    } catch (e) {
      return false;
    }
    return typeof result === 'object' && typeof result !== 'string';
  };

  @Bind
  fetchPriceInfo = async (priceParams) => {
    const response = getResponse(await getPriceInfo(priceParams));
    if (response) {
      if (this.isJson(response) && JSON.parse(response).failed) {
        notification.error({ message: JSON.parse(response).message });
        return false;
      }
      // 根据价格规则判断协议价格（含税||未税）的可编辑性
      this.setState({ priceRule: response });
    }
  };

  // 更新头、行信息
  @Bind()
  refreshData(agreementId) {
    const { dispatch } = this.props;
    const result = dispatch({
      type: 'mallProtocolManagement/queryAgreement',
      payload: {
        agreementId,
        customizeUnitCode,
      },
    }).then((res) => {
      if (res) {
        const {
          uuid = null,
          companyId,
          sourceFrom,
          agreementStatus,
          supplierTenantId,
          supplierCompanyId,
        } = res.content[0] || {};

        if (agreementStatus !== 'NEW') {
          this.props.history.push(`/small/mall-protocol-management/check-detail/${agreementId}`);
          return;
        }

        // 查询价格业务规则
        const priceParams = {
          companyId,
          supplierCompanyId,
        };
        this.fetchPriceInfo(priceParams);

        if (!this.agreementLineDs) {
          const isDisabled = ['PRICE'].includes(sourceFrom);
          this.agreementLineDs = new DataSet(agreementLineDS(isDisabled));
        }
        this.agreementLineDs.setQueryParameter('agreementId', agreementId);
        this.agreementLineDs.setQueryParameter(
          'customizeUnitCode',
          'SMAL.AGREEMENT_MANAGEMENT.IMPORT_MANUAL_NEW,SMAL.AGREEMENT_MANAGEMENT.IMOIRT_PRICE_LIB_NEW'
        );

        this.setState({ agreementId, supTenantId: supplierTenantId });
        if (agreementId && isNull(uuid)) {
          // 第一次上传附件需要获取一个uuid
          this.getAttachmentUUID();
        }
      }
      this.query();
      return res;
    });
    return result;
  }

  async componentDidMount() {
    const { agreementId } = qs.parse(this.props.location.search.substr(1));
    if (agreementId) {
      this.setState({ agreementId }, () => {
        this.refreshData(agreementId);
      });
    } else {
      const { state: { quoteData } = {} } = this.props.location;
      if (quoteData && quoteData.length > 0) {
        this.handleFromPrice(quoteData);
      }
    }
    // this.fetchInfo();
    this.fetchBatchCodes();
    const res = await checkPermission([PERMISSION_PROTOCOL_MANAGEMENT_SKU_NUMBER]);
    const isApprove = ((res || [])[0] || {}).approve;
    this.setState({ skuApprove: isApprove });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallProtocolManagement/updateState',
      payload: { initData: {} },
    });
  }

  // 查询协议行
  @Bind()
  async query() {
    const ds = this.agreementLineDs;
    if (ds) {
      await ds.query(ds.currentPage);
      this.setState({ lineQueryLoading: false });
    }
  }

  // 批量创建协议行
  @Bind()
  handleFromPrice(line = []) {
    const ds = this.agreementLineDs;
    if (ds && line.length > 0) {
      line.forEach((item) => {
        ds.create(item, 0);
      });
    }
  }

  form;

  /**
   * 获取上传附件的UUID
   * @param  {String} tenantId --租户ID
   */
  @Bind()
  getAttachmentUUID() {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    dispatch({
      type: 'mallProtocolManagement/getAttachmentUUId',
      payload: {
        tenantId,
        // customizeUnitCode,
      },
    });
  }

  @Bind()
  handleBindRef(ref) {
    this.form = ref.props.form || {};
  }

  @Bind()
  fetchBatchCodes() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallProtocolManagement/fetchBatchCodes',
    });
  }

  @Bind()
  flatTree(tree = []) {
    let flat = [];
    const fn = (list) => {
      flat = [...flat, ...list];
      list.forEach((item) => {
        if (item.children && item.children.length > 0) {
          fn(item.children);
        }
      });
    };
    fn(tree);
    return flat;
  }

  // 获取协议行参数
  getAgreementLine = (isPrice) => {
    const { priceRule } = this.state;
    const lineData = this.agreementLineDs
      ? [...this.agreementLineDs.created, ...this.agreementLineDs.updated]
      : [];
    return lineData
      .filter((f) => f.status === 'add' || f.status === 'update')
      .map((record) => {
        const {
          quotationFlag,
          buyOrganizationLov = [],
          deliverRegionLov = [],
          priceHiddenFlag,
          ...others
        } = record.toJSONData();

        const allRegionFlag = deliverRegionLov.some((i) => i.regionCode === 'ALL') ? 1 : 0;
        const allUnitFlag = buyOrganizationLov.some((i) => i.unitId === 'ALL') ? 1 : 0;
        const agreementUnits =
          allUnitFlag === 1 ? undefined : buyOrganizationLov.filter((i) => i.unitId !== 'ALL');
        const agreementRegions =
          allRegionFlag === 1 ? undefined : deliverRegionLov.filter((i) => i.regionCode !== 'ALL');
        return {
          ...others,
          priceHiddenFlag: +priceHiddenFlag,
          allUnitFlag,
          allRegionFlag,
          agreementUnits,
          agreementRegions,
          agreementUnitDTOList: undefined,
          quotationFlag: isPrice ? quotationFlag : priceRule === 'TAX_INCLUDED_PRICE' ? 1 : 0,
        };
      });
  };

  setValidateLine = (value) => {
    if (this.agreementLineDs) {
      this.agreementLineDs.setState('validateLine', value);
    }
  };

  @Bind()
  @Throttle(1000)
  async handleValidate(agreementStatus) {
    const {
      mallProtocolManagement: { initData = {} },
    } = this.props;
    const { validateFields } = this.form;
    this.setValidateLine(true);
    const flag = this.agreementLineDs ? await this.agreementLineDs.validate() : true;
    this.setValidateLine(false);
    const agreementLines = this.getAgreementLine(initData.sourceFrom === 'PRICE');
    const noLadders = agreementLines.find(
      (f) => f.priceType === 'LADDER_PRICE' && !f.agreementLadders
    );
    if (noLadders) {
      notification.error({
        message: intl.get('sagm.common.view.notification.noLadders').d('请维护阶梯价格'),
      });
      return null;
    }
    validateFields(async (err, values) => {
      if (!err && flag) {
        const submitValue = { ...values };
        delete submitValue.versionNum;
        delete submitValue.agreementStatus;
        const payload = {
          ...initData,
          ...submitValue,
          agreementLines,
          agreementStatus,
          agreementBelongType: -1,
          tenantId: getCurrentOrganizationId(),
        };

        // 提交
        if (agreementStatus === 'SUBMITTED') {
          await this.handleSubmit(payload);
        } else {
          await this.handleSave(payload);
        }
      }
    });
  }

  // 保存
  handleSave = (payload) => {
    const { dispatch } = this.props;
    const { setFieldsValue } = this.form;
    // 保存
    dispatch({
      type: `mallProtocolManagement/saveAgreement`,
      payload,
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({ lineQueryLoading: true });
        if (this.agreementLineDs) {
          this.agreementLineDs.unSelectAll();
          this.agreementLineDs.clearCachedRecords();
        }
        this.refreshData(res.agreementId);
        dispatch({
          type: 'mallProtocolManagement/updateState',
          payload: { initData: res },
        });
        setFieldsValue({
          agreementNumber: res.agreementNumber,
        });
        this.props.history.push(
          `/small/mall-protocol-management/handwork?agreementId=${res.agreementId}`
        );
      }
    });
  };

  // 提交
  handleSubmit = (payload) => {
    const { tabKey } = this.state;
    const { dispatch } = this.props;
    this.setState({ lineQueryLoading: true });
    // 提交前校验是否有更低价格的物料、以及存在失效行
    dispatch({ type: 'mallProtocolManagement/validateItemPrice', payload: [payload] }).then(
      (result) => {
        if (result) {
          const { agreementList } = result;
          const agreement = agreementList[0] || {};
          const submit = () => {
            dispatch({
              type: `mallProtocolManagement/submitAgreement`,
              payload: [{ ...agreement, agreementStatus: 'SUBMITTED' }],
            }).then((res) => {
              if (res) {
                notification.success();
                this.props.history.push(`/small/mall-protocol-management/list?tabKey=${tabKey}`);
              } else {
                this.refreshData(agreement.agreementId);
              }
            });
          };
          if (result.status) {
            submit();
          } else {
            Modal.confirm({
              title: result.message,
              onOk: submit,
              onCancel: () => this.refreshData(agreement.agreementId),
            });
          }
        }
        this.setState({ lineQueryLoading: false });
      }
    );
  };

  // 批量维护的弹窗对于日期的格式处理
  @Bind()
  getDate(dateFrom, dateTo) {
    const validDateFrom = dateFrom && dateFrom.format ? dateFrom.format(DATETIME_MIN) : dateFrom;
    const validDateTo = dateTo && dateTo.format ? dateTo.format(DATETIME_MAX) : dateTo;
    return {
      validDateFrom,
      validDateTo,
    };
  }

  // 删除整个协议
  @Bind()
  handleDelData() {
    const {
      dispatch,
      mallProtocolManagement: { initData = {} },
    } = this.props;
    const { tabKey } = this.state;
    const { agreementId, agreementNumber } = initData;
    c7nModal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('small.common.view.confirmDelAgreement', {
          value: agreementNumber,
        })
        .d(`是否确定删除商城协议 ${agreementNumber}？`),
      onOk: () => {
        return dispatch({
          type: 'mallProtocolManagement/deleteHeadData',
          payload: [{ agreementId }],
        }).then((res) => {
          if (res) {
            notification.success();
            this.props.history.push(`/small/mall-protocol-management/list?tabKey=${tabKey}`);
          }
        });
      },
      onCancel: () => {},
    });
  }

  // 关闭阶梯价格框
  @Bind()
  handleClosePriceModal() {
    this.setState({
      priceModalVisible: false,
      line: {},
    });
  }

  // 保存并关闭阶梯价格
  @Bind()
  handleSaveAndClosePriceModal(newLine = {}) {
    const { ladderFlag, agreementLadders = [] } = newLine;
    const { agreementLine } = this.state;
    if (agreementLine) {
      agreementLine.set('ladderFlag', ladderFlag);
      agreementLine.set('agreementLadders', agreementLadders);
      const firstLadder = (agreementLadders || [])[0];
      if (agreementLine.get('priceType') === 'LADDER_PRICE' && firstLadder) {
        agreementLine.set('unitPrice', firstLadder.unitPrice);
        agreementLine.set('taxPrice', firstLadder.taxPrice);
      }
    }
    this.setState({
      priceModalVisible: false,
      line: {},
    });
  }

  // 删除某行阶梯价格
  @Bind()
  handleUpdateLadder(_, list) {
    const { agreementLine } = this.state;
    const ladderFlag = list.length > 0 ? 1 : 0;
    agreementLine.set('ladderFlag', ladderFlag);
    agreementLine.set('agreementLadders', list);
  }

  /**
   * 查看操作记录
   */
  @Bind()
  handleShowHistory() {
    const { agreementId } = this.state;
    const { mallProtocolManagement } = this.props;
    const { initData = {} } = mallProtocolManagement;
    openRecordTabs({
      headerData: {
        agreementId,
        agreementName: initData.agreementName,
        workflowBusinessKey: initData.workflowBusinessKey,
      },
      operateArg: {
        url: `/sagm/v1/${getCurrentOrganizationId()}/agreement-records/${agreementId}`,
        queryParams: {
          agreementId,
        },
        operateRenderer: agmHeaderRender,
      },
    });
  }

  // 物料变动查询目录
  @Bind()
  getCatalogByItem(params) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'mallProtocolManagement/fetchGroupCatalog',
      payload: params,
    });
  }

  /**
   * 展示商品穿梭框
   */
  @Bind()
  handleShowTransfer(record) {
    this.setState(
      {
        // companyId: record.companyId,
        agreementLineId: record.agreementLineId,
        productVisible: true,
        supplierTenantId: record.supplierTenantId,
        supplierCompanyId: record.supplierCompanyId,
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

  // 基于物料批量创建商品
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

  // 获取商品模板
  @Bind()
  fetchTemplate() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallProtocolManagement/fetchTemplate',
    });
  }

  // 查询平台分类
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
        if (this.itemProductForm) {
          this.itemProductForm.setFieldsValue({ cid: categoryId });
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
    const { dispatch } = this.props;
    const { cid, details } = params;
    const { agreementLine, agreementLineId } = this.state;
    dispatch({
      type: 'mallProtocolManagement/createProduct',
      payload: {
        cid,
        agreementSkuDTO: {
          agreementLineList: agreementLine,
          details,
        },
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState(
          {
            productModalVisible: false,
          },
          () => {
            this.query();
            if (agreementLineId) {
              this.fetchExitProductList();
              this.fetchNoExitProductList();
            }
          }
        );
      }
    });
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
    const { agreementLineId, supplierTenantId, supplierCompanyId } = this.state;
    dispatch({
      type: 'mallProtocolManagement/fetchNoExitProductList',
      payload: {
        ...params,
        agreementLineId,
        supplierTenantId,
        supplierCompanyId,
      },
    });
  }

  /**
   * 添加服务
   */
  @Bind()
  handleAddProduct(rows = []) {
    const {
      dispatch,
      // mallProtocolManagement: { linePagination },
    } = this.props;
    const { agreementLineId } = this.state;
    dispatch({
      type: 'mallProtocolManagement/lineAddProduct',
      payload: {
        agreementLineId,
        agreementDetailsDTOS: rows,
      },
    }).then((res) => {
      if (res) {
        this.query();
        notification.success();
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
    const {
      dispatch,
      // mallProtocolManagement: { linePagination },
    } = this.props;
    dispatch({
      type: 'mallProtocolManagement/lineDeleteProduct',
      payload: {
        agreementDetails: rows,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        // this.changeSearch(linePagination);
        this.query();
        this.fetchExitProductList();
        this.fetchNoExitProductList();
      }
    });
  }

  // 商品预览
  @Bind()
  handleGoodsPreview(record) {
    const {
      mallProtocolManagement: { initData = {} },
    } = this.props;
    this.setState({
      productVisible: false,
    });
    openSkuDetail({
      recordData: record,
      backPath: `/small/mall-protocol-management/handwork?agreementId=${initData.agreementId}`,
    });
  }

  // 商品编辑
  @Bind()
  handleGoodsEdit(record) {
    const {
      mallProtocolManagement: { initData = {} },
    } = this.props;
    const { spuId } = record;
    this.setState({
      productVisible: false,
    });
    openSkuEdit({
      spuId,
      backPath: `/small/mall-protocol-management/handwork?agreementId=${initData.agreementId}`,
    });
  }

  // 关闭
  @Bind()
  handleCloseProduct() {
    this.setState({ productModalVisible: false });
  }

  /**
   * 通用导入
   */
  @Bind()
  handleImport() {
    const {
      history: { push = (e) => e },
      location: { search = '' },
    } = this.props;
    const { agreementId } = qs.parse(search.substr(1));
    push({
      pathname: `/small/mall-protocol-management/data-import/SMAL.AGREEMENT_LINE`,
      search: queryString.stringify({
        action: intl.get('small.common.button.batchImport').d('批量导入'),
        backPath: `/small/mall-protocol-management/handwork?agreementId=${agreementId}`,
        args: JSON.stringify({
          agreementId,
          templateCode: 'SMAL.AGREEMENT_LINE',
          tenantId: getCurrentOrganizationId(),
        }),
      }),
    });
  }

  // 供应商变更
  handleChangeSupplier = (supTenantId) => {
    this.setState({ supTenantId });
    if (this.agreementLineDs) {
      const ds = this.agreementLineDs;
      ds.forEach((record) => {
        record.set('supplierTenantId', supTenantId);
        if (record.get('postageLov')) {
          record.set('postageLov', null);
        }
      });
    }
  };

  // 打开阶梯价格弹窗
  handleShowLadderPrice = (record, e) => {
    this.setState({ priceModalVisible: true, line: record, agreementLine: e });
  };

  render() {
    const {
      mallProtocolManagement,
      fetchDataLoading,
      fetchLineLoading,
      saveHeadLoading,
      submitHeadLoading,
      addLoading,
      deleteLoading,
      fetchExitLoading,
      fetchNoExitLoading,
      createLoading,
      delHeadLoading,
      validateLoading,
      customizeTable,
      match: { path = '' },
    } = this.props;
    const {
      agreementTypes = [],
      materialTypes = [],
      agreementFroms = [],
      paymentTypes = [],
      initData = {},
      productTemplate = [],
      exitProductList = [],
      noExitProductList = [],
      exitPagination = {},
      noExitPagination = {},
    } = mallProtocolManagement;
    const {
      priceModalVisible,
      line,
      quoteType,
      productModalVisible,
      agreementLine,
      productVisible,
      agreementStatus: lineStatus,
      isEffective,
      tabKey,
      categoryName,
      supTenantId: supplierTenantId,
      lineQueryLoading,
      priceRule,
      skuApprove,
    } = this.state;
    const { uuid, agreementId, sourceFrom, agreementStatus, agreementNumber } = initData;
    const isDisabled = ['PRICE'].includes(sourceFrom);
    const dataLoading = saveHeadLoading || submitHeadLoading || fetchDataLoading;
    const baseInfoProps = {
      quoteType,
      initData,
      isDisabled,
      agreementId,
      agreementTypes,
      materialTypes,
      agreementFroms,
      paymentTypes,
      onRef: this.handleBindRef,
      onChangeSupplier: this.handleChangeSupplier, // 供应商变更联动
    };

    const tableInfoProps = {
      path,
      isDisabled,
      initData,
      priceRule,
      quoteType,
      agreementId,
      supplierTenantId,
      customizeTable,
      tableDs: this.agreementLineDs,
      handleImport: this.handleImport,
      onShowTransfer: this.handleShowTransfer,
      getCatalogByItem: this.getCatalogByItem,
      onShowLadderPrice: this.handleShowLadderPrice,
      handleCreateProduct: this.handleCreateProduct,
    };
    const backPath = `/small/mall-protocol-management/list?tabKey=${tabKey}`;

    const title = agreementId
      ? intl.get('small.mallProtocolManagement.view.agreement.update').d('协议维护')
      : intl.get('small.mallProtocolManagement.view.agreement.create').d('新建协议');

    // 阶梯价格modal
    const priceModalProps = {
      line,
      isEdit: !isDisabled,
      visible: priceModalVisible,
      onClose: this.handleClosePriceModal,
      onUpdateLadder: this.handleUpdateLadder,
      onSaveAndClose: this.handleSaveAndClosePriceModal,
      // 默认含税价可编辑
      priceEditable: priceRule === 'TAX_INCLUDED_PRICE',
    };

    const uploadModalProps = {
      btnText: intl.get(`small.common.model.attachment.upload`).d('附件上传'),
      btnProps: {
        icon: 'upload',
        disabled: !agreementId,
      },
      showFilesNumber: false,
      attachmentUUID: uuid,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'small-protocol-manage',
    };

    // NEW SUBMITTED APPROVED REJECT DISABLED PUBLISHED TERMINATED

    const rightBtns = [
      {
        show: ['NEW', 'REJECT'].includes(agreementStatus) || !agreementId,
        render: () => <UploadModal {...uploadModalProps} />,
      },
      {
        name: intl.get('hzero.common.button.operating').d('操作记录'),
        disabled: !agreementId,
        show: true,
        event: this.handleShowHistory,
        icon: 'clock-circle-o',
      },
      {
        name: intl.get('hzero.common.button.delete').d('删除'),
        disabled: !agreementId,
        show: agreementStatus === 'NEW',
        loading: delHeadLoading,
        event: this.handleDelData,
        icon: 'delete',
      },
    ];
    const transferProps = {
      rowKey: 'skuId',
      modalTitle: intl.get('small.common.model.productInfo').d('商品信息'),
      skuApprove,
      columns: [
        {
          title: intl.get('small.common.model.productCode').d('商品编码'),
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
          title: intl.get('hzero.common.action').d('操作'),
          dataIndex: 'edit',
          width: 150,
          render: (_, record) => {
            const { purchaseTenantId } = record;
            return (
              <span className="action-link">
                <a onClick={() => this.handleGoodsPreview(record)}>
                  {intl.get('small.common.model.look').d('查看')}
                </a>
                {purchaseTenantId === getCurrentOrganizationId() && skuApprove && (
                  <a onClick={() => this.handleGoodsEdit(record)}>
                    {intl.get('small.common.button.edit').d('编辑')}
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
      agreementStatus: lineStatus,
      isEffective,
      agreementLine,
    };

    const productModalProps = {
      categoryName,
      productTemplate,
      visible: productModalVisible,
      loading: createLoading,
      onCancel: this.handleCloseProduct,
      onOk: this.handleProductOK,
      onRef: (ref) => {
        this.itemProductForm = (ref.props || {}).form;
      },
    };

    const SaveButton = observer(({ dataSet }) => {
      const validateLine = dataSet?.getState('validateLine');
      const noSubmit = !agreementId || (dataSet && dataSet.records.length === 0);
      return (
        <Button
          icon="save"
          type={noSubmit ? 'primary' : ''}
          onClick={() => this.handleValidate('NEW')}
          loading={dataLoading || fetchLineLoading || lineQueryLoading || validateLine}
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      );
    });
    const SubmitButton = observer(({ dataSet }) => {
      const validateLine = dataSet?.getState('validateLine');
      const noSubmit = !agreementId || (dataSet && dataSet.records.length === 0);
      return (
        <Button
          icon="check"
          type={noSubmit ? '' : 'primary'}
          onClick={() => this.handleValidate('SUBMITTED')}
          loading={dataLoading || validateLoading || lineQueryLoading || validateLine}
          disabled={noSubmit}
          // style={{ display: noSubmit ? 'none' : 'inline-block' }}
        >
          {intl.get('hzero.common.button.submit').d('提交')}
        </Button>
      );
    });
    return (
      <React.Fragment>
        <Header title={title} backPath={backPath}>
          {<SubmitButton dataSet={this.agreementLineDs} />}
          {<SaveButton dataSet={this.agreementLineDs} />}
          {rightBtns
            .filter((btn) => btn.show)
            .map((btn) =>
              btn.render ? (
                btn.render()
              ) : btn.popConfirmProps ? (
                <Popconfirm
                  arrowPointAtCenter
                  placement="bottom"
                  onConfirm={btn.event}
                  {...btn.popConfirmProps}
                >
                  <Button
                    type={btn.primary ? 'primary' : ''}
                    disabled={btn.disabled}
                    loading={btn.loading}
                    icon={btn.icon}
                  >
                    {btn.name}
                  </Button>
                </Popconfirm>
              ) : (
                <Button
                  type={btn.primary ? 'primary' : ''}
                  onClick={btn.event}
                  disabled={btn.disabled}
                  loading={btn.loading}
                  icon={btn.icon}
                >
                  {btn.name}
                </Button>
              )
            )}
        </Header>
        <Content>
          <div>
            <div className={style.title}>
              {intl.get('small.common.view.baseInfo').d('基本信息')}
            </div>
            <Spin spinning={!!fetchDataLoading} wrapperClassName="ued-detail-wrapper">
              <BaseInfo {...baseInfoProps} />
            </Spin>
            <Tabs animated={false}>
              <Tabs.TabPane
                tab={intl.get('small.mallProtocolManagement.view.agreementLine').d('协议行')}
                key="1"
              >
                {(agreementId || isDisabled) && this.agreementLineDs && (
                  <TableList {...tableInfoProps} />
                )}
              </Tabs.TabPane>
              <Tabs.TabPane tab={intl.get('sagm.common.view.buyPermisson').d('采买权限')} key="3">
                {agreementId && (
                  <AgreeAuthorityContext.Provider value={{ __sourceFrom: 'agreement' }}>
                    <Authority
                      readOnly={false}
                      agreementHeaderId={agreementId}
                      agreementHeaderNum={agreementNumber}
                      viewSkuBackPath={`/small/mall-protocol-management/handwork?agreementId=${agreementId}`}
                      agreementType="PUR_AGREEMENT"
                    />
                  </AgreeAuthorityContext.Provider>
                )}
              </Tabs.TabPane>
            </Tabs>
          </div>
        </Content>
        {priceModalVisible && <PriceModal {...priceModalProps} />}
        {productModalVisible && <ItemProductModal {...productModalProps} />}
        <ListTransfer {...transferProps} />
      </React.Fragment>
    );
  }
}
