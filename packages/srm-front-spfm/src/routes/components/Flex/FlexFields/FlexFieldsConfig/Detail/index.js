/**
 * index - 弹性域汇总查询页面-新建模型
 * @date: 2019-4-25
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Drawer, Tabs } from 'hzero-ui';
import { isEmpty, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { queryFlexDetailConfigsTableColumns } from '@/services/hpfm/flexRuleService';
import RuleFieldsList from './RuleFieldsList';
import FlexFieldsList from './FlexFieldsList';

// import styles from './index.less';

const { TabPane } = Tabs;

// 设置sinv国际化前缀 - view.title
const viewTitlePrompt = 'hpfm.flexModel.view.title';
// 设置sinv国际化前缀 - view.button
// const viewButtonPrompt = 'spfm.supplierKpiIndicator.view.button';
// 设置通用国际化前缀
const commonPrompt = 'hzero.common';

/**
 *
 *
 * @export
 * @class FlexRule
 * @extends {PureComponent}
 */
export default class FlexRule extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: {},
      activeKey: 'ruleFieldsConfig',
      flexTableColumnsCode: [],
    };
  }

  /**
   *
   *
   * @param {*} prevProps
   * @returns
   * @memberof FlexRule
   */
  getSnapshotBeforeUpdate(prevProps) {
    const { visible } = this.props;
    return visible && visible !== prevProps.visible;
  }

  /**
   *
   *
   * @param {*} rest
   * @memberof FlexRule
   */
  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      this.fetchFlexTableColumnsCode();
    }
  }

  /**
   *
   *
   * @memberof FlexRule
   */
  @Bind()
  fetchFlexTableColumnsCode() {
    const { flexFieldsDetail = {} } = this.props;
    const { ruleDetailId } = flexFieldsDetail;
    queryFlexDetailConfigsTableColumns(ruleDetailId).then(res => {
      if (res && !res.failed) {
        this.setState({
          flexTableColumnsCode: res,
        });
      }
    });
  }

  /**
   *
   *
   * @memberof FlexRule
   */
  @Bind()
  cancel() {
    const { close = e => e } = this.props;
    this.setState({
      activeKey: 'ruleFieldsConfig',
    });
    close();
  }

  /**
   *
   *
   * @param {*} activeKey
   * @memberof FlexRule
   */
  @Bind()
  onTabsChange(activeKey) {
    const tabsListRefKeys = {
      ruleFieldsConfig: 'ruleFieldsList',
      flexFieldsConfig: 'flexFieldsList',
    };
    const currentActiveEditableRowKey = this[tabsListRefKeys[this.state.activeKey]].state
      .editableRowKey;

    if (isEmpty(currentActiveEditableRowKey) && !isNumber(currentActiveEditableRowKey)) {
      this.setState({
        activeKey,
      });
    }
  }

  /**
   *
   *
   * @memberof FlexRule
   */
  @Bind()
  handleCreate() {
    const { validateFields = e => e } = this.editorForm || {};
    const { create = e => e } = this.props;
    validateFields((error, values) => {
      if (isEmpty(error)) {
        create(
          {
            ...values,
            enabledFlag: values.enabledFlag ? 1 : 0,
            tenantId: getCurrentOrganizationId(),
          },
          () => {
            this.cancel();
          }
        );
      }
    });
  }

  /**
   *
   *
   * @memberof FlexRule
   */
  @Bind()
  handleUpdate() {
    const { validateFields = e => e } = this.editorForm || {};
    const { dataSource = {} } = this.state;
    const { update = e => e } = this.props;
    validateFields((error, values) => {
      if (isEmpty(error)) {
        update({ ...dataSource, ...values, enabledFlag: values.enabledFlag ? 1 : 0 }, () => {
          this.cancel();
        });
      }
    });
  }

  /**
   *
   *
   * @memberof FlexRule
   */
  @Bind()
  handleFetchDetail() {
    const { fetchDetail = () => {} } = this.props;
    fetchDetail().then(res => {
      if (res) {
        this.setState({
          dataSource: res,
        });
      }
    });
  }

  render() {
    const {
      visible,
      processing = {},
      flexFieldsDetail = {},
      flexRuleCode,
      code = {},
      formSchema,
      getSourceFormSchema = () => {},
    } = this.props;

    const { activeKey, flexTableColumnsCode } = this.state;
    const { ruleDetailId } = flexFieldsDetail;
    const title = intl.get(`${viewTitlePrompt}.flexFieldsRuleDetail`).d('定义规则字段');
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel,
      width: 750,
    };
    const { updateLoading, createLoading } = processing;
    const ruleFieldsListProps = {
      onRef: node => {
        this.ruleFieldsList = node;
      },
      active: visible && activeKey === 'ruleFieldsConfig',
      ruleDetailId,
      flexRuleCode,
      code,
      flexTableColumnsCode,
      formSchema,
      getSourceFormSchema,
    };
    const flexFieldsListProps = {
      onRef: node => {
        this.flexFieldsList = node;
      },
      active: visible && activeKey === 'flexFieldsConfig',
      ruleDetailId,
      flexRuleCode,
      code,
    };
    return (
      <Drawer {...drawerProps}>
        <Tabs activeKey={activeKey} onChange={this.onTabsChange} animated={false}>
          <TabPane
            tab={intl.get(`${viewTitlePrompt}.ruleFieldsConfig`).d('规则字段配置')}
            key="ruleFieldsConfig"
          >
            <RuleFieldsList {...ruleFieldsListProps} />
          </TabPane>
          <TabPane
            tab={intl.get(`${viewTitlePrompt}.flexFieldsConfig`).d('弹性域配置')}
            key="flexFieldsConfig"
          >
            <FlexFieldsList {...flexFieldsListProps} />
          </TabPane>
        </Tabs>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
            zIndex: 1,
          }}
        >
          <Button
            onClick={this.cancel}
            disabled={createLoading || updateLoading}
            style={{ marginRight: 8 }}
          >
            {intl.get(`${commonPrompt}.button.cancel`).d('取消')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
