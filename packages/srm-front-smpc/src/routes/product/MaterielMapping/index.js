/**
 * 物料映射
 * @date: 2020-12-16
 * @author hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Tabs } from 'hzero-ui';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

// import SkuMap from './SkuMap';
import ItemAndCategoryMap from './ItemAndCategoryMap';
import './index.less';

@formatterCollections({
  code: ['smpc.materielMapping', 'smpc.product'],
})
export default class GroupMaterielMapping extends Component {
  render() {
    return (
      <React.Fragment>
        <Header title={intl.get('smpc.materielMapping.view.title').d('物料映射')} />
        <Content className="materiel-mapping-container">
          <Tabs>
            <Tabs.TabPane
              tab={intl.get('smpc.materielMapping.view.itemMapCatalog').d('物料映射商城目录')}
              key="1"
            >
              <ItemAndCategoryMap mappingType="ITEM" />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl
                .get('smpc.materielMapping.view.itemCategoryMapCatalog')
                .d('品类映射商城目录')}
              key="2"
            >
              <ItemAndCategoryMap mappingType="ITEM_CATEGORY" />
            </Tabs.TabPane>
            {/* <Tabs.TabPane
              tab={intl
                .get('smpc.materielMapping.view.itemCategoryMapProduct')
                .d('物料/品类映射商品')}
              key="2"
            >
              <SkuMap />
            </Tabs.TabPane> */}
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
