import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Header from './Header';
import Footer from './Footer';

class Wrapper extends Component {
  componentDidMount() {
    const { isDev } = this.props;
    if (isDev) {
      this.addTota11y();
    }
  }

  addTota11y = () => {
    const script = document.createElement('script');
    script.src = '/_dev/tota11y.min.js';
    document.body.appendChild(script);
  };

  render() {
    const { children } = this.props;
    const showSiteTitle = document.location.pathname === '/';
    return (
      <div className="site">
        <a href="#start-main-content" className="skip-nav">
          Skip to main content
        </a>
        <Header showSiteTitle={showSiteTitle} />
        {children}
        <Footer />
      </div>
    );
  }
}

Wrapper.propTypes = {
  children: PropTypes.node.isRequired,
  isDev: PropTypes.bool.isRequired
};

export default Wrapper;
