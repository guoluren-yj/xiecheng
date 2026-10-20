/**
 * 风险工作台
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2023-03-06
 * @Copyright: Copyright (c) 2023, Zhenyun
 */
import intl from 'utils/intl';
// import { getCurrentOrganizationId } from 'utils/utils';
// import { PRIVATE_BUCKET } from '_utils/config';

// import { SRM_DATA_SDAT } from '@/utils/config';

// const organizationId = getCurrentOrganizationId();
// const BUCKET_DIRECTORY = 'sdat-risk-workbench';

/**
 * 风险等级说明 table
 * @returns
 */
const LevelTableDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get('sdat.riskLevelDefine.model.riskLevel').d('风险等级'),
      name: 'riskLevel',
      type: 'string',
    },
    {
      label: intl.get('sdat.riskLevelDefine.model.scoreRange').d('分值范围'),
      name: 'scoreRange',
      type: 'number',
      range: ['startScore', 'endScore'],
      min: 0,
      max: 100,
      step: 1,
    },
    {
      label: intl.get('sdat.riskLevelDefine.model.levelDesc').d('等级说明'),
      name: 'levelDescription',
      type: 'intl',
    },
  ],
  events: {},
});

export { LevelTableDS };
