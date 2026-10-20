/**
 * SourceManage - 配置中心-采购方-集团管理
 * @date: 2020-2-28
 * @author: shuo.lv@hand-china.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Row, Col, Form, Checkbox } from 'hzero-ui';
import { withRouter } from 'dva/router';
import intl from 'utils/intl';

import SubMessage from '../../components/SubMessage';

@withRouter
@Form.create({ fieldNameProp: null })
export default class GroupManagement extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  render() {
    const {
      form: { getFieldDecorator },
      configHideArr = [],
      settings,
    } = this.props;
    const configList = [
      {
        key: 1,
        href: 'purStaff',
        title: intl.get(`spfm.configServer.view.groupManagement.message.staff`).d('员工'),
        component: (
          <Row>
            <Col span={24}>
              {intl.get(`spfm.configServer.view.groupManagement.message.staff`).d('员工')}
            </Col>
            <Col span={24} className="sub-item-fields">
              {getFieldDecorator('000104', {
                initialValue: settings['000104'],
              })(
                <Checkbox checkedValue={1} unCheckedValue={0}>
                  {intl
                    .get(`spfm.configServer.view.groupManagement.message.000104`)
                    .d('ERP员工导入自动生成子账户')}
                </Checkbox>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.groupManagement.message.000104subMsg`)
                .d('勾选启用，erp员工导入时，自动生成子账户')}
            />
          </Row>
        ),
      },
      {
        key: 2,
        href: 'purItem',
        title: intl.get(`spfm.configServer.view.groupManagement.message.item`).d('物料主数据'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl.get(`spfm.configServer.view.groupManagement.message.item`).d('物料主数据')}
            </Col>
            <Col span={24} className="sub-item-fields">
              {getFieldDecorator('000112', {
                initialValue: settings['000112'],
              })(
                <Checkbox checkedValue={1} unCheckedValue={0}>
                  {intl
                    .get(`spfm.configServer.view.groupManagement.message.000112`)
                    .d('启用单位控制')}
                </Checkbox>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.groupManagement.message.000112subMsg`)
                .d('勾选启用单位控制，则控制所有界面单位的使用')}
            />
          </Row>
        ),
      },
      {
        key: 3,
        href: 'purPurchaser',
        title: intl.get(`spfm.configServer.view.groupManagement.message.purchaser`).d('发现采购商'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl.get(`spfm.configServer.view.groupManagement.message.purchaser`).d('发现采购商')}
            </Col>
            <Col span={24} className="sub-item-fields">
              {getFieldDecorator('000113', {
                initialValue: settings['000113'],
              })(
                <Checkbox checkedValue={1} unCheckedValue={0}>
                  {intl
                    .get(`spfm.configServer.view.groupManagement.message.000113`)
                    .d('启用供应商分类')}
                </Checkbox>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.groupManagement.message.000113subMsg`)
                .d('勾选启用供应商分类，则控制供应商分类的使用')}
            />
          </Row>
        ),
      },
      {
        key: 4,
        href: 'purCustomerService',
        title: intl
          .get(`spfm.configServer.view.groupManagement.message.customerService`)
          .d('客服配置'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl
                .get(`spfm.configServer.view.groupManagement.message.customerService`)
                .d('客服配置')}
            </Col>
            <Col span={24} className="sub-item-fields">
              {getFieldDecorator('000114', {
                initialValue: !!settings['000114'] ? 1 : 0,
              })(
                <Checkbox checkedValue={0} unCheckedValue={1}>
                  {intl
                    .get(`spfm.configServer.view.groupManagement.message.000114`)
                    .d('启用客服配置')}
                </Checkbox>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.groupManagement.message.000114subMsg`)
                .d('启用该配置后，SRM、商城、移动端可使用客服。')}
            />
          </Row>
        ),
      },
    ];
    return (
      <Row className="tab-content" id="purGroupManagement">
        <Col span={3}>
          <span className="label-col">
            {intl.get(`spfm.configServer.view.groupManagement.message.title`).d('集团管理')}:
          </span>
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
