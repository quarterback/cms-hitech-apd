import Button from '@cmsgov/design-system-core/dist/components/Button/Button';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';

import { getIsAdmin } from '../reducers/user';
import { t } from '../i18n';

class Header extends Component {
  handleLogout = e => {
    e.preventDefault();
    const { pushRoute } = this.props;
    pushRoute('/logout');
  };

  toggleDropdown = e => {
    e.preventDefault();
  };

  render() {
    const { authenticated, isAdmin, currentUser } = this.props;
    const userGreeting = currentUser ? currentUser.username : 'Your account';
    return (
      <header>
        <div className="ds-l-container">
          <div className="ds-l-row">
            <div className="ds-l-col--12 ds-l-md-col--4">
              <Link to="/" className="site-title">
                {t('titleBasic')}
              </Link>
            </div>
            {authenticated &&
              <div className="ds-l-col--12 ds-l-md-col--4 ds-u-margin-left--auto">
                <ul className="nav--dropdown">
                  <li>
                    <Button
                      size="small"
                      variation="transparent"
                      className="nav--dropdown__trigger"
                      onClick={this.toggleDropdown}
                    >
                      {userGreeting}
                    </Button>
                    <ul>
                      <li>
                        <Button
                          size="small"
                          className="nav--action__logout"
                          variation="transparent"
                          onClick={this.handleLogout}
                        >
                          {t('logout')}
                        </Button>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            }
          </div>
        </div>
      </header>
    );
  }
}

const mapStateToProps = state => ({
  authenticated: state.auth.authenticated,
  currentUser: state.auth.user,
  isAdmin: getIsAdmin(state)
});

const mapDispatchToProps = { pushRoute: push };

Header.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  currentUser: PropTypes.object,
  isAdmin: PropTypes.bool.isRequired,
  pushRoute: PropTypes.func.isRequired
};

Header.defaultProps = {
  currentUser: null
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
