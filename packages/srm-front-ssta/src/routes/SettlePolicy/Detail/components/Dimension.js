/*
 * @Description: 结算策略详情-对账开票付款维度
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useMemo, useContext, useCallback, memo, useEffect } from 'react';
import { Table, Select, useModal } from 'choerodon-ui/pro';
import { Card, notification } from 'choerodon-ui';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import CardTitle from './CardTitle';
import PurOrderTypeModal from './PurOrderTypeModal';
import PurInvTypeModal from './PurInvTypeModal';
import ItemTypeModal from './ItemTypeModal';
import { Store } from '../StoreProvider';
import { useModalOpen } from '@/hooks';
import { getSelectedNegActConfirmMsg } from '@/utils/utils';

const onRecordUpdate = ({ name, record }) => {
  if (name === 'dimensionType') {
    record.set('dimension', undefined);
  } else if (name === 'dimension') {
    record.set({
      nullAble: 0,
      skipFullReversedLineFlag: 0,
      skipPendLineFlag: 0,
    });
  }
};

/**
 * @description: 对账开票付款维度
 * @param {Object} props name-级联名
 * @return {ReactNode}
 */
export default memo(({ tableDs, name, isTextFlag }) => {
  const { isPlat, editFlag, activeKey, collectRef, settleConfigId, platModalFlag } =
    useContext(Store);

  const selfModal = useModal();
  const modalOpen = useModalOpen(selfModal);

  useEffect(() => {
    tableDs.addEventListener('update', onRecordUpdate);
    return () => {
      tableDs.removeEventListener('update', onRecordUpdate);
    };
  }, [tableDs]);

  const columns = useMemo(() => {
    return [
      {
        name: 'dimensionType',
        width: 120,
        editor: (record) =>
          editFlag && record.selectable && record.get('dimensionType') !== 'SPLITE' ? (
            <Select
              optionsFilter={(option) => {
                // 若列表中已有拆分规则数据，则类型需要过滤拆分规则选项
                const spliteFilter =
                  option.get('value') === 'SPLITE' &&
                  tableDs.filter((record) => record.get('dimensionType') === 'SPLITE').length >= 1;
                return !spliteFilter;
              }}
            />
          ) : (
            false
          ),
        help: intl
          .get(`ssta.settleStrategy.view.message.dimensionType`)
          .d(
            '1.并单：校验配置字段是否一致；2.校验：校验配置字段相同的事物必须一齐创建；3.拆分：取并单规则，无需配置特定字段，启用拆分后，根据并单规则自动拆分为多个单据'
          ),
      },
      {
        name: 'dimension',
        width: 200,
        editor: (record) => {
          const editNewFlag =
            editFlag && (record.get('dimensionType') === 'SPLITE' ? true : record.selectable);
          return editNewFlag ? (
            <Select
              optionsFilter={(option) => dimensionOptionsFilters(option, record)}
              onChange={() => {
                if (record.get('dimensionType') !== 'SPLITE') record.set('billDimensionId', null);
              }}
            />
          ) : (
            false
          );
        },
      },
      {
        name: 'nullAble',
        width: 120,
        editor: (record) => editFlag && record.get('dimensionType') === 'DOC_MERGE',
        renderer: ({ value, record }) =>
          record.get('dimensionType') === 'DOC_MERGE' ? yesOrNoRender(Number(value)) : null,
      },
      {
        name: 'skipFullReversedLineFlag',
        width: 120,
        editor: (record) => {
          const { dimension, dimensionType } = record.get(['dimension', 'dimensionType']);
          return (
            editFlag &&
            dimensionType === 'VALIDATE_RULE' &&
            !['ORI_TRX_NUM', 'SUPPLIER_QUALIFICATION_DOCUMENT_VALIDITY_CONTROL'].includes(dimension)
          );
        },
        renderer: ({ value, record }) => {
          const { dimension, dimensionType } = record.get(['dimension', 'dimensionType']);
          return dimensionType === 'VALIDATE_RULE' &&
            !['ORI_TRX_NUM', 'SUPPLIER_QUALIFICATION_DOCUMENT_VALIDITY_CONTROL'].includes(dimension)
            ? yesOrNoRender(Number(value))
            : null;
        },
      },
      {
        name: 'skipPendLineFlag',
        width: 120,
        editor: (record) => {
          const { dimension, dimensionType } = record.get(['dimension', 'dimensionType']);
          return (
            editFlag &&
            dimensionType === 'VALIDATE_RULE' &&
            !['ORI_TRX_NUM', 'SUPPLIER_QUALIFICATION_DOCUMENT_VALIDITY_CONTROL'].includes(dimension)
          );
        },
        renderer: ({ value, record }) => {
          const { dimension, dimensionType } = record.get(['dimension', 'dimensionType']);
          return dimensionType === 'VALIDATE_RULE' &&
            !['ORI_TRX_NUM', 'SUPPLIER_QUALIFICATION_DOCUMENT_VALIDITY_CONTROL'].includes(dimension)
            ? yesOrNoRender(Number(value))
            : null;
        },
      },
      {
        name: 'billDimension',
        width: 120,
        renderer: ({ record }) => {
          const { dimension } = record.get(['dimension']) || {};
          if (
            ['TRX_TYPE', 'orderType', 'invOrganizationId', 'itemId', 'RETURN_ORDER_TYPE', 'trxTypeCode'].includes(
              dimension
            ) &&
            !isPlat &&
            !platModalFlag
          ) {
            return (
              <a onClick={() => handleEditPurOrderType(record)}>
                {editFlag
                  ? intl.get('hzero.common.button.edit').d('编辑')
                  : intl.get('hzero.common.button.view').d('查看')}
              </a>
            );
          } else return null;
        },
      },
    ];
  }, [isPlat, tableDs, editFlag, platModalFlag, handleEditPurOrderType, dimensionOptionsFilters]);

  const handleDeleteDimension = useCallback(async () => {
    const res = await tableDs.delete(
      tableDs.selected,
      getSelectedNegActConfirmMsg('delete', tableDs)
    );
    if (res?.success) {
      await tableDs.query(undefined, undefined, true);
    }
  }, [tableDs]);

  const handleEditPurOrderType = useCallback(
    (record) => {
      const { billDimensionId, dimension } = record?.get(['billDimensionId', 'dimension']) || {};
      if (billDimensionId) {
        const commonProps = {
          billDimensionId,
          editFlag,
          platModalFlag,
          dimension,
        };
        const titleMap = {
          TRX_TYPE: intl
            .get(`ssta.settleStrategy.view.settleStrategy.purchase.order.type`)
            .d('采购事务类型'),
          orderType: intl.get(`ssta.settleStrategy.view.settleStrategy.order.type`).d('订单类型'),
          invOrganizationId: intl
            .get(`ssta.settleStrategy.view.settleStrategy.invOrganizationId`)
            .d('库存组织'),
          itemId: intl.get(`ssta.settleStrategy.view.settleStrategy.itemId`).d('物料编码'),
          RETURN_ORDER_TYPE: intl
            .get(`ssta.settleStrategy.view.settleStrategy.returnOrderType`)
            .d('退货订单类型'),
          trxTypeCode: intl
          .get(`ssta.settleStrategy.view.settleStrategy.purchase.order.trxTypeCode`)
          .d('事务类型'),
        };
        modalOpen({
          editFlag,
          size: 'medium',
          title: titleMap[dimension],
          children:
            dimension === 'itemId' ? (
              <ItemTypeModal {...commonProps} />
            ) : dimension === 'invOrganizationId' ? (
              <PurInvTypeModal {...commonProps} />
            ) : (
              <PurOrderTypeModal {...commonProps} />
            ),
        });
      } else {
        notification.warning({
          message: intl
            .get(`ssta.settleStrategy.view.settleStrategy.not.modifiable`)
            .d('未保存或发布的单据不可维护'),
        });
      }
    },
    [editFlag, modalOpen, platModalFlag]
  );

  const dimensionOptionsFilters = useCallback(
    (option, record) => {
      if (activeKey === 'bill') {
        return record.get('dimensionType') === 'VALIDATE_RULE'
          ? option.get('value') !== 'BILL_NUM'
          : true;
      } else {
        return record.get('dimensionType') === 'VALIDATE_RULE'
          ? option.get('value') !== 'SETTLE_HEADER_NUM'
          : true;
      }
    },
    [activeKey]
  );

  const buttons = useMemo(() => {
    return editFlag && settleConfigId !== 'create'
      ? [
          'add',
          [
            'delete',
            {
              icon: 'delete_sweep',
              onClick: handleDeleteDimension,
              children: intl.get('hzero.common.button.batchDelete').d('批量删除'),
            },
          ],
        ]
      : [];
  }, [editFlag, settleConfigId, handleDeleteDimension]);

  const text = useMemo(() => {
    switch (isTextFlag) {
      case 1:
        return intl
          .get(`ssta.settleStrategy.view.message.settleHelpTip`)
          .d(
            '勾选事务新建/添加至结算单时，会根据该配置判断勾选事务是否满足配置维度的并单规则或校验规则，亦可通过该配置项实现自动拆单'
          );
      case 2:
        return intl
          .get(`ssta.settleStrategy.view.message.settleHelpDimension`)
          .d(
            '勾选事务新建/添加至结算单时，会根据该配置判断勾选事务是否满足配置维度的并单规则或校验规则，亦可通过该配置项实现自动拆单'
          );
      default:
        return intl
          .get(`ssta.settleStrategy.view.message.settleHelp`)
          .d(
            '勾选事务新建/添加至对账单时，会根据该配置判断勾选事务是否满足配置维度的并单规则或校验规则，亦可通过该配置项实现自动拆单'
          );
    }
  }, [isTextFlag]);

  return (
    <Card
      bordered={false}
      className={DETAIL_CARD_CLASSNAME}
      title={
        <CardTitle
          title={tableDs.props.validationTitle}
          help={text}
          effectiveText={intl
            .get(`ssta.settleStrategy.view.message.createEffectiveAndSubmitUpdate`)
            .d('创建生效，提交更新')}
          effectiveTip={intl
            .get('ssta.settleStrategy.view.message.createEffectivePoolAndSubmit')
            .d('选择事务创建单据、单据内新增行时生效，提交时更新')}
        />
      }
      ref={(dom) => collectRef(dom, name)}
    >
      <Table
        dataSet={tableDs}
        columns={columns}
        selectionMode={editFlag && settleConfigId !== 'create' ? 'rowbox' : 'none'}
        buttons={buttons}
        customizedCode="SSTA_STRATEGY_DETAIL.DIMENSION"
        style={{ maxHeight: 430 }}
      />
    </Card>
  );
});
