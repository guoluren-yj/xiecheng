/**
 * 符合性检查列表
 */
import React, { PureComponent } from 'react';
import { DataSet, Modal, Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { ExpertModalDS } from './ScoringElementDS';
import { renderCompareSymbol } from '../NewDetail/utils';

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

  return (
    <Table border dataSet={expertModalDS} columns={expertColumns} rowKey="indicAssginAdjustId" />
  );
}

export default class InitialReviewTable extends PureComponent {
  ExpertModalDS = new DataSet(ExpertModalDS());

  // table columns
  getColumns() {
    const { currentMode = '' } = this.props;
    const columns = [
      {
        name: 'indicateCode',
        width: 200,
        renderer: (props) => renderCompareSymbol(props, currentMode),
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
      },
      {
        name: 'indicateRemark',
        width: 250,
      },
      {
        name: 'expertDistribute',
        width: 150,
        renderer: ({ record = {} }) => {
          const evaluateIndicAdjustId = record.get('evaluateIndicAdjustId');
          const evaluateIndicId = record?.get('evaluateIndicId');
          if (!evaluateIndicAdjustId && !evaluateIndicId) {
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
    const { organizationId, currentMode = null, header = {} } = this.props;

    const evaluateIndicId = record.get('evaluateIndicId');
    const team = record.get('team');
    const sourceHeaderId = record.get('sourceHeaderId');
    const evaluateIndicAdjustId = record.get('evaluateIndicAdjustId');
    const { rfxHeaderBaseInfoAdjustDTO = {} } = header;
    const { adjustRecordId = '' } = rfxHeaderBaseInfoAdjustDTO;
    if (!evaluateIndicAdjustId && !evaluateIndicId) {
      return;
    }
    this.ExpertModalDS.setQueryParameter('commonProps', {
      organizationId,
      currentMode,
      evaluateIndicAdjustId,
      evaluateIndicCategory: team,
      sourceHeaderId,
      evaluateIndicId,
      adjustRecordId,
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
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.view.message.title.viewExpert`).d('查看专家'),
      children: <ExpertAssignModal {...Props} />,
      style: { width: '800px' },
      cancelText: intl.get('ssrc.inquiryHall.model.inquiryHall.closed').d('关闭'),
      footer: (okBtn, cancelBtn) => <div>{cancelBtn}</div>,
    });
  }

  render() {
    const { ds, customizeTable = () => {}, currentMode, custKey } = this.props;
    return (
      <React.Fragment>
        {customizeTable(
          {
            code:
              currentMode === 'history'
                ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.INTIALREVIEW_TABLE_HIS`
                : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.INTIALREVIEW_TABLE_READ`,
          },
          <Table bordered dataSet={ds} rowKey="evaluateIndicId" columns={this.getColumns()} />
        )}
      </React.Fragment>
    );
  }
}
