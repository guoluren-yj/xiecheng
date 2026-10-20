/**
 * index - 接口平台-应用配置
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { DataSet, Table, Modal, Output, TextField } from 'choerodon-ui/pro';
import { Content, Header } from 'hzero-front/lib/components/Page';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { operatorRender, TagRender } from 'hzero-front/lib/utils/renderer';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import getLang from '@/langs/interfaceStatisticsLang';
import { tableDS } from '@/stores/InterfaceStatistics/InterfaceStatisticsDS';
import { SOURCE_TYPE_TAG } from '@/constants/constants';
import HistoryStatisticModal from './HistoryStatisticModal';

@formatterCollections({ code: ['hzero.common', 'hitf.interfaceStatistics'] })
export default class InterfaceStatistics extends PureComponent {
  constructor(props) {
    super(props);
    this.tableDS = new DataSet(tableDS());
  }

  /**
   * 查看异常信息详情
   */
  openStatisticsDetailModal(detailMessage) {
    Modal.open({
      title: getLang('LATEST_STATISTIC_DETAIL'),
      style: {
        width: 650,
      },
      children: <Output value={detailMessage} />,
      okText: getLang('CLOSE'),
      footer: (okBtn) => okBtn,
    });
  }

  /**
   * 打开历史异常信息弹窗
   */
  openHistoryStatisticModal(record) {
    const { interfaceId } = record.toData();
    const modalProps = {
      queryParameter: {
        interfaceId,
      },
    };
    Modal.open({
      title: getLang('HISTORY_STATISTIC'),
      style: { width: 800 },
      okText: getLang('CLOSE'),
      footer: (okBtn) => okBtn,
      children: <HistoryStatisticModal {...modalProps} />,
    });
  }

  get interfaceStatisticsColumns() {
    return [
      !isTenantRoleLevel() && {
        name: 'tenantName',
        width: 150,
      },
      {
        name: 'interfaceCode',
        width: 220,
      },
      {
        name: 'serverCode',
        width: 180,
      },
      {
        name: 'namespace',
        width: 100,
      },
      isTenantRoleLevel() && {
        name: 'sourceType',
        width: 90,
        align: 'center',
        renderer: ({ value, text }) => TagRender(value, SOURCE_TYPE_TAG, text),
      },
      {
        name: 'count',
        width: 90,
      },
      {
        name: 'statisticsDetail',
        renderer: ({ value }) => (
          <a onClick={() => this.openStatisticsDetailModal(value)}>{value}</a>
        ),
      },
      {
        name: 'latestTime',
        width: 150,
        align: 'center',
      },
      {
        header: getLang('OPERATOR'),
        width: 130,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            {
              ele: (
                <ButtonPermission
                  type="text"
                  onClick={() => this.openHistoryStatisticModal(record)}
                >
                  {getLang('VIEW_MORE')}
                </ButtonPermission>
              ),
              key: 'viewMore',
              len: 8,
              title: getLang('VIEW_MORE'),
            },
          ];
          return operatorRender(actions, record);
        },
      },
    ];
  }

  render() {
    return (
      <>
        <Header title={getLang('HEADER')} />
        <Content>
          <Table
            dataSet={this.tableDS}
            columns={this.interfaceStatisticsColumns}
            queryFields={{
              serverCode: <TextField restrict="a-zA-Z0-9-_./" />,
              interfaceCode: <TextField restrict="a-zA-Z0-9-_./" />,
            }}
          />
        </Content>
      </>
    );
  }
}
