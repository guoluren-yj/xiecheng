import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Modal, DataSet } from 'choerodon-ui/pro';
import { ButtonType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import ExportContent from './ExportContent';
import { getQueryDs } from './exportDS';

function ExcelExportApproval(props = {}) {
  const {
    requestUrl,
    method = 'GET',
    otherButtonProps = {},
    buttonText = intl.get('hzero.common.button.export').d('导出'),
    title = intl.get(`hzero.common.components.export`).d('导出Excel'),
    handleExport = () => {},
  } = props;
  const queryDs = new DataSet(getQueryDs());
  const buttonProps = {
    icon: 'unarchive',
    type: ButtonType.button,
    ...otherButtonProps,
  };

  const openModal = () => {
    const modal = Modal.open({
      key: 'exportModal',
      drawer: true,
      title,
      className: 'modal-export',
      children: <ExportContent requestUrl={requestUrl} method={method} queryDs={queryDs} />,
      afterClose: () => {
        queryDs.reset();
      },
      footer: (
        <>
          <Button
            color="primary"
            onClick={() => {
              let fileName = '';
              if (queryDs?.current) {
                fileName = queryDs.current.get('fileName');
              }
              const flag = handleExport(fileName);
              if (flag) {
                modal.close();
              }
            }}
          >
            {intl.get('hzero.common.button.confirm.export').d('导出')}
          </Button>
          <Button
            onClick={() => {
              modal.close();
            }}
          >
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </>
      ),
    });
  };

  return (
    <>
      <Button {...buttonProps} onClick={openModal}>
        {buttonText}
      </Button>
    </>
  );
}

export default formatterCollections({
  code: ['hzero.common'],
})(observer(ExcelExportApproval));
