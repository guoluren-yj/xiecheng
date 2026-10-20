/*
 * @Description: CompareTextMode - 对比文本编辑模式
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-13 11:16:24
 * @LastEditTime: 2025-12-24 15:30:14
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Spin } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, isNil, isNull } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { queryIdpValue } from 'services/api';
import notification from 'utils/notification';

import { updateEditText, getCompareList } from '@/services/workspaceService';
import ModeHeader from './Mode/ModeHeader';
import CompareMode from './Mode/CompareMode';
import EditMode from './Mode/EditMode';
import PopoverCard from './PopoverCard';
import styles from './index.less';

@formatterCollections({
  code: ['spcm.workspace', 'spcm.common'],
})
@connect(({ global }) => ({
  global,
}))
export default class Detail extends Component {
  constructor() {
    super();
    this.state = {
      lookupData: [], // 值集数组
      isEditMode: null, // 1 编辑状态，0 对比状态 ,null/undefined 第一次进入
      compareInfo: null,
      compareList: [],
    };
  }

  componentDidMount() {
    this.getLookupCodeValue();
    this.handleQueryCompareList();
    this.handleRejectNotFileTips();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      headerInfo: { pcHeaderBackContractCompareFlag },
    } = nextProps;
    const { isEditMode } = prevState;
    // 赋初值
    if (pcHeaderBackContractCompareFlag === '1' && isNull(isEditMode)) {
      return {
        isEditMode: '1',
      };
    }
    return null;
  }

  @Bind()
  async getLookupCodeValue() {
    const { onlyEditReplaceWildcardBefore } = this.props;
    let data = getResponse(await queryIdpValue('SPCM.PC_EDIT_AREA'));
    if (data) {
      /**
       * 查询配置表《在线编辑共享配置》字段【仅编辑通配符替换前的文件】onlyEditReplaceWildcardBefore的值，
       * 若=开启，则下拉框可选数据为{驳回版本（替换通配符前），初次版本（替换通配符前），协议模板}
       * 若<>开启，则下拉框可选数据为{驳回版本（替换通配符后），初次版本（替换通配符前），协议模板}
       */
      data = data.filter((item) => {
        if (onlyEditReplaceWildcardBefore === '1') {
          return !['0', '4'].includes(item.value);
        } else {
          return !['3', '4'].includes(item.value);
        }
      });
    }
    this.setState({
      lookupData: data,
    });
  }

  /**
   * 查询对比列表
   */
  handleQueryCompareList = () => {
    const { pcHeaderId, headerInfo } = this.props;
    const { pcHeaderEditArea, pcHeaderQueryArea } = headerInfo || {};
    getCompareList({ pcHeaderId }).then((res) => {
      if (getResponse(res)) {
        let leftUrl;
        let rightUrl;
        res.forEach((item) => {
          if (item?.fileEditArea === (pcHeaderEditArea || '0')) {
            leftUrl = item?.fileUrl;
          }
          if (item?.fileEditArea === (pcHeaderQueryArea || '1')) {
            rightUrl = item?.fileUrl;
          }
        });
        this.setState({
          compareList: res,
          compareInfo: {
            left: {
              fileUrl: leftUrl,
            },
            right: {
              fileUrl: rightUrl,
            },
          },
        });
      }
    });
  };

  /**
   * 更新当前编辑或者只读模式版本
   */
  @Bind()
  handleUpdateEditText(params) {
    const { pcHeaderId, onRefreshData } = this.props;
    updateEditText({ pcHeaderId, ...params }).then((response) => {
      const res = getResponse(response);
      if (res) {
        if (isFunction(onRefreshData)) {
          onRefreshData();
        }
      }
    });
  }

  /**
   * 切换模式
   */
  @Bind()
  handleChangeUpdateMode() {
    const { isEditMode } = this.state;
    this.setState({ isEditMode: !isEditMode });
  }

  // 配置表配置隐藏合同拒绝文本展示，协议状态=审批拒绝/拒绝生效，如果头接口rejectAfterFileUrl没值保存
  @Bind()
  async handleRejectNotFileTips() {
    const { headerInfo, hiddenRejectCompareTextFlag = false, remoteWorkDetail } = this.props;
    const { rejectAfterFileUrl } = headerInfo;
    if (remoteWorkDetail?.event) {
      const res = await remoteWorkDetail.event.fireEvent('handleNotRejectAfterFileUrl', {
        current: this,
      });
      if (!res) {
        return;
      }
    }
    if (hiddenRejectCompareTextFlag && !rejectAfterFileUrl) {
      notification.error({
        description: intl
          .get('spcm.common.view.message.notCreateTextContract')
          .d('请进入合同编辑页创建文本后再操作'),
      });
    }
  }

  render() {
    const {
      pcHeaderId,
      isView,
      enableTemplateEdit,
      leftDom,
      headerInfo,
      onRef,
      loading,
      coordinateable,
      editable,
      coordinatedFlag,
      hiddenRejectCompareTextFlag = false, // 隐藏文本对比
      showContractTextMode = false, // 附件合同
      refreshWpsFlag = false,
      remoteWorkDetail,
    } = this.props;
    const {
      taxIncludeAmount,
      templateName,
      pcNum,
      pcName,
      pcKindCodeMeaning,
      pcTypeName,
      pcHeaderEditArea,
      pcHeaderQueryArea,
      pcHeaderBackContractCompareFlag,
    } = headerInfo;
    const { isEditMode, lookupData, compareInfo, compareList } = this.state;
    // 已经创建文本
    const createdTextFlag = pcHeaderBackContractCompareFlag === '1';
    // isEditMode和hiddenRejectCompareTextFlag都不为true 展示文本对比
    const showCompareModeFlag =
      !isEditMode && !hiddenRejectCompareTextFlag && !showContractTextMode;
    // 展示导航条
    const showPopoverCardFlag =
      !isNil(isEditMode) && !hiddenRejectCompareTextFlag && !showContractTextMode;
    const commomProps = {
      isEditMode: !showCompareModeFlag,
      pcHeaderEditArea: pcHeaderEditArea || '0',
      pcHeaderQueryArea: pcHeaderQueryArea || '1',
      createdTextFlag,
      remoteWorkDetail,
    };
    const modeHeaderProps = {
      ...commomProps,
      editable,
      coordinateable,
      compareList,
      pcHeaderId,
      lookupData,
      compareInfo,
      onSetState: (state) => this.setState(state),
      onUpdateEditText: this.handleUpdateEditText,
    };
    const compareModeProps = {
      ...commomProps,
      compareInfo,
      pcHeaderId,
    };
    const editModeProps = {
      ...commomProps,
      coordinatedFlag,
      isView,
      enableTemplateEdit,
      pcHeaderId,
      onRef,
      hiddenRejectCompareTextFlag,
      showContractTextMode,
      refreshWpsFlag,
    };
    const popoverProps = {
      isEditMode: !showCompareModeFlag,
      onClickAnchor: this.handleChangeUpdateMode,
    };
    const defaultProps = {
      showAmountFlag: true,
    };
    // 获取二开控制属性
    const cuxProps = remoteWorkDetail
      ? remoteWorkDetail.process(
          'SPCM_WORKSPACE_DETAIL_COMPARE_TEXT_MODE_CUX_PROPS',
          defaultProps,
          {
            current: this,
          }
        )
      : defaultProps;
    return (
      <Spin spinning={loading}>
        <div className={styles.disclaimerSignflex} style={{ padding: 0 }}>
          <div className={styles.disclaimerSignRight}>
            <div className={styles.disclaimerSignLefttitle}>
              <div className={styles.titleConent}>
                <div className={styles.titleConentflex}>
                  <div className={styles.title}>{`${pcNum}-${pcName}`}</div>
                  <div className={styles['tag-pcKindCode']}>{pcKindCodeMeaning}</div>
                  <div className={styles['tag-pcTypeName']}>{pcTypeName}</div>
                </div>
                {leftDom}
              </div>
              <div className={styles.infoConent}>
                {cuxProps?.showAmountFlag && (
                  <div className={styles.infoTag}>
                    {intl.get('spcm.common.model.amount').d('协议总额')}: &nbsp;
                    <span className={styles.infoTotal}>{taxIncludeAmount}</span>
                  </div>
                )}
                <div className={styles.infoTag}>
                  {intl.get('spcm.common.model.pcTemplateId').d('协议模板')}: &nbsp;
                  <span className={styles.infoTemplate}>{templateName}</span>
                </div>
              </div>
            </div>
            {!showContractTextMode && <ModeHeader {...modeHeaderProps} />}
            {showCompareModeFlag && <CompareMode {...compareModeProps} />}
            {/** **来回切换可能会产生性能问题******* */}
            {!showCompareModeFlag && <EditMode {...editModeProps} />}
          </div>
          {showPopoverCardFlag && <PopoverCard {...popoverProps} />}
        </div>
      </Spin>
    );
  }
}
