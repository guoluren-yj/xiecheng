import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SQAM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import type { ActiveKey} from '../../utils/type';
import { campCode, ActionType, ProjectListCode, ProjectSearchCode, DocumentListCode, DocumentSearchCode, StageListCode, StageSearchCode } from '../../utils/type';
import { transformQselectDate } from '../../../../utils/utils';

const organizationId = getCurrentOrganizationId();

export const projectTableDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    primaryKey: 'projectHeaderId',
    cacheSelection: true,
    fields: [
      {
        name: 'projectStatus',
        type: FieldType.string,
        lookupCode: 'SQAM.PPAP_PROJECT_STATUS',
        label: intl.get('sqam.ppap.model.project.status').d('项目状态'),
      },
      {
        name: 'operate',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.common.operate').d('操作'),
      },
      {
        name: 'projectNum',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.projectNum').d('项目编号'),
      },
      {
        name: 'projectName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.projectName').d('项目名称'),
      },
      {
        name: 'process',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.process').d('进行阶段'),
      },
      {
        name: 'executeProcess',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.executeProcess').d('执行阶段'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.company').d('公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.supplierCompany').d('供应商'),
      },
      {
        name: 'createName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.creator').d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.createDate').d('创建日期'),
      },
      {
        name: 'itemCode',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.partNum`).d('零件编码'),
      },
      {
        name: 'specification',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.specification`).d('规格'),
      },
      {
        name: 'model',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.model`).d('型号'),
      },
    ],
    queryParameter: {
      action: ActionType[activeKey],
      customizeUnitCode: [ProjectListCode[activeKey], ProjectSearchCode[activeKey]].join(),
    },
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/page-supplier`,
          method: 'GET',
          data: {
            ...data,
            ...transformQselectDate(data, { creationDateRange: 'creationDate' }),
          },
        };
      },
    },
  };
};

export const documentTableDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    selection: false,
    primaryKey: 'documentId',
    fields: [
      {
        name: 'documentStatus',
        type: FieldType.string,
        lookupCode: 'SQAM.PPAP_DOCUMENT_STATUS',
        label: intl.get('sqam.ppap.model.document.status').d('交付物状态'),
      },
      {
        name: 'projectNum',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.projectNum').d('项目编号'),
      },
      {
        name: 'projectName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.projectName').d('项目名称'),
      },
      {
        name: 'documentNum',
        type: FieldType.string,
        required: true,
        label: intl.get(`sqam.ppap.model.template.deliverableNum`).d('交付物编号'),
      },
      {
        name: 'documentName',
        type: FieldType.string,
        required: true,
        label: intl.get(`sqam.ppap.model.template.deliverableName`).d('交付物名称'),
      },
      {
        name: 'operate',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.common.operate').d('操作'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.company').d('公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.supplierCompany').d('供应商'),
      },
      {
        name: 'documentAttachmentUuid',
        type: FieldType.attachment,
        label: intl.get('sqam.ppap.model.project.attachment').d('交付物附件'),
      },
      {
        name: 'approveType',
        type: FieldType.string,
        lookupCode: 'SQAM.PPAP_APPROVER_TYPE',
        label: intl.get('sqam.ppap.model.project.approveType').d('审核人类型'),
      },
      {
        name: 'approvedByName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.approvedBy').d('审核人'),
      },
      {
        name: 'campMeaning',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.campMeaning').d('责任方阵营'),
      },
      {
        name: 'createName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.creator').d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        label: intl.get('sqam.ppap.model.project.createDate').d('创建日期'),
      },
    ],
    queryParameter: filterNullValueObject({
      action: ActionType[activeKey],
      customizeUnitCode: [DocumentListCode[activeKey], DocumentSearchCode[activeKey]].join(),
      operatorCamp: campCode,
    }),
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-documents/page-supplier`,
          method: 'GET',
          data: {
            ...data,
            ...transformQselectDate(data, { creationDateRange: 'creationDate' }),
          },
        };
      },
    },
  };
};

export const stageTableDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    selection: false,
    primaryKey: 'stageId',
    fields: [
      {
        name: 'stageStatus',
        type: FieldType.string,
        lookupCode: 'SQAM.PPAP_STAGE_STATUS',
        label: intl.get(`sqam.ppap.model.project.stageStatus`).d('阶段状态'),
      },
      {
        name: 'operate',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.common.operate').d('操作'),
      },
      {
        name: 'sequence',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.sequence`).d('序号'),
      },
      {
        name: 'projectNum',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.projectNum').d('项目编号'),
      },
      {
        name: 'projectName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.projectName').d('项目名称'),
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        required: true,
        label: intl.get(`sqam.ppap.model.template.stageNum`).d('阶段编号'),
      },
      {
        name: 'stageName',
        type: FieldType.string,
        required: true,
        label: intl.get(`sqam.ppap.model.template.stageName`).d('阶段名称'),
      },
      {
        name: 'stageOpenTypeMeaning',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.stageEnableVerify`).d('阶段开启校验'),
      },
      {
        name: 'stageCloseTypeMeaning',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.stageUnEnableVerify`).d('阶段关闭校验'),
      },
      {
        name: 'closeApproveMethodMeaning',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.closeStageApprovalWap`).d('阶段关闭审批方式'),
      },
      {
        name: 'closeApproveTypeMeaning',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.closeStageVerifierType`).d('阶段关闭审批人类型'),
      },
      {
        name: 'openExpectDate',
        type: FieldType.dateTime,
        label: intl.get(`sqam.ppap.model.project.openExpectDate`).d('阶段预计开始时间'),
      },
      {
        name: 'closeExpectDate',
        type: FieldType.dateTime,
        label: intl.get(`sqam.ppap.model.project.closeExpectDate`).d('阶段预计完成时间'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.common.companyName`).d('公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.common.supplierCompany').d('供应商'),
      },
      {
        name: 'openDate',
        type: FieldType.dateTime,
        label: intl.get('sqam.ppap.model.project.openDate').d('阶段开始时间'),
      },
      {
        name: 'closeDate',
        type: FieldType.dateTime,
        label: intl.get('sqam.ppap.model.project.closeDate').d('阶段关闭时间'),
      },
      {
        name: 'documentsCompletedPercent',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.documentsCompletedPercent`).d('交付物审核进度'),
      },
    ],
    queryParameter: {
      action: ActionType[activeKey],
      customizeUnitCode: [StageListCode[activeKey], StageSearchCode[activeKey]].join(),
      operatorCamp: campCode,
    },
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-stages/page-supplier`,
          method: 'GET',
          data: {
            ...data,
            ...transformQselectDate(data, { creationDateRange: 'creationDate' }),
          },
        };
      },
    },
  };
};
