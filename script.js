'use strict';
// BANKIST APP
// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2,
  pin: 1111,

  movementsDates: [
    '2022-12-18T21:31:17.178Z',
    '2022-12-30T07:42:02.383Z',
    '2023-01-28T09:15:04.904Z',
    '2023-02-01T10:17:24.185Z',
    '2020-02-08T14:11:59.604Z',
    '2023-03-27T17:01:17.194Z',
    '2023-04-22T23:36:17.929Z',
    '2023-04-24T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const transformDate = function (date, locale) {
  // calculator day passed
  const calcDayPassed = (date1, date2) =>
    Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
  const resultDayPassed = calcDayPassed(date, new Date());

  if (resultDayPassed === 0) return 'today';
  else if (resultDayPassed === 1) return 'yesterday';
  else if (resultDayPassed > 1 && resultDayPassed <= 5)
    return `${resultDayPassed} days ago`;
  else {
    const dateFormat = new Intl.DateTimeFormat(locale).format(date);
    return dateFormat;
  }
};
const formatCurrencyMov = function (locale, accCurrency, money) {
  const options = {
    style: 'currency',
    currency: accCurrency,
  };
  return new Intl.NumberFormat(locale, options).format(money);
};
const displayMovements = function (acc) {
  containerMovements.innerHTML = '';
  acc.movements.forEach(function (mov, i) {
    // display date depend on MOVEMENTS ARRAY
    const showFormatDate = transformDate(
      new Date(acc.movementsDates[i]),
      acc.locale
    );

    const checTypekMov = mov > 0 ? `deposit` : `withdrawal`;
    const htmlMovement = `
    <div class="movements__row">
      <div class="movements__type movements__type--${checTypekMov}">${
      i + 1
    } ${checTypekMov}</div>
      <div class="movements__date">${showFormatDate}</div>
      <div class="movements__value">${formatCurrencyMov(
        acc.locale,
        acc.currency,
        mov
      )}</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', htmlMovement);
  });
};

const transformUserName = function (str) {
  return str
    .toLocaleLowerCase()
    .split(' ') // ['steven', 'thomas', 'williams']
    .map(el => el[0]) // ['s', 't', 'w']
    .join(''); // stw
};
const userName = function (accs) {
  accs.forEach(function (ac) {
    ac.userName = transformUserName(ac.owner);
  });
};
userName(accounts);

const calcDisplayBalance = function (acc) {
  const balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formatCurrencyMov(
    acc.locale,
    acc.currency,
    balance
  )}`;
  acc.balance = balance;
};

const calcDisplaySumary = function (acc) {
  const sumDeposit = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatCurrencyMov(
    acc.locale,
    acc.currency,
    sumDeposit
  )}`;
  const sumWithdrawal = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatCurrencyMov(
    acc.locale,
    acc.currency,
    Math.abs(sumWithdrawal)
  )}`;
  const calcInterestRate = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * (acc.interestRate / 100))
    .filter(int => int > 1) // chi lay khoan tien lai lon hon 1
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${formatCurrencyMov(
    acc.locale,
    acc.currency,
    calcInterestRate
  )}`;
};

const updateUI = function (acc) {
  displayMovements(acc);
  calcDisplaySumary(acc);
  calcDisplayBalance(acc);
};

const startLogoutTimer = function () {
  // set time to 2 minutes
  // call the timer every second
  // In each call, print the remaining time to UI
  // // When 0 seconds, stop timer and log out user
  let time = 20;
  const tick = function () {
    let min = `${Math.floor(time / 60)}`.padStart(2, 0);
    let second = `${time % 60}`.padStart(2, 0);
    labelTimer.textContent = `${min} : ${second}`;

    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = '0';
      labelWelcome.textContent = 'Log in to get started';
    }
    time--;
  };
  tick();
  const timer = setInterval(tick, 1000);

  return timer; // id number cua fn setInterval
};
///////////////////////////////////////
//event handler//

//1.Login
let currentAccount, checkTimer;
//
btnLogin.addEventListener('click', function (e) {
  e.preventDefault(); // prevent form submiting
  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  );

  if (currentAccount && currentAccount.pin === Number(inputLoginPin.value)) {
    //display container app and messenger
    containerApp.style.opacity = '100%';
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`; // only display first name of owner

    // clear input field
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur(); // lam mo con tro input Pin

    // show date follow rule when login: day/month/year : 08/03/2024
    const now = new Date();
    // format date time international follow language - country (search ISO Language Code Table to use)
    const options = {
      dateStyle: 'short',
      timeStyle: 'short',
    };
    const yourLocation = currentAccount.locale;

    labelDate.textContent = new Intl.DateTimeFormat(
      yourLocation,
      options
    ).format(now);

    // restart time to login user
    if (checkTimer) clearInterval(checkTimer);
    checkTimer = startLogoutTimer();
    // update Ui for current account
    updateUI(currentAccount);
  }
});
//2.Transfer
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receverAccount = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );
  if (
    receverAccount &&
    receverAccount.userName !== currentAccount.userName &&
    amount > 0 &&
    currentAccount.balance > amount
  ) {
    currentAccount.movements.push(-amount);
    receverAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receverAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
    // restart time when transfer
    clearInterval(checkTimer);
    checkTimer = startLogoutTimer();
  } else {
    alert('wrong something');
  }
  inputTransferTo.value = inputTransferAmount.value = '';
  inputLoanAmount.blur();
});
//3.Loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  //loan
  const loanAmount = Math.floor(inputLoanAmount.value);
  const checkLoan = currentAccount.movements.some(
    mov => mov >= (10 / 100) * loanAmount
  );

  if (loanAmount > 0 && checkLoan) {
    // wait 2s to loan
    setTimeout(() => {
      currentAccount.movements.push(loanAmount);
      currentAccount.movementsDates.push(new Date().toISOString()); //date of loan
      updateUI(currentAccount);
    }, 2000);

    // restart time when loan
    clearInterval(checkTimer);
    checkTimer = startLogoutTimer();
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});
//4.Close account.
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  const confirmUser = inputCloseUsername.value;
  const confirmPin = Number(inputClosePin.value);
  if (
    currentAccount.userName === confirmUser &&
    currentAccount.pin === confirmPin
  ) {
    const findIndexAccountClose = accounts.findIndex(
      acc => acc.userName === currentAccount.userName
    );
    accounts.splice(findIndexAccountClose, 1); // xoa ptu ra khoi mang accs
    containerApp.style.opacity = '0';
    labelWelcome.textContent = 'Log in to get started';
  }
});
//5. sort
let checkSort = true;
btnSort.addEventListener('click', function () {
  const typeMovemnts = checkSort
    ? currentAccount.movements.slice().sort((a, b) => a - b)
    : currentAccount.movements;
  displayMovements({ ...currentAccount, ...{ movements: typeMovemnts } });
  checkSort = !checkSort;

  // restart time when loan
  clearInterval(checkTimer);
  checkTimer = startLogoutTimer();
});

// FAKE ALWAYS LOGIN WITH ACCOUNT 1
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = '100%';
