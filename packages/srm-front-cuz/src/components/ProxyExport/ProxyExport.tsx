import {
  Button as H0Button,
  Dropdown as H0Dropdown,
  Icon as H0Icon,
  Menu as H0Menu,
} from 'hzero-ui';
import {
  Button as C7NButton,
  Dropdown as C7NDropdown,
  Icon as C7NIcon,
  Menu as C7NMenu,
} from 'choerodon-ui';
import { ClickParam } from 'choerodon-ui/lib/menu';
import React, { MouseEventHandler, ReactNode } from 'react';
import ExcelExport from 'hzero-front/lib/components/ExcelExport';
import intl from 'hzero-front/lib/utils/intl';

interface ExportProps {
  otherButtonProps: any;
  requestUrl: string;
  queryParams: any;
}

export default class ExportWrapper extends React.Component<
  {
    onClick: (e?) => PromiseLike<ExportProps>;
    btnType: 'c7n' | 'h0';
    help?: ReactNode;
  },
  any
> {
  export: ExcelExport;

  static defaulrProps = {
    btnType: 'c7n',
  };

  constructor(props) {
    super(props);
    this.state = {
      props: {},
      loadingProps: false,
    };
  }

  onRef = (ins) => {
    this.export = ins;
  };

  interceptClick: MouseEventHandler<unknown> = (e) => {
    const { onClick } = this.props;
    this.setState({ loadingProps: true });
    onClick &&
      onClick((newProps) => {
        if (!newProps) {
          this.setState({ loadingProps: false });
        } else {
          this.setState({ props: newProps, loadingProps: false }, () => {
            this.export.showSyncExportModal();
          });
        }
      });
    e.preventDefault();
    e.stopPropagation();
  };

  asyncInterceptClick = async (param: ClickParam) => {
    const { onClick } = this.props;
    this.setState({ loadingProps: true });
    onClick &&
      onClick((newProps) => {
        if (!newProps) {
          this.setState({ loadingProps: false });
        } else {
          this.setState({ props: newProps, loadingProps: false }, () => {
            switch (param.key) {
              case 'export':
                this.export.showModal();
                break;
              case 'async-data':
                this.export.showHistoryModal();
                break;
              default:
            }
          });
        }
      });
  };

  render() {
    const {
      state: {
        props: { exportAsync, buttonText = intl.get('hzero.common.button.export').d('导出') },
        loadingProps,
      },
      props: { children = buttonText, btnType, help },
    } = this;
    let Button: any = C7NButton;
    let Dropdown: any = C7NDropdown;
    let Menu: any = C7NMenu;
    let Icon: any = C7NIcon;
    if (btnType === 'h0') {
      Button = H0Button;
      Dropdown = H0Dropdown;
      Menu = H0Menu;
      Icon = H0Icon;
    }
    return (
      <div className="proxy-export">
        {exportAsync ? (
          <Dropdown
            overlay={
              <Menu onClick={this.asyncInterceptClick}>
                <Menu.Item key="export">
                  {intl.get('hzero.common.button.export').d('导出')}
                </Menu.Item>
                <Menu.Item key="async-data">
                  {intl.get('hzero.common.excelExport.asyncDataView').d('异步数据查看')}
                </Menu.Item>
              </Menu>
            }
          >
            <Button icon="export" style={{ marginLeft: '8px' }}>
              {children}
              {help}
              <Icon type="down" />
            </Button>
          </Dropdown>
        ) : (
          <Button
            onClick={this.interceptClick}
            icon="export"
            style={{ marginLeft: '8px' }}
            loading={loadingProps}
          >
            {children}
            {help}
          </Button>
        )}
        <div style={{ display: 'none' }}>
          <ExcelExport {...this.state.props} onRef={this.onRef} />
        </div>
      </div>
    );
  }
}
