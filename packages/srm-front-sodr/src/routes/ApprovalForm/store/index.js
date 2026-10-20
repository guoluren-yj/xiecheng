import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';
import {
  BUCKET_NAME,
  PURCHASER_EXTERNAL_DIRECTORY,
  PURCHASER_INTERNAL_DIRECTORY,
  SUPPLIER_DIRECTORY,
} from '@/routes/components/utils/constant';

const organizationId = getCurrentOrganizationId();

const basic = ({ poHeaderId, extraDs, attachmentInfoDs }) => {
  return {
    dataToJSON: 'all',
    fields: [
      {
        name: 'displayPoNum',
        label: intl.get('sodr.approvalForm.model.common.displayPoNum').d('订单编号'),
      },
      {
        name: 'poTypeId',
        label: intl.get('sodr.approvalForm.model.common.poTypeId').d('订单类型'),
      },
      {
        name: 'realName',
        label: intl.get('sodr.approvalForm.model.common.createdBy').d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'date',
        label: intl.get('sodr.approvalForm.model.common.creationDate').d('创建时间'),
      },
    ],
    queryParameter: {
      camp: 1,
      poEntryPoint: 'PURCHASE_APPROVAL_DETAIL',
      customizeUnitCode: 'SODR.WORKFLOW.AFBASIC,SODR.WORKFLOW.AFEXTRA',
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/detail`,
          method: 'GET',
        };
      },
    },
    feedback: {
      loadSuccess(resp) {
        extraDs.loadData([resp]);
        attachmentInfoDs.loadData([resp]);
      },
    },
  };
};

const extra = () => {
  return {
    fields: [
      {
        name: 'companyName',
        label: intl.get('sodr.approvalForm.model.common.companyInfo').d('公司信息'),
      },
      {
        name: 'supplierName',
        label: intl.get('sodr.approvalForm.model.common.supplierInfo').d('供应商信息'),
      },
      // {
      //   name: 'purchaseOrgAndAgent',
      //   label: intl.get('sodr.approvalForm.model.common.purchaseOrgAndAgent').d('采购组织/采购员'),
      // },
      {
        name: 'purchaseOrgName',
        label: intl.get('sodr.approvalForm.model.common.purchaseOrgName').d('采购组织'),
      },
      {
        name: 'agentName',
        label: intl.get('sodr.approvalForm.model.common.agentName').d('采购员'),
      },
      {
        name: 'remark',
        label: intl.get('sodr.approvalForm.model.common.remark').d('备注'),
      },
    ],
  };
};

const line = ({ poHeaderId }) => {
  return {
    selection: false,
    pageSize: 20,
    fields: [
      {
        name: 'changeFlagMeaning',
        label: intl.get('sodr.approvalForm.model.common.changeType').d('变更类型'),
      },
      {
        name: 'displayLineNum',
        label: intl.get('sodr.approvalForm.model.common.displayLineNum').d('行号'),
      },
      {
        name: 'itemCode',
        label: intl.get('sodr.approvalForm.model.common.itemCode').d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get('sodr.approvalForm.model.common.itemName').d('物料名称'),
      },
      {
        name: 'quantity',
        label: intl.get('sodr.approvalForm.model.common.quantity').d('数量'),
      },
      {
        name: 'uomCodeAndName',
        label: intl.get('sodr.approvalForm.model.common.uomCodeAndName').d('单位'),
      },
      {
        name: 'needByDate',
        type: 'date',
        label: intl.get('sodr.approvalForm.model.common.needByDate').d('需求日期'),
      },
      {
        name: 'enteredTaxIncludedPrice',
        type: 'currency',
        label: intl.get('sodr.approvalForm.model.common.enteredTaxIncludedPrice').d('单价(含税)'),
      },
      {
        name: 'taxIncludedLineAmount',
        type: 'currency',
        label: intl.get('sodr.approvalForm.model.common.taxIncludedLineAmount').d('行金额(含税)'),
      },
      {
        name: 'unitPrice',
        type: 'currency',
        label: intl.get('sodr.approvalForm.model.common.unitPrice').d('单价(不含税)'),
      },
      {
        name: 'lineAmount',
        type: 'currency',
        label: intl.get('sodr.approvalForm.model.common.lineAmount').d('行金额(不含税)'),
      },
    ],
    queryParameter: {
      camp: 1,
      sortType: 0,
      poEntryPoint: 'PURCHASE_APPROVAL_DETAIL',
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/po-line/${poHeaderId}/detail`,
          method: 'GET',
        };
      },
    },
  };
};

const attachmentInfo = () => {
  return {
    fields: [
      {
        name: 'purchaserInnerAttachmentUuid',
        label: intl.get('sodr.workspace.model.common.attachmentUUID').d('采购方附件'),
        type: 'attachment',
        bucketName: BUCKET_NAME,
        bucketDirectory: PURCHASER_INTERNAL_DIRECTORY,
      },
      {
        name: 'attachmentUuid',
        label: intl.get('sodr.workspace.model.common.attachmentUUID').d('采购方附件'),
        type: 'attachment',
        bucketName: BUCKET_NAME,
        bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
      },
      {
        name: 'supplierAttachmentUuid',
        type: 'attachment',
        label: intl.get('sodr.workspace.model.common.supplierAttachmentId').d('供应商附件'),
        bucketName: BUCKET_NAME,
        bucketDirectory: SUPPLIER_DIRECTORY,
      },
    ],
  };
};

export { basic, extra, line, attachmentInfo };
