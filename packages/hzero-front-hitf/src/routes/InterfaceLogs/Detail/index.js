/*
 * Detail - 接口监控详情
 * @date: 2018/09/17 15:40:00
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { DataSet, Form, Output, Spin, Button } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import JsonArea from 'react-json-view';
import { Bind } from 'lodash-decorators';
import queryString from 'query-string';
import { Content, Header } from 'hzero-front/lib/components/Page';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import {
  DETAIL_CARD_CLASSNAME,
  DETAIL_CARD_TABLE_CLASSNAME,
} from 'hzero-front/lib/utils/constants';
import { camelCase } from 'lodash';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { downloadFile } from 'hzero-front/lib/services/api';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import getLang from '@/langs/interfaceLogLang';
import { interfaceLogFormDS } from '@/stores/InterfaceLog/InterfaceLogDS';
import styles from './index.less';

function buildMultiLine(arr, key) {
  const lineSepChar = `
`;
  return arr
    .map((r) => {
      if (r[key]) {
        return r[key].split('\n').join(lineSepChar);
      } else {
        return lineSepChar;
      }
    })
    .join(lineSepChar);
}

@formatterCollections({ code: ['hzero.common', 'hitf.interfaceLogs'] })
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    this.interfaceLogFormDS = new DataSet(
      interfaceLogFormDS({
        onLoad: this.handleLoad,
      })
    );
    this.state = {
      stacktraceList: '',
      interfaceLogDtlList: [],
      interfaceRespLoading: false,
      respLoading: false,
      interfaceReqLoading: false,
      reqLoading: false,
    };
  }

  componentDidMount() {
    this.fetchDetail();
  }

  @Bind()
  fetchDetail() {
    const {
      match: { params },
    } = this.props;
    const { interfaceLogId } = params;
    this.interfaceLogFormDS.setQueryParameter('interfaceLogId', interfaceLogId);
    this.interfaceLogFormDS.query();
  }

  @Bind()
  handleLoad({ dataSet }) {
    const { interfaceLogDtlList } = dataSet.records[0]?.toData();
    if (interfaceLogDtlList && interfaceLogDtlList.length) {
      const stacktraceList = buildMultiLine(interfaceLogDtlList, 'stacktrace');
      this.setState({ stacktraceList, interfaceLogDtlList });
    }
  }

  /**
   * JSON字符串转换为json格式
   */
  handleParse(response) {
    let data = '';
    try {
      data = JSON.parse(response || '{}');
    } catch (error) {
      data = {
        error: getLang('TRANSLATE_ERROR'),
      };
    }
    return data;
  }

  async handleDownload(sourceType) {
    const loadingName = `${camelCase(sourceType)}Loading`;
    this.setState({ [loadingName]: true });
    await downloadFile({
      requestUrl: isTenantRoleLevel()
        ? `${HZERO_HITF}/v1/${getCurrentOrganizationId()}/interface-logs/download`
        : `${HZERO_HITF}/v1/interface-logs/download`,
      method: 'GET',
      queryParams: [
        {
          name: 'logId',
          value: this.interfaceLogFormDS.current.get('interfaceLogId'),
        },
        {
          name: 'type',
          value: sourceType,
        },
      ],
    });
    this.setState({ [loadingName]: false });
  }

  render() {
    const {
      location: { search, pathname },
    } = this.props;
    const {
      stacktraceList,
      interfaceLogDtlList,
      interfaceRespLoading,
      respLoading,
      interfaceReqLoading,
      reqLoading,
    } = this.state;
    const { access_token: accessToken } = queryString.parse(search.substring(1));
    const basePath = '/hitf/interface-logs';
    const {
      respDownload,
      interfaceRespDownload,
      reqDownload,
      interfaceReqDownload,
      interfaceReqBodyParam,
      interfaceRespContent,
      reqBodyParam,
      respContent,
    } = interfaceLogDtlList[0] || {};

    const commonSetting = {
      name: null,
      displayDataTypes: false,
      collapseStringsAfterLength: 3000,
    };

    const reqParamProps = {
      ...commonSetting,
      src: this.handleParse(interfaceReqBodyParam),
    };

    const respProps = {
      ...commonSetting,
      src: this.handleParse(interfaceRespContent),
    };

    const reqBodyParamProps = {
      ...commonSetting,
      src: this.handleParse(reqBodyParam),
    };

    const respContentProps = {
      ...commonSetting,
      src: this.handleParse(respContent),
    };

    return (
      <>
        <Header
          title={getLang('DETAIL')}
          backPath={
            pathname.indexOf('/private') === 0
              ? `/private${basePath}/list?access_token=${accessToken}`
              : `${basePath}/list`
          }
        />
        <Content>
          <Spin dataSet={this.interfaceLogFormDS}>
            <Card
              key="interface-logs-basic"
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={<h3>{getLang('BASIC_MESSAGE')}</h3>}
            >
              <Form
                dataSet={this.interfaceLogFormDS}
                columns={3}
                labelWidth={160}
                labelAlign="left"
              >
                <Output name="invokeKey" />
                <Output name="serverCode" />
                <Output name="serverName" />
                <Output name="interfaceCode" />
                <Output name="interfaceName" />
                <Output name="clientId" />
                <Output name="interfaceRequestTime" />
                <Output name="ip" />
                <Output name="requestMethod" />
                <Output name="responseTime" />
                <Output name="interfaceResponseTime" />
                <Output name="interfaceType" />
                <Output name="interfaceUrl" colSpan={2} />
                <Output name="responseStatus" />
                <Output name="asyncFlag" />
                <Output name="formatInterfaceServerVersion" />
                <Output name="formatInterfaceVersion" />
                <Output name="userAgent" colSpan={2} />
                <Output name="referer" />
              </Form>
            </Card>
            <Card
              key="req-param-json"
              bordered={false}
              className={DETAIL_CARD_TABLE_CLASSNAME}
              title={<h3>{getLang('REQ_PARAM')}</h3>}
            >
              {interfaceReqDownload ? (
                <Form dataSet={this.interfaceLogFormDS} labelWidth={250} labelAlign="left">
                  <Output
                    name="_download"
                    renderer={() => (
                      <Button
                        color="primary"
                        loading={interfaceReqLoading}
                        onClick={() => this.handleDownload('INTERFACE_REQ')}
                      >
                        {getLang('DOWNLOAD')}
                      </Button>
                    )}
                  />
                </Form>
              ) : (
                <div className={styles['json-area']}>
                  <JsonArea {...reqParamProps} />
                </div>
              )}
            </Card>
            <Card
              key="resp-json"
              bordered={false}
              className={DETAIL_CARD_TABLE_CLASSNAME}
              title={<h3>{getLang('RESP')}</h3>}
            >
              {interfaceRespDownload ? (
                <Form dataSet={this.interfaceLogFormDS} labelWidth={250} labelAlign="left">
                  <Output
                    name="_download"
                    renderer={() => (
                      <Button
                        color="primary"
                        loading={interfaceRespLoading}
                        onClick={() => this.handleDownload('INTERFACE_RESP')}
                      >
                        {getLang('DOWNLOAD')}
                      </Button>
                    )}
                  />
                </Form>
              ) : (
                <div className={styles['json-area']}>
                  <JsonArea {...respProps} />
                </div>
              )}
            </Card>
            <Card
              key="req-body-param-json"
              bordered={false}
              className={DETAIL_CARD_TABLE_CLASSNAME}
              title={<h3>{getLang('REQ_BODY_PARAM')}</h3>}
            >
              {reqDownload ? (
                <Form dataSet={this.interfaceLogFormDS} labelWidth={250} labelAlign="left">
                  <Output
                    name="_download"
                    renderer={() => (
                      <Button
                        color="primary"
                        loading={reqLoading}
                        onClick={() => this.handleDownload('REQ')}
                      >
                        {getLang('DOWNLOAD')}
                      </Button>
                    )}
                  />
                </Form>
              ) : (
                <div className={styles['json-area']}>
                  <JsonArea {...reqBodyParamProps} />
                </div>
              )}
            </Card>
            <Card
              key="resp-content-json"
              bordered={false}
              className={DETAIL_CARD_TABLE_CLASSNAME}
              title={<h3>{getLang('RESP_CONETNT')}</h3>}
            >
              {respDownload ? (
                <Form dataSet={this.interfaceLogFormDS} labelWidth={250} labelAlign="left">
                  <Output
                    name="_download"
                    renderer={() => (
                      <Button
                        color="primary"
                        loading={respLoading}
                        onClick={() => this.handleDownload('RESP')}
                      >
                        {getLang('DOWNLOAD')}
                      </Button>
                    )}
                  />
                </Form>
              ) : (
                <div className={styles['json-area']}>
                  <JsonArea {...respContentProps} />
                </div>
              )}
            </Card>
            <Card
              key="interface-logs-error"
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={<h3>{getLang('STACK_TRACE_MESSAGE')}</h3>}
            >
              <pre className={styles['multi-line-information-exception']}>{stacktraceList}</pre>
            </Card>
          </Spin>
        </Content>
      </>
    );
  }
}
