/**
 * 初步评审列表
 * @date: 2020-12-24
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { DataSet, Modal, Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { ExpertModalDS } from './ScoringElementDS';

function ExpertAssignModal(props) {
  const { expertModalDS } = props || {};
  const expertColumns = [
    {
      name: 'loginName',
      width: 150,
    },
    {
      name: 'expertName',
      width: 150,
    },
    {
      name: 'assignFlag',
      width: 120,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ];

  return <Table border dataSet={expertModalDS} columns={expertColumns} rowKey="evaluateExpertId" />;
}

export default class InitialReviewTable extends PureComponent {
  ExpertModalDS = new DataSet(ExpertModalDS());

  // table columns
  getColumns() {
    const columns = [
      {
        name: 'indicateCode',
        width: 200,
      },
      {
        name: 'indicateName',
        width: 200,
      },
      {
        name: 'indicateTypeMeaning',
        width: 200,
      },
      {
        name: 'passFlag',
        width: 200,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'indicateRemark',
        width: 250,
      },
      {
        name: 'expertDistribute',
        width: 150,
        renderer: ({ record = {} }) => {
          const evaluateIndicId = record.get('evaluateIndicId');
          if (!evaluateIndicId) {
            return;
          }
          return (
            <a onClick={() => this.openAssignExpertModal(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.view`).d('查看')}
            </a>
          );
        },
      },
    ];

    return columns;
  }

  initExpertAssignDS(record = {}) {
    const { organizationId } = this.props;

    const evaluateIndicId = record.get('evaluateIndicId');
    const team = record.get('team');
    const sourceHeaderId = record.get('sourceHeaderId');
    if (!evaluateIndicId) {
      return;
    }
    this.ExpertModalDS.setQueryParameter('commonProps', {
      organizationId,
      evaluateIndicId,
      evaluateIndicCategory: team,
      sourceHeaderId,
    });
  }

  // 分配专家modal
  @Bind()
  openAssignExpertModal(record = {}) {
    this.initExpertAssignDS(record);
    this.ExpertModalDS.query();

    const Props = {
      expertModalDS: this.ExpertModalDS,
    };
    const modalKey = Modal.key();

    Modal.open({
      destroyOnClose: true,
      key: modalKey,
      title: intl.get(`ssrc.inquiryHall.view.message.title.viewExpert`).d('查看专家'),
      children: <ExpertAssignModal {...Props} />,
      style: { width: '800px' },
      onOk: () => this.saveScoringAssignExpert(),
      onCancel: () => {},
    });
  }

  /**
   * 评分要素-专家分配
   *
   */
  @Bind()
  saveScoringAssignExpert() {
    Modal.destroyAll();
  }

  render() {
    const { ds, customizeTable, unitCodeSymbol } = this.props;
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: `SSRC.${unitCodeSymbol}_DETAIL.INITIAL_REVIEW_TABLE`,
          },
          <Table
            bordered
            dataSet={ds}
            rowKey="evaluateIndicId"
            columns={this.getColumns()}
            style={{ maxHeight: 450 }}
          />
        )}
      </React.Fragment>
    );
  }
}
