import React from 'react';
import { Bind } from 'lodash-decorators';
import { runInAction } from 'mobx';
import { observer, Observer } from 'mobx-react-lite';
import { Popconfirm, Icon } from 'choerodon-ui';
import {
  DataSet,
  Spin,
  Form,
  Modal,
  Table,
  Button,
  TextField,
  Lov,
  CheckBox,
  IntlField,
  NumberField,
  Tooltip,
} from 'choerodon-ui/pro';
import uuidv4 from 'uuid/v4';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import { checkPermission } from 'services/api';
import { withCustomDimension } from '@/utils/customDimension';
import EmotionFill from '@/components/EmotionFill';

import ImageMatain from './ImageMatain';
import SaleAfter from '../SaleAfter';
import SaleInfo from '../SaleInfo';
import ProductAttr from '../ProductAttr';
import SaleSpecsForm from './SaleSpecsForm';
import SkuIntro from './SkuIntro';
import StockInfo, { NewStockInfo } from '../StockInfo';
import StaticToolTip from './SpecPreview/StaticToolTip';
import { NewLabelSelect, getLabelOptions } from '../../SkuWorkbench/drawers/label';
// import ImageUploader from './ImageUploader';

import {
  thirdDs,
  imgFormDs,
  saleInfoDs,
  stockDs,
  itemMatainDs,
  skuCustomAttrDs,
  saleSpecsFormDs,
  saleAfterFormDs,
  productSpecAttrDs,
  newStockDs,
  giveRulesDs,
} from '../ds';
import { getAttrFields, setAttrFields, contactAttrs, sortByOrderSeq } from '../reverseAttrField';
import { statusColumn } from '../../SkuWorkbench/tableColumns';
import { ObserverBtn } from '../../SkuWorkbench/components';
import { precisionEditor } from '../../utilsApi/precision';
import { isEqualAttr, setSkuNameBySpecs, getDynamicColumns, getCustFieldRequired } from './funcs';
import { validateSaleLine, fetchReceiveStock, fetchGiftCheckService } from '../api';

import quickEditSku from './quickEdit';
import customStore from '../customStore';

import styles from './index.less';

// 模态框公用配置
const modalProps = {
  movable: false,
  closable: true,
  mask: true,
  maskClosable: false,
  destroyOnClose: true,
  drawer: true,
  okText: intl.get('hzero.common.button.save').d('保存'),
};
// 重置属性
const resetFields = {
  attrType: 1,
  attrValueId: undefined,
  attrValueCode: undefined,
  attrValueName: undefined,
  description: undefined,
};

const organizationId = getCurrentOrganizationId();

const PRICEINFO_PERMISSION_CODE = 'smpc.sku-workbench-pur.create.button.priceinfo';

const BatchDelete = observer(({ dataSet, onClick = (e) => e, children }) => (
  <Button
    funcType="flat"
    icon="delete_sweep"
    color="primary"
    disabled={dataSet.selected.length === 0}
    onClick={onClick}
  >
    {children || intl.get('hzero.common.button.batchDelete').d('批量删除')}
  </Button>
));

@withCustomDimension()
export default class SkuInfo extends React.PureComponent {
  constructor(props) {
    super(props);
    this.staticTextEditor = React.createRef();
    this.state = {
      priceEditPermission: true,
      saleSpecColumns: [],
      giftCheckFlag: false,
    };
  }

  defaultStatusMeaning = intl.get('smpc.product.view.create').d('新建');

  // 新建sku默认信息
  initSku = {
    purSkuStatus: 5,
    purSkuStatusMeaning: this.defaultStatusMeaning,
    skuImageList: [],
    afterSale: {
      returnDuration: 7,
      changeDuration: 15,
      qualityDuration: 12,
      instruction: undefined,
      returnSpecial: 2,
      changeSpecial: 2,
      afterSaleSpecial: 0,
    },
  };

  static getDerivedStateFromProps(nextProps) {
    const { formDs, tableDs } = nextProps;
    if (formDs) {
      const { spuAttrList, spuAttrExtendList } = formDs.current.toData();
      const saleSpecs = contactAttrs(spuAttrList, spuAttrExtendList);
      const newSaleSpecs = [];
      saleSpecs.forEach((_f) => {
        const f = getAttrFields(_f);
        const { attrId, customAttrId, attrOrderSeq, skuAttrId, attributeCode, attributeName } = f;
        const find = newSaleSpecs.find((s) => s.attrId === attrId);
        if (find) {
          find.attrValLov.push(f);
        } else {
          newSaleSpecs.push({
            attrId,
            customAttrId,
            skuAttrId,
            attrOrderSeq,
            attributeCode,
            attributeName,
            attrValLov: [f],
          });
        }
      });
      sortByOrderSeq(newSaleSpecs, 'attrOrderSeq');
      const columns = getDynamicColumns(formDs, tableDs, newSaleSpecs);
      return { saleSpecColumns: columns };
    }
  }

  componentDidMount() {
    const { isSup, remote } = this.props;
    if (!isSup) {
      this.fetchPermission();
    }
    this.fetchGiftCheck();
    if (remote) {
      remote.event.fireEvent('cuxSkuInfoInitEvent', {
        remoteThis: this,
      });
    }
  }

  // 查询配置表是否开启目录化赠品
  async fetchGiftCheck() {
    const isReceive = customStore.getState('isReceive');
    const res = getResponse(await fetchGiftCheckService());
    this.setState({
      giftCheckFlag: !!res && !isReceive, // 领用没有赠品逻辑
    });
  }

  fetchPermission = async () => {
    const res = getResponse(await checkPermission([PRICEINFO_PERMISSION_CODE]));
    if (res) {
      const { approve } = res[0];
      this.setState({
        priceEditPermission: approve,
      });
    }
  };

  @Bind()
  initSaleSpecsForm() {
    const { categoryId, specsData = [], formDs } = this.props;
    const { spuAttrList = [], spuAttrExtendList = [] } = formDs ? formDs.current.toData() : {};
    const ds = new DataSet(saleSpecsFormDs(categoryId));
    const list = [];
    contactAttrs(spuAttrList, spuAttrExtendList).forEach((_attr) => {
      const attr = getAttrFields(_attr);
      const find = list.find((f) => f.attrId === attr.attrId);
      if (find) {
        find.attrValLov.push(attr);
      } else {
        list.push({ ...attr, attrValLov: [attr] });
      }
    });
    sortByOrderSeq(list, 'attrOrderSeq');
    const initData = list.map((attr) => {
      const findSpec = specsData.find((f) => f.attrId === attr.attrId) || {};
      return { ...findSpec, ...attr };
    });
    ds.loadData(initData);
    return ds;
  }

