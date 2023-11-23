/**
 * @jest-environment jsdom
 */

import mockedBills from '../__mocks__/store.js';
import mockStore from '../__mocks__/store';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { screen, waitFor, fireEvent, wait } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH } from '../constants/routes.js';
import router from '../app/Router.js';
import Bills from '../containers/Bills.js';
import { formatDate, formatStatus } from '../app/format.js';

jest.mock('../app/format.js', () => ({
  formatDate: jest.fn(),
  formatStatus: jest.fn(),
}));

jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      // check if the icon is highlighted by checking if it has the class 'active-icon'
      expect(windowIcon.classList.contains('active-icon')).toBe(true);
    });

    test('Then bills should be ordered from earliest to latest', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

// Test suite for interactions on the Bills Page
describe('Given I am connected as an employee', () => {
  // Test to verify if the 'New Bill' button has a click event listener
  test('Button new-bill should have an event listener for click', () => {
    // Mock the navigation function
    const onNavigate = jest.fn();

    // Instantiate the Bills class with necessary mocks
    const myBillsInstance = new Bills({
      document,
      onNavigate,
      store: mockedBills,
      localStorage: window.localStorage,
    });
    myBillsInstance.handleClickNewBill = jest.fn();

    // Retrieve the 'New Bill' button and simulate a click
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`
    );
    expect(buttonNewBill).toBeDefined();
    buttonNewBill.click();

    // Verify if the navigation function was called with the correct path
    expect(myBillsInstance.onNavigate).toHaveBeenCalledWith(
      ROUTES_PATH['NewBill']
    );
  });

  // Test to verify if each 'eye' icon has a click event listener
  test('Each icon-eye should have an event listener for click', () => {
    // Mock jQuery's modal function
    jQuery.fn.modal = () => {};

    // Retrieve all 'eye' icons
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    expect(iconEye).toBeDefined();

    // Instantiate the Bills class with necessary mocks
    const myBillsInstance = new Bills({
      document,
      onNavigate,
      store: mockedBills,
      localStorage,
    });
    myBillsInstance.handleClickIconEye = jest.fn();

    // Simulate a click on the first 'eye' icon and verify if the event listener was called
    iconEye[0].click();
    expect(myBillsInstance.handleClickIconEye).toHaveBeenCalled();
  });
});

// Test suite for getBills
describe('Given I am connected as an employee', () => {
  describe('When I call getBills', () => {
    test('Then it should fetch bills from the store', async () => {
      // Creating a mock document object with necessary functions
      // This mimics the browser's document object for testing environment
      const documentMock = {
        querySelector: jest.fn().mockReturnValue({
          addEventListener: jest.fn(),
        }),
        querySelectorAll: jest.fn().mockReturnValue([
          {
            addEventListener: jest.fn(),
          },
        ]),
        createElement: jest.fn().mockReturnValue({}),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        body: {
          appendChild: jest.fn(),
          innerHTML: '',
        },
      };

      // Mocking the store's list function to resolve with predefined bills
      const listMock = jest.fn().mockResolvedValue(bills);

      // Creating a mock store object
      const storeMock = {
        bills: () => ({
          list: listMock,
        }),
      };

      // Instantiating Bills class with mock objects
      // This allows us to test Bills class behavior without relying on the actual browser environment or a real store
      const myBillsInstance = new Bills({
        document: documentMock,
        onNavigate: jest.fn(),
        store: storeMock,
        localStorage: localStorageMock,
      });

      // Calling getBills method and waiting for it to finish
      await myBillsInstance.getBills();

      // Expecting the mock list function to have been called
      // This checks if the Bills instance correctly calls the store's list method
      expect(listMock).toHaveBeenCalled();
    });
  });

  // Test catch part of getBills
  describe('Given I am connected as an employee', () => {
    describe('When I call getBills and there is corrupted data', () => {
      test('Then it should handle the error and return unformatted date', async () => {
        // Mock formatDate to simulate an error when formatting the date
        formatDate.mockImplementation(() => {
          throw new Error('Error formatting date');
        });

        // Create a corrupted bill
        const corruptedBill = {
          id: 'corruptedBillId',
          date: 'corruptedDate',
          status: 'corruptedStatus',
        };

        // Mock store.bills().list to return a corrupted bill
        const listMock = jest.fn().mockResolvedValue([corruptedBill]);

        const storeMock = {
          bills: () => ({
            list: listMock,
          }),
        };

        // Create an instance of Bills with necessary mocks
        const myBillsInstance = new Bills({
          document: window.document,
          onNavigate: jest.fn(),
          store: storeMock,
          localStorage: localStorageMock,
        });

        // Execute getBills and capture the result
        const result = await myBillsInstance.getBills();

        // Check that the corrupted bill is returned with the unformatted date
        expect(result[0].date).toBe(corruptedBill.date);
        expect(result[0].status).toBe(formatStatus(corruptedBill.status));

        // Restore original implementations of mocked functions
        formatDate.mockRestore();
        formatStatus.mockRestore();
      });
    });
  });
});

// Test suite for GET Bills API call
describe('Given I am a user connected as Employee', () => {
  describe('When I navigate to Bills', () => {
    // Test to verify if the bills are fetched from the API
    test('fetches bills from mock API GET', async () => {
      localStorage.setItem(
        'user',
        JSON.stringify({ type: 'Employee', email: 'employee@example.com' })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.appendChild(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText('Mes notes de frais'));
      expect(screen.getByTestId('btn-new-bill')).toBeTruthy();
      expect(screen.getAllByTestId('icon-eye')).toBeTruthy();
      expect(screen.getAllByTestId('icon-window')).toBeTruthy();
    });
    // Test suite for GET Bills API call
    describe('When an error occurs on API', () => {
      beforeEach(() => {
        jest.spyOn(mockStore, 'bills');
        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
            email: 'employee@example.com',
          })
        );
        const root = document.createElement('div');
        root.setAttribute('id', 'root');
        document.body.appendChild(root);
        router();
      });

      // Test for 404 error case
      test('fetches bills from an API and fails with 404 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error('Erreur 404'));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      // Test for 500 error case
      test('fetches bills from an API and fails with 500 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error('Erreur 500'));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
