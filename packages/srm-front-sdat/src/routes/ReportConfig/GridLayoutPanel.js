import React from 'react';
import PropTypes from 'prop-types';
import RGL from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { setCard } from './cards';

import styles from './index.less';

const ReactGridLayout = RGL;

const layoutContainerStyle = { position: 'relative' };

export default class GridLayoutPanel extends React.Component {
  static defaultProps = {
    className: styles.gridLayoutContainer,
    cols: 20,
    rowHeight: 28,
  };

  static propTypes = {
    className: PropTypes.string,
    cols: PropTypes.number,
    rowHeight: PropTypes.number,
  };

  constructor(props) {
    super(props);
    const { cardsConfig = [] } = props;
    cardsConfig.forEach((cardConfig) => {
      setCard(cardConfig);
    });
  }

  componentDidMount() {
    const { onChangeState = () => {}, dragList = [] } = this.props;
    onChangeState({ currentCards: dragList });
  }

  /**
   * 是 初始化卡片
   * @param {string} cardId - 卡片Id
   */
  @Bind()
  isInitCard(cardId) {
    const { initCards } = this.props;
    return !!initCards[cardId];
  }

  /**
   * 绘制卡片
   * @returns
   */
  renderCard = () => {
    const { setting = false, cards = [] } = this.props;

    return cards.map((item) => {
      if (!item) {
        return null;
      }

      if (setting) {
        return (
          <div key={item.name}>
            {item.component}
            <div className={styles.dragCard} />
            {!this.isInitCard(item.name) && (
              <Icon
                type="close"
                className={styles.closeBtn}
                onClick={() => {
                  this.handleRemoveCard(item.name);
                }}
              />
            )}
          </div>
        );
      }
      return (
        <div key={item.name} className={styles.boxShadow}>
          {item.component}
        </div>
      );
    });
  };

  /**
   * layout 改变的回调
   */
  @Bind()
  onLayoutChange(layout) {
    const { currentCards } = this.props;

    const list = [];
    const codeMap = {};

    if (layout.length && currentCards.length) {
      layout.forEach((item) => {
        currentCards.forEach((item2) => {
          if (item.i === String(item2.cardId)) {
            codeMap[item2.cardId] = {
              ...item,
              name: item2.name,
              dragType: item2.dragType,
              reportUrl: item2.reportUrl,
              previewPictureUrl: item2.previewPictureUrl,
              enabledFlag: item2.enabledFlag,
              code: item2.code,
              orderSeq: item2.orderSeq,
            };
          }
        });
      });
    }

    const keyList = Object.keys(codeMap);
    if (keyList.length) {
      keyList.forEach((item) => {
        list.push(codeMap[item]);
      });
    }

    this.props.onChangeState({ layout: list });
  }

  /**
   * 查找id相同的card
   * @param {string} i
   */
  @Bind()
  getCard(i, flag) {
    const { currentCards = [], originCurrentCards = null } = this.props;
    return !flag
      ? currentCards.find((n) => String(n.cardId) === i)
      : originCurrentCards.find((n) => String(n.cardId) === i);
  }

  /**
   * 移除指定 id 的卡片
   */
  @Bind()
  handleRemoveCard(id) {
    this.props.onRemoveCard(id);
  }

  render() {
    const { setting, layout = [], width } = this.props;

    const reactGridLayoutProps = {};
    if (width) {
      reactGridLayoutProps.width = width;
    }

    const rowH = (width - 13 * 10) / 12;

    return (
      <>
        <ReactGridLayout
          {...reactGridLayoutProps}
          style={layoutContainerStyle}
          layout={layout}
          className={styles.gridLayoutContainer}
          isDraggable={setting}
          isResizable={setting}
          cols={12}
          rowHeight={rowH}
          margin={[10, 10]}
          resizeHandles={['se', 'sw']}
          compactType={null}
          onLayoutChange={this.onLayoutChange}
        >
          {this.renderCard()}
        </ReactGridLayout>
      </>
    );
  }
}
