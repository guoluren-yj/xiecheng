import React, { Component } from 'react';

export default class Image extends Component {
  static defaultProps = {
    className: 'default',
  };

  render() {
    const { style = {}, className, width, height, value, id, alt, title } = this.props;
    style.width = width;
    style.height = height;
    return (
      <img
        src={value}
        id={id}
        style={style}
        alt={alt}
        title={title}
        className={`imagePath ${className}`}
      />
    );
  }
}
