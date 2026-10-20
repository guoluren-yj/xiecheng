/*
 * @Description: 折扣优惠政策规则维护-详情页
 * @Date: 2023-06-09 15:19:25
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { Fragment, useMemo, useContext, useCallback } from 'react';
import { Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

import type {
  CreateStoreValueType,
} from '../Detail/stores';
import {
  Store,
  CreateStorProvider,
} from '../Detail/stores';
import DetailContent from './DetailContent';
import styles from './index.less';


type BtnType = "h0" | "c7n" | "c7n-pro" | undefined;

const Detail = observer(() => {

  const {
    ruleDs,
    state,
    loading,
    history,
    discountRemote,
  } = useContext<CreateStoreValueType>(Store);


  // 发布和保存
  const handleAction = useCallback(
    async (action) => {
      const validateFlag = await ruleDs?.current?.validate();

      if (!validateFlag) {
        return false;
      }
      // 发布埋点
      if (discountRemote?.event) {
        const res = await discountRemote.event.fireEvent('handleCuxFinal', { action, ruleDs });
        if (!res) {
          return;
        }
      }
      //  提示
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div>
            {action === 'save'
              ? intl.get('spfp.ruleMaintenance.message.confirm.saveWarning').d('确定保存?')
              : intl.get('spfp.ruleMaintenance.message.confirm.publishWarning').d('确定发布?')}
          </div>
        ),
        onOk: async () => {
          ruleDs.status = DataSetStatus.loading;
          if (action === 'save' && ruleDs?.current?.set) {
            ruleDs.current.set({ updateCheck: 0 });
          }
          ruleDs.setState('action', action)
            .submit().then(res => {
              if (res && action === 'publish') {
                // 跳转至列表
                history.push({
                  pathname: `/spfp/rule-maintenance/discount/list`,
                });
              } else {
                ruleDs.query();
              }
            })
            .finally(() => {
              ruleDs.status = DataSetStatus.ready;
            }
            );
        },
      });

    },
    [ruleDs, history, discountRemote],
  );

  const buttons = useMemo(() => {
    const btns = [
      {
        name: 'publish',
        btnType: 'c7n-pro' as BtnType,
        btnProps: {
          icon: 'near_me',
          color: ButtonColor.primary,
          onClick: () => { handleAction('publish'); },
          loading,
          wait: 600,
        },
        child: intl.get('hzero.common.button.publish').d('发布'),
      },
      {
        name: 'save',
        btnType: 'c7n-pro' as BtnType,
        btnProps: {
          icon: 'save',
          funcType: FuncType.flat,
          onClick: () => { handleAction('save'); },
          loading,
          wait: 600,
        },
        child: intl.get(`hzero.common.button.save`).d('保存'),
      },
    ];
    return btns;
  }, [handleAction, loading]);


  return (
    <Fragment>
      <Header
        title={intl.get('spfp.ruleMaintenance.detail.title.editDiscountRule').d('编辑折扣规则明细')}
        backPath={state?.backPath || "/spfp/rule-maintenance/discount/list"}
      >
        <DynamicButtons buttons={buttons} />
      </Header>
      <Content className={styles['spfp-rule-maintain-content']}>
        <DetailContent />
      </Content>
    </Fragment>
  );
});

const DiscountDetail = props => {
  return (
    <CreateStorProvider {...props}>
      <Detail {...props} />
    </CreateStorProvider>
  );
};

export default DiscountDetail;
