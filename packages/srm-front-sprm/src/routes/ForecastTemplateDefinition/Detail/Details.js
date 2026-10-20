/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-14 17:30:29
 * @LastEditors: yanglin
 * @LastEditTime: 2023-11-02 17:03:51
 */
import React, { useContext, Fragment, useState } from 'react';

import { observer } from 'mobx-react-lite';
import { Tabs, Button, Modal, SelectBox, Form } from 'choerodon-ui/pro';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { Card } from 'choerodon-ui';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import notification from 'utils/notification';

import {
  saveFcstTemplate,
  releaseFcstTemplate,
  updateFcstTemplate,
} from '@/services/forecastTemplateDefService';
import BaseInfo from './component/Base';
import BuyerInterConfigInfo from './component/BuyerInterConfig';
import DynamicColConfigInfo from './component/DynamicColConfig';
import FqControlNodeInfo from './component/FqControlNode';
import FsdynamicColConfigInfo from './component/FsdynamicColConfig';
import { Store } from './stores';

import style from './../Detail/index.less';

const { TabPane } = Tabs;
const commonPrompt = 'sprm.forecastMgt.model.common';

const Detail = () => {
  const [loadings, setLoading] = useState(false);
  const {
    headerDs,
    listDs,
    fsListDs,
    history,
    templateHeaderId,
    lookupAgain,
    queryLoading,
  } = useContext(Store);

  const handleSave = async () => {
    setLoading(true);
    const headerInfo = headerDs.current?.toJSONData() || {};
    const fcstTemplateLineList = listDs.toJSONData() || [];
    const fcstTemplateDimensionList = fsListDs.toJSONData();
    const headerValidate = await headerDs.validate();
    const fcstLineValidate = await listDs.validate();
    const fcstDimensionValidate = await fsListDs.validate();
    if (headerValidate && fcstLineValidate && fcstDimensionValidate) {
      if (!templateHeaderId) {
        saveFcstTemplate({
          ...headerInfo,
          fcstTemplateLineList,
          fcstTemplateDimensionList,
        }).then((res) => {
          if (res?.failed) {
            setLoading(false);
            notification.error({ message: res.message });
          } else if (res) {
            const { templateHeaderId: tempId } = res;
            history.push({
              pathname: `/sprm/forecast-lib-dimension/detail/${tempId}`,
            });
            setLoading(false);
            notification.success();
          }
        });
      } else {
        updateFcstTemplate({
          ...headerInfo,
          fcstTemplateLineList,
          fcstTemplateDimensionList,
        }).then((res) => {
          if (res?.failed) {
            setLoading(false);
            notification.error({ message: res.message });
          } else if (res) {
            lookupAgain();
            setLoading(false);
            notification.success();
          }
        });
      }
    } else if (!headerValidate) {
      setLoading(false);
      notification.error({
        message: intl
          .get('sprm.fcst.error.baseInfo.available')
          .d('预测管理模板保存失败，基础信息与下游过程配置存在字段未维护，请检查后再执行该操作。'),
      });
    } else if (!fcstLineValidate) {
      setLoading(false);
      notification.error({
        message: intl
          .get('sprm.fcst.error_no_template_line_available')
          .d('预测管理模板保存失败，原因是未维护预测基础维度配置，请检查后再执行该操作。'),
      });
    } else {
      setLoading(false);
      notification.error({
        message: intl
          .get('sprm.fcst.error_no_forecast_dimension_type')
          .d('预测管理模板保存失败，原因是未维护预测高阶维度配置，请检查后再执行该操作。'),
      });
    }
  };

  const handleRelease = async () => {
    setLoading(true);
    const headerInfo = headerDs.current.toJSONData() || [];
    const fcstTemplateLineList = listDs.toJSONData() || [];
    const fcstTemplateDimensionList = fsListDs.toJSONData();
    const headerValidate = await headerDs.validate();
    const fcstLineValidate = await listDs.validate();
    const fcstDimensionValidate = await fsListDs.validate();
    if (headerValidate && fcstLineValidate && fcstDimensionValidate) {
      Modal.confirm({
        bodyStyle: { padding: '20px' },
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <p>
            {intl
              .get(`sprm.forecastMgt.view.message.confirmRelease`)
              .d('预测模版一旦发布后不可更改，请确认是否发布。')}
          </p>
        ),
        onOk: () => {
          releaseFcstTemplate({
            ...headerInfo,
            fcstTemplateLineList,
            fcstTemplateDimensionList,
          }).then((res) => {
            if (res?.failed) {
              setLoading(false);
              notification.error({ message: res.message });
            } else if (res) {
              history.push({
                pathname: `/sprm/forecast-lib-dimension/list`,
              });
              setLoading(false);
              notification.success();
            }
          });
        },
        onCancel: () => {
          setLoading(false);
        },
      });
    } else if (!headerValidate) {
      setLoading(false);
      notification.error({
        message: intl
          .get('sprm.fcst.error.baseInfo.available')
          .d('预测管理模板保存失败，原因是未维护基础信息，请检查后再执行该操作。'),
      });
    } else if (!fcstLineValidate) {
      setLoading(false);
      notification.error({
        message: intl
          .get('sprm.fcst.error_no_template_line_available')
          .d('预测管理模板保存失败，原因是未维护预测基础维度配置，请检查后再执行该操作。'),
      });
    } else {
      setLoading(false);
      notification.error({
        message: intl
          .get('sprm.fcst.error_no_forecast_dimension_type')
          .d('预测管理模板保存失败，原因是未维护预测高阶维度配置，请检查后再执行该操作。'),
      });
    }
  };

  const HeaderBtn = observer(({ loading, currentTemplateHeaderId }) => {
    return (
      <Fragment>
        {currentTemplateHeaderId && (
          <Button
            onClick={handleRelease}
            color="primary"
            funcType="raised"
            icon="rocket"
            wait={500}
            loading={loading || queryLoading}
          >
            {intl.get('hzero.common.release').d('发布')}
          </Button>
        )}
        <Button
          onClick={handleSave}
          icon="save"
          color={currentTemplateHeaderId ? 'default ' : 'primary'}
          funcType={currentTemplateHeaderId ? 'flat ' : 'raised'}
          wait={500}
          loading={loading || queryLoading}
        >
          {intl.get('hzero.common.model.save').d('保存')}
        </Button>
      </Fragment>
    );
  });

  return (
    <Fragment>
      <Header
        title={intl.get('sprm.forecastMgt.model.common.forecastMgtTempDef').d('预测管理模板定义')}
        backPath="/sprm/forecast-lib-dimension/list"
      >
        <HeaderBtn currentTemplateHeaderId={templateHeaderId} loading={loadings} />
      </Header>
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
                    <SelectBox name="predictionDimensionCnf" vertical showHelp="label" />
                    <SelectBox name="allowChange" vertical showHelp="label">
                      {[
                        { value: 1, name: intl.get(`${commonPrompt}.allow`).d('允许') },
                        { value: 0, name: intl.get(`${commonPrompt}.notAllow`).d('不允许') },
                      ].map((ele) => (
                        <SelectBox.Option value={ele.value}>{ele.name}</SelectBox.Option>
                      ))}
                    </SelectBox>
                    <SelectBox name="weekCarryoverDimension" vertical showHelp="label">
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
                    <SelectBox name="monthCarryoverDimension" vertical showHelp="label">
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
                    <SelectBox name="versionViewDimension" vertical showHelp="label" />
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
                  title={intl.get(`${commonPrompt}.fqControlNode`).d('预测数量控制节点')}
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
