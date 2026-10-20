/*
 * @Descripttion: 寻源过程控制--DS
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 15:46:14
 * @LastEditors: Please set LastEditors
 */
import React from 'react';
import intl from 'utils/intl';
import { NOT_CHINA_PHONE, PHONE, EMAIL } from 'utils/regExp';
import { getCurrentOrganizationId, getCurrentTenant, getDateTimeFormat } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';
import { Tooltip } from 'choerodon-ui/pro';
import { isEmpty, isNil } from 'lodash';
import uuid from 'uuid/v4';

const organizationId = getCurrentOrganizationId();

// 基本信息
const basicFormDS = () => ({
  paging: false,
  autoQuery: true,
  fields: [
    {
      name: 'rfTitle',
      label: intl.get('ssrc.rfCheck.model.rfCheck.rfTitle').d('征询书标题'),
      disabled: true,
    },
    {
      name: 'rfName',
      label: intl.get(`ssrc.rfCheck.model.rfCheck.sourceProjectName`).d('寻源项目名称'),
    },
    {
      name: 'rfNum1',
      label: intl.get(`ssrc.rfCheck.model.rfCheck.sourceProjectNum`).d('寻源项目编号'),
    },
    {
      name: 'adjustRemark',
      label: intl.get('ssrc.bidChange.model.bidChange.changeDocument').d('变更说明'),
      required: true,
      maxLength: 500,
    },
    {
      name: 'adjustAttachmentUuid',
      type: 'string',
    },
  ],
});

