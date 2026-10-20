/*
 * @Description: ContractChapter - 协议用章详情
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-13 11:16:24
 * @LastEditTime: 2024-12-19 10:11:54
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { DataSet, Lov, Button, Modal } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import { getUserOrganizationId, getResponse } from 'utils/utils';
import { Icon, Button as AntButton } from 'hzero-ui';
// import { Icon } from 'hzero-ui';

import classnames from 'classnames';
import {
  querySealPictures,
  queryElectronicFlag,
  queryIsSign,
  queryPhoneNumber,
  signDocument,
  smsParam,
} from '@/services/disclaimerSignService';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'dva';
import { openTab } from 'utils/menuTab';
import ValidateModal from './ValidateModal';
import EditorOnline from './OldEditorOnline';

import styles from './index.less';

const commonViewMessage = 'spcm.common.view.message.title';

@formatterCollections({
  code: ['spcm.DisclaimerSign', 'spcm.common', 'spcm.contractChapter'],
})
@connect(({ global }) => ({
  global,
}))
export default class Detail extends Component {
  constructor() {
    super();
    this.ds = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'companyLov',
          type: 'object',
          lovCode: 'SPCM.CERTIFICATION_COMPANY_INFO',
          required: true,
        },
      ],
      events: {
        update: this.handleDataSetChange,
      },
    });
    this.state = {
      picDataSource: '',
      focusStatus: -1,
      companyId: '',
      selectPic: {},
      loading: true,
      verifyPhoneNum: '',
      mobileModalVisible: false,
      mobileChapterLoading: false,
      electronicFlag: 0,
      isSign: false,
      imgHeight: 140,
      currentPic: 0,
    };
    this.editorOnlineRef = React.createRef();
  }

  componentDidMount() {
    /**
     * 是否电签
     */
    queryElectronicFlag().then((res) => {
      if (getResponse(res)) {
        this.setState({
          electronicFlag: res,
        });
      }
    });
    this.handleQueryIsSign();
  }

  @Bind()
  handleQueryIsSign() {
    this.setState({
      loading: true,
    });
    queryIsSign()
      .then((res) => {
        if (getResponse(res)) {
          this.setState({
            isSign: res,
          });
        }
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  }

  @Bind()
  handleDataSetChange({ record, name, value, oldValue }) {
    if (name === 'companyLov') {
      this.setState({
        companyId: value?.companyId,
      });
      this.fetchSealPictures(value?.companyId);
    }
  }

  @Bind()
  async fetchSealPictures(companyId) {
    if (companyId) {
      querySealPictures({
        lovCode: 'SPFM.COMPANY_SEAL',
        companyId,
        tenantId: getUserOrganizationId(),
        sealType: 'ESIGN',
      }).then((res) => {
        if (getResponse(res)) {
          const picDataSource = res.filter((item) => {
            return item.sealFileUrl !== null && item.enabledFlag !== 0;
          });
          this.setState({
            picDataSource,
          });
        }
      });
    } else {
      this.setState({
        picDataSource: '',
      });
    }
    this.setState({
      selectPic: {},
      focusStatus: -1,
    });
  }

  @Bind()
  handleClickImg(index) {
    const { focusStatus, picDataSource } = this.state;
    this.setState({
      focusStatus: focusStatus === index ? -1 : index,
      selectPic: picDataSource[index],
    });
  }

  /**
   * 关闭手机验证modal
   */
  @Bind()
  handleCloseModal() {
    this.setState({
      mobileModalVisible: false,
    });
  }

  /**
   * 确认手机验证并签章
   */
  @Bind()
  handleOk(values = {}) {
    const { selectPic, companyId } = this.state;
    this.setState({
      mobileChapterLoading: true,
    });
    if (!isEmpty(values)) {
      signDocument({
        companyId,
        sealPictureUrl: selectPic?.sealPictureUrl,
        sealId: selectPic?.sealId,
        signatureId: selectPic?.signatureId,
        authType: 'ESIGN',
        certificateResId: this.certificateResId,
        ...values,
      })
        .then((res) => {
          if (getResponse(res)) {
            this.handleCloseModal();
            this.handleQueryIsSign();
            this.editorOnlineRef.fetchEditorOnlineHTML();
          }
          this.setState({
            mobileChapterLoading: false,
          });
        })
        .catch(() => {
          this.setState({
            mobileChapterLoading: false,
          });
        });
    }
  }

  /**
   * 跳转到印章管理
   */
  @Bind()
  skipToSealManage() {
    openTab({
      key: '/spfm/seal-mange',
      title: 'srm.bg.manager.seal.manage',
    });
  }

  @Bind()
  btnComfire() {
    Modal.confirm({
      title: intl.get(`spcm.DisclaimerSign.btnComfire.textTitle`).d('无意愿签署确认'),
      children: (
        <div>
          {intl
            .get(`spcm.DisclaimerSign.btnComfire.text`)
            .d('订单发布后，采购方将不再进行意愿签署。')}
        </div>
      ),
      onOk: () => {
        queryPhoneNumber().then((res) => {
          if (getResponse(res)) {
            this.setState({
              verifyPhoneNum: res,
              mobileModalVisible: true,
            });
          } else {
            this.setState({
              verifyPhoneNum: '',
            });
          }
        });
      },
    });
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
   * 获取手机验证码
   */
  @Bind()
  getVerifyCode(res) {
    const { dispatch } = this.props;
    const { companyId, verifyPhoneNum } = this.state;
    this.certificateResId = res.certificateResId;
    dispatch({
      type: 'contractChapter/getVerifyCode',
      payload: {
        companyId,
        mobile: verifyPhoneNum,
        certificateResId: res.certificateResId,
      },
    });
  }

  @Bind()
  getVerifyData() {
    const { companyId } = this.state;
    smsParam(companyId).then((res) => {
      if (getResponse(res)) {
        this.getVerifyCode(res);
      }
    });
  }

  @Bind()
  renderLeft() {
    const { picDataSource, focusStatus, companyId, electronicFlag, currentPic } = this.state;
    const { global } = this.props;
    const { menuLeafNode } = global;
    const imgHeight = 140;
    const sealMenuFlag = menuLeafNode.some((item) => {
      return item.path === '/spfm/seal-mange';
    });
    if (!companyId) {
      return (
        <div className={styles.disclaimerSignNoDsec}>
          {intl
            .get(`spcm.DisclaimerSign.companyGroupName.select`)
            .d('您尚未选择公司，请在当前页上方选择签署对应的集团公司。')}
        </div>
      );
    }
    if (!electronicFlag) {
      return (
        <div className={styles.disclaimerSignNoDsec}>
          {intl.get(`spcm.DisclaimerSign.electronicFlag.setting`).d('请先开启电子签章配置')}
        </div>
      );
    }
    if (!picDataSource) {
      return null;
    }
    if (picDataSource.length === 0) {
      return (
        <div className={styles.disclaimerSignNoDsec}>
          {intl.get(`${commonViewMessage}.goChapter`).d('您尚未设置印章，请前往')}
          {sealMenuFlag ? (
            <strong onClick={this.skipToSealManage}>
              {intl.get(`${commonViewMessage}.companyChapter`).d('集团管理-印章管理')}
            </strong>
          ) : (
            <span>{intl.get(`${commonViewMessage}.companyChapter`).d('集团管理-印章管理')}</span>
          )}
          {intl.get(`${commonViewMessage}.setChapter`).d('功能设置您的签署印章。')}
        </div>
      );
    }
    return (
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
                  [styles.disclaimerSignListSelect]: index === focusStatus,
                })}
                onClick={() => this.handleClickImg(index)}
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
    );
  }

  render() {
    const {
      loading,
      verifyPhoneNum,
      mobileModalVisible,
      mobileChapterLoading,
      isSign,
      electronicFlag,
      companyId,
      selectPic,
    } = this.state;
    const validateModalProps = {
      verifyPhoneNum,
      mobileModalVisible,
      mobileChapterLoading,
      onClose: this.handleCloseModal,
      onModalOk: this.handleOk,
      getVerifyCode: this.getVerifyData,
    };
    return (
      <>
        <Header title={intl.get(`spcm.DisclaimerSign.title`).d('订单无意愿签署确认')}>
          {!isSign && (
            <Button
              onClick={this.btnComfire}
              color="primary"
              icon="check"
              disabled={!electronicFlag || !companyId || isEmpty(selectPic)}
            >
              {intl.get(`spcm.DisclaimerSign.btnComfire`).d('确认用章')}
            </Button>
          )}
          {!isSign && (
            <div className={styles.currentCcompany}>
              <span className={styles.currentCcompanytitle}>
                {intl.get(`spcm.DisclaimerSign.companyGroupName`).d('集团公司')}
              </span>
              <Lov
                showValidation="tooltip"
                name="companyLov"
                dataSet={this.ds}
                modalProps={{
                  style: {
                    width: '700px',
                  },
                }}
                placeholder={intl
                  .get(`spcm.DisclaimerSign.companyGroupNamePlaceholder`)
                  .d('请选择签署对应的集团公司')}
              />
            </div>
          )}
        </Header>
        <Content
          style={{
            padding: 0,
          }}
        >
          <Spin spinning={loading}>
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
              {!isSign && (
                <div className={styles.disclaimerSignLeft}>
                  <div className={styles.disclaimerSignLefttitle}>
                    {intl.get(`spcm.DisclaimerSign.contractChapterBtn`).d('印章')}
                  </div>
                  {this.renderLeft()}
                </div>
              )}
              <div className={styles.disclaimerSignRight}>
                <div className={styles.disclaimerSignLefttitle}>
                  {intl.get(`spcm.DisclaimerSign.DisclaimersText`).d('免责声明')}
                </div>
                <EditorOnline
                  onRef={(node) => {
                    this.editorOnlineRef = node;
                  }}
                  iframeStyle={{
                    width: '100%',
                    height: `${(document?.body?.clientHeight - 96) * 0.9 > 500
                        ? (document?.body?.clientHeight - 96) * 0.9
                        : 500
                      }px`,
                  }}
                />
              </div>
            </div>
            <ValidateModal {...validateModalProps} />
          </Spin>
        </Content>
      </>
    );
  }
}
