/*
 * @Description: SealModal - 用章弹窗
 * @Author: ZYF <yanfengz.zhang@hand-china.com>
 * @Date: 2021年4月15日11:04:50
 * @LastEditTime: 2021年4月15日11:04:50
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { Icon } from 'hzero-ui';
import React, { Component, createRef } from 'react';
import { isFunction } from 'lodash';
import classNames from 'classnames';
import intl from 'utils/intl';
import styles from '../index.less';

const commonViewMessage = 'spcm.common.view.message.title';

/**
 * SealModal - 用章弹窗组件
 * @author ZYF <yanfengz.zhang@hand-china.com>
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
    this.contentRef = createRef(null);
  }

  render() {
    const {
      picDataSource,
      sealMenuFlag,
      focusStatus,
      onHandleClickImg = () => {},
      onSkipToSealManage,
    } = this.props;
    return (
      <React.Fragment>
        {picDataSource.length > 0 ? (
          <div className={styles.sealModal}>
            {picDataSource.map((el, index) => (
              <div
                key={el.sealId}
                className={classNames(focusStatus === index + 1 ? 'eachPic' : undefined)}
                style={{ height: 160, width: 160 }}
              >
                <img
                  src={el.sealFileUrl}
                  title={el.sealName}
                  alt={el.sealName}
                  onClick={() => onHandleClickImg(index)}
                />
                <Icon
                  type="check-circle"
                  style={{
                    display: focusStatus === index + 1 ? 'block' : 'none',
                  }}
                />
              </div>
            ))}
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
        {/* <Button
          type="primary"
          onClick={() => {
            this.setState({
              sealModalVisible: true,
            });
          }}
        >
          {children}
        </Button> */}
      </React.Fragment>
    );
  }
}
