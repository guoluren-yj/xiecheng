import React from 'react';
import { connect } from 'dva';
import { Spin, Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { BaseInfo, TableList } from '@/routes/small/Agreements';
import { protocalUnitCode } from '../../const/uniCode';

const customizeUnitCode = protocalUnitCode.history;

@formatterCollections({
  code: [
    'small.mallProtocolManagement',
    'small.common',
    'small.freight',
    'sagm.common',
    'small.productPublish',
  ],
})
@connect(({ loading, mallProtocolManagement }) => ({
  mallProtocolManagement,
  headerLoading: loading.effects['mallProtocolManagement/fetcthHistoryDetailsData'],
}))
export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    const { agreementId, versionNum } = props.match.params;
    this.state = {
      agreementId,
      versionNum,
      initData: {},
    };
  }

  componentDidMount() {
    this.fetchBaseInfo();
  }

  @Bind()
  fetchBaseInfo(page = {}) {
    const { dispatch } = this.props;
    const { agreementId, versionNum } = this.state;
    dispatch({
      type: 'mallProtocolManagement/fetcthHistoryDetailsData',
      payload: { page, agreementId, versionNum, customizeUnitCode },
    }).then((res) => {
      if (res) {
        const result = res.content || [];
        this.setState({ initData: result[0] || {} });
      }
    });
  }

  render() {
    const { headerLoading } = this.props;
    const { initData, agreementId, versionNum } = this.state;

    return (
      <React.Fragment>
        <Header
          title={intl.get('small.common.view.agreementDetail').d('协议明细')}
          backPath="/small/mall-protocol-management/list?tabKey=c"
        />
        <Content>
          <Spin spinning={!!headerLoading}>
            <BaseInfo baseInfo={initData} sourceType="history" />
          </Spin>
          <Tabs animated={false}>
            <Tabs.TabPane tab={intl.get('small.common.view.agreementLine').d('协议行')} key="1">
              <TableList
                isHistory
                skuReadOnly
                baseInfo={initData}
                agreementId={agreementId}
                versionNum={versionNum}
                path={this.props.location.pathname}
              />
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
