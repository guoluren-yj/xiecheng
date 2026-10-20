/*
 自定义Steps步骤条
 * @Date: 2020-03-20 09:30:50
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import React from 'react';
import { Steps } from 'choerodon-ui';

const { Step } = Steps; // 引入样式

export default function index({ titleArr = [], descriptionArr = [], current = 0 }) {
  return (
    <>
      <div
        className="c7n-steps c7n-steps-horizontal c7n-steps-label-vertical c7n-steps-dot"
        style={{ paddingBottom: '20px' }}
      >
        <div className="c7n-steps-item c7n-steps-item-finish">
          <div
            className="c7n-steps-item-tail"
            style={{
              marginLeft: '61px',
              backgroundColor: current > 0 ? '#3f51b5' : 'rgba(0, 0, 0, 0)',
            }}
          />
          <div className="c7n-steps-item-icon" style={{ backgroundColor: '#fff' }}>
            <span className="c7n-steps-icon">
              {/* icon icon-check */}
              <span
                className="c7n-steps-icon-dot"
                style={{
                  width: '24px',
                  lineHeight: '24px',
                  height: '24px',
                  fontsize: '16px',
                  marginLeft: '-14px',
                  marginTop: '-10px',
                  backgroundColor: '#3f51b5',
                }}
              >
                1
              </span>
            </span>
          </div>
          <div className="c7n-steps-item-content">
            {titleArr[0] && <div className="c7n-steps-item-title">{titleArr[0]}</div>}
            {descriptionArr[0] && (
              <div
                className="c7n-steps-item-description"
                style={{ textAlign: 'center', color: '#3f51b5' }}
              >
                {descriptionArr[0]}
              </div>
            )}
          </div>
        </div>
        <div className="c7n-steps-item c7n-steps-item-process">
          <div
            className="c7n-steps-item-tail"
            style={{
              marginLeft: '64px',
              width: '99.4%',
              backgroundColor: current > 1 ? '#3f51b5' : 'rgba(0, 0, 0, 0)',
            }}
          />
          <div className="c7n-steps-item-icon" style={{ backgroundColor: '#fff' }}>
            <span className="c7n-steps-icon">
              <span
                className="c7n-steps-icon-dot c7n-steps-icon-dot"
                style={{
                  width: '24px',
                  lineHeight: '24px',
                  height: '24px',
                  fontsize: '16px',
                  marginLeft: '-14px',
                  marginTop: '-10px',
                  backgroundColor: current > 0 ? '#3f51b5' : 'rgba(0, 0, 0, 0.36)',
                }}
              >
                2
              </span>
            </span>
          </div>
          <div className="c7n-steps-item-content">
            {titleArr[1] && <div className="c7n-steps-item-title">{titleArr[1]}</div>}
            {descriptionArr[1] && (
              <div
                className="c7n-steps-item-description"
                style={{
                  textAlign: 'center',
                  color: current > 0 ? '#3f51b5' : 'rgba(0, 0, 0, 0.36)',
                }}
              >
                {descriptionArr[1]}
              </div>
            )}
          </div>
        </div>
        <div className="c7n-steps-item c7n-steps-item-wait">
          <div className="c7n-steps-item-tail" />
          <div className="c7n-steps-item-icon" style={{ backgroundColor: '#fff' }}>
            <span className="c7n-steps-icon">
              <span
                className="c7n-steps-icon-dot c7n-steps-icon-dot"
                style={{
                  width: '24px',
                  lineHeight: '24px',
                  height: '24px',
                  fontsize: '16px',
                  marginLeft: '-14px',
                  marginTop: '-10px',
                  backgroundColor: current > 1 ? '#3f51b5' : 'rgba(0, 0, 0, 0.36)',
                }}
              >
                3
              </span>
            </span>
          </div>
          <div className="c7n-steps-item-content">
            {titleArr[2] && <div className="c7n-steps-item-title">{titleArr[2]}</div>}
            {descriptionArr[2] && (
              <div
                className="c7n-steps-item-description"
                style={{
                  textAlign: 'center',
                  color: current > 1 ? '#3f51b5' : 'rgba(0, 0, 0, 0.36)',
                }}
              >
                {descriptionArr[2]}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 隐藏不用 防止eslint报错 */}
      <div style={{ display: 'none' }}>
        <Step />
      </div>
    </>
  );
}
