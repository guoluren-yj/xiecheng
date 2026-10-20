import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import classnames from 'classnames';

import { EDIT_FORM_ROW_LAYOUT, FORM_COL_2_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';

import DisplayFormItem from '../../components/DisplayFormItem';

const commonPrompt = 'sprm.common.model.common';
export default class HeadInfo extends PureComponent {
  render() {
    const { dataSource } = this.props;
    const {
      prSourcePlatform,
      lotNum,
      title,
      prNum,
      creationDate,
      amount,
      purReqAppliedName,
      contactTelNum,
      companyName,
      ouName,
      purchaseOrgName,
      purchaseAgentName,
      prSourcePlatformMeaning,
      paymentMethodName,
      freight,
      remark,
    } = dataSource;
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <DisplayFormItem label={intl.get(`${commonPrompt}.title`).d('标题')} value={title} />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.prNum`).d('采购申请编号')}
              value={prNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.creationTime`).d('创建时间')}
              value={creationDate}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.amount`).d('申请总额')}
              value={numberRender(amount, 2)}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`entity.roles.proposer`).d('申请人')}
              value={purReqAppliedName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.contactTelNum`).d('联系电话')}
              value={contactTelNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem label={intl.get(`entity.company.tag`).d('公司')} value={companyName} />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem label={intl.get(`entity.business.tag`).d('业务实体')} value={ouName} />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`entity.organization.class.purchase`).d('采购组织')}
              value={purchaseOrgName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员')}
              value={purchaseAgentName}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.prSourcePlatform`).d('数据来源')}
              value={prSourcePlatformMeaning}
            />
          </Col>
          {prSourcePlatform === 'E-COMMERCE' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <DisplayFormItem
                label={intl.get(`${commonPrompt}.lotNum`).d('批次号')}
                value={lotNum}
              />
            </Col>
          )}
          {prSourcePlatform === 'E-COMMERCE' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <DisplayFormItem
                label={intl.get(`${commonPrompt}.freight`).d('运费')}
                value={numberRender(freight, 2)}
              />
            </Col>
          )}
        </Row>
        {['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform) && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
            <Col {...FORM_COL_3_LAYOUT}>
              <DisplayFormItem
                label={intl.get(`${commonPrompt}.paymentMethodCode`).d('支付方式')}
                value={paymentMethodName}
              />
            </Col>
          </Row>
        )}
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item', 'read-half-row')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.applyExplain`).d('申请说明')}
              value={<pre>{remark}</pre>}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
