/**
 * 初步评审列表 - 符合性检查
 * @date: 2020-12-24
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { DataSet, Modal, Button, Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { ExpertModalDS } from './InitialReviewDS';

import { saveEvaluateIndicAssign } from '@/services/bidHallService';

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
      editor: true,
    },
  ];

  return <Table border dataSet={expertModalDS} columns={expertColumns} rowKey="evaluateExpertId" />;
}

export default class InitialReviewTable extends PureComponent {
  ExpertModalDS = new DataSet(ExpertModalDS());

  // table columns
  getColumns() {
    const { sourceHeaderId } = this.props;

    const columns = [
      {
        name: 'indicateLov',
        width: 150,
        editor: true,
      },
      {
        name: 'indicateName',
        width: 200,
        editor: true,
      },
      {
        name: 'indicateType',
        width: 200,
        editor: true,
      },
      {
        name: 'passFlag',
        width: 200,
        editor: true,
      },
      {
        name: 'expertDistribute',
        width: 150,
        renderer: ({ record = {} }) => {
          const evaluateIndicId = record.get('evaluateIndicId');
          if (!evaluateIndicId || sourceHeaderId === 'null' || !sourceHeaderId) {
            return;
          }
          return (
            <a onClick={() => this.openAssignExpertModal(record)}>
              {intl.get(`ssrc.quoController.view.message.button.distribution`).d('分配')}
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
      title: intl.get(`ssrc.quoController.model.quoController.assignExpert`).d('分配专家'),
      children: <ExpertAssignModal {...Props} />,
      style: { width: '800px' },
      onOk: () => this.saveScoringAssignExpert(),
      onCancel: () => {},
    });
  }

  /**
   * 评分要素-专家分配 保存
   *
   * @memberof Update
   */
  @Bind()
  async saveScoringAssignExpert() {
    const { organizationId } = this.props;
    const newParams = this.ExpertModalDS.toData();
    await saveEvaluateIndicAssign({
      newParams,
      organizationId,
    }).then((res) => {
      if (res) {
        notification.success();
      }
    });
    Modal.destroyAll();
  }

  render() {
    const {
      ds,
      sourceHeaderId,
      onCreateReviewLine,
      onDeleteReviewLine,
      onSaveReviewLine,
      saveReviewLoading = false,
    } = this.props;
    const buttons = [
      <Button icon="playlist_add" onClick={() => onCreateReviewLine()}>
        {intl.get('hzero.common.button.create').d('新建')}
      </Button>,
      ['delete', { onClick: () => onDeleteReviewLine(ds) }],
      <Button
        icon="save"
        onClick={() => onSaveReviewLine()}
        disabled={!sourceHeaderId}
        loading={saveReviewLoading}
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
    ];

    return (
      <React.Fragment>
        <Table
          bordered
          buttons={buttons}
          dataSet={ds}
          rowKey="evaluateIndicId"
          columns={this.getColumns()}
        />
      </React.Fragment>
    );
  }
}
