import React from 'react';
import { Button, useModal } from 'choerodon-ui/pro';
import { compose, noop } from 'lodash';
import { observer } from 'mobx-react';

import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import intl from 'utils/intl';

import Content from './Content';

const Index = (props) => {
  const {
    btnProps = {},
    sourceFromId = '',
    sourceFrom = 'RFX',
    customizeCollapseForm = noop,
    customizeTable = noop,
  } = props || {};

  const Modal = useModal();

  const openModal = () => {
    if (!sourceFromId) return;

    const contentProps = {
      sourceFrom,
      sourceFromId,
      customizeTable,
      customizeCollapseForm,
    };

    return Modal.open({
      title: intl.get('ssrc.expertExtract.view.title.randomExtractView').d('随机抽取查看'),
      destroyOnClose: true,
      children: <Content {...contentProps} />,
      drawer: true,
      style: {
        width: 1090,
      },
      okText: intl.get('ssrc.expertExtract.view.button.close').d('关闭'),
      cancelButton: false,
    });
  };

  return (
    <Button
      icon="root"
      funcType="flat"
      color="primary"
      {...(btnProps || {})}
      onClick={() => openModal()}
    >
      {intl.get('ssrc.expertExtract.view.button.randomExtractView').d('随机抽取查看')}
    </Button>
  );
};

export default compose(
  WithCustomizeC7N({
    unitCode: [
      `SSRC.INQUIRY_HALL_RANDOM_EXTRACT.RULES_DETAIL`, // 抽取规则表单
      `SSRC.INQUIRY_HALL_RANDOM_EXTRACT.EXPERTS_DETAIL`, // 抽取专家表格
    ],
  }),
  formatterCollections({
    code: ['ssrc.expertExtract'],
  })
)(observer(Index));
