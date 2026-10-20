/* eslint-disable no-param-reassign */
import React, { useEffect, useState, useRef } from 'react';
import { Table, DataSet, Row, Col } from 'choerodon-ui/pro';
import { Tag, Icon } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import uuid from 'uuid/v4';

import {
  fetchCreditRisk,
  fetchDisasterRisk,
  fetchBusinessRisk,
  queryIdpValue,
} from '@/services/riskScanVersion2/riskScanReport';

import { ReactComponent as BusinessInfo } from '@/assets/riskWorkplaceNew/businessInfo.svg'; // 工商信息
import { ReactComponent as DeliveryQuality } from '@/assets/riskWorkplaceNew/deliveryQuality.svg'; // 交货质量
import { ReactComponent as EnterpriseOperation } from '@/assets/riskWorkplaceNew/enterpriseOperation.svg'; // 企业运营
import { ReactComponent as JudicialLitigation } from '@/assets/riskWorkplaceNew/judicialLitigation.svg'; // 司法诉讼
import { ReactComponent as NaturalAccident } from '@/assets/riskWorkplaceNew/naturalAccident.svg'; // 自然灾害
import { ReactComponent as NewsOpinion } from '@/assets/riskWorkplaceNew/newsOpinion.svg'; // 新闻舆情
import { ReactComponent as ServiceResponse } from '@/assets/riskWorkplaceNew/serviceResponse.svg'; // 服务响应

import { getResultTab } from '../resultTabData';
import styles from './index.less';

const { Column } = Table;

let dsMap = {};

let results = [];
let dynamicTypeMap = {};
let isQuery = false;
let dynamicResults = [];

