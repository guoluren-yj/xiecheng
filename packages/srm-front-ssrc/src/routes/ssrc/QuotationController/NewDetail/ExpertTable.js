// 评分明细表table

import React, { PureComponent } from 'react';
import { Table, Button, Select } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import { updateExpertOfQuotationController } from '@/services/inquiryHallNewService';
import ExtractExperts from '@/routes/ssrc/ExpertWorkBench/ExtractExperts/Update/index';
import { noop } from 'srm-front-boot/lib/components/SearchBarTable/util';
import { historyRenderPure } from './utils';
import styles from './index.less';

@observer
export default class ExpertTable extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  componentDidMount() { }

  renderTeam = (record = {}) => {
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
    const { header = {}, remote, bidFlag } = this.props;
    const { bidRuleType = null, openBidOrder = '' } = header;

    const sourceColumns = [
      {
        name: 'expertLov',
        width: 150,
        editor: (record) => record.get('expertFrom') !== 'EXPERT_EXTRACT',
        renderer: (props) => historyRenderPure(props, 'sourceEvaluateExpert', 'loginName'),
      },
      {
        name: 'expertName',
        renderer: (props) => historyRenderPure(props, 'sourceEvaluateExpert', 'expertName'),
      },
      {
        name: 'evaluateLeaderFlag',
        width: 150,
        renderer: (props) =>
          historyRenderPure(
            props,
            'sourceEvaluateExpert',
            'evaluateLeaderFlag',
            remote
              ? remote.process(
                  'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_EVALUATE_SELECT',
                  {},
                  {
                    record: props?.record,
                    openBidOrder,
                    header,
                  }
                )
              : {}
          ),
      },
      bidRuleType !== 'NONE'
        ? {
            name: 'team',
            width: 150,
            renderer: (props) =>
              historyRenderPure(props, 'sourceEvaluateExpert', 'team', {
                optionsFilter: (curRecord) => {
                  const currentOptionValue = curRecord.get('value') || null;
                  const expertCategory = props?.record?.get('expertCategory');
                  return (
                    expertCategory === currentOptionValue ||
                    expertCategory === 'BUSINESS_TECHNOLOGY' ||
                    !expertCategory
                  );
                },
              }),
          }
        : null,
      {
        name: 'expertTypeMeaning',
        width: 150,
        renderer: (props) => historyRenderPure(props, 'sourceEvaluateExpert', 'expertTypeMeaning'),
      },
      {
        name: 'expertFromMeaning',
        width: 130,
        renderer: (props) => historyRenderPure(props, 'sourceEvaluateExpert', 'expertFromMeaning'),
      },
      {
        name: 'phone',
        width: 260,
        renderer: (props) => {
          return (
            <Row justify="start" gutter={8}>
              <Col span={10} name="internationalTelCodeMeaning">
                {historyRenderPure(props, 'sourceEvaluateExpert', 'internationalTelCodeMeaning', {
                  readOnly: true,
                })}
              </Col>
              <Col span={14} name="phone">
                {historyRenderPure(props, 'sourceEvaluateExpert', 'phone', { readOnly: true })}
              </Col>
            </Row>
          );
        },
      },
      {
        name: 'email',
        width: 180,
        renderer: (props) => historyRenderPure(props, 'sourceEvaluateExpert', 'email'),
      },
    ].filter(Boolean);

    const columns = remote
      ? remote.process('SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_EXPERT_COLUMNS', sourceColumns, {
          bidFlag,
          header,
        })
      : sourceColumns;

    return columns;
  }

  @Bind()
  getEvaluateIndics() {
    const {
      businessScoringElementDS,
      technologyScoringElementDS,
      allScoringElementDS,
    } = this.props;
    // 评分要素 处理专家分配 评分要素传给后台返回最新的分配关系 前端替换最新的分配关系 要素表不保存
    const BusinessScoringElement = businessScoringElementDS?.toJSONData() || [];
    const TechnologyScoringElement = technologyScoringElementDS?.toJSONData() || [];
    const AllScoringElement = allScoringElementDS?.toJSONData() || [];
    const evaluateIndics = [
      ...BusinessScoringElement,
      ...TechnologyScoringElement,
      ...AllScoringElement,
    ];
    return evaluateIndics || [];
  }

  // 数据验证
  validateAndIntegerExpertData = async () => {
    const { organizationId, header = {}, type = null, ds = {}, custKey } = this.props;
    let error = false;
    const {
      adjustRecordId = null,
      rfxHeaderAdjustId: sourceHeaderAdjustId = null,
      rfxHeaderId: sourceHeaderId = null,
    } = header;

    let customizeUnitCode = `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_DIFF`;
    if (type === 'BUSINESS_TECHNOLOGY') {
      customizeUnitCode = `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_NONE`;
    }

    const validateFlag = await ds.validate();
    if (!validateFlag) {
      error = true;
      return {
        error,
      };
    }

    const { templateId: sourceTemplateId = null } = header;
    const data = ds.toData();
    const tableDatas = data.map((item) => {
      return {
        ...item,
        tenantId: organizationId,
        organizationId,
        adjustRecordId,
        sourceHeaderAdjustId,
        sourceFrom: 'RFX',
        sourceHeaderId,
        expertStatus: 'SUBMITTED',
      };
    });

    return {
      error,
      organizationId,
      evaluateExpertList: tableDatas,
      sourceTemplateId,
      adjustRecordId,
      sourceHeaderAdjustId,
      sourceHeaderId,
      customizeUnitCode,
      evaluateIndics: this.getEvaluateIndics(),
    };
  };

  /**
   * 保存专家评分
   */
  @Bind()
  @Debounce(500)
  async onSaveExpert() {
    const { fetchExpert = () => { } } = this.props;

    const { error = false, ...otherData } = await this.validateAndIntegerExpertData();
    if (error) {
      return;
    }
    this.setState({ isLoading: true });
    try {
      let result = await updateExpertOfQuotationController(otherData);
      result = getResponse(result);
      this.setState({ isLoading: false });
      if (!result) {
        return;
      }
      this.handleAssignedExpertInfo(result);
      notification.success();
      fetchExpert();
    } catch (e) {
      this.setState({ isLoading: false });
      throw e;
    }
  }

  // expert 删除
  @Bind()
  async deleteExpertLines(ds = {}) {
    const { fetchExpert = () => { } } = this.props;
    const selecteds = ds.selected || [];
    if (isEmpty(selecteds)) {
      return;
    }
    const remoteDelete = selecteds.filter((item) => (item.data || {}).evaluateExpertAdjustId);
    const localDelete = selecteds.filter((item) => !(item.data || {}).evaluateExpertAdjustId);

    if (!isEmpty(remoteDelete)) {
      const deleteParams = {
        evaluateIndics: this.getEvaluateIndics(),
      };
      // ds.delete()第一个参数 如果接受对象，则走查询接口 非删除接口
      // 用state存储删除数据，transport读取
      ds.setState('deleteParams', deleteParams);
      ds.delete(remoteDelete).then((res) => {
        const result = getResponse(res);
        if (result && result.success) {
          this.handleAssignedExpertInfo(result.content?.[0]);
          ds.unSelectAll();
          fetchExpert();
        }
      });
    } else {
      ds.remove(localDelete);
    }
  }

  @Bind()
  handleAssignedExpertInfo(data = {}) {
    const { businessIndicList = [], technologyIndicList = [], otherIndicList = [] } = data || {};
    const {
      businessScoringElementDS,
      technologyScoringElementDS,
      allScoringElementDS,
      bidRuleType,
    } = this.props;
    if (bidRuleType === 'DIFF') {
      this.handleUpdateAssignedExpert(businessScoringElementDS, businessIndicList);
      this.handleUpdateAssignedExpert(technologyScoringElementDS, technologyIndicList);
    } else if (bidRuleType === 'NONE') {
      this.handleUpdateAssignedExpert(allScoringElementDS, otherIndicList);
    }
  }

  /*
   * 前端替换最新的分配关系 要素表格行填写的信息不会保存到后台
   * 替换规则：如果当前商务组要素全是新建行要素，则data为[]，不作替换
   *         只替换已保存的要素行分配关系，用主键id判断
   */
  @Bind()
  handleUpdateAssignedExpert(ds, data = []) {
    if (isEmpty(data)) return;

    const _data = ds.toData().map((item) => {
      // 只替换有要素id的要素行，对于新建的无要素id的要素行不替换分配关系
      if (item?.evaluateIndicAdjustId) {
        const { assignedExpertList, assignedExperts } =
          data?.find((i) => i.evaluateIndicAdjustId === item.evaluateIndicAdjustId) || {};
        return { ...item, assignedExpertList, assignedExperts };
      }
      return item;
    });
    const loadedData = _data.filter((i) => i.evaluateIndicAdjustId);
    // 还原新创建的数据
    const createData = _data.filter((i) => !i.evaluateIndicAdjustId);
    // loadData同步操作
    ds.loadData(loadedData);
    createData.reverse().forEach((i) => ds.create(i, 0));
  }

  render() {
    const {
      ds = {},
      type = null,
      customizeTable,
      sourceHeaderId,
      custKey,
      fetchExpert = noop,
      fetchScoreDetail = noop,
      header = {},
      remote,
      bidFlag,
      RfxInfoDS,
    } = this.props;
    const { existSecondOpenBidFlag = null, rfxStatus, allOpenedFlag } = header || {};
    const newOpenedBidFlag =
      rfxStatus === 'OPEN_BID_PENDING' && existSecondOpenBidFlag && allOpenedFlag;
    const { isLoading = false } = this.state;
    const TableButtons = !newOpenedBidFlag
      ? [
          ['add', { name: 'add' }],
          <TooltipButtonPro
            name="delete"
            icon="delete_sweep"
            disabled={isEmpty(ds.selected)}
            onClick={() => this.deleteExpertLines(ds)}
            help={intl
              .get('ssrc.common.view.message.expert-group-line.select.tip')
              .d('请先勾选专家组成员')}
          >
            {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
          </TooltipButtonPro>,
          <Button
            name="save"
            icon="save"
            onClick={this.onSaveExpert}
            disabled={!sourceHeaderId}
            loading={isLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>,
          header?.expertExtractFlag ? (
            <ExtractExperts
              name="extract"
              headerRecord={header}
              toolTipVisible
              sourceFrom="RFX"
              sourceFromId={header?.rfxHeaderId}
              extractOperateType="RFX_ADJUST"
              excludeExpertIds={ds
                ?.toData?.()
                ?.map?.((item) => item.expertId)
                .filter(Boolean)}
              submitSuccessCallBack={() => {
                fetchExpert();
                fetchScoreDetail();
              }}
              btnProps={{
                disabled: !sourceHeaderId,
              }}
              extraRandomExtractPayload={
                remote
                  ? remote.process(
                      'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_EXTRACT_EXPERTS_EXTRA_PAYLOAD',
                      {},
                      { header, expertDS: ds, bidFlag }
                    )
                  : {}
              }
            />
          ) : null,
        ].filter(Boolean)
      : [];

    const ButtonCuxList = remote ? remote.process(
      'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_EXTRACT_EXPERTS_TB_BTS',
      TableButtons, { newOpenedBidFlag, RfxInfoDS, sourceHeaderId, ds }) : ButtonCuxList;
    return (
      <React.Fragment>
        <div className={styles['expert-table']}>
          {customizeTable(
            {
              readOnly: true,
              code:
                type === 'BUSINESS_TECHNOLOGY'
                  ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_NONE`
                  : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_DIFF`,
              buttonCode: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_SCORE_BUTTONS`,
            },
            <Table
              bordered
              buttons={ButtonCuxList}
              dataSet={ds}
              editMode={!newOpenedBidFlag ? 'cell' : 'inline'}
              selectionMode={!newOpenedBidFlag ? 'rowbox' : 'none'}
              rowKey="evaluateExpertAdjustId"
              columns={this.getColumns()}
              style={{
                maxHeight: '660px',
              }}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}
