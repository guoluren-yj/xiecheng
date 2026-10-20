/*
 * @Date: 2022-12-22 15:08:34
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { getCurrentLanguage, getResponse } from 'utils/utils';
import { riskEmbedPage, queryRiskMonitorType } from '@/services/lifeCycleManageService';

const language = getCurrentLanguage();

// 单据列表
export const documentsList = () => [
  {
    key: 'waitSubmit',
    tab: intl.get('sslm.common.view.message.waitSubmit').d('待提交'),
    searchCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_LIST.WAIT_SUBMIT_SEARCH_BAR',
    customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_LIST.SUBMIT',
  },
  {
    key: 'approval',
    tab: intl.get('sslm.common.view.message.approval').d('审批中'),
    searchCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_LIST.APPROVAL_SEARCH_BAR',
    customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_LIST.APPROVAL',
  },
  {
    key: 'all',
    tab: intl.get('sslm.common.view.message.all').d('全部'),
    searchCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_LIST.ALL_SEARCH_BAR',
    customizeUnitCode: 'SSLM.LIFE_CYCLE.DOCUMENTS_LIST.ALL',
  },
];

// 获取提交弹框提示信息
export const getSubmitMsg = ({
  checkType,
  blacklistDateType,
  unfinishedOrderDocumentCodes,
  unfinishedSettleDocumentCodes,
}) => {
  const msgList = [];
  if (blacklistDateType === 'FOREVER') {
    msgList.push({
      message: intl
        .get('sslm.lifeCycleManage.message.confirm.foreverBlacklistMsg')
        .d('加入永久黑名单后将无法修改，请确认是否继续加入永久黑名单?'),
    });
  }
  if (checkType === 'WEAK_CHECK') {
    if (unfinishedOrderDocumentCodes && unfinishedSettleDocumentCodes) {
      msgList.push({
        message: (
          <span>
            {intl
              .get('sslm.lifeCycleManage.message.confirm.orderMsg', {
                name: unfinishedOrderDocumentCodes,
              })
              .d(`系统有未完结的订单${unfinishedOrderDocumentCodes}`)}
            {intl
              .get('sslm.lifeCycleManage.message.confirm.settleMsg', {
                name: unfinishedSettleDocumentCodes,
              })
              .d(`和结算事务${unfinishedSettleDocumentCodes},请关注`)}
          </span>
        ),
      });
    } else if (unfinishedOrderDocumentCodes) {
      msgList.push({
        message: intl
          .get('sslm.lifeCycleManage.message.confirm.unfinishedOrder', {
            name: unfinishedOrderDocumentCodes,
          })
          .d(`系统有未完结的订单${unfinishedOrderDocumentCodes},请关注`),
      });
    } else if (unfinishedSettleDocumentCodes) {
      msgList.push({
        message: intl
          .get('sslm.lifeCycleManage.message.confirm.unfinishedSettle', {
            name: unfinishedSettleDocumentCodes,
          })
          .d(`系统有未完结的结算事务${unfinishedSettleDocumentCodes},请关注`),
      });
    }
  }
  if (isEmpty(msgList)) {
    msgList.push({
      message: intl.get('hzero.common.message.confirm.submit').d('是否确认提交?'),
    });
  }
  return msgList;
};

// 详情页标题
export const getDetailTitle = (isCreate, isEdit, documentType) => {
  const status = isCreate
    ? intl.get('hzero.common.button.create').d('新建')
    : isEdit
    ? intl.get('hzero.common.button.edit').d('编辑')
    : intl.get('hzero.common.button.view').d('查看');
  switch (documentType) {
    case 'NORMAL':
      return intl
        .get('sslm.supplierLifeManage.view.title.normalApplication', {
          status,
        })
        .d('升降级申请单');
    case 'SPECIAL':
      return intl
        .get('sslm.supplierLifeManage.view.title.specialApplication', {
          status,
        })
        .d('特批申请单');
    default:
      break;
  }
};

// 处理泳道升降级中阶段名称超长问题
export const getStageTitle = str => {
  if (str) {
    const strLength = str.length;
    if (language === 'zh_CN') {
      if (strLength > 3) {
        return str;
      } else {
        return '';
      }
    } else if (strLength > 6) {
      return str;
    } else {
      return '';
    }
  }
};

/**
 * 风险扫描
 * @param {*} record
 * @param isSupplierFlag 供应商360页面
 * @param feedBackFlag 是否回显
 */
export const riskScan = async (
  record,
  isSupplierFlag = false,
  feedBackFlag = false,
  remote,
  extraParams = {}
) => {
  // 查询开通风控服务类型
  const riskMonitorTypeResult = getResponse(await queryRiskMonitorType());
  const {
    supplierCompanyName,
    supplierCompanyId, //  供应商子公司id
    companyId, // 采购方子公司id
    companyName,
    supplierName,
    riskScanCompanyName,
    riskScanCompanyId,
  } = record?.data || record || {};
  const newSupplierCompanyId = riskScanCompanyId || supplierCompanyId;
  let enterpriseName = '';
  if (isSupplierFlag) {
    enterpriseName = companyName;
  } else {
    enterpriseName = riskScanCompanyName || supplierCompanyName || supplierName;
  }
  // 360页面，enterpriseName值取companyName
  if (riskMonitorTypeResult) {
    const { partnerCode: riskMonitorType = '' } = riskMonitorTypeResult || {};
    // 斯瑞德[SRD] 企查查[ZHENYUN_PARTNER]--风险扫描
    if (['SRD', 'ZHENYUN_PARTNER'].includes(riskMonitorType)) {
      // 风险扫描内嵌页
      const prompt = `<p style="text-align: center">${intl
        .get('spfm.common.view.riskMonitoring.loading')
        .d('正在加载')}...</p>`;
      const riskWindow = window.open();
      if (riskWindow) {
        riskWindow.document.body.innerHTML = prompt;
      }
      riskEmbedPage({ companyId, enterpriseName, supplierCompanyId: newSupplierCompanyId }).then(
        response => {
          const res = getResponse(response);
          if (riskWindow) {
            if (res && !res.failed) {
              riskWindow.location = res.monitorUrl;
              // 回显其他字段
              const { riskScanDate, fileUrl, riskLevel, riskLevelMeaning } = res;
              if (feedBackFlag && record.init) {
                record.init({
                  riskScanDate,
                  fileUrl,
                  riskLevel,
                  riskLevelMeaning,
                });
              }
              if (remote) {
                remote.event.fireEvent('cuxCallBack', { record, res, ...extraParams });
              }
            } else {
              const errPrompt = `<p style="text-align: center">${response.message}</p>`;
              riskWindow.document.body.innerHTML = errPrompt;
            }
          }
        }
      );
    }
  }
};
