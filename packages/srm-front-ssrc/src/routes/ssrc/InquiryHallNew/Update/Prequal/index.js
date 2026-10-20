/**
 * 资格预审容器组件
 * @date: 2021-04-22
 * @author: Goku<xu.pan01@going-link.com>
 * @version: 0.1.0
 * @copyright Copyright (c) 2021, ZhenYun
 */

import React, { Component } from 'react';
import {
  DataSet,
  Tabs,
  Modal,
  Lov,
  NumberField,
  Select,
  DateTimePicker,
  CheckBox,
  Icon,
  TextArea,
  Attachment,
} from 'choerodon-ui/pro';
import { Select as C7nSelect, Spin as C7nSpin } from 'choerodon-ui';
import { isArray, isEmpty, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import CollapseForm from '_components/CollapseForm';
import { PRIVATE_BUCKET } from '_utils/config';

import { ChunkUploadProps } from '@/utils/SsrcRegx';
import {
  batchApplyToOtherGroups,
  changeGroupMergeType,
  prequalScoreDetailReferenceTemplate,
  prequalScoreDetailGroupReferenceTemplate,
} from '@/services/inquiryHallNewService';
import { renderpretialMemberLovTooltip } from '../utils/renderer';
import PrequalScoreElementTable from './PrequalScoreElementTable';
import { groupTableDS } from './GroupTableDS';
import { sectionTableDS } from './SectionTableDS';
import GroupTable from './GroupTable';
import SectionTable from './SectionTable';
import styles from '../index.less';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();

@observer
export default class PrequalContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      batchApplyGroupsLoading: false,
    };
  }

  /**
   * 编辑分组
   */
  @Bind()
  async handleEditGroup() {
    const { rfxInfoDS } = this.props;
    const sourceProjectId = rfxInfoDS.current?.get('sourceProjectId');
    const rfxHeaderId = rfxInfoDS.current?.get('rfxHeaderId');
    const mergeType = rfxInfoDS.current?.get('mergeType');
    this.groupTableDs = new DataSet(
      groupTableDS({ sourceProjectId, mergeType, tempRfxHeaderId: rfxHeaderId })
    );
    const tableProps = {
      sourceProjectId,
      groupTableDs: this.groupTableDs,
    };
    Modal.open({
      key: Modal.key(),
      closable: true,
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.view.message.title.editGroup`).d('编辑分组'),
      style: {
        width: '55%',
      },
      children: <GroupTable {...tableProps} />,
      onOk: this.handleSaveGroup,
      onCancel: () => this.groupTableDs.reset(),
    });
    const res = getResponse(await this.groupTableDs.query());
    if (isArray(res) && res[0]) {
      this.groupTableDs.loadData(res);
    }
  }

  /**
   * 编辑标段
   */
  @Bind()
  async handleEditSection() {
    const { rfxInfoDS, prequalHeaderDsMap, onRefreshPrequalGroup } = this.props;
    const sourceProjectId = rfxInfoDS.current?.get('sourceProjectId');
    const rfxHeaderId = rfxInfoDS.current?.get('rfxHeaderId');
    const projectLineSectionId = rfxInfoDS.current?.get('projectLineSectionId');
    const configDs = {
      sourceProjectId,
      projectLineSectionId,
      tempSourceHeaderId: rfxHeaderId,
      prequalGroupHeaderIds: Object.keys(prequalHeaderDsMap)?.join(','),
    };
    this.sectionTableDs = new DataSet(sectionTableDS(configDs));
    const tableProps = {
      rfxHeaderId,
      tempSourceHeaderId: rfxHeaderId,
      sourceProjectId,
      onRefreshPrequalGroup,
      sectionTableDs: this.sectionTableDs,
    };
    Modal.open({
      key: Modal.key(),
      closable: true,
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.view.message.title.selectedSection`).d('已选标段'),
      style: {
        width: '55%',
      },
      children: <SectionTable {...tableProps} />,
      onCancel: () => this.sectionTableDs.reset(),
    });
    const res = getResponse(await this.sectionTableDs.query());
    if (isArray(res) && res[0]) {
      this.sectionTableDs.loadData(res);
    }
  }

  /**
   * 保存组别
   */
  @Bind()
  async handleSaveGroup() {
    // 校验所有分组内是否包含了所有已选标段, 若未包含，则提示：“标段编号-标段名称、标段编号-标段名称未纳入分组，请修改后提交！
    const { rfxInfoDS, onRefreshPrequalGroup } = this.props;
    if (!this.groupTableDs.length) return true;
    const { projectLineSections = [] } = rfxInfoDS.current.toData() || {};
    const projectLineSectionIds = [];
    this.groupTableDs.data.forEach((r) => {
      projectLineSectionIds.push(...r.get('sectionLineIds'));
    });
    // 找到未分组的标段
    let validationMsg = '';
    projectLineSections.forEach((section) => {
      if (!projectLineSectionIds.includes(section.projectLineSectionId)) {
        const { sectionNum, sectionName } = section;
        validationMsg = `${validationMsg}、${sectionNum}-${sectionName}`;
      }
    });
    if (validationMsg) {
      notification.error({
        message: `${validationMsg.substr(1)}${intl
          .get(`ssrc.inquiryHall.view.message.validation.groupingError`)
          .d('未纳入分组，请修改后提交！')}`,
      });
      return false;
    }
    if (!(await this.groupTableDs.validate())) return false;
    const res = getResponse(await this.groupTableDs.submit());
    if (res && isFunction(onRefreshPrequalGroup)) {
      onRefreshPrequalGroup();
    }
  }

  @Bind()
  changeReviewMethod(value, record) {
    if (value !== 'LIMITED_QUANTITY') {
      record.set('qualifiedLimit', null);
    }
  }

  preQualificationFields(ds) {
    const { changeEnableScoreFalg } = this.props;
    const record = ds.current || null;
    // if (!record) {
    //   return [];
    // }

    const Fields = [
      <DateTimePicker name="prequalEndDate" />,
      <Select
        name="reviewMethod"
        onChange={(value) => {
          this.changeReviewMethod(value, record);
        }}
      />,
      record?.get && record?.get('reviewMethod') === 'LIMITED_QUANTITY' ? (
        <NumberField name="qualifiedLimit" />
      ) : null,
      <Lov
        name="preGroupLeaderLov"
        renderer={({ value }) => renderpretialMemberLovTooltip(value)}
        modalProps={{
          title: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMain`).d('预审小组组长'),
        }}
      />,
      <Lov
        name="preGroupMemberLov"
        renderer={({ value }) => renderpretialMemberLovTooltip(value)}
        modalProps={{
          title: intl
            .get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMember`)
            .d('预审小组成员'),
        }}
      />,
      <CheckBox name="enableScoreFlag" onChange={(value) => changeEnableScoreFalg(value, ds)} />,
      <TextArea name="prequalRemark" clearButton resize />,
      <Attachment
        name="prequalAttachmentUuid"
        bucketName={PRIVATE_BUCKET}
        bucketDirectory="ssrc-rfx-prequal"
        {...ChunkUploadProps}
      />,
    ];

    return Fields.filter(Boolean);
  }

  /**
   * 应用至其他分组
   * @param {Object} ds - 当前header ds
   */
  @Bind()
  async handleApplyToGroups(ds, scoreElementDs) {
    const { onRefreshPrequalGroup } = this.props;
    const validateFlag = await ds.validate();
    const enableScoreFlag = ds?.current?.get('enableScoreFlag') || 0; // 评分细项flag
    const scoreEleValidateFlag = await scoreElementDs?.validate();
    if (!validateFlag) return;
    if (enableScoreFlag && !scoreEleValidateFlag) return;
    Modal.confirm({
      title: intl.get(`ssrc.inquiryHall.view.title.tips`).d('提示'),
      children: intl
        .get(`ssrc.inquiryHall.view.message.batchApplyGroupsConfirmTips`)
        .d('批量应用至其他分组会覆盖其他分组已填数据, 是否确认继续?'),
      onOk: async () => {
        const formData = ds?.current?.toData();
        const prequalGroupScoreAssignList = scoreElementDs?.toData() || [];
        const params = {
          organizationId,
          formData: {
            ...formData,
            prequalGroupScoreAssignList,
            prequalGroupMemberList: this.generatePrequalMemberData(ds),
          },
        };
        this.setState({
          batchApplyGroupsLoading: true,
        });
        try {
          const res = getResponse(await batchApplyToOtherGroups(params));
          if (res && isFunction(onRefreshPrequalGroup)) {
            onRefreshPrequalGroup();
            notification.success();
          }
        } finally {
          this.setState({
            batchApplyGroupsLoading: false,
          });
        }
      },
    });
  }

  /**
   * 生成预审小组数据
   */
  generatePrequalMemberData(ds) {
    const { rfxInfoDS } = this.props;
    const rfxHeaderId = rfxInfoDS.current?.get('rfxHeaderId');
    // 预审小组
    const commonParams = {
      rfxHeaderId,
      sourceHeaderId: rfxHeaderId,
      sourceFrom: 'RFX',
      tenantId: organizationId,
    };
    let preGroupMemberLov = ds.current.get('preGroupMemberLov') || [];
    if (!isEmpty(preGroupMemberLov)) {
      preGroupMemberLov = preGroupMemberLov.map((item) => {
        const { id = null, userId = null } = item || {};
        return {
          ...item,
          ...commonParams,
          userId: userId || id,
          leaderFlag: 0,
        };
      });
    }

    let preGroupLeaderLov = ds.current.get('preGroupLeaderLov') || {};
    if (!isEmpty(preGroupLeaderLov)) {
      preGroupLeaderLov = {
        ...preGroupLeaderLov,
        ...commonParams,
        userId: preGroupLeaderLov.userId || preGroupLeaderLov.id,
        leaderFlag: 1,
      };
    }

    const prequalMemberList = [preGroupLeaderLov, ...preGroupMemberLov].filter(
      (item) => !isEmpty(item) && item.userId
    );
    return prequalMemberList;
  }

  /**
   * 渲染预审表单
   */
  renderPrequalForm(ds, scoreElementDs) {
    const { rfxInfoDS, customizeCollapseForm, preQualificationFormRef, rfx = {} } = this.props;
    const { sourceKey } = rfx;
    const { batchApplyGroupsLoading = false } = this.state;
    const mergeType = rfxInfoDS.current?.get('mergeType');
    const enableScoreFlag = ds?.current?.get('enableScoreFlag') || 0;
    return (
      <React.Fragment>
        <C7nSpin spinning={batchApplyGroupsLoading}>
          <div>
            {customizeCollapseForm(
              {
                code: `SSRC.${sourceKey}_HALL.NEW_EDIT.RFX_DEMAND_PREQUAL_V2`,
                dataSet: ds,
              },
              <CollapseForm
                formRef={preQualificationFormRef}
                dataSet={ds}
                // labelAlign="right"
                labelLayout="float"
                showLines={5}
                columns={3}
                useWidthPercent
              >
                {this.preQualificationFields(ds)}
              </CollapseForm>
            )}
          </div>
          {!!enableScoreFlag && (
            <div className={classNames(styles['m-b-m'], styles['m-t-m'])}>
              {this.renderPrequalScore(ds, scoreElementDs)}
            </div>
          )}
          {mergeType && mergeType !== 'ALL' && (
            <div className={classNames(styles['rfx-batch-application'])}>
              <a onClick={() => this.handleApplyToGroups(ds, scoreElementDs)}>
                <Icon
                  type="library_add_check-o"
                  className={classNames(styles['rfx-batch-application-icon'])}
                />
                {mergeType === 'GROUP'
                  ? intl
                      .get(`ssrc.inquiryHall.view.message.button.batchMaintainGroup`)
                      .d('批量应用至其他分组')
                  : intl
                      .get(`ssrc.inquiryHall.view.message.button.batchMaintainSection`)
                      .d('批量应用至其他标段')}
              </a>
            </div>
          )}
        </C7nSpin>
      </React.Fragment>
    );
  }

  // 资格预审-评分要素-引用模板
  @Bind()
  async handleTemplateChange(template = {}, options = {}) {
    const {
      rfxInfoDS,
      prequalScoreElementDS,
      operationType = '',
      onRefreshPrequalGroup = () => {},
    } = this.props;
    const { templateId = null } = template || {};
    const { currentSectionHeaderDS = {} } = options || {};
    const {
      prequalHeaderId,
      rfxHeaderId: sourceHeaderId = null,
      templateId: sourceTemplateId = null,
      mergeType,
    } = rfxInfoDS?.current
      ? rfxInfoDS?.current?.get(['prequalHeaderId', 'rfxHeaderId', 'templateId', 'mergeType'])
      : {};
    const { prequalGroupHeaderId } = currentSectionHeaderDS?.current
      ? currentSectionHeaderDS?.current.get(['prequalGroupHeaderId'])
      : {};

    if (!sourceHeaderId || !sourceTemplateId) {
      return;
    }

    if (!templateId) {
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.view.message.confirm.notDefineSE`)
          .d('该模板未定义评分要素'),
      });
      return;
    }

    let result = null;
    const data = {
      organizationId,
      prequalHeaderId,
      operationType,
      sourceHeaderId,
      sourceTemplateId,
      templateId,
      sourceFrom: 'RFX',
      prequalGroupHeaderId, // 分标段
    };

    try {
      if (mergeType) {
        result = await prequalScoreDetailGroupReferenceTemplate(data);
      } else {
        result = await prequalScoreDetailReferenceTemplate(data);
      }

      result = getResponse(result);
      if (!result) {
        return;
      }

      if (prequalGroupHeaderId) {
        onRefreshPrequalGroup();
      } else {
        prequalScoreElementDS.query();
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * 修改分组合并方式
   */
  async handleChangeGroupMergeType(value) {
    const { rfxInfoDS, refreshRfxHeaderAndPrequalGroup } = this.props;
    const sourceProjectId = rfxInfoDS.current?.get('sourceProjectId');
    const rfxHeaderId = rfxInfoDS.current?.get('rfxHeaderId');
    // eslint-disable-next-line no-unused-expressions
    rfxInfoDS.current?.set('prequalMergeType', value);
    const params = {
      organizationId,
      sourceProjectId,
      newMergeType: value,
      tempSourceHeaderId: rfxHeaderId,
    };
    const res = getResponse(await changeGroupMergeType(params));
    if (res) {
      // 刷新数据
      // eslint-disable-next-line no-unused-expressions
      isFunction(refreshRfxHeaderAndPrequalGroup) && refreshRfxHeaderAndPrequalGroup();
    }
  }

  // 资格预审-评分细项
  renderPrequalScore(ds, scoreElementDs) {
    const { sourceHeaderId, operationType } = this.props;

    const tableProps = {
      currentSectionHeaderDS: ds,
      sourceHeaderId,
      prequalScoreElementDS: scoreElementDs,
      handleTemplateChange: this.handleTemplateChange,
      operationType,
    };

    return (
      <div className={styles['m-b-m']}>
        <PrequalScoreElementTable {...tableProps} />
      </div>
    );
  }

  // 资格预审-副标题
  renderPrequalSubTitle() {
    const { prequalMergeTypes, rfxInfoDS, mergeTypeEditorFlag = false } = this.props;
    const mergeType = rfxInfoDS?.current?.get('mergeType');
    return (
      <div className={styles['prequal-sub-title']}>
        <span className={styles['select-no-border']}>
          <C7nSelect
            size="small"
            name="prequalMergeType"
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.prequalMergeType`)
              .d('预审合并方式')}
            value={mergeType}
            dataSet={rfxInfoDS}
            disabled={!mergeTypeEditorFlag}
            onChange={(value) => this.handleChangeGroupMergeType(value)}
          >
            {prequalMergeTypes &&
              prequalMergeTypes.map((item) => (
                <C7nSelect.Option key={item.value} value={item.value}>
                  {item.meaning}
                </C7nSelect.Option>
              ))}
          </C7nSelect>
        </span>
        {mergeType === 'SECTION' && (
          <a onClick={this.handleEditSection}>
            <Icon type="border_color" className={classNames(styles['prequal-edit-icon'])} />
            {intl.get(`ssrc.inquiryHall.view.message.button.editSection`).d('编辑标段')}
          </a>
        )}
        {mergeType === 'GROUP' && (
          <a onClick={this.handleEditGroup}>
            <Icon type="border_color" className={classNames(styles['prequal-edit-icon'])} />
            {intl.get(`ssrc.inquiryHall.view.message.button.editGroup`).d('编辑分组')}
          </a>
        )}
      </div>
    );
  }

  // 渲染预审分组
  renderPrequalGroup() {
    const {
      rfxInfoDS,
      prequalScoreElementDS,
      prequalHeaderDsMap = {},
      prequalScoreElementDsMap = {},
    } = this.props;
    const mergeType = rfxInfoDS?.current?.get('mergeType');
    switch (mergeType) {
      case 'ALL':
        return this.renderPrequalForm(
          Object.values(prequalHeaderDsMap)?.[0],
          Object.values(prequalScoreElementDsMap)?.[0]
        );
      case 'GROUP':
        return (
          <Tabs style={{ marginTop: '16px' }}>
            {prequalHeaderDsMap &&
              Object.entries(prequalHeaderDsMap).map(([key, ds], index) => (
                <TabPane
                  key={key}
                  tab={`${intl.get(`ssrc.inquiryHall.view.message.tab.group`).d('分组')}${
                    index + 1
                  }`}
                >
                  {this.renderPrequalForm(ds, prequalScoreElementDsMap[key])}
                </TabPane>
              ))}
          </Tabs>
        );
      case 'SECTION':
        return (
          <Tabs>
            {prequalHeaderDsMap &&
              Object.entries(prequalHeaderDsMap).map(([key, ds]) => (
                <TabPane key={key} tab={ds?.current?.get('groupName')}>
                  {this.renderPrequalForm(ds, prequalScoreElementDsMap[key])}
                </TabPane>
              ))}
          </Tabs>
        );
      default:
        return this.renderPrequalForm(
          Object.values(prequalHeaderDsMap)?.[0],
          prequalScoreElementDS
        );
    }
  }

  render() {
    const { prequalHeaderDsMap = {}, rfxInfoDS } = this.props;
    const mergeType = rfxInfoDS?.current?.get('mergeType');
    return (
      <div>
        <h4
          id="rfxPreQualification"
          className={classNames(styles['rfx-card-item-title-level-two'], styles['m-t-lg'])}
        >
          <div className={styles['rfx-card-item-title-line']} />
          {intl.get(`ssrc.inquiryHall.view.message.tab.preQualification`).d('资格预审')}
        </h4>

        {mergeType && this.renderPrequalSubTitle()}
        {!isEmpty(prequalHeaderDsMap) && this.renderPrequalGroup()}
      </div>
    );
  }
}
