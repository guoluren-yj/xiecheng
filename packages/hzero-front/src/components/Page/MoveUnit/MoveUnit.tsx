import type { FC } from 'react';
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { isNil } from 'lodash';
import styles from './index.less';

// 方便的获取组件的相关值
interface IUseMoveUnitData {
  [propName: string]: number;
}
const useMoveUnitData = (props: IUseMoveUnitData) => {
  const { leftMin, leftMax, rightMin, rightMax } = props;
  const [positionStyle, setPositionStyle] = useState<any>({});
  const moveUnitProps = { setPositionStyle, option: { leftMin, leftMax, rightMin, rightMax } };
  return [positionStyle.left, positionStyle.right, moveUnitProps];
};
export { useMoveUnitData };

// 设置限制条件
interface IOption {
  leftMin: number;
  leftMax: number;
  rightMin: number;
  rightMax: number;
}
type IOptionFnParams = (pageX: number, bomWidth: number, option: IOption) => number;
const _optionFn: IOptionFnParams = (pageX, bomWidth, option) => {
  const { leftMin, leftMax, rightMin, rightMax } = option;
  let _pageX = pageX;
  if (!isNil(leftMax) && _pageX > leftMax) {
    _pageX = leftMax;
  }
  if (!isNil(leftMin) && _pageX < leftMin) {
    _pageX = leftMin;
  }
  if (!isNil(rightMax) && bomWidth - _pageX > rightMax) {
    _pageX = bomWidth - rightMax;
  }
  if (!isNil(rightMin) && bomWidth - _pageX < rightMin) {
    _pageX = bomWidth - rightMin;
  }
  return _pageX;
};

interface IIndexProps {
  option: any;
  setPositionStyle: (option) => any;
  style: object;
  pageRef: any;
}
const Index: FC<IIndexProps> = observer(
  ({ option = {}, setPositionStyle = () => {}, style = {}, pageRef = { current: null } }) => {
    const [showDotted, setShowDotted] = useState(false);
    const [dottedLeft, setDottedLeft] = useState(0);
    return (
      <div className={styles['move-unit']} style={style}>
        {showDotted && (
          <span className={styles['right-slide-dotted']} style={{ left: `${dottedLeft}px` }} />
        )}
        <span className={styles['right-slide-solid']} />
        <i
          onMouseDown={(e) => {
            e.preventDefault();
            let _downSuo = false;
            let pageX = 0;
            const bomWidth =
              window.innerWidth ||
              document.documentElement.clientWidth ||
              document.body.clientWidth ||
              0;
            const offsetLeft =
              bomWidth -
              (document.querySelector(
                '.ant-tabs.ant-tabs-top.ant-tabs-card.ant-tabs-editable-card.ant-tabs-no-animation > .ant-tabs-content'
              )?.clientWidth || bomWidth);
            const offsetleft = pageRef.current?.offsetLeft || 16;
            document.body.onmousemove = (bodyEvent) => {
              bodyEvent.preventDefault();
              setShowDotted(true);
              _downSuo = true;
              pageX = _optionFn(bodyEvent.clientX - offsetLeft, bomWidth, option);
              setDottedLeft(bodyEvent.clientX);
            };
            // eslint-disable-next-line func-names
            document.body.onmouseup = function () {
              if (_downSuo) {
                setPositionStyle({
                  left: pageX - offsetleft,
                  right: bomWidth - pageX - offsetLeft,
                });
                setShowDotted(false);
                _downSuo = false;
                document.body.onmouseup = null;
                document.body.onmousemove = null;
              }
            };
          }}
          className={styles['rigth-slide']}
        />
      </div>
    );
  }
);
export default Index;