  /**
   * 配置销售规格
   */
  @Bind()
  handleConfigSpecs(skuNameNoEdit) {
    const ds = this.initSaleSpecsForm();
    // 如果商品名称不可编辑 则不允许新增新的销售规格
    const ComposeBtn = observer(({ dataSet }) => (
      <Popconfirm
        okType="ghost"
        overlayClassName={styles['sku-compose-popover']}
        onCancel={() => this.handleSaveSpecs(dataSet, true)}
        okText={intl.get('hzero.common.button.cancel').d('取消')}
        cancelText={intl.get('hzero.common.button.ok').d('确定')}
        title={
          <span>
            <Icon type="error" style={{ color: '#f88d10', marginRight: 8, marginBottom: 4 }} />
            {intl.get('smpc.product.view.createSkuComposeMsg').d('生成SKU组合会覆盖原有SKU')}
          </span>
        }
      >
        <Button disabled={dataSet.length === 0}>
          {intl.get('smpc.product.button.SKUCombinations').d('生成SKU组合')}
          <Tooltip
            title={intl
              .get('smpc.product.view.composeSkuDesc')
              .d(
                '销售规格属性值之间的组合，例：新建了销售规格：颜色（红、蓝）、尺寸（2寸、3寸）点击【生成SKU组合】后将会生成规格为红+2寸、红+3寸、蓝+2寸、蓝+3寸】的四个SKU'
              )}
          >
            <Icon
              type="help"
              style={{ fontSize: '14px', fontWeight: 400, margin: '-3px 0 0 5px' }}
            />
          </Tooltip>
        </Button>
      </Popconfirm>
    ));
    const emptyCom = (
      <div className={styles['spec-sale-empty']}>
        <p className={styles['empty-title']}>
          {intl.get('smpc.product.view.noSpecData').d('暂无销售规格')}
        </p>
        <p className={styles['empty-sub-title']}>
          {intl.get('smpc.product.view.noSpecDataSub').d('可通过点击下方按钮快速新增')}
        </p>
        <Button
          color="primary"
          icon="playlist_add"
          onClick={() => ds.create({ attrType: 1, attrOrderSeq: 0 })}
        >
          {intl.get('smpc.product.model.addSaleSpecs').d('新增销售规格')}
        </Button>
      </div>
    );
    this.modal = Modal.open({
      style: { width: 742 },
      key: 'specsModal',
      title: intl.get('smpc.product.button.setSaleSpecs').d('配置销售规格'),
      ...modalProps,
      footer: (
        <>
          <Button color="primary" onClick={() => this.handleSaveSpecs(ds)}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {this.props.tableDs.records.filter((r) => r.get('skuId')).length === 0 && (
            <ComposeBtn dataSet={ds} />
          )}
          <Button onClick={() => this.modal.close()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </>
      ),
      children: (
        <EmotionFill type="spec" ds={ds} emptyCom={emptyCom}>
          <>
            <SaleSpecsForm
              dataSet={ds}
              isAddSpec={!skuNameNoEdit} // 是否允许新增销售规格
              tableDs={this.props.tableDs}
              deleteSpec={(r) => this.handleDeleteSpec(ds, r)}
            />
          </>
        </EmotionFill>
      ),
    });
  }

  handleDeleteSpec = (ds, record) => {
    const { tableDs, formDs } = this.props;
    let { saleSpecColumns } = this.state;
    const customAttrId = record.get('customAttrId');
    const specName = `spec_${customAttrId}`;
    const skus = tableDs.toData();
    const isHas = skus.some((s) => s[specName]);
    if (customAttrId && isHas) {
      notification.warning({
        message: intl.get('smpc.product.view.onlyDelNoVal').d('只能删除没有被SKU引用的销售规格'),
      });
      return false;
    } else {
      ds.remove(record);
      const field = tableDs.getField(specName);
      if (field) {
        field.set('required', false);
      }
      const filterDataSource = (listKey) => {
        const list = formDs.current.get(listKey) || [];
        const filterList = list.filter((f) => f.customAttrId !== customAttrId);
        formDs.current.set(listKey, filterList);
      };
      if (record.get('attributeCode')) {
        filterDataSource('spuAttrList');
      } else {
        filterDataSource('spuAttrExtendList');
      }
      // const isChangeSkuAttr = formDs.current.get('spuIsChange');
      // if (isChangeSkuAttr) {
      this.deleteSkuSpecs(record);
      // }
      saleSpecColumns = saleSpecColumns.filter((f) => f.name !== specName);
      this.setState({ saleSpecColumns });
    }
  };

  deleteSkuSpecs = (record) => {
    const { tableDs } = this.props;
    tableDs.forEach((r) => {
      const { skuSpecsList = [], skuAttrExtendList } = r.toData();
      const newList = (skuSpecsList || []).filter((_f) => record.get('attrId') !== _f.attrId);
      const newAttrExtendList = (skuAttrExtendList || []).filter(
        (_f) => record.get('customAttrId') !== _f.customAttrId
      );
      r.set('skuSpecsList', newList);
      r.set('skuAttrExtendList', newAttrExtendList);
    });
  };

  @Bind()
  async handleSaveSpecs(ds, isCompose = false) {
    const { formDs, tableDs } = this.props;
    const flag = await ds.validate();
    if (flag) {
      this.modal.close();
      if (!ds.dirty) return false;
      const data = ds.toData();
      // 拿到解离后的所有、自有、扩展销售属性
      const { saleSpecs, spuAttrList, spuAttrExtendList } = this.getSpuAttrs(data);
      formDs.current.set('spuAttrList', spuAttrList);
      formDs.current.set('spuAttrExtendList', spuAttrExtendList);
      // formDs.current.set('spuIsChange', true);
      runInAction(() => {
        this.saleSpecUpdate(saleSpecs); // 拿销售规格更新sku列
        if (isCompose) {
          this.setSkuCompose(saleSpecs, spuAttrList, spuAttrExtendList);
        } else {
          this.setSkuSpecs(contactAttrs(spuAttrList, spuAttrExtendList), tableDs);
        }
      });
    }
    return false;
  }

  saleSpecUpdate = (saleSpecs) => {
    const { formDs, tableDs } = this.props;
    const columns = getDynamicColumns(formDs, tableDs, saleSpecs);
    this.setState({ saleSpecColumns: columns });
  };

  // 解离销售规格（扩展/自有）
  @Bind()
  getSpuAttrs(list = []) {
    const spuAttrList = [];
    const spuAttrExtendList = [];
    const saleSpecs = list.map((item) => {
      const { attrValLov, ...m } = item;
      const newAttrValLov = attrValLov?.map((n) => {
        const {
          attrValue,
          attrValueId,
          attrValueName,
          attrValueCode,
          customAttrValueId,
          valueOrderSeq,
        } = n;
        const newCustomAttrValueId = customAttrValueId || (attrValueCode ? attrValueId : uuidv4());
        const attr = {
          ...setAttrFields({
            ...m,
            attrValue,
            attrValueId,
            attrValueName,
            attrValueCode,
            valueOrderSeq,
            customAttrValueId: newCustomAttrValueId,
          }),
          attrType: 1,
        };
        if (item.attributeCode) {
          spuAttrList.push(attr);
        } else {
          spuAttrExtendList.push(attr);
        }
        return { ...n, customAttrValueId: newCustomAttrValueId };
      });
      return { ...item, attrValLov: newAttrValLov };
    });

    return { saleSpecs, spuAttrList, spuAttrExtendList };
  }

  // 设置sku的销售规格属性，（新增的销售规格）
  setSkuSpecs = (specs, tableDs) => {
    const brandIsSale = specs.some((s) => s.attributeCode === '000000000001');
    const modelIsSale = specs.some((s) => s.attributeCode === '000000000002');
    tableDs.forEach((record) => {
      const list = record.get('skuSpecsList') || [];
      const skuAttrList = record.get('skuAttrList') || [];
      // 将为销售属性的个性化基本属性删除
      const newSkuAttrList = skuAttrList.filter((f) => {
        const brandDel = f.attributeCode === '000000000001' && brandIsSale;
        const modelDel = f.attributeCode === '000000000002' && modelIsSale;
        return !brandDel && !modelDel;
      });

      // 找到specs独有的属性 --> 新增规格属性
      const filterSpecs = specs.filter((f) => {
        const attr = getAttrFields(f);
        return !list.some((s) => isEqualAttr(attr, s));
      });
      // 找出在spec中相同的属性 -过滤了修改的前属性
      const newList = list.filter((f) => {
        return specs.some((s) => isEqualAttr(getAttrFields(s), f));
      });
      const newSpecs = this.getSkuSpecs(filterSpecs);
      record.set('skuAttrList', newSkuAttrList);
      record.set('skuSpecsList', [...newList, ...newSpecs]);
    });
  };

  // 初始化个性化基础属性为销售属性时
  getSaleCustomAttrVal = (skuSpecsList) => {
    const { attrValueId: brandId, attrValueCode: brandCode, attrValueName: brandName } =
      skuSpecsList.find((s) => s.attributeCode === '000000000001') || {};
    const { attrValueName: model } =
      skuSpecsList.find((s) => s.attributeCode === '000000000002') || {};
    return {
      model,
      brandId: brandCode ? brandId : null,
      brandCode,
      brandName,
    };
  };

  // 生成组合的sku列表
  @Bind()
  getAllSku(list = []) {
    const { rmb, formDs, tableDs } = this.props;
    const { spuName = '' } = formDs.current.toData();
    const attrValues = [];
    list.forEach((item) => {
      const { attrId, customAttrId, attrOrderSeq, attributeCode, attributeName, attrValLov } = item;
      attrValues.push(
        attrValLov.map((i) => ({
          ...i,
          attrId,
          customAttrId,
          attrOrderSeq,
          attributeCode,
          attributeName,
        }))
      );
    });

    const skus = attrValues.reduce(
      (results, attr) => {
        const tmp = [];
        results.forEach((m) => {
          attr.forEach((n) => {
            const s = [].concat(Array.isArray(m) ? m : [m]);
            const t = s.concat(n);
            tmp.push(t);
          });
        });
        return tmp;
      },
      [[]]
    );

    skus.forEach((sku) => {
      const skuName = Array.isArray(sku)
        ? [spuName, ...sku.map((i) => i.attrValueName)].join('  ')
        : [spuName, sku.attrValueName].join('  ');
      const specs = Array.isArray(sku) ? sku : [sku];
      const skuSpecsList = specs.map((m) => ({ ...m, attrType: 1 })); // 每个商品行自带的销售规格属性
      const skuAttrList = [];
      if (rmb) {
        skuAttrList.push(rmb);
      }
      const saleCustomAttrVal = this.getSaleCustomAttrVal(skuSpecsList);
      const skuInfo = {
        ...this.initSku,
        ...saleCustomAttrVal,
        skuName,
        initialSkuName: '',
        skuSpecsList,
        skuAttrList,
        _uniqId: uuidv4(),
      };
      skuSpecsList.forEach((f) => {
        skuInfo[`spec_${f.customAttrId}`] = f;
      });
      tableDs.create(skuInfo);
    });
  }

  @Bind()
  setSkuCompose(list) {
    const { tableDs } = this.props;
    tableDs.removeAll();
    this.getAllSku(list);
  }

  /**
   * 新建sku
   */
  @Bind()
  handleCreate() {
    const { tableDs, rmb, formDs } = this.props;
    const { spuAttrList, spuAttrExtendList } = formDs.current.toData();
    const skuAttrList = [];
    if (rmb) {
      skuAttrList.push(rmb);
    }
    const skuSpecsList = this.getSkuSpecs(contactAttrs(spuAttrList, spuAttrExtendList));
    tableDs.create(
      {
        ...this.initSku,
        displayOrderSeq: this.getInitOrderSeq(),
        skuAttrList,
        skuSpecsList,
        skuAttrExtendList: [],
        _uniqId: uuidv4(),
      },
      0
    );
  }

  @Bind()
  getInitOrderSeq() {
    const { tableDs } = this.props;
    let maxOrder = 0;
    if (tableDs.length < 1) {
      return maxOrder;
    }
    tableDs.forEach((r) => {
      const displayOrderSeq = r.get('displayOrderSeq');
      if (displayOrderSeq > maxOrder) {
        maxOrder = displayOrderSeq;
      }
    });
    return maxOrder + 1;
  }

  // 获取销售规格列
  getSkuSpecs = (specs) => {
    // 需要删除的字段 attrValueId, attrValueCode, attrValueName, description
    const skuSpecs = [];
    specs.forEach((f) => {
      if (!skuSpecs.some((s) => isEqualAttr(s, f))) {
        skuSpecs.push({
          ...f,
          ...resetFields,
        });
      }
    });
    return skuSpecs;
  };

  /**
   * 批量删除
   */
  @Bind()
  handleBatchDelete() {
    const { tableDs } = this.props;
    tableDs.selected.forEach((f) => {
      const _f = f;
      _f.status = 'add';
    });
    tableDs.remove(tableDs.selected);
  }

  getAttrIsRequired() {
    const { specsData } = this.props;
    const filterSpecsData = specsData?.filter(
      (f) => !['000000000001', '000000000002'].includes(f.attributeCode)
    );
    const attrIsRequired = filterSpecsData?.some((s) => s.requiredFlag === 1);
    return attrIsRequired;
  }

  // 为了获取属性个性化必输
  _customAttrDs;

  _customItemDs;

  getQuickIsRequired(fieldName) {
    const { categoryId, receiveToItem, oldReceive, requireSkuInfos } = this.props;
    const requiredRules = requireSkuInfos || [];
    const isReceive = customStore.getState('isReceive');
    const itemInfoRequired = isReceive && !oldReceive && !receiveToItem; // 非旧领用租户且未开启领用商品自动生成物料
    if (!this._customAttrDs) {
      this._customAttrDs = new DataSet(skuCustomAttrDs(categoryId, isReceive));
    }
    // 供方无领用商品
    if (!this._customItemDs) {
      this._customItemDs = new DataSet(itemMatainDs(false, itemInfoRequired));
    }

    const quickInfoMap = {
      skuImageList: requiredRules.includes('PICTUREINFO'),
      introduction: requiredRules.includes('DESCRIPTION'),
      skuAttrList:
        this.getAttrIsRequired() ||
        getCustFieldRequired({
          dataSet: this._customAttrDs,
          code: 'SKU_ATTRS',
          fieldName: 'skuAttrList',
          hole: true,
        }),
      priceInfo: requiredRules.includes('PRICEINFO') || isReceive,
      labels: requiredRules.includes('LABEL'),
      afterSale: requiredRules.includes('SALEAFTER'),
      itemLov:
        itemInfoRequired ||
        getCustFieldRequired({
          dataSet: this._customItemDs,
          code: 'ITEM_INFO',
          fieldName: 'itemLov',
        }),
      itemCategoryLov: getCustFieldRequired({
        dataSet: this._customItemDs,
        code: 'ITEM_INFO',
        fieldName: 'itemCategoryLov',
      }),
    };
    return quickInfoMap[fieldName];
  }

  getQuickColHeader(fieldName) {
    const { tableDs } = this.props;
    const field = tableDs.getField(fieldName);
    const label = field.get('label');
    return (
      <Observer>
        {() => {
          const required = this.getQuickIsRequired(fieldName);
          return (
            <div>
              {label}
              {required && <span style={{ color: '#f56349', marginLeft: 2 }}>*</span>}
            </div>
          );
        }}
      </Observer>
    );
  }

  // 快速编辑
  @Bind
  handleQuickEdit({ name, record, isEdit }) {
    const { giftCheckFlag } = this.state;
    const { tableDs, noEdit, approveField } = this.props;
    const isReceive = customStore.getState('isReceive');
    // 商品图片不可编辑
    const imgNoEdit = noEdit || approveField.includes('SPEC_INFO_ITEM_IMAGE');
    // 商品介绍不可编辑
    const introNoEdit = approveField.includes('SPEC_INFO_ITEM_INTRODUCTION');
    quickEditSku({
      name,
      record,
      dataSet: tableDs,
      isEdit,
      giftCheckFlag,
      config: filterNullValueObject({
        skuImageList: this.getImageListConfig({
          record,
          disabled: imgNoEdit && record.get('skuId'),
        }),
        introduction: this.getIntroductionConfig({
          record,
          disabled: introNoEdit && record.get('skuId'),
        }),
        skuAttrList: this.getSkuAttrConfig(record),
        priceInfo: this.getPriceInfoConfig(record, isEdit),
        skuStockList: isReceive && this.getStockInfoConfig(record, isEdit),
        itemInfo: this.getItemInfoConfig({ record, disabled: noEdit && record.get('skuId') }),
        labels: this.getLabelConfig(record),
        afterSale: this.getAfterSaleConfig(record),
        giveRules: this.getGiveRulesConfig(record),
        thirdInfo: this.getThirdInfoConfig({ record, disabled: noEdit && record.get('skuId') }),
      }),
    });
  }

  // 维护事件
  @Bind
  handleSetValue({ dataSet, record, name, value, customSetValue, disabled }) {
    const { tableDs } = this.props;
    const allSkuFlag = dataSet?.current?.get('allSkuFlag');
    const filterSavedIdThenSet = (r) => {
      // 售后信息 去掉已保存sku带给新建sku的id信息
      if (name === 'afterSale') {
        const _v = Object.assign(value);
        delete _v.creationDate;
        delete _v.lastUpdateDate;
        delete _v.objectVersionNumber;
        if (!r.get('skuId')) {
          delete _v.skuId;
          delete _v.skuSaleId;
          r.set(name, _v);
        } else {
          const selfAfterSale = r.get(name) || {};
          const { skuId, skuSaleId } = selfAfterSale;
          r.set(name, { ..._v, skuId, skuSaleId });
        }
      } else {
        r.set(name, value);
      }
    };
    const setFn = customSetValue ? (r) => customSetValue(r) : (r) => r.set(name, value);
    const setFilterFn = customSetValue ? (r) => customSetValue(r) : (r) => filterSavedIdThenSet(r);
    if (allSkuFlag) {
      tableDs.records.forEach((f) => {
        // 售后信息单独处理
        // 应用至全部sku -> 所有sku售后信息相当于新建（无skuSaleId、skuId）
        if (!(f.get('skuId') && disabled)) {
          // setFn(f);
          setFilterFn(f);
        }
      });
    } else {
      setFn(record);
    }
  }

  // 图片信息
  getImageListConfig = ({ record, disabled }) => {
    const { skuImageList } = record ? record.toData() : [];
    const { primaryImagePath } = this.props; // 商品主图
    this.imgFormDs = new DataSet(imgFormDs());
    // 非主图图片
    this.imgFormDs.loadData(
      (skuImageList || []).filter(
        (i) => !((i.largeImagePath || i.mediaPath) === primaryImagePath || i.mediaType === 1)
      )
    );
    const required = this.getQuickIsRequired('skuImageList');
    return {
      required,
      readOnly: disabled,
      bodyStyle: { paddingTop: 0 },
      onOk: async () => {
        if (disabled) return true;
        const flag = await this.imgFormDs.validate();
        if (!flag) return false;
        const imgList = this.imgFormDs.toData();
        if (imgList.length < 1 && required) {
          notification.error({
            message: intl
              .get('hzero.common.validate.notNull', {
                name: intl.get('smpc.product.model.imageInfo').d('图片信息'),
              })
              .d('图片信息不能为空'),
          });
          return false;
        }
        if (record) record.set('skuImageList', this.imgFormDs.toData());
      },
      children: <ImageMatain dataSet={this.imgFormDs} disabled={disabled} />,
    };
  };

  // 商品介绍
  getIntroductionConfig = ({ record, disabled }) => {
    // DESCRIPTION
    const required = this.getQuickIsRequired('introduction');
    const introDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'template',
          type: 'object',
          lovCode: 'SMPC.SKU_DETAIL_TEMPLATE',
          lovPara: { enabledFlag: 1, tenantId: organizationId },
          optionsProps: {
            pageSize: 20,
          },
        },
        {
          name: 'allSkuFlag',
          type: 'boolean',
        },
      ],
    });
    return {
      readOnly: disabled,
      width: 742,
      required,
      onOk: () => {
        if (disabled) return true;
        let content = '';
        if (this.staticTextEditor.current) {
          content = this.staticTextEditor.current.getContent();
        }
        if (required && !content) {
          notification.error({
            message: intl
              .get('hzero.common.validate.notNull', {
                name: intl.get('smpc.product.model.productIntro').d('商品介绍'),
              })
              .d('商品介绍不能为空'),
          });
          return false;
        }
        this.handleSetValue({
          dataSet: introDs,
          record,
          name: 'introduction',
          value: content,
          disabled,
        });
      },
      children: (
        <SkuIntro
          skuRecord={record}
          dataSet={introDs}
          disabled={disabled}
          refCurrent={this.staticTextEditor}
        />
      ),
    };
  };

  // 商品属性
  getSkuAttrConfig = (record) => {
    const { categoryId, specsData } = this.props;
    const isReceive = customStore.getState('isReceive');
    // 过滤品牌、型号
    const filterSpecsData = specsData?.filter(
      (f) => !['000000000001', '000000000002'].includes(f.attributeCode)
    );
    const attrIsRequired = this.getAttrIsRequired();
    const {
      skuAttrList,
      skuAttrExtendList,
      skuSpecsList, // 销售属性
      brandId,
      brandCode,
      brandName,
      model,
      packingList,
    } = record.toData();
    const [saleAttrRecords, baseAttrRecords, specAttrRecords] = this.handleInitAttrs(
      filterSpecsData || [],
      skuAttrList || [],
      skuAttrExtendList || [],
      skuSpecsList || [],
      record
    );
    // 基本属性
    this.baseAttrsDs = new DataSet(productSpecAttrDs(categoryId));
    baseAttrRecords.forEach((l) => {
      this.baseAttrsDs.create(l, 0);
    });
    // 规格属性
    this.specAttrsDs = new DataSet(productSpecAttrDs(categoryId));
    specAttrRecords.forEach((l) => {
      this.specAttrsDs.create(l, 0);
    });
    // 是否应用至全部sku
    this.attrAllDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'allSkuFlag',
          type: 'boolean',
        },
      ],
    });
    // 个性化属性表单
    this.customAttrDs = new DataSet(skuCustomAttrDs(categoryId, isReceive));
    const brand = {
      attrValueName: brandName,
      attrValueId: brandId || brandName,
      attrValueCode: brandCode,
    };
    this.customAttrDs.create({
      model,
      packingList,
      brandName: isReceive ? (brandName ? brand : null) : brandName,
    });

    return {
      required: attrIsRequired,
      requiredDataSet: this._customAttrDs || this.customAttrDs,
      onOk: () => this.handleSaveAttrs({ record, saleAttrRecords }),
      children: (
        <ProductAttr
          isReceive={isReceive}
          allSkuDs={this.attrAllDs}
          specAttrsDs={this.specAttrsDs}
          baseAttrsDs={this.baseAttrsDs}
          customAttrDs={this.customAttrDs}
          saleAttrRecords={saleAttrRecords}
        />
      ),
    };
  };

  // 价格信息
  getPriceInfoConfig = (record, isEdit) => {
    // PRICEINFO
    const isReceive = customStore.getState('isReceive');
    const required = this.getQuickIsRequired('priceInfo');
    const {
      isSup,
      attrFlag,
      approveType,
      approveField,
      supplierTenantId,
      path,
      remote,
      formDs,
    } = this.props;
    const supplierCompanyId = formDs.current.get('supplierCompanyId');
    const saleInfoFlag = approveType.includes('SALE_INFO');
    const initData = record.get('skuSalesInfos') || [];
    const ds = new DataSet(saleInfoDs(supplierTenantId, saleInfoFlag, isEdit, attrFlag, isReceive));
    initData.forEach((f) => {
      ds.create({ ...f, _uuid: uuidv4(), repeatError: false });
    });
    ds.forEach((f) => {
      // 开启权限控制 已经生成价格不可删除
      const skuPriceStatus = f.get('skuPriceStatus') || 'NEW'; // 状态默认为新建 可删除
      const agreementLineId = f.get('agreementLineId');
      // const isAuth = saleInfoFlag && (f.get('agreementLineId') || f.get('salesId')); // 开启供应商编辑权限
      if (
        skuPriceStatus !== 'NEW' ||
        (skuPriceStatus === 'NEW' && agreementLineId && agreementLineId !== -1)
      ) {
        Object.assign(f, { selectable: false });
      }
    });
    const saleInfoProps = {
      isSup,
      remote,
      tableDs: ds,
      approveField,
      isAttrMapping: attrFlag,
      isEdit,
      skuRecord: record,
      noEdit: saleInfoFlag,
      path,
      supplierCompanyId,
      onDelete: (deleteLines = []) => {
        const filterSales = initData.filter(
          (f) => !deleteLines.some((s) => s.salesId === f.salesId)
        );
        record.set('skuSalesInfos', filterSales);
      },
      customHelpByItem: this.getItemDs, // 个性化挂载
    };
    const children = <SaleInfo {...saleInfoProps} />;
    return {
      children,
      required,
      readOnly: saleInfoFlag,
      width: 1090,
      onOk: async () => {
        if (saleInfoFlag) return true;
        const flag = await ds.validate();
        const ladderPriceNull = ds.find(
          (f) =>
            f.get('priceType') === 'LADDER_PRICE' &&
            (!f.get('skuSalesLadders') || !f.get('skuSalesLadders')?.length)
        );
        if (ladderPriceNull) {
          notification.warning({
            message: intl.get('smpc.product.view.ladderPrice.notNull').d('商品阶梯价不能为空'),
          });
          return false;
        }
        if (required && ds.length < 1) {
          notification.error({
            message: intl
              .get('hzero.common.validate.notNull', {
                name: intl.get('smpc.product.model.priceInfo').d('价格信息'),
              })
              .d('价格信息不能为空'),
          });
          return false;
        }
        if (flag) {
          let isUpdate = false;
          ds.forEach((d) => {
            if (d.dirty || !d.get('skuId')) {
              isUpdate = true;
              d.set('updateFlag', 1);
              if (d.get('priceAttrBigint1')) {
                // 网易二开， 先这样吧暂时没想到其他办法。。。挫
                d.set('priceAttrBigint1Meaning', d.get('priceAttrBigint1')?.purchaseAgentName);
              }
            }
          });
          if (isUpdate) {
            let skuSalesInfos = ds.toJSONData();
            skuSalesInfos = skuSalesInfos.map((m) => {
              return {
                ...m,
                skuSalesUnits: m.allUnitFlag ? null : m.skuSalesUnits,
                skuSalesRegions: m.allRegionFlag ? null : m.skuSalesRegions,
              };
            });
            if (skuSalesInfos.length > 1) {
              return this.validateSaleInfo({ ds, skuSalesInfos, skuRecord: record });
            } else {
              record.set('skuSalesInfos', skuSalesInfos);
              return true;
            }
          }
          return true;
        } else return false;
      },
    };
  };

  getStockInfoConfig = (record) => {
    const { oldReceive, receiveToItem } = this.props;
    const fieldParamName = oldReceive ? 'skuStockList' : 'receiveStockOperates';
    const { skuId, itemId, nonProduceInvManageFlag } = record.get([
      'skuId',
      'itemId',
      'nonProduceInvManageFlag', // 物料是否开启非生库存
    ]);
    const initData = record.get(fieldParamName) || [];
    const ds = new DataSet(oldReceive ? stockDs(skuId) : newStockDs());
    // 新领用租户
    if (itemId && !oldReceive && nonProduceInvManageFlag) {
      ds.status = 'loading';
      fetchReceiveStock({ itemId }).then((res) => {
        if (getResponse(res)) {
          initData
            .filter((f) => !f.stockId) // 取新建库存
            .concat(res)
            .forEach((f) => {
              ds.create({ ...f });
            });
          ds.status = 'ready';
        }
        ds.status = 'ready';
      });
    } else {
      initData.forEach((f) => {
        ds.create({ ...f });
      });
    }
    const stockInfo = {
      skuRecord: record,
      tableDs: ds,
      receiveToItem,
      nonProduceInvManageFlag,
    };
    const Comp = oldReceive ? StockInfo : NewStockInfo;
    const children = <Comp {...stockInfo} />;
    return {
      children,
      // readOnly: saleInfoFlag,
      width: oldReceive ? 850 : 1090,
      onOk: async () => {
        const dirty = ds.find((r) => !r.get('stockId'));
        if (!dirty) return true;
        const flag = await ds.validate();
        if (!flag) return false;
        if (flag) {
          const locationIds = ds.map((r) => r.get('locationId')).filter((l) => l); // 去空
          const hasSameLocation = locationIds.find(
            (id, index) => locationIds.indexOf(id) !== index
          );
          if (hasSameLocation) {
            notification.warning({
              message: intl
                .get('smpc.product.stockInfo.note.hasSameLocation')
                .d('该库位已存在库存，可批量增加或扣减库存'),
            });
            return false;
          }
          if (!hasSameLocation) {
            const inventoryIds = ds.map((r) => r.get('inventoryId')).filter((l) => l); // 去空
            const hasSameInventory = inventoryIds.find(
              (id, index) => inventoryIds.indexOf(id) !== index
            );
            if (hasSameInventory) {
              notification.warning({
                message: intl
                  .get('smpc.product.stockInfo.note.hasSameInventory')
                  .d('该库房已存在库存，可批量增加或扣减库存'),
              });
              return false;
            }
          }
          const isUpdate = ds.some((r) => r.dirty);
          if (isUpdate) {
            record.set(
              fieldParamName,
              ds.toJSONData().map((m) => ({
                ...m,
                operateNum: m.totalStock, // 保存取该字段
                itemId: oldReceive ? null : record.get('itemId'), // sku行上的物料
                uomId: oldReceive ? null : record.get('uomId'), // sku行上的物料
              }))
            );
          }
        }
      },
    };
  };

  getItemDs = (record) => {
    const itemInfoKeys = [
      'itemLov',
      'itemId',
      'itemCode',
      'itemName',
      'nonProduceInvManageFlag',
      // 'uomId',
      'itemUomId',
      'itemCategoryLov',
      'itemCategoryId',
      'itemCategoryCode',
      'itemCategoryName',
    ];
    const customFields = [
      'attributeBigint',
      'attributeDate',
      'attributeDatetime',
      'attributeDecimal',
      'attributeLongtext',
      'attributeTinyint',
      'attributeVarchar',
    ];
    const { isSup, oldReceive, receiveToItem } = this.props;
    const isReceive = customStore.getState('isReceive');
    const receiveItemRequired = isReceive && !oldReceive && !receiveToItem;
    const defaultInfo = {};
    itemInfoKeys.forEach((name) => {
      defaultInfo[name] = record.get(name);
    });
    // 初始化物料信息个性化字段
    for (const key in record.toData()) {
      if (customFields.find((c) => key.indexOf(c) !== -1)) {
        defaultInfo[key] = record.get(key);
      }
    }
    const itemFormDs = new DataSet(itemMatainDs(isSup, receiveItemRequired));
    itemFormDs.create(defaultInfo);
    return itemFormDs;
  };

  // 物料信息
  getItemInfoConfig = ({ record, disabled }) => {
    const { customizeForm } = customStore.getCustFuncs();
    const { oldReceive, receiveToItem } = this.props;
    const isReceive = customStore.getState('isReceive');
    const receiveItemRequired = isReceive && !oldReceive && !receiveToItem;
    const itemFormDs = this.getItemDs(record);
    return {
      readOnly: disabled,
      required: receiveItemRequired,
      requiredDataSet: this._customItemDs,
      onOk: async () => {
        const flag = await itemFormDs.validate();
        if (!flag) return false;
        this.handleSetValue({
          dataSet: itemFormDs,
          record,
          disabled,
          customSetValue: (r) => r.set(itemFormDs.current.toData()),
        });
      },
      children: customizeForm(
        { code: customStore.getCustomCode('ITEM_INFO') },
        <Form labelLayout="float" dataSet={itemFormDs} columns={1}>
          <Lov name="itemLov" disabled={disabled} clearButton={false} />
          <TextField name="itemName" />
          <Lov
            name="itemCategoryLov"
            disabled={disabled}
            clearButton={false}
            tableProps={{ selectionMode: 'rowbox' }}
          />
          <CheckBox name="allSkuFlag">
            {intl.get('smpc.product.model.setAllSku').d('应用至全部SKU')}
          </CheckBox>
        </Form>
      ),
    };
  };

  // 商品标签
  getLabelConfig = (record) => {
    const { isSup, formDs } = this.props;
    const required = this.getQuickIsRequired('labels');
    this.labelDs = new DataSet({
      fields: [
        {
          name: 'labels',
          type: 'object',
          required,
          label: intl.get('smpc.workbench.view.label').d('标签'),
          multiple: true,
          textField: 'labelName',
          valueField: 'labelId',
        },
        { name: 'allSkuFlag', type: 'boolean' },
      ],
    });
    const labels = (record.get('labels') || []).slice();
    this.labelDs.create({ labels });
    const _record = this.labelDs.current;

    const { supplierCompanyId, supplierCompanyName, supplierTenantId } = formDs.current.toData();

    const supplier = { supplierCompanyId, supplierCompanyName, supplierTenantId };

    // 采购方的标签
    const getSkuPurLabels = (skuLabels) =>
      (skuLabels || []).filter((f) => {
        return f.creatorFlag === 'PURCHASE';
      });

    // 不能删除的标签
    const getFixLabels = (skuLabels) =>
      (skuLabels || []).filter((f) => {
        const supIsPur = isSup && f.creatorFlag === 'PURCHASE';
        const autoLabelFlag = !!f.skuLabelSources;
        return supIsPur || autoLabelFlag;
      });

    return {
      required,
      onOk: async () => {
        const flag = await this.labelDs.validate();
        if (!flag) return false;
        const _labels = _record.get('labels');
        this.handleSetValue({
          dataSet: this.labelDs,
          record,
          name: 'labels',
          value: _labels,
          customSetValue: (r) => {
            const fixLabels = getFixLabels(r.get('labels')); // 每一行不能删除的标签
            const mapLabels =
              r.id === record.id
                ? _labels
                : _labels
                    .map((m) => ({ ...m, creatorFlag: null }))
                    .filter((f) => !f.skuLabelSources);
            if (fixLabels.length > 0 && r.id !== record.id) {
              // 供应商不能删除采购方维护的
              // 自动打标的都不能删除
              const newLabels = mapLabels.filter(
                (f) => !fixLabels.some((s) => s.labelId === f.labelId)
              );
              r.set('labels', fixLabels.concat(newLabels));
            } else {
              r.set('labels', mapLabels);
            }
          },
        });
      },
      children: (
        <Form dataSet={this.labelDs} labelLayout="float">
          <NewLabelSelect
            name="labels"
            isSup={isSup}
            supplier={supplier}
            initLabels={isSup ? labels : []}
            onOption={({ record: labelRecord }) => {
              // 供应商无法删除采购方添加的标签
              const notDelLabels = getFixLabels(labels);
              return {
                disabled: notDelLabels.some((s) => s.labelId === labelRecord.get('labelId')),
              };
            }}
            onChange={(values, oldValues) => {
              const purLabels = getSkuPurLabels(labels);
              // 无法删除协议自动打标的标签
              // 供应商无法删除采购方添加的标签
              if (isSup && purLabels.length > 0) {
                const vals = values || [];
                const dynamicLabels = vals.filter(
                  (f) => !purLabels.some((s) => s.labelId === f.labelId)
                );
                if (purLabels.length + dynamicLabels.length > vals.length) {
                  const oldVals = oldValues || [];
                  const resLabels = oldVals.filter((f) => {
                    const isFixLabel = purLabels.some((s) => s.labelId === f.labelId);
                    const isNotDel = vals.some((s) => s.labelId === f.labelId);
                    return isFixLabel || isNotDel;
                  });
                  _record.set('labels', resLabels);
                  notification.warning({
                    message: intl
                      .get('smpc.product.view.isPurLabelNotClear')
                      .d('采购方添加的标签无法移除'),
                  });
                }
              }
            }}
            options={getLabelOptions(supplier, labels)}
          />
          <CheckBox name="allSkuFlag">
            {intl.get('smpc.product.model.setAllSku').d('应用至全部SKU')}
          </CheckBox>
        </Form>
      ),
    };
  };

  // 售后
  getAfterSaleConfig = (record) => {
    const isReceive = customStore.getState('isReceive');
    const required = this.getQuickIsRequired('afterSale');
    const { afterSale = {}, skuId } = record.toData();
    this.saleAfterFormDs = new DataSet(saleAfterFormDs());
    // 新建质保期无默认值
    this.saleAfterFormDs.create({
      ...afterSale,
      allSkuFlag: false,
      qualityDuration: skuId || afterSale.__dirty ? afterSale.qualityDuration : null,
    });
    return {
      required,
      width: 400,
      onOk: () => this.handleSaveAfs(record),
      children: <SaleAfter dataSet={this.saleAfterFormDs} isReceive={isReceive} />,
    };
  };

  // 赠品规则
  getGiveRulesConfig = (r) => {
    const { supplierCompanyId } = this.props?.formDs?.current?.toData() || {};
    const ds = new DataSet(giveRulesDs(supplierCompanyId));
    ds.loadData(r.get('giveawayRuleList') || []);
    const columns = [
      {
        name: 'skuLov',
        editor: true,
        width: 120,
      },
      {
        name: 'giftSkuName',
      },
      {
        name: 'giftType',
        editor: true,
        width: 120,
      },
      {
        name: 'mainQuantity',
        width: 90,
        editor: (record) => record.get('giftType') === 'NUMBER',
      },
      {
        name: 'giftQuantity',
        width: 90,
        editor: (record) => record.get('giftType') === 'NUMBER',
      },
      {
        name: 'percentageGift',
        width: 100,
        editor: (record) => record.get('giftType') === 'PERCENTAGE',
      },
    ];
    const AddBtn = observer(({ dataSet }) => (
      <Tooltip
        title={
          dataSet.length >= 5
            ? intl.get('smpc.product.view.addGiftMaxTips').d('至多允许关联5个赠品')
            : !supplierCompanyId
            ? intl.get('smpc.product.view.addGiftCompanyTips').d('请先选择供应商')
            : null
        }
      >
        <Button
          color="primary"
          funcType="flat"
          disabled={dataSet.length >= 5 || !supplierCompanyId}
          onClick={() => dataSet.create({}, 0)}
          icon="playlist_add"
        >
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>
      </Tooltip>
    ));
    return {
      width: 742,
      children: (
        <Table
          dataSet={ds}
          columns={columns}
          style={{ maxHeight: 'calc(100% - 40px)' }}
          customizedCode="SKU_CREATE_GIFT_RULES_TABLE"
          buttons={[
            <AddBtn dataSet={ds} />,
            <BatchDelete dataSet={ds} onClick={() => ds.remove(ds.selected, true)} />,
          ]}
        />
      ),
      onOk: async () => {
        const flag = await ds.validate();
        if (flag) {
          this.handleSetValue({
            dataSet: ds,
            record: r,
            name: 'giveawayRuleList',
            value: ds.toData()?.map((n) => filterNullValueObject(n)) || [],
          });
          return true;
        }
        return false;
      },
    };
  };

  // 第三方信息
  getThirdInfoConfig = ({ record, disabled }) => {
    const { customizeForm } = customStore.getCustFuncs();
    const thirdKeys = [
      'supplierItemCode',
      'supplierItemName',
      'manufacturerItemCode',
      'manufacturerItemName',
      'manufacturerInfo',
    ];
    const defaultInfo = {};
    thirdKeys.forEach((name) => {
      defaultInfo[name] = record.get(name);
    });
    const ds = new DataSet(thirdDs());
    ds.create(defaultInfo);
    return {
      readOnly: disabled,
      onOk: () => {
        if (disabled) return true;
        const updateInfo = ds.current.toData();
        const newValue = {};
        thirdKeys.forEach((name) => {
          newValue[name] = updateInfo[name];
        });
        this.handleSetValue({
          dataSet: ds,
          record,
          disabled,
          customSetValue: (r) => {
            r.set(newValue);
            if (ds.current.dirty) {
              r.set('thirdInfo', 'dirty_mark');
            }
          },
        });
      },
      children: customizeForm(
        { code: customStore.getCustomCode('THIRD_INFO') },
        <Form dataSet={ds} labelLayout="float">
          <TextField name="supplierItemCode" disabled={disabled} />
          <TextField name="supplierItemName" disabled={disabled} />
          <TextField name="manufacturerItemCode" disabled={disabled} />
          <TextField name="manufacturerItemName" disabled={disabled} />
          <TextField name="manufacturerInfo" disabled={disabled} />
          <CheckBox name="allSkuFlag">
            {intl.get('smpc.product.model.setAllSku').d('应用至全部SKU')}
          </CheckBox>
        </Form>
      ),
    };
  };

  /**
   * 图片信息:批量维护使用
   */
  @Bind()
  handleLookImages({ record, title, disabled }, imgNoEdit) {
    const { skuImageList } = record ? record.toData() : [];
    const { tableDs, primaryImagePath } = this.props;
    this.imgFormDs = new DataSet(imgFormDs());
    this.imgFormDs.loadData(
      (skuImageList || []).filter((i) => !(i.mediaPath === primaryImagePath || i.mediaType === 1))
    );

    const footerProps = disabled
      ? { okText: intl.get('hzero.common.button.close').d('关闭'), okCancel: false }
      : {};
    Modal.open({
      ...modalProps,
      ...footerProps,
      key: 'imageInfoModal',
      style: { width: 380 },
      bodyStyle: { paddingTop: 0 },
      onOk: async () => {
        if (disabled) return true;
        const flag = await this.imgFormDs.validate();
        if (!flag) return false;
        if (record) record.set('skuImageList', this.imgFormDs.toData());
        else {
          // 如果是批量维护，且开启了权限控制，只允许给新增商品维护图片
          tableDs.records.forEach((r) => {
            if (!imgNoEdit || (imgNoEdit && !r.get('skuId'))) {
              r.set('skuImageList', this.imgFormDs.toData());
            }
          });
        }
      },
      title: title || intl.get('smpc.product.model.editImg').d('编辑图片'),
      children: <ImageMatain dataSet={this.imgFormDs} disabled={disabled} />,
    });
  }

  /**
   * 初始化商品属性数据
   * 销售属性 attrType 为 1; 基础属性 attrType 2;- 规格属性 attrType: 3;
   * 页面属性展示：
   * 基础属性：固定品牌、型号、包装规格（- 销售属性 类的 品牌、型号） + baseAttrs(其他基础属性)
   * 规格属性：specAttrs
   * 销售属性：saleAttrs
   * @param {该商品分类下的所有属性（排除品牌、型号），该属性有可能维护成销售属性 || 转为基础属性 || 规格属性} specsData
   * @param {sku 基本属性 + 平台预定义销售属性 ---- 接口返回} skuAttrList
   * @param { sku 自定义销售属性 + 规格属性  ---接口返回} skuAttrExtendList
   * @param { sku 自定义销售属性 } skuSpecsList
   * @returns [saleAttrs, baseAttrs, specAttrs]
   * saleAttrs: 销售属性
   * baseAttrs: 基础属性
   * specAttrs: 规格属性
   */
  @Bind()
  handleInitAttrs(specsData, skuAttrList, skuAttrExtendList, skuSpecsList, record) {
    const { spuId, formDs, remote } = this.props;
    const isReceive = customStore.getState('isReceive');
    const baseAttrs = [];
    const specAttrs = [];

    const notSaleAttrs = skuAttrList.filter((f) => f.attrTye !== 1); // 不是销售属性的自有属性
    const notSpuSaleAttrs = skuAttrList.filter(
      (f) => f.attrTye === 1 && !skuSpecsList.some((s) => s.attrId === f.attrId)
    ); // 不是销售规格的自有销售属性（分类下平台预定义销售属性但未维护成销售属性）
    const standardSpecData = skuAttrExtendList.filter((f) => f.attrTye !== 1); // 不是销售属性的扩展属性（规格属性）
    // 【诺斯贝尔】, 自有商品新建时，平台分类为【2023121400001-包装材料】时， 添加默认规格属性
    const notSaleExtendAttrs =
      remote.process('SPEC_ATTR_DEFAULT', standardSpecData, { spuId, formDs, isReceive, record }) ||
      [];
    const notSpuSaleExtendAttrs = skuAttrExtendList.filter(
      (f) => f.attrTye === 1 && !skuSpecsList.some((s) => s.attrName === f.attrName)
    ); // 不是销售规格的扩展销售属性

    const saleAttrs = [...skuSpecsList, ...notSpuSaleAttrs, ...notSpuSaleExtendAttrs];

    const assignAttr = (attr = {}) => {
      switch (attr.attrType) {
        // case 1: // 销售属性
        //   saleAttrs.push(attr);
        //   break;
        case 2: // 基本属性
          baseAttrs.push(attr);
          break;
        case 3: // 规格属性
          specAttrs.push(attr);
          break;
        default:
          break;
      }
    };

    // 商品属性初始来源于该分类下分配的属性
    // 基本属性、已有的规格属性
    specsData.forEach((item) => {
      const hasAttr = notSaleAttrs.filter((v) => v.attrId === item.attrId); // 已经维护过的属性
      const attrType = hasAttr.attrTye || (item.baseAttrFlag ? 2 : 3); // 如果存在则取存在的attrType，否则是基本属性或者规格属性
      const attrValueLov = item.operationType === 0 ? hasAttr : hasAttr[0] || {}; // 如果operationType为0则为多选，否则单选
      const attr = {
        ...item,
        attrType,
        [item.operationType === 0 ? 'multiAttrValLov' : 'singleAttrValLov']: attrValueLov,
      };
      if (!saleAttrs.some((s) => s.attrId === attr.attrId)) {
        assignAttr(attr);
      }
    });

    // 扩展的规格属性
    // 属性attrName 属性值attrValue
    notSaleExtendAttrs.forEach((item) => {
      const { attrName, attrValue, attrType } = item;
      assignAttr({
        attrType,
        attrName,
        attrValue,
        isDel: attrType === 3,
      });
    });
    // 升序排序
    sortByOrderSeq(saleAttrs, 'attrOrderSeq');
    return [saleAttrs, baseAttrs, specAttrs];
  }

  // 校验基本属性中的品牌型号值和销售属性不一致， 给型号｜品牌设置值 跳过必输
  validateAttrField = (saleList) => {
    const isReceive = customStore.getState('isReceive');
    const record = this.customAttrDs.current;
    const fields = [
      {
        fieldName: 'brandName',
        type: isReceive ? 'object' : 'string',
        defaultValue: {
          attrValueName: 'brand',
        },
        saleAttr: saleList.find((s) => s.attributeCode === '000000000001'),
        // sku行上取得
        getCustomValue: (fieldName) => {
          const { attrValueId, attrValueName } = record.get(fieldName) || {};
          return attrValueId || attrValueName;
        },
        // skuSpecsList ？ sku自己的规格属性
        getSaleValue: (saleAttr) =>
          saleAttr?.attrValueId || saleAttr?.attrValueName || saleAttr?.description,
        valueEqualSale: (customValue, saleValue) => {
          return customValue && saleValue && customValue !== saleValue;
        },
      },
      {
        fieldName: 'model',
        // defaultValue: 'model',
        saleAttr: saleList.find((s) => s.attributeCode === '000000000002'),
        getCustomValue: (fieldName) => record.get(fieldName),
        getSaleValue: (saleAttr) =>
          saleAttr?.attrValueId || saleAttr?.attrValueName || saleAttr?.description,
        valueEqualSale: (customValue, saleValue) => {
          return customValue && saleValue && customValue !== saleValue;
        },
      },
    ];
    let equalFlag = false;
    fields.forEach((f) => {
      const {
        fieldName,
        type,
        saleAttr,
        defaultValue,
        getCustomValue,
        getSaleValue,
        valueEqualSale,
      } = f;
      const value = record.get(fieldName);
      const customValue = getCustomValue(fieldName); // 表单的属性值
      const saleValue = getSaleValue(saleAttr); // 销售属性值
      const valueEqual = valueEqualSale(customValue, saleValue);
      if (valueEqual) equalFlag = true;
      const setValue = type === 'object' ? saleAttr : saleValue;
      if (saleAttr && !value) record.set(fieldName, setValue || defaultValue);
    });
    if (equalFlag) {
      notification.error({
        message: intl
          .get('smpc.product.view.message.attrValueValidate')
          .d('已配置为销售规格的基础属性不允许在此更改，请至配置销售规格处更改。'),
      });
      return false;
    }
    return true;
  };

  /**
   * 商品属性的修改保存
   * @param {0} record: 当前sku
   * @param {1} saleAttrRecords: 编辑属性-销售规格数据
   * @returns
   */
  @Bind()
  async handleSaveAttrs({ record, saleAttrRecords }) {
    const isReceive = customStore.getState('isReceive');
    const baseFlag = await this.baseAttrsDs.validate();
    // 处理个性化字段必输性
    const saleList = record.get('skuSpecsList') || [];
    const allSkuFlag = this.attrAllDs.current.get('allSkuFlag');
    // 是否存在为品牌或型号的销售属性
    const baseAttrApplySaleAttr = saleAttrRecords.filter((s) =>
      ['000000000001', '000000000002'].includes(s?.attributeCode)
    );
    const attrFlag = this.validateAttrField(saleList); // 销售属性和基本属性值不一样
    const customFlag = await this.customAttrDs.validate();
    const specFlag = await this.specAttrsDs.validate();
    if (baseFlag && customFlag && specFlag && attrFlag) {
      let attrsList = [];
      const baseAttrs = this.baseAttrsDs.toData();
      const specAttrs = this.specAttrsDs.toData();
      [...baseAttrs, ...specAttrs].forEach((item) => {
        const { singleAttrValLov, multiAttrValLov, ...others } = item;
        if (item.operationType === 1 || item.operationType === 3) {
          attrsList.push(setAttrFields({ ...(singleAttrValLov || {}), ...others }));
        } else if (item.operationType === 2) {
          if (item.attributeCode === '000000000007') {
            // 包装尺寸
            const { height, width, length } = item;
            attrsList.push({
              ...others,
              description: height && width && length ? `${length},${width},${height}` : '',
            });
          } else if (item.attributeCode === '000000000006') {
            // 重量
            const { weight = '', weightUom = '' } = item;
            attrsList.push({
              ...others,
              description: weight ? `${weight},${weightUom}` : '',
            });
          } else attrsList.push(setAttrFields(others));
        } else if (item.operationType === 0) {
          (multiAttrValLov || []).forEach((r) => {
            attrsList.push(setAttrFields({ ...others, ...r }));
          });
        } else attrsList.push(setAttrFields(others));
      });
      attrsList = attrsList.filter(
        (f) => f.attrValueId || f.attrValueName || f.attrValue || f.description
      );
      // console.log('attrsList', attrsList)
      // 获取修改后的属性（合并旧有的销售属性）| 规格属性会有删除的情况
      const getChangeAttrs = (updateAttrs, oldAttrs) => {
        // updateAttrs 变更后的属性 oldAttrs商品上已存的属性
        // 得到销售属性（固定）
        const saleAttrs = oldAttrs.filter((f) => {
          return f.attrType === 1;
        });
        // 合并属性
        const mergeAttrs = updateAttrs.map((m) => {
          const findOldAttr = oldAttrs.find((f) => isEqualAttr(m, f)) || {};
          return { ...findOldAttr, ...m };
        });
        return [...mergeAttrs, ...saleAttrs].map((f) => {
          const _f = { ...f };
          delete _f.skuId;
          delete _f.skuAttrId;
          return _f;
        });
      };
      // 自定义属性的值
      const customAttr = this.customAttrDs.current.get(['brandName', 'model', 'packingList']);
      const { brandName, ...others } = customAttr;
      let brandObj = {};
      // 领用品牌是下拉
      if (isReceive) {
        const { attrValueId, attrValueCode, attrValueName } = brandName || {};
        brandObj = {
          brandId: attrValueCode ? attrValueId : null,
          brandCode: attrValueCode,
          brandName: attrValueName,
        };
      } else {
        brandObj = {
          // 处理历史数据，防止品牌未更新
          brandId: record.get('brandName') === brandName ? record.get('brandId') : null,
          brandName,
        };
      }
      const skuCustomAttrs = {
        ...others,
        ...brandObj,
      };
      const delAttrByCode = (attrs, attrCode) => {
        const attrIndex = attrs.findIndex((f) => f.attrCode === attrCode);
        if (attrIndex > -1) {
          attrs.splice(attrIndex, 1);
        }
      };

      const handleSkuCustomAttrs = () => {
        const copy = Object.assign({}, skuCustomAttrs);
        if (allSkuFlag && baseAttrApplySaleAttr.length > 0) {
          baseAttrApplySaleAttr.forEach((f) => {
            if (f.attributeCode === '000000000002') delete copy.model;
            else if (f.attributeCode === '000000000001') {
              delete copy.brandId;
              delete copy.brandCode;
              delete copy.brandName;
            }
          });
        }
        return copy;
      };

      // 改变sku的属性/扩展属性
      const setAttrs = (r) => {
        const { skuAttrList, skuAttrExtendList } = r.toData();
        const skuAttrs = skuAttrList || [];
        const skuExtends = skuAttrExtendList || [];

        const changeSkuAttrs = getChangeAttrs(
          attrsList.filter((f) => f.attrId),
          skuAttrs
        );
        const changeSkuAttrExtends = getChangeAttrs(
          attrsList.filter((f) => !f.attrId),
          skuExtends
        );
        // 场景： 品牌、型号为销售属性 || 品牌、型号开始为销售属性，删除立即在基本属性维护保存
        // 删除品牌
        if (
          !skuCustomAttrs.brandName ||
          (!saleAttrRecords.find((s) => s?.attributeCode === '000000000001') &&
            skuCustomAttrs.brandName)
        ) {
          delAttrByCode(changeSkuAttrs, '000000000001');
        }

        // 删除型号
        if (
          !skuCustomAttrs.model ||
          (!saleAttrRecords.find((s) => s?.attributeCode === '000000000002') &&
            skuCustomAttrs.model)
        ) {
          delAttrByCode(changeSkuAttrs, '000000000002');
        }
        // 品牌、型号为销售属性，sku应用至全部，不应更改其他sku的品牌型号（否则 validateAttrField校验有误）
        // 当前记录
        if (r.index === record.index) {
          r.set(skuCustomAttrs);
        } else {
          r.set(handleSkuCustomAttrs());
        }
        r.set('skuAttrList', changeSkuAttrs);
        r.set('skuAttrExtendList', changeSkuAttrExtends);
      };

      this.handleSetValue({ dataSet: this.attrAllDs, record, customSetValue: setAttrs });

      return true;
    }
    return false;
  }

  // 校验销售信息
  validateSaleInfo = async ({ skuRecord, ds, skuSalesInfos }) => {
    const validateRes = getResponse(await validateSaleLine(skuSalesInfos));
    if (validateRes) {
      if (validateRes.length < 1) {
        skuRecord.set('skuSalesInfos', skuSalesInfos);
        return true;
      } else {
        notification.error({
          message: intl
            .get('smpc.product.view.message.saleLineRepeat')
            .d('相同区域组织，存在已生效或待生效的价格，请勿重复新增！'),
        });
        ds.records.forEach((record) => {
          if (validateRes.some((s) => s._uuid === record.get('_uuid'))) {
            record.set('repeatError', true);
          }
        });
        return false;
      }
    } else {
      return false;
    }
  };

  // 售后保存
  @Bind()
  async handleSaveAfs(record) {
    const flag = await this.saleAfterFormDs.validate();
    if (flag) {
      const afterSale = this.saleAfterFormDs.current.toJSONData();
      this.handleSetValue({
        dataSet: this.saleAfterFormDs,
        name: 'afterSale',
        value: afterSale,
        record,
      });
      return true;
    }
    return false;
  }

  // 商品名称改变触发更新initialSkuName
  updateInitialSkuName = (record, val) => {
    record.set('initialSkuName', val);
  };

  // spu名称改变联动改变skuName
  updateSkuNameBySpuName = (spuName) => {
    const { tableDs } = this.props;
    const { saleSpecColumns = [] } = this.state;
    tableDs.forEach((record) => {
      setSkuNameBySpecs({ spuName, record, dynamicColumns: saleSpecColumns });
    });
  };

  /**
   * 更新商品名称
   */
  @Bind()
  handleBatchUpdateSkuName() {
    const { tableDs, formDs } = this.props;
    const { saleSpecColumns = [] } = this.state;
    const { spuName } = formDs.current.toData();
    const records = tableDs.selected.length > 0 ? tableDs.selected : tableDs;
    records.forEach((record) => {
      setSkuNameBySpecs({ spuName, record, dynamicColumns: saleSpecColumns });
    });
  }

  @Bind()
  getColumns({ priceNoEdit }) {
    const { saleSpecColumns = [], priceEditPermission, giftCheckFlag } = this.state;
    const { receiveToItem, oldReceive } = this.props;
    const { spuId } = this.props;
    const isEdit = !spuId || (spuId && priceEditPermission);
    const isReceive = customStore.getState('isReceive');
    return [
      {
        width: 70,
        name: 'displayOrderSeq',
        editor: true,
        align: 'left',
      },
      statusColumn(),
      ...saleSpecColumns.map((m) => ({ ...m, sort: 2, isStdDynamic: true })), // 销售规格列
      {
        width: 120,
        name: 'skuCode',
        renderer: ({ value }) => value || '-',
      },
      {
        minWidth: 200,
        name: 'skuName',
        editor: (record) => {
          return <IntlField onChange={(val) => this.updateInitialSkuName(record, val)} />;
        },
      },
      {
        name: 'skuTitle',
        width: 140,
        editor: true,
      },
      {
        name: 'thirdSkuCode',
        width: 150,
        editor: true,
      },
      {
        name: 'marketPrice',
        width: 120,
        editor: (record) => {
          return precisionEditor({
            record,
            type: 'currency',
            name: 'marketPrice',
            disabled: record.get('skuId') && priceNoEdit,
          });
        },
      },
      {
        name: 'skuImageList',
        width: 120,
        header: this.getQuickColHeader('skuImageList'),
        renderer: ({ name, record }) => {
          const text = intl.get('smpc.product.model.editImg').d('编辑图片');
          return <a onClick={() => this.handleQuickEdit({ name, record, isEdit })}>{text}</a>;
        },
      },
      {
        name: 'introduction',
        width: 120,
        header: this.getQuickColHeader('introduction'),
        renderer: ({ name, record }) => {
          const text = intl.get('smpc.product.model.editIntro').d('编辑介绍');
          return <a onClick={() => this.handleQuickEdit({ name, record, isEdit })}>{text}</a>;
        },
      },
      {
        name: 'skuAttrList',
        width: 120,
        header: this.getQuickColHeader('skuAttrList'),
        renderer: ({ name, record }) => {
          const text = intl.get('smpc.product.view.editAttr').d('编辑属性');
          return <a onClick={() => this.handleQuickEdit({ name, record, isEdit })}>{text}</a>;
        },
      },
      {
        name: 'priceInfo',
        width: 120,
        header: this.getQuickColHeader('priceInfo'),
        renderer: ({ name, record }) => {
          const editText = intl.get('smpc.product.view.editPriceInfo').d('编辑价格信息');
          const viewText = intl.get('smpc.product.view.viewPriceInfo').d('查看价格信息');
          return (
            <a onClick={() => this.handleQuickEdit({ name, record, isEdit })}>
              {isEdit ? editText : viewText}
            </a>
          );
        },
      },
      {
        name: 'saleAgreementHeaderIdList',
        width: 140,
        show: isReceive,
        editor: true,
      },
      {
        name: 'itemLov',
        header: this.getQuickColHeader('itemLov'),
        width: 140,
        editor: <Lov clearButton={false} />,
      },
      {
        name: 'itemName',
        width: 140,
      },
      {
        name: 'itemCategoryLov',
        header: this.getQuickColHeader('itemCategoryLov'),
        width: 140,
        editor: (
          <Lov
            clearButton={false}
            tableProps={{
              selectionMode: 'rowbox',
            }}
          />
        ),
      },
      {
        name: 'itemCategoryName',
        width: 140,
      },
      {
        name: 'skuStockList',
        width: 120,
        show: isReceive,
        renderer: ({ name, record }) => {
          const isNew = !record.get('skuId');
          const editText = intl.get('smpc.product.view.editStockInfo').d('编辑库存信息');
          // 新领用租户未开启自动生成物料的首次新建商品 || 新租户二次编辑无物料
          const disabled =
            (!oldReceive && isNew && !record.get('itemId') && !receiveToItem) ||
            (!oldReceive && !isNew && !record.get('itemId'));
          return (
            <Tooltip
              title={
                disabled
                  ? intl.get('smpc.product.view.editStockTip').d('请先维护物料再编辑库存')
                  : ''
              }
            >
              <Button
                onClick={() => this.handleQuickEdit({ name, record, isEdit })}
                funcType="link"
                disabled={disabled}
              >
                {editText}
              </Button>
            </Tooltip>
          );
        },
      },
      {
        name: 'labels',
        width: 120,
        header: this.getQuickColHeader('labels'),
        renderer: ({ name, record }) => {
          const text = intl.get('smpc.product.view.editLabel').d('编辑标签');
          return <a onClick={() => this.handleQuickEdit({ name, record, isEdit })}>{text}</a>;
        },
      },
      {
        name: 'skuStock',
        width: 140,
        align: 'left',
        hidden: isReceive,
        editor: (record) => {
          const { skuId } = record.toData();
          if (skuId) {
            return false;
          } else {
            return (
              <NumberField
                placeholder={intl.get('smpc.product.model.defaultNoLimitStock').d('默认无限库存')}
              />
            );
          }
        },
        renderer: ({ record, value, text }) => {
          const skuId = record.get('skuId');
          const totalStock = record.get('totalStock');
          if (!skuId) {
            return text;
          }
          if (totalStock === -1 || isNaN(totalStock)) {
            return intl.get('smpc.product.model.noLimitStock').d('无限库存');
          } else {
            return value;
          }
        },
      },
      {
        name: 'afterSale',
        width: 120,
        // hidden: isReceive,
        header: this.getQuickColHeader('afterSale'),
        renderer: ({ name, record }) => {
          const text = intl.get('smpc.product.view.editAfs').d('编辑售后');
          return <a onClick={() => this.handleQuickEdit({ name, record, isEdit })}>{text}</a>;
        },
      },
      {
        name: 'giveawayFlag',
        width: 80,
        editor: true,
        show: giftCheckFlag,
      },
      {
        name: 'giveRules',
        width: 120,
        show: giftCheckFlag,
        renderer: ({ name, record }) => {
          const { giveawayFlag } = record.get(['giveawayFlag']);
          return (
            <Button
              funcType="link"
              disabled={giveawayFlag}
              onClick={() => this.handleQuickEdit({ name, record, isEdit })}
            >
              {intl.get('smpc.product.model.editGiveRules').d('编辑赠品规则')}
            </Button>
          );
        },
      },
      {
        name: 'thirdInfo',
        width: 120,
        hidden: isReceive,
        renderer: ({ name, record }) => {
          const text = intl.get('hzero.common.edit').d('编辑');
          return <a onClick={() => this.handleQuickEdit({ name, record, isEdit })}>{text}</a>;
        },
      },
    ].filter((f) => f.show !== false);
  }

  getPermissionBtn({ funcType = 'flat', color = 'primary', ...rest }) {
    const { path, isSup } = this.props;
    const BaseButton = (props) => (
      <ObserverBtn funcType={funcType} color={color} {...props} {...rest} />
    );
    const pathFix = isSup ? 'sup' : 'pur';
    const newPath = path.replace(`sku-release-${pathFix}`, `sku-publish-${pathFix}/create`);
    return isSup ? (
      <BaseButton
        permission
        permissionList={[
          {
            code: `${newPath}.button.supplierSkuDetail`,
            type: 'button',
            meaning: '商品工作台（供）-商品详情-商品信息',
          },
        ]}
      />
    ) : (
      <BaseButton
        permission
        permissionList={[
          {
            code: `${newPath}.button.purchaseSkuDetail`,
            type: 'button',
            meaning: '商品工作台（采）-商品详情-商品信息',
          },
        ]}
      />
    );
  }

  getBtns = ({ imgNoEdit, skuNameNoEdit }) => {
    const { req, tableDs, categoryId, noEdit } = this.props;
    const { saleSpecColumns = [] } = this.state; // 如果销售规格列不存在同时 开启权限控制

    const buttons = [
      {
        hidden: req === 'reject',
        button: this.getPermissionBtn({
          icon: 'predefine',
          className: 'set-sale-pecs-btn-warper',
          disabled: noEdit && saleSpecColumns.length < 1,
          onClick: () => this.handleConfigSpecs(skuNameNoEdit),
          text: intl.get('smpc.product.button.setSaleSpecs').d('配置销售规格'),
          help: <StaticToolTip />,
        }),
      },
      {
        hidden: req === 'reject',
        button: this.getPermissionBtn({
          icon: 'playlist_add',
          dataSet: tableDs,
          getDisable: () => tableDs.length > 149,
          onClick: () => this.handleCreate(),
          text: intl.get('smpc.product.button.addSku').d('新增SKU'),
          getTooltip: (ds) =>
            ds.length > 149
              ? intl.get('smpc.product.view.addSkuMaxTip').d('至多添加150个商品')
              : null,
        }),
      },
      {
        hidden: req === 'reject',
        button: this.getPermissionBtn({
          icon: 'delete_sweep',
          dataSet: tableDs,
          getDisable: (data) => data.length === 0,
          onClick: () => this.handleBatchDelete(),
          text: intl.get('smpc.product.button.batchDelete').d('批量删除'),
        }),
      },
      {
        button: this.getPermissionBtn({
          icon: 'photo_library',
          dataSet: tableDs,
          getDisable: () => {
            const isCreate = tableDs.records.some((s) => !s.get('skuId'));
            return !isCreate && imgNoEdit; // 如果没有新增同时开启权限 则禁用
          },
          onClick: () => this.handleLookImages({}, imgNoEdit),
          text: intl.get('smpc.product.button.batchUploadImg').d('批量编辑图片'),
        }),
      },
    ];
    const btns = buttons.filter((f) => !f.hidden).map((m) => m.button);
    return [
      ...(categoryId ? btns : []),
      this.getPermissionBtn({
        icon: 'replay',
        disabled: noEdit,
        onClick: () => this.handleBatchUpdateSkuName(),
        text: intl.get('smpc.product.button.updateProductName').d('更新商品名称'),
      }),
    ];
  };

  render() {
    const { dataError = true, formDs, tableDs, noEdit, approveField } = this.props;
    // 商品名称不可编辑
    const skuNameNoEdit = noEdit || approveField.includes('SPEC_INFO_ITEM_NAME');
    // 平台价格不可编辑
    const priceNoEdit = noEdit || approveField.includes('SALE_INFO_PLATFORM_PRICE');
    // 商品图片不可编辑
    const imgNoEdit = noEdit || approveField.includes('SPEC_INFO_ITEM_IMAGE');
    // 商品介绍不可编辑
    // const introNoEdit = approveField.includes('SPEC_INFO_ITEM_INTRODUCTION');
    // 商品库存不可编辑
    // const stockNoEdit = noEdit || approveField.includes('SALE_INFO_ITEM_STOCK');
    const columns = this.getColumns({
      priceNoEdit,
    });

    const buttons = this.getBtns({
      imgNoEdit,
      skuNameNoEdit,
    });

    const { customizeForm, customizeTable } = customStore.getCustFuncs();
    const isReceive = customStore.getState('isReceive');
    if (tableDs && isReceive) {
      tableDs.selection = false;
    }
    return (
      <Spin spinning={dataError} wrapperClassName={styles.specs}>
        {formDs &&
          !isReceive &&
          customizeForm(
            { code: customStore.getCustomCode('SPU_INFO') },
            <Form dataSet={formDs} labelLayout="float" columns={5} style={{ marginBottom: '16px' }}>
              <IntlField
                name="spuName"
                disabled={skuNameNoEdit}
                onChange={this.updateSkuNameBySpuName}
              />
            </Form>
          )}

        {tableDs &&
          customizeTable(
            { code: customStore.getCustomCode('SKU_LIST'), dynamicIndex: 2 },
            <Table buttons={isReceive ? [] : buttons} dataSet={tableDs} columns={columns} />
          )}

        {/* 用于临时挂载个性化的容器 */}
        <div id="sku-wrapper" />
      </Spin>
    );
  }
}
