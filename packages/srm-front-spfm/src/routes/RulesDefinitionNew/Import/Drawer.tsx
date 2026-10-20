import * as React from 'react';
import { Spin, Button } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';

import DraggerUpload from './DraggerUpload';
import './index.less';
import _store, { EState } from './stores';

interface ImportProps {
  tenantId: string | number;
  [propName: string]: any;
}

const Drawer: React.FC<ImportProps> = ({ modal, modalProps }) => {
  const {
    setDraggerData,
    draggerData: { isAuto, state, queryTimer },
    dataSource: { refreshButton, auto },
  } = React.useContext<any>(_store as any).store;
  const uploadRef = React.useRef<any>();

  React.useEffect(() => {
    modal.handleCancel(() => {
      if (modalProps.destroyOnClose !== false) {
        clearInterval(queryTimer);
        setDraggerData('isAuto', false);
        setDraggerData('queryTimer', undefined);
      }
    });
  }, [queryTimer]);

  React.useEffect(() => {
    modal.update({
      footer: (
        <>
          <Button
            color={ButtonColor.primary}
            onClick={() => {
              // 防止数据导入完成前关闭弹窗时重复请求刷新导入状态
              setDraggerData('isAuto', false);
              modal.close();
            }}
          >
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
          <Button onClick={uploadRef.current?.handleOpenHistory}>
            {intl.get('hzero.common.componenets.import.title.history').d('导入历史')}
          </Button>
          {(refreshButton || !auto) && [EState.checking, EState.checkFailed].includes(state) && (
            <Button
              key="refresh"
              icon="sync"
              onClick={() => uploadRef.current?.handleRefresh({ flag: true })}
            >
              {intl.get('hzero.common.button.refresh').d('刷新')}
            </Button>
          )}
          {(refreshButton || !auto) && [EState.checking, EState.checkFailed].includes(state) && (
            <Button key="auto-refresh" icon={isAuto ? 'restore' : 'sync'} onClick={handleSetAuto}>
              {isAuto
                ? intl.get('hzero.common.button.cancelAutoReload').d('取消自动刷新')
                : intl.get('hzero.common.button.autoReload').d('自动刷新')}
            </Button>
          )}
        </>
      ),
      modalFlag: false,
    });
  }, [isAuto, state, modal.props.modalFlag]);

  const handleSetAuto = React.useCallback(() => {
    setDraggerData('isAuto', !isAuto);
  }, [isAuto]);

  // FIXME: 有病吧，为啥要子传父
  const RefUpload = React.forwardRef(() => <DraggerUpload myRef={uploadRef} />);

  return (
    <Spin spinning={false}>
      <span className="common-import-title">
        {intl.get('hzero.common.components.import.message.excel').d('导入符合模版规范的Excel文件')}
      </span>
      <RefUpload />
    </Spin>
  );
};

export default observer(Drawer);
