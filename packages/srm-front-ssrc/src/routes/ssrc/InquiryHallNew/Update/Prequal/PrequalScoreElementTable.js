// 资格预审评分要素table

import React, { PureComponent } from 'react';
import { DataSet, Lov, Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import { PrequalScoreElementTemplateButton } from '../DSCollections';

export default class PrequalScoreElementTable extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {};

    this.PrequalScoreElementTemplateButton = new DataSet(PrequalScoreElementTemplateButton());
  }

  componentDidMount() {}

  // table columns
  getColumns() {
    const columns = [
      {
        name: 'ElementLov',
        width: 180,
        editor: true,
      },
      {
        name: 'indicateName',
        editor: true,
      },
      {
        name: 'indicateType',
        width: 120,
        editor: true,
      },
      {
        name: 'minScore',
        width: 100,
        editor: true,
        align: 'right',
      },
      {
        name: 'maxScore',
        width: 100,
        editor: true,
        align: 'right',
      },
      {
        name: 'mustApprovedFlag',
        width: 120,
        editor: true,
        align: 'left',
      },
      {
        name: 'qualifiedScore',
        width: 140,
        editor: true,
        align: 'right',
      },
    ].filter(Boolean);

    return columns;
  }

  // 参考模板lov-ok
  @Bind()
  changeRefTemplate() {
    const { handleTemplateChange, currentSectionHeaderDS = {} } = this.props;
    const templateData = this.PrequalScoreElementTemplateButton.toData()[0] || {};
    handleTemplateChange(templateData, { currentSectionHeaderDS });
  }

  render() {
    const { prequalScoreElementDS = {}, sourceHeaderId } = this.props;

    const TableButtons = [
      ['add', { icon: 'icon icon-playlist_add' }],
      ['save', { disabled: !sourceHeaderId }],
      ['delete', { icon: 'delete_sweep' }],
      <Lov
        noCache
        modalProps={{
          onOk: this.changeRefTemplate,
          onDoubleClick: this.changeRefTemplate,
        }}
        disabled={!sourceHeaderId}
        dataSet={this.PrequalScoreElementTemplateButton}
        name="templateLov"
        mode="button"
        clearButton={false}
        icon="view_list"
        code="SSRC.REFERENCE_SCORE_TEMPL"
        queryParams={{
          templatePurpose: 'PREQUALIFICATION',
          selectFlag: 1,
        }}
      >
        {intl.get(`ssrc.inquiryHall.view.button.referTemplate`).d('参考模板')}
      </Lov>,
    ];

    return (
      <React.Fragment>
        <Table
          bordered
          pagination={false}
          buttons={TableButtons}
          dataSet={prequalScoreElementDS}
          rowKey="prequalScoreAssignId"
          columns={this.getColumns()}
          customizedCode="SSRC.NEW_INQUIRY_HALL.PREQUAL_SCORE_ELEMENT"
          style={{ maxHeight: '4.5rem' }}
        />
      </React.Fragment>
    );
  }
}
