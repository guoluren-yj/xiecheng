/**
 * ContinueSupplyPanel - 临时围堵措施—保证持续供货
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Select, Row, Col, Card } from 'hzero-ui';
import intl from 'utils/intl';

import styles from './ContinueSupplyPanel.less';

const prefix = `sqam.common.model.8d`;

@Form.create({ fieldNameProp: null })
export default class ContinueSupplyPanel extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this, 'E');
  }

  render() {
    const {
      readOnly = true,
      continueSupplyData,
      zeroOneOption,
      icaActions,
      form: { getFieldDecorator },
    } = this.props;
    const {
      icaTotalChecked,
      icaTotalProblem,
      icaOnhandAffectedFlag,
      icaOnhandActionCode,
      icaOnhandRemark,
      icaWipAffectedFlag,
      icaWipActionCode,
      icaWipRemark,
      icaOnorderAffectedFlag,
      icaOnorderActionCode,
      icaOnorderRemark,
      icaCustomerAffectedFlag,
      icaCustomerActionCode,
      icaCustomerRemark,
    } = continueSupplyData;
    const formLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const icaActionsObj =
      (String(icaActions) &&
        icaActions
          .map(({ value, meaning }) => ({ [value]: meaning }))
          .reduce((sum, item) => ({ ...sum, ...item }))) ||
      {};
    const zeroOneOptionObj =
      (String(zeroOneOption) &&
        zeroOneOption
          .map(({ value, meaning }) => ({ [value]: meaning }))
          .reduce((sum, item) => ({ ...sum, ...item }))) ||
      {};
    const icaActionSelect = (
      <Select disabled={readOnly} allowClear>
        {icaActions.map((item) => (
          <Select.Option value={item.value} key={item.value}>
            {item.meaning}
          </Select.Option>
        ))}
      </Select>
    );
    const icaEffectFlagSelect = (
      <Select disabled={readOnly} allowClear>
        {zeroOneOption.map((item) => (
          <Select.Option key={item.value} value={Number(item.value)}>
            {item.meaning}
          </Select.Option>
        ))}
      </Select>
    );
    const NotReadOnlyFormComponent = (
      <Form>
        <Row>
          <Col span={8}>
            <Form.Item
              label={intl.get(`${prefix}.affectInventory`).d('库存零件是否受影响')}
              {...formLayout}
            >
              {getFieldDecorator('icaOnhandAffectedFlag', {
                initialValue: continueSupplyData.icaOnhandAffectedFlag,
              })(icaEffectFlagSelect)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.measureContent`).d('处理措施')} {...formLayout}>
              {getFieldDecorator('icaOnhandActionCode', {
                initialValue: continueSupplyData.icaOnhandActionCode,
              })(icaActionSelect)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.explain`).d('说明')} {...formLayout}>
              {getFieldDecorator('icaOnhandRemark', {
                initialValue: continueSupplyData.icaOnhandRemark,
              })(<Input disabled={readOnly} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              label={intl.get(`${prefix}.affectCreating`).d('在制零件是否受影响')}
              {...formLayout}
            >
              {getFieldDecorator('icaWipAffectedFlag', {
                initialValue: continueSupplyData.icaWipAffectedFlag,
              })(icaEffectFlagSelect)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.measureContent`).d('处理措施')} {...formLayout}>
              {getFieldDecorator('icaWipActionCode', {
                initialValue: continueSupplyData.icaWipActionCode,
              })(icaActionSelect)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.explain`).d('说明')} {...formLayout}>
              {getFieldDecorator('icaWipRemark', {
                initialValue: continueSupplyData.icaWipRemark,
              })(<Input disabled={readOnly} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              label={intl.get(`${prefix}.affectTransport`).d('在途零件是否受影响')}
              {...formLayout}
            >
              {getFieldDecorator('icaOnorderAffectedFlag', {
                initialValue: continueSupplyData.icaOnorderAffectedFlag,
              })(icaEffectFlagSelect)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.measureContent`).d('处理措施')} {...formLayout}>
              {getFieldDecorator('icaOnorderActionCode', {
                initialValue: continueSupplyData.icaOnorderActionCode,
              })(icaActionSelect)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.explain`).d('说明')} {...formLayout}>
              {getFieldDecorator('icaOnorderRemark', {
                initialValue: continueSupplyData.icaOnorderRemark,
              })(<Input disabled={readOnly} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              label={intl.get(`${prefix}.affectCustomer`).d('客户零件是否受影响')}
              {...formLayout}
            >
              {getFieldDecorator('icaCustomerAffectedFlag', {
                initialValue: continueSupplyData.icaCustomerAffectedFlag,
              })(icaEffectFlagSelect)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.measureContent`).d('处理措施')} {...formLayout}>
              {getFieldDecorator('icaCustomerActionCode', {
                initialValue: continueSupplyData.icaCustomerActionCode,
              })(icaActionSelect)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.explain`).d('说明')} {...formLayout}>
              {getFieldDecorator('icaCustomerRemark', {
                initialValue: continueSupplyData.icaCustomerRemark,
              })(<Input disabled={readOnly} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.totalCheck`).d('共复查多少零件')} {...formLayout}>
              {getFieldDecorator('icaTotalChecked', {
                initialValue: continueSupplyData.icaTotalChecked,
                rules: [
                  {
                    max: 80,
                    message: intl.get('hzero.common.validation.max', {
                      max: 80,
                    }),
                  },
                ],
              })(<Input disabled={readOnly} />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get(`${prefix}.totalIssue`).d('检查发现多少问题零件')}
              {...formLayout}
            >
              {getFieldDecorator('icaTotalProblem', {
                initialValue: continueSupplyData.icaTotalProblem,
                rules: [
                  {
                    max: 80,
                    message: intl.get('hzero.common.validation.max', {
                      max: 80,
                    }),
                  },
                ],
              })(<Input disabled={readOnly} />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
    const ReadOnlyComponent = (
      <div className={styles['card-wrapper']}>
        <p>
          <span className="first-label">{intl.get(`${prefix}.totalCheck`).d('共复查零件')}: </span>
          <span className="number">{icaTotalChecked || 0} </span>
          {intl.get(`${prefix}.one`).d('个')}
          <span className="second-label">
            {intl.get(`${prefix}.totalIssue`).d('检查发现多少问题零件')}:{' '}
          </span>
          <span className="number">{icaTotalProblem || 0} </span>
          {intl.get(`${prefix}.one`).d('个')}
        </p>
        <Row gutter={16}>
          <Col span={6}>
            <Card title={<span>{intl.get(`${prefix}.stockParts`).d('库存零件')}</span>}>
              <p>
                {intl.get(`${prefix}.whetherEffect`).d('是否受影响')}:{' '}
                {zeroOneOptionObj[icaOnhandAffectedFlag]}
              </p>
              <p>
                {intl.get(`${prefix}.measureContent`).d('处理措施')}:{' '}
                {icaActionsObj[icaOnhandActionCode]}
              </p>
              <p>
                {intl.get(`${prefix}.explain`).d('说明')}: {icaOnhandRemark}
              </p>
            </Card>
          </Col>
          <Col span={6}>
            <Card title={<span>{intl.get(`${prefix}.creatingComponent`).d('在制零件')}</span>}>
              <p>
                {intl.get(`${prefix}.whetherEffect`).d('是否受影响')}:{' '}
                {zeroOneOptionObj[icaWipAffectedFlag]}
              </p>
              <p>
                {intl.get(`${prefix}.measureContent`).d('处理措施')}:{' '}
                {icaActionsObj[icaWipActionCode]}
              </p>
              <p>
                {intl.get(`${prefix}.explain`).d('说明')}: {icaWipRemark}
              </p>
            </Card>
          </Col>
          <Col span={6}>
            <Card title={<span>{intl.get(`${prefix}.onWayComponent`).d('在途零件')}</span>}>
              <p>
                {intl.get(`${prefix}.whetherEffect`).d('是否受影响')}:{' '}
                {zeroOneOptionObj[icaOnorderAffectedFlag]}
              </p>
              <p>
                {intl.get(`${prefix}.measureContent`).d('处理措施')}:{' '}
                {icaActionsObj[icaOnorderActionCode]}
              </p>
              <p>
                {intl.get(`${prefix}.explain`).d('说明')}: {icaOnorderRemark}
              </p>
            </Card>
          </Col>
          <Col span={6}>
            <Card title={<span>{intl.get(`${prefix}.customerComponent`).d('客户零件')}</span>}>
              <p>
                {intl.get(`${prefix}.whetherEffect`).d('是否受影响')}:{' '}
                {zeroOneOptionObj[icaCustomerAffectedFlag]}
              </p>
              <p>
                {intl.get(`${prefix}.measureContent`).d('处理措施')}:{' '}
                {icaActionsObj[icaCustomerActionCode]}
              </p>
              <p>
                {intl.get(`${prefix}.explain`).d('说明')}: {icaCustomerRemark}
              </p>
            </Card>
          </Col>
        </Row>
      </div>
    );
    return readOnly ? ReadOnlyComponent : NotReadOnlyFormComponent;
  }
}
