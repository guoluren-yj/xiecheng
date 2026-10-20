/*
 * @Date: 2022-06-13 15:07:21
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';
import { Modal } from 'choerodon-ui/pro';
import React, { useState, useCallback } from 'react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import { ReactComponent as PhoneImg } from '@/assets/certification/phone.svg';
import { ReactComponent as ArtificialImg } from '@/assets/certification/artificial.svg';
import { ReactComponent as ManualReviewPendingImg } from '@/assets/certification/manual-review-pending.svg';
import { ReactComponent as ManualReviewSuccessImg } from '@/assets/certification/manual-review-success-new.svg';
import { ReactComponent as ManualReviewFailImg } from '@/assets/certification/manual-review-fail-new.svg';
import { ReactComponent as PlayCertificationPendingImg } from '@/assets/certification/play-certification-pending-new.svg';
import { ReactComponent as PlayCertificationSuccessImg } from '@/assets/certification/play-certification-success-new.svg';
import { ReactComponent as PlayCertificationFailImg } from '@/assets/certification/manual-review-fail.svg';
import { ReactComponent as EmailImg } from '@/assets/certification/email.svg';
import { ReactComponent as BankImg } from '@/assets/certification/bank.svg';
import { ReactComponent as SuccessImg } from '@/assets/certification/success-new.svg';
import UploadModal from './components/UploadModal';
import styles from './index.less';

export const getImgSrcComponent = name => {
  switch (name) {
    case 'phoneImg':
      return <PhoneImg />;
    case 'artificialImg':
      return <ArtificialImg />;
    case 'manualReviewPendingImg':
      return <ManualReviewPendingImg />;
    case 'manualReviewSuccessImg':
      return <ManualReviewSuccessImg />;
    case 'manualReviewFailImg':
      return <ManualReviewFailImg />;
    case 'playCertificationPendingImg':
      return <PlayCertificationPendingImg />;
    case 'playCertificationSuccessImg':
      return <PlayCertificationSuccessImg />;
    case 'playCertificationFailImg':
      return <PlayCertificationFailImg />;
    case 'emailImg':
      return <EmailImg />;
    case 'bankImg':
      return <BankImg />;
    case 'successImg':
      return <SuccessImg />;
    default:
      break;
  }
};

// 整合state
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

// 步骤条集合
export const stepsList = () => [
  {
    key: 'certification',
    title: intl.get('spfm.supplierRegister.view.title.certification').d('实名认证'),
  },
  {
    key: 'affiliated',
    title: intl
      .get('spfm.enterpriseCertification.view.title.enterpriseCertification')
      .d('企业认证'),
  },
  {
    key: 'main-info',
    title: intl.get(`spfm.supplierRegister.view.title.enterpriseMainInfo`).d('企业主要信息'),
  },
  {
    key: 'secondary-info',
    title: intl.get(`spfm.supplierRegister.view.title.enterpriseSecondaryInfo`).d('企业次要信息'),
  },
  {
    key: 'investigation',
    title: intl.get(`spfm.supplierRegister.view.title.investigation`).d('补充调查表'),
  },
  {
    key: 'apply-manager',
    title: intl.get(`spfm.supplierRegister.view.title.applicantManager`).d('管理员申请'),
  },
  {
    key: 'preview',
    title: intl.get(`spfm.supplierRegister.view.title.preview`).d('预览'),
  },
];

// 实名认证方式
export const certificationMethod = () => [
  {
    imgSrc: 'phoneImg',
    key: 'ID',
    title: intl
      .get('spfm.enterpriseCertification.view.title.certificateAndPhoneCheck')
      .d('证件&手机验证'),
    tips: intl.get('spfm.enterpriseCertification.view.tips.recommend').d('推荐'),
    help: intl
      .get('spfm.enterpriseCertification.view.help.certificateAndPhoneCheckMsg')
      .d('需要您提供身份证以及身份证关联的手机号，非身份证用户需要额外补充银行卡信息。'),
    okText: intl.get('spfm.supplierRegister.view.okbtn.certification').d('实名认证'),
  },
  {
    imgSrc: 'artificialImg',
    key: 'MANPOWER',
    title: intl.get('spfm.enterpriseCertification.view.title.manualReview').d('人工审核'),
    help: intl
      .get('spfm.enterpriseCertification.view.help.manualReviewMsg')
      .d('需上传能够证明个人身份的有效证件。人工审核一般需要3~5个工作日，请耐心等待'),
    okText: intl.get('hzero.common.button.submit').d('提交'),
  },
];

// 实名认证结果
export const certificationResult = (remark, orcBtttonHidden = false) => [
  {
    status: 'APPROVING',
    imgSrc: 'successImg',
    title: intl.get('spfm.enterpriseCertification.view.title.systemApprovaling').d('系统审核中'),
    help: intl
      .get('spfm.enterpriseCertification.view.title.systemApprovalingMsg')
      .d('已提交平台管理员审批中，请耐心等待。如超过三个工作日未审核，可拨打400-116-0808电话咨询'),
  },
  {
    status: 'SUCCESS',
    imgSrc: 'manualReviewSuccessImg',
    title: intl
      .get('spfm.enterpriseCertification.view.title.systemApprovalSuccess')
      .d('系统审核成功'),
    help: orcBtttonHidden
      ? intl
          .get('spfm.enterpriseCertification.view.title.realNameSuccessNoOrcMsg')
          .d('实名认证成功，可以进行下一步填写您当前任职的企业信息')
      : intl
          .get('spfm.enterpriseCertification.view.title.systemApprovalSuccessMsg')
          .d('实名认证成功，可以上传营业执照通过OCR识别自动录入当前任职的企业信息'),
  },
  {
    status: 'REJECT',
    imgSrc: 'manualReviewFailImg',
    title: intl
      .get('spfm.enterpriseCertification.view.title.systemApprovalFail')
      .d('系统审核失败，请重新认证'),
    help: intl
      .get('spfm.enterpriseCertification.view.title.systemApprovalFailMsg', {
        name: remark,
      })
      .d(`失败原因：${remark}`),
  },
];

// 企业验证方式
export const enterpriseCheckMethod = (emailFlag = 1, accountFlag = 1, materialFlag = 1) => [
  {
    imgSrc: 'emailImg',
    key: 'EMAIL',
    title: intl.get('spfm.enterpriseCertification.view.title.emailCheck').d('企业邮箱验证'),
    tips: intl.get('spfm.enterpriseCertification.view.tips.recommend').d('推荐'),
    help: intl
      .get('spfm.enterpriseCertification.view.title.emailCheckMsg')
      .d('请输入带有企业后缀的邮箱进行验证，例如@going-link.com'),
    showFlag: emailFlag,
  },
  {
    imgSrc: 'bankImg',
    key: 'REMIT',
    title: intl.get('spfm.enterpriseCertification.view.title.accountTransfer').d('对公账户打款'),
    help: intl
      .get('spfm.enterpriseCertification.view.title.accountTransferMsg')
      .d('需要先输入银行账户，收到打款后需输入回款金额进行验证'),
    showFlag: accountFlag,
  },
  {
    imgSrc: 'artificialImg',
    key: 'MANPOWER',
    title: intl.get('spfm.enterpriseCertification.view.title.materialReview').d('人工材料审核'),
    help: intl
      .get('spfm.enterpriseCertification.view.title.materialReviewMsg')
      .d('需要上传传您作为该企业员工的相关身份证明附件'),
    showFlag: materialFlag,
  },
];

// 企业验证结果
export const enterpriseCheckResult = (params = {}) => {
  const {
    remark,
    noRelieveFlag,
    companyName,
    lastUpdateDate,
    publicExistFlag,
    subdomainsPartnerFlag,
    attestationType,
  } = params;
  // 人工材料
  const artificialMaterials = ['MANPOWER'].includes(attestationType);
  // 邮箱验证
  const email = ['EMAIL'].includes(attestationType);
  // 对公打款
  const remit = ['REMIT'].includes(attestationType);
  // 材料认证提交时间，是否超过3天
  let threeDaysAfter = false;
  if (lastUpdateDate) {
    threeDaysAfter =
      moment(lastUpdateDate).add(3, 'days') < moment(new Date(), 'YYYY-MM-DD HH:mm:ss');
  }
  return [
    {
      status: 'APPROVING',
      imgSrc: 'successImg',
      title: artificialMaterials
        ? intl.get('spfm.enterpriseCertification.view.title.materialsApprovaling').d('材料审核中')
        : intl.get('spfm.enterpriseCertification.view.title.systemApprovaling').d('系统审核中'),
      help: threeDaysAfter
        ? intl
            .get('spfm.enterpriseCertification.view.title.threeDaysAfterMsg')
            .d('您提交的材料已超过三个工作日未审核，可拨打400-116-0808电话咨询')
        : intl
            .get('spfm.enterpriseCertification.view.title.threeDaysMsg')
            .d(
              '已提交平台管理员审批中，请耐心等待。如超过三个工作日未审核，可重新登录该页面获取客服电话进行咨询'
            ),
    },
    {
      status: 'REMITTING',
      imgSrc: 'playCertificationPendingImg',
      title: intl.get('spfm.enterpriseCertification.view.title.paying').d('打款中，请耐心等待'),
      help: intl
        .get('spfm.enterpriseCertification.view.title.payingMsg')
        .d('打款一般在24小时内完成，请及时查收并填写回款'),
    },
    {
      status: 'TO_PAY_SUCCESS',
      imgSrc: 'playCertificationSuccessImg',
      title: intl.get('spfm.enterpriseCertification.view.title.paySuccess').d('打款成功'),
      help: intl
        .get('spfm.enterpriseCertification.view.title.paySuccessMsg')
        .d(
          '打款成功，请及时填写回款，如未接收到回款或者回款已失效，可以回到上一步重新选择验证方式'
        ),
    },
    {
      status: 'TO_PAY_FAIL',
      imgSrc: 'playCertificationFailImg',
      title: intl.get('spfm.enterpriseCertification.view.title.payFail').d('打款失败'),
      help: intl
        .get('spfm.enterpriseCertification.view.title.payFailMsg')
        .d('第三方系统打款失败，请重试或联系客服人员'),
    },
    {
      status: 'SUCCESS',
      imgSrc: 'manualReviewSuccessImg',
      title: artificialMaterials
        ? intl
            .get('spfm.enterpriseCertification.view.title.materialsApprovalSuccess')
            .d('材料提交成功，请继续认证')
        : email
        ? intl
            .get('spfm.enterpriseCertification.view.title.emailApprovalSuccess')
            .d('邮箱验证通过，请继续认证')
        : remit
        ? intl
            .get('spfm.enterpriseCertification.view.title.remitApprovalSuccess')
            .d('打款验证通过，请继续认证')
        : intl
            .get('spfm.enterpriseCertification.view.title.systemApprovalSuccess')
            .d('系统审核成功'),
      help: publicExistFlag
        ? intl
            .get('spfm.enterpriseCertification.view.help.companyExistsTips')
            .d(
              '您关联的企业已经进行过认证，您将看到平台已收集的一些企业信息，可能有部分信息暂不允许您进行修改，如需变更这些信息，请在认证通过后登录系统进行企业信息变更。'
            )
        : subdomainsPartnerFlag
        ? intl
            .get('spfm.enterpriseCertification.view.help.subDomainsPartnerTips')
            .d(
              '您关联的企业已经进行过认证，并和当前采购方建立了合作伙伴关系。将为您自动带出平台已收集的企业信息，暂不允许您手动修改。如需变更，请在认证通过后登录系统进行企业信息变更。'
            )
        : noRelieveFlag
        ? intl
            .get('spfm.enterpriseCertification.view.help.improveEnterpriseInfo', {
              companyName,
            })
            .d(`您已关联企业【${companyName}】并验证通过，可以进行下一步完善企业信息`)
        : intl
            .get('spfm.enterpriseCertification.view.help.enterpriseApprovalSuccessMsg')
            .d('可以进行下一步完善企业信息，也可重新关联企业。'),
    },
    {
      status: 'REJECT',
      imgSrc: 'manualReviewFailImg',
      title: artificialMaterials
        ? intl
            .get('spfm.enterpriseCertification.view.title.materialsApprovalFail')
            .d('材料审核不通过，请重新认证')
        : intl
            .get('spfm.enterpriseCertification.view.title.systemApprovalFail')
            .d('系统审核失败，请重新认证'),
      help: intl
        .get('spfm.enterpriseCertification.view.title.systemApprovalFailMsg', {
          name: remark,
        })
        .d(`失败原因：${remark}`),
    },
  ];
};

// 主要，次要信息导航栏
export const linkList = (params = {}) => {
  const secondaryInfoLinkList = getSecondaryInfoLinkList(params);
  const allLink = [
    {
      title: intl.get('spfm.enterprise.view.message.page.regInfo').d('登记信息'),
      key: 'regInfo',
      show: 'always',
    },
    ...secondaryInfoLinkList,
    {
      title: intl.get('spfm.enterpriseCertification.view.title.inviteInfo').d('邀约信息'),
      key: 'inviteInfo',
      show: 'always',
    },
    {
      title: intl.get('sslm.common.view.message.investigInfo').d('调查表信息'),
      key: 'investigationInfo',
      show: 'always',
    },
  ].filter(Boolean);
  return allLink;
};

// 获取次要信息导航栏
const getSecondaryInfoLinkList = (params = {}) => {
  const { configNameList = [] } = params;
  if (isEmpty(configNameList)) {
    return [];
  }
  const allLink = [
    {
      title: intl.get('spfm.business.view.message.title').d('基础业务信息'),
      key: 'spfm_company_business',
      tips: intl
        .get('spfm.supplierRegister.view.message.businessInfo')
        .d(
          '业务信息将会出现在您的主页上，丰富的内容有助于提高您的资质，便于更多企业快速阅览，促进交易。'
        ),
    },
    {
      title: intl.get('spfm.supplierRegister.view.title.contactInfo').d('联系人信息'),
      key: 'spfm_company_contact',
      tips: intl
        .get('spfm.supplierRegister.view.register.contactAtLastOne')
        .d('请至少填写一条联系人'),
    },
    {
      title: intl.get(`spfm.enterprise.view.message.page.addressInfo`).d('地址信息'),
      key: 'spfm_company_address',
      tips: intl
        .get('spfm.supplierRegister.view.register.addressAtLastOne')
        .d('请至少填写一条地址信息'),
    },
    {
      title: intl.get('spfm.enterprise.view.message.page.bankInfo').d('银行信息'),
      key: 'spfm_company_bank_account',
      tips: intl
        .get('spfm.supplierRegister.view.register.bankAtLastOne')
        .d('请至少填写一条银行信息'),
    },
    {
      title: intl.get('spfm.enterprise.view.message.page.invoiceInfo').d('开票信息'),
      key: 'spfm_company_invoice',
      tips: intl
        .get('spfm.supplierRegister.view.register.invoiceAtLastOne')
        .d('请至少填写一条开票信息'),
    },
    {
      title: intl.get('spfm.enterprise.view.message.page.financeInfo').d('财务信息'),
      key: 'spfm_company_fin',
      tips: intl
        .get('spfm.supplierRegister.view.register.financeAtLastOne')
        .d('请至少填写一条财务信息'),
    },
    {
      title: intl.get(`spfm.supplierRegister.view.title.attachmentInfo`).d('附件信息'),
      key: 'spfm_company_attachment',
      tips: intl
        .get('spfm.supplierRegister.view.register.attachmentAtLastOne')
        .d('请至少填写一条附件信息'),
    },
    {
      title: intl.get('spfm.enterpriseCertification.view.title.otherInfo').d('其他信息'),
      key: 'sslm_sup_change_other',
      // show: 'always',
    },
  ];
  return configNameList
    .map(i => {
      const link = allLink.find(l => l.key === i);
      if (link) {
        return link;
      } else {
        return false;
      }
    })
    .filter(Boolean);
};

// 主要身份
export const businessTypeMap = [
  { text: intl.get('spfm.enterprise.view.message.purchase').d('我要采购'), value: 'purchase' },
  { text: intl.get('spfm.enterprise.view.message.sale').d('我要销售'), value: 'sale' },
];

// 经营性质
export const serviceTypeMap = [
  {
    text: intl.get('spfm.enterprise.view.message.manufacturer').d('制造商'),
    value: 'manufacturer',
  },
  { text: intl.get('spfm.enterprise.view.message.trader').d('贸易商'), value: 'trader' },
  { text: intl.get('spfm.enterprise.view.message.servicer').d('服务商'), value: 'servicer' },
  { text: intl.get('spfm.enterprise.view.message.agent').d('代理商'), value: 'agent' },
  {
    text: intl.get('spfm.certificationApproval.model.detailForm.integration').d('集成商'),
    value: 'integration',
  },
  {
    text: intl.get('spfm.certificationApproval.model.detailForm.contractor').d('承包商'),
    value: 'contractor',
  },
  {
    text: intl.get('spfm.certificationApproval.model.detailForm.dealer').d('经销商'),
    value: 'dealer',
  },
];

/**
 * 格式化国际化手机号格式
 * internationalTelMeaning 国别码meaning字段
 * phone 手机号码
 */
export function formatInternationalTel(internationalTelMeaning, phone) {
  let value = phone;
  if (internationalTelMeaning && phone) {
    value = `${internationalTelMeaning} | ${phone}`;
  }
  return <span>{value}</span>;
}

// ocr识别
export function ocrRecognition({ dataSet, handleJumpDetail }) {
  Modal.open({
    title: intl.get(`spfm.enterprise.view.message.businessLicense`).d('上传营业执照'),
    movable: false,
    style: { width: 560 },
    border: false,
    className: styles['register-attachment-modal'],
    children: <UploadModal firstUploadFlag dataSet={dataSet} handleJumpDetail={handleJumpDetail} />,
    footer: null,
  });
}

// 判断境内外还是个人 0-境外 1-境内 2-个人
export const getDomesticForeignRelation = record => {
  if (record) {
    const certificationType = record.get('certificationType');
    const certificationRegionCode = record.get('certificationRegionId')?.countryCode;
    if (certificationType === '1' && certificationRegionCode !== 'CN') {
      return '0';
    } else if (certificationType === '1' && certificationRegionCode === 'CN') {
      return '1';
    } else if (certificationType === '2') {
      return '2';
    }
  }
};
