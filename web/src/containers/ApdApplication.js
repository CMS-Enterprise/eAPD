import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  Redirect,
  useParams as actualUseParams,
  useHistory as actualUseHistory,
  useLocation as actualUseLocation
} from 'react-router-dom';

import Sidebar from '../layout/nav/Sidebar';
import UnexpectedError from '../components/UnexpectedError';
import { setApdToSelectOnLoad, selectApd } from '../redux/actions/app';

import ApdPageRoutes from '../pages/apd/ApdPageRoutes';
import Loading from '../components/Loading';

import { getAPDId } from '../redux/reducers/apd';

import {
  getIsFedAdmin,
  getUserStateOrTerritory,
  getCanUserEditAPD
} from '../redux/selectors/user.selector';

const ApdApplication = ({
  isAdmin,
  isEditor,
  place,
  apdId,
  selectApd: dispatchSelectApd,
  setApdToSelectOnLoad: dispatchSelectApdOnLoad,
  useParams,
  useHistory,
  useLocation
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const paramApdId = useParams().apdId;
  const history = useHistory();
  const location = useLocation();

  useEffect(
    () => {
      if (!paramApdId && !apdId) {
        dispatchSelectApdOnLoad('/apd');
        history.push('/');
      } else if (apdId && !paramApdId) {
        history.push(`/apd/${apdId}`);
      } else if (paramApdId && (!apdId || apdId !== paramApdId)) {
        setIsLoading(true);
        const { pathname = `/apd/${paramApdId}`, hash = '' } = location || {};
        dispatchSelectApd(paramApdId, `${pathname}${hash}`);
      } else {
        setIsLoading(false);
      }
    },
    // we want this to run on load so we don't need any thing
    // in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (apdId) {
      setIsLoading(false);
    }
  }, [apdId]);

  if (isAdmin) {
    return <Redirect to="/" />;
  }
  if (isLoading || !apdId) {
    return (
      <div id="start-main-content">
        <Loading>Loading your APD</Loading>
      </div>
    );
  }

  return (
    <div className="site-body ds-l-container">
      <div className="ds-u-margin--0">
        <Sidebar place={place} />
        <main id="start-main-content" className="site-main">
          {isEditor && <UnexpectedError />}
          <div className="ds-u-padding-top--2">
            <ApdPageRoutes apdId={paramApdId} />
          </div>
        </main>
      </div>
    </div>
  );
};

ApdApplication.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isEditor: PropTypes.bool.isRequired,
  place: PropTypes.object.isRequired,
  apdId: PropTypes.string,
  selectApd: PropTypes.func.isRequired,
  setApdToSelectOnLoad: PropTypes.func.isRequired,
  useParams: PropTypes.func,
  useHistory: PropTypes.func,
  useLocation: PropTypes.func
};

ApdApplication.defaultProps = {
  apdId: null,
  useParams: actualUseParams,
  useHistory: actualUseHistory,
  useLocation: actualUseLocation
};

const mapStateToProps = state => ({
  isAdmin: getIsFedAdmin(state),
  isEditor: getCanUserEditAPD(state),
  place: getUserStateOrTerritory(state),
  apdId: getAPDId(state)
});

const mapDispatchToProps = { setApdToSelectOnLoad, selectApd };

export default connect(mapStateToProps, mapDispatchToProps)(ApdApplication);

export { ApdApplication as plain, mapStateToProps, mapDispatchToProps };
