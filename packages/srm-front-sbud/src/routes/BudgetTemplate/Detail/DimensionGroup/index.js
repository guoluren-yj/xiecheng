import React, { useMemo, useRef } from 'react';
import { Table, useDataSet, CheckBox, Modal, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { Tag } from 'choerodon-ui';
import { yesOrNoRender } from 'utils/renderer';
import { observer } from 'mobx-react-lite';

import BudgetItemDetail from '@/routes/components/BudgetItemDetail';
import { dimensionLineDS } from '../../stores/detailDs';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const Index = ({
  // containerId,
  history,
  // handleSave,
  dimensionGroupLineDs,
  budgetTemplateId,
}) => {
  const dimensionListDs = useDataSet(
    () => ({
      ...dimensionLineDS({ budgetTemplateId }),
      record: {
        dynamicProps: {
          selectable: record => {
            const budgetItemCodeArr = [
              ...(dimensionGroupLineDs?.data?.map(e => e.get('budgetItemCode')) || []),
              ...(dimensionGroupLineDs?.cachedModified?.map(e => e.get('budgetItemCode')) || []),
            ];
            if (budgetItemCodeArr.includes(record.get('budgetItemCode'))) {
              return false;
            } else {
              return true;
            }
          },
        },
      },
    }),
    [budgetTemplateId]
  );

  const detailRef = useRef(null);

  // 处理新增行保存
  const handleModalSave = () => {
    return new Promise(async resolve => {
      const createTemplateItemList = dimensionListDs.selected.map(e => e.toData());
      handleModalClose();
      createTemplateItemList.forEach(ele => {
        dimensionGroupLineDs.create(
          {
            ...ele,
            budgetFlag: 1,
            multipleFlag: 0,
            queryFlag: 0,
            requiredFlag: 0,
            gridSeq: 0,
            gridWidth: 200,
          },
          0
        );
      });
      resolve();
    });
  };

  // 关闭弹窗
  const handleModalClose = () => {
    dimensionListDs.unSelectAll();
    dimensionListDs.clearCachedSelected();
    Modal.destroyAll();
  };

  const CreatedBtn = observer(() => (
    <Button
      color="primary"
      onClick={() => handleModalSave()}
      disabled={dimensionListDs.selected.length === 0}
    >
      {intl.get(`${commonPrompt}.createdDimensionGruop`).d('新增至预算维度组')}
    </Button>
  ));

  // 弹出编辑预算维度侧弹框
  const openEditModal = record => {
    const title = intl.get(`${commonPrompt}.viewBudgetItemPre`).d('查看预算维度');
    const formData = record.toData();

    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '1090px' },
      title,
      children: (
        <>
          <BudgetItemDetail formData={formData} ref={detailRef} isTenant disabled />
        </>
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: okBtn => okBtn,
    });
  };

  const colorSourceRender = (value, text) => {
    if (value === '1') {
      return (
        <Tag color="green" style={{ border: 'none' }}>
          {intl.get(`hzero.common.predefined`).d('预定义')}
        </Tag>
      );
    } else {
      return (
        <Tag color="yellow" style={{ border: 'none' }}>
          {intl.get(`hzero.common.custom`).d('自定义')}
        </Tag>
      );
    }
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'budgetItemCode',
        width: 150,
      },
      {
        name: 'budgetItemName',
        width: 150,
      },
      {
        name: 'gridSeq',
        width: 80,
        editor: true,
      },
      {
        name: 'gridWidth',
        width: 80,
        editor: true,
      },
      {
        name: 'requiredFlag',
        width: 100,
        editor: true,
      },
      {
        name: 'queryFlag',
        width: 160,
        editor: true,
      },
      {
        name: 'multipleFlag',
        width: 100,
        editor: true,
      },
      {
        name: 'budgetFlag',
        width: 160,
        editor: true,
      },
    ];
  });

  const dimensionColumns = useMemo(() => {
    return [
      {
        name: 'budgetItemCode',
        width: 180,
        renderer: ({ record, text }) => <a onClick={() => openEditModal(record)}>{text}</a>,
      },
      {
        name: 'budgetItemName',
        width: 200,
      },
      // {
      //   name: 'enabledFlag',
      //   width: 180,
      //   renderer: ({ value }) => yesOrNoRender(Number(value)),
      // },
      {
        name: 'predefinedFlag',
        width: 180,
        renderer: ({ value }) => colorSourceRender(value),
      },
      {
        name: 'componentType',
        width: 180,
      },
      {
        name: 'lovCode',
        width: 250,
      },
    ];
  });

  const jumpBudgetDimension = () => {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: (
        <div>
          {intl
            .get(`${commonPrompt}.jumpBudgetDimensionTip`)
            .d(`您即将离开预算模版配置前往预算维度定义，是否确认离开？`)}
        </div>
      ),
    }).then(button => {
      if (button === 'ok') {
        history.push({
          pathname: '/sbud/budget-item-mapping/list',
        });
      }
    });
  };

  // 弹出创建维度弹框
  const handleCreateModal = () => {
    dimensionListDs.query();
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '1090px' },
      title: intl.get(`${commonPrompt}.chooseBudgetDimension`).d('选择模板维度'),
      children: (
        <>
          <Table
            style={{ maxHeight: 'calc(100vh - 220px)' }}
            dataSet={dimensionListDs}
            columns={dimensionColumns}
            queryFieldsLimit={3}
            customizable
            customizedCode="SBUD_BUDGET_TEMPLATE.DIMENSION_LIST"
          />
        </>
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      footer: (
        <>
          <CreatedBtn />
          <Button onClick={() => jumpBudgetDimension()}>
            {intl.get(`${commonPrompt}.jumpBudgetDimension`).d('新建或编辑预算维度')}
          </Button>
          <Button onClick={() => handleModalClose()}>
            {intl.get('hzero.common.btn.cancel').d('取消')}
          </Button>
        </>
      ),
    });
  };

  const DeleteBtn = observer(() => {
    const { selected } = dimensionGroupLineDs;
    return (
      <Button
        key="delete"
        funcType="flat"
        icon="delete_sweep"
        color="primary"
        type="c7n-pro"
        onClick={() => {
          if (selected.every(record => !record.get('templateItemId'))) {
            dimensionGroupLineDs.remove(selected);
          } else {
            dimensionGroupLineDs.delete(selected, {
              title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
              children: (
                <div>
                  {intl
                    .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
                    .d('确认删除选中行？')}
                </div>
              ),
            });
          }
        }}
        disabled={isEmpty(selected)}
      >
        {intl.get('hzero.common.button.batchDelete').d('批量删除')}
      </Button>
    );
  });

  const buttons = [
    <Button funcType="flat" icon="playlist_add" onClick={() => handleCreateModal()}>
      {intl.get(`${commonPrompt}.createBudgetDimension`).d('新增维度')}
    </Button>,
    <DeleteBtn />,
  ];

  return (
    <Table
      style={{ maxHeight: '420px' }}
      dataSet={dimensionGroupLineDs}
      columns={columns}
      buttons={buttons}
      customizable
      customizedCode="SBUD_BUDGET_TEMPLATE.GROUP_LIST"
    />
  );
};

export default Index;
