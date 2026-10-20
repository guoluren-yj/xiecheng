import React, { Component } from 'react';
import qs from 'qs';
import { connect } from 'dva';
import { Tabs, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import CacheComponent from 'components/CacheComponent';
import formatterCollections from 'utils/intl/formatterCollections';

import Banner from './Banner';
import CustomBar from './CustomBar';
import PurchasePackage from './PurchasePackage';

@formatterCollections({
  code: ['small.common', 'small.mallHomePlate', 'small.customBar'],
})
@connect(({ mallHomePlate }) => ({ mallHomePlate }))
@Form.create()
@CacheComponent({ cacheKey: '/small/mall-home-plate' })
export default class MallHomePlate extends Component {
  constructor(props) {
    super(props);
    const { key = 'banner' } = qs.parse(props.location.search.substr(1));
    this.state = {
      activeKey: key, // 当前tab的key
    };
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'mallHomePlate/init',
    });
    this.props.dispatch({
      type: 'mallHomePlate/getCurrentCompany',
    });
  }

  @Bind()
  toggleTab(activeKey = 'banner') {
    this.setState({ activeKey }, () => {
      this.props.history.push(`/small/mall-home-plate/list?key=${activeKey}`);
    });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      mallHomePlate: { currentCompany: company = {} },
    } = this.props;
    const { activeKey } = this.state;

    const companyId = getFieldValue('companyId') || company.companyId;

    return (
      <React.Fragment>
        <Header
          title={intl.get('small.mallHomePlate.view.company.title').d('商城首页板块管理(公司)')}
        >
          <Form layout="inline">
            <Form.Item label={intl.get('small.common.view.currentCompany').d('当前公司')}>
              {getFieldDecorator('companyId', { initialValue: company.companyId })(
                <Lov
                  allowClear={false}
                  textField="companyName"
                  textValue={company.companyName}
                  code="SPFM.USER_AUTHORITY_COMPANY"
                />
              )}
            </Form.Item>
          </Form>
        </Header>
        <Content>
          <Tabs
            animated={false}
            activeKey={activeKey}
            onChange={this.toggleTab}
            tabBarStyle={{ marginTop: '-16px' }}
          >
            <Tabs.TabPane
              tab={intl.get('small.mallHomePlate.view.banner.company').d('公司Banner管理')}
              key="banner"
            >
              <Banner companyId={companyId} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('small.mallHomePlate.view.customBar.company').d('公司自定义栏管理')}
              key="bar"
            >
              <CustomBar companyId={companyId} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('small.mallHomePlate.view.package.company').d('公司采购套餐管理')}
              key="package"
            >
              <PurchasePackage companyId={companyId} />
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
