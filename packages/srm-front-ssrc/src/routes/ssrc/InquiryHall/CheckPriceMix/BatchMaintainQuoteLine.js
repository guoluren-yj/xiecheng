import React, { PureComponent } from 'react';
import { Form, Modal, Input, Row, Col, Button, InputNumber } from 'hzero-ui';
import Switch from 'components/Switch';

import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT } from 'utils/constants';

import styles from './index.less';
import { INQUIRY } from '@/utils/globalVariable';

@Form.create({ fieldNameProp: null })
export default class BatchMaintainQuoteLine extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);

    this.state = {};
  }

  render() {
    const {
      form,
      sourceKey = INQUIRY,
      customizeForm,
      batchMaintainQuotateLineLoading,
      batchMaintainQuoteLineVisible,
      cancelBatchMaintainItemLine,
      saveBatchMaintainItemLine,
      resetBatchMaintainItemLine,
      checkWay = 'ratio',
    } = this.props;

    return (
      <Modal
        closable
        onCancel={cancelBatchMaintainItemLine}
        visible={batchMaintainQuoteLineVisible}
        title={intl.get('ssrc.inquiryHall.model.inquiryHall.batchMaintenance').d('批量维护')}
        footer={
          <div className={styles['item-list-search']}>
            <Button
              type="primary"
              onClick={saveBatchMaintainItemLine}
              loading={batchMaintainQuotateLineLoading}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button onClick={resetBatchMaintainItemLine}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button onClick={cancelBatchMaintainItemLine}>
              {intl.get('hzero.common.view.button.cancel').d('取消')}
            </Button>
          </div>
        }
      >
        {customizeForm(
          { code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.QUOTATION_BATCH_MAINTAIN_FROM`, form },
          <Form className={styles['batchEditQuotationLine-label']}>
            <Row gutter={48} className="writable-row">
              {checkWay === 'ratio' ? (
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                    label={intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`)
                      .d('分配比例%')}
                  >
                    {form.getFieldDecorator('allottedRatio')(
                      <InputNumber min={0} style={{ width: '100%' }} />
                    )}
                  </Form.Item>
                </Col>
              ) : null}
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由')}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 16 }}
                >
                  {form.getFieldDecorator('suggestedRemark')(<Input style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.suggest`).d('选用')}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 16 }}
                >
                  {form.getFieldDecorator('suggestedFlag', { initialValue: 1 })(<Switch />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    );
  }
}
