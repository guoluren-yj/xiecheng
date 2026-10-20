/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-props-no-spreading */
import React, { CSSProperties } from 'react';
import _ from 'lodash';
import { observable } from 'mobx';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import { Tooltip } from 'choerodon-ui';

import ImgIcon from '@/utils/ImgIcon';

import TreeSlot from './TreeSlot';
import styles from './index.less';

const flatTree = (data = []) => {
  const arr: any[] = [];
  const itera = (tree) => {
    for (let i = 0; i < tree.length; i++) {
      const element = tree[i] || {};
      if (element.children && element.children.length > 0) {
        arr.push(_.omit(element, ['children']));
        itera(element.children);
      } else {
        arr.push({ ...element });
      }
    }
  };
  itera(data);
  return arr;
};
class TreeShow extends React.Component {
  constructor(props: any) {
    super(props as any);
    this.state = {
      activeCell: null,
    } as any;
  }

  getWidthForHorizelLine = memoize(this.getObjeckForHorizelLine);

  flattenData: any = [];

  componentDidMount() {
    this.initMaster(null);
  }

  render() {
    const { treeData } = this.props as any;
    this.flattenData = this.getWidthForHorizelLine(treeData);
    return <div>{this.renderCasc(treeData)}</div>;
  }

  // 初始化点击第一个框框
  initMaster(treeDataItem) {
    const { treeData = [] } = this.props as any;
    const element = treeDataItem || treeData[0] || {};
    this.setState({
      // eslint-disable-next-line react/no-unused-state
      activeCell: `${element.dataObjectCode}${element.logicModelCode}${element.relationCode}`,
    });
  }

  // 文字内容

