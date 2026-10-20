import React from 'react';
import { Icon, Tooltip } from 'choerodon-ui';
import './index.less';
import { formatNumber } from '@/utils/utils';

const ImplementForm = (props) => {
  const { data, detailData = [] } = props;
  const [parentSize, setParentSize] = React.useState({});
  const [parentSizeTwo, setParentSizeTwo] = React.useState({});
  const [toolTipIsShow, setToolTipIsShow] = React.useState(false);
  const [toolTipIsShowTwo, setToolTipIsShowTwo] = React.useState(false);

  const parentDom = React.useCallback((node) => {
    if (node !== null) {
      const { height, width } = node.getBoundingClientRect(); // p的真实宽高
      setParentSize({ height, width });
    }
  }, []);

  const parentDomTwo = React.useCallback((node) => {
    if (node !== null) {
      const { height, width } = node.getBoundingClientRect(); // p的真实宽高
      setParentSizeTwo({ height, width });
    }
  }, []);

  const childDom = React.useCallback(
    (node) => {
      if (node !== null && parentSize.height) {
        const { height, width } = node.getBoundingClientRect(); // span的真实宽高
        // 判断一下高度是否大于p的高度
        if (height > parentSize.height || width > parentSize.width) {
          setToolTipIsShow(true);
        } else {
          setToolTipIsShow(false);
        }
      }
    },
    [parentSize]
  );

  const childDomTwo = React.useCallback(
    (node) => {
      if (node !== null && parentSizeTwo.height) {
        const { height, width } = node.getBoundingClientRect(); // span的真实宽高

        // 判断一下高度是否大于p的高度
        if (height > parentSizeTwo.height || width > parentSizeTwo.width) {
          setToolTipIsShowTwo(true);
        } else {
          setToolTipIsShowTwo(false);
        }
      }
    },
    [parentSizeTwo]
  );

  return (
    <div className="ImplementForm">
      {data.map((item) => {
        const { amountPrecision } = item;
        if (item.position === 'top' && !item.data) {
          return (
            <div className="ImplementFormItem">
              <p ref={parentDom}>
                <Icon
                  type={item.icon}
                  style={{
                    color: item.icon === 'lock_clock' ? '#F56349' : '#47B881',
                    fontSize: '14px',
                  }}
                />{' '}
                {toolTipIsShow ? (
                  <Tooltip placement="topLeft" title={item.label}>
                    <span>{item.label}</span>
                  </Tooltip>
                ) : (
                  <span ref={childDom}>{item.label}</span>
                )}
              </p>
              <p ref={parentDomTwo}>
                {toolTipIsShowTwo ? (
                  <Tooltip
                    placement="topLeft"
                    title={
                      <span>
                        {!item.dimension &&
                          formatNumber(detailData[item.name[0]] || 0, amountPrecision)}
                        {item.name[1] &&
                          `${!item.dimension ? '/' : ''}${formatNumber(
                            detailData[item.name[1]] || 0,
                            amountPrecision
                          )}`}
                      </span>
                    }
                  >
                    <span>
                      {!item.dimension &&
                        formatNumber(detailData[item.name[0]] || 0, amountPrecision)}
                      {item.name[1] &&
                        `${!item.dimension ? '/' : ''}${formatNumber(
                          detailData[item.name[1]] || 0,
                          amountPrecision
                        )}`}
                    </span>
                  </Tooltip>
                ) : (
                  <span ref={childDomTwo}>
                    {!item.dimension &&
                      formatNumber(detailData[item.name[0]] || 0, amountPrecision)}
                    {item.name[1] &&
                      `${!item.dimension ? '/' : ''}${formatNumber(
                        detailData[item.name[1]] || 0,
                        amountPrecision
                      )}`}
                  </span>
                )}
              </p>
            </div>
          );
        } else {
          return (
            <div className="ImplementFormItem">
              {item.data.map(({ label, name }) => {
                return (
                  <p key={label}>
                    {label}：{formatNumber(detailData[name] || 0, amountPrecision)}
                  </p>
                );
              })}
            </div>
          );
        }
      })}
    </div>
  );
};

export default ImplementForm;
