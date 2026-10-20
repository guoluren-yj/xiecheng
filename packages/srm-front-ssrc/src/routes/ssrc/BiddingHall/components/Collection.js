import React from 'react';
import { observer } from 'mobx-react';
import { Icon } from 'choerodon-ui';
import { Throttle } from 'lodash-decorators';
import classnames from 'classnames';

import Styles from './index.less';

@observer
class Collection extends React.Component {
  @Throttle(1200)
  collections = () => {
    const { handleCollection, readOnly = false, record, querys = {} } = this.props;
    if (readOnly) {
      return;
    }

    if (handleCollection) {
      handleCollection(record, { querys });
    }
  };

  render() {
    const {
      visibleFlag = 1,
      collectionFlag = 0,
      styles = {},
      readOnly = false,
      iconStyles = null,
    } = this.props;

    if (!visibleFlag) {
      return '';
    }

    const currentIconStyles = iconStyles || {};

    return (
      <span
        onClick={this.collections}
        className={classnames(Styles['bidding-line-collect-wrap'], {
          [Styles['disabled-collection']]: !!readOnly,
        })}
        style={styles}
      >
        {collectionFlag ? (
          <Icon type="star" style={{ color: '#FFC60A', ...currentIconStyles }} />
        ) : (
          <Icon type="star_border" style={{ ...currentIconStyles }} />
        )}
      </span>
    );
  }
}

export default Collection;
