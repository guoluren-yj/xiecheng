import React, { Fragment, useState, useEffect, useMemo } from 'react';
import qs from 'qs';
import { flowRight } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
// import { observer } from 'mobx-react-lite';
// import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, filterNullValueObject } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { fetchInfoWorkflowApprove, fetchTypeSpecs } from '../../SkuCreate/api';
import { fetchLastVersion } from '../../SkuApprove/api';
import ContentDetail from './ContentDetail';
import { baseInfoDs, skuInfoDs, saleInfoDs } from '../ds.js';
import SkuContext from '../skuContext';
import customStore from '../customStore';
import styles from './index.less';

const skuDetailCode = customStore.getAllCustomCode();

const initStores = () => {
  return {
    spuDs: [new DataSet(baseInfoDs()), new DataSet(baseInfoDs())],
    skuDs: [new DataSet(skuInfoDs()), new DataSet(skuInfoDs())],
    priceDs: [new DataSet(saleInfoDs()), new DataSet(saleInfoDs())],
  };
};

// 比较id是否相等
const isEqual = (id, _id) => String(id) === String(_id);

function WorkFlow(props) {
  const {
    location,
    location: { pathname },
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    onFormLoaded,
  } = props;
  // 是否为供应商
  const isSup = pathname.includes('-sup');
  const { req, skuId, hiddenSku, skuTemporaryId, hiddenHeaderBtn } =
    qs.parse(location.search.substr(1)) || {}; // 获取路由参数
  const [changeFlag, setChangeFlag] = useState(false); // 已变更单据
  const [onlyShowUpdateItem, setOnlyShowUpdateItem] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    skuId, // 当前skuId
    skuList: [], // 当前sku集合
    lastSkuList: [], // 历史版sku集合
    specsData: [], // 分类下规格属性
    currentSpu: [], // spu信息
  });
  const anchorPre = isSup ? 'SUP' : 'PUR';
  const dataSetMap = useMemo(() => initStores(), []); // 生成ds
  const { spuDs, skuDs, priceDs } = dataSetMap;

  // 更新个性化配置
  (function initCustomStore() {
    customStore.setState('isReceive', req === 'receive');
    customStore.setCustFuncs({ customizeForm, customizeTable, customizeBtnGroup });
    customStore.setCustomCode(isSup);
  })();

  useEffect(() => {
    initData();
  }, [skuTemporaryId, dataSetMap]);

  // 当前商品
  // const currentSku = useMemo(() => {
  //   return data.skuList.find((f) => isEqual(f.skuId, data.skuId)) || {};
  // }, [data.skuId, data.skuList]);

  // 初始化查询
  async function initData() {
    const customizeUnitCode = skuDetailCode.join(',');
    // skuTemporaryId查询待审批商品或者查询工作流审批商品
    if (skuTemporaryId) {
      setLoading(true);
      const result = getResponse(
        await fetchInfoWorkflowApprove(
          filterNullValueObject({
            skuId: data.skuId,
            skuTemporaryId,
            customizeUnitCode,
            workflowQueryFlag: 1,
          })
        )
      );
      setLoading(false);
      if (result) {
        const { skuList = [], ...baseInfo } = result;
        const { categoryId, customFlag, comparisonFlag } = baseInfo;
        setChangeFlag(comparisonFlag);
        const newSkuList =
          skuList?.map((sku) => ({ ...sku, customFlag, sourceFrom: baseInfo.sourceFrom })) || [];
        const filterSku = skuId ? newSkuList.filter((f) => isEqual(f.skuId, skuId)) : newSkuList;
        spuDs[0].loadData([baseInfo]);
        skuDs[0].loadData(filterSku);
        initSaleInfo(filterSku[0]);
        const specsData = getResponse(await fetchTypeSpecs({ categoryId })) || [];
        const _data = {
          spuId: result.spuId,
          skuId: skuId || skuList?.[0]?.skuId,
          skuList: newSkuList,
          specsData,
          currentSpu: [result],
        };
        setData(_data);
        // 已变更单据再查询前版本数据
        if (comparisonFlag) {
          getLastVersionData(_data);
        }
        if (onFormLoaded) {
          onFormLoaded(true);
        }
      }
    }
  }

  function initSaleInfo(sku) {
    const { skuSalesInfos = [] } = sku || {};
    priceDs[0].loadData(skuSalesInfos || []);
    priceDs[0].setQueryParameter('skuId', sku?.skuId);
  }

  const getLastVersionData = async (_data) => {
    const { skuId: _skuId, currentSpu } = _data;
    const customizeUnitCode = skuDetailCode.join(',');
    const res = getResponse(
      await fetchLastVersion({ ...(currentSpu?.[0] || {}), customizeUnitCode })
    );
    if (res) {
      const { skuList: lastSkuList = [], ...baseInfo } = res;
      const filterSku = _skuId ? lastSkuList.filter((f) => isEqual(f.skuId, _skuId)) : lastSkuList;
      skuDs[1].loadData(filterSku);
      spuDs[1].loadData([baseInfo]);
      const { skuSalesInfos = [] } = filterSku[0] || {};
      priceDs[1].loadData(skuSalesInfos || []);
      setData((p) => ({ ...p, lastSkuList, currentSpu: [p.currentSpu?.[0], res] }));
    }
  };

  const onViewChange = async (key) => {
    if (key === 'order') {
      setOnlyShowUpdateItem(false);
    } else {
      setOnlyShowUpdateItem(true);
    }
  };

  return (
    <Fragment>
      <div className={styles['sku-content-detail']}>
        <SkuContext.Provider
          value={{
            hiddenSku,
            onViewChange,
            changeFlag,
            onlyShowUpdateItem,
          }}
        >
          <ContentDetail
            isSup={isSup}
            spuId={data.spuId}
            spuDs={spuDs}
            skuId={data.skuId}
            skuDs={skuDs}
            priceDs={priceDs}
            loading={loading}
            anchorPre={anchorPre}
            skuList={data.skuList}
            changeFlag={changeFlag}
            onlyShowUpdateItem={onlyShowUpdateItem}
            specsData={data.specsData}
            currentSpu={data.currentSpu}
            skuTemporaryId={skuTemporaryId}
            hiddenHeaderBtn={hiddenHeaderBtn}
          />
        </SkuContext.Provider>
      </div>
    </Fragment>
  );
}

export default flowRight(
  withCustomize({ unitCode: skuDetailCode }),
  formatterCollections({ code: ['smpc.product', 'small.common', 'sagm.common', 'srm.common'] })
)(WorkFlow);
