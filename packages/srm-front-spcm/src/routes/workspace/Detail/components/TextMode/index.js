/*
 * @Description: ContractChapter - 协议用章详情
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-13 11:16:24
 * @LastEditTime: 2024-09-09 17:08:45
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import { Icon, Button as AntButton } from 'hzero-ui';
import { routerRedux } from 'dva/router';
import notification from 'utils/notification';
// import { Icon } from 'hzero-ui';

import classnames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'dva';
import { linkList } from '@/utils/util';
// import ValidateModal from './ValidateModal';
import EditorOnline from '@/routes/components/EditorOnline';

import styles from './index.less';

const commonViewMessage = 'spcm.common.view.message.title';
const CONTRACT_WORKSPACE_MAINTAIN = 'srm.pc-admin.pc-purchaser.workspace2';

@formatterCollections({
  code: ['spcm.DisclaimerSign', 'spcm.common', 'spcm.contractChapter'],
})
@connect(({ global }) => ({
  global,
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const { remoteWorkDetail } = props;
    const remoteProps = remoteWorkDetail
      ? remoteWorkDetail.process(
          'SPCM_WORKSPACE_DETAIL_TEXTMODE_STATE',
          {},
          {
            current: this,
          }
        )
      : {};
    this.state = {
      // focusStatus: -1,
      selectPic: {},
      // loading: true,
      imgHeight: 140,
      currentPic: 0,
      customFileFlag: 0,
      ...remoteProps,
    };
    this.editorOnlineRef = React.createRef();
  }

  // @Bind()
  // handleClickImg(index) {
  //   const { focusStatus } = this.state;
  //   const {picDataSource} = this.props;
  //   this.setState({
  //     focusStatus: focusStatus === index ? -1 : index,
  //     selectPic: picDataSource[index],
  //   });
  // }

  /**
   * 确认手机验证并签章
   */
  @Bind()
  handleOk(values = {}) {
    const { dispatch } = this.props;
    const {
      selectPic,
      // companyId,
      sealType,
    } = this.state;
    const { headerInfo, pcHeaderId } = this.props;
    const { certificateResId, companyId, silentSealFlag } = headerInfo;
    if (!isEmpty(values)) {
      dispatch({
        type: 'contractChapter/confirmMobileChapter',
        payload: {
          pcHeaderId,
          companyId,
          sealPictureUrl: selectPic?.sealPictureUrl,
          sealId: selectPic?.sealId,
          signatureId: selectPic?.signatureId,
          authType: sealType,
          certificateResId,
          ...values,
        },
      }).then((res) => {
        if (res) {
          this.handleCloseModal();
          notification.success();
          // this.goToContractOnlineEdit('#spcm-contract-sign-detail-contract-online-edit');
          if (res.sealLink || silentSealFlag === '1') {
            // 静默签:silentSealFlag === "1" 回到列表页
            if (res.sealLink) {
              window.open(res.sealLink);
            }
            dispatch(
              routerRedux.push({
                pathname: `/spcm/contract-workspace/list`,
              })
            );
          } else {
            this.fetchHeader();
            setTimeout(() => {
              this.editorOnlineRef.fetchEditorOnlineHTML();
            }, 0);
          }
        }
      });
    }
  }

  /**
   * 点击按钮图片移动
   */
  @Bind()
  goToPictureSign(type) {
    const { currentPic, imgHeight } = this.state;
    this.setState({
      currentPic: type === 'up' ? currentPic - (imgHeight + 8) : currentPic + (imgHeight + 8),
    });
  }

  /**
   * 根据用章类型显示提示信息
   * @param {string} authType 用章类型
   * @returns
   */
  getAuthTypeTip = (authType) => {
    switch (authType) {
      case 'FDD':
      case 'FDD_SAAS':
        return intl
          .get('spcm.common.view.message.chapterFDD')
          .d('点击"用章"，在法大大中执行选章签署操作');
      case 'QYS':
      case 'QYS_SAAS':
        return intl
          .get('spcm.common.view.message.chapterQYS')
          .d('点击"用章"，在契约锁中执行选章签署操作');
      default:
        return intl
          .get('spcm.common.view.message.chapterESIGN')
          .d('点击"用章"，在E签宝中执行选章签署操作');
    }
  };

  @Bind()
  renderLeft() {
    const { currentPic } = this.state;
    const { focusStatus } = this.props;
    const {
      picDataSource,
      headerInfo = {},
      isAttachmentSignUpload,
      isAttachmentSignAndText,
    } = this.props;
    const { authType } = headerInfo;
    const { global } = this.props;
    const { menuLeafNode } = global;
    const imgHeight = 140;
    const sealMenuFlag = menuLeafNode.some((item) => {
      return item.path === '/spfm/seal-mange';
    });
    // if (!electronicFlag) {
    //   return (
    //     <div className={styles.disclaimerSignNoDsec}>
    //       {intl.get(`spcm.DisclaimerSign.electronicFlag.setting`).d('请先开启电子签章配置')}
    //     </div>
    //   );
    // }
    if (!picDataSource) {
      return null;
    }
    if (picDataSource.length === 0 && authType === 'ESIGN') {
      return (
        <div className={styles.disclaimerSignNoDsec}>
          {intl.get(`${commonViewMessage}.goChapter`).d('您尚未设置印章，请前往')}
          {sealMenuFlag ? (
            <strong onClick={this.props.skipToSealManage}>
              {intl.get(`${commonViewMessage}.companyChapter`).d('集团管理-印章管理')}
            </strong>
          ) : (
            <span>{intl.get(`${commonViewMessage}.companyChapter`).d('集团管理-印章管理')}</span>
          )}
          {intl.get(`${commonViewMessage}.setChapter`).d('功能设置您的签署印章。')}
        </div>
      );
    }
    // 法大大/契约锁签章只需要一个按钮跳转外部
    if (!(isAttachmentSignUpload || isAttachmentSignAndText) && linkList.includes(authType)) {
      return (
        <div
          style={{
            marginLeft: 15,
            width: '80%',
            minHeight: 100,
            border: '1px solid #d5dae0',
            textAlign: 'center',
            lineHeight: '20px',
            padding: 10,
          }}
        >
          <span style={{ fontWeight: 400, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
            {this.getAuthTypeTip(authType)}
          </span>
        </div>
      );
    }
    return (
      <>
        <div className={styles.disclaimerSignLefttitle}>
          {intl.get(`spcm.DisclaimerSign.contractChapterBtn`).d('印章')}
        </div>
        <div className={styles.disclaimerSignList}>
          <AntButton
            disabled={!currentPic}
            onClick={() => this.goToPictureSign('up')}
            style={{
              display: picDataSource.length > 3 ? 'block' : 'none',
              width: 140,
              marginBottom: '8px',
            }}
          >
            <Icon type="up" />
          </AntButton>
          <div className={styles.disclaimerSignListWrapper}>
            {picDataSource.map((el, index) => {
              return (
                <div
                  className={classnames(styles.disclaimerSignListItem, {
                    [styles.disclaimerSignListSelect]: index + 1 === focusStatus,
                  })}
                  onClick={() => this.props.handleClickImg(index)}
                  style={{ bottom: `${currentPic}px`, height: imgHeight }}
                >
                  <img src={el.sealFileUrl} title={el.sealName} alt={el.sealName} />
                </div>
              );
            })}
          </div>

          <AntButton
            onClick={() => this.goToPictureSign('down')}
            disabled={
              currentPic >= picDataSource.length * (imgHeight + 8) - ((imgHeight + 8) * 3 + 16)
            }
            style={{
              display: picDataSource.length > 3 ? 'block' : 'none',
              marginBottom: 0,
              width: imgHeight,
            }}
          >
            <Icon type="down" />
          </AntButton>
        </div>
      </>
    );
  }

  /**
   * handleClickSeal 点击用章 非手机验证签章
   */
  @Bind()
  handleClickSeal() {
    const { dispatch } = this.props;
    const {
      selectPic,
      // companyId,
      sealType,
    } = this.state;
    const { headerInfo, pcHeaderId } = this.props;
    const { mobileVerifyFlag, supplierCompanyId, companyId, silentSealFlag } = headerInfo;
    if (mobileVerifyFlag && sealType === 'ESIGN') {
      dispatch({
        type: 'contractCommon/fetchVerifyPhoneNum',
        payload: {
          authType: sealType,
          companyId,
          supplierCompanyId,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            // mobileModalVisible: true,
            // verifyPhoneNum: res.phone,
          });
        }
      });
    } else {
      dispatch({
        type: 'contractChapter/confirmChapter',
        payload: {
          sealPictureUrl: selectPic?.sealPictureUrl,
          sealId: selectPic?.sealId,
          signatureId: selectPic?.signatureId,
          pcHeaderId,
          companyId,
          authType: sealType,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          // this.goToContractOnlineEdit('#spcm-contract-sign-detail-contract-online-edit');
          if (res.sealLink || silentSealFlag === '1') {
            // 静默签:silentSealFlag === "1" 回到列表页
            if (res.sealLink) {
              window.open(res.sealLink);
            }
            dispatch(
              routerRedux.push({
                pathname: `/spcm/contract-workspace/list`,
              })
            );
          } else {
            // this.setState({ chapterFlag: false });
            this.fetchHeader();
            setTimeout(() => {
              this.editorOnlineRef.fetchEditorOnlineHTML();
            }, 0);
          }
        }
      });
    }
  }

  @Bind()
  renderleftDom() {
    const { remoteWorkDetail, leftDom } = this.props;
    return remoteWorkDetail
      ? remoteWorkDetail.render('SPCM_WORKSPACE_DETAIL_TEXTMODE_LEFTDOM', leftDom, {
          current: this,
        })
      : leftDom;
  }

  render() {
    const { customFileFlag } = this.state;
    const {
      pcHeaderId,
      // leftDom,
      isSign,
      remoteWorkDetail,
      permissionCode = 'VIEW',
      pcHeaderWorkbenchPreTextFlag = null,
      headerInfo,
      isPub,
      onlyEditReplaceWildcardBefore,
      enableEditShare,
      showContractTextMode = false,
      location,
    } = this.props;
    const {
      taxIncludeAmount,
      templateName,
      pcNum,
      pcName,
      pcKindCodeMeaning,
      pcTypeName,
      pcStatusCode,
    } = headerInfo;
    const oldPageEdit = ['REJECTED', 'SUPPLIER_REJECTED', 'PENDING'].includes(pcStatusCode);
    // 附件合同不限制单据状态
    const intelligentContractPageEdit = showContractTextMode;
    const isOtherPageEdit = oldPageEdit || intelligentContractPageEdit;
    // 控制【协议总额】显隐
    const remoteHiddenAmount = remoteWorkDetail
      ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_HIDDEN_AMOUNT', true)
      : true;
    return (
      <Spin spinning={false}>
        <div
          className={styles.disclaimerSignflex}
          style={
            isSign
              ? {
                  padding: 0,
                }
              : {}
          }
        >
          {!isSign && <div className={styles.disclaimerSignLeft}>{this.renderLeft()}</div>}
          <div className={styles.disclaimerSignRight}>
            <div className={styles.disclaimerSignLefttitle}>
              <div className={styles.titleConent}>
                <div className={styles.titleConentflex}>
                  <div className={styles.title}>{`${pcNum}-${pcName}`}</div>
                  <div className={styles['tag-pcKindCode']}>{pcKindCodeMeaning}</div>
                  <div className={styles['tag-pcTypeName']}>{pcTypeName}</div>
                </div>
                {this.renderleftDom()}
                {/* <ModeTag /> */}
              </div>
              <div className={styles.infoConent}>
                {remoteHiddenAmount && (
                  <div className={styles.infoTag}>
                    {intl.get(`spcm.common.model.amount`).d('协议总额')}: &nbsp;
                    <span className={styles.infoTotal}>{taxIncludeAmount}</span>
                  </div>
                )}
                <div className={styles.infoTag}>
                  {intl.get('spcm.common.model.pcTemplateId').d('协议模板')}: &nbsp;
                  <span className={styles.infoTemplate}>{templateName}</span>
                </div>
              </div>
            </div>
            <EditorOnline
              remote={remoteWorkDetail}
              subLocation={location}
              menuCode={CONTRACT_WORKSPACE_MAINTAIN}
              key={customFileFlag}
              customFileFlag={customFileFlag}
              onRef={(node) => {
                this.props.onRef(node);
              }}
              permissionCode={permissionCode}
              // 根据是否预文本阶段替换查询接口
              pcHeaderWorkbenchPreTextFlag={pcHeaderWorkbenchPreTextFlag}
              // 是否是工作台标识,默认只有工作台使用这个组件
              isContratWorkspace
              isOtherPageEdit={isOtherPageEdit}
              // 开启在线编辑协同，开启是否仅编辑通配符替换前的文件，协议确认/协议提交的，审批表单中使用新的获取url的接口
              isNewAPIUrlFlag={
                isPub &&
                onlyEditReplaceWildcardBefore === '1' &&
                enableEditShare === '1' &&
                ['SUBMITTED', 'APPROVAL_PENDING'].includes(pcStatusCode)
              }
              pcHeaderId={pcHeaderId}
              headerInfo={headerInfo}
              iframeStyle={{
                width: '100%',
                height: 'calc(100vh - 125px)',
              }}
            />
          </div>
        </div>
      </Spin>
    );
  }
}
