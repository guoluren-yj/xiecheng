/**
 * BusinessInfo - 企业认证预览-业务信息
 * @date: 2018-12-18
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Row, Col, Checkbox } from 'hzero-ui';
import intl from 'utils/intl';
import ItemWrapper from './ItemWrapper';
import styles from './index.less';

export default class BusinessInfo extends React.PureComponent {
  render() {
    const { business = {}, showBusinessUrlImg } = this.props;
    const {
      saleFlag, // 主要身份，销售
      purchaseFlag, // 主要身份，采购
      manufacturerFlag, // 经营性质，是否制造商
      traderFlag, // 经营性质，是否贸易商
      servicerFlag, // 经营性质，是否服务商
      agentFlag, // 代理商，是否为代理商
      dealerFlag, // 经营性质，是否为经销商
      industryList = [],
      industryCategoryList = [],
      serviceAreaList = [],
      website,
      logoUrl,
      description,
      interBusinessShield,
      integrationFlag,
      contractorFlag,
    } = business;
    // 主要身份
    const businessTypeValue = [];
    if (saleFlag === 1) {
      businessTypeValue.push(intl.get('spfm.partnership.model.partnership.supplier').d('销售'));
    }
    if (purchaseFlag === 1) {
      businessTypeValue.push(intl.get('spfm.partnership.model.partnership.purchaser').d('采购'));
    }
    // 经营性质
    const serviceTypeValue = [];
    if (manufacturerFlag === 1) {
      serviceTypeValue.push(
        intl.get('spfm.certificationApproval.model.detailForm.manufuctuerFlag').d('制造商')
      );
    }
    if (traderFlag === 1) {
      serviceTypeValue.push(
        intl.get('spfm.certificationApproval.model.detailForm.traderFlag').d('贸易商')
      );
    }
    if (servicerFlag === 1) {
      serviceTypeValue.push(
        intl.get('spfm.certificationApproval.model.detailForm.servicerFlag').d('服务商')
      );
    }
    if (agentFlag === 1) {
      serviceTypeValue.push(
        intl.get('spfm.certificationApproval.model.detailForm.agentFlag').d('代理商')
      );
    }
    if (integrationFlag === 1) {
      serviceTypeValue.push(
        intl.get('spfm.certificationApproval.model.detailForm.integration').d('集成商')
      );
    }
    if (contractorFlag === 1) {
      serviceTypeValue.push(
        intl.get('spfm.certificationApproval.model.detailForm.contractor').d('承包商')
      );
    }
    if (dealerFlag === 1) {
      serviceTypeValue.push(
        intl.get('spfm.certificationApproval.model.detailForm.dealer').d('经销商')
      );
    }
    return (
      <ItemWrapper
        title={intl.get('spfm.certificationApproval.view.title.businessInfo').d('基础业务信息')}
        message={intl
          .get('spfm.business.view.message.description')
          .d(
            '提示: 业务信息将会出现在您的主页上，丰富的内容有助于提高您的资质，便于更多企业快速阅览，促进交易'
          )}
      >
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.certificationApproval.model.detailForm.primaryIdentity').d('主要身份')}
          </span>
          <div className={styles['fields-content']}>
            {businessTypeValue
              .map((item) => {
                return item;
              })
              .join('、')}
          </div>
        </Row>
        <Row className={styles['item-Row']}>
          <Col span={24}>
            <Checkbox disabled checked={interBusinessShield === 1}>
              {intl
                .get(`spfm.enterprise.model.message.interBusinessShield`)
                .d('不允许其他企业找到我')}
            </Checkbox>
          </Col>
          <Col span={24} style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
            {intl
              .get('spfm.enterprise.model.message.interBusinessShieldInfo')
                .d('若勾选，其他用户将无法在【发现供应商】和【发现采购方】查询到当前企业')}
          </Col>
        </Row>
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.certificationApproval.model.detailForm.businessNature').d('经营性质')}
          </span>
          <div className={styles['fields-content']}>
            {serviceTypeValue
              .map((item) => {
                return item;
              })
              .join('、')}
          </div>
        </Row>
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.certificationApproval.model.detailForm.industryList').d('行业类型')}
          </span>
          <div className={styles['fields-content']}>
            {industryList
              .map((item) => {
                return item.industryName;
              })
              .join('、')}
          </div>
        </Row>
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.certificationApproval.model.detailForm.categoryList').d('主营品类')}
          </span>
          <div className={styles['fields-content']}>
            {industryCategoryList
              .map((item) => {
                return item.categoryName;
              })
              .join('、')}
          </div>
        </Row>
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl
              .get('spfm.certificationApproval.model.detailForm.serviceAreaList')
              .d('送货服务范围')}
          </span>
          <div className={styles['fields-content']}>
            {serviceAreaList
              .map((item) => {
                return item.serviceAreaMeaning;
              })
              .join('、')}
          </div>
        </Row>
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.certificateAuthority.model.detailForm.website').d('公司官网')}
          </span>
          <div className={styles['fields-content']}>{website}</div>
        </Row>
        {logoUrl && (
          <Row className={styles['item-Row']}>
            <a
              onClick={() => {
                showBusinessUrlImg(logoUrl);
              }}
            >
              {intl.get('spfm.enterprise.view.message.logo').d('公司 Logo')}
            </a>
          </Row>
        )}
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.certificateAuthority.model.detailForm.description').d('公司简介')}
          </span>
          <div className={styles['fitelds-conten']}>{description}</div>
        </Row>
      </ItemWrapper>
    );
  }
}
