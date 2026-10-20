/*
 * ErpHeaderInfo - Erp采购申请头信息
 * @date: 2019-01-24
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Row, Col, Form } from 'hzero-ui';
import { isFunction } from 'lodash';
import { dateTimeRender } from 'utils/renderer'; // 日期时间格式化
// import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import styles from './Header.less';

// const titlePrompt = 'sprm.purchaseRequisitionApproval.view.title';
const commonPrompt = 'sprm.common.model.common';
// const { TextArea } = Input;
const FormItem = Form.Item;

// const { Panel } = Collapse;
/**
 * ErpHeaderInfo - Erp采购申请头信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
// @Form.create({ fieldNameProp: null })
export default class HeaderInfo extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) props.onRef(this);
    this.state = {
      // collapseKeys: ['headerInfo'],
    };
  }

  /**
   * 送货单明细折叠
   */
  // @Bind()
  // onCollapseChange(collapseKeys) {
  //   this.setState({
  //     collapseKeys,
  //   });
  // }

  render() {
    const { headerInfo = {}, form = {}, customizeForm } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    // const { collapseKeys = [] } = this.state;
    const {
      remark,
      displayPrNum,
      createByName,
      creationDate,
      prSourcePlatform,
      prSourcePlatformMeaning,
      sourceCodeMeaning,
    } = headerInfo;
    return customizeForm(
      {
        code: 'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.HEADER_ERP',
        dataSource: headerInfo,
        form: this.props.form,
      },
      <Form className={styles['detail-purchase-header']}>
        <Row className="items-row" gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${commonPrompt}.prNum`).d('采购申请编号')}>
              {getFieldDecorator('displayPrNum', {
                initialValue: displayPrNum,
              })(<span>{displayPrNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`entity.roles.creator`).d('创建人')}>
              {getFieldDecorator('createByName', {
                initialValue: createByName,
              })(<span>{createByName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${commonPrompt}.creationTime`).d('创建时间')}>
              {getFieldDecorator('creationDate', {
                initialValue: creationDate,
              })(<span>{dateTimeRender(creationDate)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row className="items-row" gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源')}>
              {getFieldDecorator('prSourcePlatform', {
                initialValue: prSourcePlatform,
              })(<span>{prSourcePlatformMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        {prSourcePlatform === 'ERP' && (
          <Row className="items-row" gutter={48}>
            <Col span={8}>
              <FormItem label={intl.get(`${commonPrompt}.externalSystemName`).d('外部系统名称')}>
                {getFieldDecorator('sourceCode')(<span>{sourceCodeMeaning}</span>)}
              </FormItem>
            </Col>
          </Row>
        )}
        <Row className="items-row" gutter={48}>
          <Col span={24}>
            <FormItem label={intl.get(`${commonPrompt}.applyExplain`).d('申请说明')}>
              {getFieldDecorator('remark', {
                initialValue: remark,
              })(<span>{remark}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
