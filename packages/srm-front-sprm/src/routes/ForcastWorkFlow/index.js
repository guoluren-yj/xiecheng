import React, { Component, Fragment } from 'react';
import { Table, DataSet, Form, Output, Modal, Button } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import intl from 'utils/intl';

import { Header, Content } from 'components/Page';
import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { queryMapIdpValue } from 'services/api';
import formatterCollections from 'utils/intl/formatterCollections';

import { fetchTemplete } from '@/services/forecastTemplateDefOrgService.js';
import {
  wholeDs,
  tableDataSet,
  forecastDetailDs,
  operateRecordDs,
  historyVersionDs,
} from './store';
import Operation from './Operation';

@formatterCollections({
  code: [
    'sprm.common',
    'sprm.purchasePlatform',
    'hzero.common',
    'sprm.forecastMgt',
    'sprm.forecastWorkbench',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
  ],
})
export default class Index extends Component {
  constructor(props) {
    super(props);
    const {
      match: { params = {} },
    } = props;
    this.fcstSupplyHeaderId = params.fcstSupplyHeaderId || params.id;
    this.headerDs = new DataSet(wholeDs({ fcstSupplyHeaderId: this.fcstSupplyHeaderId }));
    this.operateLineDs = new DataSet(operateRecordDs());
    this.historyDs = new DataSet(historyVersionDs());

    this.lineDs = new DataSet(tableDataSet());
    this.state = {
      detailFeedbackFlag: 0,
      fields: [],
      dynamicColumnFields: [],
      loading: true,
      predictionDimensionCnf: 'QUANTITY',
    };
  }

  componentDidMount() {
    Promise.all([
      fetchTemplete({ fcstSupplyHeaderId: this.fcstSupplyHeaderId }),
      queryMapIdpValue({
        line: 'SPRM.FCST_CATEGORY',
      }),
    ]).then(res => {
      if (res) {
        const [fieldsRes, lines] = res;
        const fieldsData = getResponse(fieldsRes);
        const linesData = getResponse(lines);
        if (fieldsData && linesData) {
          this.historyDs.setQueryParameter('templateHeaderId', fieldsData?.templateHeaderId);
          const {
            fields = [],
            dynamicColumnFields = [],
            detailFeedbackFlag = 0,
            predictionDimensionCnf,
          } = fieldsData;
          // 处理下预测基本信息头字段展示
          const headerFileds = [];
          fields.forEach(ele => {
            if (ele.fcstFieldType === 'EXPAND' && ele.lovCode) {
              headerFileds.push({ ...ele, renderMeaning: `${ele.fieldCode}Meaning` });
            }
          });
          this.setState(
            {
              detailFeedbackFlag,
              predictionDimensionCnf,
              fields: fields.filter(
                ele =>
                  ![
                    'actionLine',
                    'customizeVersion',
                    'dynamicCol',
                    'sumQiantity',
                    'sumAmount',
                    'fcrtType',
                    'syncStatus',
                    'syncMsg',
                  ].includes(ele.fieldCode)
              ),
              dynamicColumnFields,
              line: linesData?.line || [],
            },
            () => {
              const { line = [] } = linesData;
              this.headerDs.query().then(data => {
                const { fcstLineSumMap = {}, fcstLineList = [] } = data || {};
                const othersLine = line?.map(lineKey => {
                  const { value: ele, meaning } = lineKey;
                  const resultTableData = {}; // 获取动态week,day,year的值
                  fcstLineList.forEach(i => {
                    const { fcstDate, fcstHeaderId, fcstLineId, fcstLineType } = i;
                    resultTableData[fcstDate] = i[ele];
                    resultTableData[`${fcstDate}Key`] = { fcstHeaderId, fcstLineId, fcstLineType };
                  });
                  return {
                    fcrtType: ele,
                    fcrtTypeMeaning: meaning,
                    ...resultTableData,
                    sumQiantity: fcstLineSumMap.sum ? fcstLineSumMap.sum[ele] : null,
                    sumAmount: fcstLineSumMap.sum ? fcstLineSumMap.sum[ele] : null,
                    sumByDay: fcstLineSumMap.sumByDay ? fcstLineSumMap.sumByDay[ele] : null,
                    sumByMonth: fcstLineSumMap.sumByMonth ? fcstLineSumMap.sumByMonth[ele] : null,
                    sumByWeek: fcstLineSumMap.sumByWeek ? fcstLineSumMap.sumByWeek[ele] : null,
                    sumByYear: fcstLineSumMap.sumByYear ? fcstLineSumMap.sumByYear[ele] : null,
                  };
                });
                this.setState({ loading: false });
                this.lineDs.loadData(othersLine);
              });
            }
          );
        }
      }
    });
  }

