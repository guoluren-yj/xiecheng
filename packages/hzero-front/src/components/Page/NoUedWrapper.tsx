import type { FC } from 'react';
import { createElement } from 'react';
// import React, { FC, useContext, useMemo, createElement } from 'react';
// import ThemeContext, { ThemeProvider } from '@hzero-front-ui/cfg/lib/utils/ThemeContext';

export const NO_UED_WRAPPER_CLASS_NAME = 'hzero-no-ued-wrapper';

export const NO_UED_SCOPE_SELECTOR = `.page-container > div:not(.${NO_UED_WRAPPER_CLASS_NAME})`;

export interface NoUedWrapperProps {
  noUed?: boolean;
  className?: string;
  htmlTag?: string;
}

// const NoUedWrapper: FC<NoUedWrapperProps> = (props) => {
//   const { noUed = true, className, htmlTag = 'div', children } = props;
//   const contextValue = useContext(ThemeContext);
//   const newContextValue = useMemo(() => ({ ...contextValue, schema: 'theme2' }), [contextValue]);
//   return noUed ? (
//     <ThemeProvider value={newContextValue}>
//       {createElement(
//         htmlTag,
//         {
//           className: [NO_UED_WRAPPER_CLASS_NAME, className || ''].join(' '),
//         },
//         children
//       )}
//     </ThemeProvider>
//   ) : (
//     createElement(
//       htmlTag,
//       {
//         className,
//       },
//       children
//     )
//   );
// };

const NoUedWrapper: FC<NoUedWrapperProps> = (props) => {
  const { className, htmlTag = 'div', children } = props;
  return createElement(
    htmlTag,
    {
      className,
    },
    children
  );
};

export default NoUedWrapper;
