/**
 * 商品发布采
 * @date: 2020-12-17
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Fragment, Component } from 'react';
import qs from 'querystring';
import { observable } from 'mobx';
import { Observer } from 'mobx-react';
import { isNumber } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import { DataSet, Button, Icon } from 'choerodon-ui/pro';
import uuidv4 from 'uuid/v4';

import intl from 'utils/intl';
import notification from 'utils/notification';
import remoteFunc from 'hzero-front/lib/utils/remote';
import { closeTab } from 'utils/menuTab';
import { Content, Header } from 'components/Page';
import {
  getResponse,
  filterNullValueObject,
  generateUrlWithGetParam,
  getUserOrganizationId,
  getCurrentOrganizationId,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { isCustomNumber } from '@/utils/precision';
import Info from './Info';
import SkuInfo from './SkuInfo';
import BaseInfo from './BaseInfo';
import { formDs, tableDs, saleInfoDs } from './ds.js';
import { getAttrFields, contactAttrs, setAttrFields, splitAttrs } from './reverseAttrField';
import {
  save,
  submit,
  fetchInfo,
  fetchInfoNew,
  fetchInfoReject,
  fetchInfoLastVersion,
  fetchInfoWorkflowApprove,
  fetchTypeSpecs,
  fetchAttrValues,
  getPermission,
  getSupplier,
  submitReceiveSku,
  fetchSaleAttrCheck,
  fetchReceiveToItem,
  fetchUseOldReceive,
  fetchItemSkuInfo,
  getSkuInfoValidation,
} from './api';
import { getSkuAttrConfig } from '../SkuWorkbench/api';
import customStore from './customStore';

import styles from './index.less';

const userOrganizationId = getUserOrganizationId();
const organizationId = getCurrentOrganizationId();
const skuEditCode = customStore.getAllCustomCode();

const WrapperContent = (props) => {
  const { id, title, children, topInvide, style = {} } = props;
  return (
    <>
      {topInvide && <div className="content-top-invide" />}
      <div className="content-wrapper" style={style}>
        <div className="content-head" id={id}>
          {title}
        </div>
        {children}
      </div>
    </>
  );
};

@remoteFunc(
  // 【德康】商品变更信息 - 提交 填写原因
  // 【永祥】供应商价格信息新增按钮 - 隐藏 mall-6759
  // 【诺斯贝尔】, 自有商品新建时，平台分类为【2023121400001-包装材料】时， 添加默认规格属性 mall-8749
  {
    code: 'SKU_CREATE',
    name: 'remote',
  },
  // 默认Expose属性，当没有二开Expose时会走此逻辑
  {
    events: {
      // 德康商品变更信息 - 提交 填写原因
      saveOrSubmitValidateInfo({ func }) {
        func();
      },
    },
  }
)
@withCustomize({ unitCode: skuEditCode })
@formatterCollections({
  code: [
    'smpc.productPublish',
    'smpc.product',
    'smpc.workbench',
    'sagm.common',
    'small.common',
    'smpc.common',
    'sstk.stockReportWorkbench',
  ],
})
export default class SkuCreate extends Component {
  croperModal;

  formDs;

  tableDs;

  headerLoadingGroup = observable.map({ saveLoading: false, submitLoading: false });

  constructor(props) {
    super(props);
    const {
      location: { pathname, state },
    } = props;
    // 区分商品池
    const isSup = pathname.includes('-sup');
    const prefixPath = pathname.split('/create')[0];
    const { composeSkuData } = state || {}; // 套餐商品数据
    const { spuId, req, skuTemporaryId } = this.getLocationSearchParams();
    customStore.setState('req', req);
    customStore.setState('isReceive', req === 'receive');
    this.initCustomStore(props);
    let title;
    if (spuId && isSup) {
      title = intl.get('smpc.product.view.skuEditSup').d('编辑商品（供）');
    } else if (spuId && !isSup) {
      title = intl.get('smpc.product.view.skuEditPur').d('编辑商品（采）');
    } else if (!spuId && isSup) {
      title = intl.get('smpc.product.view.skuCreateSup').d('新建商品（供）');
    } else {
      title = intl.get('smpc.product.view.skuCreatePur').d('新建商品（采）');
    }
    this.state = {
      isSup,
      title,
      req,
      spuId,
      rmb: null,
      spuStatus: 0,
      prefixPath,
      skuTemporaryId,
      specsData: [],
      dataError: !!spuId,
      approveType: [],
      approveField: [],
      spuAttrList: [],
      spuAttrExtendList: [],
      supplierTenantId: undefined,

      isPoint: false,
      isSaleLine: false,
      attrFlag: false,
      receiveToItem: false, // 领用商品自动生成物料
      oldReceive: false, // 旧领用库存租户
      requireSkuInfos: [], // skuInfo 字段必输控制
    };
    this.updateBySpuId(spuId, isSup, composeSkuData);
  }

  // 主要是供应商/采购方
  initCustomStore = (props) => {
    const {
      location: { pathname },
      custConfig,
      customizeForm,
      customizeTable,
      getHocInstance,
    } = props;
    const isSup = pathname.includes('-sup');
    customStore.setCustConfig(custConfig);
    customStore.setCustFuncs({ customizeForm, customizeTable, getHocInstance });
    customStore.setCustomCode(isSup);
  };

  @Bind
  updateBySpuId(spuId, isSup, composeSkuData) {
    if (!spuId) {
      if (composeSkuData) {
        this.initData(composeSkuData);
        return false;
      }
      const { remote } = this.props;
      const isReceive = customStore.getState('isReceive');
      const formDsConfig = formDs({ baseInfoFlag: false, isSup, isReceive });
      this.formDs = new DataSet(
        remote
          ? remote.process('SKU_CREATE_PROCESS_FORM_DS', formDsConfig, { remoteThis: this })
          : formDsConfig
      );
      this.tableDs = new DataSet(tableDs({ isSup }));
      this.formDs.create({});
      this.tableDs.create(
        {
          purSkuStatus: 5,
          purSkuStatusMeaning: intl.get('smpc.product.view.create').d('新建'),
          skuImageList: [],
          spuAttrList: [],
          spuAttrExtendList: [],
          _uniqId: uuidv4(),
          afterSale: {
            returnDuration: 7,
            changeDuration: 15,
            qualityDuration: undefined,
            instruction: undefined,
            returnSpecial: 2,
            changeSpecial: isReceive ? 1 : 2, // 领用仅可退货不支持换货
            afterSaleSpecial: 0,
          },
        },
        0
      );
    }
  }

  async componentDidMount() {
    const { isSup } = this.state;
    const isReceive = customStore.getState('isReceive');
    const { req, spuId, itemId } = this.getLocationSearchParams();
    this.fetchAttrConfig();
    // 查询配置表， spu是否必须维护销售属性
    this.saleAttrCheck();
    // 领用库存相关配置
    if (isReceive) {
      await this.getReceiveStockConfig();
    }
    // 领用引用物料创建商品
    if (isReceive && !spuId && itemId) {
      this.initReceiveData(itemId);
    }
    if (spuId) {
      this.fetchInfo({
        req,
        spuId,
      });
    }
    if (isSup && !spuId) {
      this.fetchPermission();
      this.fetchSupplier();
    }
  }

  saleAttrCheck = async () => {
    const res = getResponse(await fetchSaleAttrCheck()) || false;
    this.spuSaleAttrNecessary = res;
  };

  getReceiveStockConfig = async () => {
    const { spuId } = this.state;
    const isReceive = customStore.getState('isReceive');
    const res1 = getResponse(await fetchReceiveToItem());
    const res2 = getResponse(await fetchUseOldReceive());
    // 旧领用租户，且不自动生产物料， 物料必填
    const receiveItemRequired = isReceive && !res2 && !res1;
    this.setState({ receiveToItem: res1, oldReceive: res2 });
    // 编辑时还没new ds, 分开处理
    if (!spuId) {
      this.tableDs.getField('itemLov').set('required', receiveItemRequired);
    }
  };

  fetchAttrConfig = async () => {
    const res = getResponse(await getSkuAttrConfig());
    if (res) this.setState({ attrFlag: res });
  };

  fetchSupplier = async () => {
    const res = getResponse(await getSupplier());
    if (res) {
      const { supplierId, supplierName, supplierTenantId } = res;
      if (this.formDs.current) {
        this.formDs.current.set('supplierLov', {
          supplierId,
          supplierName,
          supplierCompanyId: supplierId,
          supplierCompanyName: supplierName,
          supplierTenantId,
        });
        this.setState({ supplierTenantId });
      }
    }
  };

  componentWillReceiveProps(nextProps) {
    const { spuId: prevSpuId, req: prevReq } = this.state;
    const { spuId: nextSpuId, req: nextReq } = this.getLocationSearchParams(nextProps);
    customStore.setState('req', nextReq);
    customStore.setState('isReceive', nextReq === 'receive');
    this.initCustomStore(nextProps);
    if (prevSpuId !== nextSpuId || prevReq !== nextReq) {
      this.updateBySpuId();
      this.setState({ spuId: nextSpuId, req: nextReq });
      if (nextSpuId) {
        this.fetchInfo({ spuId: nextSpuId, req: nextReq });
      }
    }
  }

  getLocationSearchParams(props) {
    const _props = props || this.props;
    return qs.parse(_props.location.search.substr(1)) || {};
  }

  // 获得属性
  @Bind()
  async getAttrs(categoryId) {
    if (categoryId) {
      const result = getResponse(await fetchTypeSpecs({ categoryId }));
      this.getRmb(result, categoryId);
      if (result) {
        this.setState({ categoryId, specsData: result || [] });
      }
    } else {
      this.setState({ categoryId });
    }
  }

  @Bind()
  updateFieldRequired() {
    this.fetchValidation();
  }

  fetchValidation = async () => {
    const { companyId, supplierCompanyId, catalogId } = this.formDs?.current?.get([
      'companyId',
      'supplierCompanyId',
      'catalogId',
    ]);
    const params = {
      companyId,
      supplierCompanyId,
      catalogId,
    };
    const res = getResponse(await getSkuInfoValidation(filterNullValueObject(params)));
    if (res) {
      this.setState({ requireSkuInfos: res });
    }
  };

  // 获取人民币
  @Bind()
  async getRmb(attrs, categoryId) {
    if (attrs) {
      const attr = attrs.find((f) => f.attributeCode === '000000000009');
      if (attr) {
        const result = getResponse(
          await fetchAttrValues({
            attrId: attr.attrId,
            categoryId,
            enabledFlag: 1,
            page: 0,
            size: 10,
            attrValueCode: '000000000015',
          })
        );
        if (result) {
          const rmb = (result.content || [])[0] || {};
          const attrType = attr.baseAttrFlag ? 2 : 3;
          const currency = { ...attr, ...rmb, attrType, customAttrId: attr.attrId };
          this.setState({ rmb: currency });
          this.tableDs.forEach((record) => {
            const { skuAttrList } = record.toData();
            const ind = (skuAttrList || []).findIndex((m) => m.attributeCode === '000000000009');
            if (ind === -1) {
              const newSkuAttrList = [...(skuAttrList || []), { attrType, ...currency }];
              record.init('skuAttrList', newSkuAttrList);
            } else {
              const hasAttr = skuAttrList[ind];
              if (!hasAttr.attrValueCode) {
                skuAttrList[ind] = { attrType, ...hasAttr, ...currency };
                record.init('skuAttrList', skuAttrList);
              }
            }
          });
        }
      }
    }
  }

  @Bind()
  async initReceiveData(itemId) {
    const res = await fetchItemSkuInfo(itemId);
    if (getResponse(res)) {
      const {
        splitSkuName,
        itemModel,
        itemBrand,
        itemUomId,
        itemUomCode,
        itemUomName,
        itemUomPrecision,
        agreementTaxedPrice,
        agreementPrice,
        ...others
      } = res;
      const initSaleInfoDs = new DataSet(saleInfoDs());
      initSaleInfoDs.create(); // 获取价格信息默认值（未点击价格信息直接提交）
      const sku = {
        skuName: splitSkuName,
        itemUomId,
        model: itemModel,
        brandName: itemBrand,
        skuSalesInfos: [
          {
            uomId: itemUomId,
            uomName: `${itemUomCode}/${itemUomName}`,
            uomPrecision: itemUomPrecision,
            agreementTaxedPrice,
            agreementPrice,
            ...initSaleInfoDs.current.toData(),
            ...others,
          },
        ],
        skuImageList: (res.imageUrls || []).map((m, idx) => ({
          orderSeq: idx + 1,
          mediaPath: m,
          mediaType: 0,
          primaryFlag: idx === 0 ? 1 : 0,
          _imgUniqKey: uuidv4(),
        })),
        ...others,
      };
      this.formDs.current.set(res);
      // 不覆盖初始字段
      this.tableDs.forEach((r) => {
        r.set(sku);
      });
    }
  }

  // 查询
  @Bind()
  async fetchInfo(params = {}) {
    const { spuId, req } = params;
    const { skuTemporaryId } = this.state;
    const customizeUnitCode = skuEditCode.join(',');
    this.toggleLoading('loading');
    let api = fetchInfo;
    switch (req) {
      // 查询最新信息
      case 'new':
        api = fetchInfoNew;
        break;
      // 查询审批拒绝信息
      case 'reject':
        api = fetchInfoReject;
        break;
      // 已上架商品查看上次版本信息
      case 'lastVersion':
        api = fetchInfoLastVersion;
        break;
      // 工作流审批中
      case 'workflowApprove':
        api = fetchInfoWorkflowApprove;
        break;
      default:
        break;
    }
    const result = getResponse(await api({ spuId, skuTemporaryId, customizeUnitCode }));
    this.initData(result);
    this.toggleLoading('loading');
  }

  // 新建查询权限
  @Bind
  async fetchPermission() {
    const result = getResponse(await getPermission());
    if (result) {
      const { approveType } = result;
      const types = approveType || [];
      if (types.includes('SALE_INFO')) {
        this.setState({ approveType: ['SALE_INFO'] });
      }
    }
  }

  /**
   * 给销售属性|属性值增加一个统一的id// customAttrId,customAttrValueId
   *自定义的属性值，接口数据没有返回id字段，前端要构造下拉数据，需要自己构造id
   */
  initSpecAttr = (spuAttrList, spuAttrExtendList) => {
    const spuAttrs = spuAttrList?.map((m) => ({
      ...m,
      customAttrId: m.attrId,
      customAttrValueId: m.attrValueId || uuidv4(),
    }));
    const customAttrMap = {};
    const spuExtendAttrs = spuAttrExtendList?.map((m) => {
      const initCustomAttrId = uuidv4();
      const customAttrId = customAttrMap[m.attrName];
      if (!customAttrId) customAttrMap[m.attrName] = initCustomAttrId;
      return { ...m, customAttrId: customAttrId || initCustomAttrId, customAttrValueId: uuidv4() };
    });
    return [spuAttrs, spuExtendAttrs];
  };

  // 初始化
  @Bind()
  async initData(result) {
    if (result) {
      const {
        skuList,
        spuStatus,
        approveType,
        approveField,
        spuAttrList,
        versionCode,
        spuAttrExtendList,
        ...baseInfo
      } = result;
      const { categoryId, primaryImagePath, largePrimaryImagePath, supplierTenantId } = baseInfo;
      const specsData = categoryId ? getResponse(await fetchTypeSpecs({ categoryId })) || [] : [];
      const [spuAttrs, spuExtendAttrs] = this.initSpecAttr(spuAttrList, spuAttrExtendList);
      this.getRmb(specsData, categoryId);
      const skus = this.getSkuList(skuList, spuAttrs, spuExtendAttrs);
      this.dsInit(
        { ...result, spuAttrList: spuAttrs, spuAttrExtendList: spuExtendAttrs },
        skus,
        approveType || [],
        approveField || []
      );
      this.setState({
        spuStatus,
        specsData,
        categoryId,
        spuAttrList,
        versionCode, // WAITING_CODE || REJECT_CODE 可切换到原版本
        spuAttrExtendList,
        dataError: false,
        primaryImagePath: largePrimaryImagePath || primaryImagePath,
        supplierTenantId,
        approveType: approveType || [],
        approveField: approveField || [],
      });
    }
  }

  // dataSet初始化
  @Bind()
  dsInit(params = {}, list = [], approveType, approveField) {
    const { remote } = this.props;
    const { isSup, oldReceive, receiveToItem } = this.state;
    const isReceive = customStore.getState('isReceive');
    const receiveItemRequired = isReceive && !oldReceive && !receiveToItem;
    const { primaryImagePath, largePrimaryImagePath, catalogEdit } = params;
    const baseInfoFlag = approveType.includes('BASE_INFO');
    const skuInfoFlag = approveType.includes('SKU_INFO');
    const formDsConfig = formDs({ baseInfoFlag, isSup, catalogDisabled: catalogEdit === false });
    // catalogEdit: 后端德康二开返回字段， 控制商品更新时目录是否可编辑
    this.formDs = new DataSet(
      remote
        ? remote.process('SKU_CREATE_PROCESS_FORM_DS', formDsConfig, { remoteThis: this })
        : formDsConfig
    );
    this.tableDs = new DataSet(tableDs({ isSup, skuInfoFlag, approveField }));
    this.tableDs.getField('itemLov').set('required', receiveItemRequired);
    this.tableDs.setState('primaryImagePath', largePrimaryImagePath || primaryImagePath);
    // 头上的采购员字段从行上获取
    const { purchaseAgentId, purchaseAgentName } = list[0] || {};
    this.formDs.loadData([{ ...params, purchaseAgentId, purchaseAgentName }]);
    if (remote) {
      remote.event.fireEvent('afterDsInit', { remoteThis: this });
    }
    // 设置字段必输标志
    this.updateFieldRequired();

    const skuData = list.map((m) => {
      return {
        ...m,
        _uniqId: uuidv4(),
        // 处理历史数据（未刷数据， 售后为空）
        afterSale: m.afterSale || {
          returnDuration: 7,
          changeDuration: 15,
          qualityDuration: undefined,
          instruction: undefined,
          returnSpecial: 2,
          changeSpecial: isReceive ? 1 : 2, // 领用仅可退货不支持换货
          afterSaleSpecial: 0,
        },
      };
    });
    this.tableDs.loadData(skuData);
    this.tableDs.forEach((f) => {
      Object.assign(f, { selectable: false });
    });
  }

  /**
   * 初始化销售属性值
   * 1. 处理skuAttrList、skuAttrExtendList 自定义id
   * 2. 构建动态列
   * 3. 给 record 添加 skuSpecsList字段，（sku所有自定义销售属性，都加了自定义id）
   * @param {skuList - 接口返回} list
   * @param {处理了自定义id} spuAttrList
   * @param { 处理了自定义id } spuAttrExtendList
   */
  getSkuList = (list = [], spuAttrList, spuAttrExtendList) => {
    // spu 维护的 所有销售属性
    const attrs = contactAttrs(spuAttrList, spuAttrExtendList);

    const equalAttrValue = (spuAttr, skuAttr) => {
      const { attrId, attrValueId } = getAttrFields(spuAttr);
      const { attrId: skuAttrId, attrValueId: skuAttrValueId } = getAttrFields(skuAttr);
      return attrId === skuAttrId && attrValueId === skuAttrValueId;
    };

    const getSkuAttrs = (skuAttrs) => {
      return skuAttrs?.map((m) => {
        // 在spu维护的所有销售属性 上 找到 sku 对应的 销售属性
        const { customAttrId, customAttrValueId, ...otherSpuAttr } =
          attrs.find((f) => equalAttrValue(f, m)) || {};
        return { ...otherSpuAttr, ...m, customAttrId, customAttrValueId };
      });
    };

    return list?.map((m) => {
      const { skuAttrList, skuAttrExtendList } = m;
      const item = { ...m };
      // 给 sku 属性 加上 customAttrId 、customAttrValueId
      const skuAttrs = getSkuAttrs(skuAttrList);
      const skuExtendAttrs = getSkuAttrs(skuAttrExtendList);
      const allSkuAttrs = contactAttrs(skuAttrs, skuExtendAttrs);
      // 该 sku 维护的 所有销售属性
      const skuSpecsList = [];
      attrs.forEach((f) => {
        const find = allSkuAttrs.find((_f) => equalAttrValue(f, _f)) || {};
        const {
          attrValueId,
          attrValueName,
          attrValueCode,
          customAttrId,
          customAttrValueId,
        } = getAttrFields(find);
        // 构建动态列 列名 和数据
        if (!item[`spec_${customAttrId}`] && attrValueId) {
          item[`spec_${customAttrId}`] = {
            attrValueId,
            attrValueCode,
            attrValueName,
            customAttrId,
            customAttrValueId,
          };
          skuSpecsList.push(getAttrFields(find));
        }
      });
      return {
        ...item,
        skuSpecsList,
        skuAttrList: skuAttrs,
        skuAttrExtendList: skuExtendAttrs,
      };
    });
  };

  @Bind()
  updateState(params = {}) {
    this.setState(params);
  }

  @Bind()
  beforeSave(isSubmit = false) {
    // 立即loading
    return new Promise((r) => {
      const {
        remote: { event },
      } = this.props;
      const { spuStatus, spuId, isSup } = this.state;
      const loadingKey = isSubmit ? 'saveLoading' : 'submitLoading';
      this.headerLoadingGroup.set(loadingKey, true);
      const fn = isSubmit ? this.handleSubmit : this.handleSave;
      event.fireEvent('saveOrSubmitValidateInfo', {
        spuStatus,
        spuId,
        isSup,
        isSubmit,
        func: (cuxParams) => this.validateInfo(fn, loadingKey, cuxParams, r),
      });
    });
  }

  toggleLoading = (loadingKey, value) => {
    if (typeof value === 'boolean') {
      this.setState({ [loadingKey]: value });
    } else {
      this.setState({ [loadingKey]: !this.state[loadingKey] });
    }
  };

  /**
   * 保存/提交
   */
  @Throttle(1000)
  @Bind()
  async validateInfo(callBack = () => {}, loadingKey, cuxParams = {}, r) {
    // 弹窗取消
    if (!cuxParams) {
      r();
      return;
    }
    const isReceive = customStore.getState('isReceive');
    const baseInfoFlag = await this.formDs.validate();
    const listFlag = await this.tableDs.validate();
    if (!baseInfoFlag || !listFlag) {
      this.headerLoadingGroup.set(loadingKey, false);
      r();
      return false;
    }
    const baseRecord = this.formDs.current;
    if (baseRecord.dirty) baseRecord.set('updateFlag', 1);
    const baseInfo = baseRecord.toJSONData();
    const skuList = this.tableDs.records.map((m) => {
      if (m.dirty) m.set('updateFlag', 1);
      const skuSalesInfos = m.get('skuSalesInfos') || [];
      let _skuSalesInfos = [];
      if (skuSalesInfos.length !== 0) {
        _skuSalesInfos = skuSalesInfos.map((s) => {
          const freeShippingFlag = s.shippingRuleId === -1 ? 1 : 0;
          return {
            ...s,
            freeShippingFlag,
          };
        });
        m.set('skuSalesInfos', _skuSalesInfos);
      }
      return m.toJSONData();
    });
    let flag = true;
    const { catalogId, updateFlag, spuAttrList = [], spuAttrExtendList = [] } = baseInfo;
    skuList.forEach((sku) => {
      const { spuValueIds } = sku;
      if (spuValueIds && skuList.filter((s) => s.spuValueIds === spuValueIds).length > 1) {
        notification.warning({
          message: intl
            .get('smpc.productPublish.view.spuAttrRepeat')
            .d(`不允许两个SKU属性值完全重复`),
        });
        flag = false;
        // return false;
      }
    });
    // spu 多sku销售属性必填校验
    if (flag && this.spuSaleAttrNecessary) {
      if (skuList.length > 1 && !spuAttrList.concat(spuAttrExtendList).length) {
        notification.warning({
          message: intl
            .get('smpc.productPublish.view.spuSaleAttrNecessary')
            .d(`该商品组下有多个商品，请配置销售规格`),
        });
        flag = false;
      }
    }
    if (!flag) {
      this.headerLoadingGroup.set(loadingKey, false);
      r();
      return false;
    }
    const receiveParam = isReceive
      ? {
          sourceFrom: 'CATA',
          sourceFromType: 'MANUAL',
          receiveFlag: 1,
        }
      : {};
    // 处理商品数据：图片、属性
    const newSkuList = skuList.map((m) => {
      const { skuSpecsList = [], ...other } = m;
      const resetSpec = {};
      skuSpecsList.forEach((f) => {
        const specName = `spec_${f.customAttrId}`;
        resetSpec[specName] = undefined;
      });
      const skuImageList = this.handleSkuImgGet(m.skuImageList || [], baseInfo);
      const [skuAttrList, skuAttrExtendList] = this.handleSkuAttrsGet(m);
      return {
        ...other,
        receiveStockOperates: m.receiveStockOperates?.filter((f) => !f.stockId), // 新建数据
        ...cuxParams,
        ...resetSpec,
        skuImageList,
        skuAttrList: skuAttrList?.map((attr) => ({
          ...setAttrFields(attr),
          customAttrId: undefined,
          customAttrValueId: undefined,
        })),
        skuAttrExtendList: skuAttrExtendList?.map((attr) => ({
          ...attr,
          customAttrId: undefined,
          customAttrValueId: undefined,
        })),
        catalogId,
        totalStock: isCustomNumber(m.totalStock) ? m.totalStock : m.skuStock,
        updateFlag: updateFlag || m.updateFlag,
        ...receiveParam,
        saleAgreementHeaderIdList: m.saleAgreementHeaderIdList.map((i) => i.agreementHeaderId),
        purchaseAgentId: baseRecord.get('purchaseAgentId'), // 单独拿采购员
      };
    });
    const data = {
      ...baseInfo,
      primaryImagePath: baseInfo.largePrimaryImagePath || baseInfo.primaryImagePath,
      skuList: newSkuList,
      tenantId: organizationId,
      spuAttrList: baseInfo.spuAttrList?.map((m) => ({
        ...m,
        customAttrId: undefined,
        customAttrValueId: undefined,
      })),
      spuAttrExtendList: baseInfo.spuAttrExtendList?.map((m) => ({
        ...m,
        customAttrId: undefined,
        customAttrValueId: undefined,
      })),
    };
    const { remote } = this.props;
    const cuxFlag = await remote.process('SKU_CREATE_VALIDATE_PROCESS', true, {
      data,
      cuxParams,
      remoteThis: this,
    });
    if (!cuxFlag) {
      r();
      return;
    }
    callBack(data, r);
  }

  handleSortImgs = (list) => {
    list.sort((next, current) => {
      const nOrder = next.orderSeq;
      const cOrder = current.orderSeq;
      if (!isNumber(nOrder) && !isNumber(cOrder)) {
        return 0;
      } else if (!isNumber(nOrder)) return 1;
      else if (!isNumber(cOrder)) return -1;
      else return nOrder - cOrder;
    });
  };

  // 图片处理
  handleSkuImgGet = (list, baseInfo) => {
    const { primaryImagePath: initPrimaryPath } = this.state;
    const {
      primaryImagePath,
      primaryVideoPath,
      largePrimaryImagePath,
      primaryThumbnailImagePath,
    } = baseInfo;

    // mediaType: 0 图片, 1 视频, 2 url
    // 过滤掉初始主图，排序，并且将其他图片primaryFlag置为0;
    const filterFn = (f, mediaType) =>
      (f.largeImagePath || f.mediaPath) !== initPrimaryPath && f.mediaType === mediaType;
    const uploadList = list.filter((f) => filterFn(f, 0));
    this.handleSortImgs(uploadList);
    const urlList = list.filter((f) => filterFn(f, 2));
    this.handleSortImgs(urlList);
    const videoList = list.filter((f) => filterFn(f, 1));

    let skuImageList = [...uploadList, ...urlList, ...videoList].map((m) => ({
      ...m,
      mediaPath: m.largeImagePath || m.mediaPath,
      primaryFlag: 0, // 非主图
    }));

    if (primaryImagePath) {
      const isChange = initPrimaryPath !== (largePrimaryImagePath || primaryImagePath);
      skuImageList.push({
        mediaType: 0,
        mediaPath: isChange ? primaryImagePath : largePrimaryImagePath || primaryImagePath,
        thumbnailPath: primaryThumbnailImagePath || primaryImagePath || largePrimaryImagePath,
        primaryFlag: 1,
      });
    }
    // 主图不存在，则将其第一张图片设为sku主图，记得过滤视频
    if (!primaryImagePath) {
      const imgIndex = skuImageList.findIndex((f) => f.mediaType !== 1);
      if (imgIndex !== -1) {
        skuImageList[imgIndex].primaryFlag = 1;
      }
    }
    // 视频存在，同时图片不存在初始视频 视频只会存在一个
    const isVideo = skuImageList.find((f) => f.mediaType === 1);
    if (!isVideo && primaryVideoPath) {
      skuImageList.push({ mediaType: 1, mediaPath: primaryVideoPath, primaryFlag: 0 });
    }
    if (isVideo && isVideo.mediaPath !== primaryVideoPath) {
      skuImageList = skuImageList.filter((f) => f.mediaType !== 1); // 筛选掉旧有视频
      if (primaryVideoPath) {
        skuImageList.push({ mediaType: 1, mediaPath: primaryVideoPath, primaryFlag: 0 });
      }
    }
    return skuImageList;
  };

  // 属性处理
  handleSkuAttrsGet = (sku) => {
    const { skuAttrList, skuAttrExtendList, skuSpecsList } = sku;
    const attrs = skuAttrList || [];
    const extendAttrs = skuAttrExtendList || [];
    // 销售属性[自有，扩展]
    const [specs, extendSpecs] = splitAttrs((skuSpecsList || []).map((m) => setAttrFields(m)));
    // 将spu销售规格分配至sku销售属性上（有替换、无追加
    // sku上属性过滤掉销售属性 （既可为销售或基础的属性， 其为基础属性时，无customAttrId， 增加过滤条件）
    const notSpuAttrs = attrs.filter(
      (f) =>
        !specs.some((s) => s.customAttrId === f.customAttrId || s.attributeCode === f.attributeCode)
    );
    const notSpuExtendAttrs = extendAttrs.filter(
      (f) => !extendSpecs.some((s) => s.customAttrId === f.customAttrId)
    );
    return [
      [...notSpuAttrs, ...specs],
      [...notSpuExtendAttrs, ...extendSpecs],
    ];
  };

  @Bind()
  async handleSave(params, r) {
    const { req, prefixPath } = this.state;
    const currentPath = `${prefixPath}/create`;
    const result = getResponse(await save(params));
    this.headerLoadingGroup.set('submitLoading', false);
    if (result) {
      r();
      notification.success();
      this.props.history.push(
        generateUrlWithGetParam(
          currentPath,
          filterNullValueObject({
            req,
            spuId: result,
          })
        )
      );
      this.fetchInfo({
        req,
        spuId: result,
      });
    }
    r();
  }

  @Bind()
  async handleSubmit(params, r) {
    const { prefixPath } = this.state;
    const isReceive = customStore.getState('isReceive');
    const { backPath, submitBack } = this.getLocationSearchParams();
    const defaultBackPath = `${prefixPath}/list`;
    const submitApi = isReceive ? submitReceiveSku : submit;
    const result = getResponse(await submitApi(params));
    // 加个1s,为了后端价格生成
    setTimeout(() => {
      this.headerLoadingGroup.set('saveLoading', false);
      if (result) {
        r();
        notification.success();
        if (submitBack !== 'y') {
          this.props.history.push({
            pathname: defaultBackPath,
            search: qs.stringify(
              filterNullValueObject({
                tabKey: isReceive ? 'allReceive' : '',
              })
            ),
          });
        } else {
          this.props.history.push(backPath || defaultBackPath);
          closeTab(prefixPath);
        }
      }
      r();
    }, 1000);
  }

  handleSupplierChange = (item) => {
    const { supplierTenantId } = item || {};
    this.setState({ supplierTenantId });
  };

  shiftToOldVersion = () => {
    const {
      location: { pathname },
    } = this.props;
    const { spuId } = this.state;
    const { lastVersion } = this.getLocationSearchParams();
    this.props.history.push({
      pathname,
      search: qs.stringify(
        filterNullValueObject({
          spuId,
          req: lastVersion === 'y' ? 'lastVersion' : null,
        })
      ),
    });
  };

  render() {
    const {
      rmb,
      req,
      isSup,
      spuId,
      title,
      loading,
      attrFlag,
      spuStatus,
      dataError,
      specsData,
      prefixPath,
      categoryId,
      versionCode,
      spuAttrList,
      approveType,
      approveField,
      primaryImagePath,
      receiveToItem,
      oldReceive,
      spuAttrExtendList,
      supplierTenantId,
      requireSkuInfos,
    } = this.state;
    const { backPath } = this.getLocationSearchParams();
    const defaultBackPath = `${prefixPath}/list`;
    const authEdit = approveType.includes('NONE');
    const canShiftOldVersion = ['WAITING_CODE', 'REJECT_CODE'].includes(versionCode);
    const notEdit = !categoryId || loading || authEdit;
    const {
      match: { path = '' },
      location,
    } = this.props;
    const isReceive = customStore.getState('isReceive');
    return (
      <Fragment>
        <Header backPath={backPath || defaultBackPath} title={title}>
          <Observer>
            {() => (
              <Button
                icon="check"
                color="primary"
                loading={this.headerLoadingGroup.get('submitLoading')}
                disabled={notEdit || this.headerLoadingGroup.get('submitLoading')}
                onClick={() => this.beforeSave(true)}
              >
                {intl.get('hzero.common.button.submit').d('提交')}
              </Button>
            )}
          </Observer>
          <Observer>
            {() =>
              spuStatus === 0 &&
              !isReceive && (
                <Button
                  icon="save"
                  funcType="flat"
                  loading={this.headerLoadingGroup.get('saveLoading')}
                  disabled={notEdit || this.headerLoadingGroup.get('saveLoading')}
                  onClick={() => this.beforeSave()}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
              )
            }
          </Observer>
        </Header>
        {isReceive && (
          <Info
            icon="help"
            style={{
              lineHeight: '40px',
              paddingLeft: 20,
              color: 'rgb(45,147,241)',
              backgroundColor: 'rgb(234,244,253)',
            }}
            message={intl
              .get('smpc.product.view.info.receiveSku')
              .d('该商品为领用商品，编辑提交后无需审批，直接生效。')}
          />
        )}
        {canShiftOldVersion && (
          <Info
            icon="help"
            className={styles['shift-alert-info']}
            message={
              <>
                {intl
                  .get('smpc.product.view.info.shiftOldVersion')
                  .d('当前打开审批中或审批拒绝的版本，若要打开原版本，请点击进行切换')}
                <a className="shift-area" onClick={this.shiftToOldVersion}>
                  <Icon type="swap_horiz" />
                  <span>{intl.get('smpc.product.view.info.shift').d('切换')}</span>
                </a>
              </>
            }
          />
        )}
        <Content className={styles['sku-create-container']}>
          {authEdit && (
            <Info
              style={{ marginTop: 16 }}
              message={intl
                .get('smpc.product.view.auth.allInfo')
                .d('根据采购方业务配置，不支持供应商新建/编辑商品相关全部内容')}
            />
          )}
          {/* {canShiftOldVersion && (
            <Info
              icon="help"
              style={{
                marginTop: 16,
                color: 'rgb(45,147,241)',
                backgroundColor: 'rgb(234,244,253)',
              }}
              message={
                <>
                  {intl
                    .get('smpc.product.view.info.shiftOldVersion')
                    .d('当前打开审批中或审批拒绝的版本，若要打开原版本，请点击进行切换')}
                  <a style={{ marginTop: 16, color: '#29bece' }} onClick={this.shiftToOldVersion}>
                    <Icon type="swap_horiz" style={{ marginLeft: 15, marginRight: 3 }} />
                    {intl.get('smpc.product.view.info.shift').d('切换')}
                  </a>
                </>
              }
            />
          )} */}
          <WrapperContent title={intl.get('smpc.product.view.baseInfo').d('基本信息')}>
            <BaseInfo
              isSup={isSup}
              spuId={spuId}
              formDs={this.formDs}
              dataError={dataError}
              getAttrs={this.getAttrs}
              updateFieldRequired={this.updateFieldRequired}
              approveField={approveField}
              updateState={this.updateState}
              noEdit={approveType.includes('BASE_INFO')}
              onSupplierChange={this.handleSupplierChange}
            />
          </WrapperContent>
          {categoryId && (
            <WrapperContent topInvide title={intl.get('smpc.product.view.skuInfo').d('商品信息')}>
              <SkuInfo
                remote={this.props.remote}
                req={req}
                rmb={rmb}
                isSup={isSup}
                path={path}
                spuId={spuId}
                attrFlag={attrFlag}
                requireSkuInfos={requireSkuInfos}
                formDs={this.formDs}
                tableDs={this.tableDs}
                dataError={dataError}
                specsData={specsData}
                categoryId={categoryId}
                approveField={approveField}
                approveType={approveType}
                spuAttrList={spuAttrList || []}
                primaryImagePath={primaryImagePath}
                receiveToItem={receiveToItem}
                oldReceive={oldReceive}
                noEdit={approveType.includes('SKU_INFO')}
                spuAttrExtendList={spuAttrExtendList || []}
                supplierTenantId={
                  supplierTenantId || (isSup ? userOrganizationId : supplierTenantId)
                }
                location={location}
              />
            </WrapperContent>
          )}
        </Content>
      </Fragment>
    );
  }
}
