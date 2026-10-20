/* eslint-disable react/no-array-index-key */
/**
 * 关系挖掘页面
 */
import React, { useState, useEffect } from 'react';
import { Header } from 'components/Page';
import withProps from 'utils/withProps';
import uuid from 'uuid/v4';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import * as echarts from 'echarts';
import formatterCollections from 'utils/intl/formatterCollections';
import { Row, Col, DataSet, Table, Button, Icon, Modal, Range } from 'choerodon-ui/pro';
import notification from 'utils/notification';

import ToggleBtn from '@/components/ToggleBtn';
import { getUrlParam } from '@/utils/utils';
import {
  fetchRelationMining,
  fetchExportPath,
  getCompanyList,
} from '@/services/riskControl/relationStaticMiningService';

import { RelationMiningDS } from './stores/relationMiningDS';
import RiskMapModal from './RiskMapModal';

import styles from './index.less';

const defaultUrl = require('@/assets/illustrate01.svg');
const refreshSrc = require('@/assets/refresh_svg.svg');
const downloadSrc = require('@/assets/download.svg');
const noneSrc = require('@/assets/no_search_result.svg');

const { searchKey = '' } = getUrlParam() || {};

let chartMiningDom = null;
let hisMiningDom = null;
let myMiningChart = null;

let relationsMap = []; // 揭示数据

let uniqueMiningData = []; // 挖掘数据
let uniqueHisMiningData = []; // 历史记录挖掘数据

let relationsMiningMap = []; // 挖掘数据
let relationsHisMiningMap = [];

let modal = null;

let statusMap = {
  noData: true, // 查询无数据
  noQuery: true, // 未查询
};

const param = {
  tenantId: getCurrentOrganizationId(),
  searchKey,
};

