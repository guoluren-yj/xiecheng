/**
 * DocumentView - 文档预览
 * @date: 2019/6/13
 * @author: hulingfangzi <lingfangzi.hu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Spin, Table, Tag } from 'hzero-ui';
import { isUndefined, isEmpty, groupBy } from 'lodash';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/javascript/javascript'; // javascript/json 样式
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import querystring from 'querystring';
import styles from './index.less';

/**
 * 文档预览
 * @extends {Component} - React.Component
 * @reactProps {object} services - 数据源
 * @reactProps {boolean} loading - 文档加载标志
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ services, loading }) => ({
  services,
  loading: loading.effects['services/queryViewData'] || loading.effects['services/queryMimeTypes'],
}))
@formatterCollections({ code: ['hzero.common', 'hitf.services', 'hitf.document'] })
export default class DocumentView extends Component {
  componentDidMount() {
    this.handleSearch();
    this.handleQueryMimeTypes();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'services/updateState',
      payload: {
        viewData: {},
      },
    });
  }

  // 查询mimeTypes
  @Bind()
  handleQueryMimeTypes() {
    const { dispatch } = this.props;
    dispatch({
      type: 'services/queryMimeTypes',
    });
  }

  /**
   * 查询文档预览数据
   */
  @Bind()
  handleSearch() {
    const { dispatch, loading, location } = this.props;
    const params = querystring.parse(location.search.substring(1));
    if (loading) {
      return;
    }
    if (!isUndefined(params)) {
      dispatch({
        type: 'services/queryViewData',
        payload: params,
      });
    }
  }

  render() {
    const {
      services: { viewData = {}, mimeTypes },
      loading = false,
    } = this.props;
    const respMimeTypes = !isEmpty(mimeTypes) && mimeTypes.slice(0, 3);
    const requestParamsAll = viewData.documentParamDTO && viewData.documentParamDTO.request;
    const responseParamsAll = viewData.documentParamDTO && viewData.documentParamDTO.response;
    const documentData = !isEmpty(viewData) && viewData.document;
    const interfacesDetail = !isEmpty(viewData) && viewData.interfacesDetail;
    const interfaceAuth = !isEmpty(viewData) && viewData.interfaceAuth;
    const requestDemoString = !isEmpty(viewData) && viewData.requestDemoString;
    let bodyData = {};
    let respBodyData = {};
    let handledReqMimeType = 'multipart/form-data';
    let handledRespMimeType = 'text/xml';
    let resRawType = 'text/plain';
    let respRawType = 'text/plain';

    if (requestParamsAll && requestParamsAll.BODY) {
      bodyData = groupBy(requestParamsAll.BODY, 'mimeType');
    }
    if (responseParamsAll && responseParamsAll.BODY) {
      respBodyData = groupBy(responseParamsAll.BODY, 'mimeType');
    }
    if (documentData.reqMimeType) {
      if (mimeTypes && mimeTypes.find((item) => item.meaning === documentData.reqMimeType)) {
        handledReqMimeType = documentData.reqMimeType;
      } else {
        handledReqMimeType = 'raw';
        resRawType = documentData.reqMimeType;
      }
    }

    if (documentData.respMimeType) {
      if (
        respMimeTypes.length &&
        respMimeTypes.find((item) => item.meaning === documentData.respMimeType)
      ) {
        handledRespMimeType = documentData.respMimeType;
      } else {
        handledRespMimeType = 'raw';
        respRawType = documentData.respMimeType;
      }
    }
    const partStyle = {
      marginTop: '20px',
    };
    const headerParams = [
      {
        title: intl.get('hitf.services.model.services.param').d('参数'),
        dataIndex: 'paramName',
        width: '40%',
      },
      {
        title: intl.get('hitf.services.model.services.defaultValue').d('默认值'),
        dataIndex: 'defaultValue',
      },
    ];
    const paramsColumns = [
      {
        title: intl.get('hitf.services.model.services.paramName').d('参数名'),
        dataIndex: 'paramName',
        width: 200,
      },
      {
        title: intl.get('hitf.services.model.services.requiredFlag').d('是否必填'),
        dataIndex: 'requiredFlag',
        width: 100,
        render: (text) =>
          text ? intl.get('hzero.common.status.yes') : intl.get('hzero.common.status.no'),
      },
      {
        title: intl.get('hitf.services.model.services.formatRegexp').d('格式限制'),
        dataIndex: 'formatRegexp',
        width: 150,
      },
      {
        title: intl.get('hzero.common.explain').d('说明'),
        dataIndex: 'remark',
      },
      {
        title: intl.get('hitf.services.model.services.demo').d('示例'),
        dataIndex: 'valueDemo',
        width: 150,
      },
    ];
    const alternativeColumn = [
      {
        title: intl.get('hitf.document.view.title.alternative').d('备选值'),
        render: (_, record) => {
          if (record.documentParamValueList && record.documentParamValueList.length) {
            return (
              <ul className={styles.alternative}>
                {record.documentParamValueList.map(
                  ({ paramValue, remark, defaultFlag, paramValueId }) => (
                    <li key={paramValueId}>
                      {' '}
                      <Tag color="blue">{paramValue}</Tag>
                      <span>{remark}</span>
                      {!!defaultFlag && (
                        <span style={{ marginLeft: '8px' }}>
                          {intl.get('hitf.document.view.message.default').d('默认')}
                        </span>
                      )}
                    </li>
                  )
                )}
              </ul>
            );
          }
        },
      },
    ];
    const httpStatusColumns = [
      {
        title: intl.get('hitf.services.model.services.httpStatusCode').d('状态码'),
        dataIndex: 'httpStatusCode',
        width: 80,
      },
      {
        title: intl.get('hitf.services.model.services.httpStatusMeaning').d('含义'),
        dataIndex: 'httpStatusMeaning',
        width: 380,
      },
      {
        title: intl.get('hitf.services.model.services.httpStatusSample').d('举例'),
        dataIndex: 'httpStatusSample',
        render: (value) => {
          let contents = value;
          if (value) {
            contents = [];
            const msgList = value.split('\n');
            msgList.forEach((item, index) => {
              contents.push(
                <div style={{ paddingBottom: index < msgList.length - 1 ? '3px' : 0 }}>{item}</div>
              );
            });
          }
          return <div>{contents}</div>;
        },
      },
    ];
    const httpStatusDataSource = [
      {
        httpStatusCode: '1xx',
        httpStatusMeaning: '(Informational) 信息性状态码，表示正在处理。',
      },
      {
        httpStatusCode: '2xx',
        httpStatusMeaning: '(Success) 成功状态码，表示请求正常。',
        httpStatusSample: `200: ok 请求被成功处理。
        204: No Content 该状态码表示服务器接收到的请求已经处理完毕，但是服务器不需要返回响应体。
        206: Partial Content 该状态码表示客户端进行了范围请求，而服务器成功执行了这部分的GET请求。`,
      },
      {
        httpStatusCode: '3xx',
        httpStatusMeaning: '(Redirection) 重定向状态码，表示客户端需要进行附加操作。',
        httpStatusSample: `301: Moved Permanently 永久性重定向。
        302: Found 临时性重定向`,
      },
      {
        httpStatusCode: '4xx',
        httpStatusMeaning: '(Client Error) 客户端错误状态码，表示服务器无法处理请求。',
        httpStatusSample: `400: Bad Request 指出客户端请求中的语法错误。
        401: Unauthorized 该状态码表示发送的请求需要有认证。
        403: Forbidden 该状态码表明对请求资源的访问被服务器拒绝了。
        404: Not Found 该状态码表明服务器上无法找到指定的资源。`,
      },
      {
        httpStatusCode: '5xx',
        httpStatusMeaning: '(Server Error) 服务器错误状态码，表示服务器处理请求出错。',
        httpStatusSample: `500: Internal Server Error 该状态码表明服务器端在执行请求时发生了错误。
        502: Bad Gateway 该状态码表明服务器网关错误。
        503: Service Unavailable 该状态码表明服务器暂时处于超负载或正在进行停机维护，现在无法处理请求。`,
      },
    ];
    return (
      <>
        <Header
          title={
            documentData.documentName || intl.get('hitf.document.view.title.document').d('接口文档')
          }
        />
        <Content>
          <Spin spinning={loading}>
            <div className={styles['hitf-view-modal']}>
              {documentData.remark && (
                <>
                  <h1>{intl.get('hitf.document.view.message.introduction').d('简介')}</h1>
                  <p dangerouslySetInnerHTML={{ __html: `${documentData.remark}` }} />
                </>
              )}
              <h1>{intl.get('hitf.document.view.message.platform.info').d('平台API信息')}</h1>
              <div>
                <h2>{intl.get('hitf.document.view.message.auth').d('认证方式')}</h2>
                <ul>
                  {interfaceAuth && interfaceAuth.authType && (
                    <li>
                      <span>
                        {intl.get('hitf.services.model.services.authType').d('认证模式')}:
                      </span>
                      <span>{interfaceAuth.authType}</span>
                    </li>
                  )}
                  {interfaceAuth && interfaceAuth.grantType && (
                    <li>
                      <span>
                        {intl.get('hitf.services.model.services.grantType').d('授权模式')}:
                      </span>
                      <span>{interfaceAuth.grantType}</span>
                    </li>
                  )}
                  {interfaceAuth && interfaceAuth.clientId && (
                    <li>
                      <span>
                        {intl.get('hitf.services.model.services.clientId').d('客户端ID')}:
                      </span>
                      <span>{interfaceAuth.clientId}</span>
                    </li>
                  )}
                  {interfaceAuth && interfaceAuth.clientSecret && (
                    <li>
                      <span>
                        {intl.get('hitf.services.model.services.clientSecret').d('客户端密钥')}:
                      </span>
                      <span>{interfaceAuth.clientSecret}</span>
                    </li>
                  )}
                  {interfaceAuth && interfaceAuth.accessTokenUrl && (
                    <li>
                      <span>
                        {intl
                          .get('hitf.services.model.services.accessTokenUrl')
                          .d('获取Token的URL')}
                        :
                      </span>
                      <span>{interfaceAuth.accessTokenUrl}</span>
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h2>{intl.get('hzero.common.requestMethod').d('请求方式')}</h2>
                <h3>
                  {interfacesDetail.requestMethod ||
                    intl.get('hitf.document.view.message.empty').d('暂无')}
                </h3>
              </div>
              <div>
                <h2>{intl.get('hitf.services.model.services.requestUrl').d('请求地址')}</h2>
                <h3>
                  {interfacesDetail.publishUrl ||
                    intl.get('hitf.document.view.message.empty').d('暂无')}
                </h3>
              </div>
              <h1>{intl.get('hitf.document.view.message.outer.interface').d('外部接⼝信息')}</h1>
              {documentData.reqRemark && (
                <div>
                  <h2>{intl.get('hitf.document.view.title.requestDes').d('请求说明')}</h2>
                  <p dangerouslySetInnerHTML={{ __html: `${documentData.reqRemark}` }} />
                </div>
              )}
              {requestParamsAll && requestParamsAll.HEADER && (
                <div style={partStyle}>
                  <h2>{intl.get('hitf.document.view.title.requestHeader').d('请求头部')}</h2>
                  <Table
                    dataSource={requestParamsAll.HEADER}
                    pagination={false}
                    bordered
                    style={{ width: '80%' }}
                    columns={headerParams.concat(alternativeColumn)}
                  />
                </div>
              )}
              {requestParamsAll && requestParamsAll.GET && (
                <div style={partStyle}>
                  <h2>{intl.get('hitf.document.view.title.queryParams').d('GET/URL参数')}</h2>
                  <Table
                    dataSource={requestParamsAll.GET}
                    pagination={false}
                    bordered
                    style={{ width: '80%' }}
                    columns={paramsColumns.concat(alternativeColumn)}
                  />
                </div>
              )}
              {requestParamsAll && requestParamsAll.PATH && (
                <div style={partStyle}>
                  <h2>{intl.get('hitf.document.view.title.pathParams').d('路径参数')}</h2>
                  <Table
                    dataSource={requestParamsAll.PATH}
                    pagination={false}
                    bordered
                    style={{ width: '80%' }}
                    columns={paramsColumns.concat(alternativeColumn)}
                  />
                </div>
              )}
              {interfacesDetail.requestMethod !== 'GET' &&
                requestParamsAll &&
                requestParamsAll.BODY && (
                  <div style={partStyle}>
                    <h2>{intl.get('hitf.document.view.title.bodyParams').d('BODY参数')}</h2>
                    <h3>
                      <span style={{ marginRight: '10px' }}>
                        {intl.get('hitf.document.view.message.type').d('类型')}:
                      </span>
                      <Tag color="green">{handledReqMimeType}</Tag>
                      {handledReqMimeType === 'raw' && <Tag color="green">{resRawType}</Tag>}
                      {handledReqMimeType === 'application/json' && (
                        <Tag color="green">
                          {intl.get('hitf.document.view.message.structure').d('最外层结构为')}:{' '}
                          {documentData.reqRootType || 'json'}
                        </Tag>
                      )}
                    </h3>
                    {handledReqMimeType === 'raw' ? (
                      <div style={{ width: '80%', height: '300px' }}>
                        <CodeMirror
                          autoScroll
                          className={styles['hzero-codemirror']}
                          value={
                            ((bodyData[handledReqMimeType] || [])[0] || {}).defaultValueLongtext ||
                            ''
                          }
                          editorDidMount={this.handleCodeMirrorRef}
                          options={{
                            mode: 'javascript',
                            lineNumbers: true,
                          }}
                          readOnly
                        />
                      </div>
                    ) : (
                      <Table
                        dataSource={bodyData[handledReqMimeType] || []}
                        pagination={false}
                        defaultExpandAllRows
                        bordered
                        style={{ width: '80%' }}
                        columns={paramsColumns}
                      />
                    )}
                  </div>
                )}
              {documentData.respRemark && (
                <div style={partStyle}>
                  <h2>{intl.get('hitf.document.view.title.responseDes').d('响应说明')}</h2>
                  <p dangerouslySetInnerHTML={{ __html: `${documentData.respRemark}` }} />
                </div>
              )}
              {responseParamsAll && responseParamsAll.HEADER && (
                <div style={partStyle}>
                  <h2>{intl.get('hitf.document.view.title.responseHeader').d('响应头部')}</h2>
                  <Table
                    dataSource={responseParamsAll.HEADER}
                    pagination={false}
                    bordered
                    style={{ width: '80%' }}
                    columns={headerParams.concat(alternativeColumn)}
                  />
                </div>
              )}
              {responseParamsAll && responseParamsAll.BODY && (
                <div style={partStyle}>
                  <h2>{intl.get('hitf.document.view.title.responseBody').d('响应结果')}</h2>
                  <h3>
                    <span style={{ marginRight: '10px' }}>
                      {intl.get('hitf.document.view.message.type').d('类型')}:
                    </span>
                    <Tag color="green">{handledRespMimeType}</Tag>
                    {handledRespMimeType === 'raw' && <Tag color="green">{respRawType}</Tag>}
                    {handledRespMimeType === 'application/json' && (
                      <Tag color="green">
                        {intl.get('hitf.document.view.message.structure').d('最外层结构为')}:{' '}
                        {documentData.respRootType || 'json'}
                      </Tag>
                    )}
                  </h3>
                  {handledRespMimeType === 'raw' ? (
                    <div style={{ width: '80%', height: '300px' }}>
                      <CodeMirror
                        autoScroll
                        className={styles['hzero-codemirror']}
                        value={
                          ((respBodyData[handledRespMimeType] || [])[0] || {})
                            .defaultValueLongtext || ''
                        }
                        editorDidMount={this.handleCodeMirrorRef}
                        readOnly
                        options={{
                          mode: 'javascript',
                          lineNumbers: true,
                        }}
                      />
                    </div>
                  ) : (
                    <Table
                      dataSource={respBodyData[handledRespMimeType] || []}
                      pagination={false}
                      defaultExpandAllRows
                      bordered
                      style={{ width: '80%' }}
                      columns={paramsColumns}
                    />
                  )}
                </div>
              )}
              <h1 style={{ marginTop: '12px' }}>
                {intl.get('hitf.services.model.services.demo').d('示例')}
              </h1>
              <div>
                <h2>{intl.get('hitf.document.view.title.requestDemo').d('请求示例')}</h2>
                {requestDemoString ? (
                  <div style={{ width: '80%', height: '300px' }}>
                    <CodeMirror
                      autoScroll
                      className={styles['hzero-codemirror']}
                      value={requestDemoString}
                      readOnly
                      options={{
                        mode: 'javascript',
                        lineNumbers: true,
                      }}
                    />
                  </div>
                ) : (
                  intl.get('hitf.document.view.message.empty').d('暂无')
                )}
              </div>
              <div>
                <h2>{intl.get('hitf.document.view.message.responseDemo').d('响应示例')}</h2>
                <div>
                  <h3>{intl.get('hitf.document.view.title.successDemo').d('成功示例')}</h3>
                  {documentData.respSuccessDemo ? (
                    <div style={{ width: '80%', height: '300px' }}>
                      <CodeMirror
                        autoScroll
                        className={styles['hzero-codemirror']}
                        value={documentData.respSuccessDemo}
                        options={{
                          mode: 'javascript',
                          lineNumbers: true,
                        }}
                        readOnly
                      />
                    </div>
                  ) : (
                    intl.get('hitf.document.view.message.empty').d('暂无')
                  )}
                </div>
                <div style={partStyle}>
                  <h3>{intl.get('hitf.document.view.title.failedDemo').d('失败示例')}</h3>
                  {documentData.respFailedDemo ? (
                    <div style={{ width: '80%', height: '300px' }}>
                      <CodeMirror
                        autoScroll
                        className={styles['hzero-codemirror']}
                        value={documentData.respFailedDemo}
                        options={{
                          mode: 'javascript',
                          lineNumbers: true,
                        }}
                        readOnly
                      />
                    </div>
                  ) : (
                    intl.get('hitf.document.view.message.empty').d('暂无')
                  )}
                </div>
              </div>
              <div>
                <h2>{intl.get('hitf.document.view.title.httpStatus').d('HTTP状态码参考表')}</h2>
                <Table
                  bordered
                  rowKey="httpStatusCode"
                  pagination={false}
                  style={{ width: '80%' }}
                  columns={httpStatusColumns}
                  dataSource={httpStatusDataSource}
                />
              </div>
            </div>
          </Spin>
        </Content>
      </>
    );
  }
}
