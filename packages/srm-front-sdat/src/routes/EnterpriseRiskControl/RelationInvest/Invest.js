/* eslint-disable no-param-reassign */
/* eslint-disable react/no-array-index-key */
/**
 * 关系挖掘页面
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import * as echarts from 'echarts';
import { DataSet, Table, Button, Select, TextField, Modal } from 'choerodon-ui/pro';
import { Tabs, Alert } from 'choerodon-ui';
// import notification from 'utils/notification';
import { queryIdpValue } from 'services/api';

// import AutoComplete from '@/components/SimpleComplete';
import ToggleBtn from '@/components/ToggleBtn';
import { getResponse } from '@/utils/utils';
import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';
import { ReactComponent as Illustrate } from '@/assets/illustrate01.svg';
import {
  fetchMiningCount,
  fetchExportPath,
  fetchMining,
  fetchChartData,
  fetchOrderDetail,
  fetchRetry,
} from '@/services/riskControl/relationInvestService';

import { RelationMiningDS, RelationMiningHisDS } from './stores/relationMiningDS';
import MiningHistory from './MiningHistory';

import styles from './index.less';

const refreshSrc = require('@/assets/refresh_svg.svg');
const downloadSrc = require('@/assets/download.svg');
// const noneSrc = require('@/assets/no_search_result.svg');

const { TabPane } = Tabs;
const { Option } = Select;

let chartMiningDom = null;
let hisMiningDom = null;
let myMiningChart = null;

let uniqueMiningData = []; // 排查数据
let uniqueHisMiningData = []; // 历史记录排查数据

// let modal = null;
let hasHisMap = false;
let hasQuery = false;

let batchNum = '';
let localInfoId = '';

const typeMap = {
  1: 'BLACKLIST',
  2: 'PARTNER',
};

const RelationshipMining = props => {
  const { tenantId = getCurrentOrganizationId() } = props;

  const hisRoadListDS = useMemo(() => new DataSet(RelationMiningHisDS(tenantId)), [tenantId]); // 挖掘历史路径列表
  const qxbListDS = useMemo(() => new DataSet(RelationMiningDS(tenantId)), [tenantId]); // 启信宝关系挖掘列表吧

  const [activeKey, setActiveKey] = useState('road');
  const [refresh, setRefresh] = useState(false);
  const [searchContent, setSearchContent] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [syncFlag, setSyncFlag] = useState('');
  const [selectedComp, setSelectComp] = useState('');
  const [countMap, setCountMap] = useState({});
  const [hisCountMap, setHisCountMap] = useState({});
  const [typeList, setTypeList] = useState([]);
  const [selectType, setSelectType] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [alertMsg, setAlertMsg] = useState(
    intl
      .get('sdat.supplier.view.title.inputToSearch')
      .d('请在左侧输入目标企业及待排查企业类型后点击“关系排查”后查看关系')
  );

  useEffect(() => {
    queryIdpValue('SDAT.RELATION_TROUBLESHOOTING_TYPE').then(res => {
      if (getResponse(res) && Array.isArray(res) && res.length) {
        const list = res.filter(item => [1, '1'].includes(item.value));
        setTypeList(list || []);
      }
    });
    return () => {
      chartMiningDom = null;
      hisMiningDom = null;
      myMiningChart = null;
      uniqueMiningData = [];
      uniqueHisMiningData = [];
      hasHisMap = false;
      hasQuery = false;
      batchNum = '';
      localInfoId = '';
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (activeKey === 'map') {
      refreshChart();
      refreshHisChart();
    }
  }, [activeKey]);

  const refreshChart = () => {
    chartMiningDom = document.getElementById('supplier-relation-ship-mining');
    if (chartMiningDom) {
      myMiningChart = echarts.init(chartMiningDom);
      const option = chartOption('default');
      myMiningChart.setOption(option);
    }
  };

  const refreshHisChart = () => {
    hisMiningDom = document.getElementById('supplier-relation-his-mining');
    if (hisMiningDom) {
      myMiningChart = echarts.init(hisMiningDom);
      const option = chartOption('hisChart');
      myMiningChart.setOption(option);
    }
  };

  const chartOption = type => {
    let dataArr = [];

    if (type === 'default') {
      dataArr = uniqueMiningData;
    } else if (type === 'hisChart') {
      dataArr = uniqueHisMiningData;
    }

    const lineLabel = {
      fontSize: 12,
      color: '#000',
      offset: [0, 0],
    };

    if (dataArr && dataArr.children && dataArr.children.length) {
      dataArr.children.forEach(item => {
        item.collapsed = false; // 默认折叠
        item.children = [{ name: item.name, collapsed: false }];
        item.name = item.value;
        item.symbolSize = 1;
        item.label = lineLabel;
      });
    }

    dataArr.symbol = 'circle';

    return {
      // title: {
      //   text: intl.get('sdat.supplier.view.title.relationMap').d('关系图谱'),
      // },
      tooltip: {
        show: false,
      },
      toolbox: {
        show: true,
        feature: {
          restore: {
            show: true,
            icon: `image://${refreshSrc}`,
          },
          saveAsImage: {
            show: true,
            icon: `image://${downloadSrc}`,
          },
        },
      },
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'tree',
          data: [dataArr],
          // orient: 'vertical',
          left: '2%',
          right: '2%',
          top: '8%',
          bottom: '20%',
          zoom: 0.8,
          symbolSize: 20,
          roam: true,
          itemStyle: {
            color: '#29BECD',
            borderColor: '#29BECD',
          },
          // label: {
          //   position: 'top',
          //   verticalAlign: 'middle',
          //   align: 'center',
          //   fontSize: 14,
          // },
          leaves: {
            label: {
              position: 'right',
              verticalAlign: 'middle',
              align: 'center',
            },
          },
          edgeLabel: {
            show: true,
            formatter: a => {
              return a?.value;
            },
          },
          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750,
        },
      ],
    };
  };

  const list = () => {
    return [
      {
        id: 'road',
        title: intl.get('sdat.supplier.view.btn.road').d('路径'),
      },
      {
        id: 'map',
        title: intl.get('sdat.supplier.view.btn.map').d('图谱'),
      },
    ].filter(Boolean);
  };

  const handleModeChange = key => {
    setActiveKey(key);
  };

  const columns = () => {
    return [
      {
        name: 'serialNumber',
        header: intl.get('sdat.supplier.view.title.serialNumber').d('序号'),
        width: 60,
        renderer: ({ record }) => {
          const { currentPage, pageSize } = qxbListDS;
          return record.index + 1 + (currentPage - 1) * pageSize;
        },
      },
      {
        name: 'companyName',
      },
      { name: 'relatedCompanyName' },
      { name: 'relatedType', width: 300 },
    ];
  };

  /**
   * 关系排查
   */
  const handleQXBMining = async () => {
    // const type = queryDS && queryDS.current ? queryDS.current.get('type') : '';

    const res = await fetchOrderDetail({
      type: typeMap[selectType],
      companyName: searchContent,
      tenantId,
      supplierTenantId: tenantId,
    });
    if (getResponse(res)) {
      if (res?.remind) {
        if (res?.surplusQuantity === 0) {
          Modal.info({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: (
              <>
                {intl
                  .get('sdat.supplierBlacklistManage.view.message.noQuota')
                  .d('尊敬的客户，您当前使用的服务未开通或余额不足，请联系客户经理进行处理')}
              </>
            ),
          });
        } else {
          Modal.confirm({
            title: intl.get('sdat.supplier.view.title.confirmQuto').d('确认额度'),
            children: (
              <div>
                {intl.get('sdat.supplier.view.message.confirmQuotaOne').d('本次消费额度')}
                <span style={{ color: '#00B8CC' }}>{res?.willUseQuantity}</span>
                {intl.get('sdat.supplier.view.message.orderQuota').d('订单目前剩余额度')}
                <span style={{ color: '#00B8CC' }}>{res?.surplusQuantity}</span>
                {intl
                  .get('sdat.supplier.view.message.orderConfirmQuota')
                  .d('，请确认是否扣除额度进行关系排查。')}
              </div>
            ),
          }).then(button => {
            if (button === 'ok') {
              handleContinueMining();
            }
          });
        }
      } else {
        handleContinueMining();
      }
    }
  };

  const handleContinueMining = async () => {
    // const type = queryDS && queryDS.current ? queryDS.current.get('type') : '';

    if (!searchContent || !selectType) return;

    const res = await fetchMining({
      companyName: searchContent,
      type: typeMap[selectType],
      tenantId,
      supplierTenantId: tenantId,
    });

    if (getResponse(res)) {
      hasQuery = true;
      batchNum = res?.batchNo;
      localInfoId = res?.infoId;
      setTimeout(() => {
        handleRefreshCount({ batchNo: batchNum, infoId: localInfoId }, '');
        qxbListDS.setQueryParameter('batchNo', batchNum);
        qxbListDS.setQueryParameter('infoId', localInfoId);
        qxbListDS.query();

        reFetchChart(searchContent, batchNum, localInfoId);
      }, 1000);
    }
  };

  const reFetchChart = async (companyName, batchNo, infoId) => {
    const mapRes = await fetchChartData({
      companyName,
      batchNo,
      tenantId,
      infoId,
    });

    if (getResponse(mapRes)) {
      uniqueMiningData = mapRes;
      refreshChart();
      setRefresh(true);
    }
  };

  /**
   * 导出路径
   */
  const handleExportPath = async (hisTag = '') => {
    let param = {};

    if (hisTag) {
      // 历史记录导出
      const infoId = selectedComp?.infoId;
      const batchNo = selectedComp?.batchNo;
      if (!infoId && !batchNo && infoId !== 0) return;

      param = { infoId, batchNo };
    } else {
      if (!batchNum && batchNum !== 0) return;
      param = { batchNo: batchNum, infoId: localInfoId };
    }

    const res = await fetchExportPath({ ...param, tenantId });
    return getResponse(res);
  };

  /**
   * 输入内容
   * @param {*} e
   */
  const handleInput = e => {
    const val = e || '';
    setSearchContent(val);
  };

  const handleChangeTab = key => {
    setActiveTab(key);
    if (key === '2') {
      setSyncFlag(new Date().getTime());
    }
    setRefresh(true);
  };

  /**
   * 挖掘历史记录
   * @param {object} item
   */
  const selectHistoryItem = async item => {
    setSelectComp(item);
    if (item && item.infoId) {
      hisRoadListDS.setQueryParameter('infoId', item.infoId);
      hisRoadListDS.query().then(() => {
        hasHisMap = true;
        setRefresh(true);
      });

      const mapRes = await fetchChartData({
        infoId: item.infoId,
        companyName: item?.companyName,
        tenantId,
      });

      handleRefreshCount({ batchNo: item?.batchNo, infoId: item.infoId }, 'his');

      if (getResponse(mapRes)) {
        uniqueHisMiningData = mapRes;
        refreshHisChart();
        setRefresh(true);
      }
    }
  };

  // 刷新操作
  const handleRefresh = type => {
    if (type === 'his') {
      hisRoadListDS.query().then(() => {
        if (selectedComp && selectedComp.companyName && selectedComp.infoId) {
          reFetchChart(selectedComp.companyName, selectedComp?.batchNo, selectedComp.infoId);
          handleRefreshCount(
            { batchNo: selectedComp?.batchNo, infoId: selectedComp.infoId },
            'his'
          );
        }
      });
    } else {
      handleRefreshCount({ batchNo: batchNum, infoId: localInfoId }, '');
      // 刷新列表
      qxbListDS.setQueryParameter('batchNo', batchNum);
      qxbListDS.setQueryParameter('infoId', localInfoId);
      qxbListDS.query().then(() => {
        reFetchChart(searchContent, batchNum, localInfoId);
      });
    }
  };

  /**
   * 失败重试操作
   */
  const handleRetry = async () => {
    if (selectedComp && selectedComp.companyName && selectedComp.infoId) {
      const res = await fetchRetry({
        infoId: selectedComp.infoId,
        tenantId,
      });
      if (getResponse(res)) {
        reFetchChart(selectedComp.companyName, selectedComp?.batchNo, selectedComp.infoId);
        handleRefreshCount({ batchNo: selectedComp?.batchNo, infoId: selectedComp.infoId }, 'his');
      }
    }
  };

  const handleRefreshCount = (param, flag) => {
    setRefresh(true);
    fetchMiningCount({ ...param, tenantId, supplierTenantId: tenantId }).then(res => {
      if (getResponse(res)) {
        if (flag === 'his') {
          setHisCountMap(res || {});
        } else {
          setCountMap(res || {});
        }
      }
    });
  };

  const handleSelect = val => {
    // setRefresh(true);
    setSelectType(val);
  };

  // const selectType = queryDS && queryDS.current ? queryDS.current.get('type') : '';

  return (
    <div className={styles['relationship-mining-basic']}>
      <Header title={intl.get('sdat.supplier.view.title.oneToMore').d('一对多关系排查')} />
      <div className={styles['relationship-mining-container']}>
        <div style={{ height: 'calc(100vh - 50px)', overflow: 'hidden', display: 'flex' }}>
          <div
            style={{
              height: '100%',
              width: '320px',
              padding: '12px 0 0 0',
              borderRight: '1px solid rgba(242,242,242,1)',
            }}
          >
            <Tabs activeKey={activeTab} onChange={handleChangeTab}>
              <TabPane
                tab={intl.get('sdat.supplier.view.title.relationInves').d('关系排查')}
                key="1"
              >
                <div style={{ padding: '20px' }}>
                  <div
                    style={{
                      lineHeight: '40px',
                      background: '#fff',
                      marginBottom: '8px',
                    }}
                  >
                    <TextField
                      value={searchContent}
                      onChange={handleInput}
                      placeholder={intl
                        .get('sdat.supplier.view.placeholder.enterCompanyName')
                        .d('请输入企业名称查询')}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div
                    style={{
                      lineHeight: '40px',
                      background: '#fff',
                      marginBottom: '8px',
                    }}
                  >
                    <Select
                      clearButton
                      name="type"
                      value={selectType}
                      style={{ width: '100%' }}
                      onChange={handleSelect}
                      placeholder={intl.get(`sdat.supplier.model.waitingType`).d('待排查企业类型')}
                    >
                      {(typeList || []).map(item => {
                        return (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        );
                      })}
                    </Select>
                  </div>

                  <div className={styles['relation-mining-btn-span']}>
                    <Button
                      color="primary"
                      style={{ width: '100%' }}
                      disabled={!searchContent || !selectType}
                      onClick={handleQXBMining}
                    >
                      {intl.get('sdat.supplier.view.title.relationInves').d('关系排查')}
                    </Button>
                  </div>
                </div>
              </TabPane>
              <TabPane
                tab={intl.get('sdat.supplier.view.title.historyRecord').d('历史记录')}
                key="2"
              >
                <MiningHistory
                  onSelect={selectHistoryItem}
                  syncFlag={syncFlag}
                  tenantId={tenantId}
                />
              </TabPane>
            </Tabs>
          </div>
          <div
            style={{
              flex: 1,
              backgroundColor: activeKey === 'road' ? '#fff' : '#f7f8fa',
            }}
          >
            {activeTab === '1' ? (
              <div>
                {hasQuery ? ( // 有数据（已经执行查询）
                  <div>
                    <div className={styles['supplier-mining-result-alert']}>
                      {hasQuery && Object.keys(countMap).length ? (
                        <Alert
                          message={
                            // eslint-disable-next-line eqeqeq
                            countMap?.spareCount == 0 || !countMap?.spareCount
                              ? intl.get('sdat.supplier.view.message.miningMsg', {
                                  companyName: countMap?.companyName ?? '',
                                  finishCount: countMap?.finishCount ?? 0,
                                  spareCount: countMap?.spareCount ?? 0,
                                  totalCount: countMap?.totalCount ?? 0,
                                  successCount: countMap?.successCount ?? 0,
                                  failCount: countMap?.failCount ?? 0,
                                })
                              : intl.get('sdat.supplier.view.message.miningRefreshMsg', {
                                  companyName: countMap?.companyName ?? '',
                                  finishCount: countMap?.finishCount ?? 0,
                                  spareCount: countMap?.spareCount ?? 0,
                                  totalCount: countMap?.totalCount ?? 0,
                                  successCount: countMap?.successCount ?? 0,
                                  failCount: countMap?.failCount ?? 0,
                                })
                          }
                          type="info"
                          banner
                          showIcon={false}
                          closable
                          style={{ margin: ' 0 0 -8px 0' }}
                        />
                      ) : null}
                    </div>
                    <div
                      style={{
                        backgroundColor: '#fff',
                        padding: '16px 8px 8px 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingLeft: activeKey === 'road' ? '16px' : '0',
                        paddingTop: '16px',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'inline-block' }}>
                        {activeKey === 'road' ? (
                          <>
                            <Button
                              icon="unarchive"
                              color="primary"
                              funcType="flat"
                              onClick={() => handleExportPath('')}
                            >
                              {intl.get('sdat.common.view.button.export').d('导出')}
                            </Button>
                            <Button
                              icon="sync"
                              color="primary"
                              funcType="flat"
                              onClick={() => handleRefresh('')}
                            >
                              {intl.get('sdat.common.view.button.refresh').d('刷新')}
                            </Button>
                          </>
                        ) : (
                          <div style={{ fontSize: '16px', fontWeight: '600', marginLeft: '20px' }}>
                            {intl.get('sdat.supplier.view.title.relationMap').d('关系图谱')}
                          </div>
                        )}
                      </div>
                      <ToggleBtn
                        style={{ float: 'right' }}
                        toggleList={list()}
                        key="tab1"
                        onSelect={handleModeChange}
                      />
                    </div>
                    {activeKey === 'road' ? (
                      <div
                        style={{
                          height: 'calc(100vh - 180px)',
                          overflow: 'hidden',
                          paddingLeft: activeKey === 'road' ? '16px' : '0',
                        }}
                      >
                        <Table
                          dataSet={qxbListDS}
                          queryBar="none"
                          border={false}
                          columns={columns()}
                          autoHeight={{ type: 'maxHeight', diff: 40 }}
                        />
                      </div>
                    ) : (
                      <div style={{ marginTop: '8px' }}>
                        <div
                          id="supplier-relation-ship-mining"
                          style={{ height: 'calc(100vh - 160px)' }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      height: 'calc(100vh - 100px)',
                      display: 'flex',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <div className={styles['supplier-mining-noContent']}>
                      <Illustrate />
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#1D2129',
                        fontWeight: '500',
                        lineHeight: '24px',
                        marginTop: '8px',
                      }}
                    >
                      {alertMsg}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {hasHisMap ? ( // 有数据
                  <div>
                    <div className={styles['supplier-mining-result-alert']}>
                      {hasHisMap && Object.keys(hisCountMap).length ? (
                        <Alert
                          message={
                            // eslint-disable-next-line eqeqeq
                            hisCountMap?.spareCount == 0 || !hisCountMap?.spareCount
                              ? intl.get('sdat.supplier.view.message.miningMsg', {
                                  companyName: hisCountMap?.companyName ?? '',
                                  finishCount: hisCountMap?.finishCount ?? 0,
                                  spareCount: hisCountMap?.spareCount ?? 0,
                                  totalCount: hisCountMap?.totalCount ?? 0,
                                  successCount: hisCountMap?.successCount ?? 0,
                                  failCount: hisCountMap?.failCount ?? 0,
                                })
                              : intl.get('sdat.supplier.view.message.miningRefreshMsg', {
                                  companyName: hisCountMap?.companyName ?? '',
                                  finishCount: hisCountMap?.finishCount ?? 0,
                                  spareCount: hisCountMap?.spareCount ?? 0,
                                  totalCount: hisCountMap?.totalCount ?? 0,
                                  successCount: hisCountMap?.successCount ?? 0,
                                  failCount: hisCountMap?.failCount ?? 0,
                                })
                          }
                          type="info"
                          banner
                          showIcon={false}
                          closable
                          style={{ margin: ' 0 0 -8px 0' }}
                        />
                      ) : null}
                    </div>
                    <div
                      style={{
                        backgroundColor: '#fff',
                        padding: '16px 8px 8px 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: '16px',
                        alignItems: 'center',
                        paddingLeft: activeKey === 'road' ? '16px' : '0',
                      }}
                    >
                      <div style={{ display: 'inline-block' }}>
                        {activeKey === 'road' ? (
                          <>
                            <Button
                              icon="unarchive"
                              color="primary"
                              funcType="flat"
                              onClick={() => handleExportPath('his')}
                            >
                              {intl.get('sdat.common.view.button.export').d('导出')}
                            </Button>
                            <Button
                              icon="sync"
                              color="primary"
                              funcType="flat"
                              onClick={() => handleRefresh('his')}
                            >
                              {intl.get('sdat.common.view.button.refresh').d('刷新')}
                            </Button>
                            {hisCountMap?.spareCount === 0 && hisCountMap?.failCount > 0 ? (
                              <Button
                                icon="sync"
                                color="primary"
                                funcType="flat"
                                onClick={handleRetry}
                              >
                                {intl.get('hzero.common.retry').d('重试')}
                              </Button>
                            ) : null}
                          </>
                        ) : (
                          <div style={{ fontSize: '16px', fontWeight: '600', marginLeft: '20px' }}>
                            {intl.get('sdat.supplier.view.title.relationMap').d('关系图谱')}
                          </div>
                        )}
                      </div>
                      <ToggleBtn
                        style={{ float: 'right' }}
                        toggleList={list()}
                        key="tab2"
                        onSelect={handleModeChange}
                      />
                    </div>
                    {activeKey === 'road' ? (
                      <div
                        style={{
                          height: 'calc(100vh - 180px)',
                          overflow: 'hidden',
                          paddingLeft: activeKey === 'road' ? '16px' : '0',
                        }}
                      >
                        <Table
                          dataSet={hisRoadListDS}
                          queryBar="none"
                          border={false}
                          columns={columns()}
                          autoHeight={{ type: 'maxHeight', diff: 40 }}
                        />
                      </div>
                    ) : (
                      <div style={{ padding: '0 16px 16px 16px', backgroundColor: '#fff' }}>
                        <div
                          id="supplier-relation-his-mining"
                          style={{ height: 'calc(100vh - 138px)', backgroundColor: '#f7f8fa' }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      height: 'calc(100vh - 100px)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div>
                        <NoContent style={{ width: '40px', height: '40px' }} />
                      </div>
                      <div className={styles['chart-no-content-message']}>
                        {intl.get('hzero.common.message.data.none').d('暂无数据')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelationshipMining;
