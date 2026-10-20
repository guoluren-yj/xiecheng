/*
 * @Descripttion: 关闭询价单--审批
 * @version: 1.0
 * @Author: yujie.shao@going-link.com;
 * @Date: 2021-09-01 10:42
 */
import React, { useMemo } from 'react';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { DataSet, Form, Output } from 'choerodon-ui/pro';
// import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';

import { closeApprovalFormDS } from './closeApprovalFormDS';

const Index = (props) => {
  const {
    match: {
      params: { bidHeaderId },
    },
  } = props;
  const formDS = useMemo(() => new DataSet(closeApprovalFormDS({ bidHeaderId })), []);

  const rfxToDetail = (record) => {
    return (
      <a
        onClick={() => {
          inquiryDetail(record.record);
        }}
      >
        {record.value}
      </a>
    );
  };

  const inquiryDetail = (record) => {
    const { history } = props;
    history.push({
      pathname: `/pub/ssrc/bid-hall/bid-detail/${bidHeaderId}`,
      search: `source=${record.get('subjectMatterRule')}`,
    });
  };

  return (
    <div>
      <Header
        // backPath="/ssrc/new-inquiry-hall/list"
        title={intl.get(`ssrc.bidHall.view.title.closeBid`).d('招标关闭')}
      />
      <Content>
        <Form dataSet={formDS} columns={3}>
          <Output name="bidNum" renderer={(record) => rfxToDetail(record)} />
          <Output
            name="templateName"
            renderer={({ record }) => record?.get('sourceTemplate')?.templateName}
          />
          <Output name="bidTitle" />
          <Output name="closeRemark" />
        </Form>
      </Content>
    </div>
  );
};

export default formatterCollections({ code: ['ssrc.bidHall'] })(Index);
