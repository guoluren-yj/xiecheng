/**
 * GroupMaterielMapping - 集团物料映射
 * @date: 2020-2-11
 * @author hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Tabs } from 'hzero-ui';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import ProductMapping from './ProductMapping';
import CategoryMapping from './CategoryMapping';
import EcProductMapping from './EcProductMapping';
import EcCategoryMapping from './EcCategoryMapping';

import './index.less';

@formatterCollections({
  code: ['scec.GroupMaterielMapping', 'scec.common'],
})
@connect(({ groupMaterielMapping }) => ({
  groupMaterielMapping,
}))
export default class GroupMaterielMapping extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    // 查询映射状态/商品来源值集
    dispatch({
      type: 'groupMaterielMapping/fetchValueList',
    });
  }

  render() {
    const {
      groupMaterielMapping: { mapStatusList = [], productSourceList = [] },
    } = this.props;
    const detailProps = {
      mapStatusList,
      productSourceList,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('scec.groupMaterielMapping.view.groupMaterielMapping.title')
            .d('物料映射')}
        />
        <Content className="matermap-content">
          <Tabs animated={false} defaultActiveKey="1" tabBarStyle={{ marginTop: '-16px' }}>
            <Tabs.TabPane
              tab={intl.get('scec.ecMaterielMapping.view.tab.category').d('目录映射物料')}
              key="1"
              className="matermap-tabPane"
            >
              <CategoryMapping {...detailProps} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('scec.ecMaterielMapping.view.tab.ecCategory').d('电商分类映射物料')}
              key="2"
              className="matermap-tabPane"
            >
              <EcCategoryMapping {...detailProps} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('scec.ecMaterielMapping.view.tab.ecProductRef').d('商品(电商)映射物料')}
              key="3"
              className="matermap-tabPane"
            >
              <EcProductMapping {...detailProps} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('scec.ecMaterielMapping.view.tab.productRef').d('商品(目录化)映射物料')}
              key="4"
              className="matermap-tabPane"
            >
              <ProductMapping {...detailProps} />
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
