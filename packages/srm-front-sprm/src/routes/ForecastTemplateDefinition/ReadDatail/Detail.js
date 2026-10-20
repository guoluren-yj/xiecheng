import React, { Fragment, useContext } from 'react';

import { observer } from 'mobx-react-lite';
import { Tabs, Form, SelectBox } from 'choerodon-ui/pro';

import { Card } from 'choerodon-ui';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';

import BaseInfo from './readComponent/Base';
import BuyerInterConfigInfo from './readComponent/BuyerInterConfig';
import DynamicColConfigInfo from './readComponent/DynamicColConfig';
import FqControlNodeInfo from './readComponent/FqControlNode';
import FsdynamicColConfigInfo from './readComponent/FsdynamicColConfig';

import { Store } from './../Detail/stores';
import style from './../Detail/index.less';

const { TabPane } = Tabs;
const commonPrompt = 'sprm.forecastMgt.model.common';

const Detail = () => {
  const { headerDs } = useContext(Store);
  return (
    <Fragment>
      <Header
        title={intl.get('sprm.forecastMgt.model.common.forecastMgtTempDef').d('预测管理模板定义')}
        backPath="/sprm/forecast-lib-dimension/list"
      />
      <Content style={{ position: 'relative' }}>
        <div className={style['sprm-forecast-template']}>
          <Tabs tabPosition="left" className="contect-item">
            <TabPane tab={intl.get(`${commonPrompt}.baseInfo`).d('基础信息')} key="baseInfo">
              <div>
                <h3 className="content-title">
                  {intl.get(`${commonPrompt}.baseInfo`).d('基础信息')}
                </h3>
                <BaseInfo />
              </div>
            </TabPane>
            <TabPane
              tab={intl.get(`${commonPrompt}.dynamicColConfig`).d('预测基础维度配置')}
              key="dynamicColConfig"
            >
              <div>
                <h3 className="content-title">
                  {intl.get(`${commonPrompt}.dynamicColConfig`).d('预测基础维度配置')}
                </h3>
                <DynamicColConfigInfo />
              </div>
            </TabPane>
            <TabPane
              tab={intl.get(`${commonPrompt}.fsdynamicColConfig`).d('预测单动态列配置')}
              key="fsdynamicColConfig"
            >
              <div>
                <h3 className="content-title">
                  {intl.get(`${commonPrompt}.fsdynamicColConfig`).d('预测单动态列配置')}
                </h3>
                <FsdynamicColConfigInfo />
              </div>
            </TabPane>
            <TabPane
              tab={intl.get(`${commonPrompt}.buyerInterConfig`).d('过程控制规则配置')}
              key="buyerInterConfig"
            >
              <h3 className="content-title">
                {intl.get(`${commonPrompt}.buyerInterConfig`).d('过程控制规则配置')}
              </h3>
              <div className="overflow-config">
                <Card
                  bordered={false}
                  className={DETAIL_CARD_CLASSNAME}
                  title={intl.get(`${commonPrompt}.releaseProcessControl`).d('发布过程配置')}
                >
                  <Form
                    dataSet={headerDs}
                    labelAlign="left"
                    columns={1}
                    useColon={false}
                    labelWidth={260}
                  >
                    <SelectBox name="predictionDimensionCnf" vertical disabled showHelp="label" />
                    <SelectBox name="allowChange" vertical disabled showHelp="label">
                      {[
                        { value: 1, name: intl.get(`${commonPrompt}.allow`).d('允许') },
                        { value: 0, name: intl.get(`${commonPrompt}.notAllow`).d('不允许') },
                      ].map((ele) => (
                        <SelectBox.Option value={ele.value}>{ele.name}</SelectBox.Option>
                      ))}
                    </SelectBox>
                    <SelectBox name="weekCarryoverDimension" vertical showHelp="label" disabled>
                      {[
                        {
                          value: 'SEVEN_DAY',
                          name: intl
                            .get(`${commonPrompt}.weekCarryoverDimension.sevenDay`)
                            .d('7天结算'),
                        },
                        {
                          value: 'WEEK',
                          name: intl
                            .get(`${commonPrompt}.weekCarryoverDimension.week`)
                            .d('按周末结'),
                        },
                        {
                          value: 'FRIDAY',
                          name: intl
                            .get(`${commonPrompt}.weekCarryoverDimension.firday`)
                            .d('按周五结'),
                        },
                      ].map((ele) => (
                        <SelectBox.Option value={ele.value}>{ele.name}</SelectBox.Option>
                      ))}
                    </SelectBox>
                    <SelectBox name="monthCarryoverDimension" vertical showHelp="label" disabled>
                      {[
                        {
                          value: 'THIRTY_OR_ONE',
                          name: intl
                            .get(`${commonPrompt}.monthCarryoverDimension.lastday`)
                            .d('30/31天结算'),
                        },
                        {
                          value: 'MONTH',
                          name: intl
                            .get(`${commonPrompt}.monthCarryoverDimension.month`)
                            .d('按月结'),
                        },
                      ].map((ele) => (
                        <SelectBox.Option value={ele.value}>{ele.name}</SelectBox.Option>
                      ))}
                    </SelectBox>
                    <SelectBox name="versionViewDimension" vertical disabled showHelp="label" />
                  </Form>
                </Card>

                <Card
                  bordered={false}
                  className={DETAIL_CARD_CLASSNAME}
                  title={intl.get(`${commonPrompt}.feedback.process.Control`).d('反馈过程配置')}
                >
                  <BuyerInterConfigInfo />
                </Card>

                <Card
                  bordered={false}
                  className={DETAIL_CARD_CLASSNAME}
                  style={{ paddingBottom: 24 }}
                  title={intl.get(`${commonPrompt}.fqControlNode`).d('下游过程配置')}
                >
                  <FqControlNodeInfo />
                </Card>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Fragment>
  );
};

export default observer(Detail);
