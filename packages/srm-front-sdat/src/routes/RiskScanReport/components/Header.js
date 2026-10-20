/* eslint-disable react/no-array-index-key */
import React from 'react';
import intl from 'utils/intl';
import { Button, Tooltip } from 'choerodon-ui/pro';
import { Icon, notification } from 'choerodon-ui';

import { fetchExportReport } from '@/services/riskScan/riskScanReport';

import styles from './index.less';

export default function Header(props) {
  const { companyDetail = {}, keyword, passport, tenantId = '' } = props;

  const handleExport = async () => {
    await fetchExportReport({ keyWord: keyword, passport, tenantId });
    notification.open({
      message: intl.get('sdat.riskScanReport.view.message.exportIng').d('正在后台执行导出'),
      description: intl
        .get('sdat.riskScanReport.view.message.exportMessage')
        .d('您的报告正在生成中，稍后可以到【风险报告查询】页面查看'),
      icon: <Icon type="download_for_offline" />,
    });
  };

  // const handlePushPage = () => {
  //   history.push(
  //     `/public/sdat/risk-level-define?keyWord=${keyword}&passport=${passport}&tenantId=${tenantId}`
  //   );
  // };

  const levelMap = {
    1: styles['low-score-area'],
    2: styles['middle-score-area'],
    3: styles['high-score-area'],
  };

  const valueMap = {
    1: intl.get('sdat.riskProfile.view.title.lowRisk').d('低风险'),
    2: intl.get('sdat.riskProfile.view.title.middleRisk').d('中风险'),
    3: intl.get('sdat.riskProfile.view.title.highRisk').d('高风险'),
  };

  // const logoText =
  //   companyDetail && companyDetail.stdFormatName ? companyDetail.stdFormatName.substring(0, 1) : '';

  return (
    <div className={styles['risk-scan-title']}>
      <div style={{ display: 'flex' }}>
        {/* <div className={styles['risk-scan-title-avatar']}>{logoText}</div> */}
        <Tooltip title={companyDetail?.riskLevelDescription}>
          <div className={levelMap[companyDetail?.riskLevel ?? 0]}>
            <div className={styles['score-row']}>{companyDetail?.score ?? 0}</div>
            <div className={styles['level-word-row']}>{valueMap[companyDetail?.riskLevel]}</div>
          </div>
        </Tooltip>

        <div
          style={{
            marginLeft: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                fontSize: '20px',
                color: '#101319',
                fontWeight: '600',
                lineHeight: '30px',
              }}
            >
              {companyDetail?.stdFormatName ?? ''}
            </div>
            <span
              style={{
                background:
                  companyDetail &&
                  companyDetail.stdStatus &&
                  (companyDetail.stdStatus.includes('存续') ||
                    companyDetail.stdStatus.includes('在营') ||
                    companyDetail.stdStatus.includes('开业'))
                    ? '#179454'
                    : '#F2F3F5',
                color:
                  companyDetail &&
                  companyDetail.stdStatus &&
                  (companyDetail.stdStatus.includes('存续') ||
                    companyDetail.stdStatus.includes('在营') ||
                    companyDetail.stdStatus.includes('开业'))
                    ? '#fff'
                    : '#4E5769',
                padding: '1px 2px',
                borderRadius: '2px',
                marginLeft: '8px',
                display: companyDetail && companyDetail.stdStatus ? '' : 'none',
              }}
            >
              {companyDetail?.stdStatus ?? ''}
            </span>
          </div>
          <div className={styles['risk-scan-tag-list']}>
            <>
              {companyDetail &&
              companyDetail.stdHistoryNames &&
              companyDetail.stdHistoryNames.length ? (
                <>
                  {companyDetail.stdHistoryNames.map((item, index) => {
                    return item ? (
                      <span
                        key={`name_${index}`}
                        className={styles['risk-scan-report-tag']}
                        style={{
                          color: '#4E5769',
                          background: '#F2F3F5',
                          border: '1px solid rgba(201,205,212,1)',
                        }}
                      >
                        {item}
                      </span>
                    ) : null;
                  })}
                </>
              ) : null}
            </>
            <span
              className={styles['risk-scan-report-tag']}
              style={{
                color: '#0161D5',
                background: 'rgba(25,132,247,0.15)',
                border: '1px solid rgba(25,132,247,0.2)',
                display: companyDetail && companyDetail.stdEconKind ? '' : 'none',
              }}
            >
              {companyDetail?.stdEconKind ?? ''}
            </span>
            <>
              {companyDetail && companyDetail.stdTags && companyDetail.stdTags.length ? (
                <>
                  {companyDetail.stdTags.map((item, index) => {
                    return item ? (
                      <span
                        key={`tag_${index}`}
                        className={styles['risk-scan-report-tag']}
                        style={{
                          color: '#F06200',
                          background: 'rgba(255,120,0,0.15)',
                          border: '1px solid rgba(255,120,0,0.2)',
                        }}
                      >
                        {item}
                      </span>
                    ) : null;
                  })}
                </>
              ) : null}
            </>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'end' }}>
          <div style={{ textAlign: 'right', marginBottom: '6px' }}>
            {/* <Button
              // icon="file_download_black-o"
              onClick={handlePushPage}
              style={{ marginRight: '8px' }}
            >
              {intl.get('sdat.riskScanReport.view.title.riskLevelDef').d('风险等级定义')}
            </Button> */}
            <Button
              color="primary"
              // icon="file_download_black-o"
              onClick={handleExport}
            >
              {intl.get('sdat.riskScanReport.view.title.reportExport').d('报告导出')}
            </Button>
          </div>
          <div
            style={{ textAlign: 'right', color: '#1D2129', lineHeight: '18px', fontWeight: '400' }}
          >
            {intl.get('sdat.riskScanReport.view.title.dataGenerateTime').d('数据时间')}：
            {companyDetail?.dataDate ?? ''}
          </div>
        </div>
      </div>
    </div>
  );
}
