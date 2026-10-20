/*
 * 推荐物料/品类
 * @date: 2024/05/31
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import React, { useCallback } from 'react';
import { isEmpty, isNil } from 'lodash';
import moment from 'moment';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Spin, Modal, Lov, DataSet, Tooltip, Button } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import { renderStatus, renderC7NAttachmentText } from '@/routes/components/utils';
import { dsDeleteData } from '@/routes/components/utils/utils';
import { batchSaveLine } from '@/services/supplyAbilityDocService';
import MasterDataAttachmentModal from '@/routes/SupplyAbilityMasterData/components/AttachmentModal';

import { getMasterDataCategoryDs } from './stores/getMasterDataCategoryDS';
import {
  getUnitCodeByRole,
  getCommonParams,
  hanldeCountryChange,
  getCommonEditorProps,
  renderNode,
  handleExtTextRenderIntercept,
} from '../../utils/index';
import BatchEditModal from './BatchEditModal';
import TableBtns from './TableBtns';
import AttachmentModal from './AttachmentModal';
import MasterDataModal from './MasterDataModal';

const organizationId = getCurrentOrganizationId();

const CategoryMaterial = ({
  remote,
  dataSet,
  location,
  reqAttUnitCode, // 主数据附件个性化单元
  masterAttUnitCode, // 申请单附件个性化单元
  customizeTable,
  customizeUnitCode = '',
  customizeSearchCode = '',
  btnGroupCode = '',
  customizeForm,
  customizeBtnGroup,
  custLoading,
  isEdit = false,
  headerInfo = {},
  pageSource = 'purchaser',
}) => {
  const {
    abilityReqId,
    usePurchaseItemFlag = 1, // 1 允许选择采购方物料，0 不允许
    initiateCamp = '0', // 0 采购方创建，1 供应商创建
    abilityReqStatus,
    supplierCompanyId,
    companyId,
  } = headerInfo;

  // 菜单所属方是采购方
  const purchaserMeunFlag = pageSource === 'purchaser';

  // 采购方创建的单据
  const purchaserCreateFlag = !Number(initiateCamp);
  // 业务规则配置允许供应商选择采购方物料，品类
  const allowSelectPurchaserItemFlag = !!Number(usePurchaseItemFlag);

  // 展示供方物料，品类字段；单据发起方是供应商，并且采购方不允许供应商选择采购方的物料、品类；
  const showSupplierItemField = !purchaserCreateFlag && !allowSelectPurchaserItemFlag;
  // 采购方角色-待审批可编辑字段
  const editFieldFlag =
    purchaserMeunFlag &&
    ['REJECTED_WFL', 'WAIT_APPROVAL'].includes(abilityReqStatus) &&
    showSupplierItemField;

  /**
   * 推荐物料/品类弹窗
   * */
  const handleBatchEdit = async () => {
    // 全量批量编辑标识
    const isAllSelectFlag = isEmpty(dataSet.selected);
    if (isAllSelectFlag) {
      // 校验数据
      const validateFlag = await dataSet.validate();
      if (validateFlag) {
        openBatchEditModal(isAllSelectFlag);
      }
    } else {
      // 是否有新建行
      let hasCreatStatus = false;
      hasCreatStatus = !isEmpty(dataSet.selected.filter(i => !i.get('abilityChangeLineId')));
      if (hasCreatStatus) {
        notification.warning({
          message: intl
            .get('sslm.supplyAbility.view.message.notification.newDataWarning')
            .d('勾选行有未保存的数据，请保存后再进行操作！'),
        });
      } else {
        openBatchEditModal(isAllSelectFlag);
      }
    }
  };

  /**
   * 批量编辑保存
   */
  const handleBatchEditSave = async (formValues = {}) => {
    const selectedRows = dataSet.selected?.map(item => item.toData()) || [];
    // 批量编辑表单参数
    const fieldsValuesObj = {
      ...formValues,
      dateFrom: formValues.dateFrom && moment(formValues.dateFrom).format(DEFAULT_DATE_FORMAT),
      dateTo: formValues.dateTo && moment(formValues.dateTo).format(DEFAULT_DATE_FORMAT),
    };
    const formData = filterNullValueObject(fieldsValuesObj);
    if (isEmpty(formData)) {
      // 关闭弹窗
      return true;
    }
    let payload = {
      abilityReqId,
      tenantId: organizationId,
    };
    if (isEmpty(selectedRows)) {
      // 全量保存
      // 获取新增的行
      const createLines = dataSet
        .filter(item => !item.get('abilityChangeLineId'))
        .map(item => item.toData());
      // 获取查询参数
      payload = {
        ...payload,
        selectAllFlag: 1,
        supplyAbilityChangeLineUpdateDTO: formData,
        supplyAbilityChangeLineList: createLines,
      };
    } else {
      const saveLineData = selectedRows.map(item => {
        const { dateFrom, dateTo, ...otherItem } = item;
        /** 处理入参字段
         *  2、处理日期格式
         */
        const formatData = {
          dateFrom: dateFrom && moment(dateFrom).format(DEFAULT_DATE_FORMAT),
          dateTo: dateTo && moment(dateTo).format(DEFAULT_DATE_FORMAT),
        };
        return { ...formatData, ...otherItem, ...formData };
      });

      payload = {
        ...payload,
        selectAllFlag: 0,
        supplyAbilityChangeLineList: saveLineData,
      };
    }
    const res = await batchSaveLine(payload);
    if (getResponse(res)) {
      return true;
    }
    return false;
  };

  // 批量编辑弹窗
  const openBatchEditModal = isAllSelectFlag => {
    const { batchEditFormCode } = getUnitCodeByRole(purchaserMeunFlag) || {};
    Modal.open({
      key: Modal.key(),
      title: intl.get('sslm.supplyAbility.view.message.category.edit').d('编辑品类物料'),
      style: { width: 380 },
      bodyStyle: {
        padding: '0 0 16px 0',
      },
      closable: true,
      destroyOnClose: true,
      drawer: true,
      footer: null,
      children: (
        <BatchEditModal
          isAllSelectFlag={isAllSelectFlag}
          handleBatchEditSave={handleBatchEditSave}
          customizeForm={customizeForm}
          custLoading={custLoading}
          tableDs={dataSet}
          purchaserCreateFlag={purchaserCreateFlag}
          tableCode={batchEditFormCode}
        />
      ),
    });
  };

  // 批量新增供应商分类确认回调-按物料
  const addMaterialCategory = useCallback(
    (records = [], type) => {
      let addList = [];
      if (type === 'create') {
        addList = [
          {
            tenantId: organizationId,
          },
        ];
      } else if (['createByMaterial', 'createByCategory'].includes(type)) {
        const newList = records.map(record => {
          const recordData = record.toData();
          const {
            categoryCode,
            itemCategoryCode,
            categoryName,
            itemCategoryName,
            categoryId,
            itemCategoryId,
            itemCode,
            itemId,
            itemName,
          } = recordData;
          return {
            itemId,
            itemCode,
            itemName,
            supplyFlag: 1,
            itemCategoryId: categoryId || itemCategoryId || null,
            itemCategoryCode: categoryCode || itemCategoryCode,
            itemCategoryName: categoryName || itemCategoryName,
            tenantId: organizationId,
          };
        });
        addList = remote
          ? remote.process(
              'SSLM_SUPPLY_ABILITY_DOC_DETAIL_CATEGORY_MATERIAL_BTACH_CREATE_DATA',
              newList,
              { records, type }
            )
          : newList;
      }
      const newAddList = remote
        ? remote.process('SSLM_SUPPLY_ABILITY_DOC_DETAIL_CATEGORY_MATERIAL_CREATE_DATA', addList, {
            records,
            type,
          })
        : addList;
      newAddList.forEach(record => {
        dataSet.create({ supplyFlag: 1, operationType: '0', ...record }, 0);
      });
    },
    [dataSet, remote]
  );

  // 变更已有供货能力
  const hanldeChangeSupplyAbility = () => {
    const { changeItemTableCode, changeItemSearchCode } =
      getUnitCodeByRole(purchaserMeunFlag) || {};
    const categoryDs = new DataSet(getMasterDataCategoryDs({ purchaserMeunFlag }));
    // 获取当前页引用主数据的物料品类行
    const relationAbilityLineIdList = dataSet
      .filter(r => r.get('relationAbilityLineId'))
      .map(r => r.get('relationAbilityLineId'));
    categoryDs.setQueryParameter('queryParam', {
      customizeUnitCode: `${changeItemSearchCode},${changeItemTableCode}`,
      supplierCompanyId,
      companyId,
      abilityReqId,
      relationAbilityLineIdList,
    });
    Modal.open({
      key: Modal.key(),
      drawer: true,
      title: intl
        .get('sslm.supplyAbilityDoc.view.supplyAbility.changeSupplyAbility')
        .d('变更已有供货能力'),
      style: { width: 1090 },
      closable: true,
      destroyOnClose: true,
      children: (
        <MasterDataModal
          remote={remote}
          dataSet={categoryDs}
          customizeTable={customizeTable}
          tableCode={changeItemTableCode}
          searchCode={changeItemSearchCode}
          purchaserCreateFlag={purchaserCreateFlag}
        />
      ),
      onOk: () => {
        const masterData = categoryDs.toJSONData();
        if (isEmpty(masterData)) {
          return;
        }
        masterData.forEach(r => {
          const { abilityLineId, supplyAbilityId, ...others } = r;
          const createData = {
            ...others,
            relationAbilityLineId: abilityLineId,
            operationType: '1',
          };
          dataSet.create(createData, 0);
        });
      },
    });
  };

  const handDelete = useCallback(() => {
    if (dataSet) {
      // 过滤已保存单据
      const saveData = (dataSet.selected || []).filter(r => r.get('abilityChangeLineId'));
      if (!isEmpty(saveData)) {
        dsDeleteData({ dataSet });
        return;
      }
      dataSet.delete(dataSet.selected, false);
    }
  }, [dataSet]);

  // 操作按钮集合
  const getButtons = () => {
    const Btn = (
      <TableBtns
        dataSet={dataSet}
        addMaterialCategory={addMaterialCategory}
        handleBatchEdit={handleBatchEdit}
        hanldeChangeSupplyAbility={hanldeChangeSupplyAbility}
        handDelete={handDelete}
        customizeBtnGroup={customizeBtnGroup}
        code={btnGroupCode}
        hiddenPurchaserBtn={showSupplierItemField}
      />
    );
    return isEdit ? [Btn] : [];
  };

  // 行附件
  const handleAttamentModal = useCallback(
    (record, type = 'reqDoc') => {
      // 展示申请单附件
      const showReqFile = type === 'reqDoc';
      let masterLineData = record.toData();
      if (!showReqFile) {
        const { relationAbilityLineId, ...others } = masterLineData;
        masterLineData = {
          abilityLineId: relationAbilityLineId,
          ...others,
        };
      }
      Modal.open({
        key: Modal.key(),
        drawer: true,
        title: intl.get('hzero.common.upload.modal.title').d('附件'),
        style: { width: 1090 },
        closable: true,
        destroyOnClose: true,
        footer: null,
        children: showReqFile ? (
          <AttachmentModal
            isEdit={isEdit}
            dataSet={dataSet}
            lineRecord={record.toData()}
            customizeTable={customizeTable}
            customizeUnitCode={reqAttUnitCode}
          />
        ) : (
          <MasterDataAttachmentModal
            lineRecord={masterLineData}
            customizeTable={customizeTable}
            customizeUnitCode={masterAttUnitCode}
          />
        ),
      });
    },
    [dataSet]
  );

  const cols = [
    {
      name: 'operationType',
      width: 100,
      editor: isEdit,
      renderer: isEdit
        ? null
        : ({ value, record }) => {
            if (isNil(value)) {
              return '-';
            }
            const { operationTypeMeaning } = record.get(['operationTypeMeaning']);
            const updateFlag = isNil(value) ? null : !!Number(value);
            let cuzOperationType = 'CREATE';
            if (!updateFlag) {
              cuzOperationType = 'CREATE';
            } else {
              cuzOperationType = 'UPDATE_ITEM';
            }
            record.init({ cuzOperationTypeMeaning: operationTypeMeaning, cuzOperationType });
            return renderStatus({ name: 'cuzOperationType', record }) || '-';
          },
    },
    {
      name: 'supItemDesc',
      width: 140,
      editor: isEdit,
      hidden: !showSupplierItemField,
    },
    {
      name: 'itemId',
      width: 150,
      editor: isEdit || editFieldFlag,
      displayField: 'itemCode',
    },
    {
      name: 'itemName',
      width: 180,
    },
    {
      name: 'supItemCategoryDesc',
      width: 140,
      editor: isEdit,
      hidden: !showSupplierItemField,
    },
    {
      name: 'itemCategoryId',
      width: 140,
      editor: (isEdit || editFieldFlag) && (
        <Lov
          name="itemCategoryId"
          searchFieldInPopup
          onOption={({ record: optionRecord }) => {
            return {
              disabled: optionRecord.get('isCheck') === false,
            };
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
        />
      ),
      displayField: 'itemCategoryCode',
    },
    {
      name: 'itemCategoryName',
      width: 180,
    },
    {
      name: 'supplyFlag',
      width: 80,
      editor: isEdit,
      type: 'CHECKBOX',
    },
    {
      name: 'dateFrom',
      width: 120,
      editor: isEdit,
      type: 'date',
    },
    {
      name: 'dateTo',
      width: 120,
      editor: isEdit,
      type: 'date',
    },
    {
      width: 140,
      name: 'countryId',
      editor: isEdit,
      displayField: 'countryIdMeaning',
    },
    {
      width: 100,
      name: 'regionId',
      editor: isEdit,
      displayField: 'regionIdMeaning',
    },
    {
      width: 100,
      name: 'cityId',
      editor: isEdit,
      displayField: 'cityIdMeaning',
    },
    {
      name: 'manufacturer',
      width: 150,
      editor: isEdit,
    },
    {
      name: 'adapterProducts',
      width: 100,
      editor: isEdit,
    },
    {
      name: 'remark',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'attachment',
      width: 130,
      renderer: ({ record }) => {
        const {
          fileCount,
          abilityChangeLineId,
          relationAbilityLineId,
          attachmentUpdateFlag,
        } = record.get([
          'fileCount',
          'abilityChangeLineId',
          'relationAbilityLineId',
          'attachmentUpdateFlag',
        ]);
        // 未保存的行
        if (!abilityChangeLineId) {
          // 新建行附件禁用，变更行附件可查看
          return (
            <Tooltip
              placement="top"
              title={intl
                .get('sslm.supplyAbilityDoc.view.message.notSaveFileTip')
                .d('保存申请单后才可以上传或更新行附件')}
            >
              <Button
                funcType="link"
                disabled={!relationAbilityLineId}
                onClick={() => handleAttamentModal(record, 'masterData')}
              >
                {renderC7NAttachmentText({
                  editable: false,
                  fileCount,
                })}
              </Button>
            </Tooltip>
          );
        } else {
          return (
            <a
              onClick={() => handleAttamentModal(record, 'reqDoc')}
              style={{ color: !isEdit && attachmentUpdateFlag && 'red' }}
            >
              {renderC7NAttachmentText({
                editable: isEdit,
                fileCount,
              })}
            </a>
          );
        }
      },
    },
    {
      name: 'purchaseOrganizationId',
      width: 150,
      editor: isEdit,
      hidden: !purchaserCreateFlag,
      displayField: 'purchaseOrganizationName',
    },
    {
      name: 'inventoryOrganizationId',
      width: 200,
      editor: isEdit,
      hidden: !purchaserCreateFlag,
      displayField: 'inventoryOrganizationIdMeaning',
    },
  ]
    .filter(i => !i.hidden)
    .map(i => {
      const { renderer, type, displayField, editor, ...others } = i;
      if (renderer) {
        return i;
      }
      return {
        renderer: editor
          ? null
          : ({ value, record, name }) => renderNode({ value, record, name, type, displayField }),
        ...others,
        editor,
      };
    });

  const columns = remote
    ? remote.process('SSLM_PURCHASER_SUPPLY_ABILITY_DOC_CATEGORY_MATERIAL_COLUMNS', cols, {
        isEdit,
        location,
        headerInfo,
        editFieldFlag,
      })
    : cols;

  // 字段属性
  const getFieldProps = () => {
    const fieldProps = {
      ...getCommonParams(),
    };
    return fieldProps;
  };

  // 筛选器组件属性
  const getEditorProps = () => {
    const editorProps = {
      ...getCommonEditorProps(),
    };
    return editorProps;
  };

  // 处理获取物料，品类字段切换
  const handleItemFieldChange = ({ record, name }) => {
    hanldeCountryChange({ record, name });
  };

  return (
    <div className="card-content">
      {remote &&
        remote.render('SSLM_PURCHASER_SUPPLY_ABILITY_DOC_CATEGORY_MATERIAL_EXTRA_NODE', null, {
          isEdit,
          dataSet,
        })}
      <Spin dataSet={dataSet}>
        <div className="card-content-title">
          {intl.get('sslm.supplyAbility.view.message.categoryMaterialTable').d('推荐物料/品类')}
        </div>
        {customizeTable(
          {
            code: customizeUnitCode,
            readOnly: !isEdit,
            extTextRenderIntercept: handleExtTextRenderIntercept,
          },
          <SearchBarTable
            cacheState={false} // 缓存expand配置，若需要变更expand时，需要设置为false
            dataSet={dataSet}
            columns={columns}
            buttons={getButtons()}
            searchCode={customizeSearchCode}
            searchBarConfig={{
              // autoQuery: false,
              closeFilterSelector: true,
              expand: !isEdit,
              expandable: isEdit,
              editorProps: getEditorProps(),
              fieldProps: getFieldProps(),
              onFieldChange: handleItemFieldChange,
            }}
            style={{ maxHeight: 518 }}
          />
        )}
      </Spin>
    </div>
  );
};

export default CategoryMaterial;
