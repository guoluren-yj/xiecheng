// 评分明细表table

import React, { PureComponent } from 'react';
import { observer } from 'mobx-react';

import { Table, Lov, Tooltip, Select } from 'choerodon-ui/pro';
import { isEmpty, noop } from 'lodash';

import intl from 'utils/intl';
import remote from 'hzero-front/lib/utils/remote';
import { phoneRender } from '@/utils/renderer';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';

import ExtractExperts from '@/routes/ssrc/ExpertWorkBench/ExtractExperts/Update/index';

class ExpertTable extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  // expert lov tooltip renderer
  renderExpertLov(dataSet = {}, name = null, value = {}, record = {}) {
    const { loginName = null, expertId = null } = value || {};
    const expertName = record.get('expertName');
    const email = record.get('email');
    const phone = record.get('phone');
    const lov = <Lov name={name} dataSet={dataSet} />;

    if (isEmpty(value) || !expertId) {
      return lov;
    }

    return (
      <Tooltip
        title={
          <div>
            {loginName && (
              <div>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.expertSubAccount`).d('专家子账户')}:{' '}
                {loginName}
              </div>
            )}
            {expertName && (
              <div>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.expertName`).d('专家姓名')}:{' '}
                {expertName}
              </div>
            )}
            {email && (
              <div>
                {intl.get('hzero.common.email').d('邮箱')}: {email}
              </div>
            )}
            {phone && (
              <div>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxPhone`).d('联系电话')}: {phone}
              </div>
            )}
          </div>
        }
      >
        {lov}
      </Tooltip>
    );
  }

  renderTeam = (record = {}) => {
    // const { expertSource, } = this.props;

    return (
      <Select
        name="team"
        optionsFilter={(curRecord) => {
          const currentOptionValue = curRecord.get('value') || null;
          const expertCategory = record.get('expertCategory');
          return (
            expertCategory === currentOptionValue ||
            expertCategory === 'BUSINESS_TECHNOLOGY' ||
            !expertCategory
          );
        }}
      />
    );
  };

  // table columns
  getColumns() {
    const { bidRuleType = null, expertRemote, rfxInfoDS } = this.props;

    const columns = [
      {
        name: 'expertLov',
        width: 150,
        editor: (record) => record.get('expertFrom') !== 'EXPERT_EXTRACT',
        // renderer: ({dataSet, name, value, record,}) => this.renderExpertLov(dataSet, name, value, record),
      },
      {
        name: 'expertName',
      },
      // 此列二开，勿改参数名
      {
        editor: true,
        name: 'evaluateLeaderFlag',
        width: 150,
      },
      bidRuleType !== 'NONE'
        ? {
            // editor: true,
            name: 'team',
            width: 150,
            editor: this.renderTeam,
          }
        : null,
      {
        name: 'expertTypeMeaning',
        width: 150,
      },
      {
        name: 'expertFromMeaning',
        width: 130,
      },
      {
        name: 'phone',
        width: 300,
        renderer: ({ record }) => {
          return phoneRender(record.get('internationalTelCodeMeaning'), record.get('phone'));
        },
      },
      {
        name: 'email',
        width: 180,
      },
    ].filter(Boolean);

    return expertRemote
      ? expertRemote.process('UPDATE_EXPERT_TABLE_PROCESS_EXPERT_COLUMN', columns, {
          rfxInfoDS,
        })
      : columns;
  }

  /**
   * 专家保存事件
   * @param {string} type
   * @protected 九坤二开
   */
  handleSaveExpert(type) {
    const { onSaveExpert = noop } = this.props;
    onSaveExpert(type);
  }

  /**
   * 专家表格删除事件
   * @param {} ds
   * @protected 九坤二开
   */
  handleDeleteExpertLines(ds) {
    const { deleteExpertLines = noop } = this.props;
    deleteExpertLines(ds);
  }

  getDisableStateByUpdateDs = (
    ds,
    allScoringElementDS,
    businessScoringElementDS,
    technologyScoringElementDS
  ) => {
    return (
      ds?.created?.length > 0 ||
      ds.dirty ||
      allScoringElementDS?.created?.length > 0 ||
      allScoringElementDS.dirty ||
      businessScoringElementDS?.created?.length > 0 ||
      businessScoringElementDS.dirty ||
      technologyScoringElementDS?.created?.length > 0 ||
      technologyScoringElementDS.dirty
    );
  };

  renderTableButtons() {
    const {
      ds = {},
      type = null,
      sourceHeaderId,
      isLoading = false,
      expertRemote = false,
      rfx = {},
      rfxInfoDS,
      fetchExpert,
      businessScoringElementDS,
      technologyScoringElementDS,
      allScoringElementDS,
      fetchScoring = noop,
      priceScoringElementDS,
    } = this.props;

    const { expertExtractFlag, originTemplateId, templateId } =
      rfxInfoDS?.current?.get?.(['expertExtractFlag', 'originTemplateId', 'templateId']) || {};

    const hasTemplateChangeFlag = templateId !== originTemplateId;

    const disableCondition =
      hasTemplateChangeFlag ||
      ds?.dirty ||
      allScoringElementDS?.dirty ||
      businessScoringElementDS?.dirty ||
      technologyScoringElementDS?.dirty;

    const disableState = expertRemote
      ? expertRemote.process(
          'UPDATE_EXPERT_TABLE_EXTRACT_EXPERTS_DISABLED_STATE',
          disableCondition,
          {
            rfxInfoDS,
            rfx,
            priceScoringElementDS,
          }
        )
      : disableCondition;

    const { sourceKey = '' } = rfx;
    const TableButtons = [
      ['add', { name: 'add' }],
      <TooltipButtonPro
        name="delete"
        icon="delete_sweep"
        onClick={() => this.handleDeleteExpertLines(ds)}
        disabled={isEmpty(ds.selected)}
        help={intl
          .get('ssrc.common.view.message.expert-group-line.select.tip')
          .d('请先勾选专家组成员')}
      >
        {intl.get('hzero.common.button.batchdelete').d('批量删除')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        name="save"
        icon="save"
        onClick={() => this.handleSaveExpert(type)}
        disabled={!sourceHeaderId}
        loading={isLoading}
        help={intl.get('ssrc.common.view.message.document.save.tip').d('请先保存单据')}
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </TooltipButtonPro>,
      expertExtractFlag ? (
        <ExtractExperts
          name="extract"
          headerRecord={rfxInfoDS?.current}
          toolTipVisible={disableState}
          sourceFrom="RFX"
          sourceFromId={sourceHeaderId}
          extractOperateType="RFX_EDIT"
          excludeExpertIds={ds
            ?.toData?.()
            ?.map?.((item) => item.expertId)
            .filter(Boolean)}
          submitSuccessCallBack={() => {
            fetchExpert();
            fetchScoring();
          }}
          btnProps={{
            disabled: !sourceHeaderId || disableState,
          }}
        />
      ) : null,
    ].filter(Boolean);
    const otherProps = {
      ds,
      sourceKey,
      rfxInfoDS,
      sourceHeaderId,
      fetchExpert,
    };
    return expertRemote
      ? expertRemote.process('UPDATE_EXPERT_TABLE_BUTTONS', TableButtons, otherProps)
      : TableButtons;
  }

  render() {
    const { ds = {}, customizeTable, proxyDsCreate = {}, rfx = {} } = this.props;
    const { sourceKey = '' } = rfx;

    return (
      <React.Fragment>
        {customizeTable(
          {
            code: `SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.EXPERT_SCORE`,
            proxyDsCreate,
            buttonCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.EXPERT_SCORE_BUTTONS`,
          },
          <Table
            bordered
            buttons={this.renderTableButtons()}
            dataSet={ds}
            rowKey="evaluateExpertId"
            columns={this.getColumns()}
            style={{ maxHeight: '4.5rem' }}
          />
        )}
      </React.Fragment>
    );
  }
}

const hocExpertTable = (NewComponent) => {
  return remote({
    code: 'UPDATE_EXPERT_TABLE',
    name: 'expertRemote',
  })(observer(NewComponent));
};

export default hocExpertTable(ExpertTable);
export { hocExpertTable, ExpertTable };
