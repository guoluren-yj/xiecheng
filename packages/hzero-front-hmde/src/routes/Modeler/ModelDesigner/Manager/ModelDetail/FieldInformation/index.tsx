import React, { useState, useRef, useMemo, useEffect, useContext, FC } from 'react';
import { Table, Button, DataSet, Icon, Tooltip, Select, Lov } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Radio } from 'choerodon-ui';
import notification from 'utils/notification';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import {
  ColumnLock,
  TableQueryBarType,
  ColumnAlign,
  TableColumnTooltip,
} from 'choerodon-ui/pro/lib/table/enum';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import { Renderer } from 'choerodon-ui/pro/lib/field/FormField';
import { RadioChangeEvent } from 'choerodon-ui/lib/radio/interface.d';
import { RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import { MySQLDataType, OracleDataType } from '@/routes/Modeler/ModelDesigner/utils/dataTypeChange';

import { EFieldType } from '@/globalData/modelManager';
import ImgIcon from '@/utils/ImgIcon';
import Modal from '@/components/LowcodeModal';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import { isPresetField, hasNumberType } from '@/routes/Modeler/ModelDesigner/utils/utils';
import _store, { IModelManagerStore } from '@/routes/Modeler/ModelDesigner/stores';
import { searchMatcher } from '@/utils/common';

import DataModelFieldDataSet from './CreateModelModal/DataModelFieldDataSet';
import BaseTableFieldDataSet from './CreateModelModal/BaseTableFieldDataSet';
import EditModelDataSet from './CreateModelModal/EditModelDataSet';
import AddFieldModal from './AddFieldModal';
import RedundantTable from './RedundantTable';
import { IHandleMenuQueryList } from '../../../ListView';
import styles from '../index.less';

enum EButtons {
  delete = 'delete',
  new = 'new',
  editBatch = 'editBatch',
  save = 'save',
  cancel = 'cancel',
}

enum ERadioVal {
  fieldBtn = 'fieldBtn',
  redundantBtn = 'redundantBtn',
}

interface IValueList {
  valueListCode: string;
}

interface IRuleCode {
  ruleCode: string;
}

interface IModal {
  update: (arg?: any) => void;
  close: () => void;
}

const { Column } = Table;
const { Option } = Select;
// 静态数据
const modelModalKey = Modal.key();
let modelModal: IModal = {
  update: () => {},
  close: () => {},
};

// 模型字段数据类型可选范围
const modelDataTypeList = [
  'Boolean',
  'Byte',
  'Short',
  'Integer',
  'Long',
  'Float',
  'Double',
  'LocalDate',
  'ZonedDateTime',
  'BigDecimal',
  'String',
];

interface IIndex extends IHandleMenuQueryList {
  redundantTableDataSet: DataSet;
  fieldInformationDataSet: DataSet;
  // handleMenuQueryList: any; // IHandleMenuQueryListParams;
  handleEditField: (record: Record) => void;
  refreshHeaderInfo: () => void;
  headerModalDetailInfoDS: DataSet;
}

const Index: FC<IIndex> = observer(
  ({
    redundantTableDataSet,
    fieldInformationDataSet,
    handleMenuQueryList,
    handleEditField = () => {},
    refreshHeaderInfo,
    headerModalDetailInfoDS,
  }) => {
    const modelManagerStore = useContext<IModelManagerStore>(_store as any).store;
    const {
      setRightEditData,
      setDataStore,
      storeData: {
        refTableCode,
        modelDetail,
        radioVal,
        refDataSourceType,
        modelType,
        fieldAttribute,
        historyRightListName,
        resourceUponRoleHierarchy,
        modalDetailHeaderEditFlag,
        modalFileBatchEditFlag,
      },
    }: IModelManagerStore = modelManagerStore; // useContext<IModelManagerStore>(_store as any).store;

    const [valueListObj, setValueListObj] = useState<null | IValueList>(null);
    const [ruleCodeObj, setRuleCodeObj] = useState<null | IRuleCode>(null);

    const stepRef: any = useRef();
    const fieldSwitchRef: any = useRef();
    const [step, setStep] = useState<number>(0); // 步骤
    stepRef.current = step;
    fieldSwitchRef.current = EFieldType.TABLE_FIELD;
    const dataModelFieldDataSet = useMemo(() => {
      return new DataSet(
        DataModelFieldDataSet(
          modelDetail.id,
          undefined,
          resourceUponRoleHierarchy,
          modelDetail.extendsParentCode
        )
      );
    }, [modelDetail.id, modelDetail.extendsParentCode]);
    const baseTableFieldDataSet = useMemo(() => {
      return new DataSet(
        BaseTableFieldDataSet(
          dataModelFieldDataSet,
          refDataSourceType,
          modelDetail.id,
          resourceUponRoleHierarchy,
          modelDetail.extendsParentCode
        )
      );
    }, [
      refTableCode,
      modelDetail.id,
      refDataSourceType,
      dataModelFieldDataSet,
      modelDetail.extendsParentCode,
    ]);

    // 解决code为空还搜索的bug
    const editModelDataSet = useMemo(
      () =>
        new DataSet(
          EditModelDataSet(
            modelDetail.id,
            dataModelFieldDataSet,
            baseTableFieldDataSet,
            resourceUponRoleHierarchy
          )
        ),
      [modelDetail.id, dataModelFieldDataSet, baseTableFieldDataSet, resourceUponRoleHierarchy]
    );

    useEffect(() => {
      const button = document.querySelector('.model-detail-button-add-field') as HTMLElement | null;
      if (button) {
        button.classList.add('.model-detail-button-add-field-operation-disabled');

        button.style.cursor = 'not-allowed';
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.5';
      }
    }, [modelDetail.id]);

    useEffect(() => {
      modelModal.update({
        children: (
          <AddFieldModal
            refTableCode={refTableCode}
            editModelDataSet={editModelDataSet}
            step={step === -1 ? 0 : step}
            refDataSourceType={refDataSourceType}
            fieldSwitchRef={fieldSwitchRef}
            baseTableFieldDataSet={baseTableFieldDataSet}
            dataModelFieldDataSet={dataModelFieldDataSet}
            resourceUponRoleHierarchy={resourceUponRoleHierarchy}
            modelManagerStore={modelManagerStore}
          />
        ),
        footer: footerCom,
      });
    }, [step]);

    // 处理批量编辑
    const handleSaveAll = async () => {
      if (!fieldInformationDataSet.dirty) {
        // 数据没有更改，不需要调节接口，也不需要验证，保持现状即可
        setDataStore('modalFileBatchEditFlag', false);
        return;
      }

      const res = await fieldInformationDataSet.submit();
      if (res && !res.failed) {
        setDataStore('modalFileBatchEditFlag', false);
      } else {
        notification.error({
          description: res?.message,
        } as any);
      }
    };

    // 下一步1
    const handleStep1 = async () => {
      setStep(stepRef.current + 1);

      dataModelFieldDataSet.setState('modelId', modelManagerStore.storeData.modelDetail.id);
      await dataModelFieldDataSet.query();

      dataModelFieldDataSet.forEach((record) => {
        if (record.get('primaryFlag')) {
          // eslint-disable-next-line no-param-reassign
          record.selectable = false;
        } // 设置主键不能选择
      });
      baseTableFieldDataSet.query(undefined, { code: modelManagerStore.storeData.refTableCode });
    };

    // 下一步2
    const handleStep2 = async () => {
      const val = await dataModelFieldDataSet.validate();
      if (val) {
        setStep(stepRef.current + 1);
      }
    };

    // 下一步3
    const handleStep3 = async () => {
      const val = await dataModelFieldDataSet.validate();
      const valField = await editModelDataSet.validate();
      if (val && valField) {
        if (editModelDataSet && editModelDataSet.current) {
          editModelDataSet.current.status = RecordStatus.add;
        }
        await editModelDataSet.submit();
        await fieldInformationDataSet.query();
        handleMenuQueryList(); // 左边侧边栏
        const t = setTimeout(() => {
          modelModal.close();
          clearTimeout(t);
        });
      }
    };

    // 脚步
    type IFooterCom = (cancelOK: JSX.Element, cancelBtn: JSX.Element) => JSX.Element;
    const footerCom: IFooterCom = (cancelOK, cancelBtn) => {
      if (fieldSwitchRef.current === EFieldType.TABLE_FIELD) {
        return (
          <div className={globalStyles['model-footer']}>
            {stepRef.current !== 0 && (
              <Button
                onClick={async () => {
                  const val = await dataModelFieldDataSet.validate();
                  if (!val) return;
                  setStep(stepRef.current - 1);
                }}
              >
                上一步
              </Button>
            )}
            {stepRef.current !== 2 && (
              <Button
                color={ButtonColor.blue}
                onClick={() => {
                  switch (stepRef.current) {
                    case 0:
                      return handleStep1();
                    case 1:
                      return handleStep2();
                    default:
                  }
                }}
              >
                下一步
              </Button>
            )}
            {stepRef.current === 2 && (
              <>
                <Button onClick={handleStep3} color={ButtonColor.blue}>
                  保存
                </Button>
              </>
            )}
          </div>
        );
      }
      return (
        <>
          {cancelOK},{cancelBtn}
        </>
      );
    };

    // 【新增模型字段】函数回调
    const openModelModal = () => {
      setStep(0);
      const handleAfterClose = () => {
        // 关闭清空
        editModelDataSet.reset();
        dataModelFieldDataSet.removeAll();
        baseTableFieldDataSet.removeAll();
        if (historyRightListName === 'field') {
          fieldInformationDataSet.some((item: any) => {
            if (item?.data?.fieldName === fieldAttribute?.data?.fieldName) {
              setRightEditData(historyRightListName, item);
              return true;
            }
            return false;
          });
        }
      };
      modelModal = Modal.open({
        lowcodeSize: 'biggest',
        title: <div style={{ fontSize: '.18rem', fontWeight: 'bold' }}>新增模型字段</div>,
        key: modelModalKey,
        destroyOnClose: true, // 关闭时是否销毁
        closable: true, // 显示右上角关闭按钮
        children: (
          <AddFieldModal
            refTableCode={refTableCode}
            editModelDataSet={editModelDataSet}
            step={step === -1 ? 0 : step}
            refDataSourceType={refDataSourceType}
            fieldSwitchRef={fieldSwitchRef}
            baseTableFieldDataSet={baseTableFieldDataSet}
            dataModelFieldDataSet={dataModelFieldDataSet}
            resourceUponRoleHierarchy={resourceUponRoleHierarchy}
            modelManagerStore={modelManagerStore}
          />
        ),
        footer: footerCom,
        afterClose: handleAfterClose,
      });
    };

    // 【批量编辑】回调函数
    const handleBatchEditing = () => {
      setDataStore('modalFileBatchEditFlag', true);
    };

    /**
     * 扩展表操作列
     * @param {} param0 当前行信息
     */
    const redCommand = ({ record }: { record: Record }) => {
      // 20210301更 PC哥要求扩展表的预置字段放开编辑按钮
      if (
        isPresetField(record.get('fieldName'), ['whoNameList']) ||
        isPresetField(record.get('fieldName'), ['redNameList']) ||
        record.get('primaryFlag') === 1
      ) {
        // 设置扩展字段和who字段和主键不可编辑
        return [
          <Icon
            type="border_color"
            style={{ cursor: 'not-allowed', fontSize: '16px', color: 'rgba(0, 0, 0, 0.25)' }}
          />,
        ];
      }
      if (
        (isTenantRoleLevel() ||
          modelManagerStore.storeData.resourceUponRoleHierarchy === 'tenant') &&
        modelManagerStore.storeData.modelType === 'PLATFORM_SHARED'
      ) {
        return [];
      }
      return [
        <a key="field-edit2" onClick={() => handleEditField(record)} style={{ color: '#5a6677' }}>
          <Icon type="border_color" className={styles['table-icon']} />
        </a>,
        <a
          key="field-delete"
          className={styles['table-a-left']}
          hidden={false}
          onClick={() => redundantTableDataSet.delete(record)}
          style={{ color: '#5a6677' }}
        >
          {/* <Icon type="delete" className={styles['table-icon']} /> */}
          <ImgIcon name="delete-210618.svg" size={16} />
        </a>,
      ];
    };

    // 0/1转为是否
    function renderBooleanText({ value }: { value: number }) {
      if ([0, 1].includes(value)) {
        return <span>{value === 1 ? '是' : '否'}</span>;
      }
      return <></>;
    }

    const renderDisplayName = ({ record, value }: { record: Record; value: string }) => (
      <span className={styles['display-name']}>
        {record.get('primaryFlag') === 1 && (
          <Tooltip placement="top" title="主键">
            <Icon
              key="vpn_key"
              type="vpn_key"
              style={{
                fontSize: '0.16rem',
                verticalAlign: 'text-bottom',
                marginRight: '8px',
                transform: 'rotate(-45deg)',
              }}
            />
          </Tooltip>
        )}
        {record.get('enabledFlag') === 0 && (
          <Tooltip title="已失效">
            <Icon key="report" type="report" className={styles.icon} style={{ color: '#f75e5e' }} />
          </Tooltip>
        )}
        <span>{value}</span>
      </span>
    );

    /**
     * 字段信息/模型关系切换
     * @param {Object} e 原生事件对象
     */
    const handleSizeChange = (e: RadioChangeEvent) => {
      setDataStore('radioVal', e.target.value);
      setDataStore('modalFileBatchEditFlag', false);
      if (e.target.value === 'redundantBtn') {
        redundantTableDataSet.query();
      } else {
        fieldInformationDataSet.query();
      }
    };

    // 扩展表数据
    const redundantTableProps = {
      redCommand,
      // renderDataType,
      renderDisplayName,
      renderBooleanText,
      handleMenuQueryList,
      redundantTableDataSet,
      handleEditField, // 点击触发右侧属性面板
      refreshHeaderInfo,
      headerModalDetailInfoDS,
      primaryKeyField: fieldInformationDataSet?.get(0)?.toData?.(), // 物理模型主键字段
    };

    const valueListRender = ({ record }: { record: Record }) =>
      isPresetField(record.get('fieldName'), ['whoNameList']) ||
      record.get('primaryFlag') === 1 ||
      isPresetField(record.get('fieldName'), ['TENANT_ID'])
        ? '—'
        : record.get('valueListName');

    const ruleNameRender = ({ record }: { record: Record }) =>
      isPresetField(record.get('fieldName'), ['whoNameList']) ||
      record.get('primaryFlag') === 1 ||
      isPresetField(record.get('fieldName'), ['TENANT_ID'])
        ? '—'
        : record.get('ruleName');

    // 得倒可操作的按钮列表
    const getButtonList = () => {
      const bathEdit = (
        <Button
          className="model-detail-button-add-field"
          disabled={modalDetailHeaderEditFlag}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
          hidden={false}
          onClick={handleBatchEditing}
          key={EButtons.editBatch}
        >
          <ImgIcon name="EditTag-Highlight.svg" size={14} style={{ marginRight: '5px' }} />
          <span>批量编辑</span>
        </Button>
      );

      if (modalFileBatchEditFlag) {
        return [
          <Button
            key={EButtons.cancel}
            onClick={() => {
              fieldInformationDataSet.query();
              setDataStore('modalFileBatchEditFlag', false);
            }}
          >
            <ImgIcon name="edit@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
            <span>取消</span>
          </Button>,
          <Button
            key={EButtons.save}
            icon="save"
            onClick={handleSaveAll}
            style={{ color: '#29bece' }}
          >
            保存
          </Button>,
        ];
      }

      if (
        (isTenantRoleLevel() || resourceUponRoleHierarchy === 'tenant') &&
        modelType === 'PLATFORM_SHARED'
      ) {
        return [];
      }

      if (modelType !== 'PREDEFINE') {
        return [
          <Button
            disabled={fieldInformationDataSet.selected.length === 0 || modalDetailHeaderEditFlag}
            onClick={() => fieldInformationDataSet.delete(fieldInformationDataSet.selected)}
            key={EButtons.delete}
          >
            <ImgIcon name="batch-operation@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
            批量删除
          </Button>,
          bathEdit,
          <Button
            className="model-detail-button-add-field"
            disabled={modalDetailHeaderEditFlag}
            funcType={FuncType.flat}
            color={ButtonColor.primary}
            icon="playlist_add"
            hidden={false}
            onClick={openModelModal}
            key={EButtons.new}
          >
            新增模型字段
          </Button>,
        ];
      } else {
        return [];
      }
    };

    // 租户继承字段编辑控制
    const getInheritControl = (record) => {
      const { extendsParentCode } = modelDetail;
      // 模型字段列表，如果字段是主键或者who字段或者subCanEditFlag为空或者subCanEditFlag === 0 则不能编辑
      const tenantDisable =
        resourceUponRoleHierarchy === 'tenant' &&
        !!extendsParentCode &&
        record.get('parentFieldFlag') &&
        !record.get('subCanEditFlag');
      return !tenantDisable;
    };

    return (
      <div className={styles['table-wrapper']}>
        {/* {modelType !== 'PREDEFINE' ? ( */}
        <Radio.Group
          className={styles['radio-group-style']}
          value={radioVal}
          onChange={handleSizeChange}
        >
          <Radio.Button value={ERadioVal.fieldBtn}>模型字段</Radio.Button>
          <Tooltip
            placement="top"
            title="默认快速关联业务表以达到扩展业务字段的目的，使用扩展字段将会使性能有所下降"
          >
            <Radio.Button value={ERadioVal.redundantBtn}>扩展字段</Radio.Button>
          </Tooltip>
        </Radio.Group>
        {/* ) : null} */}

        {radioVal === ERadioVal.fieldBtn && ( // 表字段
          <Table
            rowHeight={30}
            dataSet={fieldInformationDataSet}
            filter={(record) => record.status !== 'add'}
            queryBar={TableQueryBarType.none}
            virtualCell={false}
            className={`${styles.btnFloatRight} ${globalStyles['table-style']}`}
            buttons={getButtonList()}
          >
            <Column
              width={150}
              name="displayName"
              tooltip={TableColumnTooltip.overflow}
              renderer={renderDisplayName as Renderer}
              align={ColumnAlign.left}
              lock={ColumnLock.left}
              editor={(record) => modalFileBatchEditFlag && getInheritControl(record)}
            />
            <Column
              tooltip={TableColumnTooltip.overflow}
              name="fieldName"
              width={140}
              align={ColumnAlign.left}
            />
            <Column
              tooltip={TableColumnTooltip.overflow}
              name="dataType"
              width={180}
              align={ColumnAlign.left}
              editor={(record) => {
                const dataTypeValue = record.get('originDataType');
                const newOptionStrArr =
                  refDataSourceType !== 'Oracle'
                    ? MySQLDataType(dataTypeValue)
                    : OracleDataType(dataTypeValue);

                if (!getInheritControl(record)) {
                  return false;
                }

                if (newOptionStrArr.length === 0) {
                  // 没有可选的值，也不出现编辑框
                  return false;
                }
                if (
                  isPresetField(record.get('fieldName'), ['redNameList']) ||
                  isPresetField(record.get('fieldName'), [
                    'others',
                    ['LAST_UPDATED_BY', 'CREATED_BY', 'OBJECT_VERSION_NUMBER', 'TENANT_ID'] as any,
                  ])
                ) {
                  // 如果是预制的字段不能编辑
                  return false;
                }
                if (record.get('primaryFlag') === 1) {
                  // 如果是主键也不能编辑
                  return false;
                }

                if (modalFileBatchEditFlag) {
                  return (
                    <Select
                      searchable
                      clearButton={false}
                      name="dataType"
                      optionsFilter={(optionRecord) => {
                        return newOptionStrArr.includes(optionRecord.toData().value);
                      }}
                      searchMatcher={searchMatcher}
                    >
                      {modelDataTypeList.map((item) => (
                        <Option value={item}>{item}</Option>
                      ))}
                    </Select>
                  );
                } else {
                  return false;
                }
              }}
            />
            <Column
              tooltip={TableColumnTooltip.overflow}
              name="requiredFlag"
              renderer={renderBooleanText as Renderer}
              width={100}
              align={ColumnAlign.left}
              editor={(record) => {
                if (!getInheritControl(record)) {
                  return false;
                }
                if (
                  isPresetField(record.get('fieldName'), ['whoNameList', 'redNameList']) ||
                  record.get('ruleCode')
                ) {
                  // 如果是预制的字段不能编辑
                  return false;
                }
                if (record.get('primaryFlag') === 1) {
                  return false;
                }

                return modalFileBatchEditFlag;
              }}
            />
            <Column
              tooltip={TableColumnTooltip.overflow}
              name="description"
              align={ColumnAlign.left}
              editor={(record) => modalFileBatchEditFlag && getInheritControl(record)}
            />
            <Column
              tooltip={TableColumnTooltip.overflow}
              name="dataSize"
              width={100}
              align={ColumnAlign.left}
              editor={(record) => {
                if (!getInheritControl(record)) {
                  return false;
                }
                if (
                  isPresetField(record.get('fieldName'), [
                    'whoNameList',
                    'redNameList',
                    'TENANT_ID',
                  ]) ||
                  record.get('ruleCode')
                ) {
                  // 如果是预制的字段不能编辑
                  return false;
                }
                if (record.get('primaryFlag') === 1) {
                  return false;
                }

                return modalFileBatchEditFlag;
              }}
            />
            <Column
              tooltip={TableColumnTooltip.overflow}
              name="defaultValue"
              width={100}
              align={ColumnAlign.left}
            />
            <Column
              tooltip={TableColumnTooltip.overflow}
              name="valueList"
              width={120}
              renderer={valueListRender as Renderer}
              editor={(record) => {
                if (!getInheritControl(record)) {
                  return false;
                }
                if (
                  record.get('primaryFlag') === 1 ||
                  record.get('fieldName') === 'ID' ||
                  record.get('fieldName') === 'REDUNDANT_ID' ||
                  isPresetField(record.get('fieldName'), [
                    'whoNameList',
                    'redNameList',
                    'TENANT_ID',
                  ])
                ) {
                  return false;
                }
                if (ruleCodeObj) {
                  return false;
                }

                if (!modalFileBatchEditFlag) {
                  return false;
                } else {
                  return (
                    <Lov
                      onChange={(val) => {
                        setValueListObj(val);
                        setRuleCodeObj(null);
                      }}
                      name="valueList"
                    />
                  );
                }
              }}
            />
            <Column
              tooltip={TableColumnTooltip.overflow}
              name="encodingRule"
              width={120}
              renderer={ruleNameRender as Renderer}
              editor={(record) => {
                if (!getInheritControl(record)) {
                  return false;
                }
                if (
                  record.get('primaryFlag') === 1 ||
                  record.get('fieldName') === 'ID' ||
                  record.get('fieldName') === 'REDUNDANT_ID' ||
                  isPresetField(record.get('fieldName'), [
                    'whoNameList',
                    'redNameList',
                    'TENANT_ID',
                  ])
                ) {
                  return false;
                }
                if (valueListObj) {
                  return false;
                }

                if (!modalFileBatchEditFlag) {
                  return false;
                } else {
                  return (
                    <Lov
                      onChange={(val) => {
                        setRuleCodeObj(val);
                        setValueListObj(null);
                        if (val) {
                          // 选中值则置当前字段为非必输 否则还原必输
                          record.set('requiredFlag', 0);
                        } else {
                          record.set('requiredFlag', record.get('physicalFieldRequiredFlag'));
                        }
                      }}
                      name="encodingRule"
                    />
                  );
                }
              }}
            />
            <Column
              tooltip={TableColumnTooltip.overflow}
              name="regexpExpression"
              align={ColumnAlign.left}
              editor={(record) => {
                // 租户继承平台的字段通过tenantId判断 不相等则是继承过来的
                if (getCurrentOrganizationId() !== +record.get('tenantId')) {
                  return false;
                }
                if (
                  isPresetField(record.get('fieldName'), ['whoNameList', 'redNameList']) ||
                  record.get('ruleCode')
                ) {
                  // 如果是预制的字段不能编辑
                  return false;
                }
                if (record.get('primaryFlag') === 1) {
                  return false;
                }
                return modalFileBatchEditFlag;
              }}
            />
            <Column
              name="encryptFlag"
              align={ColumnAlign.center}
              width={100}
              editor={(record) => {
                if (!getInheritControl(record)) {
                  return false;
                }
                if (['objectVersionNumber'].includes(record.get('fieldName'))) {
                  return false;
                }
                if (!hasNumberType(record.get('dataType'))) {
                  return false;
                }

                return modalFileBatchEditFlag;
              }}
            />
          </Table>
        )}
        {/* 扩展字段 */}
        {radioVal === ERadioVal.redundantBtn && <RedundantTable {...redundantTableProps} />}
      </div>
    );
  }
);

export default Index;
