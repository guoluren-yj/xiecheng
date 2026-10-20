/* eslint-disable no-param-reassign */
import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useContext,
  memo,
  useMemo,
  useImperativeHandle,
  Fragment,
} from 'react';
import querystring from 'querystring';
import { Table, Button, Modal, Output, Form, useModal, DataSet } from 'choerodon-ui/pro';
import { Icon, Popover } from 'choerodon-ui';
import { runInAction } from 'mobx';
import { noop, throttle, isEmpty, omit, isNil, debounce } from 'lodash';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import uuidv4 from 'uuid/v4';
import { openTab } from 'utils/menuTab';

import intl from 'utils/intl';
import EmbedPage from '_components/EmbedPage';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { fetchEnterpriceRiskControlConfig } from '@/services/commonService';
import { queryCheckPrice, cleanCheckPrice, saveCheckPrice } from '@/services/checkPriceNewService';
import mouseSelectedSvg from '@/assets/mouse/mouseSelected.svg';
import mouseUnselectedSvg from '@/assets/mouse/mouseUnselected.svg';
import { calculateBasicQty, getSupplierRelationUrl, isText } from '@/utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import { ReactComponent as SupplierRelation } from '@/assets/supplierRelation.svg';
import IPCoincidenceRate from '@/routes/components/IPCoincidenceRateC7n/index.js';
import { ReactComponent as IP } from '@/assets/IP.svg';
import { supplierRelationMapNew } from '@/services/inquiryHallService';
import ApplicationScopeDetail from '@/routes/ssrc/components/ApplicationOrganization/Detail';
import { getQuotationName } from '@/utils/globalVariable';
import FeedBackBarginHistoryModal from '@/routes/ssrc/QueryQuotation/Detail/FeedBackBarginHistoryModal';
import { ReactComponent as NoData } from '@/assets/Illustrate_none_medium.svg';

import { useTernaryExpression } from '@/utils/renderer';
import { supplierRiskScan } from '@/routes/ssrc/InquiryHallNew/utils';
import { idValidation } from '@/routes/components/Widget/dataVerification';
import useIPDetailModal from '@/routes/components/IPDetails';

import SearchBarWrap from './SearchBarWrap';
import SubTitle from './SubTitle';
import BatchEditDrawer from '../components/BatchEditDrawer';
import ScoreInfoDrawer from '../components/scoreInfoDrawer';
import OtherInfoDrawer from '../components/otherInfoDrawer';
import QuotationInfoDrawer from '../components/quotationInfoDrawer';
import { batchEditDS } from '../store/batchEditDS';
import { StoreContext } from '../store/StoreProvider';
import { ladderQuotationTableDS, scoreDS } from '../store/subModel';
import { PrefixCls } from '../utils/constant';
import { saveMemo } from '../utils/utils';
import { itemDS } from '../store/storeDS';
import {
  generateItemLines,
  generateScoreLines,
  computedColumnCellEditable,
  computedColumnHeaderEditable,
  generateItemLinesInitData,
} from './helpers';
import styles from '../index.less';
import tableStyles from '../Tables/index.less';
import { useItemTableColumns, useScoreTableColumns, useItemGroups, useScoreGroups } from './hooks';
import {
  useEventChangeGroupHeaderCheckBox,
  useEventChangeColumnHeaderCheckBox,
  useEventChangeRowHeaderCheckBox,
  useEventChangeCellCheckBox,
} from './eventHooks';

const promptCode = 'ssrc.inquiryHall';

const organizationId = getCurrentOrganizationId();
const { openIPDetailModal } = useIPDetailModal();

