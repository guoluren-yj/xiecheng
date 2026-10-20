/**
 * CompanyInfo - 供应商360度查询-公司logo和基本信息
 * @date: 2018-08-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Row, Col, Form, Tag } from 'hzero-ui';
import { connect } from 'dva';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { round } from 'lodash';
import { dateRender } from 'utils/renderer';
import { getAttachmentUrl, getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import './index.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const bucketDirectory = 'spfm-comp';
const language = getCurrentLanguage();
const locale = language?.replace('_', '-');

/**
 * 供应商360度查询 - 注册信息
 * @extends {Component} - React.Component
 * @reactProps {Object} companyInfo - 数据源
 * @return React.element
 */
@connect(({ user = {} }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
    fontFileId,
    componentColorList, // 组件主题列表
  } = themeConfigVO;
  if (enableThemeConfig) {
    const componentsColor = getComponentsThemeColor(componentColorList, colorCode);
    return {
      primaryColor: colorCode,
      linkColor: componentsColor['link-color'],
      anchorColor: componentsColor['anchor-primary-color'],
      fontFamily: `font-${fontFileId}`, // 字体
    };
  }
  return {};
})
@formatterCollections({ code: ['sslm.supplierDetail', 'hpfm.enterprise'] })
export default class CompanyInfo extends PureComponent {
  @Bind()
  showUrlImgFun(url) {
    const imgUrl = getAttachmentUrl(
      url,
      PRIVATE_BUCKET,
      getCurrentOrganizationId(),
      bucketDirectory
    );
    const watermarkUrl = `${imgUrl}&enableImageWatermark=1`;
    window.open(watermarkUrl);
  }

