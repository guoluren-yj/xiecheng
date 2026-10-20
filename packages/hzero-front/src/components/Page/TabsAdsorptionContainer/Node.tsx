import * as React from 'react';
import { set } from 'lodash';

interface Props {
  children?: React.ReactNode;
  index: string;
  refObj?: any;
}

const List: React.FC<Props> = ({ refObj, index, children }) => {
  const ref = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    set(refObj, index, ref);
  }, []);

  return <div ref={ref}>{children}</div>;
};

export default List;
