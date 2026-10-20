/**
 * Photoes -商品图片
 * @date: 2019-1-28
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Carousel } from 'hzero-ui';
import styles from './Photoes.less';

export default class Photoes extends Component {
  componentDidMount() {
    this.switchTicker = setInterval(this.autoSwitch, 5000);
  }

  render() {
    const {
      detail: { productImageList = [] },
    } = this.props;
    return (
      <React.Fragment>
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
                  {productImageList.map(item => {
                    return (
                      <img src={item.imagePath} key={item.productImageId} alt={item.position} />
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
        <div className={styles.upload}>
          {productImageList.map(item => {
            return <img src={item.imagePath} key={item.productImageId} alt={item.position} />;
          })}
        </div>
      </React.Fragment>
    );
  }
}
