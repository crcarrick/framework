import React from 'react'

import { Router, Route, Link } from '@framework/router'

export default function Component() {
  return React.createElement(
    Router,
    {},
    React.createElement(Route, {
      path: '/',
      component: React.createElement(
        'div',
        {},
        React.createElement('h1', {}, 'Home'),
        React.createElement(Link, { to: '/about' }, 'About'),
      ),
    }),
    React.createElement(Route, {
      path: '/about',
      component: React.createElement(
        'div',
        {},
        React.createElement('h1', {}, 'About'),
        React.createElement(Link, { to: '/' }, 'Home'),
      ),
    }),
  )
}
