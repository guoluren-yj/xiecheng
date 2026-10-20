/**
 * 价格库维度管理-平台
 * @date: 2020-05-27
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { DataSet, Table, Button, Form, TextField, Select, Modal } from 'choerodon-ui/pro';
import { Tabs, Badge, Popconfirm } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { enableRender, yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';

import { savePriceLibDimension, resetDimension } from '@/services/priceLibDimensionService';
import BasicDrawer from './BasicDrawer';
import ComputeDrawer from './ComputeDrawer';
import {
  queryFormDS,
  basicTableDS,
  computeTableDS,
  basicDrawerFormDS,
  basicDrawerMapDS,
  basicDrawerLinkDS,
  basicDrawerLovMapDS,
  basicDrawerLovParamDS,
  computeDrawerFormDS,
  computeDrawerRuleDS,
} from './lineDS';
import { operationDS } from '../operationDS';

const { TabPane } = Tabs;

@formatterCollections({ code: ['ssrc.priceLibDimension'] })
export default class Update extends Component {
  constructor(props) {
    super(props);
    const { templateId } = props.match.params;
    this.state = {
      templateId,
      activityKey: 'BASIC', // 基础维度
      basicDrawerVisible: false, // 基础维度侧弹框显隐
      computeDrawerVisible: false, // 高阶维度侧弹框显隐
      editor: false, // 表格行编辑记录
      saveLoading: false, // 保存弹框loading
    };
  }

  filterFormDs = new DataSet(queryFormDS());

  basicTableDs = new DataSet(basicTableDS());

  computeTableDs = new DataSet(computeTableDS());

  basicDrawerFormDs = new DataSet(basicDrawerFormDS());

  /**
   * @remember
   * 动态设置ds 是否可以勾选, 类属性初始化会在构造函数之前先执行
   * 控制是否可以编辑 case: `PENDING` - 未发布状态
   */
  enabledEdit =
    querystring.parse(this.props.location.search.substr(1)).templateStatus === 'PENDING';

  basicDrawerMapDs = new DataSet(basicDrawerMapDS(this.enabledEdit));

  basicDrawerLinkDs = new DataSet(basicDrawerLinkDS(this.enabledEdit));

  basicDrawerLovMapDs = new DataSet(basicDrawerLovMapDS(this.enabledEdit));

  basicDrawerLovParamDs = new DataSet(basicDrawerLovParamDS(this.enabledEdit));

  computeDrawerFormDs = new DataSet(computeDrawerFormDS());

  computeDrawerRuleDs = new DataSet(
    computeDrawerRuleDS(this.computeDrawerFormDs, this.enabledEdit)
  );

  operationDs = new DataSet(operationDS());

  componentDidMount() {
    this.basicTableDs.setQueryParameter('templateId', this.state.templateId);
    this.computeTableDs.setQueryParameter('templateId', this.state.templateId);
    this.basicDrawerLinkDs.setQueryParameter('templateId', this.state.templateId);
    this.basicDrawerLovMapDs.setQueryParameter('templateId', this.state.templateId);
    this.basicDrawerLovParamDs.setQueryParameter('templateId', this.state.templateId);
  }

  /**
   * 查询
   */
  @Bind()
  search() {
    const queryParams = this.filterFormDs.toData()[0];
    this.basicTableDs.setQueryParameter('queryParams', queryParams);
    this.computeTableDs.setQueryParameter('queryParams', queryParams);
    this.basicTableDs.query();
    this.computeTableDs.query();
  }

  /**
   *价格库弹框保存
   */
  @Bind()
  async handleOkDrawer() {
    /**
     * @remember
     * 当状态不为 `PENDING` 即非可编辑状态, 直接return
     */
    if (!this.enabledEdit) {
      this.handleCancelDrawer();
      return;
    }

    const { templateId, activityKey } = this.state;
    let flag = false;
    let params = {};
    if (activityKey === 'BASIC') {
      flag =
        (await this.basicDrawerFormDs.validate()) &&
        (await this.basicDrawerMapDs.validate()) &&
        (await this.basicDrawerLinkDs.validate()) &&
        (await this.basicDrawerLovMapDs.validate()) &&
        (await this.basicDrawerLovParamDs.validate());
      const data = this.basicDrawerFormDs.toData()[0] || {};
      params = {
        templateId,
        dimensionType: 'BASIC',
        ...data,
        defaultValue: data.defaultValue,
        priceLibTmplDimRelList: this.basicDrawerMapDs.toData(),
        priceLibDimLinkList: data.fieldWidget === 'LINK' ? this.basicDrawerLinkDs.toData() : [],
        priceLibDimMapList: data.fieldWidget === 'LOV' ? this.basicDrawerLovMapDs.toData() : [],
        priceLibLovParamList:
          data.fieldWidget === 'LOV' || data.fieldWidget === 'SELECT'
            ? this.basicDrawerLovParamDs.toData()
            : [],
      };
    } else {
      flag =
        (await this.computeDrawerFormDs.validate()) && (await this.computeDrawerRuleDs.validate());
      const data = this.computeDrawerFormDs.toData()[0] || {};
      const priceLibRuleLinkList = this.computeDrawerRuleDs.toData().map((item) => {
        return {
          ...item,
          sourceFrom: 'DIMENSION',
          sourceFromId: data.dimensionId,
          appointValueLov: item.appointType === 'SCOPE' ? item.appointValueLov : null,
        };
      });
      params = {
        templateId,
        dimensionType: 'COMPUTE',
        ...data,
        priceLibRuleLineList: data.triggerType === 'LINK' ? priceLibRuleLinkList : [],
      };
    }

    if (flag) {
      this.setState({
        saveLoading: true,
      });
      const result = getResponse(await savePriceLibDimension(params));
      this.setState({
        saveLoading: false,
      });
      if (result) {
        notification.success();
        this.handleCancelDrawer();
        if (activityKey === 'BASIC') {
          this.basicTableDs.query(this.basicTableDs.currentPage);
        } else {
          this.computeTableDs.query(this.computeTableDs.currentPage);
        }
      }
    }
  }

  /**
   * 重置维度
   */
  @Bind()
  async resetDimension(record) {
    const { activityKey } = this.state;
    const params = { dimensionId: record.toData().dimensionId };
    const result = getResponse(await resetDimension(params));
    if (result) {
      notification.success();
      if (activityKey === 'BASIC') {
        this.basicTableDs.query(this.basicTableDs.currentPage);
      } else {
        this.computeTableDs.query(this.computeTableDs.currentPage);
      }
    }
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    // 新建状态下，create
    if (this.state.activityKey === 'BASIC') {
      this.setState({
        basicDrawerVisible: true,
      });
      this.basicDrawerFormDs.create({});
    } else {
      this.setState({
        computeDrawerVisible: true,
      });
      this.computeDrawerFormDs.create({});
    }
  }

  /**
   * 关闭
   */
  @Bind()
  handleCancelDrawer() {
    if (this.state.activityKey === 'BASIC') {
      this.setState({
        basicDrawerVisible: false,
        editor: false,
      });
      this.basicDrawerFormDs.reset();
      // 重置Field动态属性!!!
      this.basicDrawerFormDs.getField('defaultValueLov').reset();
      this.basicDrawerFormDs.getField('defaultValueMeaning').reset();
      this.basicDrawerFormDs.getField('defaultValueCode').reset();
      this.basicDrawerMapDs.loadData([]);
      this.basicDrawerLinkDs.loadData([]);
      this.basicDrawerLovMapDs.loadData([]);
      this.basicDrawerLovParamDs.loadData([]);
    } else {
      this.setState({
        computeDrawerVisible: false,
        editor: false,
      });
      this.computeDrawerFormDs.loadData([]);
      this.computeDrawerRuleDs.loadData([]);
    }
  }

  /**
   * 编辑
   */
  @Bind()
  async handleEdit(record) {
    const data = record.toData();
    if (this.state.activityKey === 'BASIC') {
      this.setState({
        basicDrawerVisible: true,
        editor: true,
      });
      this.basicDrawerFormDs.setQueryParameter('dimensionId', data.dimensionId);
      this.basicDrawerFormDs.query();
      this.basicDrawerMapDs.setQueryParameter('dimensionId', data.dimensionId);
      this.basicDrawerMapDs.query();
      if (data.fieldWidget === 'LINK') {
        this.basicDrawerLinkDs.setQueryParameter('dimensionId', data.dimensionId);
        this.basicDrawerLinkDs.query();
      } else if (data.fieldWidget === 'LOV') {
        this.basicDrawerLovMapDs.setQueryParameter('dimensionId', data.dimensionId);
        this.basicDrawerLovMapDs.query();
        this.basicDrawerLovParamDs.setQueryParameter('dimensionId', data.dimensionId);
        this.basicDrawerLovParamDs.query();
      } else if (data.fieldWidget === 'SELECT') {
        this.basicDrawerLovParamDs.setQueryParameter('dimensionId', data.dimensionId);
        this.basicDrawerLovParamDs.query();
      }
      // 设置组件类型的值
      this.drawerRef.setState({
        fieldWidgetValue: data.fieldWidget,
      });
    } else if (this.state.activityKey === 'COMPUTE') {
      this.setState({
        computeDrawerVisible: true,
        editor: true,
      });
      this.computeDrawerFormDs.setQueryParameter('dimensionId', data.dimensionId);
      const queryFlag = await this.computeDrawerFormDs.query();
      if (data.dimensionCode === 'relevantPrice' && data.triggerType === 'LINK' && queryFlag) {
        // 相关价格，计算逻辑不用后端赋值，前端遍历产生
        this.computeDrawerRuleDs.setQueryParameter('sourceFromId', data.dimensionId);
        this.computeDrawerRuleDs.setQueryParameter('templateId', this.state.templateId);
        this.computeDrawerRuleDs.query();
      }
    }
  }

  /**
   * 改变tab标签
   */
  @Bind()
  changeTabs(activityKey) {
    this.setState({
      activityKey,
    });
  }

  /**
   * 操作记录
   */
  @Bind()
  showOperation(record) {
    this.operationDs.setQueryParameter('queryParams', {
      docType: 'DIMENSION',
      docId: record.toData().dimensionId,
    });

    this.operationDs.query();

    const operateColumns = [
      {
        name: 'actionName',
        width: 100,
      },
      {
        name: 'actionDetail',
        width: 250,
        tooltip: 'overflow',
      },
      {
        name: 'realName',
        width: 100,
      },
      {
        name: 'creationDate',
        width: 120,
      },
    ];
    Modal.open({
      key: Modal.key(),
      title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
      style: {
        width: 680,
      },
      children: <Table dataSet={this.operationDs} columns={operateColumns} />,
      onOk: () => {},
      onCancel: () => {},
    });
  }

  render() {
    const {
      activityKey = 'BASIC',
      basicDrawerVisible = false,
      computeDrawerVisible = false,
      editor = false,
      saveLoading = false,
    } = this.state;
    const listColumns = [
      {
        name: 'dimensionFromMeaning',
        width: 80,
        tooltip: 'overflow',
      },
      {
        name: 'dimensionCategoryMeaning',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'dimensionCode',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'dimensionName',
        width: 150,
        tooltip: 'overflow',
        renderer: ({ value, record }) => {
          if (record.toData().changedFlag) {
            return <Badge status="error" text={value} />;
          } else {
            return value;
          }
        },
      },
      {
        name: 'sameGroupFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'fieldRequired',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'fieldEditable',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'fieldVisible',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'queryFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'gridSeq',
        width: 100,
      },
      {
        name: 'gridWidth',
        width: 100,
      },
      {
        name: 'fieldWidgetMeaning',
        width: 100,
        tooltip: 'overflow',
      },
      {
        name: 'sourceCode',
        width: 250,
        tooltip: 'overflow',
      },
      {
        name: 'textMaxLength',
        width: 100,
      },
      {
        name: 'textMinLength',
        width: 100,
      },
      {
        name: 'customCheck',
        width: 100,
        tooltip: 'overflow',
      },
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => enableRender(value),
      },
      {
        name: 'action',
        width: 120,
        renderer: ({ record }) => (
          <span className="action-link">
            <a onClick={() => this.handleEdit(record)}>
              {this.enabledEdit
                ? intl.get('hzero.common.button.editor').d('编辑')
                : intl.get('hzero.common.button.view').d('查看')}
            </a>
            {this.enabledEdit &&
            record.toData().changedFlag &&
            record.toData().dimensionFrom === 'FIXED' ? (
              <Popconfirm
                title={intl.get('ssrc.priceLibDimension.view.confirm.reset').d('是否确认重置？')}
                onConfirm={() => this.resetDimension(record)}
              >
                <a>{intl.get('hzero.common.button.reset').d('重置')}</a>
              </Popconfirm>
            ) : (
              ''
            )}
          </span>
        ),
      },
      {
        name: 'operation',
        width: 100,
        renderer: ({ record }) =>
          record.status !== 'add' && (
            <a onClick={() => this.showOperation(record)}>
              {intl.get('hzero.common.button.view').d('查看')}
            </a>
          ),
      },
    ];
    const comListColumns = [
      {
        name: 'dimensionFromMeaning',
        width: 80,
        tooltip: 'overflow',
      },
      {
        name: 'dimensionCategoryMeaning',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'dimensionCode',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'dimensionName',
        width: 150,
        tooltip: 'overflow',
        renderer: ({ value, record }) => {
          if (record.toData().changedFlag) {
            return <Badge status="error" text={value} />;
          } else {
            return value;
          }
        },
      },
      {
        name: 'computeLogic',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'triggerTypeMeaning',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'computeFunction',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'gridSeq',
        width: 100,
      },
      {
        name: 'gridWidth',
        width: 100,
      },
      {
        name: 'fieldRequired',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'fieldVisible',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'queryFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'mobileShowFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => enableRender(value),
      },
      {
        name: 'action',
        width: 120,
        renderer: ({ record }) => (
          <span className="action-link">
            <a onClick={() => this.handleEdit(record)}>
              {this.enabledEdit
                ? intl.get('hzero.common.button.editor').d('编辑')
                : intl.get('hzero.common.button.view').d('查看')}
            </a>
            {this.enabledEdit &&
            record.toData().changedFlag &&
            record.toData().dimensionFrom === 'FIXED' ? (
              <Popconfirm
                title={intl.get('ssrc.priceLibDimension.view.confirm.reset').d('是否确认重置？')}
                onConfirm={() => this.resetDimension(record)}
              >
                <a>{intl.get('hzero.common.button.reset').d('重置')}</a>
              </Popconfirm>
            ) : (
              ''
            )}
          </span>
        ),
      },
      {
        name: 'operation',
        width: 100,
        renderer: ({ record }) =>
          record.status !== 'add' && (
            <a onClick={() => this.showOperation(record)}>
              {intl.get('hzero.common.button.view').d('查看')}
            </a>
          ),
      },
    ];

    const basicDrawerProps = {
      editor,
      saveLoading,
      templateId: this.state.templateId,
      visible: basicDrawerVisible,
      enabledEdit: this.enabledEdit,
      basicDrawerFormDs: this.basicDrawerFormDs,
      basicDrawerMapDs: this.basicDrawerMapDs,
      basicDrawerLinkDs: this.basicDrawerLinkDs,
      basicDrawerLovMapDs: this.basicDrawerLovMapDs,
      basicDrawerLovParamDs: this.basicDrawerLovParamDs,
      onOk: this.handleOkDrawer,
      onCancel: this.handleCancelDrawer,
      onRef: (node) => {
        this.drawerRef = node;
      },
    };

    const computeDrawerProps = {
      editor,
      saveLoading,
      visible: computeDrawerVisible,
      enabledEdit: this.enabledEdit,
      computeDrawerFormDs: this.computeDrawerFormDs,
      computeDrawerRuleDs: this.computeDrawerRuleDs,
      onOk: this.handleOkDrawer,
      onCancel: this.handleCancelDrawer,
    };

    return (
      <Fragment>
        <Header
          title={intl
            .get('ssrc.priceLibDimension.view.title.priceLibDimension')
            .d('价格库维度管理')}
          backPath="/ssrc/price-lib-dimension/list"
        >
          {this.enabledEdit && (
            <Button icon="add" color="primary" funcType="raised" onClick={this.handleCreate}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          )}
        </Header>
        <Content>
          <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
            <Form
              dataSet={this.filterFormDs}
              columns={3}
              onKeyDown={(e) => {
                if (e.keyCode === 13) return this.search();
              }}
              style={{ flex: 'auto' }}
            >
              <Select name="dimensionCategory" />
              <TextField name="dimensionCodeOrName" />
              <Select name="enabledFlag" />
            </Form>
            <div
              style={{ marginTop: '10px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
            >
              <Button onClick={() => this.filterFormDs.current.reset()}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button dataSet={null} color="primary" onClick={this.search}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </div>
          </div>
          <Tabs activeKey={activityKey} onChange={this.changeTabs} animated={false}>
            <TabPane
              tab={intl.get('ssrc.priceLibDimension.view.tab.basicDimension').d('基础维度')}
              key="BASIC"
            >
              <Table dataSet={this.basicTableDs} columns={listColumns} />
            </TabPane>
            <TabPane
              tab={intl.get('ssrc.priceLibDimension.view.tab.higherDimension').d('高阶维度')}
              key="COMPUTE"
            >
              <Table dataSet={this.computeTableDs} columns={comListColumns} />
            </TabPane>
          </Tabs>
        </Content>
        <BasicDrawer {...basicDrawerProps} />
        <ComputeDrawer {...computeDrawerProps} />
      </Fragment>
    );
  }
}
