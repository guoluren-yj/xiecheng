/**
 * GoodsMaintain -商品维护详情
 * @date: 2019-1-28
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Table, Form, Spin, Popconfirm, Collapse, Icon, Modal, Input } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, isUndefined, filter } from 'lodash';
import qs from 'querystring';
import classnames from 'classnames';
import uuidv4 from 'uuid/v4';

import { Header, Content } from 'components/Page';
// import TinymceEditor from 'components/TinymceEditor';
import StaticTextEditor from '@/routes/Components/StaticTextEditor';
import UploadModal from 'components/Upload/index';
import EditTable from 'components/EditTable';
import ExcelExport from 'components/ExcelExport';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { getCurrentOrganizationId, getUserOrganizationId, getEditTableData } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { SRM_SCEC, PUBLIC_BUCKET } from '_utils/config';
import OperateRecord from '../../OperateRecord';

import BaseInfo from './BaseInfo';
import Photoes from './Photoes';
import './index.less';

const { Panel } = Collapse;
@Form.create({ fieldNameProp: null })
@connect(({ goodsMaintain, loading }) => ({
  goodsMaintain,
  // loading: loading.effects['goodsMaintain/fetchGoodsDetail' || 'goodsMaintain/fetchGoodsSubmit' ||'goodsMaintain/updateState'],
  saveLoading: loading.effects['goodsMaintain/saveGoodsInfo'],
  submitLoading: loading.effects['goodsMaintain/fetchGoodsSubmit'],
  scrappedLoading: loading.effects['goodsMaintain/fetchGoodsScrapped'],
  fetchLoading: loading.effects['goodsMaintain/fetchGoodsDetail'],
  updateLoading: loading.effects['goodsMaintain/updateState'],
  fetchLadderPriceLoading: loading.effects['goodsMaintain/fetchLadderPriceTable'],
  saveLadderPriceLoading: loading.effects['goodsMaintain/saveLadderPrice'],
  deleteAttrLoading: loading.effects['goodsMaintain/deleteAttribute'],
}))
export default class Details extends Component {
  constructor(props) {
    super(props);
    const { productId } = qs.parse(props.history.location.search.substr(1));
    const {
      location: { pathname = '', search = '' },
    } = this.props;
    const detailUrl = pathname + search;
    this.state = {
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
      productId, // 商品名称
      detailUrl,
      //  cateList: [],       //目录名称名称
      fileList: [],
      collapseKeys: ['baseInfo', 'goodsPhoto', 'goodsIntroduction', 'specifications'], // 打开的折叠面板key
      primaryPhoto: '', // 存储主图路径
      currentProImage: 0, // 初始化主图位置
      modalVisible: false, // 是否打开操作记录弹框
      isShowTax: false, // 判断稅值税率是否为必输
      isShowPrice: false,
      ladderPriceSelectedRowKeys: [], // 阶梯报价选中id
      ladderPriceSelectedRows: [], // 阶梯报价选中行
      priceModalVisible: false,
      attrSelectedKeys: [],
      attrSelectedRows: [], // 规格参数选中行
      attrRecord: {},
    };
  }

  form;

  componentDidMount() {
    const { productId } = this.state;
    const {
      location: { state: { _back } = {} },
      dispatch,
      goodsMaintain: {
        detail: { attachmentUuidAs = '' },
      },
    } = this.props;
    if (productId && _back !== -1) {
      //  this.cleanEditor();
      this.fetchGoodsDetail();
      if (isEmpty(attachmentUuidAs)) {
        this.getAttachmentUUID();
      }
    } else if (_back === -1) {
      // 初始化主图
      this.fetchImagePosition();
    } else if (isEmpty(attachmentUuidAs) && isEmpty(productId)) {
      // this.resetDetail();
      this.getAttachmentUUID();
    }
    this.batchCode();
    if (productId) {
      dispatch({
        type: 'goodsMaintain/fetchLadderPriceTable',
        payload: { productId },
      });
    }
  }

  @Bind()
  fetchCompanyCurrency(params) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'goodsMaintain/fetchComapnyCurrency',
      payload: params,
    });
  }

  /**
   * 清空model数据
   */
  @Bind()
  resetDetail() {
    const { dispatch } = this.props;
    dispatch({
      type: 'goodsMaintain/updateState',
      payload: {
        detail: {},
      },
    });
  }

  /**
   * 获取上传附件的UUID
   * @param  {String} tenantId --租户ID
   */
  @Bind()
  getAttachmentUUID() {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    dispatch({
      type: 'goodsMaintain/getAttachmentUUId',
      payload: {
        tenantId,
      },
    });
  }

  /**
   * 批量查询值级
   */
  @Bind()
  batchCode() {
    const { dispatch } = this.props;
    const lovCodes = {
      status: 'SCEC.PRODUCT_OPERATION', // 状态
      sourceType: 'SCEC.PRODUCT_SOURCE', // 数据来源
    };
    dispatch({
      type: 'goodsMaintain/batchCode',
      payload: lovCodes,
    });
  }

  /**
   * 查询目录名称
   */
  @Bind()
  fetchCatalogue(params = '') {
    const { dispatch } = this.props;
    dispatch({
      type: 'goodsMaintain/fetchCatalogue',
      payload: params,
    });
  }

  /**
   * 查询商品二/三级目录
   */
  @Bind()
  fetchChildCatalogue(params = {}) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'goodsMaintain/fetchSecondCatalogue',
      payload: params,
    });
  }

  /**
   * 获取子组件参数
   * @param ref = {}
   */
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 详情查询
   */
  @Bind()
  fetchGoodsDetail(params = '') {
    const { dispatch } = this.props;
    const { productId } = this.state;
    dispatch({
      type: 'goodsMaintain/fetchGoodsDetail',
      payload: {
        productId: isUndefined(params) ? params : productId,
      },
    }).then(() => {
      const {
        goodsMaintain: {
          detail: { companyId = '', taxIncloudedFlag, ladderFlag },
        },
      } = this.props;
      this.setState({
        isShowPrice: !!ladderFlag,
        collapseKeys: ['baseInfo', 'goodsPhoto', 'goodsIntroduction', 'specifications'],
      });
      this.fetchCatalogue({ companyId });
      const state = {
        isShowTax: false,
      };
      if (taxIncloudedFlag) {
        state.isShowTax = true;
      } else {
        state.isShowTax = false;
      }
      this.setState(state);
      this.fetchImagePosition();
    });
  }

  /**
   * 初始化主图位置
   */
  @Bind()
  fetchImagePosition() {
    const {
      goodsMaintain: {
        detail: { productImageList = [], imagePath = '' },
      },
    } = this.props;
    let currentIndex = 0;
    for (let i = 0; i < productImageList.length; i++) {
      if (productImageList[i].imagePath === imagePath) {
        currentIndex = i;
      }
    }
    this.setState({
      currentProImage: currentIndex,
    });
  }

  /**
   * 判断稅值税率是否显示
   */
  @Bind()
  isShowTax() {
    const { isShowTax } = this.state;
    this.setState({
      isShowTax: !isShowTax,
    });
  }

  @Bind()
  isShowPrice() {
    const { isShowPrice } = this.state;
    this.setState({
      isShowPrice: !isShowPrice,
    });
  }

  /**
   * 获取图片信息
   */
  @Bind()
  fetchGetPhotoInfo(fileList = []) {
    this.setState(
      {
        fileList,
      },
      () => {
        this.updatePhotoes(this.state.fileList);
      }
    );
  }

  /**
   * 计量单位LOV, 绑定值与表字段不一致，重新给字段赋值
   */
  @Bind()
  changeUom(params = '', paramName = '') {
    this.setState({
      primaryUomId: params,
      primaryUomName: paramName,
    });
  }

  /**
   * 币种lov,绑定值为id,需传code
   */
  @Bind()
  changeCurrency(params = '', paramName = '') {
    this.setState({
      currencyCode: params,
      currencyName: paramName,
    });
  }

  /**
   * 获取主图
   */
  @Bind()
  getPrimaryPhoto(params = '') {
    this.setState({
      primaryPhoto: params,
    });
  }

  /**
   * 拿到税种,税率
   */
  @Bind()
  handleGetTaxCate(params = '') {
    this.setState({
      taxCode: params,
    });
  }

  /**
   * 保存，返回保存的参数
   * @return promise
   */
  @Bind()
  saveInfo() {
    const {
      dispatch,
      goodsMaintain: { detail = {}, attachmentUUId = '', ladderPriceData = [] },
    } = this.props;
    const { productImageList = [], attachmentUuidAs = '', attributeDetails = [] } = detail;
    const { primaryPhoto = '', organizationId, primaryUomId = '', currencyCode = '' } = this.state;
    const saveAttr = getEditTableData(attributeDetails, ['productId']).map((i, index) => ({
      ...i,
      orderSeq: index + 1,
    }));
    let proImageList = [];
    let imageFixPath = ''; // 获取主图
    if (isArray(productImageList) && productImageList.length > 0) {
      proImageList = productImageList.map((item) => {
        const { imagePath } = item;
        const flag = imagePath === primaryPhoto;
        return {
          imagePath: item.imagePath,
          features: 'string',
          orderSeq: 1,
          position: 'string',
          primaryFlag: flag ? 1 : 0,
          productId: null,
          productImageId: null,
          type: 0,
        };
      });
      // 如果主图为空则设第一张为主图
      if (primaryPhoto === '' && proImageList.length > 0) {
        proImageList[0].primaryFlag = 1;
        imageFixPath = proImageList[0].imagePath;
      }
    }
    return new Promise((resolve, reject) => {
      this.form.validateFields((err, values) => {
        if (!err && (!isEmpty(saveAttr) || isEmpty(attributeDetails))) {
          const {
            catalogId,
            companyId,
            effectiveDateFrom,
            effectiveDateTo,
            creationDate,
            supplierId,
            taxId,
            productStatus,
            sourceFromType,
            createdParty,
            taxIncloudedFlag, // 是否含税
            taxPrice, // 含税单价单价
            netPrice,
            taxMarketPrice, // 含税市场价
            marketPrice, // 不含税市场价
            taxCostPrice, // 含税成本价
            costPrice, // 不含税成本价
            ladderFlag,
            validDeliveryCycle,
          } = values;
          const cateId = isArray(catalogId) ? catalogId[catalogId.length - 1] : catalogId;
          let includeTax = 0; // 含税单价
          let noIncludeTax = 0; // 不含税单价
          let noCostPrice = 0; // 含税成本价
          let inCostPrice = 0; // 不含税成本价
          let noMarketPrice = 0; // 含税市场价
          let inMarketPrice = 0; // 不含税市场价
          if (taxIncloudedFlag) {
            // 如果勾选了含税,那么单价是指含税单价,此时需要计算出不含税单价，不含税单价公式为 含税单价/(1+税率)
            noIncludeTax = taxPrice / (1 + values.taxRate / 100);
            noCostPrice = taxCostPrice / (1 + values.taxRate / 100);
            noMarketPrice = taxMarketPrice / (1 + values.taxRate / 100);
          } else {
            // 如果不勾选,那么单价是指不含税单价，此时需要计算出含税单价，含税单价公式为(1+税率)*单价
            includeTax = (1 + values.taxRate / 100) * netPrice;
            inCostPrice = (1 + values.taxRate / 100) * costPrice;
            inMarketPrice = (1 + values.taxRate / 100) * marketPrice;
          }
          const { productDetail = {} } = detail;
          const params = {
            ...detail,
            ...values,
            attachmentUuidAs: attachmentUuidAs || attachmentUUId,
            netPrice: taxIncloudedFlag ? noIncludeTax : netPrice,
            taxPrice: taxIncloudedFlag ? taxPrice : includeTax,
            taxMarketPrice: taxIncloudedFlag ? taxMarketPrice : inMarketPrice,
            marketPrice: taxIncloudedFlag ? noMarketPrice : marketPrice,
            taxCostPrice: taxIncloudedFlag ? taxCostPrice : inCostPrice,
            costPrice: taxIncloudedFlag ? noCostPrice : costPrice,
            companyId: companyId === detail.companyName ? detail.companyId : companyId,
            supplierId: supplierId === detail.supplierName ? detail.supplierId : supplierId,
            taxId: taxId === detail.taxCode ? detail.taxId : taxId,
            supplierTenantId: organizationId,
            catalogId: cateId,
            productStatus:
              productStatus === intl.get('hzero.common.button.create').d('新建')
                ? 'NEW'
                : productStatus,
            sourceFromType:
              sourceFromType === intl.get('scec.common.model.manually.create').d('手工创建')
                ? 'MANUAL'
                : sourceFromType,
            createdParty:
              createdParty === intl.get('scec.common.model.provider').d('供应方')
                ? 'SUPPLIER'
                : createdParty,
            taxIncloudedFlag: taxIncloudedFlag ? 1 : 0,
            ladderFlag: ladderFlag ? 1 : 0,
            primaryUomId: primaryUomId || detail.primaryUomId,
            currencyCode: currencyCode || detail.currencyCode,
            effectiveDateFrom: effectiveDateFrom
              ? effectiveDateFrom.format(DEFAULT_DATE_FORMAT)
              : undefined,
            effectiveDateTo: effectiveDateTo
              ? effectiveDateTo.format(DEFAULT_DATE_FORMAT)
              : undefined,
            creationDate: creationDate ? creationDate.format(DEFAULT_DATE_FORMAT) : undefined,
            productImageList: proImageList,
            productDetail: {
              productId: null,
              ...productDetail,
            },
            attributeDetails: saveAttr || [],
            imagePath: primaryPhoto || imageFixPath,
            validDeliveryCycle,
          };
          if (ladderFlag && ladderPriceData.length < 1) {
            notification.warning({ message: '请维护阶梯价格' });
            return;
          }
          dispatch({
            type: 'goodsMaintain/saveGoodsInfo',
            payload: params,
          }).then((res) => {
            if (res) {
              const { productId } = res;
              resolve();
              this.setState(
                {
                  productId,
                  attrRecord: {},
                },
                () => {
                  dispatch({
                    type: 'goodsMaintain/updateState',
                    payload: { productId },
                  });
                }
              );
            } else {
              reject();
            }
          });
        }
      });
    });
  }

  /**
   * 执行保存
   */
  @Bind()
  fetchSaveBaseInfo() {
    const { productId } = this.state;
    this.saveInfo().then(() => {
      this.fetchGoodsDetail(productId);
      notification.success();
    });
  }

  /**
   * 清空富文本框
   */
  @Bind()
  cleanEditor() {
    const {
      dispatch,
      goodsMaintain: { detail = {} },
    } = this.props;
    dispatch({
      type: 'goodsMaintain/updateState',
      payload: {
        detail: {
          ...detail,
          attachmentUuidAs: '',
          productDetail: {},
        },
      },
    });
  }

  /**
   * 监听富文本编辑
   * @param {object} dataSource - 编辑的数据
   */
  @Bind()
  onRichTextEditorChange(type, dataSource) {
    const {
      dispatch,
      goodsMaintain: { detail = {} },
    } = this.props;
    const { productDetail = {} } = detail;
    dispatch({
      type: 'goodsMaintain/updateState',
      payload: {
        detail: {
          ...detail,
          productDetail: {
            ...productDetail,
            [type]: dataSource,
          },
        },
      },
    });
  }

  /**
   * 商品提交(先保存后提交)
   * @param
   */
  @Bind()
  fetchGoodsSubmit() {
    const { dispatch, goodsMaintain } = this.props;
    const productId = this.state.productId || goodsMaintain.productId;
    this.saveInfo().then(() => {
      dispatch({
        type: 'goodsMaintain/fetchGoodsSubmit',
        payload: [productId],
      }).then((res) => {
        if (res) {
          notification.success();
          this.props.history.push('/scec/goods-maintain/list');
        }
      });
    });
  }

  /**
   * 商品作废
   */
  @Bind()
  fetchGoodsScrapped() {
    const { dispatch } = this.props;
    const { productId } = this.state;
    dispatch({
      type: 'goodsMaintain/fetchGoodsScrapped',
      payload: [productId],
    }).then((res) => {
      if (res) {
        notification.success();
        this.props.history.push('/scec/goods-maintain/list');
      }
    });
  }

  /**
   * 打开操作记录弹框
   */
  @Bind()
  controlOperate() {
    const { modalVisible } = this.state;
    this.setState({
      modalVisible: !modalVisible,
    });
  }

  /**
   * 清空供应商
   */
  @Bind()
  cleanSupplier() {
    const {
      dispatch,
      goodsMaintain: { detail = {} },
    } = this.props;
    const { supplierId, supplierName, catalogList, ...otherValue } = detail;
    dispatch({
      type: 'goodsMaintain/updateState',
      payload: {
        detail: {
          ...otherValue,
          supplierId: null,
          supplierName: null,
          catalogList: [],
        },
      },
    });
  }

  /**
   * 打开商品详情预览框
   */
  @Bind()
  goodPreview() {
    const {
      dispatch,
      goodsMaintain: { detail = {} },
    } = this.props;
    const { productImageList = [], productDetail = {}, attributeDetails = [] } = detail;
    const { detailUrl, optionList, primaryPhoto } = this.state;
    const saveAttr = getEditTableData(attributeDetails, ['productId']);
    this.form.validateFields((err, values) => {
      if (!err && (isEmpty(attributeDetails) || !isEmpty(saveAttr))) {
        const {
          catalogId,
          primaryUomId,
          companyId,
          supplierId,
          supplierName,
          taxId,
          productStatus,
          sourceFromType,
          createdParty,
          taxRate,
          taxPrice, // 含税单价单价
          netPrice,
        } = values;
        const baseList = {
          ...values,
          catalogId: isArray(catalogId) ? catalogId[catalogId.length - 1] : detail.catalogId,
          catalogList:
            isArray(optionList) && optionList.length > 0 ? optionList : detail.catalogList,
          primaryUomId:
            primaryUomId === detail.primaryUomId ? detail.primaryUomId : this.state.primaryUomId,
          primaryUomName: this.state.primaryUomName
            ? this.state.primaryUomName
            : detail.primaryUomName,
          createdParty:
            createdParty === intl.get('scec.common.model.provider').d('供应方')
              ? 'SUPPLIER'
              : createdParty,
          companyId: companyId === detail.companyName ? detail.companyId : companyId,
          supplierId: supplierId === detail.supplierName ? detail.supplierId : supplierId,
          supplierName: supplierName ? this.state.supplierName : detail.supplierName,
          taxId: taxId === detail.taxCode ? detail.taxId : taxId,
          taxCode: this.state.taxCode ? this.state.taxCode : detail.taxCode,
          productStatus:
            productStatus === intl.get('hzero.common.button.create').d('新建')
              ? 'NEW'
              : productStatus,
          sourceFromType:
            sourceFromType === intl.get('scec.common.model.manually.create').d('手工创建')
              ? 'MANUAL'
              : sourceFromType,
          currencyCode: this.state.currencyCode ? this.state.currencyCode : detail.currencyCode,
          currencyName: this.state.currencyName ? this.state.currencyName : detail.currencyName,
          imagePath: !isEmpty(primaryPhoto) ? primaryPhoto : detail.imagePath,
        };
        // 给获取主图赋值
        this.setState({
          primaryPhoto: !isEmpty(primaryPhoto) ? primaryPhoto : detail.imagePath,
        });
        let baseInfoList = baseList;
        if (!taxPrice) {
          baseInfoList = {
            ...baseList,
            taxPrice: (1 + Math.round(taxRate * 100) / 100) * netPrice,
          };
        }
        const htmlList = this.props.form.getFieldsValue();
        const { remark } = this.form.getFieldsValue();
        const router = {
          pathname: `/scec/goods-maintain/goods-preview`,
          state: {
            baseInfoList: qs.stringify(baseInfoList),
            htmlList: qs.stringify(htmlList),
            productImageList,
            detailUrl,
            attributeDetails: saveAttr || [],
          },
        };
        const params = {
          ...baseInfoList,
          productDetail: { ...productDetail, ...htmlList },
          productImageList,
          remark,
          attributeDetails,
        };
        dispatch({
          type: 'goodsMaintain/updateState',
          payload: {
            detail: {
              ...detail,
              ...params,
            },
          },
        });
        this.props.history.push(router);
      }
    });
  }

  /**
   * 更新上传图片列表
   * @param {Object} fileArray -所有新上传成功的图片
   */
  @Bind()
  updatePhotoes(fileArray = []) {
    const {
      dispatch,
      goodsMaintain: { detail = {} },
    } = this.props;
    const { productImageList = [] } = detail;
    let proImageList = [];
    proImageList = fileArray.map((item) => {
      return {
        imagePath: item.response,
        features: 'string',
        orderSeq: 1,
        position: 'string',
        primaryFlag: 0,
        productId: null,
        productImageId: null,
        type: 0,
      };
    });
    dispatch({
      type: 'goodsMaintain/updateState',
      payload: {
        detail: {
          ...detail,
          productImageList: [...productImageList, ...proImageList],
        },
      },
    });
  }

  /**
   * 图片删除(单张删除)
   * @param {object} file 图片删除信息
   */
  @Bind()
  deletePhotoes(file = {}) {
    const {
      dispatch,
      goodsMaintain: { detail = {} },
    } = this.props;
    const { productImageList = [] } = detail;
    const filterList = productImageList.filter((item) => {
      return item.imagePath !== file.imagePath;
    });
    dispatch({
      type: 'goodsMaintain/updateState',
      payload: {
        detail: {
          ...detail,
          productImageList: filterList,
        },
      },
    });
  }

  /**
   * 获取目录
   * @param {Array} params 当前所选三级目录集合lable
   */
  @Bind()
  handleGetAreaClick(params = []) {
    this.setState({
      optionList: params,
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * 打开阶梯价格模态框
   */
  @Bind()
  viewLadderPriceModal(productId = undefined) {
    this.setState({
      priceModalVisible: true,
      productId,
    });
    const { dispatch } = this.props;
    dispatch({
      type: 'goodsMaintain/fetchLadderPriceTable',
      payload: { productId },
    });
  }

  /**
   * hideOperationRecord - 关闭阶梯价格弹窗
   */
  @Bind()
  hideLadderPriceModal() {
    this.setState({ priceModalVisible: false });
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        ladderPriceData: [],
      },
    });
  }

  /**
   * 阶梯报价-新增行
   */
  @Bind()
  createLadderLine(productId = undefined) {
    const {
      dispatch,
      goodsMaintain: { ladderPriceData = [] },
    } = this.props;
    const { tenantId } = this.state;
    dispatch({
      type: 'goodsMaintain/updateState',
      payload: {
        ladderPriceData: [
          ...ladderPriceData,
          {
            tenantId,
            productId,
            ladderId: uuidv4(),
            // lineNum: undefined,
            ladderFrom: undefined,
            ladderTo: undefined,
            unitPrice: undefined,
            _status: 'create',
          },
        ],
      },
    });
  }

  /**
   * 阶梯报价-保存
   */
  @Bind()
  saveLadderPrice(productId = undefined) {
    const {
      dispatch,
      goodsMaintain: { ladderPriceData = [] },
    } = this.props;
    const { ladderPriceSelectedRowKeys = [] } = this.state;
    // const createItemLine = itemLine && itemLine.filter(item => item._status === 'create');
    const newParams = getEditTableData(ladderPriceData, ['ladderId']);
    if (!isEmpty(newParams)) {
      const newParameters = newParams.map((item, index) => {
        return {
          ...item,
          lineNum: index + 1,
        };
      });
      dispatch({
        type: 'goodsMaintain/saveLadderPrice',
        payload: { newParameters, productId },
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'goodsMaintain/updateState',
            payload: {
              LadderPriceChange: false,
            },
          });
          dispatch({
            type: 'goodsMaintain/fetchLadderPriceTable',
            payload: { productId },
          });
          notification.success();
          this.setState({ priceModalVisible: false });
          if (!isEmpty(ladderPriceSelectedRowKeys)) {
            this.setState({
              ladderPriceSelectedRows: [],
              ladderPriceSelectedRowKeys: [],
              priceModalVisible: false,
            });
          }
        }
      });
    }
  }

  /**
   * 阶梯报价 - 批量删除
   */
  @Bind()
  deleteLadderPrice(productId) {
    const {
      dispatch,
      goodsMaintain: { ladderPriceData = [] },
    } = this.props;
    const { ladderPriceSelectedRowKeys } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(ladderPriceData, (item) => {
      return ladderPriceSelectedRowKeys.indexOf(item.ladderId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newLadderPrice = filter(ladderPriceData, (item) => {
      return ladderPriceSelectedRowKeys.indexOf(item.ladderId) < 0;
    });
    // 过滤出新增未保存数据
    const oldLadderPriceData = filter(ladderPriceData, (item) => {
      return item._status === 'update';
    });
    if (
      (newParameters.length > 0 && newParameters.length === oldLadderPriceData.length) ||
      (newParameters.length > 0 && newParameters[0].lineNum >= oldLadderPriceData.length) ||
      !newParameters[0].lineNum
    ) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
        onOk: () => {
          const remoteDelete = [];
          const localDelete = [];
          newParameters.forEach((item) => {
            if (item._status === 'create') {
              localDelete.push(item);
            }
            if (item._status === 'update') {
              remoteDelete.push(item);
            }
          });
          if (isEmpty(remoteDelete)) {
            dispatch({
              type: 'goodsMaintain/updateState',
              payload: {
                ladderPriceData: newLadderPrice,
              },
            });
            this.setState({ ladderPriceSelectedRowKeys: [], ladderPriceSelectedRows: [] });
          } else {
            dispatch({
              type: 'goodsMaintain/deleteLadderPriceLines',
              payload: { remoteDelete, productId },
            }).then((res) => {
              if (res) {
                notification.success();
                dispatch({
                  type: 'goodsMaintain/updateState',
                  payload: {
                    ladderPriceData: newLadderPrice,
                  },
                });
                this.setState({ ladderPriceSelectedRowKeys: [], ladderPriceSelectedRows: [] });
              }
            });
          }
        },
      });
    } else {
      notification.warning({
        message: intl
          .get(`scec.common.model.onleSelectedLastLeastRows`)
          .d('只能从最后一行已保存行开始删除!'),
      });
    }
  }

  /**
   * 阶梯价格-获取删除选中行
   *
   * @param {*} selectedRowKeys
   * @memberof EditForm
   */
  @Bind()
  handleLadderPriceRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      ladderPriceSelectedRowKeys: selectedRowKeys,
      ladderPriceSelectedRows: selectedRows,
    });
  }

  /**
   * 阶梯报价-表格内容改变
   */
  @Bind()
  changeLadderPriceTableData() {
    const {
      dispatch,
      goodsMaintain: { LadderPriceChange = false },
    } = this.props;
    if (!LadderPriceChange) {
      dispatch({
        type: 'goodsMaintain/updateState',
        payload: {
          LadderPriceChange: true,
        },
      });
    }
  }

  /**
   * 选中行回调
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  handleChangeSelectRowKeys(key, rows) {
    this.setState({
      attrSelectedKeys: key,
      attrSelectedRows: rows,
    });
  }

  @Bind()
  handleImport() {
    openTab({
      key: `/hiam/sub-account-org/data-import/SCEC.PRODUCT_ATTRIBUTE`,
      title: intl.get('scec.common.button.import').d('导入'),
      search: qs.stringify({
        title: 'scec.common.button.import',
        action: intl.get('scec.common.button.import').d('导入'),
      }),
    });
  }

  @Bind()
  handleAddLine(add) {
    const {
      dispatch,
      goodsMaintain: { detail },
    } = this.props;
    const { attributeDetails = [] } = detail;
    const { attrRecord } = this.state;
    let addIndex = 0;
    for (let index = 0; index < attributeDetails.length; index++) {
      if (attrRecord.productId === attributeDetails[index].productId) {
        addIndex = index;
        break;
      }
    }
    if (add === 'up') {
      attributeDetails.splice(addIndex, 0, {
        productId: uuidv4(),
        _status: 'create',
      });
      dispatch({
        type: 'goodsMaintain/updateState',
        payload: {
          detail: {
            ...detail,
            attributeDetails,
          },
        },
      });
    } else if (add === 'down') {
      attributeDetails.splice(addIndex + 1, 0, {
        productId: uuidv4(),
        _status: 'create',
      });
      dispatch({
        type: 'goodsMaintain/updateState',
        payload: {
          detail: {
            ...detail,
            attributeDetails,
          },
        },
      });
    } else {
      dispatch({
        type: 'goodsMaintain/updateState',
        payload: {
          detail: {
            ...detail,
            attributeDetails: [
              ...attributeDetails,
              {
                productId: uuidv4(),
                _status: 'create',
              },
            ],
          },
        },
      });
    }
  }

  @Bind()
  handleDeleteLine() {
    const {
      dispatch,
      goodsMaintain: { detail },
    } = this.props;
    const { attributeDetails } = detail;
    const { attrSelectedRows } = this.state;
    const newData = attributeDetails.filter((item) => !attrSelectedRows.includes(item));
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        dispatch({
          type: 'goodsMaintain/updateState',
          payload: {
            detail: {
              ...detail,
              attributeDetails: newData,
            },
          },
        });
        this.setState({ attrSelectedKeys: [], attrSelectedRows: [], attrRecord: {} });
      },
    });
  }

  /**
   * 表格行事件
   * @param {Object} record - 行数据
   */
  @Bind()
  onRow(record) {
    return {
      onClick: () => {
        this.setState({ attrRecord: record });
      },
    };
  }

  @Bind()
  onRowClass(record) {
    const { attrRecord } = this.state;
    if (record.productId === attrRecord.productId) {
      return 'attr-row';
    }
  }

  /**
   * 规格参数编辑
   */
  // @Bind()
  // onCell(record) {
  //   return {
  //     onClick: e => {
  //       e.stopPropagation();
  //       const {
  //         dispatch,
  //         goodsMaintain: { detail },
  //       } = this.props;
  //       const { attributeDetails } = detail;
  //       if(!record._status) {
  //         const newData = attributeDetails.map(item =>
  //           record.productId === item.productId ? { ...item, _status: 'update' } : item
  //         );
  //         dispatch({
  //           type: 'goodsMaintain/updateState',
  //           payload: {
  //             detail: {
  //               ...detail,
  //               attributeDetails: newData,
  //             },
  //           },
  //         });
  //       }
  //     },
  //   };
  // }

  render() {
    const {
      goodsMaintain: {
        code = {},
        catalogueList = [],
        catalogueSecondList = [],
        attachmentUUId = '',
        detail = {},
        ladderPriceData = [],
      },
      fetchLoading,
      submitLoading,
      scrappedLoading,
      saveLoading,
      fetchLadderPriceLoading,
      saveLadderPriceLoading,
      deleteAttrLoading,
    } = this.props;
    const {
      attachmentUuidAs = '',
      productDetail = {},
      attributeDetails = [],
      productId = '',
      sourceFromType = '',
      productImageList = [],
    } = detail;
    const introduction = productDetail ? productDetail.introduction : null;
    // const specificationsParam = productDetail ? productDetail.specificationsParam : null;
    //  const { cateList = [] } = this.state;
    const { getFieldDecorator } = this.props.form;
    const {
      isShowTax,
      currentProImage,
      collapseKeys,
      isShowPrice,
      priceModalVisible,
      ladderPriceSelectedRowKeys = [],
      ladderPriceSelectedRows = [],
      attrSelectedKeys = [],
      attrSelectedRows = [],
      attrRecord = {},
      tenantId,
    } = this.state;
    const ladderPriceRowSelection = {
      selectedRowKeys: ladderPriceSelectedRowKeys,
      onChange: this.handleLadderPriceRowSelectChange,
    };
    const staticTextProps = {
      content: introduction,
      bucketDirectory: 'scec-goods-maintain',
      key: productId,
      onEditorChange: (dataSource) => this.onRichTextEditorChange('introduction', dataSource),
    };

    const attachmentID = attachmentUuidAs || attachmentUUId;
    const uploadModalProps = {
      btnText: intl.get(`entity.attachment.upload`).d('附件上传'),
      btnProps: {
        icon: 'upload',
      },
      showFilesNumber: false,
      attachmentUUID: attachmentID,
      bucketName: PUBLIC_BUCKET,
      bucketDirectory: 'scec-goods-maintain',
    };

    const attrColumns = [
      {
        title: intl.get('scec.common.model.orderSeq').d('行号'),
        dataIndex: 'orderSeq',
        width: 60,
      },
      {
        dataIndex: 'attrName',
        title: intl.get('scec.common.model.attrName').d('规格参数名称'),
        width: 120,
      },
      {
        dataIndex: 'attrValue',
        title: intl.get('scec.common.model.attrValue').d('规格参数值'),
        width: 120,
      },
    ];
    const columns = [
      {
        title: intl.get('scec.common.model.orderSeq').d('行号'),
        dataIndex: 'orderSeq',
        width: 60,
      },
      {
        dataIndex: 'attrName',
        title: intl.get('scec.common.model.attrName').d('规格参数名称'),
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item style={{ marginBottom: 0 }}>
              {record.$form.getFieldDecorator('attrName', {
                initialValue: record.attrName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('scec.common.model.attrName').d('规格参数名称'),
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        dataIndex: 'attrValue',
        title: intl.get('scec.common.model.attrValue').d('规格参数值'),
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item style={{ marginBottom: 0 }}>
              {record.$form.getFieldDecorator('attrValue', {
                initialValue: record.attrValue,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('scec.common.model.attrValue').d('规格参数值'),
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    const attrRowSelection = {
      selectedRowKeys: attrSelectedKeys,
      onChange: this.handleChangeSelectRowKeys,
    };

    return (
      <React.Fragment>
        <Header
          title={intl.get('scec.goodsMaintain.model.goodsMaintain.editTitle').d('编辑商品')}
          backPath="/scec/goods-maintain/list"
        >
          <Button
            type="primary"
            icon="save"
            onClick={this.fetchSaveBaseInfo}
            loading={saveLoading || fetchLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <UploadModal {...uploadModalProps} />
          <Popconfirm
            title={intl.get('scec.common.warning.tilte.sureToSubmit').d('你确定提交吗?')}
            okText={intl.get('scec.common.action.sure').d('确定')}
            cancelText={intl.get('scec.common.action.cancel').d('取消')}
            onConfirm={() => this.fetchGoodsSubmit()}
          >
            <Button icon="check" disabled={!productId} loading={submitLoading}>
              {intl.get('scec.common.button.submit').d('提交')}
            </Button>
          </Popconfirm>
          <Popconfirm
            title={intl.get('scec.common.warning.tilte.sureToScrapped').d('你确定作废吗?')}
            okText={intl.get('scec.common.action.sure').d('确定')}
            cancelText={intl.get('scec.common.action.cancel').d('取消')}
            onConfirm={() => this.fetchGoodsScrapped()}
          >
            <Button icon="close" loading={scrappedLoading} disabled={!productId}>
              {intl.get('scec.common.button.scrapped').d('作废')}
            </Button>
          </Popconfirm>
          <Button icon="eye-o" disabled={!productId} onClick={this.goodPreview}>
            {intl.get('scec.common.button.previewGoods').d('商品预览')}
          </Button>
          <Button icon="clock-circle-o" onClick={() => this.controlOperate()} disabled={!productId}>
            {intl.get('scec.common.button.operating').d('操作记录')}
          </Button>
        </Header>
        <Content>
          <Spin
            spinning={productId ? fetchLoading : false}
            wrapperClassName={classnames('ued-detail-wrapper')}
          >
            <Collapse
              className="form-collapse"
              collapseKeys={collapseKeys}
              onChange={(arr) => this.onCollapseChange(arr, 'baseInfo')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get('scec.common.view.baseInfo').d('基本信息')}</h3>
                    <a>
                      {collapseKeys.includes('baseInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="baseInfo"
              >
                <BaseInfo
                  code={code}
                  detail={detail}
                  productId={this.state.productId}
                  isShowTax={isShowTax}
                  isShowPrice={isShowPrice}
                  onShowPrice={this.isShowPrice}
                  catalogueList={catalogueList}
                  catalogueSecondList={catalogueSecondList}
                  visible={priceModalVisible}
                  ladderPriceRowSelection={ladderPriceRowSelection}
                  ladderPriceSelectedRows={ladderPriceSelectedRows}
                  ladderPriceSelectedRowKeys={ladderPriceSelectedRowKeys}
                  fetchLadderPriceLoading={fetchLadderPriceLoading}
                  saveLadderPriceLoading={saveLadderPriceLoading}
                  ladderPriceData={ladderPriceData}
                  cateList={catalogueList}
                  onRef={this.handleRef}
                  onGetTaxCate={this.handleGetTaxCate}
                  onGetAreaClick={this.handleGetAreaClick}
                  onFetchCatelog={this.fetchCatalogue}
                  onFetchChildCatelog={this.fetchChildCatalogue}
                  onChangeUom={this.changeUom}
                  onChangeCurrency={this.changeCurrency}
                  onShowTax={this.isShowTax}
                  onCleanSupplier={this.cleanSupplier}
                  viewLadderPrice={this.viewLadderPriceModal}
                  hideModal={this.hideLadderPriceModal}
                  onDeleteLadderLines={this.deleteLadderPrice}
                  onCreateLadderLine={this.createLadderLine}
                  onSaveLadderLine={this.saveLadderPrice}
                  onChangeLadderTableData={this.changeLadderPriceTableData}
                  fetchCompanyCurrency={this.fetchCompanyCurrency}
                />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get('scec.common.view.goodsPhoto').d('商品图片')}</h3>
                    <a>
                      {collapseKeys.includes('goodsPhoto')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('goodsPhoto') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="goodsPhoto"
              >
                {sourceFromType === 'SHARE' ? (
                  productImageList.map((item) => (
                    <img src={item.imagePath} key={item.productImageId} alt={item.position} />
                  ))
                ) : (
                  <Photoes
                    detail={detail}
                    currentProImage={currentProImage}
                    onDeletePhotoes={this.deletePhotoes}
                    onFetchGetPhotoInfo={this.fetchGetPhotoInfo}
                    onHandlePhotoPrimary={this.handlePhotoPrimary}
                    onGetPrimaryPhoto={this.getPrimaryPhoto}
                  />
                )}
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get('scec.common.view.goodsIntroduction').d('商品介绍')}</h3>
                    <a>
                      {collapseKeys.includes('goodsIntroduction')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('goodsIntroduction') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="goodsIntroduction"
              >
                <Form>
                  <Form.Item>
                    {getFieldDecorator('introduction', {
                      initialValue: introduction,
                    })(
                      sourceFromType === 'SHARE' ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: introduction,
                          }}
                        />
                      ) : (
                        <StaticTextEditor {...staticTextProps} />
                      )
                    )}
                  </Form.Item>
                </Form>
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get('scec.common.view.specifications').d('规格参数')}</h3>
                    <a>
                      {collapseKeys.includes('specifications')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('specifications') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="specifications"
              >
                {sourceFromType === 'SHARE' ? (
                  isEmpty(attributeDetails) ? (
                    detail &&
                    detail.productDetail && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: detail.productDetail.specificationsParam,
                        }}
                      />
                    )
                  ) : (
                    <Table
                      bordered
                      columns={attrColumns}
                      dataSource={attributeDetails}
                      rowKey="productId"
                      pagination={false}
                    />
                  )
                ) : (
                  <React.Fragment>
                    <div className="table-operation">
                      <ExcelExport
                        requestUrl={`${SRM_SCEC}/v1/${tenantId}/export-products-attribute/${productId}`}
                        otherButtonProps={{ icon: '' }}
                      />
                      <Button onClick={this.handleImport}>
                        {intl.get('hzero.common.button.import').d('导入')}
                      </Button>
                      <Button
                        onClick={this.handleDeleteLine}
                        disabled={!attrSelectedRows.length > 0}
                      >
                        {intl.get('hzero.common.button.delete').d('删除')}
                      </Button>
                      <Button
                        onClick={() => this.handleAddLine('down')}
                        disabled={isEmpty(attrRecord)}
                      >
                        {intl.get('scec.common.button.upCreate').d('下方添加一行')}
                      </Button>
                      <Button
                        onClick={() => this.handleAddLine('up')}
                        disabled={isEmpty(attrRecord)}
                      >
                        {intl.get('scec.common.button.downCreate').d('上方添加一行')}
                      </Button>
                      <Button type="primary" icon="plus" onClick={this.handleAddLine}>
                        {intl.get('hzero.common.button.create').d('新建')}
                      </Button>
                    </div>
                    <EditTable
                      bordered
                      rowKey="productId"
                      loading={deleteAttrLoading}
                      columns={columns}
                      rowSelection={attrRowSelection}
                      dataSource={attributeDetails}
                      pagination={false}
                      onRow={(record) => this.onRow(record)}
                      rowClassName={(record) => this.onRowClass(record)}
                    />
                  </React.Fragment>
                )}
              </Panel>
            </Collapse>
          </Spin>
        </Content>
        {this.state.modalVisible && (
          <OperateRecord
            productId={productId}
            modalVisible={this.state.modalVisible}
            onHandleOk={this.controlOperate}
          />
        )}
      </React.Fragment>
    );
  }
}
