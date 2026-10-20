/* eslint-disable react/no-danger */
/**
 * 关系排查报告
 */

import React, { useEffect, useState } from 'react';
import { Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import { throttle } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getAccessToken, getCurrentLanguage } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { getEnvConfig } from 'utils/iocUtils';
import { downloadFileByAxios } from 'services/api';

import { fetchRiskTroubleshoot } from '@/services/riskProfileService';
import { getRealUrlParam } from '@/utils/utils';

import styles from './index.less';

const { HZERO_FILE } = getEnvConfig();

const RiskProfile = (props) => {
  const { location = {} } = props;
  const { search = '' } = location;

  const {
    businessNumber = '',
    businessType = '',
    dataType = '',
    organizationId = '',
    _timestamp = '',
    lang = '',
  } = getRealUrlParam(search);

  const [result, setResult] = useState({});
  const [showSpan, setShowSpan] = useState(false);

  useEffect(() => {
    if (businessType && businessNumber) {
      fetchRiskTroubleshoot({
        businessNumber,
        businessType,
        dataType,
        organizationId,
        lang: getCurrentLanguage() || lang,
      }).then((res) => {
        if (getResponse(res)) {
          setResult({ ...res });
        }
      });
    }
  }, [businessNumber, businessType, organizationId, _timestamp]);

  const handleDownLoad = () => {
    if (result?.fileUrl) {
      window.open(
        `${HZERO_FILE}/v1/${organizationId}/file-preview/by-url?url=${
          result.fileUrl
        }&bucketName=${PRIVATE_BUCKET}&access_token=${getAccessToken()}`
      );
    }
  };


  const downloadRiskProfileFile = throttle((event) => {
    event.stopPropagation();
    if (result?.fileUrl) {
      const api = `${HZERO_FILE}/v1/${organizationId}/files/download`;
      const fileName = result?.fileName;
      downloadFileByAxios(
        {
          requestUrl: api,
          queryParams: [
            { name: 'url', value: encodeURIComponent(result?.fileUrl) },
            { name: 'bucketName', value: PRIVATE_BUCKET },
          ],
          method: 'GET',
        },
        fileName
      );
    }
  }, 1000);

  const toggleStatus = () => {
    setShowSpan(!showSpan);
  };

  return (
    <>
      {result?.relationFlag || [false, 'false'].includes(result?.relationFlag) ? (
        <div
          className={styles['risk-profile-basic']}
          style={{
            background: [false, 'false'].includes(result?.relationFlag)
              ? 'rgba(23,148,84,0.10)'
              : 'rgba(242, 128, 26, 0.1)',
          }}
        >
          <div
            className={styles['risk-profile-toggle-row']}
            style={{
              color: [false, 'false'].includes(result?.relationFlag) ? '#179454' : '#f06200',
            }}
          >
            <Icon type="error" style={{ marginRight: '8px', fontSize: '16px' }} />
            <div>
              {[false, 'false'].includes(result?.relationFlag)
                ? intl.get('sdat.riskTroubleshoot.view.title.noRiskTip').d('无风险')
                : intl.get('sdat.riskTroubleshoot.view.title.riskTip').d('风险提示')}
            </div>
            <Icon
              type={showSpan ? 'expand_less' : 'expand_more'}
              style={{ marginLeft: '8px', cursor: 'pointer' }}
              onClick={toggleStatus}
            />
          </div>
          {showSpan ? (
            <div
              style={{
                marginLeft: '24px',
                color: [false, 'false'].includes(result?.relationFlag) ? '#179454' : '#F06200',
              }}
            >
              {result?.creationDate ? (
                <div className={styles['risk-profile-row']}>
                  <div className={styles['risk-profile-row-title']}>
                    {intl.get('sdat.riskTroubleshoot.view.title.troubleTime').d('排查时间')}：
                  </div>
                  <div className={styles['risk-profile-row-content']}>{result?.creationDate}</div>
                </div>
              ) : null}

              {result?.companyData ? (
                <div className={styles['risk-profile-row']}>
                  <div className={styles['risk-profile-row-title']}>
                    {intl.get('sdat.riskTroubleshoot.view.title.companyData').d('公司数据')}：
                  </div>
                  <div className={styles['risk-profile-row-content']}>{result?.companyData}</div>
                </div>
              ) : null}

              {result?.newRelationFlag ? (
                <>
                  <div className={styles['risk-profile-row']}>
                    <div className={styles['risk-profile-row-title']}>
                      {intl.get('sdat.riskTroubleshoot.view.title.relationType').d('关系类型')}：
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: `${result?.relationTypes}`,
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles['risk-profile-row']}>
                    <div className={styles['risk-profile-row-title']}>
                      {intl.get('sdat.riskTroubleshoot.view.title.excludeTypes').d('节点排除')}：
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: `${result?.excludeTypes}`,
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles['risk-profile-row']}>
                  <div className={styles['risk-profile-row-title']}>
                    {intl.get('sdat.riskTroubleshoot.view.title.relationType').d('关系类型')}：
                  </div>
                  <div className={styles['risk-profile-row-content']}>
                    <ul>
                      <li>
                        {intl
                          .get('sdat.riskTroubleshoot.view.title.investmentRelations')
                          .d('投资关系（股东、历史股东）')}
                      </li>
                      ，&nbsp;&nbsp;
                      <li>
                        {intl
                          .get('sdat.riskTroubleshoot.view.title.relationship')
                          .d('任职关系（法定代表人、董监高、历史董监高）')}
                      </li>
                      ，&nbsp;&nbsp;
                      <li>
                        {intl
                          .get('sdat.riskTroubleshoot.view.title.contact')
                          .d(
                            '联系方式（相同电话、相同邮箱、相同地址、历史相同电话、历史相同邮箱、历史相同地址）'
                          )}
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {result?.relationResult || result?.fileUrl ? (
                <div className={styles['risk-profile-row']}>
                  <div className={styles['risk-profile-row-title']}>
                    {intl.get('sdat.riskTroubleshoot.view.title.shootingResults').d('排查结果')}：
                  </div>
                  <div className={styles['risk-profile-row-content']} style={{ display: 'flex' }}>
                    {result?.relationResult}
                    {result?.fileUrl ? (
                      <div
                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => handleDownLoad()}
                      >
                        <Icon
                          type="attach_file"
                          style={{ fontSize: '0.14rem', margin: '0 4px 0 8px' }}
                        />
                        <span style={{ textDecoration: 'underline' }}>{result?.fileName}</span>
                        <Icon
                          style={{ fontSize: '0.14rem', marginLeft: '4px' }}
                          type="get_app"
                          onClick={downloadRiskProfileFile}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
};

export default formatterCollections({
  code: ['sdat.riskTroubleshoot'],
})(RiskProfile);
