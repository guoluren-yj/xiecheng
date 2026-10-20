import React, { Component } from 'react';
import { Modal, Card, Row, Col, Icon } from 'hzero-ui';
import { Button } from 'choerodon-ui/pro';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import styles from './index.less';

const commonViewMessage = 'slod.orderExecution.view.message.title';

/**
 * SealModal - 用章弹窗组件
 * @extends {Component} - React.Component
 * @reactProps {boolean} [sealModalVisible=false] - 模态框是否显示
 * @reactProps {boolean} [fetchVerifyPhoneNumLoading=false] - 获取手机验证码loading
 * @reactProps {boolean} [confirmChapterLoading=false] - 用章确认loading
 * @reactProps {boolean} sealMenuFlag - 是否有印章flag
 * @reactProps {string} focusStatus - 选中印章图片标识
 * @reactProps {number} currentPic - 印章图片图片总宽度
 * @reactProps {number} imgWeight - 印章图片宽度
 * @reactProps {boolean} chapterFlag - 是否已经盖章
 * @reactProps {array} picDataSource - 印章图片源
 * @reactProps {function} onModalOk - 模态框确认回调
 * @reactProps {function} onClose - 模态框关闭回调
 * @reactProps {function} onRef - 绑定组件实例
 * @reactProps {function} onHandleClickImg - 印章点击样式改变
 * @reactProps {function} onGoToPictureSign - 点击按钮图片移动
 * @return {Object} React.element
 */
export default class SealModal extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      imgWeight: 200,
      sealModalVisible: false,
      currentPic: 0,
    };
  }

  /**
   * 点击按钮图片移动
   */
  @Bind()
  goToPictureSign(type) {
    const { currentPic, imgWeight } = this.state;
    this.setState({
      currentPic: type === 'right' ? currentPic - (imgWeight + 16) : currentPic + (imgWeight + 16),
    });
  }

  onOk = async () => {
    const { onModalOk } = this.props;
    const res = await onModalOk();
    if (res) {
      this.setState({
        sealModalVisible: false,
      });
    }
  };

  render() {
    const {
      fetchVerifyPhoneNumLoading = false,
      picDataSource,
      sealMenuFlag,
      confirmChapterLoading = false,
      // chapterFlag, // 已盖章标识,暂不需要
      btnProps,
      sealName = intl.get(`hzero.common.button.sign`).d('签章'),
      focusStatus,
      onHandleClickImg = () => {},
      electricSignStatus,
      disableBtn,
      onSkipToSealManage,
    } = this.props;
    const { sealModalVisible, imgWeight, currentPic } = this.state;
    const okButtonProps = {
      loading: fetchVerifyPhoneNumLoading || confirmChapterLoading,
      disabled: !focusStatus || electricSignStatus === 'SIGNED',
    };

    return (
      <React.Fragment>
        <Modal
          title={intl.get(`slod.orderExecution.view.common.title.sealPicture`).d('印章图片')}
          visible={sealModalVisible}
          onCancel={() => {
            this.setState({
              sealModalVisible: false,
            });
          }}
          onOk={this.onOk}
          okText={intl.get('hzero.common.button.ok').d('确定')}
          okButtonProps={okButtonProps}
          cancelText={intl.get('hzero.common.button.cancel').d('取消')}
          width={600}
        >
          <Card
            key="contractOnlineEdit"
            id="spcm-contract-sign-detail-contract-online-edit"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
          >
            <Row>
              <Col span={24}>
                {picDataSource.length > 0 ? (
                  <div
                    className={styles.sealModal}
                    style={{ marginTop: picDataSource.length > 3 ? 0 : '-16px' }}
                  >
                    <Button
                      disabled={!currentPic}
                      onClick={() => this.goToPictureSign('left')}
                      style={{
                        width: '32px',
                        height: '200px',
                        lineHeight: '200px',
                      }}
                    >
                      <Icon type="left" />
                    </Button>
                    <div className="img-box">
                      <div
                        className="img-box-wrap"
                        style={{
                          transform: `translate3d(${currentPic}px, 0px, 0px)`,
                        }}
                      >
                        {picDataSource.map((el, index) => (
                          <div
                            key={el.sealId}
                            className="eachPic"
                            style={{ height: '200px', width: 200 }}
                          >
                            <img
                              src={el.sealFileUrl}
                              title={el.sealName}
                              alt={el.sealName}
                              onClick={() => onHandleClickImg(index)}
                            />
                            <Icon
                              type="check-circle-o"
                              style={{
                                display: focusStatus === index + 1 ? 'block' : 'none',
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => this.goToPictureSign('right')}
                      disabled={
                        currentPic <=
                        (picDataSource.length * (imgWeight + 16) - ((imgWeight + 16) * 2 + 16)) * -1
                      }
                      style={{
                        width: '32px',
                        height: '200px',
                        lineHeight: '200px',
                      }}
                    >
                      <Icon type="right" />
                    </Button>
                  </div>
                ) : (
                  <div className={styles.noSealImg}>
                    <p>
                      {intl.get(`${commonViewMessage}.goChapter`).d('您尚未设置印章，请前往')}
                      {sealMenuFlag ? (
                        <strong onClick={onSkipToSealManage}>
                          {intl.get(`${commonViewMessage}.companyChapter`).d('集团管理-印章管理')}
                        </strong>
                      ) : (
                        <span>
                          {intl.get(`${commonViewMessage}.companyChapter`).d('集团管理-印章管理')}
                        </span>
                      )}
                      {intl.get(`${commonViewMessage}.setChapter`).d('功能设置您的签署印章。')}
                    </p>
                  </div>
                )}
              </Col>
            </Row>
          </Card>
        </Modal>
        <Button
          style={{ marginRight: '8px' }}
          disabled={disableBtn}
          {...btnProps}
          onClick={() => {
            this.setState({
              sealModalVisible: true,
            });
          }}
        >
          {sealName}
        </Button>
      </React.Fragment>
    );
  }
}
