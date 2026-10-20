import React, { createContext, useEffect, useMemo, useCallback } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { useLocalStore } from 'mobx-react-lite';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { set, get, toJS, runInAction } from 'mobx';
import { isNil } from 'lodash';
import querystring from 'querystring';

import { BID } from '@/utils/globalVariable';
import { getJumpRoutePrefixUrl } from '@/utils/utils';
import { queryMapIdpValue } from 'services/api';
import { fetchNewCheckPriceUserMemory } from '@/services/checkPriceNewService';
// import { queryUnitCustConfig } from '@/services/inquiryHallService'

import { headerDS, itemDS, scoreDS, wholePackageDS } from './storeDS';
import { shareDS } from './shareDS';

const StoreContext = createContext({});

function StoreProvider(props) {
  const {
    onLoad,
    history,
    children,
    location,
    sourceKey,
    detailFlag,
    custLoading,
    customizeBtnGroup,
    customizeForm,
    custConfig,
    onFormLoaded,
    customizeTable,
    doubleUnitFlag,
    customizeCollapseForm,
    match: { params, path },
    pubRouterAddParams = () => {},
    detailFinishedFlag,
    remote,
    isTechExpertFlag = false,
  } = props;

  const rfxHeaderId = useMemo(() => params.rfxId, [params.rfxId]);
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const isSection = useMemo(
    () => !!routerParams.projectLineSectionId && routerParams.projectLineSectionId !== 'null',
    [routerParams]
  ); // 判断是否需要查多标段
  const organizationId = useMemo(() => getCurrentOrganizationId(), []);
  const activeTabKey = useMemo(() => getJumpRoutePrefixUrl(location.pathname), []);
  const bidFlag = useMemo(() => sourceKey === BID, [sourceKey]); // 是否新招标
  const pubFlag = useMemo(() => path.indexOf('/pub') > -1, []);
  const coverPriceFields = useMemo(() => {
    if (pubFlag || detailFinishedFlag) {
      return [];
    }
    const config =
      custConfig[
        !bidFlag
          ? 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL'
          : 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL'
      ] || {};
    const targetField = ['changePercent', 'minPrice', 'newPrice'];
    const list = config.fields?.filter((field = {}) => {
      if (targetField.includes(field.fieldCode)) {
        return field.visible !== 0;
      }
      return false;
    });
    return list || [];
  }, [bidFlag, custConfig]);
  const headerDs = useDataSet(
    () =>
      headerDS({
        bidFlag,
        rfxHeaderId,
        customizeUnitCode: bidFlag
          ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.BASE_INFO,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT'
          : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.BASE_INFO,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ATTACHMENT',
        pubRouterAddParams,
      }),
    [rfxHeaderId]
  ); // 头表单ds
  const hiddenCustMethod = useMemo(() => {
    if (custConfig && custConfig['SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL']) {
      const target = custConfig[
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL'
      ].fields?.filter((item) => {
        return item.fieldCode === 'allocationMethod';
      });
      return target[0]?.visible === 0;
    }
  }, [custConfig]);
  const shareDs = useDataSet(() => shareDS(), [rfxHeaderId]); // 共享数据ds
  const itemDs = useDataSet(
    () => itemDS({ shareDs, doubleUnitFlag, bidFlag, rfxHeaderId, detailFlag }),
    [doubleUnitFlag, rfxHeaderId, detailFlag]
  ); // 表格物料ds
  const wholePackageDs = useDataSet(
    () => wholePackageDS({ shareDs, doubleUnitFlag, bidFlag, rfxHeaderId, detailFlag }),
    [doubleUnitFlag, rfxHeaderId, detailFlag]
  ); // 表格整单ds
  const scoreDs = useDataSet(() => scoreDS(), [rfxHeaderId]); // 评分ds

  // 创建自定义响应性数据, 由于context穿透性质, 导致父组件state更新后, context.provider value 发生改变,
  // 如子组件依赖 stateB 然后非依赖的stateA改变, 导致子组件仍然更新, 解决方式: value 使用memo 和 useLocalStore 存放 `不变state`,
  // 实际变化的state 使用mobx 管理, 但整体 value 仍然不变
  const reactionStoreData = useLocalStore(() => ({
    storeData: {
      // 扁平化声明,基础类型
      checkWay: 'ratio',
    },
    setStoreData(key, value) {
      set(this.storeData, key, value); // 针对动态添加属性 by mobx 4.*
    },
    getStoreData(key) {
      return isNil(key) ? toJS(this.storeData) : get(this.storeData, key); // 避免直接引用toJS 递归遍历所有属性, 触发不必要更新
    },
  }));

  // const { setStoreData } = reactionStoreData;
  // 查询用户记忆
  const handleSearchMemory = useCallback(async () => {
    const res = getResponse(
      await fetchNewCheckPriceUserMemory({
        configKeys: [
          `${rfxHeaderId}aggregation`,
          `${rfxHeaderId}checkPriceSelectionDimension`,
          `${rfxHeaderId}checkPriceSelectionType`,
          `${rfxHeaderId}checkSelectionDimension`,
          `${rfxHeaderId}checkRecommendationStrategyDetail`,
        ],
      })
    );
    if (res) {
      shareDs.setState(
        'dimensionCode',
        res[`${rfxHeaderId}checkPriceSelectionDimension`]?.configValue
      );

      let checkWayValue = res[`${rfxHeaderId}checkPriceSelectionType`]?.configValue || 'quantity';
      checkWayValue = remote
        ? remote.process('SSRC_CHECK_PRICE_NEW_C7N_PROCESS_CHECKWAY_USER_DEFAULT', checkWayValue, {
            pageProps: props,
          })
        : checkWayValue;

      shareDs.setState('checkWay', checkWayValue); // 按数量/按比例 核价
      shareDs.setState('aggregation', res[`${rfxHeaderId}aggregation`]?.configValue || '1');
      shareDs.setState(
        'checkSelectionDimension',
        res[`${rfxHeaderId}checkSelectionDimension`]?.configValue
      );
      shareDs.setState(
        'checkRecommendationStrategyDetail',
        res[`${rfxHeaderId}checkRecommendationStrategyDetail`]?.configValue
      );
      shareDs.setState('userMemo', res);
      // handleQuerySyncData(res);
    }
    return res;
  }, [rfxHeaderId, shareDs]);

  /**
   * 查询配置/值集等数据
   */
  const fetchSettingAndLovData = useCallback(async () => {
    const res = getResponse(await queryMapIdpValue({ sourceType: 'SSRC.BARGAIN_METHOD' })); // 议价方式
    if (res) {
      shareDs.setState('sourceType', res.sourceType);
    }
  }, []);

  useEffect(() => {
    handleSearchMemory();
  }, [handleSearchMemory]);

  useEffect(() => {
    fetchSettingAndLovData();
    let defaultCheckWay = 'quantity';

    defaultCheckWay = remote
      ? remote.process('SSRC_CHECK_PRICE_NEW_C7N_PROCESS_CHECKWAYDEFAULT', defaultCheckWay, {
          detailFlag,
          bidFlag,
          pageProps: props,
          pubFlag,
        })
      : defaultCheckWay;

    runInAction(() => {
      shareDs.setState('checkWay', defaultCheckWay); // 核价方式
      // shareDs.setState('dimensionCode', ''); // 选用维度
      shareDs.setQueryParameter('rfxHeaderId', rfxHeaderId);
      // 或者放置在 storeData 中
    });
  }, []);

  useEffect(() => {
    runInAction(() => {
      shareDs.setState('coverPriceFields', coverPriceFields); // 价格库字段
    });
  }, [coverPriceFields]);

  const value = useMemo(
    () => ({
      path,
      onLoad,
      bidFlag,
      history,
      pubFlag,
      sourceKey,
      location,
      isSection,
      custConfig,
      custLoading,
      detailFlag,
      onFormLoaded,
      organizationId,
      hiddenCustMethod,
      customizeBtnGroup,
      customizeForm,
      customizeTable,
      customizeCollapseForm,
      activeTabKey,
      routerParams,
      doubleUnitFlag,
      isTechExpertFlag,
      coverPriceFields,
      commonDs: {
        headerDs,
        itemDs,
        wholePackageDs,
        scoreDs,
        shareDs,
      },
      routeParams: {
        rfxHeaderId,
      },
      ...reactionStoreData,
      pubRouterAddParams,
      remote,
    }),
    [
      history,
      location,
      custLoading,
      customizeBtnGroup,
      customizeForm,
      hiddenCustMethod,
      customizeTable,
      customizeCollapseForm,
      activeTabKey,
      headerDs,
      itemDs,
      wholePackageDs,
      scoreDs,
      shareDs,
      rfxHeaderId,
      doubleUnitFlag,
      coverPriceFields,
      reactionStoreData,
    ]
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export default StoreProvider;
export { StoreContext };
