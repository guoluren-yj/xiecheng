/**
 * * showQuotationFeedback - 报价响应表格
 * @date: 2021 12-30
 * @author: zhijian.li@goning-link
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Component } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { INQUIRY } from '@/utils/globalVariable';
import { noop } from 'lodash';

import { abandonRemarkRender } from '@/utils/renderer';
import { tableDS } from './ShowQuotationFeedbackTableDS';

export default class ShowQuotationFeedback extends Component {
  constructor(props) {
    super(props);
    const { rfxHeaderId, sourceKey = INQUIRY } = this.props;
    this.TableDs = new DataSet(
      tableDS({
        rfxHeaderId,
        customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_LIST.QUOTATION_FEEDBACK_TABLE`,
      })
    );
  }

  getColunms() {
    const columns = [
      {
        name: 'supplierCompanyNum',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'feedbackStatusMeaning',
        width: 100,
        renderer: ({ record, value }) =>
          abandonRemarkRender({
            val: (
              <span>
                {record.get('feedbackStatus') === 'PARTICIPATED' ? (
                  <Badge status="success" />
                ) : (
                  <Badge status="error" />
                )}
                {value}
              </span>
            ),
            record,
          }),
      },
      {
        name: 'quotationNumber',
        width: 100,
      },
      {
        name: 'prequalStatusMeaning',
        width: 120,
        renderer: ({ value, record }) => (
          <span>
            {record.get('prequalLineStatus') === 'NEW' ? (
              <Badge status="error" />
            ) : (
              <Badge status="success" />
            )}
            {value}
          </span>
        ),
      },
      {
        name: 'attachmentFlagMeaning',
        width: 100,
        renderer: ({ record, value }) => (
          <span>
            {record.get('attachmentFlag') ? <Badge status="success" /> : <Badge status="error" />}
            {value}
          </span>
        ),
      },
    ];
    return columns;
  }

  render() {
    const { customizeTable = noop, sourceKey } = this.props;
    return customizeTable(
      { code: `SSRC.${sourceKey}_HALL.NEW_LIST.QUOTATION_FEEDBACK_TABLE` },
      <Table dataSet={this.TableDs} columns={this.getColunms()} style={{maxHeight: 'calc(100vh - 160px)'}} />
    );
  }
}
