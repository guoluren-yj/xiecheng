import Anchor from './Anchor';
import AnchorLink from './AnchorLink';
import type { AnchorProps } from './Anchor';
import type { AnchorLinkProps } from './AnchorLink';

export type {
  AnchorProps,
  AnchorLinkProps,
}

Anchor.Link = AnchorLink;
export default Anchor;
