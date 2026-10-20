import React, { Component } from 'react';
import { getResponse } from 'utils/utils';
import { Spin, DataSet, Form, Output, Attachment, Row, Col } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import intl from 'utils/intl';

import { fetchApproveDetail } from '@/services/riskWorkPlaceService';

// import CommonDetail from '../RiskControlWorkbench/CommonDetail';
import CommonDetail from './CommonDetail';
import { DisposalDS, AttachmentDS } from './stores/riskControlDS';
import styles from './index.less';

@connect((state) => state)
@formatterCollections({ code: ['sdat.riskControl', 'sdat.monitorStuff', 'sdat.riskDefinition'] })
export default class index extends Component {
  constructor(props) {
    super(props);
    this.disposalDS = new DataSet({ ...DisposalDS() }); // 风险凭证处置信息
    this.attachmentDS = new DataSet({ ...AttachmentDS() });

    this.state = {
      loading: false,
      details: {},
      indexCode: '',
      eventData: {},
      processAction: '',
    };
  }

  componentDidMount() {
    const riskProcessId = this.props?.match?.params?.riskProcessId ?? '';
    this.fetchData(riskProcessId);
  }

  fetchData = (id) => {
    this.setState({ loading: true });

    fetchApproveDetail({ riskProcessId: id }).then((res) => {
      this.setState({ loading: false });
      if (getResponse(res)) {
        const obj = res || {};
        const { workbenchData = {}, eventUuid } = obj;

        const processActionStr = obj.processAction || '';
        delete obj.processAction;

        this.disposalDS.create(
          {
            ...obj,
            processAction: processActionStr.split(','),
          },
          0
        );

        this.attachmentDS.loadData([{ attachmentUuid: eventUuid }]);

        this.setState({
          details: workbenchData?.detail ?? {
            eventName: obj?.workbenchData?.eventName ?? '',
            eventTime: obj?.eventTime ?? '',
            eventLevel: obj?.eventLevel ?? '',
            dimension: obj?.dimension ?? '',
          },
          indexCode: workbenchData?.indexCode ?? '-1',
          eventData: workbenchData && obj ? { ...workbenchData, ...obj } : {},
          processAction: processActionStr,
        });
      }
    });
  };

  render() {
    const { loading, details = {}, indexCode = '', eventData, processAction } = this.state;

    const label =
      processAction === 'RISK_BROADCAST'
        ? intl.get(`sdat.riskDefinition.model.broadcastAttach`).d('风险广播附件')
        : intl.get(`sdat.riskDefinition.model.dealWithAttach`).d('处置附件');

    const reasonLabel =
      processAction === 'RISK_BROADCAST'
        ? intl.get(`sdat.riskControl.model.broadcastContent`).d('广播内容')
        : intl.get(`sdat.riskControl.model.disposalReason`).d('处置理由');

    const cardTitle =
      processAction === 'RISK_BROADCAST'
        ? intl.get(`sdat.riskControl.model.broadcastContent`).d('广播内容')
        : intl.get(`sdat.riskControl.model.disposalInfo`).d('处置信息');

    return (
      <Spin spinning={loading}>
        <div style={{ backgroundColor: '#f4f5f7', padding: '8px' }}>
          {details && Object.keys(details).length ? (
            <div>
              <CommonDetail
                showCommon
                detail={details}
                dimensionCode={indexCode}
                localRecord={eventData}
              />
            </div>
          ) : null}

          <div
            style={{ marginTop: '8px', padding: '16px', backgroundColor: '#fff' }}
            className={processAction === 'RISK_BROADCAST' ? styles['approve-form-basic'] : ''}
          >
            {processAction !== 'RISK_BROADCAST' ? (
              <div
                style={{
                  color: '#1d2129',
                  fontSize: '14px',
                  marginBottom: '8px',
                  fontWeight: '600',
                  lineHeight: '18px',
                }}
              >
                {cardTitle}
              </div>
            ) : null}
            <Form dataSet={this.disposalDS} columns={3} labelLayout="float">
              {processAction === 'RISK_BROADCAST' ? null : <Output name="processAction" disabled />}
              {processAction === 'RISK_BROADCAST' ? null : (
                <Output name="processFeedback" disabled />
              )}
              <Output name="processReason" disabled colSpan={3} label={reasonLabel} />
            </Form>
          </div>

          <div style={{ marginTop: '8px', padding: '16px', backgroundColor: '#fff' }}>
            <div
              style={{
                color: '#1d2129',
                fontSize: '14px',
                marginBottom: '8px',
                fontWeight: '600',
                lineHeight: '18px',
              }}
            >
              {intl.get('sdat.riskControl.view.title.attachment').d('附件')}
            </div>
            <Row>
              <Col span={12} style={{ paddingRight: '16px' }}>
                <Form dataSet={this.attachmentDS} columns={1} labelLayout="float">
                  <Attachment name="attachmentUuid" sortable={false} readOnly />
                </Form>
              </Col>
              <Col span={12}>
                <Form dataSet={this.disposalDS} columns={1} labelLayout="float">
                  <Attachment name="attachmentUuid" sortable={false} readOnly label={label} />
                </Form>
              </Col>
            </Row>
          </div>
        </div>
      </Spin>
    );
  }
}
