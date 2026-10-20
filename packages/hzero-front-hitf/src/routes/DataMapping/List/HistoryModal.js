/*
 * @Author: your name
 * @Date: 2020-10-09 14:47:56
 * @LastEditTime: 2020-10-12 14:05:35
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \hzero-front\packages\hzero-front-hitf\src\routes\DataMapping\List\HistoryModal.js
 */
import React, { PureComponent } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { operatorRender } from 'hzero-front/lib/utils/renderer';
import { historyTableDS } from '@/stores/DataMapping/DataMappingDS';
import getLang from '@/langs/dataMappingLang';

export default class HistoryModal extends PureComponent {
  constructor(props) {
    super(props);
    this.historyTableDS = new DataSet(historyTableDS());
  }

  async componentDidMount() {
    const { castHeaderId } = this.props;
    this.historyTableDS.setQueryParameter('castHeaderId', castHeaderId);
    await this.historyTableDS.query();
  }

  get historyColumns() {
    const { onGotoDetail } = this.props;
    return [
      {
        name: 'castCode',
      },
      {
        name: 'castName',
      },
      {
        name: 'dataType',
        width: 130,
      },
      {
        name: 'versionDesc',
        width: 80,
      },
      {
        header: getLang('OPERATOR'),
        width: 80,
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            {
              ele: (
                <a onClick={() => onGotoDetail(record.get('castHeaderId'), record.get('version'))}>
                  {getLang('VIEW')}
                </a>
              ),
              key: 'view',
              len: 2,
              title: getLang('VIEW'),
            },
          ];
          return operatorRender(actions, record);
        },
      },
    ];
  }

  render() {
    return (
      <Table dataSet={this.historyTableDS} columns={this.historyColumns} style={{ width: 850 }} />
    );
  }
}
