/* eslint-disable react/no-array-index-key */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/**
 * 文件描述：智能审核统计报表主页面
 * 创建时间：2026-04-10
 * 最后更新时间：2026-04-20
 */
import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames';

import { Header } from 'components/Page';

import { DataSet, Table } from 'choerodon-ui/pro';

// import { observer } from 'mobx-react-lite';
import { Tabs, Divider, Tooltip } from 'choerodon-ui';
import intl from 'utils/intl';

import { compose } from 'lodash';
import withProps from 'utils/withProps';

import { SRM_SMBL } from '_utils/config';

import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExportPro from '@/components/ExcelExportPro';

import { fetchStatistics } from '@/services/checkRuleService';
import * as echarts from 'echarts';
// import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';

import { ReportListDS, RuleRateListDS } from './stores/reportDS';
import FilterBar from './FilterBarTable/FilterBar';
import Detail from './Detail';
import styles from './index.less';

const { Column } = Table;

const { TabPane } = Tabs;

let commonParams = {};

/**
 * 智能审核统计报表组件
 * @returns {React.ReactElement}
 */
const AiChekReport = ({ listDS, ruleRateListDS, ruleRateNotListDS }) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, detail

  const [chartInfos, setChartInfos] = useState({});

  const execCountRef = useRef(null);
  const docCountRef = useRef(null);
  const ruleCountRef = useRef(null);
  const avgTriggerRef = useRef(null);
  const passRateRef = useRef(null);
  const inaccuracyRateRef = useRef(null);

  useEffect(() => {
    let resizeTimer;

    const handleResize = () => {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(
        () => {
          const refs = [execCountRef, docCountRef, ruleCountRef, avgTriggerRef, passRateRef, inaccuracyRateRef];

          refs.forEach((ref) => {
            if (ref.current) {
              const chart = echarts.getInstanceByDom(ref.current);

              if (chart) {
                chart.resize();
              }
            }
          });
        },

        100
      );
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);

      commonParams = {};
    };
  }, []);

  const getStatistics = () => {
    const filterParams = {
      ...commonParams,
    };

    fetchStatistics({
      ...filterParams,
    }).then((res) => {
      if (getResponse(res)) {
        updateChartsWithData(res);
      }
    });
  };

  const updateChartsWithData = (data) => {
    const { usages = [] } = data;

    // 从 usages 数组中提取时间序列数据
    const executionData = usages.length ? usages.map((item) => item.executionCount || 0) : [];
    const docData = usages.length ? usages.map((item) => item.documentCount || 0) : [];
    const ruleData = usages.length ? usages.map((item) => item.ruleCount || 0) : [];
    const avgData = usages.length ? usages.map((item) => item.averageTriggerCount || 0) : [];
    const passData = usages.length
      ? usages.map((item) => parseFloat((item.onePassRate || '0%').replace('%', '')))
      : [];
    const dislikeRate = usages.length
      ? usages.map((item) => parseFloat((item.dislikeRate || '0%').replace('%', '')))
      : [];
    const timeLabels = usages.length
      ? usages.map((item) => (item.statDate ? item.statDate.substring(5, 10) : ''))
      : [];

    const updatedChartConfigs = [
      {
        key: 'execCount',
        ref: execCountRef,
        title: intl.get('smbl.aiChekReport.view.label.executionCount').d('总提交次数'),
        data: executionData,
        color: '#0161D5',
        currentValue: data.executionCount || 0,
        xAxisData: timeLabels,
      },

      {
        key: 'docCount',
        ref: docCountRef,
        title: intl.get('smbl.aiChekReport.view.label.documentCount').d('总流程单据量'),
        data: docData,
        color: '#0161D5',
        currentValue: data.documentCount || 0,
        xAxisData: timeLabels,
      },

      {
        key: 'ruleCount',
        ref: ruleCountRef,
        title: intl.get('smbl.aiChekReport.view.label.ruleCount').d('总审核规则次数'),
        data: ruleData,
        color: '#0161D5',
        currentValue: data.ruleCount || 0,
        xAxisData: timeLabels,
      },

      {
        key: 'avgTrigger',
        ref: avgTriggerRef,
        title: intl.get('smbl.aiChekReport.view.label.averageTriggerCount').d('平均触发次数'),
        data: avgData,
        color: '#0161D5',
        currentValue: data.averageTriggerCount || 0,
        xAxisData: timeLabels,
      },

      {
        key: 'passRate',
        ref: passRateRef,
        title: intl.get('smbl.aiChekReport.view.label.onePassRate').d('一次性通过率'),
        data: passData,
        color: '#0161D5',
        yAxisFormatter: '{value}%',
        currentValue: data.onePassRate || '0%',
        xAxisData: timeLabels,
        displayFormatter: (val) => val,
      },
      {
        key: 'inaccuracyRate',
        ref: inaccuracyRateRef,
        title: intl.get('smbl.aiChekReport.view.label.inaccuracyRate').d('审核结果不准确率统计'),
        data: dislikeRate,
        color: '#ED2F00',
        yAxisFormatter: '{value}%',
        currentValue: data.dislikeRate || '0%',
        xAxisData: timeLabels,
        displayFormatter: (val) => val,
      },
    ];

    const newChartInfos = {};
    updatedChartConfigs.forEach((config) => {
      const centerValue =
        config.currentValue !== null ? config.currentValue : config.data[config.data.length - 1];
      const displayValue = config.displayFormatter
        ? config.displayFormatter(centerValue)
        : config.yAxisFormatter
        ? `${centerValue}%`
        : centerValue;
      newChartInfos[config.key] = {
        title: config.title,
        value: displayValue,
      };

      if (config.ref.current) {
        const chart =
          echarts.getInstanceByDom(config.ref.current) || echarts.init(config.ref.current);
        const option = createChartOption({
          title: config.title,
          data: config.data,
          color: config.color,
          yAxisFormatter: config.yAxisFormatter,
          xAxisData: config.xAxisData,
          currentValue: config.currentValue,
          displayFormatter: config.displayFormatter,
        });
        chart.setOption(option, true);

        setTimeout(() => {
          if (config.ref.current) {
            const currentChart = echarts.getInstanceByDom(config.ref.current);
            if (currentChart) {
              currentChart.resize();
            }
          }
        }, 50);
      }
    });

    setChartInfos(newChartInfos);
  };

  const createChartOption = ({
    title,
    data,
    color = '#0161D5',
    yAxisFormatter = null,
    xAxisData = [],
  }) => {
    // const yMaxData = data.length ? Math.max(...data) * 1.5 : 100;

    return {
      tooltip: {
        trigger: 'axis',
        formatter(params) {
          const value = yAxisFormatter ? `${params[0].value}%` : params[0].value;
          return `${intl.get('smbl.aiChekReport.model.statDate').d('日期')}: ${
            params[0].name
          }</br>${title}: ${value}`;
        },
      },

      grid: {
        left: '2%',
        right: '4%',
        bottom: 10,
        top: '10%',
        containLabel: true,
      },

      xAxis: {
        type: 'category',
        data: xAxisData,
        show: true,
        axisLine: {
          lineStyle: {
            color: 'rgba(229,231,236,1)',
          },
        },

        axisLabel: {
          fontSize: 12,
          color: '#868D9C',
        },

        axisTick: {
          lineStyle: {
            color: 'rgba(229,231,236,1)',
          },
        },
      },

      yAxis: {
        type: 'value',
        show: true,
        splitNumber: 5,
        axisLine: {
          show: false,
        },

        axisLabel: {
          fontSize: 12,
          color: '#868D9C',
        },

        splitLine: {
          lineStyle: {
            color: '#E5E6EB',
            type: 'dashed',
          },
        },

        axisTick: {
          show: false,
        },
      },

      series: [
        {
          data,
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: {
            color,
            width: 2,
          },
        },
      ],
    };
  };

  /**
   * 渲染详情文本，对比 text 和 ruleDetailOrigin，高亮显示替换的字段
   * @param {string} text 翻译后的文本
   * @param {string} ruleDetailOrigin 原始规则文本
   */
  const renderDetailText = (text, ruleDetailOrigin) => {
    if (!text || !ruleDetailOrigin) {
      return <span> {text}</span>;
    }

    // 匹配原始文本中的英文字段变量（如 SRM_SSTA_SETTLE_LINE_paymentAmount）
    const variableRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    const staticParts = ruleDetailOrigin.split(variableRegex);

    if (staticParts.length === 1) {
      return <span>{text}</span>;
    }

    // 转义正则表达式特殊字符
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 使用静态部分构建正则表达式，提取 text 中的中文翻译字段
    const pattern = `^${staticParts.map(escapeRegExp).join('(.*?)')}$`;
    const match = text.match(new RegExp(pattern));

    if (!match) {
      return <span> {text}</span>;
    }

    const variables = match.slice(1);

    return (
      <span>
        {staticParts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < variables.length && (
              <span
                style={{
                  color: '#0161D5',
                  fontWeight: 600,
                }}
              >
                {variables[index]}
              </span>
            )}
          </React.Fragment>
        ))}
      </span>
    );
  };

  const handleFilterQueryAll = ({ dataSet, params }) => {
    const list = dataSet?.toData() ?? [];

    const obj = {
      ...list[0],
    };

    // eslint-disable-next-line camelcase
    const rangeTimeStr = params?.range_time_str || obj?.range_time_str || '';
    const startTime = rangeTimeStr ? rangeTimeStr.split(',')[0] ?? '' : '';
    const endTime = rangeTimeStr ? rangeTimeStr.split(',')[1] ?? '' : '';

    const docCodeList = obj?.documentCode || params?.documentCode || [];
    const categoryCodeList = obj?.categoryCode || params?.categoryCode || [];

    const param = {
      documentCode: docCodeList?.length ? docCodeList?.join(',') : '',
      categoryCode: categoryCodeList?.length ? categoryCodeList?.join(',') : '',
      startTime: startTime === 'null' ? '' : startTime,
      endTime: endTime === 'null' ? '' : endTime,
      range_time_str: rangeTimeStr,
      viewTimeRange: null,
    };

    commonParams = {
      ...param,
    };

    listDS.queryParameter = {
      ...param,
    };

    ruleRateListDS.queryParameter = {
      ...commonParams,
      rateType: 'pass',
    };

    ruleRateNotListDS.queryParameter = {
      ...commonParams,
      rateType: 'notPass',
    };

    getStatistics();
    listDS.query();
    ruleRateListDS.query();
    ruleRateNotListDS.query();
  };

  return (
    <div className={styles['ai-check-report']}>
      <Header title={intl.get('smbl.aiChekReport.view.title.report').d('智能审核统计报表')}>
        <div
          style={{
            width: 'calc(100vw - 500px)',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            className={classNames(styles['page-tab-item'], {
              [styles.active]: activeTab === 'overview',
            })}
            onClick={() => setActiveTab('overview')}
            style={{
              borderRadius: '2px 0 0 2px',
            }}
          >
            {intl.get('smbl.aiChekReport.view.title.overview').d('操作概况')}
          </div>
          <div
            className={classNames(styles['page-tab-item'], {
              [styles.active]: activeTab === 'detail',
            })}
            onClick={() => setActiveTab('detail')}
            style={{
              borderRadius: '0 2px 2px 0',
            }}
          >
            {intl.get('smbl.aiChekReport.view.title.ruleDetail').d('规则明细')}
          </div>
        </div>
        {activeTab === 'detail' ? (
          <ExcelExportPro
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              style: {
                border: 'none',
              },
            }}
            defaultSelectAll
            requestUrl={`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check/report-overview/export`}
            queryParams={{
              ...commonParams,
            }}
            buttonText={intl.get('hzero.common.components.excelExport.export').d('导出')}
          />
        ) : (
          <div
            style={{
              width: '70px',
            }}
          />
        )}
      </Header>
      <div className={styles['report-container']}>
        {/* 顶部统计卡片区域 */}
        {activeTab === 'overview' && (
          <>
            <div
              style={{
                padding: '16px',
                backgroundColor: '#fff',
                marginBottom: '8px',
              }}
            >
              <FilterBar
                dataSet={[listDS]}
                cacheState
                cacheKey="SMBL.AI_CHECK_RESULT_REPORT_OVERVIEW_FILTER"
                onQuery={handleFilterQueryAll}
                fields={[
                  {
                    label: intl.get('smbl.aiChekReport.model.statisticalPeriod').d('统计周期'),
                    name: 'viewTimeRange',
                    type: 'string',
                    display: true,
                    lock: true,
                    showDatePicker: true,
                    defaultValue: 'WEEK',
                    maxDate: new Date() - 86400000,
                  },

                  {
                    label: intl.get('smbl.aiChekReport.model.documentCode').d('流程单据编码'),
                    name: 'documentCodeObj',
                    display: true,
                    lock: true,
                    type: 'object',
                    lovCode: 'SMBL.AI_CHECK_DOCUMENT_LIST',
                    noCache: true,
                    valueField: 'documentId',
                    multiple: true,
                    editorProps: {
                      tableProps: {
                        columns: [
                          { name: 'documentCode', width: 250 },
                          { name: 'documentName', width: 250 },
                        ],
                      },
                    },
                  },

                  {
                    label: intl.get('smbl.aiChekReport.model.categoryCode').d('流程分类编码'),
                    name: 'categoryCodeObj',
                    type: 'object',
                    display: true,
                    lock: true,
                    lovCode: 'SMBL.AI_CHECK_CATEGORY_LIST',
                    noCache: true,
                    valueField: 'categoryId',
                    multiple: true,
                    editorProps: {
                      tableProps: {
                        columns: [
                          { name: 'categoryCode', width: 250 },
                          { name: 'categoryName', width: 250 },
                        ],
                      },
                    },
                  },
                ]}
              />
            </div>
            <div className={styles['ai-check-report-overview']}>
              <div
                style={{
                  marginBottom: '8px',
                }}
              >
                <div className={styles['statistics-cards']}>
                  <div className={styles['card-item']}>
                    <div className={styles['card-header']}>
                      <Tooltip
                        title={chartInfos.execCount?.title}
                        placement="topLeft"
                        theme="light"
                      >
                        <div className={styles['card-title']}>{chartInfos.execCount?.title}</div>
                      </Tooltip>
                      <div className={styles['card-value']}> {chartInfos.execCount?.value}</div>
                    </div>
                    <Divider />
                    <div ref={execCountRef} className={styles['chart-container']} />
                  </div>

                  <div className={styles['card-item']}>
                    <div className={styles['card-header']}>
                      <Tooltip title={chartInfos.docCount?.title} placement="topLeft" theme="light">
                        <div className={styles['card-title']}>{chartInfos.docCount?.title}</div>
                      </Tooltip>
                      <div className={styles['card-value']}> {chartInfos.docCount?.value}</div>
                    </div>
                    <Divider />
                    <div ref={docCountRef} className={styles['chart-container']} />
                  </div>

                  <div className={styles['card-item']}>
                    <div className={styles['card-header']}>
                      <Tooltip
                        title={chartInfos.ruleCount?.title}
                        placement="topLeft"
                        theme="light"
                      >
                        <div className={styles['card-title']}>{chartInfos.ruleCount?.title}</div>
                      </Tooltip>
                      <div className={styles['card-value']}> {chartInfos.ruleCount?.value}</div>
                    </div>
                    <Divider />
                    <div ref={ruleCountRef} className={styles['chart-container']} />
                  </div>

                  <div className={styles['card-item']}>
                    <div className={styles['card-header']}>
                      <Tooltip
                        title={chartInfos.avgTrigger?.title}
                        placement="topLeft"
                        theme="light"
                      >
                        <div className={styles['card-title']}>{chartInfos.avgTrigger?.title}</div>
                      </Tooltip>
                      <div className={styles['card-value']}> {chartInfos.avgTrigger?.value}</div>
                    </div>
                    <Divider />
                    <div ref={avgTriggerRef} className={styles['chart-container']} />
                  </div>

                  <div className={styles['card-item']}>
                    <div className={styles['card-header']}>
                      <Tooltip title={chartInfos.passRate?.title} placement="topLeft" theme="light">
                        <div className={styles['card-title']}>{chartInfos.passRate?.title}</div>
                      </Tooltip>
                      <div className={styles['card-value']}> {chartInfos.passRate?.value}</div>
                    </div>
                    <Divider />
                    <div ref={passRateRef} className={styles['chart-container']} />
                  </div>

                  <div className={styles['card-item']}>
                    <div className={styles['card-header']}>
                      <Tooltip title={chartInfos.inaccuracyRate?.title} placement="topLeft" theme="light">
                        <div className={styles['card-title']}>{chartInfos.inaccuracyRate?.title}</div>
                      </Tooltip>
                      <div className={styles['card-value']}> {chartInfos.inaccuracyRate?.value}</div>
                    </div>
                    <Divider />
                    <div ref={inaccuracyRateRef} className={styles['chart-container']} />
                  </div>
                </div>
                <div className={styles['table-container']}>
                  <Tabs defaultActiveKey="1">
                    <TabPane
                      tab={intl
                        .get('smbl.aiChekReport.view.label.failRateTab')
                        .d('不通过率最高的规则')}
                      key="1"
                    >
                      <div
                        style={{
                          maxHeight: '480px',
                        }}
                      >
                        <Table
                          dataSet={ruleRateNotListDS}
                          queryBar="none"
                          autoHeight={{ type: 'maxHeight', diff: 60 }}
                          customizable
                          customizedCode="SMBL.AI_CHECK_RESULT_REPORT_NOT_RATE_LIST"
                          style={{
                            marginTop: '8px',
                          }}
                        >
                          <Column name="documentName" width={150} />
                          <Column name="categoryName" width={180} />
                          <Column name="ruleCode" width={150} />
                          <Column name="ruleName" width={200} />
                          <Column name="rate" width={120} align="right" />
                          <Column
                            name="ruleDetail"
                            width={300}
                            tooltip="overflow"
                            renderer={({ text, record }) => {
                              const ruleDetailOrigin = record.get('ruleDetailOrigin');
                              return renderDetailText(text, ruleDetailOrigin);
                            }}
                          />
                        </Table>
                      </div>
                    </TabPane>
                    <TabPane
                      tab={intl
                        .get('smbl.aiChekReport.view.label.passRateTab')
                        .d('通过率最高的规则')}
                      key="2"
                    >
                      <div
                        style={{
                          maxHeight: '480px',
                        }}
                      >
                        <Table
                          dataSet={ruleRateListDS}
                          queryBar="none"
                          autoHeight={{ type: 'maxHeight', diff: 60 }}
                          customizable
                          customizedCode="SMBL.AI_CHECK_RESULT_REPORT_RATE_LIST"
                          style={{
                            marginTop: '8px',
                          }}
                        >
                          <Column name="documentName" width={150} />
                          <Column name="categoryName" width={180} />
                          <Column name="ruleCode" width={150} />
                          <Column name="ruleName" width={200} />
                          <Column name="rate" width={120} align="right" />
                          <Column
                            name="ruleDetail"
                            width={300}
                            tooltip="overflow"
                            renderer={({ text, record }) => {
                              const ruleDetailOrigin = record.get('ruleDetailOrigin');
                              return renderDetailText(text, ruleDetailOrigin);
                            }}
                          />
                        </Table>
                      </div>
                    </TabPane>
                  </Tabs>
                </div>
              </div>
            </div>
          </>
        )}
        {activeTab === 'detail' && <Detail listDS={listDS} />}
      </div>
    </div>
  );
};

export default compose(
  formatterCollections({
    code: ['smbl.aiChekReport'],
  }),
  withProps(
    () => {
      const listDS = new DataSet(ReportListDS());
      const ruleRateListDS = new DataSet(RuleRateListDS());
      const ruleRateNotListDS = new DataSet(RuleRateListDS());

      return {
        listDS,
        ruleRateListDS,
        ruleRateNotListDS,
      };
    },

    {
      cacheState: true,
      keepOriginDataSet: true,
    }
  )
)(AiChekReport);
