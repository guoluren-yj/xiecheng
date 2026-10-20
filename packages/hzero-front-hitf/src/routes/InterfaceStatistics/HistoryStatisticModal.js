/**
 * 历史异常信息
 */
import React, { PureComponent } from 'react';
import { DataSet, Table, Modal, Output } from 'choerodon-ui/pro';
import getLang from '@/langs/interfaceStatisticsLang';
import { historyStatisticTableDS } from '@/stores/InterfaceStatistics/InterfaceStatisticsDS';

export default class HistoryStatisticModal extends PureComponent {
  constructor(props) {
    super(props);
    this.historyStatisticTableDS = new DataSet(
      historyStatisticTableDS({
        initialQueryParameter: props.queryParameter,
      })
    );
  }

  /**
   * 查看异常信息详情
   */
  openStatisticsDetailModal(detailMessage) {
    Modal.open({
      title: getLang('STATISTIC_DETAIL'),
      style: {
        width: 650,
      },
      children: <Output value={detailMessage} />,
      okText: getLang('CLOSE'),
      footer: (okBtn) => okBtn,
    });
  }

  get historyStatisticsColumns() {
    return [
      {
        name: 'statisticsDetail',
        renderer: ({ value }) => (
          <a onClick={() => this.openStatisticsDetailModal(value)}>{value}</a>
        ),
      },
      {
        name: 'statisticsTime',
        width: 150,
        align: 'center',
      },
    ];
  }

  render() {
    return (
      <Table
        dataSet={this.historyStatisticTableDS}
        columns={this.historyStatisticsColumns}
        queryFieldsLimit={2}
      />
    );
  }
}
