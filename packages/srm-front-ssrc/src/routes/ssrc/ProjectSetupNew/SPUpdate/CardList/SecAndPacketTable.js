import React, { useContext, useMemo, useCallback } from 'react';
import { Table, useModal, Button, TextField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { isEmpty, noop } from 'lodash';
import { getResponse } from 'utils/utils';

import { StoreContext } from '../store/StoreProvider';

import AllotMaterialModal from '../modals/AllotMaterialModal';
import AddMaterialModal from '../modals/AddMaterialModal';

// 标段/包信息
const SecAndPacketTableCmp = observer((props) => {
  const Modal = useModal();

  const { handleSetOperateLoading = noop, fetchHeader = noop } = props;

  const {
    commonDs: {
      sectionOrPacketInfoDs,
      allotMaterialDs,
      addMaterialDs,
      headerDs,
      itemLineDs,
      supplierLineTableDs,
    } = {},
    doubleUnitFlag,
    customizeTable,
    getCustomizeUnitCode,
  } = useContext(StoreContext);

  // 标段分配物料-新增物料弹框
  const handleAddMaterial = (payload) => {
    const { sectionLineRecord } = payload || {};
    const projectLineSectionId = sectionLineRecord?.get('projectLineSectionId');
    addMaterialDs.setQueryParameter('projectLineSectionId', projectLineSectionId);
    addMaterialDs.query();

    const addMaterialProps = {
      customizeTable,
      getCustomizeUnitCode,
      addMaterialDs,
      doubleUnitFlag,
    };
    return Modal.open({
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.viewItemDetail`).d('物料'),
      destroyOnClose: true,
      children: <AddMaterialModal {...addMaterialProps} />,
      style: { width: 820 },
      onOk: () => {
        if (addMaterialDs.selected?.length) {
          const appendData = addMaterialDs.selected;
          // 所有从添加弹框中选中添加物料的id
          const projectLineItemIds = addMaterialDs.getQueryParameter('projectLineItemIds') || [];
          appendData.forEach((r) => {
            projectLineItemIds.push(r.get('projectLineItemId'));
            // 查找是否有重复的
            const result = allotMaterialDs.find(
              (existRecord) => r.get('projectLineItemId') === existRecord.get('projectLineItemId')
            );
            if (!result) {
              // 如果有重复的，则不添加
              r.set('appendChangeFlag', 1);
              allotMaterialDs.create(r.toData());
            }
          });
          addMaterialDs.setQueryParameter('projectLineItemIds', projectLineItemIds);
        }
      },
      onClose: () => {
        handleClearDsCached(addMaterialDs);
      },
    });
  };

  /**
   * 刷新头及表格数据
   */
  const refreshHeaderAndTableData = useCallback(async () => {
    try {
      await fetchHeader({ refreshSectionFieldsFlag: true });
      itemLineDs.query(itemLineDs.currentPage, undefined, true);
      sectionOrPacketInfoDs.query(sectionOrPacketInfoDs.currentPage, undefined, true);
    } catch (e) {
      throw e;
    }
  }, [itemLineDs, sectionOrPacketInfoDs]);

  // 分配物料
  const handleAllotMaterial = (record) => {
    const projectLineSectionId = record.get('projectLineSectionId');
    allotMaterialDs.setQueryParameter('projectLineSectionId', projectLineSectionId);
    allotMaterialDs.query();

    // 子组件传参
    const allotMaterialProps = {
      allotMaterialDs,
      headerDs,
      doubleUnitFlag,
      customizeTable,
      getCustomizeUnitCode,
      sectionLineRecord: record,
      handleAddMaterial: (p) => handleAddMaterial({ ...(p || {}), sectionLineRecord: record }),
      refreshHeaderAndTableData,
    };
    return Modal.open({
      title: intl.get(`ssrc.projectSetup.model.spChange.allotMaterial`).d('分配物料'),
      destroyOnClose: true,
      drawer: true,
      children: <AllotMaterialModal {...allotMaterialProps} />,
      style: { width: 742 },
      onOk: () => {
        return allotMaterialDs.submit().then(async (res) => {
          if (res && !res.failed) {
            refreshHeaderAndTableData();
          }
        });
      },
      onClose: () => {
        handleClearDsCached(allotMaterialDs);
        // 清除添加物料弹框选中的缓存id
        addMaterialDs.setQueryParameter('projectLineItemIds', []);
      },
    });
  };

  /**
   * clear ds cached
   * @param {*} dsList
   * @returns
   */
  const handleClearDsCached = (ds) => {
    if (!ds) return;
    ds.clearCachedSelected();
    ds.loadData([]);
    ds.clearCachedRecords();
  };

  const columns = [
    {
      name: 'sectionNum',
    },
    {
      name: 'sectionCode',
      editor: (record) => (
        <TextField name="sectionCode" record={record} restrict={/[^a-zA-Z0-9]/g} />
      ),
    },
    {
      name: 'sectionName',
      editor: true,
    },
    {
      name: 'allotMaterial',
      renderer: ({ record }) => {
        const { projectItemCount, projectLineSectionId } =
          record.get(['projectItemCount', 'projectLineSectionId']) || {};
        if (!projectLineSectionId) return null;
        return (
          <Button funcType="link" onClick={() => handleAllotMaterial(record)}>
            {intl.get(`ssrc.inquiryHall.view.message.button.distribution`).d('分配')}
            {projectItemCount ? `(${projectItemCount})` : ''}
          </Button>
        );
      },
    },
    {
      name: 'sectionRemark',
      editor: true,
    },
    {
      name: 'sectionAttachmentUuid',
      editor: true,
    },
  ];

  // 批量删除
  const handleBatchDeleteItem = () => {
    const selectedRecords = sectionOrPacketInfoDs?.selected || [];
    const addRecords = selectedRecords?.filter((r) => r.status === 'add') || [];
    const oldRecords = selectedRecords?.filter((r) => r.get('projectLineSectionId')) || [];

    // 删除新增数据
    sectionOrPacketInfoDs.remove(addRecords);

    if (!isEmpty(oldRecords)) {
      handleSetOperateLoading(true);
      // 删除线上数据
      sectionOrPacketInfoDs
        .delete(oldRecords, {
          title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
          children: intl
            .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
            .d('确认删除选中行？'),
        })
        .then(async (res) => {
          if (getResponse(res)) {
            try {
              // 刷新表格 & 保留缓存的变更数据
              await fetchHeader({ refreshSectionFieldsFlag: true });
              // 刷新表格 & 保留缓存的变更数据
              const list = [
                sectionOrPacketInfoDs.query(undefined, undefined, true),
                itemLineDs.query(itemLineDs.currentPage, undefined, true),
                supplierLineTableDs.query(supplierLineTableDs.currentPage, undefined, true),
              ];
              await Promise.all(list);
            } catch (err) {
              handleSetOperateLoading(false);
              throw err;
            }
          }
          handleSetOperateLoading(false);
        })
        .finally(() => handleSetOperateLoading(false));
    }
  };

  // 批量删除按钮禁用逻辑
  const batchDisabledFlag = useMemo(() => {
    return (
      !sectionOrPacketInfoDs ||
      !sectionOrPacketInfoDs.selected?.length ||
      (!sectionOrPacketInfoDs.length && !sectionOrPacketInfoDs.cachedRecords?.length) ||
      sectionOrPacketInfoDs?.status === 'loading'
    );
  }, [
    sectionOrPacketInfoDs?.selected,
    sectionOrPacketInfoDs.length,
    sectionOrPacketInfoDs.cachedRecords?.length,
    sectionOrPacketInfoDs?.status,
  ]);

  // table buttons
  const buttons = useMemo(
    () => [
      <Button
        name="add"
        funcType="flat"
        icon="playlist_add"
        onClick={() => {
          sectionOrPacketInfoDs.create({}, 0);
        }}
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <Button
        name="delete"
        funcType="flat"
        icon="delete_sweep"
        onClick={handleBatchDeleteItem}
        disabled={batchDisabledFlag}
      >
        {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
      </Button>,
    ],
    [batchDisabledFlag, handleBatchDeleteItem]
  );

  return customizeTable(
    {
      code: getCustomizeUnitCode('secAndPacketTable'),
      buttonCode: getCustomizeUnitCode('secAndPacketTableBtn'),
    },
    <Table
      dataSet={sectionOrPacketInfoDs}
      columns={columns}
      buttons={buttons}
      style={{ maxHeight: '4.5rem' }}
    />
  );
});

export default SecAndPacketTableCmp;
