/**
 * 公司详情组件
 */
import React from 'react';
import { Icon, Popover } from 'choerodon-ui';
import { Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import './index.less';

const CompanyDetailComp = (props) => {
  const { companyDetail = {}, corpName, viewCount = 0 } = props;

  /**
   * 绘制标签列表
   * @returns
   */
  const drawTagList = () => {
    const tagList = [];
    if (companyDetail.enterpriseType) {
      tagList.push(companyDetail.enterpriseType);
    }
    if (companyDetail.registeredCapital) {
      tagList.push(companyDetail.registeredCapital);
    }
    if (companyDetail.city || companyDetail.province) {
      if (companyDetail.province === companyDetail.city) {
        tagList.push(companyDetail.province);
      } else {
        tagList.push(`${companyDetail.province || ''}${companyDetail.city || ''}`);
      }
    }
    if (companyDetail.establishmentDate) {
      tagList.push(companyDetail.establishmentDate);
    }

    return tagList.map((item) => {
      return <span key={item}>{item}</span>;
    });
  };

  return (
    <>
      <div className="company-title-card">
        <span className="company-title">{companyDetail?.enterpriseName ?? corpName}</span>
        {companyDetail.operateStatus && (
          <span className="status-tag">{companyDetail.operateStatus}</span>
        )}
        {!!viewCount && (
          <span className="vasit-count-tag">
            <Icon type="trending_up" />
            {intl.get(`spfm.wideArea.view.title.visitCount`).d('浏览数')}:{viewCount}
          </span>
        )}
      </div>

      <div className="company-tag-list">{drawTagList()}</div>

      <div className="company-description-row">
        {companyDetail.businessScope ? (
          <Popover
            content={
              <div style={{ maxWidth: '800px' }}>
                {intl.get(`hpfm.enterprise.view.message.businessScope`).d('经营范围')}：
                {companyDetail?.businessScope ?? ''}
              </div>
            }
          >
            <div className="company-description">
              {intl.get(`hpfm.enterprise.view.message.businessScope`).d('经营范围')}：
              {companyDetail.businessScope ?? ''}
            </div>
          </Popover>
        ) : (
          ''
        )}
      </div>

      <div className="company-detail-form">
        <Row className="company-detail-row">
          <Col span={4} className="company-detail-col company-detail-short-col">
            {intl.get(`spfm.wideArea.modal.legalPerson`).d('法人')}
          </Col>
          <Col span={8} className="company-detail-col">
            {companyDetail?.legalRepresentative ?? '-'}
          </Col>
          <Col span={4} className="company-detail-col company-detail-short-col">
            {intl.get(`spfm.wideArea.modal.socialCreditCode`).d('统一社会信用代码')}
          </Col>
          <Col span={8} className="company-detail-col">
            {companyDetail?.unifiedSocialCreditCode ?? '-'}
          </Col>
        </Row>

        <Row className="company-detail-row">
          <Col span={4} className="company-detail-col company-detail-short-col">
            {intl.get(`spfm.wideArea.modal.phoneNumber`).d('电话')}
          </Col>
          <Col span={8} className="company-detail-col">
            {companyDetail?.telephone ?? '-'}
          </Col>
          <Col span={4} className="company-detail-col company-detail-short-col">
            {intl.get(`spfm.wideArea.modal.officialWebsite`).d('官网')}
          </Col>
          <Col span={8} className="company-detail-col">
            {companyDetail?.website ?? '-'}
          </Col>
        </Row>

        <Row
          className="company-detail-row"
          style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}
        >
          <Col span={4} className="company-detail-col company-detail-short-col">
            {intl.get(`spfm.wideArea.modal.email`).d('邮箱')}
          </Col>
          <Col span={8} className="company-detail-col">
            {companyDetail?.email ?? '-'}
          </Col>
          <Col span={4} className="company-detail-col company-detail-short-col">
            {intl.get(`spfm.wideArea.modal.address`).d('地址')}
          </Col>
          <Col span={8} className="company-detail-col">
            {companyDetail.address ? (
              <Popover
                content={<div style={{ maxWidth: '300px' }}>{companyDetail?.address ?? '-'} </div>}
              >
                <div>{companyDetail?.address ?? '-'} </div>
              </Popover>
            ) : (
              '-'
            )}
          </Col>
        </Row>
      </div>
    </>
  );
};

export default CompanyDetailComp;
