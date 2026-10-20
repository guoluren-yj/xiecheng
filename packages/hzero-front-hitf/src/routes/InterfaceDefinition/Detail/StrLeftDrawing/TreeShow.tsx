/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable react/no-unused-state */
/* eslint-disable no-nested-ternary */
import React, { CSSProperties, useState, useContext, useImperativeHandle } from 'react';
import _ from 'lodash';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';

import { treeFindPath } from '@/utils/utils';
import { valueList } from '@/utils/enums';
import TreeSlot from './TreeSlot';
import { Store } from '../Params';
import styles from './index.less';

const cellWidth = 199;
const cellHeight = 50;
const cellMarginTop = 24;
const cellMarginLeft = 16 * 2;
const activeBorder = '1px solid #0840F8';
const lineColor = '#5A6677';
const fontSize = 13;
const lineWidth = 1;
const cellPaddingTop = 10;

const { MAIN } = valueList;
const TreeShow = props => {
  const { dataSource, models, treeShowRef, openModal, handleDelete, handleSelect, defaultSelectId } = props;
  const [activeCell, setActiveCell] = useState<string>();
  const { store, rightFieldsRef, setLoading } = useContext(Store);
  useImperativeHandle(treeShowRef, () => ({
    handleSelectSource,
  }));
  // 文字内容
  type IRenderContent = (props: { element: any }) => void;
  const renderContent: IRenderContent = ({ element }) => {
    const treeSlot = {
      propsItem: {
        active: activeCell === `${element?.id}`,
        ...element,
      },
      openModal,
      handleDelete,
    };

    return (
      <div
        className={styles['render-content']}
        onClick={() => handleSelect(element.id)}
      >
        <TreeSlot {...treeSlot} />
      </div>
    );
  };

  const resolveCellWidth = (element = {}) => {
    return cellWidth ? `${cellWidth}px` : `${calCellWidth(element)}px`;
  };

  // 设置边框border属性
  type IRenderActiveStyle = (
    element: boModel.combine.IBusinessObject
  ) => { border: any } | undefined;
  const renderActiveStyle: any = element => {
    if (element && activeCell === `${element?.id}`) {
      return {
        border: activeBorder,
      };
    }
  };

  // 设置边框样式
  type ISetCellStyle = (props: { element: any }) => CSSProperties;
  const setCellStyle: ISetCellStyle = ({ element }) => {
    // 单元样式
    return {
      width: cellWidth || resolveCellWidth(element),
      height: `${cellHeight}px`,
      // border: defaultSelectId === element.id ? '2px solid #36c2cf' : '1px solid #d9d9d9',
      ...renderActiveStyle(element),
    };
  };

  // 横线
  const renderHorizontalLine = (element: any = {}) => {
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
        ) : !(element?.relateType === MAIN) ? (
          <span className={styles['horizon-dot-one-one']} />
        ) : (
              ''
            )}
      </div>
    );
  };

  // 横线宽度
  const calHorizontalLineWidth = (element: any = {}) => {
    const _cellMarginLeft = calCellMarginLeft(element);
    if (element.parentId && !cellWidth) {
      return _cellMarginLeft * 0.5;
    }
    return _cellMarginLeft * 0.5;
  };

  // 横线左边距离
  const calHorizontalLeft = (element: any = {}) => {
    const _cellMarginLeft = calCellMarginLeft(element);
    if (element.parentId && !cellWidth) {
      return `-${_cellMarginLeft * 0.5}px`;
    }
    return `-${_cellMarginLeft * 0.5}px`;
  };

  // 距离左边
  const calCellMarginLeft = (element: any = {}) => {
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
  type IHandleSelectSource = (props: {
    element: boModel.combine.IBusinessObject | null;
    init?: boolean;
  }) => void;
  const handleSelectSource: IHandleSelectSource = async ({ element = {}, init }) => {
    // setLoading(true);
    setActiveCell(`${element?.businessObjectRelationId}`);
    const res = treeFindPath(
      dataSource,
      item => item.relateType,
      item => item.businessObjectRelationId === element?.businessObjectRelationId
    );
    // store.setItem('parentObjList', res); // 设置选中模型父对象列表
    // store.setItem('record', element); // 设置选中对象
    if (!init) {
      // eslint-disable-next-line no-unused-expressions
      rightFieldsRef?.current?.filterRightFields(element);
    }
    setTimeout(() => {
      // setLoading(false);
    }, 0);
  };

  const findYaxisNumber = element => {
    const { openInterfaceParamHeaders } = element;
    let num = 0;
    const iteraTwo = arr => {
      for (let i = 0; i < arr.length; i++) {
        const _element = arr[i];
        if (_element?.openInterfaceParamHeaders?.length > 0) {
          num++;
          iteraTwo(_element.openInterfaceParamHeaders);
        } else {
          num++;
        }
      }
    };
    if (openInterfaceParamHeaders?.length > 1) {
      iteraTwo(_.initial(openInterfaceParamHeaders));
      return num + 1;
    }
    return 1;
  };

  // 竖线
  const renderVerticalLine = element => {
    return (
      <div
        style={{
          width: lineWidth,
          height: `${findYaxisNumber(element) * (cellHeight + cellMarginTop + cellPaddingTop) -
            cellHeight * 0.5 +
            2 - 11}px`,
          backgroundColor: lineColor,
          position: 'absolute',
          top: `${cellHeight - 1}px`,
          left: `${calCellWidth(element) * 0.1}px`,
        }}
      />
    );
  };

  const getElement = _dataSource => {
    const arr: any = [];
    _dataSource.forEach((element, i) => {
      arr[i] = (
        <div
          key={`${element?.id}`}
          className={styles['model-content']}
          style={{
            marginLeft: `${calCellMarginLeft(element)}px`,
            paddingBottom: element?.relateType === MAIN ? '18px' : '0px',
            paddingRight: element?.relateType === MAIN ? 12 : 0,
            overflow: element?.relateType === MAIN ? 'auto' : 'visible',
            marginTop:
              element?.relateType === MAIN && element?.componentType
                ? `${cellMarginTop + 10}px`
                : element?.relateType === MAIN
                  ? 0
                  : `${cellMarginTop - 10}px`,
            background: element?.relateType === MAIN ? '#f8f8f8' : 'transparent',
          }}
        >
          <div
            className={`${styles['content-wrapper']} ${defaultSelectId === element.id ? styles['content-wrapper-selected'] : ''}`}
            style={setCellStyle({ element })}
            onClick={() => handleSelectSource({ element })}
          >
            {/* 文字内容 */}
            {renderContent({ element })}
            {/* 竖线 */}
            {element?.openInterfaceParamHeaders?.length > 0 ? renderVerticalLine(element) : null}

            {/* 横线 ,去除第一个没有父级的前面的横线 */}
            {element?.openInterfaceParamHeaders?.length > 0
              ? element.parentId
                ? renderHorizontalLine(element)
                : null
              : renderHorizontalLine(element)}
          </div>
          {/* 递归遍历子节点 */}
          {element?.openInterfaceParamHeaders?.length > 0
            ? getElement(element?.openInterfaceParamHeaders)
            : null}
        </div>
      );
    });
    return arr;
  };

  /**
   * 渲染模型数据源框框
   * @param {JSON} tree 树形数据
   */
  const renderTree = ({ _dataSource = [] }: { _dataSource: boModel.combine.IBusinessObject[] }) => {
    // 先遍历多个视图数组 在遍历视图内模型树
    return getElement(_dataSource);
  };

  return renderTree({ _dataSource: dataSource });
};
export default formatterCollections({ code: ['hmde.boComposition'] })(TreeShow);
