/**
 * MaterielMapping -电商分类映射公司目录
 * @date: 2019-2-20
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Tabs } from 'hzero-ui';
import { connect } from 'dva';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { Header, Content } from 'components/Page';

import './MaterielMapping.less';
import CategoryRef from './CategoryRef';
import EcCategoryRef from './EcCategoryRef';
import EcProductRef from './EcProductRef';
import ProductRef from './ProductRef';

@formatterCollections({
  code: [
    'scec.ecMaterielMapping',
    'scec.ecPlatformCategory',
    'scec.ecCategoryPlatformCatalog',
    'entity.company',
    'scec.common',
  ],
})
@connect(({ ecMaterielMapping }) => ({
  ecMaterielMapping,
}))
export default class MaterielMapping extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.queryMapStatusList();
  }

  /**
   * 查询映射值集
   */
  @Bind()
  queryMapStatusList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecMaterielMapping/queryMapStatusList',
    });
  }

  render() {
    const { ecMaterielMapping: { mapStatusList = [] } } = this.props;
    const detailProps = {
      mapStatusList,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('scec.ecMaterielMapping.view.ecMaterielMapping.title').d('物料映射')}
        />
        <Content className="matermap-content">
          <Tabs animated={false} defaultActiveKey="1" tabBarStyle={{marginTop: '-16px'}}>
            <Tabs.TabPane
              tab={intl.get('scec.ecMaterielMapping.view.tab.categoryRef').d('目录映射物料')}
              key="1"
              className="matermap-tabPane"
            >
              <CategoryRef {...detailProps} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('scec.ecMaterielMapping.view.tab.ecCategoryRef').d('电商分类映射物料')}
              key="2"
              className="matermap-tabPane"
            >
              <EcCategoryRef {...detailProps} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('scec.ecMaterielMapping.view.tab.ecProductRef').d('商品(电商)映射物料')}
              key="3"
              className="matermap-tabPane"
            >
              <EcProductRef {...detailProps} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('scec.ecMaterielMapping.view.tab.productRef').d('商品(目录化)映射物料')}
              key="4"
              className="matermap-tabPane"
            >
              <ProductRef {...detailProps} />
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
