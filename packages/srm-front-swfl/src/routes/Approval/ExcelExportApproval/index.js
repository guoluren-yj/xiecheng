import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Modal, DataSet, Icon } from 'choerodon-ui/pro';
import { ButtonType } from 'choerodon-ui/pro/lib/button/enum';
import { Button as ButtonPermission } from 'components/Permission';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import ExportContent from './ExportContent';
import { getQueryDs } from './exportDS';

function ExcelExportApproval(props = {}) {
  const {
    requestUrl,
    unMergeRequestUrl,
    method = 'GET',
    otherButtonProps = {},
    buttonText = intl.get('hzero.common.button.export').d('导出'),
    title = intl.get(`hzero.common.components.export`).d('导出Excel'),
    handleExport = () => {},
  } = props;
  const queryDs = new DataSet(getQueryDs());
  const buttonProps = {
    type: ButtonType.button,
    ...otherButtonProps,
  };

  const openModal = () => {
    const modal = Modal.open({
      key: 'exportModal',
      drawer: true,
      title,
      className: 'modal-export',
      children: (
        <ExportContent
          requestUrl={requestUrl}
          unMergeRequestUrl={unMergeRequestUrl}
          method={method}
          queryDs={queryDs}
        />
      ),
      afterClose: () => {
        queryDs.reset();
      },
      footer: (
        <>
          <Button
            color="primary"
            onClick={() => {
              let fileName = '';
              let merge = true;
              if (queryDs?.current) {
                fileName = queryDs.current.get('fileName');
                merge = queryDs.current.get('merge') !== '0';
              }
              const flag = handleExport({ fileName, merge });
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
      <ButtonPermission {...buttonProps} onClick={openModal}>
        <Icon
          type="unarchive"
          style={{ fontSize: '0.14rem', marginRight: '0.05rem', fontWeight: '400' }}
        />
        {buttonText}
      </ButtonPermission>
    </>
  );
}

export default formatterCollections({
  code: ['hzero.common'],
})(observer(ExcelExportApproval));