// 征询范围
const inquiryScopeDS = ({ adjustRecordId }) => ({
  autoQuery: false,
  dataToJSON: 'all',
  primaryKey: 'rfLineSupplierAdjustId',
  // modifiedCheck: false,
  fields: [
    {
      label: intl.get(`ssrc.rfCheck.model.rfCheck.quotationNum`).d('供应商编码'),
      name: 'supplierCompanyNum',
    },
    {
      name: 'supplierCompanyId',
    },
    {
      label: intl.get(`ssrc.rfCheck.model.rfCheck.supplierName`).d('供应商名称'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`ssrc.rfCheck.model.rfCheck.stageDescription`).d('生命周期阶段'),
      name: 'stageDescription',
    },
    {
      name: 'contactNameLov',
      label: intl.get('ssrc.rfDetail.model.rfDetail.contact.person').d('联系人'),
      type: 'object',
      ignore: 'always',
      // required: true,
      textField: 'name',
      valueField: 'companyContactId',
      lovCode: 'SSRC.SUPPLIER_CONTANCTS',
      dynamicProps: {
        lovPara({ record }) {
          const supplierCompanyId = record.get('supplierCompanyId');

          return {
            tenantId: organizationId,
            supplierCompanyId,
          };
        },
      },
    },
    {
      name: 'supplierContactId',
      bind: 'contactNameLov.companyContactId',
    },
    {
      name: 'contactName',
      bind: 'contactNameLov.name',
    },
    // {
    //   name: 'contactPhoneContainer',
    //   label: intl.get('ssrc.rfDetail.model.rfDetail.contact.way').d('联系方式'),
    // },
    {
      name: 'contactPhone',
      required: true,
      label: intl.get('ssrc.rfDetail.model.rfDetail.contact.way').d('联系方式'),
      bind: 'contactNameLov.mobilephone',
      validator: (value, name, record) => {
        if (record?.get('internationalTelCode') && !isEmpty(value)) {
          const pattern =
            (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE;
          if (!pattern.test(value)) {
            return intl.get('ssrc.rf.view.validate.phone').d('请输入正确格式的手机号');
          }
        } else if (!record?.get('internationalTelCode') && !isEmpty(value)) {
          return intl.get('ssrc.rf.view.validate.phoneAreaCode').d('请选择区号');
        }
      },
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      bind: 'contactNameLov.internationalTelCode',
    },
    {
      name: 'contactMail',
      required: true,
      label: intl.get(`ssrc.rf.model.rf.contactMail`).d('邮箱'),
      bind: 'contactNameLov.mail',
      validator: (value, _, record) => {
        if (value && !EMAIL.test(record.get('contactMail'))) {
          return intl.get('hzero.common.validation.email').d('邮箱格式不正确');
        }
        return true;
      },
    },
    {
      name: 'rfLineSupplier',
      type: 'object',
    },
    {
      name: 'adjustFields',
      type: 'object',
      defaultValue: [],
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((item) => {
        if (item.get('addFlag') !== 1) {
          // eslint-disable-next-line no-param-reassign
          item.selectable = false;
        }
      });
    },
  },
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/supplier/adjust/details`,
      method: 'GET',
      data: {
        organizationId,
        adjustRecordId,
        customizeUnitCode: 'SSRC.INQUIRY_HALL.RF_CONTROL.SUPPLIER',
      },
    }),
    destroy: ({ data }) => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/supplier/adjust`,
      method: 'DELETE',
      data,
    }),
    submit: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf/supplier/adjust/save`,
        method: 'POST',
        params: {
          customizeUnitCode: 'SSRC.INQUIRY_HALL.RF_CONTROL.SUPPLIER',
        },
        data,
      };
    },
  },
});

// 征询阶段
const consultationDS = () => ({
  autoQuery: false,
  paging: false,
  // dataToJSON: 'all',
  fields: [
    {
      name: 'adjustFields',
      type: 'object',
      defaultValue: [],
    },
    {
      name: 'rfConfRuleOriginalDTO',
      type: 'object',
    },
    {
      name: 'nowAdjustedField',
      type: 'string',
    },
    // {
    //   name: 'quotationStartDate',
    //   label: intl.get('ssrc.rfController.model.consultation.quotationStartDate').d('征询开始时间'),
    //   type: 'dateTime',
    //   max: 'quotationEndDate',
    //   dynamicProps: {
    //     required: ({ record }) =>
    //       record.get('fieldPropertyDTOList')?.find?.((item) => item.name === 'quotationStartDate')
    //         ?.required,
    //     disabled: ({ record }) =>
    //       record.get('fieldPropertyDTOList')?.find?.((item) => item.name === 'quotationStartDate')
    //         ?.disabled,
    //   },
    // },
    // {
    //   name: 'quotationEndDate',
    //   label: intl.get('ssrc.rfController.model.consultation.quotationEndDate').d('征询结束时间'),
    //   type: 'dateTime',
    //   min: 'quotationStartDate',
    //   dynamicProps: {
    //     required: ({ record }) =>
    //       record.get('fieldPropertyDTOList')?.find?.((item) => item.name === 'quotationEndDate')
    //         ?.required,
    //     disabled: ({ record }) =>
    //       record.get('fieldPropertyDTOList')?.find?.((item) => item.name === 'quotationEndDate')
    //         ?.disabled,
    //   },
    // },
    {
      label: intl
        .get('ssrc.inquiryHall.model.inquiryHall.reply.minQuotedSupplier')
        .d('最少回复供应商数'),
      name: 'minQuotedSupplier',
      type: 'number',
      min: 0,
      step: 1,
    },
    {
      label: intl.get(`ssrc.rf.model.rf.clarifyEndDate`).d('澄清截止时间'),
      name: 'clarifyEndDate',
      type: 'dateTime',
      format: getDateTimeFormat(),
      dynamicProps: {
        disabled: ({ record }) =>
          record.get('fieldPropertyDTOList')?.find?.((item) => item.name === 'clarifyEndDate')
            ?.disabled,
      },
    },
    // 评分模版
    {
      name: 'templateLov',
      label: intl.get(`ssrc.rf.model.rf.templateLov`).d('参考评分模板'),
      type: 'object',
      lovCode: 'SSRC.SCORE_TEMPL',
      ignore: 'always',
      dynamicProps: {
        lovPara({ record }) {
          const bidRuleType = record.get('bidRuleType');
          const scoreType = record.get('scoreType') || null;
          return {
            enabledFlag: 1,
            scoreMode: bidRuleType,
            templatePurpose: 'EXPERT_SCORE',
            scoreTemplateScoreType: scoreType, // 模板评分类型,WEIGHT/SCORE/SCORE_NEW
          };
        },
      },
    },
    {
      name: 'scoreTemplateCode',
      bind: 'templateLov.templateCode',
      ignore: 'always',
    },
    {
      name: 'scoreTemplateId',
      bind: 'templateLov.templateId',
    },
    // 权重
    {
      name: 'technologyWeight',
      type: 'number',
      step: 0.01,
      precision: 2,
      min: 0.01,
      max: 100,
    },
    {
      name: 'businessWeight',
      type: 'number',
      step: 0.01,
      precision: 2,
      min: 0.01,
      max: 100,
    },
    // 标书规则
    {
      name: 'bidRuleType',
    },
    // 评分方式
    {
      name: 'scoreType',
    },
  ],
});

// 采购员
const buyerDS = () => ({
  paging: false,
  autoQuery: false,
  fields: [
    {
      name: 'purchaseLov',
      label: intl.get(`ssrc.rf.model.rf.purchaseAgentName`).d('采购员'),
      type: 'object',
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
      textField: 'purchaseAgentName',
      valueField: 'purchaseAgentId',
      lovPara: { organizationId },
    },
    {
      name: 'purAgentId',
      bind: 'purchaseLov.purchaseAgentId',
    },
    {
      name: 'purAgentName',
      bind: 'purchaseLov.purchaseAgentName',
    },
    {
      name: 'adjustFields',
      type: 'object',
      defaultValue: [],
    },
  ],
});

// 寻源小组
const sourcingTeamDS = ({ adjustRecordId }) => ({
  autoQuery: false,
  autoQueryAfterSubmit: false,
  // modifiedCheck: false,
  primaryKey: 'rfMemberAdjustId',
  dataToJSON: 'all',
  fields: [
    {
      name: 'adjustFields',
      type: 'object',
      defaultValue: [],
    },
    {
      name: 'loginNameLov',
      label: intl.get(`ssrc.rf.model.rf.account`).d('账号'),
      type: 'object',
      lovCode: 'SSRC.TENANT.USER',
      lovPara: { organizationId },
      textField: 'loginName',
    },
    {
      name: 'loginName',
      bind: 'loginNameLov.loginName',
    },
    {
      name: 'contactName',
      label: intl.get(`ssrc.rf.model.rf.contactName`).d('名称'),
      // bind: 'loginNameLov.realName',
      required: true,
      maxLength: 200,
    },
    // {
    //   name: 'contactPhoneContainer',
    //   label: intl.get(`ssrc.rf.model.rf.contactPhone`).d('手机'),
    // },
    {
      name: 'contactPhone',
      // bind: 'loginNameLov.phone',
      label: intl.get(`ssrc.rf.model.rf.contactPhone`).d('手机'),
      required: true,
      validator: (value, name, record) => {
        if (record?.get('internationalTelCode')) {
          const pattern =
            (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE;
          if (!pattern.test(value)) {
            return intl.get('ssrc.rf.view.validate.phone').d('请输入正确格式的手机号');
          }
        }
      },
    },
    {
      name: 'internationalTelCode',
      // bind: 'loginNameLov.internationalTelCode',
      lookupCode: 'HPFM.IDD',
      required: true,
    },
    {
      name: 'contactMail',
      label: intl.get(`ssrc.rf.model.rf.contactMail`).d('邮箱'),
      // bind: 'loginNameLov.email',
      required: true,
      validator: (value, _, record) => {
        if (value && !EMAIL.test(record.get('contactMail'))) {
          return intl.get('hzero.common.validation.email').d('邮箱格式不正确');
        }
        return true;
      },
    },
    {
      name: 'memberUserId',
      bind: 'loginNameLov.id',
    },
    {
      name: 'publicContactFlag',
      label: (
        <Tooltip
          placement="right"
          title={intl
            .get('ssrc.rf.model.rf.contactPublicTip')
            .d('该列控制是否将联系方式显示在公告以及供应商查看界面')}
        >
          {intl.get('ssrc.rf.model.rf.publicContactFlag').d('公布联系方式')}
        </Tooltip>
      ),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/member/adjust/details`,
      method: 'GET',
      data: {
        organizationId,
        adjustRecordId,
        customizeUnitCode: 'SSRC.INQUIRY_HALL.RF_CONTROL.MEMBER',
      },
    }),
    destroy: ({ data }) => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/member/adjust`,
      method: 'DELETE',
      data,
    }),
    submit: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf/member/adjust/save`,
        method: 'POST',
        params: {
          customizeUnitCode: 'SSRC.INQUIRY_HALL.RF_CONTROL.MEMBER',
        },
        data: data.map((ele) => {
          return {
            ...ele,
            adjustRecordId,
          };
        }),
      };
    },
  },
  events: {
    submitSuccess: ({ dataSet }) => {
      dataSet.query(undefined, undefined, true);
    },
    update: ({ record, name, value }) => {
      if (name === 'publicContactFlag') {
        let adjustFields = [];
        if (record?.get('adjustFields')?.length) {
          adjustFields = record?.get('adjustFields').toJS();
        }
        if (record.get('rfMember')?.[name] !== record.get(name)) {
          // eslint-disable-next-line no-unused-expressions
          record?.set('adjustFields', [...adjustFields, name]);
        } else {
          const index = adjustFields.indexOf(name);
          adjustFields.splice(index, 1);
          // eslint-disable-next-line no-unused-expressions
          record?.set('adjustFields', adjustFields.length ? adjustFields : null);
        }
      }
      if (name === 'loginNameLov') {
        record.set('contactName', value?.realName || '');
        record.set('contactPhone', value?.phone || '');
        record.set('internationalTelCode', value?.internationalTelCode || '');
        record.set('contactMail', value?.email || '');
      }
    },
  },
});

