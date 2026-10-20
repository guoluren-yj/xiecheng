/**
 * MetaEditModal.js
 * index.js
 * @date: 2020-07-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Form, TextField, CodeArea, IntlField, Lov } from 'choerodon-ui/pro';
import intl from 'utils/intl';
// 引入格式化器
// import { PUBLIC_BUCKET } from 'srm-front-boot/lib/utils/config';
// import RichTextEditor from 'components/RichTextEditor';
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import MultRichText from './MultRichText';
// eslint-disable-next-line import/no-named-as-default
// 引入 json lint
// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
import 'codemirror/mode/javascript/javascript';
import 'choerodon-ui/pro/lib/code-area/lint/json';

const options = { mode: { name: 'javascript', json: true } };

function MetaEditModal(props = {}) {
  const { dataSet, isEditFlag = false } = props;
  const style = { height: 260 };

  // const renderRichTextModal = (name) => {
  //   const data = dataSet.current.get(name);
  //   const onEditorChange = (newData) => {
  //     dataSet.current.set({ [name]: newData });
  //   };

  //   const staticTextProps = {
  //     content: data,
  //     data,
  //     onEditorChange,
  //     bucketName: PUBLIC_BUCKET,
  //     bucketDirectory: 'spfm-rule-definition',
  //   };

  //   Modal.open({
  //     key: Modal.key(),
  //     style: { width: 850 },
  //     children: (
  //       <div>
  //         <RichTextEditor {...staticTextProps} />
  //       </div>
  //     ),
  //     closable: false,
  //     onOk: () => {},
  //     onCancel: () => {
  //       dataSet.current.set({ [name]: data });
  //     },
  //   });
  // };

  // const renderSuffix = (name) => {
  //   return (
  //     <Tooltip title={intl.get('spfm.rulesCategory.view.richText.edit').d('富文本编辑')}>
  //       <Icon type="zoom_out_map" onClick={() => renderRichTextModal(name, dataSet)} />
  //     </Tooltip>
  //   );
  // };

  return (
    <Form dataSet={dataSet}>
      <TextField
        label={intl
          .get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.fullPathCode')
          .d('路径编码')}
        name="fullPathCode"
        required
        disabled={isEditFlag}
      />
      <Lov name="tenant" required disabled={isEditFlag} />
      <IntlField
        label={intl.get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.name').d('名称')}
        labelWidth={150}
        name="name"
        required
      />
      <MultRichText name="description" dataSet={dataSet} />
      <TextField
        label={intl
          .get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.defaultRet')
          .d('默认返回值')}
        name="defaultRet"
        required
      />
      <TextField
        label={intl
          .get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.defaultRetMeaning')
          .d('默认返回值描述')}
        name="defaultRetMeaning"
        required
      />
      <CodeArea
        dataSet={dataSet}
        name="parameters"
        label={intl.get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.parameters').d('参数')}
        options={options}
        formatter={JSONFormatter}
        style={style}
        movable={false}
        required
      />
      <CodeArea
        dataSet={dataSet}
        name="ret"
        label={intl.get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.ret').d('返回值')}
        options={options}
        formatter={JSONFormatter}
        style={style}
        movable={false}
        required
      />
    </Form>
  );
}

export default MetaEditModal;
