import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
// import type { FieldProps } from 'choerodon-ui/dataset/data-set/Field';

const organizationId = getCurrentOrganizationId();



function getQueryFields(code, lovParams){
  return [
    {
      name: 'processTypeCode',
      display: true,
      noCache: true,
      type: FieldType.string,
      lovPara: { tenantId: organizationId, ...lovParams },
      lookupCode: code || 'SLOD.DELIVERY_RECORD_TYPE_LOCAL',
      label: intl.get('sinv.common.operate.processTypeCode').d('操作节点'),
    },
    {
      name: 'processTimeRange',
      range: true,
      display: true,
      type: FieldType.dateTime,
      label: intl.get('sinv.common.operate.processedDateRange').d('操作时间'),
    },
  ];
}


const operationDS = ({lookupCode, lovParams = {}}: {lookupCode?: string| null | undefined, lovParams?: object| null | undefined} = {}): DataSetProps => ({
    selection: false, // 设置table 单选多选 没有
    autoQuery: false,
    queryFields: getQueryFields(lookupCode, lovParams),
});

export default operationDS;