const RelationshipMining = (props) => {
  const { hisRoadListDS, qxbListDS } = props;

  const [activeKey, setActiveKey] = useState('road');
  const [refresh, setRefresh] = useState(false);
  const [companyList, setCompanyList] = useState([]); // 所有公司列表
  const [levelValue, setLevel] = useState(10);
  // const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    document.title = intl.get('sdat.supplier.view.title.relationShooting').d('关系排查');
    if (searchKey) {
      getCompanyList(param).then((res) => {
        if (getResponse(res)) {
          const comArr = [];
          if (res && res.companyList && res.companyList.length) {
            res.companyList.forEach((companyName) => {
              comArr.push({
                companyName,
                companyId: uuid(),
              });
            });
          }
          setCompanyList(comArr);
        }
      });
    }

    return () => {
      chartMiningDom = null;
      hisMiningDom = null;
      myMiningChart = null;
      relationsMap = [];
      uniqueMiningData = [];
      uniqueHisMiningData = [];
      relationsMiningMap = [];
      relationsHisMiningMap = [];
      statusMap = {};
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

  const resetChart = () => {
    const option = chartOption('default');
    if (myMiningChart) {
      myMiningChart.setOption(option);
    }
  };

  const chartOption = (type) => {
    let dataArr = [];
    let mapData = [];

    if (type === 'default') {
      dataArr = uniqueMiningData;
      mapData = relationsMiningMap;
    } else if (type === 'hisChart') {
      dataArr = uniqueHisMiningData;
      mapData = relationsHisMiningMap;
    }

    return {
      title: {
        text: intl.get('sdat.supplier.view.title.relationMap').d('关系图谱'),
      },
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
          type: 'graph',
          layout: 'circular',
          symbolSize: 100,
          roam: true,
          itemStyle: {
            color: ({ data }) => {
              const name = data?.name ?? '';
              const colorStr =
                name.includes('有限') || name.includes('公司') || name.includes('合伙')
                  ? '#66a3e8'
                  : '#e85364';
              return colorStr;
            },
          },
          label: {
            show: true,
            formatter: (params) => {
              const label = params?.name ?? '';
              let result = '';

              for (let i = 0; i < label.length; i++) {
                if (i % 5 === 0 && i !== 0) {
                  result += `-${label[i]}`;
                } else {
                  result += label[i];
                }
              }

              const text = result?.split('-')?.join('\n') ?? '';
              return text;
            },
          },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 8],
          edgeLabel: {
            fontSize: 20,
          },
          data: dataArr,
          links: mapData,
          lineStyle: {
            opacity: 0.9,
            width: 1,
            curveness: 0,
          },
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

  const handleModeChange = (key) => {
    setActiveKey(key);
  };

  /**
   * 查看关系图谱
   * @param {*} record
   */
  const handleView = (record) => {
    if (modal) {
      modal.close();
    }

    const handleCloseModal = () => {
      modal.close();
    };

    modal = Modal.open({
      title: intl.get('sdat.monitorBusiness.view.title.relationDetails').d('关系详情'),
      children: <RiskMapModal record={record} />,
      closable: true,
      drawer: true,
      // mask: false,
      style: { width: '800px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  /**
   * 渲染路径
   * @param {*} record
   * @returns
   */
  const getRoadPath = (record) => {
    const obj = record?.toData() ?? {};
    const { cuzRelationPath = [] } = obj;

    return cuzRelationPath.map((item) => {
      return (
        <div
          key={item.nodeId}
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span>{item.name}</span>
          {['L', 'R', 'H'].includes(item.line) ? (
            <div
              style={{
                display: 'flex',
                padding:
                  item.line === 'H'
                    ? '0 20px'
                    : item.line === 'L'
                    ? '0 20px 0 5px'
                    : '0 5px 0 20px',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '18px', marginRight: '-7px' }}>
                {item.line === 'L' ? <Icon type="baseline-arrow_left" /> : null}
              </span>
              <div>
                <div style={{ lineHeight: '18px', padding: '0 5px' }}>{item.labelText}</div>
                <div style={{ height: '14px', borderTop: '1px solid #000' }} />
              </div>
              <span style={{ fontSize: '18px', marginLeft: '-7px' }}>
                {item.line === 'R' ? <Icon type="baseline-arrow_right" /> : null}
              </span>
            </div>
          ) : null}
        </div>
      );
    });
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
        name: 'relationshipDetails',
        width: 80,
        renderer: ({ record }) => {
          return (
            <a onClick={() => handleView(record)}>
              {intl.get('hzero.common.view.title.view').d('查看')}
            </a>
          );
        },
      },
      {
        name: 'CompanyName',
        width: 150,
      },
      // { name: 'Level', width: 80 },
      { name: 'RelatedCompanyName', width: 150 },
      { name: 'RelatedName', width: 200 },
      {
        name: 'affiliatedRoad',
        width: 1200,
        renderer: ({ record }) => {
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                overflowX: 'hidden',
                // maxWidth: '580px',
              }}
            >
              {getRoadPath(record)}
            </div>
          );
        },
      },
    ];
  };

  /**
   * 启信宝关系挖掘
   */
  const handleQXBMining = async () => {
    const fetchParam = {
      ...param,
      level: levelValue,
      searchType: 'relation',
    };

    const result = await fetchRelationMining({
      ...fetchParam,
    });

    if (result && result.Data && result.Data.length) {
      const dataArr = result.Data || [];
      formatResData(result, 'default');

      if (dataArr.length) {
        // 有数据
        statusMap.noData = false;
        statusMap.noQuery = false;
        setRefresh(true);
      } else {
        statusMap.noData = true;
        statusMap.noQuery = false;
        setRefresh(true);
      }
    } else {
      notification.error({
        message: result?.message ?? result?.msg ?? '',
      });
      statusMap.noData = true;
      statusMap.noQuery = true;
      resetChart();
      setRefresh(true);
    }
  };

  /**
   * 接口返回数据解析
   * @param {*} result
   * @param {*} type
   */
  const formatResData = (result, type) => {
    const data = result?.Data ?? [];
    const dataArr = Array.isArray(data) ? [...data] : [];
    const seriesData = []; // 去重的企业列表

    if (dataArr.length) {
      dataArr.forEach((item) => {
        const subjectList = item.SubjectList;

        if (subjectList && subjectList.length) {
          subjectList.forEach((item2) => {
            seriesData.push({
              ...item2,
              name: item2.Name,
            });
          });
        }

        if (item.RelationList && item.RelationList.length) {
          item.RelationList.forEach((item2) => {
            let source = '';
            let target = '';

            if (subjectList && subjectList.length) {
              subjectList.forEach((item3) => {
                if (item2.EndNodeId === item3.NodeId) {
                  target = item3.Name;
                }
                if (item2.StartNodeId === item3.NodeId) {
                  source = item3.Name;
                }
              });
            }

            relationsMap.push({
              ...item2,
              source,
              target,
              label: {
                show: true,
                color: '#000',
                verticalAlign: 'middle',
                fontSize: 12,
                formatter: () => {
                  const labelList = (item2?.PropertyList ?? []).map((r) => r.LabelText);
                  return labelList && labelList.length ? labelList.join(',') : '';
                },
              },
            });
          });
        }
      });
    }

    // 去重
    if (type === 'default') {
      qxbListDS.data = dataArr;
      uniqueMiningData = uniqueList(seriesData);
      relationsMiningMap = [...relationsMap];
    } else {
      // 历史记录数据
      hisRoadListDS.data = dataArr;
      uniqueHisMiningData = uniqueList(seriesData);
      relationsHisMiningMap = [...relationsMap];
    }
  };

  /**
   * 对象数组去重
   */
  const uniqueList = (arr) => {
    const result = [];
    const obj = {};
    for (let i = 0; i < arr.length; i++) {
      if (!obj[arr[i].NodeId]) {
        result.push(arr[i]);
        obj[arr[i].NodeId] = true;
      }
    }
    return result;
  };

  /**
   * 导出路径
   */
  const handleExportPath = (hisTag = '') => {
    const pathExportList = [];

    const data = hisTag === 'his' ? hisRoadListDS.toData() : qxbListDS.toData();

    data.forEach((item) => {
      pathExportList.push(item.Path);
    });

    if (pathExportList.length) {
      fetchExportPath({ paths: pathExportList });
    } else {
      notification.warning({
        message: intl.get('sdat.common.view.message.noDataToExport').d('暂无可导出数据'),
      });
    }
  };

  /**
   * 穿透层级改变值
   * @param {*} value
   */
  const handleChange = (value) => {
    setLevel(value);
  };

  return (
    <div className={styles['relationship-mining-basic']}>
      <Header title={intl.get('sdat.supplier.view.title.relationShooting').d('关系排查')} />
      <div className={styles['relationship-mining-container']}>
        <Row style={{ height: 'calc(100vh - 66px)', overflow: 'hidden' }}>
          <Col
            span={5}
            style={{
              height: '100%',
              padding: '20px 0',
              borderRight: '1px solid rgba(242,242,242,1)',
            }}
          >
            <div style={{ padding: '0 20px 20px 20px' }}>
              <div
                className={styles['relationship-mining-company-basic']}
                id="sdat-relations-mining-company-popover"
              >
                <div className={styles['relationship-mining-company-list-panel']}>
                  <div style={{ width: '3px', height: '12px', background: '#00B8CC' }} />
                  <span style={{ marginLeft: '10px' }}>
                    {intl.get('sdat.supplier.view.title.companyList').d('供应商列表')}
                  </span>
                </div>
              </div>

              <div className={styles['relationship-scroll-panel']}>
                {(companyList || []).map((item) => {
                  return (
                    <div
                      key={item.companyId}
                      className={styles['company-list']}
                      style={{
                        fontSize: '14px',
                        color: '#1D2129',
                        lineHeight: '22px',
                        margin: '12px 0',
                      }}
                    >
                      {item.companyName}
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  fontSize: '14px',
                  color: '#1D2129',
                  fontWeight: '500',
                  lineHeight: '22px',
                  marginBottom: '8px',
                  marginTop: '32px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: '3px', height: '12px', background: '#00B8CC' }} />
                <span style={{ marginLeft: '10px' }}>
                  {intl.get('sdat.supplier.view.title.penetrationLevel').d('穿透层级')}
                </span>
              </div>
              <Range
                range={false}
                value={levelValue}
                min={1}
                max={10}
                step={1}
                onChange={handleChange}
              />

              <div
                style={{
                  fontSize: '14px',
                  color: '#1D2129',
                  fontWeight: '500',
                  lineHeight: '22px',
                  marginBottom: '8px',
                  marginTop: '32px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: '3px', height: '12px', background: '#00B8CC' }} />
                <span style={{ marginLeft: '10px' }}>
                  {intl.get('sdat.supplier.view.title.relationType').d('关系类型')}
                </span>
              </div>
              <div>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ color: '#868D9C', lineHeight: '18px' }}>
                    {intl.get('sdat.supplier.view.title.relationship').d('任职关系（穿透10层）')}
                  </div>
                  <div style={{ color: '#1D2129', lineHeight: '18px', marginTop: '4px' }}>
                    {intl
                      .get('sdat.supplier.view.title.legalRepresentative')
                      .d('法定代表人、董监高、历史董监高')}
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ color: '#868D9C', lineHeight: '18px' }}>
                    {intl
                      .get('sdat.supplier.view.title.investmentRelations')
                      .d('投资关系（穿透10层）')}
                  </div>
                  <div style={{ color: '#1D2129', lineHeight: '18px', marginTop: '4px' }}>
                    {intl.get('sdat.supplier.view.title.hisShareholders').d('股东、历史股东')}
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ color: '#868D9C', lineHeight: '18px' }}>
                    {intl.get('sdat.supplier.view.title.contract').d('联系方式')}
                  </div>
                  <div style={{ color: '#1D2129', lineHeight: '18px', marginTop: '4px' }}>
                    {intl
                      .get('sdat.supplier.view.title.samePhone')
                      .d('相同电话、相同邮箱、相同地址')}
                  </div>
                </div>
              </div>

              <div className={styles['relation-mining-btn-span']}>
                <Button color="primary" style={{ width: '100%' }} onClick={handleQXBMining}>
                  {intl.get('sdat.supplier.view.title.relationMiningView').d('查看')}
                </Button>
              </div>
            </div>
          </Col>
          <Col
            span={19}
            style={{
              backgroundColor: activeKey === 'road' ? '#fff' : '#f7f8fa',
              paddingLeft: activeKey === 'road' ? '16px' : '0',
            }}
          >
            <>
              {!statusMap.noData ? ( // 有数据（已经执行查询）
                <div>
                  <div
                    style={{
                      backgroundColor: '#fff',
                      padding: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'inline-block' }}>
                      {activeKey === 'road' && (
                        <Button
                          icon="unarchive"
                          color="primary"
                          funcType="link"
                          onClick={handleExportPath}
                        >
                          {intl.get('sdat.common.view.button.export').d('导出')}
                        </Button>
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
                        overflowY: 'scroll',
                      }}
                    >
                      <Table
                        dataSet={qxbListDS}
                        queryBar="none"
                        border={false}
                        columns={columns()}
                      />
                    </div>
                  ) : (
                    <div>
                      <div
                        id="supplier-relation-ship-mining"
                        style={{ height: 'calc(100vh - 160px)' }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {statusMap.noQuery ? (
                    <div
                      style={{
                        height: 'calc(100vh - 100px)',
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <img alt="noContent" src={defaultUrl} />
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
                      <img alt="noneSrc" style={{ width: '160px' }} src={noneSrc} />
                      <div
                        style={{
                          fontSize: '16px',
                          color: '#1D2129',
                          fontWeight: '500',
                          lineHeight: '24px',
                          marginTop: '10px',
                        }}
                      >
                        {intl.get('sdat.supplier.view.title.queryNoData').d('未查询到关联关系')}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default formatterCollections({
  code: ['sdat.supplier', 'sdat.common', 'sdat.monitorBusiness'],
})(
  withProps(
    () => {
      const hisRoadListDS = new DataSet(RelationMiningDS()); // 挖掘历史路径列表
      const qxbListDS = new DataSet(RelationMiningDS()); // 启信宝关系挖掘列表吧
      return { hisRoadListDS, qxbListDS };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(RelationshipMining)
);
