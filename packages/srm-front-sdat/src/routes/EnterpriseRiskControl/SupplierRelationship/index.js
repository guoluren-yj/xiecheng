/**
 * 供应商找关系页面
 */
import React, { useState, useEffect } from 'react';
import withProps from 'utils/withProps';
import * as echarts from 'echarts';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { DataSet, Table, Icon, Modal, Button } from 'choerodon-ui/pro';
import notification from 'utils/notification';

import { getUrlParam } from '@/utils/utils';
import ToggleBtn from '@/components/ToggleBtn';
import { fetchRelationMap, fetchExportPath } from '@/services/riskControl/relationShipService';

import { RelationShipDS } from './stores/relationShipDS';
import RiskMapModal from './RiskMapModal';
import './index.less';

const refreshSrc = require('@/assets/refresh_svg.svg');
const downloadSrc = require('@/assets/download.svg');

let chartDom = null;
let myChart = null;

let uniqueData = [];
let relationsMap = [];
let pathExportList = [];

let modal = null;

const { secret = '', tenantId = '' } = getUrlParam() || {};

const SupplierRelationship = (props) => {
  const { listDS } = props;

  const [activeKey, setActiveKey] = useState('road');
  const [showCount, setShowCount] = useState(false);
  const [pathCount, setCount] = useState(0);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    fetchRelationMap({
      tenantId,
      secret,
    }).then((res) => {
      if (res && res.success) {
        formatRelationList(res?.data ?? {});
      } else {
        notification.error({
          message: res?.message ?? res?.msg ?? '',
        });
      }
    });

    return () => {
      chartDom = null;
      myChart = null;
      uniqueData = [];
      relationsMap = [];
      pathExportList = [];
    };
  }, []);

  useEffect(() => {
    if (activeKey === 'map') {
      refreshChart();
    }
  }, [activeKey]);

  const refreshChart = () => {
    chartDom = document.getElementById('supplier-relation-ship-map');
    myChart = echarts.init(chartDom);
    myChart.setOption(option);
  };

  const formatRelationList = (relation = {}) => {
    const list = relation?.Data ?? [];
    setShowCount(true);
    setCount(list.length);
    setRefresh(true);

    const seriesData = []; // 去重的企业列表
    relationsMap = []; // 节点关系列表
    uniqueData = [];

    listDS.data = list;

    if (list.length) {
      list.forEach((item) => {
        const subjectList = item.SubjectList;
        pathExportList.push({
          cuzRelationPath: item.cuzRelationPath,
        });

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
                  const labelList = (item2?.PropertyList ?? []).map((result) => result.LabelText);
                  return labelList && labelList.length ? labelList.join(',') : '';
                },
              },
            });
          });
        }
      });
    }

    // 去重
    uniqueData = uniqueList(seriesData);
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

  const option = {
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
        label: {
          show: true,
          formatter: (param) => {
            const label = param?.name ?? '';
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
        data: uniqueData,
        links: relationsMap,
        lineStyle: {
          opacity: 0.9,
          width: 1,
          curveness: 0,
        },
      },
    ],
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
      title: intl.get('sdat.supplier.view.title.relationMap').d('关系图谱'),
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

  const columns = () => {
    return [
      {
        name: 'serialNumber',
        width: 80,
        renderer: ({ record }) => {
          const { currentPage, pageSize } = listDS;
          return record.index + 1 + (currentPage - 1) * pageSize;
        },
      },
      {
        name: 'shipMap',
        width: 100,
        renderer: ({ record }) => {
          return (
            <a onClick={() => handleView(record)}>
              {intl.get('hzero.common.view.title.view').d('查看')}
            </a>
          );
        },
      },
      {
        name: 'road',
        renderer: ({ record }) => {
          return <div style={{ display: 'flex', alignItems: 'center' }}>{getRoadPath(record)}</div>;
        },
      },
    ];
  };

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

  const handleModeChange = (key) => {
    setActiveKey(key);
    setRefresh(true);
  };

  /**
   * 导出路径
   */
  const handleExportPath = () => {
    fetchExportPath(pathExportList);
  };

  const list = [
    {
      id: 'road',
      title: intl.get('sdat.supplier.view.btn.road').d('路径'),
    },
    {
      id: 'map',
      title: intl.get('sdat.supplier.view.btn.map').d('图谱'),
    },
  ];

  return (
    <>
      <Header title={intl.get('sdat.supplier.view.title.foundRelation').d('供应商找关系')} />
      <div className="find-relation-basic">
        <div>
          {showCount && (
            <div
              style={{
                color: '#3AB545',
                backgroundColor: 'rgba(71,184,131,0.10)',
                borderRadius: '2px',
                fontSize: '14px',
                fontWeight: '500',
                lineHeight: '38px',
                height: '38px',
                padding: '0 20px',
              }}
            >
              <span>{intl.get('sdat.supplier.view.title.countRelation', { name: pathCount })}</span>
              <span style={{ float: 'right' }}>
                <Icon
                  style={{ cursor: 'pointer' }}
                  type="close"
                  onClick={() => setShowCount(false)}
                />
              </span>
            </div>
          )}
        </div>
        <Content style={{ paddingTop: '0 !important' }}>
          <div style={{ marginBottom: '3px', height: '30px' }}>
            {activeKey === 'road' ? (
              <Button icon="unarchive" color="primary" funcType="flat" onClick={handleExportPath}>
                {intl.get('sdat.common.view.button.export').d('导出')}
              </Button>
            ) : null}
            <ToggleBtn style={{ float: 'right' }} toggleList={list} onSelect={handleModeChange} />
          </div>
          <div className="table-path-basic">
            {activeKey === 'road' ? (
              <div
                style={{ height: 'calc(100vh - 185px)', overflow: 'hidden', overflowY: 'scroll' }}
              >
                <Table dataSet={listDS} border={false} queryBar="none" columns={columns()} />
              </div>
            ) : (
              <div>
                <div
                  id="supplier-relation-ship-map"
                  style={{ height: '600px', display: activeKey === 'road' ? 'none' : 'block' }}
                />
              </div>
            )}
          </div>
        </Content>
      </div>
    </>
  );
};

export default formatterCollections({
  code: ['sdat.supplier', 'sdat.common'],
})(
  withProps(
    () => {
      const listDS = new DataSet(RelationShipDS());
      return { listDS };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(SupplierRelationship)
);
