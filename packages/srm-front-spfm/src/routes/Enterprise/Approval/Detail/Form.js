import React, { PureComponent } from 'react';
import { Form, Input, Row, Col, Icon, Spin } from 'hzero-ui';
import { isEmpty, round } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { PRIVATE_BUCKET } from '_utils/config';
import {
  isTenantRoleLevel,
  getAccessToken,
  getUserOrganizationId,
  getCurrentLanguage,
} from 'utils/utils';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import failedImg from '@/assets/authentication-failed.svg';
import successImg from '@/assets/authentication-success.svg';

const FormItem = Form.Item;
const { TextArea } = Input;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const PURCHASE = 'purchase';
const SALE = 'sale';
const MANUFACTURER = 'manufacturer';
const TRADER = 'trader';
const SERVICER = 'servicer';
const AGENT = 'agent';
const INTEGRATION = 'integration';
const CONTRACTOR = 'contractor';
const DEALER = 'dealer';

const language = getCurrentLanguage();

export default class EnterpriseInfoForm extends PureComponent {
  @Bind()
  validator(rule, value, callback) {
    const { isReject } = this.props;
    if (isEmpty(value) && isReject) {
      callback(intl.get('spfm.certificationApproval.view.validate.approve').d('请填写审批意见'));
    }
    callback();
  }

  setCheckboxGroupValues = (data = []) =>
    data.map((n) => (n.enabledFlag === 1 ? n.key : undefined));

  domesticForeignRelationMeaning = {
    0: intl.get('spfm.certificationApproval.view.select.overseas').d('境外'),
    1: intl.get('spfm.certificationApproval.view.select.domestic').d('境内'),
    2: intl.get('spfm.certificationApproval.view.select.personal').d('个人'),
  };

  @Bind()
  handleMeaningList(typeList, flag) {
    let list = [];
    if (flag) {
      list = typeList.map((i) => {
        const object = this.businessTypeMap.find((n) => n.value === i);
        return object.text;
      });
    } else {
      list = typeList.map((i) => {
        const object = this.serviceTypeMap.find((n) => n.value === i);
        return object.text;
      });
    }
    return (list || []).join('、');
  }

  businessTypeMap = [
    { text: intl.get('spfm.enterprise.view.message.purchase').d('我要采购'), value: PURCHASE },
    { text: intl.get('spfm.enterprise.view.message.sale').d('我要销售'), value: SALE },
  ];

  serviceTypeMap = [
    {
      text: intl.get('spfm.enterprise.view.message.manufacturer').d('制造商'),
      value: MANUFACTURER,
    },
    { text: intl.get('spfm.enterprise.view.message.trader').d('贸易商'), value: TRADER },
    { text: intl.get('spfm.enterprise.view.message.servicer').d('服务商'), value: SERVICER },
    { text: intl.get('spfm.enterprise.view.message.agent').d('代理商'), value: AGENT },
    {
      text: intl.get('spfm.certificationApproval.model.detailForm.integration').d('集成商'),
      value: INTEGRATION,
    },
    {
      text: intl.get('spfm.certificationApproval.model.detailForm.contractor').d('承包商'),
      value: CONTRACTOR,
    },
    {
      text: intl.get('spfm.certificationApproval.model.detailForm.dealer').d('经销商'),
      value: DEALER,
    },
  ];

