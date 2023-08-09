import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppRoute } from "../routers/AppRouter";
import {
  APIError,
  APIErrorCode,
  Forbidden,
  InternalServerError,
  NotFoundError,
  isAPIError,
} from "../errors/errors";
import ErrorModal from "../components/ErrorModal/ErrorModal";
import ForceLogoutModal from "../components/ForceLogoutModal/ForceLogoutModal";

interface ErrorContext {
  errorMessage?: string;
  handleError: (error: any) => APIError | undefined;
}

const Context = React.createContext<ErrorContext>(null as any);
type Props = React.PropsWithChildren;

const ErrorContextProvider: React.FC<Props> = (props) => {
  const { children } = props;
  const [error, setError] = useState<any>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isForceLogoutModalOpen, setIsForceLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const closeErrorModal = useCallback(() => {
    setIsErrorModalOpen(false);
  }, []);

  const openErrorModal = useCallback(() => {
    setIsErrorModalOpen(true);
  }, []);

  const closeForceLogoutModal = useCallback(() => {
    setIsForceLogoutModalOpen(false);
  }, []);

  const openForceLogoutModal = useCallback(() => {
    setIsForceLogoutModalOpen(true);
  }, []);

  const handleError = useCallback(
    (e: any) => {
      if (isAPIError(e)) {
        switch (e.code) {
          case APIErrorCode.UserUnauthorizedError:
          case APIErrorCode.UnauthorizedError:
          case APIErrorCode.UserAlreadySignedUpError:
          case APIErrorCode.UserRegistrationError:
          case APIErrorCode.UserEmailValidationError:
          case APIErrorCode.ChannelCreationError:
          case APIErrorCode.ConversationCreationError:
            setError(e);
            openErrorModal();
            return;
        }

        // return the unhandled error for the view level to reflect to the user
        return e;
      }

      // Forbidden Error
      if (e instanceof Forbidden) {
        openForceLogoutModal();
        return;
      }

      if (e instanceof NotFoundError || e instanceof InternalServerError) {
        navigate(AppRoute.ERROR, { state: { error: e } });
        return;
      }

      // unexpected error
      navigate(AppRoute.ERROR, {
        state: {
          error: new Error(`Unexpected Error ${e.message}`),
        },
      });
    },
    [navigate, openErrorModal, openForceLogoutModal]
  );

  const value = {
    errorMessageID: error,
    handleError,
  };

  return (
    <Context.Provider value={value}>
      {children}
      {error && (
        <ErrorModal
          error={error}
          isOpen={isErrorModalOpen}
          onRequestClose={closeErrorModal}
        />
      )}
      <ForceLogoutModal
        isOpen={isForceLogoutModalOpen}
        onRequestClose={closeForceLogoutModal}
      />
    </Context.Provider>
  );
};

export function useErrorContext() {
  return React.useContext(Context);
}

export default ErrorContextProvider;
