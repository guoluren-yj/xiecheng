/* eslint-disable react/jsx-indent */
import React, { useState, useContext, useImperativeHandle } from 'react';
import _ from 'lodash';
import { Tooltip } from 'choerodon-ui';
import intl from 'srm-front-boot/lib/utils/intl';
import ImgIcon from '../../../../components/utils/ImgIcon';

import TreeSlot from './TreeSlot';
import { treeFindPath } from '../utils';
import { valueList } from '../enums';
import { Store } from '../index';
import styles from './index.less';

const cellWidth = 199;
const cellHeight = 66;
const cellMarginTop = 24;
const cellMarginLeft = 16 * 2;
const activeBorder = '1px solid #0840F8';
const lineColor = '#5A6677';
const fontSize = 13;
const lineWidth = 1;
const cellPaddingTop = 10;

const { MASTER } = valueList;
const TreeShow = (props) => {
  const { dataSource, models, treeShowRef } = props;
  const [activeCell, setActiveCell] = useState();
  const { store, rightFieldsRef, setLoading } = useContext(Store);
  useImperativeHandle(treeShowRef, () => ({
    handleSelectSource,
  }));
  // 文字内容
  const renderContent = ({ element }) => {
    const treeSlot = {
      propsItem: {
        active: activeCell === `${element?.businessObjectRelationId}`,
        ...element,
      },
    };

    return (
      <div className={styles['render-content']}>
        <TreeSlot {...treeSlot} />
      </div>
    );
  };

  const resolveCellWidth = (element = {}) => {
    return cellWidth ? `${cellWidth}px` : `${calCellWidth(element)}px`;
  };

  // 设置边框border属性
  const renderActiveStyle = (element) => {
    if (element && activeCell === `${element?.businessObjectRelationId}`) {
      return {
        border: activeBorder,
      };
    }
  };

  // 设置边框样式
  const setCellStyle = ({ element }) => {
    // 单元样式
    return {
      width: cellWidth || resolveCellWidth(element),
      height: `${cellHeight}px`,
      ...renderActiveStyle(element),
    };
  };

  // 横线
  const renderHorizontalLine = (element = {}) => {
    return (
      <div
        className={styles['render-horizon-line']}
        style={{
          width: calHorizontalLineWidth(element) - 1,
          height: lineWidth,
          backgroundColor: lineColor,
          left: calHorizontalLeft(element),
          top: `${cellHeight * 0.5}px`,
        }}
      >
        {/* 小圆点 */}
        {element.linkRelationType && element.linkRelationType !== 'ONE_TO_ONE' ? (
          <span className={styles['horizon-dot-one-many']}>N</span>
        ) : !(element?.relateType === MASTER) ? (
          <span className={styles['horizon-dot-one-one']} />
        ) : (
          ''
        )}
      </div>
    );
  };

  // 横线宽度
  const calHorizontalLineWidth = (element = {}) => {
    const _cellMarginLeft = calCellMarginLeft(element);
    if (element.parentId && !cellWidth) {
      return _cellMarginLeft * 0.5;
    }
    return _cellMarginLeft * 0.5;
  };

  // 横线左边距离
  const calHorizontalLeft = (element = {}) => {
    const _cellMarginLeft = calCellMarginLeft(element);
    if (element.parentId && !cellWidth) {
      return `-${_cellMarginLeft * 0.5}px`;
    }
    return `-${_cellMarginLeft * 0.5}px`;
  };

  // 距离左边
  const calCellMarginLeft = (element = {}) => {
    if (element.parentId) {
      return cellMarginLeft;
    }
    return 0;
  };

  const calCellWidth = (element = {}) => {
    if (cellWidth) {
      return cellWidth - 54;
    }
    return element[models.label].length * fontSize + 20;
  };

  /**
   * 设置模型样式并设置数据
   */

  const handleSelectSource = async ({ element = {}, init }) => {
    setLoading(true);
    setActiveCell(`${element?.businessObjectRelationId}`);
    const res = treeFindPath(
      dataSource,
      (item) => item.relateType,
      (item) => item.businessObjectRelationId === element?.businessObjectRelationId
    );
    store.setItem('parentObjList', res); // 设置选中模型父对象列表
    store.setItem('record', element); // 设置选中对象
    if (!init) {
      // eslint-disable-next-line no-unused-expressions
      rightFieldsRef.current?.filterRightFields(element);
    }
    setTimeout(() => {
      setLoading(false);
    }, 0);
  };

  const findYaxisNumber = (element) => {
    const { businessObjectRelationList } = element;
    let num = 0;
    const iteraTwo = (arr) => {
      for (let i = 0; i < arr.length; i++) {
        const _element = arr[i];
        if (_element?.businessObjectRelationList?.length > 0) {
          num++;
          iteraTwo(_element.businessObjectRelationList);
        } else {
          num++;
        }
      }
    };
    if (businessObjectRelationList?.length > 1) {
      iteraTwo(_.initial(businessObjectRelationList));
      return num + 1;
    }
    return 1;
  };

  // 竖线
  const renderVerticalLine = (element) => {
    return (
      <div
        style={{
          width: lineWidth,
          height: `${
            findYaxisNumber(element) * (cellHeight + cellMarginTop + cellPaddingTop) - cellHeight * 0.5 + 2
          }px`,
          backgroundColor: lineColor,
          position: 'absolute',
          top: `${cellHeight - 1}px`,
          left: `${calCellWidth(element) * 0.1}px`,
        }}
      />
    );
  };

  const getElement = (_dataSource) => {
    const arr = [];
    _dataSource.forEach((element, i) => {
      arr[i] = (
        <div
          key={`${element?._token}`}
          className={styles['model-content']}
          style={{
            marginLeft: `${calCellMarginLeft(element)}px`,
            paddingBottom: element?.relateType === MASTER ? '18px' : '0px',
            paddingRight: element?.relateType === MASTER ? 12 : 0,
            overflow: element?.relateType === MASTER ? 'auto' : 'visible',
            marginTop:
              element?.relateType === MASTER && element?.componentType
                ? `${cellMarginTop + 10}px`
                : element?.relateType === MASTER
                ? 0
                : `${cellMarginTop + 1}px`,
            background: element?.relateType === MASTER ? '#f8f8f8' : 'transparent',
          }}
        >
          {/* 关联关系名称 */}
          {['SLAVE_MASTER', 'LINK'].includes(element?.relateType) && element.relBusinessObjectFieldName ? (
            <Tooltip
              placement="top"
              title={`${intl.get('swbh.roManagement.fieldInfo.relation.prefix').d('关系名：')}${
                element?.relBusinessObjectFieldName
              }`}
            >
              <div className={styles['relation-name']}>
                <ImgIcon name="guanlian@v4.0.svg" size={14} style={{ marginRight: '4px' }} />
                <span style={{ color: '#A4A6B1', fontSize: '10px' }}>{element?.relBusinessObjectFieldName}</span>
              </div>
            </Tooltip>
          ) : (
            ''
          )}
          <div
            className={styles['content-wrapper']}
            style={setCellStyle({ element })}
            onClick={() => handleSelectSource({ element })}
          >
            {/* 文字内容 */}
            {renderContent({ element })}
            {/* 竖线 */}
            {element?.businessObjectRelationList?.length > 0 ? renderVerticalLine(element) : null}

            {/* 横线 ,去除第一个没有父级的前面的横线 */}
            {element?.businessObjectRelationList?.length > 0
              ? element.parentId
                ? renderHorizontalLine(element)
                : null
              : renderHorizontalLine(element)}
          </div>
          {/* 递归遍历子节点 */}
          {element?.businessObjectRelationList?.length > 0 ? getElement(element?.businessObjectRelationList) : null}
        </div>
      );
    });
    return arr;
  };

  /**
   * 渲染模型数据源框框
   * @param {JSON} tree 树形数据
   */
  const renderTree = ({ _dataSource = [] }) => {
    // 先遍历多个视图数组 在遍历视图内模型树
    return getElement(_dataSource);
  };

  return renderTree({ _dataSource: dataSource });
};
export default TreeShow;
