/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
/**
 * 2026-02-10 ProductPrice/index.js
 * 商品价格页面
 * Author: Felix(LQX5731@163.com)
 * Version: 1.0.0
 * Last Update: 2026-03-04
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from 'components/Page';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DataSet, Table, Button, Tabs, Modal, TextField } from 'choerodon-ui/pro';
import { Menu, Icon } from 'choerodon-ui';
import { openTab } from 'utils/menuTab';
import intl from 'utils/intl';
import moment from 'moment';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import * as echarts from 'echarts';

import { SRM_DATA_SDAT } from '@/utils/config';
import ExcelExportPro from '@/components/ExcelExportPro';
import { ReactComponent as InitComp } from '@/assets/product-price.svg';
import { fetchTreeData, fetchChartData } from '@/services/marketCollection/productManageService';

import { ProductPriceDS, TieredPriceDS } from './stores/productPriceDS';
import FilterComp from './FilterComp';
import styles from './index.less';

const { TabPane } = Tabs;
const { SubMenu, Item } = Menu;

let commonParams = null;
let chartData = {};
let searchContent = '';

function ProductPrice() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const priceDS = useMemo(() => new DataSet(ProductPriceDS()), []);
  const tieredPriceDS = useMemo(() => new DataSet(TieredPriceDS()), []);

  const [activeTab, setActiveTab] = useState('table');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    handleQueryTreeData('init');

    return () => {
      commonParams = null;
      chartData = {};
      searchContent = '';
    };
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      // 根据选中的商品查询数据
      const { commodityCode } = selectedProduct;
      const { businessDateStart, businessDateEnd } = commonParams || {};
      priceDS.setQueryParameter('commodityCode', commodityCode);
      priceDS.setQueryParameter('businessDateStart', businessDateStart);
      priceDS.setQueryParameter('businessDateEnd', businessDateEnd);
      priceDS.query();
      getChartData({ ...commonParams, commodityCode });
    }
  }, [selectedProduct]);

  const handleQueryTreeData = (type = '') => {
    fetchTreeData({
      commodityName: searchContent || '',
    }).then((res) => {
      if (getResponse(res)) {
        if (type === 'init') {
          setIsInitialized(res?.length > 0);
        }
        setTreeData(res);
      }
    });
  };

  // 更新图表逻辑
  const updateChart = () => {
    if (!chartInstance.current) return;

    const { dataList = [], unit = '' } = chartData || {};
    let xAxisData = [];

    const seriesDataList = [];
    if (dataList && dataList.length) {
      // 找到 priceList 最长的数据
      let longestPriceList = [];
      dataList.forEach((item) => {
        if (item.priceList && item.priceList.length > longestPriceList.length) {
          longestPriceList = item.priceList;
        }
      });

      // xAxisData 横坐标取 priceList 最长的数据里的 date
      xAxisData = longestPriceList.map((data) => data.date);

      // 构建 seriesDataList，缺少日期的补充 null
      dataList.forEach((item) => {
        const priceMap = {};
        if (item.priceList) {
          item.priceList.forEach((data) => {
            priceMap[data.date] = data.price;
          });
        }

        seriesDataList.push({
          name: item.name,
          data: xAxisData.map((date) => priceMap[date] || null),
        });
      });
    }
    const seriesData = [...seriesDataList].map((item) => ({
      name: item.name,
      type: 'line',
      data: item.data,
      smooth: true,
      connectNulls: true,
      itemStyle: { color: item.color },
      markPoint: {
        data: [
          { type: 'max', name: 'Max' },
          { type: 'min', name: 'Min' },
        ],
      },
      markLine: {
        data: [{ type: 'average', name: 'Avg' }],
      },
    }));

    const option = {
      title: {
        text: selectedProduct
          ? intl.get('sdat.productPrice.view.chart.titleWithName', { name: selectedProduct.name })
          : intl.get('sdat.productPrice.view.chart.titleProduct').d('商品价格趋势'),
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: seriesData.map((s) => s.name),
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
      },
      yAxis: {
        type: 'value',
        name: `价格 ${unit && unit !== 'null' ? `(${unit})` : ''}`,
        scale: true,
        axisLabel: {
          formatter: `{value}`,
        },
      },
      series: seriesData,
    };

    chartInstance.current.setOption(option, true);
  };

  // 初始化图表
  useEffect(() => {
    let timer;
    if (activeTab === 'chart') {
      // 使用 setTimeout 确保 DOM 已经渲染且有宽高，解决第一次切换不显示的问题
      timer = setTimeout(() => {
        if (chartRef.current) {
          if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
          }
          chartInstance.current.resize(); // 确保尺寸正确
          updateChart();
        }
      }, 200);
    }

    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timer) clearTimeout(timer);
    };
  }, [activeTab]);

  const handleMenuClick = ({ key }) => {
    // 查找对应的节点数据
    const findNode = (nodes, targetId) => {
      for (const node of nodes) {
        const nodeId = node.commodityId || node.commodityCode;
        if (nodeId && String(nodeId) === String(targetId)) return node;
        if (node.children?.length > 0 || node.commodityList?.length > 0) {
          const found = findNode(
            node.children?.length ? node.children : node.commodityList,
            targetId
          );
          if (found) return found;
        }
      }
      return null;
    };

    const node = findNode(treeData, key);

    if (node && node.commodityCode) {
      setSelectedProduct(node);
    }
  };

  const renderMenu = (data) => {
    return data.map((item) => {
      if ((item.children && item.children.length > 0) || item.commodityList?.length > 0) {
        return (
          <SubMenu
            key={item.categoryId || item.categoryCode}
            title={<span>{item.categoryName}</span>}
          >
            {renderMenu(item.children?.length ? item.children : item.commodityList)}
          </SubMenu>
        );
      }
      return <Item key={item.commodityId || item.commodityCode}>{item.commodityName}</Item>;
    });
  };

  const handleTieredPrice = (record) => {
    let modal = null;
    const { specifications, marketDataId, market, priceUnit, businessDate, collectionDate } =
      record?.toData() ?? {};

    tieredPriceDS.setQueryParameter('marketDataId', marketDataId);
    tieredPriceDS.query().then(() => {
      if (tieredPriceDS?.length > 0) {
        tieredPriceDS.forEach((rcd) => {
          rcd.set('specifications', specifications);
          rcd.set('market', market);
          rcd.set('priceUnit', priceUnit);
          rcd.set('businessDate', businessDate);
          rcd.set('collectionDate', collectionDate);
          // eslint-disable-next-line no-param-reassign
          rcd.status = 'sync';
        });
      }
    });

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    modal = Modal.open({
      title: intl.get('sdat.productManagement.view.title.tieredPrice').d('阶梯价'),
      drawer: true,
      style: { width: 1000 },
      destroyOnClose: true,
      children: (
        <div style={{ height: 'calc(100vh - 280px)' }}>
          <Table
            dataSet={tieredPriceDS}
            autoHeight={{ type: 'maxHeight', diff: 20 }}
            queryBar="none"
            customizable
            customizedCode="SDAT.PRODUCT_PRICE_TIERED_PRICE_MODAL_LIST"
          >
            <Table.Column name="tieredCode" width={160} />
            <Table.Column name="tieredName" width={160} />
            <Table.Column name="commodityCode" width={160} />
            <Table.Column name="specifications" />
            <Table.Column name="market" />
            <Table.Column name="priceUnit" />
            <Table.Column name="price" />
            <Table.Column name="maxPrice" />
            <Table.Column name="minPrice" />
            <Table.Column name="businessDate" width={140} />
          </Table>
        </div>
      ),
      closable: true,
      footer: (
        <div>
          <Button color="primary" onClick={() => handleCloseModal()}>
            {intl.get('hzero.common.btn.close').d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  const renderAction = (record) => {
    const tieredPricing = record?.get('tieredPricing') || '';
    return tieredPricing === '1' ? (
      <a color="primary" onClick={() => handleTieredPrice(record)}>
        {intl.get('sdat.productPrice.view.button.tieredPrice').d('阶梯价')}
      </a>
    ) : null;
  };

  const handleInitConfig = () => {
    openTab({
      key: `/sdat/collection-product-manage`,
      title: intl.get('sdat.productManagement.view.title.productManagement').d('商品管理'),
    });
  };

  const renderInitPage = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 148px)',
        backgroundColor: '#fff',
        margin: '8px',
      }}
    >
      <div className={styles['init-comp-container']}>
        <InitComp style={{ width: '300px', height: '160px' }} />
      </div>
      <div style={{ marginTop: '8px', color: '#868D9C', fontSize: '14px', marginBottom: '24px' }}>
        {intl
          .get('sdat.productPrice.view.message.initDesc')
          .d('当前未进行商品配置，需要先进行商品配置才可以查看商品价格。点击跳转至配置页面')}
      </div>
      <Button color="primary" icon="settings-o" onClick={() => handleInitConfig()}>
        {intl.get('sdat.productPrice.button.productConfig').d('商品配置')}
      </Button>
    </div>
  );

  const queryParams = () => {
    const { commodityCode } = selectedProduct;

    const exportList = priceDS?.selected?.map((item) => item.get('marketDataId')) || [];

    return {
      ...commonParams,
      commodityCode,
      marketDataIds: exportList?.length ? exportList.join(',') : '',
    };
  };

  const getChartData = (params) => {
    fetchChartData(params).then((res) => {
      if (getResponse(res)) {
        chartData = { ...res };
        updateChart();
      }
    });
  };

  const handleFilterQueryAll = ({ params }) => {
    const { priceDate, specifications = '', market = '' } = params;

    let businessDateStart = '';
    let businessDateEnd = '';

    const dateList =
      priceDate && Array.isArray(priceDate) && priceDate.length > 0
        ? priceDate
        : priceDate?.split(',') || [];

    if (dateList && Array.isArray(dateList) && dateList.length > 0) {
      businessDateStart = dateList?.[0] || '';
      businessDateEnd = dateList?.[1] || '';
    }

    priceDS.setQueryParameter('commodityCode', selectedProduct?.commodityCode || '');
    priceDS.setQueryParameter(
      'businessDateStart',
      moment(businessDateStart).format('YYYY-MM-DD 00:00:00')
    );
    priceDS.setQueryParameter(
      'businessDateEnd',
      moment(businessDateEnd).format('YYYY-MM-DD 23:59:59')
    );
    priceDS.setQueryParameter('specifications', specifications || '');
    priceDS.setQueryParameter('market', market || '');

    commonParams = {
      commodityCode: selectedProduct?.commodityCode || '',
      businessDateStart: moment(businessDateStart).format('YYYY-MM-DD 00:00:00'),
      businessDateEnd: moment(businessDateEnd).format('YYYY-MM-DD 23:59:59'),
      ...params,
    };

    if (!params?.commodityCode && !selectedProduct?.commodityCode) return;

    priceDS.query();
    getChartData(commonParams);
  };

  /**
   * 图表导出为图片
   */
  const handleExportChart = () => {
    if (!chartInstance?.current) {
      console.warn('图表未初始化');
      return;
    }
    // 获取图表的base64图片数据 (直接调用getDataURL)
    // 设置背景色为白色，导出更清晰，同时保留图表样式
    const url = chartInstance.current.getDataURL({
      type: 'png',
      pixelRatio: 2, // 高清导出，分辨率翻倍
      backgroundColor: '#fff',
    });

    const link = document.createElement('a');
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

    link.download = `${intl
      .get('sdat.productPrice.view.tab.trendAnalysis')
      .d('趋势分析')}_${timestamp}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notification.success({
      message: intl.get('sdat.productPrice.message.exportSuccess').d('导出成功！'),
    });
  };

  const handleInputSearchValue = (e) => {
    searchContent = e?.target?.value?.trim() || '';
  };

  const handleClear = () => {
    searchContent = '';
    handleQueryTreeData('');
  };

  return (
    <React.Fragment>
      <Header title={intl.get('sdat.productPrice.view.title').d('商品价格')}>
        {isInitialized && activeTab === 'table' && selectedProduct ? (
          <ExcelExportPro
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              style: { border: 'none' },
            }}
            defaultSelectAll
            requestUrl={`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/mdc-market-data/export`}
            queryParams={queryParams}
            buttonText={intl.get('hzero.common.button.confirm.export').d('导出')}
          />
        ) : null}
        {isInitialized && activeTab === 'chart' && selectedProduct ? (
          <Button
            icon="unarchive"
            funcType="flat"
            style={{ border: 'none' }}
            onClick={() => handleExportChart()}
          >
            {intl.get('hzero.common.button.confirm.export').d('导出')}
          </Button>
        ) : null}
      </Header>
      {!isInitialized ? (
        renderInitPage()
      ) : (
        <div style={{ margin: '8px', height: 'calc(100vh - 148px)' }}>
          <div style={{ display: 'flex', height: '100%' }}>
            <div
              style={{
                width: collapsed ? 0 : 260,
                transition: 'all 0.3s',
                position: 'relative',
                background: '#fff',
              }}
            >
              <div
                style={{
                  width: 260,
                  height: '100%',
                  overflow: 'hidden',
                  display: collapsed ? 'none' : 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid #e8e8e8',
                  }}
                >
                  {intl.get('sdat.productPrice.view.productCatalog').d('商品目录')}
                </div>
                <div>
                  <TextField
                    placeholder={intl
                      .get('sdat.productPrice.view.message.priceSearch')
                      .d('请输入商品名称查询')}
                    onInput={handleInputSearchValue}
                    clearButton
                    onClear={handleClear}
                    onKeyDown={(e) => {
                      if (e.keyCode === 13) return handleQueryTreeData('');
                    }}
                    style={{ marginTop: '8px', padding: '8px 20px', width: '100%' }}
                  />
                </div>
                {treeData && treeData.length ? (
                  <Menu
                    mode="inline"
                    onClick={handleMenuClick}
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                    }}
                    defaultOpenKeys={[]} // 默认展开部分节点
                  >
                    {renderMenu(treeData)}
                  </Menu>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '500px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: '#9d9d9d',
                    }}
                  >
                    <span>
                      {intl.get('sdat.productPrice.view.notification.noData').d('暂无查询结果')}
                    </span>
                  </div>
                )}
              </div>
              <div
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  position: 'absolute',
                  top: 50,
                  right: -15,
                  width: 15,
                  height: 30,
                  lineHeight: '30px',
                  background: '#fff',
                  border: '1px solid #e8e8e8',
                  borderLeft: 'none',
                  borderTopRightRadius: 4,
                  borderBottomRightRadius: 4,
                  cursor: 'pointer',
                  textAlign: 'center',
                  zIndex: 10,
                  boxShadow: '1px 0 3px rgba(0,0,0,0.1)',
                }}
              >
                <Icon
                  type={collapsed ? 'navigate_next' : 'navigate_before'}
                  style={{ fontSize: 12, color: '#999' }}
                />
              </div>
            </div>
            <div
              style={{
                marginLeft: collapsed ? 0 : '8px',
                padding: '12px',
                flex: 1,
                height: '100%',
                overflow: 'hidden',
                background: '#fff',
                border: '1px solid #e8e8e8',
              }}
            >
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane
                  tab={intl.get('sdat.productPrice.view.tab.productData').d('商品数据')}
                  key="table"
                >
                  <FilterComp
                    key="table-filter"
                    priceDS={priceDS}
                    onFilterQuery={handleFilterQueryAll}
                    cacheKey="SDAT.MARKET_COLLECTION_PRODUCT_PRICE_LIST"
                  />
                  <div style={{ height: 'calc(100vh - 280px)' }}>
                    <Table
                      dataSet={priceDS}
                      autoHeight={{ type: 'maxHeight', diff: 20 }}
                      customizable
                      customizedCode="SDAT.MARKET_COLLECTION_PRODUCT_PRICE_LIST"
                      queryBar="none"
                    >
                      <Table.Column name="commodityCode" width={180} />
                      <Table.Column name="specifications" />
                      <Table.Column name="market" />
                      <Table.Column name="priceUnit" />
                      <Table.Column name="price" />
                      <Table.Column name="maxPrice" />
                      <Table.Column name="minPrice" />
                      <Table.Column name="businessDate" width={160} />
                      <Table.Column
                        name="operation"
                        header={intl.get('hzero.common.title.operator').d('操作')}
                        renderer={({ record }) => renderAction(record)}
                      />
                    </Table>
                  </div>
                </TabPane>
                <TabPane
                  tab={intl.get('sdat.productPrice.view.tab.trendAnalysis').d('趋势分析')}
                  key="chart"
                >
                  <FilterComp
                    key="chart-filter"
                    priceDS={priceDS}
                    onFilterQuery={handleFilterQueryAll}
                    cacheKey="SDAT.MARKET_COLLECTION_PRODUCT_PRICE_LIST"
                  />
                  <div
                    ref={chartRef}
                    style={{ width: '100%', height: '500px', marginTop: '32px' }}
                  />
                </TabPane>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

export default formatterCollections({
  code: ['sdat.productPrice', 'sdat.productManagement'],
})(ProductPrice);
