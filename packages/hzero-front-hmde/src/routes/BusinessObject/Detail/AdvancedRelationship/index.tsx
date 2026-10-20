import React, { useImperativeHandle } from 'react';
import { Icon } from 'choerodon-ui';
import { isNil } from 'lodash';
import { DataSet, Modal, Button, Tooltip } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';
import { Observer } from 'mobx-react-lite';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { getResponse } from 'hzero-front/lib/utils/utils';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { enableTagRender } from 'hzero-front/lib/utils/renderer';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import notification from 'hzero-front/lib/utils/notification';

import {
  createAdvanceService,
  editAdvanceService,
  deleteAdvanceService,
  queryAdvanceDetail,
} from '@/services/businessObjectService';
import CreateAdvance from './CreateAdvance';
import rightContentDS from './RightContentDS';

const textType = [
  'TEXT_FIELD',
  'SINGLE_SELECT',
  'MULTIPLE_SELECT',
  'RADIO',
  'CHECKBOX',
  'EMAIL',
  'PHONE_NUMBER',
  'CODE_RULE',
];
const numberType = ['NUMBER_FIELD', 'SWITCH', 'LINK_RELATION', 'MASTER_RELATION'];

interface IIndex {
  businessObjectCode?: string;
  businessObjectId?: string;
  businessObjectName?: string;
  advanceRelationRef?: any;
  listDs: DataSet;
  isTenant: boolean;
  allowEdit: boolean;
}
const Index = ({
  businessObjectCode,
  businessObjectId,
  businessObjectName,
  advanceRelationRef,
  listDs,
  isTenant,
  allowEdit,
}: IIndex) => {

  useImperativeHandle(advanceRelationRef, () => ({
    handleCreateAdvance: () => handleEditAdvance(),
  }));

  const handleEditAdvance = (id?) => {
    const isCreate = isNil(id);
    const createContentDs = new DataSet(rightContentDS(isCreate ? 'create' : 'edit', businessObjectId));
    const getWarning = record => {
      if (!record?.get('relationField') || !record?.get('associatedField')) {
        return;
      }
      let title = '';
      if (record?.get('relationField')?.maxLength < record?.get('associatedField')?.maxLength) {
        title = intl.get('hmde.bo.advanceRelationship.warning.lessLength').d('被关联字段长度小于关联字段长度，数据保存可能会出现错误');
      } else if (
        record?.get('relationField')?.requiredFlag &&
        !record?.get('associatedField')?.requiredFlag
      ) {
        title = intl.get('hmde.bo.advanceRelationship.warning.required').d('被关联字段非必输，关联字段必输，数据保存可能会出现错误');;
      } else if (
        (textType.includes(record?.get('relationField')?.componentType) &&
          numberType.includes(record?.get('associatedField')?.componentType)) ||
        (numberType.includes(record?.get('relationField')?.componentType) &&
          textType.includes(record?.get('associatedField')?.componentType))
      ) {
        title = intl.get('hmde.bo.advanceRelationship.warning.sameModal').d('关联字段与被关联字段的物理模型类型不一致，数据保存可能会出现错误');
      }
      if (title) {
        return (
          <Tooltip title={title} placement="left">
            <Icon type="priority_high" style={{ color: 'red', cursor: 'pointer' }} />
          </Tooltip>
        );
      }
    };
    const createAdvanceProps = {
      businessObjectId,
      businessObjectName,
      businessObjectCode,
      createContentDs,
      getWarning,
      id,
    };
    Modal.open({
      title:
        isCreate ?
         intl.get('hmde.bo.view.message.newAdvancedRelationship').d('新建高级关系')
         : intl.get('hmde.bo.view.message.editAdvancedRelationship').d('编辑高级关系'),
      destroyed: true,
      drawer: true,
      style: {
        width: 743,
      },
      closable: true,
      children: <CreateAdvance {...createAdvanceProps} />,
      onOk: () => handleAddAndEdit(isCreate ? 'add' : 'edit', createContentDs),
    });
  };

  // 创建更新
  const handleAddAndEdit = async (type, dataSet) => {
    const addFlag = type === 'add';
    const ds = dataSet;
    const service = addFlag ? createAdvanceService : editAdvanceService;
    const flag = await ds.current?.validate();
    if (flag) {
      const data = await ds.current?.toData();
      const businessObjectAssociateFieldList = data.businessObjectAssociateFieldList || [];
      if (data?.masterBusinessObjectFieldCode) {
        businessObjectAssociateFieldList.push({
          masterBusinessObjectFieldCode: data?.masterBusinessObjectFieldCode,
          associateFieldType: 'CONSTANT',
          associateValue: data?.associateValue,
        });
      }
      data.businessObjectAssociateFieldList = businessObjectAssociateFieldList;
      return service(data).then(res => {
        if (getResponse(res)) {
          notification.success({});
            listDs.query();
        } else {
          return false;
        }
      });
    } else {
      return false;
    }
  };

  const handleEnable = async(id) => {
    const res = await queryAdvanceDetail(id);
    if (getResponse(res) && res) {
      const prevConditions = res.businessObjectAssociateFieldList?.find(
        item => item?.associateFieldType === 'CONSTANT'
      );
      let _businessObjectAssociateFieldList = res.businessObjectAssociateFieldList?.filter(
        item => item?.associateFieldType !== 'CONSTANT'
      );
      _businessObjectAssociateFieldList = _businessObjectAssociateFieldList?.map(item => {
        Object.assign(item, {
          relationField: {
            businessObjectFieldName: item?.masterBusinessObjectFieldName,
            businessObjectFieldCode: item?.masterBusinessObjectFieldCode,
          },
          associatedField: {
            businessObjectFieldName: item?.associateBusinessObjectFieldName,
            businessObjectFieldCode: item?.associateBusinessObjectFieldCode,
          },
        });
        return item;
      });
      // businessObjectAssociateFieldList属性覆盖 referenceList回显
      Object.assign(res, {
        referenceList: res?.businessObjectOptionCode
          ? {
            businessObjectOptionCode: res?.businessObjectOptionCode,
            businessObjectOptionName: res?.businessObjectOptionName,
          }
          : null,
        businessObjectAssociateFieldList: _businessObjectAssociateFieldList,
      });
      if (prevConditions?.masterBusinessObjectFieldCode) {
        Object.assign(res, {
          prevConditionFields: {
            businessObjectFieldCode: prevConditions?.masterBusinessObjectFieldCode,
            businessObjectFieldName: prevConditions?.masterBusinessObjectFieldName,
            componentType: prevConditions?.masterComponentType,
          },
          associateValue:
            prevConditions?.masterComponentType === 'SWITCH'
              ? Boolean(prevConditions?.associateValue)
              : prevConditions?.associateValue,
        });
      }
      const businessObjectAssociateFieldList = res.businessObjectAssociateFieldList || [];
      if (res?.masterBusinessObjectFieldCode) {
        businessObjectAssociateFieldList.push({
          masterBusinessObjectFieldCode: res?.masterBusinessObjectFieldCode,
          associateFieldType: 'CONSTANT',
          associateValue: res?.associateValue,
        });
      }
      res.businessObjectAssociateFieldList = businessObjectAssociateFieldList;
      res.enabledFlag = !res.enabledFlag;
      const response = await editAdvanceService(res);
      if (getResponse(response)) {
        notification.success({});
        listDs.query();
      }
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      onOk: () => {
        deleteAdvanceService(id).then(res => {
          if (getResponse(res)) {
            notification.success({});
          }
          listDs.query();
        });
      },
    });
  };

  const columns = [
    {
      name: 'enabledFlag',
      header: intl.get('hzero.common.model.status.enabledFlag').d('状态'),
      renderer: ({ value }) => enableTagRender(value ? 1 : 0),
    },
    {
      name: 'associateCode',
      header: intl.get('hmde.bo.field.associateCode').d('关系编码'),
      renderer: ({ record, value }) => (
        <a onClick={() => handleEditAdvance(record.get('businessObjectAssociateId'))}>
          {value}
        </a>
      ),
    },
    {
      name: 'associateName',
      header: intl.get('hmde.bo.field.associateName').d('关系名称'),
    },
    {
      name: 'masterBusinessObjectName',
      header: intl.get('hmde.bo.field.masterBusinessObjectName').d('当前对象'),
    },
    {
      name: 'associateBusinessObjectName',
      header: intl.get('hmde.bo.field.associateBusinessObject').d('目标对象'),
    },
    {
      name: 'associateType',
      header: intl.get('hmde.bo.field.associateType').d('关系'),
      renderer: ({ value }) => {
        switch(value) {
          case 'SLAVE_MASTER':
            return intl.get('hmde.bo.view.messages.masterRelation').d('从主');
          case 'LINK':
            return intl.get('hmde.bo.view.messages.link').d('关联');
          default:
            return '-';
        }
      },
    },
    {
      header: intl.get('hzero.common.table.column.option').d('操作'),
      align: 'left',
      width: 180,
      renderer: ({ record }) => {
        return [
          <Button funcType={FuncType.link} onClick={() => handleEnable(record.get('businessObjectAssociateId'))}>
            {record.get('enabledFlag') ?
              intl.get('hzero.common.button.disable').d('禁用')
              : intl.get('hzero.common.button.enable').d('启用')}
          </Button>,
          allowEdit && (
            <Button funcType={FuncType.link} onClick={() => handleDelete(record.get('businessObjectAssociateId'))} style={{ marginLeft: '16px' }}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          ),
        ].filter(Boolean);
      },
    },
  ] as any;

  return (
    <Observer>
      {() => (
        <FilterBarTable
          columns={columns}
          dataSet={listDs}
          customizable
          customizedCode='HMDE.BUSINESS_OBJECT.ADVANCE_RELATIONSHIP.LIST'
          filterBarConfig={{
            collpase: true,
            collpaseble: true,
          }}
          buttons={!isTenant && allowEdit ? [
            <Button onClick={() => handleEditAdvance()} icon="add">
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>,
          ] : undefined}
        />
      )}
    </Observer>
  );
};
export default formatterCollections({ code: 'srm.rulesDefinition' })(Index);
