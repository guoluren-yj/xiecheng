/**
 * Photoes -商品图片
 * @date: 2019-1-28
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Carousel } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, isUndefined } from 'lodash';
import { PUBLIC_BUCKET } from '_utils/config';
import styles from './Photoes.less';
import UploadPhoto from './UploadImg/index';

export default class Photoes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      currentIndex: undefined, // 当前所选的主图
    };
  }

  componentDidMount() {
    this.switchTicker = setInterval(this.autoSwitch, 5000);
  }

  @Bind()
  switchNext() {
    this.changeAfterPhoto();
  }

  @Bind()
  switchPrev() {
    this.changeBeforePhoto();
  }

  /**
   * 主图切换
   */
  @Bind()
  selectPrimaryImg(params = 0) {
    const {
      onGetPrimaryPhoto,
      detail: { productImageList = [] },
    } = this.props;
    const { fileList } = this.state;
    const data = fileList.length === 0 ? productImageList : fileList;
    this.setState(
      {
        currentIndex: params,
      },
      () => {
        if (onGetPrimaryPhoto) {
          const { imagePath } = data[this.state.currentIndex];
          onGetPrimaryPhoto(imagePath);
        }
      }
    );
  }

  /**
   * 上传成功后的图片
   * @param {*} imgInfo 新上传的图片
   */
  @Bind()
  uploadSuccess(imgList = []) {
    const { onFetchGetPhotoInfo } = this.props;
    if (isFunction(onFetchGetPhotoInfo)) {
      onFetchGetPhotoInfo(imgList);
    }
  }

  /**
   * 删除图片后的回调
   */
  @Bind()
  removeCallback(file = {}) {
    const { onDeletePhotoes } = this.props;
    if (isFunction(onDeletePhotoes)) {
      onDeletePhotoes(file);
    }
  }

  /**
   * 获取主图
   */
  @Bind()
  handPrimaryImage(params = '') {
    const { onGetPrimaryPhoto } = this.props;
    onGetPrimaryPhoto(params);
  }

  render() {
    const {
      detail: { productImageList = [] },
      currentProImage,
    } = this.props;
    const { currentIndex } = this.state;
    return (
      <React.Fragment>
        {productImageList.length > 0 && (
          <div className={styles.carousel}>
            <ul className={styles['carousel-ul']}>
              {/* <li className={styles['li-content']}>
                <div className={styles.prev} onClick={this.switchPrev}>
                  <Icon type="left-circle" />
                </div>
              </li> */}
              <li>
                <ul className={styles['carousel-item']}>
                  <Carousel
                    autoplay
                    className={styles['slick-list']}
                    afterChange={this.changeAfterPhoto}
                    beforeChange={this.changeBeforePhoto}
                  >
                    {productImageList.map((item) => {
                      return (
                        <div>
                          <img src={item.imagePath} alt={item.imagePath} />
                        </div>
                      );
                    })}
                  </Carousel>
                </ul>
              </li>
              {/* <li className={styles['li-content']}>
                <div className={styles.next} onClick={this.switchNext}>
                  <Icon type="right-circle" />
                </div>
              </li> */}
            </ul>
          </div>
        )}
        <div className={styles.upload}>
          <UploadPhoto
            bucketName={PUBLIC_BUCKET}
            bucketDirectory="scec-goods-maintain"
            currentIndex={isUndefined(currentIndex) ? currentProImage : currentIndex}
            defaultFileList={productImageList} // model里面带出来的图片
            onUploadSuccess={this.uploadSuccess}
            removeCallback={this.removeCallback}
            onHandPrimaryImage={this.handPrimaryImage}
            onSelectPrimaryImg={this.selectPrimaryImg}
          />
        </div>
      </React.Fragment>
    );
  }
}
