/*
 * TableBtns 供货能力行 - 按钮组
 * @Date: 2024-05-30 13:38:15
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';

import { Button, Lov, DataSet, Menu, Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

import { getItemDs, getCategoryDs } from './stores/getCreateItemCategoryDS';
import styles from './index.less';

const TableBtns = observer(
  ({
    dataSet,
    customizeBtnGroup,
    code = '',
    addMaterialCategory = () => {},
    handleBatchEdit = () => {},
    handDelete = () => {},
    hanldeChangeSupplyAbility = () => {},
    hiddenPurchaserBtn = false,
  }) => {
    // 批量新增-按物料
    const MaterialBtn = (btnProps = {}) => {
      // 获取额外按钮属性
      const { advisedMenuItem, inMenuItem } = btnProps || {};
      const needMenuItem = !!advisedMenuItem && !inMenuItem;
      const itemDs = new DataSet(getItemDs());
      const getBtnComp = () => (
        <Lov
          mode="button"
          name="itemLov"
          icon={needMenuItem ? '' : 'playlist_add'}
          clearButton={false}
          dataSet={itemDs}
          funcType="flat"
          onBeforeSelect={records => addMaterialCategory(records, 'createByMaterial')}
          modalProps={{
            beforeOpen: () => {
              const lovDs = itemDs.getField('itemLov').getOptions(itemDs.current);
              if (lovDs) {
                lovDs.unSelectAll();
                lovDs.clearCachedSelected();
              }
            },
          }}
        >
          <span
            className={classnames({
              [styles['supply-ability-detail-btn']]: true,
              [styles['supply-ability-detail-menu-btn']]: needMenuItem,
            })}
          >
            {intl.get('sslm.supplyAbilityDoc.button.btachCreateMaterial').d('批量新增物料')}
          </span>
        </Lov>
      );
      return needMenuItem ? <Menu.Item>{getBtnComp()}</Menu.Item> : getBtnComp();
    };

    // 批量新增-按品类
    const CategoryBtn = (btnProps = {}) => {
      // 获取额外按钮属性
      const { advisedMenuItem, inMenuItem } = btnProps || {};
      const needMenuItem = !!advisedMenuItem && !inMenuItem;
      const categoryDs = new DataSet(getCategoryDs());
      const getBtnComp = () => (
        <Lov
          mode="button"
          name="itemCategoryLov"
          icon={needMenuItem ? '' : 'playlist_add'}
          clearButton={false}
          dataSet={categoryDs}
          funcType="flat"
          onBeforeSelect={records => addMaterialCategory(records, 'createByCategory')}
          modalProps={{
            beforeOpen: () => {
              const lovDs = categoryDs.getField('itemCategoryLov').getOptions(categoryDs.current);
              if (lovDs) {
                lovDs.unSelectAll();
                lovDs.clearCachedSelected();
              }
            },
          }}
          tableProps={{
            alwaysShowRowBox: true,
            selectionMode: 'rowbox',
            onRow: ({ record }) => {
              const nodeProps = {};
              if (record.get('hasChild') === '0') {
                nodeProps.isLeaf = true;
              }
              return nodeProps;
            },
          }}
        >
          <span
            className={classnames({
              [styles['supply-ability-detail-btn']]: true,
              [styles['supply-ability-detail-menu-btn']]: needMenuItem,
            })}
          >
            {intl.get(`sslm.supplyAbilityDoc.button.batchCreateByCategory`).d('批量新增品类')}
          </span>
        </Lov>
      );
      return needMenuItem ? <Menu.Item>{getBtnComp()}</Menu.Item> : getBtnComp();
    };

    // 勾选标识
    const selectedFlag = !isEmpty(dataSet.selected);
    // 禁用批量编辑
    const disabledBatchEdit = !dataSet || isEmpty(dataSet.toData());

    const buttons = [
      hiddenPurchaserBtn && {
        name: 'supplierAdd',
        child: intl.get(`hzero.common.button.add`).d('新增'),
        btnProps: {
          onClick: () => addMaterialCategory([], 'create'),
          funcType: 'flat',
          icon: 'playlist_add',
          type: 'c7n-pro',
        },
      },
      !hiddenPurchaserBtn && {
        name: 'add',
        group: true,
        child: (
          <Button icon="playlist_add" funcType="flat">
            {intl.get(`hzero.common.button.add`).d('新增')}
            <Icon type="expand_more" style={{ fontSize: 16, marginTop: -2, marginRight: 0 }} />
          </Button>
        ),
        children: [
          {
            name: 'create',
            child: intl.get(`sslm.common.button.manualCreate`).d('手工新增'),
            btnProps: {
              onClick: () => addMaterialCategory([], 'create'),
              funcType: 'flat',
            },
          },
          {
            name: 'createByMaterial',
            btnComp: MaterialBtn,
          },
          {
            name: 'createByCategory',
            btnComp: CategoryBtn,
          },
        ],
      },
      {
        name: 'changeSupplyAbility',
        child: intl
          .get('sslm.supplyAbilityDoc.view.supplyAbility.changeSupplyAbility')
          .d('变更已有供货能力'),
        btnProps: {
          icon: 'application_allocation',
          style: { marginRight: 8 },
          onClick: hanldeChangeSupplyAbility,
          type: 'c7n-pro',
          funcType: 'flat',
        },
      },
      {
        name: 'delete',
        child: intl.get(`sslm.common.button.batchDelete`).d('批量删除'),
        btnProps: {
          icon: 'delete_sweep',
          disabled: !selectedFlag,
          style: { marginRight: 8 },
          onClick: handDelete,
          type: 'c7n-pro',
          funcType: 'flat',
        },
      },
      {
        name: 'batchEdit',
        child: selectedFlag
          ? intl.get('sslm.common.button.batchCheckEdit').d('勾选批量编辑')
          : intl.get('hzero.common.button.batchEdit').d('批量编辑'),
        btnProps: {
          icon: 'mode_edit',
          disabled: disabledBatchEdit,
          style: { marginRight: 8 },
          onClick: () => handleBatchEdit(),
          type: 'c7n-pro',
          funcType: 'flat',
        },
      },
    ].filter(Boolean);
    return customizeBtnGroup(
      {
        code,
        pro: true,
      },
      <DynamicButtons defaultBtnType="c7n-pro" buttons={buttons} />
    );
  }
);

export default TableBtns;
