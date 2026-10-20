/**
 * 公司详情组件
 */
import React, { useState, useEffect } from 'react';
import { Icon, Popover, Spin } from 'choerodon-ui';
import { Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import Tips from '../Tips';
import './index.less';

import { fetchWideAreaDetail } from '@/services/wideAreaService';

const CompanyDetailComp = (props) => {
  const { companyId, companyArea } = props;

  const [companyDetail, setCompanyDetail] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchWideAreaDetail({ companyId })
      .then((res) => {
        setCompanyDetail(res || {});
      })
      .finally(() => {
        setLoading(false);
      });
  }, [companyId]);

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
      tagList.push(
        companyDetail.registeredCapital +
          intl.get(`smbl.wideAreaSourcing.modal.currency.thousand`).d('万')
      );
    }
    if (companyDetail.companyArea || companyDetail.province) {
      if (companyDetail.province === companyDetail.companyArea) {
        tagList.push(companyDetail.province);
      } else {
        tagList.push(`${companyDetail.province || ''}${companyDetail.companyArea || ''}`);
      }
    }
    if (companyDetail.buildDate) {
      tagList.push(companyDetail.buildDate);
    }
    if (companyDetail.companyTypeMeaning) {
      tagList.push(companyDetail.companyTypeMeaning);
    }

    return tagList.map((item) => {
      return <span key={item}>{item}</span>;
    });
  };

  // 生成经营性质

  const buildBusinessNature = (record) => {
    const result = [];
    if (record.manufacturerFlag) {
      result.push(intl.get('smbl.wideAreaSourcing.modal.manufacturer').d('制造商'));
    }
    if (record.traderFlag) {
      result.push(intl.get('smbl.wideAreaSourcing.modal.trader').d('贸易商'));
    }
    if (record.traderFlag) {
      result.push(intl.get('smbl.wideAreaSourcing.modal.servicer').d('服务商'));
    }
    if (record.agentFlag) {
      result.push(intl.get('smbl.wideAreaSourcing.modal.agent').d('代理商'));
    }
    if (record.integrationFlag) {
      result.push(intl.get('smbl.wideAreaSourcing.modal.integration').d('集成商'));
    }
    if (record.contractorFlag) {
      result.push(intl.get('smbl.wideAreaSourcing.modal.contractor').d('承包商'));
    }
    return result.toString();
  };

  return (
    <Spin spinning={loading}>
      <Tips
        showClose={false}
        title={intl
          .get('smbl.wideAreaSourcing.view.message.phone.tips')
          .d('请拨打平台电话 400-116-0808 咨询更多详情')}
      />
      <div className="company-content">
        <div className="company-title-card">
          <span className="company-title">{companyDetail?.companyName ?? '-'}</span>
          {companyDetail.operateStatus && (
            <span className="status-tag">{companyDetail.operateStatus}</span>
          )}
          {!!companyDetail.viewCount && (
            <span className="vasit-count-tag">
              <Icon type="trending_up" />
              {intl.get(`smbl.wideAreaSourcing.view.title.visitCount`).d('浏览数')}:
              {companyDetail.viewCount}
            </span>
          )}
        </div>

        <div className="company-tag-list">{drawTagList()}</div>

        <div className="company-description-row">
          {companyDetail.businessScope ? (
            <div className="company-description">
              {intl.get(`smbl.wideAreaSourcing.view.message.businessScope`).d('经营范围')}：
              <Popover
                content={
                  <div style={{ maxWidth: '700px' }}>{companyDetail.businessScope ?? ''}</div>
                }
              >
                {companyDetail.businessScope ?? ''}
              </Popover>
            </div>
          ) : (
            ''
          )}
        </div>

        <div className="company-detail-form">
          <Row className="company-detail-row">
            <Col span={9} className="company-detail-col company-detail-short-col">
              {intl.get(`smbl.wideAreaSourcing.modal.legalPerson`).d('法人')}
            </Col>
            <Col span={15} className="company-detail-col">
              {companyDetail?.legalRepName ?? '-'}
            </Col>
          </Row>

          <Row className="company-detail-row">
            <Col span={9} className="company-detail-col company-detail-short-col">
              {intl.get(`smbl.wideAreaSourcing.modal.socialCreditCode`).d('统一社会信用代码')}
            </Col>
            <Col span={15} className="company-detail-col">
              {companyDetail?.unifiedSocialCode ?? '-'}
            </Col>
          </Row>

          <Row className="company-detail-row">
            <Col span={9} className="company-detail-col company-detail-short-col">
              {intl.get(`smbl.wideAreaSourcing.modal.businessNature`).d('经营性质')}
            </Col>
            <Col span={15} className="company-detail-col">
              {buildBusinessNature(companyDetail)}
            </Col>
          </Row>

          <Row className="company-detail-row">
            <Col span={9} className="company-detail-col company-detail-short-col">
              {intl.get(`smbl.wideAreaSourcing.modal.industries`).d('行业类型')}
            </Col>
            <Col span={15} className="company-detail-col">
              {companyDetail?.industries ?? '-'}
            </Col>
          </Row>

          <Row className="company-detail-row">
            <Col span={9} className="company-detail-col company-detail-short-col">
              {intl.get(`smbl.wideAreaSourcing.modal.mainCategory`).d('主营品类')}
            </Col>
            <Col span={15} className="company-detail-col">
              {companyDetail?.industryCategories ?? '-'}
            </Col>
          </Row>

          <Row className="company-detail-row">
            <Col span={9} className="company-detail-col company-detail-short-col">
              {intl.get(`smbl.wideAreaSourcing.modal.serviceArea`).d('服务范围')}
            </Col>
            <Col span={15} className="company-detail-col">
              {companyDetail?.serviceArea ?? '-'}
            </Col>
          </Row>

          <Row className="company-detail-row">
            <Col span={9} className="company-detail-col company-detail-short-col">
              {intl.get(`smbl.wideAreaSourcing.model.officialWebsite`).d('官网')}
            </Col>
            <Col span={15} className="company-detail-col">
              {companyDetail?.website ?? '-'}
            </Col>
          </Row>

          <Row className="company-detail-row">
            <Col span={9} className="company-detail-col company-detail-short-col">
              {intl.get(`smbl.wideAreaSourcing.modal.email`).d('邮箱')}
            </Col>
            <Col span={15} className="company-detail-col">
              {companyDetail?.email ?? '-'}
            </Col>
          </Row>

          <Row className="company-detail-row">
            <Col span={9} className="company-detail-col company-detail-short-col">
              {intl.get(`smbl.wideAreaSourcing.modal.localArea`).d('所在地区')}
            </Col>
            <Col span={15} className="company-detail-col">
              {companyDetail?.companyArea ?? companyArea ?? '-'}
            </Col>
          </Row>

          <Row className="company-detail-row">
            <Col span={9} className="company-detail-col company-detail-short-col">
              {intl.get(`smbl.wideAreaSourcing.modal.address`).d('地址')}
            </Col>
            <Col span={15} className="company-detail-col">
              <Popover content={companyDetail?.address ?? '-'}>
                {companyDetail?.address ?? '-'}
              </Popover>
            </Col>
          </Row>
        </div>
      </div>
    </Spin>
  );
};

export default CompanyDetailComp;
