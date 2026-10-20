/*
 * PurchaseRequestHeader - 采购申请头页面
 * @date: 2019-12-4
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { dateRender } from 'utils/renderer';

import intl from 'utils/intl';
import classNames from 'classnames';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { thousandBitSeparator } from '@/routes/utils.js';

const promptCode = 'sqam.incomingInspectionQuery';

/**
 * PurchaseRequestHeader - 采购申请头页面
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@withCustomize({
  unitCode: ['SQAM.INCOMING_INSPECTION_QUERY_DETAIL.DATA'],
})
export default class PurchaseRequestHeader extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { form, detailHeader = {}, customizeForm } = this.props;
    const {
      startDate,
      endDate,
      responsiblePerson,
      itemName,
      sampleSize,
      batchQuantity,
      actualQuantity,
      destroyQuantity,
      badQuantity,
      itemCode,
      categoryName,
    } = detailHeader;
    const { getFieldDecorator } = form;
    return customizeForm(
      {
        code: 'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.DATA',
        form,
        dataSource: detailHeader,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.startDate`)
                .d('检验开始日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('startDate')(<span>{dateRender(startDate)}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.endDate`)
                .d('检验结束日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('endDate')(<span>{dateRender(endDate)}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.8d.chargeName`).d('责任人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('responsiblePerson')(<span>{responsiblePerson}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.item.code`).d('物料编码')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('itemCode')(<span>{itemCode}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.item.name`).d('物料名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('itemName')(<span>{itemName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.model.incomingInspectionQuery.itemCatalog`)
                .d('物料分类')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('categoryName')(<span>{categoryName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.batchQuantity`)
                .d('检验批数量')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('batchQuantity')(
                <span>{thousandBitSeparator(Number(batchQuantity))}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.actualQuantity`)
                .d('实际批量')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('actualQuantity')(
                <span>{thousandBitSeparator(Number(actualQuantity))}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.sampleSize`)
                .d('采样大小')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sampleSize')(
                <span>{thousandBitSeparator(Number(sampleSize))}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'read-row')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.message.model.incomingInspectionQuery.destroyQuantity`)
                .d('检验破坏数量')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('destroyQuantity')(
                <span>{thousandBitSeparator(Number(destroyQuantity))}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.model.incomingInspectionQuery.badQuantity`)
                .d('不良品数量')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('badQuantity')(
                <span>{thousandBitSeparator(Number(badQuantity))}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
