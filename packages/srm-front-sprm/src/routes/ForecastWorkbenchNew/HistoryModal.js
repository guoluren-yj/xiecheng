import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { isFunction } from 'lodash';

export default class HistoryModal extends Component {
  renderTag({ record }) {
    const fcrtType = record.get('fcrtType');
    return fcrtType === 'fcstQuantity' ? (
      <span>
        {[
          'NEW',
          'UNRELEASED',
          'CHANGED',
          'FEEDBACK_IN_APPROVAL',
          'FEEDBACK_REJECTED',
          'FEEDBACK_PEND_APPROVAL',
        ].includes(record.get('fcstStatus')) ? (
          <Tag color="yellow" style={{ border: 'none' }}>
            {record.get('fcstStatusMeaning')}
          </Tag>
        ) : null}
        {['RELEASED', 'FEEDBACK', 'CLOSED', 'CANCELED'].includes(record.get('fcstStatus')) ? (
          <Tag color="green" style={{ border: 'none' }}>
            {record.get('fcstStatusMeaning')}
          </Tag>
        ) : null}
      </span>
    ) : (
      <span />
    );
  }

  render() {
    const { historyDs, columns, predictionDimensionCnf, cuxHistoryColsFc } = this.props;
    const historyCols = [
      {
        name: 'version',
        lock: 'right',
        renderer: ({ record: historyRecord, text }) =>
          historyRecord.get('fcrtType') === 'fcstQuantity' ? text : <span />,
      },
      {
        name: 'itemCode',
        lock: 'left',
        renderer: ({ record: historyRecord, text }) =>
          historyRecord.get('fcrtType') === 'fcstQuantity' ? text : <span />,
      },
      {
        name: 'fcstStatus',
        lock: 'left',
        renderer: this.renderTag,
      },
      {
        name: 'fcrtType',
        lock: 'left',
        renderer: ({ record: historyRecord }) => historyRecord.get('fcrtTypeMeaning'),
      },
      predictionDimensionCnf === 'QUANTITY'
        ? {
          name: 'sumQiantity',
          lock: 'left',
          renderer: ({ text, value, record: historyRecord }) => (
            <span
              style={{
                color:
                  !['feedbackQuantity', 'fcstQuantity'].includes(historyRecord.get('fcrtType')) &&
                    value < 0
                    ? 'red'
                    : '#333',
              }}
            >
              {text}
            </span>
          ),
        }
        : {
          name: 'sumAmount',
          lock: 'left',
          renderer: ({ text, value, record: historyRecord }) => (
            <span
              style={{
                color:
                  !['feedbackQuantity', 'fcstQuantity'].includes(historyRecord.get('fcrtType')) &&
                    value < 0
                    ? 'red'
                    : '#333',
              }}
            >
              {text}
            </span>
          ),
        },
    ].concat(columns, [
      {
        name: 'fcstNum',
        lock: 'left',
        renderer: ({ record: historyRecord, text }) =>
          historyRecord.get('fcrtType') === 'fcstQuantity' ? text : <span />,
      },
      {
        name: 'lineNum',
        lock: 'left',
        renderer: ({ record: historyRecord, text }) =>
          historyRecord.get('fcrtType') === 'fcstQuantity' ? text : <span />,
      },
    ]);
    const cuxClos = isFunction(cuxHistoryColsFc) ? cuxHistoryColsFc({ columns: historyCols, dataSet: historyDs }) : historyCols;
    return (
      <div>
        <Table
          dataSet={historyDs}
          columns={cuxClos}
          style={{ maxHeight: 'calc(100vh - 180px)' }}
        />
      </div>
    );
  }
}
