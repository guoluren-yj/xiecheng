/**
 * ImportHistory - 导入历史
 * @date: 2019-12-2
 * @author: hulingfangzi <lingfangzi.hu01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { TagRender } from 'hzero-front/lib/utils/renderer';
import { tableDS } from '@/stores/ImportHistory/ImportHistoryDS';
import getLang from '@/langs/importHistoryLang';
import { IMPORT_STATUS_TAGS } from '@/constants/constants';

@formatterCollections({ code: ['hzero.common', 'hitf.importHistory'] })
export default class ImportHistory extends PureComponent {
  constructor(props) {
    super(props);
    this.tableDS = new DataSet({
      ...tableDS(),
    });
  }

  /**
   * 查看导入消息
   * @param {string} value - 导入消息
   */
  handleViewMessage(value) {
    Modal.open({
      title: getLang('IMPORT_MESSAGE'),
      closable: true,
      okText: getLang('CLOSE'),
      footer: (okBtn) => okBtn,
      children: <div style={{ maxWidth: 472, maxHeight: 400, overflowY: 'scroll' }}>{value}</div>,
    });
  }

  get columns() {
    return [
      !isTenantRoleLevel() && {
        name: 'tenantName',
        width: 180,
      },
      {
        name: 'requestNum',
        width: 250,
      },
      {
        name: 'importUser',
        width: 150,
      },
      {
        name: 'importUrl',
        width: 450,
      },
      {
        name: 'importMessage',
        renderer: ({ value }) => <a onClick={() => this.handleViewMessage(value)}>{value}</a>,
      },
      {
        name: 'importStatus',
        width: 100,
        align: 'center',
        renderer: ({ value, record }) =>
          TagRender(value, IMPORT_STATUS_TAGS, record.get('importStatusMeaning')),
      },
    ];
  }

  render() {
    return (
      <>
        <Header title={getLang('HEADER')} />
        <Content>
          <Table dataSet={this.tableDS} columns={this.columns} />
        </Content>
      </>
    );
  }
}
