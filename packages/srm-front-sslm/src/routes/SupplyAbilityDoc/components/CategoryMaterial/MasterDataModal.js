/*
 * CategoryMaterialModal - 推荐物料/品类主数据
 * @date: 2024/06/19 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import React, { useCallback } from 'react';

import SearchBarTable from '_components/SearchBarTable';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { renderC7NAttachmentText } from '@/routes/components/utils';
import AttachmentModal from '@/routes/SupplyAbilityMasterData/components/AttachmentModal';

import { getCommonParams, hanldeCountryChange, getCommonEditorProps } from '../../utils/index';

const Index = ({
  remote,
  customizeTable,
  searchCode = '',
  tableCode = '',
  dataSet,
  purchaserCreateFlag = true,
}) => {
  const handleAttamentModal = useCallback(record => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      title: intl.get('hzero.common.upload.modal.title').d('附件'),
      style: { width: 1090 },
      closable: true,
      destroyOnClose: true,
      cancelButton: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: <AttachmentModal lineRecord={record.toData()} />,
    });
  }, []);

  const getColumns = () => {
    const columns = [
      {
        name: 'itemCode',
      },
      {
        name: 'itemName',
        width: 120,
      },
      {
        name: 'itemCategoryCode',
      },
      {
        name: 'itemCategoryName',
        width: 120,
      },
      {
        name: 'supplyFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'dateFrom',
        width: 120,
      },
      {
        name: 'dateTo',
        width: 120,
      },
      {
        name: 'countryIdMeaning',
      },
      {
        name: 'regionIdMeaning',
      },
      {
        name: 'cityIdMeaning',
      },
      {
        name: 'manufacturer',
      },
      {
        name: 'adapterProducts',
      },
      {
        name: 'attachment',
        width: 130,
        fixed: 'right',
        renderer: ({ record }) => {
          const { fileCount, abilityLineId } = record.get(['fileCount', 'abilityLineId']);
          return (
            <a disabled={!abilityLineId} onClick={() => handleAttamentModal(record)}>
              {renderC7NAttachmentText({
                editable: false,
                fileCount,
              })}
            </a>
          );
        },
      },
      {
        name: 'purchaseOrganizationName',
        hidden: !purchaserCreateFlag,
      },
      {
        name: 'inventoryOrganizationIdMeaning',
        hidden: !purchaserCreateFlag,
      },
    ].filter(i => !i.hidden);

    return columns;
  };

  // 获取物料，品类字段属性
  const getFieldProps = () => {
    const fieldProps = getCommonParams();
    return fieldProps;
  };

  // 处理获取物料，品类字段切换
  const handleFieldChange = async ({ record, name }) => {
    hanldeCountryChange({ record, name });
    if (remote && remote.event) {
      await remote.event.fireEvent('cuxHandleFieldChange', {
        record,
        name,
      });
    }
  };

  // 筛选器组件属性
  const getEditorProps = () => {
    const editorProps = {
      ...getCommonEditorProps(),
    };
    return editorProps;
  };

  return (
    <div style={{ height: `calc(100vh - 209px)` }}>
      {customizeTable(
        {
          code: tableCode,
        },
        <SearchBarTable
          cacheState
          dataSet={dataSet}
          columns={getColumns()}
          searchCode={searchCode}
          style={{ maxHeight: '100%' }}
          searchBarConfig={{
            closeFilterSelector: true,
            expandable: false,
            editorProps: getEditorProps(),
            fieldProps: getFieldProps(),
            onFieldChange: handleFieldChange,
          }}
        />
      )}
    </div>
  );
};

export default Index;
