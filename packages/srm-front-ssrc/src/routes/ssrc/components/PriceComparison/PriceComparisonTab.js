/* eslint-disable no-unused-expressions */
import React, { PureComponent } from 'react';
import { Dropdown, Icon, Menu, Modal, Popover, Spin, Table } from 'hzero-ui';
import { difference, isArray, isEmpty, isNull, isUndefined, sum, without, isNil } from 'lodash';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import { math } from 'choerodon-ui/dataset';

import Checkbox from 'components/Checkbox';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import SVGIcon from '@/routes/components/SvgIcon';

import { numberSeparatorRender } from '@/utils/renderer';
// import { getUomName, getQtyName } from '@/utils/utils';
// 后续要回退，先暂时写
import { getCurrentTenant } from 'utils/utils';
import style from './index.less';
import configImg from '../../../../assets/config.svg';
import DynamicConfiguration from './DynamicConfiguration';

const emptyList = [];

export default class PriceComparisonTab extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      itemConfigVisible: false, // 报价信息动态配置项弹框
      itemConfigSelected: [], // 物品配置选中项
      supplierConfigVisible: false, // 供应商动态配置项弹框
      supplierConfigSelected: [], // 供应商配置选中项
      itemVisible: false, // 物品筛选框
      itemSelected: [], // 物品选中项
      supplierVisible: false, // 供应商选中框
      supplierSelected: [], // 供应商选中项
      materialConfigVisible: false, // 物料信息动态配置项弹框
      materialConfigSelected: [], // 物料信息配置选中想项
      AllConfigItem: [],
      minQuoPriceMap: {}, // 物料维度, 获取该物料下, 报价最低供应商对应的价格 ps: { 'item1': 10, 'item2': 20}  // 防止最低价, 价格相同, 出现多个供应商
      maxLengthSupplierList: null, // 计算出的最大供应商list
    };
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { itemList } = this.props;
    if (isArray(nextProps.itemList) && nextProps.itemList !== itemList) {
      this.setMinQuoPriceMap(nextProps.itemList);
    }
  }

  /**
   * 基于物料维度, 获取最低价
   * @param {Array} itemList - 物料列表
   */
  setMinQuoPriceMap(itemList) {
    const tempMinQuoPriceMap = {}; // 临时最低价Map对象
    itemList.forEach((item) => {
      let tempMinQuoPrice = ''; // 临时最低价
      const { quotationInfoList = [] } = item;
      quotationInfoList.forEach((ele) => {
        const { supplierInfoList = [] } = ele;
        // 针对 ele 为 `NET_PRICE` 进行排序
        if (
          ele.configItem === 'NET_PRICE' &&
          isArray(supplierInfoList) &&
          !isEmpty(supplierInfoList)
        ) {
          const tempArr = [...supplierInfoList].filter(
            (supplier) => !isUndefined(supplier.value) && !isNull(supplier.value)
          ); // 需要先过滤无货的供应商, 表现即为 `未税单价` 不存在
          tempArr.sort((a, b) => Number(a.value) - Number(b.value));
          tempMinQuoPrice = tempArr[0] && tempArr[0].value;
        }
      });
      tempMinQuoPriceMap[item.rfxLineItemId] = tempMinQuoPrice;
    });
    this.setState({
      minQuoPriceMap: {
        ...tempMinQuoPriceMap,
      },
    });
  }

  /**
   * 选择配置项-确定
   */
  @Bind()
  selectConfigOk(type) {
    const { onSelectConfigOk } = this.props;
    const {
      itemConfigSelected = [],
      supplierConfigSelected = [],
      materialConfigSelected = [],
      allsupplierConfig = [],
      allitemConfig = [],
      allmaterialConfig = [],
    } = this.state;
    // 动态配置项选中对应state字段
    const selectedConfigs = {
      itemConfig: itemConfigSelected, // 报价信息
      supplierConfig: supplierConfigSelected, // 供应商信息
      materialConfig: materialConfigSelected, // 物料信息
    };
    // 动态配置项全部选中对应的state字段
    const allItemConfigs = {
      itemConfig: allitemConfig, // 报价信息
      supplierConfig: allsupplierConfig, // 供应商信息
      materialConfig: allmaterialConfig, // 物料信息
    };
    // 动态配置项对应的传参字段
    const configTypes = {
      itemConfig: 'QUOTATION', // 报价信息
      supplierConfig: 'SUPPLIER', // 供应商信息
      materialConfig: 'ITEM', // 物料信息
    };
    const params = {
      configItem: selectedConfigs[type].join(';'),
      allConfigItem: allItemConfigs[type].join(';'),
      configType: configTypes[type],
    };
    onSelectConfigOk(params);
  }

  /**
   * 获取动态配置项全部config
   */
  @Bind()
  getAllConfigItem(configType, list, countList) {
    const requestList = [...list, ...countList].map((item) => item.key);
    this.setState({
      [`all${configType}`]: requestList,
    });
  }

  /**
   * 全选物品、供应商
   */
  @Bind()
  changeKeyAll(dataSource, type) {
    const { itemSelected = [], supplierSelected = [] } = this.state;
    const key = type === 'item' ? 'rfxLineItemId' : 'quotationHeaderId';
    const selectedData = type === 'item' ? itemSelected : supplierSelected;
    const keys = dataSource.map((item) => item[key]);
    // 反选
    if (isEmpty(difference(keys, selectedData))) {
      this.setState({
        [`${type}Selected`]: [],
      });
    } else {
      // 全选
      this.setState({
        [`${type}Selected`]: keys,
      });
    }
  }

  /**
   * 改变物品/供应商/物品配置/供应商配置勾选
   */
  @Bind()
  changeSelected(checked, code, type) {
    // 勾选
    if (checked) {
      this.setState({
        [`${type}Selected`]: [...this.state[`${type}Selected`], code],
      });
    } else {
      // 取消勾选
      const otherCode = without(this.state[`${type}Selected`], code);
      this.setState({
        [`${type}Selected`]: otherCode,
      });
    }
  }

  /**
   * 设置配置初始勾选项
   */
  @Bind()
  setConfigSelected(type) {
    const { itemList = [], supplierList = [] } = this.props;
    let config = [];
    switch (type) {
      case 'item':
        config = !isEmpty(itemList) && itemList.map((item) => item.rfxLineItemId);
        break;
      case 'supplier':
        config =
          !isEmpty(supplierList) &&
          !isEmpty(supplierList[0].supplierList) &&
          supplierList[0].supplierList.map((item) => item.quotationHeaderId);
        break;
      case 'itemConfig':
        config =
          (!isEmpty(itemList) &&
            !isEmpty(itemList[0].quotationInfoList) &&
            itemList[0].quotationInfoList.map((item) => item.configItem)) ||
          [];
        if (!isEmpty(itemList) && !isEmpty(itemList[0].countConfigItemList)) {
          config = [...config, ...itemList[0].countConfigItemList];
        }
        break;
      case 'supplierConfig':
        config = !isEmpty(supplierList) && supplierList.map((item) => item.configItem);
        break;
      case 'materialConfig':
        config =
          (!isEmpty(itemList) &&
            !isEmpty(itemList[0]?.itemInfoList) &&
            itemList[0].itemInfoList.map((item) => item.configItem)) ||
          [];
        break;
      default:
        config = [];
        break;
    }
    if (isEmpty(config)) return;
    this.setState({ [`${type}Selected`]: config });
  }

  /**
   * 动态配置项 - 打开
   */
  @Bind()
  showModal(type) {
    // 动态配置项对应的传参字段
    const configTypes = {
      itemConfig: 'QUOTATION', // 报价信息
      supplierConfig: 'SUPPLIER', // 供应商信息
      materialConfig: 'ITEM', // 物料信息
    };
    if (type in configTypes) {
      // 为了解决版本记录不一致,configId
      this.props.onFetchConfigs({ configType: configTypes[type] }).then((res) => {
        if (res) {
          this.setState({
            [`all${type}`]: res.allConfigItem?.split(';'),
          });
        }
      });
      this.setConfigSelected(type);
    }
    this.setState({
      [`${type}Visible`]: true,
    });
  }

  /**
   * 动态配置项 - 关闭
   */
  @Bind()
  hideModal(type) {
    this.setState({
      [`${type}Visible`]: false,
    });
  }

  /**
   * 供应商信息跳转360页面
   */
  @Bind()
  handleJumpSuppler(record) {
    const { onHideModal, disabledAllLinkFlag = false, sslmLifeCycleFlag = true } = this.props;
    const {
      tenantId,
      companyId,
      partnerCompanyId,
      partnerTenantId,
      spfmSupplierCompanyId,
      supplierCompanyId,
    } = record;

    if (
      !companyId ||
      !partnerCompanyId ||
      !partnerTenantId ||
      !spfmSupplierCompanyId ||
      !supplierCompanyId ||
      disabledAllLinkFlag
    ) {
      return;
    } else if (onHideModal) {
      onHideModal();
    }

    const searchObj = {
      tenantId,
      partnerTenantId,
      companyId,
      supplierCompanyId,
    };
    const newSupplierDetailPath = sslmLifeCycleFlag
      ? '/sslm/include/supplier-manager/supplier-detail'
      : '/sslm/supplier-detail-new';
    if (window.top !== window) {
      window.parent.postMessage({
        type: 'link',
        data: JSON.stringify({
          pathname: newSupplierDetailPath,
          search: qs.stringify(searchObj),
        }),
      });
    } else {
      openTab({
        key: newSupplierDetailPath,
        path: newSupplierDetailPath,
        title: intl.get('hzero.common.view.message.360QueryDetail').d('供应商360查询'),
        search: qs.stringify(searchObj),
        closable: true,
      });
    }
  }

  renderSupplierDataSource() {
    const { supplierList = [] } = this.props;
    if (isEmpty(supplierList)) return [];
    const separatorField = [
      'BID_AMOUNT_TOTAL',
      'BID_COUNT_TOTAL',
      'QUO_COUNT_TOTAL',
      'SUPPLIER_SAVING_AMOUNT',
    ];
    const dataSource = supplierList.map((item, itemIndex) => {
      let eleItem = {};
      const { configItem, supplierList: supplier, ...otherItem } = item;
      // 千分位处理
      if (separatorField.includes(configItem)) {
        supplier.forEach((e) => {
          eleItem = {
            ...eleItem,
            [e.quotationHeaderId]: numberSeparatorRender(`${e.value}`),
          };
        });
      } else {
        supplier.forEach((e) => {
          eleItem = {
            ...eleItem,
            [e.quotationHeaderId]: isNil(e.value) ? '' : e.value,
          };
        });
      }
      return {
        ...otherItem,
        ...eleItem,
        rowLength: supplierList.length, // 用于判断行合并
        position: itemIndex + 1, // 用于判断行合并
      };
    });

    return dataSource;
  }

  renderSupplierColumns() {
    const { supplierList = [], disabledAllLinkFlag = false } = this.props;
    let supplierColumns = [];
    if (!isEmpty(supplierList)) {
      supplierColumns = supplierList[0].supplierList.map((item) => {
        return {
          // item.supplierName
          title: item.supplierCompanyId ? (
            <a onClick={() => this.handleJumpSuppler(item)} disabled={disabledAllLinkFlag}>
              {item.supplierName}
            </a>
          ) : (
            item.supplierName
          ),
          dataIndex: item.quotationHeaderId,
          width: 260,
          // render: (val, record) => <a>{val}</a>,
        };
      });
    }
    return [
      {
        title: '',
        dataIndex: 'supplierTitle',
        width: 200,
        render: (text, record) => {
          // 从第一行开始，到rowLength结束，行合并
          if (record.position === 1) {
            return {
              children: intl
                .get('ssrc.priceComparison.model.comparison.supplierInfo')
                .d('供应商信息'),
              props: {
                rowSpan: record.rowLength,
              },
            };
          } else {
            return {
              children: intl
                .get('ssrc.priceComparison.model.comparison.supplierInfo')
                .d('供应商信息'),
              props: {
                rowSpan: 0,
              },
            };
          }
        },
      },
      {
        title: (
          <React.Fragment>
            {intl.get('ssrc.priceComparison.model.comparison.supplierInfo').d('供应商信息')}
            <span
              className={style['quoteInfo-icon']}
              onClick={() => this.showModal('supplierConfig')}
            >
              <SVGIcon path={configImg} />
            </span>
          </React.Fragment>
        ),
        dataIndex: 'configItemMeaning',
        width: 135,
      },
      ...supplierColumns,
    ];
  }

  /**
   * 渲染物品信息数据源
   * @protected 爱学习二开
   */
  renderDataSource() {
    const { itemList = [], quotationCountData = [], remoteFunc, header = {} } = this.props;
    if (isEmpty(itemList)) return [];
    let dataSource = [];
    const separatorField = [
      'CURRENT_QUOTATION_QUANTITY',
      'NET_PRICE',
      'BASE_NET_PRICE',
      'TAX_PRICE',
      'BASE_TAX_QUOTATION_PRICE',
      'FREIGHT_AMOUNT',
      'LINE_PRICE',
      'NET_LINE_PRICE',
      'MIN_HISTORY_PRICE',
      'MAX_HISTORY_PRICE',
      'AVG_HISTORY_PRICE',
      'MIN_HISTORY_NET_PRICE',
      'MAX_HISTORY_NET_PRICE',
      'AVG_HISTORY_NET_PRICE',
      'MIN_HISTORY_TAX_PRICE',
      'MAX_HISTORY_TAX_PRICE',
      'AVG_HISTORY_TAX_PRICE',
      'FREIGHT_LINE_PRICE',
      'BID_AMOUNT_TOTAL',
      'EXCHANGE_RATE',
      'MIN_PURCHASE_QUANTITY',
      'MIN_PACKAGE_QUANTITY',
      'DELIVERY_CYCLE',
    ];
    const filterField = quotationCountData.map((item) => item.value); // 小计值集
    itemList.forEach((item, lineIndex) => {
      const { quotationInfoList = [], ...otherItem } = item;
      let newDataSource = quotationInfoList
        .map((ele, eleIndex) => {
          let eleItem = {};
          const { configItem, supplierInfoList = [], ...otherEle } = ele;
          // 千分位处理
          if (filterField.includes(configItem)) {
            return false;
          }
          if (separatorField.includes(configItem)) {
            supplierInfoList.forEach((e) => {
              eleItem = {
                ...eleItem,
                // 后续会回退
                configItem,
                [`${e.quotationHeaderId}overFlag`]: e.overFlag,
                [e.supplierName]: isNil(e.value) ? '' : `${e.value}`,
                [`${e.quotationHeaderId}EliminateFlag`]: e.eliminateFlag,
                [`${e.quotationHeaderId}auctionDirectionTopFlag`]: e.auctionDirectionTopFlag || 0,
                [`${e.quotationHeaderId}suggestedFlag`]: e.suggestedFlag || 0,
              };
            });
          } else {
            supplierInfoList.forEach((e) => {
              eleItem = {
                ...eleItem,
                configItem,
                [e.supplierName]: isNil(e.value) ? '' : `${e.value}`,
                [`${e.quotationHeaderId}EliminateFlag`]: e.eliminateFlag,
                [`${e.quotationHeaderId}auctionDirectionTopFlag`]: e.auctionDirectionTopFlag || 0,
                [`${e.quotationHeaderId}suggestedFlag`]: e.suggestedFlag || 0,
              };
            });
          }
          return {
            ...otherItem,
            ...otherEle,
            ...eleItem,
            rowLength: quotationInfoList.length, // 用于判断行合并
            position: eleIndex + 1, // 用于判断行合并
            rowKey: uuid(), // 用于表格每一行的key
            rowIndex: lineIndex + 1, // 用于计算奇数偶数行，加斑马纹样式
          };
        })
        .filter(Boolean);
      newDataSource = newDataSource.map((itemDate, index) => {
        return {
          ...itemDate,
          position: index + 1,
          rowLength: newDataSource.length,
        };
      });
      dataSource = [...dataSource, ...newDataSource];
    });
    const {
      summarySupplierList = [],
      countConfigItemList = [],
      quotationInfoList = [],
    } = itemList[0];

    const mapObj = {};
    const baseFilterField = [
      'TAX_AMOUNT_SUB',
      'NET_AMOUNT_SUB',
      'TAX_AMOUNT_TOTAL',
      'NET_AMOUNT_TOTAL',
      'SEQUENCE',
      'QUOTATION_LINE_SAVING_AMOUNT',
    ];
    quotationCountData.forEach((countItem = {}, index) => {
      const { value } = countItem || {};
      const defaultConfig = {
        rowKey: uuid(),
        position: index + 1,
        rowLength: 5,
        subSummary: true,
        configItem: value,
        configItemMeaning: countItem.meaning,
      };
      mapObj[value] = defaultConfig;
      summarySupplierList.forEach((item) => {
        const newKey = baseFilterField.includes(value)
          ? value.toLowerCase().replace(/_([a-z])/g, (res) => res[1].toUpperCase())
          : value;
        mapObj[value] = {
          ...mapObj[value],
          [item.supplierName]: baseFilterField.includes(value)
            ? numberSeparatorRender(item[newKey])
            : item[newKey],
        };
      });
    });

    // 报价排名
    // let totalQuotedSequence = {
    //   rowKey: uuid(),
    //   position: 5,
    //   rowLength: 5,
    //   subSummary: true,
    //   configItem: 'totalQuotedSequence',
    //   configItemMeaning: intl
    //     .get('ssrc.priceComparison.model.comparison.totalQuotedSequence')
    //     .d('报价排名'),
    // };
    // summarySupplierList.forEach((item) => {
    //   totalQuotedSequence = {
    //     ...totalQuotedSequence,
    //     [item.supplierName]: item.sequence,
    //   };
    // });

    // 处理小计字段的动态化排列
    let totalSetField = [];
    quotationInfoList.forEach((item) => {
      const { configItem } = item;
      if (filterField.includes(configItem)) {
        totalSetField.push(mapObj[configItem]);
      }
    });
    // let totalSetField = [totalQuotedTax, totalQuotedNet, totalQuotedTaxAll, totalQuotedNetAll];
    totalSetField = totalSetField.filter((item) => countConfigItemList?.includes(item.configItem));
    // totalSetField = [...totalSetField, totalQuotedSequence];
    totalSetField = totalSetField.map((item, index) => {
      return {
        ...item,
        position: index + 1,
        rowLength: totalSetField.length,
      };
    });
    dataSource = remoteFunc
      ? remoteFunc.process(
          'srm-front-ssrc/priceComparison_PROCESS_PRICECOMPARISION',
          [...dataSource, ...totalSetField],
          {
            header,
            dataSource,
          }
        )
      : [...dataSource, ...totalSetField];
    return dataSource;
  }

  renderItemInfo(record) {
    const { remoteFunc, bidFlag = false } = this.props;
    const Style = remoteFunc
      ? remoteFunc.process('srm-front-ssrc/priceComparison_PROCESS_ITEM_INFO_STYLE', {})
      : {};
    // 动态配置项对应的需要显示的对应值
    /**
     * 'SECONDARY_QUANTITY' -- 需求数量
      'SECONDARY_CODE_NAME' -- 单位
      'RFX_QUANTITY' -- 基本数量/需求数量
      'UOM_CODE_NAME' -- 基本单位/基本单位
      'OU_NAME' -- 业务实体
      'INV_ORGANIZATION_NAME' -- 库存组织
     */
    const itemConfigTerms = [
      'SECONDARY_QUANTITY',
      'SECONDARY_CODE_NAME',
      'RFX_QUANTITY',
      'UOM_CODE_NAME',
      'OU_NAME',
      'INV_ORGANIZATION_NAME',
    ];
    // 需要用popover标签显示的元素
    const popoverConfigItems = ['OU_NAME', 'INV_ORGANIZATION_NAME'];
    // 需要数字格式化的字段
    const numberSeparatorTerms = [
      'SECONDARY_QUANTITY',
      'RFX_QUANTITY',
      'ITEM_SAVING_AMOUNT',
      'ITEM_SIGN_POST_PRICE',
    ];
    // 渲染普通dom
    const getRenderDom = (config) => {
      return (
        <div key={config.configItem} style={Style}>
          {config.configItemMeaning}: {config.value}
        </div>
      );
    };
    const itemValues = remoteFunc
      ? remoteFunc.process(
          'srm-front-ssrc/priceComparison_PROCESS_ITEM_VALUES',
          [
            'ITEM_CODE',
            'ITEM_NAME',
            'BRAND',
            'MODEL',
            'SPECS',
            'RFX_QUANTITY',
            'SECONDARY_QUANTITY',
            'UOM_CODE_NAME',
            'SECONDARY_CODE_NAME',
            'OU_NAME',
            'INV_ORGANIZATION_NAME',
          ],
          {
            bidFlag,
          }
        )
      : [
          'ITEM_CODE',
          'ITEM_NAME',
          'BRAND',
          'MODEL',
          'SPECS',
          'RFX_QUANTITY',
          'SECONDARY_QUANTITY',
          'UOM_CODE_NAME',
          'SECONDARY_CODE_NAME',
          'OU_NAME',
          'INV_ORGANIZATION_NAME',
        ];
    const itemList = record?.itemInfoList?.map((config) => {
      if (config.configItem === 'UOM_CODE_NAME') {
        // 兼容之前已经埋点二开的内容
        return remoteFunc
          ? remoteFunc.render('SSRC_PRICE_COMPARISION_RENDER_UOM', getRenderDom(config))
          : getRenderDom(config);
      } else if (popoverConfigItems.includes(config.configItem)) {
        return (
          <div key={config.configItem} style={Style}>
            {config.configItemMeaning}: <Popover content={config.value}>{config.value}</Popover>
          </div>
        );
      } else if (numberSeparatorTerms.includes(config.configItem)) {
        return (
          <div key={config.configItem} style={Style}>
            {config.configItemMeaning}: {numberSeparatorRender(config.value)}
          </div>
        );
      } else if (itemConfigTerms.includes(config.configItem)) {
        return getRenderDom(config);
      } else if (!itemValues.includes(config.configItem)) {
        return getRenderDom(config);
      }
      return null;
    });
    return (
      <div>
        {remoteFunc
          ? remoteFunc.process(
              'srm-front-ssrc/priceComparison_PROCESS_PRICE_COMPARISION_RENDER_ITEM_INFO_LIST',
              itemList,
              { record }
            )
          : itemList}
      </div>
    );
  }

  renderItem(record) {
    const { remoteFunc, bidFlag = false } = this.props;
    // 动态配置项对应的需要显示的对应值 'ITEM_CODE'-物料编码；'ITEM_NAME'-物料名称；'BRAND'-品牌；'MODEL'-型号；'SPECS'-规格
    const itemConfigTerms = remoteFunc
      ? remoteFunc.process(
          'srm-front-ssrc/priceComparison_PROCESS_ITEM_CONFIG_TERMS',
          ['ITEM_CODE', 'ITEM_NAME', 'BRAND', 'MODEL', 'SPECS'],
          {
            bidFlag,
          }
        )
      : ['ITEM_CODE', 'ITEM_NAME', 'BRAND', 'MODEL', 'SPECS'];
    const Style = remoteFunc
      ? remoteFunc.process('srm-front-ssrc/priceComparison_PROCESS_ITEM_STYLE', {})
      : {};
    return record?.itemInfoList?.map((config) => {
      if (itemConfigTerms.includes(config.configItem)) {
        return (
          <div key={config.configItem} style={Style}>
            {config.configItemMeaning}: {config.value}
            {remoteFunc
              ? remoteFunc.render(
                  'srm-front-ssrc/priceComparison_PROCESS_PRICE_COMPARISION_RENDER_ITEM_CODE_TAG',
                  null,
                  { record, config }
                )
              : null}
          </div>
        );
      }
      return null;
    });
  }

  renderSupplierTag(item) {
    const tagList = [];
    if (item.wholeSuggestFlag === 1) {
      tagList.push(
        <span className={style['priceComparisonTab-supplierSelectTag']}>
          {intl.get('ssrc.inquiryHall.model.inquiryHall.all.selected').d('全部选用')}
        </span>
      );
    } else if (item.partSuggestFlag === 1) {
      tagList.push(
        <span className={style['priceComparisonTab-supplierSelectTag']}>
          {intl.get('ssrc.inquiryHall.model.inquiryHall.part.selected').d('部分选用')}
        </span>
      );
    }
    if (item.allEliminate) {
      tagList.push(
        <span className={style['priceComparisonTab-supplierTag']}>
          {intl.get('ssrc.common.view.status.allEliminate').d('全部淘汰')}
        </span>
      );
    } else if (item.eliminateFlag) {
      tagList.push(
        <span className={style['priceComparisonTab-supplierTag']}>
          {intl.get('ssrc.common.view.status.partiallyEliminate').d('部分淘汰')}
        </span>
      );
    } else if (item.summaryReviewResult === 'NO_APPROVED') {
      tagList.push(
        <span className={style['priceComparisonTab-supplierTag']}>
          {intl.get('ssrc.common.view.status.noApprovedCheck').d('未通过检查')}
        </span>
      );
    } else if (item.invalidFlag) {
      tagList.push(
        <span className={style['priceComparisonTab-supplierTag']}>
          {intl.get('ssrc.common.view.status.invalid').d('无效')}
        </span>
      );
    }
    // 供应商状态为禁止报价
    if (item.supplierStatus === 'PROHIBIT_QUOTATION') {
      tagList.push(
        <span className={style['priceComparisonTab-supplierTag']}>
          {intl.get('ssrc.common.view.status.banQuotation').d('禁止报价')}
        </span>
      );
    }
    return tagList;
  }

  /**
   * 渲染物品信息列
   * @protected 爱学习二开
   */
  renderColumns() {
    const { itemList = [], remoteFunc } = this.props;
    const { maxLengthSupplierList } = this.state;
    let supplierColumns = [];
    let summarySupplierList = [];
    if (!isEmpty(itemList)) {
      // 取最大长度的supplierInfoList,不同物料，不同供应商报价不同  下面if里面的内容兼容之前后端二开返回字段名发生变化导致取不到值问题（已知项目贝泰妮）
      const supplierInfoList = [];
      if (!maxLengthSupplierList) {
        // 优先取外层计算过的 若有二开再重新计算
        // 外层index已经处理 这里再处理一遍 防止有二开出问题
        if (
          (!itemList[0].summarySupplierList || isEmpty(itemList[0].summarySupplierList)) &&
          !isEmpty(itemList[0].quotationInfoList) &&
          !isEmpty(itemList[0].quotationInfoList[0].supplierInfoList)
        ) {
          let max = [];
          itemList.forEach((item) =>
            supplierInfoList.push(item.quotationInfoList[0].supplierInfoList.length)
          );
          max = math.max(...supplierInfoList);
          const indexOfMax = supplierInfoList.indexOf(max);
          summarySupplierList = [
            ...(itemList[indexOfMax].quotationInfoList[0].supplierInfoList ?? []),
          ];
        } else {
          // eslint-disable-next-line prefer-destructuring
          summarySupplierList = itemList[0].summarySupplierList;
        }
      } else {
        summarySupplierList = maxLengthSupplierList;
      }

      let cellStyle = () => ({ whiteSpace: 'normal' });
      // 临时逻辑，下周演示完删掉
      if (getCurrentTenant().tenantNum === 'SRM-WANHUA') {
        cellStyle = (record, item) => {
          if (record.configItem === 'TAX_PRICE' && record[`${item.quotationHeaderId}overFlag`]) {
            return {
              whiteSpace: 'normal',
              margin: '-16px',
              padding: '16px',
              backgroundColor: 'yellow',
            };
          } else {
            return {
              whiteSpace: 'normal',
            };
          }
        };
      }

      supplierColumns = summarySupplierList?.map((item) => {
        return {
          title: (
            <span>
              <span className={style['priceComparisonTab-supplierName']}>
                {item.supplierName}
                {remoteFunc
                  ? remoteFunc.render('SSRC_PRICE_COMPARISION_RENDER_SUPPLIER_NAME', null, { item })
                  : null}
              </span>
              {this.renderSupplierTag(item)}
            </span>
          ),
          dataIndex: item.supplierName,
          width: 260,
          render: (val, record) => {
            return (
              <div
                style={
                  remoteFunc
                    ? remoteFunc.process(
                        'srm-front-ssrc/priceComparison_PROCESS_PRICE_COMPARISION_TABLE_CELLSTYLE',
                        cellStyle(record, item),
                        { record, item, val }
                      )
                    : cellStyle(record, item)
                }
              >
                <span>
                  {record[`${item.quotationHeaderId}auctionDirectionTopFlag`] === 1 ? (
                    <span
                      style={{
                        color: remoteFunc
                          ? remoteFunc?.process(
                              'srm-front-ssrc/priceComparison_PROCESS_PRICE_COMPARISION_TABLE_COLOR',
                              'red'
                            )
                          : 'red',
                      }}
                    >
                      {numberSeparatorRender(val)}
                    </span>
                  ) : (
                    numberSeparatorRender(val)
                  )}
                </span>
                {item.eliminateFlag === 1 &&
                item.allEliminate === 0 &&
                record[`${item.quotationHeaderId}EliminateFlag`] === 1 ? (
                  <span className={style['priceComparisonTab-supplierTag']}>
                    {intl.get('ssrc.common.view.status.eliminate').d('淘汰')}
                  </span>
                ) : (
                  ''
                )}
                {item.partSuggestFlag === 1 &&
                record[`${item.quotationHeaderId}suggestedFlag`] === 1 ? (
                  <span className={style['priceComparisonTab-supplierSelectTag']}>
                    {intl.get('ssrc.inquiryHall.model.inquiryHall.suggest').d('选用')}
                  </span>
                ) : (
                  ''
                )}
              </div>
            );
          },
        };
      });
    }
    let itemColumns = [
      {
        title: '',
        dataIndex: 'item',
        width: 200,
        fixed: 'left',
        render: (text, record) => {
          const obj = {
            children: record.subSummary ? (
              <div className="ssrc-price-comparison-subtotal-colspan-override-style">
                {intl.get('ssrc.priceComparison.model.comparison.subtotal').d('小计')}
              </div>
            ) : (
              this.renderItem(record)
            ),
            props: {},
          };
          if (record.position === 1) {
            obj.props.rowSpan = record.rowLength;
            if (record.subSummary) {
              obj.props.colSpan = 1;
            }
          } else {
            obj.props.rowSpan = 0;
          }
          return obj;
        },
      },
      {
        title: (
          <React.Fragment>
            {intl.get('ssrc.priceComparison.model.comparison.itemInfo').d('物料信息')}
            <span
              className={style['quoteInfo-icon']}
              onClick={() => this.showModal('materialConfig')}
            >
              <SVGIcon path={configImg} />
            </span>
          </React.Fragment>
        ),
        dataIndex: 'itemInfo',
        width: 200,
        render: (text, record) => {
          const obj = {
            children: record.subSummary ? '' : this.renderItemInfo(record),
            props: {},
          };
          if (record.position === 1) {
            obj.props.rowSpan = record.rowLength;
            if (record.subSummary) {
              obj.props.colSpan = 1;
            }
          } else {
            obj.props.rowSpan = 0;
          }
          return obj;
        },
      },
      {
        title: (
          <React.Fragment>
            {intl.get('ssrc.priceComparison.model.comparison.quoteInfo').d('报价信息')}
            <span className={style['quoteInfo-icon']} onClick={() => this.showModal('itemConfig')}>
              <SVGIcon path={configImg} />
            </span>
          </React.Fragment>
        ),
        dataIndex: 'configItemMeaning',
        width: 130,
      },
      ...(supplierColumns ?? []),
    ];

    itemColumns = remoteFunc
      ? remoteFunc.process(
          'srm-front-ssrc/priceComparison_PROCESS_ITEM_TABLE_COLUMNS',
          itemColumns,
          { that: this }
        )
      : itemColumns;

    return itemColumns;
  }

  @Bind()
  renderDropDown(itemMenu, itemVisible, supplierMenu, supplierVisible) {
    const { remoteFunc } = this.props;
    return (
      <div>
        {remoteFunc
          ? remoteFunc.render('SSRC_PRICE_COMPARISION_RENDER_DROP_DOWN', null, {
              current: this,
              document,
            })
          : null}
        <Dropdown
          overlay={itemMenu}
          trigger={['click']}
          visible={itemVisible}
          getPopupContainer={() => document.getElementsByClassName('priceAssistant-filter')[0]}
          onClick={() => this.showModal('item')}
        >
          <a className="ant-dropdown-link dropdown-item" href="#" style={{ marginRight: '16px' }}>
            {intl.get('ssrc.priceComparison.view.message.itemFilter').d('筛选物品')}{' '}
            <Icon type="down" />
          </a>
        </Dropdown>
        <Dropdown
          overlay={supplierMenu}
          trigger={['click']}
          visible={supplierVisible}
          getPopupContainer={() => document.getElementsByClassName('priceAssistant-filter')[0]}
          onClick={() => this.showModal('supplier')}
        >
          <a
            className="ant-dropdown-link dropdown-supplier"
            href="#"
            style={{ marginRight: '16px' }}
          >
            {intl.get('ssrc.priceComparison.view.message.supplierFilter').d('筛选供应商')}{' '}
            <Icon type="down" />
          </a>
        </Dropdown>
      </div>
    );
  }

  renderTable(scrollXItem) {
    return (
      <Table
        bordered
        rowKey="rowKey"
        columns={this.renderColumns()}
        dataSource={this.renderDataSource()}
        pagination={false}
        scroll={{ x: scrollXItem }}
        rowClassName={(record) => {
          if (record.rowIndex % 2 === 0) return style['row-zebra'];
        }}
      />
    );
  }

  render() {
    const {
      header = {},
      loading,
      savingLoading,
      allDataLoading,
      quotationCountData = [],
      priceComparisonConfigs,
      remoteFunc,
      bidFlag = false,
    } = this.props;
    const {
      itemConfigVisible = false,
      itemConfigSelected = [],
      supplierConfigVisible = false,
      supplierConfigSelected = [],
      itemSelected = [],
      itemVisible = false,
      supplierSelected = [],
      supplierVisible = false,
      materialConfigVisible = false,
      materialConfigSelected = [],
    } = this.state;
    const { itemSelectList = [], supplierSelectList = [] } = header;
    const itemMenu = (
      <React.Fragment>
        <Menu className="priceAssistant-filter-item">
          <a onClick={() => this.changeKeyAll(itemSelectList, 'item')}>
            {intl.get('ssrc.priceComparison.view.message.chooseAll').d('全选')}
          </a>
          {itemSelectList.map((item) => (
            <Menu.Item key={item.rfxLineItemId}>
              <Checkbox
                checked={itemSelected.includes(item.rfxLineItemId)}
                onChange={(e) => this.changeSelected(e.target.checked, item.rfxLineItemId, 'item')}
              >
                {item.itemName}
              </Checkbox>
            </Menu.Item>
          ))}
        </Menu>
      </React.Fragment>
    );
    const supplierMenu = (
      <React.Fragment>
        <Menu className="priceAssistant-filter-supplier">
          <a onClick={() => this.changeKeyAll(supplierSelectList, 'supplier')}>
            {intl.get('ssrc.priceComparison.view.message.chooseAll').d('全选')}
          </a>
          {supplierSelectList.map((item) => (
            <Menu.Item key={item.quotationHeaderId}>
              <Checkbox
                checked={supplierSelected.includes(item.quotationHeaderId)}
                onChange={(e) =>
                  this.changeSelected(e.target.checked, item.quotationHeaderId, 'supplier')
                }
              >
                {item.supplierCompanyName}
              </Checkbox>
            </Menu.Item>
          ))}
        </Menu>
      </React.Fragment>
    );
    const scrollXItem = sum(this.renderColumns().map((n) => n.width));
    const scrollXSupplier = sum(this.renderSupplierColumns().map((n) => n.width));

    let maxQuotationPriceTotalLabel = `${intl
      .get(`ssrc.priceComparison.model.comparison.maxQuotaTotal`)
      .d('最高报价总价')}(${header.benchmarkPriceTypeMeaning || ''})`;
    let maxQuotationPriceSupplierLabel = intl
      .get(`ssrc.priceComparison.model.comparison.maxQuotaSupplier`)
      .d('最高报价供应商');
    let minQuotationPriceTotalLabel = `${intl
      .get(`ssrc.priceComparison.model.comparison.minQuotaTotal`)
      .d('最低报价总价')}(${header.benchmarkPriceTypeMeaning || ''})`;
    let minQuotationPriceSupplierLabel = intl
      .get(`ssrc.priceComparison.model.comparison.minQuotaSupplier`)
      .d('最低报价供应商');
    maxQuotationPriceTotalLabel = remoteFunc
      ? remoteFunc.process(
          'srm-front-ssrc/priceComparison_PROCESS_MAX_QUOTATION_PRICE_TOTAL_LABEL',
          maxQuotationPriceTotalLabel,
          {
            header,
            that: this,
          }
        )
      : maxQuotationPriceTotalLabel;
    maxQuotationPriceSupplierLabel = remoteFunc
      ? remoteFunc.process(
          'srm-front-ssrc/priceComparison_PROCESS_MAX_QUOTATION_PRICE_SUPPLIER_LABEL',
          maxQuotationPriceSupplierLabel,
          {
            header,
            that: this,
          }
        )
      : maxQuotationPriceSupplierLabel;
    minQuotationPriceTotalLabel = remoteFunc
      ? remoteFunc.process(
          'srm-front-ssrc/priceComparison_PROCESS_MIN_QUOTATION_PRICE_TOTAL_LABEL',
          minQuotationPriceTotalLabel,
          {
            header,
            that: this,
          }
        )
      : minQuotationPriceTotalLabel;
    minQuotationPriceSupplierLabel = remoteFunc
      ? remoteFunc.process(
          'srm-front-ssrc/priceComparison_PROCESS_MIN_QUOTATION_PRICE_SUPPLIER_LABEL',
          minQuotationPriceSupplierLabel,
          {
            header,
            that: this,
          }
        )
      : minQuotationPriceSupplierLabel;

    const renderHeader = (
      <>
        <div className={style['priceAssistant-title']}>
          {intl.get(`ssrc.priceComparison.model.comparison.priceAssistant`).d('比价助手')}
        </div>
        <div className={style['priceAssistant-header-info']}>
          <div className={style['info-wrapper']}>
            <div className={style['info-item-top']}>
              {maxQuotationPriceTotalLabel} ：
              <span className={style['info-item-price']}>
                {numberSeparatorRender(header.maxQuotationPriceTotal)}
              </span>
              {header.currencyName}
            </div>
            <div className={style['info-item-bottom']}>
              {maxQuotationPriceSupplierLabel}：
              <span className={style['info-item-supplier']}>
                {header.maxQuotationPriceSupplierName}
              </span>
            </div>

            {remoteFunc
              ? remoteFunc.render(
                  'srm-front-ssrc/priceComparison_RENDER_CUX_INFO_WRAPPER_FIRST_LEVEL_DOM',
                  '',
                  {
                    bidFlag,
                    header,
                    that: this,
                  }
                )
              : ''}
          </div>
          <div className={style['info-wrapper']}>
            <div className={style['info-item-top']}>
              {minQuotationPriceTotalLabel} ：
              <span className={style['info-item-price']}>
                {numberSeparatorRender(header.minQuotationPriceTotal)}
              </span>
              {header.currencyName}
            </div>
            <div className={style['info-item-bottom']}>
              {minQuotationPriceSupplierLabel}：
              <span className={style['info-item-supplier']}>
                {header.minQuotationPriceSupplierName}
              </span>
            </div>

            {remoteFunc
              ? remoteFunc.render(
                  'srm-front-ssrc/priceComparison_RENDER_CUX_INFO_WRAPPER_FINALLY_DOM',
                  '',
                  {
                    bidFlag,
                    header,
                    that: this,
                  }
                )
              : ''}
          </div>
        </div>
      </>
    );

    return (
      <React.Fragment>
        <Spin spinning={allDataLoading ? false : loading}>
          <React.Fragment>
            {remoteFunc
              ? remoteFunc.render(
                  'srm-front-ssrc/priceComparison_RENDER_PRICE_TAB_HEADER',
                  renderHeader,
                  {
                    bidFlag,
                    header,
                  }
                )
              : renderHeader}
            <div className="priceAssistant-filter">
              {this.renderDropDown(itemMenu, itemVisible, supplierMenu, supplierVisible)}
            </div>
            {this.renderTable(scrollXItem)}
            <div className={style['supplier-title']}>
              {intl.get('ssrc.priceComparison.model.comparison.supplierInfo').d('供应商信息')}
            </div>
            <Table
              bordered
              rowKey="configItem"
              columns={this.renderSupplierColumns()}
              dataSource={this.renderSupplierDataSource()}
              pagination={false}
              scroll={{ x: scrollXSupplier }}
            />
          </React.Fragment>
        </Spin>
        <Modal
          className={style['config-modal']}
          visible={itemConfigVisible}
          title={intl.get('ssrc.priceComparison.view.title.quoteTitle').d('动态配置项')}
          onCancel={() => this.hideModal('itemConfig')}
          onOk={() => this.selectConfigOk('itemConfig')}
          confirmLoading={savingLoading}
        >
          <DynamicConfiguration
            itemConfigSelected={itemConfigSelected}
            data={priceComparisonConfigs?.allConfigItemList}
            quotationCountData={quotationCountData}
            changeSelected={this.changeSelected}
            getAllConfigItem={this.getAllConfigItem}
            configType="itemConfig"
          />
        </Modal>
        <Modal
          className={style['config-modal']}
          visible={supplierConfigVisible}
          title={intl.get('ssrc.priceComparison.view.title.quoteTitle').d('动态配置项')}
          onCancel={() => this.hideModal('supplierConfig')}
          onOk={() => this.selectConfigOk('supplierConfig')}
          confirmLoading={savingLoading}
        >
          <DynamicConfiguration
            itemConfigSelected={supplierConfigSelected}
            data={priceComparisonConfigs?.allConfigItemList}
            quotationCountData={quotationCountData}
            changeSelected={this.changeSelected}
            getAllConfigItem={this.getAllConfigItem}
            configType="supplierConfig"
          />
        </Modal>
        <Modal
          className={style['config-modal']}
          visible={materialConfigVisible}
          title={intl.get('ssrc.priceComparison.view.title.quoteTitle').d('动态配置项')}
          onCancel={() => this.hideModal('materialConfig')}
          onOk={() => this.selectConfigOk('materialConfig')}
          confirmLoading={savingLoading}
        >
          <DynamicConfiguration
            subTitle={intl.get('ssrc.priceComparison.model.comparison.itemInfo').d('物料信息')}
            itemConfigSelected={materialConfigSelected}
            data={priceComparisonConfigs?.allConfigItemList}
            quotationCountData={emptyList}
            changeSelected={this.changeSelected}
            getAllConfigItem={this.getAllConfigItem}
            configType="materialConfig"
          />
        </Modal>
      </React.Fragment>
    );
  }
}
