/**
 * 协议工作台-列表ds
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPCM } from '_utils/config';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';

import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { getDynamicLabel } from '@/utils/util';
import { operationRevoke } from '@/services/workspaceService';
import {
  queryBatchApprovaFlag,
  queryBatchSimpleApprovalHistory,
} from 'srm-front-boot/lib/utils/utils';
import { statusApproveMap } from '../../../utils/enum.js';

const organizationId = getCurrentOrganizationId();
const modelPrompt = 'spcm.purchaseContractView.model';
const commonPrompt = 'spcm.common.model.common';

// 整单-待提交
const toBeSubmited = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  primaryKey: 'pcHeaderId',
  pageSize: 20,
  fields: [
    {
      name: 'pcStatusCode',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.operator').d('操作'),
    },
    {
      name: 'pcNum',
      label: intl.get(`spcm.common.model.common.purchaseAgreementNum`).d('采购协议编号'),
    },
    {
      name: 'pcName',
      label: intl.get(`spcm.common.model.common.purchaseAgreementName`).d('采购协议名称'),
    },
    {
      name: 'companyName',
      label: intl.get(`spcm.workspace.model.companyName`).d('公司'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`spcm.workspace.supplierCompanyName`).d('供应商名称'),
    },
    {
      name: 'pcKindCode',
      label: intl.get(`spcm.common.model.pcKindCode`).d('协议性质'),
    },
    {
      name: 'pcTypeId',
      label: intl.get(`spcm.common.model.common.pcType`).d('协议类型'),
    },
    {
      name: 'pcTemplateId',
      label: intl.get(`spcm.common.model.common.pcTemplateId`).d('协议模板'),
    },
    {
      name: 'startDateActive',
      label: intl.get('spcm.common.model.startDateActive').d('协议起始日期'),
    },
    {
      name: 'endDateActive',
      label: intl.get('spcm.common.model.endDateActive').d('协议终止日期'),
    },
    {
      name: 'originalTaxIncludeAmount',
      type: 'number',
      label: intl.get(`spcm.common.model.common.originalTaxIncludeAmount`).d('金额(含税)'),
    },
    {
      name: 'originalAmount',
      type: 'number',
      label: intl.get(`spcm.common.model.common.originalAmount`).d('金额(不含税)'),
    },
    {
      label: intl.get(`spcm.common.model.supplierCurrencyCode`).d('原币币种'),
      name: 'supplierCurrencyCode',
    },
    {
      label: intl.get(`spcm.common.model.purchaseCurrencyCode`).d('本币币种'),
      name: 'purchaseCurrencyCode',
    },
    {
      name: 'purchaseOrgId',
      label: intl.get('entity.organization.class.purchase').d('采购组织'),
    },
    {
      name: 'ouId',
      label: intl.get(`spcm.common.model.ouName`).d('业务实体'),
    },
    {
      name: 'purchaseAgentId',
      label: intl.get('spcm.common.model.common.agentName').d('采购员'),
    },
    {
      name: 'createdBy',
      label: intl.get(`entity.roles.creator`).d('创建人'),
    },
    {
      name: 'creationDate',
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
    },
    {
      name: 'pcSourceCode',
      label: intl.get(`spcm.common.model.agreementSource`).d('协议来源'),
    },
    {
      name: 'electricSignFlag',
      label: intl.get(`spcm.contractSign.model.common.electricSignFlag`).d('是否电签'),
    },
    {
      name: 'signatureTypeMeaning',
      label: intl.get(`spcm.common.signatureTypeMeaning`).d('签章方式'),
    },
    {
      label: intl.get(`spcm.common.releaseDate`).d('发布时间'),
      name: 'releaseDate',
    },
    {
      label: intl.get(`spcm.purchaseContractView.model.signDate`).d('签订日期'),
      name: 'signDate',
    },
    {
      label: intl.get(`spcm.common.archiveDate`).d('归档日期'),
      name: 'archiveDate',
    },
    {
      label: intl.get('spcm.common.model.common.checkTheImplementation').d('查看执行情况'),
      name: 'contractStageAndAccept',
    },
    // {
    //   label: intl.get(`spcm.purchaseContractView.model.pushsap.status`).d('推送状态'),
    //   name: 'interRecords',
    // },
  ],
  queryParameter: {
    workbenchFlag: '1',
    customizeUnitCode: 'SPCM.WORKSPACE_TOBESUBMITED.SERARCH,SPCM.WORKSPACE_TOBESUBMITED.LIST',
    // pcStatusSet: 'PENDING,REJECTED,SUPPLIER_REJECTED',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/edit/page`,
        method: 'GET',
      };
    },
  },
});

// 整单-审批中
const underApproval = () => ({
  dataToJSON: 'selected',
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'version',
      label: intl.get(`spcm.common.model.common.version`).d('版本号'),
    },
    {
      name: 'pcStatusCode',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.operator').d('操作'),
    },
    {
      name: 'pcNum',
      label: intl.get(`spcm.common.model.common.purchaseAgreementNum`).d('采购协议编号'),
    },
    {
      name: 'pcName',
      label: intl.get(`spcm.common.model.common.purchaseAgreementName`).d('采购协议名称'),
    },
    {
      name: 'companyName',
      label: intl.get(`spcm.workspace.model.companyName`).d('公司'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`spcm.workspace.supplierCompanyName`).d('供应商名称'),
    },
    {
      name: 'pcKindCode',
      label: intl.get(`spcm.common.model.pcKindCode`).d('协议性质'),
    },
    {
      name: 'pcTypeId',
      label: intl.get(`spcm.common.model.common.pcType`).d('协议类型'),
    },
    {
      name: 'pcTemplateId',
      label: intl.get(`spcm.common.model.common.pcTemplateId`).d('协议模板'),
    },
    {
      name: 'startDateActive',
      label: intl.get('spcm.common.model.startDateActive').d('协议起始日期'),
    },
    {
      name: 'endDateActive',
      label: intl.get('spcm.common.model.endDateActive').d('协议终止日期'),
    },
    {
      name: 'originalTaxIncludeAmount',
      type: 'number',
      label: intl.get(`spcm.common.model.common.originalTaxIncludeAmount`).d('金额(含税)'),
    },
    {
      name: 'originalAmount',
      type: 'number',
      label: intl.get(`spcm.common.model.common.originalAmount`).d('金额(不含税)'),
    },
    {
      label: intl.get(`spcm.common.model.supplierCurrencyCode`).d('原币币种'),
      name: 'supplierCurrencyCode',
    },
    {
      label: intl.get(`spcm.common.model.purchaseCurrencyCode`).d('本币币种'),
      name: 'purchaseCurrencyCode',
    },
    {
      name: 'purchaseOrgId',
      label: intl.get(`spcm.common.model.common.purchaseOrg`).d('采购组织'),
    },
    {
      name: 'ouId',
      label: intl.get(`spcm.common.model.ouName`).d('业务实体'),
    },
    {
      name: 'purchaseAgentId',
      label: intl.get('spcm.common.model.common.agentName').d('采购员'),
    },
    {
      name: 'createdBy',
      label: intl.get(`entity.roles.creator`).d('创建人'),
    },
    {
      name: 'creationDate',
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
    },
    {
      name: 'pcSourceCode',
      label: intl.get(`spcm.common.model.agreementSource`).d('协议来源'),
    },
    {
      name: 'electricSignFlag',
      label: intl.get(`spcm.contractSign.model.common.electricSignFlag`).d('是否电签'),
    },
    {
      name: 'signatureTypeMeaning',
      label: intl.get(`spcm.common.signatureTypeMeaning`).d('签章方式'),
    },
    {
      label: intl.get(`spcm.common.releaseDate`).d('发布时间'),
      name: 'releaseDate',
    },
    {
      label: intl.get(`spcm.purchaseContractView.model.signDate`).d('签订日期'),
      name: 'signDate',
    },
    {
      label: intl.get(`spcm.common.archiveFlag`).d('归档状态'),
      name: 'archiveFlag',
    },
    {
      label: intl.get(`spcm.common.archiveDate`).d('归档日期'),
      name: 'archiveDate',
    },
    {
      label: intl.get('spcm.common.model.common.checkTheImplementation').d('查看执行情况'),
      name: 'contractStageAndAccept',
    },
    // {
    //   label: intl.get(`spcm.purchaseContractView.model.pushsap.status`).d('推送状态'),
    //   name: 'interRecords',
    // },
  ],
  queryParameter: {
    workbenchFlag: '1',
    customizeUnitCode: 'SPCM.WORKSPACE_UNDERAPPROVAL2.SERARCH,SPCM.WORKSPACE_UNDERAPPROVAL2.LIST',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/approval/page`,
        method: 'GET',
        transformResponse: async (data) => {
          let retrunData = '';
          try {
            const jsonData = JSON.parse(data);
            retrunData = jsonData;
          } catch (error) {
            retrunData = data;
          }

          if (retrunData?.content?.length) {
            const dataMap = new Map();
            // 批量处理businessKey，并将key存储到Map数据和pcHeaderId一一对应
            const businessKeys = retrunData?.content.map((item) => {
              const { businessKey, pcStatusCode } = item;
              if (businessKey) {
                dataMap.set(item.pcHeaderId, businessKey);
              }
              if (
                statusApproveMap?.[pcStatusCode] &&
                ['WORKFLOW', 'WORKFLOW_APPROVAL', 'EXPORT_INTERFACE'].includes(
                  item[statusApproveMap?.[pcStatusCode]]
                )
              ) {
                return item.businessKey;
              }
              return null;
            });
            const newBusinessKeys = businessKeys.filter(Boolean);
            if (newBusinessKeys.length) {
              // 调用平台统一提供的SDK，判断是否展示 撤销按钮，支持批量调用。参数；租户+businesskey。返回true则展示按钮，返回false则不展示
              await Promise.all([
                operationRevoke(newBusinessKeys),
                queryBatchApprovaFlag(newBusinessKeys),
                queryBatchSimpleApprovalHistory(newBusinessKeys),
              ]).then(([res1, res2, res3]) => {
                const revokeList = getResponse(res1);
                if (revokeList && res2 && res3) {
                  retrunData.content = retrunData?.content.map((item) => {
                    const businessKey = dataMap.get(item.pcHeaderId);
                    return {
                      ...item,
                      // 获取对应的pcHeaderId协议中businessKey查询到的是否支持撤销的结果
                      revokeByBusKeyFlag: revokeList?.[businessKey]?.['REVOKE'],
                      approvalByBusKey: res2?.[businessKey],
                      approvalProcessByBusKey: res3?.[businessKey],
                    };
                  });
                }
              });
            }
          }
          return retrunData;
        },
      };
    },
  },
});

// 整单-待签署
const toBeSigned = () => ({
  primaryKey: 'pcHeaderId',
  dataToJSON: 'selected',
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'pcStatusCode',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.operator').d('操作'),
    },
    {
      name: 'pcNum',
      label: intl.get(`spcm.common.model.common.purchaseAgreementNum`).d('采购协议编号'),
    },
    {
      name: 'pcName',
      label: intl.get(`spcm.common.model.common.purchaseAgreementName`).d('采购协议名称'),
    },
    {
      name: 'companyName',
      label: intl.get(`spcm.workspace.model.companyName`).d('公司'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`spcm.workspace.supplierCompanyName`).d('供应商名称'),
    },
    {
      name: 'pcKindCode',
      label: intl.get(`spcm.common.model.pcKindCode`).d('协议性质'),
    },
    {
      name: 'pcTypeId',
      label: intl.get(`spcm.common.model.common.pcType`).d('协议类型'),
    },
    {
      name: 'pcTemplateId',
      label: intl.get(`spcm.common.model.common.pcTemplateId`).d('协议模板'),
    },
    {
      name: 'startDateActive',
      label: intl.get('spcm.common.model.startDateActive').d('协议起始日期'),
    },
    {
      name: 'endDateActive',
      label: intl.get('spcm.common.model.endDateActive').d('协议终止日期'),
    },
    {
      name: 'originalTaxIncludeAmount',
      type: 'number',
      label: intl.get(`spcm.common.model.common.originalTaxIncludeAmount`).d('金额(含税)'),
    },
    {
      name: 'originalAmount',
      type: 'number',
      label: intl.get(`spcm.common.model.common.originalAmount`).d('金额(不含税)'),
    },
    {
      label: intl.get(`spcm.common.model.supplierCurrencyCode`).d('原币币种'),
      name: 'supplierCurrencyCode',
    },
    {
      label: intl.get(`spcm.common.model.purchaseCurrencyCode`).d('本币币种'),
      name: 'purchaseCurrencyCode',
    },
    {
      name: 'purchaseOrgId',
      label: intl.get(`spcm.common.model.common.purchaseOrg`).d('采购组织'),
    },
    {
      name: 'ouId',
      label: intl.get(`spcm.common.model.ouName`).d('业务实体'),
    },
    {
      name: 'purchaseAgentId',
      label: intl.get('spcm.common.model.common.agentName').d('采购员'),
    },
    {
      name: 'createdBy',
      label: intl.get(`entity.roles.creator`).d('创建人'),
    },
    {
      name: 'creationDate',
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
    },
    {
      name: 'pcSourceCode',
      label: intl.get(`spcm.common.model.agreementSource`).d('协议来源'),
    },
    {
      name: 'electricSignFlag',
      label: intl.get(`spcm.contractSign.model.common.electricSignFlag`).d('是否电签'),
    },
    {
      name: 'signatureTypeMeaning',
      label: intl.get(`spcm.common.signatureTypeMeaning`).d('签章方式'),
    },
    // {
    //   label: intl.get(`spcm.common.releaseDate`).d('发布时间'),
    //   name: 'releaseDate',
    // },
    // {
    //   label: intl.get(`spcm.purchaseContractView.model.signDate`).d('签订日期'),
    //   name: 'signDate',
    // },
    {
      label: intl.get(`spcm.common.archiveDate`).d('归档日期'),
      name: 'archiveDate',
    },
    {
      label: intl.get(`spcm.common.model.terminateSignStatus`).d('解约签署状态'),
      name: 'terminateSignStatus',
      width: 120,
      lookupCode: 'SPCM_TERMINATE_SIGN_STATUS',
    },
    {
      label: intl.get('spcm.common.model.common.checkTheImplementation').d('查看执行情况'),
      name: 'contractStageAndAccept',
    },
    // {
    //   label: intl.get(`spcm.purchaseContractView.model.pushsap.status`).d('推送状态'),
    //   name: 'interRecords',
    // },
  ],
  queryParameter: {
    workbenchFlag: '1',
    customizeUnitCode: 'SPCM.WORKSPACE_TOBERELEASED.SERARCH2,SPCM.WORKSPACE_TOBERELEASED.LIST3',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/purchase-sign/page`,
        method: 'GET',
      };
    },
  },
});

// 整单-全部
const all = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  primaryKey: 'pcHeaderId',
  idField: 'pcHeaderId',
  parentField: '_childPcHeaderId',
  expandField: 'expand',
  paging: 'server',
  pageSize: 20,
  modifiedCheck: true,
  // mode: 'tree',
  fields: [
    {
      name: 'pcStatusCode',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'transferOrderStatus',
      label: intl.get(`spcm.common.model.common.transferOrderStatus`).d('自动转订单状态'),
    },
    {
      name: 'regenerateOrder',
      label: intl.get(`spcm.common.model.common.regenerateOrder`).d('重新生成订单'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.operator').d('操作'),
    },
    {
      name: 'enableCoordination',
      label: intl.get('spcm.common.model.common.enableCoordination').d('是否开启协同'),
    },
    {
      name: 'pcNum',
      label: intl.get(`spcm.common.model.common.purchaseAgreementNum`).d('采购协议编号'),
    },
    {
      name: 'pcName',
      label: intl.get(`spcm.common.model.common.purchaseAgreementName`).d('采购协议名称'),
    },
    {
      name: 'companyName',
      label: intl.get(`spcm.workspace.model.companyName`).d('公司'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`spcm.workspace.supplierCompanyName`).d('供应商名称'),
    },
    {
      name: 'pcKindCode',
      label: intl.get(`spcm.common.model.pcKindCode`).d('协议性质'),
    },
    {
      name: 'pcTypeId',
      label: intl.get(`spcm.common.model.common.pcType`).d('协议类型'),
    },
    {
      name: 'pcTemplateId',
      label: intl.get(`spcm.common.model.common.pcTemplateId`).d('协议模板'),
    },
    {
      name: 'startDateActive',
      label: intl.get('spcm.common.model.startDateActive').d('协议起始日期'),
    },
    {
      name: 'endDateActive',
      label: intl.get('spcm.common.model.endDateActive').d('协议终止日期'),
    },
    {
      name: 'originalTaxIncludeAmount',
      type: 'number',
      label: intl.get(`spcm.common.model.common.originalTaxIncludeAmount`).d('金额(含税)'),
    },
    {
      name: 'originalAmount',
      type: 'number',
      label: intl.get(`spcm.common.model.common.originalAmount`).d('金额(不含税)'),
    },
    {
      label: intl.get(`spcm.common.model.supplierCurrencyCode`).d('原币币种'),
      name: 'supplierCurrencyCode',
    },
    {
      label: intl.get(`spcm.common.model.purchaseCurrencyCode`).d('本币币种'),
      name: 'purchaseCurrencyCode',
    },
    {
      name: 'purchaseOrgId',
      label: intl.get(`spcm.common.model.common.purchaseOrg`).d('采购组织'),
    },
    {
      name: 'ouId',
      label: intl.get(`spcm.common.model.ouName`).d('业务实体'),
    },
    {
      name: 'purchaseAgentId',
      label: intl.get('spcm.common.model.common.agentName').d('采购员'),
    },
    {
      name: 'createdBy',
      label: intl.get(`entity.roles.creator`).d('创建人'),
    },
    {
      name: 'creationDate',
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
    },
    {
      name: 'pcSourceCode',
      label: intl.get(`spcm.common.model.agreementSource`).d('协议来源'),
    },
    {
      name: 'electricSignFlag',
      label: intl.get(`spcm.contractSign.model.common.electricSignFlag`).d('是否电签'),
    },
    {
      name: 'signatureTypeMeaning',
      label: intl.get(`spcm.common.signatureTypeMeaning`).d('签章方式'),
    },
    {
      label: intl.get(`spcm.common.releaseDate`).d('发布时间'),
      name: 'releaseDate',
    },
    {
      label: intl.get(`spcm.purchaseContractView.model.signDate`).d('签订日期'),
      name: 'signDate',
    },
    {
      label: intl.get(`spcm.common.archiveDate`).d('归档日期'),
      name: 'archiveDate',
    },
    {
      label: intl.get(`spcm.common.archiveFlag`).d('归档状态'),
      name: 'archiveFlag',
    },
    {
      label: intl.get(`spcm.common.model.terminateSignStatus`).d('解约签署状态'),
      name: 'terminateSignStatus',
      width: 120,
      lookupCode: 'SPCM_TERMINATE_SIGN_STATUS',
    },
    {
      label: intl.get(`spcm.common.model.terminateSignFileUuid`).d('解约文件'),
      name: 'terminateSignFileUuid',
      type: 'attachment',
      width: 120,
    },
    {
      label: intl.get('spcm.common.model.common.checkTheImplementation').d('查看执行情况'),
      name: 'contractStageAndAccept',
    },
    {
      label: intl.get('spcm.common.model.common.occupyRecords').d('订单金额占用记录'),
      name: 'occupyRecords',
    },
    {
      label: intl.get(`spcm.workspace.model.pushsap.status`).d('同步状态'),
      name: 'interRecords',
    },
    {
      name: 'occupancyRecords',
      label: intl.get(`spcm.common.model.occupancyRecords`).d('金额占用记录查询'),
    },
    {
      name: 'autoTransferOrderFlag',
      label: intl.get(`spcm.common.model.autoTransferOrderFlag`).d('是否自动协议转订单'),
    },
    {
      name: 'restartCreateSignTask',
      label: intl.get('spcm.common.model.restartCreateSignTask').d('重新创建签署任务'),
    },
    {
      label: intl.get(`spcm.common.attachmentUuid`).d('归档文件'),
      name: 'archiveAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'spcm-supplier',
    },
  ],
  queryParameter: {
    workbenchFlag: '1',
    customizeUnitCode: 'SPCM.WORKSPACE_ALL.SERARCH2,SPCM.WORKSPACE_ALL.LIST',
    // page: 0,
    // size: 10,
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/purchase-view/page`,
        method: 'GET',
        transformResponse: async (data) => {
          let retrunData = '';
          try {
            const jsonData = JSON.parse(data);
            const content = jsonData?.content || [];
            const data2 = content.map((item) => {
              return {
                ...item,
                expand: true,
              };
            });
            const newContent = data2;
            content.forEach((item) => {
              const { pcHeaderDetailDTO, pcHeaderDetailDTOList = [] } = item;
              // 处理需要展示多个补充协议的情况
              if (!isEmpty(pcHeaderDetailDTOList)) {
                pcHeaderDetailDTOList.forEach((line) => {
                  const obj = {
                    ...line,
                    _childPcHeaderId: item.pcHeaderId,
                    expand: true,
                  };
                  newContent.push(obj);
                });
              } else if (pcHeaderDetailDTO) {
                const obj = {
                  ...pcHeaderDetailDTO,
                  _childPcHeaderId: item.pcHeaderId,
                  expand: true,
                };
                newContent.push(obj);
              }
            });
            jsonData.content = newContent;
            // pcHeaderDetailDTO
            retrunData = jsonData;
          } catch (error) {
            retrunData = data;
          }

          if (retrunData?.content?.length) {
            const dataMap = new Map();
            // 批量处理businessKey，并将key存储到Map数据和pcHeaderId一一对应
            const businessKeys = retrunData?.content.map((item) => {
              const { businessKey, pcStatusCode } = item;
              if (businessKey) {
                dataMap.set(item.pcHeaderId, businessKey);
              }
              if (
                statusApproveMap?.[pcStatusCode] &&
                ['WORKFLOW', 'WORKFLOW_APPROVAL', 'EXPORT_INTERFACE'].includes(
                  item[statusApproveMap?.[pcStatusCode]]
                )
              ) {
                return item.businessKey;
              }
              return null;
            });
            const newBusinessKeys = businessKeys.filter(Boolean);
            if (newBusinessKeys.length) {
              // 调用平台统一提供的SDK，判断是否展示 撤销按钮，支持批量调用。参数；租户+businesskey。返回true则展示按钮，返回false则不展示
              await Promise.all([
                operationRevoke(newBusinessKeys),
                queryBatchApprovaFlag(newBusinessKeys),
                queryBatchSimpleApprovalHistory(newBusinessKeys),
              ]).then(([res1, res2, res3]) => {
                const revokeList = getResponse(res1);
                if (revokeList && res2 && res3) {
                  retrunData.content = retrunData?.content.map((item) => {
                    const businessKey = dataMap.get(item.pcHeaderId);
                    return {
                      ...item,
                      // 获取对应的pcHeaderId协议中businessKey查询到的是否支持撤销的结果
                      revokeByBusKeyFlag: revokeList?.[businessKey]?.['REVOKE'],
                      approvalByBusKey: res2?.[businessKey],
                      approvalProcessByBusKey: res3?.[businessKey],
                    };
                  });
                }
              });
              // const revokeList = getResponse(await operationRevoke(newBusinessKeys));
              // if (revokeList) {
              //   retrunData.content = retrunData?.content.map((item) => {
              //     return {
              //       ...item,
              //       // 获取对应的pcHeaderId协议中businessKey查询到的是否支持撤销的结果
              //       revokeByBusKeyFlag: revokeList?.[dataMap.get(item.pcHeaderId)]?.['REVOKE'],
              //     };
              //   });
              // }
            }
          }
          return retrunData;
        },
      };
    },
  },
});

// 明细-全部
const detailAll = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  primaryKey: 'pcSubjectId',
  pageSize: 20,
  fields: [
    {
      label: intl.get(`${modelPrompt}.pcStatusCode`).d('状态'),
      name: 'pcStatusCode',
      width: 85,
    },
    {
      label: intl.get(`${commonPrompt}.purchaseAgreementNum`).d('采购协议编号'),
      name: 'pcNum',
    },

    {
      label: intl.get(`${commonPrompt}.purchaseAgreementName`).d('采购协议名称'),
      name: 'pcName',
    },
    {
      label: intl.get(`spcm.workspace.supplierCompanyName`).d('供应商'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`${commonPrompt}.pcKindCode`).d('协议性质'),
      name: 'pcKindCode',
    },
    {
      label: intl.get(`${commonPrompt}.pcType`).d('协议类型'),
      name: 'pcTypeId',
    },
    {
      label: intl.get(`spcm.workspace.model.companyName`).d('公司'),
      name: 'companyName',
    },
    {
      label: intl.get(`spcm.workspace.supplierCompanyName`).d('供应商名称'),
      name: 'supplierCompanyNum',
    },
    {
      label: intl.get(`spcm.common.model.ouName`).d('业务实体'),
      name: 'ouId',
    },
    {
      label: intl.get(`spcm.common.model.common.purchaseOrg`).d('采购组织'),
      name: 'purchaseOrgId',
    },
    {
      label: intl.get('spcm.common.model.common.agentName').d('采购员'),
      name: 'purchaseAgentId',
    },
    {
      label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
      name: 'itemName',
    },
    {
      label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
      name: 'categoryId',
    },
    // {
    //   label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
    //   name: 'categoryName',
    // },
    {
      label: intl.get(`spcm.common.model.specifications`).d('规格'),
      name: 'specifications',
    },
    {
      label: intl.get(`spcm.common.model.common.model`).d('型号'),
      name: 'model',
    },
    {
      // label: intl.get(`${commonPrompt}.unit`).d('单位'),
      name: 'uomName',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled')),
      },
    },
    {
      // label: intl.get(`${commonPrompt}.quantity`).d('数量'),
      name: 'quantity',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
      },
    },
    {
      label: intl.get(`${commonPrompt}.unit`).d('单位'),
      name: 'secondaryUomId',
    },
    {
      label: intl.get(`${commonPrompt}.quantity`).d('数量'),
      name: 'secondaryQuantity',
    },
    {
      label: intl.get(`${commonPrompt}.executedQuantity`).d('已执行数量'),
      name: 'executedQuantity',
    },
    {
      label: intl.get(`${commonPrompt}.toExecuteQuantity`).d('待执行数量'),
      name: 'toExecuteQuantity',
    },
    {
      label: intl.get(`spcm.common.currencyCode`).d('原币币种'),
      name: 'currencyCode',
    },
    {
      label: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
      name: 'purchaseCurrencyCode',
    },
    {
      label: intl.get(`spcm.common.exchangeRate`).d('汇率:(本币/原币)'),
      name: 'exchangeRate',
    },
    {
      // label: intl.get(`spcm.common.model.unitPrice`).d('原币不含税单价'),
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'unitPrice'),
      },
      name: 'unitPrice',
      type: 'number',
      align: 'right',
    },
    {
      label: intl.get(`spcm.common.model.unitPrice`).d('原币不含税单价'),
      name: 'secondaryUnitPrice',
      type: 'number',
      align: 'right',
    },
    {
      label: intl.get(`spcm.common.model.lineAmount`).d('原币不含税行金额'),
      name: 'lineAmount',
      type: 'number',
      align: 'right',
    },
    {
      // label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币含税单价'),
      dynamicProps: {
        label: ({ dataSet }) =>
          getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'taxIncludedUnitPrice'),
      },
      name: 'taxIncludedUnitPrice',
      type: 'number',
    },
    {
      label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币含税单价'),
      type: 'number',
      name: 'taxIncludedSecondaryUnitPrice',
    },
    {
      label: intl.get(`spcm.common.model.taxIncludedLineAmount`).d('原币含税行金额'),
      name: 'taxIncludedLineAmount',
      type: 'number',
      align: 'right',
    },
    {
      label: intl.get(`${commonPrompt}.executedAmount`).d('已执行金额'),
      type: 'number',
      name: 'executedAmount',
    },
    {
      label: intl.get(`${commonPrompt}.toExecuteAmount`).d('待执行金额'),
      type: 'number',
      name: 'toExecuteAmount',
    },
    {
      label: intl.get('spcm.common.model.common.subjectAcceptStatus').d('标的验收状态'),
      name: 'subjectAcceptStatus',
    },
    {
      label: intl.get('spcm.common.model.common.contractAccept').d('协议验收'),
      name: 'acceptListNum',
    },
    {
      label: intl.get(`${commonPrompt}.taxType`).d('税种'),
      name: 'taxId',
    },
    {
      label: intl.get(`sodr.common.model.common.taxRate`).d('税率'),
      name: 'taxRate',
    },
    {
      label: intl.get(`spcm.common.model.common.globalFlag`).d('是否全局协议'),
      name: 'globalFlag',
    },
    {
      label: intl.get(`spcm.common.model.agreementSource`).d('协议来源'),
      name: 'pcSourceCode',
    },
    {
      label: intl.get('spcm.workspace.sourceCode-sourceLineNum').d('来源单据编号-行号'),
      name: 'sourceCode',
    },
    // {
    //   label: intl.get(`${commonPrompt}.sourceLineNum`).d('来源单据行号'),
    //   name: 'sourceLineNum',
    // },
    {
      label: intl.get('spcm.common.view.message.title.executiveDocument').d('执行单据'),
      name: 'executiveDocument',
    },
    {
      label: intl.get('spcm.common.model.common.occupyRecords').d('订单金额占用记录'),
      name: 'occupyRecords',
    },
    {
      label: intl.get(`${commonPrompt}.pcTemplateId`).d('协议模板'),
      name: 'pcTemplateId',
    },
    {
      label: intl.get(`entity.roles.creator`).d('创建人'),
      name: 'createdBy',
    },
    {
      label: intl.get(`spcm.purchaseContractView.model.signDate`).d('签订日期'),
      name: 'signDate',
    },
    {
      label: intl.get('spcm.common.model.startDateActive').d('协议起始日期'),
      name: 'startDateActive',
    },
    {
      label: intl.get('spcm.common.model.endDateActive').d('协议终止日期'),
      name: 'endDateActive',
    },
    {
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
      name: 'creationDate',
    },
    {
      label: intl.get(`spcm.common.model.mainAgreementCode`).d('主协议编码'),
      name: 'mainContractId',
    },
    {
      label: intl.get(`spcm.common.model.priceSyncMessage`).d('价格库同步失败原因'),
      name: 'priceSyncMessage',
    },
    {
      label: intl.get(`spcm.common.model.priceSyncStatus`).d('价格库同步状态'),
      name: 'priceSyncStatus',
      lookupCode: 'SPCM.PRICE_SYNC.STATUS',
    },
    {
      label: intl.get(`spcm.common.archiveCode`).d('归档码'),
      name: 'archiveCode',
    },
    {
      label: intl.get(`spcm.common.releaseDate`).d('发布时间'),
      name: 'releaseDate',
    },
    {
      label: intl.get(`spcm.common.documentFlow`).d('单据流'),
      name: 'documentFlow',
    },
    {
      name: 'occupancyRecords',
      label: intl.get(`spcm.common.model.occupancyRecords`).d('金额占用记录查询'),
    },
    {
      label: intl.get(`spcm.common.attachmentUuid`).d('归档文件'),
      name: 'archiveAttachmentUuid',
      type: 'attachment',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.unitPriceBatch`).d('每'),
      name: 'unitPriceBatch',
    },
  ],
  queryParameter: {
    workbenchFlag: '1',
    customizeUnitCode: 'SPCM.WORKSPACE_LIST.DETAIL.SERARCH2,SPCM.WORKSPACE_LIST.DETAIL.LIST',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/contract-report/receiving/details`,
        method: 'GET',
      };
    },
  },
});

// 审批意见
const approvalComments = () => ({
  dataToJSON: 'all',
  autoCreate: true,
  fields: [
    {
      name: 'approvedRemark',
      label: intl.get('sodr.workspace.model.common.approvedRemark').d('审批意见'),
      dynamicProps: {
        required: ({ dataSet }) => dataSet.getState('type') === 'approvalRejected',
      },
    },
  ],
});

export {
  toBeSubmited,
  underApproval,
  toBeSigned,
  all,
  detailAll,
  // orderCopy,
  approvalComments,
};
