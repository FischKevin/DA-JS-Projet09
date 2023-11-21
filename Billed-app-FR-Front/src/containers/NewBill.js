import { ROUTES_PATH } from '../constants/routes.js';
import Logout from './Logout.js';

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener('submit', this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener('change', this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }
  handleChangeFile = (e) => {
    e.preventDefault();
    const fileInput = this.document.querySelector(`input[data-testid="file"]`);
    // Add the error message container
    const errorMessage = this.document.getElementById('file-error-message');
    const file = fileInput.files[0];
    const filePath = e.target.value.split(/\\/g);
    console.log('File path:', filePath);
    const fileName = filePath[filePath.length - 1];
    console.log('Extracted file name:', fileName);
    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem('user')).email;
    formData.append('file', file);
    formData.append('email', email);

    // Beginning of fixing bug - [Bug Hunt] - Bills
    // Get the file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();

    // Define allowed extensions
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    console.log('File received in handleChangeFile:', file);
    console.log(`File received in handleChangeFile[0]:`, e.target.files[0]);
    console.log(`Extracted file name:`, this.fileName);
    // Check if the selected file extension is allowed
    if (!allowedExtensions.includes(fileExtension)) {
      errorMessage.textContent = `Seuls les fichiers avec les extensions suivantes sont autorisés : ${allowedExtensions.join(
        ', '
      )}`;
      errorMessage.style.display = 'block';
      fileInput.value = ''; // Reset the input
      return;
    } else {
      errorMessage.style.display = 'none';
    }

    // Log le nom du fichier extrait
    console.log('Extracted file name:', fileName);
    // End of fixing bug - [Bug Hunt] - Bills
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        console.log('File URL from create:', fileUrl);
        console.log('File name from create:', fileName);
        console.log('Bill ID from create:', key);
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
      })
      .catch((error) => console.error(error));
  };
  handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    );
    const email = JSON.parse(localStorage.getItem('user')).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending',
    };
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH['Bills']);
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills']);
        })
        .catch((error) => console.error(error));
    }
  };
}
