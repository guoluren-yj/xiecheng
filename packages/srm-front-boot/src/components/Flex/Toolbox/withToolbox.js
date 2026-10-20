/* eslint-disable react/no-multi-comp */
import React, { Fragment, PureComponent, useState } from 'react';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import { Button, Tooltip } from 'hzero-ui';
import intl from 'utils/intl';
import Toolbox from './Toolbox';

// 设置sinv国际化前缀 - view.title

// const viewTitlePrompt = 'hpfm.flexFields.view.title';
// 设置sinv国际化前缀 - view.button
// const viewButtonPrompt = 'hpfm.individuationForm.view.button';
// 设置通用国际化前缀
// const commonPrompt = 'hzero.common';

function ToolboxButton({
  onClick = () => {},
  visible,
  cancel = () => {},
  toolsControllers = [],
  toolsPanels = [],
  ...others
}) {
  return (
    <Fragment>
      <Tooltip placement="bottom" title={intl.get(`hpfm.toolbox.view.title.toolbox`).d('工具箱')}>
        <Button onClick={onClick} icon="setting" {...others} />
      </Tooltip>
      <Toolbox visible={visible} cancel={cancel} toolsControllers={toolsControllers} />
      {toolsPanels}
      {/* <IndividuationPanel visible={individuationPanelVisible} cancel={() => setIndividuationPanelVisible(false)} setIndividuationPanelVisible={setIndividuationPanelVisible} /> */}
    </Fragment>
  );
}

export default function withIndividuationForm(options = {}) {
  const { tools = [] } = options;
  return Component => {
    const WrapComponent = Component;
    // tools.forEach((n) => {
    //   WrapComponent = n(WrapComponent);
    // });

    class WithToolboxComponent extends PureComponent {
      constructor(props) {
        super(props);
        this.state = {};
      }

      componentDidMount() {
        const { toolsConfig = [] } = this.props;
        toolsConfig.forEach(n => {
          if (isFunction(n.asyncEvent)) {
            n.asyncEvent();
          }
        });
      }

      @Bind()
      openToolboxDrawer() {
        const { setToolboxDrawerVisible = () => {} } = this.props;
        setToolboxDrawerVisible(true);
      }

      @Bind()
      closeToolboxDrawer() {
        const { setToolboxDrawerVisible = () => {} } = this.props;
        setToolboxDrawerVisible(false);
      }

      render() {
        const { toolboxDrawerVisible, toolsConfig = [] } = this.props;
        const toolboxButtonProps = {
          onClick: this.openToolboxDrawer,
          visible: toolboxDrawerVisible,
          cancel: this.closeToolboxDrawer,
        };
        toolboxButtonProps.toolsControllers = toolsConfig.map(n => ({
          key: n.key,
          title: n.title,
          controller: n.controller,
        }));
        toolboxButtonProps.toolsPanels = toolsConfig.map(n => n.panel);
        const wrapComponentProps = {
          ...this.props,
          toolboxButton: <ToolboxButton {...toolboxButtonProps} />,
        };
        toolsConfig.forEach(n => {
          if (isFunction(n.assignWrapComponentProps)) {
            n.assignWrapComponentProps(wrapComponentProps);
          }
        });
        return <WrapComponent {...wrapComponentProps} />;
      }
    }

    return React.forwardRef((props, ref) => {
      const [toolboxDrawerVisible, setToolboxDrawerVisible] = useState(false);
      const toolsConfig = tools.map(n => n({ toolboxDrawerVisible, setToolboxDrawerVisible }));
      return (
        <WithToolboxComponent
          {...props}
          toolboxDrawerVisible={toolboxDrawerVisible}
          setToolboxDrawerVisible={setToolboxDrawerVisible}
          toolsConfig={toolsConfig}
          ref={ref}
        />
      );
    });
  };
}
