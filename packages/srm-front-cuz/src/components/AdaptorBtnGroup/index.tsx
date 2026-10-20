import { ReactNode } from 'react';

export function AdaptorBtnGroup({
  stdChildren,
  children,
}: {
  stdChildren: (custName?: string) => ReactNode;
  children?: string;
}) {
  return stdChildren(children);
}
