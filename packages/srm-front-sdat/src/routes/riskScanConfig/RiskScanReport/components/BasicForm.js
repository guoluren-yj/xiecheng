import React from 'react';
import intl from 'utils/intl';
import { Row, Col } from 'choerodon-ui/pro';
import {} from '../stores/monitorDS';
import styles from './index.less';

export default function BasicForm({ companyDetail, loading }) {
  return (
    <div style={{ display: loading ? 'none' : 'block' }}>
      <div className={styles['rick-scan-basic-form']}>
        <Row style={{ border: '1px solid #E5E7EC', lineHeight: '32px' }}>
          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.uscc').d('统一社会信用代码')}
            </div>
            <div className={styles['risk-scan-form-item']}>{companyDetail?.stdCreditNo ?? ''}</div>
          </Col>

          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.industry').d('所属行业')}
            </div>
            <div className={styles['risk-scan-form-item']}>{companyDetail?.stdDomain ?? ''}</div>
          </Col>

          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.legalRepresent').d('法定代表人')}
            </div>
            <div className={styles['risk-scan-form-item']}>{companyDetail?.stdOperName ?? ''}</div>
          </Col>
        </Row>

        <Row style={{ border: '1px solid #E5E7EC', borderTop: 'unset', lineHeight: '32px' }}>
          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.businessType').d('企业类型')}
            </div>
            <div className={styles['risk-scan-form-item']}>{companyDetail?.stdEconKind ?? ''}</div>
          </Col>

          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.registeredCapital').d('注册资本')}
            </div>
            <div className={styles['risk-scan-form-item']}>
              {companyDetail?.stdRegistCapi ?? ''}
            </div>
          </Col>

          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.paidInCapital').d('实缴资本')}
            </div>
            <div className={styles['risk-scan-form-item']}>
              {companyDetail?.stdActualCapi ?? ''}
            </div>
          </Col>
        </Row>

        <Row style={{ border: '1px solid #E5E7EC', borderTop: 'unset', lineHeight: '32px' }}>
          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.operatingPeriod').d('营业期限')}
            </div>
            <div className={styles['risk-scan-form-item']}>
              {`${companyDetail?.stdTermStart ?? ''} - ${companyDetail?.stdTermEnd ?? ''}`}
            </div>
          </Col>

          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.creationDate').d('成立日期')}
            </div>
            <div className={styles['risk-scan-form-item']}>{companyDetail?.stdStartDate ?? ''}</div>
          </Col>

          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.approvalDate').d('核准日期')}
            </div>
            <div className={styles['risk-scan-form-item']}>{companyDetail?.stdCheckDate ?? ''}</div>
          </Col>
        </Row>

        <Row style={{ border: '1px solid #E5E7EC', borderTop: 'unset', lineHeight: '32px' }}>
          <Col span={8} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']}>
              {intl.get('sdat.riskScanReport.view.title.registrationAuthority').d('登记机关')}
            </div>
            <div className={styles['risk-scan-form-item']}>{companyDetail?.stdBelongOrg ?? ''}</div>
          </Col>

          <Col span={16} style={{ display: 'flex' }}>
            <div className={styles['risk-scan-form-label']} style={{ marginRight: '-13px' }}>
              {intl.get('sdat.riskScanReport.view.title.regisAddress').d('注册地址')}
            </div>
            <div className={styles['risk-scan-form-item']} style={{ flex: '5' }}>
              {companyDetail?.stdAddress ?? ''}
            </div>
          </Col>
        </Row>

        <Row style={{ border: '1px solid #E5E7EC', borderTop: 'unset', display: 'flex' }}>
          <Col span={24} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              className={styles['risk-scan-form-label']}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                marginRight: '-16px',
              }}
            >
              {intl.get('sdat.riskScanReport.view.title.businessScope').d('经营范围')}
            </div>
            <div style={{ flex: '8', padding: '4px 16px', background: '#fff', color: '#4e5769' }}>
              {companyDetail?.stdScope ?? ''}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
