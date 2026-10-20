/**
 * 符合性检查
 */
import React, { Component } from 'react';
import { DataSet, Modal, Button, Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import { assignExpertScoreDetailOfQuotationController } from '@/services/inquiryHallNewService';

import { ExpertModalDS } from './ScoringElementTableDS';
import { historyRenderPure } from './utils';

function ExpertAssignModal(props) {
  const { expertModalDS, newOpenedBidFlag } = props || {};
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

  return (
    <Table
      border
      dataSet={expertModalDS}
      columns={expertColumns}
      rowKey="indicAssginAdjustId"
      editMode={!newOpenedBidFlag ? 'cell' : 'inline'}
      selectionMode={!newOpenedBidFlag ? 'rowbox' : 'none'}
    />
  );
}

@observer
export default class InitialReviewTable extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  ExpertModalDS = new DataSet(ExpertModalDS(this.props.custKey, 'initialReview'));

  // table columns
  getColumns() {
    const { sourceHeaderId, newOpenedBidFlag } = this.props;

    const columns = [
      {
        name: 'indicateLov',
        width: 150,
        editor: true,
        renderer: (props) => historyRenderPure(props, 'sourceEvaluateIndic', 'indicateCode'),
      },
      {
        name: 'indicateName',
        width: 200,
        editor: true,
        renderer: (props) => historyRenderPure(props, 'sourceEvaluateIndic', 'indicateName'),
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
        renderer: (props) => historyRenderPure(props, 'sourceEvaluateIndic', 'passFlag'),
      },
      {
        name: 'indicateRemark',
        width: 250,
        editor: true,
        renderer: (props) => historyRenderPure(props, 'sourceEvaluateIndic', 'indicateRemark'),
      },
      {
        name: 'expertDistribute',
        width: 150,
        renderer: ({ record = {} }) => {
          const evaluateIndicAdjustId = record.get('evaluateIndicAdjustId');
          if (!evaluateIndicAdjustId || sourceHeaderId === 'null' || !sourceHeaderId) {
            return;
          }
          return (
            <a onClick={() => this.openAssignExpertModal(record)}>
              {newOpenedBidFlag
                ? intl.get(`ssrc.inquiryHall.view.message.button.view`).d('查看')
                : intl.get(`ssrc.inquiryHall.view.message.button.distribution`).d('分配')}
            </a>
          );
        },
      },
    ];

    return columns;
  }

  initExpertAssignDS(record = {}) {
    const { organizationId, header = {} } = this.props;
    const { adjustRecordId = null, rfxHeaderAdjustId: sourceHeaderAdjustId = null } = header;

    const evaluateIndicAdjustId = record.get('evaluateIndicAdjustId');
    const team = record.get('team');
    const sourceHeaderId = record.get('sourceHeaderId');
    if (!evaluateIndicAdjustId) {
      return;
    }
    this.ExpertModalDS.setQueryParameter('commonData', {
      organizationId,
      evaluateIndicAdjustId,
      evaluateIndicCategory: team,
      sourceHeaderId,
      adjustRecordId,
      sourceHeaderAdjustId,
    });
  }

  // 分配专家modal
  @Bind()
  openAssignExpertModal(record = {}) {
    const { newOpenedBidFlag } = this.props;
    this.initExpertAssignDS(record);
    this.ExpertModalDS.query();

    const Props = {
      newOpenedBidFlag,
      expertModalDS: this.ExpertModalDS,
    };
    const modalKey = Modal.key();

    Modal.open({
      destroyOnClose: true,
      key: modalKey,
      drawer: true,
      title: newOpenedBidFlag
        ? intl.get(`ssrc.inquiryHall.view.message.title.viewExpert`).d('查看专家')
        : intl.get(`ssrc.inquiryHall.model.inquiryHall.assignExpert`).d('分配专家'),
      children: <ExpertAssignModal {...Props} />,
      style: { width: '800px' },
      onOk: () => (newOpenedBidFlag ? true : this.saveScoringAssignExpert()),
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
    const { organizationId, ds } = this.props;
    let data = this.ExpertModalDS.toData();

    data = data.map((item) => {
      return {
        ...item,
      };
    });

    await assignExpertScoreDetailOfQuotationController({
      data,
      organizationId,
    }).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        notification.success();
        ds.query();
      }
    });
  }

  render() {
    const {
      remote,
      ds,
      sourceHeaderId,
      newOpenedBidFlag,
      onCreateReviewLine,
      onDeleteReviewLine,
      onSaveReviewLine,
      isInitialLoading = false,
      customizeTable = () => {},
      custKey,
      bidFlag,
      header,
    } = this.props;

    const buttons = !newOpenedBidFlag
      ? [
        <Button icon="playlist_add" onClick={onCreateReviewLine}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>,
        <TooltipButtonPro
          name="delete"
          icon="delete_sweep"
          disabled={isEmpty(ds.selected)}
          onClick={() => onDeleteReviewLine(ds)}
          help={intl
              .get('ssrc.common.view.message.score-indicate-line.select.tip')
              .d('请先勾选评分要素')}
        >
          {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
        </TooltipButtonPro>,
        <Button
          icon="save"
          onClick={onSaveReviewLine}
          disabled={!sourceHeaderId}
          loading={isInitialLoading}
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>,
        ]
      : [];

    const tableButtons = remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_INITIALREVIEW_TABLE_BUTTONS',
          buttons,
          {
            ds,
            that: this,
            bidFlag,
            header,
          }
        )
      : buttons;

    return (
      <div>
        {customizeTable(
          {
            code: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.INTIALREVIEW_TABLE`,
          },
          <Table
            bordered
            buttons={tableButtons}
            dataSet={ds}
            rowKey="evaluateIndicAdjustId"
            columns={this.getColumns()}
            editMode={!newOpenedBidFlag ? 'cell' : 'inline'}
            selectionMode={!newOpenedBidFlag ? 'rowbox' : 'none'}
          />
        )}
      </div>
    );
  }
}
