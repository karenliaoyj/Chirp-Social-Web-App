import React, { useCallback } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { AuthRoute } from "../../routers/AppRouter";
import { StandardError } from "../../errors/errors";

import "./ErrorPage.scss";

const ErrorPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = location.state;

  const onReturn = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const error: StandardError | Error | undefined =
    params && "error" in params ? params.error : undefined;
  if (error == null) {
    return <Navigate to={AuthRoute.ROOT} replace />;
  }

  return (
    <div className="error">
      <div className="error__title">{error.name}</div>
      <div className="error__form-container">
        <div className="error__body-container">
          <p className="error__body">{error.message}</p>
          <p className="error__body">
            <button className="button__plain" onClick={onReturn}>
              Return to Previous Page
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
