// 评分要素table

import React, { PureComponent } from 'react';
import { DataSet, CheckBox, Modal, Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import ScoreEleDetailModal from '@/routes/ssrc/InquiryHall/Update/ScoreEleDetailModal';
import { ExpertModalDS } from './ScoringElementDS';

function ExpertAssignModal(props) {
  const { expertModalDS, customizeTable, rfx = {} } = props || {};
  const { unitCodeSymbol } = rfx;
  const expertColumns = [
    {
      name: 'loginName',
      width: 150,
    },
    {
      name: 'expertName',
    },
    {
      name: 'assignFlag',
      width: 120,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ];

  return customizeTable(
    {
      code: `SSRC.${unitCodeSymbol}_DETAIL.SCORE.EXPERT_ASSIGN`,
    },
    <Table border dataSet={expertModalDS} columns={expertColumns} rowKey="evaluateExpertId" />
  );
}

export default class ScoringElementTable extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      detailModalVisible: false, // 评分要素细项弹框
      elementRecord: {}, // 评分要素
      lovBringOutFlag: {}, // lov带出flag
      changeLovFlag: {}, // 真实数据，是否改变lov
    };
  }

  ExpertModalDS = new DataSet(ExpertModalDS());

  componentDidMount() {}

  initExpertAssignDS(record = {}) {
    const { organizationId, rfx = {} } = this.props;
    const { unitCodeSymbol } = rfx;

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
      customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.SCORE.EXPERT_ASSIGN`,
    });
  }

  // 分配专家modal
  @Bind()
  openAssignExpertModal(record = {}) {
    const { customizeTable, rfx = {} } = this.props;
    this.initExpertAssignDS(record);
    this.ExpertModalDS.query();

    const Props = {
      customizeTable,
      expertModalDS: this.ExpertModalDS,
      rfx,
    };
    const modalKey = Modal.key();

    Modal.open({
      destroyOnClose: true,
      key: modalKey,
      drawer: true,
      closable: true,
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.assignExpert`).d('分配专家'),
      children: <ExpertAssignModal {...Props} />,
      style: { width: '800px' },
      cancelText: intl.get('ssrc.inquiryHall.model.inquiryHall.closed').d('关闭'),
      footer: (okBtn, cancelBtn) => <div>{cancelBtn}</div>,
    });
  }

  /**
   * 要素细项-显隐
   * 保存后关闭弹框，需要重置lovBringOutFlag，changeLovFlag
   */
  @Bind()
  handleDetailModalHide() {
    this.setState({ detailModalVisible: false, elementRecord: {} });
  }

  // 打开评分要素细项modal
  @Bind()
  async handleDetailModalShow(records = {}) {
    const data = {
      ...records.toData(),
      _status: 'update',
    };

    this.setState({
      detailModalVisible: true,
      elementRecord: data,
    });
  }

  // table columns
  getColumns() {
    const { ds = {}, remote, rfxInfoDS, rfx } = this.props;
    const { bidFlag } = rfx || {};

    const columns = [
      {
        name: 'indicateCode',
        width: 150,
      },
      {
        name: 'indicateName',
        width: 180,
        tooltip: 'overflow',
      },
      {
        name: 'indicateTypeMeaning',
        width: 120,
      },
      {
        name: 'calculateTypeMeaning',
        width: 150,
      },
      {
        name: 'scoreTypeMeaning',
        width: 150,
      },
      {
        name: 'weight',
        width: 120,
        align: 'right',
        renderer: ({ value, record }) => (record.get('indicateType') === 'PASS' ? '-' : value),
      },
      {
        name: 'minScore',
        width: 100,
        align: 'right',
        renderer: ({ value, record }) => (record.get('indicateType') === 'PASS' ? '-' : value),
      },
      {
        name: 'maxScore',
        width: 100,
        align: 'right',
        renderer: ({ value, record }) => (record.get('indicateType') === 'PASS' ? '-' : value),
      },
      {
        name: 'detailEnabledFlag',
        width: 160,
        renderer: ({ value, record }) => {
          return (
            <div>
              <CheckBox defaultChecked={value} disabled style={{ marginRight: '4px' }} />
              {value ? (
                <a onClick={() => this.handleDetailModalShow(record, ds)}>
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.elements.detail`).d('评分要素细项')}
                </a>
              ) : null}
            </div>
          );
        },
      },
      {
        name: 'indicateRemark',
        width: 180,
        tooltip: 'overflow',
      },
      // {
      //   name: 'expertDistribute',
      //   width: 150,
      //   renderer: ({ record = {} }) => {
      //     const evaluateIndicId = record.get('evaluateIndicId');
      //     if (!evaluateIndicId) {
      //       return;
      //     }
      //     return (
      //       <a onClick={() => this.openAssignExpertModal(record)}>
      //         {intl.get(`ssrc.inquiryHall.view.message.button.view`).d('查看')}
      //       </a>
      //     );
      //   },
      // },
      {
        name: 'assignedEvaluateExperts',
        width: 120,
      },
    ].filter(Boolean);

    // 二开埋点
    const remoteColumns = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_DETAIL_PROCESS_RELEASE_PREPARE_SCORE_ELEMENT_COLUMNS',
          columns,
          { rfxInfoDS, bidFlag }
        )
      : columns;

    return remoteColumns;
  }

  render() {
    const {
      ds = {},
      sourceHeaderId,
      templateScoreType,
      customizeTable,
      type,
      rfx = {},
    } = this.props;
    const {
      elementRecord = {},
      detailModalVisible = false,
      lovBringOutFlag = {},
      changeLovFlag = {},
    } = this.state;
    const { unitCodeSymbol } = rfx;

    const detailModalProps = {
      templateScoreType,
      lovBringOutFlag,
      changeLovFlag,
      elementRecord,
      sourceHeaderId,
      readonly: true,
      visible: detailModalVisible,
      onHideModal: this.handleDetailModalHide,
      onSaveScoringElements: this.handleDetailModalHide,
      rfx,
      detailFlag: true,
    };

    return (
      <React.Fragment>
        {customizeTable(
          {
            code:
              type === 'TECHNOLOGY'
                ? `SSRC.${unitCodeSymbol}_DETAIL.SCORE_INDICS_TECH`
                : `SSRC.${unitCodeSymbol}_DETAIL.SCORE_INDICS`,
          },
          <Table
            bordered
            dataSet={ds}
            rowKey="evaluateIndicId"
            columns={this.getColumns()}
            style={{ maxHeight: 450 }}
          />
        )}
        {detailModalVisible && <ScoreEleDetailModal {...detailModalProps} />}
      </React.Fragment>
    );
  }
}
