import React, { Component } from 'react';
import { Button } from 'choerodon-ui/pro';
import { Popover, Checkbox, Row, Spin, Tooltip } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import {
  fetchOtherSectionInfo,
  applyToOtherSection,
  fetchOtherGroupInfo,
  applyToOtherGroup,
} from '@/services/inquiryHallNewService';
import OperateSectionPromptModal from '@/routes/components/SectionPanel/OperateSectionPromptModal';
import style from './index.less';

const CheckboxGroup = Checkbox.Group;

export default class ApplyToOtherSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedList: [],
      sectionList: [],
      loading: true,
      visible: false,
      operateSectionData: [], // 应用标段返回数据
      operateSectionPromptFlag: false, // 应用标段弹窗
    };
  }

  getSnapshotBeforeUpdate(preProps) {
    const { rfxId = null } = preProps;
    const { rfxId: curRfxId } = this.props;
    return rfxId !== curRfxId;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        checkedList: [],
      });
    }
  }

  componentWillMount() {
    this.setState({
      checkedList: [],
    });
  }

  @Bind()
  renderOtherSection() {
    const { sectionList, checkedList, loading } = this.state;
    const { mergeType } = this.props;

    return (
      <div className={style.applySectionContainer}>
        <div className="title">
          <a className="selecAll" onClick={this.seclecAll}>
            {intl.get('ssrc.common.view.message.chooseAll').d('全选')}
          </a>
          <a onClick={this.cancleSelect}>{intl.get('hzero.common.button.cancel').d('取消')}</a>
        </div>
        <Spin spinning={loading}>
          {sectionList.length ? (
            <CheckboxGroup
              onChange={this.checkboxChange}
              className="checkbox-grops"
              value={checkedList}
            >
              {sectionList?.map((item) => (
                <Row className="checkbox-line">
                  {mergeType === 'GROUP' ? (
                    <Checkbox value={item.prequalGroupHeaderId} key={item.prequalGroupHeaderId}>
                      <Tooltip
                        placement="right"
                        title={(item.projectLineSections || []).map((section) => (
                          <div>{section.sectionName}</div>
                        ))}
                      >
                        {item.groupName}
                      </Tooltip>
                    </Checkbox>
                  ) : (
                    <Checkbox value={item.projectLineSectionId} key={item.projectLineSectionId}>
                      {item.sectionName}
                    </Checkbox>
                  )}
                </Row>
              ))}
            </CheckboxGroup>
          ) : (
            ''
          )}
        </Spin>
        <div className="footer">
          <Button color="primary" onClick={this.confirm} className="confirm">
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
          <Button onClick={this.cancle}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        </div>
      </div>
    );
  }

  @Bind()
  checkboxChange(checkedList = []) {
    this.setState({
      checkedList,
    });
  }

  @Bind()
  seclecAll() {
    const { sectionList = [] } = this.state;
    const { mergeType } = this.props;
    if (isEmpty(sectionList)) {
      return;
    }

    const ids = [];
    sectionList.forEach((item = {}) => {
      const { projectLineSectionId = null, prequalGroupHeaderId = null } = item;
      let targetName = projectLineSectionId;
      if (mergeType === 'GROUP') {
        targetName = prequalGroupHeaderId;
      }
      if (targetName) {
        ids.push(targetName);
      }
    });

    this.setState({
      checkedList: ids,
    });
  }

  @Bind()
  cancleSelect() {
    this.setState({
      checkedList: [],
    });
  }

  @Bind()
  async confirm() {
    const { checkedList, sectionList = [] } = this.state;
    const { organizationId, rfxId, adjustType, handleSave, mergeType } = this.props;

    if (isEmpty(checkedList)) {
      return;
    }

    const data = sectionList
      .map((item) => {
        const { projectLineSectionId = null, prequalGroupHeaderId = null } = item;
        let targetName = projectLineSectionId;
        if (mergeType === 'GROUP') {
          targetName = prequalGroupHeaderId;
        }
        const isSelected = checkedList.some((id) => id === targetName);

        if (isSelected === false) {
          return false;
        }
        return item;
      })
      .filter(Boolean);

    try {
      const saveResult = await handleSave(true);
      if (!saveResult) {
        return;
      }

      let saveService = applyToOtherSection;
      let params = {
        projectLineSectionList: data,
        organizationId,
        adjustRecordId: rfxId,
        adjustType,
      };
      if (mergeType === 'GROUP') {
        saveService = applyToOtherGroup;
        params = {
          prequalGroupHeaders: data,
          organizationId,
          adjustRecordId: rfxId,
          adjustType,
        };
      }

      const res = getResponse(await saveService(params));

      if (Array.isArray(res) && !isEmpty(res)) {
        this.setState({
          operateSectionData: res,
          operateSectionPromptFlag: true,
        });
        return;
      }
      notification.success();
      this.cancle();
    } catch (error) {
      throw error;
    }
  }

  // 分标段提示弹框-cancel
  handleCancellSectionOperatePrompt = () => {
    this.setState({
      operateSectionData: [],
      operateSectionPromptFlag: false,
    });
  };

  @Bind()
  cancle() {
    this.setState({
      visible: false,
      checkedList: [],
    });
  }

  @Bind()
  async fetchOtherSectionInfo() {
    const {
      rfxId,
      organizationId,
      mergeType,
      prequalGroupHeaderId,
      sourceProjectId,
      tempSourceHeaderId,
    } = this.props;
    this.setState({
      visible: !this.state.visible,
    });

    let fetchService = fetchOtherSectionInfo;
    let params = {
      organizationId,
      adjustRecordId: rfxId,
    };
    if (mergeType === 'GROUP') {
      fetchService = fetchOtherGroupInfo;
      params = {
        prequalGroupHeaderId,
        organizationId,
        sourceProjectId,
        tempSourceHeaderId,
      };
    }

    try {
      this.setState({
        loading: true,
      });
      const sectionList = await getResponse(fetchService(params));
      if (sectionList) {
        this.setState({
          sectionList,
        });
      }
    } catch (error) {
      throw error;
    } finally {
      this.setState({
        loading: false,
      });
    }
  }

  // 应用至其它标段提示modal
  renderApplySectionPromptModal = () => {
    const { operateSectionData = [], operateSectionPromptFlag = false } = this.state;
    // 分标段操作提示modal
    const operateSectionPrompt = {
      dataList: operateSectionData,
      visible: operateSectionPromptFlag,
      handleOk: this.handleCancellSectionOperatePrompt,
      handleCancel: this.handleCancellSectionOperatePrompt,
    };

    return operateSectionPromptFlag ? (
      <OperateSectionPromptModal {...operateSectionPrompt} />
    ) : null;
  };

  render() {
    const { visible } = this.state;
    const { mergeType } = this.props;
    return (
      <div className={style.apply}>
        <Popover
          content={this.renderOtherSection()}
          trigger="click"
          placement="bottomLeft"
          visible={visible}
        >
          <div>
            <a onClick={() => this.fetchOtherSectionInfo()}>
              {mergeType === 'GROUP'
                ? intl
                    .get('ssrc.inquiryHall.view.message.button.batchMaintainGroup')
                    .d('批量应用至其他分组')
                : mergeType === 'SECTION'
                ? intl
                    .get('ssrc.inquiryHall.model.inquiryHall.applyToOtherSection')
                    .d('应用至其他标段')
                : null}
            </a>
          </div>
        </Popover>
        {this.renderApplySectionPromptModal()}
      </div>
    );
  }
}
