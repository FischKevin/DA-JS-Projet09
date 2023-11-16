/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent, wait } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import router from '../app/Router.js';
import Bills from '../containers/Bills.js';
import mockedBills from '../__mocks__/store.js';

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
