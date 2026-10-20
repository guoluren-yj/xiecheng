/*
 * @Date: 2024-08-02 11:34:30
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useContext } from 'react';
import { RichText, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { NoDataRender } from '@/routes/components/utils/render';
import { Store } from '../stores';

export const CustomExtra = ({ data }) => {
  const { loading, addOrEditCardName, handleDeleteCard } = useContext(Store);
  return (
    <Fragment>
      <Button loading={loading} funcType="link" onClick={() => addOrEditCardName('edit', data)}>
        {intl.get('sslm.memberExpansion.view.customCard.rename').d('重命名')}
      </Button>
      <Button
        funcType="link"
        loading={loading}
        style={{ marginLeft: 16 }}
        onClick={() => handleDeleteCard(data)}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
    </Fragment>
  );
};

const CustomCard = ({ data }) => {
  const { isEdit, handleRichTextChange } = useContext(Store);
  return isEdit || data.customizeContent ? (
    <RichText
      style={{ height: 200 }}
      value={data.customizeContent}
      mode={isEdit ? 'editor' : 'preview'}
      onChange={value => handleRichTextChange(value, data)}
    />
  ) : (
    <NoDataRender />
  );
};

export default CustomCard;
