import React, { useEffect, useState, useMemo } from 'react';
import { Row, Col, Icon } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import YAMLFormatter from 'choerodon-ui/pro/lib/code-area/formatters/YAMLFormatter';
import { Content, Header } from 'hzero-front/lib/components/Page';
import { CodeArea, Spin } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import JsonArea from 'react-json-view';
import XmlFormatter from '@/components/XmlFormatter';
import { getParameter, fetchDetailData } from '@/services/InterfaceMonitorService';
// @ts-ignore
import styles from './index.less';

const obj: any = Object.create(null);

// 是否为租户
const isTenant = isTenantRoleLevel();

const ParameterDetail: React.FC<any> = ({ history, match }) => {
  const url = window.location.href;
  const index = url.lastIndexOf("/");
  const detailTenantId = url.substring(index + 1, url.length);
  const [detailData, setDetailData] = useState(obj);
  const [detailDataLoadFlag, setDetailDataLoadFlag] = useState(false);
  const [requestHeaderFlag, setRequestHeaderFlag] = useState(0);
  const [requestBodyFlag, setRequestBodyFlag] = useState(0);
  const [responseBodyFlag, setResponseBodyFlag] = useState(0);
  const [responseConvertFlag, setResponseConvertFlag] = useState(0);
  const [requestHeader, setRequestHeader] = useState();
  const [requestBody, setRequestBody] = useState();
  const [responseBody, setResponseBody] = useState();
  const [responseConvert, setResponseConvert] = useState();
  // 加载loading
  const [requestHeaderLoadFlag, setRequestHeaderLoadFlag] = useState(false);
  const [requestBodyLoadFlag, setRequestBodyLoadFlag] = useState(false);
  const [responseBodyLoadFlag, setResponseBodyLoadFlag] = useState(false);
  const [responseConvertLoadFlag, setResponseConvertLoadFlag] = useState(false);
  useEffect(() => {
    const id = match.params.id || '';
    const type = match.params.type || '';
    if (type) {
      setDetailDataLoadFlag(true);
      fetchDetailData(type, id, detailTenantId).then(res => {
        setDetailData(res);
      }).finally(() => {
        setDetailDataLoadFlag(false);
      });
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(detailData)) {
      scrollFetchParam();
    }
  }, [detailData]);

  const renderRequestInfo = useMemo(() => {
    const {
      insideBatchNum,
      interfaceCode,
      interfaceName,
      interactiveMethodMeaning,
      requestMethod,
      ip,
      requestTime,
      interfaceUrl,
    } = detailData;
    return (
      <div className={styles['base-info-content']}>
        <div className={styles['base-info-content-row']}>
          <Row gutter={24}>
            <Col span={6}>
              <div className={styles['field-name']}>
                {intl.get('hitf.interfaceMonitor.model.batchNum').d('请求编号')}
              </div>
              <div className={styles['field-value']}>
                <b>{insideBatchNum || '-'}</b>
              </div>
            </Col>
            <Col span={6}>
              <div className={styles['field-name']}>
                {intl.get('hitf.interfaceMonitor.model.interfaceCode').d('接口代码')}
              </div>
              <div className={styles['field-value']}>
                <b>{interfaceCode || '-'}</b>
              </div>
            </Col>
            <Col span={6}>
              <div className={styles['field-name']}>
                {intl.get('hitf.interfaceMonitor.model.interfaceName').d('接口名称')}
              </div>
              <div className={styles['field-value']}>
                <b>{interfaceName || '-'}</b>
              </div>
            </Col>
          </Row>
        </div>
        <div className={styles['base-info-content-row']}>
          <Row gutter={24}>
            <Col span={6}>
              <div className={styles['field-name']}>
                {intl.get('hitf.interfaceMonitor.model.interactiveMethodMeaning').d('交互方式')}
              </div>
              <div className={styles['field-value']}>
                <b>{interactiveMethodMeaning || '-'}</b>
              </div>
            </Col>
            <Col span={6}>
              <div className={styles['field-name']}>
                {intl.get('hitf.interfaceMonitor.model.requestMethod').d('请求方法')}
              </div>
              <div className={styles['field-value']}>
                <b>{requestMethod || '-'}</b>
              </div>
            </Col>
            <Col span={6}>
              <div className={styles['field-name']}>
                {intl.get('hitf.interfaceMonitor.model.ip').d('请求IP')}
              </div>
              <div className={styles['field-value']}>
                <b>{ip || '-'}</b>
              </div>
            </Col>
          </Row>
        </div>
        <div className={styles['base-info-content-row']}>
          <Row gutter={24}>
            <Col span={6}>
              <div className={styles['field-name']}>
                {intl.get('hitf.interfaceMonitor.model.InterfaceRequestTime').d('接口请求时间')}
              </div>
              <div className={styles['field-value']}>
                <b>{requestTime || '-'}</b>
              </div>
            </Col>
            <Col span={6}>
              <div className={styles['field-name']}>
                {intl.get('hitf.interfaceMonitor.model.interfaceUrl').d('第三方接口地址')}
              </div>
              <div className={styles['field-value']}>
                <b>{interfaceUrl || '-'}</b>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }, [detailData]);

  const renderResponseInfo = useMemo(() => {
    const {
      insideResponseTime,
      externalResponseTime,
      responseStatus,
    } = detailData;
    return (
      <div>
        <Row gutter={24}>
          <Col span={6}>
            <div className={styles['field-name']}>
              {intl.get('hitf.interfaceMonitor.model.insideResponseTime').d('接口响应时间(ms)')}
            </div>
            <div className={styles['field-value']}>
              <b>{insideResponseTime || '-'}</b>
            </div>
          </Col>
          <Col span={6}>
            <div className={styles['field-name']}>
              {intl.get('hitf.interfaceMonitor.model.externalResponseTime').d('外部接口响应时间(ms)')}
            </div>
            <div className={styles['field-value']}>
              <b>{externalResponseTime || '-'}</b>
            </div>
          </Col>
          <Col span={6}>
            <div className={styles['field-name']}>
              {intl.get('hitf.interfaceMonitor.model.interfaceResponseStatus').d('接口响应状态')}
            </div>
            <div className={styles['field-value']}>
              <b>
                {(responseStatus === 'SUCCESS' && '成功') ||
                  (responseStatus === 'ERROR' && '失败') ||
                  (responseStatus === 'PARTIAL_SUCCESS' && '部分成功') ||
                  '-'}
              </b>
            </div>
          </Col>
        </Row>
      </div>
    );
  }, [detailData]);

  // 滚动时判断请求头、请求body、响应body、异常信息容器是否出现在视图中，等出现在视图中后再去调接口查询。
  const scrollFetchParam = () => {
    const containHeight = document.getElementById('container')?.clientHeight || 0;
    const scrollIndex = document.getElementById('container')?.scrollTop || 0;
    const requestParamIndex = document.getElementById('requestParam')?.offsetTop || 0;
    const requestBodyIndex = document.getElementById('requestBody')?.offsetTop || 0;
    const responseBodyIndex = document.getElementById('responseBody')?.offsetTop || 0;
    const responseConvertIndex = document.getElementById('convert')?.offsetTop || 0;
    if (scrollIndex + containHeight > requestParamIndex && requestHeaderFlag === 0) {
      if (!isEmpty(detailData)) {
        setRequestHeaderFlag(1);
        if (detailData.requestHeader !== undefined && detailData.requestHeader !== null) {
          setRequestHeaderLoadFlag(true);
          getParameter(detailData.requestHeader, detailTenantId).then((res) => {
            if (res) {
              setRequestHeader(res.content);
            }
          }).finally(() => {
            setRequestHeaderLoadFlag(false);
          });
        }
      }
    }
    if (scrollIndex + containHeight > responseConvertIndex && responseConvertFlag === 0) {
      if (!isEmpty(detailData)) {
        setResponseConvertFlag(1);
        if (detailData.requestParameter !== undefined && detailData.requestParameter !== null) {
          setResponseConvertLoadFlag(true);
          getParameter(detailData.requestParameter, detailTenantId).then((res) => {
            if (res) {
              setResponseConvert(res.content);
            }
          }).finally(() => {
            setResponseConvertLoadFlag(false);
          });
        }
      }
    }
    if (scrollIndex + containHeight > requestBodyIndex && requestBodyFlag === 0) {
      setRequestBodyFlag(1);
      if (detailData.requestBody !== undefined && detailData.requestBody !== null) {
        setRequestBodyLoadFlag(true);
        getParameter(detailData.requestBody, detailTenantId).then((res) => {
          if (res) {
            setRequestBody(res.content);
          }
        }).finally(() => {
          setRequestBodyLoadFlag(false);
        });
      }
    }
    if (scrollIndex + containHeight > responseBodyIndex && responseBodyFlag === 0) {
      setResponseBodyFlag(1);
      if (detailData.responseBody !== undefined && detailData.responseBody !== null) {
        setResponseBodyLoadFlag(true);
        getParameter(detailData.responseBody, detailTenantId).then((res) => {
          if (res) {
            setResponseBody(res.content);
          }
        }).finally(() => {
          setResponseBodyLoadFlag(false);
        });
      }
    }
  };

  const isJson = (data) => {
    let flag = true;
    try {
      const jsonData = JSON.parse(data);
      if(typeof jsonData !== 'object') {
        flag = false;
      }
    } catch (error) {
      flag = false;
    }
    return flag;
  };

  const handleParse = (response) => {
    if (response) {
      let data: any = '';
    if (isJson(response)) {
      try {
        data = JSON.parse(response);
      } catch (error) {
        data = {
          error: 'JSON解析失败',
        };
      }
    } else {
      data = response;
    }
      return data;
    }
    return {};
  };

  // 判断从那个tab页面跳转到详情的，返回时跳到哪个tab页
  const goBack = () => {
    const { params: { type } } = match;
    const tab: String = type === 'overview' ? '2' : '1';
    history.push({
      pathname: `/hitf/interface-monitor-workbench${isTenant ? '' : '-platform'}/list`,
      state: {
        tab,
      },
    });
  };

  const commonSetting = {
    name: null,
    displayDataTypes: false,
    collapseStringsAfterLength: 3000,
  };

  const renderRequestParam = useMemo(() => {
    return (
      <div className={styles['body-content']} id='requestParam'>
        <div className={styles['all-title']}>
          <b>{intl.get('hitf.interfaceMonitor.view.card.requestParams').d('请求header')}</b>
        </div>
        <Spin spinning={requestHeaderLoadFlag}>
          <CodeArea readOnly value={requestHeader} style={{ height: 260 }} />
        </Spin>
      </div>
    );
  }, [requestHeader, requestHeaderLoadFlag]);

  const renderRequestBody = useMemo(() => {
    const parseData = handleParse(requestBody);
    const isJsonOrnot = isJson(requestBody);
    const reqBodyProps = {
      ...commonSetting,
      src: parseData,
    };
    return (
      <div className={styles['body-content']} id='requestBody'>
        <div className={styles['all-title']}>
          <b>{intl.get('hitf.interfaceMonitor.view.card.requestBody').d('请求body')}</b>
        </div>
        <div className={styles['json-area']}>
          <Spin spinning={requestBodyLoadFlag}>
            {isJsonOrnot ? <JsonArea {...reqBodyProps} /> : <CodeArea formatter={YAMLFormatter} value={!isEmpty(parseData) ? XmlFormatter(parseData) : ''} style={{ height: 260 }} />}
          </Spin>
        </div>
      </div>
    );
  }, [requestBody, requestBodyLoadFlag]);

  const renderResponseParam = useMemo(() => {
    const parseData = handleParse(responseBody);
    const isJsonOrnot = isJson(responseBody);
    const responseBodyProps = {
      ...commonSetting,
      src: parseData,
    };
    return (
      <div className={styles['body-content']} id='responseBody'>
        <div className={styles['all-title']}>
          <b>{intl.get('hitf.interfaceMonitor.view.card.responseBody').d('响应数据')}</b>
        </div>
        <div className={styles['json-area']}>
          <Spin spinning={responseBodyLoadFlag}>
            {isJsonOrnot ? <JsonArea {...responseBodyProps} /> : <CodeArea formatter={YAMLFormatter} value={!isEmpty(parseData) ? XmlFormatter(parseData) : ''} style={{ height: 260 }} />}
          </Spin>
        </div>
      </div>
    );
  }, [responseBody, responseBodyLoadFlag]);

  const renderErrorMessage = useMemo(() => {
    const { errorMessage = '' } = detailData;
    return (
      <div className={styles['body-content']}>
        <div className={styles['all-title']}>
          <b>{intl.get('hitf.interfaceMonitor.view.card.errorMessage').d('错误消息')}</b>
        </div>
        <Spin spinning={detailDataLoadFlag}>
          <CodeArea readOnly value={errorMessage} style={{ height: 260 }} />
        </Spin>
      </div>
    );
  }, [detailData, detailDataLoadFlag]);

  const renderConvert = useMemo(() => {
    const parseData = handleParse(responseConvert);
    const isJsonOrnot = isJson(responseConvert);
    const convertProps = {
      ...commonSetting,
      src: parseData,
    };
    return (
      <div className={styles['body-content']} id='convert'>
        <div className={styles['all-title']}>
          <b>{intl.get('hitf.interfaceMonitor.view.card.transformData').d('转换后数据')}</b>
        </div>
        <div className={styles['json-area']}>
          <Spin spinning={responseConvertLoadFlag}>
            {isJsonOrnot ? <JsonArea {...convertProps} /> : <CodeArea formatter={YAMLFormatter} value={!isEmpty(parseData) ? XmlFormatter(parseData) : ''} style={{ height: 260 }} />}
          </Spin>
        </div>
      </div>
    );
  }, [detailData, responseConvertLoadFlag]);

  return (
    <>
      <Header
        title={
          <>
            <Icon type='arrow_back' onClick={() => goBack()} style={{ marginRight: '5px' }} />
            <span>
              {intl.get('hitf.interfaceMonitor.view.detail.title.header').d('报文详情')}
            </span>
          </>
        }
      />
      <Content className={styles.content}>
        <div
          id='container'
          className={styles.container}
          onScroll={() => scrollFetchParam()}
        >
          <div className={styles['base-info']}>
            <div className={styles['all-title']}>
              <b>{intl.get('hitf.interfaceMonitor.view.card.baseInfo').d('基础信息')}</b>
            </div>
            <div className={styles['child-title']}>
              <span className={styles['vertical-line']} />
              <b>{intl.get('hitf.interfaceMonitor.view.card.requestInfo').d('请求信息')}</b>
            </div>
            {renderRequestInfo}
            <div className={styles['child-title']} style={{ marginTop: '0.32rem' }}>
              <span className={styles['vertical-line']} />
              <b>{intl.get('hitf.interfaceMonitor.view.card.responseInfo').d('响应情况')}</b>
            </div>
            {renderResponseInfo}
          </div>
          {renderRequestParam}
          {renderRequestBody}
          {renderConvert}
          {match.params.type === 'detail' ? renderErrorMessage : renderResponseParam}
        </div>
      </Content>
    </>
  );
};

export default React.memo(formatterCollections({
  code: ['hitf.InterfaceMonitor', 'hitf.interfaceMonitor'],
})(ParameterDetail));
