/*
 * @Descripttion: 申请转RF--页面
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-08-06 10:38:38
 * @LastEditors: yiping.liu
 */
import React, { useContext } from 'react';
import intl from 'utils/intl';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { Button } from 'choerodon-ui/pro';
import notification from 'utils/notification';

import Store from './store';

const Page = (props) => {
  const { location } = props;
  const {
    commonDs: { RFApplyDs },
  } = useContext(Store);
  const { type } = querystring.parse(location.search.substr(1));

  // 新建
  const handleAdd = () => {
    const { selected } = RFApplyDs;
    if (selected.length === 0) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.message.notification.oneRowSelect')
          .d('请选择至少一行数据'),
      });
    }
    // todo
  };

  const columns = [
    {
      name: 'displayPrNum',
      width: 150,
    },
    {
      name: 'displayLineNum',
      width: 90,
    },
    {
      name: 'itemCode',
      width: 120,
    },
    {
      name: 'itemName',
      width: 150,
    },
    {
      name: 'categoryName',
      width: 120,
    },
    {
      name: 'companyName',
      width: 150,
    },
    {
      name: 'ouName',
      width: 150,
    },
    {
      name: 'invOrganizationName',
    },
    {
      name: 'unitName',
    },
    {
      name: 'prRequestedName',
    },
    {
      name: 'quantity',
      width: 90,
    },
  ];

  return (
    <React.Fragment>
      <Header
        title={`${intl.get(`ssrc.inquiryHall.model.inquiryHall.rf.apply`).d('申请转')}${type}`}
        backPath={`/ssrc/new-inquiry-hall/list?sourceCategory=${type}`}
      >
        <Button color="primary" icon="add" onClick={handleAdd}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <Content>
        <SearchBarTable dataSet={RFApplyDs} columns={columns} />
      </Content>
    </React.Fragment>
  );
};

export default formatterCollections({
  code: [
    'ssrc.rfController',
    'ssrc.rfCheck',
    'ssrc.inquiryHall',
    'ssrc.bidChange',
    'ssrc.rfDetail',
    'ssrc.rf',
  ],
})(Page);
