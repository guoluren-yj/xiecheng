import moment from 'moment';
import intl from 'srm-front-boot/lib/utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
/**
 * @return {import("choerodon-ui/dataset/data-set/DataSet").DataSetProps}
 */
export function transferSummaryDs() {
  return {
    fields: [
      {
        label: intl.get('spfm.docTransfer.common.docTypeCode').d('单据类型编码'),
        name: 'docCode',
      },
      {
        label: intl.get('spfm.docTransfer.common.docTypeName').d('单据类型名称'),
        name: 'docName',
      },
      {
        label: intl.get('spfm.docTransfer.common.mainTableName').d('主表'),
        name: 'mainTableName',
      },
      {
        label: intl.get('spfm.docTransfer.common.mainTableColumn').d('更改列'),
        name: 'mainTableColumn',
      },
      {
        label: intl.get('spfm.docTransfer.common.businessDocId').d('单据ID'),
        name: 'businessDocId',
      },
      {
        label: intl.get('spfm.docTransfer.common.businessDocNum').d('业务单据编码'),
        name: 'businessDocNum',
      },
      {
        label: intl.get('spfm.docTransfer.common.deliverFromName').d('转交前账户/采购员'),
        name: 'deliverFromName',
      },
      {
        label: intl.get('spfm.docTransfer.common.deliverToName').d('转交后账户/采购员'),
        name: 'deliverToName',
      },
      {
        label: intl.get('spfm.docTransfer.common.createByName').d('操作用户名称'),
        name: 'createByName',
      },
      {
        label: intl.get('spfm.docTransfer.common.creationDate').d('操作时间'),
        name: 'creationDate',
        type: 'dateTime',
      },
      {
        label: intl.get('spfm.docTransfer.common.deliverType').d('转交维度'),
        name: 'deliverType',
        lookupCode: 'SPFM.DOC_DELIVER_TYPE',
      },
      {
        name: 'deliverSource',
        type: 'string',
        label: intl.get('spfm.docTransfer.common.deliverSource').d('转交类型'),
        lookupCode: 'SPFM.DOC_DELIVER_SOURCE',
      },
    ],
    queryFields: [
      {
        label: intl.get('spfm.docTransfer.common.docTypeCode').d('单据类型编码'),
        name: 'docCode',
        display: true,
        lock: true,
      },
      {
        label: intl.get('spfm.docTransfer.common.docTypeName').d('单据类型名称'),
        name: 'docName',
        display: true,
        lock: true,
      },
      {
        label: intl.get('spfm.docTransfer.common.creationDate').d('操作时间从-至'),
        name: 'creationDate',
        type: 'dateTime',
        range: true,
        display: true,
        lock: true,
        required: true,
        defaultValue: [
          moment().format('YYYY-MM-DD 00:00:00'),
          moment().format('YYYY-MM-DD 23:59:59'),
        ],
      },
      {
        label: intl.get('spfm.docTransfer.common.createByName').d('操作用户名称'),
        name: 'operateUserName',
        display: true,
        lock: true,
      },
      {
        label: intl.get('spfm.docTransfer.common.deliverType').d('转交维度'),
        name: 'deliverType',
        lookupCode: 'SPFM.DOC_DELIVER_TYPE',
        display: true,
        lock: true,
      },
    ],
    transport: {
      read({ data }) {
        const [recordFrom, recordTo] = (data.creationDate || '').split(',');
        const newData = {
          ...data,
          recordFrom,
          recordTo,
        };
        delete newData.creationDate;
        return {
          method: 'GET',
          url: `/spfm/v1/${getCurrentOrganizationId()}/doc-deliver-records/page`,
          data: newData,
        };
      },
    },
  };
}
