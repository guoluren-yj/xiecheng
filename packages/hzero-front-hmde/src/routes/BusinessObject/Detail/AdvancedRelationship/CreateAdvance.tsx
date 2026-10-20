import React, { useEffect } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import {
  Form,
  IntlField,
  Icon,
  Lov,
  Select,
  Table,
  Button,
  TextField,
  SelectBox,
  DatePicker,
  DateTimePicker,
  Tooltip,
  CheckBox,
} from 'choerodon-ui/pro';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { isNil } from 'lodash';
import { TableColumnTooltip } from 'choerodon-ui/pro/lib/table/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Observer } from 'mobx-react-lite';

import LabelTitleRender from '@/businessComponents/LabelTitleRender';
import styles from './index.less';

const { Option } = Select;
const { Column } = Table;
const [
  SLAVE_MASTER, // 从主
  LINK, // 关联
] = ['SLAVE_MASTER', 'LINK'];
export default function Index({
  businessObjectId,
  businessObjectName,
  businessObjectCode,
  createContentDs,
  // getComponent,
  getWarning,
  id,
}) {
  const tableDs = createContentDs.children.businessObjectAssociateFieldList;

  const handleCreateTable = () => {
    if (
      !createContentDs.current?.get('referenceList') ||
      (createContentDs.current?.get('referenceList') && tableDs.length < 1)
    ) {
      tableDs.create({ relationField: '', associatedField: '' });
    }
  };

  const handleAddCondition = () => {
    // eslint-disable-next-line no-unused-expressions
    createContentDs.current?.set('prevConditionFields', {});
  };

  // 查询详情
  const queryDetail = async () => {
    createContentDs.setState('businessObjectAssociateId', id);
    const res = await createContentDs.query();
    if (getResponse(res)) {
      const prevConditions = res?.businessObjectAssociateFieldList?.find(
        item => item?.associateFieldType === 'CONSTANT'
      );
      let _businessObjectAssociateFieldList = res?.businessObjectAssociateFieldList?.filter(
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
      createContentDs.loadData([res]);
    }
  };

  const init = () => {
    if (isNil(id)) {
      // eslint-disable-next-line no-unused-expressions
      createContentDs.current?.set('masterBusinessObjectId', businessObjectId);
      // eslint-disable-next-line no-unused-expressions
      createContentDs.current?.set('masterBusinessObjectName', businessObjectName);
      // eslint-disable-next-line no-unused-expressions
      createContentDs.current?.set('masterBusinessObjectCode', businessObjectCode);
      handleCreateTable();
    } else {
      queryDetail();
    }
  };
  useEffect(() => {
    init();
    return () => {
      createContentDs.reset();
    };
  }, []);

  const getComponent = (obj) => {
    switch (obj?.componentType) {
      case 'SWITCH':
        return <CheckBox colSpan={6} name="associateValue" label={intl.get('srm.rulesDefinition.model.rulesDefinition.rightValue').d('')} />;
      // return (
      //   <Select name="associateValue">
      //     <Option value="open" key="open">
      //       {intl.get('hzero.common.model.switchOn').d('开启')}
      //     </Option>
      //     <Option value="close" key="close">
      //       {intl.get('hzero.common.button.close').d('关闭')}
      //     </Option>
      //   </Select>
      // );
      case 'DATE_SELECTION_BOX':
        return <DatePicker colSpan={6} name="associateValue" label={intl.get('srm.rulesDefinition.model.rulesDefinition.rightValue').d('')} />;
      case 'DATETIME_SELECTION_BOX':
        return (
          <DateTimePicker
            name="associateValue"
            colSpan={6}
            mode={'dateTime' as any}
            label={intl.get('srm.rulesDefinition.model.rulesDefinition.rightValue').d('')}
          />
        );
      default:
        return <TextField colSpan={6} name="associateValue" label={intl.get('srm.rulesDefinition.model.rulesDefinition.rightValue').d('')} />;
    }
  };

  const thisButtons = [
    <Observer>
      {() => (
        <Button
          funcType={FuncType.flat}
          disabled={createContentDs.current?.get('referenceList') && tableDs.length > 0}
          onClick={handleCreateTable}
          icon="playlist_add"
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      )}
    </Observer>,
  ];

  return (
    <Observer>
      {() => (
        <div>
          <div className={styles.title}>{intl.get('hmde.common.view.message.baseInfo').d('基础信息')}</div>
          <Form dataSet={createContentDs} columns={2} labelLayout={LabelLayout.float}>
            <IntlField name="associateName" suffix={<Icon type="language" />} />
            <TextField name="associateCode" />
            <TextField name="masterBusinessObjectName" disabled />
            <Lov name="associateBusinessObject" noCache />
            <SelectBox name="associateType">
              <Option value={LINK}>{intl.get('hmde.bo.view.messages.link').d('关联')}</Option>
              <Option value={SLAVE_MASTER}>
                {intl.get('hmde.bo.view.messages.salveMaster').d('从主')}
              </Option>
            </SelectBox>
            <Lov
              label={
                <LabelTitleRender
                  value={intl.get('hmde.bo.field.referenceList').d('引用值列表')}
                  help={intl
                    .get('hmde.bo.field.referenceList.help')
                    .d('仅单字段关联关系时可选择值列表，选择值列表后不可继续添加关联字段')}
                />
              }
              disabled={tableDs.length > 1}
              name="referenceList"
              noCache
            />
          </Form>
          <div className={styles.title} style={{ marginTop: '32px' }}>{intl.get('hmde.bo.field.relationField').d('关联字段')}</div>
          <div>
            <Table dataSet={tableDs} buttons={thisButtons}>
              <Column
                name="relationField"
                tooltip={TableColumnTooltip.overflow}
                editor={() => (
                  <Select
                    name="relationField"
                    searchable
                    noCache
                    searchMatcher={({ record, text, textField, valueField }) => {
                      if (typeof text === 'string') {
                        return (
                          record
                            .get(textField)
                            .toLocaleLowerCase()
                            .indexOf(text?.toLocaleLowerCase()) !== -1 ||
                          record
                            .get(valueField)
                            .toLocaleLowerCase()
                            .indexOf(text?.toLocaleLowerCase()) !== -1
                        );
                      }
                      return false;
                    }}
                  />
                )}
              />
              <Column
                name="associatedField"
                tooltip={TableColumnTooltip.overflow}
                editor={() => (
                  <Select
                    name="associatedField"
                    searchable
                    noCache
                    searchMatcher={({ record, text, textField, valueField }) => {
                      if (typeof text === 'string') {
                        return (
                          record
                            .get(textField)
                            .toLocaleLowerCase()
                            .indexOf(text?.toLocaleLowerCase()) !== -1 ||
                          record
                            .get(valueField)
                            .toLocaleLowerCase()
                            .indexOf(text?.toLocaleLowerCase()) !== -1
                        );
                      }
                      return false;
                    }}
                  />
                )}
              />
              <Column
                align={'center' as any}
                width={80}
                renderer={({ record, dataSet }) => {
                  return (
                    <>
                      {dataSet?.toData().length !== 1 && (
                        <a
                          style={{ marginRight: 10 }}
                          onClick={() => {
                            if (dataSet && record) {
                              dataSet.remove(record);
                            }
                          }}
                        >
                          <Icon type="delete" />
                        </a>
                      )}
                      {getWarning(record)}
                    </>
                  );
                }}
              />
            </Table>
          </div>
          <div className={styles.title} style={{ marginTop: '32px' }}>
            {intl.get('hmde.bo.title.condition').d('条件')}
            <Tooltip
              title={intl
              .get('hmde.bo.field.prevConditionFields.help')
              .d('条件字段可选择该业务对象除关系类字段、公式、引用、附件类字段外的所有字段')}
            >
              <Icon
                type='help'
                style={{
                  color: '#868d9c',
                  fontSize: '14px',
                  fontWeight: 400,
                  verticalAlign: 'bottom',
                  marginLeft: '-6px',
                }}
              />
            </Tooltip>
          </div>
          <div>
            {!createContentDs.current?.get('prevConditionFields') && (
              <Button funcType={FuncType.flat} icon='playlist_add' onClick={handleAddCondition}>
                {intl.get('hmde.bo.advanced.addCondition').d('添加条件')}
              </Button>
            )}
            {createContentDs.current?.get('prevConditionFields') && (
              <Form dataSet={createContentDs} columns={20} labelLayout={LabelLayout.float}>
                <Select
                  colSpan={6}
                  name="prevConditionFields"
                  clearButton={false}
                  label={intl.get('srm.rulesDefinition.model.rulesDefinition.leftValue').d('')}
                  searchable
                  noCache
                  searchMatcher={({ record, text, textField, valueField }) => {
                    if (typeof text === 'string') {
                      return (
                        record
                          .get(textField)
                          .toLocaleLowerCase()
                          .indexOf(text?.toLocaleLowerCase()) !== -1 ||
                        record
                          .get(valueField)
                          .toLocaleLowerCase()
                          .indexOf(text?.toLocaleLowerCase()) !== -1
                      );
                    }
                    return false;
                  }}
                />
                <TextField
                  colSpan={6}
                  name="associateFieldType"
                  label={intl.get('srm.rulesDefinition.model.rulesDefinition.operator').d('')}
                  renderer={() => intl.get('hmde.bo.view.message.equal').d('等于')}
                  disabled
                />
                {getComponent(createContentDs.current?.get('prevConditionFields'))}
                <Button
                  icon="delete"
                  funcType={FuncType.flat}
                  className={styles['rule-delete-icon']}
                  onClick={() => createContentDs.current?.set('prevConditionFields', null)}
                />
              </Form>
            )}
          </div>
          <Form dataSet={createContentDs} columns={2} labelLayout={LabelLayout.float}>
            {createContentDs.current?.get('associateType') === 'SLAVE_MASTER' && (
              <Select name="linkRelationType" />
            )}
          </Form>
        </div>
      )}
    </Observer>
  );
}
