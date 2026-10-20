/**
 * Tabs - 预览的 tabs
 * @date Mon Aug 13 2018
 * @author yunqiang.wu yunqiang.wu@hang-china.com
 * @copyright Copyright(c) 2018 Hand
 */

import React from 'react';
import { connect } from 'dva';
import { Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { map } from 'lodash';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import ContactAddress from './ContactAddress';
import Product from './Product';
import Attachment from './Attachment';
import Reserved from './Reserved';

/**
 * 平台级模板明细定义Tab
 * @extends {Component} - PureComponent
 * @reactProps {Object} investigationTemHistoryDetailOrg - 数据源
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ investigationTemHistoryDetailOrg, loading }) => ({
  loading,
  saving: loading.effects['investigationTemHistoryDetailOrg/saveDefinition'],
  investigationTemHistoryDetailOrg,
  organizationId: getCurrentOrganizationId(),
}))
export default class Items extends React.PureComponent {
  state = {
    activeKey: 'sslmInvestgBasic',
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { config } = nextProps;
    const nextState = {};

    if (config !== prevState.config) {
      const configHeader = {};
      map(config, h => {
        configHeader[h.configName] = h;
      });
      nextState.configHeader = configHeader;
      nextState.config = config;
    }
    return nextState;
  }

  componentDidMount() {
    const { investigateTemplateId } = this.props;
    this.queryDispatch({ investigateTemplateId });
  }

  /**
   * 存储 Tab的key
   */
  handleKeyChange = activeKey => {
    this.setState({ activeKey });
  };

  // 附件模板定义方法
  @Bind()
  updateState(attr, data) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'investigationTemHistoryDetailOrg/updateState',
      payload: {
        [attr]: data,
      },
    });
  }

  @Bind()
  saveDispatch(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'investigationTemHistoryDetailOrg/saveAttachmentLine',
      payload,
    });
  }

  @Bind()
  deleteDispatch(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'investigationTemHistoryDetailOrg/deleteAttachmentLine',
      payload,
    });
  }

  @Bind()
  queryDispatch(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'investigationTemHistoryDetailOrg/queryAttachmentList',
      payload,
    });
  }

  // 渲染TabPane
  @Bind()
  renderReserveTabPane(config) {
    const { saving } = this.props;
    const { configDescription, configName } = config;
    return (
      <Tabs.TabPane tab={configDescription} key={configName}>
        <Reserved saving={saving} dataSource={config} />
      </Tabs.TabPane>
    );
  }

  render() {
    const { configHeader, activeKey } = this.state;
    const {
      investigationTemHistoryDetailOrg: { attachmentList = {}, attachmentEditContent = [] },
      organizationId,
      saving,
    } = this.props;
    const tabs = [];
    const templateProp = {
      attachmentList,
      organizationId,
      attachmentEditContent,
      loading: this.props.loading.effects['investigationTemHistoryDetailOrg/queryAttachmentList'],
      saving: this.props.loading.effects[
        'investigationTemHistoryDetailOrg/updateStateAttachmentLine'
      ],
      investigateTemplateId: this.props.investigateTemplateId,
      updateState: this.updateState,
      saveDispatch: this.saveDispatch,
      deleteDispatch: this.deleteDispatch,
      queryDispatch: this.queryDispatch,
    };
    // 基础信息
    if (configHeader.sslmInvestgBasic) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgBasic);
      tabs.push(tabPane);
    }
    // 业务信息
    if (configHeader.sslmInvestgBusiness) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgBusiness);
      tabs.push(tabPane);
    }
    if (configHeader.sslmInvestgProservice) {
      tabs.push(
        <Tabs.TabPane
          tab={intl.get(`sslm.investTemHisOrg.view.message.tab.proservice`).d('产品及服务')}
          key="sslmInvestgProservice"
        >
          <Product saving={saving} dataSource={configHeader.sslmInvestgProservice} />
        </Tabs.TabPane>
      );
    }
    // 近3年财务状况
    if (configHeader.sslmInvestgFin) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgFin);
      tabs.push(tabPane);
    }
    // 分支结构
    if (configHeader.sslmInvestgFinBranch) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgFinBranch);
      tabs.push(tabPane);
    }
    // 资质信息
    if (configHeader.sslmInvestgAuth) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgAuth);
      tabs.push(tabPane);
    }
    if (configHeader.sslmInvestgContact || configHeader.sslmInvestgAddress) {
      tabs.push(
        <Tabs.TabPane
          tab={intl.get(`sslm.investTemHisOrg.view.message.tab.contactAddress`).d('联系人及地址')}
          key="sslmInvestgContact"
        >
          <ContactAddress
            saving={saving}
            dataTabOne={configHeader.sslmInvestgContact}
            dataTabTwo={configHeader.sslmInvestgAddress}
          />
        </Tabs.TabPane>
      );
    }
    // 开户行信息
    if (configHeader.sslmInvestgBankAccount) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgBankAccount);
      tabs.push(tabPane);
    }
    // 主要客户情况
    if (configHeader.sslmInvestgCustomer) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgCustomer);
      tabs.push(tabPane);
    }
    // 分供方情况
    if (configHeader.sslmInvestgSubSupplier) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgSubSupplier);
      tabs.push(tabPane);
    }
    // 设备信息
    if (configHeader.sslmInvestgEquipment) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgEquipment);
      tabs.push(tabPane);
    }
    // 研发能力
    if (configHeader.sslmInvestgRd) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgRd);
      tabs.push(tabPane);
    }
    // 生产能力
    if (configHeader.sslmInvestgProduce) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgProduce);
      tabs.push(tabPane);
    }
    // 质保能力
    if (configHeader.sslmInvestgQa) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgQa);
      tabs.push(tabPane);
    }
    // 售后服务
    if (configHeader.sslmInvestgCustservice) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgCustservice);
      tabs.push(tabPane);
    }
    if (configHeader.sslmInvestgAttachment) {
      tabs.push(
        <Tabs.TabPane
          tab={intl.get(`sslm.investTemHisOrg.view.message.tab.attachment`).d('附件信息')}
          key="sslmInvestgAttachment"
        >
          <Attachment
            saving={saving}
            dataSource={configHeader.sslmInvestgAttachment}
            templateProp={templateProp}
          />
        </Tabs.TabPane>
      );
    }
    // 预留表格页签1
    if (configHeader.sslmInvestgReserve1) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve1);
      tabs.push(tabPane);
    }
    // 预留表格页签2
    if (configHeader.sslmInvestgReserve2) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve2);
      tabs.push(tabPane);
    }
    // 预留表格页签3
    if (configHeader.sslmInvestgReserve5) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve5);
      tabs.push(tabPane);
    }
    // 预留表格页签4
    if (configHeader.sslmInvestgReserve6) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve6);
      tabs.push(tabPane);
    }
    // 预留表格页签5
    if (configHeader.sslmInvestgReserve7) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve7);
      tabs.push(tabPane);
    }
    // 预留表格页签6
    if (configHeader.sslmInvestgReserve8) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve8);
      tabs.push(tabPane);
    }
    // 预留表格页签7
    if (configHeader.sslmInvestgReserve9) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve9);
      tabs.push(tabPane);
    }
    // 预留表单页签1
    if (configHeader.sslmInvestgReserve3) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve3);
      tabs.push(tabPane);
    }
    // 预留表单页签2
    if (configHeader.sslmInvestgReserve4) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve4);
      tabs.push(tabPane);
    }
    // 预留表单页签3
    if (configHeader.sslmInvestgReserve10) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve10);
      tabs.push(tabPane);
    }
    // 预留表单页签4
    if (configHeader.sslmInvestgReserve11) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve11);
      tabs.push(tabPane);
    }
    // 预留表单页签5
    if (configHeader.sslmInvestgReserve12) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve12);
      tabs.push(tabPane);
    }
    // 预留表单页签6
    if (configHeader.sslmInvestgReserve13) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve13);
      tabs.push(tabPane);
    }
    // 预留表单页签7
    if (configHeader.sslmInvestgReserve14) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve14);
      tabs.push(tabPane);
    }
    return (
      <Tabs
        animated={false}
        defaultActiveKey={activeKey}
        tabPosition="left"
        onChange={this.handleKeyChange}
      >
        {tabs}
      </Tabs>
    );
  }
}
