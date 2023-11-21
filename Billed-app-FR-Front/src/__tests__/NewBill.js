/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { ROUTES_PATH } from '../constants/routes.js';

import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import mockedStore from '../__mocks__/store.js';
import router from '../app/Router.js';
import { localStorageMock } from '../__mocks__/localStorage.js';

jest.mock('../app/Store', () => mockedStore);

describe('When I am on NewBill Page', () => {
  test('Then it should detect change on file input', async () => {
    const html = NewBillUI();
    document.body.innerHTML = html;

    localStorage.setItem(
      'user',
      JSON.stringify({ type: 'Employee', email: 'a@a' })
    );
    const onNavigate = jest.fn();
    const newBillClass = new NewBill({
      document,
      onNavigate,
      store: mockedStore,
      localStorage,
    });
    const handleChangeFile1 = jest.fn((e) => newBillClass.handleChangeFile(e));
    const imageInput = screen.getByTestId('file');

    // verifie que les variables soient NULL
    expect(newBillClass.fileUrl).toBeNull();
    expect(newBillClass.fileName).toBeNull();
    expect(newBillClass.billId).toBeNull();
    expect(newBillClass.fileName).toBeFalsy();

    imageInput.addEventListener('change', handleChangeFile1);

    // Simule un choix de fichier ".png" par l'utilisateur dans l'input File.
    const file = new File(['blob'], 'fichier.png', { type: 'image/png' });
    await fireEvent.change(imageInput, {
      target: {
        files: [file],
      },
    });

    // Vérifie que la méthode à bien été appelée
    expect(handleChangeFile1).toHaveBeenCalled();

    // vérifie que les variables aient bien été modifiées
    expect(newBillClass.fileUrl).not.toBeNull();
    expect(newBillClass.fileName).not.toBeNull();
  });
});

describe('When I am on NewBill Page and upload a non-allowed file', () => {
  test('Then the error message should be displayed', async () => {
    document.body.innerHTML = NewBillUI();
    localStorage.setItem(
      'user',
      JSON.stringify({ type: 'Employee', email: 'a@a' })
    );
    const onNavigate = jest.fn();
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockedStore,
      localStorage,
    });

    const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
    const fileInput = screen.getByTestId('file');
    const errorMessage = document.getElementById('file-error-message');

    fileInput.addEventListener('change', handleChangeFile);

    // Simule un choix de fichier avec une extension non autorisée (par exemple, ".txt").
    const file = new File(['file content'], 'fichier.txt', {
      type: 'text/plain',
    });
    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    // Vérifie que le message d'erreur est affiché
    expect(errorMessage.style.display).toBe('block');
    expect(errorMessage.textContent).toContain(
      'Seuls les fichiers avec les extensions suivantes sont autorisés'
    );
    expect(handleChangeFile).toHaveBeenCalled();
  });
});

describe('When I submit the form with valid data', () => {
  test('Then the form should be submitted and navigate to Bills page', () => {
    document.body.innerHTML = NewBillUI();

    localStorage.setItem(
      'user',
      JSON.stringify({ type: 'Employee', email: 'a@a' })
    );
    const onNavigate = jest.fn();
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockedStore,
      localStorage,
    });

    // Mock de la fonction updateBill
    jest.spyOn(newBill, 'updateBill').mockImplementation(() => {});

    // Remplissage du formulaire
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

    // Simulation de la soumission du formulaire
    const form = screen.getByTestId('form-new-bill');
    fireEvent.submit(form);

    // Vérification des appels de fonction
    expect(newBill.updateBill).toHaveBeenCalled();
    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
  });
});

describe('When I update a bill', () => {
  test('Then the bill should be updated and navigate to Bills page', async () => {
    // Initialisation
    const onNavigate = jest.fn();
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockedStore,
      localStorage: window.localStorage,
    });

    // Mock de la fonction bills().update du store
    const updateSpy = jest
      .spyOn(mockedStore.bills(), 'update')
      .mockResolvedValueOnce({});

    // Création d'un faux bill
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
    newBill.billId = 'abc123'; // Simule une facture existante sélectionnée

    // Appel de la méthode updateBill
    await newBill.updateBill(bill);

    // Vérifications
    expect(updateSpy).toHaveBeenCalledWith({
      data: JSON.stringify(bill),
      selector: 'abc123',
    });
    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
  });
});
