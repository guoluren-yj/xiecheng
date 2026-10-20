import * as React from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { toSafeInteger } from 'lodash';
import { ButtonTooltip } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import Button from 'components/PermissionButton';

import './index.less';
import { useModal } from './index';
import type { IObjectProps } from './stores';

interface CustomeImportTemplateProps {
  templateCode: string;
  requestUrl: string;
  method?: 'GET' | 'POST' | 'get' | 'post';
  queryParams?: any; // 导出接口业务参数配置
  queryArea?: any; // 导出文件相关参数配置
  allBody?: boolean;
}

interface ImportProps {
  // sync?: boolean; // 是否同步
  // auto?: boolean; // 是否自动(同步模式下生效)
  /** 为true时会将prefixPatch应用到/business-object-import-templates/list接口 */
  changeServicePrefix?: boolean;
  autoExecute?: boolean;
  autoRefreshInterval?: number; // Integer
  tenantId?: number;
  action?: string; // 国际化编码(配合key使用)
  buttonText?: string; // 按钮文字
  buttonProps?: IObjectProps; // 按钮属性
  restoreShowAllButton?: boolean;
  refreshButton?: boolean;
  auto?: boolean;
  modalProps?: any;
  successCallBack?: () => any;
  errorCallBack?: () => any;
  customeImportTemplate?: CustomeImportTemplateProps; // 自定义下载模板
  getModal?: () => any;
}

const List: React.FC<ImportProps> = observer(
  ({
    action = 'hzero.common.button.import',
    buttonText = intl.get('hzero.common.button.import').d('导入'),
    buttonProps = {},
    tenantId = getCurrentOrganizationId(),
    autoRefreshInterval = 5000,
    refreshButton = false,
    restoreShowAllButton = false,
    auto = true,
    modalProps = {},
    successCallBack = () => undefined,
    errorCallBack = () => undefined,
    autoExecute = true,
    getModal,
  }) => {
    const handleClick = React.useCallback(() => {
      const { openModal } = useModal();
      openModal(
        {
          tenantId,
          autoRefreshInterval: toSafeInteger(autoRefreshInterval),
          refreshButton,
          auto,
          restoreShowAllButton,
          successCallBack,
          errorCallBack,
          autoExecute,
          getModal,
        },
        modalProps
      );
    }, [
      tenantId,
      action,
      restoreShowAllButton,
      successCallBack,
      errorCallBack,
      autoExecute,
      getModal,
    ]);

    const clsName = classnames('srm-common-import-button', (buttonProps || {}).className);

    return (
      <Button
        type="c7n-pro"
        icon="archive"
        // tooltip="none"
        {...buttonProps}
        onClick={handleClick}
        className={clsName}
        tooltip={ButtonTooltip.none}
      >
        {buttonText}
      </Button>
    );
  }
);

export default List;
