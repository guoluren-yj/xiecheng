/**
 * 风险档案页面
 */

import React, { useEffect, useState } from 'react';
import { Divider, Icon, Tag } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { throttle } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getAccessToken, getCurrentLanguage, getCurrentUser } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { getEnvConfig } from 'utils/iocUtils';
import { downloadFileByAxios } from 'services/api';

import { fetchRiskProfileDetail, fetchMiningDetail } from '@/services/riskProfileService';
import { getRiskScanUrl } from '@/services/riskControl/monitorBusinessService';
import { getRealUrlParam } from '@/utils/utils';

import styles from './index.less';

const { HZERO_FILE } = getEnvConfig();

const RiskProfile = (props) => {
  const { search = '' } = props?.location ?? {};

  const [result, setResult] = useState({});
  const [miningResult, setMiningResult] = useState({});
  const [showSpan, setShowSpan] = useState(false);

  const {
    companyName = '',
    organizationId = '',
    needFold = '',
    needBtn = true,
    lang = '',
    loginName = '',
    realName = '',
    userId = '',
  } = getRealUrlParam(search);

  const current = getCurrentUser();

  useEffect(() => {
    if (companyName) {
      queryDetail(companyName);
      queryMiningDetail(companyName);
    }
  }, [companyName]);

  const queryDetail = (name) => {
    fetchRiskProfileDetail({
      companyName: name,
      organizationId,
      lang: getCurrentLanguage() || lang,
    }).then((res) => {
      if (getResponse(res)) {
        setResult(res);
      }
    });
  };

  const queryMiningDetail = (name) => {
    fetchMiningDetail({
      companyData: name,
      organizationId,
      businessIdentity: 'PARTNER',
      lang: getCurrentLanguage() || lang,
    }).then((res) => {
      if (getResponse(res)) {
        setMiningResult({
          ...res,
        });
      }
    });
  };

  const handPushScanPage = () => {
    getRiskScanUrl({
      keyWord: companyName,
      gatewayUrl: location?.origin ?? '',
      loginName: current?.loginName ?? loginName,
      operateName: current?.realName ?? realName,
      realName: current?.realName ?? realName,
      userId: current?.userId ?? userId,
      tenantId: organizationId,
    }).then((res) => {
      if (res && res.success) {
        if (res && res.data) {
          queryDetail(companyName);
          setShowSpan(true);
          window.open(res.data);
        }
      } else {
        notification.error({
          message: res?.message ?? res?.msg ?? '',
        });
      }
    });
  };

  const handleDownLoad = () => {
    if (result?.fileUrl) {
      window.open(
        `${HZERO_FILE}/v1/${organizationId}/file-preview/by-url?url=${
          result.fileUrl
        }&bucketName=${PRIVATE_BUCKET}&access_token=${getAccessToken()}`
      );
    }
  };

  const handleMiningDownLoad = () => {
    if (miningResult?.fileUrl) {
      window.open(
        `${HZERO_FILE}/v1/${organizationId}/file-preview/by-url?url=${
          miningResult.fileUrl
        }&bucketName=${PRIVATE_BUCKET}&access_token=${getAccessToken()}`
      );
    }
  };

  const downloadRiskProfileFile = throttle((event, miningFlag) => {
    event.stopPropagation();
    const fileUrl = miningFlag ? miningResult?.fileUrl : result?.fileUrl;
    if (fileUrl) {
      const api = `${HZERO_FILE}/v1/${organizationId}/files/download`;
      const fileName = miningFlag ? getFileName(miningResult) : result?.fileName;
      downloadFileByAxios(
        {
          requestUrl: api,
          queryParams: [
            { name: 'url', value: encodeURIComponent(fileUrl) },
            { name: 'bucketName', value: PRIVATE_BUCKET },
          ],
          method: 'GET',
        },
        fileName
      );
    }
  }, 1000);

  const renderItemSpan = (map = {}, type = '') => {
    const keys = Object.keys(map);
    const rtns = [];
    if (keys.length) {
      keys.forEach((item) => {
        rtns.push({
          name: item,
          value: map[item],
        });
      });
    }

    return (
      <>
        {rtns.map((item) => {
          return (
            <div
              key={`${item.name}-${item.value}`}
              style={{
                flexBasis: 'calc(20% - 20px)',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: type === 'fold' ? '#fff' : '#F7F8FA',
                borderRadius: '3px',
                boxSizing: 'border-box',
              }}
            >
              <span>{item.name}</span> <span>{item.value}</span>
            </div>
          );
        })}
      </>
    );
  };

  const toggleStatus = () => {
    setShowSpan(!showSpan);
  };

  const getFileName = (obj) => {
    if (obj?.fileName) return obj.fileName;
    const fileUrl = obj?.fileUrl ?? '';
    if (fileUrl) {
      const fileNameStr = fileUrl?.split('@')?.pop() ?? '';
      return fileNameStr ? `${companyName}-${fileNameStr}` : '';
    }
    return '';
  };

  const levelMap = {
    1: styles['low-score-area'],
    2: styles['middle-score-area'],
    3: styles['high-score-area'],
  };

  const tagMap = {
    1: styles['low-risk-tag'],
    2: styles['middle-risk-tag'],
    3: styles['high-risk-tag'],
  };

  return (
    <>
      {needFold ? (
        <div className={styles['risk-profile-fold-basic']}>
          <div className={styles['risk-profile-header']}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className={styles['risk-profile-header-title']}>
                {intl.get('sdat.riskProfile.view.title.riskProfile').d('风险档案')}
              </div>
              <Icon
                type={showSpan ? 'expand_less' : 'expand_more'}
                style={{ marginLeft: '8px', cursor: 'pointer' }}
                onClick={toggleStatus}
              />
              {!showSpan && result && result.riskLevel ? (
                <div className={tagMap[result?.riskLevel ?? '']} style={{ marginLeft: '8px' }}>
                  {result.riskLevelMeaning}
                </div>
              ) : null}
            </div>

            <div>
              {needBtn && needBtn !== 'false' ? (
                <Button
                  icon="offline_bolt"
                  funcType="flat"
                  style={{ border: 'none' }}
                  onClick={handPushScanPage}
                >
                  {intl.get('sdat.riskProfile.view.title.riskScan').d('风险扫描')}
                </Button>
              ) : null}
            </div>
          </div>
          {showSpan && result && result.lastScanTime ? (
            <>
              <div className={styles['risk-profile-card-second-title']}>
                {intl.get('sdat.riskProfile.view.title.riskScan').d('风险扫描')}
              </div>

              <div className={styles['risk-profile-score-row']}>
                <div className={levelMap[result?.riskLevel ?? 0]}>
                  <div className={styles['score-row']}>{result?.riskScore ?? 0}</div>
                  <div className={styles['level-word-row']}>{result?.riskLevelMeaning}</div>
                </div>

                <div className={styles['risk-profile-level-panel']}>
                  {result && result.highList ? (
                    <div
                      className={styles['risk-profile-level-row']}
                      style={{ marginBottom: '8px' }}
                    >
                      <div
                        className={styles['risk-profile-second-title']}
                        style={{ color: '#E64322' }}
                      >
                        {intl.get('sdat.riskProfile.view.title.highRisk').d('高风险')}
                      </div>
                      <div className={styles['risk-profile-level-item']}>
                        {result?.highList?.map((item) => (
                          <div style={{ display: 'inline-block', marginRight: '18px' }} key={item}>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {result && result.middleList ? (
                    <div
                      className={styles['risk-profile-level-row']}
                      style={{ marginBottom: '8px' }}
                    >
                      <div
                        className={styles['risk-profile-second-title']}
                        style={{ color: '#F06200' }}
                      >
                        {intl.get('sdat.riskProfile.view.title.middleRisk').d('中风险')}
                      </div>
                      <div className={styles['risk-profile-level-item']}>
                        {result?.middleList?.map((item) => (
                          <div style={{ display: 'inline-block', marginRight: '18px' }} key={item}>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {result && result.lowList ? (
                    <div className={styles['risk-profile-level-row']}>
                      <div
                        className={styles['risk-profile-second-title']}
                        style={{ color: '#179454' }}
                      >
                        {intl.get('sdat.riskProfile.view.title.lowRisk').d('低风险')}
                      </div>
                      <div className={styles['risk-profile-level-item']}>
                        {result?.lowList?.map((item) => (
                          <div style={{ display: 'inline-block', marginRight: '18px' }} key={item}>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <Divider dashed style={{ margin: '14px 0 8px 0' }} />

              <div className={styles['risk-profile-bottom']}>
                <a
                  style={{ display: 'flex', alignItems: 'center', fontWeight: '600' }}
                  onClick={() => handleDownLoad()}
                >
                  <Icon
                    type="attach_file"
                    style={{
                      fontSize: '14px',
                      margin: '0 4px 0 8px',
                    }}
                  />
                  <span>{result?.fileName}</span>
                  <Icon
                    style={{ cursor: 'pointer', fontSize: '14px', marginLeft: '4px' }}
                    type="get_app"
                    onClick={downloadRiskProfileFile}
                  />
                </a>
                <div style={{ display: 'flex', color: '#868D9C' }}>
                  <div style={{ display: 'flex', marginLeft: '16px' }}>
                    <div>
                      {intl.get('sdat.riskProfile.view.title.riskScanTime').d('最新风险扫描时间')}：
                    </div>
                    <div>{result?.lastScanTime}</div>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {showSpan && miningResult && miningResult.lastScanTime ? (
            <>
              <div
                className={styles['risk-profile-card-second-title']}
                style={{ marginTop: '32px' }}
              >
                {intl.get('sdat.riskProfile.view.title.relationMining').d('一对多关系排查')}
                <Tag color="green" style={{ marginLeft: '8px' }}>
                  {intl.get('sdat.riskProfile.view.title.cooperatedEnterprises').d('已合作企业')}
                </Tag>
              </div>

              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  {renderItemSpan(miningResult?.relationStatistics ?? {}, 'fold')}
                </div>

                <Divider dashed style={{ margin: '14px 0 8px 0' }} />

                <div className={styles['risk-profile-bottom']}>
                  <a
                    style={{ display: 'flex', alignItems: 'center', fontWeight: '600' }}
                    onClick={() => handleMiningDownLoad()}
                  >
                    <Icon
                      type="attach_file"
                      style={{ fontSize: '0.14rem', margin: '0 4px 0 8px' }}
                    />
                    <span style={{ textDecoration: 'underline' }}>{getFileName(miningResult)}</span>
                    <Icon
                      style={{ cursor: 'pointer', fontSize: '0.14rem', marginLeft: '4px' }}
                      type="get_app"
                      onClick={(e) => downloadRiskProfileFile(e, true)}
                    />
                  </a>
                  <div style={{ display: 'flex', color: '#868D9C' }}>
                    <div style={{ display: 'flex', marginLeft: '16px' }}>
                      <div>
                        {intl
                          .get('sdat.riskProfile.view.title.lastMiningTime')
                          .d('最新已合作一对多关系排查时间')}
                        ：
                      </div>
                      <div>{miningResult?.lastScanTime}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <div className={styles['risk-profile-basic']}>
          <div className={styles['risk-profile-header']}>
            <div className={styles['risk-profile-header-title']}>
              {intl.get('sdat.riskProfile.view.title.riskProfile').d('风险档案')}
            </div>
            <div>
              {needBtn && needBtn !== 'false' ? (
                <Button
                  icon="offline_bolt"
                  funcType="flat"
                  style={{ border: 'none' }}
                  onClick={handPushScanPage}
                >
                  {intl.get('sdat.riskProfile.view.title.riskScan').d('风险扫描')}
                </Button>
              ) : null}
            </div>
          </div>

          <>
            {result && result.lastScanTime ? (
              <>
                <div className={styles['risk-profile-card-second-title']}>
                  {intl.get('sdat.riskProfile.view.title.riskScan').d('风险扫描')}
                </div>

                <div className={styles['risk-profile-score-row']}>
                  <div className={levelMap[result?.riskLevel ?? 0]}>
                    <div className={styles['score-row']}>{result?.riskScore ?? 0}</div>
                    <div className={styles['level-word-row']}>{result?.riskLevelMeaning}</div>
                  </div>

                  <div className={styles['risk-profile-level-panel']}>
                    {result && result.highList ? (
                      <div className={styles['risk-profile-level-row']}>
                        <div
                          className={styles['risk-profile-second-title']}
                          style={{ color: '#E64322' }}
                        >
                          {intl.get('sdat.riskProfile.view.title.highRisk').d('高风险')}
                        </div>
                        <div className={styles['risk-profile-level-item']}>
                          {result?.highList?.map((item) => (
                            <div
                              style={{ display: 'inline-block', marginRight: '18px' }}
                              key={item}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {result && result.middleList ? (
                      <div
                        className={styles['risk-profile-level-row']}
                        style={{ marginTop: '8px' }}
                      >
                        <div
                          className={styles['risk-profile-second-title']}
                          style={{ color: '#F06200' }}
                        >
                          {intl.get('sdat.riskProfile.view.title.middleRisk').d('中风险')}
                        </div>
                        <div className={styles['risk-profile-level-item']}>
                          {result?.middleList?.map((item) => (
                            <div
                              style={{ display: 'inline-block', marginRight: '18px' }}
                              key={item}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {result && result.lowList ? (
                      <div
                        className={styles['risk-profile-level-row']}
                        style={{ marginTop: '8px' }}
                      >
                        <div
                          className={styles['risk-profile-second-title']}
                          style={{ color: '#179454' }}
                        >
                          {intl.get('sdat.riskProfile.view.title.lowRisk').d('低风险')}
                        </div>
                        <div className={styles['risk-profile-level-item']}>
                          {result?.lowList?.map((item) => (
                            <div
                              style={{ display: 'inline-block', marginRight: '18px' }}
                              key={item}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <Divider dashed style={{ margin: '14px 0 8px 0' }} />

                <div className={styles['risk-profile-bottom']}>
                  <a
                    style={{ display: 'flex', alignItems: 'center', fontWeight: '600' }}
                    onClick={() => handleDownLoad()}
                  >
                    <Icon
                      type="attach_file"
                      style={{ fontSize: '0.14rem', margin: '0 4px 0 8px' }}
                    />
                    <span style={{ textDecoration: 'underline' }}>{result?.fileName}</span>
                    <Icon
                      style={{ cursor: 'pointer', fontSize: '0.14rem', marginLeft: '4px' }}
                      type="get_app"
                      onClick={downloadRiskProfileFile}
                    />
                  </a>
                  <div style={{ display: 'flex', color: '#868D9C' }}>
                    <div style={{ display: 'flex', marginLeft: '16px' }}>
                      <div>
                        {intl.get('sdat.riskProfile.view.title.riskScanTime').d('最新风险扫描时间')}
                        ：
                      </div>
                      <div>{result?.lastScanTime}</div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {miningResult && miningResult.lastScanTime ? (
              <>
                <div
                  className={styles['risk-profile-card-second-title']}
                  style={{ marginTop: '32px' }}
                >
                  {intl.get('sdat.riskProfile.view.title.relationMining').d('一对多关系排查')}
                  <Tag color="green" style={{ marginLeft: '8px' }}>
                    {intl.get('sdat.riskProfile.view.title.cooperatedEnterprises').d('已合作企业')}
                  </Tag>
                </div>

                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {renderItemSpan(miningResult?.relationStatistics ?? {}, 'normal')}
                  </div>

                  <Divider dashed style={{ margin: '14px 0 8px 0' }} />

                  <div className={styles['risk-profile-bottom']}>
                    <a
                      style={{ display: 'flex', alignItems: 'center', fontWeight: '600' }}
                      onClick={() => handleMiningDownLoad()}
                    >
                      <Icon
                        type="attach_file"
                        style={{ fontSize: '0.14rem', margin: '0 4px 0 8px' }}
                      />
                      <span style={{ textDecoration: 'underline' }}>
                        {getFileName(miningResult)}
                      </span>
                      <Icon
                        style={{ cursor: 'pointer', fontSize: '0.14rem', marginLeft: '4px' }}
                        type="get_app"
                        onClick={(e) => downloadRiskProfileFile(e, true)}
                      />
                    </a>
                    <div style={{ display: 'flex', color: '#868D9C' }}>
                      <div style={{ display: 'flex', marginLeft: '16px' }}>
                        <div>
                          {intl
                            .get('sdat.riskProfile.view.title.lastMiningTime')
                            .d('最新已合作一对多关系排查时间')}
                          ：
                        </div>
                        <div>{miningResult?.lastScanTime}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </>
        </div>
      )}
    </>
  );
};

export default formatterCollections({
  code: ['sdat.riskProfile'],
})(RiskProfile);
