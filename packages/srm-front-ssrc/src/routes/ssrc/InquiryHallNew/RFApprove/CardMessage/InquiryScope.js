/*
 * @Descripttion: 寻源过程审批--征询范围
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 16:25:06
 * @LastEditors: yiping.liu
 */
import React, { useContext } from 'react';
import { Table } from 'choerodon-ui/pro';
// import intl from 'utils/intl';
// import { isEmpty } from 'lodash';
// import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
// import notification from 'utils/notification';

import Store from '../store';
import { phoneRender } from '@/utils/renderer';

const InquiryScope = () => {
  const {
    commonDs: { inquiryScopeDs },
  } = useContext(Store);

  const columns = [
    {
      name: 'supplierCompanyNum',
      width: 150,
    },
    {
      name: 'supplierCompanyName',
      width: 200,
    },
    {
      name: 'stageDescription',
    },
    {
      name: 'contactNameLov',
    },
    {
      name: 'contactPhone',
      width: 200,
      renderer: ({ record }) => {
        return phoneRender(record.get('internationalTelCodeMeaning'), record.get('phone'));
      },
    },
    {
      name: 'contactMail',
    },
  ];

  return (
    <React.Fragment>
      <Table dataSet={inquiryScopeDs} columns={columns} />
    </React.Fragment>
  );
};

export default InquiryScope;
