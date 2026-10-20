import React, { PureComponent } from 'react';
import { Table, Output, Form } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import FilterBarTable from '_components/FilterBarTable';
import { yesOrNoRender } from 'utils/renderer';

import intl from 'utils/intl';
import style from '../Update/index.less';

const { TabPane } = Tabs;
const { Column } = Table;

export default class ScopeChild extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(props.ruleCombId, this);
    }
  }

  componentDidMount() {
    // 增加选中记录的事件监听
    this.props.tableDs.addEventListener('select', this.handleSelect);
    // 增加撤销选择记录的事件监听
    this.props.tableDs.addEventListener('unSelect', this.handleUnSelect);
  }

  // 选中级联的数据
  @Bind()
  handleSelect({ record }) {
    this.selectParentData(record);
    this.selectChildrenData(record);
  }

  // 选中级联的子级数据
  @Bind()
  selectChildrenData(item) {
    const cascadeData = item.children;
    if (cascadeData) {
      // 如果是数组
      if (cascadeData.length > 0) {
        const selectedItem = cascadeData.find((cascadeDataItem) => cascadeDataItem.isSelected);
        if (selectedItem) {
          return;
        }
        cascadeData.forEach((cascadeDataItem) => {
          // eslint-disable-next-line
          cascadeDataItem.isSelected = true;
          this.selectChildrenData(cascadeDataItem);
        });
      } else {
        // 单个对象
        cascadeData.isSelected = true;
        this.selectChildrenData(cascadeData);
      }
    }
  }

  // 选中级联的父级数据
  @Bind()
  selectParentData(item) {
    const cascadeData = item.parent;
    if (cascadeData) {
      cascadeData.isSelected = true;
      this.selectParentData(cascadeData);
    }
  }

  // 取消选择级联的数据
  @Bind()
  handleUnSelect({ record }) {
    this.unSelectChildrenData(record);
    this.unSelectParentData(record);
  }

  // 取消选择级联的子级数据
  @Bind()
  unSelectChildrenData(item) {
    const cascadeData = item.children;
    if (cascadeData) {
      // 如果是数组
      if (cascadeData.length > 0) {
        cascadeData.forEach((cascadeDataItem) => {
          // eslint-disable-next-line
          cascadeDataItem.isSelected = false;
          this.unSelectChildrenData(cascadeDataItem);
        });
      } else {
        // 单个对象
        cascadeData.isSelected = false;
        this.unSelectChildrenData(cascadeData);
      }
    }
  }

  // 取消选择级联的父级数据
  @Bind()
  unSelectParentData(item) {
    const cascadeData = item.parent;
    if (cascadeData) {
      // 是否有同级数据已选中
      const peer = cascadeData.children;
      if (peer) {
        if (peer.length > 0) {
          const peerSelected = peer.find((peerItem) => peerItem.isSelected);
          if (!peerSelected) {
            cascadeData.isSelected = false;
            this.unSelectParentData(cascadeData);
          }
        } else {
          cascadeData.isSelected = false;
          this.unSelectParentData(cascadeData);
        }
      } else {
        cascadeData.isSelected = false;
        this.unSelectParentData(cascadeData);
      }
    }
  }

  /**
   * tab 被点击的回调
   */
  @Bind()
  clickTab(newActiveKey) {
    const { ruleCombId } = this.props;
    const params = { ruleCombId, dimensionCode: newActiveKey };
    this.props.fetchScopeTabData(params);
  }

  // renderButtons(item) {
  //   return [
  //     <span style={{ marginLeft: '8px' }}>
  //       {intl.get('ssrc.priceExpandStrategy.model.strategy.joinAll').d('加入全部：')}
  //       <Switch defaultChecked={item.includeAllFlag} checkedValue={1} unCheckedValue={0} disabled />
  //     </span>,
  //   ];
  // }

  render() {
    const { scopeTabsData = [], tableDs } = this.props;

    return (
      <div className={style['tabs-tab-view']}>
        <Tabs
          defaultActiveKey={scopeTabsData[0] && scopeTabsData[0].dimensionCode}
          onTabClick={this.clickTab}
          tabPosition="left"
          style={{ height: '100%' }}
          tabBarStyle={{ paddingTop: '16px' }}
        >
          {scopeTabsData.map((item) => {
            return (
              <TabPane
                tab={
                  <div className={style['tab-item']}>
                    <span className={style['item-name']}>{item.dimensionName}</span>
                  </div>
                }
                key={item.dimensionCode}
              >
                <div className={style['table-wrapper']}>
                  <div style={{ marginBottom: '16px' }}>
                    <Form
                      labelLayout="vertical"
                      className="c7n-pro-vertical-form-display"
                      columns={1}
                    >
                      <Output
                        label={intl
                          .get('ssrc.priceExpandStrategy.model.strategy.joinAll')
                          .d('加入全部')}
                        value={item.includeAllFlag}
                        renderer={({ value }) => yesOrNoRender(value)}
                      />
                    </Form>
                  </div>
                  {!item.includeAllFlag && (
                    <FilterBarTable
                      customizedCode="SSRC.PRICE_EXPAND_STRATEGY.DETAIL.SCOPE_CHILD_TABLE"
                      mode="tree"
                      dataSet={tableDs}
                      queryFieldsLimit={2}
                      // buttons={this.renderButtons(item)}
                      style={{ maxHeight: 'calc(100vh - 230px)' }}
                      filterBarConfig={{
                        collpaseble: false,
                      }}
                    >
                      <Column
                        name="dataName"
                        header={item.dimensionName}
                        headerStyle={{ paddingLeft: '44px' }}
                      />
                      <Column name="dataCode" />
                    </FilterBarTable>
                  )}
                </div>
              </TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }
}