  render() {
    const {
      certificationStatus,
      appealReason,
      processMsg,
      form: { getFieldDecorator },
      suppressionWarning,
      dataSource = {},
      loading,
    } = this.props;
    const {
      companyName,
      companyTypeMeaning,
      institutionalTypeMeaning,
      registeredCountryName,
      registeredRegionName,
      addressDetail,
      legalRepName,
      registeredCapital,
      currencyName,
      phone,
      internationalTelCode,
      internationalTelMeaning,
      email,
      licenceEndDate,
      idFrontUuid,
      idBackUuid,
      buildDate,
      longTermFlag,
      businessScope,
      domesticForeignRelation,
      dunsCode,
      taxpayerType,
      taxpayerTypeMeaning,
      idType,
      idTypeMeaning,
      idNum,
      passport,
      businessRegistrationNumber,
      licenceUrl,
      industryList = [],
      industryCategoryList = [],
      serviceAreaList = [],
      saleFlag,
      purchaseFlag,
      manufacturerFlag,
      traderFlag,
      agentFlag,
      servicerFlag,
      dealerFlag,
      website,
      description,
      interBusinessShield,
      logoUrl,
      unifiedSocialCode,
      integrationFlag,
      contractorFlag,
    } = dataSource;
    // console.log(processMsg)
    // 重定向url
    const bucketName = PRIVATE_BUCKET;
    // 营业执照
    const licenceNewUrl = `${HZERO_FILE}/v1${
      isTenantRoleLevel() ? `/${getUserOrganizationId()}/` : '/'
    }files/redirect-url?bucketName=${bucketName}&url=${encodeURIComponent(
      licenceUrl
    )}&organizationId=${getUserOrganizationId()}&access_token=${getAccessToken()}&enableImageWatermark=1`;
    // logoUrl
    const logoNewUrl = `${HZERO_FILE}/v1${
      isTenantRoleLevel() ? `/${getUserOrganizationId()}/` : '/'
    }files/redirect-url?bucketName=${bucketName}&url=${encodeURIComponent(
      logoUrl
    )}&organizationId=${getUserOrganizationId()}&access_token=${getAccessToken()}`;

    const businessType = [];
    if (saleFlag === 1) businessType.push(SALE);
    if (purchaseFlag === 1) businessType.push(PURCHASE);
    const serviceType = [];
    if (manufacturerFlag === 1) serviceType.push(MANUFACTURER);
    if (traderFlag === 1) serviceType.push(TRADER);
    if (servicerFlag === 1) serviceType.push(SERVICER);
    if (agentFlag === 1) serviceType.push(AGENT);
    if (integrationFlag === 1) serviceType.push(INTEGRATION);
    if (contractorFlag === 1) serviceType.push(CONTRACTOR);
    if (dealerFlag === 1) serviceType.push(DEALER);

    const formatValue =
      language === 'en_US'
        ? registeredCapital
          ? round(registeredCapital / 100, 8)
          : registeredCapital
        : registeredCapital;
    return (
      <Spin spinning={loading}>
        <Form>
          <Row>
            <Col span={18}>
              <FormItem
                label={intl
                  .get('spfm.certificationApproval.model.detailForm.processMsg')
                  .d('审批意见')}
              >
                {getFieldDecorator('processMsg', {
                  rules: [{ validator: this.validator }],
                  initialValue: processMsg,
                })(
                  <TextArea
                    style={{ width: 700, verticalAlign: 'middle' }}
                    autosize
                    // rows={4}
                    onChange={suppressionWarning}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={18}>
              <FormItem
                label={intl
                  .get('spfm.certificationApproval.model.certification.appealReason')
                  .d('申诉原因')}
              >
                {getFieldDecorator('appealReason', {
                  initialValue: appealReason,
                })(<span>{appealReason}</span>)}
              </FormItem>
            </Col>
            {certificationStatus === 'FAIL' && (
              <Col span={6}>
                <img
                  alt=""
                  src={failedImg}
                  style={{ display: 'block', width: '140px', height: '120px' }}
                />
              </Col>
            )}
            {certificationStatus === 'PASS' && (
              <Col span={6}>
                <img
                  alt=""
                  src={successImg}
                  style={{ display: 'block', width: '140px', height: '120px' }}
                />
              </Col>
            )}
          </Row>
          <br />
          <h2>{intl.get('spfm.certificationApproval.view.title.companyInfo').d('企业信息')}</h2>
          <h3>{intl.get('spfm.certificationApproval.view.title.registerInfo').d('登记信息')}</h3>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem
                label={intl.get('sslm.common.modal.field.certificationRegion').d('认证地区')}
                {...formLayout}
              >
                <span>{this.domesticForeignRelationMeaning[domesticForeignRelation]}</span>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label={
                  domesticForeignRelation !== 2
                    ? intl.get('spfm.certificationApproval.model.detailForm.companyName').d('名称')
                    : intl.get('spfm.contactPerson.model.contactPerson.name').d('姓名')
                }
                {...formLayout}
              >
                {getFieldDecorator('companyName', { initialValue: companyName })(
                  <span>{companyName}</span>
                )}
              </FormItem>
            </Col>
          </Row>
          {domesticForeignRelation === 1 && (
            <Row gutter={8}>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get('spfm.enterprise.model.legal.unifiedSocialCode')
                    .d('统一社会信用代码号')}
                  {...formLayout}
                >
                  {getFieldDecorator('unifiedSocialCode', { initialValue: unifiedSocialCode })(
                    <span>{unifiedSocialCode}</span>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  label={intl.get('spfm.enterprise.model.legal.dunsCode').d('邓白氏编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('dunsCode', { initialValue: dunsCode })(
                    <span>{dunsCode}</span>
                  )}
                </FormItem>
              </Col>
            </Row>
          )}
          {domesticForeignRelation === 1 && (
            <Row gutter={8}>
              <Col span={6}>
                <FormItem
                  label={intl.get('spfm.enterprise.model.legal.institutionalType').d('机构类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('institutionalTypeMeaning', {
                    initialValue: institutionalTypeMeaning,
                  })(<span>{institutionalTypeMeaning}</span>)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  label={intl.get('spfm.enterprise.model.legal.companyType').d('企业类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('companyTypeMeaning', { initialValue: companyTypeMeaning })(
                    <span>{companyTypeMeaning}</span>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get('spfm.certificationApproval.model.detailForm.legalRepName')
                    .d('法定代表人')}
                  {...formLayout}
                >
                  {getFieldDecorator('legalRepName', { initialValue: legalRepName })(
                    <span>{legalRepName}</span>
                  )}
                </FormItem>
              </Col>
            </Row>
          )}
          {domesticForeignRelation === 0 && (
            <Row gutter={8}>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get('spfm.certificationApproval.model.detailForm.businessRegistrationNumber')
                    .d('商业注册登记号/税号')}
                  {...formLayout}
                >
                  {getFieldDecorator('businessRegistrationNumber', {
                    initialValue: businessRegistrationNumber,
                  })(<span>{businessRegistrationNumber}</span>)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  label={intl.get('spfm.enterprise.model.legal.dunsCode').d('邓白氏编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('dunsCode', { initialValue: dunsCode })(
                    <span>{dunsCode}</span>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get('spfm.certificationApproval.model.detailForm.legalRepName')
                    .d('法定代表人')}
                  {...formLayout}
                >
                  {getFieldDecorator('legalRepName', { initialValue: legalRepName })(
                    <span>{legalRepName}</span>
                  )}
                </FormItem>
              </Col>
            </Row>
          )}
          {domesticForeignRelation === 2 && (
            <Row gutter={8}>
              <Col span={6}>
                <FormItem
                  label={intl.get('spfm.contactPerson.model.contactPerson.idType').d('证件类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('idType', {
                    initialValue: idType,
                  })(<span>{idTypeMeaning}</span>)}
                </FormItem>
              </Col>
              {idType === 'I' && (
                <Col span={6}>
                  <FormItem
                    label={intl.get('hzero.common.model.identityNum').d('身份证号')}
                    {...formLayout}
                  >
                    {getFieldDecorator('idNum', {
                      initialValue: idNum,
                    })(<span>{idNum}</span>)}
                  </FormItem>
                </Col>
              )}
              {idType !== 'I' && (
                <Col span={6}>
                  <FormItem
                    label={intl
                      .get('spfm.supplierRegister.model.legal.passportNum')
                      .d('护照号/通行证号')}
                    {...formLayout}
                  >
                    {getFieldDecorator('passport', {
                      initialValue: passport,
                    })(<span>{passport}</span>)}
                  </FormItem>
                </Col>
              )}
            </Row>
          )}
          <Row gutter={8}>
            <Col span={6}>
              <FormItem
                label={intl
                  .get('spfm.certificationApproval.model.detailForm.country')
                  .d('注册国家')}
                {...formLayout}
              >
                {getFieldDecorator('registeredCountryName', {
                  initialValue: registeredCountryName,
                })(<span>{registeredCountryName}</span>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label={
                  domesticForeignRelation !== 2
                    ? intl.get('spfm.enterprise.model.legal.ProvincialAndUrbanAreas').d('省/市/区')
                    : intl.get('spfm.enterprise.model.legal.ProvincialAndUrbanAreas').d('省/市/区')
                }
                {...formLayout}
              >
                {getFieldDecorator('registeredRegionName', { initialValue: registeredRegionName })(
                  <span>{registeredRegionName}</span>
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label={
                  domesticForeignRelation !== 2
                    ? intl.get('spfm.enterprise.model.legal.registeredAddress').d('注册地址')
                    : intl.get('spfm.supplierRegister.model.legal.contactDetail').d('联系地址')
                }
                {...formLayout}
              >
                {getFieldDecorator('addressDetail', { initialValue: addressDetail })(
                  <span>{addressDetail}</span>
                )}
              </FormItem>
            </Col>
          </Row>
          {domesticForeignRelation !== 2 && (
            <Row gutter={8}>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get('spfm.certificationApproval.model.detailForm.registereCapital')
                    .d('注册资本(万)')}
                  {...formLayout}
                >
                  {getFieldDecorator('registeredCapital', { initialValue: registeredCapital })(
                    <span>{formatValue}</span>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label={intl.get('spfm.common.model.currency').d('币种')} {...formLayout}>
                  {getFieldDecorator('currencyName', { initialValue: currencyName })(
                    <span>{currencyName}</span>
                  )}
                </FormItem>
              </Col>
              {domesticForeignRelation === 1 && (
                <Col span={6}>
                  <FormItem
                    label={intl
                      .get('spfm.certificationApproval.model.detailForm.taxpayerType')
                      .d('纳税人标识')}
                    {...formLayout}
                  >
                    {getFieldDecorator('taxpayerType', { initialValue: taxpayerType })(
                      <span>{taxpayerTypeMeaning}</span>
                    )}
                  </FormItem>
                </Col>
              )}
              {domesticForeignRelation === 0 && (
                <Col span={6}>
                  <FormItem
                    label={intl
                      .get('spfm.certificationApproval.model.detailForm.buildDate')
                      .d('成立日期')}
                    {...formLayout}
                  >
                    {getFieldDecorator('buildDate', { initialValue: buildDate })(
                      <span>{dateRender(buildDate)}</span>
                    )}
                  </FormItem>
                </Col>
              )}
            </Row>
          )}
          {domesticForeignRelation === 1 && (
            <Row gutter={8}>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get('spfm.certificationApproval.model.detailForm.buildDate')
                    .d('成立日期')}
                  {...formLayout}
                >
                  {getFieldDecorator('buildDate', { initialValue: buildDate })(
                    <span>{dateRender(buildDate)}</span>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get('spfm.certificationApproval.model.detailForm.licenceEndDate')
                    .d('营业期限')}
                  {...formLayout}
                >
                  {getFieldDecorator('licenceEndDate', { initialValue: licenceEndDate })(
                    <span>{dateRender(licenceEndDate)}</span>
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get('spfm.certificationApproval.model.detailForm.longTermFlag')
                    .d('长期')}
                  {...formLayout}
                >
                  {getFieldDecorator('longTermFlag', {
                    initialValue: longTermFlag,
                  })(<span>{yesOrNoRender(longTermFlag)}</span>)}
                </FormItem>
              </Col>
            </Row>
          )}
          {domesticForeignRelation !== 2 && (
            <Row gutter={8} className="half-row">
              <Col span={12}>
                <FormItem
                  label={intl
                    .get('spfm.certificationApproval.model.detailForm.businessScope')
                    .d('经营范围')}
                  wrapperCol={{ span: 20 }}
                  labelCol={{ span: 4 }}
                >
                  {getFieldDecorator('businessScope', { initialValue: businessScope })(
                    <span>{businessScope}</span>
                  )}
                </FormItem>
              </Col>
            </Row>
          )}
          {domesticForeignRelation !== 2 && (
            <Row gutter={8}>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get(`spfm.supplierRegister.view.option.businessLicense`)
                    .d('营业执照')}
                  {...formLayout}
                >
                  {getFieldDecorator('licenceUrl', { initialValue: licenceUrl })(
                    <a
                      rel="noopener noreferrer"
                      target="_blank"
                      disabled={isEmpty(licenceUrl)}
                      href={licenceNewUrl}
                    >
                      <Icon type="download" />
                      {intl
                        .get('spfm.certificationApproval.model.detailForm.licenceUrl')
                        .d('营业执照扫描件')}
                    </a>
                  )}
                </FormItem>
              </Col>
            </Row>
          )}
          {domesticForeignRelation === 2 && (
            <>
              <Row gutter={8}>
                <Col span={6}>
                  <FormItem
                    label={intl
                      .get('spfm.contactPerson.model.contactPerson.mobilephone')
                      .d('手机号码')}
                    {...formLayout}
                  >
                    {getFieldDecorator('phone', { initialValue: phone })(
                      <span>
                        {internationalTelCode && phone
                          ? `${internationalTelMeaning} | ${phone}`
                          : phone}
                      </span>
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    label={intl.get('spfm.contactPerson.model.contactPerson.mail').d('邮箱')}
                    {...formLayout}
                  >
                    {getFieldDecorator('email', { initialValue: email })(<span>{email}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={8}>
                <Col span={6}>
                  <FormItem
                    label={intl
                      .get('spfm.supplierRegister.model.legal.effectiveDateFrom')
                      .d('证件有效期从')}
                    {...formLayout}
                  >
                    {getFieldDecorator('buildDate', { initialValue: buildDate })(
                      <span>{buildDate}</span>
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    label={intl
                      .get('spfm.supplierRegister.model.legal.effectiveDateTo')
                      .d('证件有效期至')}
                    {...formLayout}
                  >
                    {getFieldDecorator('licenceEndDate', { initialValue: licenceEndDate })(
                      <span>{licenceEndDate}</span>
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    label={intl
                      .get('spfm.certificationApproval.model.detailForm.longTermFlag')
                      .d('长期')}
                    {...formLayout}
                  >
                    {getFieldDecorator('longTermFlag', {
                      initialValue: longTermFlag,
                    })(<span>{yesOrNoRender(longTermFlag)}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={8}>
                <Col span={6}>
                  <FormItem
                    label={intl
                      .get('spfm.supplierRegister.view.title.nationalEmblem')
                      .d('身份证国徽面')}
                    {...formLayout}
                  >
                    {getFieldDecorator('idFrontUuid', { initialValue: idFrontUuid })(
                      <Upload
                        viewOnly
                        bucketName={PRIVATE_BUCKET}
                        // bucketDirectory="sslm-report-score"
                        attachmentUUID={idFrontUuid}
                        enableImageWatermark={1}
                        uploadData={() => ({ enableImageWatermark: 1 })}
                        filePreview
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    label={intl
                      .get('spfm.supplierRegister.view.title.portraitFace')
                      .d('身份证人像面')}
                    {...formLayout}
                  >
                    {getFieldDecorator('idBackUuid', { initialValue: idBackUuid })(
                      <Upload
                        viewOnly
                        bucketName={PRIVATE_BUCKET}
                        // bucketDirectory="sslm-report-score"
                        attachmentUUID={idBackUuid}
                        enableImageWatermark={1}
                        uploadData={() => ({ enableImageWatermark: 1 })}
                        filePreview
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </>
          )}
          <br />
          <h3>
            {intl.get('spfm.certificationApproval.view.title.businessInfo').d('基础业务信息')}
          </h3>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem
                label={intl
                  .get('spfm.certificationApproval.model.detailForm.primaryIdentity')
                  .d('主要身份')}
                {...formLayout}
              >
                {getFieldDecorator('primaryIdentity', {
                  initialValue: this.setCheckboxGroupValues([
                    { key: 'saleFlag', enabledFlag: saleFlag },
                    { key: 'purchaseFlag', enabledFlag: purchaseFlag },
                  ]),
                })(<span>{this.handleMeaningList(businessType, true)}</span>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label={intl
                  .get('spfm.certificationApproval.model.detailForm.businessNature')
                  .d('经营性质')}
                {...formLayout}
              >
                {getFieldDecorator('businessNature', {
                  initialValue: this.setCheckboxGroupValues([
                    { key: 'manufacturerFlag', enabledFlag: manufacturerFlag },
                    { key: 'traderFlag', enabledFlag: traderFlag },
                    { key: 'servicerFlag', enabledFlag: servicerFlag },
                    { key: 'agentFlag', enabledFlag: agentFlag },
                    { key: 'integrationFlag', enabledFlag: integrationFlag },
                    { key: 'contractorFlag', enabledFlag: contractorFlag },
                    { key: 'dealerFlag', enabledFlag: dealerFlag },
                  ]),
                })(<span>{this.handleMeaningList(serviceType, false)}</span>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={intl
                  .get('spfm.enterprise.model.message.interBusinessShield')
                  .d('不允许其他企业找到我')}
                {...formLayout}
              >
                {getFieldDecorator(`interBusinessShield`, {
                  initialValue: interBusinessShield === 1 ? 1 : 0,
                })(<span>{yesOrNoRender(interBusinessShield)}</span>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem
                label={intl
                  .get('spfm.certificationApproval.model.detailForm.industryList')
                  .d('行业类型')}
                {...formLayout}
              >
                {getFieldDecorator('industryList', {
                  initialValue: industryList.map((n) => n.industryName),
                })(<span>{(industryList.map((n) => n.industryName) || []).join('、')}</span>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem
                label={intl
                  .get('spfm.certificationApproval.model.detailForm.categoryList')
                  .d('主营品类')}
                {...formLayout}
              >
                {getFieldDecorator('industryCategoryList', {
                  initialValue: industryCategoryList.map((n) => n.categoryName),
                })(
                  <span>{(industryCategoryList.map((n) => n.categoryName) || []).join('、')}</span>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem
                label={intl
                  .get('spfm.certificationApproval.model.detailForm.serviceAreaList')
                  .d('送货服务范围')}
                {...formLayout}
              >
                {getFieldDecorator('serviceAreaList', {
                  initialValue: serviceAreaList.map((n) => n.serviceAreaMeaning),
                })(
                  <span>{(serviceAreaList.map((n) => n.serviceAreaMeaning) || []).join('、')}</span>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem
                label={intl.get('spfm.certificateAuthority.model.detailForm.website').d('公司官网')}
                {...formLayout}
              >
                {getFieldDecorator('website', { initialValue: website })(<span>{website}</span>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label={intl.get(`spfm.supplierRegister.view.title.companyLogo`).d('公司logo')}
                {...formLayout}
              >
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  disabled={isEmpty(logoUrl)}
                  href={logoNewUrl}
                >
                  <Icon type="download" />
                  {intl
                    .get('spfm.certificateAuthority.model.detailForm.logoUrl')
                    .d('下载公司 Logo')}
                </a>
              </FormItem>
            </Col>
          </Row>
          <Row gutter={8}>
            <FormItem
              label={intl
                .get('spfm.certificateAuthority.model.detailForm.description')
                .d('公司简介')}
              wrapperCol={{ span: 18 }}
              labelCol={{ span: 2 }}
            >
              {getFieldDecorator('description', { initialValue: description })(
                <span>{description}</span>
              )}
            </FormItem>
          </Row>
        </Form>
      </Spin>
    );
  }
}
