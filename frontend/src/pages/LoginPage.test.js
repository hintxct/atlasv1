import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

jest.mock('../components/PageShell', () => ({ children }) => <div>{children}</div>);
jest.mock('../services/api', () => ({ authAPI: { login: jest.fn(), logout: jest.fn() } }));
jest.mock('../services/socket', () => ({ connect: jest.fn(), disconnect: jest.fn() }));
jest.mock('react-hot-toast', () => ({ success: jest.fn(), error: jest.fn() }));

const Session = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  return <div data-testid="session">{location.pathname} {user?.userType}<button onClick={logout}>Logout</button></div>;
};

describe('One-click demo login', () => {
  let root;
  let container;
  beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
    jest.clearAllMocks();
    authAPI.login.mockRejectedValue({ response: { status: 401, data: { message: 'Invalid credentials' } } });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(<MemoryRouter initialEntries={['/login']}><AuthProvider><Routes><Route path="/login" element={<LoginPage />} /><Route path="*" element={<Session />} /></Routes></AuthProvider></MemoryRouter>));
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    localStorage.clear();
    delete global.IS_REACT_ACT_ENVIRONMENT;
  });
  it.each([
    ['Driver', 'driver', '/driver/dashboard'],
    ['Field Official', 'field_official', '/official/dashboard'],
    ['District Admin', 'district_admin', '/admin/dashboard'],
    ['State Admin', 'state_admin', '/state/dashboard'],
  ])('opens the %s demo without contacting the backend', async (label, role, route) => {
    const button = [...container.querySelectorAll('button')].find((item) => item.textContent === `${label}Open demo`);
    await act(async () => button.click());
    expect(container.querySelector('[data-testid="session"]').textContent).toContain(route);
    expect(JSON.parse(localStorage.getItem('user')).userType).toBe(role);
    expect(localStorage.getItem('token')).toMatch(/^demo-token-/);
    expect(authAPI.login).not.toHaveBeenCalled();
    expect(socketService.connect).not.toHaveBeenCalled();
    await act(async () => container.querySelector('button').click());
    expect(authAPI.logout).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
  });
});