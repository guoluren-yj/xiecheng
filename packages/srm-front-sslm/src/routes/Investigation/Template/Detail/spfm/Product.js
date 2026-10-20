/**
 * 产品及服务
 * @date: 2018-8-14
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import FieldTable from './FieldTable';

@formatterCollections({
  code: ['spfm.investigationDefinition'],
})
export default class Product extends React.PureComponent {
  state = {};

  /**
   * 保存修改数据
   */
  @Bind()
  onHandleAdd(dataSource) {
    const { onHandleSave } = this.props;
    onHandleSave(dataSource);
  }

  /**
   * 改变是否调查当前页签
   */
  @Bind()
  onHandleChange({ investigateFlag, atLeastOneFlag }) {
    const {
      dataSource: { lines, ...other },
      onHandleSwitchChange,
    } = this.props;
    onHandleSwitchChange({ ...other, investigateFlag, atLeastOneFlag });
  }
  /**
   * 更新修改的行状态
   */
  // @Bind()
  // onHandleUpdateState = record => {
  //   const { dataSource: { configName }, onHandleUpdateState } = this.props;
  //   onHandleUpdateState(record, configName);
  // };

  /**
   * 保存修改数据
   */
  @Bind()
  onHandleAddOne(dataSource) {
    const { onHandleSave } = this.props;
    onHandleSave(dataSource);
  }

  @Bind()
  onHandleAddTwo(dataSource) {
    const { onHandleSave } = this.props;
    onHandleSave(dataSource);
  }

  /**
   * 改变是否调查当前页签
   */
  @Bind()
  onHandleChangeOne({ investigateFlag, atLeastOneFlag, requiredCount }) {
    const {
      dataTabOne: { lines, ...other },
      onHandleSwitchChange,
    } = this.props;
    onHandleSwitchChange({ ...other, investigateFlag, atLeastOneFlag, requiredCount });
  }

  @Bind()
  onHandleChangeTwo({ investigateFlag, atLeastOneFlag, requiredCount }) {
    const {
      dataTabTwo: { lines, ...other },
      onHandleSwitchChange,
    } = this.props;
    onHandleSwitchChange({ ...other, investigateFlag, atLeastOneFlag, requiredCount });
  }

  render() {
    const {
      title = intl.get(`spfm.investigationDefinition.view.message.tab.proservice`).d('产品及服务'),
      // dataSource: { lines, investigateFlag, atLeastOneFlag, gridFlag },
      dataTabOne: {
        lines: dataSourceOne,
        investigateFlag: flagOne,
        atLeastOneFlag: leastFlagOne,
        gridFlag: gridFlagOne,
        requiredCount: requiredCountOne,
        ...rest1
      },
      dataTabTwo: {
        lines: dataSourceTwo,
        investigateFlag: flagTwo,
        atLeastOneFlag: leastFlagTwo,
        gridFlag: gridFlagTwo,
        requiredCount: requiredCountTwo,
        ...rest2
      },
      saving,
      queryTemplateConfig,
    } = this.props;
    return (
      <Tabs animated={false}>
        <Tabs.TabPane tab={title} key="product">
          <FieldTable
            col={2}
            saving={saving}
            dataSource={dataSourceOne}
            investigateFlag={flagOne}
            atLeastOneFlag={leastFlagOne}
            gridFlag={gridFlagOne}
            onHandleAdd={this.onHandleAddOne}
            onHandleChange={this.onHandleChangeOne}
            requiredCount={requiredCountOne}
            rest={rest1}
            queryTemplateConfig={queryTemplateConfig}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={intl
            .get(`spfm.investigationDefinition.view.message.supplierClassify`)
            .d('供应商分类')}
          key="sslmInvestgSupplierCate"
        >
          <FieldTable
            col={2}
            saving={saving}
            dataSource={dataSourceTwo}
            gridFlag={gridFlagTwo}
            atLeastOneFlag={leastFlagTwo}
            investigateFlag={flagTwo}
            onHandleAdd={this.onHandleAddTwo}
            onHandleChange={this.onHandleChangeTwo}
            requiredCount={requiredCountTwo}
            rest={rest2}
            queryTemplateConfig={queryTemplateConfig}
          />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
