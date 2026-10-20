/* eslint-disable no-unused-expressions */
/**
 * 动态监控
 * @date: 2022-09-15
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Spin, CheckBox, Modal, DataSet, Icon } from 'choerodon-ui/pro';
import { Card, Collapse, Alert, Result } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import { Button as PermissionButton } from 'components/Permission';
import { getMonitorStuffData, saveMonitorStuffData } from '@/services/dynamicMonitorService';
import { stuffRiskLevelDS } from './store/dynamicMonitorDs';
import RiskLevelModal from './RiskLevelModal';
import style from './index.less';

const { Panel } = Collapse;
const iconDimMap = {};

const saveDynamicMonitorPmn =
  'srm.bg.manager.enterprise-control.monitor-overview.button.save-dynamic-data'; // 保存动态监控事件定义的数据
const saveLevelDefPmn =
  'srm.bg.manager.enterprise-control.monitor-overview.button.save-level-def-data'; // 保存时间等级定义弹窗数据

function DynamicMonitor(props) {
  const { stuffRiskLevelDs } = props.valueDs;
  const [selectedCodeArr, setSelectedCodeArr] = useState([]); // 选中的四维编码
  const [dynamicData, setDynamicData] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setSpinning(true);
    getMonitorStuffData()
      .then((res) => {
        if (!getResponse(res)) return;
        const tempFourDimArr = [];
        if ((res?.dimensionList ?? []) instanceof Array) {
          setDynamicData((res?.dimensionList ?? []) || []);
          getChildListDims(res?.dimensionList ?? [], tempFourDimArr);
          // 初始化图标显示map对象
          tempFourDimArr.forEach((i) => {
            Object.assign(iconDimMap, { [`${i}`]: false });
          });
        }
        // 为 true 表示未提交过，则默认全选
        if (res?.enableFlag) {
          setSelectedCodeArr(tempFourDimArr);
          return;
        }
        // enableFlag非0，则选择厚度按回传的数据
        if ((res?.enableList ?? []) instanceof Array) {
          setSelectedCodeArr((res?.enableList ?? []) || []);
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, []);

  /**
   * getChildListDims: 递归获取一个数组下的所有第四维度编码，赋值给目标数组
   * @param {*} arr
   * @param {*} res
   */
  const getChildListDims = (arr = [], res = []) => {
    arr.forEach((item) => {
      // 如果当前是第四维度，则把code存储起来
      if ((item?.dimensionLevel ?? 0) === 4) {
        res.push(item?.dimensionCode ?? '');
      }
      // 如果还有childList项，继续递归
      if ((item?.childList ?? []) instanceof Array) {
        getChildListDims(item?.childList ?? [], res);
      }
    });
  };

  /**
   * initCheckedAll: 绑定全选按钮的状态
   * @param {*} arr
   * @returns
   */
  const initCheckedAll = (arr = []) => {
    // 判断arr是否全部在selectedCodeArr内
    let flag = true;
    arr.forEach((i) => {
      if (selectedCodeArr.indexOf(i) === -1) {
        flag = false;
      }
    });
    return flag;
  };

  /**
   * initImediate: 检查是否是全选中间态
   * @param {*} arr
   * @returns
   */
  const initImediate = (arr = []) => {
    let flagYes = true; // 检查arr是否全部在selectedCodeArr内
    let flagNo = true; // 检查arr是否全部不在selectedCodeArr内
    arr.forEach((i) => {
      if (selectedCodeArr.indexOf(i) === -1) {
        flagYes = false;
      }
      if (selectedCodeArr.indexOf(i) !== -1) {
        flagNo = false;
      }
    });
    // flagYes 与 flagNo 同为false表示中间态，此时返回true
    return !flagYes && !flagNo;
  };

  /**
   * renderNextNode: 递归渲染2、3、4维度数据
   * @param {*} arr
   * @returns
   */
  const renderNextNode = (arr = []) => {
    return (
      arr?.map((item) => {
        // 进来本函数的，必然是第二维度及以下的数据
        // 如果是第二维度，则渲染Collapse
        if ((item?.dimensionLevel ?? 0) === 2) {
          // 第二维度的数据要先分离
          // 把子列表内三维度和四维度的分离
          const threeChildArr = (item?.childList ?? []).filter(
            (i) => (i?.dimensionLevel ?? 0) === 3
          );
          const fourChildArr = (item?.childList ?? []).filter(
            (i) => (i?.dimensionLevel ?? 0) === 4
          );
          // 拿到本分类下的所有四维编码数组
          const { childList = [] } = item;
          const fourDims = [];
          getChildListDims(childList, fourDims);
          return (
            <Collapse defaultActiveKey={['1']} bordered={false} trigger="text-icon">
              <Panel
                header={
                  <>
                    <CheckBox
                      style={{ margin: '0 8px' }}
                      onChange={(isTrue) => {
                        handleAllSelectClick(isTrue, fourDims);
                      }}
                      // 阻止checkBox的点击事件向上冒泡导致缩合下拉内容
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      checked={initCheckedAll(fourDims)}
                      indeterminate={initImediate(fourDims)}
                    />
                    {item?.dimensionName ?? ''}
                  </>
                }
                key="1"
                className={style['panel-container']}
              >
                {threeChildArr.length !== 0 && renderNextNode(threeChildArr)}
                {/* 对于2维下的4维数据 需要先构造一个fieldset */}
                {fourChildArr.length !== 0 && (
                  <fieldset className={style['checkbox-container']}>
                    {renderNextNode(fourChildArr)}
                  </fieldset>
                )}
              </Panel>
            </Collapse>
          );
        }
        // 如果是第三维度，则渲染fieldset
        if ((item?.dimensionLevel ?? 0) === 3) {
          return (
            <fieldset className={style['checkbox-container']}>
              <legend>{item?.dimensionName ?? ''}</legend>
              {(item?.childList ?? []) instanceof Array && renderNextNode(item?.childList ?? [])}
            </fieldset>
          );
        }
        // 如果第四维度，则渲染Checkbox
        if ((item?.dimensionLevel ?? 0) === 4) {
          return (
            <span
              onMouseEnter={() => {
                handleHover(item?.dimensionCode, 'in');
              }}
              onMouseLeave={() => {
                handleHover(item?.dimensionCode, 'out');
              }}
              style={{ width: '180px', display: 'inline-block', marginRight: '20px' }}
            >
              <CheckBox
                style={{ margin: '8px 8px 8px 0' }}
                value={item?.dimensionCode ?? ''}
                checked={selectedCodeArr.indexOf(item?.dimensionCode ?? '') !== -1}
                onChange={(flag) => {
                  handleAllSelectClick(flag, [item?.dimensionCode ?? '']);
                }}
              >
                {item?.dimensionName ?? ''}
              </CheckBox>
              <span
                className={style['fx-icon']}
                onClick={() => {
                  handleIconClick(item);
                }}
                style={{ display: `${iconDimMap[item?.dimensionCode] ? 'inline-block' : 'none'}` }}
              />
            </span>
          );
        }
        return <></>;
      }) ?? <></>
    );
  };

  /**
   * renderNode: 渲染页面节点
   */
  const renderNode = useMemo(() => {
    return dynamicData?.map((item) => {
      // 拿到本一级分类下的所有四维编码数组
      const { childList = [] } = item;
      const fourDims = [];
      getChildListDims(childList, fourDims);
      return (
        <Card className={style['card-style']} bodyStyle={{ padding: '0.2rem' }}>
          <div className={style['title-p']}>
            {item?.dimensionName ?? ''}
            <CheckBox
              onChange={(isTrue) => {
                handleAllSelectClick(isTrue, fourDims);
              }}
              checked={initCheckedAll(fourDims)}
              indeterminate={initImediate(fourDims)}
            >
              {intl.get('sdat.dynamicMonitor.view.button.selectAll').d('全选')}
            </CheckBox>
          </div>
          {(item?.childList ?? []) instanceof Array && renderNextNode(item?.childList ?? [])}
        </Card>
      );
    });
  }, [dynamicData, selectedCodeArr, refreshKey]);

  /**
   * handleAllSelectClick 全选点击回调
   * @param {*} isTrue
   * @param {*} arr
   */
  const handleAllSelectClick = (isTrue = true, arr = []) => {
    // 全选
    const tempArr = [].concat(selectedCodeArr);
    if (isTrue) {
      arr.forEach((code) => {
        if (tempArr.indexOf(code) === -1) {
          tempArr.push(code);
        }
      });
    }
    // 全不选
    else {
      arr.forEach((code) => {
        const ind = tempArr.indexOf(code);
        if (ind !== -1) {
          tempArr.splice(ind, 1);
        }
      });
    }
    setSelectedCodeArr(tempArr);
  };

  /**
   * handleGover: 处理鼠标悬浮入与悬浮出checkbox
   * @param {*} code
   * @param {*} isIn
   * @returns
   */
  const handleHover = (code = '', isIn = 'in') => {
    if (!code) return;
    Object.assign(iconDimMap, { [`${code}`]: isIn === 'in' });
    setRefreshKey(refreshKey + 1);
  };

  /**
   * saveData: 保存数据
   */
  const saveData = () => {
    setSpinning(true);
    saveMonitorStuffData({ codeList: selectedCodeArr })
      .then((res) => {
        if (getResponse(res)) notification.success();
      })
      .finally(() => {
        setSpinning(false);
      });
  };

  // 处理点击事件
  const handleIconClick = (item = {}) => {
    const { dimensionName = '', dimensionCode = '' } = item || {};
    stuffRiskLevelDs?.setQueryParameter('dimensionCode', dimensionCode);
    stuffRiskLevelDs?.query();
    let modal = null;
    // 监控数据是否变化的按钮
    const okBtn = observer(() => {
      return (
        <PermissionButton
          permissionList={[{ code: saveLevelDefPmn }]}
          type="c7n-pro"
          color="primary"
          disabled={
            // eslint-disable-next-line eqeqeq
            !stuffRiskLevelDs.dirty && stuffRiskLevelDs?.getQueryParameter('reset') == undefined
          }
          onClick={() => {
            // 提交的时候需要把所有数据提交
            stuffRiskLevelDs.forEach((rec) => {
              // eslint-disable-next-line no-param-reassign
              rec.status = 'update';
            });
            stuffRiskLevelDs.submit().then((res) => {
              if (getResponse(res)) modal?.close();
            });
          }}
        >
          {intl.get('hzero.common.button.ok').d('确定')}
        </PermissionButton>
      );
    });
    modal = Modal.open({
      title: `${intl
        .get('sdat.dynamicMonitor.view.header.stuffLevelDef')
        .d('事件等级定义')}（${dimensionName}）`,
      drawer: true,
      children: <RiskLevelModal stuffRiskLevelDs={stuffRiskLevelDs} />,
      footer: (_, cancelBtn) => (
        <>
          {React.createElement(okBtn)}
          {cancelBtn}
        </>
      ),
    });
  };

  return (
    <>
      <Header
        title={intl
          .get('sdat.dynamicMonitor.view.header.dynamicMonitorStuffDef')
          .d('动态监控事件定义')}
        backPath="/sdat/supplier-risk-monitor-org"
      >
        {(dynamicData?.length ?? 0) !== 0 && (
          <PermissionButton
            permissionList={[{ code: saveDynamicMonitorPmn }]}
            type="c7n-pro"
            icon="save"
            onClick={saveData}
            loading={spinning}
            color="primary"
          >
            {intl.get('sdat.dynamicMonitor.view.button.save').d('保存')}
          </PermissionButton>
        )}
      </Header>
      <Content style={{ backgroundColor: '#f4f5f7', margin: '0' }}>
        <div className={style['out-box']}>
          <Spin spinning={spinning}>
            {(dynamicData?.length ?? 0) !== 0 && (
              <Alert
                message={intl
                  .get('sdat.dynamicMonitor.view.alert.checkNotification')
                  .d(
                    '勾选以下配置项开启该类型变更事件提醒。勾选任意配置项后，监控的企业若发生该类型变更事件将会通知您'
                  )}
                type="info"
                banner
                showIcon
                closable
                style={{ margin: ' 0 0 -8px 0' }}
              />
            )}
            {renderNode}
          </Spin>
          {(dynamicData?.length ?? 0) === 0 && (
            <Result
              className={style['no-data-result']}
              icon={<Icon className={style['no-data-icon']} />}
              title={
                <span>
                  {intl.get('sdat.stuffUpdateSummary.view.notification.noData').d('暂无查询结果')}
                </span>
              }
            />
          )}
        </div>
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['sdat.dynamicMonitor', 'hzero.common', 'sdat.stuffUpdateSummary'],
})(
  withProps(
    () => {
      const stuffRiskLevelDs = new DataSet(stuffRiskLevelDS());
      const valueDs = { stuffRiskLevelDs };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(DynamicMonitor)
);
