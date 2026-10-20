/**
 * ContractPartnerHeader - 采购协议头信息
 * @date: 2019-05-15
 * @author: zuoxiangyu <xaingyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Select, Modal, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import intl from 'utils/intl';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import { inviteCompany, fetchOpenResult } from '@/services/purchaseContractType';

import styles from './index.less';

const FormItem = Form.Item;
// const formItemLayout = {
//   labelCol: { span: 10 },
//   wrapperCol: { span: 14 },
// };

@Form.create({ fieldNameProp: null })
export default class ContractPartnerHeader extends Component {
  /**
   * 签署顺序按条件渲染
   */
  @Bind()
  renderLit(newSignOrder) {
    // 电签顺序：对方先签署SUPPLIER_FIRST||我方先签PURCHASE_FIRST
    return newSignOrder.map(item => (
      <Select.Option key={item.value} value={item.value}>
        {item.meaning}
      </Select.Option>
    ));
  }

  /**
   * 邀请公司
   */
  @Bind()
  handleInviteCompany() {
    Modal.confirm({
      content: intl
        .get(`spfm.configServer.view.contract.message.inviteCompany`)
        .d('是否向合作伙伴发出电子签章开通邀请？'),
      onOk() {
        return new Promise(resolve => {
          inviteCompany().then(res => {
            if (res && res.toString() === '[object Object]') {
              resolve();
            }
          });
        });
      },
      onCancel() { },
    });
  }

  @Bind()
  handleChange010605(value) {
    const {
      form: { setFieldsValue },
    } = this.props;
    const that = this;
    if (value === 'Y') {
      fetchOpenResult({
        applicationCode: 'AP_SIGN',
      }).then(res => {
        if (!res) {
          Modal.confirm({
            content: intl
              .get(`spfm.configServer.view.purchaseContract.message.goToOpen`)
              .d('您尚未开通电子签章服务，是否前往开通？'),
            onOk: () => {
              setFieldsValue({
                electricSignFlag: 'N',
              });
              that.props.history.push(`/spfm/amkt-appstore`);
            },
            onCancel: () => {
              setFieldsValue({
                electricSignFlag: 'N',
              });
            },
          });
        } else {
          this.handleInviteCompany();
        }
      });
    }
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      dataSource = {},
      enumMap,
    } = this.props;

    const { electricSignFlag, contractValidation, electricSignOrder } = dataSource;
    return (
      <Form className={styles.paddingLeft32}>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spcm.contractSign.model.common.electricSignFlag`).d('是否电签')}
            >
              {getFieldDecorator('electricSignFlag', {
                initialValue: electricSignFlag,
              })(
                <Select
                  onChange={value => {
                    this.handleChange010605(value);
                  }}
                >
                  {this.renderLit(enumMap?.electricSignFlagList || [])}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {getFieldValue('electricSignFlag') === 'Y' && (
              <FormItem
                label={intl
                  .get(`spfm.configServer.view.purchaseContract.message.010606`)
                  .d('签署顺序')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('electricSignOrder', {
                  initialValue: electricSignOrder || '',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.configServer.view.purchaseContract.message.010606`)
                          .d('签署顺序'),
                      }),
                    },
                  ],
                })(
                  <Select showSearch allowClear>
                    {this.renderLit(enumMap?.signOrder || [])}
                  </Select>
                )}
              </FormItem>
            )}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {getFieldValue('electricSignFlag') === 'Y' && (
              <FormItem
                label={intl
                  .get(`spfm.configServer.view.purchaseContract.message.010617`)
                  .d('签署阶段')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('contractValidation', {
                  initialValue: contractValidation || '',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.configServer.view.purchaseContract.message.010617`)
                          .d('签署阶段'),
                      }),
                    },
                  ],
                })(
                  <Select showSearch allowClear>
                    {this.renderLit(enumMap?.signStage || [])}
                  </Select>
                )}
              </FormItem>
            )}
          </Col>
        </Row>
      </Form>
    );
  }
}
