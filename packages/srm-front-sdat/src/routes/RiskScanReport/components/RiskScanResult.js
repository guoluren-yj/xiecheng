/* eslint-disable no-param-reassign */
import React, { useEffect, useState, useRef } from 'react';
import { Table, DataSet, Row, Col, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';

import { SRM_DATA_SDAT } from '@/utils/config';
import { fetchDynamicUrl, queryIdpValue, fetchQueryUrls } from '@/services/riskScan/riskScanReport';

import { getResultTab } from '../resultTabData';
import styles from './index.less';

const { Column } = Table;

let dsMap = {};

let results = [];
let dynamicResults = [];

export default function RiskScanResult({ passport, keyword, tenantId }) {
  const [refresh, setRefresh] = useState(false);
  const [levelMap, setLevelMap] = useState({});

  const dynamicUrlRef = useRef(null);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    queryIdpValue({
      tenantId,
      lovCode: 'SDAT.WORKBENCH_EVENT_LEVEL',
    }).then((res) => {
      if (getResponse(res) && res.length) {
        const map = {};
        res.forEach((item) => {
          map[item.value] = item.meaning;
        });
        setLevelMap(map);
      }
    });

    fetchQueryUrls({ tenantId }).then((res) => {
      if (getResponse(res)) {
        dynamicUrlRef.current = res || [];
      }
    });

    return () => {
      dsMap = {};
      results = [];
      dynamicResults = [];
    };
  }, []);

  useEffect(() => {
    const resultTab = getResultTab(intl);

    fetchDynamicUrl({ tenantId }).then((arr) => {
      if (getResponse(arr) && Array.isArray(arr) && arr.length) {
        resultTab.forEach((item) => {
          arr.forEach((obj) => {
            if (item.url && obj.key && item.url === obj.key) {
              dynamicResults.push({
                ...item,
                riskLevel: obj?.riskLevel ?? '',
                levelCount: obj?.levelCount ?? 0,
                level: obj?.level ?? '',
              });
            }
          });
        });

        results = [...dynamicResults];

        if (dynamicResults.length) {
          dynamicResults.forEach((item) => {
            const fields = [];

            if (item.fields && item.fields.length) {
              item.fields.forEach((field) => {
                fields.push({
                  name: field.fieldName,
                });
              });
            }

            if (!dsMap[item.id]) {
              dsMap[item.id] = {
                ds: new DataSet({
                  transport: {
                    read: ({ data, params }) => {
                      return {
                        url: `${SRM_DATA_SDAT}/v1/${tenantId}/risk-scan${item.url}`,
                        params: {
                          ...data,
                          ...params,
                        },
                        method: 'GET',
                      };
                    },
                  },
                  selection: false,
                  paging: false,
                  fields,
                }),
                queryUrl: item.url,
              };
            }

            if (dsMap[item.id]?.ds && dsMap[item.id].ds?.query) {
              dsMap[item.id].ds.setQueryParameter('keyWord', keyword);
              dsMap[item.id].ds.setQueryParameter('passport', passport);

              if (
                !(
                  dynamicUrlRef.current.length &&
                  dsMap[item.id]?.queryUrl &&
                  dynamicUrlRef.current.includes(dsMap[item.id].queryUrl)
                )
              ) {
                return;
              }

              dsMap[item.id].ds
                .query()
                .then((res) => {
                  results.forEach((item2) => {
                    if (item2.id === item.id) {
                      if (
                        [
                          '/change-records',
                          '/case-detail',
                          '/court-notice',
                          '/judgment-document',
                          '/certificate',
                          '/notice-list',
                        ].includes(item2.url)
                      ) {
                        item2.levelList = res?.levelList ?? [];
                        item2.count = res?.changeList?.length ?? 0;
                        dsMap[item.id].ds.data = [...(res?.changeList ?? [])];
                      } else {
                        item2.count = res?.totalElements ?? res?.total ?? 0;
                      }
                    }
                  });

                  setRefresh(true);
                })
                .catch((err) => {
                  results.forEach((item2) => {
                    if (item2.id === item.id) {
                      // 接口响应失败
                      item2.fetchFailed = err;
                    }
                  });
                  setRefresh(true);
                });
            }
          });
        }
      }
    });
  }, [passport, keyword]);

  const renderTagCount = (record = {}) => {
    if (record.levelList && record.levelList.length) {
      return record.levelList.map((item, index) => {
        return (
          <>
            {index === 0 ? '' : <>&nbsp;,</>}
            {`${item?.riskLevel ?? ''}(`}
            <span style={{ color: 'red' }}>{item?.levelCount ?? 0}</span>
            {`)`}
          </>
        );
      });
    } else {
      return (
        <>
          {`${record?.riskLevel ?? ''}(`}
          <span style={{ color: 'red' }}>{record?.levelCount || record?.count || 0}</span>
          {`)`}
          &nbsp;&nbsp;
        </>
      );
    }
  };

  const handleRefresh = async (key) => {
    if (key && dsMap[key] && dsMap[key].query) {
      await dsMap[key].query();
      setRefresh(true);
    }
  };

  const classMap = {
    3: styles['incident-item-tag-high'],
    2: styles['incident-item-tag-middle'],
    1: styles['incident-item-tag-low'],
  };

  return (
    <>
      <div className={styles['risk-scan-result-title']}>
        一、{intl.get('sdat.riskScanReport.view.title.riskScanResult').d('风险扫描结果')}
      </div>
      <Row>
        {results && results.length ? (
          <div className={styles['risk-scan-result-panel']}>
            {results
              .filter((rcd) => rcd.count !== 0)
              .map((item, index) => {
                return (
                  <Col key={item.id} span={8}>
                    <div
                      style={{
                        margin: '4px 0',
                        marginRight: [0, 1].includes(index % 3) ? '5px' : '0',
                        padding: '5px 16px',
                        background: '#F7F8FA',
                      }}
                    >
                      <span>{`${index + 1}、${item.title}`}</span>
                      &nbsp;
                      <span style={{ color: '#ED2F00' }}>{item?.count ?? 0}</span>
                    </div>
                  </Col>
                );
              })}
          </div>
        ) : (
          <div style={{ color: '#1d2129', textAlign: 'center', lineHeight: '48px' }}>
            {intl.get('hzero.common.message.data.none').d('暂无数据')}
          </div>
        )}
      </Row>

      <div className={styles['risk-scan-result-title']}>
        二、{intl.get('sdat.riskScanReport.view.title.riskScanAnalysis').d('风险扫描分析')}
      </div>
      <>
        <div className={styles['risk-scan-basic-report-list']}>
          {dynamicResults
            .filter(
              (rcd) => rcd.count > 0 || (rcd.levelList && rcd.levelList.length) || rcd.fetchFailed
            )
            .map((item, index) => {
              return (
                <div key={item.id} style={{ marginBottom: '32px' }}>
                  <div className={styles['risk-scan-result-sec-title']}>
                    {`2.${index + 1} ${item.title}-`}
                    {renderTagCount(item)}
                  </div>
                  <div className={styles['risk-scan-result-content']}>{item.content}</div>
                  <>
                    {item.fetchFailed ? (
                      <div
                        style={{
                          height: '80px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#F2F3F5',
                          fontSize: '14px',
                        }}
                      >
                        {intl.get('sdat.riskScanReport.view.message.loadFailed').d('内容加载失败')}
                        <Button
                          icon="sync"
                          funcType="link"
                          style={{ marginLeft: '8px' }}
                          onClick={() => handleRefresh(item.id)}
                        >
                          {intl.get('sdat.riskScanReport.view.button.refresh').d('请重试')}
                        </Button>
                      </div>
                    ) : (
                      <div style={{ maxHeight: '400px' }}>
                        <Table
                          queryBar="none"
                          dataSet={dsMap[item.id].ds}
                          border={false}
                          autoHeight={{ type: 'maxHeight', diff: 40 }}
                        >
                          {(item?.fields ?? []).map((item2) => {
                            return item2.fieldName === 'serialNo' ? (
                              <Column
                                key={item2.fieldName}
                                name={item2.fieldName}
                                header={item2.label}
                                width={80}
                                renderer={({ record }) => {
                                  const { currentPage, pageSize } = dsMap[item.id].ds;
                                  return record.index + 1 + (currentPage - 1) * pageSize;
                                }}
                              />
                            ) : item2.fieldName === 'riskLevel' ? (
                              <Column
                                key={item2.fieldName}
                                name={item2.fieldName}
                                header={item2.label}
                                renderer={({ value }) => {
                                  const val = value || item.level;
                                  return !val ? (
                                    '-'
                                  ) : (
                                    <Tag className={classMap[String(val)]}>{levelMap[val]}</Tag>
                                  );
                                }}
                              />
                            ) : (
                              <Column
                                key={item2.fieldName}
                                name={item2.fieldName}
                                header={item2.label}
                              />
                            );
                          })}
                        </Table>
                      </div>
                    )}
                  </>
                </div>
              );
            })}
        </div>
      </>
    </>
  );
}
