import React from 'react';

interface LinkProps {
  children?: React.ReactNode;
  external?: boolean;
  sameTab?: boolean;
  to: string;
}

const Link = ({
  children,
  to,
  ...other
}: LinkProps): JSX.Element => {
  return (
    <a href={to} {...other} rel='noopener noreferrer' target='_blank'>
      {children}
    </a>
  );
};

export default Link;
