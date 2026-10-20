import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
// import uuidV4 from 'uuid/v4';

const organizationId = getCurrentOrganizationId();

const deliveryLineDS = () => ({
  primaryKey: 'mappingId',
  paging: false,
  fields: [
    {
      name: 'externalSystemCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.receiptSystemCode').d('来源系统代码'),
      defaultValue: 'SRM',
      help: intl
        .get('sinv.receiptManage.model.receipt.receiptSystemCodeHelp')
        .d(
          '默认SRM系统，若为外部系统，请按照接口给出的外部系统编码进行修改维护（SRM收货只可选到代码为“SRM”的数据）'
        ),
    },
    {
      name: 'rcvTypeCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.receiptRcvTypeCode').d('收货类型编码'),
      required: true,
    },
    {
      name: 'rcvTypeName',
      type: 'intl',
      label: intl.get('sinv.receiptManage.model.receipt.receiptRcvTypeName').d('收货类型描述'),
      required: true,
    },
    {
      name: 'attachmentUuid',
      help: intl
        .get('sinv.receiptManage.model.receipt.attachmentUuidCodehelp')
        .d('收货单选择对应收货类型后可进行模板附件下载'),
      type: 'attachment',
      label: intl.get('sinv.receiptManage.model.receipt.attachmentUuidCode').d('附件模板'),
    },
  ],
  events: {
    // load: ({ dataSet }) => {
    //   dataSet.forEach((record) => {
    //     if (record.get('trxLineCount') > 0) {
    //       Object.assign(record, { selectable: false });
    //     }
    //   });
    // },
  },
  transport: {
    read: ({ data }) => {
      const { params = {} } = data;
      const { nodeConfigId, ...other } = params;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/rcv-ext-mappings/${nodeConfigId}`,
        method: 'GET',
        data: other,
      };
    },
    destroy: ({ data }) => {
      console.log(data, 'data');
      // const { params = {} } = data;
      // const { nodeConfigId, ...other } = params;
      // return {
      //   url: `${SRM_SPUC}/v1/${organizationId}/rcv-ext-mappings`,
      //   method: 'DELETE',
      //   data: other,
      // };
    },
  },
});

const returnLineDS = () => ({
  dataToJSON: 'all',
  paging: false,
  primaryKey: 'reverseConfigId',
  fields: [
    {
      name: 'reverseNodeConfigLov',
      type: 'object',
      label: intl.get('sinv.receiptManage.model.receipt.reversalNodes').d('退货节点'),
      required: true,
      ignore: 'always',
      lovCode: 'SINV.NODE_CONFIG_PRE',
      lovPara: {
        tenantId: organizationId,
      },
      // dynamicProps: {
      //   lovPara: ({ dataSet }) => ({
      //     tenantId: organizationId,
      //     nodeConfigId: dataSet.queryParameter.nodeConfigId,
      //   }),
      // },
    },
    {
      name: 'reverseNodeConfigId',
      type: 'string',
      bind: 'reverseNodeConfigLov.nodeConfigId',
    },
    {
      name: 'reverseNodeConfigName',
      type: 'string',
      bind: 'reverseNodeConfigLov.nodeConfigName',
    },
    {
      name: 'refRcvTypeCodeLov',
      type: 'object',
      ignore: 'always',
      label: intl
        .get('sinv.receiptManage.model.receipt.receipReturnTypCodes')
        .d('平台退货类型编码'),
      lovCode: 'SINV.RECEIVE_TRX_TYPE_NEW',
      lovPara: {
        tenantId: organizationId,
      },
      required: true,
    },
    {
      name: 'rcvTypeCode',
      type: 'string',
      bind: 'refRcvTypeCodeLov.rcvTrxTypeCode',
    },
    {
      name: 'refRcvTypeId',
      type: 'string',
      bind: 'refRcvTypeCodeLov.rcvTrxTypeId',
    },
    {
      name: 'rcvTypeName',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.receiptRcvNames').d('平台退货类型描述'),
      bind: 'refRcvTypeCodeLov.rcvTrxTypeName',
    },
    {
      name: 'associateExternalSystemCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.assReturnTypes').d('租户退货类型'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        record.set('status', 'update');
      });
    },
  },
  transport: {
    read: ({ data }) => {
      const { params = {} } = data;
      const { nodeConfigId, ...other } = params;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/rcv-reverse-configs/${nodeConfigId}`,
        method: 'GET',
        data: other,
      };
    },
  },
});

// 退货类型维护
const returnDS = () => ({
  primaryKey: 'mappingId',
  paging: false,
  fields: [
    {
      name: 'externalSystemCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.receiptSystemCode').d('来源系统代码'),
      defaultValue: 'SRM',
      help: intl
        .get('sinv.receiptManage.model.receipt.returnSystemCodeHelps')
        .d(
          '默认SRM系统，若为外部系统，请按照接口给出的外部系统编码进行修改维护（SRM退货只可选到代码为“SRM”的数据）'
        ),
    },
    {
      name: 'rcvTypeCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.returnRcvTypeCodes').d('退货类型编码'),
      required: true,
    },
    {
      name: 'rcvTypeName',
      type: 'intl',
      label: intl.get('sinv.receiptManage.model.receipt.returnRcvTypeNames').d('退货类型描述'),
      required: true,
    },
    {
      name: 'attachmentUuid',
      help: intl
        .get('sinv.receiptManage.model.receipt.returnSystemUuidHelp')
        .d('收货单选择对应退货类型后可进行模板附件下载'),
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.attachmentUuidCode').d('附件模板'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.get('trxLineCount') > 0) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ data }) => {
      const { params = {} } = data;
      const { name, ...other } = params;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/rcv-ext-mappings/${params[name]}`,
        method: 'GET',
        data: other,
      };
    },
  },
});

export { returnDS, deliveryLineDS, returnLineDS };