  renderContent(element = {} as any) {
    const { treeData } = this.props as any;
    const {
      addTree = () => {},
      delTree = () => {},
      queryMenuList = () => {},
      models,
      slotMenuListByCode,
      slotMenuList = [],
    } = this.props as any;
    const { activeCell } = this.state as any;
    const treeSlot = {
      porpsItem: {
        active:
          activeCell ===
          `${element.dataObjectCode}${element.logicModelCode}${element.relationCode}`,
        ...element,
      },
      treeData,
      slotMenuListByCode,
      slotMenuList,
      models, // 属性名
      queryMenuList,
      addTree,
      delTree,
    };

    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          // textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        <TreeSlot {...treeSlot} />
      </div>
    );
  }

  renderCasc(tree = observable<model.data.DataObjectModel>([])) {
    const { cellMarginTop, models } = this.props as any;
    const arr: any = [];
    for (let i = 0; i < tree.length; i++) {
      const element: any = tree[i] || {};
      if (element.children && element.children.length > 0) {
        arr[i] = (
          <div
            key={element[models.value]}
            style={{
              marginRight: 12,
              marginLeft: `${this.calCellMarginLeft(element)}px`,
              paddingBottom: element.masterFlag ? '10px' : '0px',
              overflow: element.masterFlag ? 'auto' : 'visible',
              paddingTop: '10px',
              marginTop: element.masterFlag ? `${cellMarginTop + 7}px` : `${cellMarginTop + 1}px`,
              position: 'relative',
              background: '#fafafa',
              borderRadius: '2px',
            }}
          >
            {/* 关联关系名称 */}
            {!element.masterFlag ? (
              <Tooltip
                placement="top"
                title={`关系名: ${element.relationName || element?.relation?.name}`}
              >
                <div className={styles['relation-name']}>
                  <ImgIcon name="guanlian@v4.0.svg" size={14} style={{ marginRight: '4px' }} />
                  <span style={{ color: '#A4A6B1', fontSize: '10px' }}>
                    {element.relationName || element?.relation?.name}
                  </span>
                </div>
              </Tooltip>
            ) : (
              ''
            )}
            <div
              style={this.setCellStyle(element) as CSSProperties}
              onClick={() => this.handleClick(element)}
            >
              {/* 文字内容 */}
              {this.renderContent(element)}

              {/* 竖线 */}
              {this.renderVerticalLine(element)}

              {/* 横线 ,去除第一个没有父级的前面的横线 */}
              {element.treeParentModelKey ? this.renderHorizontalLine(element) : null}
            </div>
            {this.renderCasc(element.children)}
          </div>
        );
      } else {
        arr[i] = (
          <div
            key={element[models.value]}
            style={{
              marginRight: 12,
              marginLeft: `${this.calCellMarginLeft(element)}px`,
              paddingBottom: element.masterFlag ? '10px' : '0px',
              overflow: element.masterFlag ? 'auto' : 'visible',
              paddingTop: '10px',
              marginTop: element.masterFlag ? `${cellMarginTop + 7}px` : `${cellMarginTop + 1}px`,
              position: 'relative',
              background: '#fafafa',
              borderRadius: '2px',
            }}
          >
            {/* 关联关系名称 */}
            {!element.masterFlag ? (
              <Tooltip
                placement="top"
                title={`关系名: ${
                  element.relationName || element?.relation?.name || '当前数据已丢失，请检查！'
                }`}
              >
                <div className={styles['relation-name']}>
                  <ImgIcon name="modelRelation.svg" size={14} style={{ marginRight: '4px' }} />
                  <span style={{ color: '#A4A6B1', fontSize: '10px' }}>
                    {element.relationName || element?.relation?.name || '当前数据已丢失，请检查！'}
                  </span>
                </div>
              </Tooltip>
            ) : (
              ''
            )}
            <div
              style={this.setCellStyle(element) as CSSProperties}
              onClick={() => this.handleClick(element)}
            >
              {/* 文字内容 */}
              {this.renderContent(element)}
              {/* 横线 */}
              {this.renderHorizontalLine(element)}
            </div>
          </div>
        );
      }
    }
    return arr;
  }

  getObjeckForHorizelLine(treeData) {
    const { models = {} } = this.props as any;
    const temp = {};
    const arr = flatTree(treeData);
    for (let i = 0; i < arr.length; i++) {
      temp[arr[i][models.value]] = arr[i];
    }
    return temp;
  }

  resolveCellWidth(element = {}) {
    const { cellWidth } = this.props as any;
    return cellWidth ? `${cellWidth}px` : `${this.calCellWidth(element)}px`;
  }

  setCellStyle(element = {}) {
    // 单元样式
    const { cellHeight, fontSize, cellBgColor, cellBorder, cellColor, width } = this.props as any;
    return {
      width: width || this.resolveCellWidth(element),
      height: `${cellHeight}px`,
      borderRadius: '2px',
      position: 'relative',
      display: 'flex',
      marginLeft: '18px',
      fontSize: `${fontSize}px`,
      backgroundColor: cellBgColor,
      border: cellBorder,
      color: cellColor,
      ...this.renderActiveStyle(element),
    };
  }

  // 横线
  renderHorizontalLine(element = {} as any) {
    const { lineWidth, lineColor, cellHeight } = this.props as any;
    return (
      <span
        style={{
          width: this.calHorizontalLineWidth(element),
          height: lineWidth,
          backgroundColor: lineColor,
          position: 'absolute',
          left: this.calHorizontalLeft(element),
          top: `${cellHeight * 0.5}px`,
        }}
      >
        {/* 小圆点 */}
        {(element.relation && element.relation.relationType !== 'ONE_TO_ONE') ||
        (element.modelRelation && element.modelRelation.relationType !== 'ONE_TO_ONE') ? (
          <span
            style={{
              display: 'inline-block',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              color: '#fff',
              backgroundColor: '#29bece',
              position: 'absolute',
              top: '-9px',
              left: '-9px',
              textAlign: 'center',
              transform: 'scale(.7)',
            }}
          >
            N
          </span>
        ) : !element.masterFlag ? (
          <span
            style={{
              display: 'inline-block',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: '1px solid #29bece',
              backgroundColor: '#fff',
              position: 'absolute',
              top: '-9px',
              left: '-9px',
              textAlign: 'center',
              transform: 'scale(.7)',
            }}
          >
            1
          </span>
        ) : (
          ''
        )}
      </span>
    );
  }

  // 竖线
  renderVerticalLine(element = {}) {
    const { lineWidth, cellHeight, cellMarginTop, lineColor, cellPaddingTop } = this.props as any;
    return (
      <div
        style={{
          width: lineWidth,
          height: `${
            this.findYaxisNumber(element) * (cellHeight + cellMarginTop + cellPaddingTop) -
            cellHeight * 0.5 +
            lineWidth
          }px`,
          backgroundColor: lineColor,
          position: 'absolute',
          top: `${cellHeight}px`,
          left: `${this.calCellWidth(element) * 0.1}px`,
        }}
      />
    );
  }

  // 横线宽度
  calHorizontalLineWidth(element = {} as any) {
    const { cellWidth } = this.props as any;
    const cellMarginLeft = this.calCellMarginLeft(element);
    if (element.treeParentModelKey && !cellWidth) {
      return `${cellMarginLeft * 0.5}px`;
    }
    return `${cellMarginLeft * 0.5}px`;
  }

  // 横线左边距离
  calHorizontalLeft(element = {} as any) {
    const { cellWidth } = this.props as any;
    const cellMarginLeft = this.calCellMarginLeft(element);
    if (element.treeParentModelKey && !cellWidth) {
      return `-${cellMarginLeft * 0.5}px`;
    }
    return `-${cellMarginLeft * 0.5}px`;
  }

  // 距离左边
  calCellMarginLeft(element = {} as any) {
    const { cellMarginLeft } = this.props as any;
    if (element.treeParentModelKey) {
      const parentElement = this.flattenData[element.treeParentModelKey];
      return this.calCellWidth(parentElement) * 0.1 + cellMarginLeft;
    }
    return 0;
  }

  calCellWidth(element = {}) {
    const { cellWidth } = this.props as any;
    const { models = {}, fontSize } = this.props as any;
    if (cellWidth) {
      return cellWidth;
    }
    return element[models.label].length * fontSize + 20;
  }

  renderActiveStyle(element = {} as any) {
    const { activeCell } = this.state as any;
    const { activeBorder } = this.props as any;
    if (
      activeCell === `${element.dataObjectCode}${element.logicModelCode}${element.relationCode}`
    ) {
      return {
        border: activeBorder,
      };
    }
  }

  handleClick = (element) => {
    const { cellClick } = this.props as any;
    const val = cellClick(element);
    if (val === false) return;
    this.setState({
      // eslint-disable-next-line react/no-unused-state
      activeCell: `${element.dataObjectCode}${element.logicModelCode}${element.relationCode}`,
    });
  };

  findYaxisNumber(item = {}) {
    const currentObj = this.findCurrentObj(item);
    let num = 0;
    const iteraTwo = (arr) => {
      for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        if (element.children && element.children.length > 0) {
          num++;
          iteraTwo(element.children);
        } else {
          num++;
        }
      }
    };
    // 这里在循环你里面的定位已经是树形结构里面的单独的一个节点了，
    // 所以只考虑当前的这个节点 在计算的时候，应该包括哪些子节点在内，所以
    // 这里的iteraTwo(_.initial(currentObj.children))的逻辑不需要带到上面的迭代里
    if (currentObj.children.length > 1) {
      iteraTwo(_.initial(currentObj.children));
      return num + 1;
    }
    return 1;
  }

  findCurrentObj(item) {
    const { models, treeData } = this.props as any;
    const mainKey = models.value;
    let result;
    const iteraOne = (list = []) => {
      for (let i = 0; i < list.length; i++) {
        const element: any = list[i];
        if (element[mainKey] === item[mainKey]) {
          result = element;
        } else if (element.children && element.children.length) {
          iteraOne(element.children);
        }
      }
    };
    iteraOne(treeData);
    return result;
  }
}

