import React, { PureComponent } from 'react';
import { DataSet, Table, Button, Modal, Lov, Icon, Switch } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isFunction } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
// import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import FilterBarTable from '_components/FilterBarTable';

import {
  saveAddTabs,
  saveIntroduce,
  fetchLovConfig,
  saveJoinAll,
  deleteTab,
} from '@/services/priceLibraryNewService';
import { renderValidStatu } from '../util';
import { scopeAddTabsDS, scopeIntroduceModalDS, scopeIntroduceLovDS } from './lineDS';
import style from '../index.less';

const { TabPane } = Tabs;
const { Column } = Table;
const modalKey = Modal.key();
let _modal;

export default class ApplicationScope extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      activeKey: '',
    };
  }

  scopeAddTabsDs = new DataSet(scopeAddTabsDS());

  scopeIntroduceModalDs = new DataSet(scopeIntroduceModalDS());

  scopeIntroduceLovDs = new DataSet(scopeIntroduceLovDS());

  componentDidMount() {
    // 增加选中记录的事件监听
    this.props.tableDs.addEventListener('select', this.handleSelect);
    // 增加撤销选择记录的事件监听
    this.props.tableDs.addEventListener('unSelect', this.handleUnSelect);
    // 增加选中记录的事件监听
    this.scopeIntroduceModalDs.addEventListener('select', this.handleSelect);
    // 增加撤销选择记录的事件监听
    this.scopeIntroduceModalDs.addEventListener('unSelect', this.handleUnSelect);
  }

  // 选中级联的数据
  @Bind()
  handleSelect({ dataSet, record }) {
    if (dataSet === this.scopeIntroduceModalDs) {
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
    if (dataSet === this.scopeIntroduceModalDs) {
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
    const { priceLibId } = this.props;

    const params = { priceLibId, dimensionCode: item.dimensionCode };

    this.scopeIntroduceModalDs.setQueryParameter('params', params);
    this.scopeIntroduceModalDs.query();

    // 打开弹框
    Modal.open({
      key: modalKey,
      title: item.dimensionName,
      style: {
        width: 680,
      },
      children: (
        <Table
          mode="tree"
          dataSet={this.scopeIntroduceModalDs}
          className={style['introduce-table-wrapper']}
          queryFieldsLimit={2}
          queryBar="professionalBar"
          queryBarProps={{
            formProps: { labelLayout: 'float' },
          }}
        >
          <Column name="dataName" />
          <Column name="dataCode" />
        </Table>
      ),
      onOk: async () => {
        if (!isEmpty(this.scopeIntroduceModalDs.selected)) {
          const data = this.scopeIntroduceModalDs.selected.map((n) => n.toData());
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
        this.scopeIntroduceModalDs.loadData([]);
      },
    });
  }

  /**
   * 引入 - LOV
   */
  @Bind()
  async handleIntroduceLov(item) {
    const { priceLibId } = this.props;
    const params = { priceLibId, dimensionCode: item.dimensionCode };

    // 打开弹框
    _modal = Modal.open({
      key: modalKey,
      title: item.dimensionName,
      style: {
        width: 680,
      },
      children: (
        <Table
          mode="tree"
          dataSet={this.scopeIntroduceLovDs}
          columns={[]}
          queryFieldsLimit={2}
          style={{ maxHeight: 300 }}
        />
      ),
      onOk: async () => {
        if (!isEmpty(this.scopeIntroduceLovDs.selected)) {
          const data = this.scopeIntroduceLovDs.selected.map((n) => n.toData());
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
        this.scopeIntroduceLovDs.loadData([]);
      },
    });
    // 查询头
    const res = getResponse(await fetchLovConfig({ viewCode: item.sourceCode }));
    if (res && !res.failed) {
      const queryFromDs = new DataSet();
      const columns = [];
      res.tableFields.forEach((n) => {
        this.scopeIntroduceLovDs.addField(n.dataIndex, {
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
      Object.assign(this.scopeIntroduceLovDs, { queryDataSet: queryFromDs });

      // 查询行
      this.scopeIntroduceLovDs.setQueryParameter('params', params);
      this.scopeIntroduceLovDs.query();

      _modal.update({
        children: (
          <Table
            dataSet={this.scopeIntroduceLovDs}
            columns={columns}
            queryFieldsLimit={2}
            style={{ maxHeight: 300 }}
          />
        ),
      });
    }
  }

  /**
   * 改变加入全部
   */
  @Bind()
  async changeJoinAll(value, item) {
    const { priceLibId, templateId, fetchScopeTabs } = this.props;
    const priceLibRuleDataList = [
      {
        priceLibId,
        appScopeId: item.appScopeId,
        dimensionCode: item.dimensionCode,
        includeAllFlag: value ? 1 : 0,
        objectVersionNumber: item.objectVersionNumber,
      },
    ];
    const res = getResponse(await saveJoinAll(priceLibRuleDataList));
    if (res && !res.failed) {
      notification.success();
      fetchScopeTabs({ priceLibId, templateId }, item.dimensionCode);
    }
  }

  /**
   * 新增tab标签维度-保存
   */
  @Bind()
  async handleOkAddTabs() {
    const { priceLibId, templateId, fetchScopeTabs } = this.props;
    if (this.scopeAddTabsDs.get(0).get('dimensionCode')) {
      const priceLibRuleDataList = [
        { priceLibId, dimensionCode: this.scopeAddTabsDs.get(0).get('dimensionCode') },
      ];
      const res = getResponse(await saveAddTabs(priceLibRuleDataList));
      if (res && !res.failed) {
        notification.success();
        fetchScopeTabs({ priceLibId, templateId }, this.scopeAddTabsDs.get(0).get('dimensionCode'));
        // 设置最新的activity
        this.setState({
          activeKey: this.scopeAddTabsDs.get(0).get('dimensionCode'),
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
  async deleteTab(e, item) {
    const { templateId, priceLibId, fetchScopeTabs, tabsData } = this.props;
    // 阻止冒泡
    e.stopPropagation();
    Modal.confirm({
      children: intl.get('ssrc.priceLibraryNew.view.message.deleteRow').d('确认删除选中行?'),
      onOk: async () => {
        if (!isEmpty(item)) {
          const res = getResponse(await deleteTab([item]));
          if (res && !res.failed) {
            notification.success();
            fetchScopeTabs({ priceLibId, templateId }, tabsData[tabsData.length - 2].dimensionCode);
            // 设置最新的activity
            this.setState({
              activeKey: tabsData[tabsData.length - 2].dimensionCode,
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
    const { priceLibId, tableDs } = this.props;
    // 清空上一次查询条件数据
    // eslint-disable-next-line no-unused-expressions
    tableDs.queryDataSet.current?.reset();
    // 查询右侧table数据
    tableDs.setQueryParameter('params', { priceLibId, dimensionCode: activeKey });
    tableDs.query();
    this.setState({
      activeKey,
    });
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
          icon="root"
        >
          {intl.get('ssrc.priceLibraryNew.view.message.introduce').d('引入')}
        </Button>
      ),
      !item.includeAllFlag && ['delete'],
      <span style={{ marginLeft: '8px' }}>
        {intl.get('ssrc.priceLibraryNew.model.library.joinAll').d('加入全部：')}
        <Switch
          defaultChecked={item.includeAllFlag}
          checkedValue={1}
          unCheckedValue={0}
          onChange={(value) => this.changeJoinAll(value, item)}
        />
      </span>,
    ];
  }

  render() {
    const { tabsData = [], tableDs, templateId } = this.props;

    const modalProps = {
      onOk: this.handleOkAddTabs,
      onDoubleClick: this.handleOkAddTabs,
      style: { width: '6.8rem' },
    };

    // 设置新增tab的查询参数，模板id
    this.scopeAddTabsDs.setQueryParameter('templateId', templateId);
    if (!isEmpty(tabsData)) {
      this.scopeAddTabsDs.setQueryParameter(
        'shieldDimCodes',
        tabsData.map((item) => item.dimensionCode).toString()
      );
    }

    return (
      <div className={style['tabs-tab']}>
        <Tabs
          tabBarExtraContent={
            <Lov
              dataSet={this.scopeAddTabsDs}
              modalProps={modalProps}
              name="dimensionCodeLOV"
              mode="button"
              icon="add"
              color="primary"
              funcType="flat"
              clearButton={false}
            >
              {intl.get('ssrc.priceLibraryNew.view.placeholder.addType').d('添加分类')}
            </Lov>
          }
          onChange={this.changeTab}
          activeKey={this.state.activeKey}
          tabPosition="left"
          style={{ height: '100%' }}
          tabBarStyle={{ padding: '20px 0px' }}
        >
          {tabsData.map((item) => {
            return (
              <TabPane
                tab={
                  <span className={style['tab-delete']}>
                    {item.dimensionName}
                    {item.dimensionCode !== 'companyId_ouId_invOrganizationId' && (
                      <Icon
                        type="close"
                        onClick={(e) => this.deleteTab(e, item)}
                        style={{ fontSize: '12px' }}
                      />
                    )}
                  </span>
                }
                key={item.dimensionCode}
              >
                <div className={style['table-wrapper']}>
                  <FilterBarTable
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
                      name="enabledFlag"
                      renderer={({ value }) =>
                        renderValidStatu(
                          value,
                          value === 1
                            ? intl.get('hzero.common.status.enable').d('启用')
                            : intl.get('hzero.common.button.disable').d('禁用')
                        )
                      }
                    />
                    <Column name="dataName" header={item.dimensionName} />
                    <Column name="dataCode" />
                  </FilterBarTable>
                </div>
              </TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }
}
