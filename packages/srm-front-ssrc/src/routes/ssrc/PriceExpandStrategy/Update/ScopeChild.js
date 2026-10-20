import React, { PureComponent } from 'react';
import { DataSet, Table, Button, Modal, Lov, Icon, Form, CheckBox } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import FilterBarTable from '_components/FilterBarTable';

import {
  saveIntroduce,
  saveAddTab,
  saveJoinAll,
  fetchLovConfig,
  deleteTab,
} from '@/services/priceExpandStrategyService';
import { policySettingScopeModalDS, lovConfigDS } from './lineDS';
import style from './index.less';

const { TabPane } = Tabs;
const { Column } = Table;
const modalKey = Modal.key();
let _modal;

export default class ScopeChild extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(props.ruleCombId, this);
    }
    this.state = {
      activeKey: '',
      scopeTabsData: props.scopeTabsData,
    };
  }

  policySettingScopeModalDs = new DataSet(policySettingScopeModalDS());

  lovConfigDs = new DataSet(lovConfigDS());

  componentDidMount() {
    // 增加选中记录的事件监听
    this.props.tableDs.addEventListener('select', this.handleSelect);
    // 增加撤销选择记录的事件监听
    this.props.tableDs.addEventListener('unSelect', this.handleUnSelect);
    // 增加选中记录的事件监听
    this.policySettingScopeModalDs.addEventListener('select', this.handleSelect);
    // 增加撤销选择记录的事件监听
    this.policySettingScopeModalDs.addEventListener('unSelect', this.handleUnSelect);
  }

  // 选中级联的数据
  @Bind()
  handleSelect({ dataSet, record }) {
    if (dataSet === this.policySettingScopeModalDs) {
      this.selectParentData(record);
      this.selectChildrenData(record);
    } else if (dataSet === this.props.tableDs) {
      this.selectChildrenData(record);
    }
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
  handleUnSelect({ dataSet, record }) {
    if (dataSet === this.policySettingScopeModalDs) {
      this.unSelectParentData(record);
      this.unSelectChildrenData(record);
    } else if (dataSet === this.props.tableDs) {
      this.unSelectParentData(record);
    }
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
   * 引入 - 公司ID/业务实体/库存组织/下拉框
   */
  @Bind()
  handleIntroduce(item) {
    const { ruleCombId } = this.props;

    const params = { ruleCombId, dimensionCode: item.dimensionCode };

    this.policySettingScopeModalDs.setQueryParameter('params', params);
    this.policySettingScopeModalDs.query();

    // 打开弹框
    Modal.open({
      key: modalKey,
      title: item.dimensionName,
      style: {
        width: 680,
      },
      children: (
        <Table mode="tree" dataSet={this.policySettingScopeModalDs} queryFieldsLimit={2}>
          <Column name="dataName" />
          <Column name="dataCode" />
        </Table>
      ),
      onOk: async () => {
        if (!isEmpty(this.policySettingScopeModalDs.selected)) {
          const data = this.policySettingScopeModalDs.selected.map((n) => n.toData());
          const res = getResponse(await saveIntroduce(data));
          if (res && !res.failed) {
            notification.success();
            this.props.tableDs.query();
          }
          return res;
        } else {
          return false;
        }
      },
      onCancel: () => true,
      afterClose: () => {
        this.policySettingScopeModalDs.loadData([]);
      },
    });
  }

  /**
   * 引入 - LOV
   */
  @Bind()
  async handleIntroduceLov(item) {
    const { ruleCombId } = this.props;
    const params = { ruleCombId, dimensionCode: item.dimensionCode };

    // 打开弹框
    _modal = Modal.open({
      key: modalKey,
      title: item.dimensionName,
      style: {
        width: 680,
      },
      children: <Table mode="tree" dataSet={this.lovConfigDs} columns={[]} queryFieldsLimit={2} />,
      onOk: async () => {
        if (!isEmpty(this.lovConfigDs.selected)) {
          const data = this.lovConfigDs.selected.map((n) => n.toData());
          const res = getResponse(await saveIntroduce(data));
          if (res && !res.failed) {
            notification.success();
            this.props.tableDs.query();
          }
          return res;
        } else {
          return false;
        }
      },
      onCancel: () => true,
      afterClose: () => {
        this.lovConfigDs.loadData([]);
      },
    });
    // 查询头
    const res = getResponse(await fetchLovConfig({ viewCode: item.sourceCode }));
    if (res && !res.failed) {
      const queryFromDs = new DataSet();
      const columns = [];
      res.tableFields.forEach((n) => {
        this.lovConfigDs.addField(n.dataIndex, {
          name: n.dataIndex,
          label: n.title,
        });
        columns.push({
          name: n.dataIndex,
          label: n.title,
          width: n.width,
        });
      });
      res.queryFields.forEach((n) => {
        queryFromDs.addField(n.field, {
          name: n.field,
          label: n.label,
        });
      });
      Object.assign(this.lovConfigDs, { queryDataSet: queryFromDs });

      // 查询行
      this.lovConfigDs.setQueryParameter('params', params);
      this.lovConfigDs.query();

      _modal.update({
        children: <Table dataSet={this.lovConfigDs} columns={columns} queryFieldsLimit={2} />,
      });
    }
  }

  /**
   * 改变加入全部
   */
  @Bind()
  async changeJoinAll(value, item) {
    const { ruleCombId } = this.props;
    const priceLibRuleDataList = [
      {
        ruleCombId,
        ruleDataId: item.ruleDataId,
        dimensionCode: item.dimensionCode,
        includeAllFlag: value ? 1 : 0,
        objectVersionNumber: item.objectVersionNumber,
      },
    ];
    const res = getResponse(await saveJoinAll(priceLibRuleDataList));
    if (res && !res.failed) {
      notification.success();
      this.handleFetchScopeTabs(ruleCombId, item.dimensionCode);
    }
  }

  /**
   * 新增tab标签维度
   */
  @Bind()
  async handleOkAddTab() {
    const { ruleCombId, addTabDs } = this.props;
    if (addTabDs.get(0).get('dimensionCode')) {
      const priceLibRuleDataList = [
        { ruleCombId, dimensionCode: addTabDs.get(0).get('dimensionCode') },
      ];
      const res = getResponse(await saveAddTab(priceLibRuleDataList));
      if (res && !res.failed) {
        notification.success();
        this.handleFetchScopeTabs(ruleCombId, addTabDs.get(0).get('dimensionCode'));
        // 设置最新的activity
        this.setState({
          activeKey: addTabDs.get(0).get('dimensionCode'),
        });
      }
      return res;
    } else {
      return false;
    }
  }

  /**
   * 删除tab标签维度
   */
  @Bind()
  async deleteTab(e, item, index) {
    const { ruleCombId } = this.props;
    const { scopeTabsData } = this.state;
    // 阻止冒泡
    e.stopPropagation();
    Modal.confirm({
      children: intl.get('ssrc.priceExpandStrategy.view.message.deleteRow').d('确认删除选中行?'),
      onOk: async () => {
        if (!isEmpty(item)) {
          const res = getResponse(await deleteTab([item]));
          if (res) {
            notification.success();
            this.handleFetchScopeTabs(ruleCombId, scopeTabsData[index - 1].dimensionCode);
            // 设置最新的activity
            this.setState({
              activeKey: scopeTabsData[index - 1].dimensionCode,
            });
          }
          return res;
        } else {
          return false;
        }
      },
      onCancel: () => {},
    });
  }

  /**
   * tab 被点击的回调
   */
  @Bind()
  changeTab(activeKey) {
    const { ruleCombId } = this.props;
    const params = { ruleCombId, dimensionCode: activeKey };
    this.setState({
      activeKey,
    });
    this.props.fetchScopeTabData(params);
  }

  /**
   * 渲染按钮
   */
  @Bind()
  renderButtons(item) {
    return [
      !item.includeAllFlag && (
        <Button
          onClick={() =>
            item.dimensionCode === 'companyId_ouId_invOrganizationId' ||
            item.fieldWidget === 'SELECT'
              ? this.handleIntroduce(item)
              : item.fieldWidget === 'LOV'
              ? this.handleIntroduceLov(item)
              : ''
          }
          key="introduce"
          icon="play_for_work"
        >
          {intl.get('ssrc.priceExpandStrategy.view.message.introduce').d('引入')}
        </Button>
      ),
      !item.includeAllFlag && [
        'delete',
        {
          icon: 'delete_sweep',
          children: intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
        },
      ],
      // <span style={{ marginLeft: '8px' }}>
      //   {intl.get('ssrc.priceExpandStrategy.model.strategy.joinAll').d('加入全部：')}
      //   <Switch
      //     defaultChecked={item.includeAllFlag}
      //     checkedValue={1}
      //     unCheckedValue={0}
      //     onChange={(value) => this.changeJoinAll(value, item)}
      //   />
      // </span>,
    ];
  }

  @Bind
  handleFetchScopeTabs(ruleCombId, dimensionCode) {
    const { fetchScopeTabs } = this.props;
    fetchScopeTabs(ruleCombId, dimensionCode).then((res) => {
      this.setState({
        scopeTabsData: res,
      });
    });
  }

  render() {
    const { scopeTabsData = [] } = this.state;
    const { tableDs, addTabDs } = this.props;

    const modalProps = {
      onOk: this.handleOkAddTab,
      onDoubleClick: this.handleOkAddTab,
    };

    return (
      <div className={style['tabs-tab']}>
        <Tabs
          tabBarExtraContent={
            <Lov
              dataSet={addTabDs}
              modalProps={modalProps}
              name="dimensionCodeLOV"
              mode="button"
              icon="playlist_add"
              color="primary"
              funcType="flat"
              clearButton={false}
              // style={{ marginTop: '16px' }}
            >
              {intl.get('ssrc.priceExpandStrategy.view.placeholder.addDimension').d('新增维度')}
            </Lov>
          }
          onChange={this.changeTab}
          activeKey={this.state.activeKey}
          tabPosition="left"
          style={{ height: '100%' }}
          tabBarStyle={{ paddingTop: '16px' }}
        >
          {scopeTabsData.map((item, index) => {
            return (
              <TabPane
                tab={
                  <div className={style['tab-item']}>
                    <span className={style['item-name']}>{item.dimensionName}</span>
                    {item.dimensionCode !== 'companyId_ouId_invOrganizationId' && (
                      <Icon
                        type="close"
                        onClick={(e) => this.deleteTab(e, item, index)}
                        style={{ fontSize: '12px' }}
                      />
                    )}
                  </div>
                }
                key={item.dimensionCode}
              >
                <div className={style['table-wrapper']}>
                  <div style={{ marginBottom: '16px' }}>
                    <Form labelLayout="float" columns={1}>
                      <CheckBox
                        label={intl
                          .get('ssrc.priceExpandStrategy.model.strategy.joinAll')
                          .d('加入全部')}
                        defaultChecked={item.includeAllFlag}
                        checkedValue={1}
                        unCheckedValue={0}
                        onChange={(value) => this.changeJoinAll(value, item)}
                      />
                    </Form>
                  </div>
                  {!item.includeAllFlag && (
                    <FilterBarTable
                      customizedCode="SSRC.PRICE_EXPAND_STRATEGY.DETAIL.SCOPE_CHILD_TABLE"
                      mode="tree"
                      dataSet={tableDs}
                      buttons={this.renderButtons(item)}
                      queryFieldsLimit={2}
                      style={{ maxHeight: 'calc(100vh - 200px)' }}
                      filterBarConfig={{
                        collpaseble: true,
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
