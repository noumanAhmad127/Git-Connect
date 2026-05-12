import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, clearCredentials } from './authSlice';
import {
  useLazyGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} from './authApi';
import type { RootState } from '@/store';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  const [loginMutation, loginState] = useLoginMutation();
  const [registerMutation, registerState] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  const [triggerGetMe, getMeState] = useLazyGetMeQuery();

  useEffect(() => {
    if (token && !user) {
      triggerGetMe(undefined)
        .unwrap()
        .then((authUser) => {
          dispatch(setCredentials({ user: authUser, accessToken: token }));
        })
        .catch(() => {
          dispatch(clearCredentials());
        });
    }
  }, [token, user, triggerGetMe, dispatch]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginMutation({ email, password }).unwrap();
      dispatch(setCredentials({ user: result.data.user, accessToken: result.data.accessToken }));
    },
    [loginMutation, dispatch],
  );

  const register = useCallback(
    async (data: { email: string; password: string; name: string; username: string }) => {
      const result = await registerMutation(data).unwrap();
      dispatch(
        setCredentials({ user: result.data.user, accessToken: result.data.tokens.accessToken }),
      );
    },
    [registerMutation, dispatch],
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation(undefined);
    } finally {
      dispatch(clearCredentials());
    }
  }, [logoutMutation, dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading: getMeState.isFetching || loginState.isLoading || registerState.isLoading,
    login,
    register,
    logout,
  };
}
