import React, { Fragment, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Tabs, Form, Output } from 'choerodon-ui/pro';
import { Card, Spin } from 'choerodon-ui';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { Button } from 'components/Permission';

import { Header } from 'components/Page';
import intl from 'utils/intl';

import BaseInfo from './readComponent/Base';
import BuyerInterConfigInfo from './readComponent/BuyerInterConfig';
import DynamicColConfigInfo from './readComponent/DynamicColConfig';
import FqControlNodeInfo from './readComponent/FqControlNode';
import FsdynamicColConfigInfo from './readComponent/FsdynamicColConfig';

import { Store } from './../Detail/stores';
import style from './../Detail/index.less';
import styles from './../ReadDatail/readComponent/index.less';

const { TabPane } = Tabs;
const commonPrompt = 'sprm.forecastMgt.model.common';

const Detail = () => {
  const { history, templateHeaderId, headerDs } = useContext(Store);
  const hanleDetailLink = (type) => {
    history.push({
      pathname: `/sprm/forecast-dimension-org/detail/${templateHeaderId}`,
      search: type ? `type=${type}` : null,
    });
  };

  const HeaderBtn = observer(() => {
    return (
      <>
        {headerDs.current?.get('templateStatusShow') === 'UNRELEASED' && (
          <Button
            onClick={() => hanleDetailLink()}
            funcType="flat"
            icon="mode_edit"
            type="c7n-pro"
            wait={500}
          >
            {intl.get('hzero.common.model.edit').d('编辑')}
          </Button>
        )}
        {headerDs.current?.get('templateStatusShow') === 'RELEASED' && (
          <Button
            onClick={() => hanleDetailLink('change')}
            funcType="flat"
            icon="mode_edit"
            type="c7n-pro"
            permissionList={[{ code: 'hzero.srm.requirement.forecast.lib_org.ps.change' }]}
            wait={500}
          >
            {intl.get('hzero.common.model.edit').d('编辑')}
          </Button>
        )}
      </>
    );
  });

  const carryoverDimension = {
    SEVEN_DAY: intl
      .get(`sprm.forecastMgt.model.common.weekCarryoverDimension.sevenDay`)
      .d('7天结算'),
    WEEK: intl.get(`sprm.forecastMgt.model.common.weekCarryoverDimension.week`).d('按周末结'),
    FRIDAY: intl.get(`sprm.forecastMgt.model.common.weekCarryoverDimension.firday`).d('按周五结'),
    THIRTY_OR_ONE: intl
      .get(`sprm.forecastMgt.model.common.monthCarryoverDimension.lastday`)
      .d('30/31天结算'),
    MONTH: intl.get(`sprm.forecastMgt.model.common.monthCarryoverDimension.month`).d('按月结'),
  };

  return (
    <Fragment>
      <Header
        title={intl.get('sprm.forecastMgt.model.common.readForecastMgtTempDef').d('查看预测模板')}
        backPath="/sprm/forecast-dimension-org/list"
      >
        <HeaderBtn />
      </Header>
      <div className={style['sprm-forecast-template']}>
        <Spin spinning={false} wrapperClassName="full-height-spinning">
          <Tabs tabPosition="left" className="forecast-contect-item" flex>
            <TabPane tab={intl.get(`${commonPrompt}.baseInfo`).d('基础信息')} key="baseInfo">
              <BaseInfo />
            </TabPane>
            <TabPane
              tab={intl.get(`${commonPrompt}.dynamicColConfig`).d('预测基础维度配置')}
              key="dynamicColConfig"
            >
              <DynamicColConfigInfo />
            </TabPane>
            <TabPane
              tab={intl.get(`${commonPrompt}.fsdynamicColConfig`).d('预测单动态列配置')}
              key="fsdynamicColConfig"
            >
              <FsdynamicColConfigInfo />
            </TabPane>
            <TabPane
              tab={intl.get(`${commonPrompt}.buyerInterConfig`).d('过程控制规则配置')}
              key="buyerInterConfig"
            >
              <div className="overflow-config">
                <Card
                  bordered={false}
                  className={DETAIL_CARD_CLASSNAME}
                  title={intl.get(`${commonPrompt}.releaseProcessControl`).d('发布过程配置')}
                >
                  <Form
                    labelAlign="left"
                    columns={1}
                    useColon={false}
                    labelWidth={260}
                    // className="form-select-box"
                    className={styles['form-select-box']}
                    dataSet={headerDs}
                  >
                    <Output name="predictionDimensionCnf" vertical disabled showHelp="label" />
                    <Output
                      name="allowChange"
                      vertical
                      showHelp="label"
                      renderer={({ value }) =>
                        value === 1
                          ? intl.get(`${commonPrompt}.allow`).d('允许')
                          : intl.get(`${commonPrompt}.notAllow`).d('不允许')
                      }
                    />
                    <Output
                      name="weekCarryoverDimension"
                      vertical
                      showHelp="label"
                      renderer={({ value }) => carryoverDimension[value]}
                    />
                    <Output
                      name="monthCarryoverDimension"
                      vertical
                      showHelp="label"
                      renderer={({ value }) => carryoverDimension[value]}
                    />

                    <Output name="versionViewDimension" vertical disabled showHelp="label" />
                    {/* <SelectBox name="allowChange" vertical disabled>
                    {[
                      { value: 1, name: intl.get(`${commonPrompt}.allow`).d('允许') },
                      { value: 0, name: intl.get(`${commonPrompt}.notAllow`).d('不允许') },
                    ].map((ele) => (
                      <SelectBox.Option value={ele.value} style={{ paddingBottom: '5px' }}>
                        {ele.name}
                      </SelectBox.Option>
                    ))}
                  </SelectBox> */}
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
                  title={intl.get(`${commonPrompt}.fqControlNode`).d('下游过程配置')}
                >
                  <FqControlNodeInfo />
                </Card>
              </div>
            </TabPane>
          </Tabs>
        </Spin>
      </div>
    </Fragment>
  );
};

export default Detail;
