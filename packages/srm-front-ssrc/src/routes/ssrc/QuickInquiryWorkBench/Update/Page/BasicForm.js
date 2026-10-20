import React from 'react';
import { CheckBox, Lov, Modal, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop } from 'lodash';
import { useComputed } from 'mobx-react-lite';

import CollapseForm from '_components/CollapseForm';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import { handleChangeCompany, clearExpandInvOrganization } from '@/services/quickInquiryService';
import { useStore } from '../store/index';
import { updateExpandInvOrganizationFiled } from '../utils/utils';

export default observer(function BasicForm() {
  const {
    commonDs: { basicFormDs, itemLineDs, supplierTableDs } = {},
    customizeCollapseForm = noop,
    isNewInquiry = false,
    routerParams: { rfqHeaderId = '' },
    getStoreData = noop,
  } = useStore();

  // 改变公司
  const changeCompany = (data = {}, oldValue = {}) => {
    const { companyId = null, currencyCode = null } = data || {};
    const {
      companyId: oldCompanyId = null,
      companyName: oldCompanyName,
      companyCode: oldCompanyCode,
    } = oldValue || {};

    if (!basicFormDs?.current || !companyId) return;

    // 维护页-改变公司-确认
    const handleOkChangeCompany = () => {
      const params = {
        companyId,
        rfqHeaderId,
        currencyCode,
        quickRfqItemList: itemLineDs?.toData(),
        customizeUnitCode: 'SSRC.QUICK_INQUIRY.EDIT.LINE_ITEM',
      };

      return handleChangeCompany(params).then((res) => {
        const result = getResponse(res);
        if (result) {
          notification.success();
          const { objectVersionNumber } = result || {};
          // 更新币种 便于新建物料行取币种默认值 更新头版本号
          // eslint-disable-next-line no-unused-expressions
          basicFormDs?.current?.set({
            objectVersionNumber,
            currencyCode,
          });
          itemLineDs.query();
          // 保留缓存的变更记录
          supplierTableDs.query(undefined, undefined, true);
        }
      });
    };
    // 维护页-改变公司-取消
    const handleCancelChangeCompany = () => {
      // eslint-disable-next-line no-unused-expressions
      basicFormDs?.current?.set('companyId', {
        companyId: oldCompanyId,
        companyName: oldCompanyName,
        companyCode: oldCompanyCode,
      });
    };

    // 新建场景-改变公司-确认
    const handleOkChangeCompanyNewInquiry = () => {
      // 移出物料
      itemLineDs.removeAll();
    };

    // 新建场景-改变公司-取消
    const handleCancelChangeCompanyNewInquiry = () => {
      // eslint-disable-next-line no-unused-expressions
      basicFormDs?.current?.set('companyId', {
        companyId: oldCompanyId,
        companyName: oldCompanyName,
        companyCode: oldCompanyCode,
      });
    };

    // 新建场景
    if (isNewInquiry) {
      if (oldCompanyId !== companyId && itemLineDs?.length) {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl
            .get('ssrc.quickInquiry.message.confirm.changeCompany')
            .d('切换公司后，会将不在该公司下的物料行清空，是否继续切换？'),
          onOk: () => handleOkChangeCompanyNewInquiry(),
          onCancel: () => handleCancelChangeCompanyNewInquiry(),
        });
      }
    } else if (oldCompanyId !== companyId) {
      // 维护页改变公司
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('ssrc.quickInquiry.message.confirm.changeCompany')
          .d('切换公司后，会将不在该公司下的物料行清空，是否继续切换？'),
        onOk: () => handleOkChangeCompany(),
        onCancel: () => handleCancelChangeCompany(),
      });
    }
  };

  // 获取表单字段
  const getFormField = (fieldName) => {
    if (basicFormDs && basicFormDs.current) {
      return basicFormDs.current.get(fieldName);
    }
    return null;
  };

  // 切换拓展结果复选框
  const handleChangeExpandResultsFlag = (value) => {
    if (!basicFormDs || !basicFormDs.current) {
      return;
    }
    if ([1, '1'].includes(value)) {
      const { resultsExpandingDimensions, resultsExpandingHierarchy } =
        basicFormDs.current.get(['resultsExpandingDimensions', 'resultsExpandingHierarchy']) || {};
      if (!resultsExpandingDimensions) {
        basicFormDs.current.set({
          resultsExpandingDimensions: 'WHOLE_ORDER',
        });
      }
      if (!resultsExpandingHierarchy) {
        basicFormDs.current.set({
          resultsExpandingHierarchy: 'COMPANY',
        });
      }
    }
  };

  // 获取拓展公司显示条件
  const getExpandCompanyVisible = useComputed(() => {
    if (basicFormDs && basicFormDs.current) {
      const { expandResultsFlag, resultsExpandingDimensions } =
        basicFormDs.current.get(['expandResultsFlag', 'resultsExpandingDimensions']) || {};
      // 显示 拓展结果+拓展维度为【整单】
      return [1, '1'].includes(expandResultsFlag) && resultsExpandingDimensions === 'WHOLE_ORDER';
    }
    return false;
  }, [basicFormDs?.current]);

  // 获取拓展组织显示条件
  const getExpandInvOrganizationVisible = useComputed(() => {
    if (basicFormDs && basicFormDs.current) {
      const { expandResultsFlag, resultsExpandingDimensions, resultsExpandingHierarchy } =
        basicFormDs.current.get([
          'expandResultsFlag',
          'resultsExpandingDimensions',
          'resultsExpandingHierarchy',
        ]) || {};
      // 显示 拓展结果+ 拓展维度为【整单】+ 拓展层级为【库存组织】
      return (
        [1, '1'].includes(expandResultsFlag) &&
        resultsExpandingDimensions === 'WHOLE_ORDER' &&
        resultsExpandingHierarchy === 'INV_ORGANIZATION'
      );
    }
    return false;
  }, [basicFormDs?.current]);

  // 切换拓展维度
  const changeResultsExpandingDimensions = (value) => {
    if (!basicFormDs?.current) return;

    // 从整单切换到标的物行 清除【头】拓展公司 拓展库存组织
    if (value === 'ITEM_LINE') {
      basicFormDs.current.set({
        expandCompany: [],
        expandInvOrganization: [],
      });
    }
    // 从标的物切换到整单 无需清除【标的物行】拓展公司 拓展库存组织 后端兜底处理
  };

  // 切换寻源拓展层级
  const changeResultsExpandingHierarchy = (value) => {
    const current = basicFormDs?.current;
    if (!current) return;

    const { resultsExpandingDimensions = '' } = current.get(['resultsExpandingDimensions']) || {};

    // 从公司切换成库存组织 无需清除【标准库存组织】
    if (value === 'INV_ORGANIZATION') return;
    // 从库存组织切换公司 清除库存组织
    if (value === 'COMPANY') {
      // 拓展维度【整单】
      if (resultsExpandingDimensions === 'WHOLE_ORDER') {
        current.set({
          expandInvOrganization: [],
        });
      } else if (resultsExpandingDimensions === 'ITEM_LINE') {
        // 拓展维度【标的物】
        if (isNewInquiry) {
          // 快速询价新建页场景
          // 前端清除【拓展库存组织】
          // eslint-disable-next-line no-unused-expressions
          itemLineDs?.records?.forEach((record) => {
            record.set({
              expandInvOrganization: [],
            });
          });
        } else {
          // 快速询价维护页场景
          // 后台接口清除 再物料行查询
          clearExpandInvOrganization({
            rfqHeaderId,
            resultsExpandingDimensions,
            resultsExpandingHierarchy: value,
          }).then((res) => {
            if (getResponse(res)) {
              // 缓存表格数据 刷新 如有缓存【拓展库存组织】数据，前端无操作 后端作数据兜底处理
              itemLineDs.query(undefined, undefined, true);
            }
          });
        }
      }
    }
  };

  // 改变拓展公司
  const changeExpandCompany = (value = [], oldValue = []) => {
    // 清除对应公司下的库存组织
    const current = basicFormDs?.current;
    if (!current) return;
    const deleteFlag = value?.length < oldValue?.length || value === null;
    if (!deleteFlag) return;
    const sourceResultsData = getStoreData('companyInvOrganizationRelationShipData');
    updateExpandInvOrganizationFiled({ value, oldValue, record: current, sourceResultsData });
  };

  return customizeCollapseForm(
    {
      code: `SSRC.QUICK_INQUIRY.EDIT.BASE_HEADER_FORM`,
      dataSet: basicFormDs,
    },
    <CollapseForm dataSet={basicFormDs} columns={4} labelLayout="float" useWidthPercent>
      <Lov name="companyId" noCache onChange={changeCompany} clearButton={false} />
      <Lov name="purOrganizationId" noCache />
      <Lov name="purchaseAgentId" noCache />
      <CheckBox
        name="expandResultsFlag"
        showHelp="tooltip"
        onChange={handleChangeExpandResultsFlag}
      />
      <Select
        name="resultsExpandingDimensions"
        clearButton={false}
        hidden={![1, '1'].includes(getFormField('expandResultsFlag'))}
        onChange={changeResultsExpandingDimensions}
      />
      <Select
        name="resultsExpandingHierarchy"
        clearButton={false}
        hidden={![1, '1'].includes(getFormField('expandResultsFlag'))}
        onChange={changeResultsExpandingHierarchy}
      />
      <Lov
        name="expandCompany"
        noCache
        hidden={!getExpandCompanyVisible}
        onChange={changeExpandCompany}
      />
      <Lov name="expandInvOrganization" noCache hidden={!getExpandInvOrganizationVisible} />
    </CollapseForm>
  );
});
