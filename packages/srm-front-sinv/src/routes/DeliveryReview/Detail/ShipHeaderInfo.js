/*
 * HeaderInfo - 收货信息
 * @date: 2020-12-02
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Row, Col, Collapse, Icon, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import intl from 'utils/intl';

import {
  DETAIL_DEFAULT_CLASSNAME,
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';
// import DisplayFormItem from '../../components/DisplayFormItem';
import styles from './index.less';

const FormItem = Form.Item;

const { Panel } = Collapse;
@Form.create({ fieldNameProp: null })
export default class HeaderInfo extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  state = {
    collapseKeys: ['headerInfos'],
  };

  /**
   * 送货单明细折叠
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  render() {
    const { detailHeaderInfo = {}, form, customizeForm } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    const { collapseKeys = [] } = this.state;
    const {
      companyName,
      organizationName,
      contactInfo,
      shipToLocationAddress,
      actualReceiverName,
      // carriersName,
      // carriersCode,
      // processingPlantAddress,
    } = detailHeaderInfo;
    return (
      <Form className={classnames(DETAIL_DEFAULT_CLASSNAME, styles['detail-form'])}>
        <Collapse
          className="form-collapse"
          defaultActiveKey={['headerInfos']}
          onChange={this.onCollapseChange}
        >
          <Panel
            showArrow={false}
            header={
              <Fragment>
                <h3>
                  {intl
                    .get(`sinv.common.view.message.title.orderHeaderDispatchedInfo`)
                    .d('收货信息')}
                </h3>
                <a className="expand-button">
                  {collapseKeys.includes('headerInfos')
                    ? intl.get('hzero.common.button.up').d('收起')
                    : intl.get('hzero.common.button.expand').d('展开')}
                  {<Icon type={collapseKeys.includes('headerInfos') ? 'up' : 'down'} />}
                </a>
              </Fragment>
            }
            key="headerInfos"
          >
            {customizeForm(
              {
                form,
                dataSource: detailHeaderInfo,
                code: 'SINV.DELIVERY_APPROVED_DETAIL.HEADERSHIP',
              },
              <Form>
                <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`entity.customer.tag`).d('客户')}
                    >
                      {getFieldDecorator('companyName', {
                        initiaValue: companyName,
                      })(<span>{companyName}</span>)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.organizationName`).d('收货组织')}
                    >
                      {getFieldDecorator('organizationName', {
                        initiaValue: organizationName,
                      })(<span>{organizationName}</span>)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl
                        .get(`sinv.common.model.common.shipToLocationAddress`)
                        .d('收货地点')}
                    >
                      {getFieldDecorator('shipToLocationAddress', {
                        initiaValue: shipToLocationAddress,
                      })(<span>{shipToLocationAddress}</span>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方')}
                    >
                      {getFieldDecorator('actualReceiverName', {
                        initiaValue: actualReceiverName,
                      })(<span>{actualReceiverName}</span>)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.contactor`).d('联系人')}
                    >
                      {getFieldDecorator('contactInfo', { initiaValue: contactInfo })(
                        <span>{contactInfo}</span>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            )}
          </Panel>
        </Collapse>
      </Form>
    );
  }
}
