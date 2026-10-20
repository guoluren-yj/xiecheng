import React, { useEffect } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import {
  Form,
  Switch,
  IntlField,
  Output,
  Icon,
  Lov,
  Select,
  Table,
  Button,
  TextField,
  SelectBox,
  DatePicker,
  DateTimePicker,
} from 'choerodon-ui/pro';
import { TableColumnTooltip } from 'choerodon-ui/pro/lib/table/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { Observer } from 'mobx-react-lite';

import LabelTitleRender from '@/businessComponents/LabelTitleRender';

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

  const prevConditionsRender = () => {
    if (!createContentDs.current?.get('prevConditionFields')) {
      return (
        <Button onClick={handleAddCondition}>
          <Icon type="add" />
          {intl.get('hmde.bo.advanced.addCondition').d('添加条件')}
        </Button>
      );
    }
  };

  const init = () => {
    // eslint-disable-next-line no-unused-expressions
    createContentDs.current?.set('masterBusinessObjectId', businessObjectId);
    // eslint-disable-next-line no-unused-expressions
    createContentDs.current?.set('masterBusinessObjectName', businessObjectName);
    // eslint-disable-next-line no-unused-expressions
    createContentDs.current?.set('masterBusinessObjectCode', businessObjectCode);
    handleCreateTable();
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
        return <Switch name="associateValue" />;
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

  const thisButtons = [
    <Observer>
      {() => (
        <Button
          disabled={createContentDs.current?.get('referenceList') && tableDs.length > 0}
          onClick={handleCreateTable}
          icon="add"
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
          <Form dataSet={createContentDs} columns={2}>
            <IntlField name="associateName" suffix={<Icon type="language" />} />
            <TextField name="associateCode" />
            <Output name="masterBusinessObjectName" />
            <Lov name="associateBusinessObject" noCache />
            <SelectBox name="associateType">
              <Option value={LINK}>{intl.get('hmde.bo.view.messages.link').d('关联')}</Option>
              <Option value={SLAVE_MASTER}>
                {intl.get('hmde.bo.view.messages.salveMaster').d('从主')}
              </Option>
            </SelectBox>
          </Form>
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
          <Form dataSet={createContentDs} columns={2} labelWidth={120}>
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
            <Output
              label={
                <LabelTitleRender
                  value={intl.get('hmde.bo.field.prevConditions').d('前置条件')}
                  help={intl
                    .get('hmde.bo.field.prevConditionFields.help')
                    .d('条件字段可选择该业务对象除关系类字段、公式、引用、附件类字段外的所有字段')}
                />
              }
              name="prevConditions"
              renderer={prevConditionsRender}
            />
          </Form>
          {createContentDs.current?.get('prevConditionFields') && (
            <Form dataSet={createContentDs} columns={4} labelLayout={LabelLayout.float}>
              <Select
                name="prevConditionFields"
                clearButton={false}
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
                name="associateFieldType"
                renderer={() => intl.get('hmde.bo.view.message.equal').d('等于')}
                disabled
              />
              {getComponent(createContentDs.current?.get('prevConditionFields'))}
              <Output
                renderer={() => (
                  <a onClick={() => createContentDs.current?.set('prevConditionFields', null)}>
                    <Icon type="delete" />
                  </a>
                )}
              />
            </Form>
          )}
          <Form dataSet={createContentDs} columns={2}>
            {createContentDs.current?.get('associateType') === 'SLAVE_MASTER' && (
              <Select name="linkRelationType" />
            )}
            <Switch name="enabledFlag" />
          </Form>
        </div>
      )}
    </Observer>
  );
}
