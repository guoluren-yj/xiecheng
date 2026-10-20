import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'dva';
import {
  CheckBox,
  Button,
  TextField,
  Modal as ModalPro,
  Pagination,
  Tooltip,
  Dropdown,
  Menu,
} from 'choerodon-ui/pro';
import { Icon, notification } from 'choerodon-ui';
import { toJS } from 'mobx';
import { isEmpty, cloneDeep } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { checkPermission } from 'services/api';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import QuickReply from '@/components/QuickReply';
import QuickReplyAllScreen from '@/components/QuickReply/AllScreen';
import BatchActionModal from './BatchActionModal';
import styles from './index.less';

const confirmModalKey = ModalPro.key();

const PermissionCodeMap = {
  approved: 'hzero.wp.self.approval-workbenck.button.batch.approval',
  rejected: 'hzero.wp.self.approval-workbenck.api.batch.reject',
  delegate: 'hzero.wp.self.approval-workbenck.button.batch.delegate',
  addsign: 'hzero.wp.self.approval-workbenck.button.batch.addSign',
  approveandaddsign: 'hzero.wp.self.approval-workbenck.button.batch.approvalAndAddSign',
};

@connect(({ task }) => ({
  newTask: task,
}))
export default class FooterButtons extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.textAreaRef = null;
    this.state = {
      checked: false,
      checkedSize: 0,
      opeartionFlag: false,
      showQuickReply: false,
      showAllScreen: false,
      btnPermissions: {
        approved: false,
        rejected: false,
        delegate: false,
        addsign: false,
        approveandaddsign: false,
      },
      moreBtnVisible: false,
    };
  }

  componentDidMount() {
    this.fetchCommentPermission();
  }

  fetchCommentPermission = () => {
    checkPermission([
      PermissionCodeMap.approved,
      PermissionCodeMap.rejected,
      PermissionCodeMap.delegate,
      PermissionCodeMap.addsign,
      PermissionCodeMap.approveandaddsign,
    ]).then((data) => {
      if (getResponse(data) && data && Array.isArray(data)) {
        const btnPermissions = {
          approval: false,
          reject: false,
          delegate: false,
          addSign: false,
          approvalAndAddSign: false,
        };
        data.forEach((item) => {
          switch (item.code) {
            case PermissionCodeMap.approved: {
              btnPermissions.approved = item.approve;
              break;
            }
            case PermissionCodeMap.rejected: {
              btnPermissions.rejected = item.approve;
              break;
            }
            case PermissionCodeMap.delegate: {
              btnPermissions.delegate = item.approve;
              break;
            }
            case PermissionCodeMap.addsign: {
              btnPermissions.addsign = item.approve;
              break;
            }
            case PermissionCodeMap.approveandaddsign: {
              btnPermissions.approveandaddsign = item.approve;
              break;
            }
            default: {
              break;
            }
          }
        });
        this.setState({
          btnPermissions,
        });
      }
    });
  };

  handleShowAllScreen = (showValue) => {
    const {
      handleTableHeight,
      operatorDs,
      newTask: { replyValueNew },
    } = this.props;
    if (operatorDs.current.get('approvalOpinion') === replyValueNew?.replace(/\n|\r/g, '')) {
      operatorDs.current.set('approvalOpinion', replyValueNew);
    }
    handleTableHeight(true, showValue, true);
    this.setState({
      showAllScreen: showValue,
      showQuickReply: showValue,
    });
  };

  // 点击非快捷回复的div，关闭快捷回复
  closeQuickReply = () => {
    const {
      handleTableHeight,
      operatorDs,
      newTask: { replyValueNew },
    } = this.props;
    if (operatorDs.current.get('approvalOpinion') === replyValueNew?.replace(/\n|\r/g, '')) {
      operatorDs.current.set('approvalOpinion', replyValueNew);
    }
    const quickReplyDom = document.getElementById('quick-reply-content');
    if (quickReplyDom) {
      this.setState({ showQuickReply: false, showAllScreen: false });
      handleTableHeight(false, false, true);
    }
  };

  @Bind()
  openEditModal() {
    this.setState({ showQuickReply: true, showAllScreen: true });
  }

  handleFocus = (value) => {
    const { handleTableHeight } = this.props;
    const { showAllScreen } = this.state;
    this.setState({ showQuickReply: value });
    handleTableHeight(true, showAllScreen, true);
  };

  @Debounce(200)
  @Bind()
  async handleClick(action) {
    if (['delegate', 'addsign', 'approveandaddsign'].includes(action)) {
      this.handleOpenBatchActionModal(action);
    } else if (['rejected', 'approved'].includes(action)) {
      return this.handleSubmit(action);
    } else {
      return false;
    }
  }

  @Bind()
  async handleSubmit(value) {
    const { operatorDs } = this.props;
    operatorDs.current.set('batchOperation', value);
    setTimeout(async () => {
      const flag = await operatorDs.validate();
      if (!flag) {
        return false;
      }
      if (value === 'rejected') {
        ModalPro.open({
          key: confirmModalKey,
          movable: false,
          closable: true,
          className: styles['common-modal'],
          title: intl.get('hzero.common.message.confirm.title').d('提示?'),
          children: intl.get('swfl.common.message.confirmReject').d('是否确认审批拒绝?'),
          onOk: this.handleConfirm,
        });
      } else {
        this.handleConfirm();
      }
    }, 0);
  }

  @Bind()
  handleConfirm() {
    const { onSubmit } = this.props;
    if (onSubmit) {
      onSubmit();
      const key = `open${Date.now()}`;
      notification.open({
        key,
        duration: 3,
        placement: 'bottomRight',
        className: styles['loading-notification'],
        message: (
          <span className={styles['loading-notification-title']}>
            <Icon type="approval-o" />
            <span>{intl.get('hwfp.common.view.message.approvaling').d('审批中')}</span>
          </span>
        ),
        description: (
          <div className={styles['loading-notification-content']}>
            <div>{intl.get('hwfp.task.view.message.tip1').d('批量审批中……')}</div>
            <div>
              {intl
                .get('hwfp.task.view.message.tip2')
                .d(
                  '单据后台处理中，您可以离开当前页面，审批失败的单据，将通过系统消息展示失败原因，并重新展示在待办列表中。'
                )}
            </div>
          </div>
        ),
        // btn: (
        //   <Button
        //     className={styles['loading-notification-btn']}
        //     onClick={() => this.handleCloseModal(key)}
        //   >
        //     {intl.get('hwfp.common.view.button.know').d('知道了')}
        //   </Button>
        // ),
      });
    }
  }

  // @Bind()
  // handleCloseModal(key) {
  //   const { afterSubmit } = this.props;
  //   notification.close(key);
  //   if (afterSubmit) {
  //     afterSubmit();
  //   }
  // }

  @Bind()
  handleOpeartionType() {
    const { operatorDs } = this.props;
    const record = operatorDs.current;
    record.set('approvalOpinion', '');
    record.getField('approvalOpinion').reset();
  }

  @Bind()
  handleCheckedAll(checked) {
    const { operatorDs, onCheck } = this.props;
    this.setState({
      checked,
    });
    if (!checked) {
      operatorDs.current.reset();
    }
    if (onCheck) {
      onCheck(checked);
    }
  }

  @Bind()
  handleBatchOperation() {
    const { opeartionFlag } = this.state;
    const { operatorDs, onBatchOperation } = this.props;
    const newOpeartionFlag = !opeartionFlag;
    if (!newOpeartionFlag) {
      operatorDs.reset();
    }
    this.setState({
      opeartionFlag: newOpeartionFlag,
    });
    if (onBatchOperation) {
      onBatchOperation(newOpeartionFlag);
    }
  }

  @Bind()
  async handleBatchActionSubmit(action) {
    const { operatorDs } = this.props;
    // 判断审批意见是否必填
    if (!operatorDs.current.get('approvalOpinion')) {
      ModalPro.warning({
        movable: false,
        center: true,
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl.get('hwfp.task.view.message.required.comment').d('请输入审批意见'),
      });
      return false;
    }
    // 判断有无转交人
    const batchSelected = toJS(operatorDs.current.get('batchSelected'));
    if (isEmpty(batchSelected)) {
      const actionContent = {
        delegate: intl.get('hwfp.task.view.message.pleaseChooseDelegater').d('请选择转交人'),
        addsign: intl.get('hwfp.task.view.title.pleaseChooseAddSigner').d('请选择选择加签人'),
        approveandaddsign: intl
          .get('hwfp.task.view.title.pleaseChooseAddSigner')
          .d('请选择选择加签人'),
      };
      ModalPro.warning({
        movable: false,
        center: true,
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: actionContent[action],
      });
      return false;
    }
    this.handleSubmit(action);
    return true;
  }

  @Bind()
  handleOpenBatchActionModal(action) {
    const { operatorDs } = this.props;
    // 重置
    operatorDs.current.set('batchSelected', undefined);
    operatorDs.current.set('batchOperation', action);
    const actionTitle = {
      delegate: intl.get('hwfp.task.view.option.batch.delegate').d('批量转交'),
      addsign: intl.get('hwfp.task.view.option.batch.addSign').d('批量加签'),
      approveandaddsign: intl
        .get('hwfp.task.view.option.batch.approveAndAddSign')
        .d('批量同意并加签'),
    };
    const actionLabel = {
      delegate: intl.get('hwfp.task.view.title.chooseDelegater').d('选择转交人'),
      addsign: intl.get('hwfp.task.view.title.chooseAddSigner').d('选择加签人'),
      approveandaddsign: intl.get('hwfp.task.view.title.chooseAddSigner').d('选择加签人'),
    };
    const actionSelectMultiple = {
      delegate: false,
      addsign: true,
      approveandaddsign: true,
    };
    ModalPro.open({
      title: actionTitle[action],
      drawer: true,
      maskClosable: false,
      closable: true,
      className: styles['batch-action-modal'],
      okText: intl.get('hzero.common.button.ok').d('确定'),
      onOk: () => this.handleBatchActionSubmit(action),
      children: (
        <BatchActionModal
          operatorDs={operatorDs}
          selectLabel={actionLabel[action]}
          selectMultiple={actionSelectMultiple[action]}
        />
      ),
    });
  }

  @Bind()
  renderApprovalAction() {
    const { btnPermissions } = this.state;
    const {
      newTask: { approvalActionSeqMap, approvalActionTooltipMap },
    } = this.props;
    const actionCodes = Object.keys(btnPermissions).filter((item) => btnPermissions[item]);
    const actionNameMap = {
      approved: intl.get('hwfp.task.view.option.approved', { name: '审批通过' }).d('审批通过'),
      rejected: intl.get('hwfp.task.view.option.rejected', { name: '审批拒绝' }).d('审批拒绝'),
      delegate: intl.get('hwfp.task.view.option.delegate', { name: '转交' }).d('转交'),
      addsign: intl.get('hwfp.task.view.option.addUser', { name: '加签' }).d('加签'),
      approveandaddsign: intl
        .get('hwfp.task.view.option.ApproveAndAddSign', { name: `同意并加签` })
        .d('同意并加签'),
    };
    const actionColor = {
      approved: 'green',
      rejected: 'red',
      more: '#1984F7',
    };
    const seqMap = cloneDeep(approvalActionSeqMap);
    if (!actionCodes.includes('approved')) {
      delete seqMap.approved;
    }
    if (!actionCodes.includes('rejected')) {
      delete seqMap.rejected;
    }
    // 最多展示3个按钮，多余的合并到更多里
    const buttonLimit = 3;
    if (actionCodes.length <= buttonLimit) {
      delete seqMap.more;
    }
    const sortCodes = Object.values(seqMap)
      .sort()
      .map((item) => {
        if (item === seqMap.approved) {
          return 'approved';
        } else if (item === seqMap.rejected) {
          return 'rejected';
        } else if (item === seqMap.more) {
          return 'more';
        }
        return null;
      })
      .filter(Boolean);
    // 排序后的所有审批按钮
    let sortedActionCodes = sortCodes.concat(
      actionCodes.filter((code) => !sortCodes.includes(code))
    );
    const displayActions = sortCodes.filter((code) => ['approved', 'rejected'].includes(code));
    if (actionCodes.length > buttonLimit) {
      const moreButtonIndex = sortedActionCodes.findIndex((code) => code === 'more');
      // 如果只有more 没有同意、拒绝、驳回按钮，则更多按钮放到最后
      // 如果有同意或拒绝按钮，但更多按钮不在最后，也要调整
      if (
        moreButtonIndex !== buttonLimit - 1 &&
        (displayActions.length === 0 || moreButtonIndex !== 0)
      ) {
        sortedActionCodes = sortedActionCodes.filter((code) => code !== 'more');
        sortedActionCodes.splice(buttonLimit - 1, 0, 'more');
      }
    }
    const showActionCodes = sortedActionCodes.slice(0, buttonLimit);
    const moreActionCodes = sortedActionCodes.slice(buttonLimit);
    return showActionCodes.map((actionCode) => {
      if (actionCode === 'more') {
        return (
          <Dropdown
            placement="topLeft"
            onVisibleChange={(v) => {
              this.setState({
                moreBtnVisible: v,
              });
            }}
            overlay={
              <Menu className={styles['more-action-menu-list']}>
                {moreActionCodes.map((code) => (
                  <Menu.Item
                    key={code}
                    onClick={() => {
                      if (this.state.moreBtnVisible) {
                        this.setState({
                          moreBtnVisible: false,
                        });
                        this.handleClick(code);
                      }
                    }}
                  >
                    <Tooltip title={approvalActionTooltipMap[code]} placement="left">
                      <a>{actionNameMap[code]}</a>
                    </Tooltip>
                  </Menu.Item>
                ))}
              </Menu>
            }
          >
            <Button>{intl.get('hzero.common.button.option').d('更多')}</Button>
          </Dropdown>
        );
      } else {
        return (
          <Tooltip title={approvalActionTooltipMap[actionCode]}>
            <Button
              color={actionColor[actionCode] || 'default'}
              onClick={() => this.handleClick(actionCode)}
            >
              {actionNameMap[actionCode]}
            </Button>
          </Tooltip>
        );
      }
    });
  }

  render() {
    const { checked, checkedSize, showQuickReply, showAllScreen, btnPermissions } = this.state;
    const { tableDs, operatorDs, handleTableHeight, renderExtraButtons } = this.props;
    const hasAction = Object.keys(btnPermissions).some((item) => btnPermissions[item]);
    return (
      <div
        onClick={this.closeQuickReply}
        style={{ borderTop: '1px #f5f5f5 solid' }}
        ref={(ref) => {
          this.footerContent = ref;
        }}
      >
        {showQuickReply && showAllScreen && (
          <QuickReplyAllScreen
            width="calc(100% - 32px)"
            left="0"
            margin="10px 16px 0"
            dataSetValue={operatorDs}
            dataSetName="approvalOpinion"
            isShowAllScreen={this.handleShowAllScreen}
            handleTableHeight={handleTableHeight}
            closeQuickReply={this.closeQuickReply}
            footerRef={this.footerContent}
          />
        )}
        <div
          className={styles['footer-buttons']}
          style={{ flexShrink: 0, alignItems: showQuickReply && !showAllScreen ? 'flex-end' : '' }}
        >
          {!checked || !hasAction ? (
            <div className={styles['footer-buttons-left']} style={{ flex: '0 0 auto' }}>
              {renderExtraButtons && renderExtraButtons()}
              <Pagination dataSet={tableDs} pageSizeOptions={['10', '20', '50']} maxPageSize={50} />
            </div>
          ) : (
            <div
              className={styles['footer-buttons-left']}
              style={{ alignItems: showQuickReply && !showAllScreen ? 'flex-end' : '' }}
            >
              {showQuickReply && !showAllScreen && (
                <QuickReply
                  width={
                    (document.getElementById('textContent')?.getBoundingClientRect()?.width || 20) -
                    20
                  }
                  left={
                    document.getElementById('textContent')?.parentElement?.parentElement?.offsetLeft
                  }
                  margin="10px 30px 12px 24px"
                  dataSetValue={operatorDs}
                  dataSetName="approvalOpinion"
                  isShowAllScreen={this.handleShowAllScreen}
                  handleTableHeight={handleTableHeight}
                  closeQuickReply={this.closeQuickReply}
                  footerRef={this.footerContent}
                />
              )}
              <TextField
                dataSet={operatorDs}
                name="approvalOpinion"
                className={styles['reply-text-field']}
                placeholder={intl.get('hwfp.task.view.message.comment').d('审批意见')}
                clearButton
                showValidation="tooltip"
                style={{
                  flex: '1 1 auto',
                  margin: '0 30px 0 24px',
                  display: `${showQuickReply && !showAllScreen ? 'none' : ''}`,
                  zIndex: `${showQuickReply && showAllScreen ? '-100' : '0'}`,
                }}
                suffix={
                  <span
                    style={{ cursor: 'pointer', marginLeft: '4px' }}
                    onClick={this.openEditModal}
                  >
                    <Tooltip title={intl.get('hwfp.task.button.fullScrennEdit').d('全屏编辑')}>
                      <Icon type="zoom_out_map" style={{ fontSize: '14px' }} />
                    </Tooltip>
                  </span>
                }
                id="textContent"
                // onFocus={this.handleFocus}
                onClick={(e) => {
                  e.stopPropagation();
                  this.handleFocus(true);
                }}
              />
              {this.renderApprovalAction()}
            </div>
          )}
          <div className={styles['footer-buttons-right']}>
            {checked && hasAction && (
              <>
                {renderExtraButtons && renderExtraButtons()}
                <CheckBox dataSet={operatorDs} name="checkedAll" onChange={this.handleCheckedAll} />
                <span
                  className={classnames(
                    styles['label-title'],
                    styles['label-title-noAfter'],
                    styles['label-title-separated']
                  )}
                  style={{ marginRight: '16px' }}
                >
                  {intl.get('hzero.common.button.selectAll').d('全选')}
                </span>
                {checked && (
                  <>
                    <span
                      className={styles['operation-tip']}
                      style={{
                        verticalAlign: 'bottom',
                        paddingLeft: '16px',
                        borderLeft: '1px solid #000',
                      }}
                    >
                      {intl
                        .get('hwfp.task.view.tip.batchOperationSize', { size: checkedSize })
                        .d(`批量处理本页${checkedSize}个事项`)}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}
