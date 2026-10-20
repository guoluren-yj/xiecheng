/**
 * 初步评审列表
 * @date: 2020-12-24
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { DataSet, Modal, Button, Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import CommonImportNew from 'hzero-front/lib/components/Import';
import { SRM_SSRC } from 'srm-front-boot/lib/utils/config';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import { saveEvaluateIndicAssign } from '@/services/bidHallService';

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
      editor: true,
    },
  ];

  return <Table border dataSet={expertModalDS} columns={expertColumns} rowKey="evaluateExpertId" />;
}

@observer
export default class InitialReviewTable extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

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
        name: 'indicateRemark',
        width: 250,
        editor: true,
      },
      {
        name: 'expertDistribute',
        width: 150,
        renderer: ({ record = {} }) => {
          const evaluateIndicId = record.get('evaluateIndicId');
          if (!evaluateIndicId || sourceHeaderId === 'null' || !sourceHeaderId) {
            return null;
          }
          return (
            <a onClick={() => this.openAssignExpertModal(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.distribution`).d('分配')}
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
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.assignExpert`).d('分配专家'),
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
    const { organizationId, operationType = '' } = this.props;
    const newParams = this.ExpertModalDS.toData();
    await saveEvaluateIndicAssign({
      newParams,
      organizationId,
      operationType,
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        notification.success();
      }
    });
    Modal.destroyAll();
  }

  batchImportOk = () => {
    const { fetchQueryReviewElements } = this.props;

    if (fetchQueryReviewElements) {
      fetchQueryReviewElements();
    }
  };

  render() {
    const {
      ds,
      sourceKey,
      customizeTable,
      sourceHeaderId,
      onCreateReviewLine,
      onDeleteReviewLine,
      onSaveReviewLine,
      isInitialLoading = false,
      organizationId,
      rfxInfoDS,
    } = this.props;

    console.log(this.props, 11);

    const importProps = {
      businessObjectTemplateCode: 'SSRC.RFX_EVALUATE_INDIC_INITIAL_REVIEW',
      prefixPatch: SRM_SSRC,
      name: 'importNew',
      args: {
        tenantId: organizationId,
        templateId: rfxInfoDS.current.get('templateId') || null,
        sourceHeaderId,
        templateCode: 'SSRC.RFX_EVALUATE_INDIC_INITIAL_REVIEW',
        sourceFrom: 'RFX',
      },
      buttonTooltip: !sourceHeaderId
        ? intl.get('ssrc.common.view.message.document.save.tip').d('请先保存单据')
        : null,
      buttonText: intl.get('ssrc.inquiryHall.view.button.import').d('导入'),
      buttonProps: {
        icon: 'archive',
        funcType: 'flat',
        color: 'primary',
        disabled: !sourceHeaderId,
      },
      tenantId: organizationId,
      autoRefreshInterval: 5000,
      successCallBack: this.batchImportOk,
    };

    const buttons = [
      <Button name="add" icon="playlist_add" onClick={onCreateReviewLine}>
        {intl.get('hzero.common.button.increase').d('新增')}
      </Button>,
      <TooltipButtonPro
        icon="delete_sweep"
        name="delete"
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
        name="save"
        onClick={onSaveReviewLine}
        disabled={!sourceHeaderId}
        loading={isInitialLoading}
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
      <CommonImportNew {...importProps} />,
    ];

    return (
      <div>
        {customizeTable(
          {
            code: `SSRC.${sourceKey}_HALL.NEW_EDIT.INITIAL_REVIEW_TABLE`,
            buttonCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.INITIAL_REVIEW_BUTTONS`,
          },
          <Table
            bordered
            buttons={buttons}
            dataSet={ds}
            rowKey="evaluateIndicId"
            columns={this.getColumns()}
            style={{ maxHeight: '4.5rem' }}
          />
        )}
      </div>
    );
  }
}
