/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable import/order */
import React, { useEffect, useContext, useRef, useImperativeHandle, FC } from 'react';
import { Table, Button, Icon } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Tooltip } from 'choerodon-ui'; // notification
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { ColumnLock, TableColumnTooltip } from 'choerodon-ui/pro/lib/table/enum';
import { Renderer } from 'choerodon-ui/pro/lib/field/FormField';
import { get } from 'lodash';

import { createLogicModelsService } from '@/services/modelListService';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import Modal from '@/components/LowcodeModal';
import _store, { IModelManagerStore } from '@/routes/Modeler/ModelDesigner/stores';

import ModelRelationShipForm from './ModelRelationShipForm';
import styles from '../index.less';

import uuidv4hyphenless from '@/utils/uuidv4hyphenless';
import isFailureResponse from '@/utils/isFailureResponse';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { IHandleMenuQueryList } from '../../../ListView';

const { Column } = Table;
let modelRelation;
const modelRelationKey = Modal.key();
enum EButtons {
  delete = 'delete',
  new = 'new',
  editBatch = 'editBatch',
  save = 'save',
  cancel = 'cancel',
}
interface IIndex extends IHandleMenuQueryList {
  // handleMenuQueryList: any;
  listModelRelationShipDataSet: any;
  headerModalDetailInfoDS: any;
  handleEditRelationShip: any;
}
const Index: FC<IIndex> = observer(
  ({
    /* handleMenuQueryList, */
    listModelRelationShipDataSet,
    headerModalDetailInfoDS,
    handleEditRelationShip = () => {},
  }) => {
    const modelManagerStore = useContext<IModelManagerStore>(_store as any).store;

    const {
      // pageCenterContentHeight,
      ref: { modelRelationShipFormRef },
      setRightEditData,
      setDataStore,
      storeData: { modelDetail, selectedTenantId, modalDetailHeaderEditFlag, relationshipEditId },
    }: IModelManagerStore = modelManagerStore; // useContext<IModelManagerStore>(_store as any).store;

    const modelRelationQuery = () => {
      return listModelRelationShipDataSet.query();
    };
    useImperativeHandle(modelRelationShipFormRef, () => ({
      modelRelationQuery,
    }));
    useEffect(() => {
      listModelRelationShipDataSet.query();
    }, [modelDetail.id]);

    // 新建逻辑模型关系
    const modelRelationRef: any = useRef();

    const createModelRelationShip = async () => {
      modelRelation = Modal.open({
        lowcodeSize: 'big',
        title: <div style={{ fontSize: '.18rem', fontWeight: 'bold' }}>新建逻辑模型关系</div>,
        closable: true,
        key: modelRelationKey,
        children: (
          <ModelRelationShipForm
            {...{
              modelDetail,
              wrappedComponentRef: modelRelationRef,
              selectedTenantId: selectedTenantId as any,
              modelType: modelManagerStore.storeData.modelType,
              resourceUponRoleHierarchy: modelManagerStore.storeData.resourceUponRoleHierarchy,
            }}
          />
        ),
        onOk: async () => {
          const val = modelRelationRef.current.handleValidate();
          if (!val) return false;
          const res = await createLogicModelsService({
            query: { id: modelDetail.id },
            body: {
              ...modelRelationRef.current.getformData(),
              code: uuidv4hyphenless(),
            },
          });
          if (!isFailureResponse(res)) {
            listModelRelationShipDataSet.query();
            modelRelation.close();
          } else if (res && res.code && res.code === 'hmde.error.model_relation_field.code_equal') {
            notification.error({
              message: '错误',
              description: '关联模型与主模型重复，请重新选择！',
            });
            return false;
          } else {
            notification.error({
              message: '警告',
              description: res.message,
            });
            return false;
          }
        },
        footer: (okBtn) => <div className={globalStyles['model-footer']}>{okBtn}</div>,
      });
    };

    // 保存关联关系
    const handleSaveRelationship = async () => {
      const value = headerModalDetailInfoDS.toData();
      if (Array.isArray(value) && value.length) {
        listModelRelationShipDataSet.setQueryParameter('masterLogicModelCode', value[0].code);
        listModelRelationShipDataSet.setQueryParameter('masterLogicModelName', value[0].name);
      }

      const res = await listModelRelationShipDataSet.submit();

      if (res && !res.failed) {
        setDataStore('modalFileBatchEditFlag', false);
        handleEditRelationShip({});
        listModelRelationShipDataSet.query();
      }
    };

    const handleDelete = async (record: Record) => {
      const res = await listModelRelationShipDataSet.delete(
        record,
        '删除该逻辑模型关系，运行态模型关系数据也将会被删除，可能会影响相关模型关系及已有页面的使用功能，你确定要删除吗？'
      );
      if (res && res.success) {
        setRightEditData('model');
      }
    };

    const command = ({ record }: { record: Record }) => {
      const relationCommand = [
        <a
          key="edit"
          disabled={modalDetailHeaderEditFlag}
          onClick={() => handleEditRelationShip(record)}
        >
          编辑
        </a>,
      ];
      const flag =
        (isTenantRoleLevel() ||
          modelManagerStore.storeData.resourceUponRoleHierarchy === 'tenant') &&
        modelManagerStore.storeData.modelType === 'PLATFORM_SHARED';
      if (!flag) {
        relationCommand.push(
          <a
            key="del"
            disabled={modalDetailHeaderEditFlag}
            hidden={false}
            onClick={() => handleDelete(record)}
          >
            删除
          </a>
        );
      }
      const previewRelationCommand = [
        <a
          key="preview"
          disabled={modalDetailHeaderEditFlag}
          onClick={() => handleEditRelationShip(record)}
        >
          编辑
        </a>,
      ];
      const editCommand = [
        <a
          key="cancel"
          onClick={() => {
            listModelRelationShipDataSet.reset();
            handleEditRelationShip({});
            setDataStore('modalFileBatchEditFlag', false);
          }}
        >
          取消
        </a>,
        <a key="save" onClick={handleSaveRelationship}>
          保存
        </a>,
      ];

      const { id } = record as any;
      if (id === relationshipEditId) {
        return editCommand;
      } else if (record.get('tenantId') !== modelDetail.tenantId) {
        return previewRelationCommand;
      } else {
        return relationCommand;
      }
    };

    // 设置数据类型
    const renderRelationType = ({ value }) =>
      // ONE_TO_ONE
      // ONE_TO_MANY
      value === 'ONE_TO_ONE' ? '一对一' : '一对多';

    // 返回表格顶部需要的操作按钮列表
    const getTableButtons = () => {
      const { resourceUponRoleHierarchy, modelType } = modelManagerStore.storeData || {};
      if (
        !(
          (isTenantRoleLevel() || resourceUponRoleHierarchy === 'tenant') &&
          modelType === 'PLATFORM_SHARED'
        )
      ) {
        return [
          <Button
            key={EButtons.new}
            onClick={createModelRelationShip}
            style={{ float: 'right' }}
            disabled={modalDetailHeaderEditFlag || !!relationshipEditId}
            className="model-detail-button-add-field"
            funcType={FuncType.flat}
            color={ButtonColor.primary}
            icon="playlist_add"
            hidden={false}
          >
            新增模型关系
          </Button>,
        ];
      }

      return [];
    };

    // 表格展开行渲染器
    const tableExpandedRowRenderer = ({ record }) => {
      const relationFields = get(record.toData(), ['relationFields'], []);
      if (Array.isArray(relationFields) && relationFields.length) {
        return (
          <div className={styles['relationship-expend-wrap']}>
            {relationFields.map((o) => {
              const { id, masterModelFieldName, relationModelFieldName } = o;
              return (
                <div key={id} className={styles['relationship-expend-row']}>
                  <span>{masterModelFieldName}</span>
                  <Icon type="relate" />
                  <span>{relationModelFieldName}</span>
                </div>
              );
            })}
          </div>
        );
      }

      return null;
    };

    return (
      <div className={styles['table-wrapper']}>
        <Table
          // autoHeight
          dataSet={listModelRelationShipDataSet}
          rowHeight={30}
          className={`${styles.btnFloatRight} ${globalStyles['table-style']}`}
          buttons={getTableButtons()}
          expandedRowRenderer={tableExpandedRowRenderer}
        >
          <Column
            // name="relationLogicModelName"
            renderer={renderNullRelationModelHint as Renderer}
            lock={'left' as any}
            width={0}
            resizable={false}
            style={{ overflow: 'visible' }}
            className={styles['relation-model-nullish-hint-cell-outer']}
          />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="name"
            width={150}
            editor={(record: any) => record.id === relationshipEditId}
          />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="relationType"
            width={100}
            renderer={renderRelationType as Renderer}
          />
          <Column tooltip={TableColumnTooltip.overflow} name="relationLogicModelName" width={180} />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="description"
            editor={(record: any) => record.id === relationshipEditId}
          />
          {((isTenantRoleLevel() ||
            modelManagerStore.storeData.resourceUponRoleHierarchy === 'tenant') &&
            modelManagerStore.storeData.modelType === 'PLATFORM_SHARED') || (
            <Column header="操作" command={command} width={100} lock={ColumnLock.right} />
          )}
        </Table>
      </div>
    );
  }
);

function renderNullRelationModelHint(args: any) {
  const { record } = args;
  const relationLogicModelName = record.get('relationLogicModelName');

  return (
    <div className={styles['relation-model-nullish-hint-cell']}>
      {!relationLogicModelName && (
        <Tooltip placement="top" title="关联模型已失效或未授权">
          <div className="nullish-hint">{/*  */}</div>
        </Tooltip>
      )}
    </div>
  );
}

export default Index;
