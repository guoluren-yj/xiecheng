// 批量维护FORM
import React, { Component } from 'react';
import { Icon } from 'choerodon-ui/pro';
import { Form, Drawer, Button, Row, Col, InputNumber, DatePicker } from 'hzero-ui';
import moment from 'moment';

import { EDIT_FORM_ITEM_LAYOUT_COL_2 } from 'utils/constants';
import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';
import classnames from 'classnames';

import './BatchMaintainFrom.less';

class BatchMaintainFrom extends Component {
  render() {
    const {
      form,
      custkey = '',
      quotationHeader = {},
      supplierSelectedRowKeys,
      batchMaintainItemLineVisible = false,
      cancelBatchMaintainItemLine = () => {},
      saveBatchMaintainItemLine = () => {},
      resetBatchMaintainItemLine = () => {},
      customizeForm,
      batchEditLineLockLoading,
      oldBiddingOfferFlag = false, // 老竞价标识
    } = this.props;

    if (!batchMaintainItemLineVisible) {
      return null;
    }

    return (
      <Drawer
        visible={batchMaintainItemLineVisible}
        title={intl.get('ssrc.supplierQuotation.view.button.batchMaintenance').d('批量维护')}
        width={460}
        placement="right"
        onClose={cancelBatchMaintainItemLine}
        maskClosable={false}
        destroyOnClose
        // style={{
        //   height: 'calc(100% - 60px)',
        //   overflow: 'auto',
        // }}
        // wrapClassName="batch-drawer-wrap"
      >
        <div
          style={{
            margin: '-20px -20px 10px',
            background: 'rgb(230, 242, 253)',
            padding: '10px 24px',
            fontSize: '13px',
            color: 'rgb(48, 145, 242)',
          }}
        >
          <Icon type="icon icon-help" style={{ padding: '0 8px 2px 0' }} />
          {!supplierSelectedRowKeys.length
            ? intl
                .get('ssrc.inquiryHall.model.inquiryHall.batchAllDataToEdit')
                .d('针对全部数据进行批量编辑')
            : intl
                .get('ssrc.inquiryHall.model.inquiryHall.batchCheckDataToEdit', {
                  length: supplierSelectedRowKeys.length,
                })
                .d(`已勾选{length}条数据进行批量编辑`)}
        </div>
        {customizeForm(
          {
            code: oldBiddingOfferFlag
              ? 'SSRC.SUPPLIER_QUOTATION_RFA.BATCH_MAINTAIN_MATERIAL'
              : `SSRC.${custkey}SUPPLIER_QUOTATION.BATCH_MAINTAIN_MATERIAL`,
            form,
            dataSource: quotationHeader,
          },
          <Form className={classnames('ssrc-quotatin-batch-matain-form')}>
            <Row>
              <Col span={24}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                  label={intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)')}
                >
                  {form.getFieldDecorator('currentDeliveryCycle')(
                    <InputNumber step={1} style={{ width: '100%' }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                  label={intl.get('ssrc.common.quotationValidDateFrom').d('报价有效期从')}
                >
                  {form.getFieldDecorator('currentExpiryDateFrom')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder=""
                      style={{ width: '100%' }}
                      // disabledDate={(currentDate) =>
                      //   (form.getFieldValue('currentExpiryDateTo') &&
                      //     moment(form.getFieldValue('currentExpiryDateTo')).isBefore(
                      //       currentDate,
                      //       'day'
                      //     )) ||
                      //   moment().isAfter(currentDate, 'day')
                      // }
                      disabledDate={(currentDate) => {
                        const toData = form.getFieldValue('currentExpiryDateTo');
                        if (toData) {
                          return moment(toData).isBefore(currentDate, 'day');
                        }
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                  label={intl.get('ssrc.common.quotationValidDateTo').d('报价有效期至')}
                >
                  {form.getFieldDecorator('currentExpiryDateTo')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder=""
                      style={{ width: '100%' }}
                      // disabledDate={(currentDate) =>
                      //   (form.getFieldValue('currentExpiryDateFrom') &&
                      //     moment(form.getFieldValue('currentExpiryDateFrom')).isAfter(
                      //       currentDate,
                      //       'day'
                      //     )) ||
                      //   moment().isAfter(currentDate, 'day')
                      // }
                      disabledDate={(currentDate) => {
                        const fromDate = form?.getFieldValue('currentExpiryDateFrom');
                        if (fromDate) {
                          return moment(fromDate).isAfter(currentDate, 'day');
                        }

                        return moment().isAfter(currentDate, 'day');
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                  label={intl.get('ssrc.common.currentPromisedDate').d('承诺交货期')}
                >
                  {form.getFieldDecorator('currentPromisedDate')(
                    <DatePicker
                      // defaultValue={moment(new Date())}
                      format={getDateFormat()}
                      placeholder=""
                      style={{ width: '100%' }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item>
                  {form.getFieldDecorator('quotationHeaderId', {
                    initialValue: quotationHeader.quotationHeaderId,
                  })(<div />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'left',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
          }}
        >
          <Button
            type="primary"
            loading={batchEditLineLockLoading}
            onClick={saveBatchMaintainItemLine}
            style={{ marginRight: '8px' }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button onClick={resetBatchMaintainItemLine} style={{ marginRight: '8px' }}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button onClick={cancelBatchMaintainItemLine}>
            {intl.get('hzero.common.view.button.cancel').d('取消')}
          </Button>
        </div>
      </Drawer>
    );
  }
}

export default BatchMaintainFrom;
