import React, { Fragment } from 'react';
import { DataSet, Form, TextField, Modal, Icon } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import RichTextEditor from 'components/RichTextEditor';
import { isEmpty } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { PUBLIC_BUCKET } from 'srm-front-boot/lib/utils/config';
import { getCurrentOrganizationId, getResponse, getCurrentLanguage } from 'utils/utils';
import withProps from 'utils/withProps';
import notification from 'utils/notification';

import { saveRulesCategoryData, getMultiLanguage } from '@/services/rulesDefinitionCategoryService';

import { getMultiLanguageDs } from './store';

const organizationId = getCurrentOrganizationId();

function MultRichText(props) {
  const { name, dataSet, ...otherProps } = props;

  const renderRichTextModal = (name, multLangDs) => {
    const data = multLangDs.current.get(name);
    const onEditorChange = (newData) => {
      multLangDs.current.set({ [name]: newData });
    };

    const staticTextProps = {
      content: data,
      data,
      onEditorChange,
      bucketName: PUBLIC_BUCKET,
      bucketDirectory: 'spfm-rule-definition',
    };

    Modal.open({
      key: Modal.key(),
      style: { width: 850 },
      children: (
        <div>
          <RichTextEditor {...staticTextProps} />
        </div>
      ),
      closable: false,
      onOk: () => {},
      onCancel: () => {
        multLangDs.current.set({ [name]: data });
      },
    });
  };

  const renderIntlRichTextModal = (fieldName) => {
    const lang = getCurrentLanguage();
    const _token = dataSet.current.get('_token');
    const multLangDs = new DataSet(getMultiLanguageDs());
    const _tls = dataSet.current.get('_tls') || {};

    if (_tls?.fieldName) {
      multLangDs.loadData([_tls?.fieldName]);
    } else {
      if (_token) {
        getMultiLanguage({ _token, fieldName }).then((res) => {
          if (getResponse(res)) {
            const multLangData = {};
            res.forEach((ele) => {
              multLangData[ele.code] = ele.value;
            });
            multLangDs.loadData([multLangData]);
          }
        });
      } else {
        multLangDs.create({});
      }
    }

    const renderSuffix = (name) => {
      return (
        <Tooltip title={intl.get('spfm.rulesCategory.view.richText.edit').d('富文本编辑')}>
          <Icon type="zoom_out_map" onClick={() => renderRichTextModal(name, multLangDs)} />
        </Tooltip>
      );
    };

    Modal.open({
      key: Modal.key(),
      title: intl.get('hzero.c7nProUI.IntlField.modal_title').d('输入多语言信息'),
      style: { width: 500 },
      children: (
        <div>
          <Form dataSet={multLangDs}>
            <TextField name="zh_CN" suffix={renderSuffix('zh_CN')} />
            <TextField name="en_US" suffix={renderSuffix('en_US')} />
            <TextField name="ja_JP" suffix={renderSuffix('ja_JP')} />
            <TextField name="ru_RU" suffix={renderSuffix('ru_RU')} />
          </Form>
        </div>
      ),
      closable: false,
      onOk: () => {
        dataSet.current.set({
          _tls: {
            ..._tls,
            [fieldName]: multLangDs.current.toData(),
          },
          [fieldName]: multLangDs.current.get(lang),
        });
      },
      onCancel: () => {},
    });
  };

  return (
    <Fragment>
      <TextField
        {...otherProps}
        name={name}
        suffix={<Icon type="language" onClick={() => renderIntlRichTextModal(name)} />}
      />
    </Fragment>
  );
}

export default formatterCollections({
  code: ['spfm.rulesCategory', 'hzero.common', 'hzero.c7nProUI'],
})(MultRichText);
