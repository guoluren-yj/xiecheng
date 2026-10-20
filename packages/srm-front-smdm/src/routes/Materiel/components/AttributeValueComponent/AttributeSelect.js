import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { CheckBox, Select, Button, TextField, Tooltip, Form, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';

const valueNameMapping = new Map();

const Index = observer((props) => {
  const { recordSource, onChangeRecordSource, form } = props;

  const { templateJson } = recordSource;
  const {
    attributeValueArr,
    categoryAttrTemplatePropertyAssigns,
    customizeFlag,
    ...otherTemplateJson
  } = JSON.parse(templateJson);

  const selectValue = form?.getFieldValue('attributeValue') || '';
  const originAttributeValueArr = !isEmpty(categoryAttrTemplatePropertyAssigns)
    ? categoryAttrTemplatePropertyAssigns.map((ele) => ele.valueName)
    : [];

  const ds = useMemo(() => new DataSet({ autoCreate: true }), []);

  const options = useMemo(
    () =>
      new DataSet({
        paging: false,
        fields: [{ name: 'checkArr', multiple: true }],
        data: attributeValueArr.map((ele) => ({ value: ele, meaning: ele })),
      }),
    [attributeValueArr]
  );

  const createTextFieldDs = useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'value',
            label: intl.get(`smdm.materiel.model.materiel.value`).d('值'),
            type: 'string',
          },
        ],
      }),
    []
  );

  const [isCreate, setIsCreate] = useState(false);

  const handleAdd = ({ dataSet, valueField }) => {
    const optionsValue = createTextFieldDs?.current?.get('value');
    if (optionsValue && !dataSet.find((record) => record.get(valueField) === optionsValue)) {
      // dataSet.create({ [textField]: optionsValue, [valueField]: optionsValue });
      onChangeRecordSource({
        ...recordSource,
        templateJson: JSON.stringify({
          ...otherTemplateJson,
          customizeFlag,
          categoryAttrTemplatePropertyAssigns,
          attributeValueArr: [...attributeValueArr, optionsValue],
        }),
      });
      setIsCreate(false);
    }
  };

  const handleDelete = useCallback(() => {
    const { setFieldsValue } = form;
    const checkArr = options?.current?.get('checkArr') || [];
    const newAttributeValueArr = attributeValueArr.filter((ele) => !checkArr.includes(ele));
    onChangeRecordSource({
      ...recordSource,
      templateJson: JSON.stringify({
        ...otherTemplateJson,
        customizeFlag,
        categoryAttrTemplatePropertyAssigns,
        attributeValueArr: newAttributeValueArr,
      }),
    });
    setFieldsValue({
      attributeValue: '',
    });
    ds.loadData([{ value: '' }]);
  }, [attributeValueArr, options]);

  const renderPopupContent = useCallback(
    ({ content, dataSet, textField, valueField }) =>
      isCreate ? (
        <div style={{ display: 'flex' }}>
          <TextField name="value" dataSet={createTextFieldDs} style={{ flex: 1 }} />
          <div>
            <Button
              onClick={() => handleAdd({ dataSet, textField, valueField })}
              style={{ height: '100%', marginLeft: 10 }}
            >
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>
            <Button onClick={() => setIsCreate(false)} style={{ height: '100%' }}>
              {intl.get('hzero.common.button.back').d('返回')}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="c7n-pro-select-select-all-none">
            <div>
              <span
                type="c7n-pro"
                funcType="link"
                color="primary"
                onClick={() => {
                  createTextFieldDs.loadData([]);
                  createTextFieldDs.create({});
                  setIsCreate(true);
                }}
              >
                {intl.get('hzero.common.button.add').d('新增')}
              </span>
              <span
                type="c7n-pro"
                funcType="link"
                color="primary"
                onClick={() => {
                  handleDelete();
                }}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </span>
            </div>
          </div>
          {content}
        </>
      ),
    [isCreate]
  );

  const handleChange = (newValue) => {
    const { setFieldsValue } = form;
    setFieldsValue({
      attributeValue: newValue,
      attributeValueCode: valueNameMapping.get(newValue),
    });
  };

  const renderer = ({ text }) => (
    <div style={{ width: '100%' }}>
      <CheckBox
        style={{ verticalAlign: 'text-bottom', marginRight: '8px' }}
        disabled={originAttributeValueArr.includes(text)}
        dataSet={options}
        name="checkArr"
        value={text}
        onClick={(event) => {
          event.stopPropagation();
        }}
      />
      {text}
    </div>
  );

  const optionRenderer = ({ text }) => (
    <Tooltip title={text} placement="left">
      {renderer({ text })}
    </Tooltip>
  );

  useEffect(() => {
    ds.loadData([{ value: selectValue }]);
    if(!isEmpty(categoryAttrTemplatePropertyAssigns)){
      categoryAttrTemplatePropertyAssigns.forEach((ele)=>{
        valueNameMapping.set(ele.valueName, ele.valueCode);
      });
    }
    return () => {
      ds.loadData([{ value: null }]);
      form.resetFields();
      valueNameMapping.clear();
    };
  }, []);

  return (
    <Form dataSet={ds} labelLayout="float">
      <Select
        searchable
        name="value"
        options={options}
        // placeholder="请选择"
        optionRenderer={optionRenderer}
        popupContent={renderPopupContent}
        onChange={handleChange}
        tabIntoPopupContent
      />
    </Form>
  );
});

export default Index;
