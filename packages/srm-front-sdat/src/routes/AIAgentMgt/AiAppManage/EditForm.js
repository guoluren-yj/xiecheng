/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
// import { Upload } from 'choerodon-ui';
import {
  Form,
  TextField,
  Select,
  Lov,
  // IconPicker,
  TextArea,
  Icon,
  Tooltip,
  IntlField,
  NumberField,
  Attachment,
} from 'choerodon-ui/pro';

export default function EditForm({ detailDS, intlMultiDS, editSuggestion }) {
  const [itemList, setItemList] = useState([
    {
      id: `suggestion1`,
      text: '',
    },
  ]);

  useEffect(() => {}, []);

  useEffect(() => {
    if (editSuggestion) {
      const words = editSuggestion.split('@');
      const items = words.map((item, index) => {
        return {
          id: `suggestion${index + 1}`,
          txt: item,
        };
      });
      setItemList(items);
    }
  }, [editSuggestion]);

  const handleCreateItem = () => {
    if (itemList.length >= 5) return;
    const newList = [...itemList];
    newList.push({
      id: `suggestion${newList.length + 1}`,
      text: '',
    });
    setItemList(newList);
  };

  const handleRemoveItem = (uId) => {
    const newList = [...itemList];
    const index = newList.findIndex((item) => item.id === uId);
    if (index !== -1) {
      newList.splice(index, 1);
    }
    if (intlMultiDS && intlMultiDS.current) {
      intlMultiDS.current.set(uId, '');
    }
    setItemList(newList);
  };

  const changeSkillName = (value) => {
    detailDS.current.set('skillCode', value);
    const codeList = detailDS.current?.getField('skillName')?.options?.toData() ?? [];
    if (codeList.length > 0) {
      const code = codeList.find((item) => item.value === value);
      if (code) {
        detailDS.current.set('skillName', code.meaning);
      }
    }
  };

  return (
    <>
      <Form dataSet={detailDS} columns={1} labelLayout="float">
        <TextField name="skillCode" disabled />
        <Select name="skillName" onChange={changeSkillName} />
        <IntlField name="skillAliasName" />
        {/* <IconPicker name="skillIcon" /> */}
        <Attachment name="skillIcon" sortable={false} listType="picture-card" />
        <Select name="skillType" />
        <Select name="serviceType" />
        <TextField name="secretKey" />
        <TextArea name="skillDesc" rows={2} />
        <Lov name="tenantObj" />
        <Select name="supplier" />
        <TextField name="endPoint" />
        <TextArea name="remark" rows={2} />
        <NumberField name="sortNum" />
      </Form>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '16px',
        }}
      >
        <span style={{ fontWeight: '500' }}>
          {intl.get('sdat.aiAppManage.model.comment').d('推荐问')}
          &nbsp;&nbsp;
          {`(${itemList.length} / 5)`}
        </span>
        <Tooltip title={intl.get('hzero.common.button.increase').d('新增')}>
          <Icon
            type="add"
            disabled={itemList?.length >= 5}
            style={{ cursor: 'pointer' }}
            onClick={handleCreateItem}
          />
        </Tooltip>
      </div>
      <Form dataSet={intlMultiDS} columns={1} labelLayout="float">
        {itemList.map((item, index) => {
          return (
            <div
              key={item.id}
              id={item.id}
              style={{ marginTop: '16px', display: 'flex', alignItems: 'center' }}
            >
              {`${index + 1}.`} &nbsp;&nbsp;
              <Form.Item>
                <IntlField name={item.id} style={{ flex: '1' }} showLengthInfo />
              </Form.Item>
              &nbsp;&nbsp;
              <Tooltip title={intl.get('hzero.common.button.remove').d('移除')}>
                <Icon
                  style={{ cursor: 'pointer' }}
                  type="remove_circle_outline"
                  onClick={() => handleRemoveItem(item.id)}
                />
              </Tooltip>
            </div>
          );
        })}
      </Form>
    </>
  );
}
