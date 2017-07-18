import React from 'react';
import PropTypes from 'prop-types';

import {
  Text,
  Divider
} from '@bufferapp/components';

const style = {
  padding: '.5rem 0'
};

const headingStyle = {
  padding: '.5rem 1rem 0 1rem'
};

const listStyle = {
  margin: 0,
  padding: 0,
  listStyle: 'none'
};

const popoverMenuLinkStyle = {
  color: '#fff',
  display: 'block',
  textDecoration: 'none',
  paddingBottom: '.5rem'
};

const PopoverMenu = ({ title, label, children }) => (
  <div style={style}>
    {title &&
      <div style={headingStyle}>
        <Text color='white'>{title}</Text>
        <Divider color='sidebarBackgroundBlue' marginBottom='.25rem' />
      </div>
    }
    <ul role="menu" aria-label={label || title} style={listStyle}>
      {children}
    </ul>
  </div>
);

PopoverMenu.propTypes = {
  title: PropTypes.string,
  label: PropTypes.string,
  children: PropTypes.node.isRequired
};

export default PopoverMenu;