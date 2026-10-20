/**
 * index - 弹性域汇总查询页面-新建模型
 * @date: 2019-4-25
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment, PureComponent } from 'react';
import { Button, Divider, Drawer } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
// import styles from './index.less';

/**
 *
 *
 * @export
 * @class FlexFields
 * @extends {PureComponent}
 */
export default class Toolbox extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * cancel - 关闭指标详情抽屉
   */
  @Bind()
  cancel() {
    const { cancel = () => {} } = this.props;
    cancel();
  }

  render() {
    const { visible, toolsControllers = [] } = this.props;

    const title = intl.get(`hpfm.toolbox.view.title.toolbox`).d('工具箱');
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel,
      width: 450,
    };

    return (
      <Drawer {...drawerProps}>
        {toolsControllers.map(n => (
          <Fragment>
            <h3>{n.title}</h3>
            <Divider />
            {n.controller}
          </Fragment>
        ))}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
            zIndex: 1,
          }}
        >
          <Button onClick={this.cancel}>{intl.get(`hzero.common.button.close`).d('关闭')}</Button>
        </div>
      </Drawer>
    );
  }
}
