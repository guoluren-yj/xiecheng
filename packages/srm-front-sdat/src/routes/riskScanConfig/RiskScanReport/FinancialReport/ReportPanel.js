import React, { useEffect } from 'react';
import intl from 'utils/intl';
import { Tooltip, Row, Col } from 'choerodon-ui/pro';
import CommonTable from './CommonTable';

import styles from './index.less';

export default function ReportPanel({
  reportData,
  liabilitiesDS,
  shareholdersDS,
  equityChangeDS,
  investmentDS,
}) {
  useEffect(() => {
    if (reportData) {
      const partners = reportData?.stdPartners ?? [];
      const formatList = [];
      if (partners?.length > 0) {
        partners.forEach(item => {
          const maxLen =
            item?.stdRealCapiItems?.length > item?.stdShouldCapiItems?.length
              ? item?.stdRealCapiItems?.length
              : item?.stdShouldCapiItems?.length;
          for (let i = 0; i < maxLen; i++) {
            formatList.push({
              ...item,
              ...(item?.stdRealCapiItems[i] ?? {}),
              ...(item?.stdShouldCapiItems[i] ?? {}),
              stdInvestType2: item?.stdShouldCapiItems[i] ?? {}?.stdInvestType,
            });
          }
        });
      }

      liabilitiesDS.loadData(reportData?.stdGuaranteeItems ?? []);
      shareholdersDS.loadData(formatList);
      equityChangeDS.loadData(reportData?.stdStockChanges ?? []);
      investmentDS.loadData(reportData?.stdInvestItems ?? []);
    }
  }, [reportData]);

  const liabilitiesColumns = () => {
    return [
      { name: 'stdCreditor' },
      { name: 'stdDebitor' },
      { name: 'stdDebitType' },
      { name: 'stdDebitAmount' },
      { name: 'stdDebitPeriod' },
      { name: 'stdGuarantMethod' },
      { name: 'stdGuarantPeriod' },
      { name: 'stdGuarantScope' },
    ];
  };

  const shareholdersColumns = () => {
    return [
      { name: 'stdStockName' },
      { name: 'stdShoudCapi' },
      { name: 'stdShouldCapiDate' },
      { name: 'stdInvestType' },
      { name: 'stdRealCapi' },
      { name: 'stdRealCapiDate' },
      { name: 'stdInvestType2' },
    ];
  };

  const equityChangeColumns = () => {
    return [
      { name: 'stdName' },
      { name: 'stdBeforePercent' },
      { name: 'stdAfterPercent' },
      { name: 'stdChangeDate' },
    ];
  };

  const investmentColumns = () => {
    return [
      { name: 'stdInvestName' },
      { name: 'stdInvestRegNo' },
      { name: 'stdInvestCapi' },
      { name: 'stdInvestPercent' },
    ];
  };

  return (
    <div className={styles['risk-scan-basic-business-report']}>
      <div>
        <div className={styles['risk-scan-basic-business-report-h2-title']}>
          {intl.get('sdat.riskScanReport.view.title.businessInfo').d('企业基本信息')}
        </div>
        <Row style={{ border: '1px solid #E5E7EC', lineHeight: '32px' }}>
          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.businessName').d('企业名称')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdName ?? ''}</div>
          </Col>

          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.registrationNumber').d('注册号')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdRegNo ?? ''}</div>
          </Col>

          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.uscc').d('统一社会信用代码')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdCreditNo}</div>
          </Col>
        </Row>
        <Row style={{ border: '1px solid #E5E7EC', lineHeight: '32px' }}>
          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.phone').d('企业联系电话')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdTelephone}</div>
          </Col>

          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.postalCode').d('邮政编码')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdZipCode}</div>
          </Col>

          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.address').d('企业通信地址')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdAddress}</div>
          </Col>
        </Row>
        <Row style={{ border: '1px solid #E5E7EC', lineHeight: '32px' }}>
          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.email').d('电子邮箱')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdEmail}</div>
          </Col>

          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              <Tooltip
                title={intl
                  .get('sdat.riskScanReport.view.title.isChange')
                  .d('有限责任公司本年度是否发生股东股权转让')}
              >
                {intl
                  .get('sdat.riskScanReport.view.title.isChange')
                  .d('有限责任公司本年度是否发生股东股权转让')}
              </Tooltip>
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdIfEquity ?? ''}</div>
          </Col>

          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.businessStatus').d('企业经营状态')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdOriginStatus}</div>
          </Col>
        </Row>
        <Row style={{ border: '1px solid #E5E7EC', lineHeight: '32px' }}>
          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.hasWebsite').d('是否有网站或网店')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdIfWebsite}</div>
          </Col>

          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              <Tooltip
                title={intl
                  .get('sdat.riskScanReport.view.title.isInvest')
                  .d('企业是否有投资信息或购买其他公司股权')}
              >
                {intl
                  .get('sdat.riskScanReport.view.title.isInvest')
                  .d('企业是否有投资信息或购买其他公司股权')}
              </Tooltip>
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdIfInvest}</div>
          </Col>

          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.personnels').d('从业人数')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdColleguesNum}</div>
          </Col>
        </Row>
      </div>

      <div style={{ marginTop: '24px' }}>
        <div className={styles['risk-scan-basic-business-report-h2-title']}>
          {intl.get('sdat.riskScanReport.view.title.enterpriseInfo').d('企业资产状况信息')}
        </div>
        <Row style={{ border: '1px solid #E5E7EC', lineHeight: '32px' }}>
          <Col span={12} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.totalAssets').d('资产总额')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdTotalEquity}</div>
          </Col>

          <Col span={12} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.ownerEquity').d('所有者权益合计')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdProfitReta}</div>
          </Col>
        </Row>
        <Row style={{ border: '1px solid #E5E7EC', lineHeight: '32px' }}>
          <Col span={12} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.totalRevenue').d('营业总收入')}
            </div>
            <div className={styles['risk-scan-form-item']}>-</div>
          </Col>

          <Col span={12} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.mainBusinessRevenue').d('主营业务收入')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdSaleIncome}</div>
          </Col>
        </Row>
        <Row style={{ border: '1px solid #E5E7EC', lineHeight: '32px' }}>
          <Col span={12} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.ownerEquity1').d('利润总额')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdProfitTotal}</div>
          </Col>

          <Col span={12} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.netProfit1').d('净利润')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdNetAmount}</div>
          </Col>
        </Row>
        <Row style={{ border: '1px solid #E5E7EC', lineHeight: '32px' }}>
          <Col span={12} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.totalLiabilities').d('负债总额')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdDebitAmount}</div>
          </Col>

          <Col span={12} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.taxAmount').d('纳税总额')}
            </div>
            <div className={styles['risk-scan-form-item']}>{reportData?.stdTaxTotal}</div>
          </Col>
        </Row>
      </div>

      <div style={{ marginTop: '24px' }}>
        <div className={styles['risk-scan-basic-business-report-h2-title']}>
          {intl.get('sdat.riskScanReport.view.title.debtInformation').d('债务信息')}
        </div>
        <CommonTable dataSet={liabilitiesDS} columns={liabilitiesColumns()} />
      </div>

      <div style={{ marginTop: '24px' }}>
        <div className={styles['risk-scan-basic-business-report-h2-title']}>
          {intl.get('sdat.riskScanReport.view.title.shareholderInfo').d('股东信息')}
        </div>
        <CommonTable dataSet={shareholdersDS} columns={shareholdersColumns()} />
      </div>

      <div style={{ marginTop: '24px' }}>
        <div className={styles['risk-scan-basic-business-report-h2-title']}>
          {intl.get('sdat.riskScanReport.view.title.equityChangeInfo').d('股权变更信息')}
        </div>
        <CommonTable dataSet={equityChangeDS} columns={equityChangeColumns()} />
      </div>

      <div style={{ marginTop: '24px' }}>
        <div className={styles['risk-scan-basic-business-report-h2-title']}>
          {intl.get('sdat.riskScanReport.view.title.outboundInvestmentInfo').d('对外投资信息')}
        </div>
        <CommonTable dataSet={investmentDS} columns={investmentColumns()} />
      </div>
    </div>
  );
}
