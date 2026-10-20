/*
 * @Date: 2021-10-26 15:24:10
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useState, useCallback } from 'react';
import { pick, isEqual, compose, partialRight, uniqBy, map, round, compact } from 'lodash';
import { Icon } from 'hzero-ui';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { yesOrNoRender, dateRender, dateTimeRender } from 'utils/renderer';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import {
  getAttachmentUrl,
  getCurrentOrganizationId,
  getCurrentUser,
  getCurrentLanguage,
} from 'utils/utils';

import { formatInternationalTel, formatYesOrNo } from '@/routes/components/utils';

const bucketDirectory = 'spfm-comp';
const language = getCurrentLanguage();
const organizationId = getCurrentOrganizationId();
const locale = getCurrentUser()?.language?.replace('_', '-');

const showUrlImgFun = (url, enableImageWatermark) => {
  const imgUrl = getAttachmentUrl(url, PRIVATE_BUCKET, organizationId, bucketDirectory);
  const attachmentUrl = `${imgUrl}&enableImageWatermark=${enableImageWatermark}`;
  window.open(attachmentUrl);
};

export const useSetState = initialState => {
  const [state, set] = useState(initialState);
  const setState = useCallback(
    newState => {
      set(prevState => ({ ...prevState, ...newState }));
    },
    [set]
  );
  return [state, setState];
};

export const pickEquals = pickarry =>
  compose(
    compose(
      partialRight(isEqual, { length: 1 }),
      partialRight(pick, 'length'),
      partialRight(uniqBy, isEqual)
    ),
    partialRight(map, partialRight(pick, pickarry))
  );

/**
 * 获取平台级页签
 * @param {*} changeLevel 变更维度
 * @param {*} configName 页签名称
 * collapseCode - 对应个性化code
 */
