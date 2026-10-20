/*
 * 推荐物料/品类
 * @date: 2024/05/31
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import React, { useCallback } from 'react';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { Modal } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import { yesOrNoRender } from 'utils/renderer';

import { renderC7NAttachmentText } from '@/routes/components/utils';
import {
  getCommonParams,
  getCommonEditorProps,
  hanldeCountryChange,
} from '@/routes/SupplyAbilityDoc/utils/index';

import AttachmentModal from './AttachmentModal';

const CategoryMaterial = ({
  remote,
  dataSet,
  attUnitCode,
  customizeTable,
  customizeUnitCode,
  customizeSearchCode,
  pageSource = 'purchaser',
}) => {
  // 菜单所属方是采购方
  const purchaserMeunFlag = pageSource === 'purchaser';

  // 行附件
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
      children: (
        <AttachmentModal
          lineRecord={record.toData()}
          customizeTable={customizeTable}
          customizeUnitCode={attUnitCode}
        />
      ),
    });
  }, []);

  // 行属性
  const handleRow = ({ record }) => {
    const rowProps = remote?.process(
      'SSLM_SUPPLY_ABILITY_MASTER_DATA_PURCHASER_ROW_PROPS',
      {},
      {
        record,
      }
    );
    return rowProps;
  };

  const cols = [
    {
      name: 'itemCode',
      width: 150,
    },
    {
      name: 'itemName',
      width: 180,
    },
    {
      name: 'itemCategoryCode',
      width: 100,
    },
    {
      name: 'itemCategoryName',
      width: 180,
    },
    {
      name: 'supplyFlag',
      width: 80,
      renderer: ({ value }) => {
        return isNil(value) ? '-' : yesOrNoRender(value);
      },
    },
    {
      name: 'adapterProducts',
      width: 100,
    },
    {
      width: 140,
      name: 'countryIdMeaning',
    },
    {
      width: 100,
      name: 'regionIdMeaning',
    },
    {
      width: 100,
      name: 'cityIdMeaning',
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
      name: 'remark',
      width: 200,
    },
    {
      name: 'purchaseOrganizationName',
      width: 150,
      hidden: !purchaserMeunFlag,
    },
    {
      name: 'inventoryOrganizationIdMeaning',
      width: 200,
      hidden: !purchaserMeunFlag,
    },
    {
      name: 'manufacturer',
      width: 150,
    },
    {
      name: 'lastUpdateUserName',
      width: 150,
    },
    {
      name: 'lastUpdateDate',
      width: 150,
    },
    {
      name: 'attachment',
      width: 130,
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
      name: 'dataSource',
      hidden: !purchaserMeunFlag,
      renderer: ({ record }) => {
        const dataSourceMeaning = record.get('dataSourceMeaning');
        return dataSourceMeaning;
      },
    },
    {
      name: 'docNumAndLineNum',
      hidden: !purchaserMeunFlag,
    },
  ].filter(i => !i.hidden);

  const columns = remote
    ? remote.process('SSLM_SUPPLY_ABILITY_QUERY_DETAIL_COLUMNS', cols, { purchaserMeunFlag })
    : cols;

  // 字段属性
  const getFieldProps = () => {
    const { itemCategoryId, ...others } = getCommonParams() || {};
    const fieldProps = {
      itemCategoryCode: itemCategoryId,
      ...others,
    };
    return fieldProps;
  };

  // 筛选器组件属性
  const getEditorProps = () => {
    const { itemCategoryId } = getCommonEditorProps() || {};
    const editorProps = {
      itemCategoryCode: itemCategoryId,
    };
    return editorProps;
  };

  // 处理获取物料，品类字段切换
  const handleItemFieldChange = ({ record, name }) => {
    hanldeCountryChange({ record, name });
  };

  return (
    <div className="card-content">
      <div className="card-content-title">
        {intl.get('sslm.supplyAbility.view.message.categoryMaterialTable').d('推荐物料/品类')}
      </div>
      {customizeTable(
        {
          code: customizeUnitCode,
        },
        <SearchBarTable
          dataSet={dataSet}
          columns={columns}
          searchCode={customizeSearchCode}
          searchBarConfig={{
            // autoQuery: false,
            expandable: false,
            editorProps: getEditorProps(),
            fieldProps: getFieldProps(),
            onFieldChange: handleItemFieldChange,
          }}
          onRow={handleRow}
          style={{ maxHeight: 518 }}
        />
      )}
    </div>
  );
};

export default CategoryMaterial;
