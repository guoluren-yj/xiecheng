/*
 * Order - 配置中心-采购方-排程单
 * @date: 2020/04/05 17:20:47
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import { withRouter } from 'dva/router';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

import SubMessage from '../../components/SubMessage';
import SubCheckBox from '../../components/SubCheckBox';

const schedulePrompt = 'spfm.configServer.view.schedule.message';

/**
 * 配置中心-采购方-排程单
 * @extends {Component} - React.Component
 * @reactProps {Object} settings - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @return React.element    onChange={onChange}
 */
@withRouter
@Form.create({ fieldNameProp: null })
export default class Schedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: props.settings || {},
    };
    props.onRef(this);
  }

  @Bind()
  handleSetting(e) {
    const {
      form: { setFieldsValue },
    } = this.props;
    if (e.target.checked === 1) {
      setFieldsValue({
        '010801': e.target.checked,
        '010802': 1,
      });
    } else {
      setFieldsValue({
        '010802': 0,
      });
    }
  }

  @Bind()
  handleSettingConfrim(e) {
    const {
      form: { setFieldsValue },
    } = this.props;
    if (e.target.checked === 1) {
      setFieldsValue({
        '010804': e.target.checked,
        '010805': 1,
      });
    } else {
      setFieldsValue({
        '010805': 0,
      });
    }
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      configHideArr = [],
    } = this.props;
    const { settings } = this.state;
    const configList = [
      {
        key: 1,
        href: 'purPlanningSource',
        title: intl.get(`${schedulePrompt}.planningSource`).d('计划来源'),
        component: (
          <Row>
            <Col span={24}>{intl.get(`${schedulePrompt}.planningSource`).d('计划来源')}</Col>
            {!configHideArr.includes('purPlanningSource-1') && (
              <>
                <SubCheckBox
                  content={intl.get(`${schedulePrompt}.erp.010801`).d('ERP来源计划数量')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010801']}
                  onChange={(val) => this.handleSetting(val)}
                  field="010801"
                />
                <SubMessage
                  content={intl.get(`${schedulePrompt}.010801subMsg`).d('以ERP数据发布计划')}
                />
              </>
            )}
            {!configHideArr.includes('purPlanningSource-2') && (
              <>
                <SubCheckBox
                  content={intl.get(`${schedulePrompt}.erp.010802`).d('ERP来源计划直接发布')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010802']}
                  disabled={!getFieldValue('010801')}
                  field="010802"
                />
                <SubMessage
                  content={intl
                    .get(`${schedulePrompt}.erp.010802subMsg`)
                    .d('来源数据是否直接发布至供应商确认')}
                />
              </>
            )}
          </Row>
        ),
      },
      {
        key: 2,
        href: 'purPlanConfirmationDimension',
        title: intl.get(`${schedulePrompt}.PlanConfirmationDimension`).d('计划确认维度'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl.get(`${schedulePrompt}.PlanConfirmationDimension`).d('计划确认维度')}
            </Col>
            {!configHideArr.includes('purPlanConfirmationDimension-1') && (
              <>
                <SubCheckBox
                  content={intl.get(`${schedulePrompt}.erp.010803`).d('以订单为维度确认计划')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010803']}
                  field="010803"
                />
                <SubMessage
                  content={intl
                    .get(`${schedulePrompt}.010803subMsg`)
                    .d('供应商以整单维度确认送货计划')}
                />
              </>
            )}
            {!configHideArr.includes('purPlanConfirmationDimension-2') && (
              <>
                <SubCheckBox
                  content={intl.get(`${schedulePrompt}.erp.010804`).d('供应商是否可维护确认数量')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010804']}
                  field="010804"
                  onChange={(val) => this.handleSettingConfrim(val)}
                />
                <SubMessage
                  content={intl
                    .get(`${schedulePrompt}.erp.010804subMsg`)
                    .d('供应商在确认计划时是否可维护确认数量')}
                />
              </>
            )}
            {!configHideArr.includes('purPlanConfirmationDimension-3') && (
              <>
                <SubCheckBox
                  content={intl
                    .get(`${schedulePrompt}.erp.010805`)
                    .d('采购方是否需确认供方确认数量')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010805']}
                  disabled={!getFieldValue('010804')}
                  field="010805"
                />
                <SubMessage
                  content={intl
                    .get(`${schedulePrompt}.010805subMsg`)
                    .d('供应商维护的“供方确认数量”是否需要采购确认')}
                />
              </>
            )}
            {!configHideArr.includes('purPlanConfirmationDimension-4') && (
              <>
                <SubCheckBox
                  content={intl.get(`${schedulePrompt}.erp.010806`).d('确认结果是否回传ERP')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010806']}
                  field="010806"
                />
                <SubMessage
                  content={intl
                    .get(`${schedulePrompt}.erp.010806subMsg`)
                    .d('供应商点击【确认】和【反馈】后是否直接回传ERP')}
                />
              </>
            )}
          </Row>
        ),
      },
      {
        key: 3,
        href: 'purPlanningResults',
        title: intl.get(`${schedulePrompt}.planningResults`).d('计划结果'),
        component: (
          <Row className="sub-item">
            <Col span={24}>{intl.get(`${schedulePrompt}.planningResults`).d('计划结果')}</Col>
            <SubCheckBox
              content={intl.get(`${schedulePrompt}.erp.010807`).d('需按计划创建送货单')}
              getFieldDecorator={getFieldDecorator}
              initialValue={settings['010807']}
              field="010807"
            />
            <SubMessage
              content={intl.get(`${schedulePrompt}.010807subMsg`).d('是否按计划创建送货单')}
            />
          </Row>
        ),
      },
    ];
    return (
      <Row className="tab-content" id="purSchedule">
        <Col span={3}>
          <span className="label-col">{intl.get(`${schedulePrompt}.schedule`).d('排程')}：</span>
        </Col>
        <Col span={21} className="sub-item-right">
          {configList.map((o) => {
            if (configHideArr.includes(o.href)) {
              return null;
            } else {
              return o.component;
            }
          })}
        </Col>
      </Row>
    );
  }
}
