/**
 * 关系挖掘历史记录
 */
import React, { useState, useEffect } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header } from 'components/Page';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getCurrentUser } from 'utils/utils';
import * as echarts from 'echarts';
import notification from 'utils/notification';
import { DataSet, Row, Col, Button, Table, Modal, Icon, Spin } from 'choerodon-ui/pro';

import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';
import ToggleBtn from '@/components/ToggleBtn';
import {
  fetchExportPath,
  fetchExportContract,
  fetchMiningHisData, // 历史数据挖掘
  fetchReMining,
} from '@/services/riskControl/relationMiningService';
import { getUrlParam, getResponse } from '@/utils/utils';

import { RelationMiningDS } from './stores/relationMiningDS';
import RiskMapModal from './RiskMapModal';
import MiningHistory from './MiningHistory';
import styles from './index.less';

const refreshSrc = require('@/assets/refresh_svg.svg');
const downloadSrc = require('@/assets/download.svg');

let hasHisMap = false;
let hisMiningDom = null;
let myMiningChart = null;
let uniqueHisMiningData = []; // 历史记录挖掘数据
let relationsHisMiningMap = [];
let relationsMap = []; // 揭示数据
let secretValue = '';

const RelationMiningHistory = (props) => {
  const { hisRoadListDS } = props;

  const { businessType = '', businessIdentity = '' } = getUrlParam() || {};

  const [activeKey, setActiveKey] = useState('road');
  const [selected, setSelected] = useState(null);
  const [syncFlag, setSyncFlag] = useState('');
  const [loading, setLoading] = useState(false);

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    return () => {
      hasHisMap = false;
      secretValue = '';
      relationsMap = [];
    };
  }, []);

  useEffect(() => {
    if (activeKey === 'map') {
      refreshHisChart();
    }
  }, [activeKey]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  /**
   * 查询挖掘
   */
  const handleReMining = async () => {
    if (selected && selected.dataId) {
      const res = await fetchReMining({
        ...selected,
        businessType,
        businessIdentity,
        secret: secretValue,
        userId: getCurrentUser().id,
      });

      if (getResponse(res)) {
        setSyncFlag(new Date().getTime());
      }
    }
  };

  const refreshHisChart = () => {
    hisMiningDom = document.getElementById('supplier-relation-his-mining-menu');

    if (hisMiningDom) {
      myMiningChart = echarts.init(hisMiningDom);
      const option = chartOption();
      myMiningChart.setOption(option);
    }
  };

  const chartOption = () => {
    let dataArr = [];
    let mapData = [];

    dataArr = uniqueHisMiningData;
    mapData = relationsHisMiningMap;

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

  /**
   * 挖掘历史记录
   * @param {object} item
   */
  const selectHistoryItem = (item) => {
    setSelected({ ...item });
    if (item && item.dataId) {
      setLoading(true);
      fetchMiningHisData({
        dataId: item.dataId,
        businessType,
        businessIdentity,
      }).then((result) => {
        setLoading(false);
        if (getResponse(result)) {
          secretValue = result?.secret ?? '';
          const relationData = result && result.relationData ? JSON.parse(result.relationData) : {};
          formatResData(relationData);
          const dataArr = relationData && relationData.Data ? relationData.Data : [];
          hasHisMap = !!dataArr.length;
        } else {
          hasHisMap = false;
          secretValue = '';
        }
        refreshHisChart();
        setRefresh(true);
      });
    }
  };

  /**
   * 接口返回数据解析
   * @param {*} result
   */
  const formatResData = (result) => {
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

    // 历史记录数据
    hisRoadListDS.data = dataArr;
    uniqueHisMiningData = uniqueList(seriesData);
    relationsHisMiningMap = [...relationsMap];
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
  const handleExportPath = async () => {
    const pathExportList = [];

    const data = hisRoadListDS.toData();

    if ([('MOBILE', 'ADDRESS', 'EMAIL')].includes(selected?.dataType)) {
      data.forEach((item) => {
        pathExportList.push({
          ...item,
          companyName: item.CompanyName,
          relationList: item.RelationList,
          relatedCompanyName: item.RelatedCompanyName,
          relatedName: item.RelatedName,
          relatedType: item.RelatedType,
        });
      });
    } else {
      data.forEach((item) => {
        pathExportList.push(item.Path);
      });
    }

    if (pathExportList.length) {
      if ([('MOBILE', 'ADDRESS', 'EMAIL')].includes(selected?.dataType)) {
        await fetchExportContract({
          contactList: pathExportList,
        });
      } else {
        await fetchExportPath({ paths: pathExportList });
      }
    } else {
      notification.warning({
        message: intl.get('sdat.common.view.message.noDataToExport').d('暂无可导出数据'),
      });
    }
  };

  /**
   * 查看关系图谱
   * @param {*} record
   */
  const handleView = (record) => {
    let modal = null;
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
    return selected?.dataType === 'REVELATION'
      ? [
          {
            name: 'serialNumber',
            header: intl.get('sdat.supplier.view.title.serialNumber').d('序号'),
            renderer: ({ record }) => {
              const { currentPage, pageSize } = hisRoadListDS;
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
          { name: 'Level', width: 80 },
          { name: 'RelatedCompanyName', width: 150 },
          { name: 'RelatedName', width: 200 },
          {
            name: 'affiliatedRoad',
            width: 600,
            renderer: ({ record }) => {
              return (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    overflowX: 'scroll',
                    maxWidth: '580px',
                  }}
                >
                  {getRoadPath(record)}
                </div>
              );
            },
          },
        ]
      : [('MOBILE', 'ADDRESS', 'EMAIL')].includes(selected?.dataType)
      ? [
          // 联系方式
          {
            name: 'serialNumber',
            header: intl.get('sdat.supplier.view.title.serialNumber').d('序号'),
            width: 80,
            renderer: ({ record }) => {
              const { currentPage, pageSize } = hisRoadListDS;
              return record.index + 1 + (currentPage - 1) * pageSize;
            },
          },
          {
            name: 'RelatedName',
          },
          {
            name: 'RelatedType',
          },
          { name: 'CompanyName' },
          { name: 'RelatedCompanyName' },
        ]
      : [
          {
            name: 'serialNumber',
            header: intl.get('sdat.supplier.view.title.serialNumber').d('序号'),
            width: 80,
            renderer: ({ record }) => {
              const { currentPage, pageSize } = hisRoadListDS;
              return record.index + 1 + (currentPage - 1) * pageSize;
            },
          },
          {
            name: 'relationshipDetails',
            renderer: ({ record }) => {
              return (
                <a onClick={() => handleView(record)}>
                  {intl.get('hzero.common.view.title.view').d('查看')}
                </a>
              );
            },
          },
          { name: 'CompanyName' },
          { name: 'RelatedCompanyName' },
        ];
  };

  const list = () => {
    return [
      {
        id: 'road',
        title: intl.get('sdat.supplier.view.btn.road').d('路径'),
      },
      ![('MOBILE', 'ADDRESS', 'EMAIL')].includes(selected?.dataType) && {
        id: 'map',
        title: intl.get('sdat.supplier.view.btn.map').d('图谱'),
      },
    ].filter(Boolean);
  };

  const handleModeChange = (key) => {
    setActiveKey(key);
  };

  return (
    <div className={styles['relation-mining-his-basic']}>
      <Header
        title={intl
          .get('sdat.supplier.view.title.supplierRelationMiningHis')
          .d('供应商关系挖掘历史')}
      />
      <div className={styles['relationship-mining-container']}>
        <Row style={{ height: 'calc(100vh - 66px)', overflow: 'hidden' }}>
          <Col
            span={5}
            style={{
              height: '100%',
              // padding: '20px 0',
              borderRight: '1px solid rgba(242,242,242,1)',
            }}
          >
            <MiningHistory
              syncFlag={syncFlag}
              businessType={businessType}
              businessIdentity={businessIdentity}
              onSelect={selectHistoryItem}
            />
          </Col>
          <Col
            span={19}
            style={{
              backgroundColor: activeKey === 'road' ? '#fff' : '#f7f8fa',
              paddingLeft: activeKey === 'road' ? '16px' : '0',
            }}
          >
            <>
              {hasHisMap ? ( // 有数据
                <div>
                  <div style={{ backgroundColor: '#fff', padding: '16px 8px 8px 0' }}>
                    <div style={{ display: 'inline-block' }}>
                      {activeKey === 'road' && (
                        <>
                          <Button
                            icon="unarchive"
                            color="primary"
                            funcType="flat"
                            onClick={handleExportPath}
                          >
                            {intl.get('sdat.common.view.button.export').d('导出')}
                          </Button>
                          <Button
                            icon="sync"
                            color="primary"
                            funcType="flat"
                            style={{ marginLeft: '8px' }}
                            onClick={handleReMining}
                          >
                            {intl.get('sdat.common.view.button.reMining').d('重新挖掘')}
                          </Button>
                        </>
                      )}
                    </div>
                    <ToggleBtn
                      style={{ float: 'right' }}
                      toggleList={list()}
                      // defaultValue={defaultSelect}
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
                      <Spin spinning={loading}>
                        <Table
                          dataSet={hisRoadListDS}
                          queryBar="none"
                          border={false}
                          columns={columns()}
                        />
                      </Spin>
                    </div>
                  ) : (
                    <div style={{ padding: '16px', backgroundColor: '#fff' }}>
                      <div
                        id="supplier-relation-his-mining-menu"
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
                    <div style={{ textAlign: 'center', height: '40px' }}>
                      <NoContent style={{ width: '40px', height: '40px' }} />
                    </div>
                    <div className={styles['chart-no-content-message']}>
                      {intl.get('hzero.common.message.data.none').d('暂无数据')}
                    </div>
                  </div>
                </div>
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
      return { hisRoadListDS };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(RelationMiningHistory)
);
