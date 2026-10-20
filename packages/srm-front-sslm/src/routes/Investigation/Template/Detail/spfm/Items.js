/**
 * Tabs - 预览的 tabs
 * @date Mon Aug 13 2018
 * @author WY  yang.wang06@hand-china.com
 * @copyright Copyright(c) 2018 Hand
 */

import React from 'react';
import { connect } from 'dva';
import { Tabs } from 'hzero-ui';
import { map, isEmpty, findIndex, cloneDeep } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import Base from './Base';
import Product from './Product';
import Business from './Business';
import Finance from './Finance';
import Auth from './Auth';
import ContactAddress from './ContactAddress';
import Bank from './Bank';
import Partner from './Partner';
import Equipment from './Equipment';
import RdProduce from './RdProduce';
import Custservice from './Custservice';
import Attachment from './Attachment';

/**
 * 平台级模板明细定义Tab
 * @extends {Component} - PureComponent
 * @reactProps {Object} investigationDefinitionSite - 数据源
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['spfm.investigationDefinition'],
})
@connect(({ investigationDefinitionSite, loading }) => ({
  investigationDefinitionSite,
  saving: loading.effects['investigationDefinitionSite/saveDefinition'],
}))
export default class InvestigationTab extends React.Component {
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

  /**
   * 存储 Tab的key
   */
  @Bind()
  handleKeyChange(activeKey) {
    this.setState({ activeKey });
  }

  /**
   *移除对象中的某个属性
   *
   * @param {*} obj 传入的对象
   * @param {*} paramsArr 对象里的key
   * @returns
   * @memberof ProducerConfig
   */
  @Bind()
  handleRemoveProps(obj, paramsArr) {
    const newItem = { ...obj };
    paramsArr.forEach(item => {
      if (newItem[item]) {
        delete newItem[item];
      }
    });
    return newItem;
  }

  /**
   * 改变是否调查当前页签
   */
  @Bind()
  onHandleSwitchChange(flagList) {
    const { dispatch, config = [] } = this.props;
    dispatch({
      type: 'investigationDefinitionSite/updateHeader',
      payload: flagList,
    }).then(res => {
      if (res && res[0]) {
        notification.success();
        const {
          investgCfHeaderId,
          objectVersionNumber,
          atLeastOneFlag,
          gridFlag,
          investigateFlag,
        } = res[0];
        const newConfig = config.map(o =>
          o.investgCfHeaderId === investgCfHeaderId
            ? { ...o, objectVersionNumber, atLeastOneFlag, gridFlag, investigateFlag }
            : o
        );
        dispatch({
          type: 'investigationDefinitionSite/updateState',
          payload: { config: newConfig },
        });
      }
    });
  }

  /**
   * 更新改变的行数据
   * @param record 行数据
   * @param configName tab的name
   * @memberof InvestigationTab
   */
  @Bind()
  onHandleChange(record, configName) {
    const { dispatch, config } = this.props;
    const { configHeader } = this.state;
    const thisTable = configHeader[configName];
    const { lines: tableList, ...other } = thisTable;
    // 将修改的行插入isEdit
    const newTableList = tableList.map(item => {
      if (record.investgCfLineId === item.investgCfLineId) {
        return { ...item, isEdit: true };
      } else {
        return item;
      }
    });
    const configItem = { ...other, lines: newTableList };
    // 新的config数据
    const newConfig = config.map(item => {
      if (item.investgCfHeaderId === configItem.investgCfHeaderId) {
        return configItem;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'investigationDefinitionSite/updateState',
      payload: {
        config: newConfig,
      },
    });
  }

  /**
   * 批量保存行数据
   * @param formData 表单数据
   * @param configName tab的name
   * @memberof InvestigationTab
   */
  @Bind()
  onHandleSave(newSaveDataList = []) {
    const { dispatch, config } = this.props;
    // const { configHeader } = this.state;
    if (isEmpty(newSaveDataList)) {
      notification.warning({
        message: intl
          .get(`spfm.investigationDefinition.view.message.notification`)
          .d('你没有修改任何数据！'),
      });
      return;
    }
    const payloadData = newSaveDataList;
    dispatch({
      type: 'investigationDefinitionSite/saveDefinition',
      payload: payloadData,
    }).then(res => {
      if (res) {
        // 修改的table在config中的位置
        const newConfig = cloneDeep(config);
        const fIndex = findIndex(newConfig, { investgCfHeaderId: res[0].investgCfHeaderId });
        const configTable = newConfig[fIndex];
        const { lines = [], ...other } = configTable;
        // 存储修改值在lines的 Index
        let indexObj = {};
        for (let i = 0; i < res.length; i++) {
          indexObj = {
            ...indexObj,
            [findIndex(lines, { investgCfLineId: res[i].investgCfLineId })]: i,
          };
        }
        // 修改后的 lines
        const updateData = lines.map((item, index) => {
          if (Object.keys(indexObj).includes(`${index}`)) {
            const { componentTypeMeaning, _status, $form } = item;
            return { ...item, ...res[indexObj[index]], componentTypeMeaning, _status, $form };
          } else {
            return item;
          }
        });
        newConfig[fIndex] = { ...other, lines: updateData };
        dispatch({
          type: 'investigationDefinitionSite/updateState',
          payload: { config: newConfig },
        });
        notification.success();
      }
    });
  }

  render() {
    const { configHeader, activeKey } = this.state;
    const { saving } = this.props;
    const tabs = [];
    if (configHeader.sslmInvestgBasic) {
      tabs.push(
        <Tabs.TabPane
          tab={intl.get(`spfm.investigationDefinition.view.message.tab.basic`).d('基础信息')}
          key="sslmInvestgBasic"
        >
          <Base
            saving={saving}
            dataSource={configHeader.sslmInvestgBasic}
            onHandleSwitchChange={this.onHandleSwitchChange}
            onHandleSave={this.onHandleSave}
          />
        </Tabs.TabPane>
      );
    }
    if (configHeader.sslmInvestgBusiness) {
      tabs.push(
        <Tabs.TabPane
          tab={intl.get(`spfm.investigationDefinition.view.message.tab.business`).d('业务信息')}
          key="sslmInvestgBusiness"
        >
          <Business
            saving={saving}
            dataSource={configHeader.sslmInvestgBusiness}
            onHandleSwitchChange={this.onHandleSwitchChange}
            onHandleSave={this.onHandleSave}
          />
        </Tabs.TabPane>
      );
    }
    if (configHeader.sslmInvestgProservice || configHeader.sslmInvestgSupplierCate) {
      tabs.push(
        <Tabs.TabPane
          tab={intl.get(`spfm.investigationDefinition.view.message.tab.proservice`).d('产品及服务')}
          key="sslmInvestgProservice"
        >
          <Product
            saving={saving}
            dataTabOne={configHeader.sslmInvestgProservice}
            dataTabTwo={configHeader.sslmInvestgSupplierCate}
            onHandleSwitchChange={this.onHandleSwitchChange}
            onHandleSave={this.onHandleSave}
          />
        </Tabs.TabPane>
      );
    }
    if (configHeader.sslmInvestgFin || configHeader.sslmInvestgFin_branch) {
      tabs.push(
        <Tabs.TabPane
          tab={intl.get(`spfm.investigationDefinition.view.message.tab.finAndBranch`).d('财务状况')}
          key="sslmInvestgFin"
        >
          <Finance
            saving={saving}
            dataTabOne={configHeader.sslmInvestgFin}
            dataTabTwo={configHeader.sslmInvestgFinBranch}
            onHandleSwitchChange={this.onHandleSwitchChange}
            onHandleSave={this.onHandleSave}
          />
        </Tabs.TabPane>
      );
    }
    if (configHeader.sslmInvestgAuth) {
      tabs.push(
        <Tabs.TabPane
          tab={intl.get(`spfm.investigationDefinition.view.message.tab.auth`).d('资质信息')}
          key="sslmInvestgAuth"
        >
          <Auth
            saving={saving}
            dataSource={configHeader.sslmInvestgAuth}
            onHandleSwitchChange={this.onHandleSwitchChange}
            onHandleSave={this.onHandleSave}
          />
        </Tabs.TabPane>
      );
    }
    if (configHeader.sslmInvestgContact || configHeader.sslmInvestgAddress) {
      tabs.push(
        <Tabs.TabPane
          tab={intl
            .get(`spfm.investigationDefinition.view.message.tab.contactAddr`)
            .d('联系人及地址')}
          key="sslmInvestgContact"
        >
          <ContactAddress
            saving={saving}
            dataTabOne={configHeader.sslmInvestgContact}
            dataTabTwo={configHeader.sslmInvestgAddress}
            onHandleSwitchChange={this.onHandleSwitchChange}
            onHandleSave={this.onHandleSave}
          />
        </Tabs.TabPane>
      );
    }
    if (configHeader.sslmInvestgBankAccount) {
      tabs.push(
        <Tabs.TabPane
          tab={intl
            .get(`spfm.investigationDefinition.view.message.tab.bankAccount`)
            .d('开户行信息')}
          key="sslmInvestgBankAccount"
        >
          <Bank
            saving={saving}
            dataSource={configHeader.sslmInvestgBankAccount}
            onHandleSwitchChange={this.onHandleSwitchChange}
            onHandleSave={this.onHandleSave}
          />
        </Tabs.TabPane>
      );
    }
    if (configHeader.sslmInvestgCustomer || configHeader.sslmInvestgSubSupplier) {
      tabs.push(
        <Tabs.TabPane
          tab={intl.get(`spfm.investigationDefinition.view.message.tab.partner`).d('合作伙伴')}
          key="sslmInvestgCustomer"
        >
          <Partner
            saving={saving}
            dataTabOne={configHeader.sslmInvestgCustomer}
            dataTabTwo={configHeader.sslmInvestgSubSupplier}
            onHandleSwitchChange={this.onHandleSwitchChange}
            onHandleSave={this.onHandleSave}
          />
        </Tabs.TabPane>
      );
    }
    if (configHeader.sslmInvestgEquipment) {
      tabs.push(
        <Tabs.TabPane
          tab={intl.get(`spfm.investigationDefinition.view.message.tab.equipment`).d('设备信息')}
          key="sslmInvestgEquipment"
        >
          <Equipment
            saving={saving}
            dataSource={configHeader.sslmInvestgEquipment}
            onHandleSwitchChange={this.onHandleSwitchChange}
            onHandleSave={this.onHandleSave}
          />
        </Tabs.TabPane>
      );
    }
    if (configHeader.sslmInvestgRd || configHeader.sslmInvestgProduce) {
      tabs.push(
        <Tabs.TabPane
          tab={intl.get(`spfm.investigationDefinition.view.message.tab.rdProduce`).d('研发与生产')}
          key="sslmInvestgRd"
        >
          <RdProduce
            saving={saving}
            dataTabOne={configHeader.sslmInvestgRd}
            dataTabTwo={configHeader.sslmInvestgProduce}
            onHandleSwitchChange={this.onHandleSwitchChange}
            onHandleSave={this.onHandleSave}
          />
        </Tabs.TabPane>
      );
    }
    if (configHeader.sslmInvestgQa || configHeader.sslmInvestgCustservice) {
      tabs.push(
        <Tabs.TabPane
          tab={intl
            .get(`spfm.investigationDefinition.view.message.tab.qaCustservice`)
            .d('质保与售后')}
          key="sslmInvestgQa"
        >
          <Custservice
            saving={saving}
            dataTabOne={configHeader.sslmInvestgQa}
            dataTabTwo={configHeader.sslmInvestgCustservice}
            onHandleSwitchChange={this.onHandleSwitchChange}
            onHandleSave={this.onHandleSave}
          />
        </Tabs.TabPane>
      );
    }
    if (configHeader.sslmInvestgAttachment) {
      tabs.push(
        <Tabs.TabPane
          tab={intl.get(`spfm.investigationDefinition.view.message.tab.attachment`).d('附件信息')}
          key="sslmInvestgAttachment"
        >
          <Attachment
            saving={saving}
            dataSource={configHeader.sslmInvestgAttachment}
            onHandleSwitchChange={this.onHandleSwitchChange}
            onHandleSave={this.onHandleSave}
          />
        </Tabs.TabPane>
      );
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
