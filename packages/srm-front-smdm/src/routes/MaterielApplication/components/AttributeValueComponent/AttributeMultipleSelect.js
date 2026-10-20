import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Select, Button, TextField, Form, DataSet } from 'choerodon-ui/pro';
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

  const selectValue = isEmpty(form?.getFieldValue('attributeValue'))
    ? []
    : form?.getFieldValue('attributeValue').split(',');
  const originAttributeValueArr = !isEmpty(categoryAttrTemplatePropertyAssigns)
    ? categoryAttrTemplatePropertyAssigns.map((ele) => ele.valueName)
    : [];

  const ds = useMemo(() => new DataSet({ autoCreate: true }), []);

  const options = useMemo(
    () =>
      new DataSet({
        paging: false,
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
    const newAttributeValueArr = attributeValueArr.filter((ele) => !selectValue.includes(ele));
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
    ds.loadData([{ value: [] }]);
  }, [attributeValueArr, selectValue]);

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
              {intl.get('hzero.common.button.add').d('新建')}
            </Button>
            <Button onClick={() => setIsCreate(false)} style={{ height: '100%' }}>
              {intl.get('hzero.common.button.back').d('返回')}
            </Button>
          </div>
        </div>
      ) : (
        content
      ),
    [isCreate]
  );

  const renderSelectAllButton = useCallback(
    (buttons) => [
      ...buttons,
      customizeFlag === 1 && {
        key: 'add',
        children: intl.get('hzero.common.button.add').d('新增'),
        onClick: () => {
          createTextFieldDs.loadData([]);
          createTextFieldDs.create({});
          setIsCreate(true);
        },
      },
      customizeFlag === 1 &&
        !isEmpty(selectValue) &&
        selectValue.every((ele) => !originAttributeValueArr.includes(ele)) && {
          key: 'delete',
          children: intl.get('hzero.common.button.delete').d('删除'),
          loading: true,
          onClick: () => {
            handleDelete();
          },
        },
    ],
    [attributeValueArr, selectValue]
  );

  const handleChange = (newValue) => {
    const { setFieldsValue } = form;
    setFieldsValue({
      attributeValue: isEmpty(newValue) ? '' : newValue.join(),
      attributeValueCode: isEmpty(newValue) ? '' : newValue.map(ele => valueNameMapping.get(ele)).filter(ele => ele).join(),
    });
  };

  useEffect(() => {
    ds.loadData([{ value: selectValue }]);
    if(!isEmpty(categoryAttrTemplatePropertyAssigns)){
      categoryAttrTemplatePropertyAssigns.forEach((ele)=>{
        valueNameMapping.set(ele.valueName, ele.valueCode);
      });
    }
    return () => {
      form.resetFields();
      ds.loadData([{ value: null }]);
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
        popupContent={renderPopupContent}
        selectAllButton={renderSelectAllButton}
        onChange={handleChange}
        tabIntoPopupContent
        multiple
      />
    </Form>
  );
});

export default Index;
