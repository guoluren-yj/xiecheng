/*
 * Common - 配置中心-采购方-供应商管理
 * @date: 2018/09/11 14:51:47
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Row, Col, Checkbox, Form } from 'hzero-ui';
import intl from 'utils/intl';

/**
 * 配置中心-采购方-供应商管理
 * @extends {Component} - React.Component
 * @reactProps {Object} companyInfo - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @return React.element    onChange={onChange}
 */
@Form.create({ fieldNameProp: null })
export default class Common extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  render() {
    return (
      <Row className="tab-content">
        <Col span={3}>
          <span className="label-col">
            {intl.get('spfm.configServer.view.message.homeContent').d('首页内容：')}
          </span>
        </Col>
        <Col span={21} className="sub-item-right">
          <Row>
            <Col span={24}>
              {intl
                .get('spfm.configServer.view.message.homeDefaulteChecked')
                .d('首页展示（默认全部勾选）')}
            </Col>
            <Col span={24} className="sub-item-fields">
              <Checkbox>
                {intl.get('spfm.configServer.view.message.companyState').d('公司动态')}
              </Checkbox>
            </Col>
            <Col span={24} className="sub-item-fields">
              <Checkbox>
                {intl.get('spfm.configServer.view.message.buyState').d('求购动态')}
              </Checkbox>
            </Col>
            <Col span={24} className="sub-item-fields">
              <Checkbox>
                {intl.get('spfm.configServer.view.message.comFriendCircle').d('商友圈')}
              </Checkbox>
            </Col>
            <Col span={24} className="sub-item-fields">
              <Checkbox>
                {intl.get('spfm.configServer.view.message.industryInformation').d('行业资讯')}
              </Checkbox>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}
