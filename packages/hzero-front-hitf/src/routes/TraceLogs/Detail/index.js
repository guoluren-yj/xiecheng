/**
 * TraceLogs - 日志记详情
 * @date: 2020-07-09
 * @author: he.chen@hand-china.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { DataSet, Form, Spin, Output, Button } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { Header, Content } from 'hzero-front/lib/components/Page';
import JsonArea from 'react-json-view';
import { DETAIL_CARD_CLASSNAME } from 'hzero-front/lib/utils/constants';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { downloadFile } from 'hzero-front/lib/services/api';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import getLang from '@/langs/traceLogsLang';
import { formDS } from '@/stores/TraceLogs/TraceLogDetailDS';
import styles from '../index.less';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
export default class Detail extends Component {
  constructor(props) {
    super(props);

    this.formDS = new DataSet(formDS());
    this.state = {
      traceLogDtl: {
        errorStack: '',
        mappingTraceContent: '',
      },
      respLoading: false,
    };
  }

  componentDidMount() {
    this.handleFetchDetail();
  }

  /**
   * 查询详情
   * 是否外围系统访问
   * 外围系统访问的路由： /hitf/trace-logs/outer-detail/:invokeKey
   * 本系统： /hitf/trace-logs/detail/:traceLogId
   */
  async handleFetchDetail() {
    const {
      match: { params },
    } = this.props;
    const { traceLogId, invokeKey } = params;
    if (traceLogId) {
      this.formDS.setQueryParameter('traceLogId', traceLogId);
    } else if (invokeKey) {
      this.formDS.setQueryParameter('invokeKey', invokeKey);
    }
    const res = await this.formDS.query();
    const { traceLogDtl } = res;
    this.setState({
      traceLogDtl,
    });
  }

  /**
   * JSON字符串转换为json格式
   */
  handleParse(response) {
    let data = '';
    try {
      data = JSON.parse(response || '{}');
    } catch (error) {
      data = { error: getLang('TRANSLATE_ERROR') };
    }
    return data;
  }

  async handleDownload() {
    const { traceLogDtl = {} } = this.state;
    const { traceLogId } = traceLogDtl;
    this.setState({ respLoading: true });
    await downloadFile({
      requestUrl: isTenantRoleLevel()
        ? `${HZERO_HITF}/v1/${getCurrentOrganizationId()}/trace-logs/download`
        : `${HZERO_HITF}/v1/trace-logs/download`,
      method: 'GET',
      queryParams: [
        {
          name: 'logId',
          value: traceLogId,
        },
      ],
    });
    this.setState({ respLoading: false });
  }

  render() {
    const {
      match: { params },
    } = this.props;
    const { respLoading, traceLogDtl = {} } = this.state;
    const { invokeKey } = params;
    let stacktraceList = '';
    let reqParam = '';
    let respContent = '';
    let mappingTraceList = '';
    if (traceLogDtl) {
      stacktraceList = traceLogDtl.errorStack;
      reqParam = traceLogDtl.reqBodyParam;
      // eslint-disable-next-line prefer-destructuring
      respContent = traceLogDtl.respContent;
      mappingTraceList = traceLogDtl.mappingTraceContent;
    }
    const { respDownload } = traceLogDtl;
    const commonSetting = {
      name: null,
      displayDataTypes: false,
      collapseStringsAfterLength: 3000,
    };

    const reqParamProps = {
      ...commonSetting,
      src: this.handleParse(reqParam),
    };

    const respProps = {
      ...commonSetting,
      src: this.handleParse(respContent),
    };

    return (
      <>
        <Header
          title={getLang('TRACE_LOG_DETAIL')}
          backPath={invokeKey ? null : '/hitf/trace-logs/list'}
        />
        <Content>
          <Spin dataSet={this.formDS}>
            <Card
              key="interface-logs-basic"
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={<h3>{getLang('BASE_MESSAGE')}</h3>}
            >
              <Form dataSet={this.formDS} columns={3}>
                <Output name="invokeKey" />
                <Output name="sourceCode" />
                <Output name="sourceName" />
                <Output name="clientName" />
                <Output name="sourceTypeMeaning" />
                <Output name="sourceSystem" />
                <Output name="requestTime" />
                <Output name="requestUrl" colSpan={2} />
                <Output name="requestMethodMeaning" />
                <Output name="ip" />
                <Output name="responseTime" />
                <Output name="responseStatusMeaning" />
                <Output name="batchNum" />
                <Output name="sourceDocumentNum" />
                <Output name="sourceDocumentIdStr" />
                <Output name="businessStateMeaning" />
                <Output name="asyncFlagMeaning" />
                <Output name="reqParamModifyFlagMeaning" />
                <Output name="referer" colSpan={2} />
                <Output name="userAgent" colSpan={2} />
              </Form>
            </Card>
            <Card
              key="req-param-json"
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={<h3>{getLang('REQ_PARAM')}</h3>}
            >
              <JsonArea {...reqParamProps} />
            </Card>
            <Card
              key="resp-content-json"
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={<h3>{getLang('RESP_CONTENT')}</h3>}
            >
              {respDownload ? (
                <Form dataSet={this.formDS} labelWidth={250} labelAlign="left">
                  <Output
                    name="_download"
                    renderer={() => (
                      <Button
                        color="primary"
                        loading={respLoading}
                        onClick={() => this.handleDownload()}
                      >
                        {getLang('DOWNLOAD')}
                      </Button>
                    )}
                  />
                </Form>
              ) : (
                <JsonArea {...respProps} />
              )}
            </Card>
            <Card
              key="trace-logs-error"
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={<h3>{getLang('ERROR_STACK')}</h3>}
            >
              <pre className={styles['multi-line-information-exception']}>{stacktraceList}</pre>
            </Card>
            <Card
              key="mapping-trace-info"
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={<h3>{getLang('MAPPING_TRACE_CONTENT')}</h3>}
            >
              <pre className={styles['multi-line-information-exception']}>{mappingTraceList}</pre>
            </Card>
          </Spin>
        </Content>
      </>
    );
  }
}
