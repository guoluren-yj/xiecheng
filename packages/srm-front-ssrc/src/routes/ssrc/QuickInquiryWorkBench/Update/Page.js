import React, { Fragment, useState, useMemo, useEffect } from 'react';
import { Spin, Modal } from 'choerodon-ui/pro';
import { observer, useComputed } from 'mobx-react-lite';
import { noop } from 'lodash';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';

import {
  save,
  remove,
  releaseUpdate,
  checkUpdate,
  fetchExpandSourceResults,
} from '@/services/quickInquiryService';
import { validateQRModal } from '@/routes/components/ConfirmModal';
import { useStore } from './store/index';
import ItemLine from './Page/ItemLine';
import SupplierLine from './Page/SupplierLine';
import BasicForm from './Page/BasicForm';
import Card from './components/Card';
import HeaderOperationRecord from '../components/HeaderOperationRecord';
import styles from './common.less';

const Update = (props) => {
  const {
    remote,
    commonDs: { basicFormDs, itemLineDs, supplierTableDs },
    history,
    isNewInquiry,
    customizeBtnGroup,
    setStoreData = noop,
  } = useStore();

  const { match: { params: { rfqHeaderId = '' } = {} } = {} } = props || {};

  const [operateLoading, setOperateLoading] = useState(false);

  const emptyItemLineTableDS = useComputed(
    () => !itemLineDs.length && !itemLineDs?.cachedRecords?.length,
    [itemLineDs]
  );

  useEffect(() => {
    fetchExpandSourceResultsData();
  }, []);

  // 查询拓展源结果数据-公司与库存组织关联数据
  const fetchExpandSourceResultsData = () => {
    fetchExpandSourceResults().then((res) => {
      const result = getResponse(res);
      if (result) {
        setStoreData('companyInvOrganizationRelationShipData', result); // 拓展寻源结果数据 公司与库存组织关联关系
      }
    });
  };

  // 重置批量编辑DTO数据
  const resetBatchMainItems = () => {
    // eslint-disable-next-line no-unused-expressions
    itemLineDs?.setState('batchMainItemsData', {
      batchBodyItem: null,
      batchBodyItemData: null,
      allBatchEditFlag: -1,
    });
  };

  // 大查询
  const fetchUpdate = async () => {
    const baseForm = basicFormDs?.query();
    const itemLine = itemLineDs.query();
    const supplierTable = supplierTableDs.query();
    const fetchList = [baseForm, itemLine, supplierTable];
    await Promise.all(fetchList);
  };

  // 校验数据
  const checkPage = async () => {
    const baseForm = basicFormDs?.validate();
    const itemLine = itemLineDs?.validate();
    const supplierLine = supplierTableDs?.validate();

    const list = [baseForm, itemLine, supplierLine];
    return Promise.all(list).then((res) => {
      return res?.every((i) => i);
    });
  };

  // 获取保存、发布data
  const getData = () => {
    // 获取批量编辑数据
    const batchMainItemsData = itemLineDs?.getState('batchMainItemsData') || {};
    const { batchBodyItemData, allBatchEditFlag } = batchMainItemsData || {};

    return {
      rfqHeader: basicFormDs?.current?.toData(),
      rfqItemList: itemLineDs?.toData(),
      rfqSupplierList: supplierTableDs?.toData(),
      batchBodyItem: batchBodyItemData,
      allBatchEditFlag,
    };
  };

  // 保存
  const handleSave = async () => {
    setOperateLoading(true);
    await checkPage();
    const data = getData() || {};
    const params = {
      ...data,
      customizeUnitCode:
        'SSRC.QUICK_INQUIRY.EDIT.BASE_HEADER_FORM,SSRC.QUICK_INQUIRY.EDIT.LINE_ITEM,SSRC.QUICK_INQUIRY.EDIT.LINE_SUPPLIER,SSRC.QUICK_INQUIRY.EDIT.LADDER_QUOTATION_LINE,SSRC.QUICK_INQUIRY.EDIT.ITEM_SUP_ASSIGN,SSRC.QUICK_INQUIRY.EDIT.LADDER_QUOTATION_HEADER',
    };
    return save(params)
      .then(async (res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          notification.success();
          if (isNewInquiry) {
            const { rfqHeaderId: headerId } = result || {};
            history.push({
              pathname: `/ssrc/quick-inquiry-workbench/update/${headerId}`,
            });
            return;
          }
          resetBatchMainItems();
          await fetchUpdate();
        }
      })
      .finally(() => setOperateLoading(false));
  };

  // 删除
  const handleRemove = async () => {
    if (!rfqHeaderId) return;
    setOperateLoading(true);
    return Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('ssrc.quickInquiry.view.quickInquiry.delete.confrimMsg')
        .d('删除操作不可逆，是否确认删除？'),
      onOk: async () => {
        const res = await remove({ rfqHeaderId });
        const result = getResponse(res);
        if (result && !result.failed) {
          notification.success();
          history.push({
            pathname: `/ssrc/quick-inquiry-workbench/list`,
          });
        }
        setOperateLoading(false);
      },
      onCancel: () => setOperateLoading(false),
    });
  };

  // 发布 校验数据和发布
  const handleRelease = async () => {
    setOperateLoading(true);
    const flag = await checkPage();
    if (!flag) {
      notification.warning({
        message: intl
          .get('ssrc.quickInquiry.view.quickInquiry.inputSubmitRfxUpdate')
          .d('提交前请填写完整相关信息'),
      });
      setOperateLoading(false);
      return;
    }
    const data = getData() || {};
    const params = {
      ...data,
      customizeUnitCode:
        'SSRC.QUICK_INQUIRY.EDIT.BASE_HEADER_FORM,SSRC.QUICK_INQUIRY.EDIT.LINE_ITEM,SSRC.QUICK_INQUIRY.EDIT.LINE_SUPPLIER,SSRC.QUICK_INQUIRY.EDIT.LADDER_QUOTATION_LINE,SSRC.QUICK_INQUIRY.EDIT.ITEM_SUP_ASSIGN,SSRC.QUICK_INQUIRY.EDIT.LADDER_QUOTATION_HEADER',
    };

    // 第一步
    const res = await checkUpdate(params);
    const result = getResponse(res);

    if (result) {
      // 校验成功回调
      const successCallBack = () => {
        notification.success();
        setOperateLoading(false);
        history.push({
          pathname: '/ssrc/quick-inquiry-workbench/list',
        });
      };

      const warningOk = () => {
        const param = {
          ...params,
          needValidFlag: true,
        };
        setOperateLoading(false);
        return releaseUpdate(param).then((_res) => {
          const _result = getResponse(_res);
          if (_result && !_result.failed) {
            notification.success();
            history.push({
              pathname: '/ssrc/quick-inquiry-workbench/list',
            });
          }
        });
      };

      validateQRModal({
        response: result,
        successCallBack,
        warningOk,
        errorOk: () => setOperateLoading(false),
        warningCancel: () => setOperateLoading(false),
      });
    } else {
      setOperateLoading(false);
    }
  };

  // 没有物料行 【发布】【保存】按钮禁用 必须维护物料行,按钮禁用时无需提示
  // 供应商行由后端拦截发布
  const buttons = useMemo(() => {
    const _buttons = [
      {
        name: 'publish',
        btnType: 'c7n-pro',
        hidden: isNewInquiry,
        btnProps: {
          icon: 'publish2',
          color: 'primary',
          loading: operateLoading,
          onClick: handleRelease,
          disabled: emptyItemLineTableDS,
        },
        child: intl.get('hzero.common.button.release').d('发布'),
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'save',
          funcType: isNewInquiry ? 'raised' : 'flat',
          color: isNewInquiry && 'primary',
          loading: operateLoading,
          onClick: handleSave,
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      {
        name: 'delete',
        btnType: 'c7n-pro',
        hidden: isNewInquiry,
        btnProps: {
          icon: 'delete',
          funcType: 'flat',
          loading: operateLoading,
          onClick: handleRemove,
        },
        child: intl.get('hzero.common.button.delete').d('删除'),
      },
      {
        // 操作记录
        name: 'operationRecord',
        btnComp: HeaderOperationRecord,
        btnProps: {
          headerRecord: basicFormDs?.current,
          buttonProps: {
            funcType: 'flat',
            icon: 'operation_service_request',
          },
        },
      },
    ];
    const remotesButton = remote
      ? remote?.process('SSRC_QUICK_INQUIRY_UPDATE_HEADER_BUTTONS', _buttons, {
          isNewInquiry,
          basicFormDs,
          itemLineDs,
          supplierTableDs,
          operateLoading,
          setOperateLoading,
        })
      : buttons;
    return remotesButton;
  }, [
    operateLoading,
    emptyItemLineTableDS,
    itemLineDs,
    isNewInquiry,
    basicFormDs?.current,
    setOperateLoading,
    remote,
  ]);

  return (
    <Fragment>
      <Header
        title={
          isNewInquiry
            ? intl.get('ssrc.quickInquiry.view.title.createQuickInquiry').d('新建快速询价')
            : `${intl.get('ssrc.quickInquiry.view.title.editQuickInquiry').d('编辑快速询价')} ${
                basicFormDs?.current?.get('batchNo') || ''
              }`
        }
        backPath="/ssrc/quick-inquiry-workbench/list"
      >
        {customizeBtnGroup(
          {
            code: 'SSRC.QUICK_INQUIRY.EDIT.HEADER_BUTTONS',
            pro: true,
          },
          <DynamicButtons buttons={buttons} />
        )}
      </Header>
      <div className={styles['quick-inquiry-container']}>
        <Spin spinning={operateLoading}>
          <div className={styles['card-container']}>
            <Card
              id="basicFormCard"
              title={intl.get('ssrc.quickInquiry.view.card.title.basicInfo').d('基础信息')}
              component={<BasicForm />}
            />
            <Card
              id="itemLineCard"
              title={intl.get('ssrc.quickInquiry.view.card.title.item').d('标的物')}
              component={<ItemLine />}
            />
            <Card
              id="supplierCard"
              title={intl.get('ssrc.quickInquiry.view.card.title.supplier').d('供应商')}
              component={<SupplierLine />}
            />
          </div>
        </Spin>
      </div>
    </Fragment>
  );
};

export default observer(Update);
