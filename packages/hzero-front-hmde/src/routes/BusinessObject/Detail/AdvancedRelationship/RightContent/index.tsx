import React, { useMemo, useEffect, useImperativeHandle } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import {
  DataSet,
  Form,
  Switch,
  IntlField,
  Output,
  Icon,
  Lov,
  Select,
  Table,
  Modal,
  Button,
  TextField,
  SelectBox,
  DatePicker,
  Tooltip,
  Spin,
  DateTimePicker,
} from 'choerodon-ui/pro';
import { message } from 'choerodon-ui';
import { TableColumnTooltip } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { Observer } from 'mobx-react-lite';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';

import SectionTitle from '@/businessComponents/SectionTitle';
import LabelTitleRender from '@/businessComponents/LabelTitleRender';
import {
  createAdvanceService,
  editAdvanceService,
  deleteAdvanceService,
} from '@/services/businessObjectService';

import rightContentDS from './RightContentDS';
import CreateAdvance from './CreateAdvance';
import EmptyPage from '../EmptyPage';
import styles from '../index.less';

const { Option } = Select;
const { Column } = Table;
const [
  SLAVE_MASTER, // 从主
  LINK, // 关联
] = ['SLAVE_MASTER', 'LINK'];
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
const [CONSTANT] = ['CONSTANT'];
const numberType = ['NUMBER_FIELD', 'SWITCH', 'LINK_RELATION', 'MASTER_RELATION'];
const Index = ({
  leftMenuRef,
  isTenantRole,
  businessObjectId,
  businessObjectName,
  businessObjectCode,
  businessObjectAssociateId,
  setBusinessObjectAssociateId,
  rightContentRef,
}) => {
  const rightContentDs = useMemo(() => new DataSet(rightContentDS('edit', businessObjectId)), [
    businessObjectId,
  ]);
  const createContentDs = useMemo(() => new DataSet(rightContentDS('create', businessObjectId)), [
    businessObjectId,
  ]);
  const tableDs = rightContentDs.children.businessObjectAssociateFieldList;

  // 查询详情
  const queryDetail = async () => {
    if (businessObjectAssociateId) {
      rightContentDs.setState('businessObjectAssociateId', businessObjectAssociateId);
      const res = await rightContentDs.query();
      if (getResponse(res)) {
        const prevConditions = res?.businessObjectAssociateFieldList?.find(
          item => item?.associateFieldType === CONSTANT
        );
        let _businessObjectAssociateFieldList = res?.businessObjectAssociateFieldList?.filter(
          item => item?.associateFieldType !== CONSTANT
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
        rightContentDs.loadData([res]);
      }
    } else {
      rightContentDs.loadData([]);
    }
  };

  useEffect(() => {
    queryDetail();
  }, [businessObjectAssociateId]);

  const getComponent = obj => {
    switch (obj?.componentType) {
      case 'SWITCH':
        return <Switch name="associateValue" />;
      case 'DATE_SELECTION_BOX':
        return <DatePicker name="associateValue" placeholder="选择日期" />;
      case 'DATETIME_SELECTION_BOX':
        return (
          <DateTimePicker
            name="associateValue"
            mode={'dateTime' as any}
            placeholder="选择日期时间"
          />
        );
      default:
        return <TextField name="associateValue" />;
    }
  };

  // 创建更新
  const handleAddAndEdit = async type => {
    const addFlag = type === 'add';
    const ds = addFlag ? createContentDs : rightContentDs;
    const service = addFlag ? createAdvanceService : editAdvanceService;
    const flag = await ds.current?.validate();
    if (flag) {
      const data = await ds.current?.toData();
      const businessObjectAssociateFieldList = data.businessObjectAssociateFieldList || [];
      if (data?.masterBusinessObjectFieldCode) {
        businessObjectAssociateFieldList.push({
          masterBusinessObjectFieldCode: data?.masterBusinessObjectFieldCode,
          associateFieldType: CONSTANT,
          associateValue: data?.associateValue,
        });
      }
      data.businessObjectAssociateFieldList = businessObjectAssociateFieldList;
      return service(data).then(res => {
        if (getResponse(res)) {
          notification.success({
            message: intl.get('hzero.common.notification.success').d('操作成功'),
          } as any);
          // 查询菜单
          if (!addFlag) {
            queryDetail();
          }
          leftMenuRef.current.handleListSearch().then(async menuRes => {
            const { businessObjectAssociateId: id = '' } = menuRes?.content?.[0] || {};
            leftMenuRef.current.resetCurrentId(id);
            setBusinessObjectAssociateId(id);
          });
        } else {
          return false;
        }
      });
    } else {
      return false;
    }
  };

  const getWarning = record => {
    if (!record?.get('relationField') || !record?.get('associatedField')) {
      return;
    }
    let title = '';
    if (record?.get('relationField')?.maxLength < record?.get('associatedField')?.maxLength) {
      title = '被关联字段长度小于关联字段长度，数据保存可能会出现错误';
    } else if (
      record?.get('relationField')?.requiredFlag &&
      !record?.get('associatedField')?.requiredFlag
    ) {
      title = '被关联字段非必输，关联字段必输，数据保存可能会出现错误';
    } else if (
      (textType.includes(record?.get('relationField')?.componentType) &&
        numberType.includes(record?.get('associatedField')?.componentType)) ||
      (numberType.includes(record?.get('relationField')?.componentType) &&
        textType.includes(record?.get('associatedField')?.componentType))
    ) {
      title = '关联字段与被关联字段的物理模型类型不一致，数据保存可能会出现错误';
    }
    if (title) {
      return (
        <Tooltip title={title} placement="left">
          <Icon type="priority_high" style={{ color: 'red', cursor: 'pointer' }} />
        </Tooltip>
      );
    }
  };

  const deleteAdvance = () => {
    Modal.confirm({
      children: (
        <span>
          {intl.get('hzero.common.button.releaseConfirm').d('是否确认删除选中高级关系？')}
        </span>
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      onOk: async () => {
        deleteAdvanceService(businessObjectAssociateId).then(async res => {
          if (res && res.failed) {
            notification.error({ message: '错误', description: res.message });
            return false;
          }
          message.success('删除成功！', undefined, undefined, 'top');
          leftMenuRef.current.handleListSearch().then(async menuRes => {
            const { businessObjectAssociateId: id = '' } = menuRes?.content?.[0] || {};
            leftMenuRef.current.resetCurrentId(id);
            setBusinessObjectAssociateId(id);
          });
        });
      },
    });
  };

  const createAdvanceProps = {
    businessObjectId,
    businessObjectName,
    businessObjectCode,
    createContentDs,
    getComponent,
    getWarning,
  };

  const handleCreateAdvance = () => {
    Modal.open({
      title: intl.get('hmde.bo.view.message.newAdvancedRelationship').d('新建高级关系'),
      destroyed: true,
      style: {
        width: 1000,
      },
      closable: true,
      children: <CreateAdvance {...createAdvanceProps} />,
      onOk: handleAddAndEdit.bind(null, 'add'),
      afterClose: () => { },
    });
  };

  useImperativeHandle(rightContentRef, () => ({
    handleCreateAdvance,
  }));

  return (
    <Observer>
      {() =>
        rightContentDs.current?.get('associateCode') ? (
          <Spin dataSet={rightContentDs}>
            <div>
              <SectionTitle
                title={intl.get('hmde.bo.view.message.advancedRelationship').d('高级关系')}
              >
                <div className={styles['section-content']}>
                  <Form dataSet={rightContentDs} labelWidth={[50]} disabled={isTenantRole}>
                    <Switch name="enabledFlag" />
                  </Form>
                  <Button disabled={isTenantRole} onClick={deleteAdvance} color={ButtonColor.red}>
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </Button>
                  <Button
                    color={ButtonColor.primary}
                    type={ButtonType.submit}
                    onClick={handleAddAndEdit}
                    disabled={!rightContentDs.dirty || isTenantRole}
                  >
                    {intl.get('hzero.common.button.save').d('保存')}
                  </Button>
                </div>
              </SectionTitle>
              <Form dataSet={rightContentDs} columns={2} disabled={isTenantRole}>
                <IntlField name="associateName" suffix={<Icon type="language" />} />
                <Output name="associateCode" />
                <Output name="masterBusinessObjectName" />
                <Output name="associateBusinessObjectName" />
                <SelectBox name="associateType" disabled>
                  <Option value={LINK}>{intl.get('hmde.bo.view.messages.link').d('关联')}</Option>
                  <Option value={SLAVE_MASTER}>
                    {intl.get('hmde.bo.view.messages.salve_master').d('从主')}
                  </Option>
                </SelectBox>
              </Form>
              <div>
                <Table dataSet={tableDs}>
                  <Column name="relationField" tooltip={TableColumnTooltip.overflow} />
                  <Column name="associatedField" tooltip={TableColumnTooltip.overflow} />
                  <Column
                    align={'center' as any}
                    width={50}
                    renderer={({ record, dataSet }) => {
                      if (dataSet?.length === 1) {
                        return;
                      }
                      return (
                        <div>
                          {/* <a
                            onClick={() => {
                              if (dataSet && record) {
                                const key =
                                  record?.get('_status') === 'create'
                                    ? '_masterBusinessObjectFieldCode'
                                    : 'masterBusinessObjectFieldCode';
                                const newData = dataSet
                                  .toData()
                                  .filter((item: any) => record?.get(key) !== item?.[key]);
                                dataSet.loadData(newData);
                              }
                            }}
                          >
                            <Icon type="delete" />
                          </a> */}
                          {getWarning(record)}
                        </div>
                      );
                    }}
                  />
                </Table>
              </div>
              <Form dataSet={rightContentDs} columns={2} labelWidth={120} disabled={isTenantRole}>
                <Lov
                  disabled={tableDs.length > 1}
                  label={
                    <LabelTitleRender
                      value={intl.get('hmde.bo.field.referenceList').d('引用值列表')}
                      help={intl
                        .get('hmde.bo.field.referenceList.help')
                        .d('仅单字段关联关系时可选择值列表，选择值列表后不可继续添加关联字段')}
                    />
                  }
                  name="referenceList"
                  noCache
                />
                <Output
                  label={
                    <LabelTitleRender
                      value={intl.get('hmde.bo.field.prevConditions').d('前置条件')}
                      help={intl
                        .get('hmde.bo.field.prevConditionFields.help')
                        .d(
                          '条件字段可选择该业务对象除关系类字段、公式、引用、附件类字段外的所有字段'
                        )}
                    />
                  }
                  name="prevConditions"
                // renderer={prevConditionsRender}
                />
              </Form>
              {rightContentDs.current?.get('prevConditionFields') && (
                <Form disabled dataSet={rightContentDs} columns={4} labelLayout={LabelLayout.float}>
                  <Select name="prevConditionFields" clearButton={false} noCache />
                  <TextField
                    name="associateFieldType"
                    renderer={() => intl.get('hmde.bo.view.message.equal').d('等于')}
                    disabled
                  />
                  {getComponent(rightContentDs.current?.get('prevConditionFields'))}
                </Form>
              )}
              {rightContentDs.current?.get('associateType') === SLAVE_MASTER && (
                <Form dataSet={rightContentDs} columns={3}>
                  <Select name="linkRelationType" disabled />
                </Form>
              )}
            </div>
          </Spin>
        ) : (
            <EmptyPage
              message={
                <div>
                  {intl.get('hmde.common.view.tooltip.createRelationship.prefix').d('暂无高级关系对象请点击')}
                  <a href="###" style={{ margin: '0 4px' }} onClick={handleCreateAdvance}>
                    {intl.get('hzero.common.button.create').d('新建')}
                  </a>
                  {intl.get('hmde.common.view.tooltip.createRelationship.suffix').d('创建关系对象')}
                </div>
              }
            />
          )
      }
    </Observer>
  );
};
export default formatterCollections({ code: ['hmde', 'hmde.common'] })(Index);
