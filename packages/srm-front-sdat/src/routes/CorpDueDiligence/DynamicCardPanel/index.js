/* eslint-disable eqeqeq */
import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';
import { DataSet, Tooltip, Icon } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';

import { queryIdpValue } from 'services/api';

import { getResponse } from '@/utils/utils';
import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';
import { ReactComponent as NoneContent } from '@/assets/images/none_2.svg';

import {
  ListDS,
  MiningListDS,
  fetchDynamicType,
  MiningOneManyListDS,
} from '../stores/corporateDiligenceDS';
import CustomizeTableComp from './CustomizeTableComp';
import RelationTable from './RelationTable';
import OneToManyTable from './OneToManyTable';
import styles from './index.less';

let dsMap = {};

export default function DynamicCardPanel(props) {
  const { customizeTable, record } = props;

  const [cardList, setCardList] = useState([]);
  const [levelMap, setLevelMap] = useState({});

  const keyLen = Object.keys(dsMap).length;

  useEffect(() => {
    const obj = {};
    queryIdpValue('SDAT.RISK_LEVEL_TYPE').then(res => {
      if (getResponse(res) && res.length) {
        res.forEach(item => {
          obj[item.value] = item.meaning;
        });
      }
    });
    setLevelMap(obj);
    initData('');
    return () => {
      dsMap = {};
    };
  }, []);

  useEffect(() => {
    if (record && record.recordId) {
      Object.keys(dsMap).forEach(key => {
        dsMap[key].setQueryParameter('recordId', record.recordId);
        dsMap[key].setQueryParameter('dataType', key);
        if (record.reportType === 'RISK_SCAN' && key === 'RISK_SCAN') {
          dsMap[key].query();
        }

        if (
          record.reportType !== 'RISK_SCAN' &&
          record.reportType !== 'RELATION_MINING' &&
          record.reportType !== 'ONE_TO_MANY_RELATION' &&
          [('SCAN', 'SHELL')].includes(key)
        ) {
          dsMap[key].query();
        }

        if (record.reportType === 'RELATION_MINING' && key === 'RELATION_MINING') {
          dsMap[key].query();
        }

        if (record.reportType === 'ONE_TO_MANY_RELATION' && key === 'ONE_TO_MANY_RELATION') {
          dsMap[key].query().then(() => {
            dsMap[key].forEach(rcd => {
              rcd.set('relatedName', record?.companyName);
            });
          });
        }
      });
    }
  }, [record, keyLen]);

  const initData = async () => {
    const arr = [];

    const resu = await queryIdpValue('SDAT.DUE_REPORT_TYPE');
    const res = await fetchDynamicType();

    if (getResponse(resu) && resu.length) {
      resu.forEach(item => {
        // 查询列表 并初始化 dsMap
        dsMap[item.value] =
          item.value === 'RELATION_MINING'
            ? new DataSet({ ...MiningListDS() })
            : item.value === 'ONE_TO_MANY_RELATION'
            ? new DataSet({ ...MiningOneManyListDS() })
            : new DataSet({ ...ListDS() });

        if (Array.isArray(res) && res.length && res.indexOf(item.value) !== -1) {
          arr.push({ ...item });
          if (!dsMap[item.value]) {
            dsMap[item.value] =
              item.value === 'RELATION_MINING'
                ? new DataSet({ ...MiningListDS() })
                : item.value === 'ONE_TO_MANY_RELATION'
                ? new DataSet({ ...MiningOneManyListDS() })
                : new DataSet({ ...ListDS() });
          }
        }
      });
    }
    setCardList(arr);
  };

  const bkgMap = {
    1: 'rgba(230, 67, 34, 0.1)',
    2: 'rgba(230, 67, 34, 0.1)',
    3: 'rgba(254, 185, 54, 0.1)',
    4: 'rgba(71, 184, 131, 0.1)',
    5: 'rgba(71, 184, 131, 0.1)',
  };

  const colorMap = {
    1: '#e64322',
    2: '#e64322',
    3: '#feb936',
    4: '#179454',
    5: '#179454',
  };

  const bkg2Map = {
    1: 'rgba(71, 184, 131, 0.1)',
    2: 'rgba(242, 128, 26, 0.1)',
    3: 'rgba(242, 85, 53, 0.1)',
  };

  const color2Map = {
    1: '#179454',
    2: '#f06200',
    3: '#e64322',
  };

  const valueMap = {
    1: intl.get('sdat.riskProfile.view.title.lowRisk').d('低风险'),
    2: intl.get('sdat.riskProfile.view.title.middleRisk').d('中风险'),
    3: intl.get('sdat.riskProfile.view.title.highRisk').d('高风险'),
  };

  const helpMsgMap = {
    RISK_SCAN: intl
      .get('sdat.riskProfile.view.title.riskScanHelpMsg')
      .d(
        '报告时间为记录生成时间。文档中“报告时间”为实际数据生成时间，若获取到缓存数据，会显示为对应数据时间。两处时间存在时间差异为正常现象。'
      ),
    RELATION_MINING: intl
      .get('sdat.riskProfile.view.title.relationMiningHelpMsg')
      .d(
        '报告时间为记录生成时间。文档中时间为报告生成时间。由于pdf文档生成会占用一定时间，两处时间存在时间差异为正常现象。'
      ),
    ONE_TO_MANY_RELATION: intl
      .get('sdat.riskProfile.view.title.oneToManyRelationHelpMsg')
      .d(
        '报告时间为记录生成时间。文档中时间为报告生成时间。由于pdf文档生成会占用一定时间，两处时间存在时间差异为正常现象。'
      ),
  };

  return (
    <div className={styles['corp-due-dynamic-cards-basic']}>
      {record && record.recordId ? (
        <>
          <div className={styles['corp-due-dynamic-cards-header']}>
            {record && (record?.reportScore || record?.overlap) ? (
              <>
                {record?.reportType === 'RISK_SCAN' && record?.riskLevel != -1 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '4px 16px',
                      background: bkg2Map[record?.riskLevel] || '',
                      marginRight: '16px',
                      // width: '76px',
                    }}
                  >
                    <div
                      style={{
                        lineHeight: '24px',
                        textAlign: 'center',
                        color: color2Map[record?.riskLevel],
                        fontSize: '20px',
                        fontWeight: '600',
                      }}
                    >
                      {record?.reportScore ?? ''}
                    </div>
                    <div
                      style={{
                        lineHeight: '18px',
                        textAlign: 'center',
                        color: color2Map[record?.riskLevel],
                      }}
                    >
                      {valueMap[record?.riskLevel]}
                    </div>
                  </div>
                ) : record?.reportType === 'RELATION_MINING' ||
                  record?.reportType === 'ONE_TO_MANY_RELATION' ? (
                    <div
                      style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '4px 16px',
                      background: 'rgba(25, 131, 245, 0.1)',
                      marginRight: '16px',
                      // width: '76px',
                    }}
                    >
                      <div
                        style={{
                        lineHeight: '24px',
                        textAlign: 'center',
                        color: '#1983F5',
                        fontSize: '20px',
                        fontWeight: '600',
                      }}
                      >
                        {record?.overlap ?? ''}
                      </div>
                      <div
                        style={{
                        lineHeight: '18px',
                        textAlign: 'center',
                        color: '#1983F5',
                      }}
                      >
                        {intl.get('sdat.riskProfile.view.title.overlapRate').d('重合率')}
                      </div>
                    </div>
                ) : record?.riskLevel == '-1' ? null : (
                  <>
                    {!['DILIGENCE', 'DECISION'].includes(record?.reportType) ? (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '4px 16px',
                          background: bkgMap[record?.riskLevel] || '',
                          marginRight: '16px',
                        }}
                      >
                        <div
                          style={{
                            lineHeight: '24px',
                            textAlign: 'center',
                            color: colorMap[record?.riskLevel],
                            fontSize: '20px',
                            fontWeight: '600',
                          }}
                        >
                          {record?.reportScore ?? ''}
                        </div>
                        <div
                          style={{
                            lineHeight: '18px',
                            textAlign: 'center',
                            color: colorMap[record?.riskLevel],
                          }}
                        >
                          {levelMap[record?.riskLevel]}
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </>
            ) : null}
            <div className={styles['corp-due-dynamic-cards-header-right']}>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Tooltip title={record?.companyName ?? ''}>
                  <div
                    style={{
                      fontSize: '16px',
                      color: '#1D2129',
                      lineHeight: '24px',
                      fontWeight: '500',
                      width: '80%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {record?.companyName ?? ''}
                  </div>
                </Tooltip>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#868D9C',
                    lineHeight: '18px',
                  }}
                >
                  {intl.get('sdat.corporateDiligence.view.title.dueDiligenceTime').d('报告时间')}:
                  {record?.creationDate ?? ''}
                  {['RISK_SCAN', 'RELATION_MINING', 'ONE_TO_MANY_RELATION'].includes(
                    record?.reportType
                  ) ? (
                    <Tooltip title={helpMsgMap[record?.reportType] ?? ''}>
                      <Icon type="help" style={{ marginLeft: '4px', fontSize: '14px' }} />
                    </Tooltip>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <Divider dashed />
          <div className={styles['corp-due-dynamic-cards-list']}>
            {record && record.reportType === 'RELATION_MINING' && dsMap?.RELATION_MINING ? (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <div className={styles['corp-due-dynamic-cards-panel-title']}>
                    {intl
                      .get('sdat.corporateDiligence.view.title.relationTroubleshooting')
                      .d('关系排查报告')}
                  </div>
                  <div style={{ maxHeight: '400px' }}>
                    <RelationTable dataSet={dsMap.RELATION_MINING} />
                  </div>
                </div>
              </>
            ) : record?.reportType === 'DECISION' ? (
              <div className={styles['corp-due-dynamic-cards-panel-noMsg']}>
                <div style={{ textAlign: 'center' }}>
                  <NoneContent />
                  <div style={{ marginTop: '16px', fontSize: '14px', color: '#1D2129' }}>
                    {intl
                      .get('sdat.corporateDiligence.message.reportNoMsg')
                      .d('信用决策报告暂时无法在线查看报告结果，您可以尝试预览文件或下载查看')}
                  </div>
                </div>
              </div>
            ) : record?.reportType === 'ONE_TO_MANY_RELATION' && dsMap?.ONE_TO_MANY_RELATION ? ( // 一对多关系排查
              <div style={{ marginBottom: '16px' }}>
                <div className={styles['corp-due-dynamic-cards-panel-title']}>
                  {intl
                    .get('sdat.corporateDiligence.view.title.oneToManyRelationReport')
                    .d('一对多关系排查报告')}
                </div>
                <div style={{ maxHeight: '400px' }}>
                  <OneToManyTable dataSet={dsMap.ONE_TO_MANY_RELATION} />
                </div>
              </div>
            ) : (
              <>
                {cardList.map(item => {
                  if (record && record.reportType === 'RISK_SCAN') {
                    if (item.value !== 'RISK_SCAN') return null;

                    return (
                      <div key={item.value} style={{ marginBottom: '16px' }}>
                        <div className={styles['corp-due-dynamic-cards-panel-title']}>
                          {item.meaning}
                        </div>
                        <div style={{ maxHeight: '400px' }}>
                          <CustomizeTableComp
                            dataSet={dsMap[item.value]}
                            customizeTable={customizeTable}
                            type={item.type}
                          />
                        </div>
                      </div>
                    );
                  } else if (record?.reportType === 'DILIGENCE') {
                    if (!['SHELL', 'SCAN'].includes(item.value)) return null;

                    return (
                      <div key={item.value} style={{ marginBottom: '16px' }}>
                        <div className={styles['corp-due-dynamic-cards-panel-title']}>
                          {item.meaning}
                        </div>
                        <div style={{ maxHeight: '400px' }}>
                          <CustomizeTableComp
                            dataSet={dsMap[item.value]}
                            customizeTable={customizeTable}
                            type={item.type}
                          />
                        </div>
                      </div>
                    );
                  } else {
                    if (item.value === 'RISK_SCAN') return null;

                    return (
                      <div key={item.value} style={{ marginBottom: '16px' }}>
                        <div className={styles['corp-due-dynamic-cards-panel-title']}>
                          {item.meaning}
                        </div>
                        <div style={{ maxHeight: '400px' }}>
                          <CustomizeTableComp
                            dataSet={dsMap[item.value]}
                            customizeTable={customizeTable}
                            type={item.type}
                          />
                        </div>
                      </div>
                    );
                  }
                })}
              </>
            )}
          </div>
        </>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
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
    </div>
  );
}