export const getPlatformTabs = ({
  changeLevel,
  configName = [],
  source = '',
  hideConfigNames = [],
}) => {
  const platformTabsHidden = hideConfigNames || [];
  // 判断是否平台级
  const isPlatform = changeLevel === 'PLATFORM';
  // 平台级信息变更审批菜单
  const platformApproveFlag = source === 'enterpriseApprove';
  const platformList = [
    {
      configDescription: intl
        .get('sslm.enterpriseInform.view.model.companyInfo.title')
        .d('登记信息'),
      configName: 'registInform_platform',
      url: isPlatform
        ? 'com-basic-req/compare-company-basic'
        : 'sup-basic-req/compare-supplier-basic',
      oldKey: 'oldBasic',
      newKey: 'newBasic',
      only: true,
      tablist: [
        // 境内境外
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.address')
            .d('认证地区'),
          fieldCode: 'domesticForeignRelation',
          domesticForeignRelation: 'all',
          render: val =>
            val === 0
              ? intl.get('sslm.enterpriseInform.view.model.companyInfo.outerOrg').d('境外机构')
              : intl.get('sslm.enterpriseInform.view.model.companyInfo.innerOrg').d('境内机构'),
        },
        {
          fieldCode: 'certificationType',
          domesticForeignRelation: 'all',
          fieldDescription: intl.get('sslm.common.modal.field.certificationType').d('认证类型'),
          render: (value, record) => (value ? record.certificationTypeMeaning : '-'),
        },
        {
          fieldCode: 'certificationRegionId',
          domesticForeignRelation: 'all',
          fieldDescription: intl.get('sslm.common.modal.field.certificationRegion').d('认证地区'),
          render: (value, record) => (value ? record.certificationRegionIdMeaning : '-'),
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.companyName')
            .d('企业名称'),
          fieldCode: 'companyName',
          domesticForeignRelation: 'all',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.socialCode')
            .d('统一社会信用代码'),
          fieldCode: 'unifiedSocialCode',
          domesticForeignRelation: 1,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.model.companyInfo.registrationNumber')
            .d('企业注册登记号/税号'),
          fieldCode: 'businessRegistrationNumber',
          domesticForeignRelation: 0,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.dunsCode')
            .d('邓白氏编码'),
          fieldCode: 'dunsCode',
          domesticForeignRelation: 'all',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.legalRepName')
            .d('法定代表人/负责人'),
          fieldCode: 'legalRepName',
          domesticForeignRelation: 'all',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.organizingCode')
            .d('组织机构代码'),
          fieldCode: 'organizingInstitutionCode',
          domesticForeignRelation: 1,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.institutionalType')
            .d('机构类型'),
          fieldCode: 'institutionalTypeMeaning',
          domesticForeignRelation: 1,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.companyType')
            .d('企业类型'),
          fieldCode: 'companyTypeMeaning',
          domesticForeignRelation: 1,
        },
        {
          fieldDescription: intl.get('spfm.enterprise.modal.personal.countryRegion').d('国家/地区'),
          fieldCode: 'registeredCountryId',
          domesticForeignRelation: 'all',
          render: (val, record) => record.registeredCountryName,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.ProvincialAndUrbanAreas')
            .d('省/市/区'),
          fieldCode: 'registeredRegionId',
          domesticForeignRelation: 'all',
          render: (val, record) => record.registeredRegionName,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.registeredAddress')
            .d('注册地址'),
          fieldCode: 'addressDetail',
          domesticForeignRelation: 'all',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.regCapital')
            .d('注册资本(万)'),
          fieldCode: 'registeredCapital',
          domesticForeignRelation: 'all',
          render: val => {
            const value = language === 'en_US' ? (val ? round(val / 100, 8) : val) : val;
            return value && parseFloat(value).toLocaleString(locale, { maximumFractionDigits: 8 });
          },
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.currencyCode')
            .d('注册资本币种'),
          fieldCode: 'currencyName',
          domesticForeignRelation: 'all',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.taxpayerType')
            .d('纳税人标识'),
          fieldCode: 'taxpayerTypeMeaning',
          domesticForeignRelation: 1,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.buildDate')
            .d('成立日期'),
          fieldCode: 'buildDate',
          domesticForeignRelation: 'all',
          render: dateRender,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.registInform.businessTerm')
            .d('营业期限'),
          fieldCode: 'licenceEndDate',
          domesticForeignRelation: 1,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.longTermFlag')
            .d('长期'),
          fieldCode: 'longTermFlag',
          domesticForeignRelation: 1,
          render: val =>
            val === 1
              ? intl.get('hzero.common.status.yes').d('是')
              : intl.get('hzero.common.status.no').d('否'),
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.businessScope')
            .d('经营范围'),
          fieldCode: 'businessScope',
          domesticForeignRelation: 'all',
        },
        {
          fieldDescription: intl
            .get('spfm.enterprise.view.message.registrationCertificate')
            .d('企业登记证件'),
          fieldCode: 'licenceUrl',
          domesticForeignRelation: 0,
          render: (val, record) =>
            val && (
              <a
                onClick={() => showUrlImgFun(val, 1)}
                style={{
                  color: record.licenceUrlFlag === 'UPDATE' && 'red',
                }}
              >
                <Icon type="download" />
                {intl.get('sslm.enterpriseInform.view.model.companyInfo.viewPhoto').d('查看图片')}
              </a>
            ),
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.licenceUrl')
            .d('营业执照'),
          fieldCode: 'licenceUrl',
          domesticForeignRelation: 1,
          render: (val, record) =>
            val && (
              <a
                onClick={() => showUrlImgFun(val, 1)}
                style={{
                  color: record.licenceUrlFlag === 'UPDATE' && 'red',
                }}
              >
                <Icon type="download" />
                {intl.get('sslm.enterpriseInform.view.model.companyInfo.viewPhoto').d('查看图片')}
              </a>
            ),
        },
        {
          fieldDescription: intl.get('sslm.common.model.field.localName').d('企业本土名称'),
          fieldCode: 'localName',
          domesticForeignRelation: 'all',
        },
        {
          fieldDescription: intl.get('sslm.common.model.field.localAddress').d('企业本土地址'),
          fieldCode: 'localAddress',
          domesticForeignRelation: 'all',
        },
        // 个人
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.address')
            .d('认证地区'),
          fieldCode: 'domesticForeignRelation',
          domesticForeignRelation: 2,
          render: () => intl.get('sslm.enterpriseInform.model.companyInfo.personal').d('个人'),
        },
        {
          fieldDescription: intl.get('sslm.enterpriseInform.model.personal.name').d('姓名'),
          fieldCode: 'companyName',
          domesticForeignRelation: 2,
        },
        isPlatform && {
          fieldDescription: intl
            .get('sslm.enterpriseInform.model.personal.certificateType')
            .d('证件类型'),
          fieldCode: 'idTypeMeaning',
          domesticForeignRelation: 2,
        },
        isPlatform && {
          fieldCode: 'idNum',
          domesticForeignRelation: 2,
          render: (val, record) => record.idNum || record.passport,
        },
        {
          fieldDescription: intl.get('spfm.enterprise.modal.personal.countryRegion').d('国家/地区'),
          fieldCode: 'registeredCountryId',
          domesticForeignRelation: 2,
          render: (val, record) => record.registeredCountryName,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.companyInfo.registeredId')
            .d('注册地址'),
          fieldCode: 'registeredRegionId',
          domesticForeignRelation: 2,
          render: (val, record) => record.registeredRegionName,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.model.personal.addressDetail')
            .d('联系地址'),
          fieldCode: 'addressDetail',
          domesticForeignRelation: 2,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.model.personal.mobilePhone')
            .d('手机号'),
          fieldCode: 'phone',
          domesticForeignRelation: 2,
          render: (val, record) => (
            <div
              style={{
                color:
                  (record.objectFlag === 'CREATE' ||
                    record.phoneFlag === 'UPDATE' ||
                    record.internationalTelCodeFlag === 'UPDATE') &&
                  'red',
              }}
            >
              {formatInternationalTel(record.internationalTelMeaning, val)}
            </div>
          ),
        },
        {
          fieldDescription: intl.get('sslm.enterpriseInform.model.personal.email').d('邮箱'),
          fieldCode: 'email',
          domesticForeignRelation: 2,
        },
        isPlatform && {
          fieldDescription: intl
            .get('sslm.enterpriseInform.model.personal.validFrom')
            .d('证件有效期从'),
          fieldCode: 'buildDate',
          domesticForeignRelation: 2,
          render: dateRender,
        },
        isPlatform && {
          fieldDescription: intl
            .get('sslm.enterpriseInform.model.personal.validTo')
            .d('证件有效期至'),
          fieldCode: 'licenceEndDate',
          domesticForeignRelation: 2,
          render: dateRender,
        },
        isPlatform && {
          fieldDescription: intl.get('sslm.enterpriseInform.view.message.longTerm').d('长期'),
          fieldCode: 'longTermFlag',
          domesticForeignRelation: 2,
          render: val =>
            val === 1
              ? intl.get('hzero.common.status.yes').d('是')
              : intl.get('hzero.common.status.no').d('否'),
        },
        isPlatform && {
          fieldDescription: intl
            .get('spfm.enterprise.message.personal.idCardPositive')
            .d('身份证国徽面'),
          fieldCode: 'idFrontUuid',
          domesticForeignRelation: 2,
          render: val => (
            <UploadModal
              viewOnly
              attachmentUUID={val}
              filePreview
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="spfm-comp"
            />
          ),
        },
        isPlatform && {
          fieldDescription: intl
            .get('spfm.enterprise.message.personal.idCardReverse')
            .d('身份证人像面'),
          fieldCode: 'idBackUuid',
          domesticForeignRelation: 2,
          render: val => (
            <UploadModal
              viewOnly
              attachmentUUID={val}
              filePreview
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="spfm-comp"
            />
          ),
        },
      ].filter(Boolean),
      isPlatform,
      collapseCode: 'registInform',
    },
    {
      configDescription: intl
        .get('sslm.enterpriseInform.view.model.business.title')
        .d('基础业务信息'),
      configName: 'registeBusinessInform_platform',
      url: isPlatform
        ? 'com-business-req/compare-company-business'
        : 'sup-business-req/compare-supplier-business',
      oldKey: 'oldBusiness',
      newKey: 'newBusiness',
      only: true,
      isPlatform,
      collapseCode: 'registeBusinessInform',
      tablist: compact([
        isPlatform && {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.business.businessType')
            .d('主要身份'),
          fieldCode: 'businessType',
          render: (val, record) => {
            return (
              <div
                style={{
                  color:
                    (record.saleFlagFlag === 'UPDATE' || record.purchaseFlagFlag === 'UPDATE') &&
                    'red',
                }}
              >
                {`${
                  record.saleFlag === 1
                    ? intl.get('sslm.enterpriseInform.view.model.business.sale').d('我要销售')
                    : ''
                } ${
                  record.purchaseFlag === 1
                    ? intl.get('sslm.enterpriseInform.view.model.business.purchase').d('我要采购')
                    : ''
                }`}
              </div>
            );
          },
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.business.serviceType')
            .d('经营性质'),
          fieldCode: 'businessNature',
          render: (val, record) => {
            return (
              <div
                style={{
                  color:
                    (record.manufacturerFlagFlag === 'UPDATE' ||
                      record.traderFlagFlag === 'UPDATE' ||
                      record.servicerFlagFlag === 'UPDATE' ||
                      record.agentFlagFlag === 'UPDATE' ||
                      record.integrationFlagFlag === 'UPDATE' ||
                      record.contractorFlagFlag === 'UPDATE' ||
                      record.dealerFlagFlag === 'UPDATE') &&
                    'red',
                }}
              >
                {`${
                  record.manufacturerFlag === 1
                    ? intl.get('sslm.enterpriseInform.view.model.business.manufacturer').d('制造商')
                    : ''
                } ${
                  record.traderFlag === 1
                    ? intl.get('sslm.enterpriseInform.view.model.business.trader').d('贸易商')
                    : ''
                } ${
                  record.servicerFlag === 1
                    ? intl.get('sslm.enterpriseInform.view.model.business.servicer').d('服务商')
                    : ''
                } ${
                  record.agentFlag === 1
                    ? intl.get('sslm.enterpriseInform.model.business.agent').d('代理商')
                    : ''
                } ${
                  record.integrationFlag === 1
                    ? intl.get('sslm.enterpriseInform.view.model.business.integration').d('集成商')
                    : ''
                } ${
                  record.contractorFlag === 1
                    ? intl.get('sslm.enterpriseInform.view.model.business.contractor').d('承包商')
                    : ''
                } ${
                  record.dealerFlag === 1
                    ? intl.get('sslm.enterpriseInform.view.model.business.dealer').d('经销商')
                    : ''
                }`}
              </div>
            );
          },
        },
        isPlatform && {
          fieldDescription: intl
            .get('spfm.enterprise.model.message.interBusinessShield')
            .d('不允许其他企业找到我'),
          fieldCode: 'interBusinessShield',
          render: (val, record) => {
            return (
              <div style={{ color: record.interBusinessShieldFlag === 'UPDATE' && 'red' }}>
                {val === 1
                  ? intl.get('hzero.common.status.yes').d('是')
                  : intl.get('hzero.common.status.no').d('否')}
              </div>
            );
          },
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.business.industryReqList')
            .d('行业类型'),
          fieldCode: 'industryReqList',
          render: (val, record) => {
            return (
              <div style={{ color: record.industryFlag === 'UPDATE' && 'red' }}>
                {(val || []).map(({ industryName }) => industryName).join(',')}
              </div>
            );
          },
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.business.industryList')
            .d('主营品类'),
          fieldCode: 'industryCategoryReqList',
          render: (val, record) => {
            return (
              <div style={{ color: record.industryCategoryFlag === 'UPDATE' && 'red' }}>
                {(val || []).map(({ categoryName }) => categoryName).join(',')}
              </div>
            );
          },
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.business.serviceAreaReqList')
            .d('送货服务范围'),
          fieldCode: 'serviceAreaReqList',
          render: (val, record) => {
            return (
              <div style={{ color: record.serviceAreaFlag === 'UPDATE' && 'red' }}>
                {(val || []).map(({ serviceAreaMeaning }) => serviceAreaMeaning).join(',')}
              </div>
            );
          },
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.business.website')
            .d('公司官网'),
          fieldCode: 'website',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.business.logoUrl')
            .d('公司 Logo'),
          fieldCode: 'logoUrl',
          render: (val, record) =>
            val && (
              <a
                onClick={() => showUrlImgFun(val)}
                style={{
                  color: record.logoUrlFlag === 'UPDATE' && 'red',
                }}
              >
                <Icon type="download" />
                {intl.get('sslm.enterpriseInform.view.model.business.viewPhoto').d('查看图片')}
              </a>
            ),
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.business.description')
            .d('公司简介'),
          fieldCode: 'description',
        },
      ]),
    },
    {
      configDescription: intl
        .get('sslm.enterpriseInform.view.model.contactPerson.title')
        .d('联系人信息'),
      configName: 'contactInform_platform',
      url: isPlatform ? 'com-contacts-reqs/compare' : 'sup-contacts-reqs/compare',
      oldKey: 'oldContacts',
      newKey: 'newContacts',
      isTables: true,
      only:
        !configName.includes('sslmInvestgContact') &&
        !platformTabsHidden.includes('spfmCompanyContacts'),
      isPlatform,
      collapseCode: 'contactInform',
      tablist: compact([
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.contactPerson.name')
            .d('姓名'),
          fieldCode: 'name',
          width: 100,
        },
        !isPlatform && {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.contactPerson.gender')
            .d('性别'),
          fieldCode: 'gender',
          width: 80,
          render: val =>
            val === 1
              ? intl.get('hzero.common.status.male').d('男')
              : val === 0
              ? intl.get('hzero.common.status.female').d('女')
              : '',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.contactPerson.mail')
            .d('邮箱'),
          fieldCode: 'mail',
          width: 200,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.contactPerson.mobilephone')
            .d('手机号码'),
          fieldCode: 'mobilephone',
          width: 240,
          render: (val, record) => (
            <div
              style={{
                color:
                  (record.objectFlag === 'CREATE' ||
                    record.mobilephoneFlag === 'UPDATE' ||
                    record.internationalTelCodeFlag === 'UPDATE') &&
                  'red',
              }}
            >
              {formatInternationalTel(record.internationalTelMeaning, val)}
            </div>
          ),
        },
        !isPlatform && {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.contactPerson.contactType')
            .d('联系人类型'),
          fieldCode: 'contactTypeMeaning',
          width: 100,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.contactPerson.department')
            .d('部门'),
          fieldCode: 'department',
          width: 100,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.contactPerson.position')
            .d('职位'),
          fieldCode: 'position',
          width: 100,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.contactPerson.telephone')
            .d('固定电话'),
          fieldCode: 'telephone',
          width: 100,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.contactPerson.description')
            .d('备注'),
          fieldCode: 'description',
          width: 120,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.contactPerson.defaultFlag')
            .d('默认联系人'),
          fieldCode: 'defaultFlag',
          width: 80,
          render: yesOrNoRender,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.contactPerson.enabledFlag')
            .d('启用'),
          fieldCode: 'enabledFlag',
          width: 80,
          render: yesOrNoRender,
        },
      ]),
    },
    {
      configDescription: intl.get('sslm.enterpriseInform.view.model.address.title').d('地址信息'),
      configName: 'addressInform_platform',
      url: isPlatform ? 'com-address-reqs/compare' : 'sup-address-reqs/compare',
      isTables: true,
      oldKey: 'oldAddresses',
      newKey: 'newAddresses',
      only: !configName.includes('sslmInvestgAddress'),
      isPlatform,
      collapseCode: 'addressInform',
      tablist: [
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.address.countryName')
            .d('国家'),
          fieldCode: 'countryName',
          width: 120,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.address.regionPathName')
            .d('省/市/区'),
          fieldCode: 'regionPathName',
          width: 200,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.address.businessAddress')
            .d('经营地址'),
          fieldCode: 'addressDetail',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.address.postCode')
            .d('邮政编码'),
          fieldCode: 'postCode',
          width: 100,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.address.description')
            .d('地址备注'),
          fieldCode: 'description',
          width: 150,
        },
        {
          fieldDescription: intl.get('hzero.common.status.enable').d('启用'),
          fieldCode: 'enabledFlag',
          width: 80,
          render: yesOrNoRender,
        },
      ],
    },
    {
      configDescription: intl.get('sslm.enterpriseInform.view.model.bank.title').d('银行信息'),
      configName: 'bankInform_platform',
      url: isPlatform ? 'com-bank-acc-reqs/compare' : 'sup-bank-acc-reqs/compare',
      isTables: true,
      oldKey: 'oldBankAccounts',
      newKey: 'newBankAccounts',
      only: !configName.includes('sslmInvestgBankAccount'),
      isPlatform,
      collapseCode: 'bankInform',
      tablist: compact([
        {
          fieldDescription: intl.get('sslm.enterpriseInform.view.model.bank.bankCountry').d('国家'),
          fieldCode: 'bankCountryId',
          width: 100,
          render: (val, record) => (
            <div
              style={{
                color:
                  (record.objectFlag === 'CREATE' || record.bankCountryIdFlag === 'UPDATE') &&
                  'red',
              }}
            >
              {record.bankCountryName}
            </div>
          ),
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.bank.bankCode')
            .d('银行代码'),
          fieldCode: 'bankCode',
          width: 100,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.bank.bankName')
            .d('银行名称'),
          fieldCode: 'bankName',
          width: 150,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.bank.bankFirm')
            .d('联行行号'),
          fieldCode: 'bankFirm',
          width: 150,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.bank.bankBranchName')
            .d('开户行名称'),
          fieldCode: 'bankBranchName',
          width: 150,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.bank.bankAccountName')
            .d('账户名称'),
          fieldCode: 'bankAccountName',
          width: 150,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.bank.bankAccountNum')
            .d('银行账号'),
          fieldCode: 'bankAccountNum',
          width: 150,
        },
        {
          fieldDescription: intl.get('spfm.bank.model.bank.intlBankAccount').d('IBAN码'),
          fieldCode: 'intlBankAccountNum',
          width: 150,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.bank.accountNature')
            .d('账户性质'),
          fieldCode: 'accountNature',
          width: 160,
          render: (val, record) => record.accountNatureMeaning,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.bank.accountPurpose')
            .d('账户用途'),
          fieldCode: 'accountPurpose',
          width: 120,
          render: (val, record) => record.accountPurposeMeaning,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.bank.currencyName')
            .d('币种'),
          fieldCode: 'currencyId',
          width: 120,
          render: (val, record) => record.currencyIdMeaning,
        },
        !isPlatform && {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.bank.paymentType')
            .d('付款方式'),
          fieldCode: 'paymentType',
          width: 120,
          render: (val, record) => record.paymentTypeIdMeaning,
        },
        isPlatform &&
          platformApproveFlag && {
            fieldDescription: intl
              .get('sslm.enterpriseInform.view.model.bank.bankEnterpriseCode')
              .d('银企直联组织信息代码'),
            fieldCode: 'bankDirectLinkOrgInfoCode',
            width: 220,
          },
        isPlatform &&
          platformApproveFlag && {
            fieldDescription: intl
              .get('sslm.enterpriseInform.view.model.bank.payConfirmPhone')
              .d('打款确认人号码'),
            fieldCode: 'paymentConfirmPhone',
            width: 240,
            render: (val, record) => {
              const {
                objectFlag,
                paymentConfirmPhoneFlag,
                internationalTelCodeFlag,
                internationalTelMeaning,
              } = record;
              let value = val;
              if (internationalTelMeaning && val) {
                value = `${internationalTelMeaning} | ${val}`;
              }
              return (
                <div
                  style={{
                    color:
                      (objectFlag === 'CREATE' ||
                        paymentConfirmPhoneFlag === 'UPDATE' ||
                        internationalTelCodeFlag === 'UPDATE') &&
                      'red',
                  }}
                >
                  {value}
                </div>
              );
            },
          },
        {
          fieldDescription: intl.get('hzero.common.status.enable').d('启用'),
          fieldCode: 'enabledFlag',
          width: 80,
          render: yesOrNoRender,
        },
        {
          fieldDescription: intl.get('sslm.enterpriseInform.view.model.bank.master').d('主账号'),
          fieldCode: 'masterFlag',
          width: 80,
          render: yesOrNoRender,
        },
        {
          fieldDescription: intl.get('hzero.common.remark').d('备注'),
          fieldCode: 'remark',
          width: 200,
        },
      ]),
    },
    {
      configDescription: intl.get('sslm.enterpriseInform.view.model.invoice.title').d('开票信息'),
      configName: 'invoiceInform_platform',
      url: isPlatform ? 'com-invoice-reqs/compare' : 'sup-invoice-reqs/compare',
      only: true,
      oldKey: 'oldInvoice',
      newKey: 'newInvoice',
      isPlatform,
      collapseCode: 'invoiceInform',
      tablist: [
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.invoice.invoiceHeader')
            .d('发票头'),
          fieldCode: 'invoiceHeader',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.invoice.taxNumber')
            .d('税务登记号'),
          fieldCode: 'taxRegistrationNumber',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.invoice.depositBank')
            .d('开户行'),
          fieldCode: 'depositBank',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.invoice.bankAccountNum')
            .d('开户行账号'),
          fieldCode: 'bankAccountNum',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.invoice.taxAddress')
            .d('税务登记地址'),
          fieldCode: 'taxRegistrationAddress',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.invoice.taxPhone')
            .d('税务登记电话'),
          fieldCode: 'taxRegistrationPhone',
        },
        {
          fieldDescription: intl.get('sslm.common.model.invoice.taker').d('收票人'),
          fieldCode: 'receiver',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.invoice.receiveMail')
            .d('收票人邮箱'),
          fieldCode: 'receiveMail',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.invoice.receivePhone')
            .d('收票人手机号'),
          fieldCode: 'receivePhone',
          render: (val, record) => (
            <div
              style={{
                color:
                  (record.objectFlag === 'CREATE' ||
                    record.receivePhoneFlag === 'UPDATE' ||
                    record.internationalTelCodeFlag === 'UPDATE') &&
                  'red',
              }}
            >
              {formatInternationalTel(record.internationalTelMeaning, val)}
            </div>
          ),
        },
        {
          fieldDescription: intl.get('sslm.common.model.invoice.ticketAddress').d('收票地址'),
          fieldCode: 'receiveAddress',
        },
      ],
    },
    {
      configDescription: intl
        .get('sslm.enterpriseInform.view.model.financialStatus.title')
        .d('财务状况'),
      configName: 'financialInform_platform',
      url: isPlatform ? 'com-finance-reqs' : 'sup-finance-reqs/compare',
      only: !configName.includes('sslmInvestgFin'),
      isTables: true,
      oldKey: 'oldFinance',
      newKey: 'newFinance',
      isPlatform,
      collapseCode: 'financialInform',
      tablist: [
        {
          fieldDescription: intl.get('sslm.enterpriseInform.view.model.financial.year').d('年份'),
          fieldCode: 'year',
          width: 80,
          render: val => val || '-',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.model.supplierInform.currencyName')
            .d('币种'),
          fieldCode: 'currencyName',
          width: 130,
          render: val => val || '-',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.financial.totalAssets')
            .d('企业总资产(万)'),
          fieldCode: 'totalAssets',
          width: 130,
          render: val => {
            const value = language === 'en_US' ? (val ? round(val / 100, 4) : val) : val;
            return value
              ? parseFloat(value).toLocaleString(locale, { maximumFractionDigits: 4 })
              : '-';
          },
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.financial.totalLiabilities')
            .d('总负债(万)'),
          fieldCode: 'totalLiabilities',
          width: 110,
          render: val => {
            const value = language === 'en_US' ? (val ? round(val / 100, 4) : val) : val;
            return value
              ? parseFloat(value).toLocaleString(locale, { maximumFractionDigits: 4 })
              : '-';
          },
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.financial.currentAssets')
            .d('流动资产(万)'),
          fieldCode: 'currentAssets',
          width: 130,
          render: val => {
            const value = language === 'en_US' ? (val ? round(val / 100, 4) : val) : val;
            return value
              ? parseFloat(value).toLocaleString(locale, { maximumFractionDigits: 4 })
              : '-';
          },
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.financial.liabilities')
            .d('流动负债(万)'),
          fieldCode: 'currentLiabilities',
          width: 130,
          render: val => {
            const value = language === 'en_US' ? (val ? round(val / 100, 4) : val) : val;
            return value
              ? parseFloat(value).toLocaleString(locale, { maximumFractionDigits: 4 })
              : '-';
          },
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.financial.revenue')
            .d('营业收入(万)'),
          fieldCode: 'revenue',
          width: 120,
          render: val => {
            const value = language === 'en_US' ? (val ? round(val / 100, 4) : val) : val;
            return value
              ? parseFloat(value).toLocaleString(locale, { maximumFractionDigits: 4 })
              : '-';
          },
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.financial.netProfit')
            .d('净利润(万)'),
          fieldCode: 'netProfit',
          width: 120,
          render: val => {
            const value = language === 'en_US' ? (val ? round(val / 100, 4) : val) : val;
            return value
              ? parseFloat(value).toLocaleString(locale, { maximumFractionDigits: 4 })
              : '-';
          },
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.financial.assetRatio')
            .d('资产负债率'),
          fieldCode: 'assetLiabilityRatio',
          width: 120,
          render: val => (val > 0 ? `${(val * 100).toFixed(2)}%` : '--'),
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.financial.currentRatio')
            .d('流动比率'),
          fieldCode: 'currentRatio',
          width: 100,
          render: val => (val > 0 ? `${(val * 100).toFixed(2)}%` : '--'),
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.financial.totalRatio')
            .d('总资产收益率'),
          fieldCode: 'totalAssetsEarningsRatio',
          width: 120,
          render: val => (val > 0 ? `${(val * 100).toFixed(2)}%` : '--'),
        },
        {
          fieldDescription: intl.get('hzero.common.remark').d('备注'),
          fieldCode: 'remark',
          width: 200,
        },
      ],
    },
    {
      configDescription: intl
        .get('sslm.enterpriseInform.view.model.attachmentInfo.title')
        .d('附件信息'),
      configName: 'attachment_info',
      url: isPlatform ? 'com-attachment-reqs/compare' : 'sup-attachment-reqs/compare',
      only: !configName.includes('sslmInvestgAttachment'),
      isTables: true,
      oldKey: 'oldAttachments',
      newKey: 'newAttachments',
      isPlatform,
      collapseCode: 'attachmentInform',
      tablist: [
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.attachment.type')
            .d('附件类型'),
          fieldCode: 'attachmentFileType',
          width: 180,
          render: (val, record) => record.attachmentMeaning,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.attachment.desc')
            .d('附件描述'),
          fieldCode: 'description',
          width: 180,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.attachment.dueDate')
            .d('文件到期日'),
          fieldCode: 'endDate',
          width: 110,
          render: dateRender,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.attachment.longEffectiveFlag')
            .d('是否长期有效'),
          fieldCode: 'longEffectiveFlag',
          width: 110,
          render: val => formatYesOrNo(val),
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.attachment.lastUpdatedTime')
            .d('最后更新时间'),
          fieldCode: 'uploadDate',
          width: 140,
          render: dateTimeRender,
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.view.model.attachment.upload')
            .d('附件上传'),
          fieldCode: 'attachmentUuid',
          width: 130,
          render: val => (
            <UploadModal
              attachmentUUID={val}
              filePreview
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="spfm-comp"
              viewOnly
            />
          ),
        },
        {
          fieldDescription: intl.get('hzero.common.remark').d('备注'),
          fieldCode: 'remark',
          width: 200,
        },
      ],
    },
    {
      configDescription: intl
        .get('sslm.enterpriseInform.view.fixCatalog.supplierClassify')
        .d('供应商分类'),
      configName: 'supplier_classify',
      url: 'enterprise-change/detail/investigate-cate',
      isTables: true,
      only: !isPlatform,
      isPlatform: false,
      oldKey: 'oldFirmChangeCates',
      newKey: 'newFirmChangeCates',
      collapseCode: 'supplierClassify',
      tablist: [
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.model.supplierClassify.code')
            .d('供应商类型分类'),
          fieldCode: 'categoryCode',
        },
        {
          fieldDescription: intl
            .get('sslm.enterpriseInform.model.supplierClassify.describe')
            .d('供应商分类描述'),
          fieldCode: 'categoryDescription',
        },
        {
          fieldDescription: intl.get('hzero.common.status.isEnable').d('是否启用'),
          fieldCode: 'enabledFlag',
          render: val =>
            +val
              ? intl.get('hzero.common.status.yes').d('是')
              : intl.get('hzero.common.status.no').d('否'),
        },
      ],
    },
    {
      configDescription: intl
        .get('sslm.enterpriseInform.view.title.otherInformation')
        .d('其他信息'),
      configName: 'other_information',
      url: 'sup-change-others/firm-change/compare',
      oldKey: 'oldSupOther',
      newKey: 'newSupOther',
      only: !isPlatform,
      tablist: [],
      isPlatform,
      collapseCode: 'otherInform',
    },
  ];
  return platformList;
};