(TreeShow as any).propTypes = {
  cellMarginTop: PropTypes.number,
  cellPaddingTop: PropTypes.number,
  cellMarginLeft: PropTypes.number,
  cellColor: PropTypes.string,
  cellBgColor: PropTypes.string,
  cellBorder: PropTypes.string,
  activeCellColor: PropTypes.string,
  activeBorder: PropTypes.string,
  activeCellBgColor: PropTypes.string,
  cellWidth: PropTypes.number,
  cellHeight: PropTypes.number,
  fontSize: PropTypes.number,
  lineWidth: PropTypes.number,
  lineColor: PropTypes.string,
  cellClick: PropTypes.func,
  treeData: PropTypes.array.isRequired,
  models: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
    label2: PropTypes.string,
  }).isRequired,
};

(TreeShow as any).defaultProps = {
  cellMarginTop: 17,
  cellPaddingTop: 10,
  cellMarginLeft: 50,
  cellColor: '#29bece',
  cellBgColor: '#232C3E',
  cellBorder: '1px solid #DFDFDF',
  activeCellColor: 'red',
  activeBorder: '1px solid #29bece',
  activeCellBgColor: 'blue',
  cellWidth: 65,
  fontSize: 13,
  cellHeight: 30,
  lineWidth: 2,
  lineColor: '#232C3E',
  cellClick: () => {},
};

export default TreeShow as any;
