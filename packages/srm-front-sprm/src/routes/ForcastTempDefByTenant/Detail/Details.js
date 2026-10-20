import React, { useContext, Fragment, useState } from 'react';

import { observer } from 'mobx-react-lite';
import { Tabs, Modal, Form, SelectBox } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';

import { Header } from 'components/Page';
import { Card, Tag, Spin } from 'choerodon-ui';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import {
  releaseFcstTemplate,
  updateFcstTemplate,
  deleteOrgTemplateLines,
} from '@/services/forecastTemplateDefOrgService';
import BaseInfo from './component/Base';
import BuyerInterConfigInfo from './component/BuyerInterConfig';
import DynamicColConfigInfo from './component/DynamicColConfig';
import FqControlNodeInfo from './component/FqControlNode';
import FsdynamicColConfigInfo from './component/FsdynamicColConfig';
import { Store } from './stores';

import style from './index.less';

const { TabPane } = Tabs;
const commonPrompt = 'sprm.forecastMgt.model.common';

const Detail = () => {
  const {
    headerDs,
    listDs,
    fsListDs,
    templateHeaderId,
    history,
    lookupAgain,
    changeFlag,
    queryLoading,
  } = useContext(Store);
  const [loadings, setLoading] = useState(false);
  const [validateListFlag, setValidateList] = useState(
    templateHeaderId
      ? {
          baseInfo: 'green',
          fsdynamicColConfig: 'green',
          dynamicColConfig: 'green',
          buyerInterConfig: 'green',
        }
      : {
          baseInfo: 'gray',
          fsdynamicColConfig: 'gray',
          dynamicColConfig: 'gray',
          buyerInterConfig: 'gray',
        }
  );

  const handleSave = async () => {
    setLoading(true);
    const headerInfo = headerDs.current.toJSONData() || [];
    const fcstTemplateLineList = listDs.toJSONData() || [];
    const fcstTemplateDimensionList = fsListDs.toJSONData();
    const headerValidate = await headerDs.validate();
    const fcstLineValidate = await listDs.validate();
    const fcstDimensionValidate = await fsListDs.validate();
    setValidateList({
      baseInfo: headerValidate ? 'green' : 'red',
      fsdynamicColConfig: fcstDimensionValidate ? 'green' : 'red',
      dynamicColConfig: fcstLineValidate ? 'green' : 'red',
      buyerInterConfig: 'green',
    });
    if (headerValidate && fcstLineValidate && fcstDimensionValidate) {
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
    } else if (!headerValidate) {
      setLoading(false);
      notification.error({
        message: intl.get('sprm.fcst.error.saveTemplate.error').d('预测管理模板保存失败'),
        description: intl
          .get('sprm.fcst.error.baseInfo.checkAvailable')
          .d('未维护基础信息，请检查后再执行该操作。'),
      });
    } else if (!fcstLineValidate) {
      setLoading(false);
      notification.error({
        message: intl.get('sprm.fcst.error.saveTemplate.error').d('预测管理模板保存失败'),
        description: intl
          .get('sprm.fcst.error.template_line.checkAvailable')
          .d('未维护预测基础维度配置，请检查后再执行该操作。'),
      });
    } else {
      setLoading(false);
      notification.error({
        message: intl.get('sprm.fcst.error.saveTemplate.error').d('预测管理模板保存失败'),
        description: intl
          .get('sprm.fcst.error.forecast_dimension_type.checkAvailable')
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
    setValidateList({
      baseInfo: headerValidate ? 'green' : 'red',
      fsdynamicColConfig: fcstDimensionValidate ? 'green' : 'red',
      dynamicColConfig: fcstLineValidate ? 'green' : 'red',
      buyerInterConfig: 'green',
    });
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
              setLoading(false);
              history.push({
                pathname: `/sprm/forecast-dimension-org/list`,
              });
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
        message: intl.get('sprm.fcst.error.saveTemplate.error').d('预测管理模板保存失败'),
        description: intl
          .get('sprm.fcst.error.baseInfo.checkAvailable')
          .d('未维护基础信息，请检查后再执行该操作。'),
      });
    } else if (!fcstLineValidate) {
      setLoading(false);
      notification.error({
        message: intl.get('sprm.fcst.error.saveTemplate.error').d('预测管理模板保存失败'),
        description: intl
          .get('sprm.fcst.error.template_line.checkAvailable')
          .d('未维护预测基础维度配置，请检查后再执行该操作。'),
      });
    } else {
      setLoading(false);
      notification.error({
        message: intl.get('sprm.fcst.error.saveTemplate.error').d('预测管理模板保存失败'),
        description: intl
          .get('sprm.fcst.error.forecast_dimension_type.checkAvailable')
          .d('预测管理模板保存失败，原因是未维护预测高阶维度配置，请检查后再执行该操作。'),
      });
    }
  };

  // 删除采购申请行
  const handleDelete = () => {
    const deleteLine = headerDs.current?.toJSONData();
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      bodyStyle: { padding: '20px' },
      children: (
        <p>
          {intl
            .get('sprm.forecast.view.message.template.confirmDelete')
            .d('是否确认删除该预测模板?')}
        </p>
      ),
    }).then((button) => {
      if (button === 'ok') {
        deleteOrgTemplateLines(deleteLine).then((res) => {
          if (getResponse(res)) {
            notification.success();
            history.push({
              pathname: `/sprm/forecast-dimension-org/list`,
            });
          }
        });
      }
    });
  };

  const HeaderBtn = observer(({ loading, currentChangeFlag }) => {
    return (
      <Fragment>
        <Button
          onClick={handleRelease}
          color="primary"
          templateHeaderId
          funcType="raised"
          loading={loading || queryLoading}
          icon="publish2"
          type="c7n-pro"
          wait={500}
        >
          {intl.get('hzero.common.release').d('发布')}
        </Button>
        {!currentChangeFlag && (
          <Button
            onClick={handleSave}
            funcType="flat"
            icon="save"
            type="c7n-pro"
            wait={500}
            loading={loading || queryLoading}
          >
            {intl.get('hzero.common.model.save').d('保存')}
          </Button>
        )}
        {headerDs?.current?.get('templateStatus') === 'UNRELEASED' && (
          <Button
            onClick={handleDelete}
            loading={loading || queryLoading}
            funcType="flat"
            icon="delete"
            type="c7n-pro"
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        )}
      </Fragment>
    );
  });

  const TabTitle = observer(({ currentKey, title, validateList }) => {
    const color = validateList[currentKey];
    console.log(color, validateList, currentKey); // baseInfo ruleConfig
    const checkInfo =
      color === 'gray'
        ? intl.get('srpm.common.modal.edit.preset').d('预设')
        : color === 'red'
        ? intl.get('srpm.common.edit.status.incomplete').d('未完成')
        : intl.get('srpm.common.model.common.finish').d('完成');
    return (
      <>
        <div className="tabTitle">
          <span className="tab-title-text"> {title}</span>
          <Tag color={color} style={{ border: 0 }}>
            {checkInfo}
          </Tag>
        </div>
      </>
    );
  });

  return (
    <Fragment>
      <Header
        title={intl.get('sprm.forecastMgt.model.common.editForecastMgtTempDef').d('编辑预测模板')}
        backPath="/sprm/forecast-dimension-org/list"
      >
        <HeaderBtn currentChangeFlag={changeFlag} loading={loadings} />
      </Header>
      <div className={style['sprm-forecast-template']}>
        <Spin spinning={loadings || false} wrapperClassName="full-height-spinning">
          <Tabs tabPosition="left" className="forecast-contect-item">
            <TabPane
              tab={
                <TabTitle
                  title={intl.get(`${commonPrompt}.baseInfo`).d('基础信息')}
                  currentKey="baseInfo"
                  validateList={validateListFlag}
                />
              }
              key="baseInfo"
            >
              <BaseInfo />
            </TabPane>
            <TabPane
              key="dynamicColConfig"
              tab={
                <TabTitle
                  title={intl.get(`${commonPrompt}.dynamicColConfig`).d('基础维度配置')}
                  currentKey="dynamicColConfig"
                  validateList={validateListFlag}
                />
              }
            >
              <DynamicColConfigInfo />
            </TabPane>
            <TabPane
              key="fsdynamicColConfig"
              tab={
                <TabTitle
                  title={intl.get(`${commonPrompt}.fsdynamicColConfig`).d('高阶维度配置')}
                  currentKey="fsdynamicColConfig"
                  validateList={validateListFlag}
                />
              }
            >
              <FsdynamicColConfigInfo />
            </TabPane>
            <TabPane
              key="buyerInterConfig"
              tab={
                <TabTitle
                  title={intl.get(`${commonPrompt}.buyerInterConfig`).d('过程控制规则配置')}
                  currentKey="buyerInterConfig"
                  validateList={validateListFlag}
                />
              }
            >
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
                    className="form-select-box"
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

export default observer(Detail);
