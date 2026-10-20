import React from 'react';
import { Form, TextField, Select, RichText } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { PROTAL_CARD_CONTENT_TYPE } from '@/utils/utils';

const AddCardForm = observer(({ record }) => {
  const isCustomize = record && record.get('type') === PROTAL_CARD_CONTENT_TYPE.CUSTOMIZE;
  return (
    <Form columns={2} labelLayout="float" record={record}>
      <TextField
        name="title"
        showHelp='newLine'
        help={isCustomize && intl.get('hptl.portalAssign.model.protalConfig.title.help').d('自定义卡片的标题仅用于区分不同的卡片，不做显示')}
      />
      <Select name="type">
        <Select.Option value={PROTAL_CARD_CONTENT_TYPE.RICH_TEXT}>
          {intl.get('hptl.portalAssign.model.protalConfig.richText').d('富文本')}
        </Select.Option>
        <Select.Option value={PROTAL_CARD_CONTENT_TYPE.IFRAME}>
          {intl.get('hptl.portalAssign.model.protalConfig.referencePage').d('引用页面')}
        </Select.Option>
        <Select.Option value={PROTAL_CARD_CONTENT_TYPE.CUSTOMIZE}>
          {intl.get('hptl.portalAssign.model.protalConfig.customizeCard').d('自定义卡片')}
        </Select.Option>
      </Select>
      {record && [PROTAL_CARD_CONTENT_TYPE.IFRAME, PROTAL_CARD_CONTENT_TYPE.CUSTOMIZE].includes(record.get('type'))? (
        <TextField
          colSpan={2}
          name="content"
          label={intl.get('hptl.portalAssign.model.protalConfig.pageLink').d('页面地址')}
          showHelp='newLine'
          help={
            isCustomize &&
            intl.get('hptl.portalAssign.model.protalConfig.pageLink.customizeHelp')
            .d("自定义卡片的地址不需要加http://或者https://前缀，请直接输入页面路由")
          }
        />
      ) : (
        <RichText name="content" colSpan={2} style={{ height: 340 }} />
      )}
    </Form>
  );
});

export default AddCardForm;
