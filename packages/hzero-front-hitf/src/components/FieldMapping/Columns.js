import { Tooltip } from 'choerodon-ui';
import React from 'react';
import { isElement } from 'react-dom/test-utils';

class Columns extends React.Component {
  customRender(opts, data, idx) {
    const { key, render } = opts;
    let result = false;
    if (isElement(render) || typeof render === 'string') {
      result = render;
    } else if (typeof render === 'function') {
      result = render(data[key], data, idx);
    }
    return result;
  }

  render() {
    const {
      item,
      index,
      columnOpt,
      sorting,
      columns,
      type,
      edit,
      drawing,
      isLink,
      handleToggle,
    } = this.props;
    if (item.displayTree === undefined) {
      item.displayTree = true;
    }
    if (item.displayIcon === undefined) {
      item.displayIcon = true;
    }
    return (
      <li {...columnOpt(item, index)} style={{ display: item.displayTree ? 'flex' : 'none' }}>
        <span style={{ width: (item.level - 1) * 20 }} />
        {columns.map((column, idx) => {
          return (
            <div className="column-item" style={{ width: '100%' }} key={column.key}>
              {item.children && item.displayIcon ? (
                <img
                  style={{
                    width: 17,
                    height: 17,
                    marginRight: 15,
                    opacity: item.children && item.children.length !== 0 ? 1 : 0,
                    cursor: 'pointer',
                  }}
                  onClick={handleToggle}
                  alt="icon"
                  src="data:image/png;base64,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"
                />
              ) : (
                <img
                  style={{
                    width: 17,
                    height: 17,
                    marginRight: 15,
                    opacity: item.children && item.children.length !== 0 ? 1 : 0,
                    cursor: 'pointer',
                  }}
                  onClick={handleToggle}
                  alt="icon"
                  src="data:image/png;base64,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"
                />
              )}
              <span
                key={column.key}
                style={{
                  width: column.width,
                  textAlign: column.align,
                }}
                title={item[column.key] || ''}
              >
                {this.customRender(column, item, idx) || (
                  <Tooltip title={`${item[column.key]} : ${item.type}`}>
                    {`${item[column.key]} : ${item.type}`}
                  </Tooltip>
                )}
              </span>
            </div>
          );
        })}
        {index !== 0 && (
          <div
            style={{ visibility: edit && item.iconShow }}
            className={`column-icon ${type}-column-icon ${sorting ? 'sorting' : ''} ${
              edit ? '' : 'disabled'
            } ${drawing && isLink ? 'forbidden' : ''}`}
          />
        )}
      </li>
    );
  }
}

export default Columns;
