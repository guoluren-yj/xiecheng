/**
 * CodeCompare.js
 * 代码比对组件
 * @date: 2021-09-07
 * @author: Zepeng Huang <Zepeng.Huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */
import React, { Fragment } from 'react';
import { Output } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import PageStyle from './CodeCompare.less';

@formatterCollections({
  code: ['spfm.codeCompare', 'hzero.common'],
})
export default class CodeCompare extends React.Component {
  /**
   * 代码处理比对
   * @param {String} ori 代码1
   * @param {String} current 代码2
   * @returns {Array}
   */
  dealCode = (current = '', ori = '') => {
    const currentString = current.toString();
    const oriString = ori.toString();
    // 按行分割
    const oriArr = oriString.split('\n');
    const currentArr = currentString.split('\n');
    // 定义行指针
    let oriPoint = 0;
    let currentPoint = 0;
    // 定义两个结果数组
    const oriResArr = [];
    const currentResArr = [];
    // 开始比对，结束比对的条件是：两根指针有一根到达了尽头
    while (oriPoint < oriArr.length || currentPoint < currentArr.length) {
      // 排除空行的影响,如果有空行就顺延指针
      while (oriArr[oriPoint] === '') {
        oriResArr.push({ type: 'normal', content: '' });
        oriPoint++;
      }
      while (currentArr[currentPoint] === '') {
        currentResArr.push({ type: 'normal', content: '' });
        currentPoint++;
      }
      // 比对当前行
      if (oriArr[oriPoint] === currentArr[currentPoint]) {
        // 如果两行代码完全一致，直接存入
        oriResArr.push({ type: 'normal', content: oriArr[oriPoint] });
        currentResArr.push({ type: 'normal', content: currentArr[currentPoint] });
        // 指针前进
        oriPoint++;
        currentPoint++;
        // eslint-disable-next-line no-continue
        continue; // 下面的代码不再执行
      }
      // 如果两行不一致
      let copyCurrentPoint = currentPoint; // 暂时存储currentCode指针
      // currentPoint循环去寻找和oriCode一致的行，结束条件是找到了或者指针到尽头
      while (
        oriArr[oriPoint] !== currentArr[copyCurrentPoint] &&
        copyCurrentPoint < currentArr.length
      ) {
        copyCurrentPoint++;
      }
      // 判断是否找到了
      if (oriArr[oriPoint] === currentArr[copyCurrentPoint]) {
        // 如果找到了。先将current代码内的行视为“新增”，存入数组
        for (let i = currentPoint; i < copyCurrentPoint; i++) {
          currentResArr.push({ type: 'add', content: currentArr[i] });
        }
        // 那么ori指针不变，current指针归位到比对位置
        currentPoint = copyCurrentPoint;
        // eslint-disable-next-line no-continue
        continue; // 本轮循环结束，跳过下面代码
      }
      // 如果没找到，说明ori的当前行已经相当于在current内被删除
      // 存入oriArr
      oriResArr.push({ type: 'delete', content: oriArr[oriPoint] });
      // ori指针前进，current指针不变
      oriPoint++;
    }
    // 循环结束时，判断指针是否到了尽头，如果有未到尽头的部分代码，ori视为删除，current视为新增
    if (oriPoint !== oriArr.length) {
      for (let i = 0; i < oriArr.length; i++) {
        oriResArr.push({ type: 'delete', content: oriArr[i] });
      }
    }
    if (currentPoint !== currentArr.length) {
      for (let i = 0; i < currentArr.length; i++) {
        currentResArr.push({ type: 'add', content: currentArr[i] });
      }
    }
    return [currentResArr, oriResArr];
  };

  /**
   * 渲染代码
   * @param {Array} codeArr 代码处理后的数组
   * @returns {ReactNode}
   */
  renderCode = (codeArr) => {
    return (
      <div className="codeArea">
        {codeArr.map((item, index) => {
          return (
            <div type={item.type} className="codeLine" key={item.content}>
              <span className="lineIndex">{index}</span>
              {item.content}
              <br />
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    const { oriCode, currentCode, oriTitle, currentTitle } = this.props;
    return (
      <Fragment>
        <div className={PageStyle.codeCompare}>
          <div className="outBox">
            <Output value={currentTitle} className="title" />
            <Output value={oriTitle} className="title" />
          </div>
          <div className="outBox">
            {this.dealCode(oriCode, currentCode).map((arr) => {
              return this.renderCode(arr);
            })}
          </div>
        </div>
      </Fragment>
    );
  }
}