export default function RiskScanResult({
  loading,
  passport,
  keyword,
  tenantId,
  companyId,
  planId,
  socialCode = '',
  cardList,
  supplierCompanyId = '',
  onCallBackForLoading = () => {},
}) {
  const [levelMap, setLevelMap] = useState({});
  const [dynamicCard, setDynamicCard] = useState({});
  const [refresh, setRefresh] = useState(false);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  /**
   * 组件初始化，获取风险等级映射数据
   */
  useEffect(() => {
    const handleInit = async () => {
      try {
        const res = await queryIdpValue({
          tenantId,
          lovCode: 'SDAT.WORKBENCH_EVENT_LEVEL',
        });

        if (isMountedRef.current && getResponse(res) && res.length) {
          const map = {};
          res.forEach((item) => {
            map[item.value] = item.meaning;
          });
          setLevelMap(map);
        }
      } catch (error) {
        console.log(error);
      }
    };

    handleInit();
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      dsMap = {};
      results = [];
      dynamicTypeMap = {};
      dynamicResults = [];
      isQuery = false;
    };
  }, [tenantId]);

  /**
   * 处理卡片列表数据变化
   */
  useEffect(() => {
    if (cardList && cardList.length) {
      const map = {};
      cardList.forEach((item) => {
        map[item.riskCode] = { ...item };
      });
      setDynamicCard(map);
    } else {
      setDynamicCard({});
    }
  }, [cardList]);

  /**
   * 当planId变化时获取动态数据，避免重复调用
   */
  useEffect(() => {
    if (planId && planId !== 'null' && planId !== 'undefined') {
      getDynamicData(passport, keyword, planId, socialCode, tenantId, supplierCompanyId, companyId);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      isQuery = false;
    };
  }, [planId, passport, keyword, socialCode, tenantId, supplierCompanyId, companyId]);

  /**
   * 处理刷新状态
   */
  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  /**
   * 获取动态风险数据
   */

  const queryCreditRisk = async (
    passportVal,
    keyWord,
    planIdVal,
    usccCode,
    tenantIdStr,
    companyId1,
    companyId2
  ) => {
    const res = await fetchCreditRisk({
      passport: passportVal,
      enterpriseName: keyWord,
      planId: planIdVal,
      tenantId: ['null', 'undefined']?.includes(tenantIdStr) ? '' : tenantIdStr,
      socialCode: ['null', 'undefined']?.includes(usccCode) ? '' : usccCode,
      supplierCompanyId: ['null', 'undefined']?.includes(companyId1) ? '' : companyId1,
      companyId: ['null', 'undefined']?.includes(companyId2) ? '' : companyId2,
    });

    return getResponse(res);
  };

  const queryDisasterRisk = async (
    passportVal,
    keyWord,
    planIdVal,
    usccCode,
    tenantIdStr,
    companyId1,
    companyId2
  ) => {
    const res = await fetchDisasterRisk({
      passport: passportVal,
      enterpriseName: keyWord,
      planId: planIdVal,
      tenantId: ['null', 'undefined']?.includes(tenantIdStr) ? '' : tenantIdStr,
      socialCode: ['null', 'undefined']?.includes(usccCode) ? '' : usccCode,
      supplierCompanyId: ['null', 'undefined']?.includes(companyId1) ? '' : companyId1,
      companyId: ['null', 'undefined']?.includes(companyId2) ? '' : companyId2,
    });

    return getResponse(res);
  };

  const queryBusinessRisk = async (
    passportVal,
    keyWord,
    planIdVal,
    usccCode,
    tenantIdStr,
    companyId1,
    companyId2
  ) => {
    const res = await fetchBusinessRisk({
      passport: passportVal,
      enterpriseName: keyWord,
      planId: planIdVal,
      tenantId: ['null', 'undefined']?.includes(tenantIdStr) ? '' : tenantIdStr,
      socialCode: ['null', 'undefined']?.includes(usccCode) ? '' : usccCode,
      supplierCompanyId: ['null', 'undefined']?.includes(companyId1) ? '' : companyId1,
      companyId: ['null', 'undefined']?.includes(companyId2) ? '' : companyId2,
    });

    return getResponse(res);
  };

  const getDynamicData = async (
    passportVal,
    keyWord,
    planIdVal,
    usccCode,
    tenantIdStr,
    companyId1,
    companyId2
  ) => {
    if (isQuery || !isMountedRef.current) {
      return;
    }
    isQuery = true;

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的AbortController
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      const res = await Promise.all([
        queryCreditRisk(
          passportVal,
          keyWord,
          planIdVal,
          usccCode,
          tenantIdStr,
          companyId1,
          companyId2
        ),
        queryDisasterRisk(
          passportVal,
          keyWord,
          planIdVal,
          usccCode,
          tenantIdStr,
          companyId1,
          companyId2
        ),
        queryBusinessRisk(
          passportVal,
          keyWord,
          planIdVal,
          usccCode,
          tenantIdStr,
          companyId1,
          companyId2
        ),
      ]);

      onCallBackForLoading();

      // 检查请求是否被取消或组件是否仍然挂载
      if (signal.aborted || !isMountedRef.current) {
        isQuery = false;
        return;
      }

      const allList = [];
      isQuery = false;

      if (res && res.length) {
        res.forEach((item) => {
          if (Array.isArray(item) && item.length) {
            allList.push(...item);
          }
        });
      }

      if (allList.length) {
        allList.forEach((item) => {
          dynamicTypeMap[item.riskCode] = { ...item };
        });
      }

      const arr = [];
      const resultTab = getResultTab(intl);

      const codesList = Object.keys(dynamicTypeMap);
      if (codesList.length) {
        codesList.forEach((code) => {
          let obj = resultTab.find((item) => item.code === code);
          if (!obj) {
            obj = {
              ...resultTab.find((item) => item.code === 'DEFAULT_RISK_TABLE_CODE'),
              id: uuid(),
            };
          }

          if (obj) {
            const fields = [];
            let levelArray = [];
            let tableData = [];
            let backendTitle = '';
            let sortNumber = 0;
            let changeArr = [];

            if (obj.fields && obj.fields.length) {
              obj.fields.forEach((field) => {
                fields.push({
                  name: field.fieldName,
                });
              });
            }
            if (!dsMap[obj.id]) {
              dsMap[obj.id] = new DataSet({
                selection: false,
                paging: false,
                fields,
              });
            }
            if (dsMap[obj.id] && dsMap[obj.id].loadData) {
              const dataObj = dynamicTypeMap[code] || {};
              const { levelList = [], changeList = [], title, sortNum = 0 } = dataObj || {};

              backendTitle =
                obj.code === 'DEFAULT_RISK_TABLE_CODE' ? title || '' : obj?.title || '';
              sortNumber = sortNum;

              levelArray = [...levelList];
              changeArr = [...changeList];
              tableData = changeList.length
                ? changeList.map((rcd) => {
                    return {
                      ...(rcd?.riskMessage ?? {}),
                      riskName: rcd?.riskName ?? '',
                      riskMessage: rcd?.riskMessage ?? '',
                      riskLevel: rcd.riskLevel,
                      riskCode: rcd.riskCode,
                    };
                  })
                : [];

              dsMap[obj.id].loadData(tableData);
            }

            arr.push({
              ...obj,
              id: obj.id,
              code: obj.code,
              title: backendTitle,
              levelList: levelArray,
              sortNum: sortNumber,
              changeList: changeArr,
            });
          }
        });

        dynamicResults = [...arr].sort((a, b) => {
          return a.sortNum - b.sortNum;
        });

        // 只有在组件仍然挂载且请求未被取消时才更新状态
        if (isMountedRef.current && !signal.aborted) {
          setRefresh(true);
        }
      }
    } catch (error) {
      if (!signal.aborted && isMountedRef.current) {
        console.log(error);
      }
      isQuery = false;
    }
  };

  const renderTagCount = (levelList = []) => {
    return levelList.length
      ? levelList.map((item, index) => {
          return (
            <>
              {index === 0 ? '' : <>&nbsp;,</>}
              {`${item?.riskLevel ?? ''}(`}
              <span style={{ color: 'red' }}>{item?.levelCount ?? 0}</span>
              {`)`}
            </>
          );
        })
      : null;
  };

  const classMap = {
    3: styles['incident-item-tag-high'],
    2: styles['incident-item-tag-middle'],
    1: styles['incident-item-tag-low'],
  };

  results = [
    {
      id: 1,
      title: intl.get('sdat.riskNewScanReport.view.card.businessInfo').d('征信｜工商信息'),
      riskType: 'businessInfo',
    },
    {
      id: 2,
      title: intl.get('sdat.riskNewScanReport.view.card.judicialLitigation').d('征信｜司法诉讼'),
      riskType: 'judicialLitigation',
    },
    {
      id: 3,
      title: intl.get('sdat.riskNewScanReport.view.card.enterpriseOperation').d('征信｜企业经营'),
      riskType: 'enterpriseOperation',
    },
    {
      id: 4,
      title: intl.get('sdat.riskNewScanReport.view.card.newsOpinion').d('征信｜新闻舆情'),
      riskType: 'newsOpinion',
    },
    {
      id: 5,
      title: intl.get('sdat.riskNewScanReport.view.card.naturalAccident').d('灾害｜自然意外'),
      riskType: 'naturalAccident',
    },
    {
      id: 6,
      title: intl.get('sdat.riskNewScanReport.view.card.deliveryQuality').d('业务｜交货质量'),
      riskType: 'deliveryQuality',
    },
    {
      id: 7,
      title: intl.get('sdat.riskNewScanReport.view.card.serviceResponse').d('业务｜服务响应'),
      riskType: 'serviceResponse',
    },
  ];

  const svgMap = {
    businessInfo: <BusinessInfo />,
    judicialLitigation: <JudicialLitigation />,
    enterpriseOperation: <EnterpriseOperation />,
    newsOpinion: <NewsOpinion />,
    naturalAccident: <NaturalAccident />,
    deliveryQuality: <DeliveryQuality />,
    serviceResponse: <ServiceResponse />,
  };

  return (
    <>
      {dynamicResults?.length ? (
        <div style={{ display: loading ? 'none' : 'block' }}>
          <div className={styles['risk-scan-result-title']}>
            一、{intl.get('sdat.riskScanReport.view.title.riskScanResult').d('风险扫描结果')}
          </div>
          <Row style={{ marginTop: '12px' }}>
            {results && results.length && Object.keys(dynamicCard)?.length ? (
              <div className={styles['risk-scan-result-panel']}>
                {results
                  .filter((rcd) => rcd.count !== 0)
                  .map((item) => {
                    const valueMap = dynamicCard[item.riskType] || null;
                    return valueMap ? (
                      <Col key={item.id} span={8}>
                        <div
                          style={{
                            display: 'flex',
                            background: '#F7F8FA',
                            borderRadius: '3px',
                            padding: '16px',
                            margin: '8px 8px',
                          }}
                        >
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ color: '#101319', fontSize: '14px', fontWeight: '600' }}>
                              {item.title}
                            </div>
                            <div
                              style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}
                            >
                              {valueMap.riskEventNum && valueMap.riskEventNum > 0 ? (
                                <>
                                  <span
                                    style={{
                                      borderRadius: '2px',
                                      background: 'rgba(242,85,53,0.15)',
                                      color: 'rgba(242,85,53)',
                                    }}
                                  >
                                    <Icon type="error" />
                                  </span>
                                  <span style={{ margin: '0 8px' }}>
                                    {`${intl
                                      .get('sdat.riskScanReport.view.title.riskEvent')
                                      .d('风险事件')}  ${valueMap.riskEventNum}`}
                                  </span>
                                  {/* |
                                  <span style={{ marginLeft: '8px' }}>
                                    {`${intl
                                      .get('sdat.riskScanReport.view.title.score')
                                      .d('得分')}  ${valueMap?.avgScore ?? 0}`}
                                  </span> */}
                                </>
                              ) : (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#179454',
                                    fontWeight: '500',
                                    background: 'rgba(71,184,131,0.15)',
                                    borderRadius: '2px',
                                  }}
                                >
                                  <Icon type="check_circle" />
                                  <span style={{ marginLeft: '8px' }}>
                                    {intl
                                      .get('sdat.riskScanReport.view.title.noRiskEvent')
                                      .d('无风险事件')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ width: '60px', textAlign: 'right' }}>
                            {svgMap[item.riskType]}
                          </div>
                        </div>
                      </Col>
                    ) : null;
                  })}
              </div>
            ) : null}
          </Row>

          <div className={styles['risk-scan-result-title']}>
            二、{intl.get('sdat.riskScanReport.view.title.riskScanAnalysis').d('风险扫描分析')}
          </div>
          <div className={styles['risk-scan-basic-report-list']}>
            <>
              {dynamicResults.map((item, index) => {
                return (
                  <div key={item.id} style={{ marginBottom: '32px' }}>
                    <div className={styles['risk-scan-result-sec-title']}>
                      {`2.${index + 1} ${item.title}`}
                      {item?.changeList && item?.changeList.length ? (
                        <>
                          {item.levelList && item.levelList.length ? '-' : null}
                          {renderTagCount(item.levelList)}
                        </>
                      ) : null}
                    </div>
                    <div className={styles['risk-scan-result-content']}>{item.content}</div>
                    <div style={{ maxHeight: '400px' }}>
                      {dsMap[item?.id] && dsMap[item?.id].length ? (
                        <Table
                          queryBar="none"
                          dataSet={dsMap[item.id]}
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
                                  const { currentPage, pageSize } = dsMap[item.id];
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
                            ) : item2.fieldName === 'stdDisabled' ? (
                              <Column
                                key={item2.fieldName}
                                name={item2.fieldName}
                                header={item2.label}
                                renderer={({ value }) => {
                                  if (
                                    [1, '1', 0, '0', 'true', true, 'false', false].includes(value)
                                  ) {
                                    if (['1', 1, 'true'].includes(value)) {
                                      return intl.get('hzero.common.model.yes').d('是');
                                    }

                                    if (['0', 0, 'false'].includes(value)) {
                                      return intl.get('hzero.common.model.no').d('否');
                                    }
                                  } else {
                                    return value || '-';
                                  }
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
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '16px',
                            height: '48px',
                            fontSize: '12px',
                            color: 'rgba(0,0,0,0.5)',
                          }}
                        >
                          {intl
                            .get('sdat.riskScanReport.view.title.riskAlertMsg')
                            .d(
                              '根据相关网站检索及大数据分析暂无对应风险信息，不排除因信息公开来源尚未公开、公开形式存在差异、检索时间存在滞后等情况导致的信息与客观事实不完全一致的情形，仅供客户参考'
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          </div>
        </div>
      ) : (
        <div style={{ height: '100vh' }} />
      )}
    </>
  );
}
