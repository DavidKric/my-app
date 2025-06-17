// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for JSDOM environment if not sufficiently provided
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock next/router
jest.mock('next/router', () => require('next-router-mock'));

// Mock environment variables if needed
// process.env.MY_VARIABLE = 'test_value';

// Global fetch mock setup (if not mocking per test)
// import fetchMock from 'jest-fetch-mock';
// fetchMock.enableMocks();
