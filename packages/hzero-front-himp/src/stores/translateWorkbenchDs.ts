import intl from 'hzero-front/lib/utils/intl';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { HZERO_IMP } from 'hzero-front/lib/utils/config';

export const listTableDS = () => {
  const isTenant = isTenantRoleLevel();
  return {
    selection: false,
    paging: false,
    queryFields: [
      {
        name: 'objectType',
        label: intl.get('hpfm.translateWorkbench.model.dataConfig.type').d('类型'),
        lookupCode: 'HPFM.TRANSLATE.OBJECT.TYPE',
        display: true,
      },
      {
        name: 'objectName',
        label: intl.get('hpfm.translateWorkbench.model.dataConfig.object').d('对象'),
        display: true,
      },
      {
        name: 'missLang',
        label: intl.get('hpfm.translateWorkbench.model.dataConfig.missLang').d('缺失翻译语言'),
        display: true,
        lookupCode: isTenant ? 'HPFM.LANGUAGE_LIST_TENANT' : 'HPFM.LANGUAGE_LIST',
        multiple: true,
      },
    ],
    fields: [
      {
        name: 'translateObjectId',
      },
      {
        name: 'objectType',
        label: intl.get('hpfm.translateWorkbench.model.dataConfig.type').d('类型'),
      },
      {
        name: 'objectTypeMeaning',
        label: intl.get('hpfm.translateWorkbench.model.dataConfig.type').d('类型'),
      },
      {
        name: 'objectName',
        label: intl.get('hpfm.translateWorkbench.model.dataConfig.object').d('对象'),
      },
      {
        name: 'fieldCode',
        label: intl.get('hpfm.translateWorkbench.model.dataConfig.field').d('字段'),
      },
      {
        name: 'fieldName',
        label: intl.get('hpfm.translateWorkbench.model.dataConfig.field').d('字段'),
      },
      {
        name: 'countValue',
        label: intl.get('hpfm.translateWorkbench.model.dataConfig.dataSize').d('数据量'),
      },
      {
        name: 'dataRangeTypeMeaning',
        label: intl
          .get('hpfm.translateWorkbench.model.dataConfig.dataRangeTypeMeaning')
          .d('数据范围'),
      },
      {
        name: 'lastStatisticsDate',
        label: intl
          .get('hpfm.translateWorkbench.model.dataConfig.lastStatisticalTime')
          .d('最后统计时间'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_IMP}/v1/${
            isTenant ? `${getCurrentOrganizationId()}/` : ''
          }translate/station/translate-object/query`,
          method: 'POST',
        };
      },
    },
  } as any;
};
