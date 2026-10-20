
/**
 * index.js 收货管理配置-新
 * @date: 2022-11-14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

import intl from 'srm-front-boot/lib/utils/intl/index.js';
import { SRM_SPUC, PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config.js';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils/user';

const organizationId = getCurrentOrganizationId();

const indexDS = (): DataSetProps => ({
    primaryKey: 'mappingId',
    paging: false,
    fields: [
      {
        name: 'externalSystemCode',
        type: FieldType.string,
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
        type: FieldType.string,
        label: intl.get('sinv.receiptManage.model.receipt.returnRcvTypeCodes').d('退货类型编码'),
        required: true,
      },
      {
        name: 'rcvTypeName',
       type: FieldType.intl,
        label: intl.get('sinv.receiptManage.model.receipt.returnRcvTypeNames').d('退货类型描述'),
        required: true,
      },
      {
        name: 'attachmentUuid',
        help: intl
          .get('sinv.receiptManage.model.receipt.returnSystemUuidHelp')
          .d('收货单选择对应退货类型后可进行模板附件下载'),
          type: FieldType.attachment,
          bucketName: PRIVATE_BUCKET,
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
        const { reverseConfigId } = params || {};
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/rcv-ext-mappings/${reverseConfigId}`,
          method: 'GET',
          data: params,
        };
      },
    },
});

export { indexDS };