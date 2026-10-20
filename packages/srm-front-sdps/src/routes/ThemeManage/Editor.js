import React, { useEffect } from 'react';
import intl from 'utils/intl';
import { Modal } from 'choerodon-ui';
import { Form, TextField, NumberField, IntlField } from 'choerodon-ui/pro';

const { Sidebar } = Modal;

export default function Editor(props) {
  const {
    visible,
    dataSet,
    rowData,
    // createFlag, // false 新建顶层，true 行上新建
    editFlag = true,
    onCreate = () => {},
    onCancel = () => {},
  } = props;

  useEffect(() => {
    return () => {
      dataSet.data = [];
      dataSet.reset();
    };
  }, []);

  useEffect(() => {
    // 存在 parentThemeId 说明是新增下级数据
    if (dataSet && dataSet.current) {
      dataSet.current.set('parentThemeId', rowData?.parentThemeId ?? 0);
      dataSet.current.set(
        'themeLevel',
        rowData && rowData.themeLevel >= 0 ? rowData.themeLevel + 1 : 1
      );
      dataSet.current.set('enableFlag', '1');
    }
  }, [rowData]);

  return (
    <>
      <Sidebar
        title={intl.get('sdps.themeConfig.view.title.themeManage').d('主题管理')}
        visible={visible}
        onOk={onCreate}
        onCancel={onCancel}
        width={372}
        closable
        destroyOnClose
        zIndex={2}
        contentStyle={{ height: '100%' }}
        bodyStyle={{ height: '100%' }}
      >
        <Form dataSet={dataSet} columns={1}>
          <TextField name="themeCode" disabled={!editFlag} />
          <IntlField name="themeName" />
          <NumberField name="sort" />
        </Form>
      </Sidebar>
    </>
  );
}