  columns = [
    { name: 'fcstDeliveryDate' },
    { name: 'fcstQuantity' },
    { name: 'purchaserRemark' },
    { name: 'feedbackDeliveryDate' },
    { name: 'feedbackQuantity' },
    { name: 'supplierRemark' },
    { name: 'enoughFlag', renderer: ({ value }) => yesOrNoRender(value) },
  ];

  handleEditModal = (record, name) => {
    const { fcstHeaderId, fcstLineId, fcstLineType } = record.get(`${name}Key`);
    const tableDs = new DataSet(
      forecastDetailDs({
        fcstHeaderId,
        fcstLineId,
      })
    );

    return Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 1080 },
      bodyStyle: { paddingTop: '16px' },
      title:
        fcstLineType === 'WEEK'
          ? intl.get(`sprm.forecastMgt.model.common.weekDetail`).d('周度预测详情')
          : intl.get(`sprm.forecastMgt.model.common.monthDetail`).d('月度预测详情'),
      children: (
        <Table
          dataSet={tableDs}
          style={{ maxHeight: 'calc(100vh - 250px)' }}
          columns={this.columns}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onCancel: () => {},
      footer: cancelBtn => <div>{cancelBtn}</div>,
    });
  };

  actionHistory = () => {
    const fcstHeaderId = this.headerDs.current.get('fcstHeaderId');
    this.operateLineDs.setQueryParameter('fcstHeaderId', fcstHeaderId);
    this.operateLineDs.query();
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 742 },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.operation`).d('操作记录'),
      children: <Operation operateLineDs={this.operateLineDs} fcstHeaderId={fcstHeaderId} />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: okBtn => okBtn,
    });
  };

  handleHistory = () => {
    const {
      dynamicColumnFields = [],
      detailFeedbackFlag = 0,
      predictionDimensionCnf,
      line = [],
    } = this.state;
    const { fcstHeaderId, fcstStartDate, version } = this.headerDs.current.get([
      'fcstHeaderId',
      'version',
      'fcstStartDate',
    ]);
    const resultTableData = {}; // 获取动态week,day,year的值
    const newRes = [];
    this.historyDs.setQueryParameter('fcstHeaderId', fcstHeaderId);
    this.historyDs.setQueryParameter('version', version);
    this.historyDs.setQueryParameter('queryDate', fcstStartDate.format(DEFAULT_DATE_FORMAT));
    this.historyDs.query().then(result => {
      result.forEach(item => {
        const { fcstLineSumMap = {}, fcstLineVerList = [], changeFieldLineMap = {} } = item;
        const othersLine = line?.map(({ value: ele, meaning }) => {
          fcstLineVerList.forEach(i => {
            const { fcstDate, fcstLineId, fcstLineType } = i;
            resultTableData[fcstDate] = i[ele];
            resultTableData[`${fcstDate}Key`] = { fcstHeaderId, fcstLineId, fcstLineType };
            const changeLine = changeFieldLineMap[fcstDate];
            const changedKey = changeLine ? changeLine.find(e => e.fieldName === ele) : undefined;
            if (changedKey && ['fcstQuantity', 'feedbackQuantity'].includes(ele)) {
              resultTableData[`${fcstDate}Color`] =
                changedKey && ele !== 'diffQiantity' ? String(changedKey.oldValue || 'null') : null;
            } else {
              resultTableData[`${fcstDate}Color`] = undefined;
            }
          });
          return {
            ...item,
            fcstHeaderId,
            fcrtType: ele,
            fcrtTypeMeaning: meaning,
            ...resultTableData,
            sumQiantity: fcstLineSumMap.sum ? fcstLineSumMap.sum[ele] : null,
            sumByDay: fcstLineSumMap.sumByDay ? fcstLineSumMap.sumByDay[ele] : null,
            sumByMonth: fcstLineSumMap.sumByMonth ? fcstLineSumMap.sumByMonth[ele] : null,
            sumByWeek: fcstLineSumMap.sumByWeek ? fcstLineSumMap.sumByWeek[ele] : null,
            sumByYear: fcstLineSumMap.sumByYear ? fcstLineSumMap.sumByYear[ele] : null,
          };
        });
        newRes.push(...othersLine);
      });

      this.historyDs.loadData(newRes);
    });

    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 742 },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.versionRecord`).d('版本记录'),
      children: (
        <Table
          dataSet={this.historyDs}
          columns={dynamicColumnFields
            ?.map(ele => ({
              name: ele.fieldCode,
              header: ele.fieldName,
              renderer: ({ record, text, name }) =>
                ['WEEK', 'MONTH'].includes(ele.fcstLineType) && detailFeedbackFlag ? (
                  <a
                    onClick={() => {
                      this.handleEditModal(record, name);
                    }}
                  >
                    {text}
                  </a>
                ) : (
                  text
                ),
            }))
            .concat([
              {
                name: 'version',
                lock: 'left',
                width: 60,
              },
              {
                name: 'fcrtType',
                lock: 'left',
                renderer: ({ record }) => record.get('fcrtTypeMeaning'),
              },
              predictionDimensionCnf !== 'QUANTITY'
                ? { name: 'sumAmount', lock: 'left' }
                : { name: 'sumQiantity', lock: 'left' },
            ])}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: okBtn => okBtn,
    });
  };

  render() {
    const {
      fields = [],
      dynamicColumnFields = [],
      detailFeedbackFlag = 0,
      predictionDimensionCnf = 'QUANTITY',
      loading = true,
    } = this.state;
    return (
      <Fragment>
        <Spin spinning={loading}>
          <Header
            title={intl.get('sprm.forecastMgt.model.common.forecastBackApprove').d('预测反馈审批')}
          >
            <Button
              color="primary"
              type="c7n-pro"
              funcType="raised"
              onClick={() => this.actionHistory()}
            >
              {intl.get(`hzero.common.button.operating`).d('操作记录')}
            </Button>
            <Button type="c7n-pro" funcType="flat" onClick={() => this.handleHistory()}>
              {intl.get(`hzero.common.button.versionRecord`).d('版本记录')}
            </Button>
          </Header>
          <Content>
            <h3 style={{ paddingBottom: '16px' }}>
              {intl.get('sprm.forecastMgt.model.workFlow.baseHeader').d('预测基本信息')}
            </h3>
            <Form
              dataSet={this.headerDs}
              columns={3}
              useColon={false}
              labelLayout="vertical"
              className="c7n-pro-vertical-form-display"
            >
              {fields?.map(ele => (
                <Output
                  name={ele.fieldCode}
                  label={ele.fieldName}
                  renderer={({ record, text }) => {
                    if (ele.fieldCode === 'supplierId') {
                      return (
                        <span>
                          {record?.get('supplierCode') || record?.get('supplierCompanyNum')}
                        </span>
                      );
                    } else if (ele.fieldCode === 'supplierName') {
                      return (
                        <span>
                          {record?.get('supplierName') || record?.get('supplierCompanyName')}
                        </span>
                      );
                    } else {
                      return (
                        <span>
                          {ele.renderMeaning ? record.get(ele.renderMeaning) || text : text}
                        </span>
                      );
                    }
                  }}
                />
              ))}
            </Form>
          </Content>
          <Content>
            <h3 style={{ paddingBottom: '16px' }}>
              {intl.get('sprm.forecastMgt.model.workFlow.tableTitle').d('预测明细信息')}
            </h3>
            <Table
              dataSet={this.lineDs}
              columns={dynamicColumnFields
                ?.map(ele => ({
                  name: ele.fieldCode,
                  header: ele.fieldName,
                  renderer: ({ record, text, name }) =>
                    ['WEEK', 'MONTH'].includes(ele.fcstLineType) && detailFeedbackFlag ? (
                      <a
                        onClick={() => {
                          this.handleEditModal(record, name);
                        }}
                      >
                        {text}
                      </a>
                    ) : (
                      text
                    ),
                }))
                .concat([
                  { name: 'fcrtType', lock: 'left' },
                  predictionDimensionCnf === 'QUANTITY'
                    ? { name: 'sumQiantity', lock: 'left' }
                    : { name: 'sumAmount', lock: 'left' },
                ])}
            />
          </Content>
        </Spin>
      </Fragment>
    );
  }
}
