/**
 * 价格拓展策略详情
 * @date: 2020-07-24
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { DataSet, Form, Output, Table, Modal, Button } from 'choerodon-ui/pro';
import { Tabs, Collapse } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import classnames from 'classnames';

import { fetchDetail, fetchScopeTabs, saveDetail } from '@/services/priceExpandStrategyService';
import ScopeChild from './ScopeChild';
import { showOperation } from '../utils';
import {
  basicFormDS,
  policySettingRuleDS,
  policySettingScopeDS,
  policySettingScopeTableDS,
} from './lineDS';
import style from '../index.less';

const { TabPane } = Tabs;
const { Panel } = Collapse;

@formatterCollections({ code: ['ssrc.priceExpandStrategy', 'hzero.common', 'ssrc.priceLibDimension'] })
export default class PriceExpandStrategy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandScopeIds: {}, // 展开范围
      scopeTabs: {}, // 范围侧边tab
      fetchDetailLoading: {},
    };
    this.scopeChild = {};
    this.scopeTableDs = {};
  }

  basicFormDs = new DataSet(basicFormDS());

  policySettingRuleDs = new DataSet(policySettingRuleDS());

  policySettingScopeDs = new DataSet(policySettingScopeDS());

  componentDidMount() {
    this.fetchDetail();
  }

  /**
   * 查询详情
   */
  @Bind()
  async fetchDetail() {
    const {
      match: { params },
    } = this.props;
    const result = getResponse(
      await fetchDetail({
        expandId: params.expandId,
      })
    );
    if (result && !result.failed) {
      const { priceLibRuleHeader = {}, ...others } = result;
      this.basicFormDs.loadData([{ ...others }]);
      this.policySettingRuleDs.loadData(priceLibRuleHeader.priceLibRuleLineList || []);
      this.policySettingScopeDs.loadData(priceLibRuleHeader.priceLibRuleCombList || []);
      // 产生多个范围表格ds
      if (priceLibRuleHeader.priceLibRuleCombList) {
        priceLibRuleHeader.priceLibRuleCombList.forEach((item) => {
          this.scopeTableDs = {
            ...this.scopeTableDs,
            [item.ruleCombId]: new DataSet(policySettingScopeTableDS()),
          };
        });
      }
      // 强制渲染页面
      this.forceUpdate();
    }
  }

  /**
   * 查询适用范围侧边栏
   */
  @Bind()
  async fetchScopeTabs(ruleCombId, dimensionCode) {
    const params = {
      ruleCombId,
    };
    const result = getResponse(await fetchScopeTabs(params));
    if (result && !result.failed) {
      // 查询第一个tab对应表格的数据
      this.scopeTableDs[ruleCombId].setQueryParameter('params', {
        ...params,
        dimensionCode: dimensionCode || (result[0] && result[0].dimensionCode),
      });
      this.scopeTableDs[ruleCombId].query();

      // 设置范围数据
      this.setState({
        fetchDetailLoading: {
          ...this.state.fetchDetailLoading,
          [ruleCombId]: false,
        },
        scopeTabs: {
          ...this.state.scopeTabs,
          [ruleCombId]: result,
        },
      });
    }
  }

  /**
   * 点击范围tab标签页，查询右侧列表数据
   */
  @Bind()
  fetchScopeTabData(params) {
    // 清空上一次查询条件数据
    this.scopeTableDs[params.ruleCombId].queryDataSet.current.reset();
    // 查询表格数据
    this.scopeTableDs[params.ruleCombId].setQueryParameter('params', params);
    this.scopeTableDs[params.ruleCombId].query();
  }

  /**
   * 展开/收起范围
   */
  @Bind()
  expandScope(record, expandFlag) {
    this.setState({
      expandScopeIds: {
        ...this.state.expandScopeIds,
        [record.data.ruleCombId]: expandFlag,
      },
    });
    if (expandFlag) {
      this.setState({
        fetchDetailLoading: {
          ...this.state.fetchDetailLoading,
          [record.data.ruleCombId]: true,
        },
      });
      this.fetchScopeTabs(record.data.ruleCombId);
    }
  }

  @Bind
  async handleOpenExpandScope(record) {
    const scopeChildProps = {
      fetchScopeTabs: this.fetchScopeTabs,
      fetchScopeTabData: this.fetchScopeTabData,
      onRef: (callKey, node) => {
        this.scopeChild[callKey] = node;
      },
    };
    // this.setState({
    //   fetchDetailLoading: {
    //     ...this.state.fetchDetailLoading,
    //     [record.data.ruleCombId]: true,
    //   },
    // });
    await this.fetchScopeTabs(record.data.ruleCombId);
    const { scopeTabs = {} } = this.state;
    Modal.open({
      key: Modal.key(),
      title: intl
        .get('ssrc.priceExpandStrategy.view.message.panel.viewExpandScope')
        .d('查看拓展范围'),
      drawer: true,
      style: {
        width: '742px',
      },
      children: (
        <ScopeChild
          ruleCombId={record.data.ruleCombId}
          scopeTabsData={scopeTabs[record.data.ruleCombId]}
          tableDs={this.scopeTableDs[record.data.ruleCombId]}
          {...scopeChildProps}
        />
      ),
      bodyStyle: { padding: 0 },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }


  @Bind
  async handleEdit(expandStatus, latestFlag) {
    const {
      match: { params },
    } = this.props;
    // eslint-disable-next-line prefer-destructuring
    let expandId = params.expandId;
    if (expandStatus === 'RELEASED' && latestFlag !== 'Y') {
      const result = getResponse(await saveDetail(this.basicFormDs.current.toData()));
      if (result) {
        // eslint-disable-next-line prefer-destructuring
        expandId = result.expandId;
      }
    }
    this.props.history.push(`/ssrc/price-expand-strategy/update/${expandId}`);
  };

  render() {
    const { expandStatus, latestFlag } = this.basicFormDs?.current?.get(['expandStatus', 'latestFlag']) || {};

    const ruleListColumns = [
      {
        name: 'lineNum',
        width: 100,
        renderer: ({ record }) => record.index + 1,
      },
      {
        name: 'dimensionCodeLOV',
        // width: 200,
      },
      {
        name: 'ruleExpression',
        width: 200,
      },
      {
        name: 'appointType',
        width: 200,
      },
      {
        name: 'appointValue1',
        header: intl.get('ssrc.priceExpandStrategy.model.strategy.appointValue').d('维度值'),
        // width: 200,
        // tooltip: 'overflow',
        renderer: ({ record }) => {
          if (record.get('appointType') === 'CURRENT_DIMENSION') {
            return record.get('appointDimensionName');
          } else if (
            record.get('dimensionCodeLOV') &&
            (record.get('dimensionCodeLOV').fieldWidget === 'LOV' ||
              record.get('dimensionCodeLOV').fieldWidget === 'SELECT') &&
            record.get('ruleExpression') !== 'IS_NULL' &&
            record.get('ruleExpression') !== 'NOT_NULL'
          ) {
            return record.get('appointValueMeaning')?.length ? (
              <Output record={record} name="appointValueMeaning" />
            ) : (
              <Output record={record} name="appointValue" />
            );
          } else {
            return record.get('appointValue');
          }
        },
      },
    ];

    const expandScopeColumns = [
      {
        name: 'lineNum',
        width: 100,
        renderer: ({ record }) => record.index + 1,
      },
      {
        name: 'combExpression',
        width: 400,
      },
      {
        name: 'expandScope',
        width: 200,
        renderer: ({ record }) => (
          <a
            disabled={!record.get('ruleCombId')}
            onClick={() => this.handleOpenExpandScope(record)}
          >
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ),
      },
    ];

    // const scopeChildProps = {
    //   fetchScopeTabs: this.fetchScopeTabs,
    //   fetchScopeTabData: this.fetchScopeTabData,
    //   onRef: (callKey, node) => {
    //     this.scopeChild[callKey] = node;
    //   },
    // };

    return (
      <Fragment>
        <Header
          title={intl
            .get('ssrc.priceExpandStrategy.view.title.viewExpandStrategy')
            .d('查看拓展策略')}
          backPath="/ssrc/price-expand-strategy/list"
        >
          {((expandStatus === 'RELEASED' && latestFlag !== 'Y') || expandStatus === 'PENDING')
            && (
              <Button
                name="edit"
                icon="mode_edit"
                funcType="flat"
                onClick={() => this.handleEdit(expandStatus, latestFlag)}
              >
                {intl.get('hzero.common.edit').d('编辑')}
              </Button>
            )}
          <Button
            name="operation"
            icon="operation_service_request"
            funcType="flat"
            onClick={() => showOperation(this.basicFormDs?.current)}
          >
            {intl.get('ssrc.priceExpandStrategy.view.button.operation').d('操作记录')}
          </Button>
        </Header>
        <Content className={classnames('ued-detail-wrapper', style['update-container'])}>
          {/* <Tabs defaultActiveKey="policySettings" animated={false}>
            <TabPane
              tab={intl.get('ssrc.priceExpandStrategy.view.tab.basicInfos').d('基础信息')}
              key="basicInfos"
            > */}
          <div className={style['rfx-detail-list-card']}>
            <div className={style['custom-page-content']}>
              <h3 id="rfxBasicInfo" className={style['rfx-card-item-title']}>
                {intl.get('ssrc.priceExpandStrategy.view.tab.basicInfos').d('基础信息')}
              </h3>
              <Form
                useWidthPercent
                labelLayout="vertical"
                dataSet={this.basicFormDs}
                columns={3}
                className="c7n-pro-vertical-form-display"
              >
                <Output name="expandCode" />
                <Output name="expandName" />
                <Output name="priorityLevel" />
                <Output name="priceLibExpandByCodes" />
                <Output name="templateIdsLov" />
                <Output name="realName" />
                <Output name="creationDate" />
                {/* <Output name="enabledFlag" renderer={({ value }) => yesOrNoRender(value)} /> */}
                <Output name="versionNum" />
                <Output name="remark" newLine colSpan={2} />
              </Form>
            </div>
            <div className={style['custom-page-content']}>
              <h3 id="rfxBasicInfo" className={style['rfx-card-item-title']}>
                {intl
                  .get(`ssrc.priceExpandStrategy.view.message.panel.conditionSetting`)
                  .d('条件设置')}
              </h3>
              <Table
                customizedCode="SSRC.PRICE_EXPAND_STRATEGY.DETAIL.CONDITION_SETTING_TABLE"
                dataSet={this.policySettingRuleDs}
                columns={ruleListColumns}
              />
            </div>
            <div className={style['custom-page-content']}>
              <h3 id="rfxBasicInfo" className={style['rfx-card-item-title']}>
                {intl.get(`ssrc.priceExpandStrategy.view.message.panel.expandScope`).d('拓展范围')}
              </h3>
              <Table
                customizedCode="SSRC.PRICE_EXPAND_STRATEGY.DETAIL.EXPAND_SCOPE_TABLE"
                dataSet={this.policySettingScopeDs}
                columns={expandScopeColumns}
              />
            </div>
          </div>
        </Content>
      </Fragment>
    );
  }
}
