/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { ROUTES_PATH } from '../constants/routes.js';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import mockedStore from '../__mocks__/store.js';

// Mock the store for testing purposes
jest.mock('../app/Store', () => mockedStore);

let newBill, onNavigate;

beforeEach(() => {
  document.body.innerHTML = NewBillUI();
  localStorage.setItem(
    'user',
    JSON.stringify({ type: 'Employee', email: 'a@a' })
  );
  onNavigate = jest.fn();
  newBill = new NewBill({
    document,
    onNavigate,
    store: mockedStore,
    localStorage: window.localStorage,
  });
});

afterEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
});

// Main test suite for NewBill functionality
describe('Given I am an employee', () => {
  // Testing file change detection on NewBill page
  describe('When I am on NewBill Page', () => {
    test('Then it should detect change on file input', async () => {
      // Mock the handleChangeFile function to test file change detection
      const handleChangeFile1 = jest.fn((e) => newBill.handleChangeFile(e));
      const imageInput = screen.getByTestId('file');

      // Check initial state of fileUrl, fileName, and billId
      expect(newBill.fileUrl).toBeNull();
      expect(newBill.fileName).toBeNull();
      expect(newBill.billId).toBeNull();
      expect(newBill.fileName).toBeFalsy();

      // Add event listener and trigger file change event
      imageInput.addEventListener('change', handleChangeFile1);
      const file = new File(['blob'], 'fichier.png', { type: 'image/png' });
      await fireEvent.change(imageInput, {
        target: {
          files: [file],
        },
      });

      // Verify the file change event is captured
      expect(handleChangeFile1).toHaveBeenCalled();

      // Verify that variables have been changed
      expect(newBill.fileUrl).not.toBeNull();
      expect(newBill.fileName).not.toBeNull();
    });
  });

  // Testing for error message display on uploading non-allowed file format
  describe('When I am on NewBill Page and upload a non-allowed file', () => {
    test('Then the error message should be displayed', async () => {
      // Mock handleChangeFile function to test error message display
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      const fileInput = screen.getByTestId('file');
      const errorMessage = document.getElementById('file-error-message');
      fileInput.addEventListener('change', handleChangeFile);

      // Simulate uploading a non-allowed file format
      const file = new File(['file content'], 'fichier.txt', {
        type: 'text/plain',
      });
      fireEvent.change(fileInput, {
        target: { files: [file] },
      });

      // Verify that error message is displayed for non-allowed file format
      expect(errorMessage.style.display).toBe('block');
      expect(errorMessage.textContent).toContain(
        'Seuls les fichiers avec les extensions suivantes sont autorisés'
      );
      expect(handleChangeFile).toHaveBeenCalled();
    });
  });

  // Testing form submission with valid data
  describe('When I submit the form with valid data', () => {
    test('Then the form should be submitted and navigate to Bills page', () => {
      // Mock the updateBill function to simulate form submission
      jest.spyOn(newBill, 'updateBill').mockImplementation(() => {});

      // Fill out the form
      const typeSelect = screen.getByTestId('expense-type');
      const nameInput = screen.getByTestId('expense-name');
      const amountInput = screen.getByTestId('amount');
      const dateInput = screen.getByTestId('datepicker');
      const vatInput = screen.getByTestId('vat');
      const pctInput = screen.getByTestId('pct');
      const commentaryTextArea = screen.getByTestId('commentary');

      fireEvent.change(typeSelect, { target: { value: 'Transports' } });
      fireEvent.change(nameInput, { target: { value: 'Ticket' } });
      fireEvent.change(amountInput, { target: { value: '100' } });
      fireEvent.change(dateInput, { target: { value: '2021-07-01' } });
      fireEvent.change(vatInput, { target: { value: '20' } });
      fireEvent.change(pctInput, { target: { value: '20' } });
      fireEvent.change(commentaryTextArea, { target: { value: 'Commentary' } });

      // Simulate form submission
      const form = screen.getByTestId('form-new-bill');
      fireEvent.submit(form);

      // Check the form submission process
      expect(newBill.updateBill).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    });
  });

  // Testing the bill update functionality
  describe('When I update a bill', () => {
    test('Then the bill should be updated and navigate to Bills page', async () => {
      // Mocking the store's bills().update function to simulate the update operation
      const updateSpy = jest
        .spyOn(mockedStore.bills(), 'update')
        .mockResolvedValueOnce({});

      // Create a bill object to be updated
      const bill = {
        id: 'abc123',
        type: 'Transports',
        name: 'Ticket',
        amount: 100,
        date: '2021-07-01',
        vat: '20',
        pct: 20,
        commentary: 'Commentary',
        fileUrl: 'url',
        fileName: 'fileName',
      };
      newBill.billId = 'abc123';

      // Calling updateBill method with the dummy bill object
      await newBill.updateBill(bill);

      // Checking if the mock store's update function was called correctly with the updated bill data
      expect(updateSpy).toHaveBeenCalledWith({
        data: JSON.stringify(bill),
        selector: 'abc123',
      });

      // Verifying that after bill update, the navigation is directed to the Bills page
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    });
  });
});

// Testing the POST NewBill API call
describe('Given I am on NewBill Page and submit a valid form', () => {
  test('Then updateBill method should be called with right parameters', async () => {
    // Preparing the form data
    const inputData = mockedStore.bills().formData;

    // Filling out the form fields
    screen.getByTestId('expense-type').value = inputData.type;
    screen.getByTestId('expense-name').value = inputData.name;
    screen.getByTestId('datepicker').value = inputData.date;
    screen.getByTestId('amount').value = inputData.amount;
    screen.getByTestId('vat').value = inputData.vat;
    screen.getByTestId('pct').value = inputData.pct;
    screen.getByTestId('commentary').value = inputData.commentary;
    newBill.fileUrl = inputData.fileUrl;
    newBill.fileName = inputData.fileName;

    // Mocking the updateBill method
    jest.spyOn(newBill, 'updateBill').mockImplementation(() => {});

    // Simulating form submission
    const form = screen.getByTestId('form-new-bill');
    fireEvent.submit(form);

    // Verifying that updateBill method is called with correct parameters
    expect(newBill.updateBill).toHaveBeenCalledWith({
      email: 'a@a',
      type: 'Transports',
      name: 'Ticket to Paris',
      date: '2021-07-01',
      amount: 100,
      vat: '20',
      pct: 20,
      commentary: 'Business trip to Paris',
      fileUrl: newBill.fileUrl,
      fileName: newBill.fileName,
      status: 'pending',
    });

    // Clearing the mock
    newBill.updateBill.mockRestore();
  });
});
