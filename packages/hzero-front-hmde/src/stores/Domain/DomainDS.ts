/*
 * @Descripttion: 领域DataSet
 * @Date: 2021-08-04 15:12:21
 * @Author: ZHIJIAN.XU@HAND-CHINA.COM
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
// import { API_HOST } from 'utils/config';
// import { getUserOrganizationId, isTenantRoleLevel } from 'utils/utils';
import intl from 'srm-front-boot/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

// TODO: 提测前删除
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

const DomainDS = (): DataSetProps => ({
  // autoQuery: true,
  paging: false,
  transport: {
    read: ({ params }) => ({
      // url: `${API_HOST}/hmde/v1/${
      //   isTenantRoleLevel() ? `${getUserOrganizationId()}/` : ''
      // }domains/list`,
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/domains/list`,
      method: 'GET',
      params,
    }),
  },
  fields: [
    {
      label: intl.get('hmde.domain.view.message.header.domainId').d('领域主键'),
      name: 'domainId',
      type: FieldType.string,
    },
    {
      label: intl.get('hmde.domain.view.message.header.domainCode').d('领域编码'),
      name: 'domainCode',
      type: FieldType.string,
    },
    {
      label: intl.get('hmde.domain.view.message.header.domainName').d('领域名称'),
      name: 'domainName',
      type: FieldType.intl,
    },
    {
      label: intl.get('hmde.domain.view.message.header.domainIcon').d('icon'),
      name: 'icon',
      type: FieldType.string,
    },
    {
      label: intl.get('hmde.common.label.remark').d('描述'),
      name: 'remark',
      type: FieldType.string,
    },
    {
      label: intl.get('hmde.domain.view.message.header.dataSourceId').d('数据源ID'),
      name: 'dataSourceId',
      type: FieldType.string,
    },
  ],
});

export { DomainDS };
