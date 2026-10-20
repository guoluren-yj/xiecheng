/*
 * @Date: 2025-08-12 17:49:51
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React, { useContext } from 'react';
import querystring from 'querystring';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';

import {
  saveApplication,
  publishApplication,
  deleteApplication,
  finishApplication,
  revokeApplication,
} from '@/services/outsideProjectSetupService';

import { StoreContext } from './DetailProvider';

// 按钮隐藏方法，根据状态隐藏按钮
const hiddenFn = _obj => {
  let hidden = false;
  const { reqStatus, name, extSourceReqId } = _obj;
  switch (name) {
    case 'publish':
      hidden = !['NEW', 'CONFIRM_EXT_REJECTED'].includes(reqStatus);
      break;
    case 'finish':
      hidden = !['RESPONSED'].includes(reqStatus);
      break;
    case 'save':
      hidden = !['NEW', 'CONFIRM_EXT_REJECTED'].includes(reqStatus);
      break;
    case 'revoke':
      hidden = !['EXT_CONFIRMING', 'CONFIRM_EXT_REJECTED', 'WAIT_RESPONSE'].includes(reqStatus);
      break;
    case 'delete':
      hidden = !(extSourceReqId && ['NEW'].includes(reqStatus));
      break;
    default:
  }
  return hidden;
};

const HeaderBtns = observer(() => {
  const {
    tabKey,
    showBtn,
    editor,
    dispatch,
    loading,
    reqStatus,
    setLoading,
    lineDataSet,
    handleQuery,
    responseRef,
    extSourceReqId,
    customizeBtnGroup,
  } = useContext(StoreContext);

  // 返回列表页
  const handleBack = () => {
    dispatch(
      routerRedux.push({
        pathname: '/sslm/oueside-project-setup/list',
      })
    );
  };

  // 获取需保存的数据
  const getSaveData = async () => {
    const { basicInfo, itemInfo, quotationInfo, supplierRequired } = lineDataSet;
    const validateFlag =
      (await basicInfo.validate()) &&
      (await itemInfo.validate()) &&
      (await quotationInfo.validate()) &&
      (await supplierRequired.validate());
    if (validateFlag) {
      return {
        ...basicInfo?.current?.toData(),
        extSourceItemList: itemInfo?.toData(),
        extSourceQuotaRequirement: quotationInfo?.current?.toData(),
        extSourceSupplierRequirement: supplierRequired?.current?.toData(),
      };
    }
  };

  // 保存回调
  const handleSave = async () => {
    const payload = await getSaveData();
    if (payload) {
      setLoading(true);
      return saveApplication(payload)
        .then(response => {
          const res = getResponse(response);
          if (res) {
            if (!extSourceReqId) {
              dispatch(
                routerRedux.push({
                  pathname: '/sslm/oueside-project-setup/detail',
                  search: querystring.stringify({
                    tabKey,
                    extSourceReqId: res.extSourceReqId,
                  }),
                })
              );
            } else {
              handleQuery();
            }
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // 发布回调
  const handlePublish = async () => {
    const payload = await getSaveData();
    if (payload) {
      setLoading(true);
      return publishApplication(payload)
        .then(response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            handleBack();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // 完成回调
  const handleFinish = () => {
    const { unrespondedFlag } = responseRef.current || {};
    const children = unrespondedFlag
      ? intl
          .get('sslm.outsideProjectSetup.message.finish.unrespondedMsg')
          .d('存在未处理的报价供应商，请确认是否结束询价？')
      : intl.get('sslm.outsideProjectSetup.message.finish.finishMsg').d('确认结束询价？');
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children,
      onOk: () => {
        return new Promise(async resolve => {
          const payload = await getSaveData();
          if (payload) {
            setLoading(true);
            finishApplication(payload)
              .then(res => {
                if (getResponse(res)) {
                  handleBack();
                }
              })
              .finally(() => {
                setLoading(false);
              });
          }
          resolve(false);
        });
      },
    });
  };

  // 撤销回调
  const handleRevoke = async () => {
    const payload = await getSaveData();
    if (payload) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('sslm.outsideProjectSetup.message.revoke.tips')
          .d('撤销后当前单据会终结，请确认是否结束此次寻源'),
        onOk: () => {
          return new Promise(resolve => {
            setLoading(true);
            revokeApplication(payload)
              .then(res => {
                if (getResponse(res)) {
                  handleBack();
                }
              })
              .finally(() => {
                setLoading(false);
                resolve(false);
              });
          });
        },
      });
    }
  };

  // 删除回调
  const handleDelete = async () => {
    setLoading(true);
    return deleteApplication({
      extSourceReqId,
    })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          handleBack();
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const btns = [
    {
      name: 'publish',
      hidden: hiddenFn({ reqStatus, name: 'publish' }),
      child: name => name || intl.get('hzero.common.button.realse').d('发布'),
      btnProps: {
        icon: 'publish2',
        disabled: !showBtn,
        onClick: () => handlePublish(),
      },
    },
    {
      name: 'finish',
      hidden: hiddenFn({ reqStatus, name: 'finish' }),
      child: name => name || intl.get('hzero.common.button.finish').d('完成'),
      btnProps: {
        icon: 'check_circle',
        onClick: () => handleFinish(),
      },
    },
    {
      name: 'save',
      hidden: hiddenFn({ reqStatus, name: 'save' }),
      child: name => name || intl.get('hzero.common.button.save').d('保存'),
      btnProps: {
        icon: 'save',
        disabled: !showBtn,
        onClick: () => handleSave(),
      },
    },
    {
      name: 'revoke',
      hidden: hiddenFn({ reqStatus, name: 'revoke' }),
      child: name => name || intl.get('hzero.common.button.revoke').d('撤销'),
      btnProps: {
        icon: 'reply',
        onClick: () => handleRevoke(),
      },
    },
    {
      name: 'delete',
      hidden: hiddenFn({ reqStatus, extSourceReqId, name: 'delete' }),
      child: name => name || intl.get('hzero.common.button.detele').d('删除'),
      btnProps: {
        icon: 'delete',
        onClick: () => handleDelete(),
      },
    },
  ]
    .map(btn => ({
      ...btn,
      hidden: !editor || btn.hidden,
      btnProps: {
        ...btn.btnProps,
        loading,
        wait: 200,
        waitType: 'throttle',
      },
    }))
    .filter(i => !i.hidden);

  const buttons = btns.map((obj, index) => {
    const newBtnProps =
      index === 0 ? { ...obj.btnProps, color: 'primary' } : { ...obj.btnProps, funcType: 'flat' };
    return { ...obj, btnProps: newBtnProps };
  });
  return customizeBtnGroup(
    { code: 'SSLM_OUTSIEDPROJECTSETUP_DETAIL.BUTTON', pro: true },
    <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" />
  );
});

export default HeaderBtns;
