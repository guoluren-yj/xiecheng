// 标的批量维护
import React, { Component } from 'react';
import { Form, DatePicker, Lov, Icon } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';

export default class BatchMaintainItemForm extends Component {
  render() {
    const { customizeForm, BatchMaintainItemDS, pcSubjectDs } = this.props;

    return (
      <div>
        <div
          style={{
            margin: '-20px -20px 20px',
            background: 'rgb(230, 242, 253)',
            padding: '10px 24px',
            fontSize: '13px',
            color: 'rgb(48, 145, 242)',
          }}
        >
          <Icon type="icon icon-help" />
          &nbsp;&nbsp;
          {isEmpty(pcSubjectDs.selected)
            ? intl
                .get('ssrc.inquiryHall.model.inquiryHall.batchCurrentPageDataToEdit')
                .d('针对当前页全部数据进行批量编辑')
            : intl
                .get('ssrc.inquiryHall.model.inquiryHall.batchCheckDataToEdit', {
                  length: pcSubjectDs.selected.length,
                })
                .d(`已勾选${pcSubjectDs.selected.length}条数据进行批量编辑`)}
        </div>
        {customizeForm(
          {
            code: 'SPCM.WORKSPACE_DETAIL.BATCH.MAINTENANCE',
            dataSet: BatchMaintainItemDS,
          },
          <Form dataSet={BatchMaintainItemDS} columns={1} labelLayout="float">
            <Lov name="taxIdLov" />
            <Lov name="currencyCodeLov" />
            <Lov name="purchaseCurrencyCodeLov" />
            <DatePicker name="priceStartDate" />
            <DatePicker name="priceEndDate" />
            <DatePicker name="deliverDate" />
            <Lov
              name="projectTaskId"
              tableProps={{
                mode: 'tree',
                selectionMode: 'rowbox',
              }}
            />
          </Form>
        )}
      </div>
    );
  }
}