// 专家组
const expertDS = ({ consultationDs, adjustRecordId }) => ({
  autoQuery: false,
  dataToJSON: 'all',
  primaryKey: 'rfExpertAdjustId',
  // modifiedCheck: false,
  fields: [
    {
      label: intl.get(`ssrc.rf.model.rf.expertSubAccount`).d('专家子账户'),
      name: 'expertLov',
      type: 'object',
      ignore: 'always',
      textField: 'loginName',
      valueField: 'id',
      lovCode: 'SSRC.EXPERT_SUB_ACCOUNT',
      lovPara: { tenantId: getCurrentTenant().tenantId },
      required: true,
    },
    {
      name: 'loginName',
      trim: 'none',
      bind: 'expertLov.loginName',
    },
    {
      name: 'expertUserId',
      bind: 'expertLov.id',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.expertName`).d('专家姓名'),
      name: 'expertName',
      bind: 'expertLov.realName',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.expertRole`).d('职责'),
      name: 'expertRole',
      required: true,
      lookupCode: 'SSRC.EXPERT_DUTY',
      defaultValue: 0,
    },
    {
      label: intl.get(`ssrc.rf.model.rf.currentScoringType`).d('本次评分类别'),
      name: 'scoreCategory',
      lookupCode: 'SSRC.EXPERT_TEAM',
      dynamicProps: {
        required: () => consultationDs.current?.get('bidRuleType') === 'DIFF',
        defaultValue: () =>
          consultationDs.current?.get('bidRuleType') === 'NONE' ? 'BUSINESS_TECHNOLOGY' : null,
      },
    },
    {
      label: intl.get(`ssrc.rf.model.rf.expertType`).d('专家类型'),
      name: 'expertType',
      lookupCode: 'SSRC.EXPERT_TYPE',
      defaultValue: 'INTERNAL',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.rfxPhone`).d('联系电话'),
      name: 'phone',
      bind: 'expertLov.phone',
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      bind: 'expertLov.internationalTelCode',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.rfxEmail`).d('电子邮箱'),
      name: 'email',
      bind: 'expertLov.mail',
    },
  ],
  events: {
    submitSuccess: ({ dataSet }) => {
      dataSet.query(undefined, undefined, true);
    },
  },
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/expert/adjust/details`,
      method: 'GET',
      data: {
        organizationId,
        adjustRecordId,
        customizeUnitCode: 'SSRC.INQUIRY_HALL.RF_CONTROL.EXPERT.GROUP',
      },
    }),
    destroy: ({ data }) => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/expert/adjust`,
      method: 'DELETE',
      data,
    }),
    submit: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf/expert/adjust/save`,
        method: 'POST',
        params: {
          customizeUnitCode: 'SSRC.INQUIRY_HALL.RF_CONTROL.EXPERT.GROUP',
        },
        data: data.map((ele) => {
          return {
            ...ele,
            adjustRecordId,
          };
        }),
      };
    },
  },
});

// 评分要素
const scoreDS = ({ expertCategory, consultationDs, adjustRecordId }) => {
  return {
    autoQuery: false,
    dataToJSON: 'all',
    primaryKey: 'rfIndicateAdjustId',
    idField: 'rfIndicateAdjustId',
    parentField: 'parentRfIndicateId',
    expandField: 'expand',
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.rf.model.rf.indicateCode`).d('要素编码'),
        name: 'indicateLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.SCORE_INDIC',
        textField: 'indicateCode',
        valueField: 'indicateId',
        dynamicProps: {
          lovPara() {
            return {
              expertCategory,
              // indicateType: 'SCORE',
            };
          },
        },
      },
      {
        name: 'indicateId',
        dynamicProps: {
          bind: ({ record }) => !record.get('parentRfIndicateId') && 'indicateLov.indicateId',
        },
      },
      {
        name: 'indicateCode',
        dynamicProps: {
          bind: ({ record }) => !record.get('parentRfIndicateId') && 'indicateLov.indicateCode',
        },
      },
      {
        label: intl.get(`ssrc.rf.model.rf.indicateName`).d('要素名称'),
        name: 'indicateName',
        maxLength: 200,
        required: true,
        dynamicProps: {
          bind: ({ record }) => !record.get('parentRfIndicateId') && 'indicateLov.indicateName',
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateTypeMeaning`).d('要素类型'),
        name: 'indicateType',
        type: 'string',
        lookupCode: 'SSRC.INDICATE_TYPE',
        dynamicProps: {
          required({ record }) {
            return record?.get('parentRfIndicateId') === null && !record.children;
          },
          disabled({ record }) {
            return (
              (record?.get('parentRfIndicateId') === null && record.children) ||
              record?.get('parentRfIndicateId')
            );
          },
          bind: ({ record }) => !record.get('parentRfIndicateId') && 'indicateLov.indicateType',
        },
      },
      {
        label: intl.get(`ssrc.rf.model.rf.scoreRemark`).d('评分细则'),
        name: 'indicateRemark',
        maxLength: 1000,
        dynamicProps: {
          bind: ({ record }) => !record.get('parentRfIndicateId') && 'indicateLov.remark',
        },
      },
      {
        label: intl.get(`ssrc.rf.model.rf.weightPercent`).d('权重'),
        name: 'indicateWeight',
        type: 'number',
        max: 100,
        min: 0.01,
        step: 0.01,
        precision: 2,
        defaultValue: ['SCORE', 'SCORE_NEW'].includes(consultationDs?.current?.get('scoreType'))
          ? 100
          : null,
        validator: (value) => {
          if (value && (value <= 0 || value > 100)) {
            return intl
              .get(`ssrc.rf.model.rf.weightPercentRemind`)
              .d('权重范围必须大于0且小于或等于100');
          }
          return true;
        },
        dynamicProps: {
          bind: ({ record }) => !record.get('parentRfIndicateId') && 'indicateLov.weight',
          required: ({ record }) =>
            record.get('indicateType') !== 'PASS' &&
            consultationDs?.current?.get('scoreType') === 'WEIGHT',
          disabled: ({ record }) => record.get('indicateType') === 'PASS',
        },
      },
      {
        label: intl.get(`ssrc.rf.model.rf.minScore`).d('最低分'),
        name: 'minScore',
        type: 'number',
        min: 0,
        step: 0.01,
        defaultValue: consultationDs?.current?.get('scoreType') === 'WEIGHT' ? 0 : null,
        dynamicProps: {
          bind: ({ record }) => !record.get('parentRfIndicateId') && 'indicateLov.minScore',
          required({ record }) {
            // 当前为一级且只有一级或当前为二级
            return (
              record.get('indicateType') !== 'PASS' &&
              ((!record?.get('parentRfIndicateId') && !record.children) ||
                record?.get('parentRfIndicateId')) &&
              ['SCORE', 'SCORE_NEW'].includes(consultationDs?.current?.get('scoreType'))
            );
          },
          disabled({ record }) {
            // 当前为一级且存在二级
            return (
              record.get('indicateType') === 'PASS' ||
              (!record?.get('parentRfIndicateId') &&
                record.children &&
                ['SCORE', 'SCORE_NEW'].includes(consultationDs?.current?.get('scoreType')))
            );
          },
        },
      },
      {
        label: intl.get(`ssrc.rf.model.rf.maxScore`).d('最高分'),
        name: 'maxScore',
        type: 'number',
        // max: 100,
        min: 'minScore',
        step: 0.01,
        defaultValue: consultationDs?.current?.get('scoreType') === 'WEIGHT' ? 100 : null,
        dynamicProps: {
          bind: ({ record }) => !record.get('parentRfIndicateId') && 'indicateLov.maxScore',
          required({ record }) {
            // 当前为一级且只有一级或当前为二级
            return (
              record.get('indicateType') !== 'PASS' &&
              ((!record?.get('parentRfIndicateId') && !record.children) ||
                record?.get('parentRfIndicateId')) &&
              ['SCORE', 'SCORE_NEW'].includes(consultationDs?.current?.get('scoreType'))
            );
          },
          disabled({ record }) {
            // 当前为一级且存在二级
            return (
              record.get('indicateType') === 'PASS' ||
              (!record?.get('parentRfIndicateId') &&
                record.children &&
                ['SCORE', 'SCORE_NEW'].includes(consultationDs?.current?.get('scoreType')))
            );
          },
        },
      },
    ],
    events: {
      select: ({ record }) => {
        const selectChildrenData = (item) => {
          const cascadeData = item.children;
          if (cascadeData) {
            // 如果是数组
            if (cascadeData.length > 0) {
              const selectedItem = cascadeData.find(
                (cascadeDataItem) => cascadeDataItem.isSelected
              );
              if (selectedItem) {
                return;
              }
              cascadeData.forEach((cascadeDataItem) => {
                // eslint-disable-next-line
                cascadeDataItem.isSelected = true;
                selectChildrenData(cascadeDataItem);
              });
            } else {
              // 单个对象
              cascadeData.isSelected = true;
              selectChildrenData(cascadeData);
            }
          }
        };
        selectChildrenData(record);
      },
      unSelect: ({ record }) => {
        const unSelectChildrenData = (item) => {
          const cascadeData = item.children;
          if (cascadeData) {
            // 如果是数组
            if (cascadeData.length > 0) {
              cascadeData.forEach((cascadeDataItem) => {
                // eslint-disable-next-line
                cascadeDataItem.isSelected = false;
                unSelectChildrenData(cascadeDataItem);
              });
            } else {
              // 单个对象
              cascadeData.isSelected = false;
              unSelectChildrenData(cascadeData);
            }
          }
        };
        const unSelectParentData = (item) => {
          const cascadeData = item.parent;
          if (cascadeData) {
            cascadeData.isSelected = false;
            unSelectParentData(cascadeData);
          }
        };
        unSelectChildrenData(record);
        unSelectParentData(record);
      },
      submitSuccess: ({ dataSet }) => {
        dataSet.query();
      },
      // update: ({ dataSet, record = {}, name }) => {
      //   if (name === 'indicateLov') {
      //     // 切换要素lov，清空二级要素
      //     if (record.children) {
      //       dataSet.delete(record.children, false);
      //     }
      //   }
      // },
      update: ({ dataSet, record = {}, name, value = {} }) => {
        if (name === 'indicateLov') {
          const {
            indicateName,
            indicateId,
            indicateCode,
            minScore = null,
            maxScore = null,
            weight,
            remark,
            indicateType,
            scoreIndicList = [],
          } = value || {};
          record.set('indicateName', indicateName);
          record.set('rfIndicateAdjustId', indicateId);
          record.set('indicateCode', indicateCode);
          record.set('indicateType', indicateType);
          record.set('minScore', minScore);
          record.set('maxScore', maxScore);
          record.set('indicateWeight', weight);
          record.set('indicateRemark', remark);

          // 切换要素lov，清空二级要素
          if (record.children) {
            dataSet.delete(record.children, false);
          }

          // 根据一级要素创建二级要素
          // eslint-disable-next-line no-unused-expressions
          scoreIndicList?.forEach((i, index) => {
            // 一级是新建行
            if (record.get('tempIndicateId')) {
              const key = uuid();
              const data = {
                ...i,
                rfIndicateId: key,
                parentRfIndicateId: record.get('rfIndicateAdjustId'), // 一级细项标记
                tempIndicateId: key, // 新建给后端父子结构的标记字段
                tempParentIndicateId: record.get('rfIndicateAdjustId'),
                indicateRemark: i.remark,
              };
              dataSet.create(data, index);
            } else {
              const data = {
                ...i,
                parentRfIndicateId: record.get('rfIndicateAdjustId'), // 一级细项标记
              };
              dataSet.create(data, index);
            }
          });
        }
      },
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rf/indicate/adjust/details`,
          method: 'GET',
          data: {
            adjustRecordId,
            scoreCategory: expertCategory,
            customizeUnitCode:
              expertCategory === 'TECHNOLOGY'
                ? 'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES_TECH'
                : expertCategory === 'BUSINESS'
                ? 'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES_BUSI'
                : 'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES',
          },
        };
      },
      submit: ({ data }) => {
        // 处理新增数据主键问题
        const newData = data?.map((i) => {
          const { rfIndicateAdjustId, parentRfIndicateId, ...others } = i;
          if (i.tempIndicateId) {
            return { ...others, scoreCategory: expertCategory, adjustRecordId };
          }
          return { ...i, scoreCategory: expertCategory, adjustRecordId };
        });
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rf/indicate/adjust/save`,
          method: 'POST',
          params: {
            customizeUnitCode:
              expertCategory === 'TECHNOLOGY'
                ? 'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES_TECH'
                : expertCategory === 'BUSINESS'
                ? 'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES_BUSI'
                : 'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES',
          },
          data: newData,
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rf/indicate/adjust`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

const evaluationDS = () => ({
  fields: [
    {
      name: 'openBidOrder',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.openBidOrder`).d('评标步制'),
    },
    {
      name: 'bidRuleType',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.bidRuleType`).d('标书规则'),
    },
  ],
});

