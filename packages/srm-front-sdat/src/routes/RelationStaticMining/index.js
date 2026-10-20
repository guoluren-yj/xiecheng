/* eslint-disable react/no-array-index-key */
/**
 * 关系挖掘页面
 */
import React, { useState, useEffect } from 'react';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import uuid from 'uuid/v4';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import * as echarts from 'echarts';
import formatterCollections from 'utils/intl/formatterCollections';
import { Row, Col, Radio, DataSet, Table, Button, Icon, Tooltip, Modal } from 'choerodon-ui/pro';
import notification from 'utils/notification';

import ToggleBtn from '@/components/ToggleBtn';
import { getUrlParam } from '@/utils/utils';
import {
  fetchCompanyRevealed,
  fetchRelationMining,
  fetchExportPath,
  fetchExportContract,
  getCompanyList,
} from '@/services/riskControl/relationStaticMiningService';

import equityPath from '@/assets/equity_2.png';
import shareholderPath from '@/assets/shareholder_2.png';
import combinationPath from '@/assets/combination_2.png';
import contactPath from '@/assets/contact_2.png';

import { RelationMiningDS, RelationContactMiningDS } from './stores/relationMiningDS';
import RiskMapModal from './RiskMapModal';

import styles from './index.less';

const defaultUrl = require('@/assets/illustrate01.svg');
const refreshSrc = require('@/assets/refresh_svg.svg');
const downloadSrc = require('@/assets/download.svg');
const noneSrc = require('@/assets/no_search_result.svg');

const imgObj = {
  equity: equityPath,
  shareholder: shareholderPath,
  combination: combinationPath,
  contact: contactPath,
};

const { searchKey = '' } = getUrlParam() || {};

let chartMiningDom = null;
let myMiningChart = null;

let uniqueData = []; // 揭示数据
let relationsMap = []; // 揭示数据

let uniqueMiningData = []; // 挖掘数据
let uniqueMining2Data = []; // '2'
let uniqueMining3Data = []; // '3'

let relationsMiningMap = []; // 挖掘数据
let relationsMining2Map = [];
let relationsMining3Map = [];

let modal = null;

const param = {
  searchKey,
  tenantId: getCurrentOrganizationId(),
};

let statusMap = {
  revealed: {
    noData: true, // 查询无数据
    noQuery: true, // 未查询
  },
  1: {
    // 法人、股东、高管
    noData: true,
    noQuery: true,
  },
  2: {
    // 联系方式
    noData: true,
    noQuery: true,
  },
  3: {
    // 组合关联
    noData: true,
    noQuery: true,
  },
}; // 状态控制map

