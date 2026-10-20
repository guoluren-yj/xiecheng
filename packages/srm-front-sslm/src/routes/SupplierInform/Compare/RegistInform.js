/**
 * RegistInform - 登记信息
 * @date: 2021-04-07
 * @author: xiaomei.lv <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Row, Col, Icon, Form } from 'hzero-ui';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { getAttachmentUrl, getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { round } from 'lodash';
import { formatInternationalTel } from '@/routes/components/utils';
import './style.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const organizationId = getCurrentOrganizationId();

const bucketDirectory = 'spfm-comp';

const locale = getCurrentLanguage()?.replace('_', '-');
const language = getCurrentLanguage();

export default class RegistInform extends Component {
  /**
   * 查看图片
   */
  @Bind()
  showUrlImgFun(url) {
    const imgUrl = getAttachmentUrl(url, PRIVATE_BUCKET, organizationId, bucketDirectory);
    const watermarkUrl = `${imgUrl}&enableImageWatermark=1`;
    window.open(watermarkUrl);
  }

  render() {
    const { data = {} } = this.props;
    const { domesticForeignRelation } = data;
    const fieldValue =
      language === 'en_US'
        ? data.registeredCapital
          ? round(data.registeredCapital / 100, 8)
          : data.registeredCapital
        : data.registeredCapital;
    return domesticForeignRelation !== 2 ? (
      <Form className="regist-form">
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.modal.field.certificationType').d('认证类型')}
            >
              {data.certificationTypeMeaning}
            </FormItem>
          </Col>
          {!data.certificationRegionId && (
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.enterpriseInform.view.model.companyInfo.address')
                  .d('认证地区')}
              >
                {data.domesticForeignRelationMeaning}
              </FormItem>
            </Col>
          )}
          {Boolean(data.certificationRegionId) && (
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label={intl.get('sslm.common.modal.field.certificationRegion').d('认证地区')}
              >
                {data.certificationRegionIdMeaning}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.companyInfo.companyName')
                .d('企业名称')}
            >
              <div
                style={{
                  color: data.companyNameFlag === 'UPDATE' && 'red',
                }}
              >
                {data.companyName}
              </div>
            </FormItem>
          </Col>
          {domesticForeignRelation === 1 && (
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.enterpriseInform.view.model.companyInfo.socialCode')
                  .d('统一社会信用代码')}
              >
                {data.unifiedSocialCode}
              </FormItem>
            </Col>
          )}
          {domesticForeignRelation === 0 && (
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.enterpriseInform.model.companyInfo.registrationNumber')
                  .d('企业注册登记号/税号')}
              >
                {data.businessRegistrationNumber}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.companyInfo.dunsCode')
                .d('邓白氏编码')}
            >
              {data.dunsCode}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.companyInfo.legalRepName')
                .d('法定代表人/负责人')}
            >
              <div style={{ color: data.legalRepNameFlag === 'UPDATE' && 'red' }}>
                {data.legalRepName}
              </div>
            </FormItem>
          </Col>
        </Row>
        {domesticForeignRelation === 1 && (
          <Row gutter={48}>
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.enterpriseInform.view.model.companyInfo.organizingCode')
                  .d('组织机构代码')}
              >
                {data.organizingInstitutionCode}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.enterpriseInform.view.model.companyInfo.institutionalType')
                  .d('机构类型')}
              >
                <div
                  style={{
                    color: data.institutionalTypeFlag === 'UPDATE' && 'red',
                  }}
                >
                  {data.institutionalTypeMeaning}
                </div>
              </FormItem>
            </Col>
          </Row>
        )}
        <Row>
          {domesticForeignRelation === 1 && (
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.enterpriseInform.view.model.companyInfo.companyType')
                  .d('企业类型')}
              >
                <div style={{ color: data.companyTypeFlag === 'UPDATE' && 'red' }}>
                  {data.companyTypeMeaning}
                </div>
              </FormItem>
            </Col>
          )}
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('spfm.enterprise.view.message.registeredCountryRegion')
                .d('注册国家/地区')}
            >
              <div style={{ color: data.registeredCountryIdFlag === 'UPDATE' && 'red' }}>
                {data.registeredCountryName}
              </div>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.companyInfo.ProvincialAndUrbanAreas')
                .d('省/市/区')}
            >
              <div style={{ color: data.registeredRegionIdFlag === 'UPDATE' && 'red' }}>
                {data.regionPathName}
              </div>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.companyInfo.registeredAddress')
                .d('注册地址')}
            >
              <div style={{ color: data.addressDetailFlag === 'UPDATE' && 'red' }}>
                {data.addressDetail}
              </div>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.companyInfo.regCapital')
                .d('注册资本(万)')}
            >
              <div style={{ color: data.registeredCapitalFlag === 'UPDATE' && 'red' }}>
                {fieldValue &&
                  parseFloat(fieldValue).toLocaleString(locale, {
                    maximumFractionDigits: 8,
                  })}
              </div>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.companyInfo.currencyCode')
                .d('注册资本币种')}
            >
              <div style={{ color: data.currencyNameFlag === 'UPDATE' && 'red' }}>
                {data.currencyName}
              </div>
            </FormItem>
          </Col>
        </Row>
        {domesticForeignRelation === 1 && (
          <Row gutter={48}>
            <Col span={12}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.enterpriseInform.view.model.companyInfo.taxpayerType')
                  .d('纳税人标识')}
              >
                <div style={{ color: data.taxpayerTypeFlag === 'UPDATE' && 'red' }}>
                  {data.taxpayerTypeMeaning}
                </div>
              </FormItem>
            </Col>
          </Row>
        )}
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.companyInfo.buildDate')
                .d('成立日期')}
            >
              <div style={{ color: data.buildDateFlag === 'UPDATE' && 'red' }}>
                {dateRender(data.buildDate)}
              </div>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.view.registInform.businessTerm').d('营业期限')}
            >
              <div style={{ color: data.licenceEndDateFlag === 'UPDATE' && 'red' }}>
                {dateRender(data.licenceEndDate)}
              </div>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.companyInfo.longTermFlag')
                .d('长期')}
            >
              <div style={{ color: data.longTermFlagFlag === 'UPDATE' && 'red' }}>
                {data.longTermFlag
                  ? intl.get('hzero.common.status.yes').d('是')
                  : intl.get('hzero.common.status.no').d('否')}
              </div>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.companyInfo.businessScope')
                .d('经营范围')}
            >
              <div style={{ color: data.businessScopeFlag === 'UPDATE' && 'red' }}>
                {data.businessScope}
              </div>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={
                domesticForeignRelation === 1
                  ? intl.get('spfm.enterprise.view.message.businessLicense').d('营业执照')
                  : intl
                      .get('spfm.enterprise.view.message.registrationCertificate')
                      .d('企业登记证件')
              }
            >
              {data.licenceUrl && (
                <a
                  onClick={() => this.showUrlImgFun(data.licenceUrl)}
                  style={{
                    color: data.licenceUrlFlag === 'UPDATE' && 'red',
                  }}
                >
                  <Icon type="download" />
                  {intl.get('sslm.enterpriseInform.view.model.companyInfo.viewPhoto').d('查看图片')}
                </a>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    ) : (
      <Form className="regist-form">
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.modal.field.certificationType').d('认证类型')}
            >
              {intl.get('sslm.enterpriseInform.model.companyInfo.personal').d('个人')}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.model.personal.name').d('姓名')}
            >
              <div
                style={{
                  color: data.companyNameFlag === 'UPDATE' && 'red',
                }}
              >
                {data.companyName}
              </div>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('spfm.enterprise.modal.personal.countryRegion').d('国家/地区')}
            >
              <div style={{ color: data.registeredCountryIdFlag === 'UPDATE' && 'red' }}>
                {data.registeredCountryName}
              </div>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.model.personal.registeredId').d('省市')}
            >
              <div style={{ color: data.registeredRegionIdFlag === 'UPDATE' && 'red' }}>
                {data.regionPathName}
              </div>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.model.personal.addressDetail').d('联系地址')}
            >
              <div style={{ color: data.addressDetailFlag === 'UPDATE' && 'red' }}>
                {data.addressDetail}
              </div>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.model.personal.mobilePhone').d('手机号')}
            >
              <div
                style={{
                  color:
                    (data.phoneFlag === 'UPDATE' || data.internationalTelCodeFlag === 'UPDATE') &&
                    'red',
                }}
              >
                {formatInternationalTel(data.internationalTelMeaning, data.phone)}
              </div>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.model.personal.email').d('邮箱')}
            >
              <div style={{ color: data.emailFlag === 'UPDATE' && 'red' }}>{data.email}</div>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
