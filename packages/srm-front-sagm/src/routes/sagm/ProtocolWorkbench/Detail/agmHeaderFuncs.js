// 主要是协议的按钮方法
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  saveAgreement,
  submitAgreement,
  validateItemPrice,
  deleteHeadData,
  terminateAgreement,
  changeAgreement,
} from '@/services/mallProtocolManagementService';
import { agreementPublish } from '@/services/mallAgreementApproveService';
import confirm from './confirm';

const organizationId = getCurrentOrganizationId();

// 获取头行校验后数据
async function getValidData(headerDs, lineDs = [], priceRule) {
  const headerFlag = await headerDs.current.validate();
  const lineFlag = await lineDs.validate();
  if (headerFlag && lineFlag) {
    const headerData = headerDs.current.toJSONData();
    const newLineData = [...lineDs.created, ...lineDs.updated].map((record) => {
      const {
        quotationFlag,
        buyOrganizationLov = [],
        deliverRegionLov = [],
        priceHiddenFlag,
        ...others
      } = record.toJSONData();
      const allRegionFlag = deliverRegionLov.some((i) => i.regionCode === 'ALL') ? 1 : 0;
      const allUnitFlag = buyOrganizationLov.some((i) => i.unitId === 'ALL') ? 1 : 0;
      const agreementUnits =
        allUnitFlag === 1 ? undefined : buyOrganizationLov.filter((i) => i.unitId !== 'ALL');
      const agreementRegions =
        allRegionFlag === 1 ? undefined : deliverRegionLov.filter((i) => i.regionCode !== 'ALL');
      return {
        ...others,
        priceHiddenFlag: +priceHiddenFlag,
        allUnitFlag,
        allRegionFlag,
        agreementUnits,
        agreementRegions,
        agreementUnitDTOList: undefined,
        quotationFlag:
          headerData.sourceFrom === 'PRICE'
            ? quotationFlag
            : priceRule === 'TAX_INCLUDED_PRICE'
            ? 1
            : 0,
      };
    });
    const noLadders = newLineData.find(
      (f) => f.priceType === 'LADDER_PRICE' && !f.agreementLadders
    );
    if (noLadders) {
      notification.error({
        message: intl.get('sagm.common.view.notification.noLadders').d('请维护阶梯价格'),
      });
      return null;
    }
    return {
      ...headerData,
      tenantId: organizationId,
      agreementBelongType: -1,
      agreementLines: newLineData,
    };
  }
}

// 提交
export async function handleSubmit({ headerDs, lineDs, priceRule }, callback = (e) => e) {
  const agreementStatus = 'SUBMITTED';
  lineDs.setState('submit_loading', true);
  const data = await getValidData(headerDs, lineDs, priceRule);
  if (data) {
    const valid = getResponse(await validateItemPrice([data]));
    if (valid) {
      const { status, message, agreementList = [] } = valid;
      const agreement = agreementList?.[0] || {};
      const submit = async () => {
        const res = getResponse(await submitAgreement([{ ...agreement, agreementStatus }]));
        if (res) {
          notification.success();
          callback();
        } else {
          headerDs.query();
          lineDs.query();
        }
      };
      if (!status) {
        confirm({
          title: message,
          onOk: submit,
          onCancel: () => {
            headerDs.query();
            lineDs.query();
          },
        });
      } else {
        submit();
      }
      lineDs.setState('submit_loading', false);
    }
  } else {
    lineDs.setState('submit_loading', false);
  }
}

// 保存
export async function handleSave({ headerDs, lineDs, priceRule }, callback = (e) => e) {
  const agreementStatus = 'NEW';
  lineDs.setState('save_loading', true);
  const data = await getValidData(headerDs, lineDs, priceRule);
  if (data) {
    const res = getResponse(await saveAgreement({ ...data, agreementStatus }));
    if (res) {
      notification.success();
      lineDs.unSelectAll();
      lineDs.clearCachedRecords();
      callback(res);
      lineDs.setState('save_loading', false);
    }
  } else {
    lineDs.setState('save_loading', false);
  }
}

// 发布
export async function handlePublish(headerDs, callback = (e) => e) {
  const data = headerDs.current.toJSONData();
  const res = getResponse(await agreementPublish([data]));
  if (res) {
    notification.success();
    callback();
  }
}

// 协议变更
export async function handleUpgrade(headerDs, callback = (e) => e, paramData) {
  const data = headerDs.current.toJSONData();
  const res = getResponse(await changeAgreement([{ ...data, ...paramData }]));
  if (res) {
    notification.success();
    callback(res[0]);
  }
}

// 协议终止
export function handleTerminate(headerDs, callback = (e) => e, paramData) {
  const data = headerDs.current.toJSONData();
  confirm({
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    content: intl
      .get('small.mallProtocolManagement.model.agreement.terminateConfirm')
      .d('此操作会下架该协议内商品，是否确认终止协议?'),
    onOk: async () => {
      return new Promise(async (resolve) => {
        const res = getResponse(await terminateAgreement([{ ...data, ...paramData }]));
        if (res) {
          resolve();
          notification.success();
          callback(res);
        }
      });
    },
  });
}

// 协议删除
export async function handleDelete(headerDs, callback = (e) => e) {
  const { agreementId, agreementNumber } = headerDs.current.get(['agreementId', 'agreementNumber']);
  confirm({
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    content: intl
      .get('sagm.protocolManagement.view.confirmDelAgreement', {
        value: agreementNumber,
      })
      .d(`是否确定删除商城协议【${agreementNumber}】？`),
    onOk: async () => {
      const res = getResponse(await deleteHeadData([{ agreementId }]));
      if (res) {
        notification.success();
        callback();
      }
    },
  });
}