const RelationshipMining = (props) => {
  const { list1DS, list2DS, list3DS, revealedDS } = props;

  const [basicVal, setBasicValue] = useState(''); // 1: 法人 股东 高管 2: 联系方式 3：组合关联 revealed：股权关系揭示
  const [legalLevel, setLegalLevel] = useState('3');
  const [contactValue, setContactValue] = useState('');
  const [activeKey, setActiveKey] = useState('road');
  const [fetchLoading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [companyList, setCompanyList] = useState([]); // 所有公司列表
  const [defaultSelect, setDefaultSelect] = useState(new Date().getTime());
  const [countMap, setCountMap] = useState({});

  useEffect(() => {
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
          setCountMap({ ...res });
        }
      });
    }

    return () => {
      chartMiningDom = null;
      myMiningChart = null;
      relationsMap = [];
      uniqueData = [];
      uniqueMiningData = [];
      uniqueMining2Data = [];
      uniqueMining3Data = [];
      relationsMiningMap = [];
      relationsMining2Map = [];
      relationsMining3Map = [];
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
    }
  }, [activeKey]);

  const switchDs = (type) => {
    const dsMap = {
      1: list1DS,
      2: list2DS,
      3: list3DS,
      revealed: revealedDS,
    };

    return dsMap[type] ? dsMap[type] : revealedDS;
  };

  const refreshChart = () => {
    chartMiningDom = document.getElementById('supplier-relation-ship-mining');
    myMiningChart = echarts.init(chartMiningDom);
    const option = chartOption(basicVal);
    myMiningChart.setOption(option);
  };

  const resetChart = () => {
    const option = chartOption(basicVal);
    if (myMiningChart) {
      myMiningChart.setOption(option);
    }
  };

  const chartOption = (type) => {
    let dataArr = [];
    let mapData = [];

    if (type === 'revealed') {
      dataArr = uniqueData;
      mapData = relationsMap;
    } else if (type === '1') {
      dataArr = uniqueMiningData;
      mapData = relationsMiningMap;
    } else if (type === '2') {
      dataArr = uniqueMining2Data;
      mapData = relationsMining2Map;
    } else if (type === '3') {
      dataArr = uniqueMining3Data;
      mapData = relationsMining3Map;
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

  /**
   * 选择股权关系揭示
   */
  const changerBasic = (e) => {
    setBasicValue(e);
    if (e === '1') {
      setLegalLevel('3');
    } else if (e === '2') {
      setContactValue('phone');
    }
    setRefresh(true);
    resetChart();
    setDefaultSelect(new Date().getTime());
  };

  /**
   *
   * @param {*} e
   */
  const changeContact = (e) => {
    setContactValue(e);
  };

  const list = () => {
    return [
      {
        id: 'road',
        title: intl.get('sdat.supplier.view.btn.road').d('路径'),
      },
      basicVal !== '2' && {
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
          {['L', 'R'].includes(item.line) ? (
            <div
              style={{
                display: 'flex',
                padding: item.line === 'L' ? '0 20px 0 5px' : '0 5px 0 20px',
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
    return basicVal === 'revealed'
      ? [
          {
            name: 'serialNumber',
            header: intl.get('sdat.supplier.view.title.serialNumber').d('序号'),
            width: 60,
            renderer: ({ record }) => {
              const { currentPage, pageSize } = switchDs(basicVal);
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
            renderer: ({ record }) => {
              return (
                <div style={{ display: 'flex', alignItems: 'center' }}>{getRoadPath(record)}</div>
              );
            },
          },
        ]
      : basicVal === '2'
      ? [
          // 联系方式
          {
            name: 'serialNumber',
            header: intl.get('sdat.supplier.view.title.serialNumber').d('序号'),
            width: 80,
            renderer: ({ record }) => {
              const { currentPage, pageSize } = switchDs(basicVal);
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
              const { currentPage, pageSize } = switchDs(basicVal);
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

  /**
   * 关系挖掘
   */
  const handleMining = () => {
    if (basicVal === '1' && !legalLevel) {
      // 法人、股东、高管
      return;
    }

    if (basicVal === '2' && !contactValue) {
      // 联系方式
      return;
    }

    setLoading(true);

    if (basicVal === 'revealed') {
      // 股权关系揭示
      fetchCompanyRevealed({
        ...param,
        searchType: 'relation',
      }).then((res) => {
        setLoading(false);
        if (res && res.Data && res.Data.length) {
          const dataArr = res.Data || [];
          formatResData(res, 'revealed');

          if (dataArr.length) {
            // 有数据
            statusMap.revealed.noData = false;
            statusMap.revealed.noQuery = false;
            setRefresh(true);
          } else {
            statusMap.revealed.noData = true;
            statusMap.revealed.noQuery = false;
            setRefresh(true);
          }
        } else {
          notification.error({
            message: res?.message ?? res?.msg ?? '',
          });
          statusMap.revealed.noData = true;
          statusMap.revealed.noQuery = true;
          resetChart();
          setRefresh(true);
        }
      });
    } else {
      const typeObj = {
        1: 'djg',
      };
      const fetchParam = {
        ...param,
        searchType: basicVal === '2' ? contactValue : typeObj[basicVal],
      };

      fetchRelationMining({
        ...param,
        ...fetchParam,
      }).then((result) => {
        setLoading(false);
        if (result && result.Data && result.Data.length) {
          formatResData(result || {}, basicVal);
          const dataArr = result?.Data ?? [];
          if (dataArr.length) {
            // 有数据
            statusMap[basicVal].noData = false;
            statusMap[basicVal].noQuery = false;
            setRefresh(true);
          } else {
            statusMap[basicVal].noData = true;
            statusMap[basicVal].noQuery = false;
            setRefresh(true);
          }
        } else {
          notification.error({
            message: result?.message ?? result?.msg ?? '',
          });
          statusMap[basicVal].noData = true;
          statusMap[basicVal].noQuery = true;
          resetChart();
          setRefresh(true);
        }
      });
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
    // uniqueMiningData = uniqueList(seriesData);
    // relationsMiningMap = [...relationsMap];

    if (type === 'revealed') {
      revealedDS.data = dataArr;
      uniqueData = uniqueList(seriesData);
    } else if (type === '1') {
      list1DS.data = dataArr;
      uniqueMiningData = uniqueList(seriesData);
      relationsMiningMap = [...relationsMap];
    } else if (type === '2') {
      list2DS.data = dataArr;
      uniqueMining2Data = uniqueList(seriesData);
      relationsMining2Map = [...relationsMap];
    } else if (type === '3') {
      list3DS.data = dataArr;
      uniqueMining3Data = uniqueList(seriesData);
      relationsMining3Map = [...relationsMap];
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

  const equityComp = (type) => {
    return (
      <div
        style={{
          width: '540px',
          height: type === 'shareholder' ? '500px' : type === 'contact' ? '380px' : '430px',
          padding: '20px',
        }}
      >
        <div style={{ color: '#1D2129', fontSize: '14px', fontWeight: '500' }}>
          {intl.get('sdat.supplier.view.title.remark').d('注释')}
        </div>
        <div style={{ marginTop: type === 'contact' ? '10px' : '' }}>
          <img alt="equity" src={imgObj[type]} style={{ width: '500px' }} />
        </div>
        {/* <div style={{ fontSize: '12px', textAlign: 'center', color: '#999' }}>
          {intl.get('sdat.supplier.view.title.dataSource').d('数据来源：企查查科技有限公司')}
        </div> */}
      </div>
    );
  };

  /**
   * 导出路径
   */
  const handleExportPath = () => {
    const pathExportList = [];

    const switchList = (type) => {
      const dsMap = {
        1: list1DS.toData(),
        2: list2DS.toData(),
        3: list3DS.toData(),
        revealed: revealedDS.toData(),
      };

      return dsMap[type] || [];
    };

    const data = switchList(basicVal);

    if (['revealed', '1', '3'].includes(basicVal)) {
      data.forEach((item) => {
        pathExportList.push(item.Path);
      });
    }

    if (basicVal === '2') {
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
    }

    if (pathExportList.length) {
      if (basicVal === '2') {
        fetchExportContract({
          contactList: pathExportList,
        });
      } else {
        fetchExportPath({ paths: pathExportList });
      }
    } else {
      notification.warning({
        message: intl.get('sdat.common.view.message.noDataToExport').d('暂无可导出数据'),
      });
    }
  };

  const commonDs = switchDs(basicVal);

  return (
    <div className={styles['relationship-mining-basic']}>
      <Header
        title={intl.get('sdat.supplier.view.title.supplierRelationMining').d('供应商关系挖掘')}
      />
      <Content>
        <Row style={{ height: 'calc(100vh - 106px)' }}>
          <Col span={5}>
            <div className={styles['relationship-mining-company-list-panel']}>
              <div style={{ width: '3px', height: '12px', background: '#00B8CC' }} />
              <span style={{ marginLeft: '10px' }}>
                {intl.get('sdat.supplier.view.title.companyList').d('供应商列表')}
              </span>
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
                width: '300px',
                marginTop: '32px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div style={{ width: '3px', height: '12px', background: '#00B8CC' }} />
              <span style={{ marginLeft: '10px' }}>
                {intl.get('sdat.supplier.view.title.associationType').d('关联类型')}
              </span>
            </div>
            <form style={{ fontSize: '14px' }}>
              <div style={{ padding: '8px 0', width: '300px' }}>
                <Radio name="basicLevel" value="revealed" onChange={changerBasic}>
                  {intl.get('sdat.supplier.view.title.relationshipRevealed').d('股权关系揭示')}
                  <span style={{ color: '#868D9C' }}>{`(${countMap?.relationCount ?? 0})`}</span>
                </Radio>
                <Tooltip
                  theme="light"
                  placement="bottomRight"
                  title={equityComp('equity')}
                  popupClassName={styles['popup-tooltip-card']}
                >
                  <Icon style={{ color: '#C9CDD4' }} type="help" />
                </Tooltip>
              </div>
              <div style={{ padding: '8px 0', width: '300px' }}>
                <Radio name="basicLevel" value="1" onChange={changerBasic}>
                  {intl
                    .get('sdat.supplier.view.title.relationshipLegalPerson')
                    .d('法人、股东、高管')}
                  <span style={{ color: '#868D9C' }}>{`(${countMap?.executiveCount ?? 0})`}</span>
                </Radio>

                <Tooltip
                  theme="light"
                  placement="bottomRight"
                  title={equityComp('shareholder')}
                  popupClassName={styles['popup-tooltip-card']}
                >
                  <Icon style={{ color: '#C9CDD4' }} type="help" />
                </Tooltip>
              </div>

              <div style={{ padding: '8px 0', width: '300px' }}>
                <Radio name="basicLevel" value="2" onChange={changerBasic}>
                  {intl.get('sdat.supplier.view.title.contactInformation').d('联系方式关联')}
                  <span style={{ color: '#868D9C' }}>{`(${countMap?.linkCount ?? 0})`}</span>
                </Radio>
                <Tooltip
                  theme="light"
                  placement="bottomRight"
                  title={equityComp('contact')}
                  popupClassName={styles['popup-tooltip-card']}
                >
                  <Icon style={{ color: '#C9CDD4' }} type="help" />
                </Tooltip>
                {basicVal === '2' ? (
                  <div style={{ padding: '16px 0 0 16px' }}>
                    <Radio
                      name="contact"
                      value="phone"
                      checked={contactValue === 'phone'}
                      onChange={changeContact}
                    >
                      {intl.get('sdat.supplier.view.title.phone').d('电话')}
                      <span style={{ color: '#868D9C' }}>{`(${countMap?.phoneCount ?? 0})`}</span>
                    </Radio>
                    <Radio
                      name="contact"
                      value="mail"
                      checked={contactValue === 'mail'}
                      onChange={changeContact}
                    >
                      {intl.get('sdat.supplier.view.title.email').d('邮箱')}
                      <span style={{ color: '#868D9C' }}>{`(${countMap?.mailCount ?? 0})`}</span>
                    </Radio>
                    <Radio
                      name="contact"
                      value="address"
                      checked={contactValue === 'address'}
                      onChange={changeContact}
                    >
                      {intl.get('sdat.supplier.view.title.address').d('地址')}
                      <span style={{ color: '#868D9C' }}>{`(${countMap?.addressCount ?? 0})`}</span>
                    </Radio>
                  </div>
                ) : null}
              </div>
            </form>

            <div className={styles['relation-mining-btn-span']}>
              <Button
                color="primary"
                style={{ width: '300px' }}
                onClick={handleMining}
                loading={fetchLoading}
              >
                {intl.get('sdat.supplier.view.title.relationMiningView').d('查看')}
              </Button>
            </div>
          </Col>
          <Col
            span={19}
            // className={styles['relation-mining-map']}
            style={{
              backgroundColor: activeKey === 'road' ? '#fff' : '#f7f8fa',
              paddingLeft: activeKey === 'road' ? '16px' : '0',
            }}
          >
            {basicVal && !statusMap[basicVal].noData ? ( // 有数据（已经执行查询）
              <div>
                <div style={{ backgroundColor: '#fff', height: '40px' }}>
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
                    defaultValue={defaultSelect}
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
                    <Table dataSet={commonDs} queryBar="none" border={false} columns={columns()} />
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
                {!basicVal || statusMap[basicVal].noQuery ? (
                  <div
                    style={{
                      height: 'calc(100vh - 100px)',
                      display: 'flex',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <img alt="noContent" style={{ width: '300px' }} src={defaultUrl} />
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#1D2129',
                        fontWeight: '500',
                        lineHeight: '24px',
                      }}
                    >
                      {intl
                        .get('sdat.supplier.view.title.selectTypeToView')
                        .d('请在左侧选择一条关联类型查看关系')}
                    </div>
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
          </Col>
        </Row>
      </Content>
    </div>
  );
};

export default formatterCollections({
  code: ['sdat.supplier', 'sdat.common', 'sdat.monitorBusiness'],
})(
  withProps(
    () => {
      const list1DS = new DataSet(RelationMiningDS()); // 1: 法人 股东 高管
      const list2DS = new DataSet(RelationContactMiningDS()); // 2: 联系方式
      const list3DS = new DataSet(RelationMiningDS()); // 3：组合关联
      const revealedDS = new DataSet(RelationMiningDS());
      return { list1DS, list2DS, list3DS, revealedDS };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(RelationshipMining)
);