// 批量添加供应商弹框
const batchAddSupplierLovDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'supplierLov',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
      multiple: true,
    },
  ],
});

// 供应商资质
const supplierBulkExpiredModalDS = () => {
  return {
    dataToJSON: 'selected',
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.attachmentName`).d('附件名称'),
        name: 'attachmentDesc',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.attachmentsName`).d('文件到期日'),
        name: 'expirationDate',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierAttachment`).d('供应商附件'),
        name: 'supplierAttachmentUuid',
      },
    ],
  };
};

// 专家分配
const expertModalDS = () => {
  return {
    primaryKey: 'indicAssginId',
    paging: false,
    selection: false,
    forceValidate: true,
    fields: [
      {
        label: intl.get(`ssrc.rf.model.rf.expertSubAccount`).d('专家子账户'),
        name: 'loginName',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.expertName`).d('专家姓名'),
        name: 'expertName',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.whetherAssign`).d('是否分配'),
        name: 'assignFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get('ssrc.rf.model.rf.expertWeight').d('专家权重'),
        name: 'expertWeight',
        type: 'number',
        precision: 2,
        validator: (value) => {
          if (!isNil(value) && (value <= 0 || value >= 100)) {
            return intl
              .get(`ssrc.rf.model.rf.expertWeightRemind`)
              .d('仅允许输入大于0且小于100的最多两位小数的数字');
          }
          return true;
        },
      },
    ],
    events: {
      update: ({ record, name, value }) => {
        if (name === 'assignFlag') {
          let adjustFields = [];
          if (record?.get('adjustFields')?.length) {
            adjustFields = record?.get('adjustFields').toJS();
          }
          if (value !== record?.getPristineValue('assignFlag')) {
            // eslint-disable-next-line no-unused-expressions
            record?.set('adjustFields', [...adjustFields, name]);
          } else {
            const index = adjustFields.indexOf(name);
            adjustFields.splice(index, 1);
            // eslint-disable-next-line no-unused-expressions
            record?.set('adjustFields', adjustFields.length ? adjustFields : null);
          }
        }
        if (name === 'expertWeight') {
          let adjustFields = [];
          if (record?.get('adjustFields')?.length) {
            adjustFields = record?.get('adjustFields').toJS();
          }
          if (value !== record?.getPristineValue('expertWeight')) {
            // eslint-disable-next-line no-unused-expressions
            record?.set('adjustFields', [...adjustFields, name]);
          } else {
            const index = adjustFields.indexOf(name);
            adjustFields.splice(index, 1);
            // eslint-disable-next-line no-unused-expressions
            record?.set('adjustFields', adjustFields.length ? adjustFields : null);
          }
        }
      },
    },
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { rfHeaderAdjustId = null, rfIndicateAdjustId },
        } = dataSet;

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rf/expert-indic-assign/adjusts/${rfHeaderAdjustId}/expert-assign`,
          method: 'GET',
          data: {
            rfIndicateAdjustId,
            customizeUnitCode: `SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES_ASSIGN`,
          },
        };
      },
      submit: ({ data }) => ({
        url: `${SRM_SSRC}/v1/${organizationId}/rf/expert-indic-assign/adjusts/expert-assign`,
        method: 'PUT',
        params: {
          customizeUnitCode: `SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES_ASSIGN`,
        },
        data,
      }),
    },
  };
};

// 附件
const attachmentDS = () => {
  return {
    dataToJSON: 'all',
    fields: [
      {
        name: 'businessAttachmentUuid',
        type: 'attachment',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件'),
      },
      {
        name: 'techAttachmentUuid',
        type: 'attachment',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件'),
      },
      {
        name: 'rfiAttachmentUuid',
        type: 'attachment',
        label: intl.get(`ssrc.rf.view.message.upLoadChangeAttachment`).d('上传附件'),
      },
    ],
    transport: {
      submit: ({ dataSet }) => {
        const record = dataSet.current;
        // const adjustRecordId = record?.get('adjustRecordId');
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rf/attachment/adjust/save`,
          method: 'POST',
          data: record.toData(),
        };
      },
    },
  };
};

export {
  basicFormDS,
  inquiryScopeDS,
  consultationDS,
  buyerDS,
  sourcingTeamDS,
  expertDS,
  scoreDS,
  attachmentDS,
  evaluationDS,
  expertModalDS,
  batchAddSupplierLovDS,
  supplierBulkExpiredModalDS,
};
