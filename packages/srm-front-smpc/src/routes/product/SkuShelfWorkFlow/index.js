import React, { Fragment, useMemo, useState, useEffect } from 'react';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { flowRight } from 'lodash';
import qs from 'qs';
import { DataSet, Spin } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  fetchBatchShelfWorkflowApprove,
  fetchShelfWorkflowSkuInfo,
} from '@/services/product/shelfApply';
import { fetchEcApproveSkuInfo } from '../EcSkuApproveDetail/api';

import HeaderAFBasic from './HeaderAFBasic';

import { batchShelfHeaderDs } from './ds';
import styles from './index.less';
import ContentDetail from './ContentDetail';
import customStore from './customStore';

const unitCode = customStore.getAllCustomCode();

const RenderTabPane = observer(({ sku, currentId }) => {
  const { skuId, skuCode, skuName, supplierCompanyName, salePrice } = sku || {};
  return (
    <div className="tab-item">
      <div className={classNames('title', { 'title-active': skuId === currentId })}>
        {skuCode}-{skuName}&nbsp;&nbsp;
      </div>
      <div className="sub-title">
        <span style={{ maxWidth: '100px' }}>{supplierCompanyName}</span>
        <span className="divider">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <span style={{ maxWidth: '62px' }}>{salePrice}</span>
      </div>
    </div>
  );
});

function SkuShelfWorkFlow(props) {
  const { customizeCommon, customizeForm, customizeTable, location, onFormLoaded } = props;
  const { batchId, sourceFrom = 'CATA' } = qs.parse(location.search.substr(1)) || {}; // 获取路由参数
  const ds = useMemo(() => new DataSet(batchShelfHeaderDs()), []);
  const [skuInfos, setSkuInfos] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skuLoading, setSkuLoading] = useState(true);
  const handleTabChange = (skuId) => {
    fetchMoreSkuInfo(skuId);
  };

  // 更新个性化配置
  (function initCustomStore() {
    customStore.setState('sourceFrom', sourceFrom);
    customStore.setCustFuncs({ customizeForm, customizeTable, customizeCommon });
    customStore.setCustomCode();
  })();

  function initData() {
    setLoading(true);
    fetchBatchShelfWorkflowApprove(batchId, sourceFrom).then((res) => {
      setLoading(false);
      if (getResponse(res)) {
        ds.loadData([{ sourceFrom, ...res }]);
        setSkuInfos(res?.lineList || []);
        fetchMoreSkuInfo(res?.lineList?.[0]?.skuId);
        if (onFormLoaded) {
          onFormLoaded(true);
        }
      }
    });
  }

  function fetchMoreSkuInfo(skuId) {
    if (!skuId) {
      return false;
    }
    setSkuLoading(true);
    setCurrentId(skuId);
    const fetchInfoApi = sourceFrom !== 'CATA' ? fetchEcApproveSkuInfo : fetchShelfWorkflowSkuInfo;
    fetchInfoApi(skuId).then((res) => {
      setSkuLoading(false);
      if (getResponse(res)) {
        setSkuInfos((prev) =>
          prev.map((sku) => {
            if (sku.skuId === skuId) {
              return { ...res, ...sku };
            }
            return sku;
          })
        );
      }
    });
  }

  useEffect(() => {
    initData();
  }, [batchId]);

  return (
    <Fragment>
      <Spin spinning={loading}>
        <div className={styles['sku-shelf-detail']}>
          <HeaderAFBasic dataSet={ds} />
          <Content style={{ margin: '8px 0 0 0', padding: '20px 20px 0 20px' }}>
            <div className="sku-shelf-title">
              {intl.get('smpc.product.model.skuInfo').d('商品信息')}
            </div>
            <div>
              <Tabs tabPosition="left" onChange={handleTabChange}>
                {skuInfos.map((sku) => (
                  <Tabs.TabPane
                    tab={<RenderTabPane sku={sku} currentId={currentId} />}
                    key={sku.skuId}
                  >
                    <Spin spinning={skuLoading}>
                      <ContentDetail sku={sku} />
                    </Spin>
                  </Tabs.TabPane>
                ))}
              </Tabs>
            </div>
          </Content>
        </div>
      </Spin>
    </Fragment>
  );
}

export default flowRight(
  withCustomize({ unitCode }),
  formatterCollections({ code: ['smpc.product', 'small.common', 'srm.common'] })
)(SkuShelfWorkFlow);
