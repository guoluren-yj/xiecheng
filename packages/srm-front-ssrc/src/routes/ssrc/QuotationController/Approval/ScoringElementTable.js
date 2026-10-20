// 评分要素table

import React, { PureComponent } from 'react';
import { DataSet, Modal, Table, Tooltip } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { ExpertModalDS } from './ScoringElementDS';
import ScoreEleDetailModal from './ScoreEleDetailModal';

import { renderCompareSymbol } from '../NewDetail/utils';

function ExpertAssignModal(props) {
  const { expertModalDS, customizeTable, currentMode, custKey } = props || {};
  const expertColumns = [
    {
      name: 'loginName',
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

  const code =
    !currentMode || currentMode === 'current'
      ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN_READ`
      : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN_HIS`;

  return customizeTable(
    {
      code,
    },
    <Table border dataSet={expertModalDS} columns={expertColumns} rowKey="indicAssginAdjustId" />
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
    const { organizationId, currentMode = null, custKey, header = {} } = this.props;

    const evaluateIndicAdjustId = record.get('evaluateIndicAdjustId');
    const team = record.get('team');
    const sourceHeaderId = record.get('sourceHeaderId');
    const evaluateIndicId = record?.get('evaluateIndicId');
    const { adjustRecordId = '' } = header;

    if (!evaluateIndicAdjustId && !evaluateIndicId) {
      return;
    }

    const code =
      !currentMode || currentMode === 'current'
        ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN_READ`
        : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN_HIS`;

    this.ExpertModalDS.setQueryParameter('commonProps', {
      organizationId,
      currentMode,
      evaluateIndicAdjustId,
      evaluateIndicCategory: team,
      sourceHeaderId,
      evaluateIndicId,
      adjustRecordId,
      customizeUnitCode: code,
    });
  }

  // 分配专家modal
  @Bind()
  openAssignExpertModal(record = {}) {
    const { customizeTable, custKey } = this.props;
    this.initExpertAssignDS(record);
    this.ExpertModalDS.query();

    const Props = {
      custKey,
      customizeTable,
      expertModalDS: this.ExpertModalDS,
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

  getUnitCode = () => {
    const { currentMode = null, type = null, custKey } = this.props;

    let code = '';
    if (type === 'BUSINESS_TECHNOLOGY' || type === 'BUSINESS') {
      code =
        !currentMode || currentMode === 'current'
          ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_NONE_READ`
          : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_NONE_HIS`;
    }
    if (type === 'TECHNOLOGY') {
      code =
        !currentMode || currentMode === 'current'
          ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_TECH_READ`
          : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_TECH_HIS`;
    }

    return code;
  };

  // table columns
  getColumns() {
    const { ds = {}, currentMode = null } = this.props;

    const columns = [
      {
        name: 'indicateCode',
        width: 150,
        renderer: (props) => renderCompareSymbol(props, currentMode),
      },
      {
        name: 'indicateName',
        width: 180,
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
        align: 'left',
        renderer: ({ value, record }) => (record.get('indicateType') === 'PASS' ? '-' : value),
      },
      {
        name: 'minScore',
        width: 100,
        align: 'left',
        renderer: ({ value, record }) => (record.get('indicateType') === 'PASS' ? '-' : value),
      },
      {
        name: 'maxScore',
        width: 100,
        align: 'left',
        renderer: ({ value, record }) => (record.get('indicateType') === 'PASS' ? '-' : value),
      },
      {
        name: 'detailEnabledFlag',
        width: 160,
        renderer: ({ value, record }) => {
          return (
            <div>
              <span style={{ marginRight: '4px' }}>{yesOrNoRender(value)}</span>
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
        renderer: ({ value }) => {
          return (
            <Tooltip
              popupStyle={{
                whiteSpace: 'pre-wrap',
                minWidth: '400',
              }}
              title={() => <span>{value}</span>}
              placement="left"
            >
              {value}
            </Tooltip>
          );
        },
        tooltip: 'none',
      },
      {
        name: 'expertDistribute',
        width: 120,
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
      {
        name: 'assignedEvaluateExperts',
        width: 200,
      },
    ].filter(Boolean);

    return columns;
  }

  render() {
    const {
      ds = {},
      custKey,
      sourceHeaderId,
      header = {},
      customizeTable,
      custLoading,
      currentMode,
    } = this.props;
    const {
      elementRecord = {},
      detailModalVisible = false,
      lovBringOutFlag = {},
      changeLovFlag = {},
    } = this.state;
    const code = this.getUnitCode();

    const detailModalProps = {
      header,
      custKey,
      currentMode,
      lovBringOutFlag,
      changeLovFlag,
      elementRecord,
      sourceHeaderId,
      readonly: true,
      visible: detailModalVisible,
      onHideModal: this.handleDetailModalHide,
      onSaveScoringElements: this.handleDetailModalHide,
    };

    return (
      <React.Fragment>
        {customizeTable(
          { code },
          <Table
            bordered
            dataSet={ds}
            rowKey="evaluateIndicAdjustId"
            columns={this.getColumns()}
            custLoading={custLoading}
          />
        )}
        {detailModalVisible && <ScoreEleDetailModal {...detailModalProps} />}
      </React.Fragment>
    );
  }
}