const ItemTable = observer((props) => {
  const {
    onSave = noop,
    handleQuerySyncData = noop,
    renderHeaderButton = noop,
    itemLineRef,
    sectionFlag,
    itemTableRef,
    scoreTableRef,
    cacheItemIds,
    cacheItemPosition,
    clearCache = noop,
    getLinedata = noop,
    pubRouterAddParams = noop,
    stdCol,
    extCol,
    viceStdCol,
    viceExtCol,
    mainExtCol,
    mainStdCol,
    curAggregation,
    newQuotationFlag = 0,
    checkItemLineHigh = false,
    dimensionCode,
    setDimensionCode,
    checkQuotationLineHigh = false,
    sslmLifeCycleFlag = true,
    remote,
    itemGroupTableConfig = {},
    timestamp = '',
    useNewRateFlag = 0,
    isTechExpertFlag = false,
  } = props;
  const {
    bidFlag,
    pubFlag,
    detailFlag,
    custLoading,
    doubleUnitFlag,
    hiddenCustMethod,
    // coverPriceFields,
    customizeForm = noop,
    customizeTable = noop,
    commonDs: { itemDs, scoreDs, headerDs, shareDs, wholePackageDs },
    routeParams: { rfxHeaderId },
    customizeBtnGroup = noop,
  } = useContext(StoreContext);
  // const [shareDs.getState('columnExpandedALlStatus'), setsharDs.getState('columnExpandedALlStatus')] = useState('');
  const [columnsChange] = useState(false);
  const [itemBodyExpanded, setItemBodyExpanded] = useState(true); // 控制表格体是否展开
  const [scoreBodyExpanded, setScoreBodyExpanded] = useState(!detailFlag);
  const [aggregation, setAggregation] = useState(null); // 控制是否聚合
  const [companyGroupType] = useState('header'); // 控制公司分组类型
  const [itemGroupType] = useState('column'); // 控制物料分组类型
  const [tableLoading, setTableLoading] = useState(false);
  const [mountFlag, setMountFlag] = useState(true);
  const [enterpriceRiskControllerButtonsObj, setenterpriceRiskControllerButtonsObj] = useState({
    RELATION_MINING: 0, // 关系图谱（关系挖掘）
    RISK_SCAN: 0, // 风险扫描;
  });
  const [feedBackBarginHistoryStatus, setFeedBackBarginHistoryStatus] = useState(false);

  const currentQueryItemLines = useRef(noop);
  const supplierQueryFlag = useRef(false);
  const supplierLine = useRef([]);
  const modal = useModal();
  const searchBarRef = useRef(null);

  const { current: headerCurrent } = headerDs;
  const checkSelectionDimension =
    (shareDs && shareDs.getState('dimensionCode')) ||
    (headerCurrent && headerCurrent.get('checkSelectionDimension'));
  // (headerCurrent && (headerCurrent.get('onlyAllowAllWinBids') ? 'ALL' : 'ITEM')); // 整单: 'ALL', 物料: 'ITEM'
  const { multiCurrencyFlag, checkRecommendationStrategy, benchmarkPriceType } =
    (headerCurrent &&
      headerCurrent.get([
        'multiCurrencyFlag',
        'checkRecommendationStrategy',
        'benchmarkPriceType',
      ])) ||
    {}; // 多币种报价
  const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE'; // 基准价是否是含税
  const showDimensionButtonsFlag =
    !sectionFlag &&
    headerCurrent &&
    headerCurrent.get('quotationScope') === 'ALL_QUOTATION' &&
    !headerCurrent.get('quantityChangeFlag') && // 只展示物料
    !headerCurrent.get('onlyAllowAllWinBids'); // 部分报价、允许供应商修改可供数量、仅允许整单中标 不展示按钮组 ，--整单

  const baseSupplier = useRef({});

  const feedBackBarginHistorySearch = useRef({});
  const lastQueryRef = useRef([]);
  const lastQueryRefResult = useRef({});
  const queryList = useRef([]);

  const curDimensionDs = useMemo(() => {
    return dimensionCode === 'ITEM' ? itemDs : wholePackageDs;
  }, [dimensionCode, itemDs, wholePackageDs]);

  const tableStyle = useMemo(() => ({ maxHeight: aggregation ? 600 : 434 }), [aggregation]);
  // 查询企业是否开通 [ 风险扫描，关系图谱，找关系, ..., ]等服务
  const enterpriceRiskControllerButtonConfig = async () => {
    let result = null;

    const params = {
      organizationId,
      applicationCode: 'AP_CREDIT',
      serviceCode: 'RELATION_MINING,RISK_SCAN', // 关系图谱 风险扫描,
    };

    try {
      result = await fetchEnterpriceRiskControlConfig(params);
      result = getResponse(result || isEmpty(result));
      if (!result) {
        return;
      }
      setenterpriceRiskControllerButtonsObj(result);
    } catch (e) {
      throw e;
    }
  };

  const { itemTableGroupPageSize: itemLinePageSize } = itemGroupTableConfig?.current || {};

  useEffect(() => {
    if (isNil(aggregation)) {
      setAggregation(shareDs.getState('aggregation') === '1');
      curAggregation.current = !!(shareDs.getState('aggregation') === '1');
    }
    enterpriceRiskControllerButtonConfig();
  }, []);

  useEffect(() => {
    if (checkRecommendationStrategy === 'PRICE') {
      setScoreBodyExpanded(false);
    }
  }, [checkRecommendationStrategy]);

  useEffect(() => {
    setItemBodyExpanded(dimensionCode === 'ITEM');
  }, [dimensionCode]);

  /**
   * 绑定筛选器ref
   */
  const handleBindRef = useCallback((ref) => {
    searchBarRef.current = ref;
  }, []);

  const flatQueryParams = useMemo(() => {
    const { current } = searchBarRef;
    const searchBarProps = filterNullValueObject(current && current.getQueryParameter());
    return filterNullValueObject({
      rfxHeaderId,
      showType: 'TILE',
      customizeUnitCode: bidFlag
        ? `SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.SUPPLIER_DETAIL,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.OTHER,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ITEM_DETAIL,${
            dimensionCode === 'ITEM'
              ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.FILTER_BAR'
              : 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.TILE_WHOLE_FILTER_BAR'
          }`
        : `SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.SUPPLIER_DETAIL,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.OTHER,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ITEM_DETAIL,${
            dimensionCode === 'ITEM'
              ? 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.FILTER_BAR'
              : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.TILE_WHOLE_FILTER_BAR'
          }`,
      checkSelectionDimension: dimensionCode,
      checkRecommendationStrategyDetail: shareDs.getState('checkRecommendationStrategyDetail'),
      searchBarFlag: isEmpty(searchBarProps) ? 0 : 1,
      ...searchBarProps,
      ...pubRouterAddParams(),
    });
  }, [dimensionCode, shareDs.getState('checkRecommendationStrategyDetail'), rfxHeaderId]);

  useEffect(() => {
    const currentDimensionDs = dimensionCode === 'ITEM' ? itemDs : wholePackageDs;
    currentDimensionDs.setQueryParameter(
      'queryParams',
      remote
        ? remote.process('SSRC_CHECK_PRICE_NEW_C7N_PROCESS_QUERY_PARAMS', flatQueryParams, {
            detailFlag,
            bidFlag,
          })
        : flatQueryParams
    );
    currentDimensionDs.setState('setTableLoading', setTableLoading);
  }, [flatQueryParams]);

  /**
   *  行数据和价格库字段值整合
   * */
  const combinePriceCacheData = (lineData) => {
    const data = lineData || {};
    const curPriceFields = [...(shareDs.getState('coverPriceFields') || [])];
    const newPriceMap = itemDs.getState('newPriceMap') || {};
    const { quotationLineId } = data;

    if (isEmpty(curPriceFields) || isEmpty(newPriceMap)) {
      return data;
    }

    const priceData = {}; // 价格库字段值

    curPriceFields.forEach((curPriceField) => {
      const { fieldCode } = curPriceField || {};

      if (!isNil(data[fieldCode])) {
        // 标准行如果有该字段值，不做更新
        return;
      }

      const currentFieldList = newPriceMap[fieldCode];
      if (isEmpty(currentFieldList)) {
        return;
      }

      currentFieldList.forEach((line) => {
        const { quotationLineId: currentLineQuotationLineId, value } = line || {};
        if (
          currentLineQuotationLineId &&
          currentLineQuotationLineId === quotationLineId &&
          !isNil(value)
        ) {
          priceData[fieldCode] = value;
        }
      });
    });

    return {
      ...data,
      ...priceData,
    };
  };

  /**
   * 聚合表格查询
   */
  const queryItemLines = useCallback(
    async (params) => {
      const { rfxLineItemId = [], refreshFlag = false, dimensionCode: DimensionCode, saveType } =
        params || {};
      const { current } = searchBarRef;
      const curDemesion = DimensionCode || dimensionCode;
      const currentAggregation = isNil(curAggregation.current)
        ? aggregation
        : curAggregation.current;
      let result;
      let queryPromise;
      if (!rfxHeaderId || !dimensionCode || isNil(currentAggregation)) {
        return;
      }

      if (saveType === 'saveAutoData') {
        handleChangeButtonGroup(shareDs.getState('checkSelectionDimension'), true);
        return;
      }

      // const start = new Date();

      const searchBarProps = filterNullValueObject(current && current.getQueryParameter());
      const currentDimensionDs = curDemesion === 'ITEM' ? itemDs : wholePackageDs;
      const initSearchFlag = mountFlag || refreshFlag;
      const preQueryItemFlag = initSearchFlag ? 1 : 0;
      let queryParams = filterNullValueObject({
        rfxHeaderId,
        itemLineIds: DimensionCode ? null : rfxLineItemId,
        showType: currentAggregation ? 'GROUP' : 'TILE',
        customizeUnitCode: bidFlag
          ? `SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.SUPPLIER_DETAIL,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.OTHER,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ITEM_DETAIL,${
              curAggregation.current || curDemesion === 'ITEM'
                ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.FILTER_BAR'
                : 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.TILE_WHOLE_FILTER_BAR'
            }`
          : `SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.SUPPLIER_DETAIL,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.OTHER,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ITEM_DETAIL,${
              curAggregation.current || curDemesion === 'ITEM'
                ? 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.FILTER_BAR'
                : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.TILE_WHOLE_FILTER_BAR'
            }`,
        checkSelectionDimension: curDemesion,
        checkRecommendationStrategyDetail: shareDs.getState('checkRecommendationStrategyDetail'),
        searchBarFlag: isEmpty(searchBarProps) ? 0 : 1,
        preQueryItemFlag,
        otherQuery: {
          size: itemLinePageSize,
        },
        ...searchBarProps,
        ...pubRouterAddParams(),
      });
      queryParams = remote
        ? remote.process('SSRC_CHECK_PRICE_NEW_C7N_PROCESS_QUERY', queryParams, {
            bidFlag,
            detailFlag,
          })
        : queryParams;
      if (!currentAggregation) {
        currentDimensionDs.setQueryParameter('queryParams', queryParams);
      }
      // const currentRecords = [];
      if (initSearchFlag) {
        // 清除数据和缓存
        curDimensionDs.clearCachedRecords();
        curDimensionDs.loadData([]);
        cacheItemIds.current = {};
        setTableLoading(true);
      }

      try {
        queryPromise = currentAggregation
          ? queryCheckPrice(queryParams)
          : currentDimensionDs.query(
              saveType && JSON.stringify(saveType) === '{}'
                ? currentDimensionDs.currentPage
                : undefined
            ); // 针对保存按钮查询缓存
        const id = uuidv4(); // 生成随机id；
        lastQueryRef.current.push(id);
        queryList.current.push(id);
        lastQueryRefResult.current[id] = getResponse(await queryPromise);
        // 取最后一次查询的结果
        result = lastQueryRefResult.current[lastQueryRef.current[lastQueryRef.current?.length - 1]];
        if (result) {
          // const query = new Date();
          // console.log(query - start);
          if (currentAggregation) {
            const {
              itemLines, // 对象结构，key为物料id
              itemIds,
              // combineKeys,
              supplierLines,
              allItemIds,
              allrfxLineSupplierIds,
            } = generateItemLines(result, preQueryItemFlag); // 生成物料表格数据
            const scoreLines = generateScoreLines(result); // 生成评分表格数据
            runInAction(() => {
              const { summaryScoreDetailDTO } = result[0] || {};
              currentDimensionDs.setState(
                'sourceRuleType',
                summaryScoreDetailDTO && summaryScoreDetailDTO.sourceRuleType
              ); // 寻源规则
              if (initSearchFlag) {
                baseSupplier.current =
                  omit(result[0], 'summaryScoreDetailDTO', 'checkQuotationLineDTOS') || {};
                setMountFlag(false);
                // 初始化表格
                scoreDs.loadData(scoreLines);
                supplierLine.current = supplierLines;

                const initData = generateItemLinesInitData(allItemIds, allrfxLineSupplierIds);
                currentDimensionDs.loadData(initData);
                // const loadDataBefore = new Date();
                // console.log(loadDataBefore - query);
              }
              // 增加缓存数据和实际表单数据赋值
              itemIds.forEach((item) => {
                // 在缓存中退出
                if (cacheItemIds.current[item]) {
                  return;
                }

                itemLines[item].forEach((data) => {
                  let newData = data;
                  // 针对配置的个性化值集问题处理
                  currentDimensionDs.fields.forEach((field) => {
                    const name = field.get('name');
                    if (name) {
                      const type = currentDimensionDs.getField(name).get('type');
                      const transformResponse = currentDimensionDs
                        .getField(name)
                        .get('transformResponse');
                      if (type === 'object' && transformResponse) {
                        newData = {
                          ...newData,
                          [name]: transformResponse(newData[name], newData),
                        };
                      }
                    }
                  });

                  newData = combinePriceCacheData(newData) || {};

                  // 对新值和ds做匹配赋值
                  currentDimensionDs.forEach((record) => {
                    if (data.combineKey === record.get('combineKey')) {
                      if (data.rankTeam !== 0) {
                        // 非0则为无效供应商
                        record.disabled = true;
                        record.selectable = false;
                      }

                      // record赋值
                      record.init(newData);
                    }
                  });
                });
                cacheItemIds.current[item] = true;
              });
            });
          } else {
            supplierLine.current = result.content;
            setMountFlag(false);
          }
          // const over = new Date();
          // console.log('over', over - query);
        }
      } finally {
        supplierQueryFlag.current = false;
        // 聚合模式下
        // if (currentAggregation) {
        // 并且是初始化查询
        // if (initSearchFlag) {
        //   // 强制刷一次表格
        //   setItemBodyExpanded(false);
        //   setTimeout(() => {
        //     setItemBodyExpanded(curDemesion !== 'ITEM');
        //   }, 0);
        // }
        // }
        queryList.current.pop();
        if (!queryList.current?.length) {
          setTableLoading(false);
        }
      }
      if (result) {
        return queryPromise;
      }
    },
    [
      dimensionCode,
      aggregation,
      mountFlag,
      tableLoading,
      rfxHeaderId,
      shareDs,
      itemDs,
      wholePackageDs,
      itemLinePageSize,
    ]
  );

  useEffect(() => {
    currentQueryItemLines.current = queryItemLines;
  }, [queryItemLines]);

  /**
   * 暴漏给父组件API
   */
  useImperativeHandle(
    itemLineRef,
    () => {
      return {
        dimensionCode,
        queryItemLines: currentQueryItemLines.current,
      };
    },
    [dimensionCode, currentQueryItemLines.current]
  );

  /**
   * 切标段查询
   */
  useEffect(() => {
    if (!mountFlag && rfxHeaderId) {
      currentQueryItemLines.current({ refreshFlag: true });
    }
    return () => {
      clearCache();
    };
  }, [rfxHeaderId]);

  useEffect(() => {
    if (!checkSelectionDimension) return;
    shareDs.setState('dimensionCode', checkSelectionDimension);
    setDimensionCode(checkSelectionDimension);
  }, [checkSelectionDimension]);

  /**
   * 选择策略变更后, 设置 ds 选择模式
   */
  useEffect(() => {
    itemDs.selection = aggregation || detailFlag ? false : 'multiple';
    wholePackageDs.selection = aggregation || detailFlag ? false : 'multiple';
    itemDs.paging = !aggregation;
    wholePackageDs.paging = !aggregation;
  }, [aggregation, curDimensionDs]);

  /**
   * 筛选器查询
   */
  const handleSearch = useCallback(
    debounce(() => {
      currentQueryItemLines.current({ refreshFlag: true });
    }, 1000),
    [curDimensionDs]
  );

  const handleJumpToSupplierLifecycle = (record, e) => {
    e.stopPropagation();
    const { companyId, partnerTenantId, supplierCompanyId, tenantId } = record.get([
      'companyId',
      'partnerTenantId',
      'supplierCompanyId',
      'tenantId',
    ]);
    const searchObj = {
      tenantId,
      partnerTenantId,
      companyId,
      supplierCompanyId,
    };
    const newSupplierDetailPath = sslmLifeCycleFlag
      ? '/sslm/include/supplier-manager/supplier-detail'
      : '/sslm/supplier-detail-new';
    openTab({
      key: newSupplierDetailPath,
      path: newSupplierDetailPath,
      title: intl.get('hzero.common.view.message.360QueryDetail').d('供应商360查询'),
      search: querystring.stringify(searchObj),
      closable: true,
    });
  };

  /**
   * 点击列单元格, 设置编辑状态
   */
  const handleClickColumnCell = useCallback(
    ({ index, record, headerGroup }) => {
      if (dimensionCode !== 'ITEM' || detailFlag) return;
      if (!computedColumnCellEditable(record)) return; // 无效放弃状态, 禁止选用
      const suggestedFlag = record.get('suggestedFlag');
      const { rfxQuantity, secondaryQuantity } = record.get([
        'rfxQuantity',
        'secondaryQuantity',
        'allocationMethod',
      ]);
      runInAction(() => {
        if (!suggestedFlag) {
          record.set('allottedSecondaryQuantity', secondaryQuantity);
          record.set('suggestedFlag', 1);
          record.set('allottedQuantity', rfxQuantity);
          record.set('allocationMethod', 'ALLOCATED_QUANTITY_RATIO');
          record.set('allocationMethodRatio', 'ALLOCATED_QUANTITY_RATIO');
          record.set('allocationMethodQuantity', 'ALLOCATED_QUANTITY_RATIO');
        } else {
          record.set('allottedQuantity', '');
          record.set('allottedSecondaryQuantity', '');
          record.set('allottedRatio', '');
          record.set('suggestedRemark', '');
          record.set('suggestedFlag', 0);
        }
        handleEditItemLineCell({ index, record, headerGroup });
      });
    },
    [dimensionCode]
  );

  /**
   * 点击列头, 设置编辑状态
   */
  const handleClickColumnHeader = useCallback(
    ({ record, dataSet }) => {
      if (dimensionCode !== 'ALL' || detailFlag) return;
      if (!computedColumnHeaderEditable(record)) return; // 无效放弃状态, 禁止选用
      const allSelectFlag = record.get('allSelectFlag');
      const afterChangedAllSelectFlag = Number(!allSelectFlag);

      const rfxLineSupplierId = record.get('rfxLineSupplierId');

      // 给供应商下的每个物料赋选用标识
      dataSet.forEach((item) => {
        if (item.get('rfxLineSupplierId') === rfxLineSupplierId) {
          item.set('allSelectFlag', afterChangedAllSelectFlag);
          if (item.get('validDataFlag') !== 0) {
            item.set('suggestedFlag', afterChangedAllSelectFlag);
          }
        }
      });

      document.body.style.cursor = `url(${
        afterChangedAllSelectFlag ? mouseUnselectedSvg : mouseSelectedSvg
      }), pointer`;
    },
    [dimensionCode]
  );

  /**
   * 单元格移入
   * 盖章状态下, 基于单元格是否被放弃, 控制是否可以盖章
   */
  const handleMouseEnterColumnCell = useCallback(
    (record) => {
      if (dimensionCode !== 'ITEM' || detailFlag) return;
      if (!computedColumnCellEditable(record)) {
        return;
      }
      const suggestedFlag = record.get('suggestedFlag');
      document.body.style.cursor = `url(${
        suggestedFlag ? mouseUnselectedSvg : mouseSelectedSvg
      }), pointer`;
    },
    [dimensionCode]
  );

  /**
   * 列头移入
   * 盖章状态下, 基于列头是否被放弃, 控制是否可以盖章
   */
  const handleMouseEnterColumnHeader = useCallback(
    (record) => {
      if (dimensionCode !== 'ALL' || detailFlag) return;
      if (!computedColumnHeaderEditable(record)) {
        return;
      }
      const allSelectFlag = record.get('allSelectFlag');
      document.body.style.cursor = `url(${
        allSelectFlag ? mouseUnselectedSvg : mouseSelectedSvg
      }), pointer`;
    },
    [dimensionCode]
  );

  /**
   * 单元格移出
   */
  const handleMouseLeaveColumnCell = useCallback(() => {
    if (dimensionCode !== 'ITEM' || detailFlag) return;
    if (document.body.style.cursor === 'defalut' || !document.body.style.cursor) return;
    document.body.style.cursor = 'default';
  }, [dimensionCode]);

  /**
   * 列头移出
   */
  const handleMouseLeaveColumnHeader = useCallback(() => {
    if (dimensionCode !== 'ALL' || detailFlag) return;
    if (document.body.style.cursor === 'defalut' || !document.body.style.cursor) return;
    document.body.style.cursor = 'default';
  }, [dimensionCode]);

  /**
   * 点击表格分组头勾选框
   */
  const handleChangeGroupHeaderCheckBox = useEventChangeGroupHeaderCheckBox({ shareDs }, [
    shareDs.getState('allSelectFlag'),
  ]);

  /**
   * 点击供应商列头勾选框
   */
  const handleChangeColumnHeaderCheckBox = useEventChangeColumnHeaderCheckBox({ shareDs }, [
    shareDs.getState('allSelectFlag'),
    shareDs.getState('removeQuotationHeaderIds'),
    shareDs.getState('quotationHeaderIds'),
  ]);

  /**
   * 点击物料行头勾选框
   */
  const handleChangeRowHeaderCheckBox = useEventChangeRowHeaderCheckBox({ shareDs }, [
    shareDs.getState('allSelectFlag'),
    shareDs.getState('rfxLineItemIds'),
    shareDs.getState('removeRfxLineItemIds'),
  ]);

  /**
   * 点击单元格勾选框
   */
  const handleChangeCellCheckBox = useEventChangeCellCheckBox({ shareDs }, [
    shareDs.getState('editQuotationLines'),
    shareDs.getState('editQuotationLinesKeys'),
    shareDs.getState('checkWay'),
  ]);

  const handleQuantity = (val, record) => {
    const { itemId, quotationLineId, uomId, secondaryUomId } = record.get([
      'itemId',
      'quotationLineId',
      'uomId',
      'secondaryUomId',
    ]);
    if (val) {
      if (doubleUnitFlag && itemId) {
        calculateBasicQty({
          secondaryQuantity: val,
          itemId,
          businessKey: quotationLineId || record.id,
          doublePrimaryUomId: uomId,
          secondaryUomId,
        }).then((res) => {
          record.set('allottedQuantity', res ?? '');
        });
      } else {
        record.set('allottedQuantity', val);
      }
    } else if (val === 0) {
      record.set('allottedQuantity', val);
    }
  };

  const showLadderQuotation = (record, e) => {
    e.stopPropagation();
    const ladderQuotationTableDs = new DataSet(
      ladderQuotationTableDS(doubleUnitFlag, pubRouterAddParams)
    );

    ladderQuotationTableDs.setQueryParameter('commonProps', {
      quotationLineId: record.get('quotationLineId'),
      customizeUnitCode: bidFlag
        ? 'SSRC.NEW_BID_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE'
        : 'SSRC.INQUIRY_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE',
    });
    ladderQuotationTableDs.query();

    const columns = [
      {
        name: 'rfxLadderLineNum',
        width: 80,
      },
      useTernaryExpression(doubleUnitFlag, {
        name: 'secondaryLadderFrom',
        width: 120,
      }),
      useTernaryExpression(doubleUnitFlag, {
        name: 'secondaryLadderTo',
        width: 120,
      }),
      {
        name: 'ladderFrom',
        width: 140,
      },
      {
        name: 'ladderTo',
        width: 140,
      },
      useTernaryExpression(doubleUnitFlag, {
        name: 'validLadderSecPrice',
        width: 100,
      }),

      useTernaryExpression(doubleUnitFlag, {
        name: 'validNetLadderSecPrice',
        width: 100,
      }),

      {
        name: 'validLadderPrice',
        width: 120,
      },
      {
        name: 'validNetLadderPrice',
        width: 120,
      },
      {
        name: 'cumulativeFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'validBargainPrice',
        width: 130,
      },
      {
        name: 'remark',
        width: 100,
      },
    ].filter(Boolean);
    Modal.open({
      key: Modal.key(),
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
      style: {
        width: 742,
      },
      drawer: true,
      cancelButton: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      closable: true,
      className: styles['rfx-ladder-quotation-modal-wrapper'],
      children: (
        <Fragment>
          <h3 className={styles['ladder-sub-title']}>
            <div className={styles['ladder-sub-title-line']} />
            {intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息')}
          </h3>
          <Form
            labelLayout="vertical"
            columns={3}
            labelAlign="left"
            className="c7n-pro-vertical-form-display"
          >
            <Output
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称')}
              value={record.get('supplierCompanyName')}
            />
            <Output
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsCode`).d('物料编码')}
              value={record.get('itemCode')}
            />
            <Output
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsName`).d('物料名称')}
              value={record.get('itemName')}
            />
          </Form>
          <h3 className={styles['ladder-sub-title']}>
            <div className={styles['ladder-sub-title-line']} />
            {intl.get('ssrc.inquiryHall.view.card.subtitle.quotationInfo').d('报价信息')}
          </h3>
          {customizeTable(
            {
              code: bidFlag
                ? 'SSRC.NEW_BID_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE'
                : 'SSRC.INQUIRY_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE',
            },
            <Table dataSet={ladderQuotationTableDs} columns={columns} />
          )}
        </Fragment>
      ),
      afterClose: () => {
        ladderQuotationTableDs.loadData([]);
      },
    });
  };

  const handleClickToSoreInfo = useCallback(
    async (record) => {
      const subScoreDs = new DataSet(scoreDS());
      const queryParams = {
        ...curDimensionDs.getQueryParameter('queryParams'),
        tileRfxLineSupplierIds: [record.get('rfxLineSupplierId')],
      };
      subScoreDs.setQueryParameter('queryParams', queryParams);
      await subScoreDs.query();
      return modal.open({
        destroyOnClose: true,
        closable: true,
        key: 'scoreInfo',
        drawer: true,
        maskClosable: true,
        title: intl.get('ssrc.inquiryHall.view.inquiryHall.scoreInfo').d('评分信息'),
        style: { width: '742px' },
        cancelButton: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
        children: <ScoreInfoDrawer subScoreDs={subScoreDs} scoreColumns={scoreColumns} />,
      });
    },
    [modal, scoreGroups, scoreColumns, curDimensionDs]
  );

  const handleClickToOtherInfo = useCallback(
    (record) => {
      return modal.open({
        destroyOnClose: true,
        closable: true,
        drawer: true,
        maskClosable: true,
        key: 'otherInfo',
        cancelButton: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
        title: intl.get('ssrc.inquiryHall.view.inquiryHall.otherInfo').d('其他信息'),
        style: { width: '1090px' },
        children: (
          <OtherInfoDrawer
            {...{
              curDimensionDs,
              record,
              otherInfoColumns,
              bidFlag,
              customizeTable,
              detailFlag,
            }}
          />
        ),
      });
    },
    [modal, curDimensionDs, otherInfoColumns]
  );

  const handleSaveQuotationInfo = useCallback(
    async ({ ds }) => {
      const headerData = headerDs.current && headerDs.current.toData();
      const linesData = ds.toJSONData() || [];
      if (!linesData.length) {
        return;
      }
      const params = {
        rfxHeaderId,
        checkHeaderDTO: headerData,
        checkQuotationLineDTOS: linesData,
        checkSelectionDimension: dimensionCode,
        customizeUnitCode: bidFlag
          ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.SUPPLIER_DETAIL,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.OTHER,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ITEM_DETAIL,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.BASE_INFO,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT'
          : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.SUPPLIER_DETAIL,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.OTHER,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ITEM_DETAIL,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.BASE_INFO,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT',
      };

      try {
        const result = getResponse(await saveCheckPrice(params));
        if (result) {
          clearCache();
          headerDs.query();
          currentQueryItemLines.current({ refreshFlag: true });
        }
      } catch (error) {
        throw error;
      }
    },
    [rfxHeaderId, shareDs, headerDs, dimensionCode, clearCache]
  );

  const handleClickRiskScan = useCallback(
    throttle(
      (supplierCompanyId) => {
        if (!supplierCompanyId || !rfxHeaderId) {
          return;
        }
        supplierRiskScan({ supplierCompanyId, rfxHeaderId });
      },
      [rfxHeaderId]
    ),
    500
  );

  // 还比价历史
  const onComparePriceHistory = useCallback((record, e) => {
    e.stopPropagation();
    const { quotationLineId, supplierCompanyName, itemCode, itemName } = record.get([
      'quotationLineId',
      'supplierCompanyName',
      'itemCode',
      'itemName',
    ]);
    feedBackBarginHistorySearch.current = {
      rfxId: rfxHeaderId,
      quotationLineId,
      supplierCompanyName,
      itemCode,
      itemName,
    };
    setFeedBackBarginHistoryStatus(true);
  }, []);

  const applicationScopeRef = useRef();

  // 查看适用范围
  const viewApplicationOrgModal = useCallback(
    (params = {}) => {
      const Props = {
        queryParams: {
          organizationId,
          sourceHeaderId: rfxHeaderId,
          sourceFrom: 'RFX',
          ...params,
        },
        onRef: applicationScopeRef,
        sourceHeaderId: rfxHeaderId,
        organizationId,
      };

      const modalKey = Modal.key();
      Modal.open({
        destroyOnClose: true,
        closable: true,
        key: modalKey,
        drawer: true,
        bodyStyle: {
          padding: 0,
        },
        title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
        children: <ApplicationScopeDetail {...Props} />,
        style: { width: '1000px' },
        okButton: false,
        cancelText: intl.get('ssrc.inquiryHall.model.inquiryHall.closed').d('关闭'),
        cancelProps: {
          color: 'primary',
        },
      });
    },
    [rfxHeaderId]
  );

  // 适用范围
  const viewItemLineApplicationOrgModal = useCallback(
    (record) => {
      const { rfxLineItemId, applicationScopeFlag = 0 } = record?.get([
        'rfxLineItemId',
        'applicationScopeFlag',
      ]);
      viewApplicationOrgModal({
        sourceLineItemId: rfxLineItemId,
        applicationScopeFlag,
      });
    },
    [viewApplicationOrgModal]
  );

  const handleClickToQuotationInfo = useCallback(
    (record) => {
      const curDataset = new DataSet({
        ...itemDS({ shareDs, doubleUnitFlag, bidFlag, rfxHeaderId }),
        paging: true,
        selection: false,
      });
      curDataset.fields = itemDs.fields;
      return modal.open({
        destroyOnClose: true,
        closable: true,
        drawer: true,
        key: 'quotationParticularss',
        maskClosable: true,
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.quotationParticularss').d('报价详情'),
        style: { width: '1090px' },
        children: (
          <QuotationInfoDrawer
            {...{
              stdCol,
              // extCol,
              mainStdCol,
              mainExtCol,
              curDimensionDs,
              curDataset,
              record,
              bidFlag,
            }}
          />
        ),
        cancelButton: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
        onOk: () => handleSaveQuotationInfo({ ds: curDataset }),
      });
    },
    [modal, curDimensionDs, shareDs, bidFlag, doubleUnitFlag, rfxHeaderId, handleSaveQuotationInfo]
  );

  const itemColumns = useItemTableColumns(
    {
      remote,
      taxFlag,
      multiCurrencyFlag,
      detailFlag,
      itemTableRef,
      scoreTableRef,
      doubleUnitFlag,
      handleQuantity,
      hiddenCustMethod,
      showLadderQuotation,
      newQuotationFlag,
      organizationId,
      checkItemLineHigh,
      checkQuotationLineHigh,
      bidFlag,
    },
    // 在这边加的字段，需要在hook中进行结构，位置需要对应
    [
      aggregation,
      shareDs,
      columnsChange,
      dimensionCode,
      handleClickColumnCell,
      handleMouseEnterColumnCell,
      handleMouseLeaveColumnCell,
      handleChangeCellCheckBox,
      shareDs.getState('columnExpandedALlStatus'),
      viewItemLineApplicationOrgModal,
      onComparePriceHistory,
      remote,
    ]
  );

  // 在这边加的字段，需要在hook中进行结构，位置需要对应
  const scoreColumns = useScoreTableColumns([]);

  // 物料分组
  const itemGroups = useItemGroups(
    // 在这边加的字段，需要在hook中进行结构，位置需要对应
    [
      taxFlag,
      shareDs,
      aggregation,
      companyGroupType,
      itemGroupType,
      dimensionCode,
      handleClickToSoreInfo,
      handleClickToOtherInfo,
      handleClickToQuotationInfo,
      handleClickColumnHeader,
      handleMouseEnterColumnHeader,
      handleMouseLeaveColumnHeader,
      handleChangeGroupHeaderCheckBox,
      handleChangeColumnHeaderCheckBox,
      handleChangeRowHeaderCheckBox,
      shareDs.getState('suggestSupplierCount'),
      handleClickRiskScan,
      enterpriceRiskControllerButtonsObj,
      newQuotationFlag,
      organizationId,
    ],
    { detailFlag, doubleUnitFlag, bidFlag, checkItemLineHigh, remote, rfxHeaderId }
  );

  const otherInfoColumns = useMemo(
    () =>
      [
        !aggregation && { name: 'supplierCompanyName', with: 260 },
        { name: 'paymentTypeName' },
        { name: 'paymentTermName' },
        { name: 'currencyCode' },
        { name: 'exchangeRate', hidden: !headerCurrent?.get('multiCurrencyFlag') },
        {
          name: 'supplierDetail',
          renderer: ({ record }) =>
            record.get('partnerCompanyId') ? (
              <a onClick={(e) => handleJumpToSupplierLifecycle(record, e)}>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
              </a>
            ) : (
              '-'
            ),
        },
        { name: 'priceCoefficient' },
        { name: 'stageDescription' },
      ].filter(Boolean),
    [aggregation, headerCurrent, handleJumpToSupplierLifecycle]
  );

  // 评分分组  // 在这边加的字段，需要在hook中进行结构，位置需要对应
  const scoreGroups = useScoreGroups([otherInfoColumns]);

  // 表格左右滚动同步，同步滑动报价行
  const handleItemTableScrollLeft = useCallback((scrollLeft) => {
    const { current } = scoreTableRef;
    if (current) {
      current.setScrollLeft(scrollLeft);
    }
  }, []);

  const dealScrollerData = (currentSrcollerInfo) => {
    const { groups = [] } = currentSrcollerInfo || {};
    // 若可视区域内有未在缓存中的情况时，进行loading，等待数据的加载
    if (
      groups
        .slice(currentSrcollerInfo.start, currentSrcollerInfo.end)
        .map((item) => item.value)
        .some((item) => !cacheItemIds.current[item])
    ) {
      setTableLoading(true);
    }
    let itemLines = [];
    // 判断滑动的方向
    // 向下滑
    if (currentSrcollerInfo.end > cacheItemPosition.current?.end) {
      itemLines = groups
        .slice(currentSrcollerInfo.start, currentSrcollerInfo.end + 2 * itemLinePageSize)
        .map((item) => item.value);
    } else {
      // 向上滑
      itemLines = groups
        .slice(
          currentSrcollerInfo.start - 2 * itemLinePageSize > 0
            ? currentSrcollerInfo.start - 2 * itemLinePageSize
            : 0,
          currentSrcollerInfo.end + itemLinePageSize
        )
        .map((item) => item.value);
    }
    // 查缓存，没在缓存的则插入
    const rfxLineItemId = itemLines
      .filter((item) => item && !cacheItemIds.current[item])
      .slice(0, itemLinePageSize);
    // 位置重新赋值
    cacheItemPosition.current = {
      start: currentSrcollerInfo.start,
      end: currentSrcollerInfo.end,
    };
    return rfxLineItemId;
  };

  // 表格上下滚动
  const handleItemTableScrollTop = useCallback(
    debounce((scroll, getScrollerInfo) => {
      const currentSrcollerInfo = getScrollerInfo();
      if (
        (currentSrcollerInfo.start !== cacheItemPosition.current?.start ||
          currentSrcollerInfo.end !== cacheItemPosition.current?.end) &&
        currentSrcollerInfo.end > itemLinePageSize
      ) {
        const rfxLineItemId = dealScrollerData(currentSrcollerInfo);
        if (rfxLineItemId.length) {
          const res = currentQueryItemLines.current({
            rfxLineItemId,
          });
          if (res) {
            res.then(() => {
              const afterSrcollerInfo = getScrollerInfo();
              const afterRfxLineItemId = dealScrollerData(afterSrcollerInfo);
              if (afterRfxLineItemId.length) {
                currentQueryItemLines.current({
                  rfxLineItemId: afterRfxLineItemId,
                });
              }
            });
          }
        }
      }
    }, 800),
    [itemLinePageSize]
  );

  const handleScoreTableScrollLeft = useCallback((scrollLeft) => {
    const { current } = itemTableRef;
    if (current) {
      current.setScrollLeft(scrollLeft);
    }
  }, []);

  /**
   * 展开物料
   */
  const handleBodyExpandItem = useCallback(
    (expanded) => {
      // if (dimensionCode === 'ALL') return; 需求变更 - 整单模式, 支持展开
      setItemBodyExpanded(expanded);
    },
    [curDimensionDs]
  );

  /**
   * 展开评分
   */
  const handleBodyExpandScore = useCallback((expanded) => {
    setScoreBodyExpanded(expanded);
  }, []);

  // 表格调整列宽
  const handleItemTableColumnResize = useCallback(({ width, index }) => {
    const { current } = scoreTableRef;
    if (current) {
      current.setColumnWidth(width, index, false);
    }
  }, []);
  const handleScoreTableColumnResize = useCallback(({ width, index }) => {
    const { current } = itemTableRef;
    if (current) {
      current.setColumnWidth(width, index, false);
    }
  }, []);

  /**
   * 切换编辑
   * @param {!number} index - 分组下标
   */
  const handleEditItemLineCell = useCallback(({ record }) => {
    const suggestedFlag = record.get('suggestedFlag');
    document.body.style.cursor = `url(${
      suggestedFlag ? mouseUnselectedSvg : mouseSelectedSvg
    }), pointer`;
  }, []);

  // 切换聚合模式
  const handleChangeAggregation = useCallback(
    (preAggregation) => {
      if (preAggregation === aggregation) return;
      // 通用处理
      const callBack = () => {
        curDimensionDs.loadData([]);
        setAggregation(!aggregation);
        curAggregation.current = !aggregation;
        if (dimensionCode === 'ITEM') {
          setTimeout(() => {
            currentQueryItemLines.current({ refreshFlag: true });
          }, 200);
        }
        cacheItemPosition.current = {
          start: 0,
          end: itemLinePageSize,
        };
        saveMemo({
          lastMemoObj: shareDs.getState('userMemo'),
          value: !aggregation ? 1 : 0,
          key: `${rfxHeaderId}aggregation`,
        });
      };

      if (curDimensionDs.dirty && !detailFlag && !pubFlag) {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl
            .get('ssrc.inquiryHall.message.confirm.clearTableData')
            .d('切换模式后，会清空当前表格数据，是否继续切换？'),
          onOk: () => {
            callBack();
          },
        });
      } else {
        callBack();
      }
    },
    [aggregation, curDimensionDs, dimensionCode, itemLinePageSize]
  );

  /**
   * 切换按钮组
   */
  const handleChangeButtonGroup = useCallback(
    async (activeDimensionCode, forceChange) => {
      if (activeDimensionCode === dimensionCode && !forceChange) return;
      const afterHandle = () => {
        shareDs.setState('dimensionCode', activeDimensionCode);
        clearCache();
        setDimensionCode(activeDimensionCode);
        handleQuerySyncData();
        // 平铺走筛选器
        if (curAggregation.current || forceChange) {
          setTimeout(() => {
            currentQueryItemLines.current({
              refreshFlag: true,
              dimensionCode: activeDimensionCode,
            });
          }, 100);
        }
        return saveMemo({
          lastMemoObj: shareDs.getState('userMemo'),
          value: activeDimensionCode,
          key: `${rfxHeaderId}checkPriceSelectionDimension`,
        });
      };
      curDimensionDs.loadData([]);
      // 切换页签提示-若自动保存，强制刷新后，则不调用清空
      if (activeDimensionCode !== 'ITEM' && !forceChange) {
        // 切换至物料维度, 只需查询， 反之切换至整单维度, 需要清空
        const res = await onSave('changeDimension');
        if (res) {
          afterHandle();
        }
      } else {
        afterHandle();
      }
    },
    [dimensionCode, onSave, handleQuerySyncData, curDimensionDs]
  );

  /**
   * 清空选用物料
   */
  const handleClearSelectionItems = useCallback(() => {
    Modal.confirm({
      title: intl.get(`ssrc.common.message.tips`).d('提示'),
      children: intl
        .get(`${promptCode}.message.confirm.clearSelectionItems`)
        .d('确定重置选用的物料吗?'),
      onOk: async () => {
        const params = {
          rfxHeaderId,
        };
        await cleanCheckPrice(params);
        // 置为0
        headerDs.query();
        handleQuerySyncData();
        currentQueryItemLines.current({ refreshFlag: true });
      },
    });
  }, [dimensionCode, handleQuerySyncData, curDimensionDs]);

  /**
   * 批量编辑
   */
  const handleBatchEdit = useCallback(() => {
    const batchEditDs = new DataSet(
      batchEditDS({
        headerDs,
        curDimensionDs,
        bidFlag,
        doubleUnitFlag,
        dimensionCode,
        checkWay: shareDs.getState('checkWay'),
      })
    );
    const drawerProps = {
      bidFlag,
      curDimensionDs,
      customizeForm,
      custLoading,
      doubleUnitFlag,
      dimensionCode,
      dataSet: batchEditDs,
      checkWay: shareDs.getState('checkWay'),
    };
    Modal.open({
      key: Modal.key(),
      title: intl.get(`${promptCode}.view.title.batchEdit`).d('批量编辑'),
      drawer: true,
      style: {
        width: 380,
      },
      onOk: async () => {
        const validate = await batchEditDs.validate();
        if (!validate) {
          return false;
        }
        const linesData = getLinedata() || [];

        const editQuotationLines = shareDs.getState('editQuotationLines') || [];
        const editQuotationLinesKeys = shareDs.getState('editQuotationLinesKeys') || [];
        if (linesData.length) {
          linesData.forEach((line) => {
            if (!shareDs.getState('editQuotationLinesKeys')?.includes(line.combineKey)) {
              editQuotationLines.push(line);
              editQuotationLinesKeys.push(line.combineKey);
            }
          });
        }

        const flatSelectedLine = curDimensionDs.selected?.map((record) => ({
          ...record.toJSONData(),
          allottedRatio:
            shareDs.getState('checkWay') === 'ratio' ? record.get('allottedRatio') : null,
          allottedQuantity:
            shareDs.getState('checkWay') === 'quantity' ? record.get('allottedQuantity') : null,
          allottedSecondaryQuantity:
            shareDs.getState('checkWay') === 'quantity'
              ? record.get('allottedSecondaryQuantity')
              : null,
          batchSelectFlag: 1,
          customizeFieldDirty: record.get('customizeFieldDirty'),
        }));
        const flatSelectedLineKeys = flatSelectedLine.map((item) => item.combineKey);
        let quotationHeaderIds = shareDs.getState('quotationHeaderIds');
        if (!aggregation) {
          quotationHeaderIds = [];
          flatSelectedLine.forEach((item) => {
            if (!editQuotationLinesKeys.includes(item.combineKey)) {
              editQuotationLines.push(item);
            }
            if (dimensionCode === 'ALL') {
              quotationHeaderIds.push(item.quotationHeaderId);
            }
          });
        }
        let newEditQuotationLines = editQuotationLines.map((item) => {
          if (flatSelectedLineKeys.includes(item.combineKey)) {
            return { ...item, batchSelectFlag: 1 };
          } else {
            return item;
          }
        });
        let outQuotationHeaderIds = shareDs.getState('removeQuotationHeaderIds');
        if (!aggregation && shareDs.getState('allSelectFlag')) {
          if (dimensionCode === 'ITEM') {
            const itemUnSelectArr = (shareDs.getState('itemUnSelectArr') || []).map(
              (recordData) => ({
                ...recordData.toJSONData(),
                allottedRatio:
                  shareDs.getState('checkWay') === 'ratio' ? recordData.get('allottedRatio') : null,
                allottedQuantity:
                  shareDs.getState('checkWay') === 'quantity'
                    ? recordData.get('allottedQuantity')
                    : null,
                allottedSecondaryQuantity:
                  shareDs.getState('checkWay') === 'quantity'
                    ? recordData.get('allottedSecondaryQuantity')
                    : null,
                customizeFieldDirty: recordData.get('customizeFieldDirty'),
                batchSelectFlag: 0,
              })
            );
            itemUnSelectArr.forEach((record) => {
              const curQuotationLineId = record.quotationLineId;
              newEditQuotationLines.splice(
                newEditQuotationLines.findIndex(
                  (recordData) => recordData.quotationLineId === curQuotationLineId
                ),
                1
              );
            });
            newEditQuotationLines = [...newEditQuotationLines, ...itemUnSelectArr];
          } else {
            outQuotationHeaderIds = shareDs.getState('wholeUnSelectArr') || [];
          }
        }
        batchEditDs.setQueryParameter('queryParams', {
          quotationHeaderIds,
          rfxLineItemIds: shareDs.getState('rfxLineItemIds'),
          editQuotationLines: newEditQuotationLines,
          outQuotationHeaderIds,
          outRfxLineItemIds: shareDs.getState('removeRfxLineItemIds'),
          allEditFlag: shareDs.getState('allSelectFlag') ? 1 : 0,
        });
        const res = getResponse(await batchEditDs.submit());
        if (res) {
          handleQuerySyncData();
          headerDs.query();
          // 先重置勾选
          clearCache();
          curDimensionDs.setAllPageSelection(false);
          currentQueryItemLines.current({ refreshFlag: true });
        }
      },
      onCancel: () => batchEditDs.reset(),
      onClose: () => batchEditDs.reset(),
      children: <BatchEditDrawer {...drawerProps} />,
    });
  }, [
    dimensionCode,
    curDimensionDs,
    headerDs,
    aggregation,
    clearCache,
    handleQuerySyncData,
    getLinedata,
    shareDs.getState('checkWay'),
    shareDs.getState('quotationHeaderIds'),
    shareDs.getState('rfxLineItemIds'),
    shareDs.getState('removeQuotationHeaderIds'),
    shareDs.getState('removeRfxLineItemIds'),
    shareDs.getState('allSelectFlag'),
    shareDs.getState('editQuotationLines'),
  ]);

  const handleSelectedByQuantity = useCallback(
    (currentCheckWay) => {
      shareDs.setState('checkWay', currentCheckWay);
      saveMemo({
        lastMemoObj: shareDs.getState('userMemo'),
        value: currentCheckWay,
        key: `${rfxHeaderId}checkPriceSelectionType`,
      });
    },
    [shareDs.getState('userMemo')]
  );

  // 平铺和聚合展示列字段
  const reCombineGroupColumns = useCallback(
    (options) => {
      const {
        viceStd = [],
        viceExt = [],
        std = [],
        ext = [],
        mainExt = [],
        mainStd = [],
      } = options;
      stdCol.current = std || []; // 标准columns字段
      extCol.current = ext || []; // 个性化columns字段
      mainStdCol.current = mainStd || [];
      mainExtCol.current = mainExt || [];
      viceStdCol.current = viceStd || [];
      viceExtCol.current = viceExt || [];
      const viceCommon = viceStd.filter((item) => {
        return [
          'suggestedFlag',
          'supplierCompanyInfo',
          'scoreInfo',
          'otherInfo',
          'riskScan',
          'supplierAttachmentUuid',
        ].includes(item.name);
      });

      if (dimensionCode === 'ITEM') {
        return [...mainStd, ...mainExt, ...std, ...ext, ...viceCommon];
      }
      return [...viceStd, ...viceExt];
    },
    [aggregation, dimensionCode]
  );

  const handleClickRelationMap = useCallback(
    throttle(() => {
      const companyNames = [];
      const companyNamesIdsObj = {};
      supplierLine.current.forEach((item) => {
        const { supplierCompanyName, supplierCompanyId, supplierId } = item || {};
        if ((!supplierCompanyId && !supplierId) || companyNamesIdsObj[supplierCompanyId]) {
          return;
        }
        const currentLine = {
          supplierCompanyName,
          supplierCompanyId,
          supplierId,
          rfxHeaderId,
          rfxNum: headerCurrent?.get('rfxNum'),
        };
        companyNames.push(currentLine);
        companyNamesIdsObj[supplierCompanyId] = currentLine;
      });

      // 校验头id
      idValidation(rfxHeaderId);
      const secondarySourceCategory = headerCurrent?.get('secondarySourceCategory');
      if (!secondarySourceCategory) return;

      supplierRelationMapNew({
        organizationId,
        data: {
          rfxHeaderId,
          supplierLists: companyNames,
          businessType: secondarySourceCategory,
          rfxNum: headerCurrent?.get('rfxNum'),
        },
      }).then((res) => {
        if (isText(res)) {
          const url = getSupplierRelationUrl(res);
          window.open(url);
        }
      });
    }, 500),
    [supplierLine.current, headerCurrent, rfxHeaderId]
  );

  // 查看IP重合详情
  const handleViewIPDetail = () => {
    openIPDetailModal({
      rfxHeaderId,
    });
  };

  /**
   * 渲染表格头部按钮组
   */
  const renderTableButtons = useCallback(() => {
    const checkWay = shareDs.getState('checkWay');
    return (
      <div className={styles['btn-group-content']}>
        <div className={styles['button-group-left']}>
          {customizeBtnGroup(
            {
              code: bidFlag
                ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.TABLE_HEAD_BUTTONS'
                : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.TABLE_HEAD_BUTTONS',
            },
            [
              !detailFlag && (
                <Button
                  icon="delete_sweep"
                  funcType="flat"
                  color="primary"
                  onClick={handleClearSelectionItems}
                  name="reset"
                >
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
              ),
              !(dimensionCode === 'ALL' || detailFlag) && (
                <Button
                  icon="playlist_add_check"
                  funcType="flat"
                  color="primary"
                  onClick={() =>
                    handleSelectedByQuantity(
                      useTernaryExpression(checkWay === 'quantity', 'ratio', 'quantity')
                    )
                  }
                  name="selectedByCountOrRatio"
                >
                  {useTernaryExpression(
                    checkWay === 'quantity',
                    intl.get(`${promptCode}.view.button.ratio`).d('按比例选用'),
                    intl.get(`${promptCode}.view.button.selectedByCount`).d('按数量选用')
                  )}
                </Button>
              ),
              !detailFlag && (
                <Button
                  icon="auto_complete"
                  funcType="flat"
                  color="primary"
                  onClick={handleBatchEdit}
                  disabled={
                    isEmpty(shareDs.getState('editQuotationLinesKeys')) &&
                    isEmpty(shareDs.getState('quotationHeaderIds')) &&
                    isEmpty(shareDs.getState('rfxLineItemIds')) &&
                    isEmpty(shareDs.getState('removeQuotationHeaderIds')) &&
                    isEmpty(shareDs.getState('removeRfxLineItemIds')) &&
                    !shareDs.getState('allSelectFlag') &&
                    !curDimensionDs.getState('selected')
                  }
                  name="batchEdit"
                >
                  {intl.get(`${promptCode}.view.button.batchEdit`).d('批量编辑')}
                </Button>
              ),
              useNewRateFlag ? (
                !detailFlag || pubFlag ? (
                  <Button
                    name="viewIPDetails"
                    funcType="flat"
                    icon="find_in_page"
                    onClick={handleViewIPDetail}
                  >
                    {intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.viewIPDetails`)
                      .d('查看IP重合详情')}
                  </Button>
                ) : null
              ) : (
                <IPCoincidenceRate
                  color="primary"
                  funcType="flat"
                  rfxHeaderId={rfxHeaderId}
                  bidFlag={bidFlag}
                  text={
                    <Fragment>
                      <span className={styles.svgIcon}>
                        <IP />
                      </span>
                      <span>
                        {intl.get('ssrc.inquiryHall.view.button.IPCoincidenceRate').d('IP重合率')}
                      </span>
                    </Fragment>
                  }
                  name="iPCoincidenceRate"
                />
              ),
              enterpriceRiskControllerButtonsObj?.RELATION_MINING && (
                <Button
                  funcType="flat"
                  color="primary"
                  tooltip="none"
                  onClick={handleClickRelationMap}
                  name="relationMap"
                >
                  <span className={styles.svgIcon}>
                    <SupplierRelation />
                  </span>
                  <span>
                    {intl.get(`ssrc.inquiryHall.model.inquiryHall.RelationMap`).d('供应商关系图谱')}
                  </span>
                </Button>
              ),
            ].filter(Boolean)
          )}
        </div>
        <div className="button-group-right">
          <Popover
            content={intl
              .get('ssrc.inquiryHall.model.inquiryHall.aggregateTableView')
              .d('聚合表视图')}
          >
            <div
              className={aggregation ? 'active' : 'change-table'}
              onClick={() => handleChangeAggregation(true)}
            >
              <Icon type="view_day" />
            </div>
          </Popover>
          <Popover
            content={intl.get('ssrc.inquiryHall.model.inquiryHall.flatTableView').d('平铺表视图')}
          >
            <div
              className={!aggregation ? 'active' : 'change-table'}
              onClick={() => handleChangeAggregation(false)}
            >
              <Icon type="reorder" />
            </div>
          </Popover>
        </div>
      </div>
    );
  }, [
    aggregation,
    dimensionCode,
    curDimensionDs.getState('selected'),
    shareDs.getState('columnExpandedALlStatus'),
    shareDs.getState('checkWay'),
    shareDs.getState('quotationHeaderIds'),
    shareDs.getState('rfxLineItemIds'),
    shareDs.getState('removeQuotationHeaderIds'),
    shareDs.getState('removeRfxLineItemIds'),
    shareDs.getState('allSelectFlag'),
    shareDs.getState('editQuotationLines'),
    rfxHeaderId,
    enterpriceRiskControllerButtonsObj,
  ]);

  // 展示风险提示
  const renderRiskRelation = useCallback(() => {
    if (headerCurrent) {
      const { rfxNum, secondarySourceCategory } = headerCurrent?.get([
        'rfxNum',
        'secondarySourceCategory',
      ]);
      return (
        <EmbedPage
          href="/public/sdat/relation-troubleshoot"
          location={{
            search: `?businessNumber=${rfxNum}&businessType=${secondarySourceCategory}&organizationId=${organizationId}&_timestamp=${timestamp}`,
          }}
        />
      );
    }
    return null;
  }, [headerCurrent]);

  const renderLeftDimensionSwitch = useCallback(() => {
    return (
      <Button disabled={detailFlag} funcType="link">
        <ul className={styles['left-button-group']}>
          <li
            key="ITEM"
            className={classnames(styles['button-group-item'], {
              [styles['button-group-item-selected']]: dimensionCode === 'ITEM',
            })}
            onClick={() => handleChangeButtonGroup('ITEM')}
          >
            {intl.get(`${promptCode}.view.button.itemDimensionSelected`).d('按物料选用')}
          </li>
          <li
            key="ALL"
            className={classnames(styles['button-group-item'], {
              [styles['button-group-item-selected']]: dimensionCode === 'ALL',
            })}
            onClick={() => handleChangeButtonGroup('ALL')}
          >
            {intl.get(`${promptCode}.view.button.wholePackageDimensionSelected`).d('整单选用')}
          </li>
        </ul>
      </Button>
    );
  }, [dimensionCode, handleChangeButtonGroup]);

  // 拿个性化字段放到报价信息
  const groupColumnPropsIntercept = useCallback(
    (groupId, customizeColumnProps) => {
      if (
        groupId === 'rfxLineSupplierId' &&
        dimensionCode === 'ITEM' &&
        ['localSuggestedQtnTotalAmount', 'localSuggestedQtnNetAmount'].includes(
          customizeColumnProps.name
        )
      ) {
        return {
          ...customizeColumnProps,
          aggregationTreeIndex: 1,
        };
      }
      if (
        groupId === 'rfxLineSupplierId' &&
        ![
          'allAllottedRatio',
          'allSuggestedRemark',
          'localSuggestedQtnTotalAmount',
          'localSuggestedQtnNetAmount',
        ].includes(customizeColumnProps.name)
      ) {
        return {
          ...customizeColumnProps,
          aggregationTreeIndex: 1,
        };
      } else {
        return customizeColumnProps;
      }
    },
    [dimensionCode]
  );

  const searchBarProps = useMemo(
    () => ({
      aggregation,
      dimensionCode,
      onRef: handleBindRef,
      onSearch: handleSearch,
      rightRender: renderTableButtons,
    }),
    [
      showDimensionButtonsFlag,
      renderTableButtons,
      handleSearch,
      handleBindRef,
      dimensionCode,
      aggregation,
    ]
  );

  const onAggregationChange = useCallback(
    (aggregationFlag) => {
      if (!mountFlag || aggregationFlag !== !!aggregation) {
        setAggregation(aggregationFlag);
        curAggregation.current = aggregationFlag;
        saveMemo({
          lastMemoObj: shareDs.getState('userMemo'),
          value: aggregationFlag ? 1 : 0,
          key: `${rfxHeaderId}aggregation`,
        });
        currentQueryItemLines.current({ refreshFlag: true });
      }
    },
    [mountFlag, rfxHeaderId, aggregation]
  );

  const SearchBarWrapComp = useMemo(() => <SearchBarWrap {...searchBarProps} />, [searchBarProps]);

  const feedBackBarginHistoryModalProps = {
    quotationName: getQuotationName(bidFlag),
    search: feedBackBarginHistorySearch.current,
    organizationId,
    doubleUnitFlag,
    feedBackBarginHistoryStatus,
    onCancel: () => setFeedBackBarginHistoryStatus(false),
  };

  const extraColumn = useMemo(
    () => ({
      width: 150,
      header: (
        <div style={{ marginTop: '8px' }}>
          {intl.get('ssrc.inquiryHall.view.card.subtitle.quotationInfo').d('报价信息')}
        </div>
      ),
      align: 'left',
      children:
        dimensionCode === 'ITEM'
          ? [
              {
                header: ({ aggregationTree, title }) =>
                  aggregationTree
                    ? React.cloneElement(aggregationTree[1], {
                        hideValue: true,
                        column: {
                          ...aggregationTree[1]?.props?.column,
                          aggregationLimit: checkQuotationLineHigh || 3,
                          aggregationLimitDefaultExpanded: false,
                        },
                      })
                    : title,
              },
            ]
          : [
              {
                header: ({ aggregationTree, title }) =>
                  aggregationTree
                    ? React.cloneElement(aggregationTree[0], {
                        hideValue: true,
                      })
                    : title,
                children: [
                  {
                    header: ({ aggregationTree, title }) =>
                      aggregationTree
                        ? React.cloneElement(aggregationTree[1], {
                            hideValue: true,
                            column: {
                              ...aggregationTree[1]?.props?.column,
                              aggregationLimit: checkQuotationLineHigh || 3,
                              aggregationLimitDefaultExpanded: false,
                            },
                          })
                        : title,
                  },
                ],
              },
            ],
    }),
    [dimensionCode, checkQuotationLineHigh]
  );
  const extraScoreColumn = useMemo(() => ({
    width: 150,
    header: ({ dataSet, group, title }) => {
      const inHeaderRecord = group?.totalRecords?.find((record) => record.get('showInHeader'));
      const { sumPassStatus } = inHeaderRecord.get([
        'approvedCount',
        'sumPassStatus',
        'totalScore',
        'rankTeam',
      ]);
      return group ? (
        <div>
          <div>
            <span className={tableStyles['header-label']}>
              {sumPassStatus
                ? intl.get(`ssrc.inquiryHall.model.inquiryHall.scoringResult`).d('打分结果')
                : intl.get(`ssrc.inquiryHall.model.inquiryHall.totalScore`).d('总分')}
            </span>
          </div>
          {/* 区分商务技术时, 才显示分组信息 */}
          {dataSet.current?.get('sourceRuleType') === 'DIFF' &&
            group?.totalRecords.reduce((list, record) => {
              const { titleMeaning, showInHeader } = record.get([
                'score',
                'titleMeaning',
                'showInHeader',
                'tempIndicateId',
                'businessApprovedCount',
                'technologyApprovedCount',
              ]);
              if (showInHeader) {
                list.push(
                  <div>
                    <span className={tableStyles['header-label']}>{titleMeaning}</span>
                  </div>
                );
              }
              return list;
            }, [])}
          {/* <Tooltip title={candidateSuggestion} placement="top" theme="light"> */}
          <div className={tableStyles.candidateSuggestion}>
            <div className={tableStyles['header-label']}>
              {intl.get(`${promptCode}.model.inquiryHall.candidateReason`).d('推荐理由')}
            </div>
          </div>
          {/* </Tooltip> */}
        </div>
      ) : (
        title
      );
    },
  }));

  let itemTableProps = {};
  itemTableProps = remote
    ? remote.process(
        'SSRC_CHECK_PRICE_NEW_C7N_PROCESS_ITEM_TABLE_GROUP_TABLE_PROPS',
        itemTableProps,
        {
          detailFlag,
          bidFlag,
          aggregation,
        }
      )
    : itemTableProps;
  itemTableProps = itemTableProps || {};

  let scoreTableVisible = aggregation && !!scoreDs.totalCount;
  scoreTableVisible = remote
    ? remote.process('SSRC_CHECK_PRICE_NEW_C7N_PROCESS_SCORETABLE_VISIBLE', scoreTableVisible, {
        detailFlag,
        bidFlag,
        aggregation,
        pageProps: props,
      })
    : scoreTableVisible;

  return (
    <div className={styles[`${PrefixCls}-table-container`]}>
      <SubTitle
        renderHeaderButton={renderHeaderButton}
        bidFlag={bidFlag}
        sectionFlag={sectionFlag}
      />
      <div className="divider" />
      {isTechExpertFlag ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <NoData />
          <div style={{ marginTop: '16px', color: '#868d9c' }}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.temporarilyNoData`).d('暂无数据')}
          </div>
        </div>
      ) : (
        <>
          {renderRiskRelation()}
          <div className={styles['dimension-button-wrap-area']}>
            {showDimensionButtonsFlag && !detailFlag ? renderLeftDimensionSwitch() : ''}
          </div>
          {SearchBarWrapComp}
          {customizeTable(
            {
              readOnly: detailFlag,
              code: bidFlag
                ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL'
                : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL',
              mainGroupCode: bidFlag
                ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ITEM_DETAIL'
                : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ITEM_DETAIL',
              viceGroupCode: bidFlag
                ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.SUPPLIER_DETAIL'
                : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.SUPPLIER_DETAIL',
              dataSet: dimensionCode === 'ITEM' ? itemDs : wholePackageDs,
              groupColumnPropsIntercept,
              groupMode: aggregation ? 'head-col' : 'none', // head-col | col-col | none
              reCombineGroupColumns,
            },
            <Table
              virtual={aggregation}
              virtualCell={aggregation}
              queryBar="none"
              aggregationCellLineBreak
              aggregationCellLineLimit={4} // 在表格单元格行增加换行处理
              aggregation={aggregation}
              onAggregationChange={onAggregationChange}
              columnTitleEditable
              className={classnames(
                aggregation ? 'quotation_table_aggregation' : 'quotation_table',
                aggregation && !detailFlag ? 'editTable' : ''
              )}
              border={false}
              spin={{ spinning: tableLoading }}
              dataSet={dimensionCode === 'ITEM' ? itemDs : wholePackageDs}
              columns={itemColumns}
              headerGroupExtraColumn={extraColumn}
              groups={itemGroups}
              headerRowHeight="auto"
              onScrollLeft={aggregation && handleItemTableScrollLeft}
              onScrollTop={aggregation && handleItemTableScrollTop}
              onColumnResize={handleItemTableColumnResize}
              ref={itemTableRef}
              style={tableStyle}
              bodyExpandable={aggregation}
              bodyExpanded={itemBodyExpanded}
              onBodyExpand={handleBodyExpandItem}
              highLightRow={false}
              showAllPageSelectionButton
              aggregationExpandType="row"
              aggregationExpandTypeChangeable={false}
              {...itemTableProps}
            />
          )}
          {scoreTableVisible
            ? customizeTable(
                {
                  readOnly: detailFlag,
                  viceGroupCode: bidFlag
                    ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.OTHER'
                    : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.OTHER',
                  dataSet: scoreDs,
                },
                <Table
                  virtual
                  virtualCell
                  customizable={false}
                  aggregation
                  columnDraggable
                  aggregationCellLineBreak
                  aggregationCellLineLimit={4} // 在表格单元格行增加换行处理
                  headerGroupExtraColumn={extraScoreColumn}
                  queryBar="none"
                  className={classnames(
                    aggregation ? 'score_table_aggregation' : 'score_table',
                    aggregation && !detailFlag ? 'editScoreTable' : ''
                  )}
                  columnTitleEditable
                  border={false}
                  dataSet={scoreDs}
                  columns={scoreColumns}
                  groups={scoreGroups}
                  headerRowHeight="auto"
                  footerRowHeight="auto"
                  onScrollLeft={handleScoreTableScrollLeft}
                  onColumnResize={handleScoreTableColumnResize}
                  ref={scoreTableRef}
                  style={tableStyle}
                  selectionMode="none"
                  bodyExpandable
                  onBodyExpand={handleBodyExpandScore}
                  bodyExpanded={scoreBodyExpanded}
                  highLightRow={false}
                  aggregationExpandType="row"
                  aggregationExpandTypeChangeable={false}
                />
              )
            : ''}
        </>
      )}
      {feedBackBarginHistoryStatus ? (
        <FeedBackBarginHistoryModal {...feedBackBarginHistoryModalProps} />
      ) : null}
    </div>
  );
});

export default memo(ItemTable);
