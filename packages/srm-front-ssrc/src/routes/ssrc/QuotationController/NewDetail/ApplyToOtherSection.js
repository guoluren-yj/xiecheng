import React, { Component } from 'react';
import { Button } from 'choerodon-ui/pro';
import { Popover, Checkbox, Row, Spin } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { fetchOtherSectionInfo, applyToOtherSection } from '@/services/inquiryHallNewService';
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
    const { remote, adjustType } = this.props;
    const { sectionList, checkedList, loading } = this.state;

    const isHidden = remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_APPLY_TO_OTHER_SECTION_DISABLED',
          false,
          {
            adjustType,
          }
        )
      : false;

    return (
      <div className={style.applySectionContainer}>
        {!isHidden && (
          <div className="title">
            <a className="selecAll" onClick={this.seclecAll}>
              {intl.get('ssrc.common.view.message.chooseAll').d('全选')}
            </a>
            <a onClick={this.cancleSelect}>{intl.get('hzero.common.button.cancel').d('取消')}</a>
          </div>
        )}
        <Spin spinning={loading}>
          {sectionList.length ? (
            <CheckboxGroup
              onChange={this.checkboxChange}
              className="checkbox-grops"
              value={checkedList}
              disabled={isHidden}
            >
              {sectionList?.map((item) => (
                <Row className="checkbox-line">
                  <Checkbox value={item.projectLineSectionId} key={item.projectLineSectionId}>
                    {item.sectionName}
                  </Checkbox>
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
    if (isEmpty(sectionList)) {
      return;
    }

    const ids = [];
    sectionList.forEach((item = {}) => {
      const { projectLineSectionId = null } = item;
      if (projectLineSectionId) {
        ids.push(projectLineSectionId);
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
    const { organizationId, rfxId, adjustType, handleSave } = this.props;

    if (isEmpty(checkedList)) {
      return;
    }

    const data = sectionList
      .map((item) => {
        const { projectLineSectionId = null } = item;
        const isSelected = checkedList.some((id) => id === projectLineSectionId);

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

      const res = getResponse(
        await applyToOtherSection({
          projectLineSectionList: data,
          organizationId,
          adjustRecordId: rfxId,
          adjustType,
        })
      );

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
    const { rfxId, organizationId, remote, adjustType } = this.props;
    this.setState({
      visible: !this.state.visible,
    });

    try {
      this.setState({
        loading: true,
      });
      const sectionList = await getResponse(
        fetchOtherSectionInfo({
          organizationId,
          adjustRecordId: rfxId,
        })
      );
      if (sectionList) {
        this.setState({
          sectionList,
        });
        // 安琪酵母 二开
        if (remote?.event) {
          remote.event.fireEvent('defaultAllSelectApplyOther', {
            seclecAll: this.seclecAll,
            adjustType,
          });
        }
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
              {intl
                .get('ssrc.inquiryHall.model.inquiryHall.applyToOtherSection')
                .d('应用至其他标段')}
            </a>
          </div>
        </Popover>
        {this.renderApplySectionPromptModal()}
      </div>
    );
  }
}
