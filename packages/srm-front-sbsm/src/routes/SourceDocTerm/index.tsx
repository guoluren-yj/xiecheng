import type { ReactElement } from 'react';
import React, { useMemo, Fragment, useContext, useCallback, useState, useEffect } from 'react'; // , forwardRef, useImperativeHandle
import { Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import classNames from 'classnames';
import notification from 'utils/notification';
// import { DataToJSON } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';
import { Header } from 'components/Page';
import { getResponse } from 'utils/utils';

import StoreProvider, { Store } from './stores';
import type { StoreValueType } from './stores';
import DetailContent from './DetailContent';
import { notifyValidErrors } from '../../utils/utils';
import DynamicAlertList from '../../components/DynamicAlert/List';
import { validateSave } from './utils/api';
import styles from './index.less';


const Detail = observer(() => {
  const { modalFlag, dimensionType, sourceDocHeaderDs, onPartChildRef, sourceDocListDs, isChange, documentTermHeaderDTOList } = useContext<StoreValueType>(Store);
  const { buildMethod, amountFlag, termHeaderFlag } = sourceDocHeaderDs.current?.get(['buildMethod', 'amountFlag', 'termHeaderFlag']) || {};

  const [activeTabKey, setActiveTabKey] = useState('');
  // 展示类型，ORDER 订单  PO_LINE 订单行
  // const [viewType, setViewType] = useState<string | undefined>(dimensionType);

  const hasTabFlag = useMemo(() => {
    return dimensionType === 'PO_LINE';
  }, [dimensionType]);
   // 保存方法
   const handleSave = useCallback(async() => {
    if (hasTabFlag) {
      const errorTextList: Array<string> = [];
      const results = await Promise.all(
        sourceDocHeaderDs.map(async(record) => {
          const res = await record?.validate();
          if (!res) {
            if (activeTabKey !== record?.get('sourceDocLineNum')) errorTextList.push(`${intl.get('sbsm.common.view.message.title.displayAsnLineNum', { num: record?.get('displayLineNum') }).d('第{num}行')} ${record?.get('itemName')} ${intl.get('sbsm.common.view.notification.validate.required').d('存在必填项未填写，请重新维护!')}`);
            else notifyValidErrors(sourceDocHeaderDs);
          }
          return res;
        })
      );
      if (results.includes(false)) {
        if (errorTextList.length > 0) {
          notification.error({
            description: errorTextList.join('\n'),
            style: {
              whiteSpace: 'pre-line',
            },
          });
        }
        return false;
      }
    } else {
      const validateRes = await sourceDocHeaderDs.validate();
      if (!validateRes) {
        notifyValidErrors(sourceDocHeaderDs);
        return;
      }
    }
    const data = sourceDocHeaderDs?.toData();
    if (isChange) {
      const body = {
        documentTermHeaderDTOList: data,
        controlDimension: dimensionType,
      };
      const validateResult = getResponse(await validateSave(body));
      if (!validateResult) return false;
      const { responseStatus, responseMessage } = validateResult || {};
      if (responseStatus === 'ERROR') {
        notification.error({
          message: responseMessage,
        });
        return false;
      }
      // 变更场景保存上一次选择的termHeaderId
      sourceDocHeaderDs.setState('termHeaderIdOrigin', documentTermHeaderDTOList?.[0]?.termHeaderId);
    } else sourceDocHeaderDs.setState('headerData', data);
    return {
      documentTermHeaderDTOList: data?.map((item: any) => {
        delete item.docTermSyncList;
        return item;
      }),
      controlDimension: dimensionType,
    };
    // const res = await sourceDocHeaderDs.setState('submitType', 'save').submit();
    // await sourceDocHeaderDs.query();
    // return !!res;
  }, [sourceDocHeaderDs, dimensionType, hasTabFlag, activeTabKey, isChange, documentTermHeaderDTOList]);

  // 获取缓存数据
  const handleFetchDs = useCallback(() => {
    return {
      sourceDocHeaderDs,
      sourceDocListDs,
    };
  }, [sourceDocHeaderDs, sourceDocListDs]);

  const handleTabChange = useCallback((num) => {
    const record = sourceDocHeaderDs?.find((v) => v?.get('sourceDocLineNum') == num);
    if (record ) sourceDocHeaderDs.current = record;
    setActiveTabKey(num);
  }, [sourceDocHeaderDs, setActiveTabKey]);

  // 刷新页面
  const handleRefresh = useCallback(() => {
    sourceDocHeaderDs.query().then((res) => {
      if (res && hasTabFlag) {
        handleTabChange(activeTabKey);
      }
    });
  }, [sourceDocHeaderDs, handleTabChange, activeTabKey, hasTabFlag]);

  useEffect(() => {
    if (onPartChildRef) {
      onPartChildRef({
        handleSave,
        handleFetchDs,
        handleRefresh,
      });
    }
  }, [onPartChildRef, handleSave, handleFetchDs, handleRefresh]);

  const headerTitle = useMemo(() => {
    return intl.get('sbsm.fundPlanForecast.view.message.editFundPlan').d('来源单据条款编辑');
  }, []);

  // 订单和订单行视图切换
  // const handleChangeView = useCallback((key: string) => {
  //   setViewType(key);
  // }, []);

  const getRenderHeader = useCallback(() => {
    return null;
    // return (
    //   <div className={styles['detail-tab-extra-content']}>
    //     <div className={styles['detail-tips']}>{intl.get(`sbsm.fundPlanForecast.view.message.originDocPayTerm`).d('来源单据付款条款')}</div>
    //     <div className={styles['detail-tips-text']}>{intl.get(`sbsm.fundPlanForecast.view.message.tabTips`).d('点击对应订单行编辑查看详情')}</div>
    //   </div>
    // );
  }, []);

  // 父组件传入Ref可直接调用（预留）
  // useImperativeHandle(ref, () => ({
  //   handleSave,
  //   handleFetchDs,
  // }));

  const getTabHeaderRander = useCallback((item) => {
    const { itemCode, itemName, displayLineNum, sourceDocId } = item?.get(['itemCode', 'itemName', 'displayLineNum', 'sourceDocId']) || {};
    return (
      <div className={styles['detail-tab-header']}>
        <div className={styles['detail-tab-status']}>
          <div className={styles['detail-tab-item-name']}>{itemName}</div>
          <div className={classNames(styles['detail-tab-title'], { [styles['detail-tab-title-active']]: sourceDocId === activeTabKey })}>
            #{displayLineNum}
          </div>
        </div>
        <div>
          <span className={styles['detail-tab-document-num']}>{itemCode}</span>
        </div>
      </div>
    );
  }, [activeTabKey]);

  return (
    <Fragment>
      { !modalFlag && (<Header title={headerTitle} />) }
      {/* { renderHeader() } */}
      <DynamicAlertList
        dataSource={[
          {
            type: 'info',
            name: 'alert',
            message: intl.get('sbsm.fundPlan.view.message.alert.changeAlert')
            .d(
              '来源单据付款条款已产生下游预制/编制数据，系统无法预处理，请您视情况人为调整，或取消下游数据后变更。已有下游的阶段金额不可小于已被收货事务行/发票申请行预制的金额，不可小于已编制提交金额，调整的阶段日期计算规则、编制事务预制规则仅针对未预制的事务生效。已有下游后，在单据条款页面变更付款条款无法自动带出条款阶段，仅调整付款条款字段值，阶段信息需手工修改'
            ),
            showFlag: buildMethod === 'UPDATE_EXIST_DATA',
          },
          {
            type: 'info',
            name: 'alertInfo',
            message: intl.get('sbsm.fundPlan.view.message.alert.noChangeAlert')
              .d(
                '当前来源单据付款条款已按最新订单金额/条款进行预处理，您可基于系统处理结果进行调整，若重新选择付款条款，系统将根据付款条款配置阶段覆盖来源单据付款条款阶段'
              ),
            showFlag: buildMethod === 'UPDATE_NO_DATA_BUILD' || (buildMethod === 'UPDATE_PUBLISH' && (Number(amountFlag) === 1 || Number(termHeaderFlag) === 1)),
          },
        ]}
      />
      <div
        className={
          classNames({
            [styles['sbsm-detail-wrapper-fund-plan-forecast']]: hasTabFlag,
            [styles['sbsm-detail-wrapper-fund-plan-forecast-content']]: !hasTabFlag,
          })
        }
      >
        {hasTabFlag ? (
          <Tabs defaultActiveKey={activeTabKey} tabBarExtraContent={getRenderHeader()} tabPosition={TabsPosition.left} onChange={handleTabChange}>
            {sourceDocHeaderDs.map((item) => (
              <Tabs.TabPane tab={getTabHeaderRander(item)} key={item?.get('sourceDocLineNum')}>
                <DetailContent />
              </Tabs.TabPane>
            ))}
          </Tabs>
        ) : (
          <DetailContent />
        )}
      </div>
    </Fragment>
  );

}) as (props: any) => ReactElement;



const SourceDocTerm = (props) => <StoreProvider {...props}><Detail /></StoreProvider>;

export default SourceDocTerm;