  @Bind()
  getForm(domesticForeignRelation) {
    const {
      form: { getFieldDecorator },
      companyInfo = {},
      linkColor,
    } = this.props;
    // 公司基本信息
    const { basic = {} } = companyInfo || {};
    const registeredCapital = basic && basic.registeredCapital;
    const value =
      language === 'en_US'
        ? registeredCapital
          ? round(registeredCapital / 100, 8)
          : registeredCapital
        : registeredCapital;
    const formatValue =
      value && parseFloat(value).toLocaleString(locale, { maximumFractionDigits: 8 });

    if (domesticForeignRelation === 1) {
      // 境内
      return (
        <Form className="ued-edit-form ued-common-form" id="registrationInfo">
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get('sslm.common.modal.field.certificationType').d('认证类型')}
              >
                {getFieldDecorator('certificationType')(
                  <div>{basic && basic.certificationTypeMeaning}</div>
                )}
              </FormItem>
            </Col>
            {basic && !basic.certificationRegionId && (
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierDetail.model.suDe.companyInfo.domeForeRelate')
                    .d('认证地区')}
                >
                  {getFieldDecorator('domesticForeignRelation')(
                    <div>
                      {intl.get('sslm.supplierDetail.model.suDe.companyInfo.domestic').d('境内')}
                    </div>
                  )}
                </FormItem>
              </Col>
            )}
            {basic && basic.certificationType !== '2' && Boolean(basic.certificationRegionId) && (
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.common.modal.field.certificationRegion').d('认证地区')}
                >
                  {getFieldDecorator('certificationRegionId')(
                    <div>{basic && basic.certificationRegionIdMeaning}</div>
                  )}
                </FormItem>
              </Col>
            )}
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get('sslm.supplierDetail.model.suDe.companyInfo.companyName').d('名称')}
              >
                {getFieldDecorator('companyName')(<div>{basic && basic.companyName}</div>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.unifiedSocialCode')
                  .d('统一社会信用代码')}
              >
                {getFieldDecorator('unifiedSocialCode')(
                  <div>{basic && basic.unifiedSocialCode}</div>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.companyInfo.organizingCode')
                  .d('组织机构代码')}
              >
                {getFieldDecorator('organizingInstitutionCode')(
                  <div>{basic && basic.organizingInstitutionCode}</div>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.companyInfo.dunsCode')
                  .d('邓白氏编码(DUNS)')}
              >
                {getFieldDecorator('dunsCode')(<div>{basic && basic.dunsCode}</div>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.enterpriseInform.view.model.companyInfo.institutionalType')
                  .d('机构类型')}
              >
                {getFieldDecorator('institutionalType')(
                  <div>{basic && basic.institutionalTypeMeaning}</div>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.enterpriseType')
                  .d('企业类型')}
              >
                {getFieldDecorator('companyType')(<div>{basic && basic.companyTypeMeaning}</div>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.legalRepName')
                  .d('法定代表人/负责人')}
              >
                {getFieldDecorator('legalRepName')(<div>{basic && basic.legalRepName}</div>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('spfm.certificationApproval.model.detailForm.country')
                  .d('注册国家')}
              >
                {getFieldDecorator('registeredCountryName')(
                  <div>{basic && basic.registeredCountryName}</div>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.ProvincialAndUrbanAreas')
                  .d('省/市/区')}
              >
                {getFieldDecorator('registeredRegionName')(
                  <div>{basic && basic.registeredRegionName}</div>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.registeredAddress')
                  .d('注册地址')}
              >
                {getFieldDecorator('addressDetail')(<div>{basic && basic.addressDetail}</div>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.registeredCapital')
                  .d('注册资本(万)')}
              >
                {getFieldDecorator('registeredCapital')(<div>{basic && formatValue}</div>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.currencyCode')
                  .d('注册资本币种')}
              >
                {getFieldDecorator('currencyName')(
                  <div>
                    {(basic && basic.currencyName) ||
                      intl.get('sslm.supplierDetail.view.currency.cny').d('人民币')}
                  </div>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.taxpayerType')
                  .d('纳税人标识')}
              >
                {getFieldDecorator('taxpayerType')(<div>{basic && basic.taxpayerTypeMeaning}</div>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.buildDate')
                  .d('成立日期')}
              >
                {getFieldDecorator('buildDate')(<div>{basic && dateRender(basic.buildDate)}</div>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.licenceEndDate')
                  .d('营业期限')}
              >
                {getFieldDecorator('licenceEndDate')(
                  <div>
                    {basic && +basic.longTermFlag
                      ? intl
                          .get('sslm.supplierDetail.model.suDe.companyInfo.longTermFlag')
                          .d('长期')
                      : basic && dateRender(basic.licenceEndDate)}
                  </div>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48} className="half-row">
            <Col span={12}>
              <FormItem
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.businessScope')
                  .d('经营范围')}
              >
                {getFieldDecorator('businessScope')(<div>{basic && basic.businessScope}</div>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get('hpfm.enterprise.view.message.businessLicense').d('营业执照')}
              >
                {getFieldDecorator('licenceUrl')(
                  <a
                    onClick={() => this.showUrlImgFun(basic && basic.licenceUrl)}
                    disabled={!(basic && basic.licenceUrl)}
                  >
                    {intl.get('hzero.common.title.checkAttach').d('查看附件')}
                    {basic && basic.licenceUrl && (
                      <Tag
                        color={linkColor || '#108ee9'}
                        style={{
                          height: 'auto',
                          lineHeight: '15px',
                          marginLeft: '4px',
                        }}
                      >
                        1
                      </Tag>
                    )}
                  </a>
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      );
    } else if (domesticForeignRelation === 0) {
      // 境外
      return (
        <Form className="ued-edit-form ued-common-form" id="registrationInfo">
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get('sslm.common.modal.field.certificationType').d('认证类型')}
              >
                {getFieldDecorator('certificationType')(
                  <div>{basic && basic.certificationTypeMeaning}</div>
                )}
              </FormItem>
            </Col>
            {!basic.certificationRegionId && (
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierDetail.model.suDe.companyInfo.domeForeRelate')
                    .d('认证地区')}
                >
                  {getFieldDecorator('domesticForeignRelation')(
                    <div>
                      {intl.get('sslm.supplierDetail.model.suDe.companyInfo.overseas').d('境外')}
                    </div>
                  )}
                </FormItem>
              </Col>
            )}
            {basic && basic.certificationType !== '2' && basic.certificationRegionId && (
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.common.modal.field.certificationRegion').d('认证地区')}
                >
                  {getFieldDecorator('certificationRegionId')(
                    <div>{basic && basic.certificationRegionIdMeaning}</div>
                  )}
                </FormItem>
              </Col>
            )}
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get('sslm.supplierDetail.model.suDe.companyInfo.companyName').d('名称')}
              >
                {getFieldDecorator('companyName')(<div>{basic && basic.companyName}</div>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.registrationNum')
                  .d('商业注册登记号/税号')}
              >
                {getFieldDecorator('businessRegistrationNumber')(
                  <div>{basic && basic.businessRegistrationNumber}</div>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.companyInfo.dunsCode')
                  .d('邓白氏编码(DUNS)')}
              >
                {getFieldDecorator('dunsCode')(<div>{basic && basic.dunsCode}</div>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.legalRepName')
                  .d('法定代表人/负责人')}
              >
                {getFieldDecorator('legalRepName')(<div>{basic && basic.legalRepName}</div>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('spfm.certificationApproval.model.detailForm.country')
                  .d('注册国家')}
              >
                {getFieldDecorator('registeredCountryName')(
                  <div>{basic && basic.registeredCountryName}</div>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.provincialAndUrbanAreas')
                  .d('省/市/区')}
              >
                {getFieldDecorator('registeredRegionName')(
                  <div>{basic && basic.registeredRegionName}</div>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.registeredAddress')
                  .d('注册地址')}
              >
                {getFieldDecorator('addressDetail')(<div>{basic && basic.addressDetail}</div>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.registeredCapital')
                  .d('注册资本(万)')}
              >
                {getFieldDecorator('registeredCapital')(<div>{basic && formatValue}</div>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.currencyCode')
                  .d('注册资本币种')}
              >
                {getFieldDecorator('currencyName')(
                  <div>
                    {(basic && basic.currencyName) ||
                      intl.get('sslm.supplierDetail.view.currency.cny').d('人民币')}
                  </div>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.buildDate')
                  .d('成立日期')}
              >
                {getFieldDecorator('buildDate')(<div>{basic && dateRender(basic.buildDate)}</div>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48} className="half-row">
            <Col span={12}>
              <FormItem
                label={intl
                  .get('sslm.supplierDetail.model.suDe.companyInfo.businessScope')
                  .d('经营范围')}
              >
                {getFieldDecorator('businessScope')(<div>{basic && basic.businessScope}</div>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get('hpfm.enterprise.view.message.businessLicense').d('营业执照')}
              >
                {getFieldDecorator('licenceUrl')(
                  <a
                    onClick={() => this.showUrlImgFun(basic && basic.licenceUrl)}
                    disabled={!(basic && basic.licenceUrl)}
                  >
                    {intl.get('hzero.common.title.checkAttach').d('查看附件')}
                    {basic && basic.licenceUrl && (
                      <Tag
                        color={linkColor || '#108ee9'}
                        style={{
                          height: 'auto',
                          lineHeight: '15px',
                          marginLeft: '4px',
                        }}
                      >
                        1
                      </Tag>
                    )}
                  </a>
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      );
    } else {
      // 个人
      return (
        <Form className="ued-edit-form ued-common-form" id="registrationInfo">
          <Row gutter={48} className="read-row">
            {basic.certificationType && (
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.common.modal.field.certificationType').d('认证类型')}
                >
                  {getFieldDecorator('certificationType')(
                    <div>{basic && basic.certificationTypeMeaning}</div>
                  )}
                </FormItem>
              </Col>
            )}
            {!basic.certificationType && (
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierDetail.model.suDe.companyInfo.domeForeRelate')
                    .d('认证地区')}
                >
                  {getFieldDecorator('domesticForeignRelation')(
                    <div>
                      {intl.get('sslm.supplierDetail.model.suDe.companyInfo.personal').d('个人')}
                    </div>
                  )}
                </FormItem>
              </Col>
            )}
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get('spfm.contactPerson.model.contactPerson.name').d('姓名')}
              >
                {getFieldDecorator('companyName')(<div>{basic && basic.companyName}</div>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('spfm.certificationApproval.model.detailForm.country')
                  .d('注册国家')}
              >
                {getFieldDecorator('registeredCountryName')(
                  <div>{basic && basic.registeredCountryName}</div>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get('sslm.enterpriseInform.model.personal.registeredId').d('省市')}
              >
                {getFieldDecorator('registeredRegionName')(
                  <div>{basic && basic.registeredRegionName}</div>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get('sslm.enterpriseInform.model.personal.addressDetail').d('联系地址')}
              >
                {getFieldDecorator('addressDetail')(<div>{basic && basic.addressDetail}</div>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get('spfm.contactPerson.model.contactPerson.mobilephone').d('手机号码')}
              >
                {getFieldDecorator('phone')(
                  <div>
                    {basic &&
                      (basic.internationalTelCode && basic.phone
                        ? `${basic.internationalTelMeaning} | ${basic.phone}`
                        : basic.phone)}
                  </div>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get('spfm.contactPerson.model.contactPerson.mail').d('邮箱')}
              >
                {getFieldDecorator('email')(<div>{basic && basic.email}</div>)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      );
    }
  }

  render() {
    const { form, companyInfo = {}, customizeForm } = this.props;
    // 公司基本信息
    const { basic = {} } = companyInfo || {};
    const domesticForeignRelation = basic && +basic.domesticForeignRelation;
    const customizeCode =
      domesticForeignRelation === 1
        ? 'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL_REGISTRATION_INFO'
        : domesticForeignRelation === 0
        ? 'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL_REGISTRATION_OVERSEAS'
        : 'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL_REGISTRATION_PERSONAL';
    return customizeForm(
      {
        code: customizeCode,
        form,
        dataSource: basic,
        readOnly: true,
      },
      this.getForm(domesticForeignRelation)
    );
  }
}
