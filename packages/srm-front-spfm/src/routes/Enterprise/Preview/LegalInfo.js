/**
 * preview - 企业认证预览-登记信息
 * @date: 2018-12-18
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Row } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { round, isEmpty } from 'lodash';
import { dateRender } from 'utils/renderer';
import { getCurrentLanguage } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import ItemWrapper from './ItemWrapper';
import styles from './index.less';
import styles2 from '../Register/ProcessInfo.less';

const language = getCurrentLanguage();

export default class LegalInfo extends React.PureComponent {
  @Bind()
  renderProcessStatus(status) {
    switch (status) {
      case 'COMPLETE':
        return intl.get('spfm.approval.view.message.processStatus.complete').d('已认证');
      case 'SUBMIT':
      case 'APPROVING':
      case 'WFL_REJECT':
        return intl.get('spfm.approval.view.message.processStatus.submit').d('认证中');
      case 'REJECT':
        return intl.get('spfm.approval.view.message.processStatus.reject').d('认证失败');
      default:
        return intl.get('spfm.approval.view.message.processStatus.default').d('未认证');
    }
  }

  render() {
    const { basic = {}, showLegaInfoUrlImg } = this.props;
    const {
      companyName,
      companyTypeMeaning,
      certificationType,
      certificationTypeMeaning,
      certificationRegionIdMeaning,
      institutionalTypeMeaning,
      // companyEnglishName,
      unifiedSocialCode,
      registeredCountryName,
      registeredRegionName,
      legalRepName,
      registeredCapital,
      currencyName,
      buildDate,
      longTermFlag,
      licenceEndDate,
      businessScope,
      // shortName,
      domesticForeignRelation,
      dunsCode,
      organizingInstitutionCode,
      taxpayerTypeMeaning,
      businessRegistrationNumber,
      licenceUrl,
      addressDetail,
      processStatus,
      idTypeMeaning,
      idType,
      idNum,
      passport,
      idFrontUuid,
      idBackUuid,
      phone,
      internationalTelCode,
      internationalTelMeaning,
      email,
    } = basic;
    const formatValue =
      language === 'en_US'
        ? registeredCapital
          ? round(registeredCapital / 100, 8)
          : registeredCapital
        : registeredCapital;
    return (
      <ItemWrapper
        title={intl.get('spfm.certificationApproval.view.title.registerInfo').d('登记信息')}
        message={intl
          .get('spfm.enterprise.view.legalInfo.description')
          .d('适用于企业、个体工商户、事业单位等，通过营业执照等相关资质进行认证。')}
      >
        <div className={styles2['enterprise-status-info']}>
          {this.renderProcessStatus(processStatus)}
        </div>
        {/* <Divider dashed style={{ margin: '8px 0' }} /> */}
        {isEmpty(certificationType) && (
          <Row style={{ clear: 'both' }}>
            <span className={styles.fields}>
              {intl.get('sslm.common.modal.field.certificationRegion').d('认证地区')}
            </span>
            <div className={styles['fields-content']}>
              {domesticForeignRelation === 1
                ? intl.get('spfm.supplierManage.view.message.innerOrg').d('境内机构')
                : domesticForeignRelation === 0
                ? intl.get('spfm.supplierManage.view.message.outerOrg').d('境外机构')
                : intl.get('spfm.certificationApproval.view.select.personal').d('个人')}
            </div>
          </Row>
        )}
        {!isEmpty(certificationType) && (
          <Row style={{ clear: 'both' }}>
            <span className={styles.fields}>
              {intl.get('sslm.common.modal.field.certificationType').d('认证类型')}
            </span>
            <div className={styles['fields-content']}>{certificationTypeMeaning}</div>
          </Row>
        )}
        {certificationType && certificationType !== '2' && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('sslm.common.modal.field.certificationRegion').d('认证地区')}
            </span>
            <div className={styles['fields-content']}>{certificationRegionIdMeaning}</div>
          </Row>
        )}
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {domesticForeignRelation !== 2
              ? intl.get('spfm.enterprise.model.legal.companyName').d('企业名称')
              : intl.get('spfm.contactPerson.model.contactPerson.name').d('姓名')}
          </span>
          <div className={styles['fields-content']}>{companyName}</div>
        </Row>
        {domesticForeignRelation === 1 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.enterprise.model.legal.unifiedSocialCode').d('统一社会信用代码号')}
            </span>
            <div className={styles['fields-content']}>{unifiedSocialCode}</div>
          </Row>
        )}
        {domesticForeignRelation === 1 && ['COMPLETE'].includes(processStatus) && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.enterprise.model.legal.organizingInstitutionCode').d('组织机构代码')}
            </span>
            <div className={styles['fields-content']}>{organizingInstitutionCode}</div>
          </Row>
        )}
        {domesticForeignRelation === 0 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl
                .get('spfm.enterprise.model.legal.businessRegistrationNumber')
                .d('商业注册登记号/税号')}
            </span>
            <div className={styles['fields-content']}>{businessRegistrationNumber}</div>
          </Row>
        )}
        {domesticForeignRelation !== 2 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.enterprise.model.legal.dunsCode').d('邓白氏编码')}
            </span>
            <div className={styles['fields-content']}>{dunsCode}</div>
          </Row>
        )}
        {domesticForeignRelation === 1 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.enterprise.model.legal.institutionalType').d('机构类型')}
            </span>
            <div className={styles['fields-content']}>{institutionalTypeMeaning}</div>
          </Row>
        )}
        {domesticForeignRelation === 1 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.enterprise.model.legal.companyType').d('企业类型')}
            </span>
            <div className={styles['fields-content']}>{companyTypeMeaning}</div>
          </Row>
        )}
        {domesticForeignRelation !== 2 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.enterprise.model.legal.legalRepName').d('法定代表人')}
            </span>
            <div className={styles['fields-content']}>{legalRepName}</div>
          </Row>
        )}
        {domesticForeignRelation === 2 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.contactPerson.model.contactPerson.idType').d('证件类型')}
            </span>
            <div className={styles['fields-content']}>{idTypeMeaning}</div>
          </Row>
        )}
        {domesticForeignRelation === 2 && idType === 'I' && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('hzero.common.model.identityNum').d('身份证号')}
            </span>
            <div className={styles['fields-content']}>{idNum}</div>
          </Row>
        )}
        {domesticForeignRelation === 2 && idType !== 'I' && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.supplierRegister.model.legal.passportNum').d('护照号/通行证号')}
            </span>
            <div className={styles['fields-content']}>{passport}</div>
          </Row>
        )}
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.enterprise.view.message.registeredCountryRegion').d('注册国家/地区')}
          </span>
          <div className={styles['fields-content']}>
            {`${registeredCountryName} ${registeredRegionName}` || ''}
          </div>
        </Row>
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {domesticForeignRelation !== 2
              ? intl.get('spfm.enterprise.model.legal.registeredAddress').d('注册地址')
              : intl.get('spfm.supplierRegister.model.legal.contactDetail').d('联系地址')}
          </span>
          <div className={styles['fields-content']}>{addressDetail}</div>
        </Row>
        {domesticForeignRelation !== 2 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.enterprise.view.message.registeredCapital').d('注册资本')}
            </span>
            <div className={styles['fields-content']}>
              {`${
                registeredCapital === undefined
                  ? intl.get('hzero.common.currency.none').d('无')
                  : `${formatValue}(${intl.get(`spfm.common.currency.ten.thousand`).d('万')})`
              }`}
            </div>
          </Row>
        )}
        {domesticForeignRelation !== 2 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.enterprise.view.message.currencyCode').d('注册资本币种')}
            </span>
            <div className={styles['fields-content']}>
              {currencyName || intl.get('hzero.common.currency.cny').d('人民币')}
            </div>
          </Row>
        )}
        {domesticForeignRelation === 1 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.enterprise.model.legal.taxpayerType').d('纳税人标识')}
            </span>
            <div className={styles['fields-content']}>{taxpayerTypeMeaning}</div>
          </Row>
        )}
        {domesticForeignRelation === 2 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.contactPerson.model.contactPerson.mobilephone').d('手机号码')}
            </span>
            <div className={styles['fields-content']}>
              {internationalTelCode && phone ? `${internationalTelMeaning} | ${phone}` : phone}
            </div>
          </Row>
        )}
        {domesticForeignRelation === 2 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.contactPerson.model.contactPerson.mail').d('邮箱')}
            </span>
            <div className={styles['fields-content']}>{email}</div>
          </Row>
        )}
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {domesticForeignRelation === 2
              ? intl.get('spfm.supplierRegister.model.legal.effectiveDateFrom').d('证件有效期从')
              : intl.get('spfm.enterprise.view.message.buildDate').d('成立日期')}
          </span>
          <div className={styles['fields-content']}>{dateRender(buildDate)}</div>
        </Row>
        {domesticForeignRelation === 2 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.supplierRegister.model.legal.effectiveDateTo').d('证件有效期至')}
            </span>
            <div className={styles['fields-content']}>
              {longTermFlag ? (
                <span>
                  {intl.get('spfm.certificationApproval.model.detailForm.longTermFlag').d('长期')}
                </span>
              ) : (
                <span>{licenceEndDate}</span>
              )}
            </div>
          </Row>
        )}
        {domesticForeignRelation === 1 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.enterprise.view.message.licenceEndDate').d('营业期限')}
            </span>
            <div className={styles['fields-content']}>
              {longTermFlag ? (
                <span>
                  {intl.get('spfm.certificationApproval.model.detailForm.longTermFlag').d('长期')}
                </span>
              ) : (
                <span>{dateRender(licenceEndDate)}</span>
              )}
            </div>
          </Row>
        )}
        {domesticForeignRelation !== 2 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.enterprise.view.message.businessScope').d('经营范围')}
            </span>
            <div className={styles['fields-content']}>{businessScope}</div>
          </Row>
        )}
        {domesticForeignRelation !== 2 && licenceUrl && (
          <Row className={styles['item-Row']}>
            <a
              onClick={() => {
                showLegaInfoUrlImg(licenceUrl);
              }}
            >
              {intl.get('spfm.certificationApproval.view.checkLicense').d('查看营业执照')}
            </a>
          </Row>
        )}
        {domesticForeignRelation === 2 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.supplierRegister.view.title.nationalEmblem').d('身份证国徽面')}
            </span>
            <div className={styles['fields-content']}>
              <Upload
                viewOnly
                bucketName={PRIVATE_BUCKET}
                attachmentUUID={idFrontUuid}
                filePreview
              />
            </div>
          </Row>
        )}
        {domesticForeignRelation === 2 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('spfm.supplierRegister.view.title.portraitFace').d('身份证人像面')}
            </span>
            <div className={styles['fields-content']}>
              <Upload
                viewOnly
                bucketName={PRIVATE_BUCKET}
                attachmentUUID={idBackUuid}
                filePreview
              />
            </div>
          </Row>
        )}
        {domesticForeignRelation !== 2 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('sslm.common.model.field.localName').d('企业本土名称')}
            </span>
            <div className={styles['fields-content']}>{basic.localName}</div>
          </Row>
        )}
        {domesticForeignRelation !== 2 && (
          <Row className={styles['item-Row']}>
            <span className={styles.fields}>
              {intl.get('sslm.common.model.field.localAddress').d('企业本土地址')}
            </span>
            <div className={styles['fields-content']}>{basic.localAddress}</div>
          </Row>
        )}
      </ItemWrapper>
    );
  }
}
