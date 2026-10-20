/**
 * 封装Collapse
 */
import React from 'react';
import { Collapse, Icon } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import getLang from '@/langs/commonLang';
import styles from './index.less';

class CollapsePanel extends React.PureComponent {
  constructor(props) {
    super(props);

    const { eles = [] } = props;

    this.state = {
      collapseKeys: eles
        .filter((item) => (isUndefined(item.defaultExpand) ? true : item.defaultExpand))
        .map((item) => item.key),
    };
  }

  @Bind()
  renderPanel() {
    const { eles = [] } = this.props;
    const { collapseKeys } = this.state;
    return eles
      .filter((item) => !item.hidden)
      .map((item) => {
        const { ele, title, key, forceRender = false, autoCreatePanel = true } = item;
        return autoCreatePanel ? (
          <Collapse.Panel
            key={key}
            showArrow={false}
            forceRender={forceRender}
            header={
              <>
                <h3>{title}</h3>
                <a>{collapseKeys.includes(key) ? getLang('UP') : getLang('EXPAND')}</a>
                <Icon type={collapseKeys.includes(key) ? 'expand_less' : 'expand_more'} />
              </>
            }
          >
            {ele}
          </Collapse.Panel>
        ) : (
          ele
        );
      });
  }

  @Bind()
  handleCollapseChange(keys) {
    this.setState({ collapseKeys: keys });
  }

  render() {
    const { collapseKeys } = this.state;
    return (
      <div className={styles['hitf-collapse']}>
        <Collapse
          className="form-collapse"
          defaultActiveKey={collapseKeys}
          onChange={this.handleCollapseChange}
        >
          {this.renderPanel()}
        </Collapse>
      </div>
    );
  }
}
export default CollapsePanel;
