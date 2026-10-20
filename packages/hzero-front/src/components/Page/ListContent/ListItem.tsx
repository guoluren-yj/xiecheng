import * as React from 'react';
import classNames from 'classnames';
import './styles.less';

interface ListItemProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const ListItem: React.FC<ListItemProps> = (props) => {
  const { className, style, children } = props;

  const classString = classNames('list-item', className);

  return (
    <>
      <div className={classString} style={style}>
        {children}
      </div>
    </>
  );
};

export default ListItem;
