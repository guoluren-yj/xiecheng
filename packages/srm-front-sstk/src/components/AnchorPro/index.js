import React from 'react';
import PositionAnchor from '_components/PositionAnchor';

const { Link, AnchorToolTip } = PositionAnchor;

export default function AnchorList(props) {
  const { list = [], container } = props;

  const getLinks = (links = []) => {
    return links.map((m) => {
      const { show, id, title, children } = m;
      if (show === false) return null;
      if (children && children.length) {
        return (
          <Link key={id} href={`#${id}`} title={AnchorToolTip(title)}>
            {getLinks(children)}
          </Link>
        );
      }
      return <Link key={id} href={`#${id}`} title={AnchorToolTip(title)} />;
    });
  };

  return (
    <PositionAnchor
      offsetTop={150}
      getContainer={() =>
        container || document.querySelector('.page-content-wrap') || document.body
      }
    >
      {getLinks(list)}
    </PositionAnchor>
  );
}